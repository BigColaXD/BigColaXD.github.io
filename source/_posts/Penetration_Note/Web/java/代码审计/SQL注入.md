---
title: SQL注入
date: 2025-08-05 02:42:06
updated: 2026-01-25 06:05:39
tags:
  - Web
  - java
  - 代码审计
---
```plain
" +
${
```

# Jdbc

## 动态拼接

后端代码将前端获取的参数动态直接拼接到SQL语句中使用 java.sql.Statement执行SQL语句从而导致SQL注入漏洞的出现：

-   动态拼接参数
-   使用 **java.sql.Statement** 执行SQL语句

```java
// 注册驱动
Class.forName(driver);
// 获取连接
Connection conn = DriverManager.getConnection(url, user, password);
Statement statement = conn.createStatement();
//动态拼接字符串
String sql = "select * from users where id = '" + id + "'";
ResultSet rs = statement.executeQuery(sql);
```

## 错误的预编译

PreparedStatement会对SQL语句进行预编译，不论输入什么，经过预编译后全都以**字符串**来执行SQL语句。PreparedStatement 会先使用 ?作为占位符将 SQL 语句进行预编译，确定语句结构，再传入参数进行执行查询。

预编译 PreparedStatement正确使用方式，防止了SQL注入漏洞：

```java
String sql = "select * from users where username = ?";
PreparedStatement preparestatement = conn.prepareStatement(sql);
preparestatement.setString(1, username);
ResultSet rs = preparestatement.executeQuery();
```

虽然使用了预编译 PreparedStatement方式处理SQL语句，但由于SQL语句依旧是**动态拼接**形式，从而造成了SQL注入漏洞。

```java
String sql = "select * from users where username = '" + username + "'";
PreparedStatement preparestatement = conn.prepareStatement(sql);
ResultSet rs = preparestatement.executeQuery();
```

## order by注入

在SQL语句中， order by语句用于对结果集进行排序。 order by语句后面需要是字段名或者字段位置。在使用 PreparedStatement 预编译时，会将传递任意参数使用单引号包裹进而变为了**字符串**。

如果使用预编译方式执行 order by 语句，**设置的字段名会被数据库认为是字符串，而不在是字段名。**因此，在使用 order by时，就不能使用 PreparedStatement预编译了：

```java
String sql = "select * from users" + " order by " + id;
PreparedStatement preparestatement = conn.prepareStatement(sql);
ResultSet rs = preparestatement.executeQuery();
```

# Mybatis

#{}可以有效防止SQL注入漏洞。 ${}则无法防止SQL注入漏洞。

在Mybatis中有几种场景是不能使用预编译方式的，比如： order by、 in， like。

## 占位符 #{}

对传入的参数进行预编译转义处理。类似 JDBC 中的 PreparedStatement。比如：

```sql
select * from user where id = #{number}
```

如果传入数值为1，最终会被解析成：

```sql
select * from user where id = "1"
```

## 拼接符 ${}

对传入的参数不做处理，直接拼接，进而会造成SQL注入漏洞。比如：

```sql
select * from user where id = ${number}
```

如果传入数值为1，最终会被解析成：

```sql
select * from user where id = 1
```

## order by注入

ORDER BY语句 ：用于对查询结果的排序，asc为升序，desc为降序。默认为升序。比如：

```sql
select * from users order by username asc;
```

与JDBC预编译中order by注入一样，在 order by语句后面需要是字段名或者字段位置。因此也不能使用Mybatis中预编译的方式。

在`src\main\resources\mapper\UserMapper.xml`中第13行是order by查询，我们可以看到使用了`拼接符${}`，从而造成了SQL注入漏洞，如下图所示：

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1754365634364-e3529a29-bb33-41e3-8a6e-d7873d9fe373.png)

## in注入

IN语句 ：常用于where表达式中，其作用是查询某个范围内的数据。比如：

```sql
select * from where field in (value1,value2,value3,…);
```

如上所示，in 在查询某个范围数据是会用到多个参数，在 Mybtis中如果直接使用占位符 #{}进行查询会将这些参数看做一个整体，查询会报错。因此很多开发人员可能会使用拼接符 ${}对参数进行查询，从而造成了SQL注入漏洞。比如：

```sql
select * from users where id in (${params})
```

正确的做法是需要使用foreach配合占位符 #{}实现IN查询。比如：

```xml
<!-- where in 查询场景 -->
<select id="select" parameterType="java.util.List" resultMap="BaseResultMap">
  SELECT *
  FROM user
  WHERE name IN
  <foreach collection="names" item="name" open="(" close=")" separator=",">
    #{name}
  </foreach>
</select>
```

在`src\main\resources\mapper\UserMapper.xml`中第18行是in查询，使用了`拼接符${}`，从而造成了SQL注入漏洞，如下图所示：

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1754365782528-18a7ba29-6b9c-4f81-a7fd-ebdc44577552.png)

## like注入

LIKE语句 ：在一个字符型字段列中检索包含对应串的。比如：

