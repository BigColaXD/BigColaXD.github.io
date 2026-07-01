---
title: Spring框架学习
date: 2026-06-25 07:34:52
updated: 2026-06-25 08:01:47
tags:
  - Web
  - 内存马
  - Spring内存马
---
### 什么是Spring

Spring是一个轻量级的Java开源框架，用于配置、管理和维护Bean（组件）的一种框架，其核心理念就是**IoC(Inversion of Control,控制反转)** 和 **AOP(AspectOrientedProgramming， 面向切面编程)**。现如今Spring全家桶已是一个庞大的家族

![](https://cdn.nlark.com/yuque/0/2026/webp/39170111/1782374371416-2dc49e6d-5e89-4078-8aee-e9eb1c24a946.webp)

Spring的出现大大简化了JavaEE的开发流程，减少了Java开发时各种繁琐的配置。

![](https://cdn.nlark.com/yuque/0/2026/webp/39170111/1782374371501-f669485d-e4a1-4d70-b5eb-e16526660519.webp)

Spring框架的核心之一就是分层，其由许多大大小小的组件构成，每种组件都实现不同功能。

![](https://cdn.nlark.com/yuque/0/2026/webp/39170111/1782374371573-c0000125-b898-48d4-8b6b-aba57ef5359f.webp)

#### SpringBoot

SpringBoot 基于 Spring 开发。不仅继承了Spring框架原有的优秀特性，它并不是用来替代 Spring 的解决方案，而和 Spring 框架紧密 结合进一步简化了Spring应用的整个搭建和开发过程。其设计目的是用来简化 Spring 应用的初始搭建以及开发过程。

采用 Spring Boot 可以大大的简化开发模式，它集成了大量常用的第三方库配置，所有你想集成的常用框架，它都有对应的组件支持，例如 Redis、MongoDB、Dubbo、kafka，ES等等。SpringBoot 应用中这些第 三方库几乎可以零配置地开箱即用，大部分的 SpringBoot 应用都只需要非常少量的配置代码，开发者能够更加专注于业务逻辑。 另外SpringBoot通过集成大量的框架使得依赖包的版本冲突，以及引用的不稳定性等问题得到了很好的解决。

下面我们就通过IDEA中的Spring Initializr来快速构建一个基于SpringBoot的Web项目

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374371666-cdf2a5cd-f0c9-4fe2-80e3-77fab5677ccf.png)

选择Spring Web

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374371744-d84b3833-81b6-432e-ad13-ef6d1bbca02e.png)

创建好之后，IDEA会自动创建一个启动类

```plain
package com.example.spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

下面我们就可以编写相应的Controller（控制器）及各种业务逻辑了

```plain
package com.example.helloworld.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HelloWorldController {

    @ResponseBody
    @RequestMapping("hello")
    public String Hello(){
        return "Hello World!";
    }
}
```

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374371820-6d317f6d-0fed-4b15-bc70-4072f8de0a68.png)

#### Spring MVC、Tomcat和Servlet

首先来设想这样一个场景，假如让我们自己手动实现一个简易的Web服务器，我们会怎么做？

首先我们肯定要接收客户端发来的TCP数据包，这里我们需要一个TCPServer来监听80端口。接着我们需要将TCP数据包解析成HTTP协议，获取URL路径、参数列表等数据信息。再然后就是执行各种逻辑处理。最后就是把处理的结果封装成HTTP协议返回给浏览器，并且等浏览器收到响应后断开连接。以上就是一个简易Web服务器的实现逻辑，当然，真正的Web服务器可能要比上述更加复杂一些，但核心功能是不变的：接受请求、处理请求、返回响应。

![](https://cdn.nlark.com/yuque/0/2026/webp/39170111/1782374371911-0e679c88-1b79-406b-97c9-94f3c5c37936.webp)

当然，如果我们在处理业务时每次都要进行一遍上述流程，这未免太繁琐。其实我们可以发现在上述流程中，网络通信、HTTP协议解析和封装部分的实现都相对固定。有变化的部分其实只有逻辑处理器，需要我们根据不同请求包而做出相应的逻辑处理。因此，为了提高开发效率，我们能不能将不变的部分封装起来呢？这其实就是我们的Web服务器。

Tomcat就是这样一种服务器，它其实就是一个能够监听TCP连接请求，解析HTTP报文，将解析结果传给处理逻辑器、接收处理逻辑器的返回结果并通过TCP返回给浏览器的一个框架。在Tomcat各种组件中，Connnector就是负责网络通信的，而Container中的Servlet就是我们的逻辑处理器。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374372013-6a85218e-9aaa-470c-8881-e6cd811de3c2.png)

因此Tomcat就是一个Servlet容器，它将前后端交互过程中不变的东西（网络通信、协议解析等）封装了起来。而Servlet是一个逻辑处理器，它可以被Tomcat创建、调用和销毁。所以我们的Web程序核心是基于Servlet的，而Web程序的启动依靠Tomcat。

那Spring MVC呢？Spring是利用注解、反射和模板等技术实现的一种框架。其核心类是继承于HttpServlet的DispatchServlet。那既然是Servlet，那负责的肯定就是逻辑处理部分了，那么就需要Tomcat这样的服务器来给Spring提供运行环境。

#### Spring MVC

##### Spring MVC的运行流程

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374372121-c373e702-715a-4d1b-a3b6-0a54c92ca366.png)

客户端发送Request，DispatcherServlet(等同于Controller控制器)，控制器接收到请求，来到HandlerMapping（在配置文件中配置），HandlerMapping会对URL进行解析，并判断当前URL该交给哪个Controller来处理，找到对应的Controller之后，Controller就跟Server、JavaBean进行交互，得到某一个值，并返回一个视图（ModelAndView过程），Dispathcher通过ViewResolver视图解析器,找到ModelAndView对象指定的视图对象,最后，视图对象负责渲染返回给客户端。

##### 创建一个简单的Spring MVC项目

这里我们使用Maven来创建一个简单的SpringMVC项目。创建好Maven项目后添加相应的Springmvc依赖

```plain
...
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>

    <maven.compiler.source>1.7</maven.compiler.source>

    <maven.compiler.target>1.7</maven.compiler.target>

    <org.springframework-version>4.1.4.RELEASE</org.springframework-version>

  </properties>

  <dependencies>
    <dependency>
      <groupId>junit</groupId>

      <artifactId>junit</artifactId>

      <version>4.11</version>

      <scope>test</scope>

    </dependency>

    <dependency>
      <groupId>org.springframework</groupId>

      <artifactId>spring-webmvc</artifactId>

      <version>${org.springframework-version}</version>

    </dependency>

    <dependency>
      <groupId>org.springframework</groupId>

      <artifactId>spring-web</artifactId>

      <version>${org.springframework-version}</version>

    </dependency>

    <!-- Tag libs support for view layer -->
    <dependency>
      <groupId>javax.servlet</groupId>

      <artifactId>jstl</artifactId>

      <version>1.2</version>

      <scope>runtime</scope>

    </dependency>

    <dependency>
      <groupId>taglibs</groupId>

      <artifactId>standard</artifactId>

      <version>1.1.2</version>

      <scope>runtime</scope>

    </dependency>

  </dependencies>

...
```

创建Spring配置文件`springmvc.xml`

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374372199-5961be72-430e-408d-951f-dde3252a01aa.png)

编写`web.xml`文件来配置Servlet

```plain
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">

  <display-name>Archetype Created Web Application</display-name>

  //使用默认的DispatcherServlet
  <servlet>
    <servlet-name>spring</servlet-name>

    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>

    <init-param>
      <param-name>contextConfigLocation</param-name>

       //spring配置文件路径
      <param-value>/WEB-INF/springmvc.xml</param-value>

    </init-param>

    <load-on-startup>1</load-on-startup>

  </servlet>

  <servlet-mapping>
    <servlet-name>spring</servlet-name>

    //路径设置为根目录
    <url-pattern>/</url-pattern>

  </servlet-mapping>

</web-app>

```

配置springmvc.xml

```plain
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:mvc="http://www.springframework.org/schema/mvc"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">

    //设置注解扫描包路径
    <context:component-scan base-package="com.controller"/>

    <!-- 开启springMVC的注解驱动，使得url可以映射到对应的controller -->
    <mvc:annotation-driven />

    <!-- 视图解析 -->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/WEB-INF/views/"/>
        <property name="suffix" value=".jsp"/>
    </bean>

</beans>

```

在`com.controller`包下创建test控制器

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374372279-187340b2-9c62-468e-8ea4-e444720daca7.png)

```plain
package com.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class test {

    @ResponseBody
    @RequestMapping("/hello")
    public String hello(){
        System.out.println("hello");
        return "Hello";
    }
}
```

配置Tomcat，添加相应war包

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374372421-0f7defb2-c72a-47e8-bc2f-83dc5fde5191.png)

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374372501-91e9e162-d79a-4ed2-a3b2-ba5c5c83f515.png)

启动Tomcat，访问`http://localhost/hello`

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782374372597-ded1d32d-4546-4b3a-855c-b75a721f61c4.png)