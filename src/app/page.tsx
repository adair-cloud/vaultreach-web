"use client"

import { motion } from "framer-motion"
import { Briefcase, ArrowRight, CheckCircle2, Mail, Calendar, Settings, BarChart, Zap, Inbox } from "lucide-react"
import { useEffect, useState } from "react"
import Link from 'next/link'

// Custom VaultReach Logo Component
const VaultLogo = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <rect width="40" height="40" rx="10" fill="#4F46E5"/>
    <path d="M12 14L18.5 28L21.5 22M21.5 22L28 14H24L20 20L16 14H12Z" fill="white"/>
    <path d="M21.5 22C21.5 22 25 15 28 14C29.5 13.5 32 17 28 22C24 27 21.5 22 21.5 22Z" fill="white" fillOpacity="0.8"/>
  </svg>
)

export default function Home() {
  const [typingStep, setTypingStep] = useState(0)

  useEffect(() => {
    const timer1 = setTimeout(() => setTypingStep(1), 1500)
    const timer2 = setTimeout(() => setTypingStep(2), 3500)
    const timer3 = setTimeout(() => setTypingStep(3), 5000)
    const timer4 = setTimeout(() => setTypingStep(4), 7000)
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4) }
  }, [])

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-50 text-slate-900 font-sans">
      
      {/* Navbar */}
      <nav className="absolute top-0 w-full flex items-center justify-between p-6 z-50 max-w-7xl mx-auto left-0 right-0">
        <div className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          <VaultLogo />
          VaultReach
        </div>
        <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-800 px-4 py-2 transition-colors">
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center pt-32 pb-20 px-4 text-center max-w-7xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center w-full"
        >
          <div className="bg-white border border-slate-200 text-indigo-600 px-5 py-2 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 mb-8 shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Built for Local Businesses & Agencies
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Hire a relentless AI Sales Rep <br className="hidden md:block" />
            <span className="text-indigo-600">for $297/MO.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed mb-10">
            VaultReach automatically finds your ideal local clients, researches their business, and books meetings directly to your calendar—while you sleep.
          </p>

          <motion.a 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            href="/login"
            className="flex items-center gap-2 bg-indigo-600 text-white px-10 py-5 rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all duration-300"
          >
            Start Your Digital Employee <ArrowRight size={20} />
          </motion.a>
        </motion.div>

        {/* Visual Proof Section: Outreach Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-4xl mt-24 relative"
        >
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden text-left relative z-10">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="ml-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Live Outreach Feed</div>
            </div>
            
            <div className="p-8 space-y-8 bg-white min-h-[300px]">
              {/* Step 1 */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: typingStep >= 1 ? 1 : 0 }} className="flex gap-4 items-start">
                <div className="bg-slate-100 text-indigo-600 p-3 rounded-full shrink-0"><Briefcase size={20} /></div>
                <div>
                  <div className="text-base font-bold text-slate-900">AI SDR found a prospect</div>
                  <div className="text-sm text-slate-500 mt-1">Identified: David Smith, Owner at Apex Plumbing Services</div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: typingStep >= 2 ? 1 : 0 }} className="flex gap-4 items-start">
                <div className="bg-amber-50 text-amber-600 p-3 rounded-full shrink-0"><Mail size={20} /></div>
                <div className="w-full">
                  <div className="text-base font-bold text-slate-900">Drafting highly personalized email...</div>
                  <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 w-full relative">
                    <div className="absolute -left-2 top-4 w-4 h-4 bg-slate-50 border-l border-b border-slate-200 transform rotate-45"></div>
                    <p className="text-sm text-slate-600 font-mono leading-relaxed relative z-10">
                      {typingStep === 2 ? "Analyzing Apex Plumbing website... typing..." : "Hi David, saw you expanded Apex Plumbing to the Westside area. We help local service businesses like yours generate exclusive appointments. Are you free to connect?"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: typingStep >= 4 ? 1 : 0 }} className="absolute bottom-8 right-8">
                <div className="bg-emerald-500 text-white px-5 py-4 rounded-xl shadow-lg flex items-center gap-3 font-bold text-base border border-emerald-400">
                  <Calendar size={20} />
                  Meeting Booked!
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Feature Grids: Generating Leads on Autopilot */}
      <section className="bg-white py-24 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Generating new leads on autopilot.</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Wake up to an inbox full of interested prospects. Our AI handles the heavy lifting so you can focus on closing deals.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* The Inbox Graphic */}
            <div className="bg-slate-50 rounded-3xl p-6 md:p-8 border border-slate-200 shadow-inner">
              <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-100 font-semibold text-slate-700 flex items-center gap-2">
                  <Inbox size={18} className="text-indigo-600" />
                  Primary Inbox
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="p-4 bg-indigo-50/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900">Sarah Jenkins</span>
                      <span className="text-xs text-indigo-600 font-bold bg-indigo-100 px-2 py-1 rounded">New Reply</span>
                    </div>
                    <div className="font-semibold text-slate-800 text-sm mb-1">Re: Marketing support for Horizon Roofers</div>
                    <div className="text-sm text-slate-600 truncate">Yes, we actually need this right now. Are you free to call on Tuesday at 10am?</div>
                  </div>
                  <div className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900">Mike O'Connor</span>
                      <span className="text-xs text-slate-400">2 hours ago</span>
                    </div>
                    <div className="font-semibold text-slate-800 text-sm mb-1">Re: Quick question about your agency</div>
                    <div className="text-sm text-slate-600 truncate">I'd love to learn more. Can you send over some pricing on your package?</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Text */}
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl h-fit"><Zap size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">100% Hands-Free Operation</h3>
                  <p className="text-slate-600 leading-relaxed">Once you tell VaultReach who your ideal customer is, the AI takes over completely. It sources leads, verifies emails, and sends the pitches autonomously.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl h-fit"><BarChart size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Tailored to Your Company Brand</h3>
                  <p className="text-slate-600 leading-relaxed">VaultReach scrapes your website to learn exactly what you do. Every email generated reads perfectly in your brand's unique tone of voice.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-24 text-center px-4">
        <h2 className="text-4xl font-extrabold text-white mb-6">Ready to hire your AI SDR?</h2>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">Stop wasting time searching for leads manually. Deploy VaultReach today.</p>
        <Link href="/login" className="inline-block bg-indigo-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30">
          Get Started — $297/mo
        </Link>
      </section>

    </div>
  )
}
