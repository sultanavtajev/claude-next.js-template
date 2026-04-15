#!/usr/bin/env node
/**
 * PostToolUse hook — auto-regenererer Supabase-snapshot når
 * supabase/migrations/*.sql-filer endres via Edit/Write.
 *
 * Exit 0 alltid — snapshot-regenerering skal aldri blokkere Claude.
 */

const { spawn } = require("node:child_process");
const { existsSync } = require("node:fs");
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

    // Trigger kun når vi ser migrations-filer
    if (!rel.startsWith("supabase/migrations/") || !rel.endsWith(".sql")) {
      process.exit(0);
    }

    // Krev at snapshot-scriptet og package.json finnes
    const scriptPath = path.join(projectRoot, "scripts", "supabase-snapshot.ts");
    const pkgPath = path.join(projectRoot, "package.json");
    if (!existsSync(scriptPath) || !existsSync(pkgPath)) {
      process.exit(0);
    }

    // Kjør i bakgrunn — ikke blokker Claude på nettverks-kall til Supabase
    const child = spawn("pnpm", ["db:snapshot"], {
      cwd: projectRoot,
      detached: true,
      stdio: "ignore",
      shell: true,
    });
    child.unref();

    process.stderr.write(`[post-migration-snapshot] regenererer teknisk/dokumentasjon/supabase-snapshot.md (i bakgrunn)\n`);
  } catch {}
  process.exit(0);
});
