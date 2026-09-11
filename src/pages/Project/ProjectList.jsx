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
    ArrowUp,
    ArrowDown,
    Minus,
    ChevronsUp,
    CheckSquare,
    MessageSquare,
    Send,
    Trash2,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Info
} from 'lucide-react';
import {
    fetchProjectById,
    fetchMembers,
    fetchColumns,
    fetchTasksByProject,
    createTask,
    updateTask,
    deleteTask,
    createProject
} from '../../../api';

export default function ProjectList({ projectId = 'p1' }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [commandQuery, setCommandQuery] = useState('');
    const [toasts, setToasts] = useState([]);

    // Data states
    const [project, setProject] = useState({ name: '', desc: '', dueDate: '', color: '#4f46e5' });
    const [members, setMembers] = useState([]);
    const [columns, setColumns] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAssignee, setSelectedAssignee] = useState('All');
    const [selectedPriority, setSelectedPriority] = useState('All');
    const [selectedSort, setSelectedSort] = useState('Priority');

    // New task form state
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskColumn, setNewTaskColumn] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');

    // New project form state
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

    const showToast = (title, description = null, variant = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, title, description, variant }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
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

    const renderPriorityIcon = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent':
                return <ChevronsUp className="icon icon-xs" style={{ color: '#dc2626' }} />;
            case 'high':
                return <ArrowUp className="icon icon-xs" style={{ color: '#f97316' }} />;
            case 'low':
                return <ArrowDown className="icon icon-xs" style={{ color: '#2563eb' }} />;
            default:
                return <Minus className="icon icon-xs" style={{ color: '#f59e0b' }} />;
        }
    };

    const renderPriorityBadgeStyle = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent':
                return { color: '#dc2626', background: '#fef2f2' };
            case 'high':
                return { color: '#f97316', background: '#fff7ed' };
            case 'low':
                return { color: '#2563eb', background: '#eff6ff' };
            default:
                return { color: '#f59e0b', background: '#fffbeb' };
        }
    };

    const filteredTasks = tasks.filter((t) => {
        const matchesSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = selectedPriority === 'All' || t.priority?.toLowerCase() === selectedPriority.toLowerCase();
        return matchesSearch && matchesPriority;
    });

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
                        <a href="project-list.html" className="project-tab active"><List className="icon icon-sm" />List</a>
                        <a href="project-calendar.html" className="project-tab"><Calendar className="icon icon-sm" />Calendar</a>
                        <a href="project-activity.html" className="project-tab"><Activity className="icon icon-sm" />Activity</a>
                    </nav>
                </div>

                <main className="page-content">
                    <div className="page-content-inner">
                        <div className="filter-bar">
                            <div className="filter-bar-row">
                                <div className="input-icon-wrap">
                                    <Search className="icon icon-sm" />
                                    <input className="input" placeholder="Search tasks…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                </div>
                                <select className="select" value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)}>
                                    <option value="All">Assignee: All</option>
                                    <option value="Cao Sơn">Cao Sơn</option>
                                    <option value="Quách Loan">Quách Loan</option>
                                    <option value="Ngô Lâm">Ngô Lâm</option>
                                    <option value="Khánh Ngọc">Khánh Ngọc</option>
                                </select>
                                <select className="select" value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
                                    <option value="All">Priority: All</option>
                                    <option value="Urgent">Urgent</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                                <select className="select">
                                    <option>Label: All</option>
                                    <option>Design</option>
                                    <option>Frontend</option>
                                    <option>Backend</option>
                                </select>
                                <select className="select">
                                    <option>Due date</option>
                                    <option>Overdue</option>
                                    <option>Due today</option>
                                </select>
                                <select className="select" value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}>
                                    <option value="Priority">Sort: Priority</option>
                                    <option value="Due date">Sort: Due date</option>
                                    <option value="Title">Sort: Title</option>
                                </select>
                            </div>
                        </div>

                        <div className="card">
                            <div className="task-list-header-row">
                                <span>Task</span>
                                <span>Column</span>
                                <span>Assignees</span>
                                <span>Labels</span>
                                <span>Due</span>
                            </div>

                            {filteredTasks.map((t) => {
                                const colObj = columns.find((c) => c.name === t.column || c.id === t.columnId);
                                const colColor = colObj ? colObj.color : '#94a3b8';

                                return (
                                    <button key={t.id} className="task-list-row" onClick={() => setSelectedTask(t)}>
                                        <div className="task-list-title-cell">
                                            <div className="task-list-title-top">
                        <span className="priority-badge" style={renderPriorityBadgeStyle(t.priority)}>
                          {renderPriorityIcon(t.priority)}
                        </span>
                                                <span className="task-title-text">{t.title}</span>
                                            </div>
                                            <div className="task-list-title-sub">
                        <span className="task-list-sub-meta">
                          <CheckSquare className="icon icon-xs" />
                            {t.completedChecklist || 0}/{t.totalChecklist || 0}
                        </span>
                                                {t.commentsCount > 0 && (
                                                    <span className="task-list-sub-meta">
                            <MessageSquare className="icon icon-xs" />
                                                        {t.commentsCount}
                          </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="task-list-column-cell">
                      <span className="project-color-dot" style={{ background: colColor }}></span>
                                            {t.column || colObj?.name || 'Todo'}
                    </span>
                                        <span className="task-list-assignee-cell">
                      <span className="avatar avatar-sm" style={{ background: t.assigneeBg || '#db2777' }}>
                        {t.assigneeInitials || 'CS'}
                      </span>
                    </span>
                                        <span className="task-list-extra-labels">
                      {t.label && (
                          <span className="label-chip" style={{ color: t.labelColor || '#9333ea', background: `${t.labelColor || '#9333ea'}1a` }}>
                          {t.label}
                        </span>
                      )}
                    </span>
                                        <span className={`task-list-due-cell ${t.isOverdue ? 'due-overdue' : ''}`}>
                      {t.dueDate || 'No due'}
                    </span>
                                    </button>
                                );
                            })}

                            <div className="pagination">
                                <span className="pagination-info">Showing {filteredTasks.length} of {tasks.length}</span>
                                <div className="pagination-pages">
                                    <button className="icon-btn icon-btn-sm icon-btn-outline" disabled aria-label="Previous page">
                                        <ChevronLeft className="icon icon-sm" />
                                    </button>
                                    <button className="pagination-page-btn active">1</button>
                                    <button className="icon-btn icon-btn-sm icon-btn-outline" disabled aria-label="Next page">
                                        <ChevronRight className="icon icon-sm" />
                                    </button>
                                </div>
                            </div>
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
                            </div>
                            <button className="icon-btn" onClick={() => setSelectedTask(null)} aria-label="Close panel">
                                <X className="icon" />
                            </button>
                        </div>
                        <div className="drawer-body">
                            <textarea className="drawer-title-input" rows={1} value={selectedTask.title} onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })} />
                            <div className="drawer-field-grid">
                                <div>
                                    <span className="drawer-field-label">Status</span>
                                    <select className="select" value={selectedTask.column} onChange={(e) => setSelectedTask({ ...selectedTask, column: e.target.value })}>
                                        {columns.map((c) => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <span className="drawer-field-label">Priority</span>
                                    <select className="select" value={selectedTask.priority} onChange={(e) => setSelectedTask({ ...selectedTask, priority: e.target.value })}>
                                        <option value="Urgent">Urgent</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                                <div>
                                    <span className="drawer-field-label">Due date</span>
                                    <input className="input" type="date" value={selectedTask.dueDate || ''} onChange={(e) => setSelectedTask({ ...selectedTask, dueDate: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <span className="drawer-field-label">Description</span>
                                <textarea className="textarea" rows={3} placeholder="Add a more detailed description…" value={selectedTask.desc || ''} onChange={(e) => setSelectedTask({ ...selectedTask, desc: e.target.value })} />
                            </div>
                            <div className="drawer-section">
                                <button className="btn btn-outline btn-full" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)' }} onClick={() => setActiveModal('confirmDeleteTaskModal')}>
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
                            <input className="command-palette-input" placeholder="Search tasks, projects, members…" autoFocus value={commandQuery} onChange={(e) => setCommandQuery(e.target.value)} />
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