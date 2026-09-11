import React, { useState, useEffect } from 'react';
import {
    KanbanSquare,
    LayoutDashboard,
    ListTodo,
    FolderKanban,
    Users,
    ShieldCheck,
    Flag,
    ChevronsLeft,
    ChevronsRight,
    Menu,
    Search,
    Plus,
    ListPlus,
    LogOut,
    X,
    UsersRound,
    ListChecks,
    CalendarClock,
    Settings as SettingsIcon,
    LayoutGrid,
    List,
    Calendar,
    Activity,
    MoreHorizontal,
    GripVertical,
    Trash2,
    CheckCircle2,
    XCircle,
    Info,
    UserPlus
} from 'lucide-react';
import {
    fetchProjectById,
    updateProject,
    deleteProject,
    fetchMembers,
    addMemberToProject,
    removeMemberFromProject,
    fetchColumns,
    createColumn,
    updateColumn,
    deleteColumn,
    fetchLabels,
    createLabel,
    deleteLabel,
    createTask
} from '../../../api';

export default function ProjectSettings({ projectId = 'p1' }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [commandQuery, setCommandQuery] = useState('');
    const [toasts, setToasts] = useState([]);

    const [activeTab, setActiveTab] = useState('general');

    const [projectInfo, setProjectInfo] = useState({
        name: '',
        desc: '',
        dueDate: '',
        color: '#4f46e5'
    });

    const [columns, setColumns] = useState([]);
    const [newColumnName, setNewColumnName] = useState('');

    const [labels, setLabels] = useState([]);
    const [newLabelName, setNewLabelName] = useState('');
    const [newLabelColor, setNewLabelColor] = useState('#4f46e5');

    const [membersList, setMembersList] = useState([]);
    const [newMemberEmail, setNewMemberEmail] = useState('');

    const [taskTitle, setTaskTitle] = useState('');
    const [taskColumn, setTaskColumn] = useState('');
    const [taskPriority, setTaskPriority] = useState('Medium');

    useEffect(() => {
        loadAllProjectData();
    }, [projectId]);

    const loadAllProjectData = async () => {
        try {
            const pData = await fetchProjectById(projectId).catch(() => null);
            if (pData) setProjectInfo(pData);

            const cols = await fetchColumns(projectId).catch(() => []);
            setColumns(cols);
            if (cols.length > 0) setTaskColumn(cols[0].name);

            const lbls = await fetchLabels(projectId).catch(() => []);
            setLabels(lbls);

            const mems = await fetchMembers(projectId).catch(() => []);
            setMembersList(mems);
        } catch (err) {
            showToast('Lỗi tải dữ liệu', 'Không thể kết nối đến máy chủ', 'error');
        }
    };

    const showToast = (title, description = null, variant = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, title, description, variant }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const handleSaveGeneral = async (e) => {
        e.preventDefault();
        try {
            await updateProject(projectId, projectInfo);
            showToast('Cập nhật thành công', 'Thông tin dự án đã được lưu', 'success');
        } catch (err) {
            showToast('Lỗi', 'Không thể cập nhật thông tin dự án', 'error');
        }
    };

    const handleDeleteProject = async () => {
        try {
            await deleteProject(projectId);
            showToast('Xóa thành công', 'Dự án đã được loại bỏ', 'success');
            setActiveModal(null);
        } catch (err) {
            showToast('Lỗi', 'Không thể xóa dự án', 'error');
        }
    };

    const handleAddColumn = async () => {
        if (!newColumnName.trim()) return;
        try {
            const created = await createColumn(projectId, { name: newColumnName, color: '#94a3b8' });
            setColumns((prev) => [...prev, created || { id: Date.now().toString(), name: newColumnName, color: '#94a3b8' }]);
            setNewColumnName('');
            showToast('Đã thêm cột mới', null, 'success');
        } catch (err) {
            showToast('Lỗi', 'Không thể thêm cột mới', 'error');
        }
    };

    const handleUpdateColumnName = async (colId, name) => {
        setColumns((prev) => prev.map((c) => (c.id === colId ? { ...c, name } : c)));
        try {
            await updateColumn(colId, { name });
        } catch (err) {}
    };

    const handleDeleteColumn = async (colId) => {
        try {
            await deleteColumn(colId);
            setColumns((prev) => prev.filter((c) => c.id !== colId));
            showToast('Đã xóa cột', null, 'success');
        } catch (err) {
            showToast('Lỗi', 'Không thể xóa cột', 'error');
        }
    };

    const handleAddLabel = async () => {
        if (!newLabelName.trim()) return;
        try {
            const created = await createLabel(projectId, { name: newLabelName, color: newLabelColor });
            setLabels((prev) => [...prev, created || { id: Date.now().toString(), name: newLabelName, color: newLabelColor }]);
            setNewLabelName('');
            showToast('Đã thêm nhãn mới', null, 'success');
        } catch (err) {
            showToast('Lỗi', 'Không thể thêm nhãn', 'error');
        }
    };

    const handleDeleteLabel = async (lblId) => {
        try {
            await deleteLabel(lblId);
            setLabels((prev) => prev.filter((l) => l.id !== lblId));
            showToast('Đã xóa nhãn', null, 'success');
        } catch (err) {
            showToast('Lỗi', 'Không thể xóa nhãn', 'error');
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberEmail.trim()) return;
        try {
            const added = await addMemberToProject(projectId, newMemberEmail);
            setMembersList((prev) => [...prev, added || { id: Date.now().toString(), name: newMemberEmail, initials: 'MB', bg: '#0ea5e9', role: 'member' }]);
            setNewMemberEmail('');
            showToast('Đã thêm thành viên', null, 'success');
        } catch (err) {
            showToast('Lỗi', 'Không thể thêm thành viên', 'error');
        }
    };

    const handleRemoveMember = async (memberId) => {
        try {
            await removeMemberFromProject(projectId, memberId);
            setMembersList((prev) => prev.filter((m) => m.id !== memberId));
            showToast('Đã xoá thành viên', null, 'success');
        } catch (err) {
            showToast('Lỗi', 'Không thể xoá thành viên', 'error');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await createTask({
                title: taskTitle,
                projectId,
                column: taskColumn,
                priority: taskPriority
            });
            showToast('Đã tạo công việc', 'Kiểm tra bảng công việc để xem chi tiết', 'success');
            setTaskTitle('');
            setActiveModal(null);
        } catch (err) {
            showToast('Lỗi', 'Không thể tạo công việc mới', 'error');
        }
    };

    return (
        <div className="app-shell">
            <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarMobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand">
                    <KanbanSquare className="sidebar-brand-logo icon" />
                    <span className="sidebar-brand-name">TeamFlow</span>
                </div>
                <div className="sidebar-workspace">
                    <p className="sidebar-workspace-label">Workspace</p>
                    <p className="sidebar-workspace-name">Capstone Team</p>
                </div>
                <nav className="sidebar-nav">
                    <a href="dashboard.html" className="nav-item">
                        <LayoutDashboard className="icon" />
                        <span className="nav-label">Dashboard</span>
                    </a>
                    <a href="my-tasks.html" className="nav-item">
                        <ListTodo className="icon" />
                        <span className="nav-label">My Tasks</span>
                    </a>
                    <a href="projects.html" className="nav-item active">
                        <FolderKanban className="icon" />
                        <span className="nav-label">Projects</span>
                    </a>
                    <a href="members.html" className="nav-item">
                        <Users className="icon" />
                        <span className="nav-label">Members</span>
                    </a>
                    <p className="sidebar-section-label">Admin</p>
                    <a href="admin-users.html" className="nav-item">
                        <ShieldCheck className="icon" />
                        <span className="nav-label">Users</span>
                    </a>
                    <a href="admin-moderation.html" className="nav-item">
                        <Flag className="icon" />
                        <span className="nav-label">Moderation</span>
                    </a>
                </nav>
                <div className="sidebar-collapse-btn">
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                        {sidebarCollapsed ? <ChevronsRight className="icon icon-sm" /> : <ChevronsLeft className="icon icon-sm" />}
                        <span>Collapse</span>
                    </button>
                </div>
            </aside>

            {sidebarMobileOpen && (
                <div className="sidebar-overlay show" onClick={() => setSidebarMobileOpen(false)} />
            )}

            <div className="app-main">
                <header className="header">
                    <button className="icon-btn mobile-menu-btn" onClick={() => setSidebarMobileOpen(true)} aria-label="Open menu">
                        <Menu className="icon" />
                    </button>
                    <button className="header-search" onClick={() => setActiveModal('commandPalette')}>
                        <Search className="icon icon-sm" />
                        <span className="search-label">Search anything…</span>
                        <kbd>Ctrl K</kbd>
                    </button>
                    <div className="header-actions">
                        <div className="dropdown">
                            <button className="btn btn-primary btn-sm" onClick={() => setCreateDropdownOpen(!createDropdownOpen)}>
                                <Plus className="icon icon-sm" />
                                <span className="create-btn-label">Create</span>
                            </button>
                            {createDropdownOpen && (
                                <div className="dropdown-menu">
                                    <button className="dropdown-item" onClick={() => { setActiveModal('quickCreateTaskModal'); setCreateDropdownOpen(false); }}>
                                        <ListPlus className="icon icon-sm" />
                                        New Task
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="dropdown">
                            <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} aria-label="Open user menu">
                                <span className="avatar avatar-sm" style={{ background: '#4f46e5' }}>CS</span>
                            </button>
                            {userDropdownOpen && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-user-info">
                                        <p className="dropdown-user-name">Cao Sơn</p>
                                        <p className="dropdown-user-email">caosonhs@gmail.com</p>
                                        <p className="dropdown-user-role">leader</p>
                                    </div>
                                    <div className="dropdown-separator"></div>
                                    <a className="dropdown-item destructive" href="login.html">
                                        <LogOut className="icon icon-sm" />
                                        Log out
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="project-header">
                    <div className="project-header-top">
                        <div style={{ minWidth: 0 }}>
                            <div className="project-title-row">
                                <span className="project-color-dot" style={{ background: projectInfo.color || '#4f46e5' }}></span>
                                <h1>{projectInfo.name || 'Project Name'}</h1>
                            </div>
                            <p className="page-subtitle" style={{ maxWidth: '640px' }}>{projectInfo.desc || 'No description'}</p>
                            <div className="project-meta-row">
                                <span className="project-meta-item"><UsersRound className="icon icon-sm" />{membersList.length} members</span>
                                <span className="project-meta-item"><ListChecks className="icon icon-sm" />{columns.length} columns</span>
                                <span className="project-meta-item"><CalendarClock className="icon icon-sm" />Due {projectInfo.dueDate || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="project-header-actions">
              <span className="avatar-group">
                {membersList.map((m) => (
                    <span key={m.id} className="avatar avatar-sm" style={{ background: m.bg || '#4f46e5' }}>{m.initials || 'M'}</span>
                ))}
              </span>
                            <button className="icon-btn icon-btn-outline" aria-label="Project settings">
                                <SettingsIcon className="icon" />
                            </button>
                        </div>
                    </div>
                    <nav className="project-tabs">
                        <a href="project-board.html" className="project-tab"><LayoutGrid className="icon icon-sm" />Board</a>
                        <a href="project-list.html" className="project-tab"><List className="icon icon-sm" />List</a>
                        <a href="project-calendar.html" className="project-tab"><Calendar className="icon icon-sm" />Calendar</a>
                        <a href="project-activity.html" className="project-tab"><Activity className="icon icon-sm" />Activity</a>
                    </nav>
                </div>

                <main className="page-content">
                    <div className="settings-layout">
                        <nav className="settings-nav">
                            <button className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General</button>
                            <button className={`settings-nav-item ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Members</button>
                            <button className={`settings-nav-item ${activeTab === 'workflow' ? 'active' : ''}`} onClick={() => setActiveTab('workflow')}>Workflow</button>
                            <button className={`settings-nav-item ${activeTab === 'labels' ? 'active' : ''}`} onClick={() => setActiveTab('labels')}>Labels</button>
                            <button className={`settings-nav-item danger-item ${activeTab === 'danger' ? 'active' : ''}`} onClick={() => setActiveTab('danger')}>Danger Zone</button>
                        </nav>

                        <div className="settings-content">
                            {activeTab === 'general' && (
                                <section className="settings-section active">
                                    <h2 className="settings-section-title">General</h2>
                                    <p className="settings-section-desc">Basic information about this project.</p>
                                    <form onSubmit={handleSaveGeneral} className="settings-section-body">
                                        <div className="field">
                                            <label className="field-label">Project name</label>
                                            <input className="input" value={projectInfo.name} onChange={(e) => setProjectInfo({ ...projectInfo, name: e.target.value })} />
                                        </div>
                                        <div className="field">
                                            <label className="field-label">Description</label>
                                            <textarea className="textarea" rows={3} value={projectInfo.desc} onChange={(e) => setProjectInfo({ ...projectInfo, desc: e.target.value })} />
                                        </div>
                                        <div className="field">
                                            <label className="field-label">Due date</label>
                                            <input className="input" type="date" value={projectInfo.dueDate} onChange={(e) => setProjectInfo({ ...projectInfo, dueDate: e.target.value })} />
                                        </div>
                                        <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>Save changes</button>
                                    </form>
                                </section>
                            )}

                            {activeTab === 'members' && (
                                <section className="settings-section active">
                                    <h2 className="settings-section-title">Members</h2>
                                    <p className="settings-section-desc">Manage people who have access to this project.</p>
                                    <div className="settings-section-body">
                                        <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                            <input className="input" placeholder="Member email or username..." value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} style={{ flex: 1 }} />
                                            <button type="submit" className="btn btn-primary btn-sm"><UserPlus className="icon icon-sm" />Add</button>
                                        </form>
                                        <div className="card">
                                            {membersList.map((m) => (
                                                <div key={m.id} className="member-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: '12px', padding: '8px 12px' }}>
                                                    <div className="member-identity" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span className="avatar avatar-sm" style={{ background: m.bg || '#4f46e5' }}>{m.initials || 'M'}</span>
                                                        <span className="member-name">{m.name}</span>
                                                    </div>
                                                    <span className="badge badge-neutral">{m.role || 'member'}</span>
                                                    <button className="icon-btn icon-btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleRemoveMember(m.id)}>
                                                        <Trash2 className="icon icon-sm" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {activeTab === 'workflow' && (
                                <section className="settings-section active">
                                    <h2 className="settings-section-title">Workflow</h2>
                                    <p className="settings-section-desc">Add, rename, or remove board columns.</p>
                                    <div className="settings-section-body">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {columns.map((col) => (
                                                <div key={col.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                                                    <GripVertical className="icon icon-sm" style={{ color: 'var(--color-text-subtle)', cursor: 'grab' }} />
                                                    <span className="project-color-dot" style={{ background: col.color || '#94a3b8' }}></span>
                                                    <input className="input" value={col.name} style={{ height: '32px', flex: 1 }} onChange={(e) => handleUpdateColumnName(col.id, e.target.value)} />
                                                    <button className="icon-btn icon-btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteColumn(col.id)}>
                                                        <Trash2 className="icon icon-sm" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                                            <input className="input" placeholder="New column name" style={{ flex: 1 }} value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} />
                                            <button className="btn btn-primary btn-sm" onClick={handleAddColumn}>
                                                <Plus className="icon icon-sm" />Add
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {activeTab === 'labels' && (
                                <section className="settings-section active">
                                    <h2 className="settings-section-title">Labels</h2>
                                    <p className="settings-section-desc">Manage labels available for tasks in this project.</p>
                                    <div className="settings-section-body">
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {labels.map((lbl) => (
                                                <span key={lbl.id} className="badge" style={{ color: lbl.color, background: `${lbl.color}1a`, borderColor: `${lbl.color}33`, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {lbl.name}
                                                    <X className="icon icon-sm" style={{ cursor: 'pointer' }} onClick={() => handleDeleteLabel(lbl.id)} />
                        </span>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                                            <input className="input" placeholder="Label name" style={{ flex: 1 }} value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} />
                                            <input type="color" value={newLabelColor} onChange={(e) => setNewLabelColor(e.target.value)} style={{ width: '36px', height: '36px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '2px', cursor: 'pointer' }} />
                                            <button className="btn btn-primary btn-sm" onClick={handleAddLabel}>
                                                <Plus className="icon icon-sm" />Add
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {activeTab === 'danger' && (
                                <section className="settings-section active">
                                    <h2 className="settings-section-title" style={{ color: 'var(--color-danger)' }}>Danger Zone</h2>
                                    <p className="settings-section-desc">Irreversible and destructive actions.</p>
                                    <div className="settings-section-body">
                                        <div style={{ border: '1px solid var(--color-danger-border)', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                                            <p style={{ fontSize: '14px', fontWeight: 500 }}>Delete this project</p>
                                            <p style={{ marginTop: '4px', fontSize: '14px', color: 'var(--color-text-muted)' }}>This permanently deletes "{projectInfo.name}" along with all its tasks and data.</p>
                                            <button className="btn btn-danger btn-sm" style={{ marginTop: '12px' }} onClick={() => setActiveModal('confirmDeleteProjectModal')}>Delete project</button>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {activeModal === 'confirmDeleteProjectModal' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-box size-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete "{projectInfo.name}"?</h2>
                            <button className="icon-btn" onClick={() => setActiveModal(null)}><X className="icon" /></button>
                        </div>
                        <div className="modal-body">
                            <p className="page-subtitle" style={{ margin: 0 }}>This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline btn-sm" onClick={() => setActiveModal(null)}>Cancel</button>
                            <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>Delete project</button>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'commandPalette' && (
                <div className="command-palette-overlay" onClick={() => setActiveModal(null)}>
                    <div className="command-palette-box" onClick={(e) => e.stopPropagation()}>
                        <div className="command-palette-input-row">
                            <Search className="icon icon-sm" />
                            <input className="command-palette-input" placeholder="Search tasks, projects, members…" autoFocus value={commandQuery} onChange={(e) => setCommandQuery(e.target.value)} />
                            <kbd onClick={() => setActiveModal(null)} style={{ cursor: 'pointer' }}>ESC</kbd>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'quickCreateTaskModal' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create task</h2>
                            <button className="icon-btn" onClick={() => setActiveModal(null)}><X className="icon" /></button>
                        </div>
                        <form onSubmit={handleCreateTask}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className="field">
                                    <label className="field-label">Title</label>
                                    <input className="input" placeholder="e.g. Fix pagination bug" required autoFocus value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                                </div>
                                <div className="grid-2">
                                    <div className="field">
                                        <label className="field-label">Column</label>
                                        <select className="select" value={taskColumn} onChange={(e) => setTaskColumn(e.target.value)}>
                                            {columns.map((c) => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label className="field-label">Priority</label>
                                        <select className="select" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
                                            <option value="Medium">Medium</option>
                                            <option value="Urgent">Urgent</option>
                                            <option value="High">High</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline btn-sm" onClick={() => setActiveModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm">Create task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="toast-viewport">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast variant-${toast.variant}`}>
                        {toast.variant === 'success' && <CheckCircle2 className="toast-icon icon" />}
                        {toast.variant === 'error' && <XCircle className="toast-icon icon" />}
                        {toast.variant === 'info' && <Info className="toast-icon icon" />}
                        <div className="toast-body">
                            <p className="toast-title">{toast.title}</p>
                            {toast.description && <p className="toast-desc">{toast.description}</p>}
                        </div>
                        <button className="toast-close icon icon-sm" onClick={() => setToasts(toasts.filter(t => t.id !== toast.id))}><X /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}