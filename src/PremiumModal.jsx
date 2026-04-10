// PremiumModal.jsx
import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebaseConfig";
import { openPaystack } from "./paymentService";

const verifyPayment   = httpsCallable(functions, "verifyPayment");
const redeemAccessCode = httpsCallable(functions, "redeemAccessCode");

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(15,8,3,.82)",
    backdropFilter: "blur(6px)",
    zIndex: 9999,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "16px",
    fontFamily: "'Georgia','Times New Roman',serif",
  },
  modal: {
    background: "linear-gradient(160deg,#2a1a0e 0%,#1c1108 100%)",
    border: "1px solid #6b3f1a",
    borderRadius: "16px",
    width: "100%", maxWidth: "400px",
    padding: "28px 24px",
    position: "relative",
    boxShadow: "0 24px 64px rgba(0,0,0,.7),inset 0 1px 0 rgba(205,133,63,.15)",
  },
  closeBtn: {
    position:"absolute", top:"14px", right:"16px",
    background:"none", border:"none", color:"#8a6040",
    fontSize:"20px", cursor:"pointer", lineHeight:1, padding:"4px",
  },
  badge: {
    display:"inline-block",
    background:"linear-gradient(90deg,#cd853f,#a0522d)",
    color:"#fff8f0", fontSize:"10px",
    fontFamily:"'Courier New',monospace",
    letterSpacing:"2px", textTransform:"uppercase",
    padding:"3px 10px", borderRadius:"20px", marginBottom:"12px",
  },
  title:   { color:"#f5deb3", fontSize:"22px", fontWeight:"700", margin:"0 0 4px", letterSpacing:"-0.3px" },
  subtitle:{ color:"#8a6040", fontSize:"13px", margin:"0 0 20px", lineHeight:"1.5" },
  price:   { color:"#cd853f", fontSize:"32px", fontWeight:"700", fontFamily:"'Courier New',monospace", margin:"0 0 2px" },
  priceSub:{ color:"#6b4c2a", fontSize:"12px", margin:"0 0 20px" },
  features:{ listStyle:"none", padding:0, margin:"0 0 24px", display:"flex", flexDirection:"column", gap:"8px" },
  featureItem:{ display:"flex", alignItems:"center", gap:"10px", color:"#c8a882", fontSize:"13px" },
  featureDot:{ width:"6px", height:"6px", borderRadius:"50%", background:"#cd853f", flexShrink:0 },
  divider: { border:"none", borderTop:"1px solid #3a2010", margin:"0 0 20px" },
  label:   { color:"#8a6040", fontSize:"11px", letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:"'Courier New',monospace", marginBottom:"8px", display:"block" },
  input: {
    width:"100%", background:"#120a04",
    border:"1px solid #3a2010", borderRadius:"8px",
    padding:"11px 14px", color:"#f5deb3", fontSize:"14px",
    outline:"none", marginBottom:"16px",
    boxSizing:"border-box", fontFamily:"inherit", transition:"border-color .2s",
  },
  tabs: { display:"flex", gap:"8px", marginBottom:"20px" },
  tab: {
    flex:1, padding:"10px", borderRadius:"8px", border:"1px solid #3a2010",
    background:"transparent", color:"#8a6040", fontSize:"13px",
    fontWeight:"600", cursor:"pointer", transition:"all .2s",
  },
  tabActive: {
    background:"rgba(205,133,63,.12)", borderColor:"#cd853f", color:"#f5deb3",
  },
  btnPaystack: {
    width:"100%", padding:"13px", borderRadius:"8px", border:"none",
    background:"linear-gradient(135deg,#cd853f,#a0522d)",
    color:"#fff8f0", fontSize:"14px", fontWeight:"700",
    cursor:"pointer", display:"flex", alignItems:"center",
    justifyContent:"center", gap:"8px", transition:"opacity .2s",
  },
  btnAccess: {
    width:"100%", padding:"13px", borderRadius:"8px",
    border:"1px solid #cd853f", background:"transparent",
    color:"#cd853f", fontSize:"14px", fontWeight:"700",
    cursor:"pointer", transition:"all .2s",
  },
  errorText:  { color:"#e05a3a", fontSize:"12px", marginTop:"10px", textAlign:"center" },
  loadingText:{ color:"#8a6040", fontSize:"13px", textAlign:"center", padding:"10px 0", fontFamily:"'Courier New',monospace", letterSpacing:"1px" },
  successBox: { textAlign:"center", padding:"16px 0 4px" },
  successIcon:{ fontSize:"40px", marginBottom:"10px" },
  successTitle:{ color:"#f5deb3", fontSize:"18px", fontWeight:"700", marginBottom:"6px" },
  successSub:  { color:"#8a6040", fontSize:"13px", lineHeight:"1.6" },
};

