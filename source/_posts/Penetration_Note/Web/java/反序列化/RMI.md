---
title: RMI
date: 2026-03-10 05:50:18
updated: 2026-03-11 08:41:26
tags:
  - Web
  - java
  - 反序列化
---
jdk<8\_121

[Java RMI 攻击由浅入深 | 素十八](https://su18.org/post/rmi-attack/)[Java RMI 攻击由浅入深 ｜ 素十八 (2026_3_10 15：24：40).txt](https://www.yuque.com/attachments/yuque/0/2026/txt/39170111/1773127914659-e192815f-9362-459a-97d0-29260fa96111.txt)

![20200702100127-f0d4c18c-bc07-1.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1773129820909-127a1563-b168-46f5-ba92-d15469de4e22.png)

# RMI 的具体调用过程

RMI 底层通讯采用了Stub (运行在客户端) 和 Skeleton (运行在服务端) 机制，RMI 调用远程方法的大致如下：

1.  RMI 客户端在调用远程方法时会先创建 Stub ( `sun.rmi.registry.RegistryImpl_Stub` )。
2.  Stub 会将 Remote 对象传递给远程引用层 ( `java.rmi.server.RemoteRef` ) 并创建 `java.rmi.server.RemoteCall`( 远程调用 )对象。
3.  RemoteCall 序列化 RMI 服务名称、Remote 对象。
4.  RMI 客户端的远程引用层传输 RemoteCall 序列化后的请求信息通过 Socket 连接的方式传输到 RMI 服务端的远程引用层。
5.  RMI服务端的远程引用层( `sun.rmi.server.UnicastServerRef` )收到请求会请求传递给 Skeleton ( `sun.rmi.registry.RegistryImpl_Skel#dispatch` )。
6.  Skeleton 调用 RemoteCall 反序列化 RMI 客户端传过来的序列化。
7.  Skeleton 处理客户端请求：bind、list、lookup、rebind、unbind，如果是 lookup 则查找 RMI 服务名绑定的接口对象，序列化该对象并通过 RemoteCall 传输到客户端。
8.  RMI 客户端反序列化服务端结果，获取远程对象的引用。
9.  RMI 客户端调用远程方法，RMI服务端反射调用RMI服务实现类的对应方法并序列化执行结果返回给客户端。
10.  RMI 客户端反序列化 RMI 远程方法调用结果。

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1773121827908-ad25fe8a-a106-409f-9baf-e3dedef51e2c.png)

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1773124512707-84114418-0250-41fe-b319-eb13d58cbfa4.png)

# 攻击 RMI

## 攻击 Server 端

### 恶意服务参数

> Server 端的调用方法存在非基础类型的参数时，就可以被恶意 Client 端传入恶意数据流触发反序列化漏洞。
> 
> 方法之一：hook RMI 代码修改逻辑![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1773126553081-4e927160-9403-420c-b2ea-1643d69e9996.png)

### 动态类加载

> 在 6u45/7u21 之前默认开启，需要 Server 加载并配置 SecurityManager，并设置 `java.rmi.server.useCodebaseOnly=false`
> 
> 无论 Server 端还是 Client 端，只要有一端配置了 `java.rmi.server.codebase`，这个属性都会跟随数据流在两端流动。因此 Client 端可以通过配置此项属性，并向 Server 端传递不存在的类，使 Server 端试图从 `java.rmi.server.codebase` 地址中远程加载恶意类而触发攻击。

### 替身攻击

> 在讨论对 Server 端的攻击时，还出现了另外一种针对参数的攻击思路，我称其为替身攻击。依旧是用来绕过当参数不是 Object，是指定类型，但是还想触发反序列化的一种讨论。
> 
> 大体的思路就是调用的方法参数是 `HelloObject`，而攻击者希望使用 CC 链来反序列化，比如使用了一个入口点为 HashMap 的 POC，那么攻击者在本地的环境中将 HashMap 重写，让 HashMap 继承 HelloObject，然后实现反序列化漏洞攻击的逻辑，用来欺骗 RMI 的校验机制。
> 
> 这的确是一种思路，但是还不如 hook RMI 代码修改逻辑来得快，所以这里不进行测试。

## 攻击 Registry 端

ysoserial.exploit.RMIRegistryExploit

> 在使用 Registry 时，首先由 Server 端向 Registry 端绑定服务对象，这个对象是一个 Server 端生成的动态代理类，Registry 端会反序列化这个类并存在自己的 RegistryImpl 的 bindings 中，以供后续的查询。所以如果我们是一个恶意的 Server 端，向 Registry 端输送了一个恶意的对象，在其反序列化时就可以触发恶意调用。
> 
> 因为 bind 的参数是需要是 Remote 类型的，使用了 AnnotationInvocationHandler 来代理了 Remote 接口，形成了反序列化漏洞。
> 
> 除了 bind，由于 lookup/rebind 等方法均通过反序列化传递数据，因此此处的实际攻击手段不止 bind 一种。也就是说，名义上的 Server 端和 Client 端都可以攻击 Registry 端。

## 攻击 Client 端

> 如果攻击的目标作为 Client 端，也就是在 Registry 地址可控，或 Registry/Server 端可控，也是可以导致攻击的。
> 
> 客户端主要有两个交互行为，第一是从 Registry 端获取调用服务的 stub 并反序列化，第二步是调用服务后获取执行结果并反序列化。
> 
> ### 恶意 Server Stub
> 
> 同攻击 Registry 端，Client 端在 Registry 端 lookup 后会拿到一个 Server 端注册在 Registry 端的代理对象并反序列化触发漏洞。
> 
> ### 恶意 Server 端返回值
> 
> 同攻击 Server 端的恶意服务参数，Server 端返回给 Client 端恶意的返回值，Client 端反序列化触发漏洞，不再赘述。
> 
> ### 动态类加载
> 
> 同攻击 Server 端的动态类加载，Server 端返回给 Client 端不存在的类，要求 Client 端去 codebase 地址远程加载恶意类触发漏洞，不再赘述。

## 攻击 DGC

ysoserial.exploit.JRMPClient

# 反序列化 Gadgets

## UnicastRemoteObject

## UnicastRef

## RemoteObject