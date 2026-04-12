"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
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

  useEffect(() => {
    async function refreshAndRedirect() {
      // Step 1 — Show first message immediately
      setStepIndex(0)
      await new Promise(r => setTimeout(r, 900))

      // Step 2 — Force JWT refresh: re-reads stripeSubscriptionId from DB
      await update()
      setStepIndex(1)
      await new Promise(r => setTimeout(r, 900))

      // Step 3 — Wait for Stripe webhook to fire (usually <2s in test mode)
      setStepIndex(2)
      await new Promise(r => setTimeout(r, 1200))

      // Step 4 — Second refresh to catch the webhook update if it was slow
      await update()
      setStepIndex(3)
      await new Promise(r => setTimeout(r, 800))

      // Done — show the button or auto-redirect
      setReady(true)
    }

    refreshAndRedirect()
  }, [update])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md text-center">

        {/* Animated checkmark */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 ${ready ? "bg-emerald-500 scale-110" : "bg-indigo-600 scale-100"}`}>
            <svg
              className={`w-12 h-12 text-white transition-all duration-500 ${ready ? "opacity-100 scale-100" : "opacity-80 scale-90"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {/* Pulse ring */}
          {ready && (
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
          )}
        </div>

        <h1 className="text-white font-black text-3xl mb-2">
          {ready ? "You're all set!" : "Setting up VaultReach..."}
        </h1>
        <p className={`font-semibold mb-10 transition-colors duration-500 ${ready ? "text-emerald-400" : "text-indigo-300"}`}>
          {steps[stepIndex]}
        </p>

        {/* Progress steps */}
        {!ready && (
          <div className="flex justify-center gap-2 mb-10">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= stepIndex ? "bg-indigo-400 w-8" : "bg-slate-700 w-4"
                }`}
              />
            ))}
          </div>
        )}

        {/* CTA — shown when ready */}
        {ready && (
          <div className="space-y-4">
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
