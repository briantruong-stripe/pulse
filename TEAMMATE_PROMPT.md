# Build Your Own ATR Feedback Microsite

Paste the prompt below into Claude (claude.ai, Claude Code, or go/kai). Fill in the **[bracketed]** parts before sending — that's all you need to do.

---

## The Prompt

I want to build a two-page feedback microsite for my annual review (ATR) process at Stripe. Build the complete working app, then give me step-by-step deployment instructions.

**About me:**
- Name: [YOUR NAME]
- Role: [YOUR ROLE — e.g. Solutions Engineer, Account Executive, CSM, EM]
- Level: [YOUR LEVEL — e.g. L4 SE, L5 AE, L6 CSM]

---

### Page 1 — Public feedback form (`/`)

A clean, Stripe-themed page teammates can open from any link I send them.

Fields:
- Their name (required)
- Their role (optional, placeholder: "AE, CSM, Partner...")
- Meeting or context (optional, placeholder: "e.g. Acme Corp demo, QBR prep call...")
- Salesforce opportunity URL (optional text field — they can paste a link directly)
- "What worked well" — textarea, required, placeholder: "What should [MY NAME] keep doing? Please be specific."
- "What could be sharper" — textarea, required, placeholder: "What's one area of potential improvement?"
- A note at the bottom: "Not anonymous. Your name is attached to this feedback. It goes directly to [MY NAME] and their leadership — not to the broader team."
- Submit button shows a thank-you state with option to submit another response

---

### Page 2 — Leadership dashboard (`/dashboard`)

A Stripe-themed dashboard for my manager and me. No login gate — I'll share the URL directly.

**Header stats:** total response count · unique submitters · time since first response

**Section 1 — Stripe Operating Principles**
Animated coin-drop buckets — one per principle. Each bucket fills based on how much feedback maps to it (keyword analysis), shows a fill-level bar, and surfaces 1–2 direct quotes. Feedback can match multiple buckets simultaneously.

The 6 principles and their keywords:
- **Users first** — user, customer, merchant, pain point, empathy, listening, needs, outcome
- **Create with craft and beauty** — quality, polish, clear, concise, structured, thoughtful, presentation, detail, well-prepared
- **Move with urgency and focus** — fast, responsive, proactive, timely, priorit, focus, decisive, action, momentum
- **Collaborate egolessly** — collaborate, team, partner, align, support, humble, credit, listen, inclusive, cross-functional
- **Obsess over talent** — mentor, coach, hire, develop, interview, grow, feedback, elevate, talent
- **Stay curious** — learn, curious, research, experiment, insight, question, explore, study, adapt

**Section 2 — [YOUR LADDER SECTION TITLE]**
A 3-column grid mapping feedback to my career ladder. The broad theme is "[YOUR LADDER THEME]" and the three buckets are:

- **[BUCKET 1 NAME]** — subtitle: "[BUCKET 1 SUBTITLE]"
  Keywords / behaviors: [describe in plain language what this bucket covers — e.g. "critical thinking, scoping problems, building business cases, ROI models, anticipating risks"]

- **[BUCKET 2 NAME]** — subtitle: "[BUCKET 2 SUBTITLE]"
  Keywords / behaviors: [e.g. "collaboration, mentorship, cross-functional alignment, being a force multiplier, stakeholder relationships"]

- **[BUCKET 3 NAME]** — subtitle: "[BUCKET 3 SUBTITLE]"
  Keywords / behaviors: [e.g. "ownership, Salesforce hygiene, product feedback, company building, acting in Stripe's best interest"]

Each bucket shows a signal-strength bar (based on % of feedback that mentions relevant keywords) and 1–2 direct quotes.

**Section 3 — Full feedback feed**
All submissions in reverse-chronological order. Each entry shows: name, role, context, date, green "what worked well" block, amber "what could be sharper" block. If a Salesforce URL was submitted, show a link.

---

### Tech stack

- **Backend:** Node.js + Express, `server.js` at root, `module.exports = app` for Vercel compatibility
- **Frontend:** Two plain HTML files in `public/` — no framework, no build step
- **Storage priority:** Supabase (if env vars set) → local JSON fallback for dev. Use `/tmp/feedback.json` on Vercel since its filesystem is read-only.
- **Supabase table schema:**
  ```sql
  create table feedback (
    id uuid primary key,
    timestamp timestamptz,
    name text, role text, context text,
    sfdc_url text,
    done_well text, could_be_better text
  );
  ```
- **Hosting:** Vercel via GitHub, using `@vercel/node` builder

**vercel.json:**
```json
{ "version": 2, "builds": [{ "src": "server.js", "use": "@vercel/node" }], "routes": [{ "src": "/(.*)", "dest": "/server.js" }] }
```

**package.json dependencies:** `express`, `@supabase/supabase-js`

**.gitignore** must exclude: `node_modules/`, `.env`, `data/`

**.env.example** should document:
```
PORT=3000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
```

---

### Design

- Background: `#3D6499` (Stripe dark blue), surfaces slightly lighter
- Accent: `#635BFF` (Stripe blurple), white text, `#3ECF8E` green, `#F5A623` amber
- Logo: rounded square with linear-gradient(135deg, #7C72FF, #4338CA) background, white bold initial letter "[FIRST INITIAL]"
- Favicon: inline SVG data URI — blurple rounded square with a white parallelogram shape centered inside
- Responsive layout, works on mobile
- Coin-drop animation: coins fall into buckets with a CSS keyframe animation, staggered per entry

---

### After building

1. Walk me through creating a GitHub repo and pushing the code
2. Walk me through deploying to Vercel (personal account — avoid team accounts to prevent SSO protection issues)
3. Walk me through creating the Supabase project, running the table SQL, and adding the env vars to Vercel
4. Seed 6–8 realistic sample feedback entries so I can screenshot the dashboard before real responses arrive

---

## Tips before you send this

**The most important thing to fill in is the ladder section.** The more specific your bucket descriptions, the better the keyword mapping. Use behavioral language from your actual ladder doc — copy-paste bullet points directly if you have them.

**If you don't use Salesforce:** remove the `sfdc_url` field from the form and schema — tell Claude to skip all SFDC-related code.

**If you want a password on the dashboard:** add "protect the dashboard with a `DASHBOARD_KEY` env var and a simple login screen" to the prompt.

**After it's built**, useful follow-up prompts:
- *"Make the dashboard background slightly lighter"*
- *"Add a field for [X] to the form"*
- *"Change the ladder bucket colors"*
- *"Map feedback to multiple ladder buckets simultaneously, not just the top match"*
- *"Delete the sample data and clear feedback.json"*
