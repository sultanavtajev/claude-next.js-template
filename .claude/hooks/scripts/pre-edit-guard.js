#!/usr/bin/env node
/**
 * PreToolUse hook — blokkerer Edit/Write på sensitive filer og build-artefakter.
 * Les hook-input fra stdin (JSON med tool_input.file_path).
 * Exit 2 blokkerer verktøyet; exit 0 tillater.
 */

const path = require("node:path");

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(input || "{}");
    const filePath = payload?.tool_input?.file_path;
    if (!filePath) process.exit(0);

    const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const rel = path.relative(projectRoot, filePath).replace(/\\/g, "/");

    const blocked = [
      { pattern: /^\.next\//, reason: ".next/ er build-output" },
      { pattern: /^node_modules\//, reason: "node_modules/ er dependencies" },
      { pattern: /^\.git\//, reason: ".git/ er git interne filer" },
      { pattern: /^dist\//, reason: "dist/ er build-output" },
      { pattern: /^coverage\//, reason: "coverage/ er testoutput" },
      { pattern: /\.log$/, reason: "loggfiler skal ikke redigeres" },
    ];

    const match = blocked.find((b) => b.pattern.test(rel));
    if (match) {
      process.stderr.write(`Blokkert: ${rel} — ${match.reason}\n`);
      process.exit(2);
    }
  } catch {}
  process.exit(0);
});
