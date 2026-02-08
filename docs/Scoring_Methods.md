# Power Statement Assistant Scoring Methods

This document describes the scoring methodology used by the Power Statement Validator.

## Overview

The validator scores power statements on a **100-point scale** across four equally-weighted dimensions. Power statements are sales messaging documents communicating value to prospects, available in Version A (concise paragraph) and Version B (structured sections).

## Scoring Taxonomy

| Dimension | Points | What It Measures |
|-----------|--------|------------------|
| **Clarity** | 25 | Plain language, conversational tone, no jargon or filler |
| **Impact** | 25 | Customer outcomes, quantified results, credible proof points |
| **Action** | 25 | Problem clarity, solution specificity, differentiation |
| **Specificity** | 25 | Metrics (%, $), customer type clarity, objection handling |

## Dimension Details

### 1. Clarity (25 pts)

**Scoring Breakdown:**
- Conversational tone (no jargon): 10 pts
- No filler words: 8 pts
- Plain language (low complexity): 7 pts

**Jargon Detection (penalties):**
```javascript
jargonPatterns: [
  /synergy|synergize|synergistic/gi,
  /leverage|leveraging|leveraged/gi,
  /paradigm|paradigm shift/gi,
  /best.in.class|world.class|cutting.edge|state.of.the.art/gi,
  /move the needle|low.hanging fruit|boil the ocean/gi,
  /circle back|touch base|take offline/gi,
  /bandwidth|bandwidth to/gi,
  /deep dive|drill down/gi
]
```

**Filler Pattern Detection:**
```javascript
fillerPatterns: [
  /very|really|quite|somewhat|rather|fairly|pretty much/gi,
  /basically|essentially|actually|literally|virtually/gi,
  /in order to|due to the fact that|for the purpose of/gi,
  /it's worth noting( that)?/gi,
  /in today's (competitive )?landscape/gi,
  /let's talk about/gi,
  /the reality is/gi
]
```

### 2. Impact (25 pts)

**Scoring Breakdown:**
- Customer outcomes stated: 8 pts
- Quantified results (metrics present): 10 pts
- Credible proof points: 7 pts

**Proof Point Detection:**
```javascript
proofPatterns: [
  /\d+%/, /\d+x/, /\$\d+/, /\d+\s*(day|week|month|hour)/gi,
  /reduced.*from.*to/gi, /increased.*from.*to/gi,
  /case study|example|customer|client/gi
]
```

### 3. Action (25 pts)

**Scoring Breakdown:**
- Starts with or uses strong action verbs: 10 pts
- Problem clarity (what pain addressed): 8 pts
- Solution differentiation: 7 pts

**Strong Action Verbs (200+ verbs validated):**
Examples: achieved, accelerated, delivered, drove, enabled, generated, implemented, launched, led, reduced, streamlined, transformed

**Weak Verbs (penalized):**
```javascript
weakVerbs: [
  'was', 'were', 'been', 'being', 'am', 'is', 'are',
  'helped', 'assisted', 'supported', 'worked on', 
  'was responsible for', 'participated in', 'was involved in'
]
```

### 4. Specificity (25 pts)

**Scoring Breakdown:**
- Impact metrics with % or $: 10 pts
- Customer type/persona clarity: 8 pts
- Objection handling (anticipated concerns): 7 pts

**Impact Metric Detection:**
```javascript
impactMetrics: /\d+\s*%|\$\d+[,\d]*|from\s+\d+\s+to\s+\d+/gi
```

**Version B Requirements (structured format):**
Version B power statements require 3+ of 4 structured sections:
- Problem section
- Solution section
- Results/impact section
- Differentiation section

## Vague Improvement Penalty

Phase1.md bans vague improvement language without quantification:

**Flagged Terms:**
```javascript
vaguePatterns: /improve|improved|improving|enhance|enhanced|enhancing|optimize|optimized|optimizing|better results|significant|significantly/gi
```

**Required Replacement:**
- ❌ "We improved performance" → ✅ "We increased throughput from 100 to 500 requests/second"
- ❌ "Significant results" → ✅ "42% reduction in processing time"

## Adversarial Robustness

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| "Improved efficiency" without numbers | Vague improvement penalty applies (-3 pts each) |
| Using "helped" as action verb | "helped" moved to WEAK_VERBS list |
| Unicode bullets to bypass regex | Expanded bullet detection (•, ◦, ▪, ▸, -, *) |
| Version B with only 1-2 sections | Requires 3+/4 structured sections for full credit |
| Passive voice patterns | Expanded passive detection (am/is/are/was/were/been + past participle) |
| Metrics without context (just "30%") | Impact metrics require % or $ with outcome context |
| Phase1 banned fillers | "It's worth noting", "in today's landscape" explicitly flagged |

## Calibration Notes

### Action Verbs Are King
Power statements are sales tools. They must start with or heavily use action verbs. "We helped" is weak; "We delivered" is strong.

### Quantification Is Required
"Improved performance" is meaningless in sales. "$2M saved" or "73% faster" creates credibility.

### Version A vs Version B
- **Version A**: Single paragraph, punchy, elevator-pitch style
- **Version B**: Structured sections for longer-form sales materials

Both are scored on the same 100-point scale, but Version B gets bonus credit for proper section structure.

## Score Interpretation

| Score Range | Grade | Interpretation |
|-------------|-------|----------------|
| 80-100 | A | Sales-ready - compelling, quantified, clear |
| 60-79 | B | Good - needs metric tightening or jargon removal |
| 40-59 | C | Fair - vague or weak verb issues |
| 20-39 | D | Poor - missing proof points |
| 0-19 | F | Not a power statement - restart |

## Related Files

- `validator/js/validator.js` - Implementation of scoring functions
- `validator/js/slop-detection.js` - AI slop detection
- `shared/prompts/phase1.md` - User-facing instructions (source of truth)

