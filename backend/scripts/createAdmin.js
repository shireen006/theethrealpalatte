import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.js";

dotenv.config();

async function createAdmin() {
  const args = process.argv.slice(2);
  const email = (args[0] || process.env.ADMIN_EMAIL || "admin@theethrealpalatte.com").toLowerCase().trim();
  const password = args[1] || process.env.ADMIN_PASSWORD || "AdminPass@2026!";
  const name = args[2] || process.env.ADMIN_NAME || "Store Administrator";

  if (!email || !password) {
    console.error("Usage: node scripts/createAdmin.js <email> <password> [name]");
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("Error: Admin password must be at least 6 characters long.");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/theethrealpalatte";
  await mongoose.connect(uri);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    existing.name = name;
    existing.password = password; // Will be re-hashed by pre('save') hook
    await existing.save();
    console.log(`[Admin Setup] Existing account "${email}" updated to role "admin" with provided password.`);
  } else {
    const adminUser = new User({
      name,
      email,
      password,
      role: "admin",
      phone: "+91 8088645598",
    });
    await adminUser.save();
    console.log(`[Admin Setup] Initial administrator account "${email}" created successfully.`);
  }

  await mongoose.disconnect();
  console.log("Database connection closed.");
}

createAdmin().catch((err) => {
  console.error("Failed to create admin:", err);
  process.exit(1);
});
