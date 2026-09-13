import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './../../components/layout/Header/Header.jsx';
import Sidebar from './../../components/layout/Sidebar/Sidebar.jsx';
import {
    fetchProjectById,
    fetchTasksByProject,
    fetchColumnsByProject,
    createTask
} from './../../../api.jsx';
import "./project.css";

export default function ProjectBoard({ projectId: propProjectId }) {
    const { id: urlProjectId } = useParams();
    const activeProjectId = urlProjectId || propProjectId;

    // Layout State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

    // Data States
    const [project, setProject] = useState(null);
    const [columns, setColumns] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI & Modal States
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeModal, setActiveModal] = useState(null);

    // Form Task State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskColumnId, setNewTaskColumnId] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTaskDate, setNewTaskDate] = useState('');

    // Gọi API lấy dữ liệu chi tiết Project, Columns và Tasks
    useEffect(() => {
        const fetchBoardData = async () => {
            if (!activeProjectId) return;

            try {
                setLoading(true);

                const [projectData, columnsData, tasksData] = await Promise.all([
                    fetchProjectById(activeProjectId),
                    fetchColumnsByProject(activeProjectId),
                    fetchTasksByProject(activeProjectId)
                ]);

                const realProject = projectData?.data || projectData;
                const realColumns = Array.isArray(columnsData) ? columnsData : (columnsData?.data || []);
                const realTasks = Array.isArray(tasksData) ? tasksData : (tasksData?.data || []);

                // Sắp xếp các cột theo thứ tự position
                realColumns.sort((a, b) => (a.position || 0) - (b.position || 0));

                setProject(realProject);
                setColumns(realColumns);
                setTasks(realTasks);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu từ API:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBoardData();
    }, [activeProjectId]);

    // Lọc danh sách task theo columnId
    const filterTasksByColumn = (columnId) => {
        return tasks.filter(task => {
            if (!task || !task.columnId) return false;

            // Lấy ID chuẩn cho cả 2 trường hợp: dạng String hoặc dạng Object bọc sẵn
            const taskColId = typeof task.columnId === 'object' ? task.columnId._id : task.columnId;

            return String(taskColId) === String(columnId);
        });
    };

    // Mở Modal tạo task và chọn sẵn Column mặc định nếu có
    // 1. Reset date khi mở Modal
    const handleOpenCreateModal = (columnId = '') => {
        setNewTaskColumnId(columnId || (columns[0]?._id || ''));
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskPriority('Medium');
        setNewTaskDate(''); // Reset về rỗng
        setActiveModal('quickCreateTaskModal');
    };

// 2. Gửi key `date` theo Schema task.js lên backend
    const reloadTasks = async () => {
        try {
            const tasksData = await fetchTasksByProject(activeProjectId);
            const realTasks = Array.isArray(tasksData) ? tasksData : (tasksData?.data || []);
            setTasks(realTasks);
        } catch (error) {
            console.error("Lỗi khi tải lại tasks:", error);
        }
    };

// 2. Gọi reloadTasks() sau khi tạo thành công
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !newTaskColumnId) {
            alert('Vui lòng nhập tên công việc và chọn cột!');
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                title: newTaskTitle,
                description: newTaskDesc,
                columnId: newTaskColumnId,
                priority: newTaskPriority,
                date: newTaskDate ? new Date(newTaskDate) : new Date()
            };

            await createTask(payload);

            // 🟢 Fetch lại danh sách task mới nhất từ Server
            await reloadTasks();

            setActiveModal(null);
        } catch (error) {
            console.error("Lỗi khi tạo task mới:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '32px', textAlign: 'center' }}>Đang tải dữ liệu dự án...</div>;
    }

    const memberList = Array.isArray(project?.assignees) ? project.assignees : [];
    const formattedDueDate = (project?.date)
        ? new Date(project.date).toLocaleDateString('vi-VN')
        : 'N/A';

    return (
        <div className="app-shell">
            <Sidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                mobileOpen={sidebarMobileOpen}
                setMobileOpen={setSidebarMobileOpen}
            />
            {sidebarMobileOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarMobileOpen(false)} />
            )}

            <div className="app-main">
                <Header
                    onOpenSidebar={() => setSidebarMobileOpen(true)}
                    onOpenModal={(modal) => setActiveModal(modal)}
                />

                {/* PROJECT HEADER */}
                <div className="project-header">
                    <div className="project-header-top">
                        <div>
                            <div className="project-title-row">
                                <span className="project-color-dot" style={{ background: project?.color || '#4f46e5' }}></span>
                                <h1>{project?.name || 'Dự án'}</h1>
                            </div>
                            <p className="page-subtitle">{project?.description || 'Chưa có mô tả dự án.'}</p>

                            <div className="project-meta-row">
                                <span className="project-meta-item">👥 {memberList.length} thành viên</span>
                                <span className="project-meta-item">📋 {tasks.length} task</span>
                                <span className="project-meta-item">📅 Hạn: {formattedDueDate}</span>
                            </div>
                        </div>
                        <Link to="/projectsetting" className="btn-icon" title="Cài đặt dự án">⚙️</Link>
                    </div>
                    <nav className="project-tabs">
                        <Link to="/projectboard" className="project-tab active">Board</Link>
                        <Link to="/projectlist" className="project-tab">List</Link>
                        <Link to="/projectcalendar" className="project-tab">Calendar</Link>
                        <Link to="/projectactivity" className="project-tab">Activity</Link>
                    </nav>
                </div>

                {/* MAIN KANBAN BOARD */}
                <main className="page-content">
                    <div className="filter-bar" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div className="input-icon-wrap" style={{ width: '220px', flexShrink: 0 }}>
                            <span className="input-icon">🔍</span>
                            <input className="input" placeholder="Tìm task..." style={{ width: '100%' }} />
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ marginLeft: 'auto', flexShrink: 0 }}
                            onClick={() => handleOpenCreateModal()}
                        >
                            + Thêm task
                        </button>
                    </div>

                    {/* RENDER CỘT ĐỘNG TỪ API */}
                    <div className="board scroll-x" id="kanbanBoard">
                        {columns.map((column) => {
                            const columnTasks = filterTasksByColumn(column._id);
                            return (
                                <div className="board-column" key={column._id}>
                                    <div className="board-column-header">
                                        <span className="board-column-title">{column.title}</span>
                                        <span className="board-column-count">{columnTasks.length}</span>
                                        <button
                                            className="btn-icon"
                                            style={{ marginLeft: 'auto' }}
                                            onClick={() => handleOpenCreateModal(column._id)}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="board-column-body">
                                        {columnTasks.length === 0 ? (
                                            <div className="empty-state" style={{ padding: '24px 0' }}>
                                                <div className="empty-state-desc">Chưa có công việc</div>
                                            </div>
                                        ) : (
                                            columnTasks.map((task) => {
                                                const taskDueDateFormatted = task.date
                                                    ? new Date(task.date).toLocaleDateString('vi-VN')
                                                    : 'N/A';

                                                return (
                                                    <div
                                                        className="task-card"
                                                        key={task._id}
                                                        onClick={() => setSelectedTask(task)}
                                                    >
                                                        <div className="task-card-title">{task.title}</div>
                                                        <div className="task-card-bottom">
                                                            <div className="task-card-meta">
                                                                <span className="task-card-meta-item">
                                                                    📅 {taskDueDateFormatted}
                                                                </span>
                                                                <span className={`priority-tag priority-${task.priority?.toLowerCase()}`}>
                                                                    {task.priority || 'Medium'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    <button
                                        className="add-task-btn"
                                        style={{ width: '260px' }}
                                        onClick={() => handleOpenCreateModal(column._id)}
                                    >
                                        + Thêm task
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>

            {/* MODAL: TẠO TASK MỚI */}
            {activeModal === 'quickCreateTaskModal' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleCreateTask}>
                            <div className="modal-header">
                                <h2>Tạo task mới</h2>
                                <button type="button" className="btn-icon" onClick={() => setActiveModal(null)}>✕</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Tiêu đề *</label>
                                    <input
                                        className="input"
                                        placeholder="VD: Thiết kế giao diện"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Cột thực hiện *</label>
                                    <select
                                        className="select"
                                        value={newTaskColumnId}
                                        onChange={(e) => setNewTaskColumnId(e.target.value)}
                                        required
                                    >
                                        {columns.map((col) => (
                                            <option key={col._id} value={col._id}>{col.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* ➕ Ô CHỌN HẠN CHÓT (DUE DATE) */}
                                <div className="form-group">
                                    <label className="form-label">Hạn chót (Due Date)</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newTaskDate}
                                        onChange={(e) => setNewTaskDate(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Độ ưu tiên</label>
                                    <select
                                        className="select"
                                        value={newTaskPriority}
                                        onChange={(e) => setNewTaskPriority(e.target.value)}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Mô tả</label>
                                    <textarea
                                        className="textarea"
                                        placeholder="Mô tả công việc..."
                                        value={newTaskDesc}
                                        onChange={(e) => setNewTaskDesc(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Hủy</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang tạo...' : 'Tạo task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}