# Power Statement Assistant

Write power statements with AI. Three phases: draft, review, refine.

[![Star this repo](https://img.shields.io/github/stars/bordenet/power-statement-assistant?style=social)](https://github.com/bordenet/power-statement-assistant)

**Try it**: [bordenet.github.io/power-statement-assistant](https://bordenet.github.io/power-statement-assistant/)

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

- [One-Pager](https://github.com/bordenet/one-pager)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)
- [Strategic Proposal](https://github.com/bordenet/strategic-proposal)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
