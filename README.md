# AI Complaint Triage Agent

An automated civic grievance intake and triage dashboard that classifies citizen complaints, assigns priority, routes them to the correct government department, and generates an actionable summary — instantly, in the browser.

---

## 1. Project Overview

AI Complaint Triage Agent is a web application built for district-level civic administration teams (e.g. a Grievance Redressal Cell). Citizens submit a complaint through a simple form; the system's analysis engine reads the complaint text and produces a structured triage report — category, priority level, responsible department, executive summary, recommended action plan, and an estimated resolution time — which is then displayed on a government-style dashboard for administrators to review and act on.

The MVP is a fully self-contained frontend application. It requires no backend server, no database, and no API keys — all analysis runs client-side, and complaint records persist locally using the browser's `localStorage`.


[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-2A4E7A?style=for-the-badge)](https://ai-complaint-triage-agent.netlify.app)


## 2. Problem Statement

Public grievance cells in India and elsewhere receive a high volume of complaints across very different domains — water supply, electricity, sanitation, law and order, corruption, and more. Manually reading, classifying, prioritizing, and routing each complaint to the right department is slow and inconsistent, which delays urgent cases (e.g. a health hazard or safety threat) behind routine ones.

**AI Complaint Triage Agent** addresses this by automating the first, most time-consuming step of grievance handling: understanding *what* the complaint is about, *how urgent* it is, and *who* should act on it — so human staff can focus on resolution rather than sorting.

## 3. Features

- **Complaint intake form** — Name, District, and Complaint Description, with inline validation (required fields, minimum description length).
- **Automated AI-style analysis**, triggered on submission:
  - **Category detection** across 11 civic categories (Water Supply, Electricity, Roads & Infrastructure, Sanitation & Waste, Public Health, Law & Order, Education, Corruption, Public Transport, Housing & Land, Noise & Environment, plus a fallback "Other").
  - **Priority assignment** (Critical / High / Medium / Low) based on category risk weighting, urgency-language detection (e.g. words like "emergency," "outbreak," "since 3 days"), and description detail.
  - **Department routing** — each category maps to a realistic responsible department (e.g. Water Supply → Public Health Engineering Department).
  - **Executive summary** — an auto-generated, human-readable summary of the complaint, its classification, and the reasoning behind the urgency assessment.
  - **Action plan** — a category-specific, ordered checklist of next steps for staff to follow, with an escalation step automatically prepended for Critical cases.
  - **Resolution time estimate** — mapped from the assigned priority (e.g. 24–48 hours for Critical, up to 15–20 working days for Low).
- **Dashboard**
  - All complaints displayed as cards with color-coded priority badges (red / orange / amber / green).
  - Live stats strip: total cases and per-priority counts.
  - Search by name, district, keyword, or case ID.
  - Filter by priority and by category.
  - Full case-report modal per complaint (letterhead-style), including delete.
- **Persistence** — complaint records are saved to and loaded from `localStorage`; data survives page refresh.
- **Responsive UI** — clean, civic/government-styled design (navy and gold palette, serif headers, monospaced case IDs) that adapts across mobile, tablet, and desktop.

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | lucide-react |
| Analysis engine | Custom JavaScript rule/keyword scoring module (`src/utils/aiAnalyzer.js`) |
| Data storage | Browser `localStorage` (no backend/database) |

## 5. Installation Steps

```bash
# 1. Extract / clone the project
cd complaint-triage

# 2. Install dependencies
npm install
```

## 6. Environment Variables

**None required.** This MVP does not call any external API and does not use API keys, so there is no `.env` file needed to run it out of the box.

> Note: The analysis engine (`src/utils/aiAnalyzer.js`) is designed so it can later be swapped for a real LLM API call (e.g. the Anthropic Claude API) without changing the rest of the app. If that integration is added, an environment variable such as `VITE_ANTHROPIC_API_KEY` would be introduced at that point — it is not part of the current MVP.

## 7. Run Instructions

**Development server:**
```bash
npm run dev
```
Open the URL shown in the terminal (defaults to `http://localhost:5173`).

**Production build:**
```bash
npm run build      # outputs static files to dist/
npm run preview    # preview the production build locally
```

The contents of `dist/` can be deployed to any static hosting provider (Vercel, Netlify, GitHub Pages, etc.) with no server-side configuration.

## 8. Folder Structure

```
complaint-triage/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx                   # App entry point
│   ├── index.css                  # Tailwind directives + global styles
│   ├── App.jsx                    # Root component: layout, state, filters, stats
│   ├── components/
│   │   ├── ComplaintForm.jsx      # Complaint intake form
│   │   ├── ComplaintCard.jsx      # Dashboard card with priority badge
│   │   └── ComplaintDetail.jsx    # Full case-report modal
│   └── utils/
│       ├── aiAnalyzer.js          # Category / priority / summary / action-plan engine
│       └── storage.js             # localStorage read/write helpers
└── README.md
```

## 9. AI Workflow

The "AI Analysis" step runs entirely inside `analyzeComplaint()` in `src/utils/aiAnalyzer.js`. It is a deterministic, explainable rule-and-keyword engine (not a network call), designed so its behavior is transparent and reproducible for every submission:

1. **Text normalization** — the complaint description (and district) is lowercased and cleaned.
2. **Category scoring** — the text is scored against 11 weighted keyword sets; the highest-scoring category is selected (falls back to "Other" if no keywords match).
3. **Urgency detection** — the text is scanned against three tiers of urgency keywords (critical / high / medium), e.g. "emergency," "outbreak," "no water since."
4. **Priority computation** — category risk weight + urgency signal + description length are combined into a points score, which maps to Critical / High / Medium / Low.
5. **Department routing** — the detected category is mapped to a predefined responsible department.
6. **Executive summary generation** — a natural-language summary is composed from the complainant's name, district, category, priority, and urgency reasoning.
7. **Action plan generation** — a category-specific ordered list of next steps is selected (with an extra escalation step for Critical priority).
8. **Resolution time estimate** — looked up from a fixed priority-to-timeframe table.

The output of this pipeline is stored as a single complaint record alongside the original form data and displayed on the dashboard.

## 10. Future Improvements

- Replace the rule-based engine with a real LLM call (e.g. Claude API) for more nuanced category/priority reasoning and summary generation, using the existing function's return shape as the integration contract.
- Add a backend and database (e.g. Node/Express + PostgreSQL) so complaints are shared across users/devices instead of being stored per-browser in `localStorage`.
- Add authentication and role-based views (citizen vs. department staff vs. admin).
- Add status tracking (Open / In Progress / Resolved) with timestamps and an audit trail.
- Add file/photo attachment support for complaints.
- Add SMS/email notifications to complainants on status changes.
- Add analytics (trends by district, category, and resolution time) for administrators.
- Add multilingual support for complaint submission.
