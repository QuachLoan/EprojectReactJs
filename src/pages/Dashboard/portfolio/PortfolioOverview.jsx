import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Activity, FolderKanban, RotateCw, UsersRound, Wallet } from "lucide-react";
import ErrorState from "../../../components/common/ErrorState.jsx";
import { failureMessage } from "../../../utils/requestState.js";
import { avatarToneClass, getInitials } from "../../../utils/avatar.js";
import { budgetUsage, teamWorkload, portfolioKpis } from "../../../utils/portfolioStats.js";
import { ChartCard, LoadingBlock, EmptyBlock } from "../analytics/chartKit.jsx";

const money = (value) => `$${Math.round(value).toLocaleString("en-US")}`;
const TONE_LABEL = { ok: "On track", watch: "Watch", over: "Over budget" };

/**
 * Portfolio sections on the dashboard (progress, budget burn, team workload). Data comes from usePortfolioData()
 * (loaded once in Dashboard and shared with the KPI row). A project whose tasks failed to load is left out and reported.
 */
function PortfolioOverview({ state, reload }) {
    const view = useMemo(() => {
        const { loaded, progress, failed } = portfolioKpis(state.rows);
        const budgets = loaded.map((r, i) => budgetUsage(r.project, progress[i])).filter(Boolean);
        return {
            failed,
            progress: [...progress].sort((x, y) => (y.percent ?? -1) - (x.percent ?? -1)),
            budgets,
            workload: teamWorkload(loaded.map((r) => r.tasks), loaded.map((r) => r.members)),
            membersFailed: loaded.filter((r) => !r.members).length,
        };
    }, [state.rows]);

    const header = !state.loading && !state.error && (
        <div className="analytics-header analytics-header--end">
            <button type="button" className="btn btn-ghost btn-sm" onClick={reload}>
                <RotateCw className="icon icon-sm" aria-hidden="true" /> Refresh
            </button>
        </div>
    );

    if (state.loading) {
        return <section className="analytics" aria-label="Portfolio details">{header}<LoadingBlock text="Loading portfolio…" className="portfolio-loading" /></section>;
    }
    if (state.error) {
        return (
            <section className="analytics" aria-label="Portfolio details">
                {header}
                <ErrorState title="Couldn't load the portfolio" message={failureMessage({ error: state.error })} onRetry={reload} />
            </section>
        );
    }
    if (state.rows.length === 0) {
        return (
            <section className="analytics" aria-label="Portfolio details">
                {header}
                <div className="card">
                    <EmptyBlock
                        icon={<FolderKanban className="icon" />}
                        title="No projects yet"
                        desc="Create a project to see its progress, budget and workload here."
                        action={<Link className="btn btn-primary btn-sm" to="/project">Go to projects</Link>}
                        className="portfolio-empty"
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="analytics" aria-label="Portfolio details">
            {header}

            {view.failed > 0 && (
                <ErrorState
                    variant="inline"
                    title={`Tasks of ${view.failed} project${view.failed === 1 ? "" : "s"} couldn't be loaded.`}
                    message="Those projects are left out of the figures below."
                    onRetry={reload}
                />
            )}

            <div className="analytics-grid">
                <ChartCard id="portfolio-progress" title="Project progress" subtitle="Completed tasks / all tasks (status from the board)" icon={<Activity className="icon" />}>
                    {view.progress.length === 0 ? (
                        <p className="chart-note">No project data available.</p>
                    ) : (
                        <ul className="project-progress-list">
                            {view.progress.map((p) => (
                                <li key={p.id} className="project-progress-row">
                                    <Link to={`/projectboard/${p.id}`} className="project-progress-name" title={p.name}>
                                        <span className="project-color-dot" style={{ background: p.color || "var(--color-text-subtle)" }} aria-hidden="true" />
                                        {p.name}
                                    </Link>
                                    <span className="progress-bar" role="progressbar" aria-label={`${p.name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.percent ?? 0}>
                                        <span className="progress-bar-fill" style={{ width: `${p.percent ?? 0}%` }} />
                                    </span>
                                    <span className="project-progress-value">
                                        {p.percent === null ? "No tasks" : `${p.percent}% · ${p.completedPoints}/${p.points} pts`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </ChartCard>

                <ChartCard id="portfolio-budget" title="Budget burn" subtitle="Completed points × cost per point, against the project budget" icon={<Wallet className="icon" />}>
                    {view.budgets.length === 0 ? (
                        <p className="chart-note">No project has a budget yet. Set one in the project settings.</p>
                    ) : (
                        <ul className="budget-list">
                            {view.budgets.map((b) => (
                                <li key={b.id} className={`budget-row tone-${b.tone}`}>
                                    <div className="budget-row-head">
                                        <span className="project-progress-name" title={b.name}>
                                            <span className="project-color-dot" style={{ background: b.color || "var(--color-text-subtle)" }} aria-hidden="true" />
                                            {b.name}
                                        </span>
                                        {b.percent === null ? (
                                            <Link className="budget-row-link" to={`/projectsetting/${b.id}`}>Set cost per point</Link>
                                        ) : (
                                            <span className="budget-badge">{TONE_LABEL[b.tone]} · {b.percent}%</span>
                                        )}
                                    </div>
                                    {b.percent !== null && (
                                        <span className="progress-bar" role="progressbar" aria-label={`${b.name} budget used`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(b.percent, 100)}>
                                            <span className="progress-bar-fill" style={{ width: `${Math.min(b.percent, 100)}%` }} />
                                        </span>
                                    )}
                                    <p className="budget-row-meta">
                                        {b.percent === null
                                            ? `Budget ${money(b.budget)} · cost per point not set, so spending can't be calculated`
                                            : `${money(b.spent)} of ${money(b.budget)} · ${b.remaining < 0 ? `${money(-b.remaining)} over` : `${money(b.remaining)} left`}${b.plannedCost > b.budget ? ` · all planned points cost ${money(b.plannedCost)}` : ""}`}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </ChartCard>
            </div>

            <ChartCard id="portfolio-workload" title="Team workload" subtitle="Members and their tasks across your projects" icon={<UsersRound className="icon" />}>
                {view.workload.length === 0 ? (
                    <p className="chart-note">No member or assigned task yet.</p>
                ) : (
                    <>
                    {view.membersFailed > 0 && <p className="chart-note">Members of {view.membersFailed} project(s) could not be loaded: the list may be incomplete.</p>}
                    <div className="table-scroll">
                        <table className="workload-table">
                            <thead>
                                <tr>
                                    <th scope="col">Person</th>
                                    <th scope="col">Role</th>
                                    <th scope="col" className="is-num">Active</th>
                                    <th scope="col" className="is-num">Active points</th>
                                    <th scope="col" className="is-num">Completed</th>
                                    <th scope="col" className="is-num">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {view.workload.map((person) => (
                                    <tr key={person.id}>
                                        <td>
                                            <span className="workload-person">
                                                <span className={`avatar avatar-sm ${avatarToneClass(person.id)}`} aria-hidden="true">{getInitials(person.name)}</span>
                                                <span className="workload-person-text">
                                                    <span className="workload-person-name">{person.name}</span>
                                                    {person.email && <span className="workload-person-email">{person.email}</span>}
                                                </span>
                                            </span>
                                        </td>
                                        <td>{person.roles.length > 0 ? person.roles.join(", ") : "—"}</td>
                                        <td className="is-num">{person.active}</td>
                                        <td className="is-num">{person.activePoints}</td>
                                        <td className="is-num">{person.completed}</td>
                                        <td className="is-num"><strong>{person.total}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}
            </ChartCard>
        </section>
    );
}

export default PortfolioOverview;
