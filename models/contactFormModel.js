const mongoose = require("mongoose");
const validator = require("validator");

const contactFormSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "Por favor, ingresa tu nombre"],
  },
  apellido: String,
  email: {
    type: String,
    required: [true, "por favor, ingresa tu email"],
    lowercase: true,
    validate: [validator.isEmail, "Por favor ingresa un email válido"],
  },
  mensaje: String,
});

const ContactForm = mongoose.model("ContactForm", contactFormSchema);

module.exports = ContactForm;
