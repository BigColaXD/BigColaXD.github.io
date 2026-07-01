---
title: Nmap_Post_Port_Scans
date: 2024-05-25 08:21:02
updated: 2026-04-13 14:03:41
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Network_Security
---
# Service Detection 服务检测 -sV

`-sV` Nmap 命令将收集并确定开放端口的服务和版本信息。

`--version-intensity LEVEL`强度，级别范围介于 0（最轻）和 9（最完整）之间。

`-sV --version-light` 强度为 2，

`-sV --version-all` 强度为 9。

`-sV` 将强制 Nmap 继续进行 TCP 3 向握手并建立连接。

换句话说，当选择选项时 `-sV`，隐身 SYN 扫描 `-sS` 是不可能的。

`sudo nmap -sV 10.10.33.171`

# 总结

| Option | Meaning |
| --- | --- |
| -sV | 确定开放端口上的服务/版本信息 |
| -sV --version-light | 尝试最有可能的探针 （2） |
| -sV --version-all | 尝试所有可用的探头 （9） |
| -O | 检测操作系统 |
| --traceroute | 运行 TraceRoute 到 Target |
| --script=SCRIPTS | Nmap scripts to run 要运行的 Nmap 脚本 |
| -sC 或 --script=default | run default scripts 运行默认脚本 |
| -A | 相当于 -sV -O -sC --traceroute |
| -oN | 以正常格式保存输出 |
| -oG | 以 grepable 格式保存输出 |
| -oX | 以 XML 格式保存输出 |
| -oA | 以普通、XML 和 Grepable 格式保存输出 |

# OS Detection and Traceroute  
操作系统检测和跟踪路由

### OS Detection 操作系统检测 -O

`nmap -sS -O 10.10.33.171`

### Traceroute 跟踪路由 --traceroute

`nmap -sS --traceroute 10.10.33.171`

# Nmap 脚本引擎 （NSE）--script=  
`--script=default`

| Script Category 脚本类别 | Description |
| --- | --- |
| auth | Authentication related scripts<br>身份验证相关脚本 |
| broadcast | Discover hosts by sending broadcast messages<br>通过发送广播消息发现主持人 |
| brute | Performs brute-force password auditing against logins<br>对登录名执行暴力破解密码审核 |
| default | Default scripts, same as -sC<br>默认脚本，与 -sC 一样 |
| discovery | Retrieve accessible information, such as database tables and DNS names<br>检索可访问的信息，例如数据库表和 DNS 名称 |
| dos | Detects servers vulnerable to Denial of Service (DoS)<br>检测易受拒绝服务 （DoS） 攻击的服务器 |
| exploit | Attempts to exploit various vulnerable services<br>尝试利用各种易受攻击的服务 |
| external | Checks using a third-party service, such as Geoplugin and Virustotal<br>使用第三方服务（如 Geoplugin 和 Virustotal）进行检查 |
| fuzzer | Launch fuzzing attacks 发起模糊测试攻击 |
| intrusive | Intrusive scripts such as brute-force attacks and exploitation<br>侵入性脚本，例如暴力攻击和漏洞利用 |
| malware | Scans for backdoors 扫描后门 |
| safe | Safe scripts that won’t crash the target<br>不会使目标崩溃的安全脚本 |
| version | Retrieve service versions<br>检索服务版本 |
| vuln | Checks for vulnerabilities or exploit vulnerable services<br>检查漏洞或利用易受攻击的服务 |

还可以如 `--script "ftp*"`指定脚本 ftp-brute (对 FTP 服务器执行暴力密码审核)

`sudo nmap -sS -n --script "http-date" 10.10.33.171`(检索 http 服务器的日期和时间)

[NSEDoc Reference Portal: NSE Scripts — Nmap Scripting Engine documentation](https://nmap.org/nsedoc/scripts/)

# Saving the Output 保存输出

`-oA FILENAME` 组合了 `-oN`、`-oG` 和 `-oX`

## Normal 正常 -oN

`-oN FILENAME` 将扫描保存为普通格式

## Grepable 可grep的 -oG

`-oG FILENAME` 将扫描结果保存为可grep的格式。

`grep KEYWORD TEXT_FILE`

## XML -oX

`-oX FILENAME`以 XML 格式保存扫描结果

## Script Kiddie

无法在输出中搜索任何有趣的关键字或保留结果以备将来参考

​