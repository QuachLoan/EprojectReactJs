import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './../../components/layout/Header/Header.jsx';
import Sidebar from './../../components/layout/Sidebar/Sidebar.jsx';

import {
    LayoutGrid,
    List,
    Calendar,
    Activity,
    Settings,
    Plus,
    Loader2,
    ArrowRightCircle,
    UserPlus,
    Check
} from 'lucide-react';

import {
    fetchProjectById,
    fetchTasksByProject,
    fetchColumnsByProject,
    createTask,
    updateTask,
    moveTask
} from '../../../api.jsx';

// Hàm hỗ trợ lấy 2 chữ cái đầu viết hoa từ username/name
const getInitials = (name) => {
    if (!name) return '??';
    const words = String(name).trim().split(/\s+/);
    return words.length === 1
        ? words[0].substring(0, 2).toUpperCase()
        : (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Hàm tìm kiếm thông tin user theo ID hoặc Object từ danh sách thành viên dự án
const getUserInfo = (userOrId, projectMembers = []) => {
    if (!userOrId) return null;

    if (typeof userOrId === 'object' && (userOrId.username || userOrId.name)) {
        return userOrId;
    }

    const targetId = typeof userOrId === 'object' ? (userOrId._id || userOrId.id) : userOrId;
    const found = projectMembers.find(m => String(m._id || m.id) === String(targetId));

    return found || userOrId;
};

export default function ProjectList() {
    const { id: projectId } = useParams();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    const [project, setProject] = useState({});
    const [columns, setColumns] = useState([]);
    const [tasks, setTasks] = useState([]); // ONLY UNASSIGNED BACKLOG TASKS
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Assignee Menu Popup State
    const [assigneeMenu, setAssigneeMenu] = useState({ open: false, taskId: null, pos: { top: 0, left: 0 } });

    // Task Modal Form State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [newTaskColumnId, setNewTaskColumnId] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    const memberList = Array.isArray(project?.assignees) ? project.assignees : [];

    const getCurrentUserId = () => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        return currentUser._id || currentUser.id || null;
    };

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

            // 1. Tạo danh sách tất cả Column ID hiện có trên Board
            const validColumnIds = new Set(
                realColumns.map(c => String(c._id || c.id)).filter(Boolean)
            );

            // 2. Lọc chỉ lấy Task ở Backlog (Không thuộc bất kỳ cột nào trên Board)
            const backlogTasks = realTasks.filter(t => {
                const rawCol = t.columnId;
                const cId = typeof rawCol === 'object' && rawCol !== null
                    ? (rawCol._id || rawCol.id)
                    : rawCol;

                // Nằm ở Backlog nếu không có columnId HOẶC columnId không khớp với các cột trên Board
                return !cId || !validColumnIds.has(String(cId));
            });

            setProject(realProject);
            setColumns(realColumns);
            setTasks(backlogTasks); // Lưu danh sách Backlog vào state để hiển thị
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
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskPriority('Medium');
        setNewTaskDate('');
        setNewTaskColumnId('');
        const currentUserId = getCurrentUserId();
        setSelectedMembers(currentUserId ? [currentUserId] : []);
        setActiveModal('quickCreateTaskModal');
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    // Create New Task (Backlog)
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            setIsSubmitting(true);

            if (!projectId) {
                return;
            }

            const payload = {
                title: newTaskTitle,
                description: newTaskDesc,
                projectId: projectId, // ID lấy từ useParams()
                priority: newTaskPriority,
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
            console.error("Lỗi tạo task ở Frontend:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open Assignee Menu safely with Fixed Position
    const handleOpenAssigneeMenu = (e, taskId) => {
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

    // Push Task từ Backlog vào cột Todo trên Board
    const handlePushToBoard = async (task) => {
        const todoColumn = columns[0];
        if (!todoColumn) {
            return;
        }

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

    // Toggle Assignee
    const handleToggleTaskAssignee = async (task, memberId) => {
        if (!task) return;

        const taskId = task._id || task.id;

        const currentAssignees = Array.isArray(task.assignees)
            ? task.assignees
                .map(a => typeof a === 'object' ? (a._id || a.id) : a)
                .filter(Boolean)
                .map(id => String(id))
            : [];

        const targetMemberId = String(memberId);

        const updatedAssignees = currentAssignees.includes(targetMemberId)
            ? currentAssignees.filter(id => id !== targetMemberId)
            : [...currentAssignees, targetMemberId];

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

                <div className="project-header">
                    <div className="project-header-top">
                        <div style={{ minWidth: 0 }}>
                            <div className="project-title-row">
                                <span className="project-color-dot" style={{ background: project.color || '#4f46e5' }}></span>
                                <h1>{project.name || 'Project'}</h1>
                            </div>
                            <p className="page-subtitle">{project.description}</p>

                            {/* Bổ sung dòng thông tin Members, Tasks và End Date giống ProjectBoard */}
                            <div className="project-meta-row" style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
                                <span className="project-meta-item">👥 {memberList.length} members</span>
                                <span className="project-meta-item">📋 {tasks.length} task</span>
                                <span className="project-meta-item">📅 end date: {formattedDueDate}</span>
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
                        <button onClick={handleOpenCreateModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Plus className="w-4 h-4" /> Add Task
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: '#64748b', gap: '8px' }}>
                            <Loader2 className="w-5 h-5 animate-spin" /> Loading tasks...
                        </div>
                    ) : (
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'visible' }}>
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                                <tr>
                                    <th style={{ padding: '12px 16px' }}>Task Title</th>
                                    <th style={{ padding: '12px 16px' }}>Priority</th>
                                    <th style={{ padding: '12px 16px' }}>Assignees</th>
                                    <th style={{ padding: '12px 16px' }}>Due Date</th>
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

                                                {/* Assignee Box */}
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        {taskAssignees.map((assignee, aIdx) => {
                                                            const userInfo = getUserInfo(assignee, memberList);
                                                            const name = typeof userInfo === 'object'
                                                                ? (userInfo.username || userInfo.name || userInfo.email || '')
                                                                : '';
                                                            const memberId = typeof assignee === 'object'
                                                                ? (assignee._id || assignee.id || aIdx)
                                                                : assignee;

                                                            return (
                                                                <span
                                                                    key={`assignee-${memberId}-${aIdx}`}
                                                                    title={name || 'User'}
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
                                                    </div>
                                                </td>

                                                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                                                    {formattedDate}
                                                </td>

                                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => handlePushToBoard(task)}
                                                        className="btn btn-primary btn-sm"
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                                                    >
                                                        <ArrowRightCircle className="w-3.5 h-3.5" />
                                                        Push to Board
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                            No pending backlog tasks.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* FIXED ASSIGNEE SELECTION POPUP */}
            {assigneeMenu.open && (
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
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', padding: '4px 6px' }}>Assign Members:</div>
                    {memberList.map((m) => {
                        const mId = m._id || m.id;
                        const currentTask = tasks.find(t => String(t._id || t.id) === String(assigneeMenu.taskId));
                        const taskAssignees = Array.isArray(currentTask?.assignees) ? currentTask.assignees : [];
                        const isChecked = taskAssignees.some(a => String(typeof a === 'object' ? (a._id || a.id) : a) === String(mId));

                        return (
                            <div
                                key={mId}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleTaskAssignee(currentTask, mId);
                                }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                className="hover:bg-slate-100"
                            >
                                <span>{m.username || m.name}</span>
                                {isChecked && <Check className="w-4 h-4 text-indigo-600" />}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* QUICK CREATE TASK MODAL */}
            {activeModal === 'quickCreateTaskModal' && (
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
                                    <label className="form-label">Due Date</label>
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