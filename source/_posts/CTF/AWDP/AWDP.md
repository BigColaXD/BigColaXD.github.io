---
title: AWDP
date: 2025-03-08 10:00:36
updated: 2025-12-19 09:41:08
tags:
  - AWDP
---

# 基础命令

```java
mv <修复的php⽂件> /var/www/html/
cp -r <修复的php⽂件> /var/www/html/

tar -zcvf 1.tar.gz * //将⽂件夹下的内容压缩到1.tar.gz
tar zcvf update.tar.gz
```

```bash
#!/bin/sh
mv file1 /var/www/html/index.php
chmod 777 /var/www/html/index.php
mv file2 /home/ctf/pwn
chmod 777 /home/ctf/pwn
```

```python
ps -ef|grep npm|grep -v grep |awk '{print $2}'|xargs kill -9
ps -ef|grep node|grep -v grep |awk '{print $2}'|xargs kill -9
```

```java
jar cvf shell.war shell.jsp
jar -xvf game.war
```

# go

```go
import (
	"fmt"
	"strings"
)

func main() {
	var input string

	fmt.Print("请输入一个字符串：")
	fmt.Scanln(&input)

	maliciousStrings := []string{"union", "select", "delete", "insert", "update", "truncate", "drop", "create", "\"", "'", " ", "{{", "}}", ".","{","}","flag"}

	input = strings.ToLower(input) // 将输入转换为小写，便于匹配

	for _, s := range maliciousStrings {
		if strings.Contains(input, s) {
			return // 包含恶意字符串
		}
	}

```

```go
import (
	"fmt"
)

func main() {
	var input string

	fmt.Print("请输入一个字符串：")
	fmt.Scanln(&input)

	maliciousStrings := []string{"union", "select", "delete", "insert", "update", "truncate", "drop", "create", "\"", "'", " ", "{{", "}}", ".","{","}","flag"}

	if isMalicious(input, maliciousStrings) {
		return
	}
}

func isMalicious(input string, maliciousStrings []string) bool {
	input = stringToLower(input)

	for _, s := range maliciousStrings {
		if stringContains(input, s) {
			return true
		}
	}
	return false
}

func stringToLower(str string) string {
	runes := []rune(str)
	for i, r := range runes {
		if r >= 'A' && r <= 'Z' {
			runes[i] = r + ('a' - 'A')
		}
	}
	return string(runes)
}

func stringContains(str string, substr string) bool {
	strRunes := []rune(str)
	substrRunes := []rune(substr)

	for i := 0; i <= len(strRunes)-len(substrRunes); i++ {
		found := true
		for j := 0; j < len(substrRunes); j++ {
			if strRunes[i+j] != substrRunes[j] {
				found = false
				break
			}
		}
		if found {
			return true
		}
	}

	return false
}

```

# java

-   类的⽩名单校验机制

对所有传⼊的反序列化对象，在反序列化过程开始前，对类型名称做⼀个检查，不符合⽩名单的类不进⾏反序列化操作。

-   禁⽌ JVM 执⾏外部命令 Runtime.exec

```shell
Runtime.getRuntime().exec(var);
java.lang.ProcessBuilder("xxx").start();
new java.lang.UNIXProcess("xxx");

clazz.getDeclaredMethod
method.invoke
```

```java
SecurityManager originalSecurityManager = System.getSecurityManager();
if (originalSecurityManager == null) {
    // 创建自己的 SecurityManager
    SecurityManager sm = new SecurityManager() {
        private void check(Permission perm) {
            // 禁止 exec
            if (perm instanceof java.io.FilePermission) {
                String actions = perm.getActions();
                if (actions != null && actions.contains("execute")) {
                    throw new SecurityException("execute denied!");
                }
            }
            // 禁止设置新的 SecurityManager，保护自己
            if (perm instanceof java.lang.RuntimePermission) {
                String name = perm.getName();
                if (name != null && name.contains("setSecurityManager")) {
                    throw new SecurityException("System.setSecurityManager denied!");
                }
            }
        }

        @Override
        public void checkPermission(Permission perm) {
            check(perm);
        }

        @Override
        public void checkPermission(Permission perm, Object context) {
            check(perm);
        }
    };

    System.setSecurityManager(sm);
}

```

