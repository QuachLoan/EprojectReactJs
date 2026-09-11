import { useState } from "react";

function DropdownHeader(){
    const [activeDropdown, setActiveDropdown] = useState(null);
    const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };
    return(
        <>
        <div class="header-actions">
          <div class="dropdown">
            <button class="btn btn-primary btn-sm" onClick={() => toggleDropdown("create")} data-dropdown-trigger><span class="icon icon-sm" data-icon="plus">
                <svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                </span><span class="create-btn-label" >Create</span></button>
            {activeDropdown === "create" && (
               <div class="dropdown-menu " data-dropdown-menu>
              <button class="dropdown-item" data-open-modal="quickCreateTaskModal"><span class="icon icon-sm" data-icon="listPlus"></span>New Task</button>
              <button class="dropdown-item" data-open-modal="createProjectModal"><span class="icon icon-sm" data-icon="folderPlus"></span>New Project</button>
            </div>
            )}
            
          </div>
          <div class="dropdown">
            <button data-dropdown-trigger aria-label="Open user menu" onClick={() => toggleDropdown("user")}><span class="avatar avatar-sm" style={{background:'#4f46e5'}}>CS</span></button>
            {activeDropdown === "user" && (
            <div class="dropdown-menu " data-dropdown-menu>
              <div class="dropdown-user-info">
                <p class="dropdown-user-name">Cao Sơn</p>
                <p class="dropdown-user-email">caosonhs@gmail.com</p>
                <p class="dropdown-user-role">leader</p>
              </div>
              <div class="dropdown-separator"></div>
              <a class="dropdown-item destructive" href="login.html"><span class="icon icon-sm" data-icon="logOut"></span>Log out</a>
            </div>
            )}
            
          </div>
        </div>
        </>
    )
}
export default DropdownHeader;