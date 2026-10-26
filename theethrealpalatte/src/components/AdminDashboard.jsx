import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  ArrowLeft,
  LogOut,
  Upload,
  X,
  ExternalLink,
  Search,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboard({ onBackToStore }) {
  const [token, setToken] = useState(() => localStorage.getItem("trp_admin_token") || "");
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const u = localStorage.getItem("trp_admin_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  // Admin login credentials state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Active view tab: 'overview' | 'products' | 'orders' | 'customers'
  const [activeTab, setActiveTab] = useState("overview");

  // Dashboard data states
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

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

  // Order details modal
  const [viewingOrder, setViewingOrder] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const notify = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid administrator credentials");
      }

      setToken(data.token);
      setAdminUser(data.user);
      localStorage.setItem("trp_admin_token", data.token);
      localStorage.setItem("trp_admin_user", JSON.stringify(data.user));
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setToken("");
    setAdminUser(null);
    localStorage.removeItem("trp_admin_token");
    localStorage.removeItem("trp_admin_user");
  };

  // Fetch data when token is present
  const fetchDashboardData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Overview
      const ovRes = await fetch("/api/admin/overview", { headers });
      if (ovRes.ok) {
        const ovData = await ovRes.json();
        setOverview(ovData.overview);
      }

      // 2. Products
      const prodRes = await fetch("/api/admin/products", { headers });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }

      // 3. Orders
      const ordRes = await fetch("/api/admin/orders", { headers });
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData.orders || []);
      }

      // 4. Customers
      const custRes = await fetch("/api/admin/customers", { headers });
      if (custRes.ok) {
        const custData = await custRes.json();
        setCustomers(custData.customers || []);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
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
      type: prod.type,
      description: prod.description || "",
      stock: prod.stock !== undefined ? prod.stock : 10,
      isAvailable: prod.isAvailable !== false,
      imageUrl: prod.image || "",
    });
    setProductImageFile(null);
    setProductImagePreview(prod.image || "");
    setShowProductModal(true);
  };

  // Handle image selection
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
    setSavingProduct(true);

    try {
      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("price", productForm.price);
      formData.append("type", productForm.type);
      formData.append("description", productForm.description);
      formData.append("stock", productForm.stock);
      formData.append("isAvailable", productForm.isAvailable);

      if (productImageFile) {
        formData.append("imageFile", productImageFile);
      } else if (productForm.imageUrl) {
        formData.append("imageUrl", productForm.imageUrl);
      }

      const url = editingProduct
        ? `/api/admin/products/${editingProduct._id}`
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save product");
      }

      notify(editingProduct ? "Product updated successfully!" : "Product created successfully!");
      setShowProductModal(false);
      fetchDashboardData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (prod) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${prod.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${prod._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product");
      }
      notify(`"${prod.name}" deleted successfully.`);
      fetchDashboardData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Update order status & payment
  const handleUpdateOrderStatus = async (orderId, newStatus, paymentVerified) => {
    try {
      const payload = {};
      if (newStatus !== undefined) payload.status = newStatus;
      if (paymentVerified !== undefined) payload.paymentVerified = paymentVerified;

      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update order");
      }

      notify(`Order ${data.order.orderNumber} updated.`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? data.order : o))
      );
      if (viewingOrder && viewingOrder._id === orderId) {
        setViewingOrder(data.order);
      }
      fetchDashboardData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Filtered orders
  const filteredOrders =
    orderStatusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === orderStatusFilter);

  // If not logged in as admin, render Admin Login screen
  if (!token || !adminUser) {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <span className="admin-badge">ADMIN PORTAL</span>
            <h2>Theethrealpalatte</h2>
            <p>Authorized Administrator Sign-in</p>
          </div>

          {loginError && (
            <div className="auth-error-banner" role="alert">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="admin-login-form">
            <div className="auth-field">
              <label>Administrator Email</label>
              <input
                type="email"
                placeholder="admin@theethrealpalatte.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="admin-login-btn"
              disabled={loginLoading}
            >
              {loginLoading ? "Authenticating..." : "Access Administrator Dashboard"}
            </button>
          </form>

          <div className="admin-login-footer">
            <button
              type="button"
              className="back-store-btn"
              onClick={onBackToStore}
            >
              <ArrowLeft size={16} /> Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* ADMIN HEADER */}
      <header className="admin-header">
        <div className="admin-header-left">
          <button className="admin-back-btn" onClick={onBackToStore} title="Return to public boutique">
            <ArrowLeft size={18} /> Storefront
          </button>
          <div className="admin-brand">
            <h1>Theethrealpalatte</h1>
            <span className="admin-role-tag">Admin Management</span>
          </div>
        </div>

        <div className="admin-header-right">
          <span className="admin-user-pill">
            👤 {adminUser.name} ({adminUser.email})
          </span>
          <button
            className="admin-refresh-btn"
            onClick={fetchDashboardData}
            title="Refresh data from database"
          >
            <RefreshCw size={16} />
          </button>
          <button
            className="admin-logout-btn"
            onClick={handleAdminLogout}
            title="Sign out of admin"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* TOAST FEEDBACK */}
      {feedbackMsg && <div className="admin-toast">{feedbackMsg}</div>}

      <div className="admin-body">
        {/* SIDEBAR TABS */}
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <button
              className={`admin-nav-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </button>

            <button
              className={`admin-nav-item ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <Package size={18} />
              <span>Products ({products.length})</span>
            </button>

            <button
              className={`admin-nav-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <ShoppingBag size={18} />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              className={`admin-nav-item ${activeTab === "customers" ? "active" : ""}`}
              onClick={() => setActiveTab("customers")}
            >
              <Users size={18} />
              <span>Customers ({customers.length})</span>
            </button>
          </nav>
        </aside>

        {/* MAIN ADMIN CONTENT AREA */}
        <main className="admin-main">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <section className="admin-tab-pane">
              <div className="pane-header">
                <h2>Store Performance Overview</h2>
                <p>Live metrics from the production MongoDB database.</p>
              </div>

              {overview ? (
                <>
                  <div className="admin-stats-grid">
                    <div className="stat-card">
                      <span className="stat-label">Total Products</span>
                      <strong className="stat-num">{overview.totalProducts}</strong>
                      <span className="stat-sub">
                        {overview.availableProducts} available · {overview.unavailableProducts} hidden
                      </span>
                    </div>

                    <div className="stat-card">
                      <span className="stat-label">Registered Customers</span>
                      <strong className="stat-num">{overview.totalCustomers}</strong>
                      <span className="stat-sub">Authentic accounts</span>
                    </div>

                    <div className="stat-card">
                      <span className="stat-label">Saved Orders & Enquiries</span>
                      <strong className="stat-num">{overview.totalOrders}</strong>
                      <span className="stat-sub">Recorded in database</span>
                    </div>

                    <div className="stat-card">
                      <span className="stat-label">Payment Verification</span>
                      <strong className="stat-num">
                        {overview.paymentVerifiedCount} / {overview.totalOrders}
                      </strong>
                      <span className="stat-sub">
                        {overview.paymentPendingCount} pending verification
                      </span>
                    </div>
                  </div>

                  {/* ORDER STATUS BREAKDOWN */}
                  <div className="admin-section-box">
                    <h3>Orders Grouped by Status</h3>
                    <div className="status-chips-grid">
                      {Object.entries(overview.statusCounts || {}).map(([st, cnt]) => (
                        <div key={st} className={`status-chip-card status-${st}`}>
                          <span className="status-chip-label">{st.toUpperCase()}</span>
                          <span className="status-chip-count">{cnt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="admin-loading">Loading metrics from MongoDB...</div>
              )}
            </section>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === "products" && (
            <section className="admin-tab-pane">
              <div className="pane-header with-action">
                <div>
                  <h2>Product Catalog Management</h2>
                  <p>Changes persist immediately to MongoDB and storefront.</p>
                </div>
                <button className="primary-admin-btn" onClick={handleOpenAddProduct}>
                  <Plus size={16} /> Add Product
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                          No products found.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <img
                              src={p.image}
                              alt={p.name}
                              className="admin-thumb"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100";
                              }}
                            />
                          </td>
                          <td>
                            <strong>{p.name}</strong>
                            <p className="admin-table-desc-preview">{p.description}</p>
                          </td>
                          <td>
                            <span className={`cat-pill cat-${p.type.toLowerCase()}`}>
                              {p.type}
                            </span>
                          </td>
                          <td>₹{Number(p.price).toLocaleString("en-IN")}</td>
                          <td>{p.stock !== undefined ? p.stock : 10}</td>
                          <td>
                            <span className={`avail-badge ${p.isAvailable ? "active" : "hidden"}`}>
                              {p.isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </td>
                          <td>
                            <div className="admin-row-actions">
                              <button
                                className="row-action-btn edit-btn"
                                onClick={() => handleOpenEditProduct(p)}
                                title="Edit product"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                className="row-action-btn delete-btn"
                                onClick={() => handleDeleteProduct(p)}
                                title="Delete product"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === "orders" && (
            <section className="admin-tab-pane">
              <div className="pane-header with-action">
                <div>
                  <h2>Customer Orders & Enquiries</h2>
                  <p>All recorded purchases with real-time status management.</p>
                </div>
                <div className="order-filter-wrap">
                  <label>Status:</label>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "30px" }}>
                          No orders found matching status "{orderStatusFilter}".
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord._id}>
                          <td>
                            <strong>{ord.orderNumber}</strong>
                            <span className="order-type-tag">
                              {ord.orderType === "whatsapp_enquiry" ? "WhatsApp" : "Store Checkout"}
                            </span>
                          </td>
                          <td>
                            <div>{ord.customerName}</div>
                            <small>{ord.customerEmail}</small>
                            <br />
                            <small>{ord.customerPhone}</small>
                          </td>
                          <td>
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="order-item-chip">
                                {it.name} × {it.quantity}
                              </div>
                            ))}
                          </td>
                          <td>
                            <strong>₹{ord.total.toLocaleString("en-IN")}</strong>
                          </td>
                          <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                          <td>
                            <select
                              className={`order-status-select status-color-${ord.status}`}
                              value={ord.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(ord._id, e.target.value, undefined)
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <label className="payment-verify-label">
                              <input
                                type="checkbox"
                                checked={ord.paymentVerified || false}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(ord._id, undefined, e.target.checked)
                                }
                              />
                              <span>{ord.paymentVerified ? "Verified ✓" : "Pending"}</span>
                            </label>
                          </td>
                          <td>
                            <button
                              className="view-order-btn"
                              onClick={() => setViewingOrder(ord)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 4: CUSTOMERS */}
          {activeTab === "customers" && (
            <section className="admin-tab-pane">
              <div className="pane-header">
                <h2>Registered Customers</h2>
                <p>Private user accounts (passwords and sensitive keys excluded).</p>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "30px" }}>
                          No registered customer accounts yet.
                        </td>
                      </tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c._id}>
                          <td>
                            <strong>{c.name}</strong>
                          </td>
                          <td>{c.email}</td>
                          <td>{c.phone || "—"}</td>
                          <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* PRODUCT ADD / EDIT MODAL */}
      {showProductModal && (
        <div className="overlay" onClick={() => setShowProductModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setShowProductModal(false)}>
              <X size={20} />
            </button>
            <div className="admin-modal-header">
              <h3>{editingProduct ? "Edit Product" : "Add New Boutique Creation"}</h3>
              <p>Set product details, prices in INR, category, and image asset.</p>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-modal-form">
              <div className="form-row-2">
                <div className="auth-field">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Handmade Crochet Tulip"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="auth-field">
                  <label>Price in INR (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 350"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                    required
                    min={0}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="auth-field">
                  <label>Category *</label>
                  <select
                    value={productForm.type}
                    onChange={(e) =>
                      setProductForm({ ...productForm, type: e.target.value })
                    }
                  >
                    <option value="Crochet">Crochet</option>
                    <option value="Paintings">Paintings</option>
                  </select>
                </div>

                <div className="auth-field">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: e.target.value })
                    }
                    min={0}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Artisanal description of materials, colors, customization notes..."
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                ></textarea>
              </div>

              {/* IMAGE SELECTION */}
              <div className="auth-field">
                <label>Product Image (Upload File or Enter Image URL)</label>
                <div className="image-upload-zone">
                  <input
                    type="file"
                    accept="image/*"
                    id="admin-image-file"
                    onChange={handleImageFileChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="admin-image-file" className="file-upload-btn">
                    <Upload size={16} /> Choose Image File
                  </label>
                  <span className="file-name-label">
                    {productImageFile ? productImageFile.name : "or specify URL below:"}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="https://... or /uploads/..."
                  value={productForm.imageUrl}
                  onChange={(e) => {
                    setProductForm({ ...productForm, imageUrl: e.target.value });
                    if (!productImageFile) setProductImagePreview(e.target.value);
                  }}
                  style={{ marginTop: "8px" }}
                />

                {productImagePreview && (
                  <div className="image-live-preview">
                    <span>Preview:</span>
                    <img src={productImagePreview} alt="Live preview" />
                  </div>
                )}
              </div>

              <div className="auth-field checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={productForm.isAvailable}
                    onChange={(e) =>
                      setProductForm({ ...productForm, isAvailable: e.target.checked })
                    }
                  />
                  <span>Active & Available for Customer Purchase</span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-admin-btn"
                  disabled={savingProduct}
                >
                  {savingProduct ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {viewingOrder && (
        <div className="overlay" onClick={() => setViewingOrder(null)}>
          <div className="admin-modal-card order-view-card" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setViewingOrder(null)}>
              <X size={20} />
            </button>
            <div className="admin-modal-header">
              <h3>Order {viewingOrder.orderNumber}</h3>
              <p>Placed on {new Date(viewingOrder.createdAt).toLocaleString()}</p>
            </div>

            <div className="order-details-grid">
              <div className="order-detail-col">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {viewingOrder.customerName}</p>
                <p><strong>Email:</strong> {viewingOrder.customerEmail}</p>
                <p><strong>Phone:</strong> {viewingOrder.customerPhone}</p>
                <p><strong>Address:</strong> {viewingOrder.deliveryAddress || "Not provided"}</p>
                {viewingOrder.customerNotes && (
                  <p><strong>Notes:</strong> {viewingOrder.customerNotes}</p>
                )}
              </div>

              <div className="order-detail-col">
                <h4>Status & Payment</h4>
                <div style={{ marginBottom: "12px" }}>
                  <label>Order Status:</label>
                  <select
                    className="order-status-select"
                    value={viewingOrder.status}
                    onChange={(e) =>
                      handleUpdateOrderStatus(viewingOrder._id, e.target.value, undefined)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <label className="payment-verify-label">
                  <input
                    type="checkbox"
                    checked={viewingOrder.paymentVerified || false}
                    onChange={(e) =>
                      handleUpdateOrderStatus(viewingOrder._id, undefined, e.target.checked)
                    }
                  />
                  <span>Manual Payment Verified by Business</span>
                </label>
              </div>
            </div>

            <div className="order-items-table-wrap">
              <h4>Ordered Items</h4>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td>{it.name}</td>
                      <td>₹{it.price.toLocaleString("en-IN")}</td>
                      <td>{it.quantity}</td>
                      <td>₹{(it.price * it.quantity).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="3" style={{ textAlign: "right" }}><strong>Total:</strong></td>
                    <td><strong>₹{viewingOrder.total.toLocaleString("en-IN")}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
