// PremiumModal.jsx
import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebaseConfig";
import { openPaystack, openFlutterwave } from "./paymentService";

const verifyPayment = httpsCallable(functions, "verifyPayment");

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 8, 3, 0.82)",
    backdropFilter: "blur(6px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  modal: {
    background: "linear-gradient(160deg, #2a1a0e 0%, #1c1108 100%)",
    border: "1px solid #6b3f1a",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "400px",
    padding: "28px 24px",
    position: "relative",
    boxShadow: "0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(205,133,63,0.15)",
  },
  closeBtn: {
    position: "absolute",
    top: "14px",
    right: "16px",
    background: "none",
    border: "none",
    color: "#8a6040",
    fontSize: "20px",
    cursor: "pointer",
    lineHeight: 1,
    padding: "4px",
  },
  badge: {
    display: "inline-block",
    background: "linear-gradient(90deg, #cd853f, #a0522d)",
    color: "#fff8f0",
    fontSize: "10px",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "2px",
    textTransform: "uppercase",
    padding: "3px 10px",
    borderRadius: "20px",
    marginBottom: "12px",
  },
  title: {
    color: "#f5deb3",
    fontSize: "22px",
    fontWeight: "700",
    margin: "0 0 4px",
    letterSpacing: "-0.3px",
  },
  subtitle: {
    color: "#8a6040",
    fontSize: "13px",
    margin: "0 0 20px",
    lineHeight: "1.5",
  },
  price: {
    color: "#cd853f",
    fontSize: "32px",
    fontWeight: "700",
    fontFamily: "'Courier New', monospace",
    margin: "0 0 2px",
  },
  priceSub: {
    color: "#6b4c2a",
    fontSize: "12px",
    margin: "0 0 20px",
  },
  features: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 24px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#c8a882",
    fontSize: "13px",
  },
  featureDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#cd853f",
    flexShrink: 0,
  },
  divider: {
    border: "none",
    borderTop: "1px solid #3a2010",
    margin: "0 0 20px",
  },
  label: {
    color: "#8a6040",
    fontSize: "11px",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    fontFamily: "'Courier New', monospace",
    marginBottom: "8px",
    display: "block",
  },
  emailInput: {
    width: "100%",
    background: "#120a04",
    border: "1px solid #3a2010",
    borderRadius: "8px",
    padding: "11px 14px",
    color: "#f5deb3",
    fontSize: "14px",
    outline: "none",
    marginBottom: "16px",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
  },
  btnPaystack: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #00c3ff11, #00c3ff22)",
    borderTop: "1px solid #00c3ff44",
    color: "#a8e6ff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.2s",
  },
  btnFlutterwave: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ff6b0011, #ff6b0022)",
    borderTop: "1px solid #ff6b0044",
    color: "#ffb347",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.2s",
  },
  btnProviderLabel: {
    fontSize: "10px",
    opacity: 0.6,
    fontFamily: "'Courier New', monospace",
    letterSpacing: "1px",
  },
  errorText: {
    color: "#e05a3a",
    fontSize: "12px",
    marginTop: "10px",
    textAlign: "center",
  },
  successBox: {
    textAlign: "center",
    padding: "16px 0 4px",
  },
  successIcon: {
    fontSize: "40px",
    marginBottom: "10px",
  },
  successTitle: {
    color: "#f5deb3",
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "6px",
  },
  successSub: {
    color: "#8a6040",
    fontSize: "13px",
    lineHeight: "1.6",
  },
  loadingText: {
    color: "#8a6040",
    fontSize: "13px",
    textAlign: "center",
    padding: "10px 0",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "1px",
  },
};

// ─── component ───────────────────────────────────────────────────────────────

export default function PremiumModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | verifying | success | error
  const [error, setError] = useState("");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handlePaymentSuccess({ reference, provider }) {
    setStatus("verifying");
    setError("");
    try {
      const result = await verifyPayment({ email: email.trim().toLowerCase(), reference, provider });
      if (result.data?.success) {
        setStatus("success");
        onSuccess?.(email.trim().toLowerCase());
      } else {
        throw new Error(result.data?.message || "Verification failed");
      }
    } catch (err) {
      console.error("[PremiumModal] verify error:", err);
      setError(err.message || "Could not verify payment. Contact support.");
      setStatus("error");
    }
  }

  function handleClose() {
    if (status === "verifying") return;
    onClose?.();
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div style={styles.modal}>
        {/* Close */}
        <button style={styles.closeBtn} onClick={handleClose}>✕</button>

        {status === "success" ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>🐓</div>
            <div style={styles.successTitle}>Premium Unlocked!</div>
            <p style={styles.successSub}>
              Full access activated for <strong style={{ color: "#cd853f" }}>{email}</strong>.<br />
              Valid for 400 days. Go ace that UTME!
            </p>
          </div>
        ) : (
          <>
            <div style={styles.badge}>Premium</div>
            <h2 style={styles.title}>Unlock Full Rooster</h2>
            <p style={styles.subtitle}>One payment. 400 days of full access.</p>

            <div style={styles.price}>₦1,000</div>
            <p style={styles.priceSub}>one-time · 400 days · all features</p>

            <ul style={styles.features}>
              {[
                "All 14 UTME subjects — full question bank",
                "Performance analytics & weak area insights",
                "Ad-free exam experience",
                "Offline — no internet needed after unlock",
              ].map((f) => (
                <li key={f} style={styles.featureItem}>
                  <span style={styles.featureDot} />
                  {f}
                </li>
              ))}
            </ul>

            <hr style={styles.divider} />

            <label style={styles.label}>Your Email</label>
            <input
              style={{
                ...styles.emailInput,
                borderColor: email && !isValidEmail ? "#e05a3a" : "#3a2010",
              }}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "verifying"}
              onFocus={(e) => (e.target.style.borderColor = "#cd853f")}
              onBlur={(e) => (e.target.style.borderColor = "#3a2010")}
            />

            {status === "verifying" ? (
              <p style={styles.loadingText}>verifying payment...</p>
            ) : (
              <div style={styles.btnRow}>
                <button
                  style={{
                    ...styles.btnPaystack,
                    opacity: isValidEmail ? 1 : 0.4,
                    cursor: isValidEmail ? "pointer" : "not-allowed",
                  }}
                  disabled={!isValidEmail}
                  onClick={() =>
                    openPaystack(email.trim(), handlePaymentSuccess, () => {})
                  }
                >
                  Pay with Paystack
                  <span style={styles.btnProviderLabel}>CARD · USSD · BANK</span>
                </button>

                <button
                  style={{
                    ...styles.btnFlutterwave,
                    opacity: isValidEmail ? 1 : 0.4,
                    cursor: isValidEmail ? "pointer" : "not-allowed",
                  }}
                  disabled={!isValidEmail}
                  onClick={() =>
                    openFlutterwave(email.trim(), handlePaymentSuccess, () => {})
                  }
                >
                  Pay with Flutterwave
                  <span style={styles.btnProviderLabel}>CARD · TRANSFER</span>
                </button>
              </div>
            )}

            {(status === "error") && (
              <p style={styles.errorText}>⚠ {error}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
