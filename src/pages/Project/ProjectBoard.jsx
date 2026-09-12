import React, { useState, useEffect } from 'react';
import Header from './../../components/layout/Header/Header.jsx';
import Sidebar from './../../components/layout/Sidebar/Sidebar.jsx';
import {fetchProjectById, fetchTasksByProject} from './../../../api.jsx'; // Import các hàm API từ api.js
import "./project.css";

export default function ProjectBoard({ projectId = 1 }) {
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

    // Gọi API từ api.js khi component mount hoặc projectId đổi
    useEffect(() => {
        const fetchBoardData = async () => {
            try {
                setLoading(true);

                // Gọi đồng thời API lấy thông tin Dự án và danh sách Task
                const [projectData, tasksData] = await Promise.all([
                    fetchProjectById(projectId),
                    fetchTasksByProject(projectId)
                ]);

                setProject(projectData);
                setTasks(tasksData || []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu từ api.js:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBoardData();
    }, [projectId]);

    // Lọc danh sách task theo từng cột Kanban
    const filterTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    if (loading) {
        return <div style={{ padding: '32px', textAlign: 'center' }}>Đang tải dữ liệu...</div>;
    }

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
                            <p className="page-subtitle">{project?.description}</p>
                            <div className="project-meta-row">
                                <span className="project-meta-item">👥 {project?.membersCount || project?.members?.length || 0} thành viên</span>
                                <span className="project-meta-item">📋 {tasks.length} task</span>
                                <span className="project-meta-item">📅 Hạn: {project?.dueDate}</span>
                            </div>
                        </div>
                        <a href="project-settings.html" className="btn-icon" title="Cài đặt dự án">⚙️</a>
                    </div>
                    <nav className="project-tabs">
                        <a href="project-board.html" className="project-tab active">Board</a>
                        <a href="project-list.html" className="project-tab">List</a>
                        <a href="project-calendar.html" className="project-tab">Calendar</a>
                        <a href="project-activity.html" className="project-tab">Activity</a>
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
                                            columnTasks.map((task) => (
                                                <div
                                                    className="board-card"
                                                    key={task.id}
                                                    onClick={() => setSelectedTask(task)}
                                                >
                                                    <div className="card-title">{task.title}</div>
                                                    <div className="card-footer" style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span className="card-date" style={{ fontSize: '12px', color: '#6b7280' }}>{task.dueDate}</span>
                                                        <span className="avatar avatar-xs" style={{ background: task.assigneeBg || '#2563eb' }}>
                                                            {task.assigneeInitials || 'NV'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
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
                                <div className="text-muted">{selectedTask?.dueDate || 'N/A'}</div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label className="form-label">Mô tả</label>
                            <textarea className="textarea" defaultValue={selectedTask?.description} placeholder="Chưa có mô tả cho task này..."></textarea>
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
                                <option>Todo</option>
                                <option>In Progress</option>
                                <option>Review</option>
                                <option>Done</option>
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