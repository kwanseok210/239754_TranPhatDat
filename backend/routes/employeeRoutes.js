
const express = require("express");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");

const router = express.Router();

// GET /api/employees - Lấy danh sách và tìm kiếm nhân viên
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search && search.trim()) {
      const keyword = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter = {
        $or: [
          { employeeId: { $regex: keyword, $options: "i" } },
          { fullName: { $regex: keyword, $options: "i" } },
        ],
      };
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách nhân viên",
    });
  }
});

// GET /api/employees/:id - Tìm theo mã nhân viên hoặc MongoDB ID
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let employee;

    if (mongoose.isValidObjectId(id)) {
      employee = await Employee.findById(id);
    } else {
      employee = await Employee.findOne({ employeeId: id });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân viên",
      });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin nhân viên",
    });
  }
});

// POST /api/employees - Thêm nhân viên
router.post("/", async (req, res) => {
  try {
    const { employeeId, fullName, email } = req.body;

    if (
      typeof employeeId !== "string" ||
      !employeeId.trim() ||
      typeof fullName !== "string" ||
      !fullName.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Mã nhân viên, họ tên và email là bắt buộc",
      });
    }

    const existingEmployee = await Employee.findOne({
      employeeId: employeeId.trim(),
    });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Mã nhân viên đã tồn tại",
      });
    }

    const employee = await Employee.create(req.body);

    res.status(201).json({
      success: true,
      message: "Thêm nhân viên thành công",
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Mã nhân viên đã tồn tại",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm nhân viên",
    });
  }
});

// PUT /api/employees/:id - Cập nhật nhân viên
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updates = { ...req.body };

    // Không cho sửa mã định danh MongoDB và thời điểm hệ thống
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;
    delete updates.updatedAt;

    // Không cho đặt employeeId thành chuỗi rỗng
    if (
      Object.prototype.hasOwnProperty.call(updates, "employeeId") &&
      (typeof updates.employeeId !== "string" || !updates.employeeId.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Mã nhân viên không được để trống",
      });
    }

    if (
      Object.prototype.hasOwnProperty.call(updates, "fullName") &&
      (typeof updates.fullName !== "string" || !updates.fullName.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Họ tên không được để trống",
      });
    }

    if (
      Object.prototype.hasOwnProperty.call(updates, "email") &&
      (typeof updates.email !== "string" || !updates.email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Email không được để trống",
      });
    }

    let filter;

    if (mongoose.isValidObjectId(id)) {
      filter = { _id: id };
    } else {
      filter = { employeeId: id };
    }

    const employee = await Employee.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân viên",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật nhân viên thành công",
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Mã nhân viên đã tồn tại",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật nhân viên",
    });
  }
});

// DELETE /api/employees/:id - Xóa nhân viên
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { employeeId: id };

    const employee = await Employee.findOneAndDelete(filter);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân viên",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa nhân viên thành công",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa nhân viên",
    });
  }
});

module.exports = router;
