// 用 KaTeX（GitHub 使用的数学渲染器）校验 Markdown 里的全部公式。
//
// 用法：
//   npm install katex        # 或 pnpm add katex
//   node tools/check-math.mjs 机器学习名词自学笔记.md
//
// 退出码：0 = 全部公式可渲染；1 = 存在失败的公式（会打印行号与原因）。
//
// 为什么需要它：GitHub 的公式渲染有宏白名单，一旦用了被禁的宏
// （如 \operatorname、\def、\newcommand）或 \left 后跟了非法定界符，
// 页面只会显示一行红色报错，而本地 Markdown 预览看不出问题。

import { readFileSync } from 'node:fs';
import katex from 'katex';

const file = process.argv[2] ?? '机器学习名词自学笔记.md';
const src = readFileSync(file, 'utf8');

// 用 KaTeX 自身的解析器枚举合法定界符，避免手写列表漏项
const VALID = new Set([
  '(', ')', '[', ']', '{', '}', '|', '.', '/',
  '\\{', '\\}', '\\|', '\\lVert', '\\rVert', '\\lvert', '\\rvert',
  '\\langle', '\\rangle', '\\lfloor', '\\rfloor', '\\lceil', '\\rceil',
  '\\backslash', '\\uparrow', '\\downarrow', '\\updownarrow',
  '\\Uparrow', '\\Downarrow', '\\Updownarrow', '\\Vert', '\\vert',
]);

/** 收集全部公式片段：块级 $$...$$ 与行内 $...$ */
function collect(text) {
  const out = [];
  const displayRe = /\$\$([\s\S]*?)\$\$/g;
  let m;
  while ((m = displayRe.exec(text)) !== null) {
    out.push({ tex: m[1], line: text.slice(0, m.index).split('\n').length, display: true });
  }
  const masked = text.replace(displayRe, (s) => ' '.repeat(s.length));
  const inlineRe = /(?<!\$)\$(?!\$)([^\n$]+?)\$(?!\$)/g;
  while ((m = inlineRe.exec(masked)) !== null) {
    out.push({ tex: m[1], line: masked.slice(0, m.index).split('\n').length, display: false });
  }
  return out;
}

/** 把左右定界符归一到同一个规范值，便于配对比较 */
const LEFT_OF = {
  ')': '(', ']': '[', '}': '{',
  '\\rVert': '\\lVert', '\\rvert': '\\lvert',
  '\\rangle': '\\langle', '\\rfloor': '\\lfloor', '\\rceil': '\\lceil',
  '\\}': '\\{', '\\Vert': '\\Vert', '\\vert': '\\vert',
};
const canonical = (d) => LEFT_OF[d] ?? d;

function checkDelimiters(tex) {
  const problems = [];
  // 注意：命令形式必须放在单字符之前匹配，否则 "\rVert" 会被读成 "\r"
  const re = /\\(left|right)\s*(\\[A-Za-z]+|\\[^A-Za-z]|[^A-Za-z\s])/g;
  const stack = [];
  let m;
  while ((m = re.exec(tex)) !== null) {
    const kind = m[1];
    const d = m[2];
    if (d === '\\arrow') continue;            // \leftarrow 的误匹配
    if (!VALID.has(d)) problems.push(`${kind} 后跟着非法定界符 "${d}"`);
    if (kind === 'left') {
      stack.push({ raw: d, canon: canonical(d) });
    } else if (stack.length === 0) {
      problems.push(`多余的 \\right${d}`);
    } else {
      const open = stack.pop();
      if (open.canon !== canonical(d)) {
        problems.push(`\\left/\\right 定界符不匹配（\\left${open.raw} 与 \\right${d}）`);
      }
    }
  }
  for (const o of stack) problems.push(`未闭合的 \\left${o.raw}`);
  return problems;
}

const snippets = collect(src);
const fails = [];
let ok = 0;

for (const s of snippets) {
  const issues = checkDelimiters(s.tex);
  try {
    katex.renderToString(s.tex, { displayMode: s.display, throwOnError: true, strict: false });
  } catch (e) {
    issues.push(String(e.message).split('\n')[0]);
  }
  if (issues.length) fails.push({ ...s, issues });
  else ok++;
}

console.log(`文件            : ${file}`);
console.log(`公式总数        : ${snippets.length}（块级 ${snippets.filter((s) => s.display).length}，行内 ${snippets.filter((s) => !s.display).length}）`);
console.log(`可渲染          : ${ok}`);
console.log(`失败            : ${fails.length}`);

for (const f of fails) {
  console.log('---');
  console.log(`  第 ${f.line} 行 [${f.display ? '块级' : '行内'}]`);
  for (const i of f.issues) console.log(`    · ${i}`);
  console.log(`    tex: ${f.tex.replace(/\s+/g, ' ').slice(0, 150)}`);
}

process.exit(fails.length ? 1 : 0);
