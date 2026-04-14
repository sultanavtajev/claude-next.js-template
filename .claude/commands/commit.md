---
description: Commit alle endringer med beskrivende melding basert på diff.
---

Commit alle endringer i prosjektet.

## Instruksjoner

1. Kjør `git -C "$CLAUDE_PROJECT_DIR" status --short` for å se hva som er endret.
2. Kjør `git -C "$CLAUDE_PROJECT_DIR" diff --stat` for en rask oversikt over omfanget.
3. Kjør `git -C "$CLAUDE_PROJECT_DIR" log --oneline -5` for å se stilen på tidligere commits.
4. Stage relevante filer med `git -C "$CLAUDE_PROJECT_DIR" add <filer>`. **Ikke** bruk `git add -A` eller `git add .` — stage filer eksplisitt for å unngå å committe hemmeligheter eller filer som ikke hører til.
5. Lag en konsis commit-melding (1–2 setninger, fokus på "hvorfor" framfor "hva"). Bruk HEREDOC hvis meldingen har flere linjer.
6. `git -C "$CLAUDE_PROJECT_DIR" commit -m "..."`.
7. Verifiser med `git -C "$CLAUDE_PROJECT_DIR" status` og vis til bruker.

## Regler

- Aldri commit `.env`-filer (blokkert av `.claude/hooks/scripts/pre-edit-guard.js` uansett, men verifiser likevel).
- Hvis pre-commit hook feiler: fiks underliggende problem og lag ny commit. Ikke `--amend` med mindre bruker eksplisitt ber om det.
- Ikke push — det gjøres via `/merge-to-main` eller manuelt.
