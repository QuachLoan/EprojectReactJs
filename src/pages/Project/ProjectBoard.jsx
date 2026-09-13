import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Thêm useParams để đọc ID từ đường dẫn URL
import Header from './../../components/layout/Header/Header.jsx';
import Sidebar from './../../components/layout/Sidebar/Sidebar.jsx';
import { fetchProjectById, fetchTasksByProject } from './../../../api.jsx';
import "./project.css";
import {Link} from "react-router-dom";

export default function ProjectBoard({ projectId: propProjectId }) {
    // Ưu tiên lấy projectId từ URL (ví dụ /projectboard/65a...), nếu không có thì lấy từ props
    const { id: urlProjectId } = useParams();
    const activeProjectId = urlProjectId || propProjectId;

    // Layout State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

    // Data States
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeModal, setActiveModal] = useState(null);

    // Gọi API lấy dữ liệu chi tiết Project và Task khi activeProjectId thay đổi
    useEffect(() => {
        const fetchBoardData = async () => {
            if (!activeProjectId) return;

            try {
                setLoading(true);

                // Gọi đồng thời API lấy thông tin Dự án và danh sách Task
                const [projectData, tasksData] = await Promise.all([
                    fetchProjectById(activeProjectId),
                    fetchTasksByProject(activeProjectId)
                ]);

                // Xử lý dữ liệu trả về nếu bị bọc trong { success: true, data: ... }
                const realProject = projectData?.data || projectData;
                const realTasks = Array.isArray(tasksData) ? tasksData : (tasksData?.data || []);

                setProject(realProject);
                setTasks(realTasks);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu chi tiết Project từ API:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBoardData();
    }, [activeProjectId]);

    // Lọc danh sách task theo từng cột Kanban (Hỗ trợ cả field 'column' và 'status')
    const filterTasksByStatus = (statusName) => {
        return tasks.filter(task => (task.column || task.status) === statusName);
    };

    if (loading) {
        return <div style={{ padding: '32px', textAlign: 'center' }}>Đang tải dữ liệu dự án...</div>;
    }

    // Tính toán mảng danh sách thành viên linh hoạt theo Schema
    const memberList = Array.isArray(project?.assignees)
        ? project.assignees
        : Array.isArray(project?.members)
            ? project.members
            : [];

    // Format ngày hạn chót (dueDate/date)
    const formattedDueDate = (project?.date || project?.dueDate)
        ? new Date(project.date || project.dueDate).toLocaleDateString('vi-VN')
        : 'N/A';

    return (
        <div className="app-shell">
            {/* 1. Sidebar Dùng Chung */}
            <Sidebar
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                mobileOpen={sidebarMobileOpen}
                setMobileOpen={setSidebarMobileOpen}
            />
            {sidebarMobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarMobileOpen(false)}
                />
            )}

            <div className="app-main">
                {/* 2. Header Dùng Chung */}
                <Header
                    onOpenSidebar={() => setSidebarMobileOpen(true)}
                    onOpenModal={(modal) => setActiveModal(modal)}
                />

                {/* ============ PROJECT HEADER (DỮ LIỆU TỪ API) ============ */}
                <div className="project-header">
                    <div className="project-header-top">
                        <div>
                            <div className="project-title-row">
                                <span className="project-color-dot" style={{ background: project?.color || '#4f46e5' }}></span>
                                <h1>{project?.name || project?.title || 'Dự án'}</h1>
                            </div>
                            <p className="page-subtitle">{project?.description || project?.desc || 'Chưa có mô tả dự án.'}</p>

                            <div className="project-meta-row">
                                {/* Đếm số lượng từ mảng memberList */}
                                <span className="project-meta-item">👥 {memberList.length} thành viên</span>
                                <span className="project-meta-item">📋 {tasks.length} task</span>
                                {/* Render Hạn chót đã format */}
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

                {/* ============ MAIN CONTENT & KANBAN BOARD ============ */}
                <main className="page-content">
                    <div className="filter-bar">
                        <div className="input-icon-wrap">
                            <span className="input-icon">🔍</span>
                            <input className="input" placeholder="Tìm task..." />
                        </div>
                        <select className="select">
                            <option>Người thực hiện</option>
                        </select>
                        <select className="select">
                            <option>Độ ưu tiên</option>
                        </select>
                        <button
                            className="btn btn-primary"
                            style={{ marginLeft: 'auto' }}
                            onClick={() => setActiveModal('quickCreateTaskModal')}
                        >
                            + Thêm task
                        </button>
                    </div>

                    {/* Khung Bảng Kanban Render Động */}
                    <div className="board scroll-x" id="kanbanBoard">
                        {['Todo', 'In Progress', 'Review', 'Done'].map((status) => {
                            const columnTasks = filterTasksByStatus(status);
                            return (
                                <div className="board-column" key={status}>
                                    <div className="board-column-header">
                                        <h3>{status} ({columnTasks.length})</h3>
                                        <button className="btn-icon" onClick={() => setActiveModal('quickCreateTaskModal')}>+</button>
                                    </div>
                                    <div className="board-cards">
                                        {columnTasks.length === 0 ? (
                                            <div
                                                className="empty-placeholder"
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: '#9ca3af', fontSize: '14px' }}
                                            >
                                                Chưa có công việc
                                            </div>
                                        ) : (
                                            columnTasks.map((task) => {
                                                const taskId = task._id || task.id;
                                                const taskDueDateFormatted = task.dueDate
                                                    ? new Date(task.dueDate).toLocaleDateString('vi-VN')
                                                    : 'N/A';

                                                // Xử lý avatar người thực hiện task
                                                const assigneeName = task.assignee?.username || task.assigneeName || 'User';
                                                const initials = assigneeName.slice(0, 2).toUpperCase();

                                                return (
                                                    <div
                                                        className="board-card"
                                                        key={taskId}
                                                        onClick={() => setSelectedTask(task)}
                                                    >
                                                        <div className="card-title">{task.title}</div>
                                                        <div className="card-footer" style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span className="card-date" style={{ fontSize: '12px', color: '#6b7280' }}>
                                                                {taskDueDateFormatted}
                                                            </span>
                                                            <span className="avatar avatar-xs" style={{ background: '#2563eb' }} title={assigneeName}>
                                                                {initials}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>

            {/* ============ DRAWER: Chi tiết Task ============ */}
            <div className={`drawer-overlay ${selectedTask ? '' : 'hidden'}`} id="taskDrawer" onClick={() => setSelectedTask(null)}>
                <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
                    <div className="drawer-header">
                        <h2>{selectedTask?.title || 'Tên task'}</h2>
                        <button className="btn-icon" onClick={() => setSelectedTask(null)}>✕</button>
                    </div>
                    <div className="drawer-body">
                        <div className="drawer-field-grid">
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Độ ưu tiên</label>
                                <div>{selectedTask?.priority || 'Trung bình'}</div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Hạn chót</label>
                                <div className="text-muted">
                                    {selectedTask?.dueDate
                                        ? new Date(selectedTask.dueDate).toLocaleDateString('vi-VN')
                                        : 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="textarea"
                                defaultValue={selectedTask?.description}
                                placeholder="Chưa có mô tả cho task này..."
                            ></textarea>
                        </div>

                        <button className="btn btn-danger btn-sm" style={{ marginTop: '16px' }}>🗑️ Xoá task</button>
                    </div>
                </div>
            </div>

            {/* ============ MODAL: Tạo Task nhanh ============ */}
            <div className={`modal-overlay ${activeModal === 'quickCreateTaskModal' ? '' : 'hidden'}`} id="quickCreateTaskModal" onClick={() => setActiveModal(null)}>
                <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Tạo task mới</h2>
                        <button className="btn-icon" onClick={() => setActiveModal(null)}>✕</button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Tiêu đề</label>
                            <input className="input" placeholder="VD: Thiết kế trang chủ" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cột</label>
                            <select className="select">
                                <option value="Todo">Todo</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Review">Review</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Huỷ</button>
                        <button className="btn btn-primary" onClick={() => setActiveModal(null)}>Tạo task</button>
                    </div>
                </div>
            </div>
        </div>
    );
}