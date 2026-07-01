---
title: Shiro
date: 2024-11-01 17:43:42
updated: 2026-03-09 08:09:11
tags:
  - Web
  - java
  - 反序列化
---
# 简介

Apache Shiro提供了认证、授权、加密和会话管理功能，将复杂的问题隐藏起来，提供清晰直观的API使开发者可以很轻松地开发自己的程序安全代码。

Shiro将目标集中于Shiro开发团队所称的“四大安全基石”-认证（Authentication）、授权（Authorization）、会话管理（SessionManagement）和加密（Cryptography）

认证（Authentication）：用户身份识别。有时可看作为“登录（login）”，它是用户证明自己是谁的一个行为。

授权（Authorization）：访问控制过程，好比决定“认证（who）”可以访问“什么（what）”.

会话管理（SessionManagement）：管理用户的会话（sessions），甚至在没有WEB或EJB容器的环境中。管理用户与时间相关的状态。

加密（Cryptography）：使用加密算法保护数据更加安全，防止数据被偷窥。

@shiro:https://github.com/vulhub/vulhub/tree/master/shiro

# CVE-2010-3863

Apache Shiro 认证绕过漏洞

> ​shiro < 1.1.0和JSecurity 0.9.x

## 漏洞原理

在Apache Shiro 1.1.0以前的版本中，shiro 进行权限验证前未对url 做标准化处

理，攻击者可以构造/、//、/./、/…/ 等绕过权限验证。

## 漏洞复现

漏洞点/admin

使用跨目录测试字典fuzz

![QQ_1730484041957.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1730484051463-bbdfebf5-8581-4b70-b787-cf2f706be9ee.png)

# shiro550

CVE-2016-4437：Apache Shiro 1.2.4反序列化漏洞

> Apache Shiro <= 1.2.4

## 漏洞原理

属于shiro550漏洞。Apache Shiro 1.2.4及以前版本中，加密的用户信息序列化后存储在名为remember-me的Cookie中。攻击者可以使用Shiro的默认密钥伪造用户Cookie，触发Java反序列化漏洞，进而在目标机器上执行任意命令。

shiro默认使用CookieRememberMeManager，对rememberMe的cookie做了加密处理，在CookieRememberMeManaer类中将cookie中rememberMe字段内容先后进行序列化、AES加密、Base64编码操作。在识别身份的时候，需要对Cookie里的rememberMe字段解密。据加密的顺序可以推断出解密的顺序为获取cookie-base64解码-AES解密-反序列化。

  

## 漏洞复现

判断一个页面的登录是否使用了shiro框架进行身份验证、授权、密码和会话管理。

判断方法：勾选记住密码选项后，点击登录，抓包，观察请求包中是否有rememberme字段，响应包中是否有Set-cookie:rememberMe=deleteMe字段。

如果出现rememberMe=deleteMe字段应该是仅仅能说明登录页面采用了shiro进行了身份验证而已，并非直接就说明存在漏洞

> -   未登录的情况下，请求包的cookie中没有rememberMe字段，返回包set-Cookie里也没有deleteMe字段。登录失败的话，不管有没有勾选RememberMe字段，返回包都会有 rememberMe= deleteMe 字段
> -   不勾选RememberMe，登录成功的话，返回包set-Cookie里有rememberMe=deleteMe字段。但是之后的所有请求中Cookie都不会有RememberMe字段
> -   勾选RememberMe，登录成功的话，返回包set-Cookie里有rememberMe=deleteMe字段，还会有remember字段，之后的所有请求中Cookie都会有rememberMe字段
> -   或者可以在cookie后面自己加—个rememberMe=1,看返回包有没有rememberMe= deleteMe

![QQ_1730484805133.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1730484813697-f952a86d-2769-43d9-90ce-c5f76bf1e992.png)

![QQ_1730485402033.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1730485410880-330d53c6-9391-4bf1-aff4-0b5ce9536252.png)

# CVE-2020-1957

Apache Shiro 认证绕过漏洞

> Apache Shiro < 1.5.2

## 漏洞原理

我们需要分析我们请求的URL在整个项目的传入传递过程。在使用了shiro的项目中，是我们请求的URL(URL1),进过shiro权限检验(URL2)，最后到springboot项目找到路由来处理(URL3)

漏洞的出现就在URL1，URL2和URL3 有可能不是同一个URL，这就导致我们能绕过shiro的校验，直接问后端需要首选的URL。本例中的漏洞就是因为这个原因产的。

Shiro框架通过拦截器功能来对用户访问权限进行控制，如anon, authc等拦截器。anon为匿名拦截器，不需要登录即可访问；authc为登录拦截器，需要登录才可以 访问。

## 漏洞复现

URL改为/admin会自动跳转到login登录页面

构造恶意请求进行权限绕过：

为代码层面加上;就会识别成绕过 后面加个/也可以

URL改为/xxx/...;/admin/绕过登录

![QQ_1730527576767.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1730527583837-5d2e7111-2539-4fe1-8600-fa873a37f0da.png)

# Shiro721

CVE-2019-12422

> 1.2.5 <= Apache Shiro <= 1.4.1

## 原理

要成功进行 Padding Oracle Attack 是需要服务端返回两个不同的响应特征来进行 Bool 判断的。

在 Apache Shiro 的场景中，这个服务端的两个不同的响应特征为：

-   Padding Oracle 错误时，服务端响应报文的 Set-Cookie 头字段返回 `rememberMe=deleteMe`；
-   Padding Oracle 正确时，服务端返回正常的响应报文内容；

## 漏洞复现

```shell
git clone https://github.com/3ndz/Shiro-721.git
cd Shiro-721/Docker
docker build -t shiro-721 .
docker run -p 8080:8080 -d shiro-721
```

![QQ_1730528577752.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1730528580845-ed64eded-eb36-4bc7-964f-f4f264ef9a66.png)![QQ_1730528806489.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1730528809848-80624582-69b1-4653-823f-3db5b68b864a.png)![QQ_1730528872589.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1730528884764-cbc419bd-21cd-48bf-b740-ea92f69c0432.png)

# ​