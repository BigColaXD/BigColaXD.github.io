---
title: Automated_AI_Red_Teaming_at_Scale
date: 2026-03-23 08:27:07
updated: 2026-03-23 08:27:28
tags:
  - AI
  - AI安全
  - 靶场
---
# Module 7：规模化自动化 AI 红队 — 学习笔记

> **课程来源**：[AIRT Academy — Module 7: Automated AI Red Teaming at Scale](https://0x4d31.github.io/airt/module7.html)  
> **主题**：用 **garak**、**PyRIT**、**promptfoo** 编排大规模对抗测试，并与 **CI/CD** 结合，在发布前捕获回归。

---

## 目录

1.  [为何不能只靠手工测试](#1-为何不能只靠手工测试)

2.  [garak 要点](#2-garak-要点)

3.  [PyRIT 要点](#3-pyrit-要点)

4.  [promptfoo 要点](#4-promptfoo-要点)

5.  [攻击数据集与种子提示](#5-攻击数据集与种子提示)

6.  [攻击策略选择](#6-攻击策略选择)

7.  [评分与响应评估](#7-评分与响应评估)

8.  [多轮攻击编排](#8-多轮攻击编排)

9.  [转换器链（Converter Chains）](#9-转换器链converter-chains)

10.  [AI 安全基准](#10-ai-安全基准)

11.  [CI/CD 集成](#11-cicd-集成)

12.  [可执行报告](#12-可执行报告)

13.  [自定义 Probe](#13-自定义-probe)

14.  [工具对比与组合](#14-工具对比与组合)

15.  [持续测试项目](#15-持续测试项目)

---

## 1\. 为何不能只靠手工测试

### 维度与成本

-   生产对话应用输入空间近乎无限；对抗性变体随技术增长**组合爆炸**。

-   手工假设：每小时约 50 条独特攻击、200 个风险面 → 单次全面扫荡需 **200+ 人时**；且未计入模型更新、编码变体、多轮对话。

### 研究数据（课程引用）

| 指标 | 数值（示意） |
| --- | --- |
| 自动化攻击成功率 | 约 **69.5%** |
| 手工攻击成功率 | 约 **47.6%** |
| 红队使用自动化的比例 | 仅约 **5.2%**（机会大） |
| 多轮越狱（小模型，5 轮内） | 约 **97%** 成功（Giskard GOAT 等研究语境） |

### 模型更新问题

-   微调、RLHF、系统提示、换基座等会**静默改变**对抗下的行为；上月修好的洞可能回归；新编码（如 ROT13）未测则可能失守。

-   **无自动化回归套件** → 往往由用户或公开披露才发现问题。

### 推荐工作流（如微软 AI 红队思路）

1.  **先手工**：发现与本应用、威胁模型相关的新模式。

2.  **再编码**：种子提示、Probe 类、评估量表固化进自动化。

3.  **持续跑**：每次模型更新、PR、定时任务。

4.  **人审边界**：自动打分处理大头；模糊/新型失败由人复核。

### 核心洞见

-   自动化目标不是穷尽所有漏洞，而是对**已知漏洞类**做到 **可靠、可重复、规模化**；新攻击仍依赖人，**人机结合**才覆盖全面。

---

## 2\. garak 要点

**定位**：NVIDIA 开源 LLM 漏洞扫描框架（类比面向 LLM 的“结构化探测工具集”）。

### 架构五件套

| 组件 | 作用 |
| --- | --- |
| **Generators** | 对接 OpenAI 兼容 API、HF、Ollama、REST 等，统一“发 prompt、收回复”。 |
| **Probes** | 具体攻击策略 + 对抗提示列表。 |
| **Detectors** | 判断回复是否触发目标失效模式（关键词到 ML 分类器）。 |
| **Buffs** | 发送前对载荷变换（Base64、ROT13、Unicode 等），类似其他框架的 converter。 |
| **Harness** | 编排：默认 `probewise` 逐 probe 跑，产出结构化结果。 |

### 常用命令（概念）

-   安装：`pip install -U garak`（Python 3.10–3.12）。

-   列出 probe/generator：`python -m garak --list_probes` 等。

-   运行：指定 `--model_type`、`--model_name`、`--probes`、`--eval_threshold`、`--report_prefix` 等。

### Probe 类别速查（课程表格摘要）

| 模块 | 测试重点 | 风险大类 |
| --- | --- | --- |
| dan | DAN 等越狱变体 | 越狱 / 对齐 |
| promptinject | 覆盖系统指令 | 提示注入 |
| encoding | Base64/ROT13/hex 等 | 过滤绕过 |
| leakreplay | 记忆与回放 | 数据泄露 |
| xss | 输出中的 XSS | 注入 |
| realtoxicityprompts / continuation | 毒性续写 | 毒性 |
| snowball / misleading | 幻觉、错误信息 | 幻觉 / 虚假信息 |
| malwaregen | 恶意代码诱导 | 恶意软件 |
| packagehallucination | 虚构包名 | 供应链 |
| lmrc / atkgen / gcg / glitch | 广覆盖、自适应、对抗后缀、异常 token | 多类 |

### 结果解读

-   **FAIL**：该 probe 在 `eval_threshold` 以上比例触发 detector 判定的失效 → 报告中的比例可视为该 probe 的 **ASR（攻击成功率）** 思路。

-   报告常按 ASR 排序，优先看最易利用向量。

---

## 3\. PyRIT 要点

**定位**：微软开源 **可编程** 红队平台（Azure AI Red Teaming Agent 等实践的基础），适合自定义战役而非仅“一键扫描”。

### 核心概念

| 概念 | 说明 |
| --- | --- |
| **Targets** | 包装任意“提示进、回复出”的端点（Azure OpenAI、OpenAI、Ollama、HF、REST）。异步接口如 `send_prompt_async`。 |
| **Orchestrators** | 单轮：`PromptSendingOrchestrator`；多轮：`CrescendoOrchestrator`、`PairOrchestrator`、`TreeOfAttacksWithPruningOrchestrator` 等。 |
| **Converters** | 发送前编码/混淆，可 **链式** 组合。 |
| **Scorers** | 子串、分类器、**LLM-as-judge**（如 `SelfAskTrueFalseScorer`、`SelfAskLikertScorer`）。 |
| **Memory** | 默认 DuckDB 等持久化对话与分数，支撑多轮与事后分析。 |

### 典型用法（概念）

-   `initialize_pyrit(memory_db_type=IN_MEMORY | DUCKDB)`。

-   组装 `OllamaChatTarget` / `HTTPTarget`（`{PROMPT}` 占位）。

-   Orchestrator + `send_prompts_async` 或 `run_attack_async(objective=...)`。

---

## 4\. promptfoo 要点

**定位**：**YAML 驱动** 的红队与评估，**Web 报表**友好，适合工程团队与 CI。

### 特点

-   `promptfoo redteam init` 生成配置；`redteam run`、`promptfoo view`（如本地 `15500`）看仪表盘。

-   内置插件与报告可对齐 **OWASP LLM Top 10**、**NIST AI RMF**、**MITRE ATLAS**。

-   CI：`--ci`、非零退出码；`--pass-rate-threshold`；JUnit 导出等。

### 配置要素（概念）

-   `targets`：多模型并行对比。

-   `redteam.purpose`：系统用途描述越细，生成的上下文相关攻击越好。

-   `plugins`：提示注入、越狱、PII、有害内容、合同/承诺、竞品、过度自主、RBAC、自定义 policy 等。

-   `strategies`：crescendo、base64、rot13、复合越狱、TAP、注入后缀等。

-   `language`：多语言覆盖。

---

## 5\. 攻击数据集与种子提示

### 有效种子的四性

1.  **目标清晰**：一次一个危害目标。

2.  **贴合场景**：在用户 plausible 语境下（如“护士问用药”比裸请求更贴近真实绕过）。

3.  **别过度打磨**：留空间给自动化扩写/变异。

4.  **类目齐全**：注入、越狱、外泄、毒性、虚假信息、过度自主、领域特有风险等。

### 可引用的公开集（课程列举）

-   **AdvBench**：有害指令基线，论文常报 ASR。

-   **HarmBench**：7 大类语义 + 标准攻击基线，便于横向对比。

-   **JBB-Behaviors（JailbreakBench）**：100 类滥用行为 + 标准 judge。

-   **WMDP**：生化、网络等危险知识向。

### 广度 vs 深度

-   **广**：多类目、每类少量 → 适合初扫与 CI 门禁。

-   **深**：少类目、多变体 → 适合针对已知漏洞的专项战役。

---

## 6\. 攻击策略选择

### 策略类型

-   **直接攻击**：建立基线 ASR。

-   **编码/混淆**：Base64、ROT13、Unicode 易混字符、leet、摩斯、二进制等 → 测过滤与分类器是否只看明文表面。

-   **多轮**：利用上下文逐步升级或建立叙事。

-   **越狱模板**：DAN、开发者模式、虚构框架等。

### 顺序建议

-   **先直接，再编码/多轮**：若直接请求就失败，优先修对齐与策略；再测复杂绕过才有意义。

### 目标 → 策略速查（课程矩阵摘要）

| 目标 | 策略倾向 | 工具倾向 |
| --- | --- | --- |
| 基线安全 | 直接 | garak 全量 / promptfoo 标准插件 |
| 过滤绕过 | 编码 | garak encoding、PyRIT converters、promptfoo strategies |
| 对齐韧性 | DAN、复合越狱 | garak dan、promptfoo jailbreak |
| 护栏持续性 | Crescendo、PAIR | PyRIT 多轮 orchestrator |
| 系统提示窃取 | 直接/角色/续写 | garak leakreplay、promptinject |
| Agent 数据外泄 | 间接注入、工具滥用 | PyRIT HTTP、promptfoo excessive-agency |
| 回归 | 归档成功攻击重放 | 三者皆可 |

---

## 7\. 评分与响应评估

### 方法对比

| 方法 | 优点 | 缺点 |
| --- | --- | --- |
| **规则** | 快、可解释 | 易漏（先道歉再给有害内容）或误报 |
| **LLM judge** | 覆盖 nuanced 情况 | judge 自身不可靠、需版本记录 |
| **分类器** | 大规模、低延迟 | 领域偏移、阈值需调 |
| **人工** | 权威 | 贵 → 用于分歧、严重、低置信 case |

### 实践建议

-   **多 scorer 组合**（规则 + judge + 可选分类器）。

-   对 **critical** 或 judge 置信 < 阈值的结果进人审队列（如 24h 内）。

---

## 8\. 多轮攻击编排

-   **Crescendo**：从无害话题逐步升级到有害目标，拒绝则回溯换路径。

-   **PAIR**：攻击 LLM 根据目标回复与 judge 反馈 **迭代改写** jailbreak。

-   **TAP（Tree of Attacks with Pruning）**：多分支生成，judge 剪枝，减少局部最优。

**要点**：单轮拒答 ≠ 安全；生产应测多轮与上下文漂移。

---

## 9\. 转换器链（Converter Chains）

-   PyRIT 中 converters **从左到右**依次作用（例：ROT13 → Base64）。

-   链式组合可模拟多层过滤下的绕过。

-   自定义：继承 `PromptConverter`，实现 `convert_async`；`is_one_to_one_converter` 标明是否确定性。

**内置类型（课程列举）**：Base64、ROT13、Unicode 易混、字符间插空格、Leet、摩斯、二进制、后缀追加、Atbash、StringJoin 等。

---

## 10\. AI 安全基准

| 基准 | 要点 |
| --- | --- |
| **CVE-Bench** | 智能体对真实 Web CVE 的利用能力；课程称 one-day 设置下 SOTA 成功率仍低，侧重“进攻 AI 能力”评估。 |
| **HarmBench** | 标准化红队框架，7 大类 + 多种攻击基线，便于比模型与防御。 |
| **AdvBench** | 500 条有害指令类基线；若 ASR 仍高说明主对齐问题。 |
| **JBB-Behaviors** | 与前沿 jailbreak 对比更直接。 |

### ASR 粗解读（课程表格）

| ASR | 含义与动作方向 |
| --- | --- |
| 0–5% | 主防线较强 → 重点测多轮、编码 |
| 5–20% | 部分模式可乘 → 针对性修补 |
| 20–50% | 防线不稳 → 需系统性安全微调/策略 |
| 50%+ | 严重 → 不宜上线，需基础对齐工作 |

### 基准局限

-   训练污染、分布偏移、与真实应用（系统提示、工具、RAG）脱节、**judge 偏差**。

**实践**：标准基准要跑，但必须加 **应用专属** 测试集。

---

## 11\. CI/CD 集成

### 原则

-   **快反馈**：PR 门禁子集，目标如 <10 分钟；全量可夜间。

-   **确定性种子**：减少 flaky。

-   **结构化输出**：JSON、JUnit 便于平台展示。

-   **阈值而非 0%**：按风险接受度设 ASR/通过率门槛。

### 分层示例（课程思路）

-   **Job1**：garak 关键 probe + 严格 threshold + artifact。

-   **Job2**：promptfoo + JUnit + PR 展示。

-   **Job3**：夜间全量 garak + PyRIT 脚本 + promptfoo 全配置 + 汇总/通知。

---

## 12\. 可执行报告

### 建议结构

1.  **执行摘要**：红黄绿、Top 3 发现、与上次对比、首要行动。

2.  **方法**：工具版本、目标模型、覆盖范围、样本量、评分方法。

3.  **漏洞目录**：ID、OWASP 映射、严重度、ASR、复现步骤、示例回复（脱敏）、根因、修复建议。

4.  **按类 ASR 表**。

5.  **修复路线图**（优先级、owner、工作量）。

### 严重度与 ASR 关联（课程框架）

-   **Critical**：如 ASR >50%、可直接造成现实危害等 → 阻止发布。

-   **High / Medium / Low**：逐级放宽，配 SLA（如高优先级发版前、中 30 天、低 90 天等）。

---

## 13\. 自定义 Probe

**场景**：电商退款、医疗建议、金融操纵、代码栈相关不安全输出等 → 通用库覆盖不到。

**garak**：Probe 继承 `garak.probes.base.Probe`，定义 `prompts`、`recommended_detectors`、`tags` 等；Detector 继承 `garak.detectors.base.Detector`，实现 `detect`，返回每条约 0/1 或连续分数。

**运行**：通过模块路径指定 `--probes custom_module.ClassName`、`--detectors package.DetectorName`。

---

## 14\. 工具对比与组合

### 一句话分工

| 工具 | 最适合 |
| --- | --- |
| **garak** | 广谱 CLI 扫描、多版本模型对比、shell/CI 友好 |
| **PyRIT** | 多轮战役、converter 链、复杂打分与记忆、HTTP/Agent 向 |
| **promptfoo** | YAML + 仪表盘、合规映射、工程团队自助、CI 报告体验 |

### 组合流程（课程示例）

1.  garak 广扫 → 2. 对失败类用 PyRIT 深挖 → 3. promptfoo 出合规映射报告给干系人。

---

## 15\. 持续测试项目

### 成熟度（1–5 级）

从 **临时手工** → **定时扫描** → **CI 门禁+归属** → **持续监控+KPI+SLA** → **事件→新 probe→威胁情报闭环**。

### 节奏建议

-   每 PR：快门禁。

-   每次部署：标准全量或对比基线。

-   每周：编码+多轮+人审新失败。

-   每月：基准子集+自定义集。

-   每季：人工红队 + 合规报告。

-   按需：新越狱论文、线上事故、大版本模型、依赖 CVE、夜间 ASR 陡增等。

### KPI 示例

-   ASR（关键类 <5% 等）、OWASP 覆盖、MTTR、回归率、误报率、每日执行 unique 提示数、人审队列长度。

### 角色

-   红队负责人、安全工程（工具与 CI）、ML 工程（对齐与指标）、产品（优先级与风险接受）、CISO/安全负责人（阈值与升级）。

### 闭环

**生产/手工发现的新技巧 → 48h 内 seed/probe 化 → 全模型回归 → 修复 → 永久进 CI**；长期可反哺社区（garak / HarmBench 等）。

---

## 延伸阅读（课程链接）

-   [NVIDIA garak（GitHub）](https://github.com/NVIDIA/garak)

-   [Microsoft PyRIT（GitHub）](https://github.com/Azure/PyRIT)

-   [promptfoo Red Team 文档](https://www.promptfoo.dev/docs/red-team/)

-   论文与基准：garak 框架论文、HarmBench、CVE-Bench、Automation Advantage in AI Red Teaming 等（详见原课程页脚）。

---

*笔记整理自 AIRT Module 7 公开课程内容；工具版本与 API 变化快，实操请以官方文档为准。*