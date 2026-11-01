import mongoose from "mongoose";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/theethrealpalatte";

async function inspectAndRemove() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log("--- Checking products collection in MongoDB ---");
  const products = await db.collection("products").find({}).toArray();
  for (const p of products) {
    console.log(`[Product] id: ${p._id}, name: "${p.name}", price: ${p.price}`);
  }

  const toDelete = await db.collection("products").find({
    name: { $in: ["Crochet Flower Pot", "Crochet Flower"] }
  }).toArray();

  console.log(`\nFound ${toDelete.length} products to delete in MongoDB:`, toDelete.map(p => ({ id: p._id, name: p.name })));

  const delResult = await db.collection("products").deleteMany({
    name: { $in: ["Crochet Flower Pot", "Crochet Flower"] }
  });
  console.log(`Deleted count from MongoDB: ${delResult.deletedCount}`);

  // Also remove from carts and orders if any exist
  const cartDelResult = await db.collection("carts").updateMany(
    {},
    { $pull: { items: { name: { $in: ["Crochet Flower Pot", "Crochet Flower"] } } } }
  );
  console.log(`Updated carts: ${cartDelResult.modifiedCount}`);

  console.log("\n--- Remaining products in MongoDB ---");
  const remaining = await db.collection("products").find({}).toArray();
  for (const p of remaining) {
    console.log(`[Remaining] id: ${p._id}, name: "${p.name}", price: ${p.price}`);
  }

  await mongoose.disconnect();
}

inspectAndRemove().catch((err) => {
  console.error("Error deleting from MongoDB:", err);
  process.exit(1);
});
