import { useEffect, useState } from "react";
import { fetchMembers } from "../../../api";

function Members() {
    const [member, setMember] = useState([]);
    const [openModel, setOpenModel] = useState(false);
    const [searchMember, setSearchMember] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Member");
    const [invitePosition, setInvitePosition] = useState("None");
    const [loading, setLoading] = useState(true);

    // Lấy thông tin user hiện tại và role từ localStorage
    const getCurrentUser = () => {
        return JSON.parse(localStorage.getItem('user') || '{}');
    };
    const currentUser = getCurrentUser();
    const isManager = currentUser?.role === 'Manager';

    // Load danh sách Members
    const loadData = async () => {
        try {
            setLoading(true);
            const membersRes = await fetchMembers().catch(() => []);
            const realMembers = Array.isArray(membersRes) ? membersRes : (membersRes?.data || membersRes?.users || []);
            setMember(realMembers);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Lọc danh sách thành viên theo từ khóa tìm kiếm
    const filteredMembers = member.filter((m) => {
        const username = m.userId?.username || m.username || m.name || "";
        const email = m.userId?.email || m.email || "";
        return (
            username.toLowerCase().includes(searchMember.toLowerCase()) ||
            email.toLowerCase().includes(searchMember.toLowerCase())
        );
    });

    const toggleModel = () => {
        if (!isManager) {
            alert("Chỉ Manager mới có quyền mời thành viên mới!");
            return;
        }
        setOpenModel(true);
    };

    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            alert("Vui lòng nhập Email!");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/member/invite', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: inviteEmail,
                    role: inviteRole,
                    position: invitePosition
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Gửi lời mời / Thêm thành viên thành công!");
                setOpenModel(false);
                setInviteEmail("");
                setInviteRole("Member");
                setInvitePosition("None");
                loadData();
            } else {
                alert(data.message || "Xảy ra lỗi khi thực hiện!");
            }
        } catch (error) {
            console.error("Lỗi gửi lời mời:", error);
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
                        {isManager && (
                            <button onClick={toggleModel} className="btn btn-primary" data-open-modal="inviteMemberModal">
                                <span className="icon icon-sm" data-icon="plus">
                                    <svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                                </span>
                                Invite
                            </button>
                        )}
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
                        {/* Đã chia lại layout gồm 3 cột: Member, Role, Status */}
                        <div className="member-table-header" style={{ gridTemplateColumns: "2fr 150px 100px" }}>
                            <span>Member</span>
                            <span>Role</span>
                            <span>Status</span>
                        </div>

                        {loading ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Đang tải danh sách thành viên...</div>
                        ) : filteredMembers.length > 0 ? (
                            filteredMembers.map((x, idx) => {
                                const username = x.userId?.username || x.username || x.name || "User";
                                const email = x.userId?.email || x.email || "No email";
                                const role = x.role || "Member";

                                return (
                                    <div key={x._id || idx} className="member-row" style={{ gridTemplateColumns: "2fr 150px 100px" }}>
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
                                            <span className={`badge ${role === 'Manager' ? 'badge-primary' : role === 'Leader' ? 'badge-success' : 'badge-neutral'}`}>
                                                {role}
                                            </span>
                                        </span>
                                        <span>
                                            <span className="badge badge-success">Active</span>
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Không tìm thấy thành viên phù hợp.</div>
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
                                        <option value="Leader">Team Leader</option>
                                        <option value="Manager">Manager</option>
                                    </select>
                                </div>

                                <div className="field">
                                    <label className="field-label">Position</label>
                                    <select
                                        value={invitePosition}
                                        onChange={(e) => setInvitePosition(e.target.value)}
                                        className="select"
                                    >
                                        <option value="None">None</option>
                                        <option value="Dev">Dev</option>
                                        <option value="Tester">Tester</option>
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