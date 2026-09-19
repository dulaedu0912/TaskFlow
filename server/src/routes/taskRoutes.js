import express from "express";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/projects/:projectId/tasks", createTask);
router.get("/projects/:projectId/tasks", getTasks);

router.get("/tasks/:id", getTask);
router.put("/tasks/:id", updateTask);
router.patch("/tasks/:id/status", updateTaskStatus);
router.delete("/tasks/:id", deleteTask);

export default router;
