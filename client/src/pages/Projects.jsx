import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data.projects);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/projects", {
        title,
        description
      });

      setProjects([data.project, ...projects]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter((project) => project._id !== projectId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete project");
    }
  };

  return (
    <div className="page">
      <h1>Projects</h1>

      {error && <p className="error">{error}</p>}

      <div className="section-card">
        <h2>Create Project</h2>

        <form className="form" onSubmit={createProject}>
          <input
            type="text"
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <button type="submit">Create Project</button>
        </form>
      </div>

      <div className="section-card">
        <h2>Your Projects</h2>

        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          <div className="list">
            {projects.map((project) => (
              <div className="list-item" key={project._id}>
                <div className="list-item-top">
                  <div>
                    <h3>{project.title}</h3>
                    <p className="muted">{project.description}</p>
                    <p className="muted">Owner: {project.owner?.name}</p>
                  </div>

                  <div className="actions">
                    <Link to={`/projects/${project._id}`}>Open</Link>
                    <button
                      className="danger"
                      onClick={() => deleteProject(project._id)}
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

export default Projects;
