# Dashboard Sync Report (2026-10-10)

## 1. Summary
On-Time Rate restored using a verified formula; Team Workload has a Role column and lists every active member (zeros when no tasks); removed charts were not restored; one latent nested-scroll cause fixed.

## 2-3. Initial state and commits
Both working trees clean (backend: 2 untracked doc files). Frontend base `5580efa`, backend base `7ab7c6e`. Details in `DASHBOARD_QA_BASELINE.md`.

## 4. Files changed
Frontend: `KPI.jsx`, `PortfolioOverview.jsx`, `utils/portfolioStats.js` and its test, `assets/style/components.css`, `docs/DASHBOARD_*.md`.
Backend: `helper/onTimeRate.js` (new), `controller/project.js`, `test/onTimeRate.test.js` (new), `docs/DASHBOARD_QA_BASELINE.md`.

## 6. API contract
`GET /api/project/portfolio` before: `{totalProjects,totalBudget,onTimeRate}` (done/total tasks, 100 if empty). After: the same fields plus `totalCompletedWeeks` and `totalOnTimeWeeks`; `onTimeRate` is an integer 0-100 or `null` when not measurable. The frontend handles null. Members endpoint unchanged.

## 7. Test results
- Backend `node --test`: 26 pass / 0 fail / 0 skip (6 new On-Time tests).
- Frontend `npm test`: 70 pass / 0 fail (2 new workload tests). `vite build` OK. `oxlint`: only pre-existing warnings in other files.
- Real browser (headless Chrome via CDP, Vite on an alternate port, **mocked API** from a scratchpad script; fixtures are not in the repo): On-Time "67%" shown; `null` shows "—" with a note; Role column present; a member with 0 tasks is listed with zeros; one vertical scroller (`main.page-content`) at 1366x768, 800x500, 375x667.

## 8. Not run / unverified
- Backend HTTP + real MongoDB integration (helper is unit-tested; controller wiring only syntax-checked). The live DB was not touched.
- The team's original nested-scroll screenshot scenario.
- Error / member-load-failure texts were not asserted in the browser (page stayed single-scroll).

## 9. Open issues
`task.js` Portfolio and its shadowed route `/task/project/portfolio` still return 100 when empty (unused). Backend role checks are not enforced (existing behaviour).

## 10. Re-run
Backend `npm test`; frontend `npm test`, `npm run build`, `npm run dev` with the backend on :3000 and compare `/api/project/portfolio`.

## 11. Rollback
Revert or delete branch `qa/dashboard-sync` in each repo.

## 12. Readiness
Ready for team QA on real data. Confirm the On-Time formula with the team and re-check the scroll repro.

## Round 2 (2026-10-10)
Files: `Dasboard.jsx`, `KPI/KPI.jsx`, `portfolio/PortfolioOverview.jsx`, `portfolio/usePortfolioData.js` (new), `utils/portfolioStats.js` (+ tests), `assets/style/components.css`.

- **Formula**: On-Time Rate = Plan adherence (this week), computed by `portfolioKpis().adherence.average`; tests assert equality with `averageAdherence(planAdherence(...))`, null stays null, `KPI.jsx` does not read the backend `onTimeRate` and has no hard-coded rate. Removed Dashboard widgets are asserted absent. Previous backend-based rate (week rule in `helper/onTimeRate.js`) stays on the backend, unused by the UI.
- **Nested scroll**: the screenshot (two vertical scrollbars) could NOT be reproduced. In headless Chrome (mocked API) at 1366x768, 1280x800, 800x500 and 375x667 the only vertical scroller is `main.page-content`; the document does not scroll, no horizontal overflow. The cause in the photo is therefore UNVERIFIED (candidates already handled: `.table-scroll` implicit overflow-y; the browser window/zoom of the photo may add its own scrollbar). If it still shows, send the viewport size and browser zoom.
- **KPI layout**: four cards in one row at 1366 and 1280 widths (equal height 104px via `.grid-stats .stat-card { min-height }`), 2x2 at 800, one column at 375.
- **Tests**: `npm test` 73 pass / 0 fail (3 new); `vite build` OK; oxlint: no warnings in changed files. Browser check used a mocked API (scratch script, not in the repo): it confirms layout/order only, the mock has no weekly-expectancy data so On-Time shows "—" there. Backend not touched and not verified against MongoDB.
