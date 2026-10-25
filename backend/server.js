
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const symptomRoutes = require("./routes/symptomRoutes");
const cycleRoutes = require("./routes/cycleRoutes");
const authRoutes = require("./routes/authRoutes");

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());
app.use("/api/symptoms", symptomRoutes);
app.use("/api/cycles", cycleRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Sakhi Health Backend is Running 💜"
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully 💜");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
  }
}

startServer();

