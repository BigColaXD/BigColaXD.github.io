---
title: Nmap_实时主机发现
date: 2024-05-23 12:11:00
updated: 2026-04-13 14:03:41
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Network_Security
---
# 总结

Nmap 默认为对实时主机进行**端口扫描**。

| **Scan Type 扫描类型** | **Example Command 示例命令** |
| --- | --- |
| ARP Scan | sudo nmap -PR -sn MACHINE_IP/24 |
| ICMP Echo Scan | sudo nmap -PE -sn MACHINE_IP/24 |
| ICMP Timestamp Scan | sudo nmap -PP -sn MACHINE_IP/24 |
| ICMP Address Mask Scan | sudo nmap -PM -sn MACHINE_IP/24 |
| TCP SYN Ping Scan | sudo nmap -PS22,80,443 -sn MACHINE_IP/30 |
| TCP ACK Ping Scan | sudo nmap -PA22,80,443 -sn MACHINE_IP/30 |
| UDP Ping Scan | sudo nmap -PU53,161,162 -sn MACHINE_IP/30 |

如果您只对主机发现感兴趣而不进行端口扫描，请记住添加 `-sn`​

| **Option** | **Purpose** |
| --- | --- |
| -n | 跳过DNS查找 |
| -R | 反向 DNS 查找所有主机 |
| -sn | 仅限发现主机 |

# Subnetworks 子网

# Enumerating Targets 枚举目标

`nmap -iL list_of_hosts.txt`

`nmap -sL TARGETS`

`nmap -sL -n 10.10.12.13/29`

`nmap -sL -n 10.10.0-255.101-125`

# Discovering Live Hosts 发现实时主机

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716470535167-47a4ff10-e7e5-413a-b5e6-3d3e4e8802ea.png)

ARP 有一个目的：向网段上的广播地址发送帧，并要求具有特定 IP 地址的计算机通过提供其 MAC（硬件）地址进行响应。

ICMP有多种类型。ICMP ping 使用 Type 8 (Echo) 和 Type 0 (Echo Reply)。如果要 ping 同一子网上的系统，则 ARP 查询应在 ICMP 回显之前。

尽管 TCP 和 UDP 是传输层，但出于网络扫描目的，扫描程序可以将特制的数据包发送到公共 TCP 或 UDP 端口，以检查目标是否会响应。此方法非常有效，尤其是在 ICMP Echo 被阻止时。

# Nmap Host Discovery Using ARP  
使用 ARP 的 Nmap 主机发现

## Nmap -PR

1.  当特权用户尝试扫描本地网络（以太网）上的目标时，Nmap 会使用 ARP 请求。特权用户是 root 属于 sudoers 并可以运行 sudo 的用户。
2.  当特权用户尝试扫描本地网络外部的目标时，Nmap 使用 ICMP 回显请求、TCP ACK（Acknowledge）到端口 80、TCP SYN（Synchronize）到端口 443 和 ICMP 时间戳请求。
3.  当非特权用户尝试扫描本地网络外部的目标时，Nmap 会通过向端口 80 和 443 发送 SYN 数据包来求助于 TCP 3 向握手。

  

默认情况下，Nmap 使用 ping 扫描来查找实时主机，然后继续仅扫描实时主机。如果要使用 Nmap 发现在线主机而无需端口扫描实时系统，则可以发出 `nmap -sn TARGETS` .

仅当您与目标系统位于同一子网上时，才可以进行 ARP 扫描。在以太网 （802.3） 和 WiFi （802.11） 上，您需要知道任何系统的 MAC 地址，然后才能与之通信。MAC 地址是链路层报头所必需的;标头包含源 MAC 地址和目标 MAC 地址等字段。为了获取 MAC 地址，操作系统会发送 ARP 查询。回复 ARP 查询的主机已启动。仅当目标与您位于同一子网（即位于同一以太网/WiFi）上时，ARP 查询才有效。您应该会看到在本地网络的 Nmap 扫描期间生成的许多 ARP 查询。

如果希望 Nmap 只执行 ARP 扫描而不进行端口扫描，则可以使用 `nmap -PR -sn TARGETS`  
其中 \-PR 表示您只需要 ARP 扫描。

运行 `nmap -PR -sn MACHINE_IP/24` 以发现与目标计算机位于同一子网上的所有实时系统。

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716549078076-64e7dc98-ae10-4670-98fb-70c871000d41.png)

## arp-scan

`arp-scan --localnet` 或 `arp-scan -l`  
此命令会将 ARP 查询发送到本地网络上的所有有效 IP 地址。

