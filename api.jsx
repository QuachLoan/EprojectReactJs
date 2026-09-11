const API_BASE_URL = 'http://localhost:3000/api';

const handleResponse = async (res) => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Đã có lỗi xảy ra từ server');
    }
    return res.json();
};

// ==========================================
// 1. PROJECTS API
// ==========================================

export const fetchProjects = async () => {
    const res = await fetch(`${API_BASE_URL}/projects`);
    return handleResponse(res);
};

export const fetchProjectById = async (projectId) => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`);
    return handleResponse(res);
};

export const createProject = async (projectData) => {
    const res = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    });
    return handleResponse(res);
};

export const updateProject = async (projectId, projectData) => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    });
    return handleResponse(res);
};

export const deleteProject = async (projectId) => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE'
    });
    return handleResponse(res);
};

// ==========================================
// 2. MEMBERS API
// ==========================================

export const fetchMembers = async (projectId) => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/members`);
    return handleResponse(res);
};

export const addMemberToProject = async (projectId, email, role = 'member') => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
    });
    return handleResponse(res);
};

export const removeMemberFromProject = async (projectId, memberId) => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE'
    });
    return handleResponse(res);
};

// ==========================================
// 3. COLUMNS API
// ==========================================

export const fetchColumns = async (projectId) => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/columns`);
    return handleResponse(res);
};

export const createColumn = async (projectId, columnData) => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(columnData)
    });
    return handleResponse(res);
};

export const updateColumn = async (columnId, columnData) => {
    const res = await fetch(`${API_BASE_URL}/columns/${columnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(columnData)
    });
    return handleResponse(res);
};

export const deleteColumn = async (columnId) => {
    const res = await fetch(`${API_BASE_URL}/columns/${columnId}`, {
        method: 'DELETE'
    });
    return handleResponse(res);
};

// ==========================================
// 4. LABELS API
// ==========================================

export const fetchLabels = async (projectId) => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/labels`);
    return handleResponse(res);
};

export const createLabel = async (projectId, labelData) => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(labelData)
    });
    return handleResponse(res);
};

export const deleteLabel = async (labelId) => {
    const res = await fetch(`${API_BASE_URL}/labels/${labelId}`, {
        method: 'DELETE'
    });
    return handleResponse(res);
};

// ==========================================
// 5. TASKS API
// ==========================================

export const fetchTasksByProject = async (projectId) => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`);
    return handleResponse(res);
};

export const fetchTaskById = async (taskId) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
    return handleResponse(res);
};

export const createTask = async (taskData) => {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
    return handleResponse(res);
};

export const updateTask = async (taskId, taskData) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
    return handleResponse(res);
};

export const moveTask = async (taskId, { columnId, position }) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId, position })
    });
    return handleResponse(res);
};

export const deleteTask = async (taskId) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE'
    });
    return handleResponse(res);
};

// ==========================================
// 6. CHECKLISTS API (MỚI)
// ==========================================

export const addChecklistItem = async (taskId, text) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, completed: false })
    });
    return handleResponse(res);
};

export const toggleChecklistItem = async (taskId, itemId, completed) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/checklists/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
    });
    return handleResponse(res);
};

export const deleteChecklistItem = async (taskId, itemId) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/checklists/${itemId}`, {
        method: 'DELETE'
    });
    return handleResponse(res);
};

// ==========================================
// 7. COMMENTS API (MỚI)
// ==========================================

export const fetchTaskComments = async (taskId) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`);
    return handleResponse(res);
};

export const addComment = async (taskId, content) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
    return handleResponse(res);
};

export const deleteComment = async (commentId) => {
    const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE'
    });
    return handleResponse(res);
};

// ==========================================
// 8. ACTIVITIES / LOGS API (MỚI)
// ==========================================

export const fetchProjectActivities = async (projectId) => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/activities`);
    return handleResponse(res);
};

export const fetchTaskActivities = async (taskId) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/activities`);
    return handleResponse(res);
};