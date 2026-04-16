#!/usr/bin/env node
/**
 * Stop hook — arkiverer full chat-historikk til
 * teknisk/dokumentasjon/chats/raw/YYYY-MM-DD-HH-MM.md og appender
 * én-linjes oppføring til månedsindeksen YYYY-MM.md.
 *
 * Leser transcript_path fra hook-payload (Claude Code sin JSONL-logg)
 * og konverterer til pent formatert markdown.
 *
 * Secrets (API keys, JWT) redactes før skriving — brukeren kan lime
 * inn tokens i samtalen uten at det lekker til committet chat-arkiv.
 *
 * Exit 0 alltid — skal aldri blokkere Claude.
 */

const { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync, statSync } = require("node:fs");
const { execSync } = require("node:child_process");
const path = require("node:path");

const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(input || "{}");
    const transcriptPath = payload?.transcript_path;
    if (!transcriptPath || !existsSync(transcriptPath)) process.exit(0);

    // Parse JSONL
    const lines = readFileSync(transcriptPath, "utf-8").split("\n").filter(Boolean);
    const messages = [];
    for (const line of lines) {
      try {
        messages.push(JSON.parse(line));
      } catch {}
    }
    if (!messages.length) process.exit(0);

    // Finn sesjonens startpunkt — første user-melding
    const firstUserIdx = messages.findIndex((m) => m.type === "user" || m.role === "user");
    if (firstUserIdx < 0) process.exit(0);
    const sessionMessages = messages.slice(firstUserIdx);

    // Tidsstempel for filnavn (basert på første user-melding sin timestamp, eller nå)
    const firstMsg = sessionMessages[0];
    const startTs = firstMsg?.timestamp ? new Date(firstMsg.timestamp) : new Date();
    const endTs = new Date();

    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = startTs.getFullYear();
    const mm = pad(startTs.getMonth() + 1);
    const dd = pad(startTs.getDate());
    const hh = pad(startTs.getHours());
    const min = pad(startTs.getMinutes());
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const timeStr = `${hh}:${min}`;
    const filename = `${dateStr}-${hh}-${min}.md`;
    const monthFile = `${yyyy}-${mm}.md`;

    const rawDir = path.join(projectRoot, "teknisk/dokumentasjon/chats/raw");
    const chatsDir = path.join(projectRoot, "teknisk/dokumentasjon/chats");
    mkdirSync(rawDir, { recursive: true });

    // Git-metadata
    const sh = (cmd) => {
      try {
        return execSync(cmd, { cwd: projectRoot, encoding: "utf-8" }).trim();
      } catch {
        return "";
      }
    };
    const branch = sh("git branch --show-current");
    const changedFiles = sh("git diff --name-only HEAD~1").split("\n").filter(Boolean);

    // Formatér markdown
    let md = `# Sesjon ${dateStr} ${timeStr}\n\n`;
    md += `**Varighet**: ${Math.round((endTs - startTs) / 60000)} min\n`;
    if (branch) md += `**Branch**: \`${branch}\`\n`;
    if (changedFiles.length) {
      md += `**Siste commit endret**: ${changedFiles.length} fil${changedFiles.length === 1 ? "" : "er"}\n`;
    }
    md += `\n---\n\n`;

    for (const msg of sessionMessages) {
      const role = msg.type || msg.role;
      const ts = msg.timestamp ? new Date(msg.timestamp) : null;
      const tsStr = ts ? `${pad(ts.getHours())}:${pad(ts.getMinutes())}` : "";

      if (role === "user") {
        const content = extractText(msg.content || msg.message?.content || msg.text || "");
        if (content) {
          md += `## 👤 Bruker${tsStr ? ` (${tsStr})` : ""}\n\n${content.trim()}\n\n`;
        }
      } else if (role === "assistant") {
        const content = extractText(msg.content || msg.message?.content || msg.text || "");
        if (content) {
          md += `## 🤖 Claude${tsStr ? ` (${tsStr})` : ""}\n\n${content.trim()}\n\n`;
        }
        // Tool-calls
        const tools = extractToolUses(msg.content || msg.message?.content || []);
        if (tools.length) {
          md += `### Tool-kall\n\n`;
          tools.forEach((t) => {
            md += `- \`${t}\`\n`;
          });
          md += `\n`;
        }
      } else if (role === "tool_result" || role === "tool") {
        // Skip verbose tool-results — bare kort note
      }
    }

    // Redact secrets før skriving
    md = redactSecrets(md);

    writeFileSync(path.join(rawDir, filename), md);

    // Appender til månedsindeks
    const monthPath = path.join(chatsDir, monthFile);
    const firstUserText = redactSecrets(
      extractText(
        sessionMessages[0].content || sessionMessages[0].message?.content || ""
      ).slice(0, 80).replace(/\n/g, " ")
    );
    const indexEntry = `\n## ${dateStr} ${timeStr}\n[Full sesjon](./raw/${filename}) · ${Math.round((endTs - startTs) / 60000)} min\n${firstUserText}${firstUserText.length >= 80 ? "…" : ""}\n`;

    if (!existsSync(monthPath)) {
      writeFileSync(monthPath, `# Chat-arkiv — ${yyyy}-${mm}\n${indexEntry}`);
    } else {
      appendFileSync(monthPath, indexEntry);
    }
  } catch (err) {
    // Silent fail — skal aldri blokkere Claude
    process.stderr.write(`[stop-chat-archive] ${err.message}\n`);
  }
  process.exit(0);
});

