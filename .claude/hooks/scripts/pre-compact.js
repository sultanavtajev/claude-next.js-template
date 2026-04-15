#!/usr/bin/env node
/**
 * PreCompact hook — dumper kritisk sesjon-state til
 * teknisk/dokumentasjon/session-state.md før Claude-kontekst
 * kompakteres. Neste sesjon (eller post-compact Claude) kan lese
 * filen for å huske hvor vi var.
 *
 * Exit 0 alltid — skal aldri blokkere kompaktering.
 */

const { execSync } = require("node:child_process");
const { existsSync, writeFileSync, readdirSync, mkdirSync, readFileSync } = require("node:fs");
const path = require("node:path");

const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();

function sh(cmd) {
  try {
    return execSync(cmd, {
      cwd: projectRoot,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

try {
  const now = new Date().toISOString();
  const lines = [];

  lines.push(`# Session State`);
  lines.push(``);
  lines.push(`Dumpet: ${now}`);
  lines.push(`> Auto-generert av PreCompact-hook før Claude-kontekst ble kompaktert.`);
  lines.push(`> Les denne ved sesjon-start eller etter kompaktering for å huske hvor vi var.`);
  lines.push(``);

  // Git-status
  const branch = sh("git branch --show-current");
  const status = sh("git status --short");
  const lastCommits = sh("git log --oneline -5");
  lines.push(`## Git`);
  if (branch) lines.push(`- Branch: \`${branch}\``);
  if (status) {
    lines.push(`- Ucommittede endringer:`);
    status.split("\n").forEach((l) => lines.push(`  - \`${l}\``));
  } else {
    lines.push(`- Working tree: ren`);
  }
  if (lastCommits) {
    lines.push(`- Siste 5 commits:`);
    lastCommits.split("\n").forEach((l) => lines.push(`  - ${l}`));
  }
  lines.push(``);

  // Aktive sjekklister
  const sjekklisteDir = path.join(projectRoot, "teknisk/sjekkliste");
  if (existsSync(sjekklisteDir)) {
    try {
      const entries = readdirSync(sjekklisteDir)
        .filter((n) => !n.startsWith("OK - ") && !n.startsWith("README") && !n.startsWith("."));
      if (entries.length) {
        lines.push(`## Aktive sjekklister`);
        for (const entry of entries) {
          lines.push(`\n### \`teknisk/sjekkliste/${entry}\``);
          const full = path.join(sjekklisteDir, entry);
          if (entry.endsWith(".md")) {
            // Les og ta ut unchecked items
            try {
              const content = readFileSync(full, "utf-8");
              const unchecked = content.split("\n").filter((l) => /^\s*-\s*\[\s*\]/.test(l));
              if (unchecked.length) {
                lines.push(`Gjenstående:`);
                unchecked.slice(0, 10).forEach((l) => lines.push(l));
                if (unchecked.length > 10) {
                  lines.push(`... + ${unchecked.length - 10} flere`);
                }
              } else {
                lines.push(`(alt krysset av)`);
              }
            } catch {}
          } else {
            lines.push(`(mappe — se filer i den for detaljer)`);
          }
        }
        lines.push(``);
      }
    } catch {}
  }

  // Siste fil-endringer (etter siste commit)
  const modifiedFiles = sh("git diff --name-only HEAD")
    .split("\n")
    .filter(Boolean);
  if (modifiedFiles.length) {
    lines.push(`## Ucommittede fil-endringer`);
    modifiedFiles.slice(0, 20).forEach((f) => lines.push(`- \`${f}\``));
    if (modifiedFiles.length > 20) {
      lines.push(`... + ${modifiedFiles.length - 20} flere`);
    }
    lines.push(``);
  }

  // Supabase-snapshot
  const snapshotPath = path.join(projectRoot, "teknisk/dokumentasjon/supabase-snapshot.md");
  if (existsSync(snapshotPath)) {
    lines.push(`## Supabase-snapshot`);
    lines.push(`Se \`teknisk/dokumentasjon/supabase-snapshot.md\` for tabeller, RLS, edge functions.`);
    lines.push(``);
  }

  // Hint til neste sesjon
  lines.push(`## Til Claude ved neste sesjon`);
  lines.push(``);
  lines.push(`Hvis du leser denne filen etter kompaktering eller ved sesjonsstart:`);
  lines.push(`1. Sjekk ucommittede endringer og git branch for context`);
  lines.push(`2. Les aktive sjekklister for å se hva som gjenstår`);
  lines.push(`3. Fortsett der forrige sesjon sluttet — ikke start fra scratch`);

  const outPath = path.join(projectRoot, "teknisk/dokumentasjon/session-state.md");
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, lines.join("\n") + "\n");

  process.stderr.write(`[pre-compact] sesjon-state dumpet til ${outPath}\n`);
} catch (err) {
  process.stderr.write(`[pre-compact] ${err.message}\n`);
}

process.exit(0);
