---
description: Merge workspace-branch til feature uten å fjerne worktreen.
argument-hint: <workspace-navn>
---

Merge workspace "$ARGUMENTS" til feature uten å fjerne worktreen. Gjør følgende steg sekvensielt:

1. Sjekk at alle endringer er committet i workspace-branchen
2. Merge workspace-branchen til feature
3. Bekreft merge, worktree beholdes

### 0. Etabler dynamiske stier

- Worktree: `$(dirname "$CLAUDE_PROJECT_DIR")/$(basename "$CLAUDE_PROJECT_DIR")-worktrees/$ARGUMENTS`

### 1. Sjekk ucommittede endringer

```bash
git -C "$(dirname "$CLAUDE_PROJECT_DIR")/$(basename "$CLAUDE_PROJECT_DIR")-worktrees/$ARGUMENTS" status --short
```

Hvis det finnes ucommittede endringer, spør brukeren om de skal committes først.

### 2. Bytt til feature-branch i hovedrepo

```bash
git -C "$CLAUDE_PROJECT_DIR" checkout feature
```

### 3. Merge workspace-branch til feature

```bash
git -C "$CLAUDE_PROJECT_DIR" merge "$ARGUMENTS" --no-edit
```

Hvis merge feiler med konflikt:
1. Vis konfliktfiler: `git -C "$CLAUDE_PROJECT_DIR" diff --name-only --diff-filter=U`
2. Avbryt mergen: `git -C "$CLAUDE_PROJECT_DIR" merge --abort`
3. Informer brukeren om hvilke filer som har konflikter og stopp — ikke fortsett med opprydding. Workspace forblir intakt slik at brukeren kan løse konflikter og prøve igjen.

### 4. Bekreft

Vis resultatet med `git -C "$CLAUDE_PROJECT_DIR" log --oneline -3` og si at worktree og branch er beholdt — brukeren kan fortsette å jobbe og merge igjen senere.
