# ATR Feedback Microsite — go/kai Prompt

Paste everything between the `---` lines into go/kai. Replace the **[CAPS]** placeholders with your info — that's the only thing you need to change.

---

Build me a two-page web app I can use to collect peer feedback for my annual review (ATR) at Stripe. I'll share the link with teammates to fill out, and share a separate dashboard link with my manager.

**About me:**
- Name: [YOUR FULL NAME]
- Role: [YOUR ROLE — e.g. Account Executive, Solutions Engineer, CSM]
- Level: [YOUR LEVEL — e.g. L4, L5]

**My career ladder has three focus areas under the theme "[YOUR LADDER THEME — e.g. Deploying Expertise]":**

1. **[BUCKET 1 NAME]** ([BUCKET 1 SUBTITLE — e.g. Critical Thinking & Getting Things Done])
   What this covers: [DESCRIBE IN PLAIN ENGLISH — e.g. "problem scoping, business cases, ROI models, anticipating risks, being decisive, prioritizing well"]

2. **[BUCKET 2 NAME]** ([BUCKET 2 SUBTITLE — e.g. Working with Others])
   What this covers: [e.g. "collaboration, mentorship, cross-functional alignment, being a trusted advisor, making others better"]

3. **[BUCKET 3 NAME]** ([BUCKET 3 SUBTITLE — e.g. Company Building & Acting Like an Owner])
   What this covers: [e.g. "Salesforce hygiene, product feedback, operating with ownership, acting in Stripe's best interest"]

---

**What to build:**

**Page 1 — Feedback form** (public, shareable link): A clean Stripe-themed form where teammates enter their name, role, what meeting or context this is about, what I did well, and what I could improve. It should be honest and direct — not anonymous.

**Page 2 — Dashboard** (for me and my manager only): Shows all feedback in a visual layout with:
- Stats at the top (total responses, how many people responded, when the last one came in)
- Animated "coin drop" buckets for each of Stripe's 6 operating principles — feedback gets sorted into the relevant principles automatically based on what people wrote
- A 3-column grid for my career ladder areas (the three buckets above) with signal bars and direct quotes
- A full feed of every response at the bottom

**Technical requirements** (handle all of this — I don't need to understand it):
- Node.js + Express backend, two HTML pages in a `public/` folder
- Supabase for storing responses (free tier, persists across deployments)
- Deployable to Vercel for free via GitHub
- A parallelogram-shaped favicon in Stripe blurple
- Stripe color palette throughout: blurple (#635BFF), dark blue background (#3D6499), white text

**After building the code, give me:**
1. Every file I need, complete and ready to copy-paste
2. Step-by-step instructions to: create a GitHub repo, push the code, create a free Supabase project and run the setup SQL, deploy to Vercel (personal account, not a team), and add my Supabase credentials as environment variables
3. A set of 6–8 realistic sample feedback entries I can load so the dashboard looks complete for a screenshot before real responses come in

Keep instructions non-technical — assume I know how to use a browser and copy-paste, but not how to code.

---

**After you get the code working, useful follow-up prompts for go/kai:**
- *"Seed the app with sample feedback so I can take a screenshot"*
- *"Make the background a bit lighter"*
- *"Add [field name] to the feedback form"*
- *"Clear all the sample data"*
- *"Change the color of the [bucket name] ladder card"*
