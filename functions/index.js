// functions/index.js
// Firebase Cloud Functions — payment verification for Rooster CBT
// Deploy: firebase deploy --only functions

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const https = require("https");

initializeApp();
const db = getFirestore();

const PREMIUM_DAYS = 400;

// 🔑 Set these in Firebase Functions config:
// firebase functions:secrets:set PAYSTACK_SECRET_KEY
// firebase functions:secrets:set FLUTTERWAVE_SECRET_KEY
const PAYSTACK_SECRET  = process.env.PAYSTACK_SECRET_KEY;
const FLUTTERWAVE_SECRET = process.env.FLUTTERWAVE_SECRET_KEY;

// ─── helpers ─────────────────────────────────────────────────────────────────

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          reject(new Error("Invalid JSON response"));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });
  });
}

async function verifyPaystack(reference) {
  if (!PAYSTACK_SECRET) throw new Error("Paystack secret not configured");

  const { status, body } = await httpsGet(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { Authorization: `Bearer ${PAYSTACK_SECRET}` }
  );

  if (status !== 200 || !body.status) {
    throw new Error(body.message || "Paystack verification failed");
  }

  const tx = body.data;

  // Must be successful and correct amount (₦1,000 = 100,000 kobo)
  if (tx.status !== "success") {
    throw new Error(`Transaction not successful: ${tx.status}`);
  }
  if (tx.amount < 100000) {
    throw new Error(`Insufficient amount: ${tx.amount} kobo`);
  }

  return { email: tx.customer.email, amount: tx.amount };
}

async function verifyFlutterwave(reference) {
  if (!FLUTTERWAVE_SECRET) throw new Error("Flutterwave secret not configured");

  const { status, body } = await httpsGet(
    `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(reference)}/verify`,
    { Authorization: `Bearer ${FLUTTERWAVE_SECRET}` }
  );

  if (status !== 200 || body.status !== "success") {
    throw new Error(body.message || "Flutterwave verification failed");
  }

  const tx = body.data;

  if (tx.status !== "successful") {
    throw new Error(`Transaction not successful: ${tx.status}`);
  }
  if (tx.amount < 1000 || tx.currency !== "NGN") {
    throw new Error(`Invalid amount or currency: ${tx.amount} ${tx.currency}`);
  }

  return { email: tx.customer.email, amount: tx.amount };
}

// ─── main function ────────────────────────────────────────────────────────────

exports.verifyPayment = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 30,
    secrets: ["PAYSTACK_SECRET_KEY", "FLUTTERWAVE_SECRET_KEY"],
  },
  async (request) => {
    const { email, reference, provider } = request.data;

    // ── input validation ──
    if (!email || !reference || !provider) {
      throw new HttpsError("invalid-argument", "email, reference and provider are required");
    }
    if (!["paystack", "flutterwave"].includes(provider)) {
      throw new HttpsError("invalid-argument", "Invalid provider");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpsError("invalid-argument", "Invalid email");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── prevent replay attacks: check if reference already used ──
    const refDoc = await db.collection("used_refs").doc(reference).get();
    if (refDoc.exists) {
      throw new HttpsError("already-exists", "Transaction reference already used");
    }

    // ── verify with payment provider ──
    try {
      await (provider === "paystack"
        ? verifyPaystack(reference)
        : verifyFlutterwave(reference));
    } catch (err) {
      console.error(`[verifyPayment] ${provider} verification error:`, err.message);
      throw new HttpsError("failed-precondition", err.message);
    }

    // ── write premium record to Firestore ──
    const now = Date.now();
    const expiryMs = now + PREMIUM_DAYS * 24 * 60 * 60 * 1000;

    const batch = db.batch();

    // Premium user record — keyed by email
    batch.set(
      db.collection("premium_users").doc(normalizedEmail),
      {
        email: normalizedEmail,
        premiumExpiry: Timestamp.fromMillis(expiryMs),
        activatedAt: Timestamp.fromMillis(now),
        provider,
        transactionRef: reference,
        durationDays: PREMIUM_DAYS,
      },
      { merge: true } // allows re-purchase to extend
    );

    // Mark reference as used (replay protection)
    batch.set(db.collection("used_refs").doc(reference), {
      email: normalizedEmail,
      provider,
      usedAt: Timestamp.fromMillis(now),
    });

    await batch.commit();

    console.log(`[verifyPayment] Premium activated: ${normalizedEmail} via ${provider}`);

    return {
      success: true,
      email: normalizedEmail,
      expiryMs,
      daysGranted: PREMIUM_DAYS,
    };
  }
);
