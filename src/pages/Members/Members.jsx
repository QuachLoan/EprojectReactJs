import { useEffect, useState } from "react";
import { fetchMembers, inviteMember } from "../../../api"; //
import { User } from "lucide-react";

function Members() {
    const [members, setMembers] = useState([]);
    const [openModel, setOpenModel] = useState(false);
    const [searchMember, setSearchMember] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Member");
    const [loading, setLoading] = useState(true);
 const [memberCurrentRole, setMemberRole] = useState(""); 
    const [openDropdown,setDropDown] = useState(false);
    function handleDropdown(userId){
      setDropDown(openDropdown === userId ? null : userId)
    }
    const getCurrentUser = () => {
        return JSON.parse(localStorage.getItem('user') || '{}');
    };

        const fetchCurrentMemberRole = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch("http://localhost:3000/api/user/currentUser", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            
            setMemberRole(data.memberRole); 
            console.log(data);
        } catch (err) {
            console.error("Không thể lấy thông tin role hiện tại:", err);
        }
    };
    // Load danh sách Members
    const loadData = async () => {
        try {
            setLoading(true);
            const resData = await fetchMembers();
            const memberList = Array.isArray(resData) ? resData : (resData?.data || []);
            setMembers(memberList);         
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu member:", err);
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
         fetchCurrentMemberRole();
    }, []);

    // Lọc danh sách Member dựa vào thông tin của userId
    const filteredMembers = members.filter((m) => {
        const username = m.userId?.username || m.username || "";
        const email = m.userId?.email || m.email || "";
        return (
            username.toLowerCase().includes(searchMember.toLowerCase()) ||
            email.toLowerCase().includes(searchMember.toLowerCase())
        );
    });

   async function  handleUpdateRole(memberId,currentRole,newRole) {
      if(currentRole === newRole){
        alert(`This member is already a ${newRole}.`)
        setDropDown(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await fetch (`http://localhost:3000/api/member/${memberId}`,{
          method: "PUT",
          headers : {
            "Content-Type":"application/json",
            Authorization :`Bearer ${token}`
          },
          body: JSON.stringify({role : newRole})

        })
          const data = await res.json();
          if(!res.ok){
             throw new Error(data.message || "Cập nhật thất bại");
          }
           setMembers((prevMembers) =>
                prevMembers.map((m) => (m._id === memberId ? { ...m, role: newRole } : m))
            );
            alert(`Đã cập nhật vai trò thành ${newRole} thành công!`);
            setDropDown(null); // Đóng menu
      } catch (error) {
        console.error("Lỗi update role:", error);
      }
   }
    const toggleModel = () => {
        // if (!isManager) {
        //     alert("Chỉ Manager mới có quyền mời thành viên mới!");
        //     return;
        // }
        setOpenModel(true);
    };

    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            alert("Vui lòng nhập Email!");
            return;
        }

        try {
            // API trả về response có chứa object member vừa thêm
            const data = await inviteMember({
                email: inviteEmail,
                role: inviteRole,
            });

            // 1. Cập nhật trực tiếp vào State danh sách member hiện tại
            if (data && data.member) {
                setMembers((prevMembers) => [...prevMembers, data.member]);
            }

            // 2. Reset form & đóng Modal
            setOpenModel(false);
            setInviteEmail("");
            setInviteRole("Member");
        }
        catch (error) {
            console.error("Lỗi gửi lời mời:", error);
            const message = error.response?.data?.message || error.message || "Có lỗi kết nối đến server!";
            alert(message);
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const words = String(name).trim().split(/\s+/);
        return words.length === 1
            ? words[0].substring(0, 2).toUpperCase()
            : (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };

    return (
        <>
            <main className="page-content">
                <div className="page-content-inner">
                    <div className="page-header">
                        <div>
                            <h1>Members</h1>
                            <p className="page-subtitle">Everyone with access to this workspace.</p>
                        </div>
                        
                            <button onClick={toggleModel} className="btn btn-primary">
                                <span className="icon icon-sm" data-icon="plus">
                                    <svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                                </span>
                                Invite
                            </button>
                        
                    </div>

                    <div className="input-icon-wrap" style={{ maxWidth: '320px', marginBottom: 'var(--space-4)' }}>
                        <span className="icon icon-sm" data-icon="search">
                            <svg viewBox="0 0 24 24"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
                        </span>
                        <input
                            className="input"
                            placeholder="Search members…"
                            value={searchMember}
                            onChange={(e) => setSearchMember(e.target.value)}
                        />
                    </div>

                    <div className="card">
                        <div className="member-table-header" style={{ gridTemplateColumns: "1fr 106px 132px" }}>
                            <span>Member</span>
                            <span>Position</span>
                            <span>Status</span>
                            <span></span>
                        </div>

                        {loading ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
                        ) : filteredMembers.length > 0 ? (
                            filteredMembers.map((m, idx) => {
                                // Lấy thông tin từ m.userId đã được populate
                                const username = m.userId?.username || "Chưa cập nhật";
                                const email = m.userId?.email || "Không có email";
                                const role = m.role || "Member";
                                const status = m.status || "Active";

                                return (
                                    <div key={m._id || idx} className="member-row" >
                                        <div className="member-identity">
                                            <span className="avatar avatar-sm" style={{ background: '#4f46e5' }}>
                                                {getInitials(username)}
                                            </span>
                                            <div className="member-identity-text">
                                                <p className="member-name">{username}</p>
                                                <p className="member-email">{email}</p>
                                            </div>
                                        </div>
                                        <span>
                                            <span
                                                className="badge"
                                                style={{
                                                    backgroundColor: role === 'Manager' ? '#8b5cf6' : role === 'Leader' ? '#f59e0b' : '#f1f5f9',
                                                    color: role === 'Manager' || role === 'Leader' ? '#ffffff' : '#475569',
                                                    border: role === 'Member' ? '1px solid #cbd5e1' : 'none',
                                                    padding: '2px 8px',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                {role}
                                            </span>
                                        </span>

                                        <span>
                                            <span className={`badge ${status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                                                {status}
                                            </span>
                                        </span>
                                        
                                         {
                                          memberCurrentRole === "Manager"  && m.role !== "Manager"  && (
                                         <span class="member-actions-cell" data-member-actions="">
                                          <div class="dropdown">                                          
                                          <button onClick={()=>handleDropdown(m._id)} class="icon-btn icon-btn-sm" data-dropdown-trigger="" aria-label="Member actions">
                                          <span class="icon icon-sm " data-icon="moreHorizontal"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></span>
                                            </button>
                                            {
                                              openDropdown === m._id &&(
                                            <div class="dropdown-menu" data-dropdown-menu="">
                                              <button onClick={() => handleUpdateRole(m._id, role,"Leader")} class="dropdown-item"><span class="icon icon-sm" data-icon="userCog"><svg viewBox="0 0 24 24"><path d="M10 15H6a4 4 0 0 0-4 4v2"></path><path d="m14.305 16.53.923-.382"></path><path d="m15.228 13.852-.923-.383"></path><path d="m16.852 12.228-.383-.923"></path><path d="m16.852 17.772-.383.924"></path><path d="m19.148 12.228.383-.923"></path><path d="m19.53 18.696-.382-.924"></path><path d="m20.772 13.852.924-.383"></path><path d="m20.772 16.148.924.383"></path><circle cx="18" cy="15" r="3"></circle><circle cx="9" cy="7" r="4"></circle></svg></span>Promote to Leader</button>
                                              <button onClick={() => handleUpdateRole(m._id, role,"Member")}  class="dropdown-item"><span class="icon icon-sm" data-icon="userCog"><svg viewBox="0 0 24 24"><path d="M10 15H6a4 4 0 0 0-4 4v2"></path><path d="m14.305 16.53.923-.382"></path><path d="m15.228 13.852-.923-.383"></path><path d="m16.852 12.228-.383-.923"></path><path d="m16.852 17.772-.383.924"></path><path d="m19.148 12.228.383-.923"></path><path d="m19.53 18.696-.382-.924"></path><path d="m20.772 13.852.924-.383"></path><path d="m20.772 16.148.924.383"></path><circle cx="18" cy="15" r="3"></circle><circle cx="9" cy="7" r="4"></circle></svg></span>Set as Member</button>
                                              <button class="dropdown-item destructive" ><span class="icon icon-sm" data-icon="userMinus"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="22" x2="16" y1="11" y2="11"></line></svg></span>Remove from workspace</button>
                                            </div>
                                              )
                                            }
                                          </div>
                                        </span>

                                          )
                                         }

                               </div>
                                    
                                );
                            })
                        ) : (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No members found</div>
                        )}
                    </div>
                </div>
            </main>

            {/* MODAL INVITE */}
            {openModel && (
                <div className="modal-overlay" id="inviteMemberModal">
                    <div className="modal-box">
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Invite a member</h2>
                                <p className="modal-desc">Add a new person to this workspace.</p>
                            </div>
                            <button onClick={() => setOpenModel(false)} className="icon-btn" aria-label="Close">
                                <span className="icon" data-icon="x">
                                    <svg viewBox="0 0 24 24"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                                </span>
                            </button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className="field">
                                    <label className="field-label">Email *</label>
                                    <input
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="input"
                                        type="email"
                                        placeholder="teammate@company.com"
                                        required
                                    />
                                </div>

                                <div className="field">
                                    <label className="field-label">Role</label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        className="select"
                                    >
                                        <option value="Member">Member</option>
                                        <option value="Leader">Leader</option>
                                        <option value="Manager">Manager</option>
                                    </select>
                                </div>
                                <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleInvite}>
                                    Add Member
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Members;