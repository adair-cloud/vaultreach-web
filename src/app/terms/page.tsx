import Link from "next/link"

export const metadata = {
  title: "Terms of Service | VaultReach",
  description: "VaultReach Terms of Service — the rules that govern use of our platform.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center">
        <Link href="/" className="text-xl font-black tracking-tight text-slate-900">VaultReach</Link>
        <Link href="/" className="text-sm font-semibold text-indigo-600 hover:underline">← Back to Home</Link>
      </header>
      <main className="max-w-3xl mx-auto px-8 py-16 prose prose-slate">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: April 11, 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">1. Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed">By accessing or using VaultReach (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">2. Description of Service</h2>
          <p className="text-slate-600 leading-relaxed">VaultReach is an AI-powered automated sales development platform that connects to your Google Workspace account to send personalized outreach emails to prospective customers on your behalf.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">3. User Responsibilities</h2>
          <p className="text-slate-600 leading-relaxed">You are solely responsible for the content of emails sent through VaultReach and ensuring your outreach complies with all applicable laws, including CAN-SPAM, GDPR, and CASL where applicable. You must not use VaultReach to send spam, harass individuals, or engage in deceptive practices.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">4. Subscription & Billing</h2>
          <p className="text-slate-600 leading-relaxed">VaultReach is offered on a monthly subscription basis. Subscriptions auto-renew monthly. You may cancel at any time; cancellation takes effect at the end of your current billing period. No refunds are issued for partial months.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">5. Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed">VaultReach is not liable for any outcomes resulting from emails sent through the platform, including but not limited to lost business, spam complaints, or account suspensions. The Service is provided &quot;as is&quot; without warranty of any kind.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">6. Termination</h2>
          <p className="text-slate-600 leading-relaxed">We reserve the right to suspend or terminate your account at any time for violations of these Terms. You may cancel your account at any time from within the dashboard.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">7. Contact</h2>
          <p className="text-slate-600 leading-relaxed">Questions about these Terms? Contact us at <a href="mailto:support@vaultreach.ai" className="text-indigo-600 hover:underline">support@vaultreach.ai</a>.</p>
        </section>
      </main>
      <footer className="border-t border-slate-200 px-8 py-6 text-center text-slate-400 text-sm">
        © 2026 VaultReach. All rights reserved.
      </footer>
    </div>
  )
}
