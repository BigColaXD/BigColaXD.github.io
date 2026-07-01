---
title: Protocols_and_Servers_协议和服务器
date: 2024-05-25 11:47:08
updated: 2026-04-13 14:03:41
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Network_Security
---
# 总结

常见协议的默认端口号。

| Protocol | TCP Port TCP 端口 | Application(s) 应用 | Data Security 数据安全 |
| --- | --- | --- | --- |
| FTP | 21 | File Transfer<br>文件传输 | Cleartext |
| HTTP | 80 | Worldwide Web<br>万维网 | Cleartext |
| IMAP | 143 | Email (MDA) | Cleartext |
| POP3 | 110 | Email (MDA) | Cleartext |
| SMTP | 25 | Email (MTA) | Cleartext |
| Telnet | 23 | Remote Access<br>远程访问 | Cleartext |

# Telnet

Telnet 协议是用于连接到另一台计算机的虚拟终端的应用层协议。Telnet 协议侦听端口 23

Telnet 客户端和 Telnet 服务器之间的所有这些通信都没有加密

# Hypertext Transfer Protocol (HTTP)超文本传输协议

HTTP以明文（未加密）形式发送和接收数据;因此，您可以使用简单的工具，例如 Telnet（或 Netcat）与 Web 服务器进行通信并充当“Web 浏览器”。

```plain
telnet 10.10.23.77 80
Trying 10.10.23.77...
Connected to 10.10.23.77.
Escape character is '^]'.
GET /index.html HTTP/1.1
host: telnet
```

HTTP 服务器的三种常见选择是：

-   [Apache阿帕奇](https://www.apache.org/)
-   [Internet Information Services (IIS)Internet 信息服务 （IIS）](https://www.iis.net/)
-   [nginxnginx的](https://nginx.org/)

# File Transfer Protocol (FTP)  
文件传输协议

FTP 还以明文形式发送和接收数据;因此，我们可以使用 Telnet（或 Netcat）与 FTP 服务器通信并充当 FTP 客户端.

FTP 服务器默认侦听端口 21

我们需要为用户名`USER frank`和密码`PASS <password>`

`STAT`提供一些附加信息

​`SYST`显示目标的系统类型

`PASV` 将模式切换为被动

> FTP有两种模式：
> 
> -   Active: 在活动模式下，数据通过源自 FTP 服务器端口 20 的单独通道发送。
> -   Passive: 在被动模式下，数据通过源自端口号 1023 上方的 FTP 客户端端口的单独通道发送。

`TYPE A`将文件传输模式切换为 ASCII

`TYPE I`将文件传输模式切换为二进制。

`get FILENAME`下载文件

不能使用简单的客户端（如Telnet）传输文件，因为FTP为文件传输创建了单独的连接。

​  

所有命令都将通过控制通道发送。客户端请求文件后，将在它们之间建立另一个 TCP 连接

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716639602401-d956bf36-8c6b-40b7-8beb-8ccc50e83b11.png)

FTP服务器软件的示例包括：

-   [vsftpd](https://security.appspot.com/vsftpd.html)
-   [ProFTPDProFTPD的](http://www.proftpd.org/)
-   [uFTPuFTP的](https://www.uftpserver.com/)

Linux 系统上常见的控制台 FTP 客户端外，还可以使用带有 GUI 的 FTP 客户端，例如 FileZilla。

```shell
ls | 显示远端文件列表(!ls 显示本地文件列表)。
cd |切换远端目录(lcd 切换本地目录)。
get | 下载远端文件。
mget |下载远端文件(可以用通配符也就是 *)。
pget | 使用多个线程来下载远端文件, 预设为五个。
mirror| 下载/上传(mirror -R)/同步 整个目录。
put | 上传文件。
mput | 上传多个文件(支持通配符)。
mv | 移动远端文件(远端文件改名)。
rm | 删除远端文件。
mrm| 删除多个远端文件(支持通配符)。
mkdir | 建立远端目录。
rmdir | 删除远端目录。
pwd | 显示目前远端所在目录(lpwd 显示本地目录)。
du | 计算远端目录的大小
! | 执行本地 shell的命令(由于lftp 没有 lls, 故可用 !ls 来替代)
lcd |切换本地目录
lpwd | 显示本地目录
alias |定义别名
bookmark |设定书签。
exit | 退出ftp
```

# Simple Mail Transfer Protocol (SMTP)  
简单邮件传输协议 （SMTP）

通过 Internet 传递电子邮件需要以下组件：

1.  Mail Submission Agent (MSA)  
    邮件提交代理 （MSA）
2.  Mail Transfer Agent (MTA)  
    邮件传输代理 （MTA）
3.  Mail Delivery Agent (MDA)  
    邮件递送代理 （MDA）
4.  Mail User Agent (MUA) 邮件用户代理 （MUA）

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716652448999-49861e2e-7ace-406e-9ce3-f7d83cb1df70.png)

我们需要遵循协议来与HTTP服务器进行通信，并且我们需要依靠电子邮件协议来与MTA和MDA进行通信。协议是：

1.  Simple Mail Transfer Protocol (SMTP)  
    简单邮件传输协议 （SMTP）
2.  Post Office Protocol version 3 (POP3) or Internet Message Access Protocol (IMAP)  
    邮局协议版本 3 （POP3） 或 Internet 邮件访问协议 （IMAP）

​  

简单邮件传输协议 （SMTP） 用于与 MTA 服务器进行通信。由于 SMTP 使用明文，其中所有命令都是在不加密的情况下发送的，可以使用基本的 Telnet 客户端连接到 SMTP 服务器并充当发送消息的电子邮件客户端 （MUA）。

SMTP 服务器默认侦听端口 25

`telnet 10.10.196.13 25`

`helo hostname`

`mail from:`

`rcpt to:`

`data`

`<CR><LF>.<CR><LF>`or `Enter . Enter`

​  

# Post Office Protocol 3 (POP3)  
邮局协议 3 （POP3）

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716653872054-178c1891-a3b4-4c2b-bce9-c560efd0cb1f.png)

Telnet 足以验证和检索电子邮件。由于用户名和密码是以明文形式发送的

使用 POP3 通过多个客户端访问同一个邮件帐户通常不是很方便，会丢失已读和未读邮件的跟踪

`telnet 10.10.196.13 110`

`USER frank``PASS D2xc9CgD`

`STAT`得到回复`+OK 1 179`基于 RFC 1939，对 STAT 的肯定响应的格式 `+OK nn mm`

`nn`是收件箱中的电子邮件数

`mm` 是收件箱的大小，单位为八位（字节）

`LIST`提供了服务器上的新消息列表

`RETR 1` 检索列表中的第一条消息

# Internet Message Access Protocol (IMAP)  
Internet 邮件访问协议 （IMAP）

IMAP以明文形式发送登录凭据

Telnet 连接到 IMAP 服务器的默认端口 143

`LOGIN username password`

IMAP 要求每个命令前面都有一个随机字符串，以便能够跟踪回复

`LIST "" "*"`列出邮件文件夹

`EXAMINE INBOX`检查收件箱中是否有任何新邮件