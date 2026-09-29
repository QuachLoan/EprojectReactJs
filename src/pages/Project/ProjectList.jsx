import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './../../components/layout/Header/Header.jsx';
import Sidebar from './../../components/layout/Sidebar/Sidebar.jsx';

import {
    LayoutGrid,
    List,
    Calendar,
    Settings,
    Plus,
    Loader2,
    ArrowRightCircle,
    UserPlus,
    Check, UsersRound, ListChecks, CalendarClock,
    Trash2
} from 'lucide-react';

import {
    fetchProjectById,
    fetchTasksByProject,
    fetchColumnsByProject,
    createTask,
    updateTask,
    moveTask,
    deleteTask
} from '../../../api.jsx';

const getInitials = (name) => {
    if (!name) return '??';
    const words = String(name).trim().split(/\s+/);
    return words.length === 1
        ? words[0].substring(0, 2).toUpperCase()
        : (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const getMemberUserId = (member) => {
    if (!member) return null;
    if (typeof member === 'object') {
        if (member.userId) {
            return typeof member.userId === 'object' ? String(member.userId._id || member.userId.id) : String(member.userId);
        }
        return String(member._id || member.id || '');
    }
    return String(member);
};

const getMemberDisplayName = (member) => {
    if (!member) return 'User';
    if (typeof member === 'object') {
        const u = member.userId && typeof member.userId === 'object' ? member.userId : member;
        return u.username || u.name || u.email || 'User';
    }
    return 'User';
};

const getUserInfo = (userOrId, projectMembers = []) => {
    if (!userOrId) return null;
    if (typeof userOrId === 'object' && (userOrId.username || userOrId.name)) {
        return userOrId;
    }
    const targetId = typeof userOrId === 'object' ? (userOrId._id || userOrId.id) : userOrId;
    const found = projectMembers.find(m => {
        const mUserId = getMemberUserId(m);
        const mId = String(m._id || m.id);
        return mUserId === String(targetId) || mId === String(targetId);
    });
    return found || userOrId;
};

export default function ProjectList() {
    const { id: projectId } = useParams();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    const [project, setProject] = useState({});
    const [columns, setColumns] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [assigneeMenu, setAssigneeMenu] = useState({ open: false, taskId: null, pos: { top: 0, left: 0 } });

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');
    const [newTaskPoints, setNewTaskPoints] = useState(0);
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    const memberList = Array.isArray(project?.assignees) ? project.assignees : [];

    const getCurrentUser = () => {
        return JSON.parse(localStorage.getItem('user') || '{}');
    };

    const currentUser = getCurrentUser();
    const userRole = currentUser?.role || 'Member';
    const isManager = userRole === 'Manager';
    const isLeader = userRole === 'Leader';

    const loadData = async () => {
        try {
            setLoading(true);
            const [pData, colsData, tskList] = await Promise.all([
                fetchProjectById(projectId).catch(() => ({})),
                fetchColumnsByProject(projectId).catch(() => []),
                fetchTasksByProject(projectId).catch(() => [])
            ]);

            const realProject = pData?.data || pData || {};
            const realColumns = Array.isArray(colsData) ? colsData : (colsData?.data || []);
            const realTasks = Array.isArray(tskList) ? tskList : (tskList?.data || []);

            realColumns.sort((a, b) => (a.position || 0) - (b.position || 0));

            const validColumnIds = new Set(
                realColumns.map(c => String(c._id || c.id)).filter(Boolean)
            );

            const backlogTasks = realTasks.filter(t => {
                const rawCol = t.columnId;
                const cId = typeof rawCol === 'object' && rawCol !== null
                    ? (rawCol._id || rawCol.id)
                    : rawCol;
                return !cId || !validColumnIds.has(String(cId));
            });

            setProject(realProject);
            setColumns(realColumns);
            setTasks(backlogTasks);
        } catch (err) {
            console.error('Error loading backlog tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [projectId]);

    const handleOpenCreateModal = () => {
        if (!isManager) return;
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskPriority('Medium');
        setNewTaskPoints(0);
        setNewTaskDate('');
        const currentUserId = currentUser._id || currentUser.id;
        setSelectedMembers(currentUserId ? [currentUserId] : []);
        setActiveModal('quickCreateTaskModal');
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!isManager || !newTaskTitle.trim()) return;

        try {
            setIsSubmitting(true);
            if (!projectId) return;

            const pointValue = Number(newTaskPoints) || 0;

            // Gửi đồng thời cả point và points xuống backend
            const payload = {
                title: newTaskTitle,
                description: newTaskDesc,
                projectId: projectId,
                priority: newTaskPriority,
                point: pointValue,
                points: pointValue,
                date: newTaskDate ? new Date(newTaskDate) : new Date(),
                assignees: []
            };

            const response = await createTask(payload);
            const createdTask = response?.data || response;

            if (createdTask && (createdTask._id || createdTask.id)) {
                setTasks(prevTasks => [createdTask, ...prevTasks]);
                closeModal();
            }
        } catch (error) {
            console.error("Lỗi tạo task:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!isManager) return;
        if (!window.confirm('Bạn có chắc chắn muốn xóa task này không?')) return;

        try {
            setTasks(prev => prev.filter(t => String(t._id || t.id) !== String(taskId)));
            await deleteTask(taskId);
        } catch (err) {
            console.error('Lỗi khi xóa task:', err);
            loadData();
        }
    };

    const handleOpenAssigneeMenu = (e, taskId) => {
        if (!isLeader) return;
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();

        const spaceBelow = window.innerHeight - rect.bottom;
        const topPos = spaceBelow < 200
            ? rect.top + window.scrollY - 180
            : rect.bottom + window.scrollY + 4;

        setAssigneeMenu({
            open: true,
            taskId,
            pos: {
                top: topPos,
                left: rect.left + window.scrollX - 140
            }
        });
    };

    const handlePushToBoard = async (task) => {
        if (!isLeader) return;
        const todoColumn = columns[0];
        if (!todoColumn) return;

        const taskId = task._id || task.id;
        const todoColumnId = todoColumn._id || todoColumn.id;

        try {
            setTasks(prev => prev.filter(t => (t._id || t.id) !== taskId));

            await moveTask(taskId, {
                sourceColumnId: null,
                destColumnId: todoColumnId,
                destinationIndex: 0
            });
        } catch (err) {
            console.error('Lỗi khi push task sang board:', err);
            loadData();
        }
    };

    const handleToggleTaskAssignee = async (task, memberUserId) => {
        if (!isLeader || !task) return;

        const taskId = task._id || task.id;
        const currentAssignees = Array.isArray(task.assignees)
            ? task.assignees.map(a => typeof a === 'object' ? (a._id || a.id) : a).filter(Boolean).map(id => String(id))
            : [];

        const targetMemberId = String(memberUserId);

        const updatedAssignees = currentAssignees.includes(targetMemberId)
            ? []
            : [targetMemberId];

        setTasks(prev => prev.map(t => {
            const tId = t._id || t.id;
            return String(tId) === String(taskId) ? { ...t, assignees: updatedAssignees } : t;
        }));

        try {
            await updateTask(taskId, { assignees: updatedAssignees });
        } catch (err) {
            console.error('Error updating assignee:', err);
        }
    };

    const formattedDueDate = (project?.date)
        ? new Date(project.date).toLocaleDateString('vi-VN')
        : 'N/A';

    return (
        <div className="app-shell" onClick={() => setAssigneeMenu({ open: false, taskId: null, pos: {} })}>
            <Sidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                mobileOpen={sidebarMobileOpen}
                setMobileOpen={setSidebarMobileOpen}
            />

            <div className="app-main">
                <Header
                    onOpenSidebar={() => setSidebarMobileOpen(true)}
                    onOpenModal={(modal) => setActiveModal(modal)}
                />

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '60vh', color: '#64748b', gap: '12px' }}>
                        <Loader2 className="animate-spin" style={{ width: 36, height: 36, color: '#4f46e5' }} />
                        <span style={{ fontSize: '15px', fontWeight: 500 }}>Loading...</span>
                    </div>
                ) : (
                    <>
                        <div className="project-header">
                            <div className="project-header-top">
                                <div style={{ minWidth: 0 }}>
                                    <div className="project-title-row">
                                        <span className="project-color-dot" style={{ background: project.color || '#4f46e5' }}></span>
                                        <h1>{project.name || 'Project'}</h1>
                                    </div>
                                    <p className="page-subtitle">{project.description || 'no description'}</p>

                                    <div className="project-meta-row" style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
                                        <span className="project-meta-item"><UsersRound className="icon icon-sm" />{memberList.length} members</span>
                                        <span className="project-meta-item"><ListChecks className="icon icon-sm" />{tasks.length} tasks</span>
                                        <span className="project-meta-item"><CalendarClock className="icon icon-sm" />end date: {formattedDueDate || 'Chưa đặt'}</span>
                                    </div>
                                </div>
                                <div className="project-header-actions">
                                    <Link to={`/projectsetting/${projectId}`} className="icon-btn icon-btn-outline">
                                        <Settings className="icon" />
                                    </Link>
                                </div>
                            </div>

                            <nav className="project-tabs">
                                <Link to={`/projectboard/${projectId}`} className="project-tab">
                                    <LayoutGrid className="icon icon-sm" /> Board
                                </Link>
                                <Link to={`/projectlist/${projectId}`} className="project-tab active">
                                    <List className="icon icon-sm" /> List
                                </Link>
                                <Link to={`/projectcalendar/${projectId}`} className="project-tab">
                                    <Calendar className="icon icon-sm" /> Calendar
                                </Link>
                            </nav>
                        </div>

                        <main className="page-content" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Pending Backlog Tasks</h2>
                                </div>
                                {isManager && (
                                    <button onClick={handleOpenCreateModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Plus className="w-4 h-4" /> Add Task
                                    </button>
                                )}
                            </div>

                            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'visible' }}>
                                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                                    <tr>
                                        <th style={{ padding: '12px 16px' }}>Title</th>
                                        <th style={{ padding: '12px 16px' }}>Priority</th>
                                        <th style={{ padding: '12px 16px' }}>Points</th>
                                        <th style={{ padding: '12px 16px' }}>Assignee</th>
                                        <th style={{ padding: '12px 16px' }}>End date</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {tasks.length > 0 ? (
                                        tasks.map((task, index) => {
                                            const taskId = task._id || task.id || `task-fallback-${index}`;
                                            const taskAssignees = Array.isArray(task.assignees) ? task.assignees : [];

                                            const rawDate = task.date || task.dueDate;
                                            let formattedDate = 'No date';
                                            if (rawDate) {
                                                const parsedDate = new Date(rawDate);
                                                if (!isNaN(parsedDate.getTime())) {
                                                    formattedDate = parsedDate.toLocaleDateString('vi-VN');
                                                }
                                            }

                                            const displayTitle = task.title || task.name || 'Untitled Task';
                                            const taskPoints = task.points ?? task.point ?? 0;

                                            return (
                                                <tr key={taskId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b' }}>
                                                        <div>{displayTitle}</div>
                                                        {task.description && (
                                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '320px' }}>
                                                                {task.description}
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td style={{ padding: '12px 16px' }}>
                                                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#fffbeb', color: '#d97706' }}>
                                                            {task.priority || 'Medium'}
                                                        </span>
                                                    </td>

                                                    <td style={{ padding: '12px 16px' }}>
                                                        <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>
                                                            {taskPoints} pts
                                                        </span>
                                                    </td>

                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            {taskAssignees.map((assignee, aIdx) => {
                                                                const userInfo = getUserInfo(assignee, memberList);
                                                                const name = getMemberDisplayName(userInfo);
                                                                const memberId = typeof assignee === 'object'
                                                                    ? (assignee._id || assignee.id || aIdx)
                                                                    : assignee;

                                                                return (
                                                                    <span
                                                                        key={`assignee-${memberId}-${aIdx}`}
                                                                        title={name}
                                                                        style={{
                                                                            background: '#4f46e5',
                                                                            color: '#fff',
                                                                            fontSize: '10px',
                                                                            width: '26px',
                                                                            height: '26px',
                                                                            borderRadius: '50%',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}
                                                                    >
                                                                        {getInitials(name)}
                                                                    </span>
                                                                );
                                                            })}

                                                            {isLeader && (
                                                                <button
                                                                    onClick={(e) => handleOpenAssigneeMenu(e, taskId)}
                                                                    style={{
                                                                        border: '1px dashed #cbd5e1',
                                                                        borderRadius: '50%',
                                                                        width: '26px',
                                                                        height: '26px',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        cursor: 'pointer',
                                                                        background: '#fff'
                                                                    }}
                                                                    title="Assign member"
                                                                >
                                                                    <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                                                        {formattedDate}
                                                    </td>

                                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                            {isLeader && (
                                                                <button
                                                                    onClick={() => handlePushToBoard(task)}
                                                                    className="btn btn-primary btn-sm"
                                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                                                                >
                                                                    <ArrowRightCircle className="w-3.5 h-3.5" />
                                                                    Push to Board
                                                                </button>
                                                            )}

                                                            {isManager && (
                                                                <button
                                                                    onClick={() => handleDeleteTask(taskId)}
                                                                    className="btn btn-danger btn-sm"
                                                                    style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        fontSize: '12px',
                                                                        backgroundColor: '#ef4444',
                                                                        color: '#fff',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '4px',
                                                                        border: 'none',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    title="Delete task"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                                No pending backlog tasks.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </main>
                    </>
                )}
            </div>

            {/* ASSIGNEE POPUP */}
            {isLeader && assigneeMenu.open && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        top: `${assigneeMenu.pos.top}px`,
                        left: `${assigneeMenu.pos.left}px`,
                        zIndex: 99999,
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                        width: '200px',
                        padding: '6px',
                    }}
                >
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', padding: '4px 6px' }}>Assign Member:</div>
                    {memberList.map((m) => {
                        const mUserId = getMemberUserId(m);
                        const displayName = getMemberDisplayName(m);
                        const currentTask = tasks.find(t => String(t._id || t.id) === String(assigneeMenu.taskId));
                        const taskAssignees = Array.isArray(currentTask?.assignees) ? currentTask.assignees : [];
                        const isChecked = taskAssignees.some(a => String(typeof a === 'object' ? (a._id || a.id) : a) === String(mUserId));

                        return (
                            <div
                                key={mUserId}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleTaskAssignee(currentTask, mUserId);
                                }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                className="hover:bg-slate-100"
                            >
                                <span>{displayName}</span>
                                {isChecked && <Check className="w-4 h-4 text-indigo-600" />}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CREATE TASK MODAL */}
            {isManager && activeModal === 'quickCreateTaskModal' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleCreateTask}>
                            <div className="modal-header">
                                <h2>Add Task to Backlog</h2>
                                <button type="button" className="btn-icon" onClick={closeModal}>✕</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Title *</label>
                                    <input
                                        className="input"
                                        placeholder="e.g: My task"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Points</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="input"
                                        placeholder="0"
                                        value={newTaskPoints}
                                        onChange={(e) => setNewTaskPoints(e.target.value === '' ? '' : Number(e.target.value))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">End date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newTaskDate}
                                        onChange={(e) => setNewTaskDate(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Priority</label>
                                    <select
                                        className="select"
                                        value={newTaskPriority}
                                        onChange={(e) => setNewTaskPriority(e.target.value)}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="textarea"
                                        placeholder="Add task description..."
                                        value={newTaskDesc}
                                        onChange={(e) => setNewTaskDesc(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}