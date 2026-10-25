
const mongoose = require("mongoose");

const cycleSchema = new mongoose.Schema(
  {
    // Each cycle belongs to a registered user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Period start date
    startDate: {
      type: String,
      required: true,
    },

    // Period end date
    endDate: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cycle", cycleSchema);

