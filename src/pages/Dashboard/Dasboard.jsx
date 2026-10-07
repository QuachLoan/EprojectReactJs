import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
    Legend
} from "recharts";
import { Loader2, Users } from "lucide-react";

// Import API functions
import { fetchProjects, fetchTasksByProject, fetchMembersByProject } from "../../../api.jsx";

// Import sub-components
import KPI from "./KPI/KPI";

// ==========================================
// 1. Tooltip tùy chỉnh cho Burndown Chart
// ==========================================
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded shadow-md text-sm">
                <p className="font-semibold text-gray-700 mb-1">{label}</p>
                {payload[0] && (
                    <p className="text-slate-500">
                        Kế hoạch: <span className="font-bold">{payload[0].value} pts</span>
                    </p>
                )}
                {payload[1] && payload[1].value !== null && payload[1].value !== undefined && (
                    <p className="text-emerald-600">
                        Thực tế còn lại: <span className="font-bold">{payload[1].value} pts</span>
                    </p>
                )}
            </div>
        );
    }
    return null;
};

// ==========================================
// 2. Component WeeklyBurndownChart (Có dropdown bộ lọc)
// ==========================================
function WeeklyBurndownChart({ projectId, projects, onSelectProject }) {
    const [chartData, setChartData] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBurndownData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem("token"); 

                const response = await fetch(`http://localhost:3000/api/task/project/${projectId}/epic-burndown`, {
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` })
                    }
                });

                if (!response.ok) {
                    throw new Error("Không thể tải dữ liệu Burndown Chart");
                }

                const data = await response.json();
                setChartData(data.weeks || []);
                setTotalPoints(data.totalPoints || 0);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchBurndownData();
        }
    }, [projectId]);


    return (
        <div className="w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            {/* Header + Bộ lọc Dropdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Weekly Burndown Chart</h3>
                    <p className="text-sm text-gray-500">Theo dõi tiến độ Story Points theo từng tuần</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Bộ lọc chọn Project */}
                    {projects && projects.length > 0 && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Dự án:</label>
                            <select
                                value={projectId || ""}
                                onChange={(e) => onSelectProject(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none font-medium"
                            >
                                {projects.map((proj) => {
                                    const pId = proj._id || proj.id;
                                    return (
                                        <option key={pId} value={pId}>
                                            {proj.name || "Untitled Project"}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}

                    <div className="text-right">
                        <span className="text-xs text-gray-400 block">Tổng Story Points</span>
                        <span className="text-xl font-extrabold text-indigo-600">{totalPoints} pts</span>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            {loading ? (
                <div className="w-full h-80 flex items-center justify-center bg-gray-50/50 rounded-xl">
                    <Loader2 className="animate-spin text-indigo-600" size={28} />
                    <span className="text-gray-400 text-sm ml-2">Đang tải dữ liệu biểu đồ...</span>
                </div>
            ) : error ? (
                <div className="w-full h-80 flex items-center justify-center bg-red-50/50 rounded-xl text-red-500 text-sm">
                    {error}
                </div>
            ) : (
<div style={{ width: "100%", height: "320px" }}>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
      <XAxis
        dataKey="week"
        tick={{ fill: "#6b7280", fontSize: 12 }}
        axisLine={{ stroke: "#e5e7eb" }}
      />
      <YAxis
        domain={[0, totalPoints > 0 ? totalPoints : "auto"]}
        tick={{ fill: "#6b7280", fontSize: 12 }}
        axisLine={{ stroke: "#e5e7eb" }}
        label={{ value: "Points còn lại", angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 12 }}
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: "10px", fontSize: "13px" }} />

      <Line
        name="Tiến độ kế hoạch"
        type="linear"
        dataKey="planned"
        stroke="#94a3b8"
        strokeDasharray="5 5"
        strokeWidth={2}
        dot={{ r: 3, fill: "#94a3b8" }}
      />
<Line
  name="Tiến độ thực tế"
  type="monotone" // Hoặc "linear" để đường nối thẳng
  dataKey="actual"
  stroke="#10b981"
  strokeWidth={3}
  dot={{ r: 4, fill: "#10b981" }}
  activeDot={{ r: 7 }}
  connectNulls={true} // Bỏ qua các giá trị null để nối các điểm hợp lệ với nhau
/>
    </LineChart>
  </ResponsiveContainer>
</div>
            )}
        </div>
    );
}

// ==========================================
// 3. Component Chính Dashboard (Export Default)
// ==========================================
export default function Dashboard() {
    const [projectProgressData, setProjectProgressData] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(true);

    const [resourceAllocation, setResourceAllocation] = useState([]);
    const [loadingResources, setLoadingResources] = useState(true);

    // Danh sách toàn bộ projects
    const [projectsList, setProjectsList] = useState([]);
    // ID của project hiện tại dùng cho Burndown Chart
    const [selectedProjectId, setSelectedProjectId] = useState(null);

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

                const data = await fetchProjects();
                const fetchedProjects = Array.isArray(data) ? data : data?.data || [];
                setProjectsList(fetchedProjects);

                if (fetchedProjects.length > 0) {
                    const firstId = fetchedProjects[0]._id || fetchedProjects[0].id;
                    setSelectedProjectId(firstId);
                }

                const userMap = {};
                const progressList = [];

                await Promise.all(
                    fetchedProjects.map(async (project) => {
                        const pId = project._id || project.id;

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

                        projectMembers.forEach((member) => {
                            const uId =
                                typeof member === "object"
                                    ? member._id || member.id || member.userId?._id || member.userId
                                    : member;

                            if (uId && !userMap[String(uId)]) {
                                userMap[String(uId)] = {
                                    id: String(uId),
                                    name: getMemberDisplayName(member),
                                    email: typeof member === "object" ? member.email || member.userId?.email || "" : "",
                                    role: typeof member === "object" ? member.role || member.userId?.role || "Member" : "Member",
                                    totalTasks: 0,
                                    completedTasks: 0,
                                    inProgressTasks: 0
                                };
                            }
                        });

                        let percent = 0;
                        try {
                            const tasksData = await fetchTasksByProject(pId);
                            const tasksList = Array.isArray(tasksData) ? tasksData : tasksData?.data || [];

                            if (tasksList.length > 0) {
                                const doneTasksCount = tasksList.filter((task) => {
                                    if (task.columnId && typeof task.columnId === "object") {
                                        return task.columnId.position === 3;
                                    }
                                    return task.position === 3;
                                }).length;

                                percent = Math.round((doneTasksCount / tasksList.length) * 100);
                            }

                            tasksList.forEach((task) => {
                                const isDone =
                                    (task.columnId && typeof task.columnId === "object" && task.columnId.position === 3) ||
                                    task.position === 3;

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
                    <p className="page-subtitle">Here's what's happening across your workspace today.</p>
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
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#0f172a" }}>
                        Project Progress (%)
                    </h3>

                    {loadingProgress ? (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "260px" }}>
                            <Loader2 className="animate-spin" size={28} style={{ color: "#4f46e5" }} />
                        </div>
                    ) : projectProgressData.length === 0 ? (
                        <p style={{ color: "#6b7280", textAlign: "center", padding: "32px 0" }}>Chưa có dữ liệu dự án.</p>
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
                                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 13 }} />
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

                {/* Biểu đồ Weekly Burndown Chart (truyền mảng dự án & hàm đổi id vào) */}
                {selectedProjectId && (
                    <WeeklyBurndownChart
                        projectId={selectedProjectId}
                        projects={projectsList}
                        onSelectProject={(id) => setSelectedProjectId(id)}
                    />
                )}

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
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <Users size={20} style={{ color: "#4f46e5" }} />
                        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", margin: 0 }}>
                            Resource Allocation (Task Distribution)
                        </h3>
                    </div>

                    {loadingResources ? (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 0" }}>
                            <Loader2 className="animate-spin" size={28} style={{ color: "#4f46e5" }} />
                        </div>
                    ) : resourceAllocation.length === 0 ? (
                        <p style={{ color: "#6b7280", textAlign: "center", padding: "32px 0" }}>Chưa có dữ liệu thành viên.</p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid #f1f5f9", color: "#64748b" }}>
                                        <th style={{ padding: "12px 8px" }}>User</th>
                                        <th style={{ padding: "12px 8px" }}>Role</th>
                                        <th style={{ padding: "12px 8px", textAlign: "center" }}>Active Tasks</th>
                                        <th style={{ padding: "12px 8px", textAlign: "center" }}>Done Tasks</th>
                                        <th style={{ padding: "12px 8px", textAlign: "center" }}>Total Assigned</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resourceAllocation.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={{ padding: "12px 8px", display: "flex", alignItems: "center", gap: "10px" }}>
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
                                                    <div style={{ fontWeight: 600, color: "#0f172a" }}>{item.name}</div>
                                                    {item.email && <div style={{ fontSize: "12px", color: "#94a3b8" }}>{item.email}</div>}
                                                </div>
                                            </td>
                                            <td style={{ padding: "12px 8px", color: "#475569" }}>{item.role}</td>
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
                                            <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: "700", color: "#0f172a" }}>
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