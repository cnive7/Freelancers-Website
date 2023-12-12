const Cv = require("../models/cvModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const helpers = require("../utils/helpers");

const multer = require("multer");
const sharp = require("sharp");
const factory = require("./handlerFactory");
const fs = require("fs");
const { json } = require("express");

const multerStorage = multer.memoryStorage(); // The upload now is happening to a buffer and not directly to the file system

const multerFilter = (req, file, callback) => {
  if (file.fieldname === "foto") {
    if (file.mimetype.startsWith("image")) {
      callback(null, true);
    } else {
      callback(
        new AppError(
          "Foto de perfil no es una imagen. Por favor sube una imagen para la foto de perfil",
          400
        ),
        false
      );
    }
  }
  if (file.fieldname === "portafolio") {
    callback(null, true);
  }
  if (file.fieldname === "curriculum") {
    if (
      file.mimetype.endsWith("pdf") ||
      file.mimetype.endsWith(
        "vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) ||
      file.mimetype.endsWith("msword")
    ) {
      callback(null, true);
    } else {
      callback(
        new AppError(
          "El curriculum debe ser en formato PDF o WORD (.pdf, .docx, .doc)",
          400
        ),
        false
      );
    }
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const filterObj = (obj, ...allowedFields) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.uploadUserPhoto = upload.fields([
  { name: "foto", maxCount: 1 },
  { name: "curriculum", maxCount: 1 },
  { name: "portafolio", maxCount: 10 },
]);

// This middleware function will run right after the photo is actually uploaded
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.foto) {
    return next();
  }
  //with memory storage we do not get filename, so we need to set it
  req.files.foto[0].filename = `user-${req.user._id}-${Date.now()}.jpeg`; //So we can use it in the updateMe() route handler
  //req.file.buffer from this: const multerStorage = multer.memoryStorage();
  await sharp(req.files.foto[0].buffer)
    .resize(500, 500, {})
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.files.foto[0].filename}`);

  next();
});

exports.saveFiles = catchAsync(async (req, res, next) => {
  req.body.portafolio = [];
  if (req.files.portafolio) {
    await Promise.all(
      req.files.portafolio.map(async (file, index) => {
        const oldClearFilename = file.originalname
          .replaceAll("-", "")
          .split(".")[0];

        const extension = helpers.getExtension(file.mimetype);

        const filename = `user-${
          req.user._id
        }-${Date.now()}-${oldClearFilename}.${extension}`;

        await fs.writeFileSync(
          `public/files/users/portfolios/${filename}`,
          file.buffer
        );

        req.body.portafolio.push(filename);
      })
    );
  }

  if (req.files.curriculum) {
    let extension;
    if (
      req.files.curriculum[0].mimetype.endsWith(
        "vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ) {
      extension = "docx";
    } else if (req.files.curriculum[0].mimetype.endsWith("msword")) {
      extension = "doc";
    } else if (req.files.curriculum[0].mimetype.endsWith("pdf")) {
      extension = "pdf";
    } else {
      extension = "file";
    }
    const oldClearFilename = req.files.curriculum[0].originalname
      .replaceAll("-", "")
      .split(".")[0];
    const filename = `user-${
      req.user._id
    }-${Date.now()}-${oldClearFilename}.${extension}`;

    await fs.writeFileSync(
      `public/files/users/curriculums/${filename}`,
      req.files.curriculum[0].buffer
    );

    req.body.curriculum = filename;
  }

  next();
});

exports.createCv = catchAsync(async (req, res, next) => {
  if (req.files.foto) {
    req.body.foto = req.files.foto[0].filename;
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { photo: req.body.foto }
    );
    delete req.body.foto;
  }
  if (req.body.programas) {
    req.body.programas = JSON.parse(req.body.programas);
  }
  if (req.body.experiencias) {
    req.body.experiencias = JSON.parse(req.body.experiencias);
  }
  if (req.body.sistemaDeCobro) {
    req.body.sistemaDeCobro = JSON.parse(req.body.sistemaDeCobro);
  }
  if (req.body.horasDisponibles) {
    req.body.horasDisponibles = JSON.parse(req.body.horasDisponibles);
  }
  if (req.body.redes) {
    req.body.redes = JSON.parse(req.body.redes);
  }
  if (req.body.rating) {
    delete req.body.rating;
  }
  const postCv = {
    user: req.user._id,
    profesion: req.body.profesion,
    portafolio: req.body.portafolio,
    curriculum: req.body.curriculum,
    edad: req.body.edad,
    telefono: req.body.telefono,
    ciudad: req.body.ciudad,
    provincia: req.body.provincia,
    pais: req.body.pais,
    sobreMi: req.body.sobreMi,
    portafolioEnLinea: req.body.portafolioEnLinea,
    tarifaPorHora: req.body.tarifaPorHora,
    programas: req.body.programas,
    experiencias: req.body.experiencias,
    sistemaDeCobro: req.body.sistemaDeCobro,
    otroSistemaDeCobro: req.body.otroSistemaDeCobro,
    ingles: req.body.ingles,
    horasDisponibles: req.body.horasDisponibles,
    redes: req.body.redes,
  };
  req.body.nivelDeIngles && (postCv.nivelDeIngles = req.body.nivelDeIngles);
  const newCv = await Cv.create(postCv);

  res.status(200).json({
    status: "success",
  });
});

exports.updateCv = catchAsync(async (req, res, next) => {
  if (req.files.foto) {
    req.body.foto = req.files.foto[0].filename;
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { photo: req.body.foto }
    );
    delete req.body.foto;
  }

  if (!req.files.foto) {
    delete req.body.foto;
  }
  if (!req.files.portafolio) {
    delete req.body.portafolio;
  }
  if (!req.files.curriculum) {
    delete req.body.curriculum;
  }
  if (req.body.user) {
    delete req.body.user;
  }
  if (req.body.id) {
    delete req.body.id;
  }
  if (req.body._id) {
    delete req.body._id;
  }
  if (req.body.rating) {
    delete req.body.rating;
  }

  if (req.body.programas) {
    req.body.programas = JSON.parse(req.body.programas);
  }
  if (req.body.experiencias) {
    req.body.experiencias = JSON.parse(req.body.experiencias);
  }
  if (req.body.sistemaDeCobro) {
    req.body.sistemaDeCobro = JSON.parse(req.body.sistemaDeCobro);
  }
  if (req.body.horasDisponibles) {
    req.body.horasDisponibles = JSON.parse(req.body.horasDisponibles);
  }
  if (req.body.redes) {
    req.body.redes = JSON.parse(req.body.redes);
  }

  const updatedCv = await Cv.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: updatedCv,
  });
});

exports.setRating = catchAsync(async (req, res, next) => {
  await Cv.findOneAndUpdate(
    { user: req.params.userId },
    { rating: req.body.rating }
  );
  res.status(200).json({
    status: "success",
  });
});

exports.getMyCv = catchAsync(async (req, res, next) => {
  const cv = await Cv.findOne({ user: req.user._id }).populate({
    path: "user",
    select: "-__v",
  });
  if (!cv) {
    res.status(404).json({
      status: "fail",
      message: "El usuario aún no ha completado el perfil",
    });
  }
  res.status(200).json({
    status: "success",
    data: {
      data: cv,
    },
  });
});
