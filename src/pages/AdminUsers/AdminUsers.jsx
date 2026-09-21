import { use, useEffect, useState } from "react";

function AdminUsers(){
  const [users,setUsers] = useState([]);
  const [showToats,setShowToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
const filteredUsers = users.filter((user) => {
  const matchSearch =
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase());

  const matchRole =selectedRole === "All" ? true : user.role === selectedRole;

  return matchSearch && matchRole;
});
  useEffect(()=>{
    fetch("http://localhost:3000/api/user/GetUsers")
    .then((res)=> res.json())
    .then((data)=>setUsers(data))
    .catch((err) => console.error(" Fetch error:", err));
  },[]);


  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await fetch(`http://localhost:3000/api/user/updateUser/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, status: newStatus } : u
        )
      );

      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

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
            <div class="input-icon-wrap" style={{maxWidth:'320px'}}><span class="icon icon-sm" data-icon="search"><svg viewBox="0 0 24 24"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg></span><input onChange={(e)=>setSearchTerm(e.target.value)} class="input" placeholder="Search by name or email…" data-filter-input="adminUsers"/></div>
            <select  onChange={(e) => setSelectedRole(e.target.value)} class="select" style={{width:'auto', minWidth:'150px'}}><option value="All" >Role: All</option><option value="User">User</option><option value="Admin">Admin</option></select>
          </div>
          <div class="card">
            {filteredUsers.map((user) => (
             <div class="admin-user-row" data-filter-target="adminUsers" data-filter-text="Khánh Ngọc ngoc.khanh@teamflow.dev">
              <div class="admin-user-identity">
                <span class="avatar avatar-sm" style={{background:'#db2777'}}>{user.username.charAt(0).toUpperCase()}</span>
                <div class="member-identity-text"><p class="member-name">{user.username}</p><p class="member-email">{user.email}</p></div>
              </div>
              <span className={`badge ${user.role ==="User" ? "badge-primary": "badge-warning"}`}>{user.role}</span>
              <span className= {user.role ==="Admin"?"hidden": user.status ==="Active" ? "badge badge-success":"badge badge-danger" }>{user.status}</span>
              <span className= {user.role ==="Admin"?"hidden":"admin-user-joined"}>
                Joined { new Date(user.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                })}
              </span>{
                user.role && (
                   <button onClick={()=>handleToggleStatus(user._id, user.status)} className={`suspend-btn ${user.role ==="Admin" ? "hidden" :""}`} >

                    <span class="icon icon-sm" data-icon="userX">
                      {user.status ==="Active" ? 
                      <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" x2="22" y1="8" y2="13"></line><line x1="22" x2="17" y1="8" y2="13"></line></svg>
                      :
                        <svg viewBox="0 0 24 24">
                        <path d="m16 11 2 2 4-4"></path>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                      </svg>
                      }
                       
                    
                    </span>{user.status ==="Active" ? "Suspend" :"Reactive"}</button>
                )
              }           
              </div>
            ))}

          </div>
        </div>
      </main>
      {showToats && (
       <div class="toast-viewport"><div class="toast variant-success"><span class="toast-icon icon" data-icon="checkCircle2"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="m16 9-5.5 5.5L8 12"></path></svg></span><div class="toast-body">

        <p class="toast-title">Changed success</p>
        </div><button class="toast-close icon icon-sm"  onClick={() => setShowToast(false)} data-icon="x" aria-label="Dismiss"><svg viewBox="0 0 24 24"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button></div></div>
      )}
        </>
    )
}
export default AdminUsers;