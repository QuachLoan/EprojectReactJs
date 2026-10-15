import { useState, useEffect, useRef } from "react";
import DropdownHeader from "./DropdownHeader/DropdownHeader";
import { Menu, Bell, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../../config/apiConfig.js";
import { loadReadKeys, markRead, notificationKey, pruneReadKeys, unreadOf } from "../../../utils/notificationRead.js";

// signed-in user id as stored by the login page (the read state is kept per user)
const storedUserId = () => {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        return user?.id || user?._id || "";
    } catch {
        return "";
    }
};

// Helper tính ngày kết thúc thực tế của tuần (weekEnd) đồng bộ với ProjectBoard & MyTasks
const calculateDueDateByWeek = (startDateStr, endDateStr, weekNum = 1) => {
    if (!startDateStr) return null;
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return null;

    const currentWeek = Math.max(1, Number(weekNum) || 1);

    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (currentWeek - 1) * 7);

    let weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    if (endDateStr) {
        const projEnd = new Date(endDateStr);
        if (!isNaN(projEnd.getTime()) && weekEnd > projEnd) {
            weekEnd = projEnd;
        }
    }

    return weekEnd;
};

// Tính trạng thái task: 'Overdue', 'Expiring', 'On Track' chuẩn theo ProjectBoard.jsx
const calculateTaskWeekAndStatus = (task, projectStartDate, projectEndDate, isDoneColumn = false) => {
    const currentWeek = Number(task?.week) || 1;

    if (!projectStartDate) {
        return { displayWeek: currentWeek, status: 'On Track' };
    }

    if (isDoneColumn) {
        return { displayWeek: currentWeek, status: 'On Track' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(projectStartDate);
    start.setHours(0, 0, 0, 0);
    if (isNaN(start.getTime())) {
        return { displayWeek: currentWeek, status: 'On Track' };
    }

    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (currentWeek - 1) * 7);

    let weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    if (projectEndDate) {
        const projEndObj = new Date(projectEndDate);
        projEndObj.setHours(0, 0, 0, 0);
        if (!isNaN(projEndObj.getTime()) && weekEnd > projEndObj) {
            weekEnd = projEndObj;
        }
    }

    const expiringStartDate = new Date(weekEnd);
    expiringStartDate.setDate(weekEnd.getDate() - 1);

    if (today > weekEnd) {
        return { displayWeek: currentWeek, status: 'Overdue' };
    } else if (today >= expiringStartDate) {
        return { displayWeek: currentWeek, status: 'Expiring' };
    }

    return { displayWeek: currentWeek, status: 'On Track' };
};

// Page context shown on the left of the header, derived from the route only (no extra API call)
const ROUTE_CONTEXT = [
    { prefix: "/dashboard", title: "Dashboard" },
    { prefix: "/myTasks", title: "My Tasks" },
    { prefix: "/adminuser", title: "Users", parent: "Admin" },
    { prefix: "/projectoverview", title: "Overview", parent: "Projects" },
    { prefix: "/projectchart", title: "Chart", parent: "Projects" },
    { prefix: "/projectboard", title: "Board", parent: "Projects" },
    { prefix: "/projectlist", title: "Backlog", parent: "Projects" },
    { prefix: "/projectcalendar", title: "Calendar", parent: "Projects" },
    { prefix: "/projecttimeline", title: "Timeline", parent: "Projects" },
    { prefix: "/projectsetting", title: "Settings", parent: "Projects" },
    { prefix: "/project", title: "Projects" },
];

function Header({ onOpenSidebar, menuButtonRef, sidebarOpen = false }) {
    const [expiringTasks, setExpiringTasks] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const userId = storedUserId();
    const [readKeys, setReadKeys] = useState(() => loadReadKeys(userId));

    // Quản lý trạng thái theme
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") ||
            (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    });

    // Đồng bộ theme lên html element [data-theme] và lưu localStorage
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
    };

    // Fetch expiring tasks list from API with Project mapping
    const fetchExpiringTasks = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/task/my-task`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return;

            const data = await res.json();
            const tasks = Array.isArray(data) ? data : (data?.data || []);

            // 1. Collect unique project IDs that need details
            const uniqueProjIds = Array.from(new Set(
                tasks.map(t => {
                    if (typeof t.projectId === 'object') return t.projectId?._id || t.projectId?.id;
                    return t.projectId;
                }).filter(Boolean)
            ));

            // 2. Fetch project details to get startDate and endDate/date/dueDate
            const projectMap = {};
            await Promise.all(uniqueProjIds.map(async (pId) => {
                try {
                    const resProj = await fetch(`${API_BASE_URL}/project/${pId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (resProj.ok) {
                        const pData = await resProj.json();
                        projectMap[pId] = pData?.data || pData;
                    }
                } catch {
                    // ignore error
                }
            }));

            // 3. Filter expiring tasks using calculateTaskWeekAndStatus
            const filtered = tasks.filter((task) => {
                // Check status
                const statusName = (typeof task.columnId === 'object'
                    ? (task.columnId?.name || task.columnId?.title || "")
                    : "").toLowerCase();
                const isDone = statusName.includes('done') || statusName.includes('completed');

                // Get startDate & endDate from populated object OR projectMap
                const projId = typeof task.projectId === 'object' ? (task.projectId?._id || task.projectId?.id) : task.projectId;
                const projStartDate = (typeof task.projectId === 'object' && task.projectId?.startDate)
                    ? task.projectId?.startDate
                    : projectMap[projId]?.startDate;

                const projEndDate = (typeof task.projectId === 'object' && (task.projectId?.date || task.projectId?.dueDate || task.projectId?.endDate))
                    ? (task.projectId?.date || task.projectId?.dueDate || task.projectId?.endDate)
                    : (projectMap[projId]?.date || projectMap[projId]?.dueDate || projectMap[projId]?.endDate);

                // Tính trạng thái task chuẩn
                const { status } = calculateTaskWeekAndStatus(task, projStartDate, projEndDate, isDone);

                const expiring = status === 'Expiring';
                if (expiring) {
                    const effectiveDueDate = task.dueDate || calculateDueDateByWeek(projStartDate, projEndDate, task.week || 1);
                    task.notifKey = notificationKey(task._id || task.id, effectiveDueDate);
                }
                return expiring;
            });

            // read keys of tasks that are no longer expiring are dropped
            setReadKeys(pruneReadKeys(userId, filtered.map((t) => t.notifKey)));
            setExpiringTasks(filtered);
        } catch (err) {
            console.error("Error fetching expiring tasks notifications:", err);
        }
    };

    useEffect(() => {
        fetchExpiringTasks();

        // Listen for updates from other components (like MyTasks)
        const handleUpdate = () => fetchExpiringTasks();
        window.addEventListener("myTasksUpdated", handleUpdate);

        // Click outside to close dropdown
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("myTasksUpdated", handleUpdate);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Esc closes the notification panel
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen]);

    const { pathname } = useLocation();
    const context = ROUTE_CONTEXT.find((c) => pathname.startsWith(c.prefix));

    const unread = unreadOf(expiringTasks, readKeys);
    const count = unread.length;

    // a clicked notification leaves the list; "View all" marks every current one as read
    const markOneRead = (key) => setReadKeys(markRead(userId, [key]));
    const markAllRead = () => setReadKeys(markRead(userId, expiringTasks.map((t) => t.notifKey)));

    return (
        <header className="header">
            <button
                ref={menuButtonRef}
                type="button"
                className="icon-btn mobile-menu-btn"
                onClick={onOpenSidebar}
                aria-label="Open menu"
                aria-controls="app-sidebar"
                aria-expanded={sidebarOpen}
            >
                <Menu className="icon" />
            </button>

            {context && (
                <div className="header-context">
                    {context.parent === "Projects" ? (
                        <Link to="/project" className="header-context-link header-context-parent">Projects</Link>
                    ) : context.parent ? (
                        <span className="header-context-parent">{context.parent}</span>
                    ) : null}
                    {context.parent && <span className="header-context-sep" aria-hidden="true">/</span>}
                    <span className="header-context-current" aria-current="page">{context.title}</span>
                </div>
            )}

            {/* Right actions: Theme Toggle + Bell + Profile */}
            <div className="header-actions">
                {/* Nút Toggle Sáng / Tối */}
                <button
                    type="button"
                    className="icon-btn"
                    onClick={toggleTheme}
                    aria-label={`Chuyển sang giao diện ${theme === "dark" ? "sáng" : "tối"}`}
                    title={`Chuyển sang giao diện ${theme === "dark" ? "sáng" : "tối"}`}
                >
                    {theme === "dark" ? <Sun className="icon" /> : <Moon className="icon" />}
                </button>

                <div ref={dropdownRef} className="header-popover-anchor">
                    <button
                        type="button"
                        className="icon-btn notif-btn"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                    >
                        <Bell className="icon" />
                        {count > 0 && (
                            <span className="notif-count" aria-hidden="true">{count > 99 ? '99+' : count}</span>
                        )}
                    </button>

                    {isOpen && (
                        <div className="notif-panel" role="region" aria-label="Notifications">
                            <div className="notif-panel-header">
                                <strong className="notif-panel-title">Notifications</strong>
                                <span className="notif-panel-meta">{count} unread</span>
                            </div>

                            <div className="notif-list">
                                {unread.length === 0 ? (
                                    <div className="notif-empty">No new notifications</div>
                                ) : (
                                    unread.map((task) => {
                                        const taskId = task._id || task.id;
                                        return (
                                            <Link
                                                key={task.notifKey}
                                                to={`/myTasks?taskId=${taskId}`}
                                                onClick={() => { markOneRead(task.notifKey); setIsOpen(false); }}
                                                className="notif-item"
                                            >
                                                <div className="notif-item-title">{task.title || task.name}</div>
                                                <div className="notif-item-meta">Expiring soon</div>
                                            </Link>
                                        );
                                    })
                                )}
                            </div>

                            <Link to="/myTasks" onClick={() => { markAllRead(); setIsOpen(false); }} className="notif-footer">
                                View all in My Tasks
                            </Link>
                        </div>
                    )}
                </div>

                <DropdownHeader />
            </div>
        </header>
    );
}

export default Header;