import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './../../components/layout/Header/Header.jsx';
import Sidebar from './../../components/layout/Sidebar/Sidebar.jsx'; // Nhúng Sidebar dùng chung
import {
    Search,
    Plus,
    X,
    UsersRound,
    ListChecks,
    CalendarClock,
    Settings,
    LayoutGrid,
    List,
    Calendar,
    Activity,
    ChevronsUp,
    ArrowUp,
    ArrowDown,
    Minus,
    MessageSquare,
    Send,
    Trash2,
    CheckCircle2,
    XCircle,
    Info,
    MoreHorizontal
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
    fetchTaskComments,
    addComment,
    fetchTaskActivities
} from '../../../api';

export default function ProjectBoard() {
    const { id: projectId } = useParams();

    // Sidebar State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

    // UI Modal & Toast State
    const [activeModal, setActiveModal] = useState(null);
    const [commandQuery, setCommandQuery] = useState('');
    const [toasts, setToasts] = useState([]);

    // Data State
    const [project, setProject] = useState({ name: '', desc: '', dueDate: '', color: '#4f46e5' });
    const [members, setMembers] = useState([]);
    const [columns, setColumns] = useState([]);
    const [tasks, setTasks] = useState([]);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [assigneeFilter, setAssigneeFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [labelFilter, setLabelFilter] = useState('All');
    const [dueDateFilter, setDueDateFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Priority');

    // Task Drawer
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskComments, setTaskComments] = useState([]);
    const [taskActivities, setTaskActivities] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [newChecklistText, setNewChecklistText] = useState('');

    // Form State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskColumn, setNewTaskColumn] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');

    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const [newProjectDueDate, setNewProjectDueDate] = useState('');

    useEffect(() => {
        if (projectId) {
            loadProjectData();
        }
    }, [projectId]);

    const loadProjectData = async () => {
        try {
            const pData = await fetchProjectById(projectId);
            setProject(pData || {});

            const mems = await fetchMembers(projectId).catch(() => []);
            setMembers(mems || []);

            const cols = await fetchColumns(projectId).catch(() => []);
            setColumns(cols || []);
            if (cols && cols.length > 0) {
                setNewTaskColumn(cols[0].name || cols[0].id);
            }

            const tskList = await fetchTasksByProject(projectId).catch(() => []);
            setTasks(tskList || []);
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

    const handleOpenTaskDrawer = async (task) => {
        setSelectedTask(task);
        try {
            const taskId = task._id || task.id;
            const fullTask = await fetchTaskById(taskId).catch(() => task);
            setSelectedTask(fullTask);

            const comments = await fetchTaskComments(taskId).catch(() => []);
            setTaskComments(comments);

            const activities = await fetchTaskActivities(taskId).catch(() => []);
            setTaskActivities(activities);
        } catch (err) {
            console.error(err);
        }
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
            setTasks((prev) => [...prev, created]);
            showToast('Task created', 'Task added to board live.', 'success');
            setNewTaskTitle('');
            setActiveModal(null);
            loadProjectData();
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
            showToast('Project created', 'Project created successfully.', 'success');
            setNewProjectName('');
            setNewProjectDesc('');
            setActiveModal(null);
        } catch (err) {
            showToast('Lỗi', 'Không thể tạo dự án mới', 'error');
        }
    };

    const handleDeleteTask = async () => {
        if (!selectedTask) return;
        const taskId = selectedTask._id || selectedTask.id;
        try {
            await deleteTask(taskId);
            setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
            setSelectedTask(null);
            setActiveModal(null);
            showToast('Đã xóa công việc', null, 'success');
        } catch (err) {
            showToast('Lỗi', 'Không thể xóa công việc', 'error');
        }
    };

    const handleAddChecklist = async () => {
        if (!newChecklistText.trim() || !selectedTask) return;
        const taskId = selectedTask._id || selectedTask.id;
        try {
            const item = await addChecklistItem(taskId, newChecklistText);
            const updatedChecklist = [...(selectedTask.checklists || []), item];
            const updatedTask = { ...selectedTask, checklists: updatedChecklist };
            setSelectedTask(updatedTask);
            setTasks((prev) => prev.map((t) => ((t._id || t.id) === taskId ? updatedTask : t)));
            setNewChecklistText('');
        } catch (err) {
            showToast('Lỗi', 'Không thể thêm checklist', 'error');
        }
    };

    const handleToggleChecklist = async (itemId, currentStatus) => {
        if (!selectedTask) return;
        const taskId = selectedTask._id || selectedTask.id;
        try {
            await toggleChecklistItem(taskId, itemId, !currentStatus);
            const updatedChecklist = (selectedTask.checklists || []).map((c) =>
                (c._id || c.id) === itemId ? { ...c, completed: !currentStatus } : c
            );
            const updatedTask = { ...selectedTask, checklists: updatedChecklist };
            setSelectedTask(updatedTask);
            setTasks((prev) => prev.map((t) => ((t._id || t.id) === taskId ? updatedTask : t)));
        } catch (err) {
            showToast('Lỗi', 'Không thể cập nhật trạng thái', 'error');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || !selectedTask) return;
        const taskId = selectedTask._id || selectedTask.id;
        try {
            const newCmt = await addComment(taskId, newCommentText);
            setTaskComments((prev) => [...prev, newCmt]);
            setNewCommentText('');
        } catch (err) {
            showToast('Lỗi', 'Không thể gửi bình luận', 'error');
        }
    };

    const handleStatusChange = async (newColName) => {
        if (!selectedTask) return;
        const taskId = selectedTask._id || selectedTask.id;
        const updatedTask = { ...selectedTask, column: newColName };
        setSelectedTask(updatedTask);
        setTasks((prev) => prev.map((t) => ((t._id || t.id) === taskId ? updatedTask : t)));
        try {
            await updateTask(taskId, { column: newColName });
        } catch (err) {
            showToast('Lỗi', 'Không thể cập nhật cột', 'error');
        }
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            if (assigneeFilter !== 'All' && !task.assignees?.some((a) => a.name === assigneeFilter)) {
                return false;
            }
            if (priorityFilter !== 'All' && task.priority?.toLowerCase() !== priorityFilter.toLowerCase()) {
                return false;
            }
            if (labelFilter !== 'All' && !task.labels?.includes(labelFilter)) {
                return false;
            }
            return true;
        });
    }, [tasks, searchQuery, assigneeFilter, priorityFilter, labelFilter]);

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

    return (
        <div className="app-shell">
            {/* Sidebar Dùng Chung */}
            <Sidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                mobileOpen={sidebarMobileOpen}
                setMobileOpen={setSidebarMobileOpen}
            />

            <div className="app-main">
                {/* Header Dùng Chung */}
                <Header
                    onOpenSidebar={() => setSidebarMobileOpen(true)}
                    onOpenModal={(modal) => setActiveModal(modal)}
                />

                <div className="project-header">
                    <div className="project-header-top">
                        <div style={{ minWidth: 0 }}>
                            <div className="project-title-row">
                                <span className="project-color-dot" style={{ background: project.color || '#4f46e5' }}></span>
                                <h1>{project.name || 'Project Name'}</h1>
                            </div>
                            <p className="page-subtitle" style={{ maxWidth: '640px' }}>{project.desc || project.description}</p>
                            <div className="project-meta-row">
                                <span className="project-meta-item"><UsersRound className="icon icon-sm" />{members.length} members</span>
                                <span className="project-meta-item"><ListChecks className="icon icon-sm" />{tasks.length} tasks</span>
                                <span className="project-meta-item"><CalendarClock className="icon icon-sm" />Due {project.dueDate || 'No due date'}</span>
                            </div>
                        </div>
                        <div className="project-header-actions">
                            <span className="avatar-group">
                                {members.slice(0, 4).map((m, idx) => (
                                    <span key={m._id || m.id || idx} className="avatar avatar-sm" style={{ background: '#4f46e5' }}>
                                        {m.name ? m.name.substring(0, 2).toUpperCase() : 'U'}
                                    </span>
                                ))}
                            </span>
                            <Link to={`/project-settings/${projectId}`} className="icon-btn icon-btn-outline" aria-label="Project settings">
                                <Settings className="icon" />
                            </Link>
                        </div>
                    </div>
                    <nav className="project-tabs">
                        <Link to={`/projectboard/${projectId}`} className="project-tab active"><LayoutGrid className="icon icon-sm" />Board</Link>
                        <Link to={`/projectlist/${projectId}`} className="project-tab"><List className="icon icon-sm" />List</Link>
                        <Link to={`/calendar/${projectId}`} className="project-tab"><Calendar className="icon icon-sm" />Calendar</Link>
                        <Link to={`/activity/${projectId}`} className="project-tab"><Activity className="icon icon-sm" />Activity</Link>
                    </nav>
                </div>

                <main className="page-content" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="filter-bar" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)', marginBottom: 0 }}>
                        <div className="filter-bar-row" style={{ margin: 0 }}>
                            <div className="input-icon-wrap">
                                <Search className="icon icon-sm" />
                                <input
                                    className="input"
                                    placeholder="Search tasks…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select className="select" value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
                                <option value="All">Assignee: All</option>
                                {members.map(m => (
                                    <option key={m._id || m.id} value={m.name}>{m.name}</option>
                                ))}
                            </select>
                            <select className="select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                                <option value="All">Priority: All</option>
                                <option value="Urgent">Urgent</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                            <select className="select" value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)}>
                                <option value="All">Label: All</option>
                                <option value="Design">Design</option>
                                <option value="Frontend">Frontend</option>
                                <option value="Backend">Backend</option>
                            </select>
                            <select className="select" value={dueDateFilter} onChange={(e) => setDueDateFilter(e.target.value)}>
                                <option value="All">Due date</option>
                                <option value="Overdue">Overdue</option>
                                <option value="Due today">Due today</option>
                                <option value="Upcoming">Upcoming</option>
                            </select>
                            <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="Priority">Sort: Priority</option>
                                <option value="Due date">Sort: Due date</option>
                                <option value="Title">Sort: Title</option>
                            </select>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => setActiveModal('quickCreateTaskModal')}>
                            <Plus className="icon icon-sm" />Add Task
                        </button>
                    </div>

                    <div className="board-scroll">
                        <div className="board scroll-x" id="kanbanBoard">
                            {columns.map((col) => {
                                const columnTasks = filteredTasks.filter((t) => t.column === col.name || t.status === col.name || t.column === col._id);
                                return (
                                    <div key={col._id || col.id} className="board-column">
                                        <div className="column-header">
                                            <div className="column-header-title">
                                                <span className="column-dot" style={{ background: col.color || '#4f46e5' }}></span>
                                                <h3>{col.name}</h3>
                                                <span className="column-count">{columnTasks.length}</span>
                                            </div>
                                            <button className="icon-btn icon-btn-sm" aria-label="Column actions">
                                                <MoreHorizontal className="icon icon-sm" />
                                            </button>
                                        </div>

                                        <div className="task-list">
                                            {columnTasks.map((task) => {
                                                const taskId = task._id || task.id;
                                                const completedChecklist = task.checklists?.filter((c) => c.completed).length || 0;
                                                const totalChecklist = task.checklists?.length || 0;

                                                return (
                                                    <div
                                                        key={taskId}
                                                        className="task-card"
                                                        onClick={() => handleOpenTaskDrawer(task)}
                                                    >
                                                        <div className="task-card-header">
                                                            <span className="priority-badge" style={renderPriorityBadgeStyle(task.priority)}>
                                                                {renderPriorityIcon(task.priority)}
                                                                <span>{task.priority || 'Medium'}</span>
                                                            </span>
                                                            {task.dueDate && (
                                                                <span className="task-due-date">
                                                                    <CalendarClock className="icon icon-xs" />
                                                                    {task.dueDate}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h4 className="task-card-title">{task.title}</h4>

                                                        {task.labels && task.labels.length > 0 && (
                                                            <div className="task-card-labels">
                                                                {task.labels.map((lbl, idx) => (
                                                                    <span key={idx} className="badge badge-subtle">{lbl}</span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="task-card-footer">
                                                            <div className="task-card-meta">
                                                                {totalChecklist > 0 && (
                                                                    <span className="task-meta-item">
                                                                        <ListChecks className="icon icon-xs" />
                                                                        {completedChecklist}/{totalChecklist}
                                                                    </span>
                                                                )}
                                                                {task.commentsCount > 0 && (
                                                                    <span className="task-meta-item">
                                                                        <MessageSquare className="icon icon-xs" />
                                                                        {task.commentsCount}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {task.assignees && task.assignees.length > 0 && (
                                                                <div className="avatar-group">
                                                                    {task.assignees.map((ass, idx) => (
                                                                        <span key={idx} className="avatar avatar-xs" style={{ background: ass.color || '#4f46e5' }}>
                                                                            {ass.initials || 'U'}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>

            {/* Task Detail Drawer */}
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
                                value={selectedTask.title || ''}
                                onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                            />

                            <div className="drawer-field-grid">
                                <div>
                                    <span className="drawer-field-label">Status</span>
                                    <select
                                        className="select"
                                        value={selectedTask.column}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                    >
                                        {columns.map((c) => (
                                            <option key={c._id || c.id} value={c.name}>{c.name}</option>
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
                                    value={selectedTask.desc || selectedTask.description || ''}
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
                                <div className="checklist-items">
                                    {(selectedTask.checklists || []).map((item) => (
                                        <div key={item._id || item.id} className="checklist-item">
                                            <input
                                                type="checkbox"
                                                checked={item.completed}
                                                onChange={() => handleToggleChecklist(item._id || item.id, item.completed)}
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
                                        <div key={cmt._id || cmt.id} className="comment-item">
                                            <span className="avatar avatar-sm" style={{ background: cmt.avatarBg || '#4f46e5' }}>
                                                {cmt.userInitials || 'U'}
                                            </span>
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <span className="comment-author">{cmt.user || 'User'}</span>
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

            {/* Confirm delete task modal */}
            {activeModal === 'confirmDeleteTaskModal' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-box size-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete this task?</h2>
                            <button className="icon-btn" onClick={() => setActiveModal(null)} aria-label="Close"><X className="icon" /></button>
                        </div>
                        <div className="modal-body">
                            <p className="page-subtitle" style={{ margin: 0 }}>This task and all its items will be permanently removed.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline btn-sm" onClick={() => setActiveModal(null)}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={handleDeleteTask}>Delete task</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Create Task Modal */}
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
                                                <option key={c._id || c.id} value={c.name}>{c.name}</option>
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

            {/* Toasts */}
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