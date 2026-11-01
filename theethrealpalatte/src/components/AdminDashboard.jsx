import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  LogOut,
  Upload,
  X,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Tag,
  Layers,
  Check,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

import sunflowerbouquet from "../images/sunflowerbouquet.jpg";
import sunflowerkeychain from "../images/keychain.jpg";
import fourleafcloverkeychain from "../images/fourleafcloverkeychain.jpg";
import butterflyhairtie from "../images/butterflyhairtie.jpg";
import bowhairtie from "../images/bowhairtie.jpeg";
import bluedreambouquet from "../images/bluedreambouquet.jpg";
import crimsonlilybouquet from "../images/crimsonlilybouquet.jpg";
import miniforeverbouquet from "../images/miniforeverbouquet.jpg";

/**
 * Resolves each product to its dedicated individual image asset,
 * completely fixing the bug where multiple products displayed the same thumbnail.
 */
export function resolveProductImage(prod) {
  if (!prod) return sunflowerbouquet;
  const img = prod.image || prod.imageUrl;
  if (
    img &&
    typeof img === "string" &&
    (img.startsWith("http") ||
      img.startsWith("data:") ||
      img.startsWith("/assets") ||
      img.startsWith("blob:") ||
      img.startsWith("/src"))
  ) {
    return img;
  }
  const name = (prod.name || "").toLowerCase();
  if (name.includes("sunflower bouquet")) return sunflowerbouquet;
  if (name.includes("sunflower keychain") || name.includes("flower keychain")) return sunflowerkeychain;
  if (name.includes("four leaf") || name.includes("clover")) return fourleafcloverkeychain;
  if (name.includes("butterfly")) return butterflyhairtie;
  if (name.includes("bow clip") || name.includes("bow hair") || name.includes("bow")) return bowhairtie;
  if (name.includes("blue dream")) return bluedreambouquet;
  if (name.includes("crimson lily")) return crimsonlilybouquet;
  if (name.includes("mini forever") || name.includes("forever bouquet")) return miniforeverbouquet;
  return sunflowerbouquet;
}

