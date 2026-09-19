import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Comment from "../models/Comment.js";
import asyncHandler from "../utils/asyncHandler.js";

const getProjectIfMember = async (projectId, userId) => {
  return await Project.findOne({
    _id: projectId,
    members: userId
  });
};

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

export const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, description, status, priority, dueDate, assignedTo } =
    req.body;

  if (!title) {
    res.status(400);
    throw new Error("Task title is required");
  }

  const project = await getProjectIfMember(projectId, req.user._id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found or access denied");
  }

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate,
    assignedTo: assignedTo || null,
    project: projectId,
    createdBy: req.user._id
  });

  const populatedTask = await Task.findById(task._id)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  res.status(201).json({
    success: true,
    task: populatedTask
  });
});

export const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { status, priority, search } = req.query;

  const project = await getProjectIfMember(projectId, req.user._id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found or access denied");
  }

  const filter = { project: projectId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.title = { $regex: search, $options: "i" };

  const tasks = await Task.find(filter)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    tasks
  });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate({
      path: "project",
      select: "title members"
    })
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const isMember = task.project.members.some(
    (memberId) => memberId.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error("Access denied");
  }

  res.json({
    success: true,
    task
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await getTaskIfMember(req.params.id, req.user._id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found or access denied");
  }

  const { title, description, status, priority, dueDate, assignedTo } =
    req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (assignedTo !== undefined) task.assignedTo = assignedTo || null;

  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  res.json({
    success: true,
    task: updatedTask
  });
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["todo", "in-progress", "done"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const task = await getTaskIfMember(req.params.id, req.user._id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found or access denied");
  }

  task.status = status;
  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  res.json({
    success: true,
    task: updatedTask
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await getTaskIfMember(req.params.id, req.user._id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found or access denied");
  }

  await Comment.deleteMany({ task: task._id });
  await Task.deleteOne({ _id: task._id });

  res.json({
    success: true,
    message: "Task deleted successfully"
  });
});
