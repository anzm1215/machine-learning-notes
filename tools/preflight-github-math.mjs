#!/usr/bin/env node
// GitHub 公式渲染预检（位置规则 + 命令黑名单）
//
// 用法：node tools/preflight-github-math.mjs 机器学习名词自学笔记.md [更多文件...]
// 退出码：0 = 通过；1 = 发现问题
//
// 为什么需要它：KaTeX 本地校验查不出 GitHub 特有的限制——
//   1) GitHub 有一份自己的命令黑名单（\operatorname、\medspace 等）；
//   2) GitHub 对"公式所在的位置"有额外要求（块必须顶格、列表项里不渲染）。
// 这些规则都来自实测，细节见 GitHub公式规则.md。

import { readFileSync } from 'node:fs';

const FORBIDDEN = [
  [/\\operatorname\b/, '\\operatorname 被禁用（用 \\mathrm）'],
  [/\\medspace\b/, '\\medspace 不被支持（用普通空格或 \\quad）'],
  [/\\[!,;](?![A-Za-z])/, '反斜杠+标点（\\! \\, \\;）会掉反斜杠，改用普通空格'],
  [/\\ /, '反斜杠+空格 同上，改用普通空格或 \\quad'],
  [/\\left\s*\\(?!arrow\b)[A-Za-z]+/, '\\left 后不能跟命令型定界符（用 \\lbrace / \\lVert / \\langle）'],
  [/\\left\s*[{}|]/, '\\left{ \\left| 不被接受（用 \\lbrace / \\lVert）'],
  [/\\mathbb\{1\}/, '\\mathbb{1} 非法（用 \\mathbf{1}）'],
  [/\\right\s*\\(?!arrow\b)/, '\\right 后跟命令型定界符，规避'],
  [/\\right\s*[{}|]/, '\\right} \\right| 同上'],
];

const files = process.argv.slice(2);
if (!files.length) {
  console.error('用法: node tools/preflight-github-math.mjs <文件.md> [...]');
  process.exit(2);
}

const INLINE_MATH = /(?<!\$)\$(?!\$)([^\n$]+?)\$(?!\$)/g;
const DISPLAY_LINE = /^( *)(\$\$.*\$\$)\s*$/;
const BULLET = /^(\s*)([-*+]|\d+\.)\s+/;

let totalProblems = 0;

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const problems = [];
  const add = (line, kind, detail) => problems.push({ line, kind, detail });

  let inFence = false;
  let inMathBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNo = i + 1;
    const trimmed = raw.trim();

    // 代码围栏内不检查
    if (/^\s*(```|~~~)/.test(raw)) { inFence = !inFence; continue; }
    if (inFence) continue;

    // 跨行的 $$ 块（单独的 $$ 行）
    if (trimmed === '$$') {
      if (!inMathBlock) {
        if (/^ /.test(raw)) add(lineNo, '缩进公式块', '块开始符 $$ 顶格（缩进会让 GitHub 不渲染）');
        if ((lines[i + 1] ?? '').trim() === '') add(lineNo, '空块', '$$ 后面紧跟空行');
      }
      inMathBlock = !inMathBlock;
      continue;
    }
    if (inMathBlock) continue;

    // 去掉行内代码，避免把 `$$...$$` 这类示例当成真公式
    const noCode = raw.replace(/`[^`]*`/g, (s) => ' '.repeat(s.length));

    // 文档里"故意展示"高危写法时，可在该行加 HTML 注释标记跳过检查
    if (/<!--\s*preflight-allow\s*-->/.test(raw)) continue;

    // 单行 $$...$$
    const dm = DISPLAY_LINE.exec(noCode);
    if (dm) {
      if (dm[1].length > 0) add(lineNo, '缩进公式块', `公式块前有 ${dm[1].length} 个空格，必须顶格`);
      // 前一行必须是"块边界"：空行、标题、分隔线、另一个公式块，或列表/引用块。
      // 普通散文行紧贴公式会导致它被并进上一段，这种情况才需要报警。
      const prev = (lines[i - 1] ?? '').trim();
      const isBlockBoundary =
        prev === '' || /^#{1,6}\s/.test(prev) || /^(-{3,}|\*{3,}|_{3,})$/.test(prev) ||
        /^\$\$/.test(prev) || /^([-*+]|\d+\.)\s/.test(prev) || /^>/.test(prev) ||
        /^\|/.test(prev) || /^\s*$/.test(lines[i - 1] ?? '');
      if (!isBlockBoundary) {
        add(lineNo, '缺前空行', `前一行是散文（"${prev.slice(0, 40)}"），公式块前需空行`);
      }
      if ((lines[i + 1] ?? '').trim() !== '' && !/^\s*\$\$/.test(lines[i + 1] ?? '')) add(lineNo, '缺后空行', '公式块后应有空行');
      if (/^\s*\|/.test(lines[i - 1] ?? '') || /^\s*\|/.test(lines[i + 1] ?? '')) add(lineNo, '表格内公式', '避免在表格单元格里放公式');
    }

    // 列表项里的行内公式
    if (BULLET.test(noCode) && INLINE_MATH.test(noCode)) {
      const isNum = /^\s*\d+\.\s/.test(noCode);
      add(lineNo, isNum ? '编号列表内公式' : '列表项内公式', '列表项里的行内 $...$ 不渲染，请提为顶格公式块或写成文字');
    }
    INLINE_MATH.lastIndex = 0;

    // 命令黑名单（行内公式与公式块都要查）
    const mathParts = [noCode];
    for (const part of mathParts) {
      for (const [re, msg] of FORBIDDEN) {
        if (re.test(part)) add(lineNo, '高危命令', msg);
      }
    }
  }

  console.log(`\n=== ${file} ===`);
  if (!problems.length) {
    console.log('  ✅ 位置规则与命令黑名单检查通过');
  } else {
    for (const p of problems) {
      console.log(`  ❌ 第 ${p.line} 行 [${p.kind}] ${p.detail}`);
    }
    console.log(`  合计 ${problems.length} 个问题`);
  }
  totalProblems += problems.length;
}

console.log(`\n总计: ${totalProblems} 个问题`);
process.exit(totalProblems ? 1 : 0);
