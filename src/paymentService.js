// paymentService.js
// Handles Paystack and Flutterwave inline popup initialization

const AMOUNT_KOBO = 100000; // ₦1,000 in kobo (Paystack uses kobo)
const AMOUNT_NGN = 1000;    // ₦1,000 (Flutterwave uses naira)

// ─── Paystack ─────────────────────────────────────────────────────────────

/**
 * Load Paystack inline script dynamically
 */
function loadPaystack() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve();
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.head.appendChild(script);
  });
}

/**
 * Open Paystack payment popup
 * @param {string} email - User email
 * @param {function} onSuccess - Called with { reference }
 * @param {function} onClose - Called when popup is closed without payment
 */
export async function openPaystack(email, onSuccess, onClose) {
  await loadPaystack();

  const handler = window.PaystackPop.setup({
    // 🔑 Replace with your Paystack public key
    key: "pk_live_YOUR_PAYSTACK_PUBLIC_KEY",
    email,
    amount: AMOUNT_KOBO,
    currency: "NGN",
    ref: `rooster_ps_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    metadata: {
      custom_fields: [
        {
          display_name: "App",
          variable_name: "app",
          value: "Rooster CBT",
        },
      ],
    },
    callback: (response) => {
      onSuccess({ reference: response.reference, provider: "paystack" });
    },
    onClose: () => {
      onClose?.();
    },
  });

  handler.openIframe();
}

// ─── Flutterwave ──────────────────────────────────────────────────────────

/**
 * Load Flutterwave inline script dynamically
 */
function loadFlutterwave() {
  return new Promise((resolve, reject) => {
    if (window.FlutterwaveCheckout) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Flutterwave"));
    document.head.appendChild(script);
  });
}

/**
 * Open Flutterwave payment popup
 * @param {string} email - User email
 * @param {function} onSuccess - Called with { reference }
 * @param {function} onClose - Called when popup is closed without payment
 */
export async function openFlutterwave(email, onSuccess, onClose) {
  await loadFlutterwave();

  window.FlutterwaveCheckout({
    // 🔑 Replace with your Flutterwave public key
    public_key: "FLWPUBK_YOUR_FLUTTERWAVE_PUBLIC_KEY",
    tx_ref: `rooster_fw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    amount: AMOUNT_NGN,
    currency: "NGN",
    payment_options: "card,banktransfer,ussd",
    customer: {
      email,
      name: email.split("@")[0],
    },
    customizations: {
      title: "Rooster Premium",
      description: "400-day full access — all subjects, analytics, ad-free",
      logo: "https://getrooster.onrender.com/images/logo.png",
    },
    callback: (response) => {
      if (response.status === "successful" || response.status === "completed") {
        onSuccess({ reference: response.transaction_id?.toString(), provider: "flutterwave" });
      } else {
        onClose?.();
      }
    },
    onclose: () => {
      onClose?.();
    },
  });
}
