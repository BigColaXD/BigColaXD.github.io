---
title: CTF-Misc
date: 2024-04-09 11:21:48
updated: 2025-10-21 10:07:15
tags:
  - Misc
  - CTF
---
`String 路径 | grep 关键字`

## exiftool文件属性

```bash
n = [3902939465, 2371618619, 1082452817, 2980145261]
flag=''
for i in n:
    a=str(hex(i))
    flag+=a[2:]
print(flag)
```

## 文件头补全

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661545452-6b2be778-836d-4c5d-8f27-6cb61c392af5.png)

```php
JPEG (jpg)，               文件头：FFD8FF　　　　　文件尾：FF D9　　　　　　　　　　　　　　　
PNG (png)，                 文件头：89504E47　　　　　 文件尾：AE 42 60 82
GIF (gif)，                 文件头：47494638　　　　　文件尾：00 3B
ZIP Archive (zip)，                 文件头：504B0304　　　　　文件尾：50 4B
TIFF (tif)，                      文件头：49492A00　　　　　　文件尾：
Windows Bitmap (bmp)，      　  文件头：424D　　　　　　　　　　　文件尾：
CAD (dwg)，                        　  文件头：41433130　　　　　　　　　文件尾：
Adobe Photoshop (psd)，          文件头：38425053　　　　　　　　　文件尾：
Rich Text Format (rtf)，             文件头：7B5C727466　　　　　 文件尾：
XML (xml)，                              文件头：3C3F786D6C　　　　　　　　文件尾：
HTML (html)，                           文件头：68746D6C3E
Email [thorough only] (eml)，     文件头：44656C69766572792D646174653A
Outlook Express (dbx)，            文件头：CFAD12FEC5FD746F
Outlook (pst)，                         文件头：2142444E
MS Word/Excel (xls.or.doc)，      文件头：D0CF11E0
MS Access (mdb)，                    文件头：5374616E64617264204A
WordPerfect (wpd)，                  文件头：FF575043
Adobe Acrobat (pdf)，               文件头：255044462D312E
Quicken (qdf)，                         文件头：AC9EBD8F
Windows Password (pwl)，         文件头：E3828596
RAR Archive (rar)，                    文件头：52617221
Wave (wav)，                            文件头：57415645
AVI (avi)，                                 文件头：41564920
Real Audio (ram)，                     文件头：2E7261FD
Real Media (rm)，                       文件头：2E524D46
MPEG (mpg)，                           文件头：000001BA
MPEG (mpg)，                           文件头：000001B3
Quicktime (mov)，                     文件头：6D6F6F76
Windows Media (asf)，               文件头：3026B2758E66CF11
MIDI (mid)，                              文件头：4D546864
```

## base64图片解码

  

`data:image/jpg;base64,base64图片编码`  
可用img标签：`<img src="base64图片编码"/>`

  

## binwalk

  

分析文件：binwalk filename  
分离文件：binwalk -e  filename

binwalk -e misc14.jpg --run-as=root -D

## dd

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1713449567285-3ce72a5c-99e2-4928-85a8-2dac2d106bff.png)

```bash
dd if=misc14.jpg of=flag.jpg skip=2103 bs=1
```

## zip伪加密

### ZipCenOp

  

```shell
java -jar ZipCenOp.jar r xxx.zip
```

  

第二个数字为奇数时 –>加密 09 00  
第二个数字为偶数时 –>未加密 00 00  
![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661545680-f36637d5-b28a-494f-8ae5-bddccc52d9af.png)

  

## 流量分析

  

上传登录信息  
`http.request.method==post`  
`login`  
`upload`  
`http`

  

次数最多的IP`统计功能`  
发送邮件的协议一般为`SMTP`  
后门文件`.php`、`phpinfo()`

  

## LSB隐写

  

用Stegsolve.jar

  

保存为Bin

  

## 转成ASCII

  

二进制码8个为一组，转化为10进制，然后对照ASCii码

  

01101011011011110110010101101011011010100011001101110011

  

## 加解密

  

### RC4加密脚本

  

```python
#rc4
import base64
from urllib import parse

def rc4_main(key="init_key", message="init_message"):  # 返回加密后得内容
    s_box = rc4_init_sbox(key)
    crypt = str(rc4_excrypt(message, s_box))
    return crypt

def rc4_init_sbox(key):
    s_box = list(range(256))
    j = 0
    for i in range(256):
        j = (j + s_box[i] + ord(key[i % len(key)])) % 256
        s_box[i], s_box[j] = s_box[j], s_box[i]
    return s_box

def rc4_excrypt(plain, box):
    res = []
    i = j = 0
    for s in plain:
        i = (i + 1) % 256
        j = (j + box[i]) % 256
        box[i], box[j] = box[j], box[i]
        t = (box[i] + box[j]) % 256
        k = box[t]
        res.append(chr(ord(s) ^ k))
    cipher = "".join(res)
    return (str(base64.b64encode(cipher.encode('utf-8')), 'utf-8'))

key = "HereIsTreasure"  # 此处为密文
message = input("请输入明文:\n")
enc_base64 = rc4_main(key, message)
enc_init = str(base64.b64decode(enc_base64), 'utf-8')
enc_url = parse.quote(enc_init)
print("rc4加密后的url编码:" + enc_url)
# print("rc4加密后的base64编码"+enc_base64)
```

  

