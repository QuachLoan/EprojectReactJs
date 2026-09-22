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
    ChevronLeft,
    ChevronRight,
    Loader2,
    X
} from 'lucide-react';

import {
    fetchProjectById,
    fetchMembers,
    fetchTasksByProject,
    createQuickTask
} from '../../../api';

export default function ProjectCalendar() {
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
            console.error('Lỗi khi tải calendar:', err);
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

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Grid 35 ô tương đương 5 tuần mẫu
    const calendarDays = Array.from({ length: 35 }, (_, i) => i + 1);

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
                        <Link to={`/projectlist/${projectId}`} className="project-tab">
                            <List className="icon icon-sm" /> List
                        </Link>
                        <Link to={`/projectcalendar/${projectId}`} className="project-tab active">
                            <Calendar className="icon icon-sm" /> Calendar
                        </Link>
                    </nav>
                </div>

                {/* Main Calendar Area */}
                <main className="page-content" style={{ padding: 'var(--space-6)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">September 2026</h2>
                        <div className="flex items-center gap-2">
                            <button className="icon-btn icon-btn-outline"><ChevronLeft className="w-4 h-4"/></button>
                            <button className="btn btn-outline btn-sm">Today</button>
                            <button className="icon-btn icon-btn-outline"><ChevronRight className="w-4 h-4"/></button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" /> Đang tải lịch...
                        </div>
                    ) : (
                        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                            <div className="grid grid-cols-7 border-b bg-gray-50 text-center font-medium text-xs text-gray-500 py-2">
                                {daysOfWeek.map((day) => (
                                    <div key={day}>{day}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 auto-rows-fr border-collapse">
                                {calendarDays.map((day, index) => (
                                    <div key={index} className="min-h-[100px] border-b border-r p-1.5 hover:bg-gray-50/50 transition-colors">
                                        <span className={`text-xs font-semibold ${day <= 30 ? 'text-gray-700' : 'text-gray-300'}`}>
                                            {day <= 30 ? day : day - 30}
                                        </span>
                                    </div>
                                ))}
                            </div>
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
                                        placeholder="e.g. Design review"
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