# Power Statement Assistant

Generate compelling power statements using a three-phase AI workflow.

**Live Demo**: [bordenet.github.io/power-statement-assistant](https://bordenet.github.io/power-statement-assistant/)

[![CI](https://github.com/bordenet/power-statement-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/power-statement-assistant/actions)
[![codecov](https://codecov.io/gh/bordenet/power-statement-assistant/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/power-statement-assistant)
[![Linting: ESLint](https://img.shields.io/badge/linting-ESLint-4B32C3)](https://eslint.org/)
[![Code Style: ESLint](https://img.shields.io/badge/code%20style-ESLint-4B32C3)](https://eslint.org/)
[![Dependabot](https://img.shields.io/badge/dependabot-enabled-025E8C?logo=dependabot)](https://github.com/bordenet/power-statement-assistant/security/dependabot)

---

## Quick Start

1. Visit the [live demo](https://bordenet.github.io/power-statement-assistant/)
2. Fill in your context, accomplishments, and impact
3. Copy the generated prompt and paste into Claude
4. Paste the AI response back, then proceed through review and synthesis phases
5. Export your completed power statement as Markdown

## Features

- **Three-Phase AI Workflow**: Initial draft → Adversarial review → Synthesis
- **Privacy-First**: All data stored locally in your browser (IndexedDB)
- **No Account Required**: Works immediately, no signup needed
- **Export to Markdown**: Download your completed document
- **Dark Mode**: Toggle between light and dark themes
- **Project Management**: Create, save, and manage multiple power statements

## Workflow

### Phase 1: Initial Draft
Enter your context, accomplishments, and measurable impact. Copy the generated prompt to Claude to create an initial power statement draft.

### Phase 2: Adversarial Review
The initial draft is critically reviewed by Gemini to strengthen impact, clarify metrics, and identify areas for improvement.

### Phase 3: Synthesis
Claude synthesizes the initial draft with the adversarial feedback to produce a final, polished power statement.

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

\`\`\`bash
git clone https://github.com/bordenet/power-statement-assistant.git
cd power-statement-assistant
npm install
\`\`\`

### Testing

\`\`\`bash
npm test        # Run all tests
npm run lint    # Run linting
npm run lint:fix # Fix lint issues
\`\`\`

### Local Development

\`\`\`bash
npm run serve   # Start local server at http://localhost:8000
\`\`\`

## Project Structure

\`\`\`
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
\`\`\`

## Part of Genesis Tools

This project is generated and maintained using [Genesis](https://github.com/bordenet/genesis), ensuring consistency across all document-generation tools:

- [Architecture Decision Record](https://github.com/bordenet/architecture-decision-record)
- [One-Pager](https://github.com/bordenet/one-pager)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant) ← You are here
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
