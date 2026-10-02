import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from './../../components/layout/Header/Header.jsx';
<<<<<<< HEAD
// import Sidebar from './../../components/layout/Sidebar/Sidebar.jsx';
// import {
//     fetchProjectById,
//     updateProject,
//     deleteProject,
//     addProjectAssignee,
//     removeProjectAssignee,
//     fetchUsers 
// } from '../../../api.jsx';
=======
import Sidebar from './../../components/layout/Sidebar/Sidebar.jsx';
>>>>>>> c21a71edaf752577502be9e8c6339e3e3b1b5a7b

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
    Loader2,
    Search,
    UserPlus,
    X,
    MoreHorizontal,
    UserCog
} from 'lucide-react';

import {
    fetchProjectById,
    fetchTasksByProject,
    updateProject,
    deleteProject,
    fetchMembersByProject,
    inviteMember,
    deleteMemberByProject
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
        startDate: '',
        dueDate: ''
    });

    // States cho quản lý Members
    const [projectMembers, setProjectMembers] = useState([]);
    const [searchMember, setSearchMember] = useState("");
    const [openDropdown, setDropDown] = useState(null);
    const [memberCurrentRole, setMemberRole] = useState("");

    // States cho Modal Invite
    const [openInviteModal, setOpenInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Member");

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Ngày hôm nay theo chuẩn ISO YYYY-MM-DD dùng cho thuộc tính min của input date
    const todayString = new Date().toISOString().split('T')[0];

    const getCurrentUser = () => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
            return {};
        }
    };

    const currentUser = getCurrentUser();
    const currentUserId = currentUser._id || currentUser.id || null;

    // Lấy thông tin Member Role từ server
    const fetchCurrentMemberRole = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch("http://localhost:3000/api/user/currentUser", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setMemberRole(data.memberRole || "");
        } catch (err) {
            console.error("Không thể lấy thông tin role hiện tại:", err);
        }
    };

    // Helper kiểm tra/rút trích User ID từ record Member
    const extractUserId = (member) => {
        if (!member) return '';
        if (typeof member.userId === 'object') {
            return String(member.userId?._id || member.userId?.id || '');
        }
        if (member.userId) return String(member.userId);
        return String(member._id || member.id || '');
    };

    // Tìm thông tin role của current user trong dự án này
    const currentProjectMember = useMemo(() => {
        if (!currentUserId || !projectMembers.length) return null;

        return projectMembers.find(m => {
            const uId = extractUserId(m);
            return uId === String(currentUserId);
        }) || null;
    }, [currentUserId, projectMembers]);

    const currentUserRole = currentProjectMember?.role || currentUser?.role || memberCurrentRole;

    const isAdmin = String(currentUser?.role).toLowerCase() === 'admin';
    const isLeader = currentUserRole === 'Leader';
    const isManager = currentUserRole === 'Manager';

    const canManage = isAdmin || isManager;
    const canDelete = isAdmin; // Chỉ Admin mới có quyền xóa dự án

    // Đảm bảo Manager hoặc Role khác không lỡ ở tab 'danger'
    useEffect(() => {
        if (!canDelete && activeTab === 'danger') {
            setActiveTab('general');
        }
    }, [canDelete, activeTab]);

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

            const [projectData, tskList, membersData] = await Promise.all([
                fetchProjectById(projectId).catch(() => null),
                fetchTasksByProject(projectId).catch(() => []),
                fetchMembersByProject(projectId).catch(() => [])
            ]);

            const realProject = projectData?.data || projectData || {};
            const realTasks = Array.isArray(tskList) ? tskList : (tskList?.data || []);
            const realMembers = Array.isArray(membersData)
                ? membersData
                : (membersData?.data || membersData?.members || []);

            const rawStartDate = realProject.startDate || realProject.start_date || realProject.createdAt;
            const formattedStartDate = formatDateForInput(rawStartDate);

            const rawDueDate = realProject.date || realProject.dueDate || realProject.endDate;
            const formattedDueDate = formatDateForInput(rawDueDate);

            setProject(realProject);
            setProjectMembers(realMembers);

            setFormData({
                name: realProject.name || '',
                description: realProject.description || realProject.desc || '',
                color: realProject.color || '#4f46e5',
                startDate: formattedStartDate,
                dueDate: formattedDueDate
            });

            setTasks(realTasks);
        } catch (err) {
            console.error('Lỗi khi tải cài đặt dự án:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleDropdown = (userId) => {
        setDropDown(prev => prev === userId ? null : userId);
    };

    // Hàm cập nhật vai trò member
    const handleUpdateRole = async (memberId, currentRole, newRole) => {
        if (currentRole === newRole) {
            setDropDown(null);
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3000/api/member/${memberId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Cập nhật thất bại");
            }

            setProjectMembers((prevMembers) =>
                prevMembers.map((m) => (m._id === memberId ? { ...m, role: newRole } : m))
            );
            setDropDown(null);
        } catch (error) {
            console.error("Lỗi update role:", error);
        }
    };

    // Hàm xóa thành viên khỏi dự án
    const handleDeleteMember = async (member) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi dự án?")) {
            return;
        }

        try {
            await deleteMemberByProject(member._id);

            setProjectMembers((prevMembers) =>
                prevMembers.filter((m) => m._id !== member._id)
            );

            setDropDown(null);
        } catch (error) {
            console.error("Lỗi xóa member:", error);
        }
    };

    // Mời thành viên mới vào dự án
    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            return;
        }

        try {
            const resData = await inviteMember({
                email: inviteEmail,
                role: inviteRole,
                projectId: projectId
            });

            const newMember = resData?.member || resData;
            if (newMember) {
                setProjectMembers((prevMembers) => [newMember, ...prevMembers]);
            }

            setOpenInviteModal(false);
            setInviteEmail("");
            setInviteRole("Member");
        } catch (error) {
            console.error("Lỗi gửi lời mời:", error);
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const words = String(name).trim().split(/\s+/);
        return words.length === 1
            ? words[0].substring(0, 2).toUpperCase()
            : (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };

    // Lọc danh sách projectMembers theo từ khóa ô tìm kiếm
    const filteredMembers = projectMembers.filter((m) => {
        const username = m.userId?.username || m.username || m.name || "";
        const email = m.userId?.email || m.email || "";
        const search = searchMember.toLowerCase();
        return username.toLowerCase().includes(search) || email.toLowerCase().includes(search);
    });

    const handleSaveGeneralSettings = async (e) => {
        e.preventDefault();
        if (!canManage) return;

        // Kiểm tra hợp lệ giữa Start date và End date
        if (formData.startDate && formData.dueDate) {
            const startDate = new Date(formData.startDate);
            const dueDate = new Date(formData.dueDate);

            if (startDate > dueDate) {
                alert('Ngày bắt đầu (Start date) không thể sau ngày kết thúc (End date)!');
                return;
            }
        }

        // Chặn chọn ngày trong quá khứ đối với End date
        if (formData.dueDate) {
            const selectedDate = new Date(formData.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                alert('Ngày kết thúc dự án (End date) không được nằm trong quá khứ!');
                return;
            }
        }

        try {
            setSaving(true);

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                color: formData.color,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                endDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
            };

            await updateProject(projectId, payload);

            // Cập nhật state trực tiếp không gọi lại loadData()
            setProject(prev => ({
                ...prev,
                name: payload.name,
                description: payload.description,
                color: payload.color,
                startDate: payload.startDate,
                start_date: payload.start_date,
                date: payload.date,
                dueDate: payload.dueDate,
                endDate: payload.endDate
            }));
        } catch (err) {
            console.error('Lỗi khi lưu thông tin chung:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!canDelete) return;

        if (window.confirm('Bạn có chắc chắn muốn xóa dự án này không? Hành động này không thể hoàn tác.')) {
            try {
                await deleteProject(projectId);
                navigate('/dashboard');
            } catch (err) {
                console.error('Lỗi khi xóa dự án:', err);
            }
        }
    };

    const headerStartDate = (project?.startDate || project?.start_date || project?.createdAt)
        ? new Date(project.startDate || project.start_date || project.createdAt).toLocaleDateString('vi-VN')
        : 'Chưa đặt';

    const headerDueDate = (project?.date || project?.dueDate || project?.endDate)
        ? new Date(project.date || project.dueDate || project.endDate).toLocaleDateString('vi-VN')
        : 'Chưa đặt';

    const disabledInputStyle = !canManage
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
                                            <UsersRound className="icon icon-sm" />{projectMembers.length} members
                                        </span>
                                        <span className="project-meta-item">
                                            <ListChecks className="icon icon-sm" />{tasks.length} tasks
                                        </span>
                                        <span className="project-meta-item">
                                            <CalendarClock className="icon icon-sm" />start date: {headerStartDate}
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
                                    <List className="icon icon-sm" /> Backlog
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
                                        Members ({filteredMembers.length})
                                    </button>

                                    {/* Chỉ hiển thị Danger Zone đối với Admin (canDelete) */}
                                    {canDelete && (
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
                                                    disabled={!canManage}
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
                                                    disabled={!canManage}
                                                    style={disabledInputStyle}
                                                />
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                                                <div className="field">
                                                    <label className="field-label">Color</label>
                                                    <input
                                                        type="color"
                                                        style={{
                                                            height: '38px',
                                                            width: '100%',
                                                            padding: '2px',
                                                            cursor: canManage ? 'pointer' : 'not-allowed',
                                                            borderRadius: 'var(--radius-md)',
                                                            border: '1px solid var(--color-border)',
                                                            opacity: canManage ? 1 : 0.7
                                                        }}
                                                        value={formData.color}
                                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                        disabled={!canManage}
                                                    />
                                                </div>
                                                <div className="field">
                                                    <label className="field-label">Start date</label>
                                                    <input
                                                        type="date"
                                                        className="input"
                                                        value={formData.startDate}
                                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                        disabled={!canManage}
                                                        style={disabledInputStyle}
                                                    />
                                                </div>
                                                <div className="field">
                                                    <label className="field-label">End date</label>
                                                    <input
                                                        type="date"
                                                        className="input"
                                                        min={todayString}
                                                        value={formData.dueDate}
                                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                        disabled={!canManage}
                                                        style={disabledInputStyle}
                                                    />
                                                </div>
                                            </div>

                                            {canManage && (
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
                                        <div style={{ marginBottom: 'var(--space-4)' }}>
                                            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Project Members</h2>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted, #64748b)', marginTop: '4px' }}>
                                                Manage access and view members of this project.
                                            </p>
                                        </div>

                                        {/* Thanh công cụ: Search & Nút Invite */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', gap: '16px' }}>
                                            <div className="input-icon-wrap" style={{ width: '320px', position: 'relative' }}>
                                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                                <input
                                                    className="input"
                                                    placeholder="Search members…"
                                                    value={searchMember}
                                                    onChange={(e) => setSearchMember(e.target.value)}
                                                    style={{ paddingLeft: '38px', height: '38px' }}
                                                />
                                            </div>

                                            {canManage && (
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenInviteModal(true)}
                                                    className="btn btn-primary"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', height: '38px' }}
                                                >
                                                    <UserPlus size={18} /> Invite
                                                </button>
                                            )}
                                        </div>

                                        {/* Bảng Danh Sách Member */}
                                        <div className="card" style={{ overflow: 'visible' }}>
                                            <div
                                                className="member-table-header"
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: "1fr 100px 120px 120px 48px",
                                                    alignItems: 'center',
                                                    padding: '16px 20px',
                                                    fontWeight: 600,
                                                    borderBottom: '1px solid var(--color-border)',
                                                    fontSize: '14px',
                                                    backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
                                                    color: '#475569'
                                                }}
                                            >
                                                <span>Member</span>
                                                <span>Point</span>
                                                <span>Position</span>
                                                <span>Status</span>
                                                <span></span>
                                            </div>

                                            {filteredMembers.length > 0 ? (
                                                filteredMembers.map((m, idx) => {
                                                    const username = m.userId?.username || m.username || m.name || "Chưa cập nhật";
                                                    const email = m.userId?.email || m.email || "Không có email";
                                                    const points = m.userId?.points ?? m.userId?.point ?? m.points ?? m.point ?? 0;
                                                    const role = m.role || "Member";
                                                    const status = m.status || "Active";

                                                    return (
                                                        <div
                                                            key={m._id || idx}
                                                            className="member-row"
                                                            style={{
                                                                display: 'grid',
                                                                gridTemplateColumns: "1fr 100px 120px 120px 48px",
                                                                alignItems: 'center',
                                                                padding: '16px 20px',
                                                                borderBottom: '1px solid var(--color-border)'
                                                            }}
                                                        >
                                                            {/* Thông tin cá nhân */}
                                                            <div className="member-identity" style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                                                                <span className="avatar avatar-sm" style={{ background: '#4f46e5', color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '40px', height: '40px', fontWeight: 600, flexShrink: 0 }}>
                                                                    {getInitials(username)}
                                                                </span>
                                                                <div className="member-identity-text" style={{ overflow: 'hidden' }}>
                                                                    <p className="member-name" style={{ fontSize: '15px', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{username}</p>
                                                                    <p className="member-email" style={{ fontSize: '13px', color: 'var(--text-muted, #64748b)', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</p>
                                                                </div>
                                                            </div>

                                                            {/* Điểm số (Point) */}
                                                            <div>
                                                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                                                                    {points} pts
                                                                </span>
                                                            </div>

                                                            {/* Vai trò */}
                                                            <div>
                                                                <span
                                                                    className="badge"
                                                                    style={{
                                                                        backgroundColor: role === 'Manager' ? '#8b5cf6' : role === 'Leader' ? '#f59e0b' : '#f1f5f9',
                                                                        color: role === 'Manager' || role === 'Leader' ? '#ffffff' : '#475569',
                                                                        border: role === 'Member' ? '1px solid #cbd5e1' : 'none',
                                                                        padding: '4px 12px',
                                                                        borderRadius: '12px',
                                                                        fontSize: '13px',
                                                                        fontWeight: '500'
                                                                    }}
                                                                >
                                                                    {role}
                                                                </span>
                                                            </div>

                                                            {/* Trạng thái */}
                                                            <div>
                                                                <span className={`badge ${status === 'Active' ? 'badge-success' : 'badge-warning'}`} style={{ padding: '4px 12px', fontSize: '13px' }}>
                                                                    {status}
                                                                </span>
                                                            </div>

                                                            {/* Menu thao tác */}
                                                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                                                {(canManage || memberCurrentRole === "Manager") && (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleDropdown(m._id)}
                                                                            className="icon-btn icon-btn-sm"
                                                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '6px' }}
                                                                        >
                                                                            <MoreHorizontal size={20} />
                                                                        </button>

                                                                        {openDropdown === m._id && (
                                                                            <div
                                                                                className="dropdown-menu"
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    right: 0,
                                                                                    top: '100%',
                                                                                    zIndex: 100,
                                                                                    background: '#fff',
                                                                                    border: '1px solid var(--color-border)',
                                                                                    borderRadius: '8px',
                                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                                                    padding: '6px 0',
                                                                                    minWidth: '170px'
                                                                                }}
                                                                            >
                                                                                {/* Logic theo từng vai trò */}
                                                                                {role === 'Manager' && (
                                                                                    <>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleUpdateRole(m._id, role, "Leader")}
                                                                                            className="dropdown-item"
                                                                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 14px', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                                                                        >
                                                                                            <UserCog size={16} /> Set as Leader
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleUpdateRole(m._id, role, "Member")}
                                                                                            className="dropdown-item"
                                                                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 14px', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                                                                        >
                                                                                            <UserCog size={16} /> Set as Member
                                                                                        </button>
                                                                                    </>
                                                                                )}

                                                                                {role === 'Leader' && (
                                                                                    <>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleUpdateRole(m._id, role, "Manager")}
                                                                                            className="dropdown-item"
                                                                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 14px', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                                                                        >
                                                                                            <UserCog size={16} /> Set as Manager
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleUpdateRole(m._id, role, "Member")}
                                                                                            className="dropdown-item"
                                                                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 14px', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                                                                        >
                                                                                            <UserCog size={16} /> Set as Member
                                                                                        </button>
                                                                                    </>
                                                                                )}

                                                                                {role === 'Member' && (
                                                                                    <>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleUpdateRole(m._id, role, "Leader")}
                                                                                            className="dropdown-item"
                                                                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 14px', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                                                                        >
                                                                                            <UserCog size={16} /> Set as Leader
                                                                                        </button>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleUpdateRole(m._id, role, "Manager")}
                                                                                            className="dropdown-item"
                                                                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 14px', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                                                                        >
                                                                                            <UserCog size={16} /> Set as Manager
                                                                                        </button>
                                                                                    </>
                                                                                )}

                                                                                {/* NÚT XÓA THÀNH VIÊN */}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleDeleteMember(m)}
                                                                                    className="dropdown-item"
                                                                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 14px', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#dc2626' }}
                                                                                >
                                                                                    <Trash2 size={16} /> Remove Member
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No members found for this project</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tab Danger Zone (Chỉ hiển thị cho Admin) */}
                                    {canDelete && (
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

            {/* MODAL INVITE MEMBER */}
            {openInviteModal && (
                <div className="modal-overlay" id="inviteMemberModal" onClick={() => setOpenInviteModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Invite a member</h2>
                                <p className="modal-desc">Add a new person to this project.</p>
                            </div>
                            <button onClick={() => setOpenInviteModal(false)} className="icon-btn" aria-label="Close" style={{ cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div className="field">
                                <label className="field-label">Email *</label>
                                <input
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="input"
                                    type="email"
                                    placeholder="teammate@company.com"
                                    required
                                />
                            </div>

                            <div className="field">
                                <label className="field-label">Role</label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="select"
                                >
                                    <option value="Member">Member</option>
                                    <option value="Leader">Leader</option>
                                    <option value="Manager">Manager</option>
                                </select>
                            </div>
                            <button className="btn btn-primary" style={{ alignSelf: 'flex-start', cursor: 'pointer' }} onClick={handleInvite}>
                                Add Member
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}