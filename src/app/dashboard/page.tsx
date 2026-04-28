"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession, signOut } from "next-auth/react"
import {
  BarChart3, Target, BrainCircuit, LogOut, Save, CheckCircle,
  Mail, Calendar, TrendingUp, Zap, Clock, MessageSquareText,
  Bot, ChevronRight, Unplug, Check, Inbox, XCircle,
  Settings, KeyRound, Loader2, AlertCircle, Users
} from "lucide-react"

const VaultLogo = () => (
  <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <rect width="40" height="40" rx="10" fill="#6366F1"/>
    <path d="M12 14L18.5 28L21.5 22M21.5 22L28 14H24L20 20L16 14H12Z" fill="white"/>
    <path d="M21.5 22C21.5 22 25 15 28 14C29.5 13.5 32 17 28 22C24 27 21.5 22 21.5 22Z" fill="white" fillOpacity="0.8"/>
  </svg>
)

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (value === 0) return
    let start = 0
    const step = Math.ceil(value / 30)
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(start)
    }, 30)
    return () => clearInterval(timer)
  }, [value])
  return <>{display.toLocaleString()}</>
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

export default function Dashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("overview")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [url, setUrl] = useState("")
  // Targeting State
  const [selectedTitles, setSelectedTitles] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [employeeRange, setEmployeeRange] = useState("1-50")
  const [targetLocations, setTargetLocations] = useState("")
  
  // Brain State
  const [tone, setTone] = useState("professional")
  const [coreOffer, setCoreOffer] = useState("")
  const [calendlyUrl, setCalendlyUrl] = useState("")
  const [selectedRules, setSelectedRules] = useState<string[]>([])
  const [customRules, setCustomRules] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [hasIcp, setHasIcp] = useState(false)
  const [apolloApiKey, setApolloApiKey] = useState("")
  const [hasApolloApiKey, setHasApolloApiKey] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [hasOnboarded, setHasOnboarded] = useState(false)
  const [showApolloHelp, setShowApolloHelp] = useState(false)
  // Wizard state — must be at top level (React rules of hooks)
  const [wizardStep, setWizardStep] = useState(0)
  const [wizardApolloKey, setWizardApolloKey] = useState("")
  const [wizardSaving, setWizardSaving] = useState(false)
  const [campaignStatus, setCampaignStatus] = useState<"active" | "inactive">("inactive")
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [lastPing, setLastPing] = useState<string | null>(null)
  const [timezone, setTimezone] = useState("America/New_York")
  const [sendWindowStart, setSendWindowStart] = useState(9)
  const [sendWindowEnd, setSendWindowEnd] = useState(17)
  const [sendDays, setSendDays] = useState<string[]>(["1", "2", "3", "4", "5"])
  
  // Draft Mode State
  const [draftMode, setDraftMode] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [drafts, setDrafts] = useState<any[]>([])
  const [isActioningDraft, setIsActioningDraft] = useState<string | null>(null)

  const [analytics, setAnalytics] = useState<{
    emailsSent: number
    replies: number
    meetings: number
    recentReplies: { name: string; role: string; preview: string; score: string; time: string }[]
  }>({ emailsSent: 0, replies: 0, meetings: 0, recentReplies: [] })
  const [isRevoking, setIsRevoking] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/campaigns")
      if (res.ok) {
        const { campaign, apolloApiKey: dbApolloApiKey, hasOnboarded: dbHasOnboarded } = await res.json()
        setHasApolloApiKey(!!dbApolloApiKey)
        if (dbApolloApiKey) setApolloApiKey(dbApolloApiKey)
        setHasOnboarded(!!dbHasOnboarded)
        if (campaign) {
          setUrl(campaign.websiteUrl ?? "")
          
          // Parse Targets
          setSelectedTitles(campaign.targetTitles ? campaign.targetTitles.split(',').map((s: string) => s.trim()).filter(Boolean) : [])
          setSelectedIndustries(campaign.targetIndustry ? campaign.targetIndustry.split(',').map((s: string) => s.trim()).filter(Boolean) : [])
          setEmployeeRange(campaign.employeeRange ?? "1-50")
          setTargetLocations(campaign.targetLocations ?? "")
          
          setTone(campaign.tone ?? "professional")
          
          // Parse Rules JSON
          try {
            const parsedRules = JSON.parse(campaign.rules || "{}")
            setSelectedRules(parsedRules.presets || [])
            setCustomRules(parsedRules.custom || "")
            setCoreOffer(parsedRules.coreOffer || "")
            setCalendlyUrl(parsedRules.calendlyUrl || "")
          } catch {
            setCustomRules(campaign.rules || "") // legacy fallback
          }
          setHasIcp(Boolean(campaign.targetIndustry?.trim()))
          setLastPing(campaign.lastPing ?? null)
          setCampaignStatus(campaign.status === "active" ? "active" : "inactive")
          
          if (campaign.timezone) setTimezone(campaign.timezone)
          if (campaign.sendWindowStart !== undefined) setSendWindowStart(campaign.sendWindowStart)
          if (campaign.sendWindowEnd !== undefined) setSendWindowEnd(campaign.sendWindowEnd)
          if (campaign.sendDays) setSendDays(campaign.sendDays.split(','))
          if (campaign.draftMode !== undefined) setDraftMode(campaign.draftMode)
        }
      }
      const analyticsRes = await fetch("/api/analytics")
      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        setAnalytics(data)
      }
      
      const draftsRes = await fetch("/api/drafts")
      if (draftsRes.ok) {
        const data = await draftsRes.json()
        setDrafts(data.drafts || [])
      }
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Always save all fields regardless of active tab
        body: JSON.stringify({
          websiteUrl: url,
          targetIndustry: selectedIndustries.join(","),
          targetTitles: selectedTitles.join(","),
          employeeRange,
          targetLocations,
          tone,
          rules: JSON.stringify({ presets: selectedRules, custom: customRules, coreOffer, calendlyUrl }),
          timezone,
          sendWindowStart,
          sendWindowEnd,
          sendDays: sendDays.join(","),
          draftMode
        }),
      })
      if (!res.ok) throw new Error("Save failed")
      if (activeTab === "targeting" && selectedIndustries.length > 0) setHasIcp(true)
      setSaveSuccess(true)
      setSaveError(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setSaveError(true)
      setTimeout(() => setSaveError(false), 4000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apolloApiKey }),
      })
      if (!res.ok) throw new Error("Save failed")
      setHasApolloApiKey(!!apolloApiKey.trim())
    } catch {
      console.error("Failed to save settings")
    } finally {
      setIsSavingSettings(false)
    }
  }

  const userName = session?.user?.name?.split(" ")[0] ?? "there"
  const userInitial = (session?.user?.name ?? "U").charAt(0).toUpperCase()
  const pipelineValue = analytics.meetings * 3000
  const hoursSaved = Math.max(analytics.emailsSent * 0.5, 0)

  // Derive agent status
  const agentStatus: "active" | "idle" | "offline" | "unknown" = (() => {
    if (!lastPing) return "unknown"
    const ageMs = Date.now() - new Date(lastPing).getTime()
    const ageHrs = ageMs / (1000 * 60 * 60)
    if (ageHrs < 2)   return "active"
    if (ageHrs < 24)  return "idle"
    return "offline"
  })()

  // Light theme configured status colors
  const agentStatusConfig = {
    active:  { dot: "bg-emerald-500 animate-pulse", label: "Agent Active",  sub: "Prospecting now",        bg: "#ecfdf5", border: "#a7f3d0",  text: "text-emerald-700" },
    idle:    { dot: "bg-amber-500",                label: "Agent Idle",    sub: "Last ran < 24 hrs ago",  bg: "#fffbeb", border: "#fde68a",  text: "text-amber-700"  },
    offline: { dot: "bg-red-500",                  label: "Agent Offline", sub: "No ping in > 24 hrs",    bg: "#fef2f2", border: "#fecaca",  text: "text-red-700"   },
    unknown: { dot: "bg-slate-400",                label: "Not Started",   sub: "Awaiting first run",     bg: "#f8fafc", border: "#e2e8f0", text: "text-slate-600" },
  }

  const navItems = [
    { id: "overview", icon: BarChart3, label: "Overview" },
    { id: "targeting", icon: Target, label: "Lead Targeting" },
    { id: "brain", icon: BrainCircuit, label: "AI Brain" },
    { id: "schedule", icon: Calendar, label: "Schedule" },
    { id: "drafts", icon: Inbox, label: "Draft Queue" },
    { id: "settings", icon: Settings, label: "Settings" },
  ]

  const kpis = [
    {
      label: "Emails Sent", value: analytics.emailsSent,
      icon: Mail, format: "number",
      gradient: "from-white to-slate-50",
      border: "border-slate-200 text-slate-800 shadow-sm", iconColor: "text-indigo-600 bg-indigo-50",
      badge: "Live", badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      sub: analytics.emailsSent === 0 ? "Warming up..." : `${Math.round(analytics.emailsSent * 0.44)} estimated opens`,
    },
    {
      label: "Positive Replies", value: analytics.replies,
      icon: MessageSquareText, format: "number",
      gradient: "from-white to-slate-50",
      border: "border-slate-200 text-slate-800 shadow-sm", iconColor: "text-violet-600 bg-violet-50",
      badge: "Auto-tracked", badgeColor: "text-violet-700 bg-violet-50 border-violet-200",
      sub: analytics.replies === 0 ? "First reply ~48 hrs" : `${Math.round(analytics.replies / Math.max(analytics.emailsSent, 1) * 100)}% reply rate`,
    },
    {
      label: "Meetings Booked", value: analytics.meetings,
      icon: Calendar, format: "number",
      gradient: "from-white to-slate-50",
      border: "border-slate-200 text-slate-800 shadow-sm", iconColor: "text-sky-600 bg-sky-50",
      badge: "Goal", badgeColor: "text-sky-700 bg-sky-50 border-sky-200",
      sub: analytics.meetings === 0 ? "Replies convert at ~12%" : `${analytics.meetings} this month`,
    },
    {
      label: "Est. Pipeline Value", value: pipelineValue,
      icon: TrendingUp, format: "currency",
      gradient: "from-white to-slate-50",
      border: "border-slate-200 text-slate-800 shadow-sm", iconColor: "text-emerald-600 bg-emerald-50",
      badge: "Est. @ $3K/deal", badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      sub: analytics.meetings === 0 ? "Grows with every meeting" : "Based on avg deal size",
    },
  ]

  const dismissWizard = () => setHasOnboarded(true)
  const saveKeyAndAdvance = async () => {
    if (!wizardApolloKey.trim()) { setWizardStep(2); return }
    setWizardSaving(true)
    try {
      await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apolloApiKey: wizardApolloKey.trim() }),
      })
      setApolloApiKey(wizardApolloKey.trim())
      setHasApolloApiKey(true)
      setHasOnboarded(true)
      setWizardStep(2)
    } finally {
      setWizardSaving(false)
    }
  }
  const wizardSteps = ["Welcome", "Apollo Key", "Your ICP", "You're Ready"]

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-slate-50 text-slate-900">

      {/* ─────────────────────────────────────────────────────────────
          ONBOARDING WIZARD — fires once on first login
      ───────────────────────────────────────────────────────────── */}
      {!hasOnboarded && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              {/* Progress bar */}
              <div className="h-1.5 bg-slate-100">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${((wizardStep + 1) / wizardSteps.length) * 100}%` }}
                />
              </div>
              <div className="p-8">
                {/* Step indicators */}
                <div className="flex items-center gap-1 mb-6">
                  {wizardSteps.map((s, i) => (
                    <div key={s} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${i <= wizardStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                      {i < wizardSteps.length - 1 && <div className={`h-0.5 w-6 ${i < wizardStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
                    </div>
                  ))}
                  <span className="ml-2 text-xs text-slate-400 font-medium">Step {wizardStep + 1} of {wizardSteps.length}</span>
                </div>

                {/* Step 0: Welcome */}
                {wizardStep === 0 && (
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                      <Zap size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome to VaultReach 👋</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      VaultReach is your autonomous AI sales rep. Once set up, it will find qualified leads, write personalized cold emails, and fill your pipeline — 24 hours a day, 7 days a week, without you lifting a finger.
                    </p>
                    <div className="space-y-3 mb-8">
                      {[
                        { icon: "🔍", text: "Finds 10–15 qualified B2B leads daily using your Apollo.io account" },
                        { icon: "✍️", text: "Writes personalized cold emails using AI trained on your offer" },
                        { icon: "📬", text: "Sends from your own Gmail — no shared infrastructure" },
                        { icon: "💬", text: "Detects replies and auto-responds to keep conversations alive" },
                      ].map(({ icon, text }) => (
                        <div key={text} className="flex items-start gap-3 text-sm text-slate-700">
                          <span className="text-lg leading-tight">{icon}</span>
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setWizardStep(1)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
                      >
                        Let&apos;s get started →
                      </button>
                      <button onClick={dismissWizard} className="text-slate-400 hover:text-slate-600 text-xs font-medium px-4">Skip</button>
                    </div>
                  </div>
                )}

                {/* Step 1: Apollo Key */}
                {wizardStep === 1 && (
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-200">
                      <KeyRound size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Connect Apollo.io</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">
                      VaultReach uses your free Apollo.io account to find leads. You own your data, your credits never get shared, and it&apos;s completely free to start.
                    </p>
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4 text-xs text-slate-600 space-y-1.5">
                      <p className="font-bold text-slate-800">Get your key in 60 seconds:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Go to <a href="https://app.apollo.io" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">app.apollo.io</a> → sign up free (no card needed)</li>
                        <li>Click your avatar → <strong>Settings</strong> → <strong>Integrations</strong> → <strong>API</strong></li>
                        <li>Click <strong>Create New Key</strong>, name it &quot;VaultReach&quot;, copy it below</li>
                      </ol>
                    </div>
                    <input
                      type="password"
                      value={wizardApolloKey}
                      onChange={e => setWizardApolloKey(e.target.value)}
                      placeholder="Paste your Apollo API key here..."
                      className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono mb-4"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={saveKeyAndAdvance}
                        disabled={wizardSaving}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black py-3.5 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
                      >
                        {wizardSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save & Continue →"}
                      </button>
                      <button onClick={() => setWizardStep(2)} className="text-slate-400 hover:text-slate-600 text-xs font-medium px-4">Skip for now</button>
                    </div>
                  </div>
                )}

                {/* Step 2: ICP */}
                {wizardStep === 2 && (
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
                      <Users size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Define your ideal client</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      Your ICP (Ideal Customer Profile) tells VaultReach exactly who to target. Set it in the <strong>Lead Targeting</strong> tab — you can update it at any time.
                    </p>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 mb-6">
                      <p className="font-bold mb-1">✓ You&apos;ll configure:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Job titles to target (e.g. CEO, Founder, VP of Sales)</li>
                        <li>• Target industry (e.g. SaaS, E-commerce, Real Estate)</li>
                        <li>• Company size and locations</li>
                        <li>• Your website URL (used to personalize outreach)</li>
                      </ul>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setWizardStep(3) }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl transition-all shadow-md text-sm"
                      >
                        Got it, continue →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Launch */}
                {wizardStep === 3 && (
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                      <Zap size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">You&apos;re almost live! 🚀</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      Here&apos;s your quick checklist to launch your AI SDR:
                    </p>
                    <div className="space-y-3 mb-8">
                      {[
                        { done: hasApolloApiKey, label: "Apollo.io API key connected", tab: "settings" },
                        { done: hasIcp, label: "Lead targeting configured", tab: "icp" },
                        { done: false, label: "Hit 'Launch AI Sales Assistant' on your dashboard", tab: null },
                      ].map(({ done, label, tab }) => (
                        <div key={label} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${done ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200'}`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                            {done ? <CheckCircle size={12} className="text-white" /> : <span className="w-2 h-2 rounded-full bg-slate-400" />}
                          </div>
                          <span className={`text-sm font-medium ${done ? 'text-emerald-800' : 'text-slate-600'}`}>{label}</span>
                          {!done && tab && (
                            <button onClick={() => { setActiveTab(tab); dismissWizard() }} className="ml-auto text-xs text-indigo-600 font-bold hover:underline">
                              Go →
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={dismissWizard}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl transition-all shadow-md text-sm"
                    >
                      Go to my dashboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* SIDEBAR */}
      <aside className="w-60 shrink-0 hidden md:flex flex-col justify-between border-r border-slate-200 bg-white">
        <div>
          <div className="h-16 flex items-center px-5 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <VaultLogo />
              <span className="text-slate-900 font-black text-lg tracking-tight">VaultReach</span>
            </div>
          </div>

          {/* Agent status pill */}
          {(() => {
            const s = agentStatusConfig[agentStatus]
            return (
              <div
                className="mx-4 mt-5 mb-2 px-4 py-3 rounded-2xl flex items-center gap-2.5"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                <div>
                  <div className={`font-bold text-xs ${s.text}`}>{s.label}</div>
                  <div className={`text-[10px] font-medium opacity-80 ${s.text}`}>{s.sub}</div>
                </div>
                <Bot size={14} className={`${s.text} ml-auto opacity-70`} />
              </div>
            )
          })()}

          <nav className="p-3 space-y-1 mt-2">
            {navItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all text-left ${
                  activeTab === id
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                }`}
              >
                <Icon size={16} />
                {label}
                {activeTab === id && <ChevronRight size={14} className="ml-auto" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-200">
          {/* User chip */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2 bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-slate-900 font-bold text-xs truncate">{session?.user?.name ?? "User"}</div>
              <div className="text-slate-500 text-[10px] truncate">{session?.user?.email}</div>
            </div>
          </div>
          <button
            disabled={isRevoking}
            onClick={async () => {
              if (window.confirm("Are you sure you want to disconnect your Gmail Account? This will revoke our access to send emails on your behalf and pause the agent.")) {
                setIsRevoking(true)
                try {
                  await fetch("/api/auth/revoke", { method: "POST" })
                } catch (e) {
                  console.error("Revocation request failed", e)
                } finally {
                  signOut({ callbackUrl: "/" })
                }
              }
            }}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-all mb-1 disabled:opacity-50"
          >
            <Unplug size={14} /> {isRevoking ? "Disconnecting..." : "Disconnect Gmail"}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <header className="h-16 sticky top-0 z-20 flex items-center justify-between px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div>
            <div className="text-slate-900 font-extrabold text-base">{activeTab === "brain" ? "AI Messaging Brain" : activeTab === "targeting" ? "Lead Targeting" : activeTab === "schedule" ? "Sending Schedule" : "Performance Overview"}</div>
            <div className="text-slate-500 text-xs font-semibold">VaultReach Campaign Dashboard</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1.5 shadow-sm">
              <Clock size={11} />
              <AnimatedNumber value={Math.round(hoursSaved)} /> hrs saved
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">

            {/* ─── OVERVIEW ─── */}
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">


                {/* App Password warning removed — Gmail is connected automatically via OAuth */}


                {/* ── COLD-START: Setup Checklist ── */}
                {(!hasIcp || !hasApolloApiKey) ? (
                  <div className="rounded-3xl p-8 bg-white border border-slate-200 shadow-sm">
                    <div className="mb-6">
                      <div className="text-indigo-600 font-bold text-sm mb-1">{getGreeting()}, {userName} 👋</div>
                      <h1 className="text-slate-900 font-black text-3xl mb-2 tracking-tight">Let&apos;s get your AI SDR running.</h1>
                      <p className="text-slate-500 text-sm font-medium">Complete these 3 steps and your engine will start prospecting within 24 hours.</p>
                    </div>
                    <div className="space-y-3">
                      {/* Step 1 */}
                      <div className="flex items-center gap-4 rounded-2xl px-5 py-4 bg-emerald-50 border border-emerald-100">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-emerald-900 font-bold text-sm">Connected Google Account</div>
                          <div className="text-emerald-600 text-xs font-medium">{session?.user?.email}</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">Done</span>
                      </div>
                      
                      {/* Step 2 */}
                      {hasIcp ? (
                        <div className="flex items-center gap-4 rounded-2xl px-5 py-4 bg-emerald-50 border border-emerald-100">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                            <CheckCircle size={16} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-emerald-900 font-bold text-sm">Targeting Configured</div>
                            <div className="text-emerald-600 text-xs font-medium">Ideal Customer Profile is set.</div>
                          </div>
                          <button
                            onClick={() => setActiveTab("targeting")}
                            className="shrink-0 text-indigo-600 hover:text-indigo-700 font-bold text-xs transition-colors"
                          >
                            Edit
                          </button>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">Done</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 rounded-2xl px-5 py-4 bg-white border-2 border-indigo-500 shadow-sm">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-indigo-600">
                            <Target size={16} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-slate-900 font-bold text-sm">Set your Ideal Customer Profile</div>
                            <div className="text-slate-500 text-xs font-medium">Tell the AI who to target — takes 60 seconds.</div>
                          </div>
                          <button
                            onClick={() => setActiveTab("targeting")}
                            className="shrink-0 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                          >
                            Set Up <ChevronRight size={12} />
                          </button>
                        </div>
                      )}

                      {/* Step 3 */}
                      <div className="flex items-center gap-4 rounded-2xl px-5 py-4 bg-slate-50 border border-slate-200 opacity-60">
                        <div className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0 bg-white">
                          <Zap size={14} className="text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-slate-700 font-bold text-sm">AI warming up &amp; prospecting</div>
                          <div className="text-slate-500 text-xs font-medium">Unlocks after Step 2 is complete.</div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">Locked</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                {/* Hero greeting */}
                <div className="rounded-3xl p-8 relative overflow-hidden bg-white border border-slate-200 shadow-sm">
                  <div className="absolute -right-8 -top-8 opacity-5">
                    <Zap size={180} className="text-indigo-600" />
                  </div>
                  <div className="relative">
                    <div className="text-indigo-600 font-bold text-sm mb-1">{getGreeting()}, {userName} 👋</div>
                    <h1 className="text-slate-900 font-black text-3xl mb-3 tracking-tight">Your AI sales engine is running 24/7.</h1>
                    <p className="text-slate-600 text-sm font-medium max-w-xl leading-relaxed">
                      While you focus on delivering great work, VaultReach is scraping leads, writing personalized outreach, and filling your pipeline around the clock.
                    </p>
                    {campaignStatus === "inactive" && analytics.emailsSent === 0 ? (
                      <div className="mt-6">
                        {!hasApolloApiKey && (
                          <div className="mb-3 flex items-center gap-2 text-amber-700 text-xs font-bold bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
                            <AlertCircle size={14} className="shrink-0" />
                            Apollo API key required before launching. <button onClick={() => setActiveTab("settings")} className="underline hover:text-amber-900 ml-1">Add it in Settings →</button>
                          </div>
                        )}
                        <button
                          id="toggle-campaign-btn"
                          disabled={isTogglingStatus || !hasApolloApiKey || !hasIcp}
                          onClick={async () => {
                            setIsTogglingStatus(true)
                            try {
                              // 1. Force-save all form data
                              await fetch("/api/campaigns", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  websiteUrl: url,
                                  targetIndustry: selectedIndustries.join(","),
                                  targetTitles: selectedTitles.join(","),
                                  employeeRange,
                                  targetLocations,
                                  tone,
                                  rules: JSON.stringify({ presets: selectedRules, custom: customRules, coreOffer, calendlyUrl }),
                                  timezone,
                                  sendWindowStart,
                                  sendWindowEnd,
                                  sendDays: sendDays.join(","),
                                  draftMode
                                })
                              })
                              
                              // 2. Set campaign to active
                              const res = await fetch("/api/campaigns", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: "active" }),
                              })
                              if (res.ok) {
                                setCampaignStatus("active")
                              } else {
                                const data = await res.json()
                                if (data.code === "SUBSCRIPTION_REQUIRED") {
                                  const checkoutRes = await fetch("/api/stripe/checkout", { method: "POST" })
                                  if (checkoutRes.ok) {
                                    const { url } = await checkoutRes.json()
                                    if (url) window.location.href = url
                                  } else {
                                    alert("A subscription is required to launch your campaign. Please subscribe to continue.")
                                  }
                                } else {
                                  alert(`Failed to activate: ${data.error || "Unknown error"}`)
                                }
                              }
                            } finally {
                              setIsTogglingStatus(false)
                            }
                          }}
                          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-sm px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:translate-y-0"
                        >
                          <Zap size={18} className={isTogglingStatus ? "animate-pulse" : ""} />
                          {isTogglingStatus ? "Launching Engine..." : "Launch AI Sales Assistant"}
                        </button>
                        <p className="text-slate-400 text-xs font-medium mt-3">
                          {!hasApolloApiKey ? "Add your Apollo key in Settings to unlock launch." : !hasIcp ? "Configure Lead Targeting to unlock launch." : "Clicking this will activate your digital employee and begin live prospecting."}
                        </p>
                      </div>
                    ) : (
                      <>
                        {analytics.emailsSent === 0 && campaignStatus === "active" && (
                          <div className="mt-5 inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-indigo-700 text-xs font-bold shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Warming up — your first batch of emails typically sends within 24 hours of setup.
                          </div>
                        )}
                        {/* ── Pause / Resume Toggle ── */}
                        <div className="mt-5 flex items-center gap-3">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                            campaignStatus === "active"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-slate-100 border-slate-200 text-slate-500"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              campaignStatus === "active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            }`} />
                            {campaignStatus === "active" ? "Active" : "Paused"}
                          </div>
                          <button
                            id="toggle-campaign-btn"
                            disabled={isTogglingStatus}
                            onClick={async () => {
                              const newStatus = campaignStatus === "active" ? "inactive" : "active"
                              setIsTogglingStatus(true)
                              try {
                                if (newStatus === "active") {
                                  // Force-save all form data before activating
                                  await fetch("/api/campaigns", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      websiteUrl: url,
                                      targetIndustry: selectedIndustries.join(","),
                                      targetTitles: selectedTitles.join(","),
                                      employeeRange,
                                      targetLocations,
                                      tone,
                                      rules: JSON.stringify({ presets: selectedRules, custom: customRules, coreOffer, calendlyUrl }),
                                      timezone,
                                      sendWindowStart,
                                      sendWindowEnd,
                                      sendDays: sendDays.join(","),
                                      draftMode
                                    })
                                  })
                                }

                                const res = await fetch("/api/campaigns", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: newStatus }),
                                })
                                if (res.ok) {
                                  setCampaignStatus(newStatus)
                                } else if (newStatus === "active") {
                                  const data = await res.json()
                                  if (data.code === "SUBSCRIPTION_REQUIRED") {
                                    const checkoutRes = await fetch("/api/stripe/checkout", { method: "POST" })
                                    if (checkoutRes.ok) {
                                      const { url } = await checkoutRes.json()
                                      if (url) window.location.href = url
                                    } else {
                                      alert("A subscription is required to resume your campaign.")
                                    }
                                  } else {
                                    alert(`Failed to update campaign: ${data.error || "Unknown error"}`)
                                  }
                                }
                              } finally {
                                setIsTogglingStatus(false)
                              }
                            }}
                            className={`text-xs font-bold px-4 py-1.5 rounded-xl border transition-all disabled:opacity-50 ${
                              campaignStatus === "active"
                                ? "bg-white border-slate-200 text-slate-700 hover:border-red-300 hover:text-red-600"
                                : "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                          >
                            {isTogglingStatus ? "Updating..." : campaignStatus === "active" ? "Pause Campaign" : "Resume Campaign"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {kpis.map((kpi) => (
                    <div key={kpi.label} className={`rounded-2xl p-5 border bg-gradient-to-br ${kpi.gradient} ${kpi.border} relative overflow-hidden`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-xl border border-slate-100/50 ${kpi.iconColor}`}>
                          <kpi.icon size={18} />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${kpi.badgeColor}`}>
                          {kpi.badge}
                        </span>
                      </div>
                      <div className="text-slate-900 font-black text-3xl mb-0.5 tracking-tight">
                        {kpi.format === "currency" ? (
                          kpi.value === 0 ? "$0" : `$${kpi.value.toLocaleString()}`
                        ) : (
                          <AnimatedNumber value={kpi.value} />
                        )}
                      </div>
                      <div className="text-slate-800 font-bold text-sm mb-1">{kpi.label}</div>
                      <div className="text-slate-500 text-xs font-medium">{kpi.sub}</div>
                      {kpi.value > 0 && (
                        <div className="absolute -bottom-4 -right-4 opacity-5">
                          <kpi.icon size={100} className="text-slate-900" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Time Saved Banner */}
                <div className="rounded-2xl px-6 py-5 flex items-center justify-between bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shadow-sm">
                      <Clock size={20} />
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold text-sm">Hours Saved vs. Hiring an SDR</div>
                      <div className="text-slate-500 text-xs font-medium mt-0.5">
                        {analytics.emailsSent === 0
                          ? "Calculated once outreach begins"
                          : "Based on your email volume at ~30 min/prospect manually"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-500 font-black text-2xl tracking-tight">
                      {analytics.emailsSent === 0 ? "—" : `${Math.round(hoursSaved)}`}
                    </div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                      {analytics.emailsSent === 0 ? "not yet" : "hrs / wk est."}
                    </div>
                  </div>
                </div>

                {/* Recent Replies */}
                <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-slate-900 font-bold text-sm">Recent Positive Replies</h3>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">AI-monitored</span>
                  </div>
                  {analytics.recentReplies.length === 0 ? (
                    <div className="p-12 text-center bg-white">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
                        <Mail size={28} className="text-slate-400" />
                      </div>
                      <div className="text-slate-900 font-bold text-lg mb-2">No replies yet — and that&apos;s normal.</div>
                      <div className="text-slate-500 text-sm font-medium max-w-md mx-auto leading-relaxed">
                        Most campaigns see the first interested reply within 48 hours. Your AI is warming up inboxes to maximize deliverability.
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y border-slate-100">
                      {analytics.recentReplies.map((reply, i) => (
                        <div key={i} className="px-6 py-4 hover:bg-slate-50 transition-colors flex items-center gap-4 bg-white">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0 shadow-sm">
                            {reply.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-slate-900 font-bold text-sm">{reply.name}</span>
                              <span className="text-slate-500 text-xs font-medium">{reply.role}</span>
                            </div>
                            <div className="text-slate-600 text-sm truncate">{reply.preview}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              reply.score === "Hot"
                                ? "text-rose-700 bg-rose-50 border-rose-200"
                                : "text-amber-700 bg-amber-50 border-amber-200"
                            }`}>
                              {reply.score}
                            </span>
                            <span className="text-slate-400 font-medium text-[10px]">{reply.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ─── TARGETING ─── */}
            {activeTab === "targeting" && (
              <motion.div key="targeting" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                  <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50">
                    <h3 className="text-slate-900 font-black text-xl mb-1 tracking-tight">Ideal Customer Profile</h3>
                    <p className="text-slate-500 text-sm font-medium">Update your ICP at any time — the AI instantly adjusts its Apollo prospecting queries.</p>
                  </div>
                  <form onSubmit={handleSave} className="p-8 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">Your Business Website</label>
                      <input
                        type="url" value={url} onChange={e => setUrl(e.target.value)}
                        placeholder="https://acmeplumbing.com"
                        className="w-full rounded-xl p-3.5 text-slate-900 bg-white placeholder-slate-400 font-medium outline-none transition-all border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">Target Location (Geography)</label>
                      <input
                        type="text" value={targetLocations} onChange={e => setTargetLocations(e.target.value)}
                        placeholder="e.g. Austin, TX or Nationwide"
                        className="w-full rounded-xl p-3.5 text-slate-900 bg-white placeholder-slate-400 font-medium outline-none transition-all border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">Target Roles (Select all that apply)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {["CEO", "Founder", "Co-Founder", "VP Sales", "VP Marketing", "Owner", "Managing Director", "Partner"].map(title => (
                          <div 
                            key={title}
                            onClick={() => setSelectedTitles(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title])}
                            className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                              selectedTitles.includes(title) 
                                ? "bg-indigo-50 border-indigo-500 text-indigo-700" 
                                : "bg-white border-slate-200 hover:border-indigo-200 text-slate-700"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                              selectedTitles.includes(title) ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-300"
                            }`}>
                              {selectedTitles.includes(title) && <Check size={14} className="text-white" />}
                            </div>
                            <span className="text-sm font-bold">{title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">Target Industries (Select all that apply)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {["SaaS", "Marketing Agencies", "Lead Generation", "Real Estate", "Consulting", "Accounting", "Software Development", "Recruiting"].map(ind => (
                          <div 
                            key={ind}
                            onClick={() => setSelectedIndustries(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind])}
                            className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                              selectedIndustries.includes(ind) 
                                ? "bg-indigo-50 border-indigo-500 text-indigo-700" 
                                : "bg-white border-slate-200 hover:border-indigo-200 text-slate-700"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                              selectedIndustries.includes(ind) ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-300"
                            }`}>
                              {selectedIndustries.includes(ind) && <Check size={14} className="text-white" />}
                            </div>
                            <span className="text-sm font-bold">{ind}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">Company Size (Employee Count)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {["1-10", "11-50", "51-200", "201-500", "501+"].map(range => (
                          <div 
                            key={range}
                            onClick={() => setEmployeeRange(range)}
                            className={`cursor-pointer flex items-center justify-center p-3 rounded-xl border-2 transition-all ${
                              employeeRange === range 
                                ? "bg-indigo-50 border-indigo-500 text-indigo-700" 
                                : "bg-white border-slate-200 hover:border-indigo-200 text-slate-700"
                            }`}
                          >
                            <span className="text-sm font-bold">{range}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                      <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 text-sm">
                        {isSaving ? "Saving..." : <><Save size={16} /> Update Targeting</>}
                      </button>
                      {saveSuccess && (
                        <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                          <CheckCircle size={15} /> Saved successfully!
                        </span>
                      )}
                      {saveError && (
                        <span className="flex items-center gap-1.5 text-rose-600 font-bold text-sm bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                          Save failed — please try again.
                        </span>
                      )}
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ─── AI BRAIN ─── */}
            {activeTab === "brain" && (
              <motion.div key="brain" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                  <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50">
                    <h3 className="text-slate-900 font-black text-xl mb-1 tracking-tight">Messaging Controls</h3>
                    <p className="text-slate-500 text-sm font-medium">Control exactly how your digital SDR speaks to prospects and handles replies.</p>
                  </div>
                  <form onSubmit={handleSave} className="p-8 space-y-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-4">Brand Tone of Voice</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { id: "professional", label: "Highly Professional", desc: "Direct, polished, corporate." },
                          { id: "casual", label: "Casual & Friendly", desc: "Warm, relaxed, uses first names." },
                          { id: "urgent", label: "Urgent & Direct", desc: "Short sentences, strong CTA." },
                        ].map(t => (
                          <div
                            key={t.id} onClick={() => setTone(t.id)}
                            className={`cursor-pointer rounded-xl p-5 transition-all border-2 ${
                              tone === t.id 
                                ? "bg-indigo-50 border-indigo-500 shadow-md transform -translate-y-0.5" 
                                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                            }`}
                          >
                            <div className={`font-bold text-sm mb-1.5 ${tone === t.id ? "text-indigo-700" : "text-slate-800"}`}>{t.label}</div>
                            <div className={`text-xs font-medium leading-relaxed ${tone === t.id ? "text-indigo-600/80" : "text-slate-500"}`}>{t.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">The Core Offer (What are we pitching?)</label>
                      <input
                        type="text" value={coreOffer} onChange={e => setCoreOffer(e.target.value)}
                        placeholder="e.g. Free Roof Inspection, Complimentary SEO Audit, 10% Off First Month"
                        className="w-full rounded-xl p-3.5 text-slate-900 bg-white placeholder-slate-400 font-medium outline-none transition-all border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">Calendly Booking Link <span className="text-indigo-500 font-medium">(optional)</span></label>
                      <input
                        type="url" value={calendlyUrl} onChange={e => setCalendlyUrl(e.target.value)}
                        placeholder="https://calendly.com/yourname/15min"
                        className="w-full rounded-xl p-3.5 text-slate-900 bg-white placeholder-slate-400 font-medium outline-none transition-all border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                      />
                      <p className="text-xs text-slate-500 mt-1.5 font-medium">When a lead replies positively, the AI will include this link to book a meeting automatically.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1">
                        Auto-Reply Guardrails
                      </label>
                      <p className="text-xs text-slate-500 mb-3 font-medium">
                        Select the primary behaviors the AI should follow when negotiating with leads.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {[
                          "Push to start 7-day free trial",
                          "Push for an in-person site visit or consultation",
                          "Ask for a phone number to schedule a quick call",
                          "Direct prospects to fill out an intake form",
                          "Book a 15-minute Zoom discovery call",
                          "Never offer a discount",
                          "Politely decline leads with budgets under $1,000",
                          "Highlight our 100% money-back guarantee if asked about risk",
                          "Pivot to value/quality instead of competing on price",
                          "Do not mention pricing unless directly asked",
                          "Emphasize that we are a local, family-owned business",
                          "Provide case studies when asked for proof",
                          "Always ask exactly ONE qualifying question per email",
                          "Start every reply with a genuine compliment about their business",
                          "Use emojis naturally in responses",
                          "Keep replies under 3 sentences",
                        ].map(rule => (
                          <div 
                            key={rule}
                            onClick={() => setSelectedRules(prev => prev.includes(rule) ? prev.filter(r => r !== rule) : [...prev, rule])}
                            className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                              selectedRules.includes(rule) 
                                ? "bg-indigo-50 border-indigo-500 text-indigo-700" 
                                : "bg-white border-slate-200 hover:border-indigo-200 text-slate-700"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                              selectedRules.includes(rule) ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-300"
                            }`}>
                              {selectedRules.includes(rule) && <Check size={14} className="text-white" />}
                            </div>
                            <span className="text-sm font-bold">{rule}</span>
                          </div>
                        ))}
                      </div>
                      
                      <label className="block text-sm font-bold text-slate-800 mb-2 mt-6">Additional Custom Notes</label>
                      <textarea
                        value={customRules} onChange={e => setCustomRules(e.target.value)} rows={3}
                        placeholder="e.g. Always push for Wednesday or Thursday calls. Do not mention specific product features."
                        className="w-full rounded-xl p-3.5 text-slate-900 bg-white placeholder-slate-400 font-medium outline-none transition-all border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                      <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 text-sm">
                        {isSaving ? "Saving..." : <><Save size={16} /> Train AI Assistant</>}
                      </button>
                      {saveSuccess && (
                        <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                          <CheckCircle size={15} /> Saved successfully!
                        </span>
                      )}
                      {saveError && (
                        <span className="flex items-center gap-1.5 text-rose-600 font-bold text-sm bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                          Save failed — please try again.
                        </span>
                      )}
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          {activeTab === "schedule" && (
              <motion.div key="schedule" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                  <div className="bg-slate-50 border-b border-slate-200 px-8 py-5">
                    <h2 className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
                      <Calendar size={20} className="text-indigo-600" />
                      Sending Schedule
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Control exactly when VaultReach sends outreach to protect your domain reputation.</p>
                  </div>
                  <form onSubmit={handleSave} className="p-8 space-y-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">Timezone</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full max-w-md rounded-xl p-3 text-sm border-2 border-slate-200 focus:border-indigo-500 outline-none"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Central Europe (CET)</option>
                        <option value="Australia/Sydney">Sydney (AEDT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">Sending Window</label>
                      <div className="flex items-center gap-4">
                        <select
                          value={sendWindowStart}
                          onChange={(e) => setSendWindowStart(Number(e.target.value))}
                          className="rounded-xl p-3 text-sm border-2 border-slate-200 focus:border-indigo-500 outline-none"
                        >
                          {[...Array(24)].map((_, i) => (
                            <option key={`start-${i}`} value={i}>{i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}</option>
                          ))}
                        </select>
                        <span className="text-slate-500 font-bold">to</span>
                        <select
                          value={sendWindowEnd}
                          onChange={(e) => setSendWindowEnd(Number(e.target.value))}
                          className="rounded-xl p-3 text-sm border-2 border-slate-200 focus:border-indigo-500 outline-none"
                        >
                          {[...Array(24)].map((_, i) => (
                            <option key={`end-${i}`} value={i}>{i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">Active Days</label>
                      <div className="flex gap-2">
                        {[
                          { val: "1", label: "M" }, { val: "2", label: "T" }, { val: "3", label: "W" },
                          { val: "4", label: "T" }, { val: "5", label: "F" }, { val: "6", label: "S" }, { val: "7", label: "S" }
                        ].map(day => (
                          <button
                            key={day.val}
                            type="button"
                            onClick={() => {
                              if (sendDays.includes(day.val)) {
                                setSendDays(sendDays.filter(d => d !== day.val))
                              } else {
                                setSendDays([...sendDays, day.val])
                              }
                            }}
                            className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                              sendDays.includes(day.val)
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <label className="flex items-start gap-4 cursor-pointer group">
                        <div className={`relative w-12 h-6 mt-0.5 rounded-full transition-colors ${draftMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${draftMode ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={draftMode}
                          onChange={(e) => setDraftMode(e.target.checked)}
                        />
                        <div>
                          <div className="text-sm font-bold text-slate-800">Draft Mode (Human in the Loop)</div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5 max-w-lg leading-relaxed">
                            When enabled, the AI will write emails but park them in the Draft Queue. You must manually approve them before they are sent. Highly recommended for new campaigns.
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-sm disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : <><Save size={16} /> Save Schedule</>}
                      </button>
                      {saveSuccess && (
                        <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                          <CheckCircle size={15} /> Saved successfully!
                        </span>
                      )}
                      {saveError && (
                        <span className="flex items-center gap-1.5 text-rose-600 font-bold text-sm bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                          Save failed — please try again.
                        </span>
                      )}
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ─── SETTINGS ─── */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                  <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Settings className="text-indigo-600" size={20} /> Integration Settings
                      </h2>
                      <p className="text-sm text-slate-500 font-medium mt-1">Configure your third-party API keys to power the autonomous engine.</p>
                    </div>
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className="shrink-0 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      {isSavingSettings ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Settings</>}
                    </button>
                  </div>
                  <div className="p-6 md:p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <KeyRound size={16} className="text-slate-500" /> Apollo.io API Key
                        </h3>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          VaultReach uses Apollo to scrape hyper-targeted B2B leads. Provide your own API key to bypass platform rate limits and ensure maximum daily scraping throughput.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <input
                          type="password"
                          value={apolloApiKey}
                          onChange={(e) => setApolloApiKey(e.target.value)}
                          placeholder="sk_..."
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                        />
                        {hasApolloApiKey ? (
                          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-2 rounded-lg inline-flex border border-emerald-100">
                            <CheckCircle size={14} /> Key saved and active
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold bg-amber-50 px-3 py-2 rounded-lg inline-flex border border-amber-100">
                            <AlertCircle size={14} /> Missing required key
                          </div>
                        )}
                        {/* ── Collapsible Apollo Help ── */}
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setShowApolloHelp(v => !v)}
                            className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                          >
                            {showApolloHelp ? '▾' : '▸'} How do I get a free Apollo.io API key?
                          </button>
                          {showApolloHelp && (
                            <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-slate-700 space-y-2 leading-relaxed">
                              <p className="font-bold text-indigo-800">Get your free key in 60 seconds:</p>
                              <ol className="list-decimal list-inside space-y-1.5">
                                <li>Go to <a href="https://app.apollo.io" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">app.apollo.io</a> and create a free account (no credit card).</li>
                                <li>Click your avatar in the top-right corner → <strong>Settings</strong>.</li>
                                <li>In the left sidebar, click <strong>Integrations</strong> → <strong>API</strong>.</li>
                                <li>Click <strong>Create New Key</strong>, give it a name (e.g. &quot;VaultReach&quot;), and copy it.</li>
                                <li>Paste it into the field above and click <strong>Save Settings</strong>.</li>
                              </ol>
                              <p className="text-slate-500 pt-1">Free accounts get up to 50 email credits/month. Paid Apollo plans give 2,500+/month.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── DRAFTS QUEUE ─── */}
            {activeTab === "drafts" && (
              <motion.div key="drafts" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                  <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
                        <Inbox size={20} className="text-indigo-600" />
                        Draft Queue
                        <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{drafts.length} Pending</span>
                      </h2>
                      <p className="text-slate-500 text-sm mt-1">Review and approve emails generated by VaultReach before they hit prospects&apos; inboxes.</p>
                    </div>
                  </div>
                  <div className="p-8">
                    {!draftMode && drafts.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                          <Zap size={24} className="text-slate-400" />
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg mb-1">Draft Mode is Off</h3>
                        <p className="text-slate-500 text-sm">Emails are being sent entirely autonomously.</p>
                        <button onClick={() => setActiveTab("schedule")} className="mt-4 text-indigo-600 font-bold text-sm hover:underline">Enable Draft Mode in Settings</button>
                      </div>
                    ) : drafts.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle size={24} className="text-emerald-500" />
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg mb-1">Queue is empty</h3>
                        <p className="text-slate-500 text-sm">You are all caught up! The AI is generating more drafts.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {drafts.map(draft => (
                          <div key={draft.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex justify-between items-center">
                              <div>
                                <div className="text-sm font-bold text-slate-900">{draft.leadFirstName} @ {draft.leadCompany}</div>
                                <div className="text-xs text-slate-500">{draft.leadEmail}</div>
                              </div>
                              <div className="text-xs font-bold text-slate-400">Generated {new Date(draft.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="p-5">
                              <textarea
                                value={draft.emailBody}
                                onChange={(e) => setDrafts(drafts.map(d => d.id === draft.id ? { ...d, emailBody: e.target.value } : d))}
                                rows={6}
                                className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-xl p-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none transition-all"
                              />
                              <div className="flex justify-end gap-3 mt-4">
                                <button
                                  disabled={isActioningDraft === draft.id}
                                  onClick={async () => {
                                    setIsActioningDraft(draft.id)
                                    try {
                                      const res = await fetch("/api/drafts", {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ id: draft.id, status: "rejected", emailBody: draft.emailBody })
                                      })
                                      if (res.ok) setDrafts(drafts.filter(d => d.id !== draft.id))
                                    } finally {
                                      setIsActioningDraft(null)
                                    }
                                  }}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-lg transition-colors disabled:opacity-50 border border-rose-200"
                                >
                                  <XCircle size={14} /> Reject
                                </button>
                                <button
                                  disabled={isActioningDraft === draft.id}
                                  onClick={async () => {
                                    setIsActioningDraft(draft.id)
                                    try {
                                      const res = await fetch("/api/drafts", {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ id: draft.id, status: "approved", emailBody: draft.emailBody })
                                      })
                                      if (res.ok) setDrafts(drafts.filter(d => d.id !== draft.id))
                                    } finally {
                                      setIsActioningDraft(null)
                                    }
                                  }}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm disabled:opacity-50"
                                >
                                  <Check size={14} /> Approve & Queue for Sending
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex bg-white border-t border-slate-200 safe-area-pb">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 text-[10px] font-bold transition-all ${
              activeTab === id ? "text-indigo-600" : "text-slate-500"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                activeTab === id ? "bg-indigo-50 shadow-sm" : "bg-transparent"
              }`}
            >
              <Icon size={18} />
            </div>
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
