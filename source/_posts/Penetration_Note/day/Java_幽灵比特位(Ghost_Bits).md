---
title: Java_幽灵比特位(Ghost_Bits)
date: 2026-04-30 06:52:25
updated: 2026-07-01 02:30:15
tags:
  - day
---
## 1\. 核心结论

Ghost Bits 指 Java 字符到字节转换过程中被静默丢弃的高 8 位。Java `char` 是 16 bit，而大量历史 API、性能优化代码、协议序列化代码只取低 8 bit，例如 `(byte) ch`、`ch & 0xff`、`ByteArrayOutputStream.write(ch)`、`DataOutputStream.writeBytes(String)`。

核心风险不在于“乱码”本身，而在于 **安全检查层看到的是完整 Unicode 字符串，下游协议/解析器看到的是低 8 bit 投影后的 ASCII 字节**。当检查和执行阶段的解释结果不同，就会形成 WAF 绕过、路径穿越、认证绕过、协议注入、请求走私、XSS、业务逻辑绕过等问题。

抽象模型：

```latex
Java String / char:  U+HHLL
unsafe cast/write:  U+HHLL & 0xff = 0xLL
downstream byte:    ASCII(0xLL)
```

任意目标 ASCII 字节 `b` 理论上都能构造为 `U+XXbb` 形式的非 ASCII 字符，只要该字符能穿过输入链路且不会被前置层规范化、拒绝或重编码。

## 2\. 典型危险代码模式

PDF 中反复出现的源头模式：

```java
out.write((byte) c);
out.write(c);                  // c 来源于 char / String.charAt 时尤其危险
target.writeByte((byte) value.charAt(i));
return table[ch & 0xff];
```

高风险 API / 代码形态：

-   `DataOutputStream.writeBytes(String)`：逐字符写入低 8 bit，高 8 bit 被丢弃。

-   `RandomAccessFile.writeBytes(String)`：同类语义。

-   `StringBufferInputStream.read`：历史 API，按低 8 bit 输出字符。

-   `String.getBytes(int, int, byte[], int)`：已废弃，低 8 bit 复制。

-   `OutputStream.write(int)` / `ByteArrayOutputStream.write(int)`：只写入参数的低 8 bit；如果传入 `char` 或 `(byte) char`，会造成投影。

-   `ch & 255`、`ch & 0xff`：常见于快速查表、hex/base64 解码。

-   手写 hex digit 解析：不严格判断 `[0-9A-Fa-f]`，把非 hex 字符折叠到合法 nibble。

-   协议序列化器：HTTP header、SMTP、Redis RESP、XML tag、URL/path 等 ASCII 协议最敏感。

## 3\. 字节映射样例

这些是 PDF 中使用的示例字符，不是唯一可用字符。

| Unicode 字符 | Code point | 低 8 bit | ASCII 结果 | 典型用途 |
| --- | --- | --- | --- | --- |
| `陪` | `U+966A` | `0x6A` | `j` | `.jsp` 文件名绕过 |
| `阮` | `U+962E` | `0x2E` | `.` | 路径穿越 / 点号 |
| `严` | `U+4E25` | `0x25` | `%` | 二次 URL 解析 |
| `灵` | `U+7075` | `0x75` | `u` | `%u002e` 拼接 |
| `丰` | `U+4E30` | `0x30` | `0` | `\u0031` 等 escape 构造 |
| `失` | `U+5931` | `0x31` | `1` | hex digit |
| `甲` | `U+7532` | `0x32` | `2` | hex digit |
| `耳` | `U+8033` | `0x33` | `3` | hex digit |
| `来` | `U+6765` | `0x65` | `e` | `%u002e` 拼接 |
| `㹣` | `U+3E63` | `0x63` | `c` | `class` 绕过 |
| `౬` | `U+0C6C` | `0x6C` | `l` | `class` 绕过 |
| `ᙡ` | `U+1661` | `0x61` | `a` | `class` 绕过 |
| `⑳` | `U+2473` | `0x73` | `s` | `class` 绕过 |
| `瘍` | `U+760D` | `0x0D` | CR | SMTP/HTTP CRLF 注入 |
| `瘊` | `U+760A` | `0x0A` | LF | SMTP/HTTP CRLF 注入 |
| `ō` | `U+014D` | `0x4D` | `M` | Base64 变体 |
| `Ř` | `U+0158` | `0x58` | `X` | Base64 变体 |
| `Ŗ` | `U+0156` | `0x56` | `V` | Base64 变体 |
| `Ŭ` | `U+016C` | `0x6C` | `l` | Base64 变体 |

