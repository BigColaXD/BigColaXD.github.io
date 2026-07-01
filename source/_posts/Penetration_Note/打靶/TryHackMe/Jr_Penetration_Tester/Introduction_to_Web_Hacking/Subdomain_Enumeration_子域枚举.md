---
title: Subdomain_Enumeration_子域枚举
date: 2024-05-11 04:02:11
updated: 2026-04-13 14:03:41
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Introduction_to_Web_Hacking
---
# OSINT

## **SSL/TLS Certificates**

当 CA（证书颁发机构）为域创建 SSL/TLS（安全套接字层/传输层安全性）证书时，CA 将参与所谓的“证书透明度 （CT） 日志”。这些是为域名创建的每个 SSL/TLS 证书的可公开访问日志。证书透明度日志的目的是阻止使用恶意证书和意外制作的证书。

**我们可以利用这项服务来发现属于某个域的子域，  
****https://crt.sh  
****https://ui.ctsearch.entrust.com/ui/ctsearchui****等网站提供了一个可搜索的证书数据库，显示当前和历史结果。**

## Search Engines

​搜索引擎包含指向超过十亿个网站的数万亿个链接，这可能是寻找新子域的绝佳资源。在 Google 等网站上使用高级搜索方法（例如 site:filter）可以缩小搜索结果范围。

例如，“\-site:www.domain.com site:\*.domain.com”将仅包含指向域名 domain.com 的结果，但会排除任何指向 www.domain.com 的链接;因此，它只向我们显示属于 domain.com 的子域名。

## **Automation Using Sublist3r**

Sublist3r工具

```plain
user@thm:~$ ./sublist3r.py -d acmeitsupport.thm
```

# DNS Bruteforce

dnsrecon工具

```plain
user@thm:~$ dnsrecon -t brt -d acmeitsupport.thm
```

# Virtual Hosts

​某些子域并不总是托管在可公开访问的 DNS 结果中，例如 Web 应用程序或管理门户的开发版本。相反，DNS 记录可以保存在私有 DNS 服务器上，也可以记录在开发人员的机器上的 /etc/hosts 文件（或 Windows 用户的 c:\\windows\\system32\\drivers\\etc\\hosts 文件）中，该文件将域名映射到 IP 地址。

由于当从客户端请求网站时，Web 服务器可以从一台服务器托管多个网站，因此服务器知道客户端希望从 Host 标头中获取哪个网站。我们可以通过对主机标头进行更改并监视响应来利用它，以查看我们是否发现了一个新网站。

## FFUF

```plain
user@machine$ ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/namelist.txt -H "Host: FUZZ.acmeitsupport.thm" -u http://10.10.126.130
user@machine$ ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/namelist.txt -H "Host: FUZZ.acmeitsupport.thm" -u http://10.10.126.130 -fs {size}
```

上面的命令使用 -w 开关来指定我们将要使用的单词列表。-H 开关添加/编辑一个标头（在本例中为 Host 标头）

\-fs参数过滤多数size相同的结果