`sudo arp-scan -I eth0 -l` 将发送 eth0 接口上所有有效 IP 地址的 ARP 查询。

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716549098158-58a46232-582a-45db-8bab-d0c4355b36a8.png)

# Nmap Host Discovery Using ICMP  
使用 ICMP 的 Nmap 主机发现

## ICMP Echo -PE

对目标网络上的每个 IP 地址执行 ping 操作，并查看谁会使用 ping 回复（ICMP 类型 0）响应我们的 ping （ICMP 类型 8/Echo） 请求

`nmap -PE -sn MACHINE_IP/24`

`-PE`使用 ICMP 回显请求发现实时主机

`-sn`不按照端口扫描进行操作

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716548461219-b3efe19e-0b5c-48d3-ab41-e2ba9d567666.png)

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716549028179-bfc5c37c-a2cc-4d3b-b596-d5e6ee5f2e5c.png)

  

由于 ICMP 回显请求往往会被阻止，考虑使用 ICMP 时间戳 或 ICMP 地址掩码请求来判断系统是否处于联机状态。

## ICMP Timestamp 时间戳 -PP

Nmap 使用时间戳请求（ICMP 类型 13）并检查它是否将获得时间戳回复（ICMP 类型 14）。`-PP` 选项会告知 Nmap 使用 ICMP 时间戳请求。

`nmap -PP -sn MACHINE_IP/24`

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716548943255-bb149031-f500-4e47-aaa9-83cbb33c9b28.png)

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716549035666-eeaa1233-7a90-468a-a5fb-09a7fc6b4f5b.png)

## ICMP Address Mask 地址掩码 -PM

Nmap 使用地址掩码查询（ICMP 类型 17）并检查它是否获得地址掩码回复（ICMP 类型 18）。可以使用选项 `-PM` 启用此扫描

`nmap -PM -sn MACHINE_IP/24`

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716549376674-ac949e3c-e9e9-4219-aa4f-04f3ee27c725.png)

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716549487484-9485e096-5c66-48f8-8c1b-51937277c5e2.png)

# Nmap Host Discovery Using TCP and UDP  
使用 TCP 和 UDP 的 Nmap 主机发现

## **TCP SYN Ping -PS**

`nmap -PS -sn MACHINE_IP/24` 以扫描目标 VM 子网,默认为 80 端口

`-PA` 后跟端口号、范围、列表或它们的组合。`-PS21` 将以端口 21 为目标，`-PS21-25` 将以端口 21、22、23、24 和 25 为目标，`-PS80,443,8080` 将针对三个端口 80、443 和 8080。

特权用户（root 和 sudoers）可以发送 TCP SYN 数据包，即使端口打开也不需要完成 TCP 3 向握手

非特权用户只能完成 3 次握手。![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716550256872-c87d6e08-1aa5-49f5-a41e-a8098a6f643c.png)

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716550454981-5c3aa8da-0eeb-48a6-b960-14f5799d9409.png)

## **TCP ACK Ping -PA**

必须以特权用户身份运行 Nmap 才能完成此操作。如果您以非特权用户身份尝试，Nmap 将尝试 3 次握手。

`-PA` 后跟端口号、范围、列表或它们的组合。

`sudo nmap -PA -sn MACHINE_IP/24`

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716550655029-b0922104-382c-4eca-93a4-3f62172b9726.png)

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716550772379-6e739ce8-21b8-4bd3-9af9-6d11243d2bc7.png)

## **UDP Ping -PU**

指定端口的语法类似于 TCP SYN ping 和 TCP ACK ping。

`sudo nmap -PU -sn 10.10.68.220/24`

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716550844510-595586ed-49f0-41ac-b974-b13bac83cbfd.png)

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716550982238-bb37eaa1-4d0a-4f2d-8355-3695696ae2a8.png)

# **Masscan**

Masscan 使用类似的方法来发现可用的系统。但是，Masscan 对生成的数据包速率非常激进。

-   `masscan MACHINE_IP/24 -p443`
-   `masscan MACHINE_IP/24 -p80,443`
-   `masscan MACHINE_IP/24 -p22-25`
-   `masscan MACHINE_IP/24 ‐‐top-ports 100`

# Using Reverse-DNS Lookup 使用反向 DNS 查找

Nmap 的默认行为是使用反向 DNS 联机主机。

`-n` 跳过发送DNS 查询

默认情况下，Nmap 会查找在线主机;

但是，可以使用 `-R` 查询 DNS 服务器，对于脱机主机也是如此。

如果使用特定的 DNS 服务器，可以添加 `--dns-servers DNS_SERVER` 选项。