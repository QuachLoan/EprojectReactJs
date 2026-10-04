import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './../../components/layout/Header/Header.jsx';
import Sidebar from './../../components/layout/Sidebar/SideBar.jsx';
import {
    fetchProjectById,
    fetchTasksByProject,
    fetchMembersByProject,
    updateProjectDetail,
    uploadProjectDocument,
    deleteProjectDocument
} from './../../../api.jsx';
import "./project.css";
import {
    Calendar,
    CalendarClock,
    LayoutGrid,
    List,
    ListChecks,
    Settings,
    UsersRound,
    Loader2,
    FileText,
    Upload,
    Trash2,
    Edit3,
    Check,
    Info
} from "lucide-react";

export default function ProjectOverview() {
    const { id: projectId } = useParams();

    // State dự án & danh sách
    const [project, setProject] = useState(null);
    const [projectMembers, setProjectMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [memberCurrentRole, setMemberRole] = useState("");

    // State cho Project Detail (Mô tả chi tiết)
    const [projectDetail, setProjectDetail] = useState("");
    const [isEditingDetail, setIsEditingDetail] = useState(false);
    const [isSavingDetail, setIsSavingDetail] = useState(false);

    // State cho Document (Tài liệu)
    const [documents, setDocuments] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Lấy thông tin user đăng nhập từ LocalStorage
    const getCurrentUser = () => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
            return {};
        }
    };

    const currentUser = getCurrentUser();
    const currentUserId = currentUser._id || currentUser.id || null;

    // Fetch vai trò user hiện tại trong hệ thống
    useEffect(() => {
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
                console.error("Không thể lấy vai trò người dùng:", err);
            }
        };
        fetchCurrentMemberRole();
    }, []);

    // Tìm thông tin thành viên dự án hiện tại
    const currentProjectMember = useMemo(() => {
        if (!currentUserId || !projectMembers.length) return null;
        return projectMembers.find(m => {
            const uId = typeof m.userId === 'object' ? (m.userId?._id || m.userId?.id) : (m.userId || m._id || m.id);
            return String(uId) === String(currentUserId);
        }) || null;
    }, [currentUserId, projectMembers]);

    // Kiểm tra quyền Manager / Admin
    const currentUserRole = currentProjectMember?.role || currentUser?.role || memberCurrentRole;
    const isAdmin = String(currentUser?.role).toLowerCase() === 'admin';
    const isManager = currentUserRole === 'Manager' || isAdmin;

    // Load dữ liệu Project, Tasks, Members khi vào trang
    useEffect(() => {
        if (!projectId) return;

        setLoading(true);
        Promise.all([
            fetchProjectById(projectId).catch(() => null),
            fetchTasksByProject(projectId).catch(() => []),
            fetchMembersByProject(projectId).catch(() => [])
        ]).then(([projectData, tasksData, membersData]) => {
            const realProject = projectData?.data || projectData || {};
            setProject(realProject);
            setProjectDetail(realProject.projectDetail || "");
            setDocuments(realProject.documents || []);
            setTasks(Array.isArray(tasksData) ? tasksData : (tasksData?.data || []));
            setProjectMembers(Array.isArray(membersData) ? membersData : (membersData?.data || []));
        }).finally(() => setLoading(false));
    }, [projectId]);

    // Lưu chỉnh sửa Chi tiết dự án (projectDetail)
    const handleSaveDetail = async () => {
        if (!isManager) return;
        try {
            setIsSavingDetail(true);
            const res = await updateProjectDetail(projectId, projectDetail);
            if (res?.project) {
                setProject(res.project);
            }
            setIsEditingDetail(false);
        } catch (error) {
            console.error("Lỗi khi lưu thông tin chi tiết dự án:", error);
        } finally {
            setIsSavingDetail(false);
        }
    };

    // Tải file trực tiếp từ máy lên Server
    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert("Vui lòng chọn một file từ máy tính!");
            return;
        }

        try {
            setIsUploading(true);

            // Chuẩn hóa ký tự Tiếng Việt (Unicode Form C - NFC)
            const normalizedFileName = selectedFile.name.normalize('NFC');
            const renamedFile = new File([selectedFile], normalizedFileName, { type: selectedFile.type });

            const res = await uploadProjectDocument(projectId, renamedFile);

            if (res?.documents) {
                setDocuments(res.documents);
                setSelectedFile(null);
                e.target.reset();
            }
        } catch (error) {
            console.error("Lỗi khi tải file:", error);
            alert(error.message || "Đã xảy ra lỗi khi tải file lên server!");
        } finally {
            setIsUploading(false);
        }
    };

    // Xóa file tài liệu
    const handleDeleteDocument = async (docId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này không?")) return;
        try {
            const res = await deleteProjectDocument(projectId, docId);
            if (res?.documents) {
                setDocuments(res.documents);
            } else {
                setDocuments(prev => prev.filter(d => String(d._id) !== String(docId)));
            }
        } catch (error) {
            console.error("Lỗi khi xóa tài liệu:", error);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '12px', color: '#6b7280' }}>
                <Loader2 className="animate-spin" size={40} style={{ color: '#4f46e5' }} />
                <span>Đang tải thông tin dự án...</span>
            </div>
        );
    }

    const formattedStartDate = (project?.startDate || project?.createdAt)
        ? new Date(project.startDate || project.createdAt).toLocaleDateString('vi-VN')
        : 'Chưa đặt';

    const formattedDueDate = (project?.date || project?.dueDate || project?.endDate)
        ? new Date(project.date || project.dueDate || project.endDate).toLocaleDateString('vi-VN')
        : 'Chưa đặt';

    return (
        <div className="app-shell">
            <Sidebar />

            <div className="app-main">
                <Header />

                {/* Header Dự Án Đồng Nhất */}
                <div className="project-header">
                    <div className="project-header-top">
                        <div>
                            <div className="project-title-row">
                                <span className="project-color-dot" style={{ background: project?.color || '#4f46e5' }}></span>
                                <h1>{project?.name || 'Dự án'}</h1>
                            </div>
                            <p className="page-subtitle">{project?.description || 'Chưa có mô tả ngắn'}</p>

                            <div className="project-meta-row">
                                <span className="project-meta-item"><UsersRound className="icon icon-sm" />{projectMembers.length} members</span>
                                <span className="project-meta-item"><ListChecks className="icon icon-sm" />{tasks.length} tasks</span>
                                <span className="project-meta-item"><Calendar className="icon icon-sm" />start date: {formattedStartDate}</span>
                                <span className="project-meta-item"><CalendarClock className="icon icon-sm" />end date: {formattedDueDate}</span>
                            </div>
                        </div>
                        <Link to={`/projectsetting/${projectId}`} className="icon-btn icon-btn-outline" style={{ cursor: 'pointer' }}>
                            <Settings className="icon" />
                        </Link>
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="project-tabs">
                        <Link to={`/projectoverview/${projectId}`} className="project-tab active">
                            <Info className="icon icon-sm" /> Overview
                        </Link>
                        <Link to={`/projectboard/${projectId}`} className="project-tab">
                            <LayoutGrid className="icon icon-sm" /> Board
                        </Link>
                        <Link to={`/projectlist/${projectId}`} className="project-tab">
                            <List className="icon icon-sm" /> Backlog
                        </Link>
                        <Link to={`/projectcalendar/${projectId}`} className="project-tab">
                            <Calendar className="icon icon-sm" /> Calendar
                        </Link>
                    </nav>
                </div>

                {/* Nội dung chính Tab Overview */}
                <main className="page-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Phần 1: Project Detail (Mô tả chi tiết dự án - Chỉ Manager được sửa) */}
                    <div className="card" style={{ padding: '20px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <FileText size={20} color="#4f46e5" /> Chi tiết dự án
                            </h3>
                            {isManager && !isEditingDetail && (
                                <button className="btn btn-outline btn-sm" onClick={() => setIsEditingDetail(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                    <Edit3 size={14} /> Chỉnh sửa
                                </button>
                            )}
                        </div>

                        {isEditingDetail ? (
                            <div>
                                <textarea
                                    className="textarea"
                                    rows="6"
                                    value={projectDetail}
                                    onChange={(e) => setProjectDetail(e.target.value)}
                                    placeholder="Nhập mô tả chi tiết, mục tiêu, yêu cầu của dự án..."
                                    style={{ width: '100%', marginBottom: '12px', padding: '10px' }}
                                />
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingDetail(false)} style={{ cursor: 'pointer' }}>
                                        Hủy
                                    </button>
                                    <button className="btn btn-primary btn-sm" onClick={handleSaveDetail} disabled={isSavingDetail} style={{ cursor: isSavingDetail ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {isSavingDetail ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                                        <span>Lưu lại</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-line', fontSize: '14px' }}>
                                {projectDetail ? projectDetail : <i style={{ color: '#9ca3af' }}>Chưa có thông tin chi tiết cho dự án này.</i>}
                            </div>
                        )}
                    </div>

                    {/* Phần 2: Tải lên & Quản lý File Tài Liệu (Documents) */}
                    <div className="card" style={{ padding: '20px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <Upload size={20} color="#4f46e5" /> Tài liệu & File đính kèm
                        </h3>

                        {/* Form chọn file từ máy để upload */}
                        <form onSubmit={handleFileUpload} style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
                            <input
                                type="file"
                                className="input"
                                style={{ flex: '1', padding: '8px' }}
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                required
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isUploading || !selectedFile}
                                style={{ cursor: (isUploading || !selectedFile) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                            >
                                {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                <span>Tải lên từ máy</span>
                            </button>
                        </form>

                        {/* Danh sách File đã đăng */}
                        <div className="document-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {documents.length === 0 ? (
                                <p style={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>Chưa có tài liệu nào được tải lên.</p>
                            ) : (
                                documents.map((doc) => {
                                    const uploaderName = typeof doc.uploadedBy === 'object'
                                        ? (doc.uploadedBy?.username || doc.uploadedBy?.email || 'User')
                                        : 'User';

                                    const isOwnerOrManager = isManager || String(doc.uploadedBy?._id || doc.uploadedBy) === String(currentUserId);

                                    return (
                                        <div key={doc._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <FileText size={24} color="#4f46e5" />
                                                <div>
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" download style={{ fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
                                                        {doc.name}
                                                    </a>
                                                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                                        Tải lên bởi: <strong>{uploaderName}</strong> • {new Date(doc.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </div>
                                            </div>

                                            {isOwnerOrManager && (
                                                <button
                                                    onClick={() => handleDeleteDocument(doc._id)}
                                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                                                    title="Xóa file"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}