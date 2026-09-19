import express from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember
} from "../controllers/projectController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").post(createProject).get(getProjects);
router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);
router.post("/:id/members", addMember);

export default router;
