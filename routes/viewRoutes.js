const express = require("express");
const viewsController = require("../controllers/viewsController");
const authController = require("../controllers/authController");
const messageController = require("../controllers/messageController");

const router = express.Router();

router.get(
  "/completar-perfil",
  authController.protect,
  viewsController.createCv
);

router.get("/contacto", authController.protect, viewsController.contact);

router.get(
  "/proyectos",
  authController.isLoggedIn,
  viewsController.viewProjects
);

router.get(
  "/",
  authController.isLoggedIn,
  messageController.hasUnreadMessages,
  viewsController.home
);

router.get(
  "/mi-cuenta",
  authController.protect,
  messageController.hasUnreadMessages,
  viewsController.myAccount
);

router.get("/login", authController.isLoggedIn, viewsController.login);
router.get("/registrarse", authController.isLoggedIn, viewsController.signup);
router.get("/resetPassword/:token", viewsController.resetPassword);

//'admin'

router.get(
  "/registrarse-admin",
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.signupAdmin
);

router.get(
  "/freelancers",
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo("admin"),
  messageController.hasUnreadMessages,
  viewsController.freelancers
);

router.get(
  "/freelancers-uncompleted",
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo("admin"),
  messageController.hasUnreadMessages,
  viewsController.freelancersUncompleted
);

router.get(
  "/freelancers/:id",
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo("admin"),
  messageController.hasUnreadMessages,
  viewsController.getFreelancer
);

router.get(
  "/freelancers/:id/:projectId/:proposalId",
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo("admin"),
  messageController.hasUnreadMessages,
  viewsController.getFreelancerWithProposal
);

router.get(
  "/groups",
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo("admin"),
  messageController.hasUnreadMessages,
  viewsController.groups
);

router.get(
  "/group/:id",
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo("admin"),
  messageController.hasUnreadMessages,
  viewsController.group
);

router.get(
  "/messages/:id",
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo("admin"),
  messageController.hasUnreadMessages,
  viewsController.message
);

router.get(
  "/messages",
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo("admin"),
  messageController.hasUnreadMessages,
  viewsController.messages
);

router.get(
  "/landing",
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo("admin"),
  messageController.hasUnreadMessages,
  viewsController.landingConfig
);

router.get(
  "/projects",
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo("admin"),
  messageController.hasUnreadMessages,
  viewsController.projects
);

router.get(
  "/new-project",
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo("admin"),
  messageController.hasUnreadMessages,
  viewsController.newProject
);

router.get(
  "/edit-project/:id",
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo("admin"),
  messageController.hasUnreadMessages,
  viewsController.editProject
);

router.get(
  "/projects/postulates/:id",
  authController.isLoggedIn,
  authController.protect,
  authController.restrictTo("admin"),
  messageController.hasUnreadMessages,
  viewsController.projectPostulates
);

module.exports = router;
