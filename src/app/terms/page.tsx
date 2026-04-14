import Link from "next/link"

export const metadata = {
  title: "Terms of Service | VaultReach",
  description: "VaultReach Terms of Service — the rules and conditions governing your use of the platform.",
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
        <p className="text-slate-500 text-sm mb-10">Last updated: April 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">1. Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            By accessing or using VaultReach (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not access or use the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">2. Description of Service</h2>
          <p className="text-slate-600 leading-relaxed">
            VaultReach is a B2B sales automation platform that allows authorized users to send personalized outreach emails from their connected Google Workspace (Gmail) account to business prospects they identify and configure within the platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">3. Acceptable Use</h2>
          <p className="text-slate-600 leading-relaxed mb-3">You agree to use VaultReach solely for lawful B2B sales outreach purposes. You may NOT use the Service to:</p>
          <ul className="list-disc pl-5 text-slate-600 space-y-2">
            <li>Send unsolicited bulk email to consumers (spam)</li>
            <li>Impersonate any person, business, or entity</li>
            <li>Violate the CAN-SPAM Act, GDPR, CASL, or any applicable anti-spam law</li>
            <li>Send emails containing illegal content, malware, or phishing material</li>
            <li>Use the Service to harass, threaten, or abuse any individual</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-4">
            VaultReach reserves the right to immediately suspend or terminate accounts found in violation of this Acceptable Use Policy without refund.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">4. Subscriptions and Billing</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            VaultReach is offered as a subscription service at $297 per month (or as otherwise displayed at the time of purchase), billed monthly. All payments are processed securely by Stripe.
          </p>
          <ul className="list-disc pl-5 text-slate-600 space-y-2">
            <li>Subscriptions renew automatically on a monthly basis unless canceled.</li>
            <li>You may cancel your subscription at any time from your Account Settings. Cancellation is effective at the end of the current billing period. No partial refunds are issued.</li>
            <li>VaultReach reserves the right to change pricing with 30 days&apos; notice to the email address on file.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">5. Google Account Authorization</h2>
          <p className="text-slate-600 leading-relaxed">
            To use core features, you must connect your Google Workspace (Gmail) account via OAuth. By connecting your account, you grant VaultReach permission to send emails on your behalf using the <code>gmail.send</code> scope. You may revoke this permission at any time from your Account Settings or from <a href="https://myaccount.google.com/permissions" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Account Permissions</a>. VaultReach does not read, store, or process the content of your inbox.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">6. Intellectual Property</h2>
          <p className="text-slate-600 leading-relaxed">
            The VaultReach platform, its software, branding, and all content produced by VaultReach are the exclusive intellectual property of VaultReach and its licensors. You retain ownership of all campaign data, prospect lists, and email content you create within the platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">7. Disclaimer of Warranties</h2>
          <p className="text-slate-600 leading-relaxed">
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. VaultReach does not warrant that the Service will be uninterrupted, error-free, or that email deliverability rates will meet any particular standard. Results from outreach campaigns vary and are not guaranteed.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">8. Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed">
            To the maximum extent permitted by applicable law, VaultReach shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to loss of revenue, loss of data, or damage to reputation. Our total aggregate liability shall not exceed the amount paid by you in the 3 months preceding the claim.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">9. Termination</h2>
          <p className="text-slate-600 leading-relaxed">
            Either party may terminate this agreement at any time. VaultReach may suspend or terminate your account immediately if you violate these Terms. Upon termination, your right to access the Service ceases and your stored OAuth credentials will be permanently deleted.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">10. Governing Law</h2>
          <p className="text-slate-600 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the United States. Any disputes shall be resolved through binding arbitration, except where prohibited by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">11. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            For questions about these Terms, contact us at <a href="mailto:privacy@vaultreach.ai" className="text-indigo-600 hover:underline">privacy@vaultreach.ai</a>.
          </p>
        </section>
      </main>
      <footer className="border-t border-slate-200 px-8 py-6 text-center text-slate-400 text-sm">
        <div className="flex justify-center gap-6 mb-2">
          <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
        </div>
        &copy; 2026 VaultReach. All rights reserved.
      </footer>
    </div>
  )
}
