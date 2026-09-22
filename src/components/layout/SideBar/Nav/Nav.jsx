import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

function Nav() {

   const [currentUserRole, setCurrentUserRole] = useState(""); 
    const getNavClass = ({ isActive }) => (isActive ? "nav-item active" : "nav-item");

 useEffect(() => {
 const token = localStorage.getItem("token"); // lấy token đã lưu
  if (!token) return;
  fetch("http://localhost:3000/api/user/currentUser", {
    headers: { Authorization: `Bearer ${token}` }
  })
      .then((res) => res.json())
      .then((data) => setCurrentUserRole(data.role))
      .catch((err) => console.error("Fetch error:", err));
  }, []);
    return (
        <nav className="sidebar-nav">
            {/* Dashboard */}
            <NavLink to="/dashboard" className={getNavClass}>
        <span className="icon" data-icon="layoutDashboard">
          <svg viewBox="0 0 24 24"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
        </span>
                <span className="nav-label">Dashboard</span>
            </NavLink>

            {/* My Tasks */}
            <NavLink to="/myTasks" className={getNavClass}>
        <span className="icon" data-icon="listTodo">
          <svg viewBox="0 0 24 24"><path d="M13 5h8"></path><path d="M13 12h8"></path><path d="M13 19h8"></path><path d="m3 17 2 2 4-4"></path><rect x="3" y="4" width="6" height="6" rx="1"></rect></svg>
        </span>
                <span className="nav-label">My Tasks</span>
            </NavLink>

            {/* Projects */}
            <NavLink to="/project" className={getNavClass}>
        <span className="icon" data-icon="folderKanban">
          <svg viewBox="0 0 24 24"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path><path d="M8 10v4"></path><path d="M12 10v2"></path><path d="M16 10v6"></path></svg>
        </span>
                <span className="nav-label">Projects</span>
            </NavLink>

            {/* Members */}
            <NavLink to="/members" className={getNavClass}>
        <span className="icon" data-icon="users">
          <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
        </span>
                <span className="nav-label">Members</span>
            </NavLink>

           

            {/* Admin Users */}
            {
              
              currentUserRole === "Admin" && (
                <>
                 <p className="sidebar-section-label">Admin</p>
                 <NavLink to="/adminuser" className={getNavClass}>
        <span className="icon" data-icon="shieldCheck">
          <svg viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
        </span>
                <span className="nav-label">Users</span>
            </NavLink>

            <NavLink to="/adminmoderation" className={getNavClass}>
        <span className="icon" data-icon="flag">
          <svg viewBox="0 0 24 24"><path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"></path></svg>
        </span>
                <span className="nav-label">Moderation</span>
            </NavLink>
                </>
           
              )
            }

        </nav>
    );
}

export default Nav;