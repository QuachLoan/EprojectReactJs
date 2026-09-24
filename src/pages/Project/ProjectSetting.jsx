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

    // State quản lý tab navigation trong Cài đặt
    const [activeTab, setActiveTab] = useState('general');

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

                {/* Main Settings Layout theo CSS mới */}
                <main className="page-content" style={{ padding: 'var(--space-6)' }}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: 'var(--color-text-subtle)', gap: '8px' }}>
                            <Loader2 className="icon" style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} /> Loading...
                        </div>
                    ) : (
                        <div className="settings-layout">
                            {/* Thanh Sidebar Settings bên trái */}
                            <nav className="settings-nav">
                                <button
                                    type="button"
                                    className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('general')}
                                >
                                    General
                                </button>
                                <button
                                    type="button"
                                    className={`settings-nav-item ${activeTab === 'members' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('members')}
                                >
                                    Members
                                </button>
                                <button
                                    type="button"
                                    className={`settings-nav-item ${activeTab === 'danger' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('danger')}
                                >
                                    Danger Zone
                                </button>
                            </nav>

                            {/* Khung Nội dung Settings bên phải */}
                            <div className="settings-content">
                                {/* Section 1: General */}
                                <div className={`settings-section ${activeTab === 'general' ? 'active' : ''}`}>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 'var(--space-4)' }}>General Settings</h2>
                                    <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                                                className="textarea"
                                                rows="3"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                            <div className="field">
                                                <label className="field-label">Color</label>
                                                <input
                                                    type="color"
                                                    style={{ height: '38px', width: '100%', padding: '2px', cursor: 'pointer', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
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

                                        <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="btn btn-primary btn-sm"
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                {saving ? <Loader2 className="icon" style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : <Save className="icon" style={{ width: 16, height: 16 }} />}
                                                Save project
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Section 2: Members */}
                                <div className={`settings-section ${activeTab === 'members' ? 'active' : ''}`}>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Project Members ({memberList.length})</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                        {memberList.length === 0 ? (
                                            <p style={{ fontSize: '13px', color: 'var(--color-text-subtle)' }}>No members found in this project.</p>
                                        ) : (
                                            memberList.map((member, idx) => {
                                                const displayName = typeof member === 'object' ? (member.username || member.name || member.email || 'User') : 'User';
                                                return (
                                                    <div key={member._id || member.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                                        <span className="avatar avatar-sm" style={{ background: '#4f46e5', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '32px', height: '32px' }}>
                                                            {displayName.substring(0, 2).toUpperCase()}
                                                        </span>
                                                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{displayName}</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Section 3: Danger Zone */}
                                <div className={`settings-section ${activeTab === 'danger' ? 'active' : ''}`}>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-danger, #dc2626)', marginBottom: 'var(--space-2)' }}>Danger Zone</h2>
                                    <p style={{ fontSize: '13px', color: 'var(--color-text-subtle)', marginBottom: 'var(--space-4)' }}>
                                        Once you delete a project, there is no going back. Please be certain.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleDeleteProject}
                                        className="btn"
                                        style={{ backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <Trash2 className="icon" style={{ width: 16, height: 16 }} /> Delete project
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}