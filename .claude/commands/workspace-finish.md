---
description: Avslutt workspace — commit-sjekk, merge til feature, rydd opp worktree og branch.
argument-hint: <workspace-navn>
---

Workspace "$ARGUMENTS" er ferdig. Gjør følgende steg sekvensielt:

1. Sjekk at alle endringer er committet i workspace-branchen
2. Merge workspace-branchen til feature
3. Installer avhengigheter i hovedrepo (`pnpm install`)
4. Sjekk at ingen prosesser har worktree åpen
5. Rydd opp workspace (fjern node_modules, worktree, branch)

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

### 4. Installer avhengigheter i hovedrepo

Worktrees deler git-historikk, men ikke node_modules. Etter merge kan `package.json` ha nye pakker.

```bash
pnpm install --dir "$CLAUDE_PROJECT_DIR"
```

### 5. Sjekk om noen prosesser har worktree åpen

Sjekk alle prosesser som har workspace-navnet i vindustittel (VS Code, terminal, etc.):

```bash
powershell.exe -Command "Get-Process | Where-Object { \$_.MainWindowTitle -match '$ARGUMENTS' } | Select-Object Id, ProcessName, MainWindowTitle | Format-Table -AutoSize"
```

Hvis noen prosesser dukker opp, be brukeren lukke dem før du fortsetter. Vis prosessnavn og vindustittel. Stopp og vent på bekreftelse — ikke prøv å fjerne worktree mens den er åpen, da dette vil feile med "Permission denied" eller "Device or resource busy".

### 6. Fjern node_modules

```bash
rm -rf "$(dirname "$CLAUDE_PROJECT_DIR")/$(basename "$CLAUDE_PROJECT_DIR")-worktrees/$ARGUMENTS/node_modules"
```

### 7. Fjern worktree

```bash
git -C "$CLAUDE_PROJECT_DIR" worktree remove "$(dirname "$CLAUDE_PROJECT_DIR")/$(basename "$CLAUDE_PROJECT_DIR")-worktrees/$ARGUMENTS" --force
```

### 8. Slett workspace-branch

```bash
git -C "$CLAUDE_PROJECT_DIR" branch -D "$ARGUMENTS"
```

### 9. Bekreft

Vis resultatet og kjør `git -C "$CLAUDE_PROJECT_DIR" log --oneline -5` på feature-branchen for å vise de mergede committene.
