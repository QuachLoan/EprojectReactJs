import Nav from "./Nav/Nav";

function SideBar(){
    return(
<>
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="sidebar-brand-logo icon" data-icon="kanbanSquare">
          <svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M8 7v7"></path><path d="M12 7v4"></path><path d="M16 7v9"></path></svg>
        </span>
        <span class="sidebar-brand-name">TeamFlow</span>
      </div>
      <div class="sidebar-workspace">
        <p class="sidebar-workspace-label">Workspace</p>
        <p class="sidebar-workspace-name">Aptech Capstone Team</p>
      </div>
       <Nav/>
      <div class="sidebar-collapse-btn">
        <button data-action="toggle-sidebar"><span class="icon icon-sm" data-icon="chevronsLeft"></span><span>Collapse</span></button>
      </div>
    </aside>
        </>
    )
}
export default SideBar;