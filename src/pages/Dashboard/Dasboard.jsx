import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { Loader2, Users } from "lucide-react";

// Import API functions
import { fetchProjects, fetchTasksByProject, fetchMembersByProject } from "../../../api.jsx";

// Import sub-components
import KPI from "./KPI/KPI";

export default function Dashboard() {
    const [projectProgressData, setProjectProgressData] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(true);

    // States cho Bảng Phân Bổ Nguồn Lực
    const [resourceAllocation, setResourceAllocation] = useState([]);
    const [loadingResources, setLoadingResources] = useState(true);

    // Helper hàm hỗ trợ lấy tên hiển thị
    const getMemberDisplayName = (member) => {
        if (!member) return "User";
        if (typeof member === "object") {
            if (member.userId && typeof member.userId === "object") {
                return member.userId.username || member.userId.name || member.userId.email || "User";
            }
            return member.username || member.name || member.email || "User";
        }
        return "User";
    };

    const getInitials = (name) => {
        if (!name) return "??";
        const words = String(name).trim().split(/\s+/);
        if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoadingProgress(true);
                setLoadingResources(true);

                // 1. Fetch toàn bộ danh sách Projects
                const data = await fetchProjects();
                const projectsList = Array.isArray(data) ? data : data?.data || [];

                const userMap = {}; // Lưu trữ thông tin và số task của từng user
                const progressList = [];

                // 2. Duyệt qua từng Project để tính Progress & gom nhóm Users + Tasks
                await Promise.all(
                    projectsList.map(async (project) => {
                        const pId = project._id || project.id;

                        // --- Lấy danh sách Assignees/Members của Project này ---
                        let projectMembers = [];
                        try {
                            const pMembersData = await fetchMembersByProject(pId);
                            projectMembers = Array.isArray(pMembersData)
                                ? pMembersData
                                : pMembersData?.data || pMembersData?.members || [];
                        } catch (err) {
                            projectMembers = Array.isArray(project.assignees)
                                ? project.assignees
                                : Array.isArray(project.members)
                                    ? project.members
                                    : [];
                        }

                        // Lưu các user thu thập được vào userMap
                        projectMembers.forEach((member) => {
                            const uId =
                                typeof member === "object"
                                    ? member._id || member.id || member.userId?._id || member.userId
                                    : member;

                            if (uId && !userMap[String(uId)]) {
                                userMap[String(uId)] = {
                                    id: String(uId),
                                    name: getMemberDisplayName(member),
                                    email:
                                        typeof member === "object"
                                            ? member.email || member.userId?.email || ""
                                            : "",
                                    role:
                                        typeof member === "object"
                                            ? member.role || member.userId?.role || "Member"
                                            : "Member",
                                    totalTasks: 0,
                                    completedTasks: 0,
                                    inProgressTasks: 0
                                };
                            }
                        });

                        // --- Fetch danh sách Tasks của Project này ---
                        let percent = 0;
                        try {
                            const tasksData = await fetchTasksByProject(pId);
                            const tasksList = Array.isArray(tasksData)
                                ? tasksData
                                : tasksData?.data || [];

                            // Tính % tiến độ project
                            if (tasksList.length > 0) {
                                const doneTasksCount = tasksList.filter((task) => {
                                    if (task.columnId && typeof task.columnId === "object") {
                                        return task.columnId.position === 3;
                                    }
                                    return task.position === 3;
                                }).length;

                                percent = Math.round((doneTasksCount / tasksList.length) * 100);
                            }

                            // Đếm số task gán cho từng user
                            tasksList.forEach((task) => {
                                const isDone =
                                    (task.columnId &&
                                        typeof task.columnId === "object" &&
                                        task.columnId.position === 3) ||
                                    task.position === 3;

                                // Lấy danh sách assignee của task
                                const taskAssignees = Array.isArray(task.assignees)
                                    ? task.assignees
                                    : task.assignee
                                        ? [task.assignee]
                                        : [];

                                taskAssignees.forEach((assignee) => {
                                    const assigneeId = String(
                                        typeof assignee === "object"
                                            ? assignee._id || assignee.id || assignee.userId
                                            : assignee
                                    );

                                    // Nếu chưa có user này trong userMap thì khởi tạo tạm
                                    if (!userMap[assigneeId]) {
                                        userMap[assigneeId] = {
                                            id: assigneeId,
                                            name: getMemberDisplayName(assignee),
                                            email: typeof assignee === "object" ? assignee.email || "" : "",
                                            role: "Member",
                                            totalTasks: 0,
                                            completedTasks: 0,
                                            inProgressTasks: 0
                                        };
                                    }

                                    userMap[assigneeId].totalTasks += 1;
                                    if (isDone) {
                                        userMap[assigneeId].completedTasks += 1;
                                    } else {
                                        userMap[assigneeId].inProgressTasks += 1;
                                    }
                                });
                            });
                        } catch (err) {
                            percent = 0;
                        }

                        progressList.push({
                            name: project.name || "Untitled",
                            progress: percent,
                            color: project.color || "#4f46e5"
                        });
                    })
                );

                setProjectProgressData(progressList);
                setResourceAllocation(Object.values(userMap));
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu Dashboard:", error);
            } finally {
                setLoadingProgress(false);
                setLoadingResources(false);
            }
        };

        loadDashboardData();
    }, []);

    return (
        <main className="page-content">
            <div className="page-content-inner stack">
                <div>
                    <h1>Welcome back, Cao</h1>
                    <p className="page-subtitle">
                        Here's what's happening across your workspace today.
                    </p>
                </div>

                {/* Khối KPI */}
                <KPI />

                {/* Biểu đồ Tiến độ Dự án */}
                <div
                    className="card"
                    style={{
                        padding: "20px",
                        background: "#fff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0"
                    }}
                >
                    <h3
                        style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            marginBottom: "16px",
                            color: "#0f172a"
                        }}
                    >
                        Project Progress (%)
                    </h3>

                    {loadingProgress ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "260px"
                            }}
                        >
                            <Loader2 className="animate-spin" size={28} style={{ color: "#4f46e5" }} />
                        </div>
                    ) : projectProgressData.length === 0 ? (
                        <p style={{ color: "#6b7280", textAlign: "center", padding: "32px 0" }}>
                            Chưa có dữ liệu dự án.
                        </p>
                    ) : (
                        <div style={{ width: "100%", height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={projectProgressData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} unit="%" />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={120}
                                        tick={{ fontSize: 13 }}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${value}%`, "Progress"]}
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "none",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                        }}
                                    />
                                    <Bar dataKey="progress" radius={[0, 6, 6, 0]} barSize={20}>
                                        {projectProgressData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Bảng Phân Bổ Nguồn Lực (Resource Allocation) */}
                <div
                    className="card"
                    style={{
                        padding: "20px",
                        background: "#fff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "16px"
                        }}
                    >
                        <Users size={20} style={{ color: "#4f46e5" }} />
                        <h3
                            style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#0f172a",
                                margin: 0
                            }}
                        >
                            Resource Allocation (Task Distribution)
                        </h3>
                    </div>

                    {loadingResources ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "40px 0"
                            }}
                        >
                            <Loader2 className="animate-spin" size={28} style={{ color: "#4f46e5" }} />
                        </div>
                    ) : resourceAllocation.length === 0 ? (
                        <p style={{ color: "#6b7280", textAlign: "center", padding: "32px 0" }}>
                            Chưa có dữ liệu thành viên.
                        </p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    textAlign: "left",
                                    fontSize: "14px"
                                }}
                            >
                                <thead>
                                <tr style={{ borderBottom: "2px solid #f1f5f9", color: "#64748b" }}>
                                    <th style={{ padding: "12px 8px" }}>User</th>
                                    <th style={{ padding: "12px 8px" }}>Role</th>
                                    <th style={{ padding: "12px 8px", textAlign: "center" }}>
                                        Active Tasks
                                    </th>
                                    <th style={{ padding: "12px 8px", textAlign: "center" }}>
                                        Done Tasks
                                    </th>
                                    <th style={{ padding: "12px 8px", textAlign: "center" }}>
                                        Total Assigned
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {resourceAllocation.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <td
                                            style={{
                                                padding: "12px 8px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px"
                                            }}
                                        >
                        <span
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "#4f46e5",
                                color: "#fff",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 600,
                                fontSize: "12px"
                            }}
                        >
                          {getInitials(item.name)}
                        </span>
                                            <div>
                                                <div style={{ fontWeight: 600, color: "#0f172a" }}>
                                                    {item.name}
                                                </div>
                                                {item.email && (
                                                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                                                        {item.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: "12px 8px", color: "#475569" }}>
                                            {item.role}
                                        </td>
                                        <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <span
                            style={{
                                padding: "2px 8px",
                                borderRadius: "12px",
                                background: "#fef3c7",
                                color: "#d97706",
                                fontWeight: 600,
                                fontSize: "12px"
                            }}
                        >
                          {item.inProgressTasks}
                        </span>
                                        </td>
                                        <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <span
                            style={{
                                padding: "2px 8px",
                                borderRadius: "12px",
                                background: "#d1fae5",
                                color: "#059669",
                                fontWeight: 600,
                                fontSize: "12px"
                            }}
                        >
                          {item.completedTasks}
                        </span>
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px 8px",
                                                textAlign: "center",
                                                fontWeight: "700",
                                                color: "#0f172a"
                                            }}
                                        >
                                            {item.totalTasks}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}