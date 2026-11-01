import express from "express";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { authenticate, requireAdmin, generateToken } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// POST /api/admin/login - Admin-specific secure login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Account does not have administrator privileges",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials",
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Admin login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ success: false, message: "Server error during admin login" });
  }
});

// Protect all following routes with authentication + admin verification
router.use(authenticate, requireAdmin);

// GET /api/admin/overview - Real database metrics for admin dashboard
router.get("/overview", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const availableProducts = await Product.countDocuments({ isAvailable: true });
    const unavailableProducts = await Product.countDocuments({ isAvailable: false });

    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalOrders = await Order.countDocuments();

    // Group orders by status
    const statuses = ["pending", "confirmed", "processing", "shipped", "completed", "cancelled"];
    const statusCounts = {};

    for (const st of statuses) {
      statusCounts[st] = await Order.countDocuments({ status: st });
    }

    const paymentVerifiedCount = await Order.countDocuments({ paymentVerified: true });
    const paymentPendingCount = await Order.countDocuments({ paymentVerified: false });

    return res.json({
      success: true,
      overview: {
        totalProducts,
        availableProducts,
        unavailableProducts,
        totalCustomers,
        totalOrders,
        statusCounts,
        paymentVerifiedCount,
        paymentPendingCount,
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard metrics" });
  }
});

// GET /api/admin/products - All products including out-of-stock / hidden
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("Admin fetch products error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

// POST /api/admin/products - Create a new product (supports optional image upload or image URL)
router.post("/products", upload.single("imageFile"), async (req, res) => {
  try {
    const { name, price, type, description, stock, isAvailable, imageUrl } = req.body;

    if (!name || !price || !type) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category type are required",
      });
    }

    let finalImageUrl = imageUrl;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    if (!finalImageUrl) {
      return res.status(400).json({
        success: false,
        message: "An image file or image URL is required",
      });
    }

    const product = new Product({
      name: name.trim(),
      price: Number(price),
      type,
      description: description ? description.trim() : "",
      image: finalImageUrl,
      stock: stock !== undefined ? Number(stock) : 10,
      isAvailable: isAvailable === "true" || isAvailable === true,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Admin create product error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create product" });
  }
});

// PUT /api/admin/products/:id - Update product
router.put("/products/:id", upload.single("imageFile"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, type, description, stock, isAvailable, imageUrl } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (name) product.name = name.trim();
    if (price !== undefined) product.price = Number(price);
    if (type) product.type = type;
    if (description !== undefined) product.description = description.trim();
    if (stock !== undefined) product.stock = Number(stock);
    if (isAvailable !== undefined) {
      product.isAvailable = isAvailable === "true" || isAvailable === true;
    }

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      product.image = imageUrl;
    }

    await product.save();

    return res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Admin update product error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update product" });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.json({
      success: true,
      message: `Product "${product.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Admin delete product error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete product" });
  }
});

// GET /api/admin/orders - All customer orders
router.get("/orders", async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Admin fetch orders error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

// GET /api/admin/orders/:id - Single order details
router.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.json({ success: true, order });
  } catch (error) {
    console.error("Admin get order details error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch order details" });
  }
});

// PUT /api/admin/orders/:id/status - Update order status & payment verification
router.put("/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentVerified, paymentNote } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (status) {
      const allowed = ["pending", "confirmed", "processing", "shipped", "completed", "cancelled"];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
      }
      order.status = status;
    }

    if (paymentVerified !== undefined) {
      order.paymentVerified = paymentVerified === true || paymentVerified === "true";
    }

    if (paymentNote !== undefined) {
      order.paymentNote = paymentNote.trim();
    }

    await order.save();

    return res.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Admin update order error:", error);
    return res.status(500).json({ success: false, message: "Failed to update order" });
  }
});

// GET /api/admin/customers - List of registered customers (without passwords)
router.get("/customers", async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Admin fetch customers error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch customers" });
  }
});

export default router;
