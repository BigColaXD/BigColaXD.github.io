---
title: Passive_Reconnaissance_被动侦查
date: 2024-05-23 07:39:58
updated: 2026-04-13 14:03:41
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Network_Security
---
# 总结

| **Purpose** | **Commandline Example 命令行示例** |
| --- | --- |
| 查询 WHOIS 记录 | whois tryhackme.com |
| 查找 DNS A 记录 | nslookup -type=A tryhackme.com |
| 在 DNS 服务器上查找 DNS MX 记录 | nslookup -type=MX tryhackme.com 1.1.1.1 |
| 查找 DNS TXT 记录 | nslookup -type=TXT tryhackme.com |
| 查找 DNS A 提单记录 | dig tryhackme.com A |
| 在 DNS 服务器上查找 DNS MX 记录 | dig @1.1.1.1 tryhackme.com MX |
| 查找 DNS TXT 记录 | dig tryhackme.com TXT |

# Whois

WHOIS 是遵循 RFC 3912 规范的请求和响应协议。WHOIS 服务器在 TCP 端口 43 上侦听传入请求。域名注册商负责维护其租赁域名的WHOIS记录。WHOIS服务器会回复与所请求域名相关的各种信息。我们可以了解：

-   注册商：域名是通过哪个注册商注册的？
-   注册人的联系信息：姓名、组织、地址、电话等。（除非通过隐私服务隐藏）
-   创建、更新和到期日期：域名是什么时候首次注册的？上次更新是什么时候？什么时候需要更新？
-   名称服务器：要求哪个服务器解析域名？

# nslookup and dig

`nslookup -type=A tryhackme.com 1.1.1.1`

`nslookup -type=MX tryhackme.com`

您可以选择任何本地或公共 DNS 服务器进行查询。Cloudflare 提供 1.1.1.1 和 1.0.0.1 ， Google 提供 8.8.8.8 和 8.8.4.4 ， Quad9 提供 9.9.9.9 149.112.112.112 。如果您想要替代 ISP 的 DNS 服务器，您可以选择[更多公共 DNS 服务器](https://duckduckgo.com/?q=public+dns)。

| Query type 查询类型 | Result |
| --- | --- |
| A | IPv4 Addresses IPv4 地址 |
| AAAA | IPv6 Addresses IPv6 地址 |
| CNAME | Canonical Name 规范名称 |
| MX | Mail Servers 邮件服务器 |
| SOA | Start of Authority 授权的开始 |
| TXT | TXT Records TXT 提单记录 |

  

`dig tryhackme.com MX`

`dig @1.1.1.1 tryhackme.com MX`

# DNSDumpster

[DNSDumpster.com - dns recon and research, find and lookup dns records](https://dnsdumpster.com/)

# Shodan.io

[Shodan](https://www.shodan.io/)

我们可以了解与搜索相关的一些内容，例如：

-   IP address IP地址
-   hosting company 托管公司
-   geographic location 地理位置
-   server type and version 服务器类型和版本