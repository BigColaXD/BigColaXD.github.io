---
title: Active_Reconnaissance_主动侦察
date: 2024-05-23 09:35:09
updated: 2026-04-13 14:03:41
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Network_Security
---
# 总结

| **Command** | **Example** |
| --- | --- |
| ping | ping -c 10 MACHINE_IP<br>在 Linux 或 macOS 上 |
| ping | ping -n 10 MACHINE_IP<br>在 MS Windows 上 |
| traceroute | traceroute MACHINE_IP<br>在 Linux 或 macOS 上 |
| tracert | tracert MACHINE_IP<br>在 MS Windows 上 |
| telnet | telnet MACHINE_IP PORT_NUMBER |
| netcat as client Netcat 作为客户端 | nc MACHINE_IP PORT_NUMBER |
| netcat as server NetCat 作为服务器 | nc -lvnp PORT_NUMBER |

| **操作系统** | **开发人员工具快捷方式** |
| --- | --- |
| Linux or MS Windows Linux 或 MS Windows | Ctrl+Shift+I |
| macOS | Option + Command + I |

# Web Browser 浏览器

在传输级别，浏览器连接到：

-   通过 HTTP 访问网站时，默认为 TCP 端口 80
-   通过 HTTPS 访问网站时默认为 TCP 端口 443

​  

开发者工具 Option + Command + I

​  

Firefox 和 Chrome 还有很多附加组件可以帮助进行渗透测试：

-   **FoxyProxy**​
-   **User-Agent Switcher and Manager**​
-   **Wappalyzer**

# Ping

ping 是将 ICMP Echo 数据包发送到远程系统的命令。如果远程系统处于联机状态，并且 ping 数据包已正确路由且未被任何防火墙阻止，则远程系统应发回 ICMP 回显回复。同样，如果路由正确且未被任何防火墙阻止，则 ping 应答应到达第一个系统。

`ping -c 10 10.10.196.199`

# Traceroute

`traceroute 10.10.196.199`

我们依靠ICMP来“欺骗”路由器泄露其IP地址。我们可以通过在 IP 标头字段中使用小型生存时间 （TTL） 来实现此目的。TTL 表示数据包在丢弃之前可以通过的最大路由器/跳数;TTL 不是最大时间单位数。当路由器收到数据包时，它会将 TTL 递减 1，然后再将其传递给下一个路由器。

下图显示，每次 IP 数据包通过路由器时，其 TTL 值都会递减 1。最初，它使系统的 TTL 值为 64;它通过 60 个路由器后到达目标系统，TTL 值为 4。

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716463310100-313ae3fa-2330-4433-82ed-ce94d6a8d9b3.png)

但是，如果 TTL 达到 0，它将被丢弃，并且超出 ICMP 生存时间将发送到原始发送方。请注意，某些路由器配置为在丢弃数据包时不发送此类 ICMP 消息。

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716463353082-c8594087-1f27-420c-8333-452324a012a9.png)

# Telnet

telnet 使用的默认端口为 23。从安全角度来看， telnet 以明文形式发送所有数据，包括用户名和密码。发送明文使任何有权访问通信通道的人都可以轻松窃取登录凭据。安全的替代方案是 SSH（Secure SHell）协议。

使用 telnet 10.10.196.199 PORT ，您可以连接到在 TCP 上运行的任何服务，甚至可以交换一些消息，除非它使用加密。

```bash
telnet 10.10.196.199 80

Trying 10.10.196.199...
Connected to 10.10.196.199.
Escape character is '^]'.

GET / HTTP/1.1
host: telnet
再按2次回车
```

# Netcat

```bash
nc 10.10.196.199 80
GET / HTTP/1.1
host: netcat
在 GET 行之后按 Shift+Enter
```

​  

您可以使用 netcat 侦听 TCP 端口并连接到另一个系统上的侦听端口

```bash
nc -lp 1234
nc -vnlp 1234
```

| option | meaning |
| --- | --- |
| -l | Listen mode 聆听模式 |
| -p | Specify the Port number<br>指定端口号 |
| -n | Numeric only; no resolution of hostnames via DNS<br>仅数字;无法通过DNS解析主机名 |
| -v | Verbose output (optional, yet useful to discover any bugs)<br>详细输出（可选，但可用于发现任何错误） |
| -vv | Very Verbose (optional) 非常冗长（可选） |
| -k | Keep listening after client disconnects<br>客户端断开连接后继续侦听 |

Notes: 笔记：

-   选项 -p 应显示在要侦听的端口号之前。
-   选项 -n 将避免 DNS 查找和警告。
-   小于 1024 的端口号需要 root 权限才能侦听。