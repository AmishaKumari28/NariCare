
const express = require("express");
const mongoose = require("mongoose");
const Symptom = require("../models/Symptom");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Require login for every symptom API request
router.use(authMiddleware);

// Save a symptom for the logged-in user
router.post("/", async (req, res) => {
  try {
    const { symptom, severity, date, notes } = req.body;

    const newSymptom = await Symptom.create({
      user: req.userId,
      symptom,
      severity,
      date,
      notes,
    });

    res.status(201).json(newSymptom);
  } catch (error) {
    res.status(400).json({
      message: "Unable to save symptom.",
    });
  }
});

// Retrieve only the logged-in user's symptoms
router.get("/", async (req, res) => {
  try {
    const symptoms = await Symptom.find({
      user: req.userId,
    }).sort({
      date: -1,
      createdAt: -1,
    });

    res.json(symptoms);
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch symptoms.",
    });
  }
});

// Delete only a symptom owned by the logged-in user
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid symptom ID.",
      });
    }

    const deleted = await Symptom.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Symptom not found.",
      });
    }

    res.json({
      message: "Symptom deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete symptom.",
    });
  }
});

module.exports = router;
