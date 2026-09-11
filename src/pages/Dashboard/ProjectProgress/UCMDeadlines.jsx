function UCMDeadlines(){
    return(
    <>
       <div class="card panel">
              <h2 class="panel-title">Upcoming Deadlines</h2>
              <div class="panel-list">
                <a href="project-board.html?task=p1-t4" class="panel-row">
                  <span class="panel-row-meta" style={{width:'52px', flexShrink:'0'}}>Sep 14</span>
                  <span class="panel-row-title">Prepare capstone presentation</span>
                  <span class="priority-badge" style={{color:'#2563eb', background:'#eff6ff'}}><span class="icon icon-xs" data-icon="arrowDown">
                    <svg viewBox="0 0 24 24"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>
                    </span>Low</span>
                </a>
                <a href="project-board.html?task=p1-t2" class="panel-row">
                  <span class="panel-row-meta" style={{width:'52px', flexShrink:'0'}}>Sep 5</span>
                  <span class="panel-row-title">Create project settings page</span>
                  <span class="priority-badge" style={{color:'#f59e0b', background:'#fffbeb'}}><span class="icon icon-xs" data-icon="minus">
                    <svg viewBox="0 0 24 24"><path d="M5 12h14"></path></svg>
                    </span>Medium</span>
                </a>
                <a href="project-board.html?task=p1-t1" class="panel-row">
                  <span class="panel-row-meta" style={{width:'52px', flexShrink:'0'}}>Sep 2</span>
                  <span class="panel-row-title">Design authentication flow</span>
                  <span class="priority-badge" style={{color:'#f97316', background:'#fff7ed'}}><span class="icon icon-xs" data-icon="arrowUp">
                    <svg viewBox="0 0 24 24"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>
                    </span>High</span>
                </a>
              </div>
            </div>
        </>
    )
}
export default UCMDeadlines;