import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
    X,
    Save,
    Trash2,
    Loader2
} from 'lucide-react';

import {
    fetchProjectById,
    fetchMembers,
    fetchTasksByProject,
} from '../../../api';

export default function ProjectSetting() {
    const { id: projectId } = useParams();
    const navigate = useNavigate();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    const [project, setProject] = useState({ name: '', desc: '', color: '#4f46e5', dueDate: '' });
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
            console.error('Lỗi khi tải cài đặt dự án:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await updateProject(projectId, project);
            alert('Cập nhật thông tin dự án thành công!');
        } catch (err) {
            console.error('Lỗi khi lưu dự án:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProject = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa dự án này không?')) {
            try {
                await deleteProject(projectId);
                navigate('/dashboard');
            } catch (err) {
                console.error('Lỗi khi xóa dự án:', err);
            }
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
                        <Link to={`/projectlist/${projectId}`} className="project-tab">
                            <List className="icon icon-sm" /> List
                        </Link>
                        <Link to={`/projectcalendar/${projectId}`} className="project-tab">
                            <Calendar className="icon icon-sm" /> Calendar
                        </Link>
                    </nav>
                </div>

                {/* Main Settings Form Area */}
                <main className="page-content" style={{ padding: 'var(--space-6)' }}>
                    <div className="max-w-2xl mx-auto bg-white border rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 border-b pb-3">Project Settings</h2>

                        {loading ? (
                            <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" /> Đang tải cài đặt...
                            </div>
                        ) : (
                            <form onSubmit={handleSaveSettings} className="space-y-4">
                                <div className="field">
                                    <label className="field-label">Project Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={project.name || ''}
                                        onChange={(e) => setProject({ ...project, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="field">
                                    <label className="field-label">Description</label>
                                    <textarea
                                        className="input min-h-[100px]"
                                        value={project.desc || project.description || ''}
                                        onChange={(e) => setProject({ ...project, desc: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="field">
                                        <label className="field-label">Project Color</label>
                                        <input
                                            type="color"
                                            className="h-10 w-full rounded border p-1 cursor-pointer"
                                            value={project.color || '#4f46e5'}
                                            onChange={(e) => setProject({ ...project, color: e.target.value })}
                                        />
                                    </div>
                                    <div className="field">
                                        <label className="field-label">Due Date</label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={project.dueDate || ''}
                                            onChange={(e) => setProject({ ...project, dueDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t mt-6">
                                    <button
                                        type="button"
                                        onClick={handleDeleteProject}
                                        className="btn bg-red-50 text-red-600 hover:bg-red-100 btn-sm flex items-center gap-1"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete Project
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn btn-primary btn-sm flex items-center gap-1"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}