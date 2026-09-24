import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from './../../components/layout/Header/Header.jsx';
import Sidebar from './../../components/layout/Sidebar/Sidebar.jsx';

import {
    LayoutGrid,
    List,
    Calendar,
    Settings,
    UsersRound,
    ListChecks,
    CalendarClock,
    Save,
    Trash2,
    Loader2
} from 'lucide-react';

import {
    fetchProjectById,
    fetchTasksByProject,
    updateProject,
    deleteProject
} from '../../../api';

export default function ProjectSetting() {
    const { id: projectId } = useParams();
    const navigate = useNavigate();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    // State lưu dữ liệu hiển thị gốc từ API
    const [project, setProject] = useState(null);

    // State form nhập liệu
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#4f46e5',
        dueDate: ''
    });

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Định dạng YYYY-MM-DD cho `<input type="date">`
    const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';
        const d = new Date(dateValue);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (projectId) {
            loadData();
        }
    }, [projectId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [projectData, tskList] = await Promise.all([
                fetchProjectById(projectId).catch(() => null),
                fetchTasksByProject(projectId).catch(() => [])
            ]);

            const realProject = projectData?.data || projectData || {};
            const realTasks = Array.isArray(tskList) ? tskList : (tskList?.data || []);

            const rawDate = realProject.date || realProject.dueDate || realProject.endDate;
            const formattedDate = formatDateForInput(rawDate);

            setProject(realProject);
            setFormData({
                name: realProject.name || '',
                description: realProject.description || realProject.desc || '',
                color: realProject.color || '#4f46e5',
                dueDate: formattedDate
            });

            setTasks(realTasks);
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

            const payload = {
                name: formData.name,
                description: formData.description,
                color: formData.color,
                date: formData.dueDate ? new Date(formData.dueDate) : null,
                dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
                endDate: formData.dueDate ? new Date(formData.dueDate) : null
            };

            await updateProject(projectId, payload);

            setProject(prev => ({
                ...prev,
                ...payload,
                date: payload.date
            }));
        } catch (err) {
            console.error('Lỗi khi lưu dự án:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProject = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa dự án này không? Hành động này không thể hoàn tác.')) {
            try {
                await deleteProject(projectId);
                navigate('/dashboard');
            } catch (err) {
                console.error('Lỗi khi xóa dự án:', err);
            }
        }
    };

    const memberList = Array.isArray(project?.assignees) ? project.assignees : [];

    const headerDueDate = (project?.date || project?.dueDate || project?.endDate)
        ? new Date(project.date || project.dueDate || project.endDate).toLocaleDateString('vi-VN')
        : 'Chưa đặt';

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
                                <span className="project-color-dot" style={{ background: project?.color || '#4f46e5' }}></span>
                                <h1>{project?.name || 'Dự án'}</h1>
                            </div>
                            <p className="page-subtitle" style={{ maxWidth: '640px' }}>
                                {project?.description || 'no description'}
                            </p>

                            <div className="project-meta-row">
                                <span className="project-meta-item">
                                    <UsersRound className="icon icon-sm" />{memberList.length} members
                                </span>
                                <span className="project-meta-item">
                                    <ListChecks className="icon icon-sm" />{tasks.length} tasks
                                </span>
                                <span className="project-meta-item">
                                    <CalendarClock className="icon icon-sm" />end date: {headerDueDate}
                                </span>
                            </div>
                        </div>

                        <div className="project-header-actions">
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

                {/* Main Form Area: Đã sửa chiều rộng max-w-md và bố trí 2 nút sang 2 bên */}
                <main className="page-content" style={{ padding: 'var(--space-6)' }}>
                    <div className="max-w-md mx-auto bg-white border rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 border-b pb-3">Project setting</h2>

                        {loading ? (
                            <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                            </div>
                        ) : (
                            <form onSubmit={handleSaveSettings} className="space-y-4">
                                <div className="field">
                                    <label className="field-label">Project name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="field">
                                    <label className="field-label">Description</label>
                                    <textarea
                                        className="input min-h-[90px]"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="field">
                                        <label className="field-label">Color</label>
                                        <input
                                            type="color"
                                            className="h-10 w-full rounded border p-1 cursor-pointer"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        />
                                    </div>
                                    <div className="field">
                                        <label className="field-label">End date</label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Nút Delete nằm bên TRÁI, nút Save nằm bên PHẢI */}
                                <div className="pt-4 flex items-center justify-between border-t mt-6 w-full">
                                    <button
                                        type="button"
                                        onClick={handleDeleteProject}
                                        className="btn bg-red-50 text-red-600 hover:bg-red-100 btn-sm flex items-center gap-1"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete project
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn btn-primary btn-sm flex items-center gap-1"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save project
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