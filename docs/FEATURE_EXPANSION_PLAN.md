# Feature Expansion Plan — Frontend (2026-10-10)

Source: `EprojectReactJs-team-sync`, branch `fix/frontend-source-reconciliation`. Principle: reuse existing code/API; no new endpoint unless the backend lacked it.

| # | Request | Current behaviour | Plan | API |
|---|---|---|---|---|
| A | Invite many members | `ProjectSetting` invite modal took one email | Multi-select chips on the existing `InviteCombobox` (`onPick`); one `POST /member/invite` per person, sequential; per-person result; list reloaded from `GET /member/project/:id` | existing (no bulk endpoint) |
| B | Timeline line | `ProjectTimeline` is a Gantt by week; Calendar keeps date notes | New `MilestoneTimeline` in `ProjectOverview`: one horizontal line start -> end (`project.startDate` -> `project.date`), milestones = calendar notes (same records as Calendar) | existing `/note` GET/POST/DELETE |
| C | Backlog | Pushed tasks left the list; Points column; Delete for any manager | Keep all tasks (sorted by week); Status column = board column; Push only when not on board; Delete only in Todo (UI re-checks the stored task; backend enforces) | `DELETE /task/:id` now answers 409 outside Todo |
| D | Checklist progress on task card | count chip only | Progress bar `done/total` on `TaskCard`; board card refreshes after a checklist action in the drawer | existing |
| E | Remove Budget | Budget/Cost per Point fields, Total Budget KPI, Budget burn | Removed from Project/ProjectSetting forms+payloads, KPI, Dashboard; unused `Budgetusage.jsx`, `projectFinance.js` deleted | backend keeps the stored fields |
| F | Notifications | derived list of tasks due in 2 days, no read state | Click / "View all" marks read (per user, localStorage); list + badge show unread only | none: the backend has no notification entity |
| G | Forgot password OTP | public `check-email` + `reset-password` (no proof of ownership) | Step 1 request code, step 2 code + new password + resend cooldown; no OTP generated/shown in the frontend | new backend `/user/forgot-password/request`, `/verify` |
| H | Change password | none | "Change password" in the account menu -> modal | new backend `POST /user/change-password` |

Acceptance: unit tests per rule, build, lint (no new warnings), browser check on a mocked API for layout/flows. Real SMTP / MongoDB: not available here (NOT RUN).
