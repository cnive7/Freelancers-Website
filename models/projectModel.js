const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    category: Number,
    title: String,
    description: String,
    skills: [String],
    security: {
      type: String,
      enum: {
        values: ["public", "private"],
      },
    },
    allowedMembers: [
      {
        id: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
      },
    ],
    files: [String],
    scope: {
      type: String,
      enum: {
        values: ["small", "medium", "big"],
      },
    },
    duration: {
      type: String,
      enum: {
        values: ["more6months", "3to6months", "1to3months", "less1month"],
      },
    },
    experience: {
      type: String,
      enum: {
        values: ["novice", "intermediate", "expert"],
      },
    },
    hireOpportunity: Boolean,
    location: {
      argentina: Boolean,
      chile: Boolean,
      peru: Boolean,
      brasil: Boolean,
      ecuador: Boolean,
      bolivia: Boolean,
      uruguay: Boolean,
      colombia: Boolean,
      venezuela: Boolean,
      paraguay: Boolean,
      costaRica: Boolean,
      panama: Boolean,
      elSalvador: Boolean,
      honduras: Boolean,
      nicaragua: Boolean,
      guatemala: Boolean,
      mexico: Boolean,
    },
    postulated: [
      {
        id: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        cv: {
          type: mongoose.Schema.ObjectId,
          ref: "Cv",
        },
        payment: {
          paymentType: {
            type: String,
            enum: {
              values: ["hourly", "project"],
            },
          },
          paymentCurrency: {
            type: String,
          },
          paymentAmount: {
            type: Number,
          },
        },
        whyApply: String,
        similarPortafolio: [String],
      },
    ],
    rates: {
      hourlyRate: {
        usd: Number,
        ars: Number,
        clp: Number,
        brl: Number,
      },
      projectRate: {
        usd: Number,
        ars: Number,
        clp: Number,
        brl: Number,
      },
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
