import Project from "../models/Project.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    members: req.user._id
  }).select("_id");

  const projectIds = projects.map((project) => project._id);

  const totalProjects = projects.length;

  const totalTasks = await Task.countDocuments({
    project: { $in: projectIds }
  });

  const completedTasks = await Task.countDocuments({
    project: { $in: projectIds },
    status: "done"
  });

  const inProgressTasks = await Task.countDocuments({
    project: { $in: projectIds },
    status: "in-progress"
  });

  const todoTasks = await Task.countDocuments({
    project: { $in: projectIds },
    status: "todo"
  });

  res.json({
    success: true,
    stats: {
      totalProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks
    }
  });
});
