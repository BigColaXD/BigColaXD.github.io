---
title: Nmap_高级端口扫描
date: 2024-05-25 06:41:06
updated: 2026-04-13 14:03:41
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Network_Security
---
# 总结

| **Port Scan Type 端口扫描类型** | **Example Command 示例命令** |
| --- | --- |
| TCP Null Scan TCP 空扫描 | sudo nmap -sN 10.10.165.229 |
| TCP FIN Scan TCP FIN 扫描 | sudo nmap -sF 10.10.165.229 |
| TCP Xmas Scan TCP 圣诞扫描 | sudo nmap -sX 10.10.165.229 |
| TCP Maimon Scan TCP Maimon 扫描 | sudo nmap -sM 10.10.165.229 |
| TCP ACK Scan TCP ACK 扫描 | sudo nmap -sA 10.10.165.229 |
| TCP Window Scan TCP 窗口扫描 | sudo nmap -sW 10.10.165.229 |
| Custom TCP Scan 自定义 TCP 扫描 | sudo nmap --scanflags URGACKPSHRSTSYNFIN 10.10.165.229 |
| Spoofed Source IP 欺骗源 IP | sudo nmap -S SPOOFED_IP 10.10.165.229 |
| Spoofed MAC Address 欺骗性 MAC 地址 | --spoof-mac SPOOFED_MAC |
| Decoy Scan 诱饵扫描 | nmap -D DECOY_IP,ME 10.10.165.229 |
| Idle (Zombie) Scan 空闲（僵尸）扫描 | sudo nmap -sI ZOMBIE_IP 10.10.165.229 |
| Fragment IP data into 8 bytes<br>将 IP 数据分割成 8 个字节 | -f |
| Fragment IP data into 16 bytes<br>将 IP 数据分段为 16 个字节 | -ff |

| Option | Purpose |
| --- | --- |
| --source-port PORT_NUM | specify source port number<br>指定源端口号 |
| --data-length NUM | append random data to reach given length<br>附加随机数据以达到给定长度 |

这些扫描类型依赖于以非预期方式设置 TCP 标志来提示端口进行回复。Null、FIN 和 Xmas 扫描会触发来自关闭端口的响应，而 Maimon、ACK 和 Window 扫描会触发来自打开和关闭端口的响应。

| Option | Purpose |
| --- | --- |
| --reason | explains how Nmap made its conclusion<br>解释了 Nmap 是如何得出结论的 |
| -v | verbose |
| -vv | very verbose 非常啰嗦 |
| -d | debugging |
| -dd | more details for debugging<br>有关调试的更多详细信息 |

# Null Scan 空扫描 -sN

空扫描不设置任何标志;所有六个标志位都设置为零。

`sudo nmap -sN 10.10.83.103`

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716619936478-eec88e7a-f55c-437a-aa0c-195425f8a23a.png)

使用缺少 RST 响应来找出未关闭的端口(打开或过滤)

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716619942387-a5f68a69-86d1-47ec-a7da-ab18fb01854e.png)

# FIN Scan FIN 扫描 -sF

FIN 扫描发送设置了 FIN 标志的 TCP 数据包。

能够知道哪些端口是关闭的，并利用这些知识来推断打开或过滤的端口。值得注意的是，一些防火墙会在不发送 RST 的情况下“静默”丢弃流量。

`sudo nmap -sF 10.10.83.103`

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716620105530-e302199b-bb88-4f3c-8072-6b1b644c005c.png)![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716620108562-568baa08-5aa5-49de-8add-b5605fdd68a1.png)

# Xmas Scan -sX

Xmas扫描同时设置 FIN、PSH 和 URG 标志。

与 Null 扫描和 FIN 扫描一样，如果收到 RST 数据包，则表示端口已关闭。否则，它将被报告为打开|过滤。

`sudo nmap -sX 10.10.83.103`

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716620214813-8f6458c0-05ea-46f7-931d-64e0e6eaf47f.png)![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716620203182-2f59f2d5-2f25-46e2-97a4-7794f4906f71.png)

# TCP Maimon Scan -sM

设置了 FIN 和 ACK 位。目标应发送 RST 数据包作为响应。

`sudo nmap -sM 10.10.252.27`

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716620513789-132a9980-46c5-4974-aa8c-8078807a56a7.png)

# TCP ACK Scan -sA

发送设置了 ACK 标志的 TCP 数据包

根据哪些 ACK 数据包产生响应，了解哪些端口未被防火墙阻止。这种类型的扫描更适合发现防火墙规则集和配置。

此扫描不会告诉我们目标端口是否在简单设置中打开。

`sudo nmap -sA 10.10.83.103`![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716620668097-2ab73f48-2a34-4f2a-befe-8fb978d475d5.png)

# Window Scan -sW

TCP 窗口扫描与 ACK 扫描几乎相同;

但是，会检查返回的 RST 数据包的 TCP 窗口字段。在特定系统上，这可以显示端口已打开。

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716620841228-10053d9a-b03f-4cb8-8d37-e123b308d359.png)

# Custom Scan 自定义扫描

`--scanflags RSTSYNFIN`

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716621118110-463465fa-9c63-4f09-a1d1-7269fe083902.png)

# Spoofing and Decoys 欺骗和诱饵

## \-S

`nmap -S SPOOFED_IP 10.10.165.229`

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716621527737-a776e13e-50b2-406b-871e-57cbf99ed30f.png)

## \-e -Pn

`nmap -e NET_INTERFACE -Pn -S SPOOFED_IP 10.10.165.229`

​`-e`指定网络接口

`-Pn`禁用 ping 扫描

## \--spoof-mac

您可以使用 `--spoof-mac SPOOFED_MAC` 指定源 MAC 地址。当攻击者和目标计算机位于同一以太网 （802.3） 网络或同一 WiFi （802.11） 上时，才可能进行此地址欺骗。

​  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716621834377-91c74acd-fc6a-4e84-8f13-df30e2b59fc3.png)

## \-D

指定特定或随机 IP 地址来启动诱饵扫描

`nmap -D 10.10.0.1,10.10.0.2,RND,RND,ME 10.10.165.229`(RND:随机分配)

# Fragmented Packets 分段数据包

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716623403636-bca1ec49-f5ea-45ec-b024-a83fb905836d.png)

`-f`IP 数据将被分成 8 个字节或更少。

`-ff`将 IP 数据分段为 16 个字节

`--mtu`选择 8 的倍数。

`--data-length NUM`指定要附加到数据包的字节数。

# Idle/Zombie Scan

`nmap -sI ZOMBIE_IP 10.10.165.229`

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716624292854-b875bec8-9f47-47f2-b445-04d817f058b8.png)

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716624297344-68730425-6016-4018-ae1a-eda8c9ed3add.png)

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716624302176-74dc232d-a0b7-432f-bb67-363efd5df1bb.png)

# Getting More Details 获取更多详细信息

`--reason`

`-v` 详细输出

`-vv` 更详细的输出

`-d` 调试详细信息

`-dd` 更多详细信息