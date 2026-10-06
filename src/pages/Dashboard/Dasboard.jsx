import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { fetchTasksByWeek } from "../../../api"; // import từ api.jsx

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard({ projectId }) {
  const [completedByWeek, setCompletedByWeek] = useState([]);

  useEffect(() => {
    // Gọi API lấy số task theo tuần
    fetchTasksByWeek(projectId)
      .then(res => {
        // API trả về tất cả task theo tuần, ta lọc chỉ task hoàn thành
        const doneTasks = res.data.filter(t => t.status === "Done" || t.weekNumber);
        setCompletedByWeek(doneTasks);
      })
      .catch(err => console.error("Error:", err));
  }, [projectId]);

  const chartData = {
    labels: completedByWeek.map(d => d.week),
    datasets: [
      {
        label: "Task hoàn thành",
        data: completedByWeek.map(d => d.tasks),
        backgroundColor: "rgba(54,162,235,0.7)"
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Số Task hoàn thành theo tuần" }
    }
  };

  return (
    <main className="page-content">
      <div className="page-content-inner stack">
        <h1>Welcome back, Cao</h1>
        <p className="page-subtitle">Biểu đồ số task hoàn thành theo tuần</p>

        <div className="grid-3">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
