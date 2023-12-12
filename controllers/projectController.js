const Project = require("../models/projectModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const helpers = require("../utils/helpers");
const factory = require("../controllers/handlerFactory");
const axios = require("axios");

const multer = require("multer");
const fs = require("fs");
const Cv = require("../models/cvModel");

const multerStorage = multer.memoryStorage(); // The upload now is happening to a buffer and not directly to the file system

const multerProjectStorage = multer.memoryStorage(); // The upload now is happening to a buffer and not directly to the file system

const multerFilter = (req, file, callback) => {
  if (file.fieldname === "proposalPortafolio") {
    callback(null, true);
  }
};

const multerProjectFilter = (req, file, callback) => {
  if (file.fieldname === "projectFiles") {
    callback(null, true);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const uploadprojectFiles = multer({
  storage: multerProjectStorage,
  fileFilter: multerProjectFilter,
});

exports.uploadFiles = upload.fields([
  { name: "proposalPortafolio", maxCount: 5 },
]);

exports.uploadprojectFilesHandler = uploadprojectFiles.fields([
  { name: "projectFiles", maxCount: 10 },
]);

exports.saveFiles = catchAsync(async (req, res, next) => {
  req.body.proposalPortafolio = [];
  if (req.files.proposalPortafolio) {
    await Promise.all(
      req.files.proposalPortafolio.map(async (file, index) => {
        const oldClearFilename = file.originalname
          .replaceAll("-", "")
          .split(".")[0];

        const filename = `user-${
          req.user._id
        }-${Date.now()}-${oldClearFilename}.${file.mimetype.split("/")[1]}`;

        await fs.writeFileSync(
          `public/files/users/proposalPortfolios/${filename}`,
          file.buffer
        );

        req.body.proposalPortafolio.push(filename);
      })
    );
  }

  next();
});

exports.saveProjectFiles = catchAsync(async (req, res, next) => {
  req.body.projectFiles = [];
  if (req.files.projectFiles) {
    await Promise.all(
      req.files.projectFiles.map(async (file, index) => {
        const oldClearFilename = file.originalname
          .replaceAll("-", "")
          .split(".")[0];
        const extension = helpers.getExtension(file.mimetype);
        const filename = `user-${
          req.user._id
        }-${Date.now()}-${oldClearFilename}.${extension}`;

        await fs.writeFileSync(
          `public/files/projects/files/${filename}`,
          file.buffer
        );

        req.body.projectFiles.push(filename);
      })
    );
  }

  next();
});

const convertCurrency = async function (hourlyRateUSD, projectRateUSD) {
  const arsTax = 85;
  const calcPercentage = function (num, percentage) {
    return (num * percentage) / 100;
  };
  const {
    data: { result: arsRate },
  } = await axios.get("https://api.exchangerate.host/convert?from=USD&to=ARS");
  const {
    data: { result: clpRate },
  } = await axios.get("https://api.exchangerate.host/convert?from=USD&to=CLP");
  const {
    data: { result: brlRate },
  } = await axios.get("https://api.exchangerate.host/convert?from=USD&to=BRL");

  const calcHourlyRate = function (rate) {
    return Math.floor(hourlyRateUSD * rate);
  };
  const calcProjectRate = function (rate) {
    return Math.floor(projectRateUSD * rate);
  };

  return {
    hourlyRate: {
      usd: hourlyRateUSD,
      ars:
        calcHourlyRate(arsRate) +
        calcPercentage(calcHourlyRate(arsRate), arsTax),
      clp: calcHourlyRate(clpRate),
      brl: calcHourlyRate(brlRate),
    },
    projectRate: {
      usd: projectRateUSD,
      ars:
        calcProjectRate(arsRate) +
        calcPercentage(calcProjectRate(arsRate), arsTax),
      clp: calcProjectRate(clpRate),
      brl: calcProjectRate(brlRate),
    },
  };
};

exports.createProject = catchAsync(async (req, res, next) => {
  const options = {
    category: req.body.category,
    title: req.body.title,
    description: req.body.description,
    scope: req.body.scope,
    files: req.body.projectFiles,
    duration: req.body.duration,
    experience: req.body.level,
    hireOpportunity: req.body.hireOpportunity,
  };

  if (req.body.skills) {
    req.body.skills = JSON.parse(req.body.skills);
    options.skills = req.body.skills;
  }
  if (req.body.locations) {
    req.body.locations = JSON.parse(req.body.locations);
    options.location = req.body.locations;
  }
  if (req.body.rates) {
    req.body.rates = JSON.parse(req.body.rates);
    const rates = await convertCurrency(
      req.body.rates.hourlyRate,
      req.body.rates.projectRate
    );
    options.rates = rates;
  }
  await Project.create(options);
  res.status(201).json({
    status: "success",
  });
});

exports.createProposal = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  const isMember = project.postulated.some(
    (postulate) => postulate.id.toString() === req.user._id.toString()
  );
  const cv = await Cv.findOne({ user: req.user._id });
  if (!cv) {
    return next(
      new AppError("Completa tu perfil para postularte a proyectos!", 404)
    );
  }
  if (isMember) {
    return next(new AppError("Ya te has postulado a este proyecto!", 404));
  }
  if (req.body.payment) {
    req.body.payment = JSON.parse(req.body.payment);
  }
  await Project.findByIdAndUpdate(req.params.id, {
    $push: {
      postulated: {
        id: req.user._id,
        cv: cv._id,
        files: req.body.projectFiles,
        payment: {
          paymentType: req.body.payment.paymentType,
          paymentCurrency: req.body.payment.paymentCurrency,
          paymentAmount: req.body.payment.projectBudget,
        },
        whyApply: req.body.whyApply,
        similarPortafolio: req.body.proposalPortafolio,
      },
    },
  });
  res.status(201).json({
    status: "success",
  });
});

exports.deleteProject = factory.deleteOne(Project);
