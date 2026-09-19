import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/dashboard/stats");
        setStats(data.stats);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="page">
      <h1>Dashboard</h1>

      {error && <p className="error">{error}</p>}

      {!stats ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="grid">
          <div className="card">
            <h3>Total Projects</h3>
            <p>{stats.totalProjects}</p>
          </div>

          <div className="card">
            <h3>Total Tasks</h3>
            <p>{stats.totalTasks}</p>
          </div>

          <div className="card">
            <h3>Completed Tasks</h3>
            <p>{stats.completedTasks}</p>
          </div>

          <div className="card">
            <h3>In Progress</h3>
            <p>{stats.inProgressTasks}</p>
          </div>

          <div className="card">
            <h3>To Do</h3>
            <p>{stats.todoTasks}</p>
          </div>
        </div>
      )}

      <Link to="/projects">Go to Projects</Link>
    </div>
  );
};

export default Dashboard;
