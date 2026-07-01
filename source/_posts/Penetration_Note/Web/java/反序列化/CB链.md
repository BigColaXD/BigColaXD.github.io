---
title: CB链
date: 2026-02-20 11:19:43
updated: 2026-03-04 10:52:30
tags:
  - Web
  - java
  - 反序列化
---
| **Gadget Chain** | **版本及依赖** | **JDK 版本限制** | **核心入口点 (Source)** | **核心特征/用途** |
| --- | --- | --- | --- | --- |
| **CB1 (官方原版)** | CB 1.8.x - 1.9.x<br>**强依赖 CC 包** | **无限制**(通杀) | `PriorityQueue` | 利用 `BeanComparator` 触发 `TemplatesImpl` 加载字节码。<br>**致命痛点**：构造 Payload 时默认使用了 CC 库的 `ComparableComparator`，导致目标如果没有 CC 库就会打失败。 |
| CB1 无CC版<br>(实战王者) | 仅 CB 1.8.3 / 1.9.2 | **无限制**(通杀) | `PriorityQueue` | **Shiro 550/721 实战首选！**<br>将原版的比较器替换为 JDK 原生的 `String.CASE_INSENSITIVE_ORDER` 或 `Collections.reverseOrder()`，完全摆脱对 CC 包的依赖。 |
| **CB_JNDI** | 仅 CB 1.8.x - 1.9.x | 依赖 JDK 的 JNDI 限制 | `PriorityQueue` | 结合 `JdbcRowSetImpl`。<br>触发 `getDatabaseMetaData()` 导致 JNDI 注入。适用于目标无法回显/无法直接加载字节码，需要外带数据或打 JDNI 的场景。 |
| **CB_PropertyUtils** | 仅 CB 1.8.x - 1.9.x | **无限制** | `PriorityQueue` | 直接利用 CB 库底层的 `PropertyUtils.getProperty()`<br>方法，通用性极强。本质是底层机制的称呼，常与无 CC 版结合。 |