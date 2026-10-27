
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// API kiểm tra trạng thái Backend
app.get("/", (req, res) => {
  res.json({
    message: "HR Management Backend is running"
  });
});

// Kết nối MongoDB Atlas
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Chua cau hinh MONGODB_URI trong file .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Atlas connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Loi ket noi MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();
