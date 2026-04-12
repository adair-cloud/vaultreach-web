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
  // Guard ref — ensures the effect only ever runs once, even if update() changes identity
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    async function activate() {
      // Step 0 — "Confirming your payment..."
      setStepIndex(0)
      await new Promise(r => setTimeout(r, 1500))

      // Force first JWT refresh (picks up stripeSubscriptionId from DB)
      await update()

      // Step 1 — "Activating your AI sales engine..."
      setStepIndex(1)
      await new Promise(r => setTimeout(r, 1500))

      // Step 2 — "Configuring your outbound pipeline..."
      setStepIndex(2)
      await new Promise(r => setTimeout(r, 1500))

      // Second JWT refresh to catch any slow Stripe webhook
      await update()

      // Step 3 — "Your digital employee is ready!" → freeze here and show button
      setStepIndex(3)
      await new Promise(r => setTimeout(r, 800))
      setReady(true)
    }

    activate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md text-center">

        {/* Animated checkmark */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 ${ready ? "bg-emerald-500 scale-110" : "bg-indigo-600 scale-100"}`}>
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {ready && (
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
          )}
        </div>

        <h1 className="text-white font-black text-3xl mb-3">
          {ready ? "You're all set!" : "Setting up VaultReach..."}
        </h1>

        {/* Step message — frozen on the final step once ready */}
        <p className={`font-semibold mb-10 transition-colors duration-500 text-lg ${ready ? "text-emerald-400" : "text-indigo-300"}`}>
          {steps[stepIndex]}
        </p>

        {/* Progress dots — visible only while loading */}
        {!ready && (
          <div className="flex justify-center gap-3 mb-10">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  i === stepIndex
                    ? "bg-indigo-400 w-6 h-2"
                    : i < stepIndex
                    ? "bg-indigo-600 w-2 h-2"
                    : "bg-slate-700 w-2 h-2"
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
              onClick={() => router.push("/dashboard")}
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
