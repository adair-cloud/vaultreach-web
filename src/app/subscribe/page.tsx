"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

const VaultLogo = () => (
  <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#4F46E5"/>
    <path d="M12 14L18.5 28L21.5 22M21.5 22L28 14H24L20 20L16 14H12Z" fill="white"/>
    <path d="M21.5 22C21.5 22 25 15 28 14C29.5 13.5 32 17 28 22C24 27 21.5 22 21.5 22Z" fill="white" fillOpacity="0.8"/>
  </svg>
)

function SubscribeContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const canceled = searchParams.get("canceled")
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!session) {
      router.push("/login")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12 justify-center">
          <VaultLogo />
          <span className="text-white font-black text-2xl tracking-tight">VaultReach</span>
        </div>

        {canceled && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-red-300 text-sm font-semibold text-center">
            Payment was canceled. No charge was made — try again when you&apos;re ready.
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-8 py-6 text-white text-center">
            <div className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-2">Monthly Subscription</div>
            <div className="text-5xl font-black mb-1">$297</div>
            <div className="text-indigo-200 font-semibold">per month · cancel anytime</div>
          </div>

          {/* Features */}
          <div className="px-8 py-8">
            <p className="text-slate-600 font-medium text-sm mb-6 text-center">
              Your AI sales employee works 24/7 — scraping leads, writing personalized emails, and booking meetings while you sleep.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Automated lead prospecting via Apollo",
                "Personalized outbound emails — sent from your Gmail",
                "AI-powered reply detection & response",
                "Live campaign dashboard with analytics",
                "Tone of voice & guardrail controls",
                "Cancel anytime from the dashboard"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-semibold text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black shrink-0">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              id="subscribe-btn"
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-8 rounded-2xl shadow-lg transition-all disabled:opacity-60 text-lg"
            >
              {loading ? "Redirecting to Stripe..." : "Start My Subscription →"}
            </button>

            <p className="text-xs text-center text-slate-400 font-medium mt-4">
              Secured by Stripe · 256-bit SSL Encryption
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-slate-400 hover:text-slate-300 text-sm font-semibold transition-colors">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  )
}

export default function SubscribePage() {
  return (
    <Suspense>
      <SubscribeContent />
    </Suspense>
  )
}
