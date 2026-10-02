import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './../../components/layout/Header/Header.jsx';
import Sidebar from './../../components/layout/Sidebar/Sidebar.jsx';

import {
    LayoutGrid,
    List,
    Calendar as CalendarIcon,
    Settings,
    Plus,
    Loader2,
    UsersRound,
    ListChecks,
    CalendarClock,
    ChevronLeft,
    ChevronRight,
    Trash2, Calendar
} from 'lucide-react';

import {
    fetchProjectById,
    fetchTasksByProject,
    fetchMembersByProject,
    createTask,
    deleteTask
} from '../../../api.jsx';

// Hàm hỗ trợ lấy 2 chữ cái đầu viết hoa
const getInitials = (name) => {
    if (!name) return '??';
    const words = String(name).trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Helper trích xuất User ID từ record Member
const extractUserId = (member) => {
    if (!member) return '';
    if (typeof member.userId === 'object') {
        return String(member.userId?._id || member.userId?.id || '');
    }
    if (member.userId) return String(member.userId);
    return String(member._id || member.id || '');
};

const getMemberUserId = (member) => {
    return extractUserId(member);
};

// Hàm lấy tên hiển thị của Member
const getMemberDisplayName = (member) => {
    if (!member) return 'User';
    if (typeof member === 'object') {
        if (member.userId && typeof member.userId === 'object') {
            return member.userId.username || member.userId.name || member.userId.email || 'User';
        }
        return member.username || member.name || member.email || 'User';
    }
    return 'User';
};

export default function ProjectCalendar() {
    const { id: projectId } = useParams();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    const [project, setProject] = useState({});
    const [projectMembers, setProjectMembers] = useState([]);
    const [memberCurrentRole, setMemberRole] = useState("");
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Trạng thái ngày/tháng hiển thị trên Lịch
    const [currentDate, setCurrentDate] = useState(new Date());

    // State tạo Task mới
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');
    const [newTaskPoints, setNewTaskPoints] = useState(0);
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskStartDate, setNewTaskStartDate] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    const getCurrentUser = () => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
            return {};
        }
    };

    const currentUser = getCurrentUser();
    const currentUserId = currentUser._id || currentUser.id || null;

    // Lấy role hiện tại từ API
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

    useEffect(() => {
        fetchCurrentMemberRole();
    }, []);

    // Tìm thông tin member của user hiện tại trong dự án
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
    const isManager = currentUserRole === 'Manager' || isAdmin;
    const canCreateTask = isManager || isLeader;

    const loadData = async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const [pData, tskList, membersData] = await Promise.all([
                fetchProjectById(projectId).catch(() => ({})),
                fetchTasksByProject(projectId).catch(() => []),
                fetchMembersByProject(projectId).catch(() => [])
            ]);

            const realProject = pData?.data || pData || {};
            const realTasks = Array.isArray(tskList) ? tskList : (tskList?.data || []);
            const realMembers = Array.isArray(membersData)
                ? membersData
                : (membersData?.data || membersData?.members || []);

            setProject(realProject);
            setTasks(realTasks);
            setProjectMembers(realMembers);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu calendar:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [projectId]);

    const resetTaskForm = () => {
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskPriority('Medium');
        setNewTaskPoints(0);
        setNewTaskStartDate('');
        setNewTaskDate('');
        setSelectedMembers(currentUserId ? [String(currentUserId)] : []);
    };

    const handleOpenCreateModal = (selectedDateStr = '') => {
        if (!canCreateTask) return;
        resetTaskForm();
        setNewTaskDate(selectedDateStr || new Date().toISOString().split('T')[0]);
        setActiveModal('quickCreateTaskModal');
    };

    const closeModal = () => {
        setActiveModal(null);
        resetTaskForm();
    };

    const toggleMemberSelection = (id) => {
        const idStr = String(id);
        setSelectedMembers((prev) =>
            prev.includes(idStr)
                ? prev.filter((item) => item !== idStr)
                : [...prev, idStr]
        );
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!canCreateTask || !newTaskTitle.trim()) return;

        try {
            setIsSubmitting(true);
            const cleanMembers = selectedMembers.filter(id => Boolean(id));
            const pointValue = Number(newTaskPoints) || 0;

            const payload = {
                title: newTaskTitle,
                description: newTaskDesc,
                projectId: projectId,
                priority: newTaskPriority,
                point: pointValue,
                points: pointValue,
                startDate: newTaskStartDate ? new Date(newTaskStartDate) : null,
                date: newTaskDate ? new Date(newTaskDate) : new Date(),
                assignees: cleanMembers,
                members: cleanMembers
            };

            const response = await createTask(payload);
            const createdTask = response?.data || response;

            if (createdTask && (createdTask._id || createdTask.id)) {
                setTasks(prev => [...prev, createdTask]);
                closeModal();
            }
        } catch (error) {
            console.error('Lỗi khi tạo task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async (taskId, e) => {
        e.stopPropagation();
        if (!isManager) return;
        if (!window.confirm('Bạn có chắc chắn muốn xóa task này không?')) return;

        try {
            setTasks(prev => prev.filter(t => String(t._id || t.id) !== String(taskId)));
            await deleteTask(taskId);
        } catch (err) {
            console.error('Lỗi khi xóa task:', err);
            loadData();
        }
    };

    // --- LOGIC XỬ LÝ LỊCH ---
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const handleToday = () => setCurrentDate(new Date());

    const calendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        let startingDayOfWeek = firstDayOfMonth.getDay();
        startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

        const daysInMonth = lastDayOfMonth.getDate();
        const days = [];

        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthLastDay - i),
                isCurrentMonth: false
            });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push({
                date: new Date(year, month, day),
                isCurrentMonth: true
            });
        }

        const remainingCells = (42 - days.length) % 7;
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            });
        }

        return days;
    }, [year, month]);

    const tasksByDate = useMemo(() => {
        const map = {};
        tasks.forEach(task => {
            const rawDate = task.date || task.dueDate;
            if (rawDate) {
                const d = new Date(rawDate);
                if (!isNaN(d.getTime())) {
                    const dateStr = d.toISOString().split('T')[0];
                    if (!map[dateStr]) map[dateStr] = [];
                    map[dateStr].push(task);
                }
            }
        });
        return map;
    }, [tasks]);

    const formattedStartDate = (project?.startDate || project?.start_date || project?.createdAt)
        ? new Date(project.startDate || project.start_date || project.createdAt).toLocaleDateString('vi-VN')
        : 'Chưa đặt';

    const formattedDueDate = (project?.date || project?.dueDate || project?.endDate)
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

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '60vh', color: '#64748b', gap: '12px' }}>
                        <Loader2 className="animate-spin" style={{ width: 36, height: 36, color: '#4f46e5' }} />
                        <span style={{ fontSize: '15px', fontWeight: 500 }}>Loading...</span>
                    </div>
                ) : (
                    <>
                        {/* Header Dự Án */}
                        <div className="project-header">
                            <div className="project-header-top">
                                <div style={{ minWidth: 0 }}>
                                    <div className="project-title-row">
                                        <span className="project-color-dot" style={{ background: project.color || '#4f46e5' }}></span>
                                        <h1>{project.name || 'Project'}</h1>
                                    </div>
                                    <p className="page-subtitle">{project.description || 'no description'}</p>

                                    <div className="project-meta-row" style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap' }}>
                                        <span className="project-meta-item"><UsersRound className="icon icon-sm" />{projectMembers.length} members</span>
                                        <span className="project-meta-item"><ListChecks className="icon icon-sm" />{tasks.length} tasks</span>
                                        <span className="project-meta-item"><CalendarClock className="icon icon-sm" />start date: {formattedStartDate}</span>
                                        <span className="project-meta-item"><CalendarClock className="icon icon-sm" />end date: {formattedDueDate}</span>
                                    </div>
                                </div>
                                <div className="project-header-actions">
                                    <Link to={`/projectsetting/${projectId}`} className="icon-btn icon-btn-outline">
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
                                <Link to={`/projectcalendar/${projectId}`} className="project-tab active">
                                    <Calendar className="icon icon-sm" /> Calendar
                                </Link>
                            </nav>
                        </div>

                        {/* Nội dung chính: Lịch */}
                        <main className="page-content" style={{ padding: '20px' }}>
                            {/* Toolbar điều hướng tháng/năm */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                                    {currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                                </h2>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button onClick={handlePrevMonth} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button onClick={handleToday} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '13px' }}>
                                            Month
                                        </button>
                                        <button onClick={handleNextMonth} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Lưới Lịch */}
                            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#64748b' }}>
                                    {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map((dayName) => (
                                        <div key={dayName} style={{ padding: '10px 0' }}>{dayName}</div>
                                    ))}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(120px, auto)', gap: '1px', background: '#e2e8f0' }}>
                                    {calendarGrid.map((cell, idx) => {
                                        const dateStr = cell.date.toISOString().split('T')[0];
                                        const dayTasks = tasksByDate[dateStr] || [];
                                        const isToday = new Date().toISOString().split('T')[0] === dateStr;

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => canCreateTask && handleOpenCreateModal(dateStr)}
                                                style={{
                                                    background: cell.isCurrentMonth ? '#fff' : '#f8fafc',
                                                    padding: '8px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px',
                                                    cursor: canCreateTask ? 'pointer' : 'default',
                                                    position: 'relative'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                    <span style={{
                                                        fontSize: '12px',
                                                        fontWeight: isToday ? 700 : 500,
                                                        color: isToday ? '#fff' : (cell.isCurrentMonth ? '#1e293b' : '#94a3b8'),
                                                        background: isToday ? '#4f46e5' : 'transparent',
                                                        borderRadius: '50%',
                                                        width: '22px',
                                                        height: '22px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {cell.date.getDate()}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: '90px' }}>
                                                    {dayTasks.map(task => {
                                                        const taskId = task._id || task.id;
                                                        return (
                                                            <div
                                                                key={taskId}
                                                                onClick={(e) => e.stopPropagation()}
                                                                style={{
                                                                    fontSize: '12px',
                                                                    padding: '4px 6px',
                                                                    borderRadius: '4px',
                                                                    background: '#f1f5f9',
                                                                    borderLeft: '3px solid #4f46e5',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    gap: '4px'
                                                                }}
                                                            >
                                                                <span
                                                                    title={task.title}
                                                                    style={{
                                                                        whiteSpace: 'nowrap',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        fontWeight: 500,
                                                                        color: '#334155'
                                                                    }}
                                                                >
                                                                    {task.title || 'Untitled'}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </main>
                    </>
                )}
            </div>


        </div>
    );
}