```python
@Mapping("/api")
@Post
public String api(Map map, Context ctx) throws Exception {
    JSONObject jsonObject = new JSONObject(ctx.body());

    if (map.size() != jsonObject.length()) {
        byte[] decodedata = Base64.getEncoder.decode((String) map.get("data"));
        String data1 = new String(decodedata);

        if (data1.contains("snack") && data1.contains("log")) {
            return "false";
        } else {
            User user = (User) deserialize((String) map.get("data"));
            return user.getName();
        }
    }
    
    return "success";
}

```

```xml
<filter>
    <filter-name>sqlInjectFilter</filter-name>
    <filter-class>com.xxx.filter.sqlFilter</filter-class> <!-- 替换为实际类路径 -->
</filter>
<filter-mapping>
    <filter-name>sqlInjectFilter</filter-name>
    <url-pattern>/system/role/list</url-pattern> <!-- 拦截路径，可扩展 -->
</filter-mapping>
```

# Nodejs

```javascript
const keywords = ["flag", "exec", "read", "open", "ls", "cat"];

for (const i of keywords) {
  if (code.includes(i)) {
    result = "Hacker!"  
  }else{
    // result = vm.run((code));
  }
}
```

```plain
function waf(query) {
  if (query.includes("flag") || query.includes("nc")) {
    throw new Error("禁止使用 flag 和 nc 关键字！");
  } else {
    // 执行正常操作
  }
}
```

```sql
const backdoor = function () {
    try {
        const script = new VMScript(Object.door);
        if(Object.door.search(/construtcor|exec/)>=0) return;
        return (new VM()).run(script);
    } catch (e) {
        console.log(e);
    }
}

```

```javascript
const input = "awdwawdd";
const maliciousStrings = ["__proto__", "constructor", "prototype", "insert", "update", "truncate", "drop", "create", "\"", "'", " ", "{{", "}}","union", "select", "delete", "\"", "'", " ", "{{", "}}", ".","{","}","flag"];

function isMalicious(input, maliciousStrings) {
  input = input.toLowerCase();

  for (let i = 0; i < maliciousStrings.length; i++) {
    const pattern = new RegExp(maliciousStrings[i], "i");
    if (pattern.test(input)) {
      return true;
    }
  }

  return false;
}

if (isMalicious(input, maliciousStrings)) {
  console.log("输入参数包含恶意字符串");
} else {
  console.log("输入参数安全");
}

```

```javascript
const blacklist = [
  "outputFunctionName", "__proto__", "return", "global", "process", "mainModule", "constructor", "child", "execSync","escapeFunction", "client", "compileDebug", "prototype"
]

for (let i = 0; i < blacklist.length; i++) {
  if (data.includes(blacklist[i])){
    return res.status(400).render('error', { code: 400, msg: 'hack'});
  }
}
```

```shell
function containsPrototypePollution(obj) {
    for (let key in obj) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            return true;
        }
    }
    return false;
}
```



# php

## 通防

