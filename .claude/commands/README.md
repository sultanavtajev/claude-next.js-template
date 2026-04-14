# Slash-kommandoer

Prosjekt-spesifikke slash-kommandoer for Claude Code. Aktiveres med `/<navn>` i Claude Code-sessionen.

## Oppgaver

| Kommando | Beskrivelse |
|----------|-------------|
| `/task <oppgave>` | Solo-oppgave med full arbeidsmetodikk, sjekkliste, sub-agents, kodestruktur og UI/UX-krav |
| `/task-team <oppgave>` | Multi-agent team-oppgave. Setter opp koordinert team med teammates, delt oppgaveliste og per-agent sjekklister |

## Workspace (git worktree)

| Kommando | Beskrivelse |
|----------|-------------|
| `/workspace-start <navn>` | Opprett nytt workspace med egen branch og åpne VS Code |
| `/workspace-merge <navn>` | Merge workspace-branch til feature, behold worktree |
| `/workspace-reload <navn>` | Gjenåpne eksisterende workspace i VS Code |
| `/workspace-discard <navn>` | Forkast workspace uten merge, slett worktree og branch |
| `/workspace-finish <navn>` | Sjekk ucommittede endringer, merge til feature, rydd opp workspace |

## Git

| Kommando | Beskrivelse |
|----------|-------------|
| `/commit` | Commit alle endringer med beskrivende melding |
| `/build-commit` | Kjør build, fiks feil, og commit |
| `/merge-to-main` | Commit, merge feature → main lokalt, push, tilbake til feature |

## Konvensjoner disse kommandoene antar

- **Base-branch**: `feature` er default utviklingsbranch. `main` er release. Endre i kommando-filene hvis du bruker annen modell.
- **Worktree-plassering**: søsken-mappe til prosjektmappen, navn `<prosjekt>-worktrees/<workspace-navn>`.
- **Sjekkliste-mappe**: `teknisk/sjekkliste/` under prosjektroten. Committes, versjoneres.
- **Stier**: dynamisk via `$CLAUDE_PROJECT_DIR`. Kommandoene fungerer uansett hvor prosjektet er klonet.

## Tilpasning

Rediger `.md`-filene direkte for å endre oppførsel. Alle er vanlige markdown med `$ARGUMENTS`-substitusjon og bash-kodeblokker Claude kjører.
