# 机器学习名词自学笔记

按 **L1–L5 层级 × 4 个类别**（machine learning / neural networks / learning methods / others）系统梳理的一张机器学习术语表，逐条给出「直觉 → 解决什么问题 → 核心机制与公式 → 典型用途 → 代表文献 → 易错点」。

## 文件

| 文件 | 说明 |
|---|---|
| [机器学习名词自学笔记.md](机器学习名词自学笔记.md) | 主笔记，14 节，约 1.1 万字 |

## 覆盖内容

- **L1**：K-means、SVM、PCA、决策树、熵、t-SNE、傅里叶变换、GMM、孤立森林、均值漂移、矩阵轮廓、t 检验、CNN（特征图 / 空洞卷积）、RNN/LSTM、ESN、Transformer、AE、MoE
- **L2**：GNN、VAE（信息瓶颈）、GAN、MAE、Koopman 算子、记忆网络、VQ-VAE、RAG、核方法、矩阵分解、Shapelet、DTW、自监督学习、对比学习、Mixup、知识蒸馏
- **L3**：注意力、遗传算法、LoRA 等低秩适配
- **L4**：扩散模型、测试时自适应（TTA）
- **L5**：流匹配（Flow Matching）、MAML 元学习
- **others**：t 检验、Friedman 检验（含 Demšar 2006 推荐的实验对比流程与 CD 图）

## 笔记结构

1. 技术地图（层级依赖链 + 四列视角）
2. L1–L5 逐层名词详解
3. learning methods 汇总
4. 实验方法学
5. 关键文献时间线（1901–2024）
6. 公式速查卡
7. 常见混淆点（14 条，面试/写作易翻车处）
8. 8 周自学路线（每周目标 + 必做实验）
9. 参考与延伸阅读

## 公式速查卡（节选）

```
注意力       : softmax(QKᵀ/√d_k)V
VAE-ELBO     : E_q[log p(x|z)] − KL(q(z|x)‖p(z))
GAN          : min_G max_D E[log D(x)] + E[log(1−D(G(z)))]
LoRA         : h = W₀x + (α/r)·BAx，A~N(0,σ²)、B=0
Diffusion    : x_t = √ᾱ_t x₀ + √(1−ᾱ_t) ε；E‖ε − ε_θ(x_t,t)‖²
Flow Matching: x_t=(1−t)x₀+t x₁，学 v_θ ≈ x₁−x₀
InfoNCE      : −log exp(sim(z,z⁺)/τ) / ∑_j exp(sim(z,z_j)/τ)
MAML         : θ'_i=θ−α∇L_i(θ) ;  θ ← θ−β∇∑_i L_i(θ'_i)
```

## 公式校验（避免 GitHub 渲染报错）

GitHub 的公式渲染器有**宏白名单**，一旦用了被禁的宏（例如 `\operatorname`、`\def`、`\newcommand`），页面只会显示一行红色报错，而本地 Markdown 预览看不出任何问题。仓库内置了一个校验脚本，用 GitHub 同款渲染器 KaTeX 把每个公式编译一遍：

```bash
pnpm install          # 或 npm install，只为装 katex
pnpm run check:math
```

输出示例：

```
公式总数        : 127（块级 103，行内 24）
可渲染          : 127
失败            : 0
```

该脚本会同时检查：

- 每个公式能否被 KaTeX 解析（语法错误、非法命令）；
- `\left` / `\right` 的定界符是否合法且**成对匹配**（含 `\lVert…\rVert`、`\langle…\rangle` 等命令式定界符）；
- 跨行的 `$$...$$` 块与行内 `$...$` 是否都能被正确切分。

**已知局限**：KaTeX 本身允许 `\operatorname`，所以脚本**查不出 GitHub 特有的宏黑名单**。撰写新公式时请只用常见宏，避开下面这些已在 GitHub 上实测失败的命令。本笔记当前使用的宏均已逐个确认可渲染。

## Markdown 书写约定（这几种写法在 GitHub 上实测会出问题）

| 约定 | 说明 |
|---|---|
| **列表项里只用块级公式** | 列表项（`-` 开头）内的行内 `$...$` 在 GitHub 上容易被当成普通文字不渲染。本笔记已把列表项里的公式**全部改成独立块** `$$...$$`，并缩进两格挂在列表项下；符号类（`K`、`C`、`ρ`）直接写成文字。 |
| **公式块后留空行** | 缩进公式块后面若紧跟下一个列表项，需空一行，否则列表可能被截断。 |
| **避开高危宏** | 实测失败：`\operatorname`、`\!`、`\medspace`、`\left\{`、`\left\lVert`、`\left\langle`、`\left|`、`\;`、`\,`、`\ `（反斜杠+空格）。 |
| **改用安全写法** | `\left\{…\right\}` → `\lbrace…\rbrace`；`\left\lVert…\right\rVert` → `\lVert…\rVert`；`\!`/`\,`/`\;`/`\ ` → 普通空格；`\operatorname{softmax}` → `\mathrm{softmax}`；需要间距时用 `\quad` / `\qquad`。 |

命令逐个覆盖测试见 [命令覆盖检查.md](命令覆盖检查.md)，各风险写法的对照见 [渲染自检.md](渲染自检.md)。


## 许可

笔记内容可自由用于学习与教学用途；文中涉及的论文与算法版权归原作者所有。
