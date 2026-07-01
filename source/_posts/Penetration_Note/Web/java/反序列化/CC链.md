---
title: CC链
date: 2026-02-05 16:33:37
updated: 2026-02-09 19:43:59
tags:
  - Web
  - java
  - 反序列化
---
| **Gadget Chain** | **CC 版本依赖** | **JDK 版本限制** | **核心入口点 (Source)** | **核心特征/用途** |
| --- | --- | --- | --- | --- |
| **CC1** | 3.1 - 3.2.1 | **JDK < 8u71** | `AnnotationInvocationHandler` | 鼻祖链，利用动态代理。高版本 JDK 修复了入口点。 |
| **CC2** | 4.0 | **无限制** | `PriorityQueue` | 针对 CC 4.0 版本。利用 `TemplatesImpl`<br>加载字节码。 |
| **CC3** | 3.1 - 3.2.1 | **JDK < 8u71** | `AnnotationInvocationHandler` | **Bypass 专用**。利用 `TrAXFilter`<br>绕过 `InvokerTransformer`<br>黑名单。 |
| **CC4** | 4.0 | **无限制** | `PriorityQueue` | **CC2 + CC3 的结合体**。CC 4.0 下的 Bypass 方案。 |
| **CC5** | 3.1 - 3.2.1 | **JDK 1.8+** | `BadAttributeValueExpException` | 填补 CC1 在 JDK 1.8 下的空白。 |
| **CC6** | 3.1 - 3.2.1 | **无限制** | `HashSet`<br>-> `TiedMapEntry` | **实战首选**。不受 JDK 版本限制，且绕过黑名单的经典链。 |
| **CC7** | 3.1 - 3.2.1 | **无限制** | `Hashtable` | `Hashtable`<br>变体，用于特殊环境下 `HashSet`<br>被禁用的情况。 |
| **CC11** | 3.1 - 3.2.1 | **无限制** | `HashSet`<br>-> `TiedMapEntry` | **非官方实战链**。**结合了 CC6 的入口与 TemplatesImpl 的执行**，高版本 JDK 注入内存马必备。 |

![CC.jpg](https://cdn.nlark.com/yuque/0/2026/jpeg/39170111/1770576961711-db64724b-288a-429f-86c7-486a06c94be2.jpeg)

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1770497477563-4b7f3c61-b7b7-4c3f-bc0b-181d8bb02b1e.png)