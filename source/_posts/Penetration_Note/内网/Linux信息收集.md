---
title: Linux信息收集
date: 2025-03-28 15:18:07
updated: 2026-05-29 07:41:23
tags:
  - 内网
---
```bash
#!/bin/bash

# 检查输入参数
if [ $# -lt 1 ]; then
  echo "用法: $0 <输出文件> [搜索目录...]"
  echo "例如: $0 result.txt /etc /home"
  exit 1
fi

# 输出文件
OUTPUT_FILE="$1"
shift

# 搜索目录，默认为根目录
SEARCH_DIRS=("$@")
[ ${#SEARCH_DIRS[@]} -eq 0 ] && SEARCH_DIRS=("/")

# 定义文件扩展名和关键词
FILE_EXTENSIONS=".*\.(properties|xml|cnf|yml|ini|sh|conf|env|json)"
KEYWORDS="pass|pwd|jdbc|expect|token|secret|authorization|api[_-]?key"

# 开始扫描
echo "开始扫描目录：${SEARCH_DIRS[*]}"
find "${SEARCH_DIRS[@]}" \
  -regextype posix-extended \
  -regex "$FILE_EXTENSIONS" \
  -type f \
  ! -path "/proc/*" ! -path "/sys/*" ! -path "/dev/*" ! -path "/run/*" \
  -print0 | xargs -0 -P 4 egrep -iH -- "$KEYWORDS" > "$OUTPUT_FILE"

echo "扫描完成，结果保存到 $OUTPUT_FILE"
```

# 不记录系统命令

进入linux系统第一步，设置不记录系统命令

```bash
unset HISTORY HISTFILE HISTSAVE HISTZONE HISTORY HISTLOG; export HISTFILE=/dev/null; export HISTSIZE=0; export HISTFILESIZE=0

history -c #清空当前会话历史
cat /dev/null > ~/.bash_history # 删除历史文件
```

# 清除登录记录

```shell
last -n 20 #查看当前用户登录记录

cat /dev/null > /var/log/wtmp
```

# 查看历史记录

```bash
history
```

# 查看.ssh

`/root/.ssh`，拿ssh-key

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1743175256724-9a4b124d-bf80-47ef-80fd-a7adf60302b1.png)

# 系统信息

## **mimipenguin**

**mimipenguin** 使用内存计算的技术，读取内存中的凭证信息，linux系统在运行中会将用户名和密码以明文的方式保存在内存中。

[GitHub - huntergregal/mimipenguin: A tool to dump the login password from the current linux user](https://github.com/huntergregal/mimipenguin)

> 条件：root权限
> 
> 以下环境测试通过：
> 
> Kali 4.3.0 (rolling) x64 (gdm3)
> 
> Ubuntu Desktop 12.04 LTS x64 (Gnome Keyring 3.18.3\-0ubuntu2)
> 
> Ubuntu Desktop 16.04 LTS x64 (Gnome Keyring 3.18.3\-0ubuntu2)(阿里测试失败)
> 
> XUbuntu Desktop 16.04 x64 (Gnome Keyring 3.18.3\-0ubuntu2)(阿里测试失败)
> 
> VSFTPd 3.0.3\-8+b1 (Active FTP client connections)
> 
> Apache2 2.4.25\-3 (Active/Old HTTP BASIC AUTH Sessions)
> 
> openssh-server 1:7.3p1-1 (Active SSH connections sudo usage)

## linux-exploit-suggester.sh

[GitHub - The-Z-Labs/linux-exploit-suggester: Linux privilege escalation auditing tool](https://github.com/The-Z-Labs/linux-exploit-suggester)

## bashark.sh

## 操作系统基本信息

```bash
uname -a #打印所有可用信息
uname –r #内核版本信息
uname –n #系统主机名字
uname –m #linux内核架构
hostname #主机名
cat /proc/version #内核信息
cat /etc/*-release #发布信息
cat /etc/issue #发布信息
cat /proc/cpuinfo #cpu信息
df –a #文件信息
hostname #当前主机名称
```

**获取系统环境信息**

```bash
env #输出系统环境信息
set #打印系统环境信息
echo $PATH #输出环境变量中的路径信息
pwd #当前路径
cat /etc/profile #显示etc/profile文件
```

**获取系统服务信息**

```bash
ps -aux #查看进程信息
top #当前进程
netstat -antpu #查看当前交互端口
```

**获取系统软件信息**

```bash
dpkg -l #已经安装的软件列表 (debian ubuntu)
rpm -qa #已经安装的软件列表 (redhat centos)
```

**获取系统任务和作业**

若通过查看计划任务发现存在高权限用户运行着低权限用户可以修改的脚本，通过修改脚本来反弹高权限的shell。

```bash
crontab -l -u 用户名 #不加-u默认列出当前用户的计划任务 –u列出指定用户的计划任务(需要root权限)
/etc/crontab #文件中可能记录了用户自行添加的任务
jobs -l #列出放在后台的进程
ls -la /etc/cron* #列出所有计划任务文件
```

# 用户和组信息

```bash
whoami	#查看当前用户
id	#查看当前用户信息
sudo	#允许普通用户执行一些或者全部的root命令的一个工具
sudo -l	#列出目前用户可执行与无法执行的指令
su 用户（指定要切换身份的目标用户）	#切换当前用户身份到其他用户身份
cat /etc/passwd	#列出系统所有用户
cat /etc/group	#列出系统所有组
cat /etc/shadow	#列出所有用户的哈希（需要root权限）
users	#显示当前登录的用户
who -a	#显示当前登录的用户
w	#显示目前登入系统的用户有哪些人，以及他们正在执行的程序
last	#显示登入过的用户信息
lastlog	#显示系统中所有用户最近一次登录信息
lastlog -u %username%	#显示指定用户最后一次登入信息
```

# 其他信息

```bash
#查看开机启动项
systemctl list-unit-files
#用rc3.d这个目录为例，这个目录里面记录的是进入init 3时需要停止和启动那些服务
ls /etc/rc3.d
```

> K开头代表这个启动级别需要停止的服务，编号是停止的时候执行的顺序
> 
> S开头则是要启动那些服务

# 网络信息

```bash
/sbin/ifconfig -a #列出网络接口信息
cat /etc/network/interfaces #列出网络接口信息
arp -a #查看系统arp表
route #打印路由信息
cat /etc/resolv.conf #查看dns配置信息
netstat -an #打印本地端口开放信息
iptables -L #列出iptables的配置规则
cat /etc/services #查看端口服务映射
ifconfig #查看所有网络接口的属性
```