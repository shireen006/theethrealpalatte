import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price must be non-negative"],
    },
    type: {
      type: String,
      required: [true, "Category type is required"],
      enum: ["Crochet", "Paintings"],
      default: "Crochet",
    },
    image: {
      type: String,
      required: [true, "Image URL or path is required"],
    },
    description: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      default: 10,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    originalId: {
      type: Number,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
