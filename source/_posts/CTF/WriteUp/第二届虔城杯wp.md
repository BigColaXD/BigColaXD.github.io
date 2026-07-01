---
title: 第二届虔城杯wp
date: 2025-05-28 07:41:35
updated: 2026-06-16 00:32:55
tags:
  - WriteUp
  - CTF
---
# WEB

## easyAuth

role改为admin

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748418259072-49a50d86-fe63-4878-939e-e8df801fdf60.png)

flag{a386f60k791e7e3r4b8kwe90}

## Captcha

进入环境:

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748420083957-b686c52a-6f67-4f10-a7dc-104b2d2d42bf.png)

通过尝试可以发现,正确输入一次,就可以把这里的次数增加1,将这里的solved达成100即可.抓验证码的包，使用识别验证码的burp插件captcha-killer-modified进行爆破:

先检验一下插件:

![图片1.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748420387815-1a774e75-2274-4878-ad69-d12a59d456d9.png)

可以正常使用,于是使用拓展爆破即可,这里先抓包:

![图片2.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748420394023-8c5d3245-0908-4b3a-a955-5de149a2f7ef.png)

将这里的验证码部分进行爆破.来源选择拓展生成

![图片3.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748420413299-5829db2f-d540-4f48-95ef-b4d0ae169542.png)

爆破完成,查看第101次结果得到flag

![图片4.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748420415911-6fa3776e-54a0-4bf7-80c9-813544264955.png)

flag{ad8949456682c63914f1d8385d}

## serialize

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748418644916-55311a71-8a59-4b4d-a54f-099027db4d3d.png)

序列化$\_SESSION-黑名单过滤-反序列化-base64解密，所以`$userinfo['img']`要是base64后的/flag就可以了，序列化字符串过滤后造成逃逸

截取序列化后有用的部分;s:5:"testt";s:3:"img";s:8:"L2ZsYWc=";}"

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748419171968-8306cee5-7fb0-41d8-af3b-bf0c33fbf6e9.png)

```php
#get
?function=image
#post
_SESSION['fl4gweb']=;s:5:"testt";s:3:"img";s:20:"L2ZsYWc=";}"
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748419485944-25503dcc-038d-4eff-be7f-d5d3edf39987.png)

flag{M@ke\_S3rial1zation\_Great}

# crypto

## rsa

板子题

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748419581712-d7092690-c4ca-4fbb-a342-5cb90f12a8e5.png)

```python
from Crypto.Util.number import *
from gmpy2 import *

n=1505761640717230908916612472516074107063911628777907957342946249891615730521
p= 36479985961991330098937532474147760589
q= 41276376648995728333892838858092972989
c=1305951879745826696046810608263805929354265826695848233645020002892811222385
e=65537
ph=(p-1)*(q-1)
r=inverse(e, ph)
m=pow(c,r,n)
for i in range(10000000):
    mk=i*n+m
    if iroot(mk,2)[1]==True:
        flag=long_to_bytes(iroot(mk,2)[0])
        if b'flag{' in flag:
            print(flag)
```

![a650588836b0c8fd2fbee76ed6dd75de_720.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748419564857-4c447df8-a3b4-4988-a5b8-0d7880ec3a71.png)

# RE

## re1

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748420460528-2449f9aa-8bff-41ee-97af-b9e2d39186d5.png)1.查壳，发现有Enigma保护

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748420460759-5da15cab-6202-4ae6-8341-a808c4fe3fe6.png)2.用对应工具进行脱壳，得到脱壳后的文件

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748420460920-9d99059e-c540-48b8-a3f9-1432dc89cf5f.png)![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748420461101-a0c9e5c9-6646-43e1-9e75-b1c215b95bf1.png)3.反编译找到主要逻辑代码和加密后的密文

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748420461266-17bff462-c08a-4fcc-b006-af0800fd99dd.png)程序将输入的字符串视为数值，通过模58运算将字符串转化为58个字符集里的字符,最终得到密文6RthyZart9v7kHPBPS，基于密文逆向解密即可。

  

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1748420461561-d46d6c7c-60b5-4063-81ce-878994829ae9.png)

**Exp**

```python
e_str = "6RthyZart9v7kHPBPS"

charset = "123456789abcdefghjklmnpqrstuvwxyzABCDEFGHIJKMNOPQRSTUVWXYZ"

c_to_i = {c: i for i ,c in enumerate(charset)}

e_b = [c_to_i[c] for c in e_str]

ov = 0

for b in e_b:

ov = ov*58 + b

print(ov)

o_b = bytearray()

while ov > 0:

o_b.append(ov & 0xFF)

ov >>= 8

  

o_b.reverse()

print(o_b)
```



