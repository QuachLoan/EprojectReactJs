// function KPI(){
//     return(
//     <>
//         <div class="grid-stats">
//             <div class="card stat-card">
//               <span class="stat-card-icon tone-primary"><span class="icon" data-icon="listTodo">
//                 <svg viewBox="0 0 24 24"><path d="M13 5h8"></path><path d="M13 12h8"></path><path d="M13 19h8"></path><path d="m3 17 2 2 4-4"></path><rect x="3" y="4" width="6" height="6" rx="1"></rect></svg>
//                 </span></span>
//               <div><p class="stat-card-label">Total Tasks</p><p class="stat-card-value">37</p></div>
//             </div>
//             <div class="card stat-card">
//               <span class="stat-card-icon tone-warning"><span class="icon" data-icon="loader">
//                 <svg viewBox="0 0 24 24"><path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path></svg>
//                 </span></span>
//               <div><p class="stat-card-label">In Progress</p><p class="stat-card-value">9</p></div>
//             </div>
//             <div class="card stat-card">
//               <span class="stat-card-icon tone-success"><span class="icon" data-icon="checkCircle2">
//                 <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="m16 9-5.5 5.5L8 12"></path></svg>
//                 </span></span>
//               <div><p class="stat-card-label">Completed</p><p class="stat-card-value">14</p></div>
//             </div>
//             <div class="card stat-card">
//               <span class="stat-card-icon tone-danger"><span class="icon" data-icon="alertTriangle">
//                 <svg viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
//                 </span></span>
//               <div><p class="stat-card-label">Overdue</p><p class="stat-card-value">3</p></div>
//             </div>
//         </div>
//         </>
//     )
// }
// export default KPI;


import React, { useState, useEffect, useMemo } from 'react';

function KPI() {
    // 1. Khai báo State để lưu trữ danh sách tasks tải về từ Backend
    const [tasks, setTasks] = useState([]);

    // 2. Viết hàm useEffect để tự động gọi API lấy dữ liệu ngay khi mở trang
    useEffect(() => {
        const token = localStorage.getItem('token'); // Lấy mã đăng nhập token

        // Gọi tới đúng URL API của Router Task hoặc Project của bạn
      fetch('http://localhost:3000/api/task', { 
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          }
      })
        .then(res => {
            if (!res.ok) throw new Error("Không thể tải dữ liệu KPI");
            return res.json();
        })
        .then(data => {
            // Đảm bảo dữ liệu đổ vào setTasks phải là một Mảng []
            // Nếu API trả về dạng { tasks: [...] } thì sửa thành: setTasks(data.tasks)
            if (Array.isArray(data)) {
                setTasks(data);
            } else if (data && Array.isArray(data.tasks)) {
                setTasks(data.tasks);
            }
        })
        .catch(err => console.error("Lỗi khi đồng bộ dữ liệu KPI từ Backend:", err));
    }, []);

    // 3. Khối logic useMemo tính toán số liệu (Giữ nguyên cấu trúc thông minh của bạn)
    const stats = useMemo(() => {
        const totalTasks = tasks.length;
        
        const inProgressTasks = tasks.filter(
            task => String(task.status).toLowerCase() === 'in progress' || String(task.status).toLowerCase() === 'in_progress'
        ).length;

        const completedTasks = tasks.filter(
            task => String(task.status).toLowerCase() === 'done' || String(task.status).toLowerCase() === 'completed'
        ).length;

        const overdueTasks = tasks.filter(task => {
            const statusLower = String(task.status).toLowerCase();
            const isNotDone = statusLower !== 'done' && statusLower !== 'completed';
            
            if (isNotDone && task.date) {
                const deadline = new Date(task.date);
                const now = new Date();
                return deadline < now;
            }
            return false;
        }).length;

        return { totalTasks, inProgressTasks, completedTasks, overdueTasks };
    }, [tasks]);

    // 4. Khối giao diện HTML/CSS chuẩn gốc của bạn
    return (
        <>
        <div className="grid-stats">
            {/* Card 1: Total Tasks */}
            <div className="card stat-card">
              <span className="stat-card-icon tone-primary">
                <span className="icon" data-icon="listTodo">
                  <svg viewBox="0 0 24 24"><path d="M13 5h8"></path><path d="M13 12h8"></path><path d="M13 19h8"></path><path d="m3 17 2 2 4-4"></path><rect x="3" y="4" width="6" height="6" rx="1"></rect></svg>
                </span>
              </span>
              <div>
                <p className="stat-card-label">Total Tasks</p>
                <p className="stat-card-value">{stats.totalTasks}</p>
              </div>
            </div>

            {/* Card 2: In Progress */}
            <div className="card stat-card">
              <span className="stat-card-icon tone-warning">
                <span className="icon" data-icon="loader">
                  <svg viewBox="0 0 24 24"><path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path></svg>
                </span>
              </span>
              <div>
                <p className="stat-card-label">In Progress</p>
                <p className="stat-card-value">{stats.inProgressTasks}</p>
              </div>
            </div>

            {/* Card 3: Completed */}
            <div className="card stat-card">
              <span className="stat-card-icon tone-success">
                <span className="icon" data-icon="checkCircle2">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="m16 9-5.5 5.5L8 12"></path></svg>
                </span>
              </span>
              <div>
                <p className="stat-card-label">Completed</p>
                <p className="stat-card-value">{stats.completedTasks}</p>
              </div>
            </div>

            {/* Card 4: Overdue */}
            <div className="card stat-card">
              <span className="stat-card-icon tone-danger">
                <span className="icon" data-icon="alertTriangle">
                  <svg viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                </span>
              </span>
              <div>
                <p className="stat-card-label">Overdue</p>
                <p className="stat-card-value">{stats.overdueTasks}</p>
              </div>
            </div>
        </div>
        </>
    );
}

export default KPI;
