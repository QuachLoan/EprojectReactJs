const API_BASE_URL = 'http://localhost:3000/api'; // Thay bằng URL API của bạn

// Hàm xử lý Response chung
const handleResponse = async (res) => {
    if (!res.ok) {
        if (res.status === 401) {
            // Token hết hạn hoặc không hợp lệ -> Xóa token và về login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi ${res.status}: Không thể thực hiện yêu cầu`);
    }
    return res.json();
};

// Hàm bổ trợ lấy Headers đính kèm Token
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// ==================== PROJECTS ====================

export const fetchProjects = async () => {
    const res = await fetch(`${API_BASE_URL}/project`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

// src/api.jsx

export const createQuickTask = async (taskData) => {
    // Thay đổi URL API tương ứng với Backend của bạn
    const response = await fetch('/api/task', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData)
    });
    if (!response.ok) {
        throw new Error('Lỗi khi tạo task nhanh');
    }

    return await response.json();
};

export const fetchProjectById = async (id) => {
    const res = await fetch(`${API_BASE_URL}/project/${id}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const createProject = async (projectData) => {
    const res = await fetch(`${API_BASE_URL}/project`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData)
    });
    return handleResponse(res);
};

export const fetchMembersByProject = async (projectId) => {
    const res = await fetch(`${API_BASE_URL}/project/${projectId}/user`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const fetchMembers = async () => {
    const res = await fetch(`${API_BASE_URL}/user`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const fetchColumns = async (projectId) => {
    const res = await fetch(`${API_BASE_URL}/project/${projectId}/column`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const fetchColumnsByProject = async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/column/project/${projectId}`,{
        headers: getAuthHeaders()
    });
    return await response.json();
};

// ==================== TASKS ====================

export const fetchTasksByProject = async (projectId) => {
    const res = await fetch(`${API_BASE_URL}/task/project/${projectId}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const fetchTaskById = async (taskId) => {
    const res = await fetch(`${API_BASE_URL}/task/${taskId}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const createTask = async (taskData) => {
    const res = await fetch(`${API_BASE_URL}/task`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData)
    });
    return handleResponse(res);
};

export const moveTask = async (taskId, updateData) => {
    const res = await fetch(`${API_BASE_URL}/task/${taskId}/move`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
    });
    return handleResponse(res);
};

export const updateTask = async (taskId, fields) => {
    const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
        method: 'PUT', // Hoặc 'PATCH' tùy cấu hình Backend của bạn
        headers: getAuthHeaders(),
        body: JSON.stringify(fields)
    });
    return handleResponse(response);
};

export const deleteTask = async (taskId) => {
    const res = await fetch(`${API_BASE_URL}/task/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

// ==================== CHECKLIST ====================

export const addChecklistItem = async (taskId, text) => {
    const res = await fetch(`${API_BASE_URL}/task/${taskId}/checklist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text })
    });
    return handleResponse(res);
};

export const toggleChecklistItem = async (taskId, itemId, completed) => {
    const res = await fetch(`${API_BASE_URL}/task/${taskId}/checklist/${itemId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ completed })
    });
    return handleResponse(res);
};

// ==================== COMMENTS & ACTIVITIES ====================

export const fetchTaskComments = async (taskId) => {
    const res = await fetch(`${API_BASE_URL}/task/${taskId}/comments`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const addComment = async (taskId, text) => {
    const res = await fetch(`${API_BASE_URL}/task/${taskId}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text })
    });
    return handleResponse(res);
};

export const fetchTaskActivities = async (taskId) => {
    const res = await fetch(`${API_BASE_URL}/task/${taskId}/activity`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};



