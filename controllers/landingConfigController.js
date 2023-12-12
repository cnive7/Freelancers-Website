const catchAsync = require("../utils/catchAsync");
const LandingConfig = require("../models/landingConfigModel");
const factory = require("./handlerFactory");

exports.createLandingConfig = factory.createOne(LandingConfig);

exports.updateLandingConfig = catchAsync(async (req, res, next) => {
  if (req.body.hero) {
    req.body.hero = JSON.parse(req.body.hero);
  }
  if (req.body.aboutUs) {
    req.body.aboutUs = JSON.parse(req.body.aboutUs);
  }
  if (req.body.howItWorks) {
    req.body.howItWorks = JSON.parse(req.body.howItWorks);
  }
  if (req.body.benefits) {
    req.body.benefits = JSON.parse(req.body.benefits);
  }
  if (req.body.testimonials) {
    req.body.testimonials = JSON.parse(req.body.testimonials);
  }
  if (req.body.faq) {
    req.body.faq = JSON.parse(req.body.faq);
  }
  await LandingConfig.findOneAndUpdate({}, req.body);
  res.status(200).json({
    status: "success",
  });
});

exports.getLandingConfig = catchAsync(async (req, res, next) => {
  const landingConfig = await LandingConfig.findOne({}, req.body);
  res.status(200).json({
    status: "success",
    data: {
      user: landingConfig,
    },
  });
});
