import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

const TaskDetails = () => {
  const { taskId } = useParams();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const fetchTask = async () => {
    try {
      const { data } = await api.get(`/tasks/${taskId}`);
      setTask(data.task);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load task");
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/tasks/${taskId}/comments`);
      setComments(data.comments);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load comments");
    }
  };

  useEffect(() => {
    fetchTask();
    fetchComments();
  }, [taskId]);

  const updateStatus = async (e) => {
    const status = e.target.value;

    try {
      const { data } = await api.patch(`/tasks/${taskId}/status`, {
        status
      });

      setTask(data.task);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post(`/tasks/${taskId}/comments`, { content });
      setContent("");
      fetchComments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment");
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete comment");
    }
  };

  if (!task) {
    return <div className="page">Loading task...</div>;
  }

  return (
    <div className="page">
      <div className="section-card">
        <Link to={`/projects/${task.project?._id}`}>
          ← Back to {task.project?.title}
        </Link>

        <h1 style={{ marginTop: "14px" }}>{task.title}</h1>
        <p className="muted">{task.description}</p>

        <div className="detail-grid">
          <div className="card">
            <h3>Status</h3>
            <select value={task.status} onChange={updateStatus}>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="card">
            <h3>Priority</h3>
            <p>{task.priority}</p>
          </div>

          <div className="card">
            <h3>Due Date</h3>
            <p>
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : "No due date"}
            </p>
          </div>

          <div className="card">
            <h3>Assigned To</h3>
            <p>{task.assignedTo?.name || "Unassigned"}</p>
          </div>

          <div className="card">
            <h3>Created By</h3>
            <p>{task.createdBy?.name}</p>
          </div>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="section-card comment-box">
        <h2>Comments</h2>

        <form className="form" onSubmit={addComment}>
          <textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
          />

          <button type="submit">Add Comment</button>
        </form>

        <div className="list" style={{ marginTop: "20px" }}>
          {comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div className="comment" key={comment._id}>
                <div className="list-item-top">
                  <div>
                    <strong>{comment.author?.name}</strong>
                    <p>{comment.content}</p>
                    <small className="muted">
                      {new Date(comment.createdAt).toLocaleString()}
                    </small>
                  </div>

                  <button
                    className="danger"
                    onClick={() => deleteComment(comment._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
