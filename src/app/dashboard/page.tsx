"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession, signOut } from "next-auth/react"
import {
  BarChart3, Target, BrainCircuit, LogOut, Save, CheckCircle,
  Mail, Calendar, TrendingUp, Zap, Clock, MessageSquareText,
  ArrowUpRight, Bot, ChevronRight
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
  const [icp, setIcp] = useState("")
  const [tone, setTone] = useState("professional")
  const [rules, setRules] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [hasIcp, setHasIcp] = useState(false)
  const [lastPing, setLastPing] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<{
    emailsSent: number
    replies: number
    meetings: number
    recentReplies: { name: string; role: string; preview: string; score: string; time: string }[]
  }>({ emailsSent: 0, replies: 0, meetings: 0, recentReplies: [] })

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/campaigns")
      if (res.ok) {
        const { campaign } = await res.json()
        if (campaign) {
          setUrl(campaign.websiteUrl ?? "")
          setIcp(campaign.targetIndustry ?? "")
          setTone(campaign.tone ?? "professional")
          setRules(campaign.rules ?? "")
          setHasIcp(Boolean(campaign.targetIndustry?.trim()))
          setLastPing(campaign.lastPing ?? null)
        }
      }
      const analyticsRes = await fetch("/api/analytics")
      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        setAnalytics(data)
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
        // Each tab only sends the fields it owns — selective merge in the API
        // prevents the Lead Targeting save from wiping tone/rules and vice versa
        body: JSON.stringify(
          activeTab === "brain"
            ? { tone, rules }
            : { websiteUrl: url, targetIndustry: icp, targetLocations: "" }
        ),
      })
      if (!res.ok) throw new Error("Save failed")
      if (activeTab === "targeting" && icp.trim()) setHasIcp(true)
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

  const userName = session?.user?.name?.split(" ")[0] ?? "there"
  const userInitial = (session?.user?.name ?? "U").charAt(0).toUpperCase()
  const pipelineValue = analytics.meetings * 3000
  const hoursSaved = Math.max(analytics.emailsSent * 0.5, 0)

  // Derive agent status from the Python worker's last heartbeat
  const agentStatus: "active" | "idle" | "offline" | "unknown" = (() => {
    if (!lastPing) return "unknown"
    const ageMs = Date.now() - new Date(lastPing).getTime()
    const ageHrs = ageMs / (1000 * 60 * 60)
    if (ageHrs < 2)   return "active"
    if (ageHrs < 24)  return "idle"
    return "offline"
  })()

  const agentStatusConfig = {
    active:  { dot: "bg-emerald-400 animate-pulse", label: "Agent Active",  sub: "Prospecting now",        bg: "#0D2818", border: "#166534",  text: "text-emerald-400" },
    idle:    { dot: "bg-amber-400",                label: "Agent Idle",    sub: "Last ran < 24 hrs ago",  bg: "#1a1500", border: "#78350f",  text: "text-amber-400"  },
    offline: { dot: "bg-red-500",                  label: "Agent Offline", sub: "No ping in > 24 hrs",    bg: "#1a0a0a", border: "#7f1d1d",  text: "text-red-400"   },
    unknown: { dot: "bg-slate-500",                label: "Not Started",   sub: "Awaiting first run",     bg: "#131929", border: "#1E2535", text: "text-slate-400" },
  }

  const navItems = [
    { id: "overview", icon: BarChart3, label: "Overview" },
    { id: "targeting", icon: Target, label: "Lead Targeting" },
    { id: "brain", icon: BrainCircuit, label: "AI Brain" },
  ]

  const kpis = [
    {
      label: "Emails Sent", value: analytics.emailsSent,
      icon: Mail, format: "number",
      gradient: "from-indigo-500/20 to-indigo-600/5",
      border: "border-indigo-500/20", iconColor: "text-indigo-400",
      badge: "Live", badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      sub: analytics.emailsSent === 0 ? "Warming up..." : `${Math.round(analytics.emailsSent * 0.44)} estimated opens`,
    },
    {
      label: "Positive Replies", value: analytics.replies,
      icon: MessageSquareText, format: "number",
      gradient: "from-violet-500/20 to-violet-600/5",
      border: "border-violet-500/20", iconColor: "text-violet-400",
      badge: "Auto-tracked", badgeColor: "text-violet-400 bg-violet-400/10 border-violet-400/20",
      sub: analytics.replies === 0 ? "First reply ~48 hrs" : `${Math.round(analytics.replies / Math.max(analytics.emailsSent, 1) * 100)}% reply rate`,
    },
    {
      label: "Meetings Booked", value: analytics.meetings,
      icon: Calendar, format: "number",
      gradient: "from-sky-500/20 to-sky-600/5",
      border: "border-sky-500/20", iconColor: "text-sky-400",
      badge: "Goal", badgeColor: "text-sky-400 bg-sky-400/10 border-sky-400/20",
      sub: analytics.meetings === 0 ? "Replies convert at ~12%" : `${analytics.meetings} this month`,
    },
    {
      label: "Est. Pipeline Value", value: pipelineValue,
      icon: TrendingUp, format: "currency",
      gradient: "from-emerald-500/20 to-emerald-600/5",
      border: "border-emerald-500/20", iconColor: "text-emerald-400",
      badge: "Est. @ $3K/deal", badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      sub: analytics.meetings === 0 ? "Grows with every meeting" : "Based on avg deal size",
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: "#0B0F1A" }}>

      {/* SIDEBAR */}
      <aside className="w-60 shrink-0 hidden md:flex flex-col justify-between border-r" style={{ background: "#0F1420", borderColor: "#1E2535" }}>
        <div>
          <div className="h-16 flex items-center px-5 border-b" style={{ borderColor: "#1E2535" }}>
            <div className="flex items-center gap-2.5">
              <VaultLogo />
              <span className="text-white font-black text-lg tracking-tight">VaultReach</span>
            </div>
          </div>

          {/* Agent status pill — driven by real lastPing from the Python worker */}
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
                  <div className="text-slate-400 text-[10px] font-medium">{s.sub}</div>
                </div>
                <Bot size={14} className={`${s.text} ml-auto`} />
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
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                {label}
                {activeTab === id && <ChevronRight size={14} className="ml-auto" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3 border-t" style={{ borderColor: "#1E2535" }}>
          {/* User chip */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2" style={{ background: "#1E2535" }}>
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-semibold text-xs truncate">{session?.user?.name ?? "User"}</div>
              <div className="text-slate-400 text-[10px] truncate">{session?.user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <header className="h-16 sticky top-0 z-20 flex items-center justify-between px-8 border-b backdrop-blur-lg" style={{ background: "rgba(11,15,26,0.85)", borderColor: "#1E2535" }}>
          <div>
            <div className="text-white font-extrabold text-base">{activeTab === "brain" ? "AI Messaging Brain" : activeTab === "targeting" ? "Lead Targeting" : "Performance Overview"}</div>
            <div className="text-slate-500 text-xs font-medium">VaultReach Campaign Dashboard</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-400 border border-slate-700 rounded-full px-3 py-1.5">
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

                {/* ── COLD-START: Setup Checklist (shown when no ICP saved yet) ── */}
                {!hasIcp ? (
                  <div className="rounded-3xl p-8" style={{ background: "linear-gradient(135deg,#1a1f35 0%,#0F1420 100%)", border: "1px solid #2d3a55" }}>
                    <div className="mb-6">
                      <div className="text-indigo-300 font-semibold text-sm mb-1">{getGreeting()}, {userName} 👋</div>
                      <h1 className="text-white font-black text-2xl mb-1">Let&apos;s get your AI SDR running.</h1>
                      <p className="text-slate-400 text-sm font-medium">Complete these 3 steps and your engine will start prospecting within 24 hours.</p>
                    </div>
                    <div className="space-y-3">
                      {/* Step 1 — always complete (they're logged in) */}
                      <div className="flex items-center gap-4 rounded-2xl px-5 py-4" style={{ background: "#0D2818", border: "1px solid #166534" }}>
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-sm">Connected Google Account</div>
                          <div className="text-emerald-400 text-xs font-medium">{session?.user?.email}</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">Done</span>
                      </div>
                      {/* Step 2 — CTA to go fill in the ICP */}
                      <div className="flex items-center gap-4 rounded-2xl px-5 py-4" style={{ background: "#131929", border: "1.5px solid #6366F1" }}>
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                          <Target size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-sm">Set your Ideal Customer Profile</div>
                          <div className="text-slate-400 text-xs font-medium">Tell the AI who to target — takes 60 seconds.</div>
                        </div>
                        <button
                          onClick={() => setActiveTab("targeting")}
                          className="shrink-0 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                        >
                          Set Up <ChevronRight size={12} />
                        </button>
                      </div>
                      {/* Step 3 — locked until ICP is saved */}
                      <div className="flex items-center gap-4 rounded-2xl px-5 py-4 opacity-40" style={{ background: "#131929", border: "1px solid #1E2535" }}>
                        <div className="w-8 h-8 rounded-full border-2 border-slate-600 flex items-center justify-center shrink-0">
                          <Zap size={14} className="text-slate-500" />
                        </div>
                        <div className="flex-1">
                          <div className="text-slate-300 font-bold text-sm">AI warming up &amp; prospecting</div>
                          <div className="text-slate-500 text-xs font-medium">Unlocks after Step 2 is complete.</div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-full">Locked</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                {/* Hero greeting — only shown once ICP is configured */}
                <div className="rounded-3xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#312e81 0%,#1e1b4b 60%,#0B0F1A 100%)", border: "1px solid #4338ca40" }}>
                  <div className="absolute -right-8 -top-8 opacity-10">
                    <Zap size={180} className="text-indigo-300" />
                  </div>
                  <div className="relative">
                    <div className="text-indigo-300 font-semibold text-sm mb-1">{getGreeting()}, {userName} 👋</div>
                    <h1 className="text-white font-black text-2xl mb-2">Your AI sales engine is running 24/7.</h1>
                    <p className="text-indigo-200 text-sm font-medium max-w-lg">
                      While you focus on delivering great work, VaultReach is scraping leads, writing personalized outreach, and filling your pipeline around the clock.
                    </p>
                    {analytics.emailsSent === 0 && (
                      <div className="mt-4 inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl px-4 py-2 text-indigo-200 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Warming up — your first batch of emails typically sends within 24 hours of setup.
                      </div>
                    )}
                  </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {kpis.map((kpi) => (
                    <div key={kpi.label} className={`rounded-2xl p-5 border bg-gradient-to-br ${kpi.gradient} ${kpi.border} relative overflow-hidden`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-xl bg-white/5 ${kpi.iconColor}`}>
                          <kpi.icon size={18} />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${kpi.badgeColor}`}>
                          {kpi.badge}
                        </span>
                      </div>
                      <div className="text-white font-black text-3xl mb-0.5">
                        {kpi.format === "currency" ? (
                          kpi.value === 0 ? "$0" : `$${kpi.value.toLocaleString()}`
                        ) : (
                          <AnimatedNumber value={kpi.value} />
                        )}
                      </div>
                      <div className="text-slate-300 font-bold text-sm mb-2">{kpi.label}</div>
                      <div className="text-slate-500 text-xs font-medium">{kpi.sub}</div>
                      {kpi.value > 0 && (
                        <div className="absolute top-4 right-4 opacity-20">
                          <ArrowUpRight size={40} className="text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Time Saved Banner */}
                <div className="rounded-2xl px-6 py-4 flex items-center justify-between" style={{ background: "#131929", border: "1px solid #1E2535" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">Hours Saved vs. Hiring an SDR</div>
                      <div className="text-slate-400 text-xs">
                        {analytics.emailsSent === 0
                          ? "Calculated once outreach begins"
                          : "Based on your email volume at ~30 min/prospect manually"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-black text-2xl">
                      {analytics.emailsSent === 0 ? "—" : `${Math.round(hoursSaved)}`}
                    </div>
                    <div className="text-slate-500 text-xs font-semibold">
                      {analytics.emailsSent === 0 ? "not yet" : "hrs / wk est."}
                    </div>
                  </div>
                </div>

                {/* Recent Replies — maps over real DB records, no hardcoded data */}
                <div className="rounded-2xl overflow-hidden" style={{ background: "#131929", border: "1px solid #1E2535" }}>
                  <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: "#1E2535" }}>
                    <h3 className="text-white font-bold text-sm">Recent Positive Replies</h3>
                    <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">AI-monitored</span>
                  </div>
                  {analytics.recentReplies.length === 0 ? (
                    <div className="p-10 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                        <Mail size={24} className="text-indigo-400" />
                      </div>
                      <div className="text-white font-bold text-base mb-1">No replies yet — and that&apos;s normal.</div>
                      <div className="text-slate-400 text-sm font-medium max-w-xs mx-auto">
                        Most campaigns see the first interested reply within 48 hours. Your AI is warming up inboxes to maximize deliverability.
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y" style={{ borderColor: "#1E2535" }}>
                      {analytics.recentReplies.map((reply, i) => (
                        <div key={i} className="px-6 py-4 hover:bg-white/2 transition-colors flex items-center gap-4">
                          <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
                            {reply.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-white font-bold text-sm">{reply.name}</span>
                              <span className="text-slate-500 text-xs">{reply.role}</span>
                            </div>
                            <div className="text-slate-400 text-xs truncate">{reply.preview}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              reply.score === "Hot"
                                ? "text-red-400 bg-red-400/10 border-red-400/20"
                                : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                            }`}>
                              {reply.score}
                            </span>
                            <span className="text-slate-500 text-[10px]">{reply.time}</span>
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
                <div className="rounded-2xl overflow-hidden" style={{ background: "#131929", border: "1px solid #1E2535" }}>
                  <div className="px-8 py-6 border-b" style={{ borderColor: "#1E2535" }}>
                    <h3 className="text-white font-bold text-lg mb-1">Ideal Customer Profile</h3>
                    <p className="text-slate-400 text-sm">Update your ICP at any time — the AI instantly adjusts its Apollo prospecting queries.</p>
                  </div>
                  <form onSubmit={handleSave} className="p-8 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-200 mb-2">Your Business Website</label>
                      <input
                        type="url" value={url} onChange={e => setUrl(e.target.value)}
                        placeholder="https://acmeplumbing.com"
                        className="w-full rounded-xl p-3.5 text-slate-100 placeholder-slate-500 font-medium outline-none transition-all"
                        style={{ background: "#0B0F1A", border: "1.5px solid #1E2535" }}
                        onFocus={e => (e.target.style.borderColor = "#6366F1")}
                        onBlur={e => (e.target.style.borderColor = "#1E2535")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-200 mb-2">Who is your perfect customer?</label>
                      <textarea
                        value={icp} onChange={e => setIcp(e.target.value)} rows={4}
                        placeholder="e.g. Restaurants and cafes in Austin, Texas with 5–50 employees needing commercial plumbing services."
                        className="w-full rounded-xl p-3.5 text-slate-100 placeholder-slate-500 font-medium outline-none transition-all resize-none"
                        style={{ background: "#0B0F1A", border: "1.5px solid #1E2535" }}
                        onFocus={e => (e.target.style.borderColor = "#6366F1")}
                        onBlur={e => (e.target.style.borderColor = "#1E2535")}
                      />
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                      <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-7 rounded-xl transition-all disabled:opacity-60 text-sm">
                        {isSaving ? "Saving..." : <><Save size={16} /> Update Targeting</>}
                      </button>
                      {saveSuccess && (
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                          <CheckCircle size={15} /> Saved!
                        </span>
                      )}
                      {saveError && (
                        <span className="text-red-400 font-bold text-sm">Save failed — please try again.</span>
                      )}
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ─── AI BRAIN ─── */}
            {activeTab === "brain" && (
              <motion.div key="brain" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div className="rounded-2xl overflow-hidden" style={{ background: "#131929", border: "1px solid #1E2535" }}>
                  <div className="px-8 py-6 border-b" style={{ borderColor: "#1E2535" }}>
                    <h3 className="text-white font-bold text-lg mb-1">Messaging Controls</h3>
                    <p className="text-slate-400 text-sm">Control exactly how your digital SDR speaks to prospects and handles replies.</p>
                  </div>
                  <form onSubmit={handleSave} className="p-8 space-y-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-200 mb-4">Brand Tone of Voice</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { id: "professional", label: "Highly Professional", desc: "Direct, polished, corporate." },
                          { id: "casual", label: "Casual & Friendly", desc: "Warm, relaxed, uses first names." },
                          { id: "urgent", label: "Urgent & Direct", desc: "Short sentences, strong CTA." },
                        ].map(t => (
                          <div
                            key={t.id} onClick={() => setTone(t.id)}
                            className="cursor-pointer rounded-xl p-4 transition-all"
                            style={{
                              background: tone === t.id ? "#1e1b4b" : "#0B0F1A",
                              border: `1.5px solid ${tone === t.id ? "#6366F1" : "#1E2535"}`
                            }}
                          >
                            <div className={`font-bold text-sm mb-1 ${tone === t.id ? "text-indigo-300" : "text-slate-300"}`}>{t.label}</div>
                            <div className="text-xs text-slate-500 font-medium">{t.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-200 mb-1">
                        Auto-Reply Guardrails
                      </label>
                      <p className="text-xs text-slate-500 mb-3 font-medium">
                        Custom rules the AI follows when handling replies. e.g., &quot;Never offer a discount&quot; or &quot;If asked for pricing, say it starts at $5,000.&quot;
                      </p>
                      <textarea
                        value={rules} onChange={e => setRules(e.target.value)} rows={5}
                        placeholder="Always push for Wednesday or Thursday calls. Do not mention specific product features unless asked directly."
                        className="w-full rounded-xl p-3.5 text-slate-100 placeholder-slate-500 font-medium outline-none transition-all resize-none"
                        style={{ background: "#0B0F1A", border: "1.5px solid #1E2535" }}
                        onFocus={e => (e.target.style.borderColor = "#6366F1")}
                        onBlur={e => (e.target.style.borderColor = "#1E2535")}
                      />
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                      <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-7 rounded-xl transition-all disabled:opacity-60 text-sm">
                        {isSaving ? "Saving..." : <><Save size={16} /> Train AI Assistant</>}
                      </button>
                      {saveSuccess && (
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                          <CheckCircle size={15} /> Saved!
                        </span>
                      )}
                      {saveError && (
                        <span className="text-red-400 font-bold text-sm">Save failed — please try again.</span>
                      )}
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── MOBILE BOTTOM TAB BAR (md:hidden) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t"
        style={{ background: "#0F1420", borderColor: "#1E2535" }}
      >
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold transition-all ${
              activeTab === id ? "text-indigo-400" : "text-slate-500"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                activeTab === id ? "bg-indigo-600/20" : "bg-transparent"
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
