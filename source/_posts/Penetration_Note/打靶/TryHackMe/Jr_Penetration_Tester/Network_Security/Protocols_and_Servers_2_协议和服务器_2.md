---
title: Protocols_and_Servers_2_协议和服务器_2
date: 2024-05-26 05:55:08
updated: 2026-04-13 14:03:41
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Network_Security
---
# 总结

| Protocol | TCP Port TCP 端口 | Application(s) 应用 | Data Security 数据安全 |
| --- | --- | --- | --- |
| FTP | 21 | File Transfer 文件传输 | Cleartext |
| FTPS | 990 | File Transfer 文件传输 | Encrypted |
| HTTP | 80 | Worldwide Web 万维网 | Cleartext |
| HTTPS | 443 | Worldwide Web 万维网 | Encrypted |
| IMAP | 143 | Email (MDA) 电子邮件 （MDA） | Cleartext |
| IMAPS | 993 | Email (MDA) 电子邮件 （MDA） | Encrypted |
| POP3 | 110 | Email (MDA) 电子邮件 （MDA） | Cleartext |
| POP3S | 995 | Email (MDA) 电子邮件 （MDA） | Encrypted |
| SFTP | 22 | File Transfer 文件传输 | Encrypted |
| SSH | 22 | Remote Access and File Transfer<br>远程访问和文件传输 | Encrypted |
| SMTP | 25 | Email (MTA) 电子邮件 （MTA） | Cleartext |
| SMTPS | 465 | Email (MTA) 电子邮件 （MTA） | Encrypted |
| Telnet | 23 | Remote Access 远程访问 | Cleartext |

**Hydra：**

| Option | Explanation |
| --- | --- |
| -l username | 提供登录名 |
| -P WordList.txt | 指定要使用的密码列表 |
| server service | 设置要攻击的服务器地址和服务 |
| -s PORT | 在非默认服务端口号的情况下使用 |
| -V or -vV | 显示正在尝试的用户名和密码组合 |
| -d | 如果详细输出没有帮助，则显示调试输出 |

# Sniffing Attack 嗅探攻击

嗅探攻击是指使用网络数据包捕获工具收集有关目标的信息。

可以使用以太网 （802.3） 网卡进行嗅探攻击，前提是用户具有适当的权限（Linux 上的 root 权限和 MS Windows 上的管理员权限）。有许多程序可用于捕获网络数据包。我们考虑以下几点：

1.  **Tcpdump**​
2.  **Wireshark**​
3.  **Tshark**

## tcpdump

`sudo tcpdump port 110 -A`

`-A`以 ASCII 格式显示捕获的数据包的内容

# Man-in-the-Middle (MITM) Attack  
中间人 （MITM） 攻击

[About « Ettercap](https://www.ettercap-project.org/about.html)

[Usage :: bettercap](https://www.bettercap.org/usage/)

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716703449097-b474c482-4906-480d-ad52-df5f56687444.png)

# 传输层安全性 （TLS）

| Protocol | Default Port 默认端口 | Secured Protocol 安全协议 | Default Port with TLS<br>带有 TLS 的默认端口 |
| --- | --- | --- | --- |
| HTTP | 80 | HTTPS | 443 |
| FTP | 21 | FTPS | 990 |
| SMTP | 25 | SMTPS | 465 |
| POP3 | 110 | POP3S | 995 |
| IMAP | 143 | IMAPS | 993 |

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716704242728-88515d48-8bf0-4610-91b5-261c24ce988a.png)

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716704300342-0f1dada5-ced6-486a-8fe4-9d545c7dfd2d.png)

# Secure Shell (SSH)

SSH 服务器默认侦听端口 22

`ssh username@10.10.125.235`

基于 SSH 协议的 SCP（安全复制协议）传输文件

`scp mark@10.10.125.235:/home/mark/archive.tar.gz ~`下载

`scp backup.tar.bz2 mark@10.10.125.235:/home/mark/`上传

FTPS 协议使用 SSL/TLS 来保护 FTP，端口 990

FTP也可以使用SSH协议（即SFTP协议）进行保护。此服务也侦听默认端口 22

# Password Attack 密码攻击

[THC Hydra](https://github.com/vanhauser-thc/thc-hydra)

`hydra -l username -P wordlist.txt server service`

-   `-s PORT` 为相关服务指定非默认端口。
-   `-V`或者`-vV`，使 Hydra 显示正在尝试的用户名和密码组合
-   `-t n`指定线程数
-   `-d`用于调试
-   `CTRL-C`结束该过程