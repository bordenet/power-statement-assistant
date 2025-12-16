# Power Statement Assistant

[![CI](https://github.com/bordenet/power-statement-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/power-statement-assistant/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/bordenet/power-statement-assistant/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/power-statement-assistant)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/bordenet/power-statement-assistant)](https://github.com/bordenet/power-statement-assistant/releases/latest)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-success.svg)](https://github.com/bordenet/power-statement-assistant/network/updates)
[![Known Vulnerabilities](https://snyk.io/test/github/bordenet/power-statement-assistant/badge.svg)](https://snyk.io/test/github/bordenet/power-statement-assistant)
[![npm dependencies](https://img.shields.io/librariesio/github/bordenet/power-statement-assistant)](https://libraries.io/github/bordenet/power-statement-assistant)

Create world-class power statements.

**🌐 Try it now: [https://bordenet.github.io/power-statement-assistant/](https://bordenet.github.io/power-statement-assistant/)**

---

## 🤖 For AI Assistants

**READ THIS FIRST**: Before working on this codebase, read [`CLAUDE.md`](CLAUDE.md) for mandatory workflow requirements.

---

## Quick Start

### Web App (Recommended)

Use the web app directly in your browser - no installation needed:

**🌐 [Launch Web App](https://bordenet.github.io/power-statement-assistant/)**

- ✅ No download required
- ✅ Works on any device (Windows, Mac, Linux, mobile)
- ✅ 100% client-side - all data stored in your browser
- ✅ Privacy-first - no server, no tracking
- ✅ Export/import projects as JSON

### Local Development

If you prefer to run from source or need to customize:

```bash
# Clone repository
git clone https://github.com/bordenet/power-statement-assistant.git
cd power-statement-assistant

# ⚠️ MANDATORY: Use setup script (NEVER manual npm install)
./scripts/setup-macos.sh        # macOS
./scripts/setup-linux.sh        # Linux
./scripts/setup-windows-wsl.sh  # Windows WSL

# Serve web app locally
python3 -m http.server 8000

# Open http://localhost:8000
```

**Why use setup scripts?**

- ✅ Ensures reproducible environment
- ✅ Installs ALL dependencies (not just npm packages)
- ✅ Fast on subsequent runs (~5-10 seconds)
- ✅ Prevents "works on my machine" problems

---

## Features

- **3-Phase Workflow**: Draft with Claude, critique with Gemini, synthesize with Claude
- **AI Integration**: Works with Claude and Gemini
- **Local Storage**: All data stored in browser using IndexedDB
- **Export/Import**: Save and load projects as JSON files
- **Dark Mode**: Automatic dark mode support
- **Privacy-First**: No server, no tracking, no data collection

## How It Works

### Workflow Overview

**Phase 1: Initial Draft**

- AI Model: Claude
- Purpose: Create initial power statement draft
- Input: Customer type, problem, outcome, proof points
- Output: First draft power statement

**Phase 2: Adversarial Critique**

- AI Model: Gemini
- Purpose: Provide critical feedback and improvements
- Input: Phase 1 draft + original requirements
- Output: Improved power statement with critique

**Phase 3: Final Synthesis**

- AI Model: Claude
- Purpose: Synthesize best elements from both versions
- Input: Phase 1 + Phase 2 outputs
- Output: Final polished power statement

### Example Usage

1. **Create New Project**: Click "New Project" and fill in all 7 required fields:
   - Project Title
   - Product/Service Name
   - Customer Type
   - Problem Being Solved
   - Desired Outcome
   - Proof Points/Results
   - Key Differentiators
   - Common Objections to Address

2. **Phase 1 - Initial Draft (Claude)**:
   - Copy the generated prompt
   - Paste into Claude
   - Copy AI response back and save

3. **Phase 2 - Adversarial Critique (Gemini)**:
   - Copy prompt for Phase 2
   - Paste into Gemini
   - Copy AI response back and save

4. **Phase 3 - Final Synthesis (Claude)**:
   - Copy prompt for Phase 3
   - Paste into Claude
   - Copy final output back and save

5. **Export**: Download final document as Markdown

---

## Architecture

- **Frontend**: 100% client-side JavaScript (ES6 modules)
- **Storage**: IndexedDB (50MB-10GB capacity)
- **Styling**: Tailwind CSS via CDN
- **Deployment**: GitHub Pages (root folder)

---

## Project Structure

```text
power-statement-assistant/
├── index.html                  # Main HTML file
├── js/                         # JavaScript modules
│   ├── app.js                  # Main application logic
│   ├── storage.js              # IndexedDB wrapper
│   ├── workflow.js             # 3-phase workflow
│   ├── ui.js                   # UI helpers
│   └── router.js               # Client-side routing
├── css/                        # Styles
│   └── styles.css              # Custom styles
├── prompts/                    # Prompt templates
│   ├── phase1.md               # Phase 1 prompt
│   ├── phase2.md               # Phase 2 prompt
│   └── phase3.md               # Phase 3 prompt
├── templates/                  # Document templates
│   └── power-statement-template.md
├── scripts/                    # Automation scripts
│   ├── setup-macos.sh          # macOS setup
│   ├── setup-linux.sh          # Linux setup
│   └── deploy-web.sh           # Deployment script
└── .github/workflows/          # GitHub Actions
    └── ci.yml                  # CI/CD pipeline
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

Built with the [Genesis Project Template System](https://github.com/bordenet/product-requirements-assistant/tree/main/genesis).

---

**Questions?** Open an issue or check the [documentation](docs/).
