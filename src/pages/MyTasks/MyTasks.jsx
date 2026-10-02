import { useEffect, useState } from "react";
import NavTasks from "./Task/Task";
import Tasks from "./Task/Task";
function MyTasks(){
     const [activeTab, setActiveTab] = useState("all");
     const [isDrawerOpen, setIsDrawerOpen] = useState(false);
     const handleOpenDrawer = () => setIsDrawerOpen(true);
    const handleCloseDrawer = () => setIsDrawerOpen(false);
        const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
useEffect(() => {
    const loadMyTasks = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const res = await fetch(
                "http://localhost:3000/api/task/my-task",
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error(`HTTP error: ${res.status}`);
            }

            const data = await res.json();

            console.log("MY TASKS API:", data);

            setTasks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi lấy My Tasks:", error);
            setError("Không thể tải danh sách công việc.");
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    loadMyTasks();
}, []);
const filteredTasks = tasks.filter((task) => {
    if (!task.dueDate) return activeTab === "all";

    const today = new Date();
    const dueDate = new Date(task.dueDate);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (activeTab === "today") {
        return dueDate.getTime() === today.getTime();
    }

    if (activeTab === "upcoming") {
        return dueDate > today;
    }

    if (activeTab === "overdue") {
        return dueDate < today;
    }

    return true;
});
const getInitials = (name) => {
    if (!name) return "ME";

    const words = String(name).trim().split(/\s+/);

    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
};
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
                 
                        {!loading && !error && filteredTasks.length > 0 && (
                            <div className="card">
                                {filteredTasks.map((task) => (
                                    <button
                                        key={task._id}
                                        className="task-list-row"
                                        onClick={handleOpenDrawer}
                                    >
                                        <div className="task-list-title-cell">

                                            <div className="task-list-title-top">
                                                <span className="priority-badge">
                                                    {task.priority || "Normal"}
                                                </span>

                                                <span className="task-title-text">
                                                    {task.title}
                                                </span>
                                            </div>

                                            <div className="task-list-title-sub">

                                                <span className="task-list-project-name">
                                                    {task.projectId?.name || "No project"}
                                                </span>

                                                <span className="task-list-sub-meta">
                                                    <span
                                                        className="icon icon-xs"
                                                        data-icon="checkSquare"
                                                    >
                                                    </span>

                                                    {task.subtasks?.length || 0}
                                                </span>

                                            </div>
                                        </div>

                                        <span className="task-list-column-cell">

                                            <span
                                                className="project-color-dot"
                                                style={{
                                                    background:
                                                        task.projectId?.color || "#94a3b8"
                                                }}
                                            >
                                            </span>

                                            {task.columnId?.title || "No status"}

                                        </span>

                                        <span className="task-list-assignee-cell">
                                            <span className="avatar avatar-sm">
                                                {getInitials(
                                                    task.assignees?.[0]?.username || "Me"
                                                )}
                                            </span>
                                        </span>

                                        <span className="task-list-extra-labels">
                                        </span>

                                        <span className="task-list-due-cell">
                                            {task.dueDate
                                                ? new Date(task.dueDate).toLocaleDateString()
                                                : "No due date"}
                                        </span>

                                    </button>
                                ))}
                            </div>
                        )}
                    {loading && (
                        <div className="card">
                            <div className="empty-state">
                                <p className="empty-state-title">Loading tasks...</p>
                            </div>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="card">
                            <div className="empty-state">
                                <p className="empty-state-title">{error}</p>
                            </div>
                        </div>
                    )}

                    {!loading && !error && filteredTasks.length === 0 && (
                        <div className="card">
                            <div className="empty-state">
                                <p className="empty-state-title">No tasks here</p>
                                <p className="empty-state-desc">
                                    Nothing matches this view right now.
                                </p>
                            </div>
                        </div>
                    )}
                                
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