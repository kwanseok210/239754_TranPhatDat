
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint kiểm tra trạng thái Backend
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Endpoint trang chủ
app.get("/", (req, res) => {
  res.status(200).json({
    message: "HR Management Backend is running",
  });
});

// Đăng ký các API quản lý nhân viên
app.use("/api/employees", employeeRoutes);

// Kết nối MongoDB Atlas và khởi động server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Chưa cấu hình MONGODB_URI trong file .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Atlas connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Lỗi khởi động Backend:", error.message);
    process.exit(1);
  }
}

startServer();
