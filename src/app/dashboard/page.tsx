"use client"

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  Mail, 
  Settings, 
  LayoutDashboard,
  LogOut,
  Bell,
  Search,
  Zap,
  ArrowRight,
  Sparkles,
  Shield,
  MousePointer2,
  Rocket
} from 'lucide-react'

export default function Dashboard() {
  const [hasOnboarded, setHasOnboarded] = useState(false)
  const [wizardStep, setWizardStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  const wizardSteps = [
    "Welcome",
    "Goal Setting",
    "Targeting",
    "Launch"
  ]

  useEffect(() => {
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => {
        if (data && data.hasOnboarded !== undefined) {
          setHasOnboarded(data.hasOnboarded)
        }
      })
      .catch(err => console.error("Failed to fetch onboarding status:", err))
      .finally(() => setIsLoading(false))
  }, [])

  const nextStep = () => setWizardStep(prev => Math.min(prev + 1, wizardSteps.length - 1))
  const prevStep = () => setWizardStep(prev => Math.max(prev - 1, 0))
  
  const dismissWizard = async () => {
    setHasOnboarded(true)
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasOnboarded: true })
      })
    } catch (error) {
      console.error('Failed to persist onboarding status:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-slate-50 text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900">VaultReach</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2 mt-4">Main Menu</div>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl transition-all">
            <LayoutDashboard size={18} />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group">
            <Target size={18} className="group-hover:text-indigo-500 transition-colors" />
            Campaigns
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group">
            <Users size={18} className="group-hover:text-indigo-500 transition-colors" />
            Leads
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group">
            <Mail size={18} className="group-hover:text-indigo-500 transition-colors" />
            Inbox
            <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
          </a>
          
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2 mt-8">Analytics</div>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
            <BarChart3 size={18} />
            Performance
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
            <TrendingUp size={18} />
            Growth
          </a>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-4 text-white shadow-xl shadow-indigo-100">
            <p className="text-xs font-bold opacity-80 mb-1">PRO PLAN</p>
            <p className="text-sm font-bold mb-3">Unlimited Leads</p>
            <button className="w-full py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-50 transition-colors shadow-sm">
              Upgrade Now
            </button>
          </div>
          
          <div className="flex items-center gap-3 mt-6 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">Alex Rivera</p>
              <p className="text-[10px] font-medium text-slate-500 truncate">Founder @ Hyperion</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search leads, campaigns..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 rounded-xl text-sm transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl relative transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95">
              <Zap size={16} fill="currentColor" />
              New Campaign
            </button>
          </div>
        </header>

        <div className="p-8">
          {!hasOnboarded && (
            <div className="mb-10 bg-white border border-indigo-100 rounded-3xl p-8 shadow-xl shadow-indigo-100/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-50 rounded-full -ml-16 -mb-16" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Setup Guide</div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">4 mins remaining</span>
                  </div>
                  <button 
                    onClick={dismissWizard}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors"
                  >
                    Skip Setup
                  </button>
                </div>

                <div className="flex gap-12">
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-6">
                      {wizardSteps.map((s, i) => (
                        <div key={s} className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${i <= wizardStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                          {i < wizardSteps.length - 1 && <div className={`h-0.5 w-6 ${i < wizardStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
                        </div>
                      ))}
                      <span className="ml-2 text-xs text-slate-400 font-medium">Step {wizardStep + 1} of {wizardSteps.length}</span>
                    </div>

                    {wizardStep === 0 && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                          <Zap size={24} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome to VaultReach 👋</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                          VaultReach is your autonomous AI sales rep. Once set up, it will find qualified leads, write personalized cold emails, and fill your pipeline — 24 hours a day, 7 days a week, without you lifting a finger.
                        </p>
                        <button 
                          onClick={nextStep}
                          className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 group/btn"
                        >
                          Get Started
                          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )}

                    {wizardStep === 1 && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                          <Target size={24} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Define Your Sales Goal</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                          Tell our AI what you want to achieve. Whether it's 50 new booked meetings or $100k in new pipeline, we'll optimize your outreach to hit that target.
                        </p>
                        <div className="flex gap-3">
                          <button onClick={prevStep} className="px-6 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all">Back</button>
                          <button onClick={nextStep} className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Next Step</button>
                        </div>
                      </div>
                    )}

                    {wizardStep === 2 && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                          <Users size={24} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Identify Your Target</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                          Who are we reaching out to? Define your Ideal Customer Profile (ICP) by industry, title, and company size. Our AI will handle the rest.
                        </p>
                        <div className="flex gap-3">
                          <button onClick={prevStep} className="px-6 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all">Back</button>
                          <button onClick={nextStep} className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Almost Done</button>
                        </div>
                      </div>
                    )}

                    {wizardStep === 3 && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                          <Rocket size={24} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Ready to Launch?</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                          Everything is ready. Once you click launch, our AI will begin researching your leads and drafting personalized sequences.
                        </p>
                        <div className="flex gap-3">
                          <button onClick={prevStep} className="px-6 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all">Back</button>
                          <button onClick={dismissWizard} className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">Launch My AI Agent</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-72 bg-slate-50 rounded-2xl p-6 border border-slate-100 hidden lg:block">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">How it works</h4>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <MousePointer2 size={12} className="text-indigo-600" />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">AI researches lead's LinkedIn and website</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <Shield size={12} className="text-indigo-600" />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">Verify email and avoid spam filters</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <Mail size={12} className="text-indigo-600" />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">Send personalized 1-to-1 message</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Leads Found', val: '1,284', change: '+12%', icon: Users, color: 'bg-blue-50 text-blue-600' },
              { label: 'Emails Sent', val: '852', change: '+5.4%', icon: Mail, color: 'bg-indigo-50 text-indigo-600' },
              { label: 'Meetings Booked', val: '43', change: '+24%', icon: Target, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Pipeline Value', val: '$124k', change: '+18%', icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/20 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <stat.icon size={22} />
                  </div>
                  <span className="text-xs font-black text-emerald-500">{stat.change}</span>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900">{stat.val}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-slate-900">Recent Lead Activity</h3>
                  <button className="text-indigo-600 text-xs font-bold hover:underline">View All Leads</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {[1, 2, 3, 4].map((lead) => (
                    <div key={lead} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400">JD</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">Jane Doe</p>
                        <p className="text-xs text-slate-500">VP of Sales at Acme Corp</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">Opened Email</p>
                        <p className="text-[10px] text-slate-400">2 minutes ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 overflow-hidden relative">
                <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/5 rotate-12" />
                <h3 className="text-lg font-black mb-2 relative">AI Insights</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 relative">
                  Your "SaaS Founders" campaign is outperforming others by 24%. We recommend increasing your daily limit.
                </p>
                <button className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-all">
                  Optimize Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