## 4\. 攻击成立条件

Ghost Bits 不是单点 bug，通常需要链路上存在解释差：

1.  输入允许非 ASCII Unicode 字符进入 Java `String`。

2.  前置校验、WAF、鉴权过滤器、业务规则基于原始 Unicode 字符串判断。

3.  下游组件把字符静默截断为低 8 bit，或宽松解析 `%xx`、`\uXXXX`、base64、协议行。

4.  截断后的字节形成敏感 token：`..`、`.jsp`、`class`、`Runtime`、CRLF、JSON key、Redis fragment、XML tag 等。

5.  安全判断发生在最终规范化之前，或不同层使用不同解码器。

常见危险结构：

```latex
raw input -> WAF/check sees harmless Unicode
          -> parser/cast/decoder projects to ASCII
          -> sink executes canonical dangerous form
```

## 5\. WAF / Parser 绕过案例

### 5.1 BCEL Ghost Bits

相关点：Apache BCEL 的 `Utility#decode()` / `ClassLoader#createClass()` 链路。

slide 中的关键代码结构：

```java
char[] chars = s.toCharArray();
CharArrayReader car = new CharArrayReader(chars);
JavaReader jr = new JavaReader(car);
ByteArrayOutputStream bos = new ByteArrayOutputStream();

while ((ch = jr.read()) >= 0) {
    bos.write(ch); // Ghost Bits 注入点
}
```

风险：`ByteArrayOutputStream#write(ch)` 最终只保留低 8 bit。`$$BCEL$$...` 字符串可用高位字符伪装，使 WAF 看不到典型 BCEL payload，但 BCEL 解码后仍进入类加载流程。

技能开发关注点：

-   检查 `ClassLoader`、BCEL、动态字节码加载、反序列化黑名单绕过。

-   对 `write(int)` 的参数来源做数据流追踪，尤其是 `Reader.read()`、`String.charAt()`、escape 解码器输出。

### 5.2 Jackson `\u` escape / `charToHex`

关键模式：

```java
public static int charToHex(int ch) {
    return sHexValues[ch & 255];
}
```

示例：`\u丰丰耳失` 被解释为 `\u0031`，因为：

```latex
丰 U+4E30 -> 0x30 -> '0'
丰 U+4E30 -> 0x30 -> '0'
耳 U+8033 -> 0x33 -> '3'
失 U+5931 -> 0x31 -> '1'
```

风险：WAF 看到大量 Unicode，不匹配 SQL 关键字；Jackson 解析后字段值可变成 `1 union select 1,2,3--` 这类危险字符串。

技能开发关注点：

-   审计 JSON escape 解析器是否只接受 ASCII hex digit。

-   检测 `\u` escape 中出现非 ASCII 字符的输入。

-   对“WAF 看到的 JSON”和“业务 parser 看到的 JSON”做差分解析。

### 5.3 fastjson `\u` escape

slide 展示 fastjson 某路径中使用：

```java
Integer.parseInt(new String(new char[]{c1, c2, c3, c4}), 16)
```

风险点：`Integer.parseInt` 底层依赖 `Character.digit()`，会接受多个书写系统中的 Unicode 数字。示例中 Vai、Thai、Punjabi 数字被解析为 hex digit，构造 `\u0040` 得到 `@`，从而把看似不含 `@type` 的 JSON 变成可触发反序列化类型解析的 JSON。

这类问题不是典型“低 8 bit 丢弃”，但属于同一类 **输入表示和解析器实际语义不一致** 的 Cast Attack/规范化绕过。

### 5.4 fastjson `\x` escape

