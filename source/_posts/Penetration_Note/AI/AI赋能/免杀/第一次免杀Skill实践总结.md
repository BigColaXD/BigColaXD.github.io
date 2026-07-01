---
title: 第一次免杀Skill实践总结
date: 2026-04-16 09:20:11
updated: 2026-06-09 05:33:35
tags:
  - AI
  - AI赋能
  - 免杀
---
# AI免杀技术套件 - 方案B DLL分离加载实践总结

## 威胁/漏洞概述

本次实践使用**方案B（DLL分离加载）**创建高级免杀恶意代码载体，通过多层混淆和反检测技术绕过主流杀软和EDR检测。该方案具备静态免杀优势（Loader不含敏感Shellcode数据），结合IPv4混淆、XOR加密、反沙箱检测、Syscall绕过Hook等综合技术。

## 技术分析

### 1. Shellcode处理流程详解

#### 1.1 Patch阶段

```bash
python3 shellcode-patch.py shellcodes_raws.bin
```

+ **处理前**: `shellcodes_raws.bin` (1444字节) - 原始shellcode
+ **处理后**: `shellcode_patched.bin` (1444字节) - 指令替换后
+ **技术实现**:
  - 同义指令替换（保留功能但改变特征）
  - 花指令注入（无意义指令+跳转）
  - 指令重排（保持功能但破坏静态特征）

#### 1.2 XOR加密阶段

```bash
python3 shellcode-encrypt.py shellcode_patched.bin mysecretkey
```

+ **输入**: `shellcode_patched.bin` (1444字节)
+ **输出**: `shellcode_encrypted.bin` (1444字节) + C数组格式
+ **加密算法**:

```python

```

#### 1.3 IPv4混淆阶段

```bash
python3 shellcode-obfuscate-ipv4.py shellcode_encrypted.bin
```

+ **转换机制**: 每4字节 → 1个IPv4地址
+ **计算**: 1444字节 ÷ 4字节/IP = **361个IPv4地址**
+ **优势**:
  - ✅ 无字节序问题（直接按字节顺序转换）
  - ✅ 比UUID方案更简单直观
  - ✅ 躲避对二进制数据的直接扫描

### 2. DLL分离加载架构

#### 2.1 数据分离设计

```plain
┌─────────────────┐     ┌──────────────────┐
│ loader_final.exe │     │   helper.dll     │
│ (152KB, GUI)    │ +   │ (108KB, 数据DLL) │
└─────────────────┘     └──────────────────┘
      ↑                       ↑
   Shellcode加载器         Shellcode数据
   反检测逻辑              (IPv4数组格式)
   Syscall绕过            (动态加载)
```

#### 2.2 动态加载流程

```c

```

### 3. 6层反沙箱检测机制

#### 3.1 综合评分系统（≥3项判定沙箱）

```c

```

### 4. Syscall绕过Hook技术

#### 4.1 绕过的API列表

| Win32 API          | NT Syscall              | 绕过目标     |
| ------------------ | ----------------------- | ------------ |
| VirtualAlloc       | NtAllocateVirtualMemory | 静态内存分配 |
| WriteProcessMemory | NtWriteVirtualMemory    | 内存写入     |
| CreateThread       | NtCreateThreadEx        | 线程创建     |


#### 4.2 Syscall实现

```c

```

### 5. VEH异常处理绕过

```c

```

## 验证步骤 / PoC

### 1. 编译验证

```bash
# 检查编译结果
file loader_final.exe
# PE32+ executable (GUI) x86-64, for MS Windows

file helper.dll
# PE32+ executable (DLL) (console) x86-64, for MS Windows
```

### 2. 功能验证流程

1. **确保文件部署在同一目录**:

```plain
loader_final.exe
helper.dll
```

2. **测试运行**:
   - 无窗口静默执行
   - 反沙箱检测通过（真实机器）
   - 成功反弹Shell连接
3. **免杀测试**:
   - 使用VirusTotal等在线检测工具
   - 在装有主流杀软的环境中测试

## 影响评估

### 优势

+ **静态免杀**: Loader不含敏感shellcode，杀软静态扫描检测不到特征
+ **动态加载**: 运行时才加载DLL，躲避静态分析
+ **多层检测**: 6层反沙箱检测，降低误杀率
+ **Syscall绕过**: 直接调用NT层函数，绕过用户层Hook
+ **无窗口执行**: GUI程序，隐蔽性高
+ **快速释放**: 获取数据后立即FreeLibrary减少痕迹

### 风险

