import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingDown, SearchX, LogIn } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import ErrorState from "../../../components/common/ErrorState.jsx";
import { failureMessage } from "../../../utils/requestState.js";
import { parseEpicBurndown, findCurrentWeek, getBurndownErrorKind } from "../../../utils/epicBurndown.js";
import { fetchEpicBurndown } from "../../../../api.jsx";
import { ChartTooltip, ChartLegend, ChartCard, ChartStats, LoadingBlock, EmptyBlock } from "../analytics/chartKit.jsx";
import { CHART_COLORS, AXIS_TICK, useNarrowScreen } from "../analytics/chartTheme.js";

const SERIES = [
    { key: "planned", name: "Planned", color: CHART_COLORS.plan, dashed: true },
    { key: "actual", name: "Actual", color: CHART_COLORS.actual },
];

/**
 * Epic Burndown of one project, straight from GET /task/project/:projectId/epic-burndown.
 * planned/actual/weeks/currentWeek are drawn exactly as the backend returns them — nothing is recalculated
 * here, and `actual: null` (future week) stays null so the Actual line simply stops.
 * The project picker and the live refresh (socket) live in ProjectAnalytics; `refreshToken` changes → refetch.
 */
function EpicBurndown({ projectId, projectName, refreshToken = 0, onReloadProjects }) {
    // last burndown answer: { projectId, reloadKey, data, error, invalid } — loading is derived from it
    const [result, setResult] = useState(null);
    const [retryKey, setRetryKey] = useState(0);
    const reloadKey = `${refreshToken}:${retryKey}`;

    const narrow = useNarrowScreen();

    useEffect(() => {
        if (!projectId) return;
        let cancelled = false;
        fetchEpicBurndown(projectId)
            .then((body) => {
                if (cancelled) return;
                const parsed = parseEpicBurndown(body);
                setResult({ projectId, reloadKey, data: parsed, error: null, invalid: !parsed });
            })
            .catch((err) => {
                if (cancelled) return;
                console.error("Error loading epic burndown:", err);
                setResult({ projectId, reloadKey, data: null, error: err, invalid: false });
            });
        return () => { cancelled = true; };
    }, [projectId, reloadKey]);

    const retry = () => setRetryKey((k) => k + 1);

    // an answer for another project is never shown under the selected one
    const current = result && result.projectId === projectId ? result : null;
    // waiting for the latest request; a refresh keeps the previous chart of the same project (dimmed)
    const loading = !current || current.reloadKey !== reloadKey;
    const data = current?.data || null;
    const error = loading ? null : current.error;
    const invalidResponse = !loading && current.invalid;
    const currentEntry = findCurrentWeek(data);

    let body;
    if (error) {
        const kind = getBurndownErrorKind(error);
        if (kind === "not-found") {
            body = (
                <EmptyBlock
                    icon={<SearchX className="icon" />}
                    title="Project not found"
                    desc="This project no longer exists. Reload the project list and pick another one."
                    action={onReloadProjects && <button type="button" className="btn btn-outline btn-sm" onClick={onReloadProjects}>Reload projects</button>}
                />
            );
        } else if (kind === "auth") {
            body = (
                <EmptyBlock
                    icon={<LogIn className="icon" />}
                    title="Your session has ended"
                    desc="Sign in again to see the burndown."
                    action={<Link to="/login" className="btn btn-outline btn-sm">Sign in</Link>}
                />
            );
        } else {
            body = (
                <ErrorState
                    title="Couldn't load the burndown"
                    message={failureMessage({ error })}
                    onRetry={retry}
                />
            );
        }
    } else if (invalidResponse) {
        body = (
            <ErrorState
                title="Couldn't read the burndown"
                message="The server sent burndown data in an unexpected format."
                onRetry={retry}
            />
        );
    } else if (!data) {
        body = <LoadingBlock text="Loading burndown…" className="burndown-loading" />;
    } else if (data.totalPoints === 0) {
        body = (
            <EmptyBlock
                icon={<TrendingDown className="icon" />}
                title="No story points yet"
                desc="Tasks in this project have no points, so there is nothing to burn down. Add points to tasks on the board."
                action={<Link to={`/projectboard/${projectId}`} className="btn btn-outline btn-sm">Open board</Link>}
                className="burndown-empty"
            />
        );
    } else {
        body = (
            <>
                <ChartStats items={[
                    { label: "Total points", value: data.totalPoints },
                    { label: "Current week", value: currentEntry ? currentEntry.week : `Week ${data.currentWeek}` },
                    currentEntry && currentEntry.actual !== null && { label: "Remaining", value: `${currentEntry.actual} pts` },
                    currentEntry && { label: "Planned now", value: `${currentEntry.planned} pts` },
                ]} />

                <ChartLegend series={SERIES} />
                <div className={`chart-canvas burndown-chart${loading ? " is-refreshing" : ""}`} aria-hidden="true">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.weeks} margin={{ top: 22, right: 12, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
                            <XAxis
                                dataKey="week"
                                interval={0}
                                padding={{ left: 12, right: narrow ? 8 : 24 }}
                                tick={AXIS_TICK}
                                angle={narrow ? -40 : 0}
                                textAnchor={narrow ? "end" : "middle"}
                                height={narrow ? 52 : 30}
                                tickLine={false}
                                axisLine={{ stroke: CHART_COLORS.grid }}
                            />
                            <YAxis allowDecimals={false} width={40} tick={AXIS_TICK} tickLine={false} axisLine={false} />
                            <Tooltip
                                content={<ChartTooltip series={SERIES} />}
                                cursor={{ stroke: CHART_COLORS.now, strokeDasharray: "4 4" }}
                            />
                            {currentEntry && (
                                <ReferenceLine
                                    x={currentEntry.week}
                                    stroke={CHART_COLORS.now}
                                    strokeDasharray="4 4"
                                    label={{ value: "Now", position: "top", fill: CHART_COLORS.axis, fontSize: 11 }}
                                />
                            )}
                            <Line
                                type="linear"
                                dataKey="planned"
                                name="Planned"
                                stroke={CHART_COLORS.plan}
                                strokeWidth={2}
                                strokeDasharray="6 4"
                                dot={{ r: 3, fill: CHART_COLORS.plan, strokeWidth: 0 }}
                                isAnimationActive={false}
                            />
                            {/* connectNulls off: future weeks (actual null) are a gap, never 0 or a guess */}
                            <Line
                                type="linear"
                                dataKey="actual"
                                name="Actual"
                                stroke={CHART_COLORS.actual}
                                strokeWidth={2.5}
                                connectNulls={false}
                                dot={{ r: 4, fill: CHART_COLORS.actual, stroke: "#fff", strokeWidth: 1.5 }}
                                activeDot={{ r: 5 }}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* the same backend values as text, for screen readers and for checking the chart */}
                <table className="sr-only burndown-table">
                    <caption>Epic burndown of {projectName || "the selected project"}</caption>
                    <thead>
                        <tr><th scope="col">Week</th><th scope="col">Planned</th><th scope="col">Actual</th></tr>
                    </thead>
                    <tbody>
                        {data.weeks.map((w) => (
                            <tr key={w.week} data-actual={w.actual === null ? "null" : w.actual}>
                                <th scope="row">{w.week}</th>
                                <td>{w.planned}</td>
                                <td>{w.actual === null ? "No data yet" : w.actual}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="chart-note">
                    Remaining story points per week from the project start. The Actual line stops at the current week.
                </p>
            </>
        );
    }

    return (
        <ChartCard
            id="burndown"
            className="burndown-card"
            title="Epic Burndown"
            subtitle="Remaining points: planned vs. actual"
            icon={<TrendingDown className="icon" />}
        >
            <div className="burndown-body" aria-busy={loading}>{body}</div>
        </ChartCard>
    );
}

export default EpicBurndown;
