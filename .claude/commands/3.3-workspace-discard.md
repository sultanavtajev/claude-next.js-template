---
description: Forkast workspace uten merge — sletter worktree og branch.
argument-hint: <workspace-navn>
---

Forkast workspace "$ARGUMENTS" uten å merge. Gjør følgende steg sekvensielt:

1. Vis ucommittede endringer og bekreft med brukeren
2. Fjern worktree og branch

### 1. Sjekk ucommittede endringer

```bash
git -C "$(dirname "$CLAUDE_PROJECT_DIR")/$(basename "$CLAUDE_PROJECT_DIR")-worktrees/$ARGUMENTS" status --short
```

Vis endringene og spør brukeren: "Er du sikker på at du vil forkaste workspace '$ARGUMENTS'? Alt arbeid som ikke er merget vil gå tapt."

### 2. Bytt til feature-branch i hovedrepo

```bash
git -C "$CLAUDE_PROJECT_DIR" checkout feature
```

### 3. Fjern node_modules

```bash
rm -rf "$(dirname "$CLAUDE_PROJECT_DIR")/$(basename "$CLAUDE_PROJECT_DIR")-worktrees/$ARGUMENTS/node_modules"
```

### 4. Fjern worktree

```bash
git -C "$CLAUDE_PROJECT_DIR" worktree remove "$(dirname "$CLAUDE_PROJECT_DIR")/$(basename "$CLAUDE_PROJECT_DIR")-worktrees/$ARGUMENTS" --force
```

### 5. Slett workspace-branch

```bash
git -C "$CLAUDE_PROJECT_DIR" branch -D "$ARGUMENTS"
```

### 6. Bekreft

Si at workspace og branch er slettet. Ingen endringer ble merget til feature.
