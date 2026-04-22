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
        <p className="text-slate-500 text-sm mb-10">Last updated: April 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">1. Information We Collect</h2>
          <p className="text-slate-600 leading-relaxed">
            VaultReach (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is a B2B sales outreach platform. When you connect your Google account, we collect your name, email address, and Google OAuth access tokens. These tokens are used solely to authenticate Gmail API calls. We also collect campaign data such as prospect names and message templates authored by you, along with send metadata (timestamps).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">2. Gmail Data and Google API Services</h2>
          <p className="text-slate-600 leading-relaxed mt-4">
            VaultReach&apos;s use of Google APIs, including the Gmail API (<code>gmail.send</code> scope), is limited to sending emails that you explicitly compose and approve within the VaultReach platform, on your behalf, from your own Gmail account.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            We do not read, store, index, scan, share, or sell the contents of your Gmail inbox or any received emails. We do not access your Gmail drafts, labels, contacts, or any data beyond what is required to execute the send action you initiate.
          </p>
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-md">
            <p className="text-indigo-900 text-sm font-medium leading-relaxed">
              Our use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy, including the Limited Use requirements.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">3. How We Use Your Information</h2>
          <p className="text-slate-600 leading-relaxed">
            We use your information to operate the VaultReach platform, send emails on your behalf when you initiate a send action, and display campaign analytics. We do not sell, rent, or share your data with third parties for marketing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">4. Data Protection Mechanisms & Security</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            We implement comprehensive data protection mechanisms and security practices to safeguard your sensitive data, including Google OAuth tokens and campaign information:
          </p>
          <ul className="list-disc pl-5 text-slate-600 space-y-2">
            <li><strong>Encryption in Transit:</strong> All data transmitted between your browser, our servers, and Google APIs is encrypted using industry-standard HTTPS/TLS protocols.</li>
            <li><strong>Encryption at Rest:</strong> Sensitive data, specifically OAuth access and refresh tokens, are stored securely using AES-256 encryption at rest in our database.</li>
            <li><strong>Strict Access Controls:</strong> Access to infrastructure and databases containing sensitive user data is strictly limited to authorized engineering personnel on a need-to-know basis and secured with multi-factor authentication.</li>
            <li><strong>Organizational Security:</strong> We enforce secure coding practices and conduct regular internal security reviews to prevent unauthorized access, disclosure, or modification of your data.</li>
            <li><strong>Data Isolation:</strong> We do not store the content of your received emails. We only retain essential metadata (sender, recipient, timestamp) necessary to provide campaign analytics.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">5. User Rights and Google API Revocation</h2>
          <p className="text-slate-600 leading-relaxed mb-3">You may revoke VaultReach&apos;s access to your Google account at any time by:</p>
          <ol className="list-decimal pl-5 text-slate-600 space-y-2 mb-3">
            <li>Visiting Account Settings → Connected Accounts within VaultReach and clicking &quot;Disconnect Gmail&quot;, OR</li>
            <li>Visiting <a href="https://myaccount.google.com/permissions" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">https://myaccount.google.com/permissions</a> and removing VaultReach.</li>
          </ol>
          <p className="text-slate-600 leading-relaxed">
            Upon revocation, we will delete your stored OAuth tokens within 24 hours. To request full data deletion, email: <a href="mailto:privacy@vaultreach.ai" className="text-indigo-600 hover:underline">privacy@vaultreach.ai</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">6. Contact</h2>
          <p className="text-slate-600 leading-relaxed">For privacy-related questions or data deletion requests, contact us at <a href="mailto:privacy@vaultreach.ai" className="text-indigo-600 hover:underline">privacy@vaultreach.ai</a>.</p>
        </section>
      </main>
      <footer className="border-t border-slate-200 px-8 py-6 text-center text-slate-400 text-sm">
        © 2026 VaultReach. All rights reserved.
      </footer>
    </div>
  )
}
