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
    Loader2
} from 'lucide-react';

import {
    fetchProjectById,
    fetchTasksByProject
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

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentDate, setCurrentDate] = useState(new Date());

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
                                Month
                            </button>
                            <button onClick={handleNextMonth} className="icon-btn icon-btn-outline">
                                <ChevronRight className="icon" style={{ width: 16, height: 16 }} />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: 'var(--color-text-subtle)', gap: '8px' }}>
                            <Loader2 className="icon" style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} /> Loading
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
        </div>
    );
}