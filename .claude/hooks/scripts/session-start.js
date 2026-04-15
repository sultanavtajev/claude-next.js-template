#!/usr/bin/env node
/**
 * SessionStart hook — produserer "morgen-briefing" som Claude leser
 * ved sesjonsstart: git-status, siste commits, snapshot-alder,
 * aktive sjekklister, manglende env-vars.
 *
 * Output: JSON på stdout med additionalContext (for Claude Code),
 * eller ren tekst på stderr (fallback, synlig i terminal).
 * Exit 0 alltid — skal aldri blokkere sessionstart.
 */

const { execSync } = require("node:child_process");
const { existsSync, readdirSync, statSync, readFileSync } = require("node:fs");
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

const lines = [];

// Git-status
const branch = sh("git branch --show-current");
const status = sh("git status --short");
if (branch) {
  lines.push(`**Branch**: \`${branch}\``);
  if (status) {
    const changed = status.split("\n").length;
    lines.push(`**Ucommittede endringer**: ${changed} fil${changed === 1 ? "" : "er"}`);
  } else {
    lines.push(`**Working tree**: ren`);
  }
}

// Siste 3 commits
const log = sh("git log --oneline -3");
if (log) {
  lines.push("\n**Siste commits:**");
  log.split("\n").forEach((l) => lines.push(`- ${l}`));
}

// Supabase-snapshot alder
const snapshotPath = path.join(projectRoot, "teknisk/dokumentasjon/supabase-snapshot.md");
if (existsSync(snapshotPath)) {
  const age = Math.floor((Date.now() - statSync(snapshotPath).mtimeMs) / 1000 / 60 / 60);
  lines.push(`\n**Supabase-snapshot**: ${age}t gammel (`teknisk/dokumentasjon/supabase-snapshot.md`)`);
  if (age > 24) {
    lines.push(`⚠ Utdatert. Kjør \`pnpm db:snapshot\` hvis migrasjoner er endret.`);
  }
}

// Aktive sjekklister
const sjekklisteDir = path.join(projectRoot, "teknisk/sjekkliste");
if (existsSync(sjekklisteDir)) {
  try {
    const active = readdirSync(sjekklisteDir)
      .filter((n) => !n.startsWith("OK - ") && !n.startsWith("README"))
      .filter((n) => n.endsWith(".md") || statSync(path.join(sjekklisteDir, n)).isDirectory());
    if (active.length) {
      lines.push("\n**Aktive sjekklister:**");
      active.forEach((n) => lines.push(`- \`teknisk/sjekkliste/${n}\``));
    }
  } catch {}
}

// Env-vars fra .env.local
const envPath = path.join(projectRoot, ".env.local");
const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = [];
if (existsSync(envPath)) {
  const env = readFileSync(envPath, "utf-8");
  for (const key of required) {
    const match = env.match(new RegExp(`^${key}=(.+)$`, "m"));
    if (!match || !match[1].trim() || match[1].trim() === '""') {
      missing.push(key);
    }
  }
}
if (missing.length) {
  lines.push(`\n⚠ **Mangler env-vars**: ${missing.join(", ")}`);
}

// Session-state fra forrige PreCompact (hvis finnes)
const statePath = path.join(projectRoot, "teknisk/dokumentasjon/session-state.md");
if (existsSync(statePath)) {
  const age = Math.floor((Date.now() - statSync(statePath).mtimeMs) / 1000 / 60);
  lines.push(`\n**Session-state fra forrige sesjon** (${age}min gammel): se \`teknisk/dokumentasjon/session-state.md\``);
}

const briefing = lines.length ? `## Sesjon-briefing\n\n${lines.join("\n")}` : "";

// Emit på stdout som JSON for Claude Code additionalContext
if (briefing) {
  const payload = {
    continue: true,
    suppressOutput: false,
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: briefing,
    },
  };
  process.stdout.write(JSON.stringify(payload) + "\n");
  // Også synlig på stderr for terminal
  process.stderr.write(briefing + "\n");
}

process.exit(0);
