import { useState } from "react";

function Members(){
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  }; 
    return(
    <>
<main class="page-content">
        <div class="page-content-inner">
          <div class="page-header">
            <div><h1>Members</h1><p class="page-subtitle">Everyone with access to this workspace.</p></div>
            <button class="btn btn-primary" data-open-modal="inviteMemberModal"><span class="icon icon-sm" data-icon="plus"><svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></span>Invite</button>
          </div>

          <div class="input-icon-wrap" style={{maxWidth:'320px', marginBottom:'var(--space-4)'}}>
            <span class="icon icon-sm" data-icon="search"><svg viewBox="0 0 24 24"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg></span>
            <input class="input" placeholder="Search members…" data-filter-input="memberList"/>
          </div>

          <div class="card">
            <div class="member-table-header"><span>Name</span><span class="member-role-cell">Role</span><span class="member-tasks-cell">Tasks</span><span></span></div>

            <div class="member-row" data-filter-target="memberList" data-filter-text="Cao Sơn">
              <div class="member-identity"><span class="avatar avatar-sm" style={{background:'#4f46e5'}}>CS</span><div class="member-identity-text"><p class="member-name">Cao Sơn</p><p class="member-email">caosonhs@gmail.com</p></div></div>
              <span class="member-role-cell"><span class="badge badge-success">leader</span></span>
              <span class="member-tasks-cell">6 tasks</span>
              <span class="member-actions-cell">
                <div class="dropdown">
                  <button class="icon-btn icon-btn-sm"  onClick={() => toggleDropdown("cao-son")} data-dropdown-trigger="" aria-label="Member actions"><span class="icon icon-sm" data-icon="moreHorizontal"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></span></button>
                  <div className={`dropdown-menu ${
                    openDropdown === "cao-son" ? "" : "hidden"}`} data-dropdown-menu="">
                    <button class="dropdown-item"><span class="icon icon-sm" data-icon="userCog"><svg viewBox="0 0 24 24"><path d="M10 15H6a4 4 0 0 0-4 4v2"></path><path d="m14.305 16.53.923-.382"></path><path d="m15.228 13.852-.923-.383"></path><path d="m16.852 12.228-.383-.923"></path><path d="m16.852 17.772-.383.924"></path><path d="m19.148 12.228.383-.923"></path><path d="m19.53 18.696-.382-.924"></path><path d="m20.772 13.852.924-.383"></path><path d="m20.772 16.148.924.383"></path><circle cx="18" cy="15" r="3"></circle><circle cx="9" cy="7" r="4"></circle></svg></span>Set as Member</button>
                    <button class="dropdown-item destructive" onclick="showToast('Member removed', null, 'success')"><span class="icon icon-sm" data-icon="userMinus"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="22" x2="16" y1="11" y2="11"></line></svg></span>Remove from workspace</button>
                  </div>
                </div>
              </span>
            </div>

            <div class="member-row" data-filter-target="memberList" data-filter-text="Quách Loan">
              <div class="member-identity"><span class="avatar avatar-sm" style={{background:'#0ea5e9'}}>QL</span><div class="member-identity-text"><p class="member-name">Quách Loan</p><p class="member-email">loan.quach@teamflow.dev</p></div></div>
              <span class="member-role-cell"><span class="badge badge-neutral">member</span></span>
              <span class="member-tasks-cell">9 tasks</span>
              <span class="member-actions-cell">
                <div class="dropdown">
                  <button class="icon-btn icon-btn-sm" data-dropdown-trigger="" aria-label="Member actions"><span class="icon icon-sm" data-icon="moreHorizontal"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></span></button>
                  <div class="dropdown-menu hidden" data-dropdown-menu="">
                    <button class="dropdown-item"><span class="icon icon-sm" data-icon="userCog"><svg viewBox="0 0 24 24"><path d="M10 15H6a4 4 0 0 0-4 4v2"></path><path d="m14.305 16.53.923-.382"></path><path d="m15.228 13.852-.923-.383"></path><path d="m16.852 12.228-.383-.923"></path><path d="m16.852 17.772-.383.924"></path><path d="m19.148 12.228.383-.923"></path><path d="m19.53 18.696-.382-.924"></path><path d="m20.772 13.852.924-.383"></path><path d="m20.772 16.148.924.383"></path><circle cx="18" cy="15" r="3"></circle><circle cx="9" cy="7" r="4"></circle></svg></span>Promote to Leader</button>
                    <button class="dropdown-item destructive" onclick="showToast('Member removed', null, 'success')"><span class="icon icon-sm" data-icon="userMinus"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="22" x2="16" y1="11" y2="11"></line></svg></span>Remove from workspace</button>
                  </div>
                </div>
              </span>
            </div>

            <div class="member-row" data-filter-target="memberList" data-filter-text="Ngô Lâm">
              <div class="member-identity"><span class="avatar avatar-sm" style={{background:'#16a34a'}}>NL</span><div class="member-identity-text"><p class="member-name">Ngô Lâm</p><p class="member-email">lam.ngo@teamflow.dev</p></div></div>
              <span class="member-role-cell"><span class="badge badge-neutral">member</span></span>
              <span class="member-tasks-cell">8 tasks</span>
              <span class="member-actions-cell">
                <div class="dropdown">
                  <button class="icon-btn icon-btn-sm" data-dropdown-trigger="" aria-label="Member actions"><span class="icon icon-sm" data-icon="moreHorizontal"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></span></button>
                  <div class="dropdown-menu hidden" data-dropdown-menu="">
                    <button class="dropdown-item"><span class="icon icon-sm" data-icon="userCog"><svg viewBox="0 0 24 24"><path d="M10 15H6a4 4 0 0 0-4 4v2"></path><path d="m14.305 16.53.923-.382"></path><path d="m15.228 13.852-.923-.383"></path><path d="m16.852 12.228-.383-.923"></path><path d="m16.852 17.772-.383.924"></path><path d="m19.148 12.228.383-.923"></path><path d="m19.53 18.696-.382-.924"></path><path d="m20.772 13.852.924-.383"></path><path d="m20.772 16.148.924.383"></path><circle cx="18" cy="15" r="3"></circle><circle cx="9" cy="7" r="4"></circle></svg></span>Promote to Leader</button>
                    <button class="dropdown-item destructive" onclick="showToast('Member removed', null, 'success')"><span class="icon icon-sm" data-icon="userMinus"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="22" x2="16" y1="11" y2="11"></line></svg></span>Remove from workspace</button>
                  </div>
                </div>
              </span>
            </div>

            <div class="member-row" data-filter-target="memberList" data-filter-text="Khánh Ngọc">
              <div class="member-identity"><span class="avatar avatar-sm" style={{background:'#db2777'}}>KN</span><div class="member-identity-text"><p class="member-name">Khánh Ngọc</p><p class="member-email">ngoc.khanh@teamflow.dev</p></div></div>
              <span class="member-role-cell"><span class="badge badge-primary">admin</span></span>
              <span class="member-tasks-cell">5 tasks</span>
              <span class="member-actions-cell"></span>
            </div>
          </div>
        </div>
      </main>    </>
    )
}
export default Members;