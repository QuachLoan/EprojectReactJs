function AdminUsers(){
    return(
        <>
        <main class="page-content">
        <div class="page-content-inner">
          <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
            <span class="icon icon-lg" data-icon="shieldCheck" style={{color:'var(--color-primary-600)'}}><svg viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg></span>
            <h1>Admin · Users</h1>
          </div>
          <p class="page-subtitle" style={{marginBottom:'var(--space-6)'}}>Manage accounts across the whole platform.</p>

          <div class="filter-bar-row" style={{marginBottom:'var(--space-4)'}}>
            <div class="input-icon-wrap" style={{maxWidth:'320px'}}><span class="icon icon-sm" data-icon="search"><svg viewBox="0 0 24 24"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg></span><input class="input" placeholder="Search by name or email…" data-filter-input="adminUsers"/></div>
            <select class="select" style={{width:'auto', minWidth:'150px'}}><option>Role: All</option><option>Member</option><option>Team Leader</option><option>Admin</option></select>
          </div>

          <div class="card">
            <div class="admin-user-row" data-filter-target="adminUsers" data-filter-text="Cao Sơn caosonhs@gmail.com">
              <div class="admin-user-identity">
                <span class="avatar avatar-sm" style={{background:'#4f46e5'}}>CS</span>
                <div class="member-identity-text"><p class="member-name">Cao Sơn</p><p class="member-email">caosonhs@gmail.com</p></div>
              </div>
              <span class="badge badge-success">leader</span>
              <span class="badge badge-success">active</span>
              <span class="admin-user-joined">Joined May 1, 2026</span>
              <button class="suspend-btn" onclick="showToast('User suspended', null, 'success')"><span class="icon icon-sm" data-icon="userX"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" x2="22" y1="8" y2="13"></line><line x1="22" x2="17" y1="8" y2="13"></line></svg></span>Suspend</button>
            </div>

            <div class="admin-user-row" data-filter-target="adminUsers" data-filter-text="Quách Loan loan.quach@teamflow.dev">
              <div class="admin-user-identity">
                <span class="avatar avatar-sm" style={{background:'#0ea5e9'}}>QL</span>
                <div class="member-identity-text"><p class="member-name">Quách Loan</p><p class="member-email">loan.quach@teamflow.dev</p></div>
              </div>
              <span class="badge badge-neutral">member</span>
              <span class="badge badge-danger">suspended</span>
              <span class="admin-user-joined">Joined May 2, 2026</span>
              <button class="suspend-btn" onclick="showToast('User reactivated', null, 'success')"><span class="icon icon-sm" data-icon="userCheck"><svg viewBox="0 0 24 24"><path d="m16 11 2 2 4-4"></path><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></span>Reactivate</button>
            </div>

            <div class="admin-user-row" data-filter-target="adminUsers" data-filter-text="Ngô Lâm lam.ngo@teamflow.dev">
              <div class="admin-user-identity">
                <span class="avatar avatar-sm" style={{background:'#16a34a'}}>NL</span>
                <div class="member-identity-text"><p class="member-name">Ngô Lâm</p><p class="member-email">lam.ngo@teamflow.dev</p></div>
              </div>
              <span class="badge badge-neutral">member</span>
              <span class="badge badge-success">active</span>
              <span class="admin-user-joined">Joined May 2, 2026</span>
              <button class="suspend-btn" onclick="showToast('User suspended', null, 'success')"><span class="icon icon-sm" data-icon="userX"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" x2="22" y1="8" y2="13"></line><line x1="22" x2="17" y1="8" y2="13"></line></svg></span>Suspend</button>
            </div>

            <div class="admin-user-row" data-filter-target="adminUsers" data-filter-text="Khánh Ngọc ngoc.khanh@teamflow.dev">
              <div class="admin-user-identity">
                <span class="avatar avatar-sm" style={{background:'#db2777'}}>KN</span>
                <div class="member-identity-text"><p class="member-name">Khánh Ngọc</p><p class="member-email">ngoc.khanh@teamflow.dev</p></div>
              </div>
              <span class="badge badge-primary">admin</span>
              <span class="badge badge-success">active</span>
              <span class="admin-user-joined">Joined Dec 15, 2025</span>
              <button class="suspend-btn" onclick="showToast('User suspended', null, 'success')"><span class="icon icon-sm" data-icon="userX"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" x2="22" y1="8" y2="13"></line><line x1="22" x2="17" y1="8" y2="13"></line></svg></span>Suspend</button>
            </div>
          </div>
        </div>
      </main>
        </>
    )
}
export default AdminUsers;