// usePremium.js
import { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const PKEY        = "rooster_premium";
const PREMIUM_DAYS = 400;

// ─── Capacitor Preferences dual-layer (mirrors App.jsx) ───────────────────────
const CAP_AVAIL =
  typeof window !== "undefined" &&
  window.Capacitor &&
  window.Capacitor.isPluginAvailable &&
  window.Capacitor.isPluginAvailable("Preferences");

async function prefGet(key) {
  try {
    if (CAP_AVAIL) {
      const { Preferences } = await import("@capacitor/preferences");
      const { value } = await Preferences.get({ key });
      return value;
    }
  } catch {}
  return localStorage.getItem(key);
}

async function prefSet(key, value) {
  try {
    if (CAP_AVAIL) {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.set({ key, value });
    }
  } catch {}
  localStorage.setItem(key, value);
}

async function prefRemove(key) {
  try {
    if (CAP_AVAIL) {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.remove({ key });
    }
  } catch {}
  localStorage.removeItem(key);
}

// ─── cache helpers ─────────────────────────────────────────────────────────────
// cache shape: { type: "email"|"code", key: string, expiry: ms }

async function getCached() {
  try {
    const raw = await prefGet(PKEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

async function setCached(type, key, expiryMs) {
  await prefSet(PKEY, JSON.stringify({ type, key, expiry: expiryMs }));
}

async function clearCached() {
  await prefRemove(PKEY);
}

// ─── hook ──────────────────────────────────────────────────────────────────────

export function usePremium() {
  const [isPremium,    setIsPremium]    = useState(false);
  const [premiumEmail, setPremiumEmail] = useState(null);
  const [daysLeft,     setDaysLeft]     = useState(null);
  const [loading,      setLoading]      = useState(true);

  const checkPremium = useCallback(async () => {
    setLoading(true);
    const cached = await getCached();
    const now    = Date.now();

    // Fast path: valid local cache
    if (cached && cached.expiry > now) {
      const remaining = Math.ceil((cached.expiry - now) / 86400000);
      setIsPremium(true);
      setPremiumEmail(cached.type === "email" ? cached.key : null);
      setDaysLeft(remaining);
      setLoading(false);
      return true;
    }

    // No cache or expired → check Firestore
    if (cached?.key) {
      try {
        const docId = cached.type === "code"
          ? `code_${cached.key.toUpperCase()}`
          : cached.key.toLowerCase().trim();

        const snap = await getDoc(doc(db, "premium_users", docId));
        if (snap.exists()) {
          const data    = snap.data();
          const expiryMs = data.premiumExpiry?.toMillis?.() ?? data.premiumExpiry;
          if (expiryMs > now) {
            const remaining = Math.ceil((expiryMs - now) / 86400000);
            await setCached(cached.type, cached.key, expiryMs);
            setIsPremium(true);
            setPremiumEmail(cached.type === "email" ? cached.key : null);
            setDaysLeft(remaining);
            setLoading(false);
            return true;
          }
        }
      } catch (err) {
        console.error("[usePremium] Firestore error:", err);
        // If offline, trust cache even if expired recently (grace period 7 days)
        if (cached && cached.expiry > now - 7 * 86400000) {
          setIsPremium(true);
          setPremiumEmail(cached.type === "email" ? cached.key : null);
          setDaysLeft(0);
          setLoading(false);
          return true;
        }
      }
    }

    await clearCached();
    setIsPremium(false);
    setPremiumEmail(null);
    setDaysLeft(null);
    setLoading(false);
    return false;
  }, []);

  useEffect(() => { checkPremium(); }, [checkPremium]);

  // After successful Paystack payment
  const activatePremium = useCallback(async (email) => {
    const expiryMs = Date.now() + PREMIUM_DAYS * 24 * 60 * 60 * 1000;
    await setCached("email", email, expiryMs);
    setIsPremium(true);
    setPremiumEmail(email);
    setDaysLeft(PREMIUM_DAYS);
  }, []);

  // After successful access code redemption
  const activateWithCode = useCallback(async (code) => {
    const expiryMs = Date.now() + PREMIUM_DAYS * 24 * 60 * 60 * 1000;
    await setCached("code", code.toUpperCase(), expiryMs);
    setIsPremium(true);
    setPremiumEmail(null);
    setDaysLeft(PREMIUM_DAYS);
  }, []);

  const revokePremium = useCallback(async () => {
    await clearCached();
    setIsPremium(false);
    setPremiumEmail(null);
    setDaysLeft(null);
  }, []);

  return { isPremium, premiumEmail, daysLeft, loading, checkPremium, activatePremium, activateWithCode, revokePremium };
}
