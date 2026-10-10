import { useState, useEffect } from 'react';
import { CheckCircle2, FolderKanban, Loader2, Wallet } from 'lucide-react';
import ErrorState from '../../../components/common/ErrorState.jsx';
import { failureMessage } from '../../../utils/requestState.js';
import { fetchPortfolio } from '../../../../api.jsx';

/**
 * Workspace statistics from GET /project/portfolio ({ totalProjects, totalBudget, onTimeRate }).
 * Shown: Total Projects, On-Time Rate and Total Budget.
 * onTimeRate = % of already elapsed project weeks where real progress >= planned progress (backend helper/onTimeRate.js,
 * same rule as the weekly expectancy chart). It is null until a week can be evaluated: shown as "—", never 0% or 100%.
 * Never GET /task/project/portfolio: that route is shadowed by GET /task/project/:id on the backend.
 */
function KPI() {
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    // request failed: show the error, never 0
    const [loadError, setLoadError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        fetchPortfolio()
            .then((data) => {
                if (cancelled) return;
                setPortfolio(data || null);
                setLoading(false);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error("Lỗi khi đồng bộ dữ liệu KPI:", err);
                setLoadError(err);
                setLoading(false);
            });
        return () => { cancelled = true; };
    }, [reloadKey]);

    const retryLoad = () => {
        setLoadError(null);
        setLoading(true);
        setReloadKey((k) => k + 1);
    };

    if (loading) {
        return (
            <div className="page-loading kpi-loading" role="status">
                <Loader2 className="icon animate-spin" aria-hidden="true" />
                <span>Loading workspace statistics…</span>
            </div>
        );
    }

    if (loadError) {
        return (
            <ErrorState
                title="Couldn't load workspace statistics"
                message={failureMessage({ error: loadError })}
                onRetry={retryLoad}
            />
        );
    }

    const totalProjects = Number(portfolio?.totalProjects);
    const totalBudget = Number(portfolio?.totalBudget);
    // null/missing stays "unknown": Number(null) would turn it into 0
    const onTimeRate = typeof portfolio?.onTimeRate === "number" && Number.isFinite(portfolio.onTimeRate) ? portfolio.onTimeRate : null;
    // a response without the number is not a 0: show nothing rather than a made-up value
    if (!Number.isFinite(totalProjects)) return null;

    return (
        <section className="grid-stats" aria-label="Workspace statistics">
            <div className="card stat-card">
                <span className="stat-card-icon tone-primary" aria-hidden="true">
                    <FolderKanban className="icon" />
                </span>
                <div>
                    <p className="stat-card-label">Total Projects</p>
                    <p className="stat-card-value">{totalProjects}</p>
                </div>
            </div>
            <div className="card stat-card">
                <span className="stat-card-icon tone-success" aria-hidden="true">
                    <CheckCircle2 className="icon" />
                </span>
                <div>
                    <p className="stat-card-label">On-Time Rate</p>
                    <p className="stat-card-value">{onTimeRate === null ? "—" : `${onTimeRate}%`}</p>
                    {onTimeRate === null && <p className="chart-note">No elapsed week to measure yet</p>}
                </div>
            </div>
            {Number.isFinite(totalBudget) && (
                <div className="card stat-card">
                    <span className="stat-card-icon tone-warning" aria-hidden="true">
                        <Wallet className="icon" />
                    </span>
                    <div>
                        <p className="stat-card-label">Total Budget</p>
                        <p className="stat-card-value">{totalBudget.toLocaleString("en-US")}</p>
                    </div>
                </div>
            )}
        </section>
    );
}

export default KPI;