[CTF常见编码及加解密（超全）](https:_www.cnblogs.com_ruoli-s_p_14206145)

  

### brainfuck编码

  

BrainFuck 语言只有八种符号，所有的操作都由这八种符号 **(> < + - . , [ ])** 的组合来完成。

  

[Brainfuck1](https://www.splitbrain.org/services/ook)

  

### ook编码

  

[Brainfuck1](https://www.splitbrain.org/services/ook)

  

### base64转图像

  

```css
// Base64 在CSS中的使用
.box{
  background-image: url("data:image/jpg;base64,/9j/4QMZR...");
}
// Base64 在HTML中的使用
<img src="data:image/jpg;base64,/9j/4QMZR..." />
```

  

### 盲文

  

![](https://cdn.nlark.com/yuque/0/2024/jpeg/39170111/1712661724535-adca2f35-1d0a-4b2d-ac4a-b2c46ef1ab67.jpeg)

  

### 与佛论禅

  

[与佛论禅](https://ctf.bugku.com/tool/todousharp)

  

[新与佛论禅](http:_hi.pcmoe.net_buddha)

  

#### Serpent(蛇)

  

[http://serpent.online-domain-tools.com/](http://serpent.online-domain-tools.com/)

  

## 后门查杀

  

D盾扫描

  

敏感文件include、upload

  

## .vmdk

  

自带的7z命令解压文件：7z x flag.vmdk -o./

  

## 路由器信息数据

  

用RouterPassView查看配置文件，搜索username或者password

  

## steghide

  

查看文件隐藏内容：steghide info filename

  

分离文件：steghide extract -sf filename

  

## F5加密

  

java Extract /图片的绝对路径 [-p 密码] [-e 输出文件]

  

//java11

  

## jsfuck

  

! + ( ) [ ]组成

  

与jother很像，只是少了{ }

  

复制到控制台

  

## 蚁剑特征的数据流

  

将=号后面的内容进行**base16**解码，找到答案

  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661545772-e88947bf-019a-4924-bdc6-012095897e5c.png)

  

## emoji+aes

  

[https://aghorler.github.io/emoji-aes/](https://aghorler.github.io/emoji-aes/)

  

```plain
🙃💵🌿🎤🚪🌏🐎🥋🚫😆😍🥋🐘🍴🚰😍☀🌿😇😍😡🏎👉🛩🤣🖐💧☺🌉🏎😇😆🎈💧⏩☺🔄🌪⌨🐅🎅🙃🍌🙃🔪☂🏹🕹☃🌿🌉💵🐎🐍😇🍵😍🐅🎈🥋🚰✅🎈🎈
key:GAME
```

  

## zsteg

```bash
zsteg -all
zsteg -E "extradata:0" misc17.png > 1.txt	#提取数据
binwalk -e 1.txt		#得到的1F1是png

```

## tweakpng

数据块修改

dd if=misc14.jpg of=1.jpg skip=2103 bs=1

## 时间戳

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1713066283860-ac83db74-854e-4b92-8559-061bd1381c29.png)

```bash
1997/09/22 02:17:02	->	874865822
```

## 缩略图

MagicEXIF打开也能看到缩略图

```bash
exiftool.exe -ThumbnailImage -b misc22.jpg > 1.jpg
```

## 文件结构

### 16进制转图片

```bash
xxd -r -p hex.txt output.png
```

### pngdebug

```bash
pngdebugger --verbose ../test/example.png
```

### 图片宽高

  

1.  使用windows查看图片属性，会发现属性里的高度和16进制软件(010Editor、winhex、hxd)里提供的高宽数据不一样，这时候就可以怀疑宽高被修改了。  
    注:有的时候是一致的，所以一致不代表没被修改
2.  图片放入010Editor，自动载入自带的Template，**左下角会提示CRC不匹配**，这是因为修改了高宽，却没有修改CRC，导致读取报错。
3.  看到这样的提示，说明图片高宽很可能被修改过。
4.  pngcheck、tweakpng检查图片会发现，都会提示**CRC校验错误**。修改高或者宽，再查看图片会发现图片变乱了，无法正常显示，这说明这个高或者宽不能修改了，如果能正常显示，说明宽高被修改了，只管往大了修。

```python
import binascii
import struct
 
crcbp = open("misc25.png", "rb").read()    #打开图片
crc32frombp = int(crcbp[29:33].hex(),16)     #读取图片中的CRC校验值
print(crc32frombp)
 
for i in range(4000):                        #宽度1-4000进行枚举
    for j in range(4000):                    #高度1-4000进行枚举
        data = crcbp[12:16] + \
            struct.pack('>i', i)+struct.pack('>i', j)+crcbp[24:29]
        crc32 = binascii.crc32(data) & 0xffffffff
        # print(crc32)
        if(crc32 == crc32frombp):            #计算当图片大小为i:j时的CRC校验值，与图片中的CRC比较，当相同，则图片大小已经确定
            print(i, j)
            print('hex:', hex(i), hex(j))
            exit(0)
```

Png

  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661545554-af31f73a-115c-4d80-80c8-94f1cb6f77dc.png)

  

Jpg:

  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661724576-4eb876cb-6d39-463d-82db-804b89cecf58.png)

gif：

修改完后StegSolve查看图片

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1713448045513-256ceb49-7db7-4064-be31-845ec2bbf531.png)

bmp：

右击属性可以看到目前像素是900 x 153=137700，而文件头占了53字节，文件结尾在675053字节处。  
又因为每个像素点由三个字节表示，每个字节控制一种颜色，分别为红、绿、蓝三种颜色。  
所以文件真实像素大小为(675053-53)/3=225000。根据提示本题的宽度是没问题的，所以只需要修改高度即可。高度=225000/900=250

修改高度为FA，右键另存为图片，得到flag![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1713446158440-4148c262-de2c-4b52-b52a-7984f4bad63b.png)

### 逆序

010 Editor 打开，可以看见末尾明显 `JFIF` 特征

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1724234488303-b2fad2fa-8ef5-42cc-97a1-76518d848a2a.png)

