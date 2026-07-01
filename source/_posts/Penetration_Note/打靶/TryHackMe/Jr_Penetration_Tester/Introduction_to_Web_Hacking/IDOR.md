---
title: IDOR
date: 2024-05-15 00:44:05
updated: 2026-04-13 14:03:41
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Introduction_to_Web_Hacking
---
# Finding IDORs in Encoded IDs 加密  
[Base64 Decode and Encode - Online](https://www.base64decode.org/)

# Finding IDORs in Hashed IDs 哈希  
[CrackStation - Online Password Hash Cracking - MD5, SHA1, Linux, Rainbow Tables, etc.](https://crackstation.net/)

# Finding IDORs in Unpredictable IDs 不可预测

If the Id cannot be detected using the above methods, an excellent method of IDOR detection is to create two accounts and swap the Id numbers between them. If you can view the other users' content using their Id number while still being logged in with a different account (or not logged in at all), you've found a valid IDOR vulnerability.  
如果使用上述方法无法检测到 ID，则 IDOR 检测的一个很好的方法是  
创建两个帐户并在它们之间交换 Id 号。如果您可以使用其他用户的 ID 号查看其他用户的内容，同时仍使用其他帐户登录（或根本没有登录）  
，则您发现了有效的 IDOR 漏洞。

# Where are IDORs located

It could be content your browser loads in via an AJAX request or something that you find referenced in a JavaScript file.  
它可以是浏览器通过 AJAX 请求加载的内容，也可以是您在 JavaScript 文件中找到引用的内容。

# A Practical IDOR Example

Firstly you'll need to log in. To do this, click on the customer's section and create an account. Once logged in, click on the **Your Account** tab.首先，您需要登录。为此，请单击客户的部分并创建一个帐户。登录后，单击“您的帐户”选项卡。

The **Your Account** section gives you the ability to change your information such as username, email address and password. You'll notice the username and email fields pre-filled in with your information.通过“您的帐户”部分，您可以更改您的信息，例如用户名、电子邮件地址和密码。您会注意到用户名和电子邮件字段预先填写了您的信息。

We'll start by investigating how this information gets pre-filled. If you open your browser developer tools, select the network tab and then refresh the page, you'll see a call to an endpoint with the path /api/v1/customer?id={user\_id}  
我们将首先调查如何预填充此信息。如果打开浏览器开发人员工具，选择“网络”选项卡，然后刷新页面，则会看到对路径为 /api/v1/customer?id= {user\_id} 的终结点的调用.

This page returns in JSON format your user id, username and email address. We can see from the path that the user information shown is taken from the query string's id parameter (see below image).  
此页面以 JSON 格式返回您的用户 ID、用户名和电子邮件地址。从路径中可以看出，显示的用户信息取自查询字符串的 id 参数（见下图）。

You can try testing this id parameter for an IDOR vulnerability by changing the id to another user's id.  
您可以尝试通过将 id 更改为其他用户的 id 来测试此 id 参数是否存在 IDOR 漏洞。

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715734854170-15d6f6ca-b055-4a7a-97e4-1fe9abde225e.png)