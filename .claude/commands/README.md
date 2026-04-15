# Slash-kommandoer

Prosjekt-spesifikke slash-kommandoer for Claude Code. Aktiveres med `/<navn>` i Claude Code-sessionen.

Nummerering gruppe: `0.x` = bootstrap, `1.x` = git, `2.x` = oppgaver, `3.x` = workspace, `4.x` = UI/UX, `6.x` = audits.

## 0. Bootstrap

| Kommando | Beskrivelse |
|----------|-------------|
| `/0.0-oppstart` | Kjør bootstrap-prosessen — leser `oppstart/CHECKLIST.md` og eksekverer alle 9 steg i rekkefølge. Brukes én gang i nytt prosjekt rett etter kloning. |

## 1. Git

| Kommando | Beskrivelse |
|----------|-------------|
| `/1.0-commit` | Commit alle endringer med beskrivende melding |
| `/1.1-build-commit` | Kjør build, fiks feil, og commit |
| `/1.2-merge-to-main` | Commit, merge feature → main lokalt, push, tilbake til feature |

## 2. Oppgaver

| Kommando | Beskrivelse |
|----------|-------------|
| `/2.0-task <oppgave>` | Solo-oppgave med full arbeidsmetodikk, sjekkliste, sub-agents, kodestruktur og UI/UX-krav |
| `/2.1-task-team <oppgave>` | Multi-agent team-oppgave. Setter opp koordinert team med teammates, delt oppgaveliste og per-agent sjekklister |

## 3. Workspace (git worktree)

| Kommando | Beskrivelse |
|----------|-------------|
| `/3.0-workspace-start <navn>` | Opprett nytt workspace med egen branch og åpne VS Code |
| `/3.1-workspace-merge <navn>` | Merge workspace-branch til feature, behold worktree |
| `/3.2-workspace-reload <navn>` | Gjenåpne eksisterende workspace i VS Code |
| `/3.3-workspace-discard <navn>` | Forkast workspace uten merge, slett worktree og branch |
| `/3.4-workspace-finish <navn>` | Sjekk ucommittede endringer, merge til feature, rydd opp workspace |

## 4. UI/UX

| Kommando | Beskrivelse |
|----------|-------------|
| `/4.0-ui <beskrivelse>` | Start UI-arbeid med garantert kall til `ui-ux-pro-max` + MASTER-konsultering. Bruk for ny side, komponent, eller større styling-endring. |

## 6. Audits

| Kommando | Beskrivelse |
|----------|-------------|
| `/6.0-audit [scope]` | Full audit: security + a11y + performance + design-system. Samlet rapport til `teknisk/dokumentasjon/audits/` |
| `/6.1-a11y [scope]` | Kun a11y-audit (WCAG 2.2 AA) |
| `/6.2-security [scope]` | Kun security-audit (OWASP + RLS + secrets) |
| `/6.3-performance [scope]` | Kun performance-audit (bundle, caching, bilder/fonts) |

## Konvensjoner disse kommandoene antar

- **Base-branch**: `feature` er default utviklingsbranch. `main` er release. Endre i kommando-filene hvis du bruker annen modell.
- **Worktree-plassering**: søsken-mappe til prosjektmappen, navn `<prosjekt>-worktrees/<workspace-navn>`.
- **Sjekkliste-mappe**: `teknisk/sjekkliste/` under prosjektroten. Committes, versjoneres.
- **Stier**: dynamisk via `$CLAUDE_PROJECT_DIR`. Kommandoene fungerer uansett hvor prosjektet er klonet.

## Tilpasning

Rediger `.md`-filene direkte for å endre oppførsel. Alle er vanlige markdown med `$ARGUMENTS`-substitusjon og bash-kodeblokker Claude kjører.
