import Link from "next/link"

export const metadata = {
  title: "Privacy Policy | VaultReach",
  description: "VaultReach Privacy Policy — how we collect, use, and protect your data.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center">
        <Link href="/" className="text-xl font-black tracking-tight text-slate-900">VaultReach</Link>
        <Link href="/" className="text-sm font-semibold text-indigo-600 hover:underline">← Back to Home</Link>
      </header>
      <main className="max-w-3xl mx-auto px-8 py-16 prose prose-slate">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: April 11, 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">1. Information We Collect</h2>
          <p className="text-slate-600 leading-relaxed">When you connect your Google account, we collect your name, email address, and Google OAuth access tokens. These tokens are used solely to send outbound emails on your behalf via the Gmail API. We do not collect or store your Gmail inbox content.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">2. How We Use Your Information</h2>
          <p className="text-slate-600 leading-relaxed">We use your information to operate the VaultReach automated outreach service, including identifying and contacting leads that match your Ideal Customer Profile (ICP), and sending personalized emails through your connected Gmail account.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">3. Data Storage & Security</h2>
          <p className="text-slate-600 leading-relaxed">All user data is stored in a secure, encrypted PostgreSQL database hosted on Neon (AWS US East). Access tokens are encrypted at rest. We do not sell or share your data with third parties for advertising purposes.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">4. Google API Scopes</h2>
          <p className="text-slate-600 leading-relaxed">VaultReach requests the following Google API scopes: <code>gmail.send</code> (to send outbound emails on your behalf) and <code>gmail.readonly</code> (to detect incoming replies). We do not access, read, or store your general email content.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">5. Data Deletion</h2>
          <p className="text-slate-600 leading-relaxed">You may request full deletion of your account and all associated data at any time by emailing us at <a href="mailto:support@vaultreach.ai" className="text-indigo-600 hover:underline">support@vaultreach.ai</a>. Upon request, we will permanently delete your account within 30 days.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">6. Contact</h2>
          <p className="text-slate-600 leading-relaxed">For privacy-related questions, contact us at <a href="mailto:support@vaultreach.ai" className="text-indigo-600 hover:underline">support@vaultreach.ai</a>.</p>
        </section>
      </main>
      <footer className="border-t border-slate-200 px-8 py-6 text-center text-slate-400 text-sm">
        © 2026 VaultReach. All rights reserved.
      </footer>
    </div>
  )
}
