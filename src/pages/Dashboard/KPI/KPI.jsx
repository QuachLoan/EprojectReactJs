function KPI(){
    return(
    <>
        <div class="grid-stats">
            <div class="card stat-card">
              <span class="stat-card-icon tone-primary"><span class="icon" data-icon="listTodo">
                <svg viewBox="0 0 24 24"><path d="M13 5h8"></path><path d="M13 12h8"></path><path d="M13 19h8"></path><path d="m3 17 2 2 4-4"></path><rect x="3" y="4" width="6" height="6" rx="1"></rect></svg>
                </span></span>
              <div><p class="stat-card-label">Total Tasks</p><p class="stat-card-value">37</p></div>
            </div>
            <div class="card stat-card">
              <span class="stat-card-icon tone-warning"><span class="icon" data-icon="loader">
                <svg viewBox="0 0 24 24"><path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path></svg>
                </span></span>
              <div><p class="stat-card-label">In Progress</p><p class="stat-card-value">9</p></div>
            </div>
            <div class="card stat-card">
              <span class="stat-card-icon tone-success"><span class="icon" data-icon="checkCircle2">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="m16 9-5.5 5.5L8 12"></path></svg>
                </span></span>
              <div><p class="stat-card-label">Completed</p><p class="stat-card-value">14</p></div>
            </div>
            <div class="card stat-card">
              <span class="stat-card-icon tone-danger"><span class="icon" data-icon="alertTriangle">
                <svg viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                </span></span>
              <div><p class="stat-card-label">Overdue</p><p class="stat-card-value">3</p></div>
            </div>
        </div>
        </>
    )
}
export default KPI;