import React, { useState, useEffect } from 'react';
import "./project.css";

import {
    Plus,
    X,
    ListChecks,
    UsersRound,
    CalendarClock
} from 'lucide-react';
import SideBar from './../../components/layout/SideBar/SideBar';
import Header from './../../components/layout/Header/Header';
import { fetchProjects, createProject, fetchMembers, createTask, fetchTasksByProject } from './../../../api.jsx';
import { Link } from "react-router-dom";

const COLOR_OPTIONS = [
    '#4f46e5',
    '#0ea5e9',
    '#16a34a',
    '#f59e0b',
    '#db2777',
    '#9333ea',
    '#0d9488',
    '#dc2626'
];

export default function Projects() {
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);

    // Lưu số liệu task: { [projectId]: { total: number, done: number } }
    const [projectTaskStats, setProjectTaskStats] = useState({});

    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingMembers, setLoadingMembers] = useState(false);

    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [projectDueDate, setProjectDueDate] = useState('');
    const [selectedColor, setSelectedColor] = useState('#4f46e5');
    const [selectedMembers, setSelectedMembers] = useState([]);

    const [taskTitle, setTaskTitle] = useState('');
    const [taskProject, setTaskProject] = useState('');
    const [taskColumn, setTaskColumn] = useState('Todo');
    const [taskPriority, setTaskPriority] = useState('Medium');
    const [taskDueDate, setTaskDueDate] = useState('');

    const [toasts, setToasts] = useState([]);

    const getCurrentUserId = () => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        return currentUser._id || currentUser.id || null;
    };

    const resetProjectForm = () => {
        setProjectName('');
        setProjectDesc('');
        setProjectDueDate('');
        setSelectedColor('#4f46e5');

        const currentUserId = getCurrentUserId();
        setSelectedMembers(currentUserId ? [currentUserId] : []);
    };

    const closeModal = () => {
        setActiveModal(null);
        resetProjectForm();
    };

    // Fetch danh sách project & đếm task Done theo column.position === 3
    const loadProjects = async () => {
        setLoadingProjects(true);
        try {
            const data = await fetchProjects();
            const list = Array.isArray(data) ? data : (data?.data || []);

            setProjects(list);
            if (list.length > 0) {
                setTaskProject(list[0]._id || list[0].id);
            }

            const statsMap = {};
            await Promise.all(
                list.map(async (project) => {
                    const pId = project._id || project.id;
                    try {
                        const tasksData = await fetchTasksByProject(pId);
                        const tasksList = Array.isArray(tasksData) ? tasksData : (tasksData?.data || []);

                        const doneTasksCount = tasksList.filter((task) => {
                            if (task.columnId && typeof task.columnId === 'object') {
                                return task.columnId.position === 3;
                            }
                            if (task.position === 3) {
                                return true;
                            }
                            return false;
                        }).length;

                        statsMap[pId] = {
                            total: tasksList.length,
                            done: doneTasksCount
                        };
                    } catch (err) {
                        statsMap[pId] = { total: 0, done: 0 };
                    }
                })
            );
            setProjectTaskStats(statsMap);

        } catch (error) {
            console.error("Lỗi fetch projects:", error);
            showToast('Lỗi', 'Không thể tải danh sách Projects.', 'error');
        } finally {
            setLoadingProjects(false);
        }
    };

    const loadMembers = async () => {
        setLoadingMembers(true);
        try {
            const data = await fetchMembers();
            const list = Array.isArray(data) ? data : (data?.data || data?.users || []);
            setMembers(list);

            const currentUserId = getCurrentUserId();
            if (currentUserId) {
                setSelectedMembers([currentUserId]);
            }
        } catch (error) {
            console.error("Lỗi fetch members:", error);
            showToast('Lỗi', 'Không thể tải danh sách Members.', 'error');
        } finally {
            setLoadingMembers(false);
        }
    };

    useEffect(() => {
        loadProjects();
        loadMembers();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setActiveModal('commandPalette');
            }
            if (e.key === 'Escape') {
                setActiveModal(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const showToast = (title, description = null, variant = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, title, description, variant }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const toggleMemberSelection = (id) => {
        setSelectedMembers((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    };

    const calculateProgress = (project) => {
        const pId = project._id || project.id;
        const stats = projectTaskStats[pId];

        if (stats && stats.total > 0) {
            return Math.round((stats.done / stats.total) * 100);
        }

        return 0;
    };

    const getTaskCount = (project) => {
        const pId = project._id || project.id;
        if (projectTaskStats[pId] !== undefined) {
            return projectTaskStats[pId].total;
        }
        return 0;
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const currentUserId = currentUser._id || currentUser.id;

            // Lọc kỹ mảng selectedMembers: chỉ giữ lại ID hợp lệ (chuỗi có độ dài > 0)
            const validAssignees = selectedMembers.filter(
                (id) => typeof id === 'string' && id.trim().length > 0
            );

            const today = new Date().toISOString().split('T')[0];

            const payload = {
                name: projectName.trim(),
                description: projectDesc.trim(),
                color: selectedColor,
                userId: currentUserId,
                date: projectDueDate || today,
                assignees: validAssignees // Gửi mảng ID đã làm sạch
            };

            console.log("Payload gửi lên Backend:", payload); // Log ra để kiểm tra trước khi gửi

            await createProject(payload);

            showToast('Project created', 'Project đã lưu thành công.', 'success');
            closeModal();
            loadProjects();
        } catch (error) {
            console.error("Lỗi tạo Project:", error);
            showToast('Lỗi', error.response?.data?.message || error.message || 'Không thể tạo project.', 'error');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await createTask({
                title: taskTitle,
                projectId: taskProject,
                column: taskColumn,
                priority: taskPriority,
                dueDate: taskDueDate
            });
            showToast('Task created', 'Task mới đã tạo thành công.', 'success');
            setTaskTitle('');
            setTaskDueDate('');
            setActiveModal(null);
            loadProjects();
        } catch (error) {
            showToast('Lỗi', 'Không thể tạo task.', 'error');
        }
    };

    return (
        <div className="app-shell">
            <SideBar />

            {sidebarMobileOpen && (
                <div
                    className="sidebar-overlay show"
                    onClick={() => setSidebarMobileOpen(false)}
                />
            )}

            <div className="app-main">
                <Header />

                <main className="page-content">
                    <div className="page-content-inner">
                        <div className="page-header">
                            <div>
                                <h1>Projects</h1>
                                <p className="page-subtitle">
                                    All the boards your team is working on.
                                </p>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    resetProjectForm();
                                    setActiveModal('createProjectModal');
                                }}
                            >
                                <Plus className="icon icon-sm" />
                                Create Project
                            </button>
                        </div>

                        {loadingProjects ? (
                            <p>Loading projects...</p>
                        ) : projects.length === 0 ? (
                            <p>Create your first project!</p>
                        ) : (
                            <div className="grid-cards">
                                {projects.map((project) => {
                                    const memberList = Array.isArray(project.assignees)
                                        ? project.assignees
                                        : Array.isArray(project.members)
                                            ? project.members
                                            : Array.isArray(project.membersList)
                                                ? project.membersList
                                                : [];

                                    const totalTask = getTaskCount(project);
                                    const progressPercent = calculateProgress(project);

                                    return (
                                        <Link
                                            key={project._id || project.id}
                                            to={`/projectboard/${project._id || project.id}`}
                                            className="card project-card"
                                        >
                                            <div className="project-card-top">
                                                <div className="project-title-row">
                                                    <span
                                                        className="project-color-dot"
                                                        style={{ background: project.color || '#4f46e5' }}
                                                    ></span>
                                                    <span className="project-card-name">{project.name}</span>
                                                </div>
                                                <span className={`badge ${project.badgeClass || 'badge-success'}`}>
                                                    {project.status || 'On track'}
                                                </span>
                                            </div>
                                            <p className="project-card-desc">{project.description || project.desc}</p>
                                            <div>
                                                <div className="project-card-progress-row">
                                                    <span className="icon-inline">
                                                        <ListChecks className="icon icon-sm" />
                                                        {totalTask} {totalTask === 1 ? 'task' : 'tasks'}
                                                    </span>
                                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                                                        {progressPercent}%
                                                    </span>
                                                </div>

                                                <div
                                                    style={{
                                                        width: '100%',
                                                        height: '10px',
                                                        backgroundColor: '#e2e8f0',
                                                        borderRadius: '999px',
                                                        overflow: 'hidden',
                                                        marginTop: '8px'
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: `${progressPercent}%`,
                                                            height: '100%',
                                                            backgroundColor: progressPercent === 100
                                                                ? '#10b981'
                                                                : progressPercent >= 50
                                                                    ? '#3b82f6'
                                                                    : '#f59e0b',
                                                            borderRadius: '999px',
                                                            transition: 'width 0.4s ease-in-out',
                                                            boxShadow: progressPercent > 0 ? '0 0 8px rgba(59, 130, 246, 0.5)' : 'none'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="project-card-footer">
                                                <span className="avatar-group">
                                                    {memberList.map((member, index) => {
                                                        if (typeof member === 'string' || !member) {
                                                            return (
                                                                <span key={member || index} className="avatar avatar-xs" style={{ background: '#4f46e5' }}>
                                                                    U
                                                                </span>
                                                            );
                                                        }

                                                        const displayName = member.username || member.name || member.email || 'User';
                                                        const initials = displayName.slice(0, 2).toUpperCase();

                                                        return (
                                                            <span
                                                                key={member._id || index}
                                                                className="avatar avatar-xs"
                                                                style={{ background: '#4f46e5' }}
                                                                title={displayName}
                                                            >
                                                                {initials}
                                                            </span>
                                                        );
                                                    })}
                                                </span>
                                                <span className="project-card-footer-meta">
                                                    <span className="icon-inline">
                                                        <UsersRound className="icon icon-sm" />
                                                        {memberList.length}
                                                    </span>
                                                    <span className="icon-inline">
                                                        <CalendarClock className="icon icon-sm" />
                                                        {(project.date || project.dueDate)
                                                            ? new Date(project.date || project.dueDate).toLocaleDateString('vi-VN')
                                                            : 'N/A'}
                                                    </span>
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal Create Task */}
            {activeModal === 'quickCreateTaskModal' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create task</h2>
                            <button className="icon-btn" onClick={() => setActiveModal(null)} aria-label="Close">
                                <X className="icon" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTask}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className="field">
                                    <label className="field-label">Title</label>
                                    <input
                                        className="input"
                                        placeholder="e.g. Fix pagination bug"
                                        required
                                        autoFocus
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                    />
                                </div>
                                <div className="grid-2">
                                    <div className="field">
                                        <label className="field-label">Project</label>
                                        <select className="select" value={taskProject} onChange={(e) => setTaskProject(e.target.value)}>
                                            {projects.map((p) => (
                                                <option key={p._id || p.id} value={p._id || p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label className="field-label">Column</label>
                                        <select className="select" value={taskColumn} onChange={(e) => setTaskColumn(e.target.value)}>
                                            <option value="Todo">Todo</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Review">Review</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="field">
                                        <label className="field-label">Priority</label>
                                        <select className="select" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
                                            <option value="Medium">Medium</option>
                                            <option value="Urgent">Urgent</option>
                                            <option value="High">High</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label className="field-label">Due date</label>
                                        <input className="input" type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline btn-sm" onClick={() => setActiveModal(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm">
                                    Create task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Create Project */}
            {activeModal === 'createProjectModal' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Create project</h2>
                                <p className="modal-desc">Set up a new board for your team.</p>
                            </div>
                            <button className="icon-btn" onClick={closeModal} aria-label="Close">
                                <X className="icon" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateProject}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className="field">
                                    <label className="field-label">Name</label>
                                    <input
                                        className="input"
                                        placeholder="e.g. Growth Experiments"
                                        required
                                        autoFocus
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                    />
                                </div>
                                <div className="field">
                                    <label className="field-label">Description</label>
                                    <textarea
                                        className="textarea"
                                        placeholder="What is this project about?"
                                        rows={2}
                                        value={projectDesc}
                                        onChange={(e) => setProjectDesc(e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="field">
                                    <label className="field-label">Due date</label>
                                    <input className="input" type="date" value={projectDueDate} onChange={(e) => setProjectDueDate(e.target.value)} />
                                </div>
                                <div className="field">
                                    <span className="field-label">Color</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {COLOR_OPTIONS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                aria-label="Color"
                                                onClick={() => setSelectedColor(color)}
                                                style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: color,
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    boxShadow: selectedColor === color ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : 'none'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="field">
                                    <span className="field-label">
                                        Members {selectedMembers.length > 0 && `(${selectedMembers.length} selected)`}
                                    </span>
                                    <div className="card" style={{ maxHeight: '144px', overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {loadingMembers ? (
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '4px' }}>Loading members...</p>
                                        ) : members.length === 0 ? (
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '4px' }}>Không có thành viên nào.</p>
                                        ) : (
                                            members.map((member) => {
                                                const memberId = member._id || member.id;
                                                const displayName = member.username || member.email || 'User';
                                                const initials = displayName.slice(0, 2).toUpperCase();

                                                return (
                                                    <label key={memberId} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px', borderRadius: '6px', cursor: 'pointer' }}>
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox"
                                                            checked={selectedMembers.includes(memberId)}
                                                            onChange={() => toggleMemberSelection(memberId)}
                                                        />
                                                        <span className="avatar avatar-xs" style={{ background: '#4f46e5' }}>
                                                            {initials}
                                                        </span>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontSize: '14px', fontWeight: 500 }}>{displayName}</span>
                                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{member.role || 'Member'}</span>
                                                        </div>
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline btn-sm" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm">
                                    Create project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}