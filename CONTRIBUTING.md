# Contributing to Power Statement Assistant

Thank you for your interest in contributing. This document outlines the standards and processes for contributing to this project.

---

## Code of Conduct

Be respectful, professional, and constructive in all interactions.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Git
- A code editor (VS Code recommended)

### Setup

```bash
# Clone repository
git clone https://github.com/bordenet/power-statement-assistant.git
cd power-statement-assistant

# ⚠️ MANDATORY: Use setup script (NEVER manual npm install)
./scripts/setup-macos.sh        # macOS
./scripts/setup-linux.sh        # Linux
./scripts/setup-windows-wsl.sh  # Windows WSL

# Run tests
NODE_OPTIONS=--experimental-vm-modules npm test

# Start local web server
python3 -m http.server 8000
# Open http://localhost:8000
```

---

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `test/` - Test additions/changes
- `refactor/` - Code refactoring

### 2. Make Changes

Follow the coding standards below.

### 3. Write Tests

All new code must include tests:
- Unit tests for business logic
- Integration tests for component interactions
- Integration tests for complete user workflows (form → prompt → output)

**Current coverage baseline**: 35.88% statements, 44.89% branches
**Goal**: Maintain or improve coverage with each PR

### 4. Run Tests

```bash
# Run all tests
npm test

# Check coverage
npm run test:coverage
```

### 5. Commit Changes

Use conventional commit format:

```
<type>: <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `chore`: Maintenance

Example:
```
feat: Add export to PDF functionality

Implements PDF export using jsPDF library.
Includes unit tests and documentation.

Closes #123
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

---

## Coding Standards

### JavaScript/TypeScript

- Use ES6+ features
- Use `const` and `let`, never `var`
- Use arrow functions for callbacks
- Use template literals for strings
- Use async/await, not callbacks
- Use JSDoc comments for public APIs

Example:
```javascript
/**
 * Save a project to storage
 * @param {Object} project - Project object
 * @returns {Promise<Object>} Saved project
 */
async function saveProject(project) {
  const validated = validateProject(project);
  return await storage.save(validated);
}
```



---

## Documentation Standards

### Writing Style

**Avoid**:
- Hyperbolic language ("amazing", "revolutionary")
- Unsubstantiated claims ("production-grade", "enterprise-ready")
- Marketing speak
- Excessive exclamation marks

**Use**:
- Clear, factual statements
- Specific, measurable claims
- Professional tone
- Active voice

### Code Comments

- Explain **why**, not **what**
- Keep comments up-to-date
- Remove commented-out code
- Use TODO comments sparingly

Good:
```javascript
// Cache results to avoid expensive recalculation
const cached = cache.get(key);
```

Bad:
```javascript
// Get from cache
const cached = cache.get(key);
```

---

## Testing Standards

### Test Coverage

- Current baseline: 35.88% statements, 44.89% branches
- Maintain or improve coverage with each PR
- Test all error cases
- Test edge cases
- Test complete user workflows (integration tests)

### Test Structure

```javascript
describe('Feature', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should handle normal case', () => {
    // Test
  });

  it('should handle error case', () => {
    // Test
  });

  it('should handle edge case', () => {
    // Test
  });
});
```

---

## Pull Request Process

### Before Submitting

- [ ] All tests pass
- [ ] Code coverage ≥ 35% (current baseline)
- [ ] Documentation updated
- [ ] No unnecessary console.log() statements (debug logging is acceptable)
- [ ] No TODO comments
- [ ] Code formatted
- [ ] Commits follow convention
- [ ] Linting passes (`npm run lint`)

### PR Description

Include:
1. **What**: What does this PR do?
2. **Why**: Why is this change needed?
3. **How**: How does it work?
4. **Testing**: How was it tested?
5. **Screenshots**: If UI changes

### Review Process

1. Automated checks must pass
2. At least one approval required
3. All comments must be resolved
4. Squash and merge

---

## Release Process

Releases follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

---

## Questions?

- Open an issue for bugs
- Start a discussion for questions
- Check existing issues first

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

