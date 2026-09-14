import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './../../components/layout/Header/Header.jsx';
import Sidebar from './../../components/layout/Sidebar/Sidebar.jsx';

import {
    CheckCircle2,
    MessageSquare,
    ArrowRightLeft,
    PlusCircle,
    UserPlus,
    Settings,
    LayoutGrid,
    List,
    Calendar,
    Activity,
    X,
    UsersRound,
    ListChecks,
    CalendarClock,
    Loader2
} from 'lucide-react';

import {
    createQuickTask,
    fetchProjectById,
    fetchMembers,
    fetchTasksByProject
} from '../../../api';

// Configuration cho icon & màu sắc từng loại Action Log
const ACTION_CONFIG = {
    completed: { icon: CheckCircle2, style: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    commented: { icon: MessageSquare, style: 'text-sky-500 bg-sky-50 border-sky-200' },
    moved: { icon: ArrowRightLeft, style: 'text-purple-600 bg-purple-50 border-purple-200' },
    created: { icon: PlusCircle, style: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    assigned: { icon: UserPlus, style: 'text-amber-500 bg-amber-50 border-amber-200' },
};

export default function ProjectActivity() {
    const { id: projectId } = useParams();

    // Sidebar & Navigation States
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

    // Modal & Toast States
    const [activeModal, setActiveModal] = useState(null);

    // Core Data States
    const [project, setProject] = useState({ name: '', desc: '', dueDate: '', color: '#4f46e5' });
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [activities, setActivities] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Task Creation Form States
    const [taskTitle, setTaskTitle] = useState('');
    const [taskColumn, setTaskColumn] = useState('Todo');

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Tải thông tin dự án & hoạt động đồng thời
            const [pData, mems, tskList, actList] = await Promise.all([
                fetchProjectById(projectId).catch(() => ({})),
                fetchMembers(projectId).catch(() => []),
                fetchTasksByProject(projectId).catch(() => []),
                fetchActivities(projectId).catch(() => [])
            ]);

            setProject(pData || {});
            setMembers(mems || []);
            setTasks(tskList || []);
            setActivities(actList || []);
        } catch (err) {
            setError('Không thể tải danh sách hoạt động.');
            console.error(err);
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
            loadData(); // Reload lại nhật ký sau khi tạo task thành công
        } catch (err) {
            console.error('Lỗi khi tạo task:', err);
        }
    };

    return (
        <div className="app-shell">
            {/* 1. Sidebar Dùng Chung */}
            <Sidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                mobileOpen={sidebarMobileOpen}
                setMobileOpen={setSidebarMobileOpen}
            />

            <div className="app-main">
                {/* 2. Header Dùng Chung */}
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
                                {project.desc || project.description || 'Kanban team task management system — the capstone product.'}
                            </p>
                            <div className="project-meta-row">
                                <span className="project-meta-item">
                                    <UsersRound className="icon icon-sm" />{members.length} members
                                </span>
                                <span className="project-meta-item">
                                    <ListChecks className="icon icon-sm" />{tasks.length} tasks
                                </span>
                                <span className="project-meta-item">
                                    <CalendarClock className="icon icon-sm" />Due {project.dueDate || 'Sep 15, 2026'}
                                </span>
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

                    {/* Điều hướng Tab Dự án */}
                    <nav className="project-tabs">
                        <Link to={`/projectboard/${projectId}`} className="project-tab">
                            <LayoutGrid className="icon icon-sm" /> Board
                        </Link>
                        <Link to={`/projectlist/${projectId}`} className="project-tab">
                            <List className="icon icon-sm" /> List
                        </Link>
                        <Link to={`/projectcalendar/${projectId}`} className="project-tab">
                            <Calendar className="icon icon-sm" /> Calendar
                        </Link>
                        <Link to={`/projectactivity/${projectId}`} className="project-tab active">
                            <Activity className="icon icon-sm" /> Activity
                        </Link>
                    </nav>
                </div>

                {/* Main Activity Log Content Area */}
                <main className="page-content" style={{ padding: 'var(--space-6)' }}>
                    <div style={{ maxWidth: '768px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Activity Log</h2>

                        {loading ? (
                            <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" /> Đang tải dữ liệu...
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
                        ) : (
                            <div className="relative border-l-2 border-gray-200 ml-4 space-y-6">
                                {activities.map((item) => {
                                    const config = ACTION_CONFIG[item.type] || ACTION_CONFIG.created;
                                    const IconComponent = config.icon;

                                    return (
                                        <div key={item.id} className="relative pl-6">
                                            <span className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${config.style}`}>
                                                <IconComponent className="w-4 h-4" />
                                            </span>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-800">
                                                        <strong className="font-semibold">{item.userName}</strong> {item.actionText}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{item.timeAgo}</p>
                                                </div>
                                                <span
                                                    className="w-6 h-6 rounded-full text-[10px] font-semibold text-white flex items-center justify-center"
                                                    style={{ backgroundColor: item.userColor || '#4f46e5' }}
                                                >
                                                    {item.userInitials}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal Quick Create Task */}
            {activeModal === 'quickCreateTaskModal' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create Task</h2>
                            <button className="icon-btn" onClick={() => setActiveModal(null)}>
                                <X className="icon" />
                            </button>
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
                                        placeholder="e.g. Fix pagination bug"
                                    />
                                </div>
                                <div className="field">
                                    <label className="field-label">Column</label>
                                    <select
                                        value={taskColumn}
                                        onChange={(e) => setTaskColumn(e.target.value)}
                                        className="select"
                                    >
                                        <option value="Todo">Todo</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Review">Review</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setActiveModal(null)} className="btn btn-outline btn-sm">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm">
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}