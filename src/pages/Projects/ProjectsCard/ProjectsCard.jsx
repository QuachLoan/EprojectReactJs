function ProjectsCard(){
    return(
    <>
        <div className="grid-cards">
            <a href="project-board.html" className="card project-card">
              <div className="project-card-top">
                <div className="project-title-row"><span className="project-color-dot" style={{ background: '#4f46e5' }}></span><span className="project-card-name">TeamFlow Platform</span></div>
                <span className="badge badge-success">On track</span>
              </div>
              <p className="project-card-desc">Kanban team task management system — the capstone product.</p>
              <div>
                <div className="project-card-progress-row"><span className="icon-inline"><span className="icon icon-sm" data-icon="listChecks"></span>4/14 tasks</span><span>29%</span></div>
                <div className="progress-bar"><span className="progress-bar-fill" style={{ width: '29%' }}></span></div>
              </div>
              <div className="project-card-footer">
                <span className="avatar-group">
                  <span className="avatar avatar-xs" style={{ background: '#4f46e5' }}>CS</span>
                  <span className="avatar avatar-xs" style={{ background: '#0ea5e9' }}>QL</span>
                  <span className="avatar avatar-xs" style={{ background: '#16a34a' }}>NL</span>
                  <span className="avatar avatar-xs" style={{ background: '#db2777' }}>KN</span>
                </span>
                <span className="project-card-footer-meta">
                  <span className="icon-inline"><span className="icon icon-sm" data-icon="usersRound"></span>4</span>
                  <span className="icon-inline"><span className="icon icon-sm" data-icon="calendarClock"></span>Sep 15, 2026</span>
                </span>
              </div>
            </a>

            <a href="project-board.html" className="card project-card">
              <div className="project-card-top">
                <div className="project-title-row"><span className="project-color-dot" style={{ background: '#0ea5e9' }}></span><span className="project-card-name">Marketing Website</span></div>
                <span className="badge badge-warning">At risk</span>
              </div>
              <p className="project-card-desc">Public marketing site and landing pages for launch.</p>
              <div>
                <div className="project-card-progress-row"><span className="icon-inline"><span className="icon icon-sm" data-icon="listChecks"></span>3/8 tasks</span><span>38%</span></div>
                <div className="progress-bar"><span className="progress-bar-fill" style={{ width: '38%' }}></span></div>
              </div>
              <div className="project-card-footer">
                <span className="avatar-group">
                  <span className="avatar avatar-xs" style={{ background: '#4f46e5' }}>CS</span>
                  <span className="avatar avatar-xs" style={{ background: '#0ea5e9' }}>QL</span>
                  <span className="avatar avatar-xs" style={{ background: '#16a34a' }}>NL</span>
                  <span className="avatar avatar-xs" style={{ background: '#db2777' }}>KN</span>
                </span>
                <span className="project-card-footer-meta">
                  <span className="icon-inline"><span className="icon icon-sm" data-icon="usersRound"></span>4</span>
                  <span className="icon-inline"><span className="icon icon-sm" data-icon="calendarClock"></span>Sep 5, 2026</span>
                </span>
              </div>
            </a>

            <a href="project-board.html" className="card project-card">
              <div className="project-card-top">
                <div className="project-title-row"><span className="project-color-dot" style={{ background: '#f59e0b' }}></span><span className="project-card-name">Mobile Companion App</span></div>
                <span className="badge badge-danger">Behind</span>
              </div>
              <p className="project-card-desc">React Native companion app for on-the-go task updates.</p>
              <div>
                <div className="project-card-progress-row"><span className="icon-inline"><span className="icon icon-sm" data-icon="listChecks"></span>2/7 tasks</span><span>29%</span></div>
                <div className="progress-bar"><span className="progress-bar-fill" style={{ width: '29%' }}></span></div>
              </div>
              <div className="project-card-footer">
                <span className="avatar-group">
                  <span className="avatar avatar-xs" style={{ background: '#4f46e5' }}>CS</span>
                  <span className="avatar avatar-xs" style={{ background: '#0ea5e9' }}>QL</span>
                  <span className="avatar avatar-xs" style={{ background: '#16a34a' }}>NL</span>
                  <span className="avatar avatar-xs" style={{ background: '#db2777' }}>KN</span>
                </span>
                <span className="project-card-footer-meta">
                  <span className="icon-inline"><span className="icon icon-sm" data-icon="usersRound"></span>4</span>
                  <span className="icon-inline"><span className="icon icon-sm" data-icon="calendarClock"></span>Oct 1, 2026</span>
                </span>
              </div>
            </a>

            <a href="project-board.html" className="card project-card">
              <div className="project-card-top">
                <div className="project-title-row"><span className="project-color-dot" style={{ background: '#16a34a' }}></span><span className="project-card-name">Internal Tooling</span></div>
                <span className="badge badge-neutral">Completed</span>
              </div>
              <p className="project-card-desc">Admin dashboards and internal automation scripts.</p>
              <div>
                <div className="project-card-progress-row"><span className="icon-inline"><span className="icon icon-sm" data-icon="listChecks"></span>5/8 tasks</span><span>63%</span></div>
                <div className="progress-bar"><span className="progress-bar-fill" style={{ width: '63%' }}></span></div>
              </div>
              <div className="project-card-footer">
                <span className="avatar-group">
                  <span className="avatar avatar-xs" style={{ background: '#4f46e5' }}>CS</span>
                  <span className="avatar avatar-xs" style={{ background: '#0ea5e9' }}>QL</span>
                  <span className="avatar avatar-xs" style={{ background: '#16a34a' }}>NL</span>
                  <span className="avatar avatar-xs" style={{ background: '#db2777' }}>KN</span>
                </span>
                <span className="project-card-footer-meta">
                  <span className="icon-inline"><span className="icon icon-sm" data-icon="usersRound"></span>4</span>
                  <span className="icon-inline"><span className="icon icon-sm" data-icon="calendarClock"></span>Aug 1, 2026</span>
                </span>
              </div>
            </a>
          </div>
    </>
    )
}
export default ProjectsCard;