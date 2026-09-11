function TaskCompletion(){
    return(
    <>
    <div className="card panel">
              <h2 className="panel-title">Task Completion</h2>
              <div className="donut-chart-row">
                <div className="donut-chart">
                  <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="48" cy="48" r="42" fill="none" stroke="var(--color-border)" strokeWidth="12" />
                    <circle cx="48" cy="48" r="42" fill="none" stroke="var(--color-success)" strokeWidth="12" strokeDasharray="106 264" strokeDashoffset="0" />
                    <circle cx="48" cy="48" r="42" fill="none" stroke="var(--color-warning)" strokeWidth="12" strokeDasharray="47 264" strokeDashoffset="-106" />
                    <circle cx="48" cy="48" r="42" fill="none" stroke="var(--color-danger)" strokeWidth="12" strokeDasharray="19 264" strokeDashoffset="-153" />
                  </svg>
                  <span className="donut-chart-label">38%</span>
                </div>
                <div className="donut-legend">
                  <span className="donut-legend-item"><span className="donut-legend-dot" style={{ background: 'var(--color-success)' }}></span>Completed <span className="donut-legend-value">14</span></span>
                  <span className="donut-legend-item"><span className="donut-legend-dot" style={{ background: 'var(--color-warning)' }}></span>In Progress <span className="donut-legend-value">6</span></span>
                  <span className="donut-legend-item"><span className="donut-legend-dot" style={{ background: 'var(--color-danger)' }}></span>Overdue <span className="donut-legend-value">3</span></span>
                </div>
              </div>
        </div>
    </>
    )
}
export default TaskCompletion;