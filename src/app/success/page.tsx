"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

const steps = [
  "Confirming your payment...",
  "Activating your AI sales engine...",
  "Configuring your outbound pipeline...",
  "Your digital employee is ready!",
]

export default function SuccessPage() {
  const { update } = useSession()
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    async function activate() {
      // Step 0 — Confirming payment
      setStepIndex(0)
      await new Promise(r => setTimeout(r, 1200))

      // Directly verify payment with Stripe API and write to DB
      // This bypasses webhook timing entirely
      const res = await fetch("/api/stripe/activate", { method: "POST" })
      const data = await res.json()

      if (!data.activated) {
        // Subscription not found yet — wait 2s and try once more
        await new Promise(r => setTimeout(r, 2000))
        const retry = await fetch("/api/stripe/activate", { method: "POST" })
        const retryData = await retry.json()
        if (!retryData.activated) {
          setError(true)
          return
        }
      }

      // Step 1 — Activating engine
      setStepIndex(1)
      await new Promise(r => setTimeout(r, 1200))

      // Force JWT refresh — now that DB has stripeSubscriptionId, the token will pick it up
      await update()

      // Step 2 — Configuring pipeline
      setStepIndex(2)
      await new Promise(r => setTimeout(r, 1200))

      // Second JWT refresh for certainty
      await update()

      // Step 3 — Done
      setStepIndex(3)
      await new Promise(r => setTimeout(r, 800))
      setReady(true)
    }

    activate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-white font-black text-2xl mb-3">Payment Processing</h1>
          <p className="text-slate-300 font-medium mb-8">
            Your payment was received but we&apos;re still confirming your subscription. Please wait a moment and try again.
          </p>
          <button
            onClick={() => { hasRun.current = false; setError(false); setStepIndex(0) }}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all mb-3"
          >
            Try Again
          </button>
          <a href="mailto:support@vaultreach.ai" className="text-slate-400 text-sm hover:text-slate-300 transition-colors">
            Contact support if this persists
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md text-center">

        {/* Animated checkmark */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 ${ready ? "bg-emerald-500 scale-110" : "bg-indigo-600 scale-100"}`}>
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {ready && <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />}
        </div>

        <h1 className="text-white font-black text-3xl mb-3">
          {ready ? "You're all set!" : "Setting up VaultReach..."}
        </h1>

        <p className={`font-semibold mb-10 text-lg transition-colors duration-500 ${ready ? "text-emerald-400" : "text-indigo-300"}`}>
          {steps[stepIndex]}
        </p>

        {/* Progress dots — visible only while loading */}
        {!ready && (
          <div className="flex justify-center gap-3 mb-10">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  i === stepIndex ? "bg-indigo-400 w-6 h-2" : i < stepIndex ? "bg-indigo-600 w-2 h-2" : "bg-slate-700 w-2 h-2"
                }`}
              />
            ))}
          </div>
        )}

        {/* CTA — only shown when fully ready */}
        {ready && (
          <div className="space-y-4 mt-4">
            <button
              id="go-to-dashboard-btn"
              onClick={() => window.location.href = "/dashboard"}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-indigo-900/50 transition-all text-lg"
            >
              Launch My Dashboard →
            </button>
            <p className="text-slate-400 text-sm font-medium">
              Your AI sales engine is active and ready to start prospecting.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
