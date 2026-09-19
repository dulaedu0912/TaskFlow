import express from "express";
import {
  getComments,
  addComment,
  deleteComment
} from "../controllers/commentController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/tasks/:taskId/comments", getComments);
router.post("/tasks/:taskId/comments", addComment);
router.delete("/comments/:id", deleteComment);

export default router;
