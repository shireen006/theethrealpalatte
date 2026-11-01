import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

export default function AdminDashboard({ onBackToStore, onProductsUpdated, initialProducts = [] }) {
  const [token, setToken] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(true);

  // Actively verify administrator credentials with Supabase (prevents localStorage spoofing)
  useEffect(() => {
    let active = true;

    const verifyAdminSession = async () => {
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
          const mapped = data.map((p) => ({
            ...p,
            isAvailable: p.is_available !== false,
          }));
          setProducts(mapped);
          return;
        }
      }
      // If table is empty or offline, use initialProducts
      if (initialProducts && initialProducts.length > 0) {
        setProducts(
          initialProducts.map((p) => ({
            ...p,
            isAvailable: p.isAvailable !== false,
          }))
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
    setProductForm({
      name: prod.name,
      price: prod.price,
      type: prod.type || "Crochet",
      description: prod.description || "",
      stock: prod.stock !== undefined ? prod.stock : 10,
      isAvailable: prod.is_available !== false && prod.isAvailable !== false,
      imageUrl: prod.image || "",
    });
    setProductImageFile(null);
    setProductImagePreview(prod.image || "");
    setShowProductModal(true);
  };

  // Handle image file selection
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

      // 1. Upload to Supabase Storage if file was chosen
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

      const productRecord = {
        name: productForm.name.trim(),
        price: Number(productForm.price),
        type: productForm.type,
        description: productForm.description.trim(),
        stock: Number(productForm.stock) || 0,
        is_available: Boolean(productForm.isAvailable),
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
              ? { ...p, ...productRecord, isAvailable: productRecord.is_available }
              : p
          )
        );
        notify(`"${productForm.name}" updated successfully! 🌸`);
      } else {
        // CREATE new product
        let createdProduct = {
          id: `prod_${Date.now()}`,
          ...productRecord,
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

  // Delete product
  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    const prod = deletingProduct;

    try {
      if (isSupabaseConfigured) {
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

  // Calculate statistics
  const totalCount = products.length;
  const availableCount = products.filter(
    (p) => p.is_available !== false && p.isAvailable !== false
  ).length;
  const outOfStockCount = totalCount - availableCount;
  const crochetCount = products.filter((p) => p.type === "Crochet").length;
  const bloomCount = products.filter((p) => p.type === "Bloom Studio").length;

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
        {/* STATS BAR */}
        <div className="admin-stats-grid" style={{ marginBottom: "24px" }}>
          <div className="stat-card">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{totalCount}</div>
            <div className="stat-sub">Handmade catalogue items</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Stock / Available</div>
            <div className="stat-value" style={{ color: "#2b7a3e" }}>{availableCount}</div>
            <div className="stat-sub">Active on storefront</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Out of Stock / Hidden</div>
            <div className="stat-value" style={{ color: "#a83232" }}>{outOfStockCount}</div>
            <div className="stat-sub">Unavailable for enquiry</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Crochet & Bloom Studio</div>
            <div className="stat-value">{crochetCount} / {bloomCount}</div>
            <div className="stat-sub">Crochet / Bloom bouquets</div>
          </div>
        </div>

        {/* CONTROLS BAR: SEARCH, FILTER, ADD PRODUCT */}
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
                  padding: "9px 12px 9px 36px",
                  border: "1px solid var(--line)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            {/* CATEGORY FILTER PILLS */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["all", "Crochet", "Bloom Studio", "Paintings", "Accessories"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: "1px solid",
                    borderColor: selectedCategory === cat ? "var(--blush-strong)" : "var(--line)",
                    background: selectedCategory === cat ? "var(--soft-cream)" : "#ffffff",
                    color: selectedCategory === cat ? "var(--blush-strong)" : "var(--espresso)",
                    fontSize: "12px",
                    fontWeight: selectedCategory === cat ? "600" : "400",
                    cursor: "pointer",
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
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px" }}
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
                padding: "8px 18px",
                margin: 0,
                width: "auto",
                fontWeight: 600,
              }}
            >
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Image</th>
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
                  return (
                    <tr key={p.id || p._id}>
                      <td>
                        <img
                          src={p.image || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=200"}
                          alt={p.name}
                          className="admin-thumb"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=200";
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
                              padding: "4px",
                              color: isAvail ? "#2b7a3e" : "#a83232",
                            }}
                            title={isAvail ? "Mark Out of Stock" : "Mark Available"}
                          >
                            {isAvail ? <Eye size={16} /> : <EyeOff size={16} />}
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
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            className="row-action-btn delete"
                            onClick={() => setDeletingProduct(p)}
                            title="Delete Product"
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
      </div>

      {/* ADD / EDIT PRODUCT MODAL WITH LIVE PREVIEW */}
      {showProductModal && (
        <div className="admin-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: "780px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                <p>Configure product details, pricing, category, and live storefront preview</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowProductModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-modal-form">
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
                {/* LEFT COLUMN: FORM FIELDS */}
                <div>
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. Crochet Sunflower Bouquet"
                      required
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Price (₹ INR) *</label>
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

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Handmade sunshine, just for you..."
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Stock Count</label>
                      <input
                        type="number"
                        min="0"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ display: "flex", alignItems: "center", paddingTop: "20px" }}>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", textTransform: "none", fontSize: "13px" }}>
                        <input
                          type="checkbox"
                          checked={productForm.isAvailable}
                          onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                          style={{ width: "auto" }}
                        />
                        Available for WhatsApp Enquiry
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Product Image</label>
                    <div className="image-upload-zone" style={{ marginBottom: "8px" }}>
                      <label className="file-upload-btn">
                        <Upload size={14} /> Upload Image File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          style={{ display: "none" }}
                        />
                      </label>
                      <span className="file-name-label">
                        {productImageFile ? productImageFile.name : "or paste image URL below"}
                      </span>
                    </div>
                    <input
                      type="url"
                      placeholder="https://... image web link"
                      value={productForm.imageUrl}
                      onChange={(e) => {
                        setProductForm({ ...productForm, imageUrl: e.target.value });
                        if (!productImageFile) setProductImagePreview(e.target.value);
                      }}
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN: LIVE STOREFRONT PREVIEW CARD */}
                <div>
                  <div style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", fontWeight: "600", marginBottom: "8px" }}>
                    Live Storefront Card Preview
                  </div>
                  <div
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: "8px",
                      overflow: "hidden",
                      background: "#ffffff",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "200px", background: "var(--cream)" }}>
                      <img
                        src={productImagePreview || productForm.imageUrl || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400"}
                        alt="Product preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400";
                        }}
                      />
                      {!productForm.isAvailable && (
                        <div
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            background: "rgba(168, 50, 50, 0.9)",
                            color: "#fff",
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontWeight: "500",
                          }}
                        >
                          Out of Stock
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "11px", color: "var(--blush-strong)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600" }}>
                        {productForm.type}
                      </span>
                      <h4 style={{ fontFamily: "Playfair Display, serif", fontSize: "16px", margin: "4px 0 6px", color: "var(--espresso)" }}>
                        {productForm.name || "Product Title"}
                      </h4>
                      <div style={{ fontWeight: "600", fontSize: "15px", color: "var(--espresso)", marginBottom: "6px" }}>
                        ₹{Number(productForm.price || 0).toLocaleString("en-IN")}
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0, lineHeight: 1.4, maxHeight: "50px", overflow: "hidden" }}>
                        {productForm.description || "Handmade sunshine, just for you."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: "24px", borderTop: "1px solid var(--line)", paddingTop: "16px" }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-login-btn"
                  style={{ width: "auto", margin: 0, padding: "10px 24px" }}
                  disabled={savingProduct}
                >
                  {savingProduct ? "Saving to Supabase..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="admin-modal-overlay" onClick={() => setDeletingProduct(null)}>
          <div className="admin-modal-card" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ color: "#a83232" }}>Delete Product</h3>
              <p>Are you sure you want to permanently delete this product?</p>
            </div>
            <div style={{ padding: "12px", background: "var(--soft-cream)", borderRadius: "4px", marginBottom: "20px" }}>
              <strong>{deletingProduct.name}</strong>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                Price: ₹{Number(deletingProduct.price).toLocaleString("en-IN")} • Category: {deletingProduct.type}
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setDeletingProduct(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-login-btn"
                style={{ width: "auto", margin: 0, background: "#a83232", borderColor: "#a83232" }}
                onClick={confirmDeleteProduct}
              >
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
