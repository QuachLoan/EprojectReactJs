import React, { useEffect, useState, useMemo, useRef } from 'react';
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
    Loader2,
    Search,
    UserPlus,
    X,
    MoreHorizontal,
    UserCog,
    Info,
    BarChart2,
} from 'lucide-react';

import {
    fetchProjectById,
    fetchTasksByProject,
    fetchColumnsByProject,
    updateProject,
    deleteProject,
    fetchMembersByProject,
    inviteMember,
    deleteMemberByProject,
    fetchUsers // Or fetchAllUsers depending on your api/index.js exports
} from '../../../api';

const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateDMY = (dateValue) => {
    if (!dateValue) return 'Not set';
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return 'Not set';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const calculateProjectWeeks = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return [{ index: 1, label: 'Week 1' }];

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return [{ index: 1, label: 'Week 1' }];
    }

    const weeks = [];
    let currentStart = new Date(start);
    let index = 1;

    while (currentStart <= end) {
        let currentEnd = new Date(currentStart);
        currentEnd.setDate(currentEnd.getDate() + 6);

        if (currentEnd > end) {
            currentEnd = new Date(end);
        }

        const formatDay = (d) => {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            return `${day}/${month}`;
        };

        weeks.push({
            index: index,
            label: `Week ${index} (${formatDay(currentStart)} - ${formatDay(currentEnd)})`
        });

        currentStart = new Date(currentEnd);
        currentStart.setDate(currentStart.getDate() + 1);
        index++;
    }

    return weeks.length > 0 ? weeks : [{ index: 1, label: 'Week 1' }];
};

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
        dueDate: '',
        budget: '',
        costPerPoint: ''
    });

    const [projectMembers, setProjectMembers] = useState([]);
    const [searchMember, setSearchMember] = useState("");
    const [openDropdown, setDropDown] = useState(null);
    const [memberCurrentRole, setMemberRole] = useState("");

    const [selectedWeek, setSelectedWeek] = useState(1);

    const [openInviteModal, setOpenInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Member");

    // --- State & Ref for Autocomplete Suggestions ---
    const [allUsers, setAllUsers] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRef = useRef(null);

    const [tasks, setTasks] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const todayString = getTodayString();

    const getCurrentUser = () => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
            return {};
        }
    };

    const currentUser = getCurrentUser();
    const currentUserId = currentUser._id || currentUser.id || null;

    const projectWeeks = useMemo(() => {
        const sDate = project?.startDate || project?.start_date || project?.createdAt || formData.startDate;
        const eDate = project?.date || project?.dueDate || project?.endDate || formData.dueDate;
        return calculateProjectWeeks(sDate, eDate);
    }, [project, formData.startDate, formData.dueDate]);

    // Fetch system users list when Invite Modal opens
    useEffect(() => {
        if (openInviteModal) {
            const loadAllUsers = async () => {
                try {
                    // Call imported API function
                    const res = await fetchUsers();

                    // Flexibly handle response payload structure
                    const userList = Array.isArray(res) ? res : (res?.data || res?.users || []);
                    setAllUsers(userList);
                } catch (err) {
                    console.error("Failed to load user suggestions:", err);
                }
            };
            loadAllUsers();
        }
    }, [openInviteModal]);

    // Handle clicking outside to hide suggestions dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter user suggestions based on input
    const suggestedUsers = useMemo(() => {
        if (!inviteEmail.trim()) return [];

        const search = inviteEmail.toLowerCase();

        // Collect existing project members' emails
        const existingEmails = projectMembers.map(m => {
            const email = m.userId?.email || m.email || "";
            return email.toLowerCase();
        });

        return allUsers.filter(u => {
            const userEmail = (u.email || "").toLowerCase();
            const userName = (u.username || u.name || "").toLowerCase();

            // Exclude users already in current project
            const isAlreadyMember = existingEmails.includes(userEmail);

            return !isAlreadyMember && (userEmail.includes(search) || userName.includes(search));
        });
    }, [inviteEmail, allUsers, projectMembers]);

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
            console.error("Failed to get current role:", err);
        }
    };

    const extractUserId = (member) => {
        if (!member) return '';
        if (typeof member.userId === 'object') {
            return String(member.userId?._id || member.userId?.id || '');
        }
        if (member.userId) return String(member.userId);
        return String(member._id || member.id || '');
    };

    const currentProjectMember = useMemo(() => {
        if (!currentUserId || !projectMembers.length) return null;

        return projectMembers.find(m => {
            const uId = extractUserId(m);
            return uId === String(currentUserId);
        }) || null;
    }, [currentUserId, projectMembers]);

    const currentUserRole = currentProjectMember?.role || currentUser?.role || memberCurrentRole;

    const isAdmin = String(currentUser?.role).toLowerCase() === 'admin';
    const isManager = currentUserRole === 'Manager';

    const canManage = isAdmin || isManager;
    const canDelete = isAdmin;

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

            const [projectData, memList, tskList, colList] = await Promise.all([
                fetchProjectById(projectId).catch(() => null),
                fetchMembersByProject(projectId).catch(() => []),
                fetchTasksByProject(projectId).catch(() => []),
                fetchColumnsByProject ? fetchColumnsByProject(projectId).catch(() => []) : []
            ]);

            const realProject = projectData?.data || projectData || {};
            const realMembers = Array.isArray(memList) ? memList : (memList?.data || []);
            const realTasks = Array.isArray(tskList) ? tskList : (tskList?.data || []);
            const realColumns = Array.isArray(colList) ? colList : (colList?.data || []);

            const rawStartDate = realProject.startDate || realProject.start_date || realProject.createdAt;
            const formattedStartDate = formatDateForInput(rawStartDate);

            const rawDueDate = realProject.date || realProject.dueDate || realProject.endDate;
            const formattedDueDate = formatDateForInput(rawDueDate);

            setProject(realProject);

            setFormData({
                name: realProject.name || '',
                description: realProject.description || realProject.desc || '',
                color: realProject.color || '#4f46e5',
                startDate: formattedStartDate,
                dueDate: formattedDueDate,
                budget: realProject.budget ?? 0,
                costPerPoint: realProject.costPerPoint ?? 0
            });

            setProjectMembers(realMembers);
            setTasks(realTasks);
            setColumns(realColumns);

            await fetchCurrentMemberRole();
        } catch (err) {
            console.error('Error loading project settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleDropdown = (userId) => {
        setDropDown(prev => prev === userId ? null : userId);
    };

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
                throw new Error(data.message || "Failed to update role");
            }

            setProjectMembers((prevMembers) =>
                prevMembers.map((m) => (m._id === memberId ? { ...m, role: newRole } : m))
            );
            setDropDown(null);
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    const handleDeleteMember = async (member) => {
        if (!window.confirm("Are you sure you want to remove this member from the project?")) {
            return;
        }

        try {
            await deleteMemberByProject(member._id);

            setProjectMembers((prevMembers) =>
                prevMembers.filter((m) => m._id !== member._id)
            );

            setDropDown(null);
        } catch (error) {
            console.error("Error deleting member:", error);
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            return;
        }

        try {
            await inviteMember({
                email: inviteEmail,
                role: inviteRole,
                projectId: projectId
            });

            const refreshedMembers = await fetchMembersByProject(projectId).catch(() => []);
            const realMembers = Array.isArray(refreshedMembers) ? refreshedMembers : (refreshedMembers?.data || []);
            setProjectMembers(realMembers);

            setOpenInviteModal(false);
            setInviteEmail("");
            setInviteRole("Member");
            setShowSuggestions(false);
        } catch (error) {
            console.error("Error sending invitation:", error);
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const words = String(name).trim().split(/\s+/);
        return words.length === 1
            ? words[0].substring(0, 2).toUpperCase()
            : (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };

    const filteredMembers = projectMembers.filter((m) => {
        const username = m.userId?.username || m.username || m.name || "";
        const email = m.userId?.email || m.email || "";
        const search = searchMember.toLowerCase();
        return username.toLowerCase().includes(search) || email.toLowerCase().includes(search);
    });

    const doneColumnIds = useMemo(() => {
        return columns
            .filter(col => Number(col.position) === 3)
            .map(col => String(col._id || col.id));
    }, [columns]);

    const calculateMemberPointsByWeek = (member, weekNum) => {
        const uId = extractUserId(member);
        if (!uId || !tasks.length) return 0;

        const weeklyDoneTasks = tasks.filter(t => {
            const isWeekMatch = Number(t.week) === Number(weekNum);
            const taskColumnId = String(t.columnId?._id || t.columnId || t.column || '');
            const isDone = doneColumnIds.includes(taskColumnId) || Number(t.column?.position) === 3;

            const assignees = t.assignees || [];
            const isAssigned = assignees.some(assignee => {
                const id = typeof assignee === 'object' ? (assignee._id || assignee.id) : assignee;
                return String(id) === String(uId);
            });

            return isWeekMatch && isDone && isAssigned;
        });

        return weeklyDoneTasks.reduce((sum, task) => sum + (Number(task.point) || 0), 0);
    };

    const handleSaveGeneralSettings = async (e) => {
        e.preventDefault();
        if (!canManage) return;

        const currentToday = getTodayString();

        if (formData.dueDate && formData.dueDate < currentToday) {
            alert('End date cannot be a date in the past!');
            return;
        }

        if (formData.startDate && formData.dueDate) {
            if (formData.startDate > formData.dueDate) {
                alert('Start date cannot be after End date!');
                return;
            }
        }
        const budgetNum = Number(formData.budget) || 0;
        if (budgetNum < 0) {
            alert('Budget must be >= 0!');
            return;
        }
        const costPerPointNum = Number(formData.costPerPoint) || 0;
        if (costPerPointNum < 0) {
            alert('Cost per point must be >= 0!');
            return;
        }
        try {
            setSaving(true);

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                color: formData.color,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                budget: budgetNum,
                costPerPoint: costPerPointNum
            };

            const res = await updateProject(projectId, payload);
            const updatedData = res?.data || res || {};

            setProject(prev => ({
                ...prev,
                ...payload,
                date: payload.dueDate,
                endDate: payload.dueDate,
                start_date: payload.startDate,
                ...updatedData
            }));

        } catch (err) {
            console.error('Error saving general settings:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!canDelete) return;

        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            try {
                await deleteProject(projectId);
                navigate('/dashboard');
            } catch (err) {
                console.error('Error deleting project:', err);
            }
        }
    };

    const headerStartDate = formatDateDMY(project?.startDate || project?.start_date || project?.createdAt);
    const headerDueDate = formatDateDMY(project?.date || project?.dueDate || project?.endDate);

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
                        <div className="project-header">
                            <div className="project-header-top">
                                <div style={{ minWidth: 0 }}>
                                    <div className="project-title-row">
                                        <span className="project-color-dot" style={{ background: project?.color || '#4f46e5' }}></span>
                                        <h1>{project?.name || 'Project'}</h1>
                                    </div>
                                    <p className="page-subtitle" style={{ maxWidth: '640px' }}>
                                        {project?.description || 'No description provided'}
                                    </p>

                                    <div className="project-meta-row">
                                        <span className="project-meta-item">
                                            <UsersRound className="icon icon-sm" />{projectMembers.length} members
                                        </span>
                                        <span className="project-meta-item">
                                            <ListChecks className="icon icon-sm" />{tasks.length} tasks
                                        </span>
                                        <span className="project-meta-item">
                                            <CalendarClock className="icon icon-sm" />Start date: {headerStartDate}
                                        </span>
                                        <span className="project-meta-item">
                                            <CalendarClock className="icon icon-sm" />End date: {headerDueDate}
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
                                <Link to={`/projectoverview/${projectId}`} className="project-tab">
                                    <Info className="icon icon-sm" /> Overview
                                </Link>
                                <Link to={`/projectchart/${projectId}`} className="project-tab">
                                    <BarChart2 className="icon icon-sm" /> Chart
                                </Link>
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
                                                <input
                                                    className="textarea"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    disabled={!canManage}
                                                    style={disabledInputStyle}
                                                />
                                            </div>
                                            <div className="field">
                                                <label className="field-label">Cost per point ($)</label>
                                                <input
                                                    type="number"
                                                    className="input"
                                                    min="0"
                                                    step="any"
                                                    placeholder="e.g. 100"
                                                    value={formData.costPerPoint}
                                                    onChange={(e) => setFormData({ ...formData, costPerPoint: e.target.value })}
                                                    disabled={!canManage}
                                                    style={disabledInputStyle}
                                                />
                                            </div>
                                            <div className="field">
                                                <label className="field-label">Budget ($)</label>
                                                <input
                                                    type="number"
                                                    className="input"
                                                    min="0"
                                                    step="any"
                                                    placeholder="e.g. 10000"
                                                    value={formData.budget}
                                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
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
                                                        min={formData.startDate && formData.startDate < getTodayString() ? formData.startDate : getTodayString()}
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
                                                        min={formData.startDate || getTodayString()}
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
                                                Manage access and view member points for completed tasks per week.
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', gap: '16px', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div className="input-icon-wrap" style={{ width: '220px', position: 'relative' }}>
                                                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                                    <input
                                                        className="input"
                                                        placeholder="Search members…"
                                                        value={searchMember}
                                                        onChange={(e) => setSearchMember(e.target.value)}
                                                        style={{ paddingLeft: '38px', height: '38px' }}
                                                    />
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Point:</span>
                                                    <select
                                                        className="select"
                                                        style={{ height: '38px', minWidth: '180px', fontWeight: 500 }}
                                                        value={selectedWeek}
                                                        onChange={(e) => setSelectedWeek(Number(e.target.value))}
                                                    >
                                                        {projectWeeks.map(w => (
                                                            <option key={w.index} value={w.index}>
                                                                {w.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
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

                                        <div className="card" style={{ overflow: 'visible' }}>
                                            <div
                                                className="member-table-header"
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: "1fr 140px 120px 120px 48px",
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
                                                    const username = m.userId?.username || m.username || m.name || "Not updated";
                                                    const email = m.userId?.email || m.email || "No email";
                                                    const role = m.role || "Member";
                                                    const status = m.status || "Active";

                                                    const weekPoints = calculateMemberPointsByWeek(m, selectedWeek);

                                                    return (
                                                        <div
                                                            key={m._id || idx}
                                                            className="member-row"
                                                            style={{
                                                                display: 'grid',
                                                                gridTemplateColumns: "1fr 140px 120px 120px 48px",
                                                                alignItems: 'center',
                                                                padding: '16px 20px',
                                                                borderBottom: '1px solid var(--color-border)'
                                                            }}
                                                        >
                                                            <div className="member-identity" style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                                                                <span className="avatar avatar-sm" style={{ background: '#4f46e5', color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '40px', height: '40px', fontWeight: 600, flexShrink: 0 }}>
                                                                    {getInitials(username)}
                                                                </span>
                                                                <div className="member-identity-text" style={{ overflow: 'hidden' }}>
                                                                    <p className="member-name" style={{ fontSize: '15px', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{username}</p>
                                                                    <p className="member-email" style={{ fontSize: '13px', color: 'var(--text-muted, #64748b)', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</p>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#4f46e5' }}>
                                                                    {weekPoints} pts
                                                                </span>
                                                            </div>

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

                                                            <div>
                                                                <span className={`badge ${status === 'Active' ? 'badge-success' : 'badge-warning'}`} style={{ padding: '4px 12px', fontSize: '13px' }}>
                                                                    {status}
                                                                </span>
                                                            </div>

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
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleUpdateRole(m._id, role, role === "Leader" ? "Member" : "Leader")}
                                                                                    className="dropdown-item"
                                                                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 14px', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                                                                >
                                                                                    <UserCog size={16} /> Change Role
                                                                                </button>

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

                                    {/* Tab Danger Zone */}
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

            {/* Modal Invite Member */}
            {openInviteModal && (
                <div
                    className="modal-overlay"
                    id="inviteMemberModal"
                    onClick={() => { setOpenInviteModal(false); setShowSuggestions(false); }}
                >
                    <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ overflow: 'visible' }}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Invite a member</h2>
                                <p className="modal-desc">Add a new person to this project.</p>
                            </div>
                            <button onClick={() => { setOpenInviteModal(false); setShowSuggestions(false); }} className="icon-btn" aria-label="Close" style={{ cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflow: 'visible' }}>

                            {/* --- INPUT WITH AUTOCOMPLETE SUGGESTIONS --- */}
                            <div className="field" style={{ position: 'relative' }} ref={suggestionRef}>
                                <label className="field-label">Email *</label>
                                <input
                                    value={inviteEmail}
                                    onChange={(e) => {
                                        setInviteEmail(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    className="input"
                                    type="email"
                                    placeholder="Type username or email..."
                                    required
                                    autoComplete="off"
                                />

                                {/* Suggestions Dropdown */}
                                {showSuggestions && (
                                    <div
                                        className="suggestions-dropdown"
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            zIndex: 9999,
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '8px',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                                            marginTop: '4px',
                                            maxHeight: '220px',
                                            overflowY: 'auto'
                                        }}
                                    >
                                        {suggestedUsers.length > 0 ? (
                                            suggestedUsers.map((u) => (
                                                <div
                                                    key={u._id || u.id}
                                                    onClick={() => {
                                                        setInviteEmail(u.email);
                                                        setShowSuggestions(false);
                                                    }}
                                                    style={{
                                                        padding: '10px 14px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        borderBottom: '1px solid #f1f5f9'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                                        {u.username || u.name || 'User'}
                                                    </span>
                                                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                                                        {u.email}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: '12px 14px', fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>
                                                {inviteEmail.trim() ? "No matching user found" : "Type name or email to search..."}
                                            </div>
                                        )}
                                    </div>
                                )}
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