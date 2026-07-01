---
title: Frp
date: 2025-02-25 05:29:54
updated: 2025-07-13 11:46:14
tags:
  - 内网
  - 隧道搭建
---
它是一款高性能的**反向代理**应用，可以轻松地进行内网穿透，对外网提供服务。Frp 支持 TCP、UDP、KCP、HTTP、HTTPS 等协议类型，并且支持 Web服务根据域名进行路由转发。

[Releases · fatedier/frp](https://github.com/fatedier/frp/releases)

# 校验配置文件

```shell
./frps verify -c ./frps.ini
./frpc verify -c ./frpc.ini
```
```shell
./frps -c ./frps.ini
./frpc -c ./frpc.ini
```

# 使用 Frp 建立隧道(反向 socks5 代理)

获得了一个位于内网的通过 NAT 方式对外提供服务的主机的权限，现在需要对其所在的内网继续进行渗透。于是就需要通过 Frp 建立一个隧道，通过隧道访问其内网。

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1740462681099-91563d93-e8b1-4b70-b7a8-6bcf674e345a.png)

```shell
# 服务端
[common]
bind_addr = 0.0.0.0
bind_port = 7000
dashboard_addr = 0.0.0.0
dashboard_port = 7001
dashboard_user = root
dashboard_pwd = 123456
token = 00253c8fcf9ae01
# 客户端
[common]
server_addr = 39.99.251.19
server_port = 7000
token = 00253c8fcf9ae01
pool_count = 5
health_check_type = tcp
health_check_interval_s = 100
[test]
remote_port = 12345
plugin = socks5
use_encryption = true
use_compression = true
plugin_user = admin
plugin_passwd = 123456
```

我们本机设置代理： socks5 ip：39.99.251.19 端口：12345 账号：admin 密码：123456

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1740470060429-436f3846-d707-4979-a7a5-fc57ae4aa610.png)

查看 dashboard，访问 http://39.99.251.19:7001/ 账号：root 密码：123456

# 使用 Frp 映射 Web 服务

位于内网的主机需要对外提供 Web 服务，于是将内网主机的 80 端口映射到公网主机的 80 端口上

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1740464520048-262bf14b-1343-4c47-9869-e0bc6c6dca21.png)

```shell
# 服务端
[common]
bind_addr = 0.0.0.0
bind_port = 7000
dashboard_addr = 0.0.0.0
dashboard_port = 7001
dashboard_user = root
dashboard_pwd = 123456
token = 00253c8fcf9ae01
# 客户端
[common]
server_addr = 39.99.251.19
server_port = 7000
token = 00253c8fcf9ae01
[HTTP]
type = tcp
local_ip = 127.0.0.1
local_port = 80
remote_port = 80
custom_domains = www.test.com
```

然后访问 http://39.99.251.19 就是相当于访问位于内网的主机http://10.211.55.7 了

# 使用 Frp 映射 RDP 服务

获得了位于内网的一台主机的权限，并且知道了他的登录用户名和密码。他的 3389 端口只对内网开放，现在需要将该主机的3389 端口映射到公网的 VPS 的 3389 端口，那样，我们连接我们 VPS 的3389 端口就相当于连接内网主机的 3389 端口了

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1740464835697-71348010-b9bc-4aab-90ec-9ef529e6becf.png)

```shell
# 服务端
[common]
bind_addr = 0.0.0.0
bind_port = 7000
dashboard_addr = 0.0.0.0
dashboard_port = 7001
dashboard_user = root
dashboard_pwd = 123456
token = 00253c8fcf9ae01
# 客户端
[common]
server_addr = 39.99.251.19
server_port = 7000
token = 00253c8fcf9ae01
[RDP]
local_ip = 127.0.0.1
local_port = 3389
remote_port = 3389
```

远程连接 39.99.251.19 的 3389 端口即可。

# 使用 Frp 映射 SSH 服务

获得了位于内网的一台主机的权限，并且知道了他的登录用户名和密码。他的 22 SSH 端口只对内网开放，现在需要将该主机的22 端口映射到公网我们的 VPS 的 2222 端口，那样，连接我们 VPS 的 2222端口就相当于连接内网主机的 22 端口了。

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1740465271816-eccb6601-68e1-4309-8067-eb83840dfac4.png)

```shell
# 服务端
[common]
bind_addr = 0.0.0.0
bind_port = 7000
dashboard_addr = 0.0.0.0
dashboard_port = 7001
dashboard_user = root
dashboard_pwd = 123456
token = 00253c8fcf9ae01
# 客户端
[common]
server_addr = 39.99.251.19
server_port = 7000
token = 00253c8fcf9ae01
[SSH]
local_ip = 127.0.0.1
local_port = 22
remote_port = 2222
```

# 其他

**使用 FRP 映射其他服务，例如 MySQL、Redis 等服务都是和映射 Web、RDP、SSH 服务一样，修改一下要映射的端口即可。**