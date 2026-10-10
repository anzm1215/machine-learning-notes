# Math renderer probe

基线（普通括号）:
$$\mathrm{AGG}(h_u) = \sum_{u \in N(v)} h_u$$

变体 A：`\left\lVert ... \right\rVert`
$$\left\lVert x - y \right\rVert^2$$

变体 B：`\lVert ... \rVert`（不带 \left/\right）
$$\lVert x - y \rVert^2$$

变体 C：`\left\| ... \right\|`
$$\left\| x - y \right\|^2$$

变体 D：`\| ... \|`
$$\| x - y \|^2$$

变体 E：`\left\{ ... \right\}`
$$\left\{ h_u : u \in N(v) \right\}$$

变体 F：`\lbrace ... \rbrace`
$$\lbrace h_u : u \in N(v) \rbrace$$

变体 G：`\{ ... \}`（不带 \left/\right）
$$\{ h_u : u \in N(v) \}$$

变体 H：`\left( ... \right)` 内套 `\left\{ ... \right\}`
$$\mathrm{AGG}\!\left(\left\{ h_u \right\}\right)$$

变体 I：负空格 `\!` + `\left(`
$$\mathrm{tr}\!\left(W^\top C W\right)$$

变体 J：`\left\langle ... \right\rangle`
$$\left\langle x, y \right\rangle$$

变体 K：嵌套 `\left(` 两层
$$\mathrm{UPDATE}\!\left(h_v,\ \mathrm{AGG}\!\left(\lbrace h_u \rbrace\right)\right)$$
