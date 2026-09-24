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

// Hàm hỗ trợ lấy 2 chữ cái đầu viết hoa từ username/name (giống ProjectBoard)
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

    // Lấy danh sách thành viên giống ProjectBoard
    const memberList = useMemo(() => {
        if (Array.isArray(project?.assignees)) return project.assignees;
        if (Array.isArray(project?.members)) return project.members;
        return [];
    }, [project]);

    // Định dạng End Date/Due Date giống ProjectBoard
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
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">
                            {currentMonthName} {currentYear}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button onClick={handlePrevMonth} className="icon-btn icon-btn-outline">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={handleToday} className="btn btn-outline btn-sm">
                                Today
                            </button>
                            <button onClick={handleNextMonth} className="icon-btn icon-btn-outline">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" /> Đang tải dữ liệu từ server...
                        </div>
                    ) : (
                        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                            <div className="grid grid-cols-7 border-b bg-gray-50 text-center font-medium text-xs text-gray-500 py-2">
                                {daysOfWeek.map((day) => (
                                    <div key={day}>{day}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 auto-rows-fr border-collapse">
                                {monthDays.map((cell, index) => {
                                    const dayTasks = tasksByDate[cell.dateString] || [];
                                    const isToday = todayStr === cell.dateString;

                                    return (
                                        <div
                                            key={index}
                                            className={`min-h-[110px] border-b border-r p-1.5 transition-colors relative group ${
                                                cell.isCurrentMonth ? 'bg-white' : 'bg-gray-50/50 text-gray-400'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span
                                                    className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                                                        isToday
                                                            ? 'bg-indigo-600 text-white'
                                                            : cell.isCurrentMonth
                                                                ? 'text-gray-700'
                                                                : 'text-gray-400'
                                                    }`}
                                                >
                                                    {cell.dayNumber}
                                                </span>

                                                <button
                                                    onClick={() => handleOpenCreateModalForDate(cell.dateString)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-200 rounded text-gray-500"
                                                    title="Tạo task cho ngày này"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Render Tasks */}
                                            <div className="space-y-1 overflow-y-auto max-h-[80px]">
                                                {dayTasks.map((task) => {
                                                    const col = (task.column || task.status || '').toLowerCase();
                                                    const isDone = col === 'done' || col === 'completed';
                                                    const isInProgress = col === 'in progress' || col === 'doing';
                                                    const taskTitleDisplay = task.title || task.name || task.taskName || 'Untitled Task';

                                                    return (
                                                        <div
                                                            key={task._id || task.id}
                                                            className={`text-[11px] p-1 px-1.5 rounded border truncate cursor-pointer font-medium ${
                                                                isDone
                                                                    ? 'bg-green-50 text-green-700 border-green-200 line-through'
                                                                    : isInProgress
                                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                                            }`}
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