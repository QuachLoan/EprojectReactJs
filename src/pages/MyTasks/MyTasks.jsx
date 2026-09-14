import { useState } from "react";
import FilterBar from "./FilterBar/FilterBar";
import NavTasks from "./Task/Task";
import Tasks from "./Task/Task";
function MyTasks(){
     const [activeTab, setActiveTab] = useState("all");
     const [isDrawerOpen, setIsDrawerOpen] = useState(false);
     const handleOpenDrawer = () => setIsDrawerOpen(true);
    const handleCloseDrawer = () => setIsDrawerOpen(false);
    return(
    <>
        <main className="page-content">
            <div className="page-content-inner stack" style={{ gap: 'var(--space-4)' }}>
                    <div><h1>My Tasks</h1><p className="page-subtitle">Everything assigned to you across all projects.</p></div>
                    <div className="pill-tabs">
                    <button className={`pill-tab ${activeTab === "all" ? "active" : ""}`} onClick={()=>setActiveTab('all')} data-tab-group="myTasks" data-tab="all">All</button>
                    <button className={`pill-tab ${activeTab === "today" ? "active" : ""}`} onClick={()=>setActiveTab('today')} data-tab-group="myTasks" data-tab="today">Today</button>
                    <button className={`pill-tab ${activeTab === "upcoming" ? "active" : ""}`} onClick={()=>setActiveTab('upcoming')} data-tab-group="myTasks" data-tab="upcoming">Upcoming</button>
                    <button className={`pill-tab ${activeTab === "overdue" ? "active" : ""}`} onClick={()=>setActiveTab('overdue')} data-tab-group="myTasks" data-tab="overdue">Overdue</button>
                </div>
                 <FilterBar/>
                 {
                    activeTab ==="all" && (
                    <div className="card" data-tab-panel="myTasks" data-tab="all">
                        <button className="task-list-row" onClick={handleOpenDrawer}>
                        <div className="task-list-title-cell"><div className="task-list-title-top"><span className="priority-badge" style={{ color: '#2563eb', background: '#eff6ff' }}><span className="icon icon-xs" data-icon="arrowDown"></span></span><span className="task-title-text">Prepare capstone presentation</span></div>
                            <div className="task-list-title-sub"><span className="task-list-project-name">TeamFlow Platform</span><span className="task-list-sub-meta"><span className="icon icon-xs" data-icon="checkSquare"></span>0/2</span></div></div>
                        <span className="task-list-column-cell"><span className="project-color-dot" style={{ background: '#94a3b8' }}></span>Todo</span>
                        <span className="task-list-assignee-cell"><span className="avatar avatar-sm" style={{ background: '#4f46e5' }}>CS</span></span>
                        <span className="task-list-extra-labels"></span>
                        <span className="task-list-due-cell">Sep 14</span>
                        </button>
                        <button className="task-list-row" onClick={() => {}}>
                        <div className="task-list-title-cell"><div className="task-list-title-top"><span className="priority-badge" style={{ color: '#f97316', background: '#fff7ed' }}><span className="icon icon-xs" data-icon="arrowUp"></span></span><span className="task-title-text">Task detail drawer</span></div>
                            <div className="task-list-title-sub"><span className="task-list-project-name">TeamFlow Platform</span><span className="task-list-sub-meta"><span className="icon icon-xs" data-icon="checkSquare"></span>5/5</span><span className="task-list-sub-meta"><span className="icon icon-xs" data-icon="messageSquare"></span>4</span></div></div>
                        <span className="task-list-column-cell"><span className="project-color-dot" style={{ background: '#9333ea' }}></span>Review</span>
                        <span className="task-list-assignee-cell"><span className="avatar avatar-sm" style={{ background: '#4f46e5' }}>CS</span></span>
                        <span className="task-list-extra-labels"></span>
                        <span className="task-list-due-cell due-overdue">Aug 25</span>
                        </button>
                        <button className="task-list-row" onClick={() => {}}>
                        <div className="task-list-title-cell"><div className="task-list-title-top"><span className="priority-badge" style={{ color: '#2563eb', background: '#eff6ff' }}><span className="icon icon-xs" data-icon="arrowDown"></span></span><span className="task-title-text">Write documentation</span></div>
                            <div className="task-list-title-sub"><span className="task-list-project-name">TeamFlow Platform</span><span className="task-list-sub-meta"><span className="icon icon-xs" data-icon="checkSquare"></span>3/3</span><span className="task-list-sub-meta"><span className="icon icon-xs" data-icon="messageSquare"></span>2</span></div></div>
                        <span className="task-list-column-cell"><span className="project-color-dot" style={{ background: '#16a34a' }}></span>Done</span>
                        <span className="task-list-assignee-cell"><span className="avatar avatar-sm" style={{ background: '#4f46e5' }}>CS</span></span>
                        <span className="task-list-extra-labels"></span>
                        <span className="task-list-due-cell">Aug 20</span>
                        </button>
                        <button className="task-list-row" onClick={() => {}}>
                        <div className="task-list-title-cell"><div className="task-list-title-top"><span className="priority-badge" style={{ color: '#f59e0b', background: '#fffbeb' }}><span className="icon icon-xs" data-icon="minus"></span></span><span className="task-title-text">User research interviews</span></div>
                    <div className="task-list-title-sub"><span className="task-list-project-name">TeamFlow Platform</span><span className="task-list-sub-meta"><span className="icon icon-xs" data-icon="checkSquare"></span>5/5</span><span className="task-list-sub-meta"><span className="icon icon-xs" data-icon="messageSquare"></span>3</span></div></div>
                        <span className="task-list-column-cell"><span className="project-color-dot" style={{ background: '#16a34a' }}></span>Done</span>
                        <span className="task-list-assignee-cell"><span className="avatar avatar-sm" style={{ background: '#4f46e5' }}>CS</span></span>
                        <span className="task-list-extra-labels"></span>
                        <span className="task-list-due-cell">Aug 10</span>
                        </button>
                    </div>

                    )
                 }
                 {
                    activeTab === "today" && (
                        <div className="card" data-tab-panel="myTasks" data-tab="today">
                            <div className="empty-state">
                            <span className="empty-state-icon"><span className="icon icon-lg" data-icon="listTodo"><svg viewBox="0 0 24 24"><path d="M13 5h8"></path><path d="M13 12h8"></path><path d="M13 19h8"></path><path d="m3 17 2 2 4-4"></path><rect x="3" y="4" width="6" height="6" rx="1"></rect></svg></span></span>
                            <p className="empty-state-title">No tasks here</p>
                            <p className="empty-state-desc">Nothing matches this view right now.</p>
                        </div>
                    </div>
                     )
                }
                {
                    activeTab === "upcoming" &&(
                      <div className="card" data-tab-panel="myTasks" data-tab="upcoming">
                          <button className="task-list-row">
                          <div className="task-list-title-cell"><div className="task-list-title-top"><span className="priority-badge" style={{ color: '#2563eb', background: '#eff6ff' }}><span className="icon icon-xs" data-icon="arrowDown"><svg viewBox="0 0 24 24"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg></span></span><span className="task-title-text">Prepare capstone presentation</span></div>
                          <div className="task-list-title-sub"><span className="task-list-project-name">TeamFlow Platform</span><span className="task-list-sub-meta"><span className="icon icon-xs" data-icon="checkSquare"></span>0/2</span></div></div>
                          <span className="task-list-column-cell"><span className="project-color-dot" style={{ background: '#94a3b8' }}></span>Todo</span>
                          <span className="task-list-assignee-cell"><span className="avatar avatar-sm" style={{ background: '#4f46e5' }}>CS</span></span>
                          <span className="task-list-extra-labels"></span>
                          <span className="task-list-due-cell">Sep 14</span>
                    </button>
                </div>
                    )
                }
                {
                    activeTab === "overdue" && (
                        <div className="card" data-tab-panel="myTasks" data-tab="overdue">
                            <button className="task-list-row">
                            <div className="task-list-title-cell"><div className="task-list-title-top"><span className="priority-badge" style={{ color: '#f97316', background: '#fff7ed' }}><span className="icon icon-xs" data-icon="arrowUp"><svg viewBox="0 0 24 24"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg></span></span><span className="task-title-text">Task detail drawer</span></div>
                                <div className="task-list-title-sub"><span className="task-list-project-name">TeamFlow Platform</span><span className="task-list-sub-meta"><span className="icon icon-xs" data-icon="checkSquare"></span>5/5</span><span className="task-list-sub-meta"><span className="icon icon-xs" data-icon="messageSquare"></span>4</span></div></div>
                            <span className="task-list-column-cell"><span className="project-color-dot" style={{ background: '#9333ea' }}></span>Review</span>
                            <span className="task-list-assignee-cell"><span className="avatar avatar-sm" style={{ background: '#4f46e5' }}>CS</span></span>
                            <span className="task-list-extra-labels"></span>
                            <span className="task-list-due-cell due-overdue">Aug 25</span>
                            </button>
                        </div>

                    )
                }
            
            </div>
          </main>
                <div className={`drawer-overlay ${isDrawerOpen ? "" : "hidden"}`} id="taskDrawer">
     <div className="drawer-panel">
            <div className="drawer-header">
                <div className="drawer-header-meta"><span className="priority-badge" style={{ color: '#2563eb', background: '#eff6ff' }}><span className="icon icon-xs" data-drawer-priority-icon data-icon="arrowDown"><svg viewBox="0 0 24 24"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg></span><span data-drawer-priority-label>Low</span></span><span data-drawer-updated>Updated Aug 12, 2026</span></div>
                <button className="icon-btn" onClick={handleCloseDrawer} aria-label="Close panel"><span className="icon" data-icon="x"><svg viewBox="0 0 24 24"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></span></button>
      </div>
            <div className="drawer-body">
                <textarea className="drawer-title-input" rows="1" data-drawer-title></textarea>
                <div className="drawer-field-grid">
                    <div><span className="drawer-field-label">Status</span><select className="select" data-drawer-status><option value="c0">Todo</option><option value="c1">In Progress</option><option value="c2">Review</option><option value="c3">Done</option></select></div>
                    <div><span className="drawer-field-label">Priority</span><select className="select" data-drawer-priority-select><option value="urgent">Urgent</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                    <div><span className="drawer-field-label">Due date</span><input className="input" type="date" data-drawer-due /></div>
                    <div><span className="drawer-field-label">Assignees</span><div className="drawer-assignee-list" data-drawer-assignees><span className="avatar avatar-sm" style={{ background: '#4f46e5' }} title="Cao Sơn">CS</span></div></div>
        </div>
                <div><span className="drawer-field-label">Labels</span><div className="drawer-label-list" data-drawer-labels><span className="label-chip" style={{ color: '#f59e0b', background: '#f59e0b1a' }}>Documentation</span></div></div>
                <div><span className="drawer-field-label">Description</span><textarea className="textarea" rows="3" placeholder="Add a more detailed description…" data-drawer-description></textarea></div>
                <div className="drawer-section">
                    <div className="checklist-header"><span className="comments-title">Checklist</span><span className="checklist-count" data-drawer-checklist-count>0/2</span></div>
                    <div className="progress-bar"><span className="progress-bar-fill tone-success" data-drawer-checklist-progress style={{ width: '0%' }}></span></div>
                    <div className="checklist-items" data-drawer-checklist-items><label className="checklist-item" data-index="0"><input type="checkbox" className="checkbox" /><span className="checklist-text">Gather requirements</span></label><label className="checklist-item" data-index="1"><input type="checkbox" className="checkbox" /><span className="checklist-text">Draft initial implementation</span></label></div>
                    <div className="checklist-add-row"><input className="input" placeholder="Add checklist item…" /><button className="checklist-add-btn" aria-label="Add checklist item"><span className="icon icon-sm" data-icon="plus"><svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></span></button></div>
        </div>
                <div className="drawer-section">
                    <p className="comments-title" data-drawer-comments-title>Comments</p>
                    <div className="comments-list" data-drawer-comments-list><div className="empty-state" style={{ padding: '24px 0' }}><p className="empty-state-title">No comments yet</p><p className="empty-state-desc">Start the discussion below.</p></div></div>
                    <div className="comment-form"><textarea className="textarea" rows="2" placeholder="Write a comment…"></textarea><div className="comment-form-actions"><button className="btn btn-primary btn-sm">Send<span className="icon icon-sm" data-icon="send"><svg viewBox="0 0 24 24"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path></svg></span></button></div></div>
        </div>
                <div className="drawer-section"><p className="comments-title" style={{ marginBottom: '12px' }}>Activity</p><ol className="timeline" data-drawer-activity><li className="timeline-item"><span className="timeline-icon action-created"><span className="icon icon-sm" data-icon="plusCircle"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg></span></span><div className="timeline-content"><p className="timeline-text"><strong>Cao Sơn</strong> created "Prepare capstone presentation"</p><p className="timeline-time">8 days ago</p></div><span className="timeline-actor-avatar avatar avatar-xs" style={{ background: '#4f46e5' }}>CS</span></li><li className="timeline-item"><span className="timeline-icon action-assigned"><span className="icon icon-sm" data-icon="userPlus"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg></span></span><div className="timeline-content"><p className="timeline-text"><strong>Cao Sơn</strong> assigned "Prepare capstone presentation" to themselves</p><p className="timeline-time">8 days ago</p></div><span className="timeline-actor-avatar avatar avatar-xs" style={{ background: '#4f46e5' }}>CS</span></li></ol></div>
                <div className="drawer-section"><button className="btn btn-outline btn-full" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)' }} data-drawer-delete><span className="icon icon-sm" data-icon="trash2"><svg viewBox="0 0 24 24"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></span>Delete task</button></div>
      </div>
    </div>
    </div>
        </>
    )
}
export default MyTasks;