关键代码形态：

```java
case 'x':
    char x1 = this.ch = this.next();
    char x2 = this.ch = this.next();
    int x_val = digits[x1] * 16 + digits[x2];
    char x_char = (char) x_val;
    hash = 31 * hash + x_char;
    this.putChar(x_char);
```

示例：`{"\x4_type": ...}` 中 `x1='4'`，`x2='_'`，`digits['_']` 默认为 0，结果为 `0x40`，即 `@`。WAF 不匹配 `@type`，parser 还原为 `@type`。

技能开发关注点：

-   检查 hex 表是否对非法字符返回默认 0。

-   对 `\x`、`\u`、URL `%xx` 等 escape 做 ASCII-only 验证。

### 5.5 Tomcat 文件上传绕过

相关点：`filename*=` / RFC 2231 解码，`RFC2231Utility.fromHex()`。

关键代码：

```java
private static byte[] fromHex(final String text) {
    final ByteArrayOutputStream out = new ByteArrayOutputStream(text.length());
    for (int i = 0; i < text.length();) {
        final char c = text.charAt(i++);
        if (c == '%') {
            final byte b1 = HEX_DECODE[text.charAt(i++) & MASK];
            final byte b2 = HEX_DECODE[text.charAt(i++) & MASK];
            out.write((b1 << 4) | b2);
        } else {
            out.write((byte) c); // Ghost Bits
        }
    }
    return out.toByteArray();
}
```

示例：`filename*="UTF-8''1.陪sp"`。

```latex
WAF sees:    1.陪sp
Server sees: 1.jsp
陪 U+966A -> low byte 0x6A -> 'j'
```

风险：前置层认为不是 `.jsp`，服务端保存为 `.jsp`，形成 WebShell 上传绕过。

### 5.6 URL / Path 解码绕过

PDF 给出多个组件示例：

-   Spring：`StringUtils.uriDecode("1u%65.陪sp", UTF_8)` -> `1ue.jsp`

-   Jetty：`URIUtil.decodePath("1ue%2>sp")` -> `1ue.jsp`

-   Undertow：`URLUtils.decode("1ue\u2e6asp", "UTF-8", false, false, sb)` -> `1ue.jsp`

-   Vert.x：`RFC3986.decodeURIComponent("1ue%2e.陪sp", true)` -> `1ue.jsp`

Jetty `%2>` 的关键在于宽松 hex 转换，`>` 被折叠为 hex `E`，所以 `%2>` 变成 `%2e`，即 `.`。

### 5.7 JDK 内部 Base64 解码绕过

受影响的历史/内部 decoder：

-   `sun.misc.BASE64Decoder`

-   `com.sun.xml.internal.messaging.saaj.util.Base64`

-   `com.sun.org.apache.xml.internal.security.utils.Base64`

关键模式：

```java
pem_convert_array[decode_buffer[i] & 255]
```

示例：`ōŘŖŬ` 低 8 bit 后成为 `MXVl`，base64 解码结果为 `1ue`。

技能开发关注点：

-   审计 base64 decoder 是否接受非 ASCII 字符并通过 `& 255` 查表。

-   测试 decoder 对非 ASCII 输入应拒绝，而不是低位投影。

## 6\. CVE / 真实漏洞案例

### 6.1 GeoServer CVE-2024-36401 绕过

slide 展示的绕过思路：WAF 检查原始 URL 中的 `Runtime` 或 `Ru%6[eE]time`，而 Jetty 把 `%6>` 解码为 `%6e`，最终得到 `n`。

关键差异：

```latex
WAF sees:    Ru%6>time
Jetty sees:  Runtime
```

攻击链：

```latex
attacker sends URL with Ru%6>time
WAF regex does not match Runtime / Ru%6[eE]time
Jetty URL decode maps %6> -> n
GeoServer expression receives Runtime.getRuntime()
```

技能开发关注点：

-   做 URL 解码差分：raw URL、WAF normalize、server normalize、application parser normalize。

-   对 `%xx` 中非 ASCII hex / 非法 hex 的处理必须一致且严格。

