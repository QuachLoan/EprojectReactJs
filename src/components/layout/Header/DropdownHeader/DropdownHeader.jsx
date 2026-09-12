import { useState } from "react";
import { Link } from "react-router-dom";

function DropdownHeader(){
    const [activeDropdown, setActiveDropdown] = useState(null);
    const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };
    return(
        <>
        <div className="header-actions">
          <div className="dropdown">
            <button className="btn btn-primary btn-sm" onClick={() => toggleDropdown("create")} data-dropdown-trigger><span class="icon icon-sm" data-icon="plus">
                <svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                </span><span className="create-btn-label" >Create</span></button>
            {activeDropdown === "create" && (
               <div className="dropdown-menu " data-dropdown-menu>
              <button className="dropdown-item" data-open-modal="quickCreateTaskModal"><span class="icon icon-sm" data-icon="listPlus"></span>New Task</button>
              <button className="dropdown-item" data-open-modal="createProjectModal"><span class="icon icon-sm" data-icon="folderPlus"></span>New Project</button>
            </div>
            )}
            
          </div>
          <div className="dropdown">
            <button data-dropdown-trigger aria-label="Open user menu" onClick={() => toggleDropdown("user")}><span class="avatar avatar-sm" style={{background:'#4f46e5'}}>CS</span></button>
            {activeDropdown === "user" && (
            <div className="dropdown-menu " data-dropdown-menu>
              <div className="dropdown-user-info">
                <p className="dropdown-user-name">Cao Sơn</p>
                <p className="dropdown-user-email">caosonhs@gmail.com</p>
                <p className="dropdown-user-role">leader</p>
              </div>
              <div className="dropdown-separator"></div>
              <Link class="dropdown-item destructive" to="/Login"><span className="icon icon-sm" data-icon="logOut"></span>Log out</Link>
            </div>
            )}
            
          </div>
        </div>
        </>
    )
}
export default DropdownHeader;