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

## 公式校验（避免 GitHub 渲染错误）

> **改公式前先读 [GitHub公式规则.md](GitHub公式规则.md)** —— 那份清单记录了 GitHub 公式渲染的机制与逐条实测结论（尤其是"本地 KaTeX 校验查不出 GitHub 黑名单"这件事）。

仓库内置两个检查脚本，一条命令跑完：

```bash
pnpm install          # 或 npm install，只为装 katex
pnpm run check        # = check:math + check:github
```

- **`check:math`**（`tools/check-math.mjs`）—— 用 KaTeX 把每个公式编译一遍，查语法、括号配平、`\left`/`\right` 配对、块级/行内切分。输出示例：

  ```
  公式总数        : 123（块级 107，行内 16）
  可渲染          : 123
  失败            : 0
  ```

- **`check:github`**（`tools/preflight-github-math.mjs`）—— 查 **GitHub 特有的位置规则与命令黑名单**：公式块是否顶格、前后是否有空行、是否误放在列表项或表格里、是否用了 `\operatorname` / `\medspace` / `\!` / `\,` / `\;` / `\left\命令` 等实测失败的命令。文档里需要故意展示这些写法时，在该行加 `<!-- preflight-allow -->` 跳过检查。

**两个脚本都通过 ≠ GitHub 一定渲染成功**：公式是客户端渲染的，静态抓取页面无法判断，最终仍需在浏览器里强刷确认。需要新增构造时，先加进 [渲染自检.md](渲染自检.md) 或 [命令覆盖检查.md](命令覆盖检查.md) 做对照测试。

原 `check:math` 脚本会同时检查：

- 每个公式能否被 KaTeX 解析（语法错误、非法命令）；
- `\left` / `\right` 的定界符是否合法且**成对匹配**（含 `\lVert…\rVert`、`\langle…\rangle` 等命令式定界符）；
- 跨行的 `$$...$$` 块与行内 `$...$` 是否都能被正确切分。

**已知局限**：KaTeX 本身允许 `\operatorname`，所以脚本**查不出 GitHub 特有的宏黑名单**。撰写新公式时请只用常见宏，避开下面这些已在 GitHub 上实测失败的命令。本笔记当前使用的宏均已逐个确认可渲染。

## Markdown 书写约定（这几种写法在 GitHub 上实测会出问题）

| 约定 | 说明 |
|---|---|
| **公式块一律顶格** | 实测：缩进过的 `$$...$$`（尤其挂在列表项下的 `  $$...$$`）在 GitHub 上不渲染。所有 109 个公式块都在第 1 列，前后各留一个空行。 |
| **列表项里不写公式** | 列表项（`-` 与 `1.` 两类）内的行内 `$...$` 在 GitHub 上容易被当成普通文字不渲染。列表项里的公式**全部改成顶格块**；符号类（`K`、`C`、`ρ`、`ξ_i`）直接写成文字。编号列表已改为项目符号，避免同类问题。 |
| **行内公式只在段落里用** | 段落、引用、说明句里的 `$...$` 渲染正常，目前保留 9 处（如"其中 $W_{\mathrm{out}}$ 是唯一被训练的参数"）。 |
| **避开高危宏** | 实测失败：`\operatorname`、`\!`、`\medspace`、`\left\{`、`\left\lVert`、`\left\langle`、`\left|`、`\;`、`\,`、`\ `（反斜杠+空格）。 |
| **改用安全写法** | `\left\{…\right\}` → `\lbrace…\rbrace`；`\left\lVert…\right\rVert` → `\lVert…\rVert`；`\!`/`\,`/`\;`/`\ ` → 普通空格；`\operatorname{softmax}` → `\mathrm{softmax}`；需要间距时用 `\quad` / `\qquad`。 |

命令逐个覆盖测试见 [命令覆盖检查.md](命令覆盖检查.md)，各风险写法的对照见 [渲染自检.md](渲染自检.md)。


## 许可

笔记内容可自由用于学习与教学用途；文中涉及的论文与算法版权归原作者所有。
