import { useEffect, useState } from "react";

function Members(){
  const [member,setMember]= useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
 const [openModel, setOpenModel] = useState(false);
 const [searchMember,setSearchMember]= useState("");
 const [inviteEmail, setInviteEmail] = useState("");
 const [inviteRole, setInviteRole] = useState("Member");
  const [invitePosition, setInvitePosition] = useState("None");

 const filterMemer = member.filter(
  (member) => 
    member.username.toLowerCase().includes(searchMember.toLowerCase()) ||
    member.email.toLowerCase().includes(searchMember.toLowerCase())
 )
 const toggleModel =()=>{
  setOpenModel(true);
 }
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  }; 
 useEffect(()=>{

 })
const handleInvite = async()=>{

  try {
      const res = await fetch('http://localhost:3000/api/member/invite',{
          method: "POST",
          headers:{ "Content-Type": "application/json"},
          body: JSON.stringify({
            email:inviteEmail,
            role: inviteRole,
            position: invitePosition
          })
        });
        const data =await res.json();
        if(res.ok){
          alert("Add success");
          
        }else{
          alert(data.message);
        }
  } catch (error) {
     console.error(error);
  }
}
    return(
    <>
<main class="page-content">
        <div class="page-content-inner">
          <div class="page-header">
            <div><h1>Members</h1><p class="page-subtitle">Everyone with access to this workspace.</p></div>
            <button onClick={() => toggleModel()} class="btn btn-primary" data-open-modal="inviteMemberModal"><span class="icon icon-sm" data-icon="plus"><svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></span>Invite</button>
          </div>

          <div class="input-icon-wrap" style={{maxWidth:'320px', marginBottom:'var(--space-4)'}}>
            <span class="icon icon-sm" data-icon="search"><svg viewBox="0 0 24 24"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg></span>
            <input class="input" placeholder="Search members…" data-filter-input="memberList"/>
          </div>

          <div class="card">
            <div class="member-table-header" style={{ gridTemplateColumns: "1.6fr 110px 130px 100px 90px 90px" }}>
              <span>Member</span><span>Role</span><span>Project Role</span><span>Assigned Tasks</span><span>Workload</span><span>Status</span>
            </div>

            <div class="member-row" data-filter-target="team" data-filter-text="Cao Sơn" data-team-role="leader" style={{ gridTemplateColumns: "1.6fr 110px 130px 100px 90px 90px" }}>
              <div class="member-identity"><span class="avatar avatar-sm" style={{background:'#4f46e5'}}>CS</span><div class="member-identity-text"><p class="member-name">Cao Sơn</p><p class="member-email">caosonhs@gmail.com</p></div></div>
              <span><span class="badge badge-success">leader</span></span>
              <span style={{fontSize:'13px'}}>Scrum Leader</span>
              <span style={{fontSize:'14px'}}>4 tasks</span>
              <span class="text-muted" style={{fontSize:'13px'}}>—</span>
              <span><span class="badge badge-success">Active</span></span>
            </div>

            {/* <div class="member-row" data-filter-target="team" data-filter-text="Khánh Ngọc" data-team-role="manager"style={{ gridTemplateColumns: "1.6fr 110px 130px 100px 90px 90px" }}>
              <div class="member-identity"><span class="avatar avatar-sm" style={{background:'#db2777'}}>KN</span><div class="member-identity-text"><p class="member-name">Khánh Ngọc</p><p class="member-email">ngoc.khanh@teamflow.dev</p></div></div>
              <span><span class="badge badge-primary">admin</span></span>
              <span style={{fontSize:'13px'}}>Manager</span>
              <span style={{fontSize:'14px'}}>3 tasks</span>
              <span class="text-muted"  style={{fontSize:'13px'}}>—</span>
              <span><span class="badge badge-success">Active</span></span>
            </div>

            <div class="member-row" data-filter-target="team" data-filter-text="Quách Loan" data-team-role="dev" style={{ gridTemplateColumns: "1.6fr 110px 130px 100px 90px 90px" }}>
              <div class="member-identity"><span class="avatar avatar-sm" style={{background:'#0ea5e9'}}>QL</span><div class="member-identity-text"><p class="member-name">Quách Loan</p><p class="member-email">loan.quach@teamflow.dev</p></div></div>
              <span><span class="badge badge-neutral">member</span></span>
              <span style={{fontSize:'13px'}}>DEV (Backend)</span>
              <span  style={{fontSize:'14px'}}>6 tasks</span>
              <span style={{fontSize:'13px', fontWeight:'500'}}>32h</span>
              <span><span class="badge badge-success">Active</span></span>
            </div>

            <div class="member-row" data-filter-target="team" data-filter-text="Ngô Lâm" data-team-role="dev" style={{ gridTemplateColumns: "1.6fr 110px 130px 100px 90px 90px" }}>
              <div class="member-identity"><span class="avatar avatar-sm" style={{background:'#16a34a'}}>NL</span><div class="member-identity-text"><p class="member-name">Ngô Lâm</p><p class="member-email">lam.ngo@teamflow.dev</p></div></div>
              <span><span class="badge badge-neutral">member</span></span>
              <span style={{fontSize:'13px'}}>DEV (Frontend)</span>
              <span style={{fontSize:'14px'}}>8 tasks</span>
              <span style={{fontSize:'13px', fontWeight:'500'}}>43h</span>
              <span><span class="badge badge-success">Active</span></span>
            </div>

            <div class="member-row" data-filter-target="team" data-filter-text="Đặng Thu Hà" data-team-role="ba"style={{ gridTemplateColumns: "1.6fr 110px 130px 100px 90px 90px" }}>
              <div class="member-identity"><span class="avatar avatar-sm" style={{background:'#0891b2'}}>TH</span><div class="member-identity-text"><p class="member-name">Đặng Thu Hà</p><p class="member-email">ha.dang@teamflow.dev</p></div></div>
              <span><span class="badge badge-neutral">member</span></span>
              <span style={{fontSize:'13px'}}>BA</span>
              <span style={{fontSize:'14px'}}>14 tasks</span>
              <span style={{fontSize:'13px', fontWeight:'500'}}>75h</span>
              <span><span class="badge badge-success">Active</span></span>
            </div> */}
          </div>
        </div>
      </main>  
{
  openModel && (
  <div class="modal-overlay " id="inviteMemberModal">
    <div class="modal-box">
      <div class="modal-header">
        <div><h2 class="modal-title">Invite a member</h2><p class="modal-desc">Add a new person to this workspace.</p></div>
      <button onClick={()=>setOpenModel(false)} class="icon-btn" data-close-modal="inviteMemberModal" aria-label="Close"><span class="icon" data-icon="x"><svg viewBox="0 0 24 24"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></span></button>      </div>
      <div class="modal-body" style={{display:'flex', flexDirection:'column', gap:'var(--space-4)'}}>
        <div class="pill-tabs">
          <button class="pill-tab active"   data-tab-group="invite" data-tab="email">Email</button>
         
        </div>
        <div data-tab-panel="invite" data-tab="email" style={{display:'flex', flexDirection:'column', gap:'var(--space-4)'}}>
              <div className="field">
                <label className="field-label">Email</label>
                <input 
                  value={inviteEmail} 
                  onChange={(e) => setInviteEmail(e.target.value)} 
                  className="input" 
                  type="email" 
                  placeholder="teammate@company.com"
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
          <button class="btn btn-primary" style={{alignSelf:'flex-start'}} onClick={handleInvite} >Add Member</button>
        </div>
        <div data-tab-panel="invite" data-tab="code" class="hidden" style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', border:'1px dashed var(--color-border-strong)', borderRadius:'var(--radius-lg)', padding:'24px 0'}}>
          <p style={{fontSize:'22px', fontWeight:'600', letterSpacing:'.1em'}}>TF-8X92-KLQ1</p>
          <button class="btn btn-outline btn-sm" ><span class="icon icon-sm" data-icon="copy"></span>Copy code</button>
          <p class="field-hint" style={{textAlign:'center', maxWidth:'280px'}}>Share this code with your teammate — they can use it to join this workspace.</p>
        </div>
      </div>
    </div>
  </div>

  )
}
       </>
       
    )
}
export default Members;