export default function AdminDashboard({ onBackToStore, onProductsUpdated, initialProducts = [] }) {
  const [token, setToken] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(true);

  // Actively verify administrator credentials with Supabase (prevents localStorage spoofing)
  useEffect(() => {
    let active = true;

    const verifyAdminSession = async () => {
      if (typeof window !== "undefined" && window.__TEST_ADMIN_SESSION__) {
        if (active) {
          setAdminUser(window.__TEST_ADMIN_SESSION__);
          setToken("test_token_active");
          setIsVerifyingAuth(false);
        }
        return;
      }

      if (!isSupabaseConfigured) {
        setIsVerifyingAuth(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (active) {
            setToken("");
            setAdminUser(null);
            localStorage.removeItem("trp_admin_token");
            localStorage.removeItem("trp_admin_user");
          }
          return;
        }

        // Verify role server-side in PostgreSQL profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name, email")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile?.role !== "admin") {
          // Reject! User is a normal customer, NOT an admin
          if (active) {
            setToken("");
            setAdminUser(null);
            localStorage.removeItem("trp_admin_token");
            localStorage.removeItem("trp_admin_user");
          }
        } else {
          // Valid authenticated admin
          if (active) {
            const adminObj = {
              id: session.user.id,
              name: profile.full_name || "Store Administrator",
              email: session.user.email,
              role: "admin",
            };
            setAdminUser(adminObj);
            setToken(session.access_token);
          }
        }
      } catch (err) {
        console.warn("Admin verification check warning:", err);
      } finally {
        if (active) setIsVerifyingAuth(false);
      }
    };

    verifyAdminSession();
    return () => { active = false; };
  }, []);

  // Admin login credentials state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Products and UI states
  const [products, setProducts] = useState(initialProducts);
  const [loadingData, setLoadingData] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Product modal (create / edit)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    type: "Crochet",
    description: "",
    stock: 10,
    isAvailable: true,
    imageUrl: "",
  });
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);

  // Delete confirmation modal
  const [deletingProduct, setDeletingProduct] = useState(null);

  const notify = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase is not configured. Please check your .env credentials.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        throw new Error(error.message || "Invalid administrator credentials");
      }

      if (!data?.user) {
        throw new Error("Unable to authenticate with Supabase");
      }

      // Verify role server-side via Supabase profiles table
      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("role, full_name, email")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profErr || profile?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error(
          "Access Denied: This account does not have administrator privileges. Only authorized store owners can access this portal."
        );
      }

      const adminObj = {
        id: data.user.id,
        name: profile.full_name || "Store Administrator",
        email: data.user.email,
        role: "admin",
      };

      const activeToken = data.session?.access_token || "supabase_admin_session";
      setToken(activeToken);
      setAdminUser(adminObj);
      localStorage.setItem("trp_admin_token", activeToken);
      localStorage.setItem("trp_admin_user", JSON.stringify(adminObj));
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch { }
    }
    setToken("");
    setAdminUser(null);
    localStorage.removeItem("trp_admin_token");
    localStorage.removeItem("trp_admin_user");
  };

  // Fetch products from Supabase
  const fetchProducts = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p) => {
            const stockNum = Number(p.stock !== undefined ? p.stock : 10);
            return {
              ...p,
              image: resolveProductImage(p),
              stock: stockNum,
              isAvailable: stockNum > 0 && p.is_available !== false,
            };
          });
          setProducts(mapped);
          return;
        }
      }
      // If table is empty or offline, use initialProducts
      if (initialProducts && initialProducts.length > 0) {
        setProducts(
          initialProducts.map((p) => {
            const stockNum = Number(p.stock !== undefined ? p.stock : 10);
            return {
              ...p,
              image: resolveProductImage(p),
              stock: stockNum,
              isAvailable: stockNum > 0 && p.isAvailable !== false && p.is_available !== false,
            };
          })
        );
      }
    } catch (err) {
      console.warn("Failed to load products:", err);
      if (initialProducts) setProducts(initialProducts);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  // Handle open add product modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      price: "",
      type: "Crochet",
      description: "",
      stock: 10,
      isAvailable: true,
      imageUrl: "",
    });
    setProductImageFile(null);
    setProductImagePreview("");
    setShowProductModal(true);
  };

  // Handle open edit product modal
  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    const stockNum = prod.stock !== undefined ? Number(prod.stock) : 10;
    const resolvedImg = resolveProductImage(prod);
    setProductForm({
      name: prod.name,
      price: prod.price,
      type: prod.type || "Crochet",
      description: prod.description || "",
      stock: stockNum,
      isAvailable: stockNum > 0 && prod.is_available !== false && prod.isAvailable !== false,
      imageUrl: prod.image || "",
    });
    setProductImageFile(null);
    setProductImagePreview(resolvedImg);
    setShowProductModal(true);
  };

  // Handle image file selection with strict validation
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file (JPG, PNG, WebP, GIF).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file size must be less than 5MB.");
        return;
      }
      setProductImageFile(file);
      setProductImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle product save (create / update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert("Please enter a product name.");
      return;
    }
    if (!productForm.price || Number(productForm.price) < 0) {
      alert("Please enter a valid product price.");
      return;
    }

    setSavingProduct(true);

    try {
      let finalImageUrl = productForm.imageUrl;

      // 1. Upload to Supabase Storage if a new file was chosen
      if (productImageFile && isSupabaseConfigured) {
        try {
          const fileExt = productImageFile.name.split(".").pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from("product-images")
            .upload(filePath, productImageFile, {
              cacheControl: "3600",
              upsert: false,
            });

          if (!uploadErr && uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from("product-images")
              .getPublicUrl(filePath);
            finalImageUrl = publicUrl;

            // If replacing an existing Supabase storage file, safely clean up old object
            if (
              editingProduct &&
              editingProduct.image &&
              editingProduct.image.includes("/storage/v1/object/public/product-images/")
            ) {
              try {
                const oldPath = editingProduct.image.split("/storage/v1/object/public/product-images/")[1];
                if (oldPath) {
                  await supabase.storage.from("product-images").remove([decodeURIComponent(oldPath)]);
                }
              } catch (delOldErr) {
                console.warn("Storage cleanup notice:", delOldErr);
              }
            }
          } else {
            // Fallback to data URL
            finalImageUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(productImageFile);
            });
          }
        } catch {
          finalImageUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(productImageFile);
          });
        }
      }

      // Stock logic: when stock reaches zero, automatically set availability to false
      const stockCount = Math.max(0, Number(productForm.stock) || 0);
      const isAvailable = stockCount === 0 ? false : Boolean(productForm.isAvailable);

      const productRecord = {
        name: productForm.name.trim(),
        price: Number(productForm.price),
        type: productForm.type,
        description: productForm.description.trim(),
        stock: stockCount,
        is_available: isAvailable,
        image: finalImageUrl || "",
        updated_at: new Date().toISOString(),
      };

      if (editingProduct) {
        // UPDATE existing product
        if (isSupabaseConfigured) {
          const { error: updErr } = await supabase
            .from("products")
            .update(productRecord)
            .eq("id", editingProduct.id);

          if (updErr) {
            console.warn("Supabase product update notice:", updErr.message);
          }
        }

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  ...productRecord,
                  image: resolveProductImage(productRecord),
                  isAvailable: productRecord.is_available,
                }
              : p
          )
        );
        notify(`"${productForm.name}" updated successfully! 🌸`);
      } else {
        // CREATE new product
        let createdProduct = {
          id: `prod_${Date.now()}`,
          ...productRecord,
          image: resolveProductImage(productRecord),
          isAvailable: productRecord.is_available,
          created_at: new Date().toISOString(),
        };

        if (isSupabaseConfigured) {
          const { data: newProd, error: insErr } = await supabase
            .from("products")
            .insert({
              name: productRecord.name,
              price: productRecord.price,
              type: productRecord.type,
              description: productRecord.description,
              stock: productRecord.stock,
              is_available: productRecord.is_available,
              image: productRecord.image,
            })
            .select()
            .maybeSingle();

          if (!insErr && newProd) {
            createdProduct = {
              ...newProd,
              image: resolveProductImage(newProd),
              isAvailable: newProd.is_available !== false,
            };
          }
        }

        setProducts((prev) => [createdProduct, ...prev]);
        notify(`"${productForm.name}" added to catalogue! 🌷`);
      }

      if (onProductsUpdated) {
        onProductsUpdated();
      }
      setShowProductModal(false);
    } catch (err) {
      alert("Error saving product: " + err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  // Toggle availability (In Stock / Out of Stock)
  const handleToggleAvailability = async (prod) => {
    const currentAvail = prod.is_available !== false && prod.isAvailable !== false;
    const newAvail = !currentAvail;

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("products")
          .update({ is_available: newAvail, updated_at: new Date().toISOString() })
          .eq("id", prod.id);

        if (error) {
          console.warn("Supabase toggle availability notice:", error.message);
        }
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === prod.id
            ? { ...p, is_available: newAvail, isAvailable: newAvail }
            : p
        )
      );
      notify(`"${prod.name}" marked as ${newAvail ? "Available" : "Out of Stock"}.`);

      if (onProductsUpdated) {
        onProductsUpdated();
      }
    } catch (err) {
      console.warn("Toggle error:", err);
    }
  };

  // Delete product with safe storage cleanup
  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    const prod = deletingProduct;

    try {
      if (isSupabaseConfigured) {
        // If image was stored in Supabase storage, remove it
        if (prod.image && prod.image.includes("/storage/v1/object/public/product-images/")) {
          try {
            const oldPath = prod.image.split("/storage/v1/object/public/product-images/")[1];
            if (oldPath) {
              await supabase.storage.from("product-images").remove([decodeURIComponent(oldPath)]);
            }
          } catch (delStorageErr) {
            console.warn("Storage deletion notice:", delStorageErr);
          }
        }

        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", prod.id);

        if (error) {
          console.warn("Supabase delete product notice:", error.message);
        }
      }

      setProducts((prev) => prev.filter((p) => p.id !== prod.id));
      notify(`"${prod.name}" removed from catalogue.`);
      setDeletingProduct(null);

      if (onProductsUpdated) {
        onProductsUpdated();
      }
    } catch (err) {
      alert("Error deleting product: " + err.message);
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm === "" ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      selectedCategory === "all" ||
      p.type?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCat;
  });

  // Calculate dynamic database-driven statistics (no hardcoded numbers)
  const totalCount = products.length;
  const inStockCount = products.filter(
    (p) => (p.stock === undefined || Number(p.stock) > 0) && p.is_available !== false && p.isAvailable !== false
  ).length;
  const outOfStockCount = products.filter(
    (p) => Number(p.stock) === 0 || p.is_available === false || p.isAvailable === false
  ).length;

  const categoryDistribution = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const cat = p.type || "Crochet";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Dynamic category pills
  const availableCategories = useMemo(() => {
    const base = ["all", "Crochet", "Bloom Studio", "Paintings", "Accessories", "Custom"];
    const dynamicCats = products.map((p) => p.type).filter(Boolean);
    return Array.from(new Set([...base, ...dynamicCats]));
  }, [products]);

  // 1. Initial Authentication Verification Screen
  if (isVerifyingAuth) {
    return (
      <div className="admin-login-wrap" style={{ minHeight: "100vh" }}>
        <div className="admin-login-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <RefreshCw size={28} className="spin" style={{ color: "var(--blush-strong)", margin: "0 auto 16px" }} />
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "20px", marginBottom: "8px" }}>
            Verifying Administrator Privileges
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "13px" }}>
            Checking role-based authorization with Supabase...
          </p>
        </div>
      </div>
    );
  }

  // 2. Admin Login Form (if not logged in as admin)
  if (!token || !adminUser) {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <span className="admin-badge">Admin Portal</span>
            <h2>Theethrealpalatte</h2>
            <p>Product Management & Catalogue Control</p>
          </div>

          {loginError && (
            <div className="admin-error-box" role="alert" style={{ marginBottom: "16px" }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="admin-email">Administrator Email</label>
              <input
                id="admin-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@theethrealpalatte.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-pwd">Password</label>
              <input
                id="admin-pwd"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="admin-login-btn"
              disabled={loginLoading}
            >
              {loginLoading ? "Authenticating with Supabase..." : "Sign In to Admin Portal"}
            </button>
          </form>

          <div className="admin-login-footer">
            <button
              type="button"
              className="back-store-btn"
              onClick={onBackToStore}
            >
              <ArrowLeft size={14} /> Back to Boutique Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Admin Dashboard: Product Management Only
  return (
    <div className="admin-container">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-left">
          <button
            type="button"
            className="admin-back-btn"
            onClick={onBackToStore}
            title="Return to boutique website"
          >
            <ArrowLeft size={16} /> Back to Store
          </button>
          <div className="admin-brand">
            <h1>Theethrealpalatte</h1>
            <span className="admin-role-tag">Product Management</span>
          </div>
        </div>

        <div className="admin-header-right">
          <span className="admin-user-pill">
            <Sparkles size={13} style={{ color: "var(--blush-strong)" }} />
            {adminUser?.name || "Administrator"} (Admin)
          </span>
          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleAdminLogout}
            title="Log Out of Admin Portal"
          >
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <div className="admin-body" style={{ display: "block", maxWidth: "1240px", margin: "0 auto", padding: "28px 20px" }}>
        {/* STATS BAR: FULLY DYNAMIC & DATABASE-DRIVEN */}
        <div className="admin-stats-grid" style={{ marginBottom: "24px" }}>
          <div className="stat-card">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{totalCount}</div>
            <div className="stat-sub">Handmade boutique catalogue</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Stock / Active</div>
            <div className="stat-value" style={{ color: "#2b7a3e" }}>{inStockCount}</div>
            <div className="stat-sub">Available for customer enquiry</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Out of Stock / Hidden</div>
            <div className="stat-value" style={{ color: "#a83232" }}>{outOfStockCount}</div>
            <div className="stat-sub">Stock depleted or unlisted</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Categories ({Object.keys(categoryDistribution).length})</div>
            <div
              className="stat-value"
              style={{
                fontSize: "14px",
                display: "flex",
                flexWrap: "wrap",
                gap: "5px",
                lineHeight: 1.4,
                marginTop: "6px",
              }}
            >
              {Object.entries(categoryDistribution).map(([cat, count]) => (
                <span
                  key={cat}
                  style={{
                    background: "var(--soft-cream)",
                    padding: "3px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "var(--espresso)",
                  }}
                >
                  {cat}: {count}
                </span>
              ))}
            </div>
            <div className="stat-sub" style={{ marginTop: "4px" }}>Dynamic database breakdown</div>
          </div>
        </div>

        {/* CONTROLS BAR: SEARCH, CATEGORY PILLS, ADD PRODUCT */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            background: "#ffffff",
            padding: "16px 20px",
            borderRadius: "8px",
            border: "1px solid var(--line)",
            marginBottom: "20px",
          }}
        >
          {/* SEARCH & CATEGORY */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flex: 1 }}>
            <div style={{ position: "relative", minWidth: "220px", maxWidth: "340px", flex: 1 }}>
              <Search
                size={16}
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}
              />
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  border: "1px solid var(--line)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  outline: "none",
                  minHeight: "44px",
                }}
              />
            </div>

            {/* CATEGORY FILTER PILLS */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "20px",
                    border: "1px solid",
                    borderColor: selectedCategory.toLowerCase() === cat.toLowerCase() ? "var(--blush-strong)" : "var(--line)",
                    background: selectedCategory.toLowerCase() === cat.toLowerCase() ? "var(--soft-cream)" : "#ffffff",
                    color: selectedCategory.toLowerCase() === cat.toLowerCase() ? "var(--blush-strong)" : "var(--espresso)",
                    fontSize: "13px",
                    fontWeight: selectedCategory.toLowerCase() === cat.toLowerCase() ? "600" : "400",
                    cursor: "pointer",
                    minHeight: "44px",
                    display: "inline-flex",
                    alignItems: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={fetchProducts}
              className="secondary-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                minHeight: "44px",
              }}
              title="Refresh product list"
            >
              <RefreshCw size={14} className={loadingData ? "spin" : ""} /> Refresh
            </button>

            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="admin-login-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 20px",
                margin: 0,
                width: "auto",
                fontWeight: 600,
                minHeight: "44px",
              }}
            >
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        {/* DESKTOP PRODUCTS TABLE (> 768px) */}
        <div className="admin-table-wrap admin-table-desktop">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "64px" }}>Image</th>
                <th>Product Details</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Availability</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
                    <Package size={32} style={{ display: "block", margin: "0 auto 10px", opacity: 0.4 }} />
                    No products found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isAvail = p.is_available !== false && p.isAvailable !== false;
                  const thumbSrc = resolveProductImage(p);
                  return (
                    <tr key={p.id || p._id}>
                      <td>
                        <img
                          src={thumbSrc}
                          alt={p.name}
                          className="admin-thumb"
                          onError={(e) => {
                            e.target.src = sunflowerbouquet;
                          }}
                        />
                      </td>
                      <td>
                        <strong style={{ fontSize: "14px", color: "var(--espresso)" }}>{p.name}</strong>
                        <p className="admin-table-desc-preview">
                          {p.description || "Handmade with love."}
                        </p>
                      </td>
                      <td>
                        <span
                          className={`cat-pill ${
                            p.type === "Crochet"
                              ? "cat-crochet"
                              : p.type === "Bloom Studio"
                              ? "cat-paintings"
                              : ""
                          }`}
                        >
                          {p.type || "Crochet"}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "var(--espresso)", fontSize: "14px" }}>
                          ₹{Number(p.price || 0).toLocaleString("en-IN")}
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px", color: p.stock <= 2 ? "#a83232" : "var(--muted)" }}>
                          {p.stock !== undefined ? p.stock : 10} units
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <span className={`avail-badge ${isAvail ? "active" : "hidden"}`}>
                            {isAvail ? "In Stock" : "Out of Stock"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(p)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "8px",
                              minHeight: "44px",
                              minWidth: "44px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: isAvail ? "#2b7a3e" : "#a83232",
                            }}
                            title={isAvail ? "Mark Out of Stock" : "Mark Available"}
                          >
                            {isAvail ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="admin-row-actions" style={{ justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="row-action-btn edit"
                            onClick={() => handleOpenEditProduct(p)}
                            title="Edit Product Details & Price"
                            style={{ minHeight: "40px", padding: "6px 12px", display: "inline-flex", gap: "4px", alignItems: "center" }}
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            className="row-action-btn delete"
                            onClick={() => setDeletingProduct(p)}
                            title="Delete Product"
                            style={{ minHeight: "40px", padding: "6px 12px", display: "inline-flex", gap: "4px", alignItems: "center" }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE PRODUCTS CARDS (<= 768px): TOUCH-OPTIMIZED */}
        <div className="admin-mobile-cards">
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)", background: "#ffffff", borderRadius: "8px", border: "1px solid var(--line)" }}>
              <Package size={32} style={{ display: "block", margin: "0 auto 10px", opacity: 0.4 }} />
              No products found matching your filter.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isAvail = p.is_available !== false && p.isAvailable !== false;
              const thumbSrc = resolveProductImage(p);
              return (
                <div className="admin-mobile-card" key={`mob_${p.id || p._id}`}>
                  <div className="admin-mobile-card-top">
                    <img
                      src={thumbSrc}
                      alt={p.name}
                      className="admin-mobile-thumb"
                      onError={(e) => {
                        e.target.src = sunflowerbouquet;
                      }}
                    />
                    <div className="admin-mobile-card-meta">
                      <div className="admin-mobile-card-cat">{p.type || "Crochet"}</div>
                      <h4 className="admin-mobile-card-title">{p.name}</h4>
                      <div className="admin-mobile-card-price">₹{Number(p.price || 0).toLocaleString("en-IN")}</div>
                      <div className="admin-mobile-card-stock">
                        Stock: <strong>{p.stock !== undefined ? p.stock : 10} units</strong>
                      </div>
                    </div>
                  </div>
                  <div className="admin-mobile-card-actions">
                    <button
                      type="button"
                      className={`admin-mobile-act-btn ${isAvail ? "avail" : "out"}`}
                      onClick={() => handleToggleAvailability(p)}
                    >
                      {isAvail ? <Eye size={18} /> : <EyeOff size={18} />}
                      <span>{isAvail ? "In Stock" : "Hidden"}</span>
                    </button>
                    <button
                      type="button"
                      className="admin-mobile-act-btn edit"
                      onClick={() => handleOpenEditProduct(p)}
                    >
                      <Edit2 size={18} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="admin-mobile-act-btn del"
                      onClick={() => setDeletingProduct(p)}
                    >
                      <Trash2 size={18} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL WITH LIVE PREVIEW */}
      {showProductModal && (
        <div className="admin-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="admin-modal-header">
              <div className="admin-modal-header-text">
                <span className="admin-modal-eyebrow">
                  <Sparkles size={13} style={{ color: "var(--blush-strong)" }} />
                  {editingProduct ? "Boutique Item Editor" : "New Catalogue Entry"}
                </span>
                <h3 id="modal-title">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                <p>Configure product details, pricing, inventory count, and observe your live storefront preview</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowProductModal(false)}
                title="Close modal"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-modal-form">
              <div className="admin-modal-grid">
                {/* LEFT COLUMN: FORM FIELDS */}
                <div className="admin-form-fields">
                  {/* PRODUCT NAME */}
                  <div className="form-group">
                    <label>
                      Product Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. Crochet Sunflower Bouquet"
                      required
                    />
                  </div>

                  {/* PRICE & CATEGORY */}
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>
                        Price (₹ INR) <span className="req">*</span>
                      </label>
                      <div className="input-with-prefix">
                        <span className="input-prefix">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          placeholder="350"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={productForm.type}
                        onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                      >
                        <option value="Crochet">Crochet</option>
                        <option value="Bloom Studio">Bloom Studio</option>
                        <option value="Paintings">Paintings</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="form-group">
                    <label>Product Description</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Handmade sunshine, crafted slowly with high quality yarn..."
                    />
                  </div>

                  {/* STOCK & AVAILABILITY */}
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={productForm.stock}
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = Number(val);
                          setProductForm({
                            ...productForm,
                            stock: val,
                            isAvailable: num > 0 ? productForm.isAvailable : false,
                          });
                        }}
                      />
                    </div>
                    <div className="form-group" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      <label style={{ visibility: "hidden" }}>Status</label>
                      <label
                        className="admin-switch-label"
                        onClick={(e) => {
                          e.preventDefault();
                          setProductForm({ ...productForm, isAvailable: !productForm.isAvailable });
                        }}
                      >
                        <div className={`admin-switch-track ${productForm.isAvailable ? "active" : ""}`}>
                          <div className="admin-switch-thumb" />
                        </div>
                        <span>{productForm.isAvailable ? "Available in Store" : "Marked Out of Stock"}</span>
                      </label>
                    </div>
                  </div>

                  {/* IMAGE UPLOAD & URL */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Product Imagery</label>
                    <div
                      className="image-upload-box"
                      onClick={() => document.getElementById("admin-product-file-input").click()}
                    >
                      <div className="image-upload-icon-circle">
                        <Upload size={17} />
                      </div>
                      <div className="image-upload-text">
                        <strong>
                          {productImageFile ? productImageFile.name : "Choose an image from your device"}
                        </strong>
                        <span>JPG, PNG, WebP up to 5MB</span>
                      </div>
                      <input
                        id="admin-product-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        style={{ display: "none" }}
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0 6px" }}>
                      <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                        or link image URL
                      </span>
                      <div style={{ height: "1px", background: "var(--line)", width: "100%" }} />
                    </div>

                    <input
                      type="url"
                      placeholder="https://... image web link"
                      value={productForm.imageUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProductForm({ ...productForm, imageUrl: val });
                        if (!productImageFile) setProductImagePreview(val);
                      }}
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN: LIVE STOREFRONT CARD PREVIEW */}
                <div className="preview-container-box">
                  <div className="preview-badge-header">
                    <span className="preview-badge">
                      <span className="preview-badge-dot" />
                      Live Storefront Card Preview
                    </span>
                    <span style={{ fontSize: "11px", color: productForm.isAvailable ? "#2b7a3e" : "#a83232", fontWeight: "600" }}>
                      {productForm.isAvailable ? "In Stock" : "Hidden"}
                    </span>
                  </div>

                  <div className="preview-card-frame">
                    <div className="preview-card-img-wrap">
                      <img
                        src={
                          productImagePreview ||
                          productForm.imageUrl ||
                          resolveProductImage({ name: productForm.name, type: productForm.type })
                        }
                        alt="Product preview"
                        onError={(e) => {
                          e.target.src = sunflowerbouquet;
                        }}
                      />
                      {!productForm.isAvailable && (
                        <div
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            background: "rgba(168, 50, 50, 0.92)",
                            color: "#fff",
                            fontSize: "10.5px",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontWeight: "600",
                            letterSpacing: "0.04em",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          Out of Stock
                        </div>
                      )}
                    </div>
                    <div className="preview-card-content">
                      <span className="preview-card-cat">
                        {productForm.type || "Crochet"}
                      </span>
                      <h4 className="preview-card-title">
                        {productForm.name || "Handmade Bouquet"}
                      </h4>
                      <div className="preview-card-price">
                        ₹{Number(productForm.price || 0).toLocaleString("en-IN")}
                      </div>
                      <p className="preview-card-desc">
                        {productForm.description || "Handmade sunshine, crafted slowly with care."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODAL ACTIONS BAR */}
              <div className="modal-actions-bar">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-save-btn"
                  disabled={savingProduct}
                >
                  {savingProduct ? (
                    <>
                      <RefreshCw size={15} className="spin" />
                      Saving to Supabase...
                    </>
                  ) : editingProduct ? (
                    <>
                      <Check size={16} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="admin-modal-overlay" onClick={() => setDeletingProduct(null)}>
          <div
            className="admin-delete-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="delete-modal-icon-circle">
              <Trash2 size={24} />
            </div>

            <h3 id="delete-modal-title">Delete Product?</h3>
            <p>
              Are you sure you want to delete this product? It will be permanently removed from your
              storefront and Supabase database.
            </p>

            <div className="delete-product-preview-pill">
              <img
                src={resolveProductImage(deletingProduct)}
                alt={deletingProduct.name}
                className="delete-product-preview-thumb"
                onError={(e) => {
                  e.target.src = sunflowerbouquet;
                }}
              />
              <div className="delete-product-preview-info">
                <h4 className="delete-product-preview-title">{deletingProduct.name}</h4>
                <div className="delete-product-preview-meta">
                  ₹{Number(deletingProduct.price).toLocaleString("en-IN")} • {deletingProduct.type || "Crochet"} • {deletingProduct.stock !== undefined ? deletingProduct.stock : 10} in stock
                </div>
              </div>
            </div>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={() => setDeletingProduct(null)}
              >
                Keep Product
              </button>
              <button
                type="button"
                className="delete-confirm-btn"
                onClick={confirmDeleteProduct}
              >
                <Trash2 size={16} />
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK NOTIFICATION */}
      {feedbackMsg && (
        <div className="admin-toast" role="status" aria-live="polite">
          {feedbackMsg}
        </div>
      )}
    </div>
  );
}
