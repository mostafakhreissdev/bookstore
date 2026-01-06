const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
} = require("../controllers/orderController");
const { verifyToken } = require("../middleware/auth");

// user
router.post("/", verifyToken, createOrder);
router.get("/user/:userId", verifyToken, getUserOrders);
router.get("/:id", verifyToken, getOrderById);

// admin
router.get("/", verifyToken, getAllOrders);

module.exports = router;
