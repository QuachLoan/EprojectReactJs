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
    deleteProject,
    fetchMembers
} from '../../../api';

export default function ProjectSetting() {
    const { id: projectId } = useParams();
    const navigate = useNavigate();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    // State quản lý tab navigation trong Cài đặt
    const [activeTab, setActiveTab] = useState('general');

    // State lưu dữ liệu dự án gốc
    const [project, setProject] = useState(null);

    // State form nhập liệu cài đặt dự án
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#4f46e5',
        dueDate: ''
    });

    // State danh sách Users và mảng ID thành viên được chọn (Checkbox)
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

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

            const [projectData, tskList, usersData] = await Promise.all([
                fetchProjectById(projectId).catch(() => null),
                fetchTasksByProject(projectId).catch(() => []),
                fetchMembers().catch(() => [])
            ]);

            const realProject = projectData?.data || projectData || {};
            const realTasks = Array.isArray(tskList) ? tskList : (tskList?.data || []);
            const realUsers = Array.isArray(usersData) ? usersData : (usersData?.data || usersData?.users || []);

            const rawDate = realProject.date || realProject.dueDate || realProject.endDate;
            const formattedDate = formatDateForInput(rawDate);

            setProject(realProject);
            setMembers(realUsers);

            setFormData({
                name: realProject.name || '',
                description: realProject.description || realProject.desc || '',
                color: realProject.color || '#4f46e5',
                dueDate: formattedDate
            });

            // Lấy danh sách ID assignees hiện tại của project để gán vào Checkbox state
            const currentAssignees = Array.isArray(realProject?.assignees) ? realProject.assignees : [];
            const initialSelectedIds = currentAssignees
                .map(m => (typeof m === 'object' ? String(m._id || m.id) : String(m)))
                .filter(id => id && id.length === 24);

            setSelectedMembers(initialSelectedIds);
            setTasks(realTasks);
        } catch (err) {
            console.error('Lỗi khi tải cài đặt dự án:', err);
        } finally {
            setLoading(false);
        }
    };

    // Toggle chọn/bỏ chọn member dạng Checkbox
    const toggleMemberSelection = (id) => {
        setSelectedMembers((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    };

    // 1. Hàm lưu Cài đặt thông tin chung
    const handleSaveGeneralSettings = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                color: formData.color,
                date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                endDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
            };

            await updateProject(projectId, payload);
            await loadData();
        } catch (err) {
            console.error('Lỗi khi lưu thông tin chung:', err);
        } finally {
            setSaving(false);
        }
    };

    // 2. Hàm lưu Thành viên (CHỈ gửi duy nhất field assignees để tránh lỗi "no change detected")
    const handleSaveMembers = async () => {
        try {
            setSaving(true);

            // Chuẩn hóa lọc sạch mảng ObjectId hợp lệ (24 ký tự)
            const validAssignees = selectedMembers
                .map(id => String(id).trim())
                .filter(id => id.length === 24);

            const payload = {
                assignees: validAssignees
            };

            console.log("Payload assignees gửi đi:", payload);

            await updateProject(projectId, payload);
            await loadData();
        } catch (err) {
            console.error('Lỗi khi cập nhật thành viên:', err);
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

    // Danh sách hiển thị ở Header
    const currentMemberList = Array.isArray(project?.assignees) ? project.assignees : [];

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
                                    <UsersRound className="icon icon-sm" />{currentMemberList.length} members
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

                {/* Main Settings Layout */}
                <main className="page-content" style={{ padding: 'var(--space-6)' }}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: 'var(--color-text-subtle)', gap: '8px' }}>
                            <Loader2 className="icon" style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} /> Loading...
                        </div>
                    ) : (
                        <div className="settings-layout">
                            {/* Navigation Sidebar bên trái */}
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
                                    Members ({selectedMembers.length})
                                </button>
                                <button
                                    type="button"
                                    className={`settings-nav-item ${activeTab === 'danger' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('danger')}
                                >
                                    Danger Zone
                                </button>
                            </nav>

                            {/* Content bên phải */}
                            <div className="settings-content">
                                {/* Tab General */}
                                <div className={`settings-section ${activeTab === 'general' ? 'active' : ''}`}>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 'var(--space-4)' }}>General Settings</h2>
                                    <form onSubmit={handleSaveGeneralSettings} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                                                Save general info
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Tab Members */}
                                <div className={`settings-section ${activeTab === 'members' ? 'active' : ''}`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                                        <div>
                                            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Members</h2>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted, #64748b)' }}>
                                                Select members to include in this project {selectedMembers.length > 0 && `(${selectedMembers.length} selected)`}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSaveMembers}
                                            disabled={saving}
                                            className="btn btn-primary btn-sm"
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            {saving ? <Loader2 className="icon" style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : <Save className="icon" style={{ width: 16, height: 16 }} />}
                                            Save Members
                                        </button>
                                    </div>

                                    {/* Danh sách Checkbox Member */}
                                    <div className="card" style={{ maxHeight: '360px', overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--color-border)' }}>
                                        {members.length === 0 ? (
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '4px' }}>Không có thành viên nào.</p>
                                        ) : (
                                            members.map((member) => {
                                                const memberId = String(member._id || member.id);
                                                const displayName = member.username || member.email || 'User';
                                                const initials = displayName.slice(0, 2).toUpperCase();
                                                const isChecked = selectedMembers.includes(memberId);

                                                return (
                                                    <label
                                                        key={memberId}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            padding: '8px 10px',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            backgroundColor: isChecked ? 'var(--color-bg-subtle, #f8fafc)' : 'transparent',
                                                            border: '1px solid',
                                                            borderColor: isChecked ? 'var(--color-primary-light, #e0e7ff)' : 'transparent'
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => toggleMemberSelection(memberId)}
                                                        />
                                                        <span className="avatar avatar-xs" style={{ background: '#4f46e5', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '28px', height: '28px' }}>
                                                            {initials}
                                                        </span>
                                                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                            <span style={{ fontSize: '14px', fontWeight: 500 }}>{displayName}</span>
                                                            <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>{member.email || member.role || 'Member'}</span>
                                                        </div>
                                                        {isChecked && (
                                                            <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 600 }}>Added</span>
                                                        )}
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Tab Danger Zone */}
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