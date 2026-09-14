function AdminMorder(){
    return(
        <>
<main className="page-content">
      <div className="page-content-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="icon icon-lg" data-icon="flag" style={{ color: 'var(--color-primary-600)' }}>
            <svg viewBox="0 0 24 24">
              <path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"></path>
            </svg>
          </span>
          <h1>Admin · Moderation</h1>
        </div>
        <p className="page-subtitle" style={{ marginBottom: 'var(--space-6)' }}>
          Review reported tasks and comments.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          
          {/* Item 1 */}
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-neutral">comment</span>
                  <span className="badge badge-warning">pending</span>
                </div>
                <p style={{ marginTop: '6px', fontSize: '14px' }}>
                  Off-topic content unrelated to the task.
                </p>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-subtle)' }}>
                  <span className="avatar avatar-xs" style={{ background: '#db2777' }}>
                    KN
                  </span>
                  Reported by Khánh Ngọc · 1 day ago
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  className="suspend-btn" 
                  onClick={() => handleShowToast('Report dismissed', null, 'success')}
                >
                  <span className="icon icon-sm" data-icon="x">
                    <svg viewBox="0 0 24 24">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </span>
                  Dismiss
                </button>
                <button 
                  className="suspend-btn" 
                  style={{ borderColor: 'var(--color-success-border)', background: 'var(--color-success-bg)', color: 'var(--color-success)' }} 
                  onClick={() => handleShowToast('Report reviewed', null, 'success')}
                >
                  <span className="icon icon-sm" data-icon="check">
                    <svg viewBox="0 0 24 24">
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </span>
                  Mark reviewed
                </button>
                <button 
                  className="suspend-btn" 
                  style={{ borderColor: 'var(--color-danger-border)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }} 
                  onClick={() => handleShowToast('Content removed', null, 'success')}
                >
                  <span className="icon icon-sm" data-icon="trash2">
                    <svg viewBox="0 0 24 24">
                      <path d="M10 11v6"></path>
                      <path d="M14 11v6"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                      <path d="M3 6h18"></path>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </span>
                  Remove content
                </button>
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-neutral">task</span>
                  <span className="badge badge-warning">pending</span>
                </div>
                <p style={{ marginTop: '6px', fontSize: '14px' }}>
                  Duplicate of an existing task.
                </p>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-subtle)' }}>
                  <span className="avatar avatar-xs" style={{ background: '#16a34a' }}>
                    NL
                  </span>
                  Reported by Ngô Lâm · 2 days ago
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  className="suspend-btn" 
                  onClick={() => handleShowToast('Report dismissed', null, 'success')}
                >
                  <span className="icon icon-sm" data-icon="x">
                    <svg viewBox="0 0 24 24">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </span>
                  Dismiss
                </button>
                <button 
                  className="suspend-btn" 
                  style={{ borderColor: 'var(--color-success-border)', background: 'var(--color-success-bg)', color: 'var(--color-success)' }} 
                  onClick={() => handleShowToast('Report reviewed', null, 'success')}
                >
                  <span className="icon icon-sm" data-icon="check">
                    <svg viewBox="0 0 24 24">
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </span>
                  Mark reviewed
                </button>
                <button 
                  className="suspend-btn" 
                  style={{ borderColor: 'var(--color-danger-border)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }} 
                  onClick={() => handleShowToast('Content removed', null, 'success')}
                >
                  <span className="icon icon-sm" data-icon="trash2">
                    <svg viewBox="0 0 24 24">
                      <path d="M10 11v6"></path>
                      <path d="M14 11v6"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                      <path d="M3 6h18"></path>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </span>
                  Remove content
                </button>
              </div>
            </div>
          </div>

          {/* Item 3 */}
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-neutral">comment</span>
              <span className="badge badge-neutral">dismissed</span>
            </div>
            <p style={{ marginTop: '6px', fontSize: '14px' }}>
              Reported by mistake.
            </p>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-subtle)' }}>
              <span className="avatar avatar-xs" style={{ background: '#0ea5e9' }}>
                QL
              </span>
              Reported by Quách Loan · 5 days ago
            </div>
          </div>

          {/* Item 4 */}
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-neutral">task</span>
              <span className="badge badge-success">reviewed</span>
            </div>
            <p style={{ marginTop: '6px', fontSize: '14px' }}>
              Contains outdated internal links.
            </p>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-subtle)' }}>
              <span className="avatar avatar-xs" style={{ background: '#0ea5e9' }}>
                QL
              </span>
              Reported by Quách Loan · 1 week ago
            </div>
          </div>

        </div>
      </div>
    </main>        
    </>
    )
}
export default AdminMorder;