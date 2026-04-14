#!/usr/bin/env node
/**
 * PostToolUse hook — kjører prettier + eslint --fix på filer Claude har Edit/Write-redigert.
 * Les hook-input fra stdin (JSON med tool_input.file_path).
 * Exit 0 alltid — formatering skal aldri blokkere Claude.
 */

const { execSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(input || "{}");
    const filePath = payload?.tool_input?.file_path;
    if (!filePath || !existsSync(filePath)) process.exit(0);

    const ext = path.extname(filePath).toLowerCase();
    const formattable = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".css", ".md"];
    if (!formattable.includes(ext)) process.exit(0);

    const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const rel = path.relative(projectRoot, filePath);

    const hasPrettier = existsSync(path.join(projectRoot, "node_modules", "prettier"));
    const hasEslint = existsSync(path.join(projectRoot, "node_modules", "eslint"));

    if (hasPrettier) {
      try {
        execSync(`npx prettier --write "${rel}"`, { cwd: projectRoot, stdio: "pipe" });
      } catch {}
    }

    const lintable = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
    if (hasEslint && lintable.includes(ext)) {
      try {
        execSync(`npx eslint --fix "${rel}"`, { cwd: projectRoot, stdio: "pipe" });
      } catch {}
    }
  } catch {}
  process.exit(0);
});