### 6.2 Spring4Shell WAF 绕过

目标关键字：`class`。

Ghost Bits 字符串：

```latex
㹣౬ᙡ⑳⑳ -> class
```

映射：

```latex
㹣 U+3E63 -> 0x63 -> c
౬ U+0C6C -> 0x6C -> l
ᙡ U+1661 -> 0x61 -> a
⑳ U+2473 -> 0x73 -> s
⑳ U+2473 -> 0x73 -> s
```

slide 中对比：

```latex
Original: Content-Disposition: form-data; name=".module.classLoader..."
WAF:      Pattern 'class' matched -> blocked

Ghost:    Content-Disposition: form-data; name*=utf-8''...㹣౬ᙡ⑳⑳Loader...
WAF:      no literal class -> pass
Server:   after low-byte projection -> classLoader...
```

### 6.3 Openfire CVE-2023-32315 认证绕过

背景：Openfire Admin Console 使用 `AuthCheckFilter` 做访问控制。若请求路径匹配 exclusion list，例如 `setup/setup-*`，`doExclude` 被置为 true，后续认证检查被跳过。

传统绕过：`/setup/setup-s/%u002e%u002e/%u002e%u002e/log.jsp`。过滤器只检查 `..` 和 `%2e`，不识别 `%u002e`；底层 Jetty 支持 `%u` 解码，最终规范化为 `/log.jsp`。

Ghost Bits 进阶绕过：

```latex
/setup/setup-s/%2>%2>/%2>%2>/log.jsp
```

Jetty `TypeUtil#convertHexDigit` 的宽松算法会把 `>` 当作 hex `E`：

```latex
'>' ASCII 0x3E
0x3E & 0x1f = 30
0x3E >> 6 = 0
30 + (0 * 25) - 16 = 14 = 0xE
%2> -> %2e -> '.'
```

攻击链：

```latex
WAF / AuthCheckFilter sees %2> as invalid/noise
Openfire exclusion rule still permits setup/setup-* path
Jetty decodes and canonicalizes %2>%2> to ..
request reaches admin resource without normal auth
```

### 6.4 Spring CVE-2025-41242 任意文件读取

PDF 关联 GitHub PR #34673，修复点是 `StringUtils.uriDecode` 的 hex 解码逻辑。

关键问题：`char` 是 16 bit，但 `baos.write` 只写低 8 bit。示例 payload：

```latex
阮严灵丰丰甲来 -> .%u002e
```

映射：

```latex
阮 U+962E -> '.'
严 U+4E25 -> '%'
灵 U+7075 -> 'u'
丰 U+4E30 -> '0'
丰 U+4E30 -> '0'
甲 U+7532 -> '2'
来 U+6765 -> 'e'
```

绕过核心：时间差和双重解析。

```latex
Spring ResourceHttpRequestHandler#getResource:
    isInvalidPath(path) checks literal "../"
    path "/.%u002e/" has no "../" -> allowed

later PathResource#resolve / container path handling:
    %u002e becomes "."
    collapsed path becomes "../" or "../../"
```

### 6.5 SMTP Injection: CVE-2025-7962 / Angus Mail

关键点：SMTP 是 ASCII 行协议。若邮件库把 `String` 中的字符强制 cast 成 byte，则用户输入中的 Ghost Bits 可以变成 CRLF，提前结束当前 SMTP 命令并插入新命令。

典型危险实现可简化为：

```java
byte[] bytes = new byte[s.length()];
for (int i = 0; i < s.length(); i++) {
    bytes[i] = (byte) s.charAt(i);
}
```

CRLF 映射：

```latex
瘍 U+760D -> 0x0D -> \r
瘊 U+760A -> 0x0A -> \n
```

抽象攻击效果：

```latex
application sees: attacker[Ghost CRLF]DATA[Ghost CRLF]Subject: ...
SMTP sees:
    RCPT TO:<attacker@example.com>
    DATA
    Subject: ...
    ...
    .
    QUIT
```

供应链影响：Angus Mail 是 Java 生态基础邮件库，上游应用只要允许用户控制邮箱地址或邮件头相关字段，并由后端发送邮件，就可能触发底层截断。

