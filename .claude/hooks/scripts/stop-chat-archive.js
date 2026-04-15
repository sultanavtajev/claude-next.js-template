#!/usr/bin/env node
/**
 * Stop hook — arkiverer full chat-historikk til
 * teknisk/dokumentasjon/chats/raw/YYYY-MM-DD-HH-MM.md og appender
 * én-linjes oppføring til månedsindeksen YYYY-MM.md.
 *
 * Leser transcript_path fra hook-payload (Claude Code sin JSONL-logg)
 * og konverterer til pent formatert markdown.
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

    writeFileSync(path.join(rawDir, filename), md);

    // Appender til månedsindeks
    const monthPath = path.join(chatsDir, monthFile);
    const firstUserText = extractText(
      sessionMessages[0].content || sessionMessages[0].message?.content || ""
    ).slice(0, 80).replace(/\n/g, " ");
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
