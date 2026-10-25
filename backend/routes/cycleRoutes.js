
const express = require("express");
const mongoose = require("mongoose");
const Cycle = require("../models/Cycle");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Require authentication for all cycle routes
router.use(authMiddleware);

// Validate date format and actual calendar date
function isValidDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

// Save a cycle for the logged-in user
router.post("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (
      !isValidDate(startDate) ||
      !isValidDate(endDate) ||
      endDate < startDate
    ) {
      return res.status(400).json({
        message: "Enter valid start and end dates.",
      });
    }

    const cycle = await Cycle.create({
      user: req.userId,
      startDate,
      endDate,
    });

    res.status(201).json(cycle);
  } catch (error) {
    res.status(400).json({
      message: "Unable to save cycle.",
    });
  }
});

// Retrieve only the logged-in user's cycles
router.get("/", async (req, res) => {
  try {
    const cycles = await Cycle.find({
      user: req.userId,
    }).sort({
      startDate: -1,
    });

    res.json(cycles);
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch cycles.",
    });
  }
});

// Delete only a cycle owned by the logged-in user
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid cycle ID.",
      });
    }

    const deleted = await Cycle.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Cycle not found.",
      });
    }

    res.json({
      message: "Cycle deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete cycle.",
    });
  }
});

module.exports = router;

