import React, { useEffect, useState, useMemo } from 'react';
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

    const [activeTab, setActiveTab] = useState('general');

    const [project, setProject] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#4f46e5',
        dueDate: ''
    });

    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const getCurrentUser = () => {
        return JSON.parse(localStorage.getItem('user') || '{}');
    };

    const currentUser = getCurrentUser();
    const currentUserId = currentUser._id || currentUser.id || null;

    // Hàm lấy User ID từ object Member/User hoặc ID
    const getMemberUserId = (m) => {
        if (!m) return '';
        if (typeof m === 'object') {
            if (m.userId) {
                return typeof m.userId === 'object'
                    ? String(m.userId._id || m.userId.id || '')
                    : String(m.userId);
            }
            return String(m._id || m.id || '');
        }
        return String(m);
    };

    // Lấy mảng danh sách thành viên trong dự án
    const memberList = useMemo(() => {
        if (!project) return [];
        return Array.isArray(project.assignees) ? project.assignees : (project.members || []);
    }, [project]);

    // Tìm thông tin member tương ứng với currentUserId trong dự án (hoặc trong danh sách members tổng)
    const currentProjectMember = useMemo(() => {
        if (!currentUserId) return null;

        // 1. Tìm trong danh sách assignees / members của project trước
        const foundInProject = memberList.find(m => {
            const mUserId = getMemberUserId(m);
            return String(mUserId) === String(currentUserId);
        });

        if (foundInProject && typeof foundInProject === 'object' && foundInProject.role) {
            return foundInProject;
        }

        // 2. Tìm trong danh sách tất cả members lấy từ API
        const foundInAllMembers = members.find(m => {
            const mUserId = getMemberUserId(m);
            return String(mUserId) === String(currentUserId);
        });

        return foundInAllMembers || foundInProject || null;
    }, [currentUserId, memberList, members]);

    // Lấy role chính xác giống hệt như trang ProjectBoard
    const currentUserRole = currentProjectMember?.role || currentUser?.role;

    // Phân quyền chuẩn
    const isLeader = currentUserRole === 'Leader';
    const isManager = currentUserRole === 'Manager';

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

            const currentAssignees = Array.isArray(realProject?.assignees) ? realProject.assignees : [];
            const initialSelectedIds = currentAssignees
                .map(m => getMemberUserId(m))
                .filter(id => id && id.length > 0);

            setSelectedMembers(initialSelectedIds);
            setTasks(realTasks);
        } catch (err) {
            console.error('Lỗi khi tải cài đặt dự án:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleMemberSelection = (id) => {
        if (!isManager) return;
        setSelectedMembers((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    };

    const handleSaveGeneralSettings = async (e) => {
        e.preventDefault();
        if (!isManager) return;

        try {
            setSaving(true);

            const validAssignees = selectedMembers
                .map(id => String(id).trim())
                .filter(id => id.length > 0);

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                color: formData.color,
                date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                endDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                assignees: validAssignees
            };

            await updateProject(projectId, payload);
            await loadData();
        } catch (err) {
            console.error('Lỗi khi lưu thông tin chung:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveMembers = async () => {
        if (!isManager) return;

        try {
            setSaving(true);

            const validAssignees = selectedMembers
                .map(id => String(id).trim())
                .filter(id => id.length > 0);

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                color: formData.color,
                assignees: validAssignees
            };

            await updateProject(projectId, payload);
            await loadData();
        } catch (err) {
            console.error('Lỗi khi cập nhật thành viên:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!isManager) return;

        if (window.confirm('Bạn có chắc chắn muốn xóa dự án này không? Hành động này không thể hoàn tác.')) {
            try {
                await deleteProject(projectId);
                navigate('/dashboard');
            } catch (err) {
                console.error('Lỗi khi xóa dự án:', err);
            }
        }
    };

    const headerDueDate = (project?.date || project?.dueDate || project?.endDate)
        ? new Date(project.date || project.dueDate || project.endDate).toLocaleDateString('vi-VN')
        : 'Chưa đặt';

    const displayedMembers = isManager
        ? members
        : members.filter(m => selectedMembers.includes(getMemberUserId(m)));

    const disabledInputStyle = !isManager
        ? { cursor: 'not-allowed', backgroundColor: 'var(--color-bg-muted, #f1f5f9)', opacity: 0.8 }
        : {};

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

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '60vh', color: '#64748b', gap: '12px' }}>
                        <Loader2 className="animate-spin" style={{ width: 36, height: 36, color: '#4f46e5' }} />
                        <span style={{ fontSize: '15px', fontWeight: 500 }}>Loading...</span>
                    </div>
                ) : (
                    <>
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

                        {/* Main Settings Layout */}
                        <main className="page-content" style={{ padding: 'var(--space-6)' }}>
                            <div className="settings-layout">
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

                                    {isManager && (
                                        <button
                                            type="button"
                                            className={`settings-nav-item ${activeTab === 'danger' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('danger')}
                                        >
                                            Danger Zone
                                        </button>
                                    )}
                                </nav>

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
                                                    disabled={!isManager}
                                                    style={disabledInputStyle}
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
                                                    disabled={!isManager}
                                                    style={disabledInputStyle}
                                                />
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                                <div className="field">
                                                    <label className="field-label">Color</label>
                                                    <input
                                                        type="color"
                                                        style={{
                                                            height: '38px',
                                                            width: '100%',
                                                            padding: '2px',
                                                            cursor: isManager ? 'pointer' : 'not-allowed',
                                                            borderRadius: 'var(--radius-md)',
                                                            border: '1px solid var(--color-border)',
                                                            opacity: isManager ? 1 : 0.7
                                                        }}
                                                        value={formData.color}
                                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                        disabled={!isManager}
                                                    />
                                                </div>
                                                <div className="field">
                                                    <label className="field-label">End date</label>
                                                    <input
                                                        type="date"
                                                        className="input"
                                                        value={formData.dueDate}
                                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                        disabled={!isManager}
                                                        style={disabledInputStyle}
                                                    />
                                                </div>
                                            </div>

                                            {isManager && (
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
                                            )}
                                        </form>
                                    </div>

                                    {/* Tab Members */}
                                    <div className={`settings-section ${activeTab === 'members' ? 'active' : ''}`}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                                            <div>
                                                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Members</h2>
                                                <p style={{ fontSize: '13px', color: 'var(--text-muted, #64748b)' }}>
                                                    {isManager
                                                        ? `Select members to include in this project (${selectedMembers.length} selected)`
                                                        : `Project members list (${selectedMembers.length} members)`
                                                    }
                                                </p>
                                            </div>
                                            {isManager && (
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
                                            )}
                                        </div>

                                        <div className="card" style={{ maxHeight: '360px', overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--color-border)' }}>
                                            {displayedMembers.length === 0 ? (
                                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '4px' }}>Không có thành viên nào.</p>
                                            ) : (
                                                displayedMembers.map((member) => {
                                                    const memberId = getMemberUserId(member);
                                                    const userObj = member.userId && typeof member.userId === 'object' ? member.userId : member;
                                                    const displayName = userObj.username || userObj.name || userObj.email || 'User';
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
                                                                cursor: isManager ? 'pointer' : 'not-allowed',
                                                                backgroundColor: isChecked ? 'var(--color-bg-subtle, #f8fafc)' : 'transparent',
                                                                border: '1px solid',
                                                                borderColor: isChecked ? 'var(--color-primary-light, #e0e7ff)' : 'transparent'
                                                            }}
                                                        >
                                                            {isManager && (
                                                                <input
                                                                    type="checkbox"
                                                                    className="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => toggleMemberSelection(memberId)}
                                                                    style={{ cursor: isManager ? 'pointer' : 'not-allowed' }}
                                                                />
                                                            )}
                                                            <span className="avatar avatar-xs" style={{ background: '#4f46e5', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '28px', height: '28px' }}>
                                                                {initials}
                                                            </span>
                                                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                                <span style={{ fontSize: '14px', fontWeight: 500 }}>{displayName}</span>
                                                                <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>{userObj.email || member.role || 'Member'}</span>
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
                                    {isManager && (
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
                                    )}
                                </div>
                            </div>
                        </main>
                    </>
                )}
            </div>
        </div>
    );
}