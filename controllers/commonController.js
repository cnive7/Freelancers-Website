const catchAsync = require("../utils/catchAsync");
const ContactForm = require("../models/contactFormModel");
const Email = require("../utils/email");

exports.message = catchAsync(async (req, res, next) => {
  await new Email(
    {
      email: "hola@amerilancers.com",
      name: "",
    },
    ""
  ).sendContactFormMessage(req.body);
  const sentMessage = await ContactForm.create(req.body);
  res.status(200).json({
    status: "success",
  });
});
