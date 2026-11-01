import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/Product.js";

dotenv.config();

const initialProducts = [
  {
    originalId: 1,
    name: "Crochet Sunflower Bouquet",
    price: 350,
    type: "Crochet",
    image: "/uploads/sunflowerbouquet.jpg",
    description:
      "Handmade sunshine, just for you.\nA cheerful crochet sunflower bouquet made with love.",
    stock: 12,
    isAvailable: true,
  },
  {
    originalId: 2,
    name: "Crochet Flower Keychains",
    price: 130,
    type: "Crochet",
    image: "/uploads/keychain.jpg",
    description:
      "A tiny handmade flower for your everyday essentials.\nPerfect for keys, bags, or gifting.\n[Custamization available.]",
    stock: 25,
    isAvailable: true,
  },
  {
    originalId: 3,
    name: "Four Leaf Clover Keychain",
    price: 150,
    type: "Crochet",
    image: "/uploads/fourleafcloverkeychain.jpg",
    description:
      "A little handmade lucky charm.\nCarry a touch of luck wherever you go.",
    stock: 18,
    isAvailable: true,
  },
  {
    originalId: 4,
    name: "Butterfly Hairtie",
    price: 250,
    type: "Crochet",
    image: "/uploads/butterflyhairtie.jpg",
    description:
      "A delicate butterfly made to brighten your hairstyle.\nHandmade with soft crochet details.",
    stock: 15,
    isAvailable: true,
  },
  {
    originalId: 5,
    name: "Crochet Bow Clip",
    price: 150,
    type: "Crochet",
    image: "/uploads/bowhairtie.jpeg",
    description:
      "A sweet handmade bow for your everyday look.\nSimple, delicate, and made with love.",
    stock: 20,
    isAvailable: true,
  },
  {
    originalId: 7,
    name: "Botanical Painting",
    price: 899,
    type: "Paintings",
    image:
      "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=800&q=85",
    description:
      "An original botanical-inspired artwork.\nCreated to bring a soft touch of nature into your space.",
    stock: 5,
    isAvailable: true,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/theethrealpalatte";
  console.log(`Connecting to MongoDB at ${uri}...`);
  await mongoose.connect(uri);

  console.log("Seeding initial products catalogue...");
  let created = 0;
  let updated = 0;

  for (const item of initialProducts) {
    const existing = await Product.findOne({
      $or: [{ originalId: item.originalId }, { name: item.name }],
    });

    if (existing) {
      existing.price = item.price;
      existing.type = item.type;
      existing.image = item.image;
      existing.description = item.description;
      existing.stock = item.stock;
      existing.isAvailable = item.isAvailable;
      existing.originalId = item.originalId;
      await existing.save();
      updated++;
    } else {
      await Product.create(item);
      created++;
    }
  }

  console.log(`Seeding complete! ${created} created, ${updated} updated.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
