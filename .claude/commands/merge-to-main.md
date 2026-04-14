---
description: Commit alle endringer, merge feature til main lokalt, push, og gå tilbake til feature.
---

Commit alle endringer, merge `feature` til `main` lokalt, push `main` til remote, og bytt tilbake til `feature`.

## Instruksjoner

### 1. Verifiser at alt kompilerer

Før merge skal templaten være grønn:

```bash
pnpm typecheck && pnpm lint && pnpm build
```

Hvis noe feiler: stopp og fiks først, eller avbryt.

### 2. Commit eventuelle gjenværende endringer

Hvis det er ucommittede endringer, kjør `/commit`-kommandoen først.

### 3. Verifiser branching-state

```bash
git -C "$CLAUDE_PROJECT_DIR" branch --show-current
git -C "$CLAUDE_PROJECT_DIR" log feature..main --oneline
git -C "$CLAUDE_PROJECT_DIR" log main..feature --oneline
```

Bekreft med bruker at feature har de commit-ene som skal til main.

### 4. Bytt til main og merge feature inn

```bash
git -C "$CLAUDE_PROJECT_DIR" checkout main
git -C "$CLAUDE_PROJECT_DIR" pull --ff-only
git -C "$CLAUDE_PROJECT_DIR" merge feature --no-ff
```

Hvis merge feiler med konflikt: vis konfliktfiler, avbryt med `git merge --abort`, og spør bruker.

### 5. Push main

```bash
git -C "$CLAUDE_PROJECT_DIR" push origin main
```

### 6. Gå tilbake til feature

```bash
git -C "$CLAUDE_PROJECT_DIR" checkout feature
git -C "$CLAUDE_PROJECT_DIR" merge main --ff-only
```

Dette holder `feature` synkronisert med `main` uten unødvendige merge-commits.

### 7. Bekreft

Vis:
- `git log --oneline -5` på feature
- Status (clean, synk med main)
- Remote-status hvis relevant
