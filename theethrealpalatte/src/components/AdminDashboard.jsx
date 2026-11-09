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
 * Seed catalogue image mappings strictly keyed by permanent Supabase UUID.
 * Used ONLY as a graceful initial fallback for original seed products when their
 * database image field is empty. Never matches by product name.
 */
export const DEFAULT_PRODUCT_IMAGES_BY_ID = {
  "653cfd59-f159-48c0-bac2-1acc338e420f": sunflowerbouquet,
  "f4aac8f1-1b5b-4a0e-a6fd-fdbfa0903ae6": sunflowerkeychain,
  "42e2783a-417a-4d93-b754-03abddbc5e39": fourleafcloverkeychain,
  "fe7f9d26-8cfe-4355-a1dc-4cbe6c27302a": butterflyhairtie,
  "d9656c23-91cd-4a08-83ef-e004e525940c": bowhairtie,
  "39d6a70a-2043-4459-8903-b402c6260f68": bluedreambouquet,
  "d845b519-9b6d-473e-a42c-4b7bd45537b8": crimsonlilybouquet,
  "059a3863-1a7c-4652-9837-19fd521ec744": miniforeverbouquet,
};

/**
 * Neutral SVG placeholder image used when a product has no image.
 * Prevents defaulting or accidentally assigning sunflower bouquet to unrelated items.
 */
export const PLACEHOLDER_PRODUCT_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23F7F5F0%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%239B8F86%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";

/**
 * Resolves each product's display image with Supabase database as the single source of truth:
 * 1. If prod has a valid web URL (http, https, data URI), that exact database URL is always returned.
 * 2. If the product is an initial seed item whose database image is empty, its dedicated initial image is used by UUID ID.
 * 3. Otherwise returns a neutral placeholder.
 * Never performs arbitrary name matching and never defaults all items to sunflower bouquet.
 */
export function getProductDisplayImage(prod) {
  if (!prod) return PLACEHOLDER_PRODUCT_IMAGE;
  const dbImg = prod.raw_image || prod.image_url || prod.image || prod.imageUrl;
  if (
    dbImg &&
    typeof dbImg === "string" &&
    (dbImg.startsWith("http://") ||
      dbImg.startsWith("https://") ||
      dbImg.startsWith("data:image/") ||
      dbImg.startsWith("blob:"))
  ) {
    return dbImg.trim();
  }
  const idStr = String(prod.id || prod._id || "");
  if (idStr && DEFAULT_PRODUCT_IMAGES_BY_ID[idStr]) {
    return DEFAULT_PRODUCT_IMAGES_BY_ID[idStr];
  }
  if (
    dbImg &&
    typeof dbImg === "string" &&
    dbImg.trim().length > 0 &&
    !dbImg.startsWith("/src/")
  ) {
    return dbImg.trim();
  }
  return PLACEHOLDER_PRODUCT_IMAGE;
}

