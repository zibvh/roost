

const AMOUNT_KOBO = 100000; 

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
 * @param {string} email
 * @param {function} onSuccess - called with { reference, provider: "paystack" }
 * @param {function} onClose
 */
export async function openPaystack(email, onSuccess, onClose) {
  await loadPaystack();

  const handler = window.PaystackPop.setup({
    // 🔑 Replace with your Paystack public key
    key: "pk_live_YOUR_PAYSTACK_PUBLIC_KEY",
    email,
    amount: AMOUNT_KOBO,
    currency: "NGN",
    ref: `rooster_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    metadata: {
      custom_fields: [
        { display_name: "App", variable_name: "app", value: "Rooster CBT" },
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
