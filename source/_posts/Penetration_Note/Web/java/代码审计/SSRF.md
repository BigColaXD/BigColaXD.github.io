---
title: SSRF
date: 2025-08-30 16:43:49
updated: 2026-03-23 15:29:29
tags:
  - Web
  - java
  - 代码审计
---
# 关键字

```python
new URL
httpclient
execute
HttpClient.execute
HttpClient.executeMethod
HttpURLConnection.connect
HttpURLConnection.getInputStream
URL.openStream
HttpServletRequest
getParameter
HttpClient
Request
HttpURLConnection
URLConnection
okhttp
BasicHttpEntityEnclosingRequest
DefaultBHttpClientConnection
BasicHttpRequest
HttpRequest.get
HttpRequest.post
Jsoup.connect
getForObject
RestTemplate
postForObject
HttpClients.createDefault
httpasyncclient
HttpAsyncClients.createDefault
java.net.URLConnection
openConnection
java.net.HttpURLConnection
openStream
Socket
java.net.Socket
OkHttpClient
newCall
ImageIO.read
javax.imageio.ImageIO
jsoup
org.springframework.web.client.RestTemplate
```

# Java 中支持的协议

[jdk8u-jdk/src/share/classes/sun/net/www/protocol at master · frohoff/jdk8u-jdk](https://github.com/frohoff/jdk8u-jdk/tree/master/src/share/classes/sun/net/www/protocol)

> 1.  HTTP（Hypertext Transfer Protocol）: HTTP协议是用于在客户端和服务器之间传超文本的协议。SSRF漏洞可通过向内部系统发起HTTP请求，从而利用HTTP协议。攻击者可以通过指定特定的URL，向内部网络或本地主机发送HTTP请求，获取敏感信息或利用其他漏洞进行攻击。
> 2.  HTTPS（HTTP Secure）: HTTPS是通过TLS/SSL加密协议对HTTP进行加密的版本，用于安全地传数据。对于SSRF漏洞，HTTPS和HTTP的利用方式基本相同，但发送的请求会经过加密传，提高了数据的保密性。
> 3.  File: File协议用于从文件系统中获取文件。在SSRF攻击中，攻击者可以使用file协议来读取本地文件系统中的敏感文件，如/etc/passwd等，然后将文件内容发送到指定的外部服务器。
> 4.  FTP（File Transfer Protocol）: FTP协议用于在网络上传文件。通过SSRF漏洞，攻击者可以向内部网络的FTP服务器发起FTP请求，并执行文件传操作，例如上传或下载文件。这可能导致泄露敏感文件或在内部网络中执行恶意文件。
> 5.  Mailto: Mailto协议用于发送电邮件。攻击者可以通过SSRF漏洞利用mailto协议，向内部网络中的电邮件服务器发送电邮件，可能用于发送恶意软件、钓鱼攻击等。
> 6.  Jar: Jar协议用于从Java归档文件（JAR文件）中获取资源。通过SSRF漏洞，攻击者可以使用jar协议来读取JAR文件中的类文件，并执行其中的代码。这可能导致服务器端的远程代码执行漏洞。
> 7.  Netdoc: Netdoc协议用于访问Javadoc文档。攻击者可以利用SSRF漏洞，通过netdoc协议获取内部网络中的Javadoc文档，并可能从中获取敏感信息或构造更多的攻击。

# 依赖

## HttpClient

> [Apache HttpComponents – HttpClient Overview](https://hc.apache.org/httpcomponents-client-5.5.x/index.html)
> 
> HttpClient 是 Apache Jakarta Common 下的项目，可以用来提供高效的、昀新的、功能丰富的支持HTTP 协议的客户端编程工具包，并且它支持 HTTP 协议昀新的版本和建议。
> 
> HttpClient 实现了 HTTP1.0 和 HTTP1.1。也实现了 HTTP 全部的方法，如： GET, POST, PUT,DELETE, HEAD, OPTIONS, TRACE。

```xml
<dependency>
  <groupId>org.apache.httpcomponents</groupId>
  <artifactId>httpclient</artifactId>
  <version>4.5.12</version>
</dependency>
```
```java
@RestController
@RequestMapping("/ssrfvul")
public class HttpClientController {
    //访问链接：http://ip:port/ssrfvul/httpclient/vul?url=https://www.baidu.com
    @GetMapping("/httpclient/vul")
    public String HttpClientDemo(@RequestParam String url) throws IOException {
        StringBuilder result = new StringBuilder();
        //创建 Httpclient 对象
        CloseableHttpClient client = HttpClients.createDefault();
        //创建 GET 请求
        HttpGet httpGet = new HttpGet(url);
        //发送请求
        HttpResponse httpResponse = client.execute(httpGet);
        //获取响应内容
        BufferedReader rd = new BufferedReader(new
                                               InputStreamReader(httpResponse.getEntity().getContent()));
        String line;
        while ((line = rd.readLine()) != null) {
            result.append(line);
        }
        return result.toString();
    }
}
```

## HttpAsyncClient

> [Apache HttpComponents – HttpAsyncClient Overview](https://hc.apache.org/httpcomponents-asyncclient-4.1.x/index.html)
> 
> HttpAsyncClient 是一个异步的 HTTP 客户端开发包，基于 HttpCore NIO 和 HttpClient 组件。
> 
> HttpAsyncClient 的出现并不是为了替换 HttpClient，而是作为一个补充用于需要大量并发连接，对性能要求非常高的基于 HTTP 的原数据通信，而且提供了事件驱动的 API。

```xml
<dependency>
  <groupId>org.apache.httpcomponents</groupId>
  <artifactId>httpasyncclient</artifactId>
  <version>4.1.3</version>
</dependency>
```
```java
package com.example.ssrfdemo;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.nio.client.CloseableHttpAsyncClient;
import org.apache.http.impl.nio.client.HttpAsyncClients;
import org.apache.http.util.EntityUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
/**
* 编号7089
*/
@RestController
@RequestMapping("/ssrfvul")
public class HttpAsyncClientController {
    //访问链接：http://ip:port/ssrfvul/httpasyncclient/vul?
    url=https://www.baidu.com
    @GetMapping("/httpasyncclient/vul")
    public String HttpAsyncClientDemo(@RequestParam String url) throws
    IOException {
        //创建Httpclient对象
        CloseableHttpAsyncClient httpclient = HttpAsyncClients.createDefault();
        try {
            httpclient.start();
            final HttpGet request = new HttpGet(url);
            //发送请求
            Future<HttpResponse> future = httpclient.execute(request, null);
            HttpResponse response = future.get();
            return EntityUtils.toString(response.getEntity());
        } catch (Exception e) {
            return e.getMessage();
        } finally {
            try {
                httpclient.close();
            } catch (Exception e) {
                return e.getMessage();
            }
        }
    }
}
```

## java.net.URLConnection

> [https://docs.oracle.com/javase/8/docs/api/java/net/URLConnection.html](https://docs.oracle.com/javase/8/docs/api/java/net/URLConnection.html)
> 
> java.net.URLConnection，是 Java 原的 HTTP 请求方法。URLConnection 类包含了许多方法可以让你的 URL 在网络上通信。此类的实例既可用于读取URL所引用的资源，也可用于写入URL所引用资源。
> 
> java.net.URLConnection不需要额外引入依赖，已封装在JDK中。

```java
package com.example.ssrfdemo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

@RestController
@RequestMapping("/ssrfvul")
public class UrlConnectionController {
    //访问链接：http://ip:port/ssrfvul/urlconnection/vul?url=https://www.baidu.com
    @GetMapping("/urlconnection/vul")
    public String UrlConnectionDemo(@RequestParam String url) throws IOException
    {
        StringBuilder result = new StringBuilder();
        URL url1 = new URL(url);
        URLConnection urlConn = url1.openConnection();
        urlConn.connect();
        BufferedReader in = new BufferedReader(new InputStreamReader(
            urlConn.getInputStream()));
        String inputLine;
        while ((inputLine = in.readLine()) != null) {
            result.append(inputLine);
        }
        in.close();
        return result.toString();
    }
}
```

## java.net.HttpURLConnection

> [https://docs.oracle.com/javase/8/docs/api/java/net/HttpURLConnection.html](https://docs.oracle.com/javase/8/docs/api/java/net/HttpURLConnection.html)
> 
> HttpURLConnection 继承自 URLConnection。可以向指定网站发起GET或POST请求。
> 
> java.net.HttpURLConnection不需要额外引入依赖，已内嵌在JDK中。

```java
package com.example.ssrfdemo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
@RestController
@RequestMapping("/ssrfvul")
public class HttpUrlConnectionController {
    //访问链接：http://ip:port/ssrfvul/httpurlconnection/vul?
    url=https://www.baidu.com
    @GetMapping("/httpurlconnection/vul")
    public String HttpUrlConnectionDemo(@RequestParam String url) throws
    IOException {
        StringBuilder result = new StringBuilder();
        URL url1 = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) url1.openConnection();
        //设置请求方式
        connection.setRequestMethod("GET");
        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK){
            BufferedReader in = new BufferedReader(new InputStreamReader(
                connection.getInputStream()));
            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                result.append(inputLine);
            }
        }
        return result.toString();
    }
}
```

## java.net.URL

> [https://docs.oracle.com/javase/8/docs/api/java/net/URL.html](https://docs.oracle.com/javase/8/docs/api/java/net/URL.html)
> 
> 在 java.net 包中定义了 URL 类，该类用来处理有关 URL 的内容。通过使用 URL 对象的 openStream()方法创建打开指定 URL 链接，以获取入流资源内容。
> 
> java.net.URL 不需要额外引入依赖，已内嵌在JDK中。

```java
package com.example.ssrfdemo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.io.*;
import java.net.URL;

@RestController
@RequestMapping("/ssrfvul")
public class UrlController {
    //访问链接：http://ip:port/ssrfvul/url/vul?url=https://www.baidu.com
    @GetMapping("/url/vul")
    public String UrlDemo(@RequestParam String url) throws IOException {
        StringBuilder result = new StringBuilder();
        URL url1 = new URL(url);
        //使用 URL 对象的 openStream()方法创建打开指定 URL 链接，以获取输入流资源内容。
        BufferedReader in = new BufferedReader(new InputStreamReader(url1.openStream()));
        String inputLine;
        while ((inputLine = in.readLine()) != null) {
            result.append(inputLine);
        }
        in.close();
        return result.toString();
    }
}
```

## java.net.Socket

> [https://docs.oracle.com/javase/8/docs/api/java/net/Socket.html](https://docs.oracle.com/javase/8/docs/api/java/net/Socket.html)
> 
> java.net.Socket 是 Java 套接字编程使用的类。提供了两台计算机之间的通信机制。在Java代码审计中，我们可能会遇见使用Socket判断IP与端口连通性的代码。如果IP和端口接受外部入，那么极有可能存在SSRF漏洞。
> 
> java.net.Socket 不需要额外引入依赖，已内嵌在JDK中。

```java
package com.example.ssrfdemo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.Socket;

@RestController
@RequestMapping("/ssrfvul")
public class SocketController {
    //访问链接：http://ip:port/ssrfvul/socket/vul?url=127.0.0.1&port=8888
    @GetMapping("/socket/vul")
    public String SocketDemo(@RequestParam String url, int port) throws
    IOException {
        StringBuilder result = new StringBuilder();
        Socket ss = new Socket(url,port);
        BufferedReader in = new BufferedReader(new InputStreamReader(ss.getInputStream()));
        String inputLine;
        while ((inputLine = in.readLine()) != null) {
            result.append(inputLine);
        }
        in.close();
        return result.toString();
    }
}
```

## OkHttp

> [OkHttp](https://square.github.io/okhttp/4.x/okhttp/okhttp3/-ok-http-client/)
> 
> OKHttp 是一个网络请求框架，OKHttp会为每个客户端创建自己的连接池和线程池。重用连接和线程可以减少延迟并节省内存。OkHttp中请求方式分为同步请求(client.newCall(request).execute())和异步请求(client.newCall(request).enqueue())两种。

```xml
<dependency>
  <groupId>com.squareup.okhttp3</groupId>
  <artifactId>okhttp</artifactId>
  <version>3.12.0</version>
</dependency>
```
```java
package com.example.ssrfdemo;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;

@RestController
@RequestMapping("/ssrfvul")
public class OkHttpClientController {
    //访问链接：http://ip:port/ssrfvul/okhttpclient/vul?url=https://www.baidu.com
    @GetMapping("/okhttpclient/vul")
    public String OkHttpClientDemo(@RequestParam String url){
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder().url(url).build();
        try (Response response = client.newCall(request).execute()) {
            return response.body().string();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
```

## ImageIO

> [https://docs.oracle.com/javase/8/docs/api/javax/imageio/ImageIO.html](https://docs.oracle.com/javase/8/docs/api/javax/imageio/ImageIO.html)
> 
> ImageIO 是Java读写图片操作的一个类。在代码审计中，如果目标使用了 ImageIO.read读取图片，且读取的图片地址可控的话，可能会存在SSRF漏洞。
> 
> javax.imageio.ImageIO 不需要额外引入依赖，已封装在JDK中。

```java
package com.example.ssrfdemo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import javax.imageio.ImageIO;
import java.awt.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
@RestController
@RequestMapping("/ssrfvul")
public class ImageIOController {
    //访问链接：http://ip:port/ssrfvul/imageio/vul?url=https://www.baidu.com/img/flexible/logo/pc/result.png
    @GetMapping("/imageio/vul")
    public String ImageioDemo(@RequestParam String url) throws IOException {
        StringBuilder result = new StringBuilder();
        URL url1 = new URL(url);
        Image image = ImageIO.read(url1);
        return image.toString();
    }
}
```

## Hutool

> [Hutool参考文档](https://hutool.cn/docs/#/http/%E6%A6%82%E8%BF%B0)
> 
> Hutool是一个小而全的Java工具类库，通过静态方法封装，降低相关API的学习成本，提高工作效率，使Java拥有函数式语言般的优雅。
> 
> 在Hutool中，也实现了HTTP客户端，Hutool-http针对JDK的HttpUrlConnection做一层封装，简化了HTTPS请求、文件上传、Cookie记忆等操作，使Http请求变得无比简单。
> 
> Hutool-http的核心集中在两个类：
> 
> -   HttpRequest
> -   HttpResponse

```xml
<dependency>
  <groupId>cn.hutool</groupId>
  <artifactId>hutool-all</artifactId>
  <version>5.7.20</version>
</dependency
```
```java
package com.example.ssrfdemo;
import cn.hutool.http.HttpRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ssrfvul")
public class HutoolController {
    //访问链接：http://ip:port/ssrfvul/hutool/vul?url=https://www.baidu.com
    @GetMapping("/hutool/vul")
    public String HutoolDemo(@RequestParam String url){
        HttpRequest httpRequest = HttpRequest.get(url);
        String result = httpRequest.execute().body();
        return result;
    }
}
```

## Jsoup

> [jsoup: Java HTML parser, built for HTML editing, cleaning, scraping, and XSS safety](https://jsoup.org/)
> 
> Jsoup 是基于 Java 的 HTML 解析器，可以从指定的 URL 中解析 HTML 内容。

```xml
<dependency>
  <!-- jsoup HTML parser library @ https://jsoup.org/ -->
  <groupId>org.jsoup</groupId>
  <artifactId>jsoup</artifactId>
  <version>1.15.3</version>
</dependency>
```
```java
package com.example.ssrfdemo;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;
@RestController
@RequestMapping("/ssrfvul")
public class JsoupController {
    //访问链接：http://ip:port/ssrfvul/jsoup/vul?url=https://www.baidu.com
    @GetMapping("/jsoup/vul")
    public String JsoupDemo(@RequestParam String url) throws IOException {
        Document doc = Jsoup.connect(url).get();
        //String title = doc.title();
        //return title.toString();
        return doc.toString();
    }
}
```

## RestTemplate

> [RestTemplate (Spring Framework 6.2.10 API)](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/client/RestTemplate.html)
> 
> RestTemplate 是从Spring3.0 开始支持的一个HTTP 请求工具，它提供了常见的REST请求方案的模版，例如GET 请求、POST 请求、PUT 请求等等。从名称上来看，是更针对RESTFUL风格API设计的。但通过他调用普通的HTTP接口也是可以的。

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```
```java
package com.example.ssrfdemo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/ssrfvul")
public class RestTemplateController {
    //访问链接：http://ip:port/ssrfvul/resttemplate/vul?url=https://www.baidu.com
    @GetMapping("/resttemplate/vul")
    public String RestTemplateDemo(@RequestParam String url){
        RestTemplate restTemplate = new RestTemplate();
        String result = restTemplate.getForObject(url ,String.class);
        return result;
    }
}
```

# 修复

[GitHub - j3ers3/Hello-Java-Sec: ☕️ Java Security，安全编码和代码审计](https://github.com/j3ers3/Hello-Java-Sec)

```java
// 判断是否是http类型
public static boolean isHttp(String url) {
    return url.startsWith("http://") || url.startsWith("https://");
}

// 判断是否为内网
public static boolean isIntranet(String url) {
    Pattern reg = Pattern.compile("^(127\\.0\\.0\\.1)|(localhost)|(10\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})|(172\\.((1[6-9])|(2\\d)|(3[01]))\\.\\d{1,3}\\.\\d{1,3})|(192\\.168\\.\\d{1,3}\\.\\d{1,3})$");
    Matcher match = reg.matcher(url);
    Boolean a = match.find();
    return a;
}

// 不允许跳转或判断跳转
HttpURLConnection conn = (HttpURLConnection) u.openConnection();
conn.setInstanceFollowRedirects(false); // 不允许重定向或者对重定向后的地址做二次判断
conn.connect();
```

[java-sec-code/src/main/java/org/joychou/security/SecurityUtil.java at master · JoyChou93/java-sec-code](https://github.com/JoyChou93/java-sec-code/blob/master/src/main/java/org/joychou/security/SecurityUtil.java)

```java
package org.joychou.security;

import org.joychou.config.WebConfig;
import org.joychou.security.ssrf.SSRFChecker;
import org.joychou.security.ssrf.SocketHook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.regex.Pattern;

public class SecurityUtil {

    private static final Pattern FILTER_PATTERN = Pattern.compile("^[a-zA-Z0-9_/\\.-]+$");
    private final static Logger logger = LoggerFactory.getLogger(SecurityUtil.class);

    /**
     * Determine if the URL starts with HTTP.
     *
     * @param url url
     * @return true or false
     */
    public static boolean isHttp(String url) {
        return url.startsWith("http://") || url.startsWith("https://");
    }

    /**
     * Get http url host.
     *
     * @param url url
     * @return host
     */
    public static String gethost(String url) {
        try {
            URI uri = new URI(url);
            return uri.getHost().toLowerCase();
        } catch (URISyntaxException e) {
            return "";
        }
    }

    /**
     * 同时支持一级域名和多级域名，相关配置在resources目录下url/url_safe_domain.xml文件。
     * 优先判断黑名单，如果满足黑名单return null。
     *
     * @param url the url need to check
     * @return Safe url returns original url; Illegal url returns null;
     */
    public static String checkURL(String url) {

        if (null == url){
            return null;
        }

        ArrayList<String> safeDomains = WebConfig.getSafeDomains();
        ArrayList<String> blockDomains = WebConfig.getBlockDomains();

        try {
            String host = gethost(url);

            // 必须http/https
            if (!isHttp(url)) {
                return null;
            }

            // 如果满足黑名单返回null
            if (blockDomains.contains(host)){
                return null;
            }
            for(String blockDomain: blockDomains) {
                if(host.endsWith("." + blockDomain)) {
                    return null;
                }
            }

            // 支持多级域名
            if (safeDomains.contains(host)){
                return url;
            }

            // 支持一级域名
            for(String safedomain: safeDomains) {
                if(host.endsWith("." + safedomain)) {
                    return url;
                }
            }
            return null;
        } catch (NullPointerException e) {
            logger.error(e.toString());
            return null;
        }
    }

    /**
     * 通过自定义白名单域名处理SSRF漏洞。如果URL范围收敛，强烈建议使用该方案。
     * 这是最简单也最有效的修复方式。因为SSRF都是发起URL请求时造成，大多数场景是图片场景，一般图片的域名都是CDN或者OSS等，所以限定域名白名单即可完成SSRF漏洞修复。
     *
     * @author JoyChou @ 2020-03-30
     * @param url 需要校验的url
     * @return Safe url returns true. Dangerous url returns false.
     */
    public static boolean checkSSRFByWhitehosts(String url) {
        return SSRFChecker.checkURLFckSSRF(url);
    }

    /**
     * 解析URL的IP，判断IP是否是内网IP。如果有重定向跳转，循环解析重定向跳转的IP。不建议使用该方案。
     * 存在的问题：
     *   1、会主动发起请求，可能会有性能问题
     *   2、设置重定向跳转为第一次302不跳转，第二次302跳转到内网IP 即可绕过该防御方案
     *   3、TTL设置为0会被绕过
     *
     * @param url check的url
     * @return 安全返回true，危险返回false
     */
    @Deprecated
    public static boolean checkSSRF(String url) {
        int checkTimes = 10;
        return SSRFChecker.checkSSRF(url, checkTimes);
    }

    /**
     * 不能使用白名单的情况下建议使用该方案。前提是禁用重定向并且TTL默认不为0。
     * 存在问题：
     *  1、TTL为0会被绕过
     *  2、使用重定向可绕过
     *
     * @param url The url that needs to check.
     * @return Safe url returns true. Dangerous url returns false.
     */
    public static boolean checkSSRFWithoutRedirect(String url) {
        if(url == null) {
            return false;
        }
        return !SSRFChecker.isInternalIpByUrl(url);
    }

    /**
     * Check ssrf by hook socket. Start socket hook.
     *
     * @author liergou @ 2020-04-04 02:15
     */
    public static void startSSRFHook() throws IOException {
        SocketHook.startHook();
    }

    /**
     * Close socket hook.
     *
     * @author liergou @ 2020-04-04 02:15
     **/
    public static void stopSSRFHook(){
        SocketHook.stopHook();
    }

    /**
     * Filter file path to prevent path traversal vulns.
     *
     * @param filepath file path
     * @return illegal file path return null
     */
    public static String pathFilter(String filepath) {
        String temp = filepath;

        // use while to sovle multi urlencode
        while (temp.indexOf('%') != -1) {
            try {
                temp = URLDecoder.decode(temp, "utf-8");
            } catch (UnsupportedEncodingException e) {
                logger.info("Unsupported encoding exception: " + filepath);
                return null;
            } catch (Exception e) {
                logger.info(e.toString());
                return null;
            }
        }

        if (temp.contains("..") || temp.charAt(0) == '/') {
            return null;
        }

        return filepath;
    }

    public static String cmdFilter(String input) {
        if (!FILTER_PATTERN.matcher(input).matches()) {
            return null;
        }

        return input;
    }

    /**
     * 过滤mybatis中order by不能用#的情况。
     * 严格限制用户输入只能包含<code>a-zA-Z0-9_-.</code>字符。
     *
     * @param sql sql
     * @return 安全sql，否则返回null
     */
    public static String sqlFilter(String sql) {
        if (!FILTER_PATTERN.matcher(sql).matches()) {
            return null;
        }
        return sql;
    }

    /**
     * 将非<code>0-9a-zA-Z/-.</code>的字符替换为空
     *
     * @param str 字符串
     * @return 被过滤的字符串
     */
    public static String replaceSpecialStr(String str) {
        StringBuilder sb = new StringBuilder();
        str = str.toLowerCase();
        for(int i = 0; i < str.length(); i++) {
            char ch = str.charAt(i);
            // 如果是0-9
            if (ch >= 48 && ch <= 57 ){
                sb.append(ch);
            }
            // 如果是a-z
            else if(ch >= 97 && ch <= 122) {
                sb.append(ch);
            }
            else if(ch == '/' || ch == '.' || ch == '-'){
                sb.append(ch);
            }
        }

        return sb.toString();
    }

    public static void main(String[] args) {
    }

}
```