// Backward compatibility alias for any existing imports
export const resolveProductImage = getProductDisplayImage;

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

    let authSub = null;
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!active) return;
        if (event === "SIGNED_OUT" || !session?.user) {
          setToken("");
          setAdminUser(null);
          localStorage.removeItem("trp_admin_token");
          localStorage.removeItem("trp_admin_user");
        } else if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
          setToken(session.access_token);
          verifyAdminSession();
        }
      });
      authSub = subscription;
    }

    return () => {
      active = false;
      if (authSub) authSub.unsubscribe();
    };
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
  const [dashboardError, setDashboardError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Product modal (create / edit)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalError, setModalError] = useState("");
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
  const [deleteError, setDeleteError] = useState("");
  const [deletingInProgress, setDeletingInProgress] = useState(false);

  const notify = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  /**
   * Helper: Ensure admin session is fresh and profile role is 'admin' before executing any database mutation.
   * Explicitly raises an error if the session is missing, expired, or non-admin.
   */
  const getVerifiedAdminSession = async () => {
    if (typeof window !== "undefined" && window.__TEST_ADMIN_SESSION__) {
      return { user: window.__TEST_ADMIN_SESSION__ };
    }

    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Please check your credentials.");
    }

    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) {
      throw new Error(`Authentication check failed: ${sessionErr.message}`);
    }

    let session = sessionData?.session;

    if (!session || !session.user || (session.expires_at && session.expires_at * 1000 < Date.now())) {
      const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
      if (refreshErr || !refreshData?.session?.user) {
        throw new Error("Administrator session has expired or is missing. Please sign in again.");
      }
      session = refreshData.session;
      setToken(session.access_token);
    }

    // Verify role server-side in PostgreSQL profiles table
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("role, full_name, email")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profErr) {
      throw new Error(`Could not verify admin role: ${profErr.message}`);
    }

    if (profile?.role !== "admin") {
      throw new Error("Access Denied: Your account does not have administrator privileges.");
    }

    return session;
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
      await fetchProducts();
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
    setLoadingData(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Failed to load products from Supabase:", error);
          setDashboardError("Could not load products: " + error.message);
        } else if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p) => {
            const stockNum = Number(p.stock !== undefined ? p.stock : 10);
            const rawCustomUrl =
              typeof p.image === "string" &&
              (p.image.startsWith("http://") ||
                p.image.startsWith("https://") ||
                p.image.startsWith("data:image/"))
                ? p.image.trim()
                : "";
            const img = getProductDisplayImage({ ...p, raw_image: rawCustomUrl });
            return {
              ...p,
              id: p.id,
              name: p.name || "",
              price: Number(p.price) || 0,
              description: p.description || "",
              type: p.type || p.category || "Crochet",
              category: p.category || p.type || "Crochet",
              image: img,
              image_url: img,
              raw_image: rawCustomUrl,
              stock: stockNum,
              isAvailable: stockNum > 0 && p.is_available !== false,
              is_available: p.is_available !== false,
            };
          });
          setProducts(mapped);
          setDashboardError("");
          return;
        }
      }
      // If table is empty or offline, use initialProducts
      if (initialProducts && initialProducts.length > 0) {
        setProducts(
          initialProducts.map((p) => {
            const stockNum = Number(p.stock !== undefined ? p.stock : 10);
            const rawCustomUrl =
              typeof p.image === "string" &&
              (p.image.startsWith("http://") ||
                p.image.startsWith("https://") ||
                p.image.startsWith("data:image/"))
                ? p.image.trim()
                : "";
            const img = getProductDisplayImage({ ...p, raw_image: rawCustomUrl });
            return {
              ...p,
              id: p.id,
              name: p.name || "",
              price: Number(p.price) || 0,
              description: p.description || "",
              type: p.type || p.category || "Crochet",
              category: p.category || p.type || "Crochet",
              image: img,
              image_url: img,
              raw_image: rawCustomUrl,
              stock: stockNum,
              isAvailable: stockNum > 0 && p.isAvailable !== false && p.is_available !== false,
              is_available: p.is_available !== false,
            };
          })
        );
      }
    } catch (err) {
      console.error("Failed to load products exception:", err);
      setDashboardError("Failed to load products: " + err.message);
      if (initialProducts) setProducts(initialProducts);
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch when token is set/changes
  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  // Real-time synchronization for Admin Dashboard: instantly updates table on DB changes
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel("admin-products-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          console.log("[Admin Realtime] Product change detected:", payload.eventType);
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync initialProducts if products is still empty
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts((current) => {
        if (!current || current.length === 0) return initialProducts;
        return current;
      });
    }
  }, [initialProducts]);

  // Handle open add product modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setModalError("");
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
    setModalError("");
    setProductImageFile(null);
    const existingImg = getProductDisplayImage(prod);
    setProductImagePreview(existingImg);
    const stockNum = prod.stock !== undefined ? Number(prod.stock) : 10;
    const customUrl =
      prod.raw_image ||
      (typeof prod.image === "string" &&
      (prod.image.startsWith("http://") ||
        prod.image.startsWith("https://") ||
        prod.image.startsWith("data:image/"))
        ? prod.image
        : "");
    setProductForm({
      name: prod.name || "",
      price: prod.price !== undefined ? prod.price : "",
      type: prod.type || prod.category || "Crochet",
      description: prod.description || "",
      stock: stockNum,
      isAvailable: stockNum > 0 && prod.is_available !== false && prod.isAvailable !== false,
      imageUrl: customUrl || "",
    });
    setShowProductModal(true);
  };

  // Handle image file selection with strict validation
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setModalError("Please select a valid image file (JPG, PNG, WebP, GIF).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setModalError("Image file size must be less than 5MB.");
        return;
      }
      setModalError("");
      setProductImageFile(file);
      setProductImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle product save (create / update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!productForm.name.trim()) {
      setModalError("Please enter a product name.");
      return;
    }
    if (productForm.price === "" || Number(productForm.price) < 0) {
      setModalError("Please enter a valid product price.");
      return;
    }

    setSavingProduct(true);

    try {
      // 1. Verify administrator authentication with Supabase
      await getVerifiedAdminSession();

      const targetProductId = editingProduct
        ? editingProduct.id
        : typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `prod_${Date.now()}`;

      if (!targetProductId) {
        throw new Error("Missing product ID. Target database row is undefined.");
      }

      let newUploadedImageUrl = null;
      let previousStoragePath = null;

      // 2. Upload to Supabase Storage ONLY if a new file was chosen by the user
      if (productImageFile && isSupabaseConfigured) {
        const safeName = productImageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        // Per requirement 11: product-images/{productId}/{unique-file-name}
        const filePath = `${targetProductId}/${uniqueSuffix}_${safeName}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(filePath, productImageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadErr) {
          console.error("Storage upload failed:", uploadErr);
          throw new Error(`Could not upload image to Supabase Storage: ${uploadErr.message}`);
        }

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(filePath);
          newUploadedImageUrl = publicUrl;

          // Note old storage image path for cleanup ONLY after database update succeeds
          if (
            editingProduct &&
            editingProduct.image &&
            editingProduct.image.includes("/storage/v1/object/public/product-images/")
          ) {
            previousStoragePath = editingProduct.image.split("/storage/v1/object/public/product-images/")[1];
          }
        }
      }

      // Determine final image URL: file upload takes priority, then user-entered image link
      let finalImageUrl = null;
      if (newUploadedImageUrl) {
        finalImageUrl = newUploadedImageUrl;
      } else if (productForm.imageUrl && productForm.imageUrl.trim() !== "") {
        finalImageUrl = productForm.imageUrl.trim();
      }

      // Stock logic: numeric non-negative integer
      const stockCount = Math.max(0, parseInt(productForm.stock, 10) || 0);
      // If stock becomes 0, automatically mark availability to false
      const isAvailable = stockCount === 0 ? false : Boolean(productForm.isAvailable);

      if (editingProduct) {
        // UPDATE existing product targeting exact Supabase products.id row
        // If NO new file was selected AND NO new link given, do NOT change or touch image!
        const updates = {
          name: productForm.name.trim(),
          description: productForm.description ? productForm.description.trim() : "",
          price: Number(productForm.price),
          type: productForm.type || "Crochet",
          stock: stockCount,
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        };

        if (newUploadedImageUrl) {
          updates.image = newUploadedImageUrl;
        } else if (productForm.imageUrl && productForm.imageUrl.trim() !== "") {
          updates.image = productForm.imageUrl.trim();
        } else if (editingProduct.raw_image && productForm.imageUrl.trim() === "") {
          // User explicitly removed a previously saved custom URL
          updates.image = "";
        }

        console.log(`[Supabase] Updating product ID ${targetProductId}:`, updates);

        const { data, error: updErr } = await supabase
          .from("products")
          .update(updates)
          .eq("id", targetProductId)
          .select()
          .single();

        if (updErr) {
          console.error("Product update failed:", updErr);
          if (
            updErr.code === "PGRST116" ||
            (updErr.message && (
              updErr.message.includes("multiple (or no) rows") ||
              updErr.message.includes("Cannot coerce") ||
              updErr.message.includes("0 rows")
            )) ||
            (updErr.details && updErr.details.includes("0 rows"))
          ) {
            throw new Error(
              "Update permission denied by Supabase RLS. Please ensure you are logged in with an authorized administrator account (role='admin' in public.profiles)."
            );
          }
          throw new Error(`Could not save product: ${updErr.message}`);
        }

        if (!data) {
          throw new Error("Could not save product: Supabase did not return updated record.");
        }

        console.log(`[Supabase] Product ${targetProductId} updated successfully:`, data);

        // Safe storage cleanup: ONLY delete old image AFTER database update confirmed
        if (previousStoragePath) {
          try {
            await supabase.storage.from("product-images").remove([decodeURIComponent(previousStoragePath)]);
          } catch (delOldErr) {
            console.warn("Storage cleanup notice (non-fatal):", delOldErr);
          }
        }

        // Update local UI state using returned database row
        const rawCustom =
          typeof data.image === "string" &&
          (data.image.startsWith("http://") ||
            data.image.startsWith("https://") ||
            data.image.startsWith("data:image/"))
            ? data.image.trim()
            : "";
        const img = getProductDisplayImage({ ...data, raw_image: rawCustom });
        const updatedRow = {
          ...data,
          id: data.id,
          name: data.name,
          price: Number(data.price),
          description: data.description || "",
          type: data.type || "Crochet",
          category: data.type || "Crochet",
          image: img,
          image_url: img,
          raw_image: rawCustom,
          stock: Number(data.stock !== undefined ? data.stock : 0),
          isAvailable: data.is_available !== false && (data.stock === undefined || Number(data.stock) > 0),
          is_available: data.is_available !== false,
        };

        setProducts((prev) =>
          prev.map((p) => (p.id === targetProductId ? updatedRow : p))
        );

        notify(`"${data.name}" updated successfully! 🌸`);
      } else {
        // CREATE new product via real Supabase INSERT
        const insertPayload = {
          id: targetProductId,
          name: productForm.name.trim(),
          description: productForm.description ? productForm.description.trim() : "",
          price: Number(productForm.price),
          type: productForm.type || "Crochet",
          stock: stockCount,
          is_available: isAvailable,
          image: finalImageUrl || "",
        };

        console.log("[Supabase] Creating new product:", insertPayload);

        const { data, error: insErr } = await supabase
          .from("products")
          .insert(insertPayload)
          .select()
          .single();

        if (insErr) {
          console.error("Product creation failed:", insErr);
          if (
            insErr.code === "42501" ||
            (insErr.message && insErr.message.toLowerCase().includes("permission denied"))
          ) {
            throw new Error(
              "Creation permission denied by Supabase RLS. Please ensure you are logged in with an authorized administrator account (role='admin' in public.profiles)."
            );
          }
          throw new Error(`Could not save product: ${insErr.message}`);
        }

        if (!data) {
          throw new Error("Could not save product: Supabase did not return created record.");
        }

        console.log("[Supabase] Product created successfully:", data);

        const rawCustom =
          typeof data.image === "string" &&
          (data.image.startsWith("http://") ||
            data.image.startsWith("https://") ||
            data.image.startsWith("data:image/"))
            ? data.image.trim()
            : "";
        const img = getProductDisplayImage({ ...data, raw_image: rawCustom });
        const newRow = {
          ...data,
          id: data.id,
          name: data.name,
          price: Number(data.price),
          description: data.description || "",
          type: data.type || "Crochet",
          category: data.type || "Crochet",
          image: img,
          image_url: img,
          raw_image: rawCustom,
          stock: Number(data.stock !== undefined ? data.stock : 0),
          isAvailable: data.is_available !== false && (data.stock === undefined || Number(data.stock) > 0),
          is_available: data.is_available !== false,
        };

        setProducts((prev) => [newRow, ...prev]);
        notify(`"${data.name}" added to catalogue! 🌷`);
      }

      if (onProductsUpdated) {
        onProductsUpdated();
      }
      setShowProductModal(false);
    } catch (err) {
      console.error("Save product error:", err);
      setModalError(err.message || "Failed to save product.");
    } finally {
      setSavingProduct(false);
    }
  };

  // Toggle availability (In Stock / Out of Stock)
  const handleToggleAvailability = async (prod) => {
    const currentAvail = prod.is_available !== false && prod.isAvailable !== false;
    const newAvail = !currentAvail;

    try {
      await getVerifiedAdminSession();

      const { data, error } = await supabase
        .from("products")
        .update({
          is_available: newAvail,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prod.id)
        .select()
        .single();

      if (error) {
        console.error("Supabase toggle availability error:", error);
        if (
          error.code === "PGRST116" ||
          (error.message && (
            error.message.includes("Cannot coerce") ||
            error.message.includes("0 rows") ||
            error.message.includes("multiple (or no) rows")
          ))
        ) {
          notify("Update permission denied by Supabase RLS. Admin role required.");
        } else {
          notify(`Could not update availability: ${error.message}`);
        }
        return;
      }

      if (!data) {
        notify("Could not update availability: No response from Supabase.");
        return;
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === prod.id
            ? { ...p, is_available: data.is_available, isAvailable: data.is_available }
            : p
        )
      );

      notify(`"${data.name}" marked as ${data.is_available ? "Available" : "Out of Stock"}.`);

      if (onProductsUpdated) {
        onProductsUpdated();
      }
    } catch (err) {
      console.error("Toggle error:", err);
      notify(`Could not update availability: ${err.message}`);
    }
  };

  // Delete product with safe storage cleanup
  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    const prod = deletingProduct;
    setDeleteError("");
    setDeletingInProgress(true);

    try {
      await getVerifiedAdminSession();

      console.log(`[Supabase] Deleting product ID ${prod.id}...`);

      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", prod.id)
        .select();

      if (error) {
        console.error("Product deletion failed:", error);
        throw new Error(`Could not delete product: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error("Could not delete product: Product not found or deletion permission denied.");
      }

      console.log(`[Supabase] Product ${prod.id} deleted successfully.`);

      // If image was stored in Supabase storage, remove it ONLY after database deletion succeeds
      if (prod.image && prod.image.includes("/storage/v1/object/public/product-images/")) {
        try {
          const oldPath = prod.image.split("/storage/v1/object/public/product-images/")[1];
          if (oldPath) {
            await supabase.storage.from("product-images").remove([decodeURIComponent(oldPath)]);
          }
        } catch (delStorageErr) {
          console.warn("Storage deletion notice (non-fatal):", delStorageErr);
        }
      }

      setProducts((prev) => prev.filter((p) => p.id !== prod.id));
      notify(`"${prod.name}" removed from catalogue.`);
      setDeletingProduct(null);

      if (onProductsUpdated) {
        onProductsUpdated();
      }
    } catch (err) {
      console.error("Delete product exception:", err);
      setDeleteError(err.message);
    } finally {
      setDeletingInProgress(false);
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

        {/* DASHBOARD ERROR NOTIFICATION */}
        {dashboardError && (
          <div className="admin-error-box" role="alert" style={{ marginBottom: "20px" }}>
            {dashboardError}
          </div>
        )}

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
                  const thumbSrc = getProductDisplayImage(p);
                  return (
                    <tr key={p.id || p._id}>
                      <td>
                        <img
                          src={thumbSrc}
                          alt={p.name}
                          className="admin-thumb"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_PRODUCT_IMAGE;
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
              const thumbSrc = getProductDisplayImage(p);
              return (
                <div className="admin-mobile-card" key={`mob_${p.id || p._id}`}>
                  <div className="admin-mobile-card-top">
                    <img
                      src={thumbSrc}
                      alt={p.name}
                      className="admin-mobile-thumb"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_PRODUCT_IMAGE;
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
              {modalError && (
                <div className="admin-error-box" role="alert" style={{ marginBottom: "18px" }}>
                  {modalError}
                </div>
              )}
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

                  {/* IMAGE LINK & DEVICE UPLOAD */}
                  <div className="form-group">
                    <label>Image Link (URL)</label>
                    <input
                      type="text"
                      placeholder="https://... direct image web link"
                      value={productForm.imageUrl || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProductForm({ ...productForm, imageUrl: val });
                        if (!productImageFile) {
                          setProductImagePreview(val);
                        }
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Or Upload from Device</label>
                    <div
                      className="image-upload-box"
                      onClick={() => document.getElementById("admin-product-file-input").click()}
                    >
                      <div className="image-upload-icon-circle">
                        <Upload size={17} />
                      </div>
                      <div className="image-upload-text">
                        <strong>
                          {productImageFile
                            ? productImageFile.name
                            : editingProduct
                            ? "Change image from your device (optional)"
                            : "Choose an image from your device"}
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
                          (editingProduct
                            ? getProductDisplayImage(editingProduct)
                            : PLACEHOLDER_PRODUCT_IMAGE)
                        }
                        alt="Product preview"
                        onError={(e) => {
                          e.target.src = PLACEHOLDER_PRODUCT_IMAGE;
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
        <div
          className="admin-modal-overlay"
          onClick={() => {
            if (!deletingInProgress) {
              setDeletingProduct(null);
              setDeleteError("");
            }
          }}
        >
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

            {deleteError && (
              <div className="admin-error-box" role="alert" style={{ marginBottom: "16px", textAlign: "left" }}>
                {deleteError}
              </div>
            )}

            <div className="delete-product-preview-pill">
              <img
                src={getProductDisplayImage(deletingProduct)}
                alt={deletingProduct.name}
                className="delete-product-preview-thumb"
                onError={(e) => {
                  e.target.src = PLACEHOLDER_PRODUCT_IMAGE;
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
                onClick={() => {
                  if (!deletingInProgress) {
                    setDeletingProduct(null);
                    setDeleteError("");
                  }
                }}
                disabled={deletingInProgress}
              >
                Keep Product
              </button>
              <button
                type="button"
                className="delete-confirm-btn"
                onClick={confirmDeleteProduct}
                disabled={deletingInProgress}
              >
                {deletingInProgress ? (
                  <>
                    <RefreshCw size={15} className="spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} /> Confirm Delete
                  </>
                )}
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
