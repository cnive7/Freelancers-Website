const mongoose = require("mongoose");

const landingConfigSchema = new mongoose.Schema({
  hero: {
    helperText: String,
    title1: String,
    title2: String,
    buttonText: String,
  },
  aboutUs: {
    title: String,
    paragraph1: String,
    paragraph2: String,
  },
  howItWorks: {
    step1: {
      img: String,
      title: String,
      item1: String,
      item2: String,
      item3: String,
    },
    step2: {
      img: String,
      title: String,
      item1: String,
      item2: String,
      item3: String,
    },
    step3: {
      img: String,
      title: String,
      item1: String,
      item2: String,
      item3: String,
    },
  },
  benefits: {
    benefit1: {
      img: String,
      title: String,
      desc: String,
    },
    benefit2: {
      img: String,
      title: String,
      desc: String,
    },
    benefit3: {
      img: String,
      title: String,
      desc: String,
    },
    benefit4: {
      img: String,
      title: String,
      desc: String,
    },
  },
  testimonials: [
    {
      img: String,
      text: String,
      author: String,
      work: String,
      location: String,
    },
  ],
  faq: [
    {
      question: String,
      answer: String,
    },
  ],
});

const LandingConfig = mongoose.model("LandingConfig", landingConfigSchema);

module.exports = LandingConfig;