```sql
select * from users where username like admin
```

使用like语句进行查询时如果使用占位符#{}查询时程序会报错。比如：

```sql
select * from users where username like '%#{username}%'
```

因此经验不足的开发人员可能会使用拼接符 ${}对参数进行查询，从而造成了SQL注入漏洞：

```sql
select * from users where username like '%${username}%'
```

下面代码是正确的做法，可以防止SQL注入漏洞，如下。

```sql
SELECT * FROM users WHERE name like CONCAT("%", #{name}, "%")
```

在`src\main\resources\mapper\UserMapper.xml`中第17行是like查询，可以看到使用了`拼接符${}`，从而造成了SQL注入漏洞，如下图所示：

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1754366214625-797b7e4d-adb0-4f6b-b558-4303c95da496.png)

# SQL注入漏洞修复

[https://gist.github.com/retanoj/5fd369524a18ab68a4fe7ac5e0d121e8](https://gist.github.com/retanoj/5fd369524a18ab68a4fe7ac5e0d121e8)

## 表,字段名称

(Select, Order by, Group by 等)

```java
// 插入数据用户可控时，应使用白名单处理
// example for order by
String orderBy = "{user input}";
String orderByField;
switch (orderBy) {
    case "name":
        orderByField = "name";break;
    case "age":
        orderByField = "age"; break;
    default:
        orderByField = "id";
}
```

## JDBC

```java
String name = "foo";

// 一般查询场景
String sql = "SELECT * FROM users WHERE name = ?";
PreparedStatement pre = conn.prepareStatement(sql);
pre.setString(1, name);
ResultSet rs = pre.executeQuery();

// like 模糊查询场景
String sql = "SELECT * FROM users WHERE name like ?";
PreparedStatement pre = conn.prepareStatement(sql);
pre.setString(1, "%"+name+"%");
ResultSet rs = pre.executeQuery();

// where in 查询场景
String sql = "select * from user where id in (";
Integer[] ids = new Integer[]{1,2,3};
StringBuilder placeholderSql = new StringBuilder(sql);
for(int i=0,size=ids.length;i<size;i++) {
    placeholderSql.append("?");
    if (i != size-1) {
        placeholderSql.append(",");
    }
}
placeholderSql.append(")");

PreparedStatement pre = conn.prepareStatement(placeholderSql.toString());
for(int i=0,size=ids.length;i<size;i++) {
    pre.setInt(i+1, ids[i]);
}
ResultSet rs = pre.executeQuery();
```

## Spring-JDBC

```java
JdbcTemplate jdbcTemplate = new JdbcTemplate(app.dataSource());

// 一般查询场景
String sql = "select * from user where id = ?";
Integer id = 1;
UserDO user = jdbcTemplate.queryForObject(sql,BeanPropertyRowMapper.newInstance(UserDO.class), id);

// like 模糊查询场景
String sql = "select * from user where name like ?";
String like_name = "%" + "foo" + "%";
UserDO user = jdbcTemplate.queryForObject(sql,BeanPropertyRowMapper.newInstance(UserDO.class), like_name);

// where in 查询场景
NamedParameterJdbcTemplate namedJdbcTemplate = new
NamedParameterJdbcTemplate(app.dataSource());
MapSqlParameterSource parameters = new MapSqlParameterSource();
parameters.addValue("names", Arrays.asList("foo", "bar"));

String sql = "select * from user where name in (:names)";
List<UserDO> users = namedJdbcTemplate.query(sql, parameters,BeanPropertyRowMapper.newInstance(UserDO.class));
```

## Mybatis XML Mapper

```xml
<!-- 一般查询场景 -->
<select id="select" parameterType="java.lang.String" resultMap="BaseResultMap">
  SELECT *
  FROM user
  WHERE name = #{name}
</select>

<!-- like 查询场景 -->
<select id="select" parameterType="java.lang.String" resultMap="BaseResultMap">
  SELECT *
  FROM user
  WHERE name like CONCAT("%", #{name}, "%")
</select>

<!-- where in 查询场景 -->
<select id="select" parameterType="java.util.List" resultMap="BaseResultMap">
  SELECT *
  FROM user
  WHERE name IN
  <foreach collection="names" item="name" open="(" close=")" separator=",">
    #{name}
  </foreach>
</select>
```

## Mybatis Criteria

```java
public class UserDO {
    private Integer id;
    private String name;
    private Integer age;
}
public class UserDOExample {
    // auto generate by Mybatis
}
UserDOMapper userMapper = session.getMapper(UserDOMapper.class);
UserDOExample userExample = new UserDOExample();
UserDOExample.Criteria criteria = userExample.createCriteria();

// 一般查询场景
criteria.andNameEqualTo("foo");

// like 模糊查询场景
criteria.andNameLike("%foo%");

// where in 查询场景
criteria.andIdIn(Arrays.asList(1,2));

List<UserDO> users = userMapper.selectByExample(userExample);
```