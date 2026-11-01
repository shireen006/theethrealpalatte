import express from "express";
import { Product } from "../models/Product.js";

const router = express.Router();

// GET /api/products - Get all available products (or all for store)
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { isAvailable: true };

    if (category && category !== "All") {
      query.type = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query).sort({ originalId: 1, createdAt: -1 });

    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
    });
  }
});

// GET /api/products/:id - Get single product
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let product;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    } else if (!isNaN(Number(id))) {
      product = await Product.findOne({ originalId: Number(id) });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Fetch product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve product",
    });
  }
});

export default router;