### 6.6 Jira 系统邮件劫持

PDF 案例：Jira v9.12.16。

攻击链：

```latex
attacker registers account
attacker inputs Ghost Bits payload in email address
Jira backend sends registration confirmation email
mail library casts payload to bytes
SMTP injection changes recipient/content
victim receives email from official Jira sender
SPF/DKIM/DMARC all appear valid because sender infrastructure is legitimate
```

影响：把系统邮件通道变成官方钓鱼发送器。

### 6.7 Confluence 域名限制绕过

场景：管理员只允许 `@company.com` 邮箱注册。

差异：

```latex
Application validation sees: hacker[GhostBits]@company.com
suffix check passes:          endsWith("@company.com")
SMTP transport sees:          injected RCPT TO:<attacker mailbox>
```

影响：攻击者无需拥有企业邮箱，也能接收确认邮件并完成注册。

### 6.8 Apache HttpClient Header CRLF / 请求走私

相关漏洞：`HTTPCLIENT-1974` / `HTTPCLIENT-1978`，影响 Apache HttpClient `<= 4.5.9`。关键类：`org.apache.http.util.ByteArrayBuffer`。

问题：旧版本构建 HTTP header 时会把字符数组盲目 cast 到 bytes。如果应用把用户 token 写入请求头，就可能通过 Ghost Bits 注入 CRLF。

示例效果：

```latex
Java application header:
X-Auth-Token: 1\u760D\u760APOST /newRequest...

Backend receives:
X-Auth-Token: 1
POST /newRequest HTTP/1.1
Host: target.com
```

结果：前端代理看到一个请求，后端因 CRLF 截断/拼接看到两个请求，形成请求走私。

### 6.9 JDK Native HttpServer Response Header 注入 / XSS

PDF 记为 CVE-2026-21933。场景：`com.sun.net.httpserver.HttpServer` demo 把 URL query 直接反射进响应 header。

调用链：

```latex
sun.net.httpserver.HttpExchangeImpl#sendResponseHeaders
sun.net.httpserver.ExchangeImpl#sendResponseHeaders
sun.net.httpserver.ExchangeImpl#write
```

风险：`瘍瘊` 被 cast 为 `\r\n`，可注入新的响应头、空行和 HTML body：

```latex
Custom-Header: Cu瘍瘊
Content-Type: text/html瘍瘊
Content-Length: ...瘍瘊
瘍瘊
<script>...</script>

```

影响：响应拆分和 XSS。

## 7\. 自动发现与新案例

PDF 提到工具/方法论：Secrux，用于捕获“野生 Ghost Bits”。可抽象为静态模式 + 差分测试。

### 7.1 静态搜索入口

优先 grep / AST 模式：

```latex
(byte) ch
ch & 255
ch & 0xff
0xff & ch
DataOutputStream.writeBytes
OutputStream.write(int)
StringBufferInputStream.read
String.getBytes(int, int, byte[], int)
RandomAccessFile.writeBytes
URLDecoder.decode
writeByte((byte) value.charAt(i))
```

示例 `rg` 查询：

```bash
rg -n "\(\s*byte\s*\)\s*[^;]+|&\s*(0x[fF]{2}|255)|writeBytes\s*\(|StringBufferInputStream|\.writeByte\s*\(|\.write\s*\(\s*[^)]*charAt\s*\(" --glob '*.java'
```

后续 skill 不应只做文本匹配，还需要判断：

-   被 cast 的值是否来自用户可控 `String`、HTTP request、header、path、JSON、mail field、数据库字段等。

-   cast 结果是否进入协议、路径、文件名、header、命令、class loading、parser、template、cache key。

-   cast 前是否已有安全判断，cast 后是否发生语义变化。

### 7.2 ActiveJ HTTP CRLF

Secrux 发现 ActiveJ `/cookie` 相关 HTTP CRLF 风险。笔记中只保留方向：检查 cookie/header 构建路径中是否存在 `char -> byte` 截断，尤其是用户可控 cookie name/value。

### 7.3 Lettuce Redis StringValue

