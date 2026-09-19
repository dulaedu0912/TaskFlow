import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const populateProject = (query) => {
  return query
    .populate("owner", "name email")
    .populate("members", "name email");
};

export const createProject = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Project title is required");
  }

  const project = await Project.create({
    title,
    description,
    owner: req.user._id,
    members: [req.user._id]
  });

  const populatedProject = await populateProject(
    Project.findById(project._id)
  );

  res.status(201).json({
    success: true,
    project: populatedProject
  });
});

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await populateProject(
    Project.find({ members: req.user._id }).sort({ createdAt: -1 })
  );

  res.json({
    success: true,
    projects
  });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await populateProject(
    Project.findOne({
      _id: req.params.id,
      members: req.user._id
    })
  );

  if (!project) {
    res.status(404);
    throw new Error("Project not found or access denied");
  }

  res.json({
    success: true,
    project
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only project owner can update project");
  }

  const { title, description } = req.body;

  project.title = title ?? project.title;
  project.description = description ?? project.description;

  await project.save();

  const updatedProject = await populateProject(
    Project.findById(project._id)
  );

  res.json({
    success: true,
    project: updatedProject
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only project owner can delete project");
  }

  const tasks = await Task.find({ project: project._id }).select("_id");
  const taskIds = tasks.map((task) => task._id);

  await Comment.deleteMany({ task: { $in: taskIds } });
  await Task.deleteMany({ project: project._id });
  await Project.deleteOne({ _id: project._id });

  res.json({
    success: true,
    message: "Project deleted successfully"
  });
});

export const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Member email is required");
  }

  const project = await Project.findOne({
    _id: req.params.id,
    members: req.user._id
  });

  if (!project) {
    res.status(404);
    throw new Error("Project not found or access denied");
  }

  const userToAdd = await User.findOne({ email });

  if (!userToAdd) {
    res.status(404);
    throw new Error("User not found");
  }

  const alreadyMember = project.members.some(
    (memberId) => memberId.toString() === userToAdd._id.toString()
  );

  if (alreadyMember) {
    res.status(400);
    throw new Error("User is already a member");
  }

  project.members.push(userToAdd._id);
  await project.save();

  const updatedProject = await populateProject(
    Project.findById(project._id)
  );

  res.json({
    success: true,
    project: updatedProject
  });
});
