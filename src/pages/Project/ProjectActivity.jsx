import React, { useEffect, useState } from 'react';
import {
    CheckCircle2,
    MessageSquare,
    ArrowRightLeft,
    PlusCircle,
    UserPlus,
    Search,
    Plus,
    Settings,
    LayoutGrid,
    List,
    Calendar,
    Activity,
    X,
    ListPlus,
    FolderPlus,
    KanbanSquare,
    LayoutDashboard,
    ListTodo,
    FolderKanban,
    Users,
    ShieldCheck,
    Flag,
    ChevronsLeft,
    UsersRound,
    ListChecks,
    CalendarClock,
    Loader2
} from 'lucide-react';

// Import các hàm gọi API từ file api.js của bạn
import { fetchActivities, createQuickTask, createProject } from './api';

// Map icon & style tương ứng với từng loại action từ API
const ACTION_CONFIG = {
    completed: { icon: CheckCircle2, style: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    commented: { icon: MessageSquare, style: 'text-sky-500 bg-sky-50 border-sky-200' },
    moved: { icon: ArrowRightLeft, style: 'text-purple-600 bg-purple-50 border-purple-200' },
    created: { icon: PlusCircle, style: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    assigned: { icon: UserPlus, style: 'text-amber-500 bg-amber-50 border-amber-200' },
};

export default function ActivityLog() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // States Modals & Dropdowns
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);

    // Form States
    const [taskTitle, setTaskTitle] = useState('');
    const [taskColumn, setTaskColumn] = useState('Todo');

    // Gọi API lấy Activity Log khi mount component
    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            setLoading(true);
            const data = await fetchActivities();
            setActivities(data);
        } catch (err) {
            setError('Khổng thể tải danh sách hoạt động.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle Tạo Task Mới qua API
    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await createQuickTask({ title: taskTitle, column: taskColumn });
            setIsTaskModalOpen(false);
            setTaskTitle('');
            loadActivities(); // Reload lại timeline sau khi tạo
        } catch (err) {
            console.error('Lỗi khi tạo task:', err);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2 font-bold text-lg text-indigo-600">
                        <KanbanSquare className="w-6 h-6" />
                        <span>TeamFlow</span>
                    </div>
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Workspace</p>
                        <p className="text-sm font-semibold text-gray-700">Aptech Capstone Team</p>
                    </div>
                    <nav className="p-3 space-y-1">
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                            <ListTodo className="w-4 h-4" /> My Tasks
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg">
                            <FolderKanban className="w-4 h-4" /> Projects
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Users className="w-4 h-4" /> Members
                        </a>
                        <p className="px-3 pt-4 pb-1 text-xs uppercase text-gray-400 font-semibold tracking-wider">Admin</p>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                            <ShieldCheck className="w-4 h-4" /> Users
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Flag className="w-4 h-4" /> Moderation
                        </a>
                    </nav>
                </div>
                <div className="p-3 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 w-full px-2 py-1.5 rounded">
                        <ChevronsLeft className="w-4 h-4" /> Collapse
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-gray-100 text-gray-400 px-3 py-1.5 rounded-lg w-72 text-sm">
                        <Search className="w-4 h-4" />
                        <span className="flex-1">Search anything...</span>
                        <kbd className="bg-white px-1.5 py-0.5 text-xs text-gray-500 border rounded shadow-sm">Ctrl K</kbd>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Create
                            </button>
                            {isCreateDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 text-sm">
                                    <button
                                        onClick={() => { setIsTaskModalOpen(true); setIsCreateDropdownOpen(false); }}
                                        className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-gray-50 text-gray-700"
                                    >
                                        <ListPlus className="w-4 h-4" /> New Task
                                    </button>
                                    <button
                                        onClick={() => { setIsProjectModalOpen(true); setIsCreateDropdownOpen(false); }}
                                        className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-gray-50 text-gray-700"
                                    >
                                        <FolderPlus className="w-4 h-4" /> New Project
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center cursor-pointer">
                            CS
                        </div>
                    </div>
                </header>

                {/* Project Header Info */}
                <div className="bg-white border-b border-gray-200 px-8 pt-6 pb-0">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
                                <h1 className="text-xl font-bold text-gray-900">TeamFlow Platform</h1>
                            </div>
                            <p className="text-sm text-gray-500 max-w-xl">Kanban team task management system — the capstone product.</p>
                            <div className="flex items-center gap-6 mt-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><UsersRound className="w-3.5 h-3.5" /> 4 members</span>
                                <span className="flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" /> 14 tasks</span>
                                <span className="flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" /> Due Sep 15, 2026</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-1">
                                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center ring-2 ring-white">CS</span>
                                <span className="w-7 h-7 rounded-full bg-sky-500 text-white text-xs font-semibold flex items-center justify-center ring-2 ring-white">QL</span>
                                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center ring-2 ring-white">NL</span>
                                <span className="w-7 h-7 rounded-full bg-pink-600 text-white text-xs font-semibold flex items-center justify-center ring-2 ring-white">KN</span>
                            </div>
                            <button className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-6 text-sm border-t border-gray-100 pt-3">
                        <a href="#" className="flex items-center gap-1.5 py-2 text-gray-500 border-b-2 border-transparent hover:text-gray-800">
                            <LayoutGrid className="w-4 h-4" /> Board
                        </a>
                        <a href="#" className="flex items-center gap-1.5 py-2 text-gray-500 border-b-2 border-transparent hover:text-gray-800">
                            <List className="w-4 h-4" /> List
                        </a>
                        <a href="#" className="flex items-center gap-1.5 py-2 text-gray-500 border-b-2 border-transparent hover:text-gray-800">
                            <Calendar className="w-4 h-4" /> Calendar
                        </a>
                        <a href="#" className="flex items-center gap-1.5 py-2 font-medium text-indigo-600 border-b-2 border-indigo-600">
                            <Activity className="w-4 h-4" /> Activity
                        </a>
                    </div>
                </div>

                {/* Timeline Dynamic Area */}
                <main className="flex-1 p-8">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Activity Log</h2>

                        {loading ? (
                            <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" /> Đang tải dữ liệu...
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
                        ) : (
                            <div className="relative border-l-2 border-gray-200 ml-4 space-y-6">
                                {activities.map((item) => {
                                    const config = ACTION_CONFIG[item.type] || ACTION_CONFIG.created;
                                    const IconComponent = config.icon;

                                    return (
                                        <div key={item.id} className="relative pl-6">
                      <span className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${config.style}`}>
                        <IconComponent className="w-4 h-4" />
                      </span>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-800">
                                                        <strong className="font-semibold">{item.userName}</strong> {item.actionText}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{item.timeAgo}</p>
                                                </div>
                                                <span
                                                    className="w-6 h-6 rounded-full text-[10px] font-semibold text-white flex items-center justify-center"
                                                    style={{ backgroundColor: item.userColor || '#4f46e5' }}
                                                >
                          {item.userInitials}
                        </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Quick Create Task Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <form onSubmit={handleCreateTask} className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">Create Task</h3>
                            <button type="button" onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    placeholder="e.g. Fix pagination bug"
                                    className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-indigo-600"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Column</label>
                                    <select
                                        value={taskColumn}
                                        onChange={(e) => setTaskColumn(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-white"
                                    >
                                        <option value="Todo">Todo</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Review">Review</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Create Task</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}