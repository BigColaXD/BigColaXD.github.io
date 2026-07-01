---
title: File_Inclusion_文件包含
date: 2024-05-15 01:04:49
updated: 2026-04-13 14:03:41
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Introduction_to_Web_Hacking
---
# Path Traversal 路径遍历

## dot-dot-slash attack

../点-点-斜杠攻击，利用使用双点将目录向上移动一步。

> 如：
> 
> 在Linux上,`http://webapp.thm/get.php?file=../../../../etc/passwd`
> 
> 在Windows上，`http://webapp.thm/get.php?file=../../../../boot.ini`  
> or `http://webapp.thm/get.php?file=../../../../windows/win.ini`

## 常见操作系统文件

| **Location** | **Description** |
| --- | --- |
| /etc/issue | 包含要在登录提示符之前打印的消息或系统标识。 |
| /etc/profile | 控制系统范围的默认变量，例如导出变量、文件创建掩码 （umask）、终端类型、邮件消息以指示新邮件何时到达 |
| /proc/version | 指定 Linux 内核的版本​ |
| /etc/passwd | 具有访问系统的所有注册用户 |
| /etc/shadow | 包含有关系统用户密码的信息 |
| /root/.bash_history/ | 包含 **root** 用户的历史记录命令 |
| /var/log/dmessage | 包含全局系统消息，包括系统启动期间记录的消息​ |
| /var/mail/root | ​**root** 用户的所有电子邮件 |
| /root/.ssh/id_rsa | 服务器上 root 或任何已知有效用户的私有 SSH 密钥 |
| /var/log/apache2/access.log | 对 Apache Web 服务器的访问请求 |
| C:\boot.ini | 包含具有 BIOS 固件的计算机的启动选项 |

# Local File Inclusion - LFI

​针对 Web 应用程序的 LFI 攻击通常是由于开发人员缺乏安全意识。使用 PHP，使用 **include、requi、include\_once 和 require\_once** 等函数通常会导致易受攻击的 Web 应用程序。在这个房间里，我们将选择PHP，但值得注意的是，在使用其他语言（如ASP、JSP）甚至在Node.js应用程序中时，也会出现LFI漏洞。

## %00/0x00截断

使用 null 字节是一种注入技术，其中 URL 编码的表示形式（如 %00 或 0x00 以十六进制形式使用用户提供的数据来终止字符串。您可以将其视为试图欺骗 Web 应用程序忽略 Null Byte 之后的任何内容。

By adding the Null Byte at the end of the payload, we tell the `include` function to ignore anything after the null byte which may look like:通过在有效负载的末尾添加 Null Byte，我们告诉 include 函数忽略 null 字节后面的任何内容，如下所示：

`include("languages/../../../../../etc/passwd%00").".php");`

which equivalent to → `include("languages/../../../../../etc/passwd");`  
注意：%00 技巧是固定的，不适用于 PHP 5.3.4 及更高版本。

## /. & /..

在本节中，开发人员决定过滤关键字以避免泄露敏感信息！正在过滤 /etc/passwd 文件。有两种可能的方法可以绕过过滤器。首先，使用 NullByte %00 或 filtered 关键字 `/.` 末尾的当前目录技巧。

该漏洞将类似于 `http://webapp.thm/index.php?lang=/etc/passwd/.`

我们也可以 `http://webapp.thm/index.php?lang=/etc/passwd%00`  
如果我们在文件系统中使用 `cd ..`，它会让你退后一步;

但是，如果你做`cd .`，它会留在当前目录中。

同样，如果我们尝试 `/etc/passwd/..`结果是 `/etc/`

现在，如果我们尝试 `/etc/passwd/.`，结果将是 `/etc/passwd`，因为 dot 指的是当前目录。

# Remote File Inclusion - RFI

RFI 的一个要求是需要打开**allow\_url\_fopen**选项。  
![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715867435790-2fc0d1d8-471c-4428-9b86-c8357fbd3096.png)

# Remediation 修复

1.  ​使用最新版本更新系统和服务，包括 Web 应用程序框架。
2.  ​关闭 PHP 错误以避免泄露应用程序的路径和其他可能泄露的信息。
3.  ​Web 应用程序防火墙 （WAF） 是帮助缓解 Web 应用程序攻击的不错选择。
4.  如果您的 Web 应用不需要某些导致文件包含漏洞的 PHP 功能，请禁用它们，例如 **allow\_url\_fopen** 打开和**allow\_url\_include**。
5.  ​仔细分析 Web 应用程序，只允许有需要的协议和 PHP 包装器。
6.  ​永远不要相信用户输入，并确保对文件包含实施正确的输入验证。
7.  ​实现文件名和位置的白名单以及黑名单。