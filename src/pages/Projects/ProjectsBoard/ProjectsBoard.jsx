function ProjectBoard(){
    return (
        <>
        <div class="project-header">
        <div class="project-header-top">
          <div style="min-width:0;">
            <div class="project-title-row"><span class="project-color-dot" style="background:#4f46e5"></span><h1>TeamFlow Platform</h1></div>
            <p class="page-subtitle" style="max-width:640px;">Kanban team task management system — the capstone product.</p>
            <div class="project-meta-row">
              <span class="project-meta-item"><span class="icon icon-sm" data-icon="usersRound"></span>4 members</span>
              <span class="project-meta-item"><span class="icon icon-sm" data-icon="listChecks"></span>14 tasks</span>
              <span class="project-meta-item"><span class="icon icon-sm" data-icon="calendarClock"></span>Due Sep 15, 2026</span>
            </div>
          </div>
          <div class="project-header-actions">
            <span class="avatar-group">
              <span class="avatar avatar-sm" style="background:#4f46e5">CS</span>
              <span class="avatar avatar-sm" style="background:#0ea5e9">QL</span>
              <span class="avatar avatar-sm" style="background:#16a34a">NL</span>
              <span class="avatar avatar-sm" style="background:#db2777">KN</span>
            </span>
            <a href="project-settings.html" class="icon-btn icon-btn-outline" aria-label="Project settings"><span class="icon" data-icon="settings"></span></a>
          </div>
        </div>
        <nav class="project-tabs">
          <a href="project-board.html" class="project-tab active"><span class="icon icon-sm" data-icon="layoutGrid"></span>Board</a>
          <a href="project-list.html" class="project-tab"><span class="icon icon-sm" data-icon="list"></span>List</a>
          <a href="project-calendar.html" class="project-tab"><span class="icon icon-sm" data-icon="calendar"></span>Calendar</a>
          <a href="project-activity.html" class="project-tab"><span class="icon icon-sm" data-icon="activity"></span>Activity</a>
        </nav>
      </div>

      <main class="page-content" style="display:flex; flex-direction:column;">
        <div class="filter-bar" style="flex-direction:row; align-items:center; justify-content:space-between; flex-wrap:wrap; padding:var(--space-3) var(--space-4); border-bottom:1px solid var(--color-border); margin-bottom:0;">
          <div class="filter-bar-row" style="margin:0;">
            <div class="input-icon-wrap"><span class="icon icon-sm" data-icon="search"></span><input class="input" placeholder="Search tasks…" data-filter-input="board"/></div>
            <select class="select"><option>Assignee: All</option><option>Cao Sơn</option><option>Quách Loan</option><option>Ngô Lâm</option><option>Khánh Ngọc</option></select>
            <select class="select"><option>Priority: All</option><option>Urgent</option><option>High</option><option>Medium</option><option>Low</option></select>
            <select class="select"><option>Label: All</option><option>Design</option><option>Frontend</option><option>Backend</option><option>Security</option><option>Bug</option><option>Documentation</option><option>DevOps</option><option>Research</option></select>
            <select class="select"><option>Due date</option><option>Overdue</option><option>Due today</option><option>Upcoming</option><option>No due date</option></select>
            <select class="select"><option>Sort: Priority</option><option>Sort: Due date</option><option>Sort: Title</option><option>Sort: Newest</option></select>
          </div>
          <button class="btn btn-primary btn-sm" data-open-modal="quickCreateTaskModal"><span class="icon icon-sm" data-icon="plus"></span>Add Task</button>
        </div>
        <div class="board-scroll">
          <div class="board scroll-x" id="kanbanBoard"></div>
        </div>
      </main>
        </>
    )
}
export default ProjectBoard;