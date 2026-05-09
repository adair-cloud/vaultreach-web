import hmac
import hashlib
import time
import json

webhook_secret = "whsec_f966zfiMzWxSRwYfDxeIhG985LaIfovS"

# Create a mock subscription object that matches what the webhook expects
payload_dict = {
  "id": "evt_mock_subscription",
  "object": "event",
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_founder_bypass",
      "object": "subscription",
      "customer": "cus_dummy",
      "status": "active"
    }
  }
}

payload_str = json.dumps(payload_dict, separators=(",", ":"))
timestamp = str(int(time.time()))

# Stripe signature format: t=<timestamp>,v1=<signature>
signed_payload = f"{timestamp}.{payload_str}"
signature = hmac.new(
    webhook_secret.encode("utf-8"),
    signed_payload.encode("utf-8"),
    hashlib.sha256
).hexdigest()

stripe_signature = f"t={timestamp},v1={signature}"

js_code = f"""
// Run this in your VaultReach dashboard console to bypass the paywall
fetch("/api/webhooks/stripe", {{
  method: "POST",
  headers: {{
    "Content-Type": "application/json",
    "Stripe-Signature": "{stripe_signature}"
  }},
  body: JSON.stringify({payload_str})
}}).then(res => {{
  console.log("Paywall bypass complete! Status:", res.status);
  if (res.ok) {{
     // Now activate the campaign
     return fetch("/api/campaigns", {{
       method: "PATCH",
       headers: {{ "Content-Type": "application/json" }},
       body: JSON.stringify({{ status: "active" }})
     }});
  }}
}}).then(() => {{
  console.log("Campaign activated!");
  window.location.reload();
}}).catch(console.error);
"""

print(js_code)
