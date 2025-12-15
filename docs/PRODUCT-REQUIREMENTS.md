# Product Requirements Document (PRD)
# Power Statement Assistant

**Version:** 1.0  
**Date:** 2024-12-15  
**Status:** Active  
**Owner:** Product Team  

---

## Executive Summary

Power Statement Assistant is a client-side web application that helps sales professionals create high-quality, compelling power statements through a structured 3-phase adversarial workflow. The tool leverages two leading AI models (Claude and Gemini) in a complementary pattern to produce power statements that work in both concise bullet-point format and flowing narrative format.

**Core Value Proposition:** Transform vague sales messaging into specific, credible, outcome-focused power statements that win deals.

---

## 1. Problem Statement

### 1.1 User Pain Points

**Sales professionals struggle with:**

1. **Vague messaging** - Power statements that use generic language like "helps," "improves," "enhances" without specificity
2. **Feature-focused pitches** - Talking about what the product does instead of what customers achieve
3. **Lack of credibility** - Missing or weak proof points that fail to build trust
4. **Inconsistent quality** - Power statements vary wildly in effectiveness depending on who writes them
5. **Format inflexibility** - Need both short (30-second) and detailed versions for different contexts
6. **No structured process** - Ad-hoc creation without critical review or refinement

### 1.2 Market Context

- Sales teams need power statements for: cold calls, LinkedIn messages, elevator pitches, discovery calls, presentations, proposals
- Current alternatives: hire expensive consultants, use generic templates, or struggle through trial-and-error
- Gap: No tool that combines AI assistance with adversarial critique to ensure quality

---

## 2. Goals and Success Metrics

### 2.1 Business Goals

1. **Primary:** Enable sales professionals to create world-class power statements in 30 minutes instead of 3 days
2. **Secondary:** Establish a repeatable, teachable process for power statement creation
3. **Tertiary:** Build trust through privacy-first, client-side architecture (no data leaves the browser)

### 2.2 User Goals

1. Create power statements that are **specific** (not vague)
2. Create power statements that are **outcome-focused** (not feature-focused)
3. Create power statements that are **credible** (with quantified proof points)
4. Generate **two formats**: concise (30-second) and structured (full version)
5. Ensure statements work as **both bullet points AND flowing narratives**

### 2.3 Success Metrics

**Quantitative:**
- Time to complete 3-phase workflow: < 30 minutes
- User retention: > 60% return to create second power statement
- Export rate: > 80% of completed Phase 3 projects exported

**Qualitative:**
- Power statements pass "specificity test" (no vague language)
- Power statements pass "outcome test" (focus on results, not features)
- Power statements pass "credibility test" (include quantified proof points)
- Power statements pass "conversational test" (sound natural when spoken aloud)
- Power statements work in both concise and narrative formats

---

## 3. Target Users

### 3.1 Primary Persona: Sales Professional Sarah

- **Role:** Account Executive at B2B SaaS company
- **Experience:** 3-5 years in sales
- **Pain:** Struggles to articulate value in discovery calls
- **Goal:** Create a power statement that gets prospects to say "tell me more"
- **Context:** Needs both a short version (cold calls) and long version (presentations)

### 3.2 Secondary Persona: Sales Leader Marcus

- **Role:** VP of Sales
- **Experience:** 10+ years, manages team of 15 AEs
- **Pain:** Inconsistent messaging across team
- **Goal:** Standardize power statements across the sales organization
- **Context:** Needs a repeatable process the team can follow

---

## 4. Product Vision

### 4.1 Core Workflow: 3-Phase Adversarial Process

**Phase 1: Initial Draft (Claude Sonnet 4.5)**
- User provides: product name, customer type, problem, outcome, proof points, differentiators, objections
- Claude generates: Two versions (concise paragraph + structured sections)
- Output format: Flowing paragraphs, NO bullet points

**Phase 2: Adversarial Critique (Gemini 2.5 Pro)**
- Gemini receives: Phase 1 output + original requirements
- Gemini provides: Critical analysis (what works, what needs improvement, specific recommendations)
- Gemini generates: Improved versions addressing weaknesses
- Output format: Flowing paragraphs, NO bullet points