export default function PremiumModal({ onClose, onSuccess }) {
  const [tab,      setTab]      = useState("pay");   // "pay" | "code"
  const [email,    setEmail]    = useState("");
  const [code,     setCode]     = useState("");
  const [status,   setStatus]   = useState("idle");  // idle | verifying | success | error
  const [error,    setError]    = useState("");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidCode  = code.trim().length >= 4;

  // ── Payment flow ──────────────────────────────────────────────────────────
  async function handlePaymentSuccess({ reference, provider }) {
    setStatus("verifying"); setError("");
    try {
      const res = await verifyPayment({ email: email.trim().toLowerCase(), reference, provider });
      if (res.data?.success) { setStatus("success"); onSuccess?.(email.trim().toLowerCase()); }
      else throw new Error(res.data?.message || "Verification failed");
    } catch (err) {
      setError(err.message || "Could not verify payment. Try again.");
      setStatus("error");
    }
  }

  // ── Access code flow ──────────────────────────────────────────────────────
  async function handleAccessCode() {
    setStatus("verifying"); setError("");
    try {
      const res = await redeemAccessCode({ code: code.trim().toUpperCase() });
      if (res.data?.success) { setStatus("success"); onSuccess?.(normalizedCode); }
      else throw new Error(res.data?.message || "Invalid access code");
    } catch (err) {
      setError(err.message || "Invalid or already used access code.");
      setStatus("error");
    }
  }

  function handleClose() {
    if (status === "verifying") return;
    onClose?.();
  }

  return (
    <div style={styles.overlay} onClick={e => e.target===e.currentTarget && handleClose()}>
      <div style={styles.modal}>
        <button style={styles.closeBtn} onClick={handleClose}>✕</button>

        {status === "success" ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>🐓</div>
            <div style={styles.successTitle}>Premium Unlocked!</div>
            <p style={styles.successSub}>
              Full access activated.<br/>
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
                "Works offline after unlock",
              ].map(f => (
                <li key={f} style={styles.featureItem}>
                  <span style={styles.featureDot}/>{f}
                </li>
              ))}
            </ul>

            <hr style={styles.divider}/>

            {/* Tabs */}
            <div style={styles.tabs}>
              <button
                style={{...styles.tab, ...(tab==="pay" ? styles.tabActive : {})}}
                onClick={()=>{ setTab("pay"); setError(""); }}>
                Pay ₦1,000
              </button>
              <button
                style={{...styles.tab, ...(tab==="code" ? styles.tabActive : {})}}
                onClick={()=>{ setTab("code"); setError(""); }}>
                Access Code
              </button>
            </div>

            {status === "verifying" ? (
              <p style={styles.loadingText}>
                {tab==="pay" ? "verifying payment..." : "checking code..."}
              </p>
            ) : tab === "pay" ? (
              <>
                <label style={styles.label}>Your Email</label>
                <input
                  style={{...styles.input, borderColor: email&&!isValidEmail?"#e05a3a":"#3a2010"}}
                  type="email" placeholder="you@example.com"
                  value={email} onChange={e=>setEmail(e.target.value)}
                  onFocus={e=>e.target.style.borderColor="#cd853f"}
                  onBlur={e=>e.target.style.borderColor="#3a2010"}
                />
                <button
                  style={{...styles.btnPaystack, opacity: isValidEmail ? 1 : 0.4}}
                  disabled={!isValidEmail}
                  onClick={()=>openPaystack(email.trim(), handlePaymentSuccess, ()=>{})}>
                  Pay with Paystack
                </button>
              </>
            ) : (
              <>
                <label style={styles.label}>Enter Access Code</label>
                <input
                  style={styles.input}
                  type="text" placeholder="e.g. ROOST-XXXX"
                  value={code}
                  onChange={e=>setCode(e.target.value.toUpperCase())}
                  onFocus={e=>e.target.style.borderColor="#cd853f"}
                  onBlur={e=>e.target.style.borderColor="#3a2010"}
                />
                <button
                  style={{...styles.btnAccess, opacity: isValidCode ? 1 : 0.4}}
                  disabled={!isValidCode}
                  onClick={handleAccessCode}>
                  Unlock with Code
                </button>
              </>
            )}

            {(status==="error") && <p style={styles.errorText}>⚠ {error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
