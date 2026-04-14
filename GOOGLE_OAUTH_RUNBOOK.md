# VaultReach — Google OAuth Trust & Safety Review Runbook
**Scope Under Review:** `https://www.googleapis.com/auth/gmail.send`
**App Type:** B2B SaaS Sales Development Representative (SDR) Automation Platform
**Review Type:** Restricted Scope — Manual Review (Google Trust & Safety)

---

## Table of Contents
1. [Pre-Recording Checklist](#1-pre-recording-checklist)
2. [Screen Recording Walkthrough — Click-by-Click](#2-screen-recording-walkthrough)
3. [Word-for-Word Voiceover Script](#3-word-for-word-voiceover-script)
4. [Privacy Policy — Required Layout & Content](#4-privacy-policy-required-layout--content)
5. [OAuth Consent Screen Configuration](#5-oauth-consent-screen-configuration)
6. [Submission Checklist](#6-submission-checklist)

---

## 1. Pre-Recording Checklist

Complete every item before hitting Record.

- [ ] App is deployed and accessible at the production URL (e.g. `https://app.vaultreach.io`)
- [ ] OAuth consent screen is in **Testing** mode with your own Google account added as a test user
- [ ] Privacy Policy is live at `https://app.vaultreach.io/privacy` (public, no login required)
- [ ] Terms of Service is live at `https://app.vaultreach.io/terms`
- [ ] Your Client ID is visible at **GCP Console → APIs & Services → Credentials** — keep this tab open
- [ ] Screen recorder is set to 1080p minimum (Loom, QuickTime, or OBS)
- [ ] Microphone is tested — no background noise
- [ ] Browser zoom is set to **100%** — reviewers must read every UI element
- [ ] You are logged in as a **real Gmail account** (not a test alias)
- [ ] A sample campaign with at least one lead exists in the VaultReach dashboard

---

## 2. Screen Recording Walkthrough — Click-by-Click

> Record continuously. Do not cut or edit the video. The reviewer must see one unbroken flow. Approximate runtime: **5–8 minutes.**

---

### SEGMENT 1 — Show the Client ID in the GCP Console (0:00–0:45)

| Step | Action | What reviewer sees |
|------|--------|--------------------|
| 1 | Open Chrome. Navigate to `https://console.cloud.google.com` | GCP Console homepage |
| 2 | Click **"APIs & Services"** in the left sidebar | APIs & Services menu |
| 3 | Click **"Credentials"** | Credentials list page |
| 4 | **Hover** over the OAuth 2.0 Client ID entry named `VaultReach Web Client` | Client ID name highlighted |
| 5 | **Click** on the pencil/edit icon for that credential | Client ID detail page opens |
| 6 | **Pause 3 seconds** — the **Client ID** (`xxxxxxxx.apps.googleusercontent.com`) must be fully visible in the URL bar AND in the "Client ID" field on screen | Reviewer can verify Client ID matches the one registered in the app |
| 7 | Slowly scroll down to show **Authorized JavaScript Origins** and **Authorized Redirect URIs** — confirm they match your production domain | Exact domain shown |

> **Voiceover cue:** Begin Script §1 here.

---

### SEGMENT 2 — Show the OAuth Consent Screen Configuration (0:45–1:30)

| Step | Action | What reviewer sees |
|------|--------|--------------------|
| 8 | In left sidebar, click **"OAuth consent screen"** | Consent screen settings |
| 9 | Show **App name** (`VaultReach`), **User support email**, and **Developer contact email** clearly | Basic identity confirmed |
| 10 | Scroll to **Scopes** section — confirm `gmail.send` is the ONLY sensitive scope listed | Minimal scope posture |
| 11 | Scroll to **Test users** — show at least one test user email | Testing posture visible |
| 12 | Click **"Edit App"** and show the **Privacy Policy URL** and **Terms of Service URL** fields are populated | Policy links confirmed |

> **Voiceover cue:** Begin Script §2 here.

---

### SEGMENT 3 — Live Sign-In & OAuth Consent Flow (1:30–3:00)

| Step | Action | What reviewer sees |
|------|--------|--------------------|
| 13 | Open a new Incognito window | Fresh unauthenticated session |
| 14 | Navigate to `https://app.vaultreach.io` | VaultReach landing / login page |
| 15 | Click **"Sign in with Google"** | Google sign-in dialog |
| 16 | Complete Gmail login for the test account | Google account picker |
| 17 | The OAuth consent screen appears — **pause 3 seconds** | Reviewer reads the consent screen. It must show: app name, logo, the single `gmail.send` scope, and a link to Privacy Policy |
| 18 | Click **"Allow"** | App receives token, user redirected to dashboard |
| 19 | Show the URL bar — it must be on the authenticated dashboard (no raw `?code=` parameters visible) | Successful auth confirmed |

> **Voiceover cue:** Begin Script §3 here.

---

### SEGMENT 4 — Show How `gmail.send` Is Used (3:00–5:30)

| Step | Action | What reviewer sees |
|------|--------|--------------------|
| 20 | From the dashboard, click **"Campaigns"** in the left nav | Campaign list |
| 21 | Click into an existing campaign (e.g. "Q2 SaaS Outreach") | Campaign detail view |
| 22 | Click **"New Sequence Step"** or open an existing email step | Email composer |
| 23 | Show the **To**, **Subject**, and **Body** fields populated with a real B2B prospect's name and company | Reviewer sees exactly who receives email |
| 24 | Click **"Send Test Email"** — a test email fires to the logged-in Gmail account | Actual send event demonstrated live |
| 25 | Open **Gmail in another tab** — show the sent email in the **Sent folder** with correct sender (`via VaultReach`) | End-to-end send confirmed |
| 26 | Return to dashboard. Click **"Activity Log"** or equivalent | Log showing `email_sent` event for that lead |
| 27 | **Pause 3 seconds** on the log — reviewer reads: sender, recipient, timestamp, campaign name | Audit trail visible |
| 28 | Navigate to **Account Settings → Connected Accounts** | Shows Gmail account connected |
| 29 | Click **"Disconnect Gmail"** — show the revoke flow | Demonstrates user can revoke at any time |
| 30 | Navigate to `https://app.vaultreach.io/privacy` in the same session | Privacy Policy page loads |

> **Voiceover cue:** Begin Script §4 here.

---

### SEGMENT 5 — Privacy Policy Walkthrough (5:30–7:00)

| Step | Action | What reviewer sees |
|------|--------|--------------------|
| 31 | Slowly scroll through the Privacy Policy top-to-bottom without pausing | Full document visible |
| 32 | Pause on **Section: "Gmail Data"** or **"Google API Services"** | Specific Gmail use disclosed |
| 33 | Pause on **Section: "Data Retention"** | Retention window disclosed |
| 34 | Pause on **Section: "User Rights / Revoke Access"** | Revocation instructions visible |
| 35 | End recording — stop screen capture | Done |

> **Voiceover cue:** Begin Script §5 here.

---

## 3. Word-for-Word Voiceover Script

> Read slowly and clearly. Do not ad-lib. Every claim must match what is visible on screen.

---

### §1 — Client ID / GCP Console

> *(Play during Segment 1, Steps 1–7)*

"Hello, Google Trust & Safety team. My name is [YOUR NAME] and I'm the developer of VaultReach, a B2B sales outreach platform. I'm going to walk you through exactly how our application uses the `gmail.send` OAuth scope.

You're looking at our Google Cloud Console Credentials page. The OAuth 2.0 Client ID for our web application is visible here — [READ THE FULL CLIENT ID ALOUD]. This is the same Client ID registered in our OAuth consent screen. You can verify it matches the one on file in this review request.

The Authorized JavaScript Origins point exclusively to our production domain, `app.vaultreach.io`. We do not have any wildcard domains, localhost entries in production, or any secondary redirect URIs beyond those shown. This tight domain lock is intentional — it limits the credential to our production environment only."

---

### §2 — OAuth Consent Screen

> *(Play during Segment 2, Steps 8–12)*

"Now I'll show you our OAuth consent screen configuration. The app name is VaultReach. Our user support contact and developer contact are both visible here. We are currently in Testing mode while this review is pending.

Under Scopes, you will see that we have requested exactly one sensitive scope: `https://www.googleapis.com/auth/gmail.send`. We have not requested `gmail.readonly`, `mail.google.com`, or any broader Gmail scope. We will never request access to read, modify, delete, or label a user's email. Our application sends email — and only sends email — on behalf of the authenticated user.

Our Privacy Policy URL and Terms of Service URL are linked here and are publicly accessible without any login."

---

### §3 — Live OAuth Consent Flow

> *(Play during Segment 3, Steps 13–19)*

"I'm now going to demonstrate the actual sign-in experience in a fresh Incognito window to simulate a first-time user.

After the user clicks 'Sign in with Google' and selects their account, they are presented with this OAuth consent screen. It shows the VaultReach application name and logo, and it clearly states the specific permission being requested: the ability to send email on the user's behalf. Nothing more.

The user clicks 'Allow.' The application receives an OAuth access token. The user is immediately redirected to the VaultReach dashboard. We do not log, store, or expose the raw OAuth tokens in any client-side state. They are exchanged server-side and stored encrypted in our database."

---

### §4 — How `gmail.send` Is Used

> *(Play during Segment 4, Steps 20–30)*

"Now I'll show you exactly how VaultReach uses the `gmail.send` permission.

VaultReach is a B2B outreach tool. Our customers are sales teams. They create campaigns targeting business prospects — companies like software vendors, consultancies, and enterprise buyers. They are never used to send consumer spam. Every campaign requires the user to explicitly define: the recipients (business contacts), the email subject, and the email body.

Here I am opening a campaign called 'Q2 SaaS Outreach.' I'm opening an email sequence step and showing you the composed message. I'll now click 'Send Test Email.'

As you can see, the email has arrived in our Gmail Sent folder. The sender is the authenticated Gmail user — VaultReach does not spoof the sender address. The email originated from the user's own Gmail account via the Gmail API. We do not use our own SMTP relay; the send call goes exclusively through the `gmail.users.messages.send` API endpoint using the user's access token.

Our activity log shows a full audit trail: sender, recipient email, campaign, and timestamp. Users can view this log at any time.

Finally, I'll show you that users retain full control. In Account Settings, they can disconnect their Gmail account at any time. When they click 'Disconnect,' we delete the stored access and refresh tokens from our system and the Google account's third-party access is revoked. The user is never locked in."

---

### §5 — Privacy Policy

> *(Play during Segment 5, Steps 31–35)*

"I'll now scroll through our full Privacy Policy, which is publicly accessible at `app.vaultreach.io/privacy` with no login required.

You'll see a dedicated section titled 'Gmail Data and Google API Services' which specifically discloses that we use the `gmail.send` scope solely to send emails authored by the user within the VaultReach platform. We state explicitly that we do not read, store, index, or share the content of users' email messages or inbox data. Our use of Gmail data is limited to the minimum required to deliver the send functionality.

Our Data Retention section discloses how long we retain metadata such as send timestamps and campaign logs.

Our User Rights section explains how users can revoke Google API access, request data deletion, and contact us for any privacy concerns.

This concludes our walkthrough. Thank you for your review."

---

## 4. Privacy Policy — Required Layout & Content

> **Critical:** The policy must be live at a public URL with no authentication wall. Google reviewers will visit it directly.

Host it at: `https://app.vaultreach.io/privacy`

---

### Required Sections (in order)

#### 4.1 Introduction
```
Last updated: [DATE]

VaultReach ("we," "our," or "us") is a B2B sales outreach platform. This Privacy Policy 
explains how we collect, use, and protect information when you use our services, including 
our integration with Google Workspace APIs.
```

#### 4.2 Information We Collect
- Account information (name, email address, company)
- Campaign data (prospect names, email addresses, message templates authored by you)
- Email send metadata (send timestamp, recipient, campaign name, open/click events)
- OAuth tokens (encrypted, used solely to authenticate Gmail API calls)

#### 4.3 Gmail Data and Google API Services ⬅️ **REQUIRED — must use this heading**

```
VaultReach's use of Google APIs, including the Gmail API (gmail.send scope), is limited to 
sending emails that you explicitly compose and approve within the VaultReach platform, on 
your behalf, from your own Gmail account.

We do not read, store, index, scan, share, or sell the contents of your Gmail inbox or any 
received emails. We do not access your Gmail drafts, labels, contacts, or any data beyond 
what is required to execute the send action you initiate.

Our use and transfer of information received from Google APIs to any other app will adhere 
to the Google API Services User Data Policy, including the Limited Use requirements.
```

> **⚠️ The sentence about "Google API Services User Data Policy" and "Limited Use requirements" is mandatory verbatim language. Do not paraphrase it.**

#### 4.4 How We Use Your Information
- To operate and improve the VaultReach platform
- To send emails on your behalf when you initiate a send action
- To display campaign analytics (open rates, reply rates) to you
- We do not sell, rent, or share your data with third parties for marketing

#### 4.5 Data Retention
```
We retain email send logs (sender, recipient, timestamp, campaign ID) for [X] months to 
provide campaign analytics. OAuth access tokens are stored encrypted and are deleted 
immediately upon account disconnection or account deletion. We do not retain the content 
of any sent emails beyond what Gmail's own Sent folder retains.
```

#### 4.6 Data Security
- All data transmitted over HTTPS/TLS
- OAuth tokens stored encrypted at rest (AES-256 or equivalent)
- Access limited to authenticated employees on a need-to-know basis
- Annual security reviews

#### 4.7 User Rights and Google API Revocation ⬅️ **REQUIRED — must have explicit revocation instructions**

```
You may revoke VaultReach's access to your Google account at any time by:

1. Visiting Account Settings → Connected Accounts within VaultReach and clicking 
   "Disconnect Gmail," OR
2. Visiting https://myaccount.google.com/permissions and removing VaultReach from 
   the list of third-party apps.

Upon revocation, we will delete your stored OAuth tokens within 24 hours. Revoking 
access will disable email sending features but will not delete your VaultReach account 
or campaign data unless you separately request account deletion.

To request full data deletion, email: privacy@vaultreach.io
```

#### 4.8 Children's Privacy
```
VaultReach is intended for business use only. We do not knowingly collect information 
from individuals under the age of 18.
```

#### 4.9 Changes to This Policy
```
We will notify users of material changes via email or in-app notification at least 
30 days before the change takes effect.
```

#### 4.10 Contact
```
VaultReach
[Legal Business Name]
[Business Address]
Email: privacy@vaultreach.io
```

---

## 5. OAuth Consent Screen Configuration

Required fields in GCP Console → APIs & Services → OAuth consent screen:

| Field | Required Value |
|-------|---------------|
| App name | `VaultReach` |
| User support email | A mailbox you monitor (not noreply@) |
| App logo | 120×120px PNG, shows VaultReach brand |
| Application home page | `https://app.vaultreach.io` |
| Application privacy policy link | `https://app.vaultreach.io/privacy` |
| Application terms of service link | `https://app.vaultreach.io/terms` |
| Authorized domains | `vaultreach.io` |
| Developer contact email | Your real address |
| Scopes | `gmail.send` ONLY |
| User type | External |
| Publishing status | Testing (until approved, then Production) |

**Do not add any scope that is not needed.** Requesting `email` and `profile` (OpenID scopes) is acceptable and does not require verification. Any scope beyond `gmail.send` will require a separate justification.

---

## 6. Submission Checklist

Complete before submitting the verification request at [Google API Verification](https://support.google.com/cloud/answer/9110914).

### Required Artifacts to Submit
- [ ] **Video walkthrough** — unlisted YouTube link or Google Drive link (not an attachment)
- [ ] **Privacy Policy URL** — must be live and publicly accessible
- [ ] **Homepage URL** — must be live and branded
- [ ] **Written justification** (see template below)

### Written Justification Template

Paste this into the "Explain your use of this scope" field verbatim (customize bracketed fields):

```
VaultReach is a B2B sales automation platform used exclusively by sales teams at 
companies to conduct outreach to business prospects. Our users are sales development 
representatives, account executives, and founders.

We request the gmail.send scope for one specific purpose: to send individual, 
personalized sales emails authored by the user, from the user's own Gmail account, 
to business contacts they have identified in our campaign builder.

We do NOT use this scope to:
- Read, scan, or store the user's inbox
- Send any email without explicit user initiation or campaign approval
- Access any Gmail data beyond the send action
- Create, delete, or modify Gmail labels, threads, or drafts

Each send event is logged in our system with: sender, recipient, timestamp, and 
campaign name. Users can view this log and revoke access at any time from Account 
Settings. Token revocation deletes all stored credentials from our system immediately.

Our use of Gmail data complies fully with the Google API Services User Data Policy 
and the Limited Use requirements set forth therein.

Demo video: [YOUR UNLISTED YOUTUBE OR DRIVE LINK]
Privacy Policy: https://app.vaultreach.io/privacy
```

---

### Post-Approval Steps
1. Change OAuth consent screen publishing status from **Testing** to **In Production**
2. Remove test users (no longer needed once published)
3. Monitor [GCP API Dashboard](https://console.cloud.google.com/apis/dashboard) for any quota anomalies
4. Set a calendar reminder to review the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy) annually

---

*Runbook version: 1.0 | April 2026 | VaultReach Engineering*
