---
title: jndi基础
date: 2026-01-30 08:41:28
updated: 2026-06-26 03:33:15
tags:
  - Web
  - java
  - 反序列化
---
JNDI（Java Naming and Directory Interface，Java命名和目录接口）漏洞是一种常见的安全漏洞，它利用Java应用程序中JNDI服务的动态类加载功能来实现远程代码执行（RCE）。随着Java版本的更新，对JNDI漏洞的防护也在不断加强，但攻击者也会寻找新的绕过方法。以下是对JNDI漏洞及高版本绕过的详细解析：

### 一、JNDI漏洞原理

JNDI漏洞的原理主要涉及到攻击者利用JNDI服务中的lookup()方法的动态类加载功能。当应用程序通过JNDI接口查询远程资源时，如果攻击者能够控制查询的参数，就可以构造恶意的URI，指向攻击者控制的RMI（Remote Method Invocation，远程方法调用）或LDAP（Lightweight Directory Access Protocol，轻量级目录访问协议）服务。这些服务可以返回一个恶意的Reference对象，当应用程序尝试解析这个Reference对象时，就会触发远程类的下载和实例化，从而执行恶意代码。

  

如下代码是一段典型的存在jndi漏洞的代码。

```java
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        try {
            InitialContext initialContext = new InitialContext();
            //lookup方法参数可控即可利用
            Object url = initialContext.lookup(req.getParameter("url"));
        } catch (NamingException e) {
            e.printStackTrace();
        }

        resp.setContentType("text/html");
        resp.getWriter().println("<h1>jndi, Servlet!</h1>");
    }
```

  

### 二、JNDI漏洞的影响

JNDI漏洞的影响非常严重，它可能导致远程代码执行、信息泄露等安全问题。攻击者可以利用这个漏洞在目标服务器上执行任意代码，进而控制整个系统。例如，在Log4j JNDI注入漏洞中，攻击者可以通过构造恶意的日志消息来触发漏洞，从而在目标服务器上执行恶意代码。

### 三、高版本Java对JNDI漏洞的防护

随着Java版本的更新，对JNDI漏洞的防护也在不断加强。以下是一些高版本Java对JNDI漏洞的防护措施：

1.  **限制远程类加载**：高版本Java对JNDI服务中的远程类加载进行了限制。例如，通过设置系统属性`com.sun.jndi.rmi.object.trustURLCodebase`和`com.sun.jndi.ldap.object.trustURLCodebase`为`false`，可以禁止JNDI服务从远程Codebase加载类。

2.  **加强输入验证**：高版本Java加强了对JNDI服务输入参数的验证，防止恶意URI的注入。

3.  **引入过滤器机制**：在反序列化过程中引入过滤器机制，对要反序列化的类进行白名单校验，防止恶意类的加载和执行。

  

```java
// com/sun/jndi/rmi/registry/RegistryContext.java
private Object decodeObject(Remote r, Name name) throws NamingException {
    try {
        Object obj = (r instanceof RemoteReference)
                    ? ((RemoteReference)r).getReference()
                    : (Object)r;

        /*
            * Classes may only be loaded from an arbitrary URL codebase when
            * the system property com.sun.jndi.rmi.object.trustURLCodebase
            * has been set to "true".
            */

        // Use reference if possible
        Reference ref = null;
        if (obj instanceof Reference) {
            ref = (Reference) obj;
        } else if (obj instanceof Referenceable) {
            ref = ((Referenceable)(obj)).getReference();
        }

        if (ref != null && ref.getFactoryClassLocation() != null &&
            !trustURLCodebase) {
            throw new ConfigurationException(
                "The object factory is untrusted. Set the system property" +
                " 'com.sun.jndi.rmi.object.trustURLCodebase' to 'true'.");
        }
        return NamingManager.getObjectInstance(obj, name, this,
                                                environment);
//  } catch (NamingException e) { ...
}
```

  

### 四、高版本Java下的JNDI漏洞绕过方法

尽管高版本Java对JNDI漏洞的防护有所加强，但攻击者仍在寻找新的绕过方法。以下是一些常见的高版本Java下JNDI漏洞绕过方法：

1.  **利用本地工厂类**：攻击者可以寻找目标系统中存在的漏洞工厂类（实现了`javax.naming.spi.ObjectFactory`接口的类），并通过构造恶意的Reference对象来触发这些工厂类的加载和执行。例如，Tomcat中的`org.apache.naming.factory.BeanFactory`类就曾被用作JNDI注入攻击的入口。

2.  **直接返回序列化数据**：攻击者可以通过LDAP或RMI服务直接返回恶意的序列化数据，而不是返回一个指向远程Codebase的Reference对象。这种方式需要目标环境中存在可利用的反序列化漏洞（Gadget）。

3.  **利用其他协议**：除了RMI和LDAP之外，攻击者还可能尝试利用其他协议（如DNS、HTTP等）来绕过JNDI漏洞的防护。例如，通过构造恶意的DNS查询来触发JNDI注入攻击。

### 五、防范措施

为了防范JNDI漏洞及其绕过方法，可以采取以下措施：

1.  **升级和修补**：及时升级和修补存在JNDI漏洞的组件和框架。

2.  **禁用不必要的JNDI服务**：如果应用程序不需要使用JNDI服务，可以在配置中禁用JNDI功能。

3.  **加强输入验证和过滤**：对外部输入进行严格的验证和过滤，防止恶意URI和序列化数据的注入。

4.  **限制JNDI查找的权限**：通过配置JNDI服务的权限，限制应用程序对JNDI服务的访问。

5.  **使用安全策略**：启用Java的安全策略来限制代码执行和远程类加载。

综上所述，JNDI漏洞是一种严重的安全威胁，但随着Java版本的更新和防护措施的加强，攻击者也在寻找新的绕过方法。因此，开发人员和安全人员需要保持警惕，及时采取防范措施来应对潜在的安全风险。、