**Phase 3: Final Synthesis (Claude Sonnet 4.5)**
- Claude receives: Phase 1 output + Phase 2 output + original requirements
- Claude synthesizes: Best elements from both versions
- Claude generates: Final power statement + usage guidance + key talking points
- Output format: Flowing paragraphs (except usage guidance can use bullets)

### 4.2 Key Design Principles

1. **Privacy-First:** 100% client-side, no server, no tracking, no data collection
2. **Guided Workflow:** Sequential UX patterns prevent users from skipping steps
3. **Adversarial Quality:** Two AI models challenge each other to improve output
4. **Format Flexibility:** Every power statement has concise AND structured versions
5. **Narrative Flow:** Emphasize flowing paragraphs over bullet points for natural delivery

---

## 5. Functional Requirements

### 5.1 Project Management

- **FR-1.1:** Users can create multiple power statement projects
- **FR-1.2:** Each project stores: title, problems, context, phase data (prompt + response per phase)
- **FR-1.3:** Projects persist in browser using IndexedDB
- **FR-1.4:** Users can export/import projects as JSON files
- **FR-1.5:** Users can delete projects with confirmation

### 5.2 Phase Workflow

- **FR-2.1:** Each project progresses through 3 sequential phases
- **FR-2.2:** Users cannot skip phases (must complete Phase 1 before Phase 2)
- **FR-2.3:** Users can navigate back to previous phases to review/edit
- **FR-2.4:** Phase tabs show visual progress (underline for active phase)
- **FR-2.5:** Auto-advance to next phase after saving response (except Phase 3)

### 5.3 Prompt Generation

- **FR-3.1:** App generates AI prompts by filling templates with user data
- **FR-3.2:** Phase 1 prompt includes: product_name, customer_type, problem, outcome, proof_points, differentiators, objections
- **FR-3.3:** Phase 2 prompt includes: all Phase 1 variables + phase1_output
- **FR-3.4:** Phase 3 prompt includes: all Phase 1 variables + phase1_output + phase2_output
- **FR-3.5:** Users copy prompts to clipboard with one click

### 5.4 AI Integration (Manual Copy/Paste)

- **FR-4.1:** App does NOT call AI APIs directly (user manually copies prompts)
- **FR-4.2:** "Open AI" button opens Claude or Gemini in new tab (shared tab target)
- **FR-4.3:** "Open AI" button disabled until user copies prompt (sequential reveal)
- **FR-4.4:** Response textarea disabled until user copies prompt (sequential enable)
- **FR-4.5:** Users paste AI responses back into the app manually

### 5.5 Output Formats

- **FR-5.1:** Every power statement has Version A (concise, 3-5 sentences, 30-second delivery)
- **FR-5.2:** Every power statement has Version B (structured with sections: Challenge, Solution, Results, Why It Works)
- **FR-5.3:** Both versions use flowing paragraphs, NOT bullet points (except usage guidance)
- **FR-5.4:** Final output includes usage guidance (when to use each version)
- **FR-5.5:** Users can export final power statement as Markdown file

---

## 6. Non-Functional Requirements

### 6.1 Performance

- **NFR-1.1:** App loads in < 2 seconds on 3G connection
- **NFR-1.2:** IndexedDB operations complete in < 100ms
- **NFR-1.3:** UI interactions feel instant (< 50ms response time)

### 6.2 Privacy & Security

- **NFR-2.1:** Zero server-side processing (100% client-side)
- **NFR-2.2:** No analytics, tracking, or telemetry
- **NFR-2.3:** No external API calls (except user-initiated AI tab opens)
- **NFR-2.4:** All data stored locally in browser IndexedDB
- **NFR-2.5:** Users can export data and clear storage anytime

### 6.3 Usability

