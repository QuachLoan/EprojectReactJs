import React, { useState, useEffect } from 'react';
import {
    KanbanSquare,
    LayoutDashboard,
    ListTodo,
    FolderKanban,
    Users,
    ShieldCheck,
    Flag,
    ChevronsLeft,
    ChevronsRight,
    Menu,
    Search,
    Plus,
    ListPlus,
    FolderPlus,
    LogOut,
    X,
    UsersRound,
    ListChecks,
    CalendarClock,
    Settings,
    LayoutGrid,
    List,
    Calendar,
    Activity,
    ChevronLeft,
    ChevronRight,
    ChevronsUp,
    ArrowUp,
    ArrowDown,
    Minus,
    CheckSquare,
    MessageSquare,
    Send,
    Trash2,
    CheckCircle2,
    XCircle,
    Info
} from 'lucide-react';

import {
    fetchProjectById,
    fetchMembers,
    fetchColumns,
    fetchTasksByProject,
    fetchTaskById,
    createTask,
    updateTask,
    deleteTask,
    createProject,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    fetchTaskComments,
    addComment,
    deleteComment,
    fetchTaskActivities
} from '../../../api';

export default function ProjectCalendar({ projectId = 'p1' }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [commandQuery, setCommandQuery] = useState('');
    const [toasts, setToasts] = useState([]);

    // Navigation calendar state (mặc định tháng 9/2026)
    const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1));

    // Core Data
    const [project, setProject] = useState({ name: '', desc: '', dueDate: '', color: '#4f46e5' });
    const [members, setMembers] = useState([]);
    const [columns, setColumns] = useState([]);
    const [tasks, setTasks] = useState([]);

    // Task Drawer & Sub-resources
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskComments, setTaskComments] = useState([]);
    const [taskActivities, setTaskActivities] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [newChecklistText, setNewChecklistText] = useState('');

    // Forms
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskColumn, setNewTaskColumn] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');

    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const [newProjectDueDate, setNewProjectDueDate] = useState('');

    useEffect(() => {
        loadProjectData();
    }, [projectId]);

    const loadProjectData = async () => {
        try {
            const pData = await fetchProjectById(projectId).catch(() => ({
                name: 'TeamFlow Platform',
                desc: 'Kanban team task management system — the capstone product.',
                dueDate: 'Sep 15, 2026',
                color: '#4f46e5'
            }));
            setProject(pData);

            const mems = await fetchMembers(projectId).catch(() => []);
            setMembers(mems);

            const cols = await fetchColumns(projectId).catch(() => [
                { id: 'c0', name: 'Todo', color: '#94a3b8' },
                { id: 'c1', name: 'In Progress', color: '#f59e0b' },
                { id: 'c2', name: 'Review', color: '#9333ea' },
                { id: 'c3', name: 'Done', color: '#16a34a' }
            ]);
            setColumns(cols);
            if (cols.length > 0) setNewTaskColumn(cols[0].name);

            const tskList = await fetchTasksByProject(projectId).catch(() => []);
            setTasks(tskList);
        } catch (err) {
            showToast('Lỗi tải dữ liệu', 'Không thể kết nối đến máy chủ', 'error');
        }
    };

    const handleOpenTaskDrawer = async (task) => {
        setSelectedTask(task);
        try {
            const fullTask = await fetchTaskById(task.id).catch(() => task);
            setSelectedTask(fullTask);

            const comments = await fetchTaskComments(task.id).catch(() => []);
            setTaskComments(comments);

            const activities = await fetchTaskActivities(task.id).catch(() => []);
            setTaskActivities(activities);
        } catch (err) {
            console.error(err);
        }
    };

    const showToast = (title, description = null, variant = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, title, description, variant }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    // Modern Calendar Grid Calculation (Mon -> Sun)
    const getCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Bắt đầu từ thứ 2 (0: Mon, 6: Sun)
        let startDayOfWeek = firstDayOfMonth.getDay() - 1;
        if (startDayOfWeek === -1) startDayOfWeek = 6;

        const days = [];

        // Lấp đầy các ngày thuộc tháng trước
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthLastDay - i),
                isCurrentMonth: false
            });
        }

        // Lấp đầy các ngày trong tháng hiện tại
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }

        // Lấp đầy cho tròn tuần (bội số của 7)
        const totalSlots = Math.ceil(days.length / 7) * 7;
        const remainingSlots = totalSlots - days.length;
        for (let i = 1; i <= remainingSlots; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            });
        }

        return days;
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleCreateTaskSubmit = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const created = await createTask({
                title: newTaskTitle,
                projectId,
                column: newTaskColumn,
                priority: newTaskPriority,
                dueDate: newTaskDueDate
            });
            setTasks((prev) => [...prev, created || {
                id: `task-${Date.now()}`,
                title: newTaskTitle,
                column: newTaskColumn,
                priority: newTaskPriority,
                dueDate: newTaskDueDate,
                checklists: [],
                comments: []
            }]);
            showToast('Task created', 'Open the board to see it added live.', 'success');
            setNewTaskTitle('');
            setActiveModal(null);
        } catch (err) {
            showToast('Lỗi', 'Không thể tạo task mới', 'error');
        }
    };

    const handleCreateProjectSubmit = async (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        try {
            await createProject({
                name: newProjectName,
                desc: newProjectDesc,
                dueDate: newProjectDueDate
            });
            showToast('Project created', '“Your project” is ready to go.', 'success');
            setNewProjectName('');
            setNewProjectDesc('');
            setActiveModal(null);
        } catch (err) {
            showToast('Lỗi', 'Không thể tạo dự án mới', 'error');
        }
    };

    const handleDeleteTask = async () => {
        if (!selectedTask) return;
        try {
            await deleteTask(selectedTask.id);
            setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
            setSelectedTask(null);
            setActiveModal(null);
            showToast('Đã xóa công việc', null, 'success');
        } catch (err) {
            showToast('Lỗi', 'Không thể xóa công việc', 'error');
        }
    };

    const handleAddChecklist = async () => {
        if (!newChecklistText.trim() || !selectedTask) return;
        try {
            const item = await addChecklistItem(selectedTask.id, newChecklistText);
            const updatedChecklist = [...(selectedTask.checklists || []), item || { id: Date.now(), text: newChecklistText, completed: false }];
            setSelectedTask({ ...selectedTask, checklists: updatedChecklist });
            setNewChecklistText('');
        } catch (err) {
            showToast('Lỗi', 'Không thể thêm checklist', 'error');
        }
    };

    const handleToggleChecklist = async (itemId, currentStatus) => {
        if (!selectedTask) return;
        try {
            await toggleChecklistItem(selectedTask.id, itemId, !currentStatus);
            const updatedChecklist = (selectedTask.checklists || []).map((c) =>
                c.id === itemId ? { ...c, completed: !currentStatus } : c
            );
            setSelectedTask({ ...selectedTask, checklists: updatedChecklist });
        } catch (err) {
            showToast('Lỗi', 'Không thể cập nhật trạng thái', 'error');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || !selectedTask) return;
        try {
            const newCmt = await addComment(selectedTask.id, newCommentText);
            setTaskComments((prev) => [...prev, newCmt || { id: Date.now(), user: 'Cao Sơn', avatarBg: '#4f46e5', userInitials: 'CS', content: newCommentText, createdAt: 'Just now' }]);
            setNewCommentText('');
        } catch (err) {
            showToast('Lỗi', 'Không thể gửi bình luận', 'error');
        }
    };

    const renderPriorityDotColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent': return '#dc2626';
            case 'high': return '#f97316';
            case 'low': return '#2563eb';
            default: return '#f59e0b';
        }
    };

    const renderPriorityIcon = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent': return <ChevronsUp className="icon icon-xs" style={{ color: '#dc2626' }} />;
            case 'high': return <ArrowUp className="icon icon-xs" style={{ color: '#f97316' }} />;
            case 'low': return <ArrowDown className="icon icon-xs" style={{ color: '#2563eb' }} />;
            default: return <Minus className="icon icon-xs" style={{ color: '#f59e0b' }} />;
        }
    };

    const renderPriorityBadgeStyle = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent': return { color: '#dc2626', background: '#fef2f2' };
            case 'high': return { color: '#f97316', background: '#fff7ed' };
            case 'low': return { color: '#2563eb', background: '#eff6ff' };
            default: return { color: '#f59e0b', background: '#fffbeb' };
        }
    };

    const daysGrid = getCalendarDays();
    const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="app-shell">
            <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarMobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand">
                    <KanbanSquare className="sidebar-brand-logo icon" />
                    <span className="sidebar-brand-name">TeamFlow</span>
                </div>
                <div className="sidebar-workspace">
                    <p className="sidebar-workspace-label">Workspace</p>
                    <p className="sidebar-workspace-name">Aptech Capstone Team</p>
                </div>
                <nav className="sidebar-nav">
                    <a href="dashboard.html" className="nav-item">
                        <LayoutDashboard className="icon" />
                        <span className="nav-label">Dashboard</span>
                    </a>
                    <a href="my-tasks.html" className="nav-item">
                        <ListTodo className="icon" />
                        <span className="nav-label">My Tasks</span>
                    </a>
                    <a href="projects.html" className="nav-item active">
                        <FolderKanban className="icon" />
                        <span className="nav-label">Projects</span>
                    </a>
                    <a href="members.html" className="nav-item">
                        <Users className="icon" />
                        <span className="nav-label">Members</span>
                    </a>
                    <p className="sidebar-section-label">Admin</p>
                    <a href="admin-users.html" className="nav-item">
                        <ShieldCheck className="icon" />
                        <span className="nav-label">Users</span>
                    </a>
                    <a href="admin-moderation.html" className="nav-item">
                        <Flag className="icon" />
                        <span className="nav-label">Moderation</span>
                    </a>
                </nav>
                <div className="sidebar-collapse-btn">
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                        {sidebarCollapsed ? <ChevronsRight className="icon icon-sm" /> : <ChevronsLeft className="icon icon-sm" />}
                        <span>Collapse</span>
                    </button>
                </div>
            </aside>

            {sidebarMobileOpen && (
                <div className="sidebar-overlay show" onClick={() => setSidebarMobileOpen(false)} />
            )}

            <div className="app-main">
                <header className="header">
                    <button className="icon-btn mobile-menu-btn" onClick={() => setSidebarMobileOpen(true)} aria-label="Open menu">
                        <Menu className="icon" />
                    </button>
                    <button className="header-search" onClick={() => setActiveModal('commandPalette')}>
                        <Search className="icon icon-sm" />
                        <span className="search-label">Search anything…</span>
                        <kbd>Ctrl K</kbd>
                    </button>
                    <div className="header-actions">
                        <div className="dropdown">
                            <button className="btn btn-primary btn-sm" onClick={() => setCreateDropdownOpen(!createDropdownOpen)}>
                                <Plus className="icon icon-sm" />
                                <span className="create-btn-label">Create</span>
                            </button>
                            {createDropdownOpen && (
                                <div className="dropdown-menu">
                                    <button className="dropdown-item" onClick={() => { setActiveModal('quickCreateTaskModal'); setCreateDropdownOpen(false); }}>
                                        <ListPlus className="icon icon-sm" />
                                        New Task
                                    </button>
                                    <button className="dropdown-item" onClick={() => { setActiveModal('createProjectModal'); setCreateDropdownOpen(false); }}>
                                        <FolderPlus className="icon icon-sm" />
                                        New Project
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="dropdown">
                            <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} aria-label="Open user menu">
                                <span className="avatar avatar-sm" style={{ background: '#4f46e5' }}>CS</span>
                            </button>
                            {userDropdownOpen && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-user-info">
                                        <p className="dropdown-user-name">Cao Sơn</p>
                                        <p className="dropdown-user-email">caosonhs@gmail.com</p>
                                        <p className="dropdown-user-role">leader</p>
                                    </div>
                                    <div className="dropdown-separator"></div>
                                    <a className="dropdown-item destructive" href="login.html">
                                        <LogOut className="icon icon-sm" />
                                        Log out
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="project-header">
                    <div className="project-header-top">
                        <div style={{ minWidth: 0 }}>
                            <div className="project-title-row">
                                <span className="project-color-dot" style={{ background: project.color || '#4f46e5' }}></span>
                                <h1>{project.name}</h1>
                            </div>
                            <p className="page-subtitle" style={{ maxWidth: '640px' }}>{project.desc}</p>
                            <div className="project-meta-row">
                                <span className="project-meta-item"><UsersRound className="icon icon-sm" />{members.length || 4} members</span>
                                <span className="project-meta-item"><ListChecks className="icon icon-sm" />{tasks.length} tasks</span>
                                <span className="project-meta-item"><CalendarClock className="icon icon-sm" />Due {project.dueDate || 'Sep 15, 2026'}</span>
                            </div>
                        </div>
                        <div className="project-header-actions">
              <span className="avatar-group">
                <span className="avatar avatar-sm" style={{ background: '#4f46e5' }}>CS</span>
                <span className="avatar avatar-sm" style={{ background: '#0ea5e9' }}>QL</span>
                <span className="avatar avatar-sm" style={{ background: '#16a34a' }}>NL</span>
                <span className="avatar avatar-sm" style={{ background: '#db2777' }}>KN</span>
              </span>
                            <a href="project-settings.html" className="icon-btn icon-btn-outline" aria-label="Project settings">
                                <Settings className="icon" />
                            </a>
                        </div>
                    </div>
                    <nav className="project-tabs">
                        <a href="project-board.html" className="project-tab"><LayoutGrid className="icon icon-sm" />Board</a>
                        <a href="project-list.html" className="project-tab"><List className="icon icon-sm" />List</a>
                        <a href="project-calendar.html" className="project-tab active"><Calendar className="icon icon-sm" />Calendar</a>
                        <a href="project-activity.html" className="project-tab"><Activity className="icon icon-sm" />Activity</a>
                    </nav>
                </div>

                <main className="page-content">
                    <div className="calendar-wrap">
                        <div className="calendar-nav">
                            <h2>{monthName}</h2>
                            <div className="calendar-nav-controls">
                                <button className="icon-btn icon-btn-sm icon-btn-outline" aria-label="Previous month" onClick={handlePrevMonth}>
                                    <ChevronLeft className="icon icon-sm" />
                                </button>
                                <button className="icon-btn icon-btn-sm icon-btn-outline" aria-label="Next month" onClick={handleNextMonth}>
                                    <ChevronRight className="icon icon-sm" />
                                </button>
                            </div>
                        </div>

                        <div className="calendar-weekdays">
                            <div className="calendar-weekday">Mon</div>
                            <div className="calendar-weekday">Tue</div>
                            <div className="calendar-weekday">Wed</div>
                            <div className="calendar-weekday">Thu</div>
                            <div className="calendar-weekday">Fri</div>
                            <div className="calendar-weekday">Sat</div>
                            <div className="calendar-weekday">Sun</div>
                        </div>

                        <div className="calendar-grid">
                            {daysGrid.map((dayItem, idx) => {
                                const dateNum = dayItem.date.getDate();
                                const yearStr = dayItem.date.getFullYear();
                                const monthStr = String(dayItem.date.getMonth() + 1).padStart(2, '0');
                                const dayStr = String(dateNum).padStart(2, '0');
                                const formattedDateStr = `${yearStr}-${monthStr}-${dayStr}`;

                                const todayStr = '2026-09-10'; // Giữ mốc hôm nay theo HTML mẫu
                                const isToday = formattedDateStr === todayStr;

                                // Lọc task có due date tương ứng
                                const dayTasks = tasks.filter((t) => {
                                    if (!t.dueDate) return false;
                                    return t.dueDate.includes(formattedDateStr) || t.dueDate.includes(`${dayItem.date.toLocaleString('en-US', { month: 'short' })} ${dateNum}`);
                                });

                                return (
                                    <div
                                        key={idx}
                                        className={`calendar-cell ${!dayItem.isCurrentMonth ? 'outside' : ''} ${isToday ? 'today' : ''}`}
                                    >
                                        <span className="calendar-date-num">{dateNum}</span>
                                        {dayTasks.length > 0 && (
                                            <div className="calendar-task-list">
                                                {dayTasks.map((task) => (
                                                    <button
                                                        key={task.id}
                                                        className={`calendar-task-chip ${task.isOverdue ? 'overdue' : ''}`}
                                                        onClick={() => handleOpenTaskDrawer(task)}
                                                    >
                            <span
                                className="priority-dot"
                                style={{ background: renderPriorityDotColor(task.priority) }}
                            ></span>
                                                        {task.title}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>

            {selectedTask && (
                <div className="drawer-overlay" onClick={() => setSelectedTask(null)}>
                    <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-header">
                            <div className="drawer-header-meta">
                <span className="priority-badge" style={renderPriorityBadgeStyle(selectedTask.priority)}>
                  {renderPriorityIcon(selectedTask.priority)}
                    <span>{selectedTask.priority || 'Medium'}</span>
                </span>
                                <span>{selectedTask.updatedAt || 'Updated recently'}</span>
                            </div>
                            <button className="icon-btn" onClick={() => setSelectedTask(null)} aria-label="Close panel">
                                <X className="icon" />
                            </button>
                        </div>
                        <div className="drawer-body">
              <textarea
                  className="drawer-title-input"
                  rows={1}
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
              />
                            <div className="drawer-field-grid">
                                <div>
                                    <span className="drawer-field-label">Status</span>
                                    <select
                                        className="select"
                                        value={selectedTask.column}
                                        onChange={(e) => setSelectedTask({ ...selectedTask, column: e.target.value })}
                                    >
                                        {columns.map((c) => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <span className="drawer-field-label">Priority</span>
                                    <select
                                        className="select"
                                        value={selectedTask.priority}
                                        onChange={(e) => setSelectedTask({ ...selectedTask, priority: e.target.value })}
                                    >
                                        <option value="Urgent">Urgent</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                                <div>
                                    <span className="drawer-field-label">Due date</span>
                                    <input
                                        className="input"
                                        type="date"
                                        value={selectedTask.dueDate || ''}
                                        onChange={(e) => setSelectedTask({ ...selectedTask, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <span className="drawer-field-label">Description</span>
                                <textarea
                                    className="textarea"
                                    rows={3}
                                    placeholder="Add a more detailed description…"
                                    value={selectedTask.desc || ''}
                                    onChange={(e) => setSelectedTask({ ...selectedTask, desc: e.target.value })}
                                />
                            </div>

                            {/* Checklist Section */}
                            <div className="drawer-section">
                                <div className="checklist-header">
                                    <span className="comments-title">Checklist</span>
                                    <span className="checklist-count">
                    {(selectedTask.checklists || []).filter((c) => c.completed).length}/{(selectedTask.checklists || []).length}
                  </span>
                                </div>
                                <div className="progress-bar">
                  <span
                      className="progress-bar-fill tone-success"
                      style={{
                          width: `${
                              selectedTask.checklists?.length
                                  ? ((selectedTask.checklists.filter((c) => c.completed).length / selectedTask.checklists.length) * 100)
                                  : 0
                          }%`
                      }}
                  ></span>
                                </div>
                                <div className="checklist-items">
                                    {(selectedTask.checklists || []).map((item) => (
                                        <div key={item.id} className="checklist-item">
                                            <input
                                                type="checkbox"
                                                checked={item.completed}
                                                onChange={() => handleToggleChecklist(item.id, item.completed)}
                                            />
                                            <span className={item.completed ? 'completed' : ''}>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="checklist-add-row">
                                    <input
                                        className="input"
                                        placeholder="Add checklist item…"
                                        value={newChecklistText}
                                        onChange={(e) => setNewChecklistText(e.target.value)}
                                    />
                                    <button className="checklist-add-btn" onClick={handleAddChecklist} aria-label="Add checklist item">
                                        <Plus className="icon icon-sm" />
                                    </button>
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="drawer-section">
                                <p className="comments-title">Comments ({taskComments.length})</p>
                                <div className="comments-list">
                                    {taskComments.map((cmt) => (
                                        <div key={cmt.id} className="comment-item">
                      <span className="avatar avatar-sm" style={{ background: cmt.avatarBg || '#4f46e5' }}>
                        {cmt.userInitials || 'CS'}
                      </span>
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <span className="comment-author">{cmt.user || 'Cao Sơn'}</span>
                                                    <span className="comment-time">{cmt.createdAt || 'Recently'}</span>
                                                </div>
                                                <p className="comment-text">{cmt.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <form className="comment-form" onSubmit={handleAddComment}>
                  <textarea
                      className="textarea"
                      rows={2}
                      placeholder="Write a comment…"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                  />
                                    <div className="comment-form-actions">
                                        <button type="submit" className="btn btn-primary btn-sm">
                                            Send <Send className="icon icon-sm" />
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Delete Task */}
                            <div className="drawer-section">
                                <button
                                    className="btn btn-outline btn-full"
                                    style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)' }}
                                    onClick={() => setActiveModal('confirmDeleteTaskModal')}
                                >
                                    <Trash2 className="icon icon-sm" /> Delete task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'confirmDeleteTaskModal' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-box size-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete this task?</h2>
                            <button className="icon-btn" onClick={() => setActiveModal(null)} aria-label="Close"><X className="icon" /></button>
                        </div>
                        <div className="modal-body">
                            <p className="page-subtitle" style={{ margin: 0 }}>This task and all its data will be permanently removed.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline btn-sm" onClick={() => setActiveModal(null)}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={handleDeleteTask}>Delete task</button>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'commandPalette' && (
                <div className="command-palette-overlay" onClick={() => setActiveModal(null)}>
                    <div className="command-palette-box" onClick={(e) => e.stopPropagation()}>
                        <div className="command-palette-input-row">
                            <Search className="icon icon-sm" />
                            <input
                                className="command-palette-input"
                                placeholder="Search tasks, projects, members…"
                                autoFocus
                                value={commandQuery}
                                onChange={(e) => setCommandQuery(e.target.value)}
                            />
                            <kbd onClick={() => setActiveModal(null)} style={{ cursor: 'pointer' }}>ESC</kbd>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'quickCreateTaskModal' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create task</h2>
                            <button className="icon-btn" onClick={() => setActiveModal(null)} aria-label="Close"><X className="icon" /></button>
                        </div>
                        <form onSubmit={handleCreateTaskSubmit}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className="field">
                                    <label className="field-label">Title</label>
                                    <input className="input" placeholder="e.g. Fix pagination bug" required autoFocus value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
                                </div>
                                <div className="grid-2">
                                    <div className="field">
                                        <label className="field-label">Column</label>
                                        <select className="select" value={newTaskColumn} onChange={(e) => setNewTaskColumn(e.target.value)}>
                                            {columns.map((c) => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label className="field-label">Priority</label>
                                        <select className="select" value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}>
                                            <option value="Medium">Medium</option>
                                            <option value="Urgent">Urgent</option>
                                            <option value="High">High</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="field-label">Due date</label>
                                    <input className="input" type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline btn-sm" onClick={() => setActiveModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm">Create task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeModal === 'createProjectModal' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Create project</h2>
                                <p className="modal-desc">Set up a new board for your team.</p>
                            </div>
                            <button className="icon-btn" onClick={() => setActiveModal(null)} aria-label="Close"><X className="icon" /></button>
                        </div>
                        <form onSubmit={handleCreateProjectSubmit}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className="field">
                                    <label className="field-label">Name</label>
                                    <input className="input" placeholder="e.g. Growth Experiments" required autoFocus value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
                                </div>
                                <div className="field">
                                    <label className="field-label">Description</label>
                                    <textarea className="textarea" placeholder="What is this project about?" rows={2} value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} />
                                </div>
                                <div className="field">
                                    <label className="field-label">Due date</label>
                                    <input className="input" type="date" value={newProjectDueDate} onChange={(e) => setNewProjectDueDate(e.target.value)} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline btn-sm" onClick={() => setActiveModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm">Create project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="toast-viewport">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast variant-${toast.variant}`}>
                        {toast.variant === 'success' && <CheckCircle2 className="toast-icon icon" />}
                        {toast.variant === 'error' && <XCircle className="toast-icon icon" />}
                        {toast.variant === 'info' && <Info className="toast-icon icon" />}
                        <div className="toast-body">
                            <p className="toast-title">{toast.title}</p>
                            {toast.description && <p className="toast-desc">{toast.description}</p>}
                        </div>
                        <button className="toast-close icon icon-sm" onClick={() => setToasts(toasts.filter((t) => t.id !== toast.id))}><X /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}