// usePremium.js
import { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const PKEY = "rooster_premium";
const PREMIUM_DAYS = 400;

// ─── Capacitor Preferences dual-layer (mirrors App.jsx pattern) ───────────────
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

// ─── cache helpers ────────────────────────────────────────────────────────────

async function getCached() {
  try {
    const raw = await prefGet(PKEY);
    if (!raw) return null;
    return JSON.parse(raw); // { email, expiry (ms) }
  } catch {
    return null;
  }
}

async function setCached(email, expiryMs) {
  await prefSet(PKEY, JSON.stringify({ email, expiry: expiryMs }));
}

async function clearCached() {
  await prefRemove(PKEY);
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumEmail, setPremiumEmail] = useState(null);
  const [daysLeft, setDaysLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkPremium = useCallback(async (emailOverride = null) => {
    setLoading(true);

    const cached = await getCached();
    const email = emailOverride || cached?.email;

    if (!email) {
      setIsPremium(false);
      setLoading(false);
      return false;
    }

    const now = Date.now();

    // 1. Fast path: valid cache
    if (cached && cached.email === email && cached.expiry > now) {
      const remaining = Math.ceil((cached.expiry - now) / 86400000);
      setIsPremium(true);
      setPremiumEmail(email);
      setDaysLeft(remaining);
      setLoading(false);
      return true;
    }

    // 2. Cache miss/expired → check Firestore
    try {
      const ref = doc(db, "premium_users", email.toLowerCase().trim());
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        const expiryMs = data.premiumExpiry?.toMillis?.() ?? data.premiumExpiry;

        if (expiryMs > now) {
          const remaining = Math.ceil((expiryMs - now) / 86400000);
          await setCached(email, expiryMs);
          setIsPremium(true);
          setPremiumEmail(email);
          setDaysLeft(remaining);
          setLoading(false);
          return true;
        }
      }

      // Expired or not found
      await clearCached();
      setIsPremium(false);
      setPremiumEmail(null);
      setDaysLeft(null);
    } catch (err) {
      console.error("[usePremium] Firestore error:", err);
      // Fallback to cache if Firestore is unreachable
      if (cached && cached.expiry > now) {
        const remaining = Math.ceil((cached.expiry - now) / 86400000);
        setIsPremium(true);
        setPremiumEmail(cached.email);
        setDaysLeft(remaining);
        setLoading(false);
        return true;
      }
      setIsPremium(false);
    }

    setLoading(false);
    return false;
  }, []);

  useEffect(() => {
    checkPremium();
  }, [checkPremium]);

  // Call this immediately after successful payment verification
  const activatePremium = useCallback(async (email) => {
    const expiryMs = Date.now() + PREMIUM_DAYS * 24 * 60 * 60 * 1000;
    await setCached(email, expiryMs);
    setIsPremium(true);
    setPremiumEmail(email);
    setDaysLeft(PREMIUM_DAYS);
  }, []);

  const revokePremium = useCallback(async () => {
    await clearCached();
    setIsPremium(false);
    setPremiumEmail(null);
    setDaysLeft(null);
  }, []);

  return { isPremium, premiumEmail, daysLeft, loading, checkPremium, activatePremium, revokePremium };
}