- **NFR-3.1:** Works on desktop and mobile browsers
- **NFR-3.2:** Supports dark mode (auto-detects system preference)
- **NFR-3.3:** Accessible (WCAG 2.1 AA compliance)
- **NFR-3.4:** No installation required (runs in browser)

### 6.4 Reliability

- **NFR-4.1:** App works offline after initial load
- **NFR-4.2:** Data persists across browser sessions
- **NFR-4.3:** Graceful error handling with user-friendly messages

---

## 7. Out of Scope (V1)

The following features are explicitly OUT OF SCOPE for V1:

- **Direct AI API integration** - Users manually copy/paste (by design for privacy)
- **Team collaboration** - Single-user, local-only storage
- **Version history** - No git-like versioning of power statements
- **Templates library** - No pre-built power statement templates
- **A/B testing** - No built-in testing of power statement effectiveness
- **CRM integration** - No Salesforce, HubSpot, etc. integration
- **Multi-language support** - English only
- **Custom AI models** - Fixed to Claude Sonnet 4.5 and Gemini 2.5 Pro

---

## 8. User Stories

### 8.1 Core Workflow Stories

**US-1: Create Power Statement Project**
```
As a sales professional
I want to create a new power statement project
So that I can organize my work and track progress
```

**US-2: Generate Phase 1 Prompt**
```
As a sales professional
I want the app to generate a detailed prompt for Claude
So that I get a high-quality initial draft without writing the prompt myself
```

**US-3: Get Adversarial Critique**
```
As a sales professional
I want Gemini to critically analyze Claude's draft
So that I identify weaknesses and improve the power statement
```

**US-4: Synthesize Final Version**
```
As a sales professional
I want Claude to combine the best elements from both drafts
So that I get a polished, production-ready power statement
```

**US-5: Export Power Statement**
```
As a sales professional
I want to export my final power statement as Markdown
So that I can use it in presentations, emails, and sales materials
```

### 8.2 Format Flexibility Stories

**US-6: Get Concise Version**
```
As a sales professional making cold calls
I want a 30-second concise version
So that I can deliver the power statement quickly before prospects hang up
```

**US-7: Get Structured Version**
```
As a sales professional in a discovery call
I want a detailed structured version with clear sections
So that I can walk through the value proposition methodically
```

**US-8: Ensure Narrative Flow**
```
As a sales professional
I want power statements written as flowing paragraphs (not bullet points)
So that they sound natural when I speak them aloud
```

### 8.3 Quality Assurance Stories

**US-9: Avoid Vague Language**
```
As a sales professional
I want the AI to challenge vague language like "helps" or "improves"
So that my power statement is specific and credible
```

**US-10: Focus on Outcomes**
```
As a sales professional
I want the AI to emphasize results over features
So that prospects care about what they'll achieve, not what the product does
```

**US-11: Include Proof Points**
```
As a sales professional
I want the AI to incorporate quantified results
So that my power statement builds trust with skeptical prospects
```

---

## 9. Acceptance Criteria

### 9.1 Power Statement Quality Criteria

A power statement is considered **high-quality** if it meets ALL of these criteria:

1. **Specificity:** Identifies a specific customer type (not "businesses" or "companies")
2. **Problem Clarity:** Names a problem the customer actually recognizes and feels
3. **Outcome Focus:** Emphasizes results and outcomes, not features or capabilities
4. **Credibility:** Includes specific, quantified proof points (numbers, percentages, timeframes)
5. **Differentiation:** Clearly explains why this is different/better than alternatives
6. **Objection Handling:** Preemptively addresses common concerns
7. **Conversational Language:** Uses jargon-free language that sounds natural when spoken
8. **Conciseness:** Every word is necessary (no fluff or filler)
9. **Narrative Flow:** Uses flowing paragraphs, NOT bullet points (except in usage guidance)
10. **Dual Format:** Provides both concise (30-second) and structured (full) versions

### 9.2 Workflow Acceptance Criteria

The 3-phase workflow is considered **successful** if:

