import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";

const getTaskIfMember = async (taskId, userId) => {
  const task = await Task.findById(taskId).populate({
    path: "project",
    select: "members"
  });

  if (!task || !task.project) return null;

  const isMember = task.project.members.some(
    (memberId) => memberId.toString() === userId.toString()
  );

  if (!isMember) return null;

  return task;
};

export const getComments = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await getTaskIfMember(taskId, req.user._id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found or access denied");
  }

  const comments = await Comment.find({ task: taskId })
    .populate("author", "name email avatar")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    comments
  });
});

export const addComment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;

  if (!content) {
    res.status(400);
    throw new Error("Comment content is required");
  }

  const task = await getTaskIfMember(taskId, req.user._id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found or access denied");
  }

  const comment = await Comment.create({
    content,
    task: taskId,
    author: req.user._id
  });

  const populatedComment = await Comment.findById(comment._id).populate(
    "author",
    "name email avatar"
  );

  res.status(201).json({
    success: true,
    comment: populatedComment
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only comment author can delete comment");
  }

  await Comment.deleteOne({ _id: comment._id });

  res.json({
    success: true,
    message: "Comment deleted successfully"
  });
});