可以将文件上传到 CyberChef，逆序（注意按字节而不是字符），然后下载：

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1724234591356-2157deac-c4ba-4580-8f95-a10280e23c29.png)

```python
def reverse_bytes_in_file(input_file_path, output_file_path):

    try:
        with open(input_file_path, 'rb') as infile:
            content = infile.read()
            reversed_content = content[::-1]

            with open(output_file_path, 'wb') as outfile:  
                outfile.write(reversed_content)

        print(f"文件内容已成功逆序，并写入到 {output_file_path}")
    except FileNotFoundError:
        print(f"未找到文件: {input_file_path}")
    except Exception as e:
        print(f"发生错误: {e}")

input_file = './flag'
output_file = './out'
reverse_bytes_in_file(input_file, output_file)
```
```python
open('./out','wb').write(open('./flag','rb').read()[::-1])
```

## dig解析txt

```bash
dig flag.basectf.fun txt

https://ti.360.cn能看所有网的解析
```

## 内存取证

**命令格式**

`volatility -f [image] --profile=[profile] [plugin]`

在分析之前，需要先判断当前的镜像信息，分析出是哪个操作系统

`volatility -f xxx.vmem imageinfo`

如果操作系统错误，是无法正确读取内存信息的，知道镜像后，就可以在–profile=中带上对应的操作系统

**常用插件**

下列命令以windows内存文件举例

**查看用户名密码信息**

`volatility -f 1.vmem --profile=Win7SP1x64 hashdump`

**查看进程**

`volatility -f 1.vmem --profile=Win7SP1x64 pslist`

**查看服务**

`volatility -f 1.vmem --profile=Win7SP1x64 svcscan`

**查看浏览器历史记录**

`volatility -f 1.vmem --profile=Win7SP1x64 iehistory`

**查看网络连接**

`volatility -f 1.vmem --profile=Win7SP1x64 netscan`

**查看命令行操作**

`volatility -f 1.vmem --profile=Win7SP1x64 cmdscan`

**查看文件**

`volatility -f 1.vmem --profile=Win7SP1x64 filescan`

**查看文件内容**

`volatility -f 1.vmem --profile=Win7SP1x64 dumpfiles -Q 0xxxxxxxx -D ./`

**查看当前展示的notepad内容**

`volatility -f 1.vmem --profile=Win7SP1x64 notepad`

**提取进程**

`volatility -f 1.vmem --profile=Win7SP1x64 memdump -p xxx --dump-dir=./`

**屏幕截图**

`volatility -f 1.vmem --profile=Win7SP1x64 screenshot --dump-dir=./`

**查看注册表配置单元**

`volatility -f 1.vmem --profile=Win7SP1x64 hivelist`

**查看注册表键名**

`volatility -f 1.vmem --profile=Win7SP1x64 hivedump -o 0xfffff8a001032410`

**查看注册表键值**

`volatility -f 1.vmem --profile=Win7SP1x64 printkey -K "xxxxxxx"`

**查看运行程序相关的记录，比如最后一次更新时间，运行过的次数等**

`volatility -f 1.vmem --profile=Win7SP1x64 userassist`

**最大程序提取信息**

`volatility -f 1.vmem --profile=Win7SP1x64 timeliner`