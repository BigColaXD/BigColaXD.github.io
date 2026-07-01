---
title: Chrome_Cache
date: 2026-06-26 01:12:30
updated: 2026-07-01 07:07:57
tags:
  - Web
---

Chrome 有 Cache 缓存机制，若网页信息应某些原因无法再访问获得，从缓存中还原部分数据。  

```plain
Windows 的 Chrome 的 cache 路径
C:\Users\用户名\AppData\Local\Google\Chrome\User Data\Default\Cache
```

```plain
MacOS 的 Chrome 的 cache 路径
~/Library/Caches/Google/Chrome/Default/Cache
~/Library/Caches/Google/Chrome/Profile 3/Cache
```

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782916839311-8c8b8722-e6b0-4369-867f-4d3b81f4d7f5.png)

有些情况是恢复不了的  ：

1. 响应头带了 Cache-Control: no-cache / no-store
2. 浏览器磁盘空间不足被淘汰了
3. 无痕模式访问 