```php
//basic
if (preg_match('/system|tail|flag|exec|base64/i', $_SERVER['REQUEST_URI'])) {
  die('no!');
}
//wafrce
function wafrce($str){
  return preg_match("/openlog|syslog|readlink|symlink|popepassthru|stream_socket_server|scandir|pcntl_exec|fwrite|curl|system|eval|assert|flag|passthru|exec|chroot|chgrp|chown|shell_exec|proc_open|proc_get_status|popen|ini_alter|ini_restore/i", $str);
}
if (wafrce($input)){
  die("No!");
}

//wafxss
function wafxss($str){
  return preg_match("/\'|http|\"|\`|cookie|<|>|script/i", $str);
}
if (wafxss($input)){
  die("No!");
}

//RCE
function wafrce($str){
	return !preg_match("/openlog|syslog|readlink|symlink|popepassthru|stream_socket_server|scandir|assert|pcntl_exec|fwrite|curl|system|eval|assert|flag|passthru|exec|chroot|chgrp|chown|shell_exec|proc_open|proc_get_status|popen|ini_alter|ini_restore/i", $str);
}

//以下这个可以用短标签+反引号+通配符绕过过滤
preg_match("/\^|\||\~|assert|print|include|require|\(|echo|flag|data|php|glob|sys|phpinfo|POST|GET|REQUEST|exec|pcntl|popen|proc|socket|link|passthru|file|posix|ftp|\_|disk|tcp|cat|tac/i", $str);

//SQL
function wafsqli($str){
	return !preg_match("/select|and|\*|\x09|\x0a|\x0b|\x0c|\x0d|\xa0|\x00|\x26|\x7c|or|into|from|where|join|sleexml|extractvalue|+|regex|copy|read|file|create|grand|dir|insert|link|server|drop|=|>|<|;|\"|\'|\^|\|/i", $str);
}

if (preg_match("/select|flag|union|\\\\$|\'|\"|--|#|\\0|into|alert|img|prompt|set|/\*|\x09|\x0a|\x0b|\x0c|\0x0d|\xa0|\%|\<|\>|\^|\x00|\#|\x23|[0-9]|file|\=|or|\x7c|select|and|flag|into|where|\x26|\'|\"|union|\`|sleep|benchmark|regexp|from|count|procedure|and|ascii|substr|substring|left|right|union|if|case|pow|exp|order|sleep|benchmark|into|load|outfile|dumpfile|load_file|join|show|select|update|set|concat|delete|alter|insert|create|union|or|drop|not|for|join|is|between|group_concat|like|where|user|ascii|greatest|mid|substr|left|right|char|hex|ord|case|limit|conv|table|mysql_history|flag|count|rpad|\&|\*|\.|/is",$s)||strlen($s)>50){
    header("Location: /");
    die();
}

function wafrce($str){
	return !preg_match("/openlog|syslog|readlink|symlink|popepassthru|stream_socket_server|scandir|assert|pcntl_exec|fwrite|curl|system|eval|assert|flag|passthru|exec|chroot|chgrp|chown|shell_exec|proc_open|proc_get_status|popen|ini_alter|ini_restore/i", $str);
}

function wafsqli($str){
	return !preg_match("/select|and|\*|\x09|\x0a|\x0b|\x0c|\x0d|\xa0|\x00|\x26|\x7c|or|into|from|where|join|sleexml|extractvalue|+|regex|copy|read|file|create|grand|dir|insert|link|server|drop|=|>|<|;|\"|\'|\^|\|/i", $str);
}

function wafxss($str){
	return !preg_match("/\'|http|\"|\`|cookie|<|>|script/i", $str);
}

```

```php
$str1 ="";
foreach ($_POST as $key => $value) {
    $str1.=$key;
    $str1.=$value;
}
$str2 ="";
foreach ($_GET as $key => $value) {
    $str2.=$key;
    $str2.=$value;
}
if (preg_match("/system|tail|flag|\'|\"|\<|\{|\}|exec|base64|phpinfo|<\?|\"/i", $str1)||preg_match("/system|tail|flag|\'|\"|\<|\{|\}|exec|base64|phpinfo|<\?|\"/i", $str2)) {
    die('no!');
}
```

```php
/\'|http|php|data|\"|\`|cookie|regexp|from|procedure|and|substring|union|if|pow|exp|order|sleep|benchmark|into|load|outfile|dumpfile|load_file|show|select|update|set|concat|delete|alter|insert|create|or|drop|not|for|join|is|between|group_concat|like|where|user|ascii|greatest|mid|substr|left|right|char|hex|ord|case|limit|conv|table|mysql_history|flag|count|rpad|\&|\*|\.|\<|\>|\?|-/i
```

  

## RCE

