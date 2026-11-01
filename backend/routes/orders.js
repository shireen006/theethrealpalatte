import express from "express";
import { Order } from "../models/Order.js";
import { Cart } from "../models/Cart.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Optional authentication middleware for creating orders (guest enquiry or logged-in customer)
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const jwt = (await import("jsonwebtoken")).default;
      const { User } = await import("../models/User.js");
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "theethrealpalatte_super_secret_jwt_key_2026_boutique"
      );
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    } catch {
      // Continue as guest
    }
  }
  next();
}

// POST /api/orders - Create an order or formal order enquiry
router.post("/", optionalAuth, async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      customerNotes,
      items,
      orderType = "website_order",
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: "Customer name, email, and phone number are required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required in the order",
      });
    }

    // Validate calculations server-side (never trust client total)
    const sanitizedItems = items.map((it) => ({
      productId: String(it.productId || it.id || it._id),
      name: it.name,
      price: Number(it.price) || 0,
      quantity: Math.max(1, Number(it.quantity) || 1),
      image: it.image || "",
      type: it.type || "Crochet",
    }));

    const calculatedTotal = sanitizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Generate unique human-readable order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `TRP-${dateStr}-${randomHex}`;

    const order = new Order({
      orderNumber,
      user: req.user ? req.user._id : undefined,
      customerName: customerName.trim(),
      customerEmail: customerEmail.toLowerCase().trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress ? deliveryAddress.trim() : "",
      customerNotes: customerNotes ? customerNotes.trim() : "",
      items: sanitizedItems,
      subtotal: calculatedTotal,
      total: calculatedTotal,
      status: "pending",
      paymentVerified: false,
      orderType,
    });

    await order.save();

    // If user is logged in, optionally clear their active cart
    if (req.user) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully. Status: Pending enquiry confirmation.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit order",
    });
  }
});

// GET /api/orders/my-orders - Logged-in customer order history
router.get("/my-orders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Get customer orders error:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve orders" });
  }
});

export default router;
