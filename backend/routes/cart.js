import express from "express";
import { Cart } from "../models/Cart.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all cart routes
router.use(authenticate);

// GET /api/cart - Get current customer's cart
router.get("/", async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    return res.json({
      success: true,
      cart: cart.items,
      count: cart.items.reduce((acc, item) => acc + item.quantity, 0),
      total: cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch cart" });
  }
});

// POST /api/cart - Sync full cart (useful on login to save pending items)
router.post("/", async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Items array is required" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Sanitize items
    cart.items = items.map((item) => ({
      productId: String(item.id || item.productId || item._id),
      name: item.name,
      price: Number(item.price) || 0,
      image: item.image,
      type: item.type || "Crochet",
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));

    await cart.save();

    return res.json({
      success: true,
      message: "Cart synchronized",
      cart: cart.items,
      count: cart.items.reduce((acc, item) => acc + item.quantity, 0),
      total: cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    });
  } catch (error) {
    console.error("Sync cart error:", error);
    return res.status(500).json({ success: false, message: "Failed to sync cart" });
  }
});

// POST /api/cart/add - Add item to cart
router.post("/add", async (req, res) => {
  try {
    const { product, quantity = 1 } = req.body;
    if (!product) {
      return res.status(400).json({ success: false, message: "Product is required" });
    }

    const productId = String(product.id || product._id);
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex((item) => item.productId === productId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity) || 1;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        price: Number(product.price) || 0,
        image: product.image,
        type: product.type || "Crochet",
        quantity: Math.max(1, Number(quantity) || 1),
      });
    }

    await cart.save();

    return res.json({
      success: true,
      message: `${product.name} added to cart`,
      cart: cart.items,
      count: cart.items.reduce((acc, item) => acc + item.quantity, 0),
      total: cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ success: false, message: "Failed to add item to cart" });
  }
});

// PUT /api/cart/item/:productId - Update item quantity
router.put("/item/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId === String(productId));
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    const newQty = Number(quantity);
    if (newQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = newQty;
    }

    await cart.save();

    return res.json({
      success: true,
      cart: cart.items,
      count: cart.items.reduce((acc, item) => acc + item.quantity, 0),
      total: cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return res.status(500).json({ success: false, message: "Failed to update item" });
  }
});

// DELETE /api/cart/item/:productId - Remove item
router.delete("/item/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item.productId !== String(productId));
    await cart.save();

    return res.json({
      success: true,
      message: "Item removed from cart",
      cart: cart.items,
      count: cart.items.reduce((acc, item) => acc + item.quantity, 0),
      total: cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove item" });
  }
});

// DELETE /api/cart - Clear cart
router.delete("/", async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return res.json({ success: true, message: "Cart cleared", cart: [], count: 0, total: 0 });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({ success: false, message: "Failed to clear cart" });
  }
});

export default router;
