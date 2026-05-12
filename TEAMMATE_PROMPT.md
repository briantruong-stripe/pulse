# Prompt: Build Your Own ATR Feedback Microsite

Copy and paste the following into Claude (claude.ai or Claude Code). Fill in the bracketed sections before sending.

---

## The Prompt

I want to build a two-page feedback microsite for my annual review (ATR) process at Stripe. Here's what I need:

**About me:**
- My name: [YOUR NAME]
- My role: [YOUR ROLE, e.g. Solutions Engineer, Account Executive, CSM]
- My level: [YOUR LEVEL, e.g. L4 SE, L5 AE]

**What to build:**

1. **Public feedback form** (`/`) — A clean, Stripe-themed page where teammates can submit quick, non-anonymous feedback about me. Fields:
   - Their name (required)
   - Their role (optional)
   - Meeting or context (optional)
   - Salesforce opportunity link (optional text field)
   - "What worked well" textarea (required)
   - "What could be sharper" textarea (required)
   - Transparency note: not anonymous, goes to me and my leadership
   - On success: show a thank-you state with an option to submit another

2. **Leadership dashboard** (`/dashboard`) — A Stripe-themed dashboard (dark blue background, ~#3D6499) for my manager and me to review feedback. It should include:
   - Header with response count, unique submitters, and days since first response
   - **Operating principles buckets**: Animated coin-drop visualization mapping feedback to Stripe's 6 operating principles (Users first; Create with craft and beauty; Move with urgency and focus; Collaborate egolessly; Obsess over talent; Stay curious). Each bucket shows a fill level and feedback snippets.
   - **[YOUR LADDER NAME] section**: A 3-column grid mapping feedback to my career ladder's key competency areas. My ladder theme is "[YOUR LADDER THEME, e.g. Deploying Expertise]" with three buckets:
     - **[BUCKET 1 NAME]** ([BUCKET 1 SUBTITLE]): [2-3 bullet points describing what belongs here]
     - **[BUCKET 2 NAME]** ([BUCKET 2 SUBTITLE]): [2-3 bullet points]
     - **[BUCKET 3 NAME]** ([BUCKET 3 SUBTITLE]): [2-3 bullet points]
   - **Full feedback feed**: All submissions in reverse-chronological order with name, role, context, and both feedback fields visible
   - No login gate (share the URL privately with your manager)

**Tech stack:**
- Node.js + Express backend
- Hosted on Vercel (free tier) via a GitHub repo
- Storage: Google Sheets as the primary database (so data persists across Vercel deployments), local JSON file as fallback for local dev
- Optional: Salesforce integration to pull open opportunities into a dropdown on the form and show a pipeline report on the dashboard

**Design:**
- Stripe color palette: blurple (#635BFF), dark blue background, white text, green/amber accent colors
- Logo: Purple gradient square with a white initial letter
- Responsive (works on mobile)
- Smooth animations for the coin-drop buckets

**Deployment:**
- Include a `vercel.json` configured for `@vercel/node`
- Include a `.env.example` with all environment variables documented
- Include a `.gitignore` that excludes `.env`, `node_modules/`, and the local data file
- Include a `package.json` with all dependencies

Please build the complete working app. Start with the file structure, then implement `server.js`, then `public/index.html` (the form), then `public/dashboard.html` (the dashboard). After building, give me step-by-step instructions for:
1. Pushing to a new GitHub repo
2. Deploying to Vercel
3. Setting up Google Sheets as the storage backend

---

## Tips for customizing

- **Ladder buckets**: The more specific your keywords, the better the dashboard's feedback categorization. Describe your ladder areas in concrete behavioral terms.
- **Name placeholder**: Change "John Collison" in the form to someone relevant at your company for a nice touch.
- **Sample data**: After building, ask Claude to "seed sample feedback data" so you can screenshot the dashboard before real responses come in.
- **Remove SFDC**: If you don't use Salesforce, tell Claude to remove all SFDC-related fields and routes.
- **Auth**: If you want a simple password gate on the dashboard, ask Claude to add a `DASHBOARD_KEY` env var and a login screen.
