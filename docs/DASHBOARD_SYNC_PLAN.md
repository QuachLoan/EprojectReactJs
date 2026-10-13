# Dashboard Sync Plan and Status

| # | Item | Status |
|---|---|---|
| 1 | On-Time Rate | DONE |
| 2 | Team Workload: Role | DONE |
| 3 | Team Workload: users without tasks | DONE |
| 4 | Keep current charts, do not restore removed ones | DONE (nothing restored) |
| 5 | Nested scroll | DONE for the latent cause; the team's exact repro is UNVERIFIED |
| 6 | Remove fake data / false fallback in scope | DONE |
| 7 | API contract frontend/backend | DONE |
| 8 | Tests / rollback | DONE (see report) |

## 1. On-Time Rate
- Cause: backend counted `status === "done"`; empty data returned 100.
- Fix: `helper/onTimeRate.js` (pure) used by `project.Portfolio`. Formula, taken from the existing `task.js` Portfolio / weekly-expectancy rule: for every already-elapsed project week (capped at the last planned week) the week is on time when cumulative points completed by week end (task in the project's Done column, date = `completedDate || completedAt`) >= cumulative planned points (`week <= w`). Rate = on-time weeks / evaluated weeks over all projects, rounded. Project start = earliest task `createdAt`, else `project.startDate`.
- No evaluated week -> `onTimeRate: null` (UI shows "—"), never 100.
- Files: `helper/onTimeRate.js`, `controller/project.js`, `test/onTimeRate.test.js`, `KPI.jsx`.

## 2-3. Team Workload
- Source: `GET /member/project/:id` for every project in `GET /project` (existing endpoint; none added). Roster = Active members + task assignees. Role = distinct membership roles across projects (comma separated), "—" if the person has no membership. Counts are 0 for members without tasks.
- If members fail to load for a project the card says the list may be incomplete; no user is invented.
- Files: `utils/portfolioStats.js` (+ tests), `PortfolioOverview.jsx`.
- Limit: users who belong to no project are out of scope (the dashboard has no non-admin user listing).

## 5. Nested scroll
`.table-scroll` had `overflow-x:auto` only, which makes `overflow-y` compute to `auto`; added `overflow-y:hidden` (`components.css`). The single page scroller `.page-content` is unchanged; sidebar, modals and drawers untouched.

## 6. Fake data
The production Dashboard path has no hard-coded users or numbers. `OverViews/TeamWorkload.jsx` (static sample) stays unused. Fixtures exist only in unit tests.

## Rollback
Each repo is on branch `qa/dashboard-sync`; revert the commit or delete the branch. No data or migration changes.

## Round 2 (2026-10-10): KPI layout, On-Time = Plan adherence, nested scroll
| Item | Status |
|---|---|
| Portfolio health title/description, Plan adherence, Budget spent, People in scope removed | DONE |
| KPI order: Total Projects, On-Time Rate, Total Budget, Tasks Completed (one row on desktop) | DONE |
| On-Time Rate = former "Plan adherence (this week)" (same function) | DONE |
| Nested scroll | UNVERIFIED: not reproducible, see report |

- On-Time Rate source: per project `GET /task/project/:id/weekly-expectancy` -> `planAdherence()` (latest real progress / planned points of the current week, capped at 100, rounded) -> `averageAdherence()` over projects that have a plan. `portfolioKpis()` in `utils/portfolioStats.js` is the single implementation. No plan -> "—". The backend `onTimeRate` field is no longer used by the frontend (backend untouched).
- Data is loaded once in `Dashboard` (`portfolio/usePortfolioData.js`) and shared by `KPI` and `PortfolioOverview` (no double fetching).
- Kept: Project progress, Budget burn, Team workload (+Role, members without tasks), Project analytics. A "Refresh" button remains above these sections. Removed charts not restored.
