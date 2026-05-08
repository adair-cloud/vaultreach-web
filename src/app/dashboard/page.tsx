"use client"
                />
              </div>
              <div className="p-8">
                {/* Step indicators */}
                <div className="flex items-center gap-1 mb-6">
                  {wizardSteps.map((s, i) => (
                    <div key={s} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${i <= wizardStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                      {i < wizardSteps.length - 1 && <div className={`h-0.5 w-6 ${i < wizardStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
                    </div>
                  ))}
                  <span className="ml-2 text-xs text-slate-400 font-medium">Step {wizardStep + 1} of {wizardSteps.length}</span>
                </div>


                {/* Step 0: Welcome */}
                {wizardStep === 0 && (
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
                      <Zap size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome to VaultReach 👋</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      VaultReach is your autonomous AI sales rep. Once set up, it will find qualified leads, write personalized cold emails, and fill your pipeline — 24 hours a day, 7 days a week, without you lifting a finger.
                    </p>
                    <div className="space-y-3 mb-8">
                      {[
                        { icon: "🔍", text: "Finds 10–15 qualified B2B leads daily using your Apollo.io account" },
                        { icon: "✍️", text: "Writes personalized cold emails using AI trained on your offer" },
                        { icon: "📬", text: "Sends from your own Gmail — no shared infrastructure" },
                        { icon: "📅", text: "Sends Day 3 and Day 7 follow-ups automatically — no manual effort required" },
                      ].map(({ icon, text }) => (
                        <div key={text} className="flex items-start gap-3 text-sm text-slate-700">
                          <span className="text-lg leading-tight">{icon}</span>
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setWizardStep(1)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
                      >
                        Let&apos;s get started →
                      </button>
                      <button onClick={dismissWizard} className="text-slate-400 hover:text-slate-600 text-xs font-medium px-4">Skip</button>
                    </div>
                  </div>
                )}


                {/* Step 1: Apollo Key */}
                {wizardStep === 1 && (
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-200">
                      <KeyRound size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Connect Apollo.io</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">
                      VaultReach uses your free Apollo.io account to find leads. You own your data, your credits never get shared, and it&apos;s completely free to start.
                    </p>
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4 text-xs text-slate-600 space-y-1.5">
                      <p className="font-bold text-slate-800">Get your key in 60 seconds:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Go to <a href="https://app.apollo.io" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">app.apollo.io</a> → sign up free (no card needed)</li>
                        <li>Click your avatar → <strong>Settings</strong> → <strong>Integrations</strong> → <strong>API</strong></li>
                        <li>Click <strong>Create New Key</strong>, name it &quot;VaultReach&quot;, copy it below</li>
                      </ol>
                    </div>
                    <input
                      type="password"
                      value={wizardApolloKey}
                      onChange={e => setWizardApolloKey(e.target.value)}
                      placeholder="Paste your Apollo API key here..."
                      className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono mb-4"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={saveKeyAndAdvance}
