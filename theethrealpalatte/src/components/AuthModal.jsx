import React, { useState } from "react";
import { X, Lock, Mail, User as UserIcon, Phone, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = "login",
  noticeMessage = "",
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage("");
    setInfoMessage("");
  };

  const handleClose = () => {
    sessionStorage.setItem("trp_login_dismissed", "true");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    if (!isSupabaseConfigured) {
      setErrorMessage(
        "Supabase anon key is missing. Please add VITE_SUPABASE_ANON_KEY to your .env file to enable authentication."
      );
      return;
    }

    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email.trim(), {
          redirectTo: window.location.origin,
        });

        if (error) throw error;

        setInfoMessage(
          "Password reset instructions have been sent to your email address. Please check your inbox (and spam folder)."
        );
        return;
      }

      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (error) throw error;

        if (data && data.user) {
          const profileUser = {
            id: data.user.id,
            email: data.user.email,
            name:
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              data.user.email.split("@")[0],
            phone: data.user.user_metadata?.phone || "",
          };

          // Store for fast offline cache fallback
          localStorage.setItem("trp_user", JSON.stringify(profileUser));
          sessionStorage.setItem("trp_login_dismissed", "true");

          if (onAuthSuccess) {
            onAuthSuccess(profileUser, data.session?.access_token || "");
          }
          onClose();
        }
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              full_name: formData.name.trim(),
              phone: formData.phone.trim(),
            },
          },
        });

        if (error) throw error;

        // Check if email confirmation is required
        if (data?.user && !data.session) {
          setInfoMessage(
            "Account created! 🌸 A confirmation link has been sent to your email. Please verify your email, then sign in."
          );
          setMode("login");
          return;
        }

        if (data && data.user) {
          const profileUser = {
            id: data.user.id,
            email: data.user.email,
            name: formData.name.trim() || data.user.email.split("@")[0],
            phone: formData.phone.trim(),
          };

          localStorage.setItem("trp_user", JSON.stringify(profileUser));
          sessionStorage.setItem("trp_login_dismissed", "true");

          if (onAuthSuccess) {
            onAuthSuccess(profileUser, data.session?.access_token || "");
          }
          onClose();
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      let userFriendlyMsg = err.message || "Authentication failed. Please try again.";
      if (userFriendlyMsg.includes("Invalid login credentials")) {
        userFriendlyMsg = "Incorrect email or password. Please try again or reset your password.";
      } else if (userFriendlyMsg.includes("User already registered")) {
        userFriendlyMsg = "An account with this email already exists. Please sign in instead.";
      } else if (userFriendlyMsg.includes("rate limit") || userFriendlyMsg.includes("email rate limit")) {
        userFriendlyMsg = "Supabase email rate limit reached. To enable instant registration without confirmation limits, toggle 'Confirm email' OFF in your Supabase Dashboard under Authentication -> Providers -> Email.";
      }
      setErrorMessage(userFriendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="overlay auth-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Customer Authentication"
    >
      <div className="auth-modal-panel" onClick={(e) => e.stopPropagation()}>
        <button
          className="auth-close-btn"
          onClick={handleClose}
          aria-label="Close dialog and continue as guest"
        >
          <X size={20} />
        </button>

        <div className="auth-header">
          <span className="auth-motif">🌸</span>
          <h2 className="auth-title">
            {mode === "login"
              ? "Welcome Back"
              : mode === "signup"
              ? "Create Account"
              : "Reset Password"}
          </h2>
          <p className="auth-subtitle">
            {noticeMessage ? (
              <strong className="auth-notice-highlight">{noticeMessage}</strong>
            ) : mode === "login" ? (
              "Sign in to access your cart, track enquiries & checkout seamlessly."
            ) : mode === "signup" ? (
              "Join our boutique family for lovely handmade creations."
            ) : (
              "Enter your email address and we'll send you a link to reset your password."
            )}
          </p>
        </div>

        {/* MODE TABS (Only shown for login & signup) */}
        {mode !== "forgot" ? (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => {
                setMode("login");
                setErrorMessage("");
                setInfoMessage("");
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => {
                setMode("signup");
                setErrorMessage("");
                setInfoMessage("");
              }}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: "16px" }}>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
                setInfoMessage("");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "transparent",
                border: "none",
                fontSize: "13px",
                color: "var(--blush-strong, #8d4b55)",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        {infoMessage && (
          <div
            style={{
              padding: "10px 14px",
              background: "#edf7ed",
              color: "#1e4620",
              borderRadius: "8px",
              fontSize: "13.5px",
              marginBottom: "16px",
              border: "1px solid #c8e6c9",
              lineHeight: 1.45,
            }}
            role="status"
          >
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full Name</label>
              <div className="auth-input-wrap">
                <UserIcon size={16} className="auth-input-icon" />
                <input
                  id="auth-name"
                  type="text"
                  name="name"
                  placeholder="e.g. Maya Sharma"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email Address</label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="auth-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {mode === "signup" && (
            <div className="auth-field">
              <label htmlFor="auth-phone">Phone / WhatsApp (Optional)</label>
              <div className="auth-input-wrap">
                <Phone size={16} className="auth-input-icon" />
                <input
                  id="auth-phone"
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {mode !== "forgot" && (
            <div className="auth-field">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <label htmlFor="auth-password" style={{ marginBottom: 0 }}>
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrorMessage("");
                      setInfoMessage("");
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: "12px",
                      color: "var(--blush-strong, #8d4b55)",
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={
                    mode === "signup"
                      ? "At least 6 characters"
                      : "Enter your password"
                  }
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : mode === "login"
              ? "Sign In"
              : mode === "signup"
              ? "Register Account"
              : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-guest-footer">
          <button
            type="button"
            className="auth-guest-link"
            onClick={handleClose}
          >
            Continue browsing as guest →
          </button>
        </div>
      </div>
    </div>
  );
}
