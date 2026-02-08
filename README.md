# Power Statement Assistant

Write power statements with AI. Three phases: draft, review, refine.

[![Star this repo](https://img.shields.io/github/stars/bordenet/power-statement-assistant?style=social)](https://github.com/bordenet/power-statement-assistant)

**Try it**: [Assistant](https://bordenet.github.io/power-statement-assistant/) · [Validator](https://bordenet.github.io/power-statement-assistant/validator/)

> **What is a Power Statement?** A power statement is a concise accomplishment description following the formula: *Action + Context + Result*. Used in resumes and interviews, it quantifies impact with specific metrics. Example: "Reduced API latency by 40% by implementing Redis caching, saving $50K/month in compute costs."

[![CI](https://github.com/bordenet/power-statement-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/power-statement-assistant/actions)
[![codecov](https://codecov.io/gh/bordenet/power-statement-assistant/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/power-statement-assistant)

---

## Quick Start

1. Open the [demo](https://bordenet.github.io/power-statement-assistant/)
2. Enter context, accomplishments, measurable impact
3. Copy prompt → paste into Claude → paste response back
4. Repeat for review (Gemini) and synthesis (Claude)
5. Export as Markdown

## What It Does

- **Draft → Review → Synthesize**: Claude writes, Gemini critiques, Claude refines
- **Browser storage**: Data stays in IndexedDB, nothing leaves your machine
- **No login**: Just open and use
- **Dark mode**: Toggle in the UI

## How the Phases Work

**Phase 1** — You describe your accomplishment. Claude drafts a power statement.

**Phase 2** — Gemini reviews: Are metrics specific? Is the impact clear? What's missing?

**Phase 3** — Claude takes the draft plus critique and produces a final version.

---

## Scoring Methodology

The validator scores power statements on a 100-point scale across four dimensions. This scoring system is calibrated for sales-oriented accomplishment writing—flowing paragraphs that sell outcomes, not resume bullet points.

### Scoring Taxonomy

| Category | Weight | Rationale |
|----------|--------|-----------|
| **Clarity** | 25 pts | Validates clean prose without filler, jargon, or passive voice |
| **Impact** | 25 pts | Ensures customer outcomes with quantified results |
| **Action** | 25 pts | Enforces strong verbs; penalizes weak hedging verbs |
| **Specificity** | 25 pts | Requires metrics, context, and timeframes |

### Why These Weights?

**Clarity (25 pts)** distinguishes power statements from resume bullets. The validator enforces paragraph format, not bullet points, and penalizes common AI writing patterns:
- **No filler phrases** (6 pts): Clean language without "It's worth noting...", "In today's landscape..."
- **No jargon** (6 pts): Avoids buzzwords like "synergy", "leverage", "cutting-edge" unless defined
- **Appropriate length** (5 pts): 50-150 words for sales messaging (NOT 15-25 word resume bullets)
- **Active voice** (4 pts): Uses active voice, avoids "was/were + verb" constructions
- **Flowing paragraphs** (4 pts): Uses paragraphs, NOT bullet points

**Impact (25 pts)** validates that the statement focuses on outcomes, not activities:
- **Customer outcome focus** (10 pts): States what customers achieve, not product features
- **Quantified results** (10 pts): Includes specific numbers, percentages, or dollar amounts
- **Proof points** (5 pts): Includes credible evidence (case studies, specific results)

**Action (25 pts)** enforces verb quality with explicit penalties for weak language:
- **Strong verbs** (15 pts): Uses strong action verbs (Delivered, Achieved, Increased, Reduced, Built)
- **No weak verbs** (5 pts): Avoids "helped", "assisted", "was responsible for" (-10 penalty)
- **Multiple strong verbs** (5 pts): Uses 2+ strong action verbs throughout

**Specificity (25 pts)** ensures the statement is verifiable:
- **Quantified metrics** (10 pts): At least 2 specific metrics (%, $, time, quantity)
- **Context** (8 pts): Clear about company, team, or scope
- **Timeframes** (7 pts): Includes when (Q1 2026, within 3 months, by March 2026)

### Bonus: Version A/B Format (+5 pts)

The validator awards bonus points for providing both versions:
- **Version A**: Concise paragraph (sales pitch format)
- **Version B**: Structured sections (detailed breakdown)

### Adversarial Robustness

The scoring system addresses common power statement failures:

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| Using bullet points | Paragraph format required; Unicode bullets (•◆✓✅→►▶) also detected |
| Vague impact claims | Impact requires quantified results with specific numbers |
| Weak verb hedging | "Helped", "assisted", "was responsible for" incur -10 penalty |
| Metric-free statements | Specificity requires 2+ metrics with at least one impact metric (%, $) |
| Missing timeframes | When-based specificity is separately scored |
| Vague improvement terms | "improve"/"enhance"/"optimize" without quantification: -3 pts each (max -9) |
| Version B header forgery | Requires 3+/4 structured sections for full +5 bonus |
| Filler phrase bypass | Phase1.md banned phrases now detected: "It's worth noting...", etc. |
| Passive voice obfuscation | Expanded regex catches irregular verbs: "was achieved", "were led", etc. |

### Calibration Notes

The **weak verb penalty** (-10 pts) is intentionally harsh. Phrases like "helped the team" and "was responsible for" are resume-speak that distances the author from their accomplishment. Power statements demand ownership: "Delivered," not "Helped deliver."

The **paragraph requirement** reflects the use case. Power statements are sales tools—elevator pitches for accomplishments. Bullet points signal resume thinking; paragraphs signal storytelling. The validator detects bullet patterns (`- `, `• `, `* `) and penalizes accordingly.

---

## Usage

1. Open the app
2. Click "New Project", fill in your inputs
3. Copy each phase's prompt to the appropriate AI, paste responses back
4. Export when done

**Mock mode**: On localhost, toggle "AI Mock Mode" (bottom-right) to skip the copy/paste loop. Useful for testing.

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/bordenet/power-statement-assistant.git
cd power-statement-assistant
npm install
```

### Testing

```bash
npm test        # Run all tests
npm run lint    # Run linting
npm run lint:fix # Fix lint issues
```

### Local Development

```bash
npm run serve   # Start local server at http://localhost:8000
```

## Project Structure

```
power-statement-assistant/
├── js/                    # JavaScript modules
│   ├── app.js            # Main application entry
│   ├── workflow.js       # Phase orchestration
│   ├── storage.js        # IndexedDB operations
│   └── ...
├── tests/                 # Jest test files
├── prompts/              # AI prompt templates
│   ├── phase1.md
│   ├── phase2.md
│   └── phase3.md
└── index.html            # Main HTML file
```

## Part of Genesis Tools

Built with [Genesis](https://github.com/bordenet/genesis). Related tools:

- [Acceptance Criteria Assistant](https://github.com/bordenet/acceptance-criteria-assistant)
- [Architecture Decision Record](https://github.com/bordenet/architecture-decision-record)
- [Business Justification Assistant](https://github.com/bordenet/business-justification-assistant)
- [JD Assistant](https://github.com/bordenet/jd-assistant)
- [One-Pager](https://github.com/bordenet/one-pager)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)
- [Strategic Proposal](https://github.com/bordenet/strategic-proposal)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
