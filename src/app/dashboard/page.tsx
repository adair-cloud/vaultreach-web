"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession, signOut } from "next-auth/react"
import { BarChart3, Target, Bot, LogOut, Mail, Calendar, TrendingUp, BrainCircuit, MessageSquareText, Save, CheckCircle } from "lucide-react"

const VaultLogo = () => (
  <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <rect width="40" height="40" rx="10" fill="#4F46E5"/>
    <path d="M12 14L18.5 28L21.5 22M21.5 22L28 14H24L20 20L16 14H12Z" fill="white"/>
    <path d="M21.5 22C21.5 22 25 15 28 14C29.5 13.5 32 17 28 22C24 27 21.5 22 21.5 22Z" fill="white" fillOpacity="0.8"/>
  </svg>
)

export default function Dashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [url, setUrl] = useState("")
  const [icp, setIcp] = useState("")
  
  // AI Brain State
  const [tone, setTone] = useState("professional")
  const [rules, setRules] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Analytics State
  const [analytics, setAnalytics] = useState({ emailsSent: 0, replies: 0, meetings: 0 })

  // Load existing campaign data on mount
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/campaigns')
      if (res.ok) {
        const { campaign } = await res.json()
        if (campaign) {
          setUrl(campaign.websiteUrl ?? "")
          setIcp(campaign.targetIndustry ?? "")
          setTone(campaign.targetTitles ?? "professional")
          setRules(campaign.employeeRange ?? "")
        }
      }
      const analyticsRes = await fetch('/api/analytics')
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
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: url,
          targetIndustry: icp,
          targetTitles: tone,
          employeeRange: rules,
          targetLocations: "",
        })
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const userName = session?.user?.name ?? "User"
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-100">
            <div className="text-xl font-black tracking-tight flex items-center gap-2">
              <VaultLogo />
              VaultReach
            </div>
          </div>
          
          <div className="p-4 space-y-2 mt-4">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <BarChart3 size={20} /> Performance
            </button>
            <button 
              onClick={() => setActiveTab('targeting')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'targeting' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Target size={20} /> Lead Targeting
            </button>
            <button 
              onClick={() => setActiveTab('brain')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'brain' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <BrainCircuit size={20} /> AI Brain
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={20} /> Disconnect
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-8 md:px-12">
          <h2 className="text-2xl font-extrabold capitalize text-slate-800">
            {activeTab === 'brain' ? 'AI Messaging Brain' : activeTab}
          </h2>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Agent Active
            </span>
            <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-700 font-bold">
              {userInitial}
            </div>
          </div>
        </header>

        <div className="p-8 md:p-12 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><Bot size={24} /></div>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">Live</span>
                    </div>
                    <div className="text-3xl font-black text-slate-800 mb-1">{analytics.emailsSent.toLocaleString()}</div>
                    <div className="text-sm font-semibold text-slate-500">Emails Sent</div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-amber-50 p-3 rounded-xl text-amber-500"><Mail size={24} /></div>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">Running</span>
                    </div>
                    <div className="text-3xl font-black text-slate-800 mb-1">{analytics.replies.toLocaleString()}</div>
                    <div className="text-sm font-semibold text-slate-500">Positive Replies</div>
                  </div>

                  <div className="bg-indigo-600 p-6 rounded-2xl shadow-float border border-indigo-500 text-white relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 text-indigo-500/30">
                      <Calendar size={120} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/20 p-3 rounded-xl text-white"><TrendingUp size={24} /></div>
                      </div>
                      <div className="text-4xl font-black mb-1">{analytics.meetings}</div>
                      <div className="text-sm font-semibold text-indigo-200">Meetings Booked</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-soft border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Recent Positive Replies</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {analytics.replies === 0 ? (
                      <div className="p-12 text-center text-slate-400 font-semibold">
                        No replies yet — your SDR is warming up! 🚀
                      </div>
                    ) : (
                      [
                        { name: "Sarah Jenkins", role: "CEO at Horizon Roofers", preview: "Yes, we actually need this right now. Are you free to call on Tuesday?", time: "2 hours ago" },
                        { name: "Mike O&apos;Connor", role: "Partner at Local CPA", preview: "I&apos;d love to learn more. Can you send over some pricing on your package?", time: "5 hours ago" },
                        { name: "Jessica T.", role: "Founder, Bloom Agency", preview: "Sounds interesting. Let&apos;s schedule a quick 10 min intro for next week.", time: "1 day ago" }
                      ].map((reply, i) => (
                        <div key={i} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-900">{reply.name} <span className="text-slate-400 font-medium text-sm ml-2">{reply.role}</span></div>
                            <div className="text-sm font-medium text-slate-600 mt-1">{reply.preview}</div>
                          </div>
                          <div className="text-xs font-bold text-slate-400">{reply.time}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 2: TARGETING */}
            {activeTab === 'targeting' && (
              <motion.div 
                key="targeting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-white rounded-3xl shadow-soft border border-slate-200 overflow-hidden">
                  <div className="border-b border-slate-200 p-8 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Ideal Customer Profile (ICP)</h3>
                    <p className="text-slate-500 font-medium text-sm">Update your targeting parameters at any time. The AI will instantly adjust its Apollo scraping queries.</p>
                  </div>
                  <form onSubmit={handleSave} className="p-8 space-y-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-extrabold text-slate-900 mb-2">
                        Your Business Website
                      </label>
                      <input 
                        type="url" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://acmeplumbing.com" 
                        className="w-full bg-white border-2 border-slate-200 rounded-xl p-3.5 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-extrabold text-slate-900 mb-2">
                        Who is your perfect customer?
                      </label>
                      <textarea 
                        value={icp}
                        onChange={(e) => setIcp(e.target.value)}
                        rows={4}
                        placeholder="e.g. Restaurants and cafes in Austin, Texas that need commercial plumbing maintenance." 
                        className="w-full bg-white border-2 border-slate-200 rounded-xl p-3.5 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-medium resize-none"
                      />
                    </div>
                    <div className="pt-4 flex items-center gap-4">
                      <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-70">
                        {isSaving ? 'Saving...' : <><Save size={18} /> Update Targeting</>}
                      </button>
                      {saveSuccess && (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                          <CheckCircle size={16} /> Saved to database!
                        </span>
                      )}
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* VIEW 3: AI BRAIN */}
            {activeTab === 'brain' && (
              <motion.div 
                key="brain"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-white rounded-3xl shadow-soft border border-slate-200 overflow-hidden">
                  <div className="border-b border-slate-200 p-8 bg-indigo-50/30">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Messaging Controls</h3>
                    <p className="text-slate-500 font-medium text-sm">Control exactly how your digital employee speaks to prospects and handles complex replies.</p>
                  </div>
                  <form onSubmit={handleSave} className="p-8 space-y-8">
                    
                    {/* Tone Selector */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-extrabold text-slate-900 mb-4">
                        Brand Tone of Voice
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { id: 'professional', label: 'Highly Professional', desc: 'Direct, corporate, respectful.' },
                          { id: 'casual', label: 'Casual & Friendly', desc: 'Relaxed, uses emojis, enthusiastic.' },
                          { id: 'urgent', label: 'Urgent & Direct', desc: 'Short sentences, to the point.' }
                        ].map(t => (
                          <div 
                            key={t.id}
                            onClick={() => setTone(t.id)}
                            className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${tone === t.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                          >
                            <div className={`font-bold mb-1 ${tone === t.id ? 'text-indigo-700' : 'text-slate-800'}`}>{t.label}</div>
                            <div className="text-xs font-semibold text-slate-500">{t.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Auto Reply Guardrails */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-extrabold text-slate-900 mb-2">
                        <MessageSquareText size={16} className="text-indigo-600" />
                        Auto-Reply Guardrails (Custom Instructions)
                      </label>
                      <p className="text-xs text-slate-500 font-medium mb-3">Provide specific rules for the AI when handling replies, e.g., &quot;Never offer a discount&quot; or &quot;If asked for pricing, say it starts at $5,000&quot;.</p>
                      <textarea 
                        value={rules}
                        onChange={(e) => setRules(e.target.value)}
                        rows={4}
                        placeholder="Always try to push them to a Wednesday or Thursday phone call. Do not mention specific product features unless they explicitly ask." 
                        className="w-full bg-white border-2 border-slate-200 rounded-xl p-3.5 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-medium resize-none"
                      />
                    </div>
                    
                    <div className="pt-2 flex items-center gap-4">
                      <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-70">
                        {isSaving ? 'Training AI...' : <><Save size={18} /> Train AI Assistant</>}
                      </button>
                      {saveSuccess && (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                          <CheckCircle size={16} /> Saved to database!
                        </span>
                      )}
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

    </div>
  )
}
