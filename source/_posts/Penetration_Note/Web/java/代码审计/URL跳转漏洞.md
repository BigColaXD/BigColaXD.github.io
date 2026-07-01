---
title: URL跳转漏洞
date: 2025-09-08 13:18:31
updated: 2025-09-08 14:04:51
tags:
  - Web
  - java
  - 代码审计
---
> 302 重定向 - sendRedirect 和 301 重定向 - setHeader：
> 
> 301跳转也叫301重定向，也叫301转向，也叫301永久重定向,是网站建设过程中的一个功能。一般用于2个域名指向同一个网站。 一般来说，利用跳转，对网站的排名不会有影响。但不会转移全部权重。只能说让损失降到最低。
> 
> 302跳转就网址重定向的一种，它区别于301跳转，301是网址永久重定向，302则是网址的临时定向。302转向或者302重定向（302 redirect）指的是当浏览器要求一个网页的时候，主机所返回的状态码。302状态码的意义是暂时转向到另外一个网址。

# 漏洞代码

## 302 重定向之 sendRedirect

```java
/**
* http://127.0.0.1:8080/sendRedirect?url=https://www.baidu.com
*/
@RequestMapping("/sendRedirect")
@ResponseBody
public static void sendRedirect(HttpServletRequest request,HttpServletResponse response) throws IOException {
    String url = request.getParameter("url");
    // 302 跳转
    response.sendRedirect(url);
}
```

## 301 重定向之 setHeader

```java
/**
* http://localhost:8080/setHeader?url=http://www.baidu.com
*/
@RequestMapping("/setHeader")
@ResponseBody
public static void setHeader(HttpServletRequest request, HttpServletResponse response) {
    String url = request.getParameter("url");
    // 301 重定向
    response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
    response.setHeader("Location", url);
}
```

# 黑盒关键词

```plain
redirect
url
redirectUrl
callback
return_url
toUrl
ReturnUrl
fromUrl
redUrl
request
redirect_to
redirect_url
jump
jump_to
target
to
goto
link
linkto
domain
oauth_callback
```