import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

const ProjectDetails = () => {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const [error, setError] = useState("");

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}`);
      setProject(data.project);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project");
    }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}/tasks`);
      setTasks(data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    }
  };

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [projectId]);

  const createTask = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post(`/projects/${projectId}/tasks`, {
        title,
        description,
        priority,
        dueDate: dueDate || undefined
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");

      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task status");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    }
  };

  if (!project) {
    return <div className="page">Loading project...</div>;
  }

  return (
    <div className="page">
      <div className="section-card">
        <h1>{project.title}</h1>
        <p className="muted">{project.description}</p>
        <p className="muted">Owner: {project.owner?.name}</p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="section-card">
        <h2>Create Task</h2>

        <form className="form" onSubmit={createTask}>
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <button type="submit">Create Task</button>
        </form>
      </div>

      <div className="section-card">
        <h2>Tasks</h2>

        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <div className="list">
            {tasks.map((task) => (
              <div className="list-item" key={task._id}>
                <div className="list-item-top">
                  <div>
                    <div className="task-title">{task.title}</div>
                    <p className="muted">{task.description}</p>

                    <div className="badges">
                      <span className="badge">Priority: {task.priority}</span>
                      <span className="badge">Status: {task.status}</span>
                      <span className="badge">
                        Created By: {task.createdBy?.name}
                      </span>
                      <span className="badge">
                        Assigned To: {task.assignedTo?.name || "Unassigned"}
                      </span>
                    </div>
                  </div>

                  <div className="actions">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        updateTaskStatus(task._id, e.target.value)
                      }
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>

                    <Link to={`/tasks/${task._id}`}>Details</Link>

                    <button
                      className="danger"
                      onClick={() => deleteTask(task._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