关键代码：

```java
static void writeString(ByteBuf target, String value) {
    target.writeByte('$');
    IntegerArgument.writeInteger(target, value.length());
    target.writeBytes(CRLF);
    for (int i = 0; i < value.length(); i++) {
        target.writeByte((byte) value.charAt(i));
    }
    target.writeBytes(CRLF);
}
```

风险：Redis RESP bulk string 中，`value.length()` 使用 Java 字符数，循环每个 char 写一个低 8 bit 字节。若上游把 JSON、Lua、命令片段或业务字符串写入 Redis，Ghost Bits 可把看似普通 Unicode 变成 `,"target":"flag{test}"} //` 这类注入片段。

### 7.4 XMLWriter Ghost Tag Key

示例：

```latex
input XML:      <陪>1ue</陪>

parser/output:  <j>1ue</j>

```

风险：XML tag/key 在序列化或写出时发生低位投影，导致安全策略检查的 tag 和实际 parser 看到的 tag 不一致。

### 7.5 Jodd Ghost Path

示例：

```latex
input:  file:///ťŴţ%2fŰšųųŷŤ
output: file:///etc/passwd
```

风险：路径组件通过 Ghost Bits 投影为敏感本地路径，结合 URL/path 解析形成任意文件读取。

## 8\. 修复原则

### 8.1 严格拒绝非 ASCII，而不是静默截断

对 HTTP/SMTP/Redis/URL percent/hex/base64 等 ASCII 协议，安全默认应是：

```java
if (c > 0x7f) {
    throw new IllegalArgumentException("non-ASCII character is not allowed here");
}
```

如果必须编码为 ASCII，使用 `CharsetEncoder` 并设置 `CodingErrorAction.REPORT`。不要依赖 `String.getBytes(StandardCharsets.US_ASCII)` 的默认替换行为，替换为 `?` 也可能产生二义性。

### 8.2 Hex / percent 解码必须 ASCII-only

不要使用会接受 Unicode 数字的宽松 API 作为 URL/JSON hex 的唯一判断。应显式限制：

```latex
0-9, A-F, a-f
```

非法字符应报错，而不是映射成 0 或用位运算折叠成合法 nibble。

### 8.3 安全检查必须发生在最终规范化之后

路径、URL、文件名、JSON key、header 值至少要保证：

```latex
decode/normalize exactly as downstream will see it
then validate
then use the same canonical value
```

不要在 raw input 上做黑名单后，再把 raw input 交给另一个 parser 重新解释。

### 8.4 CRLF 防护要做前后两次

对 header/mail/SMTP/HTTP response：

-   输入阶段拒绝 `\r`、`\n`、控制字符。

-   解码/规范化/字符集转换后再次拒绝。

-   不要把用户输入直接拼入协议行。

-   使用维护良好的库 API，并确认版本修复了历史 CRLF/Ghost Bits 问题。

### 8.5 WAF / 网关策略

WAF 不能只看原始字符串。建议：

-   增加低 8 bit 投影视图：对非 ASCII BMP 字符计算 `c & 0xff` 后再做上下文检测。

-   对 `%xx`、`\uXXXX`、base64、multipart filename\*、path segment 做差分规范化检测。

-   对含大量非 ASCII 且低位组成敏感 token 的请求加权。

-   注意误报：中文、日文等正常内容也可能含有低位敏感字节，规则应绑定上下文，例如文件名、路径、header、JSON key、协议字段。

## 9\. 回归测试设计

每个修复点至少设计三类测试：

1.  正常 ASCII 输入仍工作。

2.  非 ASCII Ghost Bits 输入被拒绝，或被安全编码后不会变成危险 token。

3.  安全检查与最终 parser 的结果一致。

示例测试维度：

```latex
target byte: '.', '/', '%', 'u', '0'-'9', 'A'-'F', CR, LF, '@', ':', '"', '{', '}'
context: path, filename, JSON escape, header, SMTP address, Redis value, XML tag
assertion:
    raw view != canonical view 时，系统必须拒绝或记录高危
    不允许 silent truncation
```