1. Users complete all 3 phases in < 30 minutes
2. Phase 2 identifies at least 3 specific weaknesses in Phase 1 output
3. Phase 3 output is measurably better than Phase 1 output (based on quality criteria)
4. Users can navigate between phases without losing data
5. Auto-advance works correctly (Phases 1-2 advance, Phase 3 does not)

### 9.3 UX Acceptance Criteria

The user experience is considered **successful** if:

1. "Open AI" button is disabled until "Copy Prompt" is clicked (sequential reveal)
2. Response textarea is disabled until prompt is copied (sequential enable)
3. All AI links use shared browser tab (no tab explosion)
4. Phase tabs show active phase with blue underline
5. Footer project count updates immediately after create/delete
6. Dark mode works correctly (auto-detects system preference)

---

## 10. Dependencies and Constraints

### 10.1 External Dependencies

- **Claude Sonnet 4.5** - Users must have access to Claude (free or paid)
- **Gemini 2.5 Pro** - Users must have access to Gemini (free or paid)
- **Modern Browser** - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **IndexedDB Support** - Required for local storage

### 10.2 Constraints

- **No Backend** - Must work 100% client-side (privacy requirement)
- **Manual Copy/Paste** - Cannot automate AI interactions (privacy + API cost)
- **Single User** - No multi-user or collaboration features
- **Local Storage Only** - Data lives in browser, not cloud

---

## 11. Risks and Mitigations

### 11.1 Risk: Users Don't Have AI Access

**Mitigation:** Provide clear instructions for signing up for free Claude and Gemini accounts

### 11.2 Risk: Users Skip Critical Steps

**Mitigation:** Implement sequential UX patterns (disable buttons until prerequisites met)

### 11.3 Risk: AI Generates Low-Quality Output

**Mitigation:** Use adversarial workflow (two AIs challenge each other) + detailed prompts with quality criteria

### 11.4 Risk: Users Lose Data

**Mitigation:** Implement export/import functionality + clear messaging about local storage

### 11.5 Risk: Prompts Don't Match Form Fields

**Status:** ✅ **FIXED** (2024-12-15)

**Previous Issue:** Form only collected title, problems, context - but prompts expected product_name, customer_type, problem, outcome, proof_points, differentiators, objections

**Resolution:** Updated form to collect all 7 required fields with helpful guidance:
1. Project Title
2. Product/Service Name
3. Customer Type
4. Problem Being Solved
5. Desired Outcome
6. Proof Points/Results
7. Key Differentiators
8. Common Objections to Address

**Verification:** 71/71 tests passing, including 11 new integration tests that validate form-to-prompt flow

**Details:** See `docs/CRITICAL-BUG-FIX-2024-12-15.md`

---

## 12. Future Enhancements (Post-V1)

1. **Template Library** - Pre-built power statement templates for common industries
3. **Quality Scoring** - Automated scoring against the 10 quality criteria
4. **A/B Testing** - Track which power statements perform best in real sales conversations
5. **Team Sharing** - Export/import to enable team collaboration
6. **CRM Integration** - Push power statements to Salesforce, HubSpot, etc.
7. **Multi-Language** - Support for Spanish, French, German, etc.
8. **Custom AI Models** - Allow users to choose different AI models

---

## 13. Appendix

### 13.1 Glossary

- **Power Statement:** A concise, compelling articulation of who you serve, what problem you solve, and why prospects should care
- **Adversarial Workflow:** Using two AI models to critique and improve each other's output
- **Sequential Reveal:** UX pattern where UI elements are disabled until prerequisites are met
- **Flowing Paragraphs:** Natural, conversational prose (vs. bullet points)
- **Proof Points:** Specific, quantified evidence of results (e.g., "48% appointment setting rate")

### 13.2 References

- Sales messaging best practices: Challenger Sale, SPIN Selling, Gap Selling
- AI models: Claude Sonnet 4.5 (Anthropic), Gemini 2.5 Pro (Google)
- Related tools: product-requirements-assistant, one-pager assistant

---

**Document Status:** ✅ Complete
**Last Updated:** 2024-12-15
**Next Review:** After V1 launch