+ **DLL依赖**: 必须确保helper.dll在同一目录
+ **特征固定**: IPv4数组可能被检测为可疑模式
+ **时效性**: 免杀技术会随杀软更新而失效

## 防御建议 / 修复方案

### 1. 静态检测防御

+ 监控PE文件中不合理的DLL导出函数调用
+ 检测IPv4数组形式的可疑数据嵌入
+ 分析VEH异常处理器的使用模式

### 2. 动态检测防御

+ 监控进程对ntdll.dll中NT函数的动态获取
+ 检测短时间内的LoadLibrary/FreeLibrary频繁调用
+ 分析内存分配和执行的时序特征

### 3. 行为分析防御

+ 监控进程的反沙箱检测行为
+ 检测异常的Syscall调用模式
+ 分析内存读写执行的时序特征

### 4. 基线防护

+ 部署EDR对DLL加载行为进行监控
+ 实施白名单机制，只允许可信DLL动态加载
+ 建立进程行为基线，检测偏离基线的行为

## 技术创新点总结

1. **IPv4混淆方案** - 简单直接，无字节序问题
2. **DLL分离架构** - 静态免杀更优
3. **综合评分反沙箱** - 多层检测，避免误杀
4. **Syscall绕过Hook** - 直接调用NT层，更隐蔽
5. **无窗口执行** - GUI程序，静默运行

本次实践通过方案B成功实现了一个高免杀率的恶意代码载体，结合了多种现代免杀技术，具有良好的隐蔽性和绕过能力。

## 执行总结

### Shellcode 处理流程

| 步骤            | 操作                                         | 输入                               | 输出                                                | 状态 |
| --------------- | -------------------------------------------- | ---------------------------------- | --------------------------------------------------- | ---- |
| **1. Patch**    | `shellcode-patch.py`                         | `shellcodes_raws.bin` (1444 bytes) | `shellcode_patched.bin` (1444 bytes)                | ✅    |
| **2. XOR加密**  | `shellcode-encrypt.py` (密钥: `mysecretkey`) | `shellcode_patched.bin`            | `shellcode_encrypted.bin` + `shellcode_encrypted.c` | ✅    |
| **3. IPv4混淆** | `shellcode-obfuscate-ipv4.py`                | `shellcode_encrypted.bin`          | `shellcode_obfuscated_ipv4.c` (**361个IP地址**)     | ✅    |


### Loader 编译结果

| 步骤                      | 命令                                                         | 输出                   | 类型             | 大小      |
| ------------------------- | ------------------------------------------------------------ | ---------------------- | ---------------- | --------- |
| **4. 更新 payload_dll.c** | IPv4数组替换（361条 → 替换旧的128条）                        | `payload_dll.c` 已更新 | -                | ✅         |
| **5. 编译 DLL**           | `x86_64-w64-mingw32-gcc -shared -o helper.dll payload_dll.c` | `helper.dll`           | PE32+ DLL x86-64 | **108KB** |
| **6. 编译 Loader**        | `x86_64-w64-mingw32-gcc -mwindows -o loader_final.exe loader_dll.c -lpsapi` | `loader_final.exe`     | PE32+ GUI x86-64 | **152KB** |


### 关键确认

+ **密钥一致**: `payload_dll.c` 中 `GetEncryptionKey()` 返回 `"mysecretkey"` ✅
+ **Shellcode大小**: 1444 bytes → 361个IPv4 (361×4=1444) ✅
+ **编译类型**: `loader_final.exe` 为 **GUI (无窗口)** 模式 ✅
+ **目标架构**: x86-64 Windows PE32+ ✅

### 部署文件

将以下两个文件放在 **同一目录** 下即可运行：

```plain
loader_final.exe   (152KB, GUI, 无窗口)
helper.dll         (108KB, Payload数据DLL)
```

---

**最后更新**: 2026-04-16  
**实践状态**: 已完成编译验证  
**技术栈**: Python Shellcode处理 + C免杀Loader + MinGW交叉编译

# AI免杀技术套件 - 方案B DLL分离加载实践总结

![image1.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782899385680-de7bdbba-654b-48f9-a54f-c41607905bb4.png)

# 截图

## windows defender✅

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782899277096-86745734-dd4b-44ba-b875-1e1ae5205a93.png)

## 火绒✅![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1780983056030-a7328aef-dd00-41a5-a800-735636421709.png)

## 360✅

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1780983050454-5fb63744-c1fb-4449-82a5-e5df130352a6.png)

  

## 卡巴斯基静态✅ 动态❌

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1780983173126-cf9a4c5d-b5b7-4b65-9498-56783376fb21.png)