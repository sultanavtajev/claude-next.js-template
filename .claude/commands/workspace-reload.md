---
description: Gjenåpne eksisterende workspace i VS Code.
argument-hint: <workspace-navn>
---

Gjenåpne workspace "$ARGUMENTS" i VS Code.

## Instruksjoner

Bruk argumentet som workspace-navn. Hvis `$ARGUMENTS` er tomt, kjør `git worktree list` og vis workspaces slik at brukeren kan velge.

### 1. Sjekk at worktree-mappen finnes

```bash
ls "$(dirname "$CLAUDE_PROJECT_DIR")/$(basename "$CLAUDE_PROJECT_DIR")-worktrees/$ARGUMENTS"
```

Hvis mappen ikke finnes, si ifra og foreslå `/workspace-start <navn>` for å opprette nytt.

### 2. Åpne VS Code i worktree-mappen

(uten `CLAUDECODE`-env for å unngå nested session-feil)

```bash
CLAUDECODE= code "$(dirname "$CLAUDE_PROJECT_DIR")/$(basename "$CLAUDE_PROJECT_DIR")-worktrees/$ARGUMENTS"
```

### 3. Bekreft til brukeren

Vis:

**Workspace gjenåpnet.** VS Code åpnet i worktree-mappen.

Start dette i VS Code-terminalen:
- `claude` — for Claude Code
- `pnpm dev -- -p 3001` — for dev-server
