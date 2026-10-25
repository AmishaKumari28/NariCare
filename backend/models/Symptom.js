
const mongoose = require("mongoose");

const symptomSchema = new mongoose.Schema(
  {
    // Associate each symptom with its user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Symptom name
    symptom: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Symptom severity (1-10)
    severity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    // Date of symptom
    date: {
      type: String,
      required: true,
    },

    // Additional notes
    notes: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Symptom", symptomSchema);