/**
 * Trekker ut tekst fra content-field som kan være string eller array
 * av {type:"text", text:"..."}-objekter.
 */
function extractText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((c) => c && (c.type === "text" || typeof c === "string"))
    .map((c) => (typeof c === "string" ? c : c.text || ""))
    .join("\n");
}

function extractToolUses(content) {
  if (!Array.isArray(content)) return [];
  return content
    .filter((c) => c && c.type === "tool_use")
    .map((c) => c.name || "unknown");
}

/**
 * Erstatt kjente secret-mønstre med ***REDACTED***-placeholder.
 * Brukeren kan lime inn tokens/keys i samtalen — disse skal aldri havne
 * i committet chat-arkiv.
 *
 * Patterns dekket:
 * - Resend API-keys: re_XXXX
 * - Supabase access tokens: sbp_XXXX
 * - Supabase secret keys (ny format): sb_secret_XXXX
 * - Supabase publishable keys (ny format, ikke sensitive men standardisert): sb_publishable_XXXX
 * - Stripe secret keys: sk_live_XXXX, sk_test_XXXX
 * - Generiske JWT-tokens: eyJ... (Supabase anon/service role, signert JWT)
 * - GitHub tokens: ghp_XXXX, gho_XXXX, ghu_XXXX, ghs_XXXX, ghr_XXXX
 * - OpenAI/Anthropic keys: sk-ant-..., sk-proj-...
 * - Vercel tokens: vercel_XXXX (ikke offisielt format, men dekker edge case)
 */
function redactSecrets(text) {
  if (typeof text !== "string") return text;

  const patterns = [
    // Resend
    { re: /\bre_[A-Za-z0-9_]{20,}\b/g, label: "resend-key" },
    // Supabase tokens (personal access + project service)
    { re: /\bsbp_[A-Za-z0-9_]{20,}\b/g, label: "supabase-access-token" },
    { re: /\bsb_secret_[A-Za-z0-9_]{20,}\b/g, label: "supabase-secret" },
    { re: /\bsb_publishable_[A-Za-z0-9_]{20,}\b/g, label: "supabase-publishable" },
    // Stripe
    { re: /\bsk_(live|test)_[A-Za-z0-9]{20,}\b/g, label: "stripe-key" },
    // GitHub
    { re: /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/g, label: "github-token" },
    // Anthropic / OpenAI
    { re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g, label: "anthropic-key" },
    { re: /\bsk-proj-[A-Za-z0-9_-]{20,}\b/g, label: "openai-key" },
    // JWT (eyJ...). Matcher tre base64url-sections separert av `.`. Treffer
    // Supabase anon/service role-keys og andre signerte tokens.
    { re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, label: "jwt" },
  ];

  let result = text;
  for (const { re, label } of patterns) {
    result = result.replace(re, `***REDACTED-${label}***`);
  }
  return result;
}
