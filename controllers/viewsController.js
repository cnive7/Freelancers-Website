const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");
const Cv = require("../models/cvModel");
const User = require("../models/userModel");
const LandingConfig = require("../models/landingConfigModel");
const Message = require("../models/messageModel");
const Group = require("../models/groupModel");
const Project = require("../models/projectModel");
const path = require("path");

const mongoose = require("mongoose");
const pug = require("pug");
const {
  categoryOptions,
  categoryOptions_clean,
} = require("../utils/variables");

exports.createCv = catchAsync(async (req, res, next) => {
  const cv = await Cv.findOne({ user: req.user._id });
  const options = {
    title: "Crear perfil",
    formAction: "create",
    page: "completar-perfil",
  };
  cv && (options.cv = cv);
  res.status(200).render("completeProfile", options);
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render("login", {
    title: "Iniciar Sesión",
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  res.status(200).render("registrarse", {
    title: "Registrarse",
    page: "registrarse",
  });
});

exports.signupAdmin = catchAsync(async (req, res, next) => {
  res.status(200).render("registrarse", {
    title: "Registrarse",
    page: "registrarseAdmin",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  res.status(200).render("resetPassword", {
    title: "Recupera tu contraseña",
    token: req.params.token,
  });
});

exports.myAccount = catchAsync(async (req, res, next) => {
  const cv = await Cv.findOne({ user: req.user._id });
  const options = {
    title: "Mi cuenta",
    formAction: "update",
    page: "mi-cuenta",
  };
  cv && (options.cv = cv);
  res.status(200).render("myAccount", options);
});

exports.contact = catchAsync(async (req, res, next) => {
  const toId =
    process.env.NODE_ENV === "production"
      ? process.env.ADMIN_ID
      : process.env.ADMIN_ID_LOCAL;
  const to = await User.findOne({ _id: toId });
  res.status(200).render("contact", {
    to: {
      user: toId,
      photo: to.photo,
    },
    page: "contacto",
  });
});

const paginate = function (array, page_number, page_size) {
  // Human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
};

exports.freelancersUncompleted = catchAsync(async (req, res, next) => {
  const freelancersUncompleted = [];
  const FREELANCERS_MAX_PER_PAGE = 25;
  const users = await User.find();
  await Promise.all(
    users.map(async (user) => {
      const hasCv = await Cv.findOne({ user: user._id });
      if (!hasCv) {
        freelancersUncompleted.push(user);
      }
    })
  );
  const freelancersUncompletedSorted = freelancersUncompleted.sort(function (
    a,
    b
  ) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  const page = req.query.page || 1;
  const freelancersUncompletedPaginated = paginate(
    freelancersUncompletedSorted,
    page,
    FREELANCERS_MAX_PER_PAGE
  );
  const totalPages = Math.ceil(
    freelancersUncompleted.length / FREELANCERS_MAX_PER_PAGE
  );
  res.status(200).render("freelancersUncompleted", {
    title: "Freelancers sin perfil completo",
    freelancers: freelancersUncompletedPaginated,
    page: "freelancersUncompleted",
    query: req.query,
    totalPages: totalPages,
  });
});

exports.freelancers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Cv.find().populate("user"), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // Here works the query middleware .pre() (before query is executed)
  const freelancers = await features.query;
  const count = await Cv.countDocuments();
  const totalPages = Math.ceil(count / 25);
  res.status(200).render("freelancers", {
    title: "Freelancers",
    freelancers: freelancers,
    page: "freelancers",
    query: req.query,
    totalPages: totalPages,
  });
});

exports.getFreelancer = catchAsync(async (req, res, next) => {
  const freelancer = await Cv.findOne({ user: req.params.id }).populate("user");
  if (!freelancer) {
    return next(new AppError("No existe el freelancer", 404));
  }
  res.status(200).render("freelancer", {
    title: `Freelancer - ${freelancer.user.name} ${freelancer.user.lastName}`,
    freelancer: freelancer,
    page: "freelancers",
  });
});

exports.getFreelancerWithProposal = catchAsync(async (req, res, next) => {
  const freelancer = await Cv.findOne({ user: req.params.id }).populate("user");
  if (!freelancer) {
    return next(new AppError("No existe el freelancer", 404));
  }
  const project = await Project.findById(req.params.projectId);
  console.log(req.params.projectId);
  console.log(project);
  const proposal = project.postulated.find(
    (el) => el._id.toString() === req.params.proposalId.toString()
  );
  console.log(req.params.proposalId);
  proposal.projectName = project.title;
  res.status(200).render("freelancer", {
    title: `Freelancer - ${freelancer.user.name} ${freelancer.user.lastName}`,
    freelancer: freelancer,
    page: "freelancers",
    proposal: proposal,
  });
});

exports.home = catchAsync(async (req, res, next) => {
  const landingConfig = await LandingConfig.findOne();
  res.status(200).render("landing", {
    title: `La comunidad creativa #1 de América`,
    home: true,
    landing: landingConfig,
  });
});

exports.landingConfig = catchAsync(async (req, res, next) => {
  const landingConfig = await LandingConfig.findOne();
  res.status(200).render("landingConfig", {
    title: `Administrar landing page`,
    page: "landingConfig",
    landing: landingConfig,
  });
});

exports.groups = catchAsync(async (req, res, next) => {
  const groups = await Group.find();
  res.status(200).render("groups", {
    title: `Grupos de freelancers selectos`,
    groups: groups,
    page: "groups",
  });
});

exports.group = catchAsync(async (req, res, next) => {
  const group = await Group.findOne({ _id: req.params.id }).populate(
    "users.id"
  );
  if (!group) {
    return next(new AppError("No existe el grupo", 404));
  }
  res.status(200).render("group", {
    title: `Grupos - ${group.name}`,
    group: group,
    page: "groups",
  });
});

exports.message = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.id });
  if (!user) {
    return next(new AppError("No existe el usuario", 404));
  }
  res.status(200).render("message", {
    title: `Mensajes - ${user.name} ${user.lastName}`,
    name: `${user.name} ${user.lastName}`,
    freelancer: { id: user._id, photo: user.photo },
    page: "messages",
  });
});

