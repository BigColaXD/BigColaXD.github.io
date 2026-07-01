---
title: MAT(heapdump分析工具)使用
date: 2026-05-19 01:47:48
updated: 2026-05-19 01:48:32
tags:
  - Web
---
spring boot 1.x 版本 heapdump 查询结果，最终结果存储在 java.util.Hashtable$Entry 实例的键值对中  
`select * from org.springframework.web.context.support.StandardServletEnvironment`  
`select * from java.util.Hashtable$Entry x WHERE (toString(x.key).contains("password"))`  
spring boot 2.x 版本 heapdump 查询结果，最终结果存储在 java.util.LinkedHashMap$Entry 实例的键值对中：  
`select * from java.util.LinkedHashMap$Entry x WHERE (toString(x.key).contains("password"))`

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1779155304284-59fbefe0-9619-4a88-ab1d-cc3d38136787.png)