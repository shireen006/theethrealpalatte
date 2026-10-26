import React, { useState } from "react";
import { X, Lock, Mail, User as UserIcon, Phone, Eye, EyeOff } from "lucide-react";

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = "login",
  noticeMessage = "",
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage("");
  };

  const handleClose = () => {
    sessionStorage.setItem("trp_login_dismissed", "true");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload =
        mode === "login"
          ? { email: formData.email, password: formData.password }
          : {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              phone: formData.phone,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Authentication failed");
      }

      // Store token and user
      localStorage.setItem("trp_token", data.token);
      localStorage.setItem("trp_user", JSON.stringify(data.user));
      sessionStorage.setItem("trp_login_dismissed", "true");

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
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
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="auth-subtitle">
            {noticeMessage ? (
              <strong className="auth-notice-highlight">{noticeMessage}</strong>
            ) : mode === "login" ? (
              "Sign in to access your cart, track enquiries & checkout seamlessly."
            ) : (
              "Join our boutique family for lovely handmade creations."
            )}
          </p>
        </div>

        {/* MODE TABS */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setErrorMessage("");
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
            }}
          >
            Create Account
          </button>
        </div>

        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            {errorMessage}
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

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={mode === "signup" ? "At least 6 characters" : "Enter your password"}
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

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Processing..." : mode === "login" ? "Sign In" : "Register Account"}
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