exports.messages = catchAsync(async (req, res, next) => {
  //
  const messages = await Message.aggregate([
    {
      $match: {
        $or: [{ to: req.user._id }, { from: req.user._id }],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          last_message_between: {
            $cond: [
              {
                $eq: ["$to", req.user._id],
              },
              {
                $concat: [
                  { $toString: "$to" },
                  " and ",
                  { $toString: "$from" },
                ],
              },
              {
                $concat: [
                  { $toString: "$from" },
                  " and ",
                  { $toString: "$to" },
                ],
              },
            ],
          },
        },
        message: { $first: "$$ROOT" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "message.from",
        foreignField: "_id",
        as: "message.user_sender",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "message.to",
        foreignField: "_id",
        as: "message.user_receiver",
      },
    },
  ]).sort({ "message.createdAt": -1 });
  res.status(200).render("messages", {
    title: `Todos los Mensajes`,
    messages: messages,
    page: "messages",
  });
});

exports.projects = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Project.find().sort("-createdAt"), req.query)
    .filterForProjects()
    .sort()
    .limitFields()
    .paginate();
  const projects = await features.query;
  const count = await Project.countDocuments();
  const totalPages = Math.ceil(count / 25);
  res.status(200).render("viewProjects", {
    title: "Proyectos",
    page: "projects",
    projects: projects,
    query: req.query,
    totalPages: totalPages,
    categoryOptions: categoryOptions,
    categoryOptions_clean: categoryOptions_clean,
  });
});

exports.newProject = catchAsync(async (req, res, next) => {
  res.status(200).render("createProject", {
    title: "Nuevo proyecto",
    page: "projects",
    categoryOptions: categoryOptions,
    categoryOptions_clean: categoryOptions_clean,
  });
});

exports.editProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  res.status(200).render("createProject", {
    title: "Editar proyecto",
    page: "projects",
    categoryOptions: categoryOptions,
    categoryOptions_clean: categoryOptions_clean,
    editProject: project,
  });
});

exports.projectPostulates = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate("postulated.id")
    .populate("postulated.cv");
  res.status(200).render("projectPostulates", {
    title: "Postulados",
    page: "projects",
    project: project.postulated,
    projectId: project._id,
    projectTitle: project.title,
  });
});

exports.viewProjects = catchAsync(async (req, res, next) => {
  console.log(req.query);
  const features = new APIFeatures(Project.find().sort("-createdAt"), req.query)
    .filterForProjects()
    .sort()
    .limitFields()
    .paginateProjects();
  const projects = await features.query;
  const count = await Project.countDocuments();
  const totalPages = Math.ceil(count / 10);
  res.status(200).render("viewProjects", {
    title: "Proyectos",
    page: "proyectos",
    projects: projects,
    query: req.query,
    totalPages: totalPages,
    categoryOptions: categoryOptions,
    categoryOptions_clean: categoryOptions_clean,
  });
});

// Helpers

exports.selectGroup = catchAsync(async (req, res, next) => {
  const groups = await Group.find();
  const freelancerId = req.params.userId;
  res.status(200).render("components/selectGroup.pug", {
    groups: groups,
    freelancerId: freelancerId,
  });
});
