import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Header from './../../components/layout/Header/Header.jsx';
import Sidebar from './../../components/layout/Sidebar/Sidebar.jsx';
import {
    fetchProjectById,
    fetchTasksByProject,
    fetchColumnsByProject,
    createTask,
    updateTask,
    fetchTaskById,
    deleteTask,
    addChecklistItem,
    toggleChecklistItem,
    fetchTaskComments,
    addComment,
    fetchTaskActivities,
    moveTask
} from './../../../api.jsx';
import "./project.css";
import {Settings} from "lucide-react";

// Hàm hỗ trợ lấy 2 chữ cái đầu viết hoa từ username/name
const getInitials = (name) => {
    if (!name) return '??';
    const words = String(name).trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Hàm tìm kiếm thông tin user theo ID từ danh sách thành viên dự án
const getUserInfo = (userOrId, projectMembers = []) => {
    if (!userOrId) return null;

    if (typeof userOrId === 'object' && (userOrId.username || userOrId.name)) {
        return userOrId;
    }

    const targetId = typeof userOrId === 'object' ? (userOrId._id || userOrId.id) : userOrId;
    const found = projectMembers.find(m => String(m._id || m.id) === String(targetId));

    return found || userOrId;
};

// Hàm bóc tách chuẩn hoá columnId về dạng String ID
const extractColumnId = (columnId) => {
    if (!columnId) return '';
    if (typeof columnId === 'object') {
        return String(columnId._id || columnId.id || '');
    }
    return String(columnId);
};

// ==========================================
// COMPONENT TASK DRAWER
// ==========================================
function TaskDrawer({
                        taskId,
                        isDrawerOpen,
                        handleCloseDrawer,
                        columns = [],
                        projectMembers = [],
                        onTaskUpdated,
                        onTaskDeleted
                    }) {
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Dynamic states
    const [checklistText, setChecklistText] = useState('');
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        if (isDrawerOpen && taskId) {
            setLoading(true);
            Promise.all([
                fetchTaskById(taskId),
                fetchTaskComments(taskId).catch(() => []),
                fetchTaskActivities(taskId).catch(() => [])
            ])
                .then(([taskData, commentsData, activitiesData]) => {
                    const realTask = taskData?.data || taskData;

                    const formattedAssignees = Array.isArray(realTask.assignees)
                        ? realTask.assignees.map(a => typeof a === 'object' ? (a._id || a.id) : a)
                        : [];

                    setTask({
                        ...realTask,
                        columnId: extractColumnId(realTask.columnId),
                        date: realTask.date ? new Date(realTask.date).toISOString().split('T')[0] : '',
                        assignees: formattedAssignees
                    });
                    setComments(Array.isArray(commentsData) ? commentsData : (commentsData?.data || []));
                    setActivities(Array.isArray(activitiesData) ? activitiesData : (activitiesData?.data || []));
                })
                .catch((err) => console.error("Lỗi khi tải chi tiết task:", err))
                .finally(() => setLoading(false));
        }
    }, [taskId, isDrawerOpen]);

    if (!isDrawerOpen) return null;

    // Cập nhật trường dữ liệu task
    const handleUpdateTaskField = async (updatedFields) => {
        if (!task || isSaving) return;

        // Bóc tách trước columnId nếu có thay đổi Status
        if (updatedFields.columnId) {
            updatedFields.columnId = extractColumnId(updatedFields.columnId);
        }

        const previousTask = { ...task };
        const updatedTaskLocal = { ...task, ...updatedFields };

        // 1. Cập nhật UI local của Drawer ngay lập tức
        setTask(updatedTaskLocal);

        // 2. Cập nhật UI của Kanban Board ngoài ngay lập tức
        if (onTaskUpdated) {
            onTaskUpdated(updatedTaskLocal);
        }

        // 3. Gọi API lưu vào DB
        try {
            setIsSaving(true);
            const updatedData = await updateTask(taskId, updatedFields);
            const returnedTask = updatedData?.data || updatedData;

            if (returnedTask) {
                const finalTask = {
                    ...updatedTaskLocal,
                    ...returnedTask,
                    columnId: extractColumnId(returnedTask.columnId) || updatedTaskLocal.columnId
                };
                setTask(finalTask);
                if (onTaskUpdated) onTaskUpdated(finalTask);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật task, đang hoàn tác:", error);
            // Revert nếu lỗi
            setTask(previousTask);
            if (onTaskUpdated) onTaskUpdated(previousTask);
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        const updatedFields = { [field]: value };
        setTask(prev => {
            const nextState = { ...prev, ...updatedFields };
            if (onTaskUpdated) onTaskUpdated(nextState);
            return nextState;
        });
    };

    const handleToggleAssignee = (memberId) => {
        const currentAssignees = task.assignees || [];
        let newAssignees;

        if (currentAssignees.includes(memberId)) {
            newAssignees = currentAssignees.filter(id => String(id) !== String(memberId));
        } else {
            newAssignees = [...currentAssignees, memberId];
        }

        handleUpdateTaskField({ assignees: newAssignees, members: newAssignees });
    };

    const handleDeleteTask = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa task này?")) return;
        try {
            await deleteTask(taskId);
            if (onTaskDeleted) onTaskDeleted(taskId);
            handleCloseDrawer();
        } catch (error) {
            console.error("Lỗi khi xóa task:", error);
        }
    };

    const handleAddChecklist = async () => {
        if (!checklistText.trim()) return;

        const textToSend = checklistText.trim();
        setChecklistText('');

        try {
            const response = await addChecklistItem(taskId, textToSend);
            const realTask = response?.data || response;
            if (realTask && realTask.checklist) {
                setTask(prev => ({ ...prev, checklist: realTask.checklist }));
            }
        } catch (error) {
            console.error("Lỗi khi thêm checklist:", error);
        }
    };

    const handleToggleChecklist = async (itemId, completed) => {
        // 1. Toggle giao diện trước (Optimistic Update)
        const updatedChecklist = (task.checklist || []).map(item =>
            String(item._id) === String(itemId) ? { ...item, completed: !completed } : item
        );
        setTask(prev => ({ ...prev, checklist: updatedChecklist }));

        // 2. Gọi API để lưu vào DB
        try {
            const response = await toggleChecklistItem(taskId, itemId, completed);
            const realTask = response?.data || response;

            // Cập nhật lại State bằng dữ liệu thật từ Server
            if (realTask && realTask.checklist) {
                setTask(prev => ({ ...prev, checklist: realTask.checklist }));
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật checklist:", error);
            // Nếu lỗi thì hoàn tác lại giao diện
            setTask(prev => ({ ...prev, checklist: task.checklist }));
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const textToSend = commentText;
        setCommentText('');

        try {
            const newComment = await addComment(taskId, textToSend);
            setComments(prev => [...prev, newComment?.data || newComment]);
        } catch (error) {
            console.error("Lỗi khi gửi bình luận:", error);
        }
    };

    const renderPriorityBadge = (priority) => {
        const priorityConfig = {
            Low: { color: '#2563eb', bg: '#eff6ff' },
            Medium: { color: '#d97706', bg: '#fffbeb' },
            High: { color: '#dc2626', bg: '#fef2f2' },
            Urgent: { color: '#7c3aed', bg: '#f5f3ff' }
        };
        const config = priorityConfig[priority] || priorityConfig.Medium;

        return (
            <span className="priority-badge" style={{ color: config.color, background: config.bg, padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span className="icon icon-xs">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2">
                        <path d="M12 5v14"></path>
                        <path d="m19 12-7 7-7-7"></path>
                    </svg>
                </span>
                <span>{priority}</span>
            </span>
        );
    };

    const totalChecklist = task?.checklist?.length || 0;
    const completedChecklist = task?.checklist?.filter(item => item.completed)?.length || 0;
    const progressPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

    return (
        <div className={`drawer-overlay ${isDrawerOpen ? "" : "hidden"}`} id="taskDrawer">
            <div className="drawer-panel">
                <div className="drawer-header">
                    <div className="drawer-header-meta" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {renderPriorityBadge(task?.priority || 'Medium')}
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            {isSaving ? 'Đang lưu...' : (task?.updatedAt ? `Updated ${new Date(task.updatedAt).toLocaleDateString('vi-VN')}` : 'Recently')}
                        </span>
                    </div>
                    <button className="icon-btn" onClick={handleCloseDrawer} aria-label="Close panel">
                        <span className="icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2">
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                            </svg>
                        </span>
                    </button>
                </div>

                {loading || !task ? (
                    <div className="drawer-body" style={{ padding: '24px', textAlign: 'center' }}>Đang tải thông tin task...</div>
                ) : (
                    <div className="drawer-body">
                        {/* Title */}
                        <textarea
                            className="drawer-title-input"
                            rows="1"
                            value={task.title || ''}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            onBlur={(e) => handleUpdateTaskField({ title: e.target.value })}
                            placeholder="Nhập tên task..."
                        />

                        <div className="drawer-field-grid">
                            {/* Column / Status */}
                            <div>
                                <span className="drawer-field-label">Status</span>
                                <select
                                    className="select"
                                    value={extractColumnId(task.columnId)}
                                    onChange={(e) => handleUpdateTaskField({ columnId: e.target.value })}
                                >
                                    {columns.map((col) => (
                                        <option key={col._id} value={String(col._id)}>
                                            {col.name || col.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <span className="drawer-field-label">Priority</span>
                                <select
                                    className="select"
                                    value={task.priority || 'Medium'}
                                    onChange={(e) => handleUpdateTaskField({ priority: e.target.value })}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>

                            {/* Due Date */}
                            <div>
                                <span className="drawer-field-label">Due date</span>
                                <input
                                    className="input"
                                    type="date"
                                    value={task.date ? String(task.date).split('T')[0] : ''}
                                    onChange={(e) => handleUpdateTaskField({ date: e.target.value })}
                                />
                            </div>

                            {/* Assignees */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <span className="drawer-field-label">Assignees</span>
                                <div className="card" style={{ maxHeight: '120px', overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {projectMembers.length === 0 ? (
                                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Chưa có thành viên dự án</span>
                                    ) : (
                                        projectMembers.map((member, idx) => {
                                            const memberId = typeof member === 'object' ? (member._id || member.id) : member;
                                            const name = typeof member === 'object' ? (member.username || member.name || member.email || 'User') : 'User';
                                            const isChecked = task.assignees?.some(id => String(id) === String(memberId));

                                            return (
                                                <label key={memberId || idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleToggleAssignee(memberId)}
                                                    />
                                                    <span className="avatar avatar-xs" style={{ background: '#4f46e5', color: '#fff', fontSize: '10px', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {getInitials(name)}
                                                    </span>
                                                    <span>{name}</span>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <span className="drawer-field-label">Description</span>
                            <textarea
                                className="textarea"
                                rows="3"
                                placeholder="Add a more detailed description…"
                                value={task.description || ''}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                onBlur={(e) => handleUpdateTaskField({ description: e.target.value })}
                            />
                        </div>

                        {/* Checklist Section */}
                        <div className="drawer-section">
                            <div className="checklist-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span className="comments-title">Checklist</span>
                                <span className="checklist-count">{completedChecklist}/{totalChecklist}</span>
                            </div>
                            <div className="progress-bar" style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
                                <span
                                    className="progress-bar-fill tone-success"
                                    style={{ display: 'block', height: '100%', background: '#22c55e', width: `${progressPercent}%`, transition: 'width 0.3s' }}
                                ></span>
                            </div>
                            <div className="checklist-items" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {task.checklist && task.checklist.map((item, index) => (
                                    <label key={item._id || index} className="checklist-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            checked={item.completed || false}
                                            onChange={() => handleToggleChecklist(item._id, item.completed)}
                                        />
                                        <span className={`checklist-text ${item.completed ? 'completed' : ''}`} style={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#9ca3af' : 'inherit' }}>
                                            {item.text}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <div className="checklist-add-row" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                <input
                                    className="input"
                                    placeholder="Add checklist item…"
                                    value={checklistText}
                                    onChange={(e) => setChecklistText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                                />
                                <button className="checklist-add-btn btn btn-secondary" onClick={handleAddChecklist} aria-label="Add checklist item">
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="drawer-section">
                            <p className="comments-title" style={{ fontWeight: 600, marginBottom: '8px' }}>Comments</p>
                            <div className="comments-list" style={{ marginBottom: '12px' }}>
                                {comments.length === 0 ? (
                                    <div className="empty-state" style={{ padding: '16px 0', textAlign: 'center' }}>
                                        <p className="empty-state-title" style={{ fontSize: '14px', color: '#6b7280' }}>No comments yet</p>
                                    </div>
                                ) : (
                                    comments.map((comment, idx) => (
                                        <div key={comment._id || idx} className="comment-item" style={{ marginBottom: '8px', fontSize: '14px' }}>
                                            <strong>{comment.user?.username || comment.user?.name || 'User'}: </strong>
                                            <span>{comment.text}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <form className="comment-form" onSubmit={handleAddComment}>
                                <textarea
                                    className="textarea"
                                    rows="2"
                                    placeholder="Write a comment…"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <div className="comment-form-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                    <button type="submit" className="btn btn-primary btn-sm">Send</button>
                                </div>
                            </form>
                        </div>

                        {/* Activity Section */}
                        <div className="drawer-section">
                            <p className="comments-title" style={{ fontWeight: 600, marginBottom: '8px' }}>Activity</p>
                            <ol className="timeline" style={{ paddingLeft: '16px', fontSize: '13px', color: '#4b5563' }}>
                                {activities.map((act, index) => (
                                    <li key={act._id || index} className="timeline-item" style={{ marginBottom: '6px' }}>
                                        <strong>{act.user?.username || act.user?.name || 'User'}</strong> {act.action || 'đã thao tác'}
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Delete Task */}
                        <div className="drawer-section" style={{ marginTop: '24px' }}>
                            <button
                                className="btn btn-outline btn-full"
                                style={{ color: '#dc2626', borderColor: '#fca5a5', width: '100%' }}
                                onClick={handleDeleteTask}
                            >
                                Delete task
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// MAIN COMPONENT: PROJECT BOARD
// ==========================================
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
    const [selectedMembers, setSelectedMembers] = useState([]);

    // UI & Modal / Drawer States
    const [activeModal, setActiveModal] = useState(null);
    const [isColumnFixed, setIsColumnFixed] = useState(false);

    // State quản lý Task Drawer
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Form Task State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskColumnId, setNewTaskColumnId] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTaskDate, setNewTaskDate] = useState('');

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

    useEffect(() => {
        fetchBoardData();
    }, [activeProjectId]);

    const getSortedTasksForColumn = (column) => {
        const columnTaskMap = new Map();

        tasks.forEach(task => {
            if (!task || !task.columnId) return;
            const taskColId = extractColumnId(task.columnId);
            if (String(taskColId) === String(column._id)) {
                columnTaskMap.set(String(task._id), task);
            }
        });

        if (Array.isArray(column.taskOrderIds) && column.taskOrderIds.length > 0) {
            const sorted = [];
            column.taskOrderIds.forEach(id => {
                const idStr = typeof id === 'object' ? id._id || id.toString() : String(id);
                if (columnTaskMap.has(idStr)) {
                    sorted.push(columnTaskMap.get(idStr));
                    columnTaskMap.delete(idStr);
                }
            });
            return [...sorted, ...Array.from(columnTaskMap.values())];
        }

        return Array.from(columnTaskMap.values());
    };

    const getCurrentUserId = () => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        return currentUser._id || currentUser.id || null;
    };

    const resetTaskForm = () => {
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskPriority('Medium');
        setNewTaskDate('');

        const currentUserId = getCurrentUserId();
        setSelectedMembers(currentUserId ? [currentUserId] : []);
    };

    const closeModal = () => {
        setActiveModal(null);
        resetTaskForm();
    };

    const toggleMemberSelection = (id) => {
        setSelectedMembers((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    };

    // Handlers Mở / Đóng Drawer
    const handleOpenTaskDrawer = (taskId) => {
        setSelectedTaskId(taskId);
        setIsDrawerOpen(true);
    };

    const handleCloseTaskDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedTaskId(null);
    };

    const handleTaskUpdatedFromDrawer = (updatedTask) => {
        setTasks(prevTasks =>
            prevTasks.map(t => String(t._id) === String(updatedTask._id)
                ? { ...t, ...updatedTask, columnId: extractColumnId(updatedTask.columnId) }
                : t
            )
        );
    };

    const handleTaskDeletedFromDrawer = (deletedTaskId) => {
        setTasks(prevTasks => prevTasks.filter(t => String(t._id) !== String(deletedTaskId)));
    };

    const handleOnDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const sourceColId = source.droppableId;
        const destColId = destination.droppableId;

        setColumns(prevColumns => {
            const newColumns = structuredClone(prevColumns);
            const sourceCol = newColumns.find(c => String(c._id) === String(sourceColId));
            const destCol = newColumns.find(c => String(c._id) === String(destColId));

            if (!sourceCol || !destCol) return prevColumns;

            if (!sourceCol.taskOrderIds) sourceCol.taskOrderIds = [];
            if (!destCol.taskOrderIds) destCol.taskOrderIds = [];

            if (sourceCol.taskOrderIds.length === 0) {
                sourceCol.taskOrderIds = getSortedTasksForColumn(sourceCol).map(t => t._id);
            }
            if (destCol.taskOrderIds.length === 0 && sourceColId !== destColId) {
                destCol.taskOrderIds = getSortedTasksForColumn(destCol).map(t => t._id);
            }

            if (sourceColId === destColId) {
                const newOrder = Array.from(sourceCol.taskOrderIds.map(id => String(id)));
                const [movedId] = newOrder.splice(source.index, 1);
                newOrder.splice(destination.index, 0, movedId);
                sourceCol.taskOrderIds = newOrder;
            } else {
                const sourceOrder = Array.from(sourceCol.taskOrderIds.map(id => String(id)));
                sourceOrder.splice(source.index, 1);
                sourceCol.taskOrderIds = sourceOrder;

                const destOrder = Array.from(destCol.taskOrderIds.map(id => String(id)));
                destOrder.splice(destination.index, 0, draggableId);
                destCol.taskOrderIds = destOrder;
            }

            return newColumns;
        });

        if (sourceColId !== destColId) {
            setTasks(prevTasks =>
                prevTasks.map(t =>
                    String(t._id) === String(draggableId)
                        ? { ...t, columnId: destColId }
                        : t
                )
            );
        }

        try {
            await moveTask(draggableId, {
                sourceColumnId: sourceColId,
                destColumnId: destColId,
                destinationIndex: destination.index
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật vị trí Task trên server:", error);
            fetchBoardData();
        }
    };

    const handleOpenCreateModal = (columnId = '', isFixed = false) => {
        setNewTaskColumnId(columnId || (columns[0]?._id || ''));
        setIsColumnFixed(isFixed);
        resetTaskForm();
        setActiveModal('quickCreateTaskModal');
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !newTaskColumnId) {
            alert('Vui lòng nhập tên công việc và chọn cột!');
            return;
        }

        try {
            setIsSubmitting(true);
            const cleanMembers = selectedMembers.filter(id => Boolean(id));

            const payload = {
                title: newTaskTitle,
                description: newTaskDesc,
                columnId: newTaskColumnId,
                projectId: activeProjectId,
                priority: newTaskPriority,
                date: newTaskDate ? new Date(newTaskDate) : new Date(),
                assignees: cleanMembers,
                members: cleanMembers
            };

            await createTask(payload);
            await fetchBoardData();
            closeModal();
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

                <div className="project-header">
                    <div className="project-header-top">
                        <div>
                            <div className="project-title-row">
                                <span className="project-color-dot" style={{ background: project?.color || '#4f46e5' }}></span>
                                <h1>{project?.name || 'Dự án'}</h1>
                            </div>
                            <p className="page-subtitle">{project?.description}</p>

                            <div className="project-meta-row">
                                <span className="project-meta-item">👥 {memberList.length} thành viên</span>
                                <span className="project-meta-item">📋 {tasks.length} task</span>
                                <span className="project-meta-item">📅 Hạn: {formattedDueDate}</span>
                            </div>
                        </div>
                        <Link to={`/projectsetting/${activeProjectId}`} className="icon-btn icon-btn-outline">
                            <Settings className="icon" />
                        </Link>
                    </div>
                    <nav className="project-tabs">
                        <Link to={`/projectboard/${activeProjectId}`} className="project-tab active">Board</Link>
                        <Link to={`/projectlist/${activeProjectId}`} className="project-tab">List</Link>
                        <Link to={`/projectcalendar/${activeProjectId}`} className="project-tab">Calendar</Link>
                        <Link to={`/projectactivity/${activeProjectId}`} className="project-tab">Activity</Link>
                    </nav>
                </div>

                <main className="page-content">
                    <div className="filter-bar" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div className="input-icon-wrap" style={{ width: '220px', flexShrink: 0 }}>
                            <span className="input-icon">🔍</span>
                            <input className="input" placeholder="Search..." style={{ width: '100%' }} />
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ marginLeft: 'auto', flexShrink: 0 }}
                            onClick={() => handleOpenCreateModal('', false)}
                        >
                            + Add Task
                        </button>
                    </div>

                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <div className="board scroll-x" id="kanbanBoard">
                            {columns.map((column) => {
                                const columnTasks = getSortedTasksForColumn(column);
                                return (
                                    <div className="board-column" key={column._id}>
                                        <div className="board-column-header">
                                            <span className="board-column-title">{column.name || column.title}</span>
                                            <span className="board-column-count">{columnTasks.length}</span>
                                            <button
                                                className="btn-icon"
                                                style={{ marginLeft: 'auto' }}
                                                onClick={() => handleOpenCreateModal(column._id, true)}
                                                title="Thêm task vào cột này"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <Droppable droppableId={String(column._id)}>
                                            {(provided, snapshot) => (
                                                <div
                                                    className="board-column-body"
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    style={{
                                                        minHeight: '150px',
                                                        backgroundColor: snapshot.isDraggingOver ? '#f1f5f9' : 'transparent',
                                                        transition: 'background-color 0.2s ease',
                                                        borderRadius: '8px'
                                                    }}
                                                >
                                                    {columnTasks.length === 0 ? (
                                                        <div className="empty-state" style={{ padding: '24px 0' }}>
                                                            <div className="empty-state-desc">Chưa có công việc</div>
                                                        </div>
                                                    ) : (
                                                        columnTasks.map((task, index) => {
                                                            const taskDueDateFormatted = task.date
                                                                ? new Date(task.date).toLocaleDateString('vi-VN')
                                                                : 'N/A';
                                                            const assignees = Array.isArray(task.assignees) ? task.assignees : [];

                                                            return (
                                                                <Draggable
                                                                    key={String(task._id)}
                                                                    draggableId={String(task._id)}
                                                                    index={index}
                                                                >
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            className="task-card"
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            onClick={() => handleOpenTaskDrawer(task._id)}
                                                                            style={{
                                                                                ...provided.draggableProps.style,
                                                                                opacity: snapshot.isDragging ? 0.8 : 1,
                                                                                boxShadow: snapshot.isDragging
                                                                                    ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                                                                    : 'none',
                                                                                cursor: 'pointer'
                                                                            }}
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

                                                                                {assignees.length > 0 && (
                                                                                    <div className="task-assignees-group">
                                                                                        {assignees.map((assignee, aIdx) => {
                                                                                            const userInfo = getUserInfo(assignee, memberList);
                                                                                            const name = typeof userInfo === 'object'
                                                                                                ? (userInfo.username || userInfo.name || userInfo.email || '')
                                                                                                : '';
                                                                                            const assigneeId = typeof assignee === 'object'
                                                                                                ? (assignee._id || assignee.id || aIdx)
                                                                                                : assignee;

                                                                                            return (
                                                                                                <div
                                                                                                    key={assigneeId}
                                                                                                    className="task-assignee-avatar"
                                                                                                    title={name || 'User'}
                                                                                                >
                                                                                                    {getInitials(name)}
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            );
                                                        })
                                                    )}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>

                                        <button
                                            className="add-task-btn"
                                            style={{ width: '260px' }}
                                            onClick={() => handleOpenCreateModal(column._id, true)}
                                        >
                                            + Add Task
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </DragDropContext>
                </main>
            </div>

            {/* TASK DRAWER CHI TIẾT & CHỈNH SỬA TASK */}
            <TaskDrawer
                taskId={selectedTaskId}
                isDrawerOpen={isDrawerOpen}
                handleCloseDrawer={handleCloseTaskDrawer}
                columns={columns}
                projectMembers={memberList}
                onTaskUpdated={handleTaskUpdatedFromDrawer}
                onTaskDeleted={handleTaskDeletedFromDrawer}
            />

            {/* MODAL TẠO TASK */}
            {activeModal === 'quickCreateTaskModal' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleCreateTask}>
                            <div className="modal-header">
                                <h2>Add Task</h2>
                                <button type="button" className="btn-icon" onClick={closeModal}>✕</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Title *</label>
                                    <input
                                        className="input"
                                        placeholder="e.g: My task"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Column *</label>
                                    <select
                                        className="select"
                                        value={newTaskColumnId}
                                        onChange={(e) => setNewTaskColumnId(e.target.value)}
                                        disabled={isColumnFixed}
                                        style={{
                                            backgroundColor: isColumnFixed ? '#f1f5f9' : '#ffffff',
                                            cursor: isColumnFixed ? 'not-allowed' : 'pointer',
                                            opacity: isColumnFixed ? 0.8 : 1
                                        }}
                                        required
                                    >
                                        {columns.map((col) => (
                                            <option key={col._id} value={col._id}>{col.name || col.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Due Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newTaskDate}
                                        onChange={(e) => setNewTaskDate(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Priority</label>
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
                                    <label className="form-label">
                                        Assignees {selectedMembers.length > 0 && `(${selectedMembers.length} selected)`}
                                    </label>
                                    <div className="card" style={{ maxHeight: '144px', overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {memberList.length === 0 ? (
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '4px' }}>
                                                Dự án chưa có thành viên nào.
                                            </p>
                                        ) : (
                                            memberList.map((member, idx) => {
                                                const memberId = typeof member === 'object' ? (member._id || member.id) : member;
                                                const displayName = typeof member === 'object' ? (member.username || member.name || member.email || 'User') : 'User';
                                                const initials = getInitials(displayName);

                                                return (
                                                    <label key={memberId || idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px', borderRadius: '6px', cursor: 'pointer' }}>
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox"
                                                            checked={selectedMembers.includes(memberId)}
                                                            onChange={() => toggleMemberSelection(memberId)}
                                                        />
                                                        <span className="avatar avatar-xs" style={{ background: '#4f46e5', color: '#fff', fontSize: '11px', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {initials}
                                                        </span>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontSize: '14px', fontWeight: 500 }}>{displayName}</span>
                                                        </div>
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="textarea"
                                        value={newTaskDesc}
                                        onChange={(e) => setNewTaskDesc(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}