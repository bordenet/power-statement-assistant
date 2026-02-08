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

## LLM Scoring

The validator uses a **dual-scoring architecture**: JavaScript pattern matching provides fast, deterministic scoring, while LLM evaluation adds semantic understanding. Both systems use aligned rubrics but may diverge on edge cases.

### Three LLM Prompts

| Prompt | Purpose | When Used |
|--------|---------|-----------|
| **Scoring Prompt** | Evaluate power statement against rubric, return dimension scores | Initial validation |
| **Critique Prompt** | Generate clarifying questions to improve weak areas | After scoring |
| **Rewrite Prompt** | Produce improved power statement targeting 85+ score | User-requested rewrite |

### LLM Scoring Rubric

The LLM uses the same 4-dimension rubric as JavaScript, with identical point allocations:

| Dimension | Points | LLM Focus |
|-----------|--------|-----------|
| Clarity | 25 | No filler phrases, no jargon, 50-150 words for sales messaging, active voice, flowing paragraphs (NOT bullets) |
| Impact | 25 | Customer outcome focus (not features), quantified results (%, $), credible proof points |
| Action | 25 | Strong action verbs (Delivered, Achieved, Increased), penalty for weak verbs (helped, assisted) |
| Specificity | 25 | At least 2 specific metrics, clear context, timeframes (Q1 2026, within 3 months) |

### Version A/B Bonus

The LLM scoring includes a bonus for proper format:
- **Both versions present (+5 pts)**: Version A (concise paragraph) AND Version B (structured sections)
- **Partial (+2 pts)**: Only one version present

### LLM Calibration Guidance

The LLM prompt includes explicit calibration signals:

**Reward signals:**
- Specific, quantified proof points with timeframes
- Customer outcome focus (what they achieve)
- Strong action verbs at the start
- Conversational, jargon-free language

**Penalty signals:**
- Vague claims: "helps improve", "better results"
- Feature-focused language instead of outcome-focused
- Bullet points (sales messaging uses flowing paragraphs)
- Weak verbs: "helped", "assisted", "was responsible for" (-10 pts)

**Calibration baseline:** "Be HARSH. Most power statements score 30-50. Only exceptional ones score 80+."

### LLM Critique Prompt

The critique prompt receives the current JS validation scores and generates improvement questions:

```
Score Summary: [totalScore]/100
- Clarity: [X]/25
- Impact: [X]/25
- Action: [X]/25
- Specificity: [X]/25
```

Output includes:
- Top 3 issues (specific gaps)
- 3-5 clarifying questions focused on weakest dimensions
- Quick wins (fixes that don't require user input)
- Focus areas: specificity, credibility, customer outcomes

### LLM Rewrite Prompt

The rewrite prompt targets an 85+ score with specific requirements:
- Includes Version A (3-5 sentence paragraph) AND Version B (structured sections)
- Names the specific customer type being served
- States the problem in terms prospects actually recognize
- Focuses on outcomes and results, not features
- Includes 2+ specific metrics (%, $, time, quantity)
- Provides credible proof points
- Addresses common objections preemptively
- Uses conversational language, not marketing jargon
- Is concise - every word counts

### JS vs LLM Score Divergence

| Scenario | JS Score | LLM Score | Explanation |
|----------|----------|-----------|-------------|
| Resume-style bullets | May pass patterns | Lower | LLM penalizes bullet format for sales |
| "Helped improve performance" | May pass | Much lower | LLM catches weak verb + vague metric |
| Strong verbs but no outcomes | Higher | Lower | LLM requires customer outcome focus |
| Jargon-heavy with metrics | May pass metrics | Lower | LLM penalizes "synergy", "leverage" |

### LLM-Specific Adversarial Notes

| Gaming Attempt | Why LLM Catches It |
|----------------|-------------------|
| "Improved efficiency" without numbers | LLM applies vague improvement penalty |
| Using "helped" as action verb | LLM applies -10 weak verb penalty |
| Resume-style bullet points | LLM requires flowing paragraphs for sales |
| Feature-focused language | LLM requires customer outcome focus |
| Generic "significant results" | LLM requires specific % or $ metrics |

## Related Files

- `validator/js/validator.js` - Implementation of scoring functions
- `validator/js/slop-detection.js` - AI slop detection
- `shared/prompts/phase1.md` - User-facing instructions (source of truth)

