import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from './../../components/layout/Header/Header.jsx';
// import Sidebar from './../../components/layout/Sidebar/Sidebar.jsx';
// import {
//     fetchProjectById,
//     updateProject,
//     deleteProject,
//     addProjectAssignee,
//     removeProjectAssignee,
//     fetchUsers 
// } from '../../../api.jsx';

import {
    LayoutGrid,
    List,
    Calendar,
    Settings,
    UsersRound,
    Trash2,
    UserPlus,
    ShieldAlert,
    Loader2,
    Check,
    Save
} from 'lucide-react';

const getInitials = (name) => {
    if (!name) return '??';
    const words = String(name).trim().split(/\s+/);
    return words.length === 1
        ? words[0].substring(0, 2).toUpperCase()
        : (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const getMemberUserId = (member) => {
    if (!member) return null;
    if (typeof member === 'object') {
        if (member.userId) {
            return typeof member.userId === 'object' ? String(member.userId._id || member.userId.id) : String(member.userId);
        }
        return String(member._id || member.id || '');
    }
    return String(member);
};

const getMemberDisplayName = (member) => {
    if (!member) return 'User';
    if (typeof member === 'object') {
        const u = member.userId && typeof member.userId === 'object' ? member.userId : member;
        return u.username || u.name || u.email || 'User';
    }
    return 'User';
};

export default function ProjectSetting() {
    const { id: projectId } = useParams();
    const navigate = useNavigate();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('general'); // 'general' | 'members' | 'danger'

    const [project, setProject] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form data General Settings
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#4f46e5',
        dueDate: ''
    });

    // Selected User to Add
    const [selectedUserToAdd, setSelectedUserToAdd] = useState('');
    const [selectedRoleToAdd, setSelectedRoleToAdd] = useState('Member');

    const getCurrentUser = () => {
        return JSON.parse(localStorage.getItem('user') || localStorage.getItem('member') || '{}');
    };

    const currentUser = getCurrentUser();
    const currentUserId = currentUser._id || currentUser.id || null;

    // Lấy danh sách thành viên trong dự án
    const memberList = useMemo(() => {
        return Array.isArray(project?.assignees) ? project.assignees : (project?.members || []);
    }, [project]);

    // Lấy thông tin record thành viên của user hiện tại
    const currentProjectMember = useMemo(() => {
        if (!currentUserId || !memberList.length) return null;
        return memberList.find(m => String(getMemberUserId(m)) === String(currentUserId));
    }, [currentUserId, memberList]);

    // Xác định vai trò của User hiện tại trong Project
    const isOwner = useMemo(() => {
        const ownerId = typeof project?.userId === 'object' ? (project?.userId?._id || project?.userId?.id) : project?.userId;
        return String(ownerId) === String(currentUserId);
    }, [project, currentUserId]);

    const projectRole = useMemo(() => {
        if (isOwner) return 'Owner';
        return currentProjectMember?.roleInProject || currentProjectMember?.role || 'Member';
    }, [isOwner, currentProjectMember]);

    const canManageSettings = isOwner || projectRole === 'Manager';

    const loadData = async () => {
        try {
            setLoading(true);
            const pData = await fetchProjectById(projectId);
            const realProject = pData?.data || pData || {};

            setProject(realProject);
            setFormData({
                name: realProject.name || '',
                description: realProject.description || '',
                color: realProject.color || '#4f46e5',
                dueDate: realProject.date ? new Date(realProject.date).toISOString().split('T')[0] : ''
            });

            // Tải danh sách user hệ thống để thêm vào dự án nếu có quyền
            if (typeof fetchUsers === 'function') {
                const uData = await fetchUsers().catch(() => []);
                const usersList = Array.isArray(uData) ? uData : (uData?.data || []);
                setAllUsers(usersList);
            }
        } catch (err) {
            console.error("Lỗi tải thông tin project settings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            loadData();
        }
    }, [projectId]);

    // 1. LƯU THÔNG TIN CHUNG (GENERAL SETTINGS)
    const handleSaveGeneral = async (e) => {
        e.preventDefault();
        if (!canManageSettings) return;

        try {
            setSaving(true);
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                color: formData.color,
                date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
            };

            await updateProject(projectId, payload);
            await loadData();
            alert("Đã cập nhật thông tin dự án thành công!");
        } catch (err) {
            console.error("Lỗi cập nhật thông tin chung:", err);
            alert(err.message || "Không thể cập nhật thông tin dự án!");
        } finally {
            setSaving(false);
        }
    };

    // 2. THAY ĐỔI ROLE THÀNH VIÊN TRONG PROJECT
    const handleChangeMemberRole = async (memberUserId, newRole) => {
        if (!canManageSettings) return;

        try {
            setSaving(true);

            // Chuẩn hóa mảng assignees kèm role trong project
            const updatedAssignees = memberList.map(m => {
                const uId = getMemberUserId(m);
                if (String(uId) === String(memberUserId)) {
                    return typeof m === 'object'
                        ? { ...m, roleInProject: newRole, role: newRole }
                        : { userId: uId, roleInProject: newRole, role: newRole };
                }
                return m;
            });

            await updateProject(projectId, { assignees: updatedAssignees });
            await loadData();
        } catch (err) {
            console.error("Lỗi thay đổi role thành viên:", err);
            alert("Lỗi khi cập nhật vai trò thành viên!");
        } finally {
            setSaving(false);
        }
    };

    // 3. THÊM THÀNH VIÊN VÀO PROJECT KÈM ROLE
    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!canManageSettings || !selectedUserToAdd) return;

        try {
            setSaving(true);
            await addProjectAssignee(projectId, {
                memberUserId: selectedUserToAdd,
                role: selectedRoleToAdd,
                roleInProject: selectedRoleToAdd
            });
            setSelectedUserToAdd('');
            await loadData();
            alert("Thêm thành viên vào dự án thành công!");
        } catch (err) {
            console.error("Lỗi thêm thành viên:", err);
            alert(err.message || "Không thể thêm thành viên!");
        } finally {
            setSaving(false);
        }
    };

    // 4. XOÁ THÀNH VIÊN KHỎI PROJECT
    const handleRemoveMember = async (memberUserId) => {
        if (!canManageSettings) return;
        if (!window.confirm("Bạn có chắc chắn muốn mời thành viên này ra khỏi dự án?")) return;

        try {
            setSaving(true);
            await removeProjectAssignee(projectId, memberUserId);
            await loadData();
        } catch (err) {
            console.error("Lỗi xoá thành viên:", err);
            alert(err.message || "Không thể xoá thành viên!");
        } finally {
            setSaving(false);
        }
    };

    // 5. XOÁ DỰ ÁN (DANGER ZONE - CHỈ OWNER MỚI ĐƯỢC XOÁ)
    const handleDeleteProject = async () => {
        if (!isOwner) {
            alert("Chỉ người tạo dự án (Owner) mới có quyền xóa dự án!");
            return;
        }

        const confirmName = prompt(`CẢNH BÁO: Hành động này không thể hoàn tác!\nNhập tên dự án "${project?.name}" để xác nhận xóa:`);
        if (confirmName !== project?.name) {
            alert("Tên dự án không khớp. Hủy thao tác xóa!");
            return;
        }

        try {
            setSaving(true);
            await deleteProject(projectId);
            alert("Đã xóa dự án thành công!");
            navigate('/dashboard');
        } catch (err) {
            console.error("Lỗi xóa dự án:", err);
            alert(err.message || "Không thể xóa dự án!");
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '12px', color: '#64748b' }}>
                <Loader2 className="animate-spin" size={40} style={{ color: '#4f46e5' }} />
                <span>Đang tải cài đặt dự án...</span>
            </div>
        );
    }

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
                />

                <div className="project-header">
                    <div className="project-header-top">
                        <div>
                            <div className="project-title-row">
                                <span className="project-color-dot" style={{ background: project?.color || '#4f46e5' }}></span>
                                <h1>{project?.name || 'Project Settings'}</h1>
                            </div>
                            <p className="page-subtitle">Quản lý thông tin chung và phân quyền thành viên trong dự án</p>
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
                        <Link to={`/projectsetting/${projectId}`} className="project-tab active">
                            <Settings className="icon icon-sm" /> Settings
                        </Link>
                    </nav>
                </div>

                <main className="page-content" style={{ padding: '24px', maxWidth: '1000px' }}>
                    {/* SUB TABS TRONG CÀI ĐẶT */}
                    <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <button
                            onClick={() => setActiveTab('general')}
                            style={{
                                padding: '8px 16px',
                                fontWeight: 500,
                                borderBottom: activeTab === 'general' ? '2px solid #4f46e5' : '2px solid transparent',
                                color: activeTab === 'general' ? '#4f46e5' : '#64748b',
                                background: 'none',
                                borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Thông tin chung
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            style={{
                                padding: '8px 16px',
                                fontWeight: 500,
                                borderBottom: activeTab === 'members' ? '2px solid #4f46e5' : '2px solid transparent',
                                color: activeTab === 'members' ? '#4f46e5' : '#64748b',
                                background: 'none',
                                borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Thành viên & Phân quyền
                        </button>
                        {isOwner && (
                            <button
                                onClick={() => setActiveTab('danger')}
                                style={{
                                    padding: '8px 16px',
                                    fontWeight: 500,
                                    borderBottom: activeTab === 'danger' ? '2px solid #ef4444' : '2px solid transparent',
                                    color: activeTab === 'danger' ? '#ef4444' : '#64748b',
                                    background: 'none',
                                    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Vùng nguy hiểm
                            </button>
                        )}
                    </div>

                    {/* TAB 1: THÔNG TIN CHUNG */}
                    {activeTab === 'general' && (
                        <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 600 }}>Tên dự án *</label>
                                    <input
                                        className="input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={!canManageSettings}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 600 }}>Mô tả dự án</label>
                                    <textarea
                                        className="textarea"
                                        rows="4"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        disabled={!canManageSettings}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Màu nhận diện</label>
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            disabled={!canManageSettings}
                                            style={{ width: '100%', height: '38px', padding: '2px', cursor: canManageSettings ? 'pointer' : 'not-allowed' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Ngày kết thúc</label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            disabled={!canManageSettings}
                                        />
                                    </div>
                                </div>

                                {canManageSettings && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                            <span>Lưu thay đổi</span>
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* TAB 2: THÀNH VIÊN & PHÂN QUYỀN RIÊNG DỰ ÁN */}
                    {activeTab === 'members' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {canManageSettings && allUsers.length > 0 && (
                                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Thêm thành viên vào dự án</h3>
                                    <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '12px' }}>
                                        <select
                                            className="select"
                                            style={{ flex: 1 }}
                                            value={selectedUserToAdd}
                                            onChange={(e) => setSelectedUserToAdd(e.target.value)}
                                        >
                                            <option value="">-- Chọn tài khoản --</option>
                                            {allUsers.map((u) => {
                                                const uId = String(u._id || u.id);
                                                const isAlreadyIn = memberList.some(m => String(getMemberUserId(m)) === uId);
                                                if (isAlreadyIn) return null;

                                                return (
                                                    <option key={uId} value={uId}>
                                                        {u.username || u.name} ({u.email})
                                                    </option>
                                                );
                                            })}
                                        </select>

                                        <select
                                            className="select"
                                            style={{ width: '150px' }}
                                            value={selectedRoleToAdd}
                                            onChange={(e) => setSelectedRoleToAdd(e.target.value)}
                                        >
                                            <option value="Manager">Manager</option>
                                            <option value="Leader">Leader</option>
                                            <option value="Member">Member</option>
                                        </select>

                                        <button type="submit" className="btn btn-primary" disabled={!selectedUserToAdd || saving}>
                                            <UserPlus size={16} /> Thêm
                                        </button>
                                    </form>
                                </div>
                            )}

                            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                                    <tr>
                                        <th style={{ padding: '12px 16px' }}>Thành viên</th>
                                        <th style={{ padding: '12px 16px' }}>Vai trò trong dự án</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {/* Hiển thị Project Owner */}
                                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span className="avatar avatar-xs" style={{ background: '#4f46e5', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                                    {getInitials(getMemberDisplayName(project?.userId))}
                                                </span>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{getMemberDisplayName(project?.userId)}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>Chủ dự án</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                                <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#e0e7ff', color: '#3730a3', fontWeight: 600, fontSize: '12px' }}>
                                                    Owner
                                                </span>
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#94a3b8', fontSize: '12px' }}>
                                            Cố định
                                        </td>
                                    </tr>

                                    {/* Danh sách Assignees */}
                                    {memberList.map((m, idx) => {
                                        const mUserId = getMemberUserId(m);
                                        const name = getMemberDisplayName(m);
                                        const mRole = m.roleInProject || m.role || 'Member';

                                        if (String(mUserId) === String(getMemberUserId(project?.userId))) return null;

                                        return (
                                            <tr key={mUserId || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span className="avatar avatar-xs" style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                                            {getInitials(name)}
                                                        </span>
                                                    <span style={{ fontWeight: 500 }}>{name}</span>
                                                </td>

                                                <td style={{ padding: '12px 16px' }}>
                                                    {canManageSettings ? (
                                                        <select
                                                            className="select"
                                                            style={{ width: '130px', padding: '4px 8px' }}
                                                            value={mRole}
                                                            onChange={(e) => handleChangeMemberRole(mUserId, e.target.value)}
                                                        >
                                                            <option value="Manager">Manager</option>
                                                            <option value="Leader">Leader</option>
                                                            <option value="Member">Member</option>
                                                        </select>
                                                    ) : (
                                                        <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: 500, fontSize: '12px' }}>
                                                                {mRole}
                                                            </span>
                                                    )}
                                                </td>

                                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                    {canManageSettings && (
                                                        <button
                                                            onClick={() => handleRemoveMember(mUserId)}
                                                            className="btn btn-danger btn-sm"
                                                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                                            title="Xoá khỏi dự án"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: DANGER ZONE (XOÁ PROJECT) */}
                    {activeTab === 'danger' && isOwner && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '24px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginBottom: '12px' }}>
                                <ShieldAlert size={24} />
                                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Xóa dự án này</h3>
                            </div>
                            <p style={{ fontSize: '14px', color: '#7f1d1d', marginBottom: '16px' }}>
                                Một khi bạn xóa dự án, tất cả các Cột, Task, Hoạt động và Bình luận liên quan cũng sẽ bị xóa vĩnh viễn và không thể khôi phục.
                            </p>
                            <button
                                onClick={handleDeleteProject}
                                className="btn"
                                style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 16px', fontWeight: 600, cursor: 'pointer' }}
                                disabled={saving}
                            >
                                Xóa dự án vĩnh viễn
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}