---
title: 关闭Windows_Defender
date: 2025-07-13 08:02:03
updated: 2025-07-13 08:04:15
tags:
  - 内网
---
WIN + R 键，调出“运行”窗口，输入“gpedit.msc” 回车

打开“本地组策略编辑器”后，依次展开“计算机配置” -> “管理模板” -> -“Windows 组件” -> “Windows Defender 防病毒”，在右侧找到“关闭Microsoft Defender防病毒”。

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1752393770148-4c9f6d98-7652-4f2c-8928-c43589fdb68b.png)

鼠标双击，打开“关闭Microsoft Defender防病毒”这一项，选择“启用”，点击“确定”。

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1752393822482-7f691ba3-ca6d-446f-a836-af9b79957028.png)