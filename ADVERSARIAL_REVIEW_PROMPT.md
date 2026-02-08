# ADVERSARIAL REVIEW: power-statement-assistant

## CONTEXT

You are an expert prompt engineer performing an **ADVERSARIAL review** of LLM prompts for a Power Statement assistant tool. Power statements are sales messaging documents that communicate value to prospects.

This tool uses a **3-phase LLM chain** plus **dual scoring systems**:
1. **Phase 1 (Claude)** - Generates power statement (Version A + B)
2. **Phase 2 (Gemini)** - Reviews for impact and credibility
3. **Phase 3 (Claude)** - Synthesizes final power statement
4. **LLM Scoring (prompts.js)** - Sends document to LLM for evaluation
5. **JavaScript Scoring (validator.js)** - Deterministic regex/pattern matching

---

## ⚠️ CRITICAL ALIGNMENT CHAIN

These 5 components **MUST be perfectly aligned**:

| Component | Purpose | Risk if Misaligned |
|-----------|---------|-------------------|
| phase1.md | Generates power statement | LLM uses format validator doesn't recognize |
| phase2.md | Reviews for credibility | Different proof point criteria |
| phase3.md | Final synthesis | Quality gate doesn't match validator |
| prompts.js | LLM scoring rubric | Scores dimensions validator doesn't check |
| validator.js | JavaScript scoring | Misses patterns prompts.js rewards |

---

## CURRENT TAXONOMY (4 dimensions, 100 pts total)

| Dimension | prompts.js | validator.js | Weight Description |
|-----------|------------|--------------|-------------------|
| Clarity | 25 pts | 25 pts | No filler, no jargon, length, active voice, paragraphs |
| Impact | 25 pts | 25 pts | Customer outcome focus, quantified results, proof points |
| Action | 25 pts | 25 pts | Strong verbs, no weak verbs, multiple strong verbs |
| Specificity | 25 pts | 25 pts | Quantified metrics, context, timeframes |

---

## COMPONENT 1: phase1.md (Claude - Initial Draft)

See: `shared/prompts/phase1.md` (134 lines)

**Key Elements:**
- Two versions: A (concise paragraph) and B (structured sections)
- Version A: 3-5 sentences, 30 seconds delivery
- Version B: Challenge, Solution, Proven Results, Why It Works
- AI Slop Prevention: banned vague language, filler phrases, buzzwords

---

## COMPONENT 4: prompts.js (LLM Scoring Rubric)

See: `validator/js/prompts.js` (186 lines)

**Scoring Rubric:**

### 1. Clarity (25 points)
- No Filler Phrases (6 pts): Clean, direct language
- No Jargon (6 pts): No "synergy", "leverage", "cutting-edge"
- Appropriate Length (5 pts): 50-150 words (NOT 15-25 word resume bullets)
- Active Voice (4 pts): Avoids "was/were + verb"
- Flowing Paragraphs (4 pts): Uses paragraphs, NOT bullet points

### 2. Impact (25 points)
- Customer Outcome Focus (10 pts): What customers achieve, not features
- Quantified Results (10 pts): Numbers, percentages, dollar amounts
- Proof Points (5 pts): Case studies, specific results

### 3. Action (25 points)
- Strong Verbs (15 pts): Delivered, Achieved, Increased
- No Weak Verbs (5 pts): Avoid "helped", "assisted", "was responsible for" (-10 penalty!)
- Multiple Strong Verbs (5 pts): 2+ strong action verbs

### 4. Specificity (25 points)
- Quantified Metrics (10 pts): At least 2 specific metrics
- Context (8 pts): Company, team, or scope
- Timeframes (7 pts): Q1 2026, within 3 months, by March 2026

### BONUS: Version A/B Format (+5 points)
- Both Versions Present: +5 pts
- Partial: +2 pts

---

# YOUR ADVERSARIAL REVIEW TASK

## SPECIFIC QUESTIONS TO ANSWER

### 1. VERSION A/B DETECTION
Phase1.md requires both Version A and Version B. Does validator.js:
- ✅ Detect "Version A" header?
- ✅ Detect "Version B" header?
- ✅ Award bonus points?

Look for: `version.?a`, `version.?b`, `bonus`

### 2. LENGTH SCORING
prompts.js specifies 50-150 words. Does validator.js:
- ✅ Count words?
- ✅ Apply the 50-150 range?
- ⚠️ Differentiate from "15-25 word resume bullets"?

### 3. WEAK VERB DETECTION
prompts.js penalizes "helped", "assisted", "was responsible for" at -10 pts. Does validator.js:
- ✅ Detect all weak verbs?
- ✅ Apply the -10 penalty?

Look for: `helped`, `assisted`, `responsible`

### 4. STRONG VERB COUNTING
prompts.js allocates 15 pts for strong verbs. Does validator.js:
- ✅ Detect: Delivered, Achieved, Increased, Created, Built?
- ✅ Count them (2+ = 5 bonus pts)?

### 5. PARAGRAPH vs BULLET DETECTION
prompts.js allocates 4 pts for "Flowing Paragraphs (not bullets)". Does validator.js:
- ✅ Detect bullet point patterns?
- ✅ Penalize bullet-heavy content?

### 6. SLOP DETECTION
Does validator.js import and apply slop penalties?

```bash
grep -n "getSlopPenalty\|calculateSlopScore\|slop" validator.js
```

---

## DELIVERABLES

### 1. CRITICAL FAILURES
For each issue: Issue, Severity, Evidence, Fix

### 2. ALIGNMENT TABLE
| Component | Dimension | Weight | Aligned? | Issue |

### 3. GAMING VULNERABILITIES
- Keyword stuffing action verbs
- Fake quantified results
- Paragraph formatting without substance

### 4. RECOMMENDED FIXES (P0/P1/P2)

---

**VERIFY CLAIMS. Evidence before assertions.**

