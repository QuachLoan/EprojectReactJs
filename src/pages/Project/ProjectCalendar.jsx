import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
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
    ChevronLeft,
    ChevronRight,
    Loader2,
    X,
    Plus
} from 'lucide-react';

import {
    fetchProjectById,
    fetchTasksByProject,
    createQuickTask
} from '../../../api';

// Hàm hỗ trợ lấy 2 chữ cái đầu viết hoa từ username/name
const getInitials = (name) => {
    if (!name) return '??';
    const words = String(name).trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export default function ProjectCalendar() {
    const { id: projectId } = useParams();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentDate, setCurrentDate] = useState(new Date());

    // Form Tạo Task
    const [taskTitle, setTaskTitle] = useState('');
    const [taskColumn, setTaskColumn] = useState('Todo');
    const [taskDueDate, setTaskDueDate] = useState('');

    useEffect(() => {
        if (projectId) {
            loadData();
        }
    }, [projectId]);

    const loadData = async () => {
        try {
            setLoading(true);

            const [projectData, tasksData] = await Promise.all([
                fetchProjectById(projectId).catch((err) => {
                    console.error('Lỗi fetch project:', err);
                    return null;
                }),
                fetchTasksByProject(projectId).catch((err) => {
                    console.error('Lỗi fetch tasks:', err);
                    return null;
                })
            ]);

            // Bóc tách dữ liệu chuẩn hoá giống ProjectBoard
            const realProject = projectData?.data || projectData || {};
            const realTasks = Array.isArray(tasksData)
                ? tasksData
                : (tasksData?.data || []);

            setProject(realProject);
            setTasks(realTasks);

        } catch (err) {
            console.error('Lỗi hệ thống khi tải calendar:', err);
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách thành viên
    const memberList = useMemo(() => {
        if (Array.isArray(project?.assignees)) return project.assignees;
        if (Array.isArray(project?.members)) return project.members;
        return [];
    }, [project]);

    // Định dạng End Date/Due Date
    const formattedDueDate = useMemo(() => {
        const rawDate = project?.date || project?.endDate || project?.dueDate;
        return rawDate ? new Date(rawDate).toLocaleDateString('vi-VN') : 'Chưa đặt';
    }, [project]);

    // Chuyển tháng
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleOpenCreateModalForDate = (dateStr) => {
        setTaskDueDate(dateStr);
        setActiveModal('quickCreateTaskModal');
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: taskTitle,
                column: taskColumn,
                status: taskColumn,
                projectId,
                dueDate: taskDueDate || new Date().toISOString(),
                endDate: taskDueDate || new Date().toISOString()
            };

            await createQuickTask(payload);
            setActiveModal(null);
            setTaskTitle('');
            setTaskDueDate('');
            loadData();
        } catch (err) {
            console.error('Lỗi khi tạo task:', err);
        }
    };

    // Dựng 35 / 42 ô lịch
    const { monthDays, currentMonthName, currentYear } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const daysInMonth = lastDayOfMonth.getDate();
        const startingDayOfWeek = firstDayOfMonth.getDay();

        const days = [];

        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const d = new Date(year, month - 1, prevMonthLastDay - i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            days.push({
                date: d,
                dayNumber: d.getDate(),
                isCurrentMonth: false,
                dateString: dateStr
            });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                date: d,
                dayNumber: i,
                isCurrentMonth: true,
                dateString: dateStr
            });
        }

        const totalCells = days.length > 35 ? 42 : 35;
        const remainingCells = totalCells - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            const d = new Date(year, month + 1, i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            days.push({
                date: d,
                dayNumber: i,
                isCurrentMonth: false,
                dateString: dateStr
            });
        }

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        return {
            monthDays: days,
            currentMonthName: monthNames[month],
            currentYear: year
        };
    }, [currentDate]);

    // Gom nhóm tasks theo ngày
    const tasksByDate = useMemo(() => {
        const map = {};
        tasks.forEach((task) => {
            const rawDate = task.date || task.dueDate || task.endDate || task.deadline || task.due_date || task.createdAt;
            if (rawDate) {
                const d = new Date(rawDate);
                if (!isNaN(d.getTime())) {
                    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    if (!map[dateKey]) map[dateKey] = [];
                    map[dateKey].push(task);
                }
            }
        });
        return map;
    }, [tasks]);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const todayStr = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }, []);

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
                                <span
                                    className="project-color-dot"
                                    style={{ background: project?.color || '#4f46e5' }}
                                ></span>
                                <h1>{project?.name || project?.title || 'Dự án'}</h1>
                            </div>
                            <p className="page-subtitle" style={{ maxWidth: '640px' }}>
                                {project?.description || project?.desc || 'No description'}
                            </p>
                            <div className="project-meta-row">
                                <span className="project-meta-item">
                                    <UsersRound className="icon icon-sm" />{memberList.length} members
                                </span>
                                <span className="project-meta-item">
                                    <ListChecks className="icon icon-sm" />{tasks.length} tasks
                                </span>
                                <span className="project-meta-item">
                                    <CalendarClock className="icon icon-sm" />
                                    end date: {formattedDueDate}
                                </span>
                            </div>
                        </div>
                        <div className="project-header-actions">
                            <span className="avatar-group">
                                {memberList.slice(0, 4).map((m, idx) => {
                                    const name = typeof m === 'object'
                                        ? (m.username || m.name || m.fullName || m.email || 'User')
                                        : 'User';
                                    const avatarUrl = m?.avatar;

                                    return (
                                        <span
                                            key={m._id || m.id || idx}
                                            className="avatar avatar-sm"
                                            style={{ background: '#4f46e5' }}
                                            title={name}
                                        >
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="avatar" />
                                            ) : (
                                                getInitials(name)
                                            )}
                                        </span>
                                    );
                                })}
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
                        <Link to={`/projectcalendar/${projectId}`} className="project-tab active">
                            <Calendar className="icon icon-sm" /> Calendar
                        </Link>
                    </nav>
                </div>

                {/* Main Calendar Area */}
                <main className="page-content" style={{ padding: 'var(--space-6)' }}>
                    <div className="calendar-nav">
                        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                            {currentMonthName} {currentYear}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={handlePrevMonth} className="icon-btn icon-btn-outline">
                                <ChevronLeft className="icon" style={{ width: 16, height: 16 }} />
                            </button>
                            <button onClick={handleToday} className="btn btn-outline btn-sm">
                                Today
                            </button>
                            <button onClick={handleNextMonth} className="icon-btn icon-btn-outline">
                                <ChevronRight className="icon" style={{ width: 16, height: 16 }} />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: 'var(--color-text-subtle)', gap: '8px' }}>
                            <Loader2 className="icon" style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} /> Đang tải dữ liệu từ server...
                        </div>
                    ) : (
                        <div>
                            {/* Headings thứ trong tuần */}
                            <div className="calendar-grid">
                                {daysOfWeek.map((day) => (
                                    <div key={day} className="calendar-weekday">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Lưới hiển thị các ngày */}
                            <div className="calendar-grid">
                                {monthDays.map((cell, index) => {
                                    const dayTasks = tasksByDate[cell.dateString] || [];
                                    const isToday = todayStr === cell.dateString;

                                    return (
                                        <div
                                            key={index}
                                            className={`calendar-cell ${!cell.isCurrentMonth ? 'outside' : ''} ${isToday ? 'today' : ''}`}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span className="calendar-date-num">
                                                    {cell.dayNumber}
                                                </span>

                                                <button
                                                    onClick={() => handleOpenCreateModalForDate(cell.dateString)}
                                                    className="icon-btn"
                                                    style={{ padding: '2px', opacity: 0.6, cursor: 'pointer', border: 'none', background: 'transparent' }}
                                                    title="Tạo task cho ngày này"
                                                >
                                                    <Plus style={{ width: 14, height: 14 }} />
                                                </button>
                                            </div>

                                            {/* Render Tasks */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', maxHeight: '70px' }}>
                                                {dayTasks.map((task) => {
                                                    const taskTitleDisplay = task.title || task.name || task.taskName || 'Untitled Task';

                                                    return (
                                                        <div
                                                            key={task._id || task.id}
                                                            className="calendar-task-chip"
                                                            title={taskTitleDisplay}
                                                        >
                                                            {taskTitleDisplay}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Quick Create Task */}
            {activeModal === 'quickCreateTaskModal' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create Task</h2>
                            <button className="icon-btn" onClick={() => setActiveModal(null)}>
                                <X className="icon" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTask}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className="field">
                                    <label className="field-label">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                        placeholder="e.g. Design review"
                                    />
                                </div>
                                <div className="field">
                                    <label className="field-label">Column</label>
                                    <select value={taskColumn} onChange={(e) => setTaskColumn(e.target.value)} className="select">
                                        <option value="Todo">Todo</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Review">Review</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label className="field-label">Due Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={taskDueDate}
                                        onChange={(e) => setTaskDueDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setActiveModal(null)} className="btn btn-outline btn-sm">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm">
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}