---
description: Opprett ny feature-branch workspace (git worktree) og åpne i VS Code.
argument-hint: <workspace-navn>
---

Opprett en ny feature-branch workspace og åpne den i VS Code.

## Instruksjoner

Bruk argumentet som workspace-navn. Hvis `$ARGUMENTS` er tomt, spør brukeren om et navn.

### 0. Etabler dynamiske stier

Bruk disse verdiene i kommandoene under:
- Prosjektrot: `$CLAUDE_PROJECT_DIR`
- Worktree-parent: `$(dirname "$CLAUDE_PROJECT_DIR")/$(basename "$CLAUDE_PROJECT_DIR")-worktrees`
- Worktree-path: `<worktree-parent>/$ARGUMENTS`

### 1. Opprett worktree med egen branch

```bash
git -C "$CLAUDE_PROJECT_DIR" worktree add -b "$ARGUMENTS" "$(dirname "$CLAUDE_PROJECT_DIR")/$(basename "$CLAUDE_PROJECT_DIR")-worktrees/$ARGUMENTS" feature
```

Hvis repoet ikke har `feature`-branch: spør brukeren hvilken base-branch som skal brukes (`main`, `develop`, osv.).

### 2. Installer avhengigheter

```bash
pnpm install --dir "$(dirname "$CLAUDE_PROJECT_DIR")/$(basename "$CLAUDE_PROJECT_DIR")-worktrees/$ARGUMENTS"
```

### 3. Kopier lokal konfigurasjon (ikke committet)

```bash
cp "$CLAUDE_PROJECT_DIR/.env.local" "$(dirname "$CLAUDE_PROJECT_DIR")/$(basename "$CLAUDE_PROJECT_DIR")-worktrees/$ARGUMENTS/.env.local" 2>/dev/null || echo "Ingen .env.local å kopiere"
```

`.claude/` og `CLAUDE.md` blir automatisk med siden worktree deler git-historikk.

### 4. Åpne VS Code i worktree-mappen

(uten `CLAUDECODE`-env for å unngå nested session-feil)

```bash
CLAUDECODE= code "$(dirname "$CLAUDE_PROJECT_DIR")/$(basename "$CLAUDE_PROJECT_DIR")-worktrees/$ARGUMENTS"
```

### 5. Bekreft til brukeren

Vis:

**Workspace er klart.** VS Code åpnet i worktree-mappen.

Start dette i VS Code-terminalen:
- `claude` — for Claude Code
- `pnpm dev -- -p 3001` — for dev-server på alternativ port

Kjør `/workspace-start <navn>` igjen for flere parallelle workspaces.
