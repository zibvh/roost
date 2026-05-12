// functions/index.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp }      = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const https = require("https");

initializeApp();
const db = getFirestore();

const PREMIUM_DAYS   = 400;
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// ─── helpers ──────────────────────────────────────────────────────────────────

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { reject(new Error("Invalid JSON")); }
      });
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

async function verifyPaystack(reference) {
  if (!PAYSTACK_SECRET) throw new Error("Paystack secret not configured");
  const { status, body } = await httpsGet(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { Authorization: `Bearer ${PAYSTACK_SECRET}` }
  );
  if (status !== 200 || !body.status) throw new Error(body.message || "Paystack error");
  const tx = body.data;
  if (tx.status !== "success")  throw new Error(`Transaction not successful: ${tx.status}`);
  if (tx.amount < 100000)       throw new Error(`Insufficient amount: ${tx.amount} kobo`);
  return { email: tx.customer.email };
}

async function writePremium(email, reference, provider, batch) {
  const now      = Date.now();
  const expiryMs = now + PREMIUM_DAYS * 24 * 60 * 60 * 1000;

  batch.set(
    db.collection("premium_users").doc(email),
    {
      email,
      premiumExpiry: Timestamp.fromMillis(expiryMs),
      activatedAt:   Timestamp.fromMillis(now),
      provider,
      transactionRef: reference,
      durationDays:   PREMIUM_DAYS,
    },
    { merge: true }
  );
  return expiryMs;
}

// ─── verifyPayment ────────────────────────────────────────────────────────────

exports.verifyPayment = onCall(
  { region: "us-central1", timeoutSeconds: 30, secrets: ["PAYSTACK_SECRET_KEY"] },
  async (request) => {
    const { email, reference, provider } = request.data;

    if (!email || !reference || !provider)
      throw new HttpsError("invalid-argument", "email, reference and provider required");
    if (provider !== "paystack")
      throw new HttpsError("invalid-argument", "Invalid provider");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new HttpsError("invalid-argument", "Invalid email");

    const normalizedEmail = email.toLowerCase().trim();

    // Replay protection
    const refDoc = await db.collection("used_refs").doc(reference).get();
    if (refDoc.exists) throw new HttpsError("already-exists", "Reference already used");

    // Verify with Paystack
    try { await verifyPaystack(reference); }
    catch (err) { throw new HttpsError("failed-precondition", err.message); }

    // Write to Firestore
    const batch    = db.batch();
    const expiryMs = await writePremium(normalizedEmail, reference, "paystack", batch);
    batch.set(db.collection("used_refs").doc(reference), {
      email: normalizedEmail, provider: "paystack",
      usedAt: Timestamp.fromMillis(Date.now()),
    });
    await batch.commit();

    console.log(`[verifyPayment] Premium: ${normalizedEmail}`);
    return { success: true, email: normalizedEmail, expiryMs, daysGranted: PREMIUM_DAYS };
  }
);


