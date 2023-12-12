const mongoose = require("mongoose");

const cvSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "El curriculum debe pertenecer a un usuario"],
    },
    profesion: {
      type: String,
      required: [true, "Ingresa tu profesión"],
    },
    telefono: Number,
    edad: Number,
    ciudad: {
      type: String,
      required: [true, "Ingresa tu ciudad"],
    },
    provincia: {
      type: String,
      required: [true, "Ingresa tu provincia"],
    },
    pais: {
      type: String,
      required: [true, "Ingresa tu país"],
    },
    curriculum: String,
    sobreMi: String,
    ingles: {
      type: Boolean,
      required: [true, "Selecciona si sabes inglés o no"],
    },
    nivelDeIngles: {
      type: String,
      enum: {
        values: ["basico", "intermedio", "avanzado"],
        message: "El nivel de inglés debe ser basico, intermedio o avanzado",
      },
    },
    programas: [
      {
        programa: String,
        nivel: {
          type: String,
          enum: {
            values: ["basico", "intermedio", "avanzado"],
            message:
              "El nivel del programa debe ser basico, intermedio o avanzado",
          },
        },
      },
    ],
    experiencias: [
      {
        experiencia: String,
        nivel: {
          type: String,
          enum: {
            values: ["basico", "intermedio", "avanzado", "experto"],
            message:
              "El nivel de la experiencia debe ser basico, intermedio, avanzado o experto",
          },
        },
      },
    ],
    portafolioEnLinea: String,
    horasDisponibles: {
      diarias: {
        type: Number,
        required: [true, "Ingresa cuántas horas diarias tienes disponibles"],
      },
      semanales: {
        type: Number,
        required: [true, "Ingresa cuántas horas semanales tienes disponibles"],
      },
    },
    tarifaPorHora: String,
    sistemaDeCobro: {
      paypal: {
        type: Boolean,
      },
      westernUnion: {
        type: Boolean,
      },
      transferencia: {
        type: Boolean,
      },
    },
    otroSistemaDeCobro: String,
    redes: {
      instagram: String,
      facebook: String,
      youtube: String,
      vimeo: String,
      behance: String,
      linkedin: String,
    },
    portafolio: [String],
    rating: {
      type: Number,
      min: [0, "La calificación del rating debe ser por encima de 1.0"],
      max: [5, "La calificación del rating debe ser por debajo de 5.0"],
      default: 0,
    },
  },
  { timestamps: true }
);

const Cv = mongoose.model("Cv", cvSchema);

module.exports = Cv;
