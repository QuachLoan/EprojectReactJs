# Feature Expansion Report — Frontend (2026-10-10)

Status: DONE = implemented and verified at the level stated; PARTIAL = see note; NOT RUN = not verified.

| # | Request | Status | Evidence / note |
|---|---|---|---|
| A | Invite many members | DONE | `utils/inviteSelection.js` (+4 tests), `InviteCombobox` `onPick`, `ProjectSetting` modal. Browser (mock API): suggestions, chips, duplicate/member refused, partial failure keeps only the failed person with its reason. Real backend: NOT RUN |
| B | Timeline line | DONE | `components/project/MilestoneTimeline.jsx`, `utils/milestoneLine.js` (+5 tests). Browser: markers ordered by date, positions proportional, add works, out-of-range date refused, no extra scrollbar at 1366/800/375. Edit is not offered: the notes API has no update (add/delete only). Notes outside the project dates are counted, not drawn |
| C1 | Backlog keeps pushed tasks | DONE | `ProjectList.jsx`; browser: all 3 mock tasks listed after load. The Push click itself: NOT RUN (needs the Leader role in the mock) |
| C2 | Status instead of Points | DONE | browser: headers `Title / Priority / Status / Week / Actions`; no column -> "Backlog" (not "Todo") |
| C3 | Manager Delete only in Todo | DONE (UI + backend rule) | `utils/backlog.js` (+3 tests); browser: Delete disabled with reason outside Todo. The Board drawer hides Delete outside Todo. **MyTasks and Calendar delete buttons are not gated in the UI**; the backend answers 409 and the dialog shows it: PARTIAL there |
| D | Checklist progress | DONE | `utils/checklist.js` (+3 tests), `TaskCard.jsx`; browser: `1/2 · 50%`, bar `aria-valuenow=50`; empty checklist shows nothing. Card refresh after toggle is wired (effect in the drawer) but the click itself: NOT RUN |
| E | Budget removed | DONE | `featureScope.test.js` greps the screens; browser: no "budget" text on the Dashboard; KPI = Total Projects, On-Time Rate, Tasks Completed |
| F | Notifications | PARTIAL | `utils/notificationRead.js` (+4 tests). Read state is per user in this browser, NOT on the backend (no notification API exists). Click -> read + navigate to My Tasks; "View all" -> all read. Browser: NOT RUN (mock had no expiring task) |
| G | Forgot password OTP | DONE (frontend) / email BLOCKED | browser: request -> `/resetPassword`, wrong code message, resend countdown, success -> `/login`. Real email delivery: BLOCKED (no SMTP configured) |
| H | Change password | DONE | browser: wrong current password shows the backend message; success closes the modal. Real backend: NOT RUN |

## Results
- `npm test`: 90 pass / 0 fail. `vite build`: OK. `oxlint`: only warnings that already existed.
- Headless Chrome against a mocked API (scratch script, not in the repo) for the browser items above.

## Notes for review
- `api.jsx`: `requestPasswordOtp`, `verifyPasswordOtp` (public, no logout on 401), `changePassword` (auth).
- Old `ForgetPassword` used `POST /user/check-email` (needs a token) and `/user/reset-password`; replaced. The backend retired `/user/reset-password` (410).
- Login.jsx (member demo-login with default password) was not touched.
