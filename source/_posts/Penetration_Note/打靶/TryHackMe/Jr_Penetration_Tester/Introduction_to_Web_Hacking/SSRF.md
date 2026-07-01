---
title: SSRF
date: 2024-05-17 06:09:41
updated: 2026-04-13 14:03:41
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Introduction_to_Web_Hacking
---
# Finding an SSRF

可以通过许多不同的方式在 Web 应用程序中发现潜在的 SSRF 漏洞。以下是四个常见位置的示例：

**在地址栏中的参数中使用完整 URL 时：**

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715927072049-e8cbfce3-5867-4d81-8bcc-08eca4beb98f.png)

**窗体中的隐藏字段：**

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715927071979-4c648ba1-b9c3-4e74-9fdf-d12af45b7926.png)

**部分 URL，例如仅主机名：**

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715927072187-e9407ea5-2e52-469b-a8b1-3ba65b0bf6f6.png)

**或者可能只有 URL 的路径：**

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715927071970-33921ebd-741f-4513-b8ed-0d4d0812204e.png)

  
其中一些示例比其他示例更容易利用，这是需要大量试验和错误才能找到有效负载的地方。  
如果使用没有输出反馈给您的盲 SSRF，则需要使用外部 HTTP 日志记录工具来监视请求，例如[https://requestbin.com](https://requestbin.com)、您自己的 HTTP 服务器或 Burp Suite 的 Collaborator 客户端。

# Defeating Common SSRF Defenses  
击败常见的 SSRF 防御

## Deny List 拒绝名单

​拒绝列表是接受除列表中指定的资源或匹配特定模式之外的所有请求的地方。Web 应用程序可以使用拒绝列表来保护敏感的终结点、IP 地址或域不被公众访问，同时仍允许访问其他位置。限制访问的特定终结点是 localhost，它可能包含服务器性能数据或其他敏感信息，因此 localhost 和 127.0.0.1 等域名将出现在拒绝列表中。攻击者可以使用其他 localhost 引用（如 0、0.0.0.0、0000、127.1、127.\*.\*.\*、2130706433、017700000001）或具有解析为 IP 地址 127.0.0.1 的 DNS 记录（如 127.0.0.1.nip.io）的子域来绕过拒绝列表。

  
此外，在云环境中，阻止对 IP 地址 169.254.169.254 的访问将是有益的，该地址包含已部署云服务器的元数据，包括可能的敏感信息。攻击者可以通过使用指向 IP 地址 169.254.169.254 的 DNS 记录在自己的域上注册子域来绕过此漏洞。

​  

## Allow List 允许列表

允许列表是所有请求被拒绝的地方，除非它们出现在列表中或与特定模式匹配，例如参数中使用的 URL 必须以 https://website.thm 开头的规则。攻击者可以通过在攻击者的域名上创建子域（如 https://website.thm.attackers-domain.thm）来快速规避此规则。应用程序逻辑现在将允许此输入，并允许攻击者控制内部 HTTP 请求。  
  

## Open Redirect 打开重定向

​如果上述绕过不起作用，攻击者还有一个技巧，即打开重定向。开放重定向是服务器上的一个端点，网站访问者在其中自动重定向到另一个网站地址。以链接 https://website.thm/link?url=https://tryhackme.com 为例。创建此端点是为了记录访问者出于广告/营销目的点击此链接的次数。但想象一下，存在一个潜在的 SSRF 漏洞，该漏洞具有严格的规则，仅允许以 https://website.thm/ 开头的 URL。攻击者可利用上述功能将内部 HTTP 请求重定向到攻击者选择的域。

# SSRF Practical

首先，创建一个客户帐户并登录。登录后，访问 https://10-10-101-88.p.thmlabs.com/customers/new-account-page 以查看新的头像选择功能。通过查看头像表单的页面源，您将看到头像表单字段值包含图像的路径。背景图像样式可以在上面的 DIV 元素中确认这一点，如下面的屏幕截图所示：

  
![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715928546585-e6199ff4-5b1f-4fc4-bca5-0de7e406a689.png)

  
如果您选择其中一个头像，然后单击“更新头像”按钮，您将看到表单更改，并在其上方显示您当前选择的头像。

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715928546555-a63f15eb-7f14-4700-8216-1895d09cc93a.png)

​  

查看页面源代码将显示使用数据 URI 方案显示您当前的头像，并且图像内容按照下面的屏幕截图进行 base64 编码。

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715928546848-1864331d-b69f-49fa-9dd3-ed4651be6b36.png)  
  
现在，让我们再次尝试发出请求，但将头像值更改为私有，以期服务器能够访问资源并越过 IP 地址块。为此，首先，右键单击头像表单上的一个单选按钮，然后选择“检查”：

​  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715928546766-db0f5ed5-ef82-49d0-9ad1-26276aa03dd0.png)  
**然后将单选按钮的值编辑为 private：**

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715928547060-a943deff-f3b5-473d-8c06-17cf3dd52d61.png)  
  
请务必选择您编辑的头像，然后单击“更新头像”按钮。遗憾的是，Web 应用程序似乎有一个拒绝列表，并且阻止了对 /private 终结点的访问。  
  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715928548773-c2326abd-a538-438c-860f-707a5b561d2d.png)

  
从错误消息中可以看出，路径不能以 /private 开头，但别担心，我们仍然有一个技巧可以绕过此规则。我们可以使用目录遍历技巧来到达我们想要的端点。尝试将头像值设置为 x/../private

​  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715928548940-c0ba57d6-884d-4920-9f00-fc5e9cb9ebdc.png)

  
你会看到我们现在已经绕过了规则，用户更新了头像。这个技巧之所以有效，是因为当 Web 服务器收到对 x/.. 的请求时。/private，它知道 ../ 字符串表示向上移动一个目录，该目录现在仅将请求转换为 /private.

  
查看头像表单的页面源代码，您会看到当前设置的头像现在包含 base64 编码的 /private 目录中的内容，解码此内容后，它会显示一个flag.

​  

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715928881558-b3833681-a2e7-493b-b9ba-4cba056e2487.png)