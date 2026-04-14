# Claude Code Kommandoer

## Oppgaver

| Kommando | Beskrivelse |
|----------|-------------|
| `/6.4_task <oppgave>` | Standard solo-oppgave med full arbeidsmetodikk, sjekkliste, sub-agents, kodestruktur og UI/UX-krav |
| `/13.1_agent_team <oppgave>` | Agent team-oppgave. Setter opp koordinert team med teammates, delt oppgaveliste og per-agent sjekklister |

## Workspace (git worktree)

| Kommando | Beskrivelse |
|----------|-------------|
| `/14.0_workspace_start <navn>` | **Start** — opprett nytt workspace med egen branch og åpne VS Code |
| `/14.1_workspace_merge <navn>` | **Merge** — merge workspace-branch til feature, behold worktree |
| `/14.2_workspace_reload <navn>` | **Reload** — gjenåpne eksisterende workspace i VS Code |
| `/14.3_workspace_discard <navn>` | **Discard** — forkast workspace uten merge, slett worktree og branch |
| `/14.4_workspace_finish <navn>` | **Finish** — sjekk ucommittede endringer, merge til feature, rydd opp workspace |

## Git

| Kommando | Beskrivelse |
|----------|-------------|
| `/3.0_git_commit_all` | Commit alle endringer |
| `/3.0.1_build_check_fix_errors_git_commit_all` | Kjør build, fiks feil, og commit |
| `/3.1_git_merge_feature_to_main` | Commit alle endringer, merge til main branch lokalt og oppdater main remote branch. Gå deretter tilbake til feature |