system()、exec()、passthru()、shell\_exec()、popen()、proc\_open()、pcntl\_exec(）

```php
$pattern = "call_user_func|call_user_func_array|array_map|array_filter|phpinfo|eval|assert|passthru|pcntl_exec|exec|system|escapeshellcmd|popen|chroot|scandir|chgrp|chown|shell_exec|proc_open|proc_get_status|ob_start";
if(preg_match("/".$pattern."/is",$filename)== 1){
die();
}
```

```php
$pattern ="eval|assert|passthru|pcntl_exec|exec|system|escapeshellcmd|popen|chroot|scandir|chgrp|chown|shell_exec|proc_open|proc_get_status|ob_start";
```

## 任意⽂件读取

```php
$pattern ="\/|\.\.\/|\.\/|etc|var|file|http|ftp|php|zlib|data|glob|phar|ssh2|rar|ogg|expect|zip|compress|filter|input|\/|\.\.\/|\.\/|jpg|jpeg|png|bmp|gif|flag|\?";
if(preg_match("/".$pattern."/is",$filename)== 1){
die("No!");
}
echo file_get_contents($filename);
```

```php
$pattern ="\/|\.\.\/|\.\/|etc|var|file|http|ftp|php|zlib|data|glob|phar|ssh2|rar|ogg|expect|zip|compress|filter|input";
```

```php
open_basedir="/var/www/html"
```

## **⽂件包含**

相关函数： • include() • include\_once() • require() • require\_once(）

```php
$pattern ="\/|\.\.\/|\.\/|etc|var|php|jpg|jpeg|png|bmp|gif|file|http|ftp|php|zlib|data|glob|phar|ssh2|rar|ogg|expect|zip|compress|filter|input|flag|\?";
if(preg_match("/".$pattern."/is",$filename)== 1){
die("NO!");
}
include($filename);
```

## sql注⼊

```python
strtolower()
```

```php
$filter = "regexp|from|procedure|and|substring|if|pow|exp|order|sleep|benchmark|into|load|outfile|dumpfile|load_file|join|show|select|update|set|concat|delete|alter|insert|create|union|or|drop|not|for|is|between|group_concat|like|where|user|ascii|greatest|mid|substr|left|right|char|hex|ord|case|limit|conv|table|sql_history|flag|count|rpad|lpad|\&|\*|\.|-|;|\"|\'|\^";
if((preg_match("/$filter/i",$username)== 1) || (preg_match("/$filter/i",$password)== 1)){
    die("no!");
}
```

```php
addslashes()函数 直接包裹住传⼊内容即可
```

  

## **⽂件上传**

```php
if(($_FILES["Uploadfile"]["type"]=="image/gif")&&($_FILES["Uploadfile"]["size"]<1024000)&&(substr($_FILES["Uploadfile"]["name"],strrpos($_FILES["Uploadfile"]["name"],'.')+1))=='gif'){
    ////⽂件上传内容
} else{
die();
}

//改进：
<?php
<?php
// 允许的 MIME 类型和扩展名
$allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
$allowedExtensions = ["jpg", "jpeg", "png", "gif"];

// 限制最大上传文件大小（2MB）
$maxFileSize = 2 * 1024 * 1024; 

// 目标上传目录（确保有写权限）
$uploadDir = __DIR__ . "/uploads/";

// 确保上传目录存在（如果不存在则创建）
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// 处理上传
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_FILES["file"])) {
    $file = $_FILES["file"];

    // 检查上传错误
    if ($file["error"] !== UPLOAD_ERR_OK) {
        die("文件上传失败，错误代码：" . $file["error"]);
    }

    // 获取文件真实 MIME 类型
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file["tmp_name"]);
    finfo_close($finfo);

    // 获取文件扩展名（小写）
    $extension = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

    // WAF：检查文件类型
    if (!in_array($mimeType, $allowedMimeTypes) || !in_array($extension, $allowedExtensions)) {
        die("非法的文件类型！");
    }

    // WAF：检查文件大小
    if ($file["size"] > $maxFileSize) {
        die("文件大小超出限制（最大 2MB）！");
    }

    // WAF：防止 PHP 代码执行（阻止 `.php`, `.phtml` 等）
    $blacklistExtensions = ["php", "php3", "php4", "php5", "phtml", "pht"];
    if (in_array($extension, $blacklistExtensions)) {
        die("禁止上传可执行文件！");
    }

    // 生成随机文件名（防止覆盖）
    $newFileName = uniqid("img_", true) . "." . $extension;
    $destination = $uploadDir . $newFileName;

    // WAF：安全上传文件
    if (move_uploaded_file($file["tmp_name"], $destination)) {
        echo "文件上传成功！文件路径：" . htmlspecialchars($newFileName);
    } else {
        die("文件上传失败！");
    }
} else {
    die("无效的请求！");
}

```

```php
$ext = strtolower($ext);
$blacklist = array("php", "php5", "php4", "php3", "phtml", "pht",
    "jsp", "jspa", "jspx", "jsw", "jsv", "jspf", "jtml", "asp", "aspx","asa", "asax", "ascx", "ashx", "asmx", "cer", "swf", "htaccess","ini");

if (!in_array($ext, $blacklist)) { 
        if (move_uploaded_file($_FILES['file']['tmp_name'],UPLOAD_PATH . $name)) {
            $is_upload = true;
        } 
        else { 
            echo "<script>error();</script>"; 
        }
    } 
else { 
        echo "<script>black();</script>"; 
    }
```

```php
$destination = "upload_file/" . $_FILES["Uploadfile"]["name"];
if (file_exists($destination)) {
    echo $_FILES["Uploadfile"]["name"] . " already exists. ";
    $new_destination = $destination . ".gif";
    if (!rename($destination, $new_destination)) {
        die("重命名失败！");
    }
    echo "已重命名为：" . htmlspecialchars($new_destination);
} else {
    if (move_uploaded_file($_FILES["Uploadfile"]["tmp_name"], $destination.".gif")) {
        echo "文件上传成功！存储在: " . htmlspecialchars($destination)."gif";
    } else {
        die("文件上传失败！");
    }
}
```

```php
<?php
header("Content-type: text/html;charset=utf-8");
error_reporting(1);

define("WWW_ROOT",$_SERVER['DOCUMENT_ROOT']);
define("APP_ROOT",str_replace('\\','/',dirname(__FILE__)));
define("APP_URL_ROOT",str_replace(WWW_ROOT,"",APP_ROOT));
define("UPLOAD_PATH", "upload");
?>
<?php

$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        $deny_ext = array(".jpg",".png",".jpeg");         //【修改点一】
        $file_name = trim($_FILES['upload_file']['name']);
        $file_ext = strrchr($file_name, '.');
        $file_ext = strtolower($file_ext); //转换为小写
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
        $file_ext = trim($file_ext); //收尾去空

        if (in_array($file_ext, $deny_ext)&&substr_count($_FILES['upload_file']['name'], '.')===1) {//【修改点二】
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH.'/'.$file_name;
            if (move_uploaded_file($temp_file, $img_path)) {
                $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        } else {
            $msg = '此文件不允许上传!';
        }
    } else {
        $msg = UPLOAD_PATH . '文件夹不存在,请手工创建！';
    }
}
?>

<div id="upload_panel">
    <form enctype="multipart/form-data" method="post" onsubmit="return checkFile()">
        <p>请选择要上传的图片：<p>
            <input class="input_file" type="file" name="upload_file"/>
            <input class="button" type="submit" name="submit" value="上传"/>
    </form>
    <div id="msg">
        <?php
        if($msg != null){
            echo "提示：".$msg;
        }
        ?>
    </div>
    <div id="img">
        <?php
        if($is_upload){
            echo '<img src="'.$img_path.'" width="250px" />';
        }
        ?>
    </div>
</div>

```

## **反序列化**

```php
// 将所有的对象都转换为 __PHP_Incomplete_Class 对象
$data = unserialize($foo, ["allowed_classes" => false]);
// 将除 MyClass 和 MyClass2 之外的所有对象都转换为 __PHP_Incomplete_Class 对象
$data = unserialize($foo, ["allowed_classes" => ["MyClass", "MyClass2"]]);
```

```php
$filter = "phar|zip|compress.bzip2|compress.zlib";
if(preg_match("/".$filter."/is",$name)== 1){
    die();
}
```

```php
# php_serialize 在5.5版本后新加的⼀种规则，
# 5.4及之前版本，如果设置成php_serialize会报错。
ini_set('session.serialize_handler', 'php_serialize');
ini_set('session.serialize_handler', 'php');
两者处理session的⽅式不同，错误使⽤会形成基于session的反序化漏洞
```

## XSS

常⻅的输出函数有： echo、printf、print、print\_r、sprintf、die、var\_dump、 var\_export 等

```php
$name=htmlspecialchars($_POST['password']);
//echo $name;
echo "<pre>Hello $name</pre>";
```

```php
$pattern = "\'|http|\"|\`|cookie|<|>|script";
if(preg_match("/".$pattern."/is",$input)== 1){
    die("no!");
}
```

## XXE

```php
libxml_disable_entity_loader(true);
```

```php
$pattern = "ENTITY|<|>|DOCTYPE|SYSTEM|PUBLIC";
if(preg_match("/".$pattern."/is",$input)== 1){
    die("no!");
}
```

```php
$blacklist = "/php|read|flag/i";
$username = preg_replace($blacklist,"",$username);
```

## thinkphp框架防护

把这个waf直接上到public/index.php最前面

```php
foreach($_REQUEST as $key=>$value) {
    $_POST[$key] = preg_replace("/construct|get|call_user_func|load|invokefunction|Session|phpinfo|param1|Runtime|assert|input|dump|checkcode|union|select|updatexml|@/i",'',$value);
    $_GET[$key] = preg_replace("/construct|get|call_user_func|load|invokefunction|Session|phpinfo|param1|Runtime|assert|input|dump|checkcode|union|select|updatexml|@/i",'',$value);
}

```



# python

## 通防

```shell
os.system
eval
os.subprocess
```

```python
filter_list = ["{", "(", "lipsum", "attr"]
input = ""
for i in filter_list:
    if i in input:
        print("Hacker!" )
```

## **SSTI**

```python
if request.args.get("name"):
    blacklist = [
        "'", "_", "\\x", "\\u", "{{", "\\+", "attr", "\\.", " ",
        "class", "init", "globals", "popen", "system", "env",
        "exec", "shell_exec", "flag", "passthru", "proc_popen",
        "\[", "\]", "\\\\", "os", "__", '"', "$", "*", ",",
        "{", "}", "0x", "0o", "/", "+"
    ]
    for ban in blacklist:
        if ban in request.args.get("name"):
            return "error!"
```

```python
if requests.get("name"):
    black_symbol = ["class","os","popen","_","__", "'", '"', "$", "*", ",", ".","{","}","\\","0x","0o","/","+","*"]
    for ban in black_symbol:
        if ban in requests.get("name"):
            return "error!"
```

```python
from flask import Flask,request
from jinja2 import Template
import re

app = Flask(__name__)

@app.route("/")
def index():
    name = request.args.get('name','CTFer<!--?name=CTFer')
    if not re.findall(r"'|_|\\x|\\u|{{|\+|attr|\.| |class|init|globals|popen|system|env|exec|shell_exec|flag|passthru|proc_popen|\[|]|\\",name):
        t = Template("hello "+name)
        return t.render()
    else:
        t = Template("Hacker!!!")
        return t.render()

if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5001)

```

```python
return render_template_string(content % (str(ip), str(port), str(word)))
#fix：
return render_template_string(content % (str(ip).replace("{",""), str(port).replace("{",""), str(word).replace("{","")))
```

## sqli

```python
content = ''

blacklist = ['\'','union','\"','select','(',')',',',' ','%']
for i in blacklist:
    if i in content.lower():
        exit()
```

## uuid.getnode()

linux下mac地址的位置：**/sys/class/net/eth0/address**

读取获得mac地址



