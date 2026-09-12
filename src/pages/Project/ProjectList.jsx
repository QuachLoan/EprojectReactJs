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
    UsersRound,
    ListChecks,
    CalendarClock,
    Plus,
    X,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';

import {
    fetchProjectById,
    fetchMembers,
    fetchTasksByProject,
    createQuickTask
} from '../../../api';

export default function ProjectList() {
    const { id: projectId } = useParams();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    const [project, setProject] = useState({});
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [taskTitle, setTaskTitle] = useState('');
    const [taskColumn, setTaskColumn] = useState('Todo');

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [pData, mems, tskList] = await Promise.all([
                fetchProjectById(projectId).catch(() => ({})),
                fetchMembers(projectId).catch(() => []),
                fetchTasksByProject(projectId).catch(() => [])
            ]);
            setProject(pData || {});
            setMembers(mems || []);
            setTasks(tskList || []);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu list:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await createQuickTask({ title: taskTitle, column: taskColumn, projectId });
            setActiveModal(null);
            setTaskTitle('');
            loadData();
        } catch (err) {
            console.error('Lỗi khi tạo task:', err);
        }
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'done':
            case 'completed':
                return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium"><CheckCircle2 className="w-3 h-3"/> Done</span>;
            case 'in progress':
                return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-600 font-medium"><Clock className="w-3 h-3"/> In Progress</span>;
            default:
                return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium"><AlertCircle className="w-3 h-3"/> Todo</span>;
        }
    };

    return (
        <div className="app-shell">
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

                {/* Project Header Info */}
                <div className="project-header">
                    <div className="project-header-top">
                        <div style={{ minWidth: 0 }}>
                            <div className="project-title-row">
                                <span className="project-color-dot" style={{ background: project.color || '#4f46e5' }}></span>
                                <h1>{project.name || 'TeamFlow Platform'}</h1>
                            </div>
                            <p className="page-subtitle" style={{ maxWidth: '640px' }}>
                                {project.desc || project.description || 'Kanban team task management system.'}
                            </p>
                            <div className="project-meta-row">
                                <span className="project-meta-item"><UsersRound className="icon icon-sm" />{members.length} members</span>
                                <span className="project-meta-item"><ListChecks className="icon icon-sm" />{tasks.length} tasks</span>
                                <span className="project-meta-item"><CalendarClock className="icon icon-sm" />Due {project.dueDate || 'Sep 15, 2026'}</span>
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
                            <Link to={`/projectsetting/${projectId}`} className="icon-btn icon-btn-outline" aria-label="Project settings">
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
                        <Link to={`/projectactivity/${projectId}`} className="project-tab">
                            <Activity className="icon icon-sm" /> Activity
                        </Link>
                    </nav>
                </div>

                {/* Main List Content Area */}
                <main className="page-content" style={{ padding: 'var(--space-6)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Task List</h2>
                        <button onClick={() => setActiveModal('quickCreateTaskModal')} className="btn btn-primary btn-sm flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add Task
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" /> Đang tải công việc...
                        </div>
                    ) : (
                        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-gray-50 border-b text-gray-500 font-medium">
                                <tr>
                                    <th className="p-3">Task Name</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Assignee</th>
                                    <th className="p-3">Due Date</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {tasks.length > 0 ? (
                                    tasks.map((task) => (
                                        <tr key={task._id || task.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-3 font-medium text-gray-800">{task.title}</td>
                                            <td className="p-3">{getStatusBadge(task.status || task.column)}</td>
                                            <td className="p-3 text-gray-600">{task.assigneeName || 'Unassigned'}</td>
                                            <td className="p-3 text-gray-500">{task.dueDate || 'No due date'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-6 text-center text-gray-400">
                                            Chưa có công việc nào trong dự án này.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Quick Create Task */}
            {activeModal === 'quickCreateTaskModal' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create Task</h2>
                            <button className="icon-btn" onClick={() => setActiveModal(null)}><X className="icon" /></button>
                        </div>
                        <form onSubmit={handleCreateTask}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className="field">
                                    <label className="field-label">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                        placeholder="e.g. Implement user login"
                                    />
                                </div>
                                <div className="field">
                                    <label className="field-label">Column</label>
                                    <select value={taskColumn} onChange={(e) => setTaskColumn(e.target.value)} className="select">
                                        <option value="Todo">Todo</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Review">Review</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setActiveModal(null)} className="btn btn-outline btn-sm">Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}