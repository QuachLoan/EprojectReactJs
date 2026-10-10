# GitHub Push Audit — Frontend (2026-10-10)

## Findings (verified with Git)
- `EprojectReactJs` and `EprojectReactJs-team-sync` are **two worktrees of the same repository** (`git worktree list`). Branches are shared.
- `feature/frontend-sync-ui` (`7930283`, worktree team-sync) is based on `8639c61`, i.e. on the **team lineage** (`team/main` = `4d12724` is one commit ahead: a Login.jsx demo-login change by another member).
- `qa/dashboard-sync` (`96c03de`) was built on local `main` (`5580efa`), whose history has **no common ancestor** with `team/main`. Pushing it published the whole unrelated local history as a branch of the team repository. It cannot be merged cleanly into `team/main`.
- Dashboard files at `5580efa` and at `7930283` were identical in content for the files touched by `96c03de`, so the dashboard change is portable. `7930283` additionally has `Budgetusage.jsx`, backend-sync work and many `src/utils/*` modules.
- Cause: the QA task started from the `main` checkout instead of the `team-sync` worktree. Confirmed by `git merge-base` (empty) and `git log`.
- `*.md` is in `.gitignore`: the three `DASHBOARD_*.md` QA docs were never part of `96c03de`. They are now added with `git add -f`.

## GitHub state before repair (`team` = QuachLoan/EprojectReactJs)
| Branch | Commit | Note |
|---|---|---|
| `main` | `4d12724` | unchanged |
| `feature/frontend-sync-ui` | `7930283` | official sync work, base `8639c61` |
| `qa/dashboard-sync` | `96c03de` | wrong lineage (unrelated history). Left untouched, not deleted, not force-pushed |

## Repair
New branch `fix/frontend-source-reconciliation`, created from `team/main` (`4d12724`):
1. `2629836` merge `feature/frontend-sync-ui` (related history, `--no-ff`). One conflict, `src/pages/Login/Login.jsx`: kept `team/main` version (the member's demo-login) and re-applied the sync changes (`API_BASE_URL`, `translateBackendMessage`, English messages), also in the demo-login fetch. Note: that demo-login (from `team/main`) contains demo accounts and a default password in source; it was not introduced here.
2. `1c5120a` cherry-pick of `96c03de` (On-Time Rate card, Role column, members without tasks, `.table-scroll` fix). Applied cleanly.
3. Docs commit: `DASHBOARD_*.md` and this file.

## Tests (team-sync worktree, branch above)
- `npm test`: 70 pass / 0 fail. `vite build`: OK. `oxlint`: only warnings already present in other files.
- Browser test with mocked API was done earlier on identical dashboard files; not repeated on this branch. NOT RUN.

## Not done
No push to `main`, no force push, no branch deleted. The old `qa/dashboard-sync` remains on GitHub; the team may delete it.

## PR guidance
Open a PR `fix/frontend-source-reconciliation` -> `main` (shared history). Review `Login.jsx` resolution first.
