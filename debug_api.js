fetch("/api/campaigns", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    websiteUrl: "https://www.vaultreach.ai",
    targetIndustry: "Software",
    targetTitles: "CEO",
    employeeRange: "1-50",
    targetLocations: "US",
    tone: "professional",
    rules: "{}",
    timezone: "America/New_York",
    sendWindowStart: 9,
    sendWindowEnd: 17,
    sendDays: "1,2,3,4,5"
  })
}).then(res => res.json()).then(console.log).catch(console.error)
