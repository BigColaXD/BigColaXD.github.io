---
title: Metasploit_Meterpreter
date: 2024-05-27 03:28:31
updated: 2026-04-13 14:03:42
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Metasploit
---
Meterpreter 将与攻击者的系统建立加密 （TLS） 通信通道

Meterpreter 在内存（RAM - 随机存取存储器）中运行，以避免必须将文件写入目标系统上的磁盘（例如 meterpreter.exe）。这样，Meterpreter 将被视为一个进程，而目标系统上没有文件。

`help`

`msfvenom --list payloads | grep meterpreter`

`getuid``getsystem`

`ps`

`migrate`

`keyscan_start``keyscan_dump``keyscan_stop`

`hashdump`列出 SAM 数据库的内容。SAM（安全帐户管理器）数据库在 Windows 系统上存储用户密码。这些密码以 NTLM（新技术 LAN 管理器）格式存储。

`search -f flag2.txt`

`shell`

`load`