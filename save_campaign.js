const payload = {
  websiteUrl: "vaultreach.ai",
  targetIndustry: "SaaS,B2B,Marketing Technology,Artificial Intelligence",
  targetTitles: "Founder,CEO,Co-Founder,Owner",
  employeeRange: "1-200",
  targetLocations: "United States,Canada",
  tone: "Conversational",
  rules: JSON.stringify({
    presets: [],
    custom: "Keep emails under 100 words. Never mention pricing unless asked. Always reference something specific about their company. End with a soft call to action — never be pushy.",
    coreOffer: "VaultReach is a fully autonomous AI sales engine. It finds your ideal customers, writes hyper-personalized cold emails, monitors your inbox for replies, and auto-responds with AI — booking meetings 24/7 without any manual work. It eliminates the need for an SDR team.",
    calendlyUrl: "https://calendly.com/adair-clark/30min"
  }),
  timezone: "America/Los_Angeles",
  sendWindowStart: "9",
  sendWindowEnd: "17",
  sendDays: "Monday,Tuesday,Wednesday,Thursday,Friday",
  draftMode: false
};

// 1. Save Campaign Data
fetch("/api/campaigns", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
.then(res => {
  if (!res.ok) throw new Error("Save failed");
  console.log("Save successful. Activating...");
  // 2. Set Status Active
  return fetch("/api/campaigns", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "active" })
  });
})
.then(res => {
  if (!res.ok) throw new Error("Activation failed");
  console.log("Campaign Activated!");
  // Reload page to reflect changes
  window.location.reload();
})
.catch(err => console.error(err));
