# Evidence — AI Complaint Triage Agent

This folder contains visual proof of the working application for hackathon judging: screenshots of each core screen/state, and a short screen recording of the end-to-end flow.

## Contents

| File | Description |
|---|---|
| `01-landing-empty-dashboard.png` | Initial app load — complaint form on the left, empty dashboard state ("No complaints filed yet") on the right. Shows the overall civic dashboard UI before any data is entered. |
| `02-form-filled.png` | Complaint form filled in with a sample complaint (name, district, description) just before clicking "Analyze & Submit." |
| `03-analyzing-state.png` | The brief "Analyzing…" loading state on the submit button, showing the AI analysis step in progress. |
| `04-case-report-modal.png` | The full case report modal generated after analysis — category, priority badge, confidence, department, executive summary, and action plan for the submitted complaint. |
| `05-dashboard-multiple-cards.png` | Dashboard populated with multiple complaints across different categories and priorities, showing color-coded priority badges and the stats strip. |
| `06-search-and-filters.png` | Dashboard with the search bar and priority/category filters in use, showing a filtered subset of complaints. |
| `demo-recording.mp4` | Short screen recording (~1–2 minutes) walking through the full flow: filing a complaint → AI analysis running → viewing the case report → seeing it appear on the dashboard → searching/filtering → refreshing the page to show data persistence. |

## How to reproduce this evidence

1. Run the app locally (`npm run dev`) or open the deployed URL.
2. Follow the screenshot checklist (`screenshot-checklist.md`) in order — it mirrors the numbered files above.
3. For the recording, narrate or caption each step briefly so judges can follow the flow without needing to test it live.
