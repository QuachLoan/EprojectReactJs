function RecentActivity(){
    return(
    <>
        <div className="card panel">
              <h2 className="panel-title">Recent Activity</h2>
              <ol className="timeline">
                <li className="timeline-item">
                  <span className="timeline-icon action-completed"><span className="icon icon-sm" data-icon="checkCircle2">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="m16 9-5.5 5.5L8 12"></path></svg>
                    </span></span>
                  <div className="timeline-content"><p className="timeline-text"><strong>Ngô Lâm</strong> marked "Design system tokens" as done</p><p className="timeline-time">2 hours ago</p></div>
                </li>
                <li className="timeline-item">
                  <span className="timeline-icon action-commented"><span className="icon icon-sm" data-icon="messageSquare">
                    <svg viewBox="0 0 24 24"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"></path></svg>
                    </span></span>
                  <div className="timeline-content"><p className="timeline-text"><strong>Quách Loan</strong> commented on "Implement login API"</p><p className="timeline-time">5 hours ago</p></div>
                </li>
                <li className="timeline-item">
                  <span className="timeline-icon action-moved"><span className="icon icon-sm" data-icon="arrowRightLeft">
                    <svg viewBox="0 0 24 24"><path d="m16 3 4 4-4 4"></path><path d="M20 7H4"></path><path d="m8 21-4-4 4-4"></path><path d="M4 17h16"></path></svg>
                    </span></span>
                  <div className="timeline-content"><p className="timeline-text"><strong>Khánh Ngọc</strong> moved "Mobile responsive layout" to In Progress</p><p className="timeline-time">1 day ago</p></div>
                </li>
                <li className="timeline-item">
                  <span className="timeline-icon action-created"><span className="icon icon-sm" data-icon="plusCircle">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>
                    </span></span>
                  <div className="timeline-content"><p className="timeline-text"><strong>Cao Sơn</strong> created "Prepare capstone presentation"</p><p className="timeline-time">2 days ago</p></div>
                </li>
              </ol>
        </div>
    </>
    )
}
export default RecentActivity;