/**
 * Prompt generation for LLM-based Power Statement scoring
 */

/**
 * Generate comprehensive LLM scoring prompt
 * @param {string} powerStatementContent - The power statement content to score
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(powerStatementContent) {
  return `You are an expert sales messaging strategist evaluating a Power Statement.

Power statements are sales messaging documents that clearly communicate value to prospects.
They follow a structure with Version A (concise paragraph) and Version B (structured sections).

Score this Power Statement using the following rubric (0-100 points total):

## SCORING RUBRIC

### 1. Clarity (25 points) - SALES PARAGRAPHS, NOT BULLETS
- **No Filler Phrases (6 pts)**: Clean, direct language without "It's worth noting...", "In today's landscape..."
- **No Jargon (6 pts)**: Avoids buzzwords like "synergy", "leverage", "cutting-edge" unless defined
- **Appropriate Length (5 pts)**: 50-150 words for sales messaging (NOT 15-25 word resume bullets)
- **Active Voice (4 pts)**: Uses active voice, avoids "was/were + verb"
- **Flowing Paragraphs (4 pts)**: Uses paragraphs, NOT bullet points

### 2. Impact (25 points)
- **Customer Outcome Focus (10 pts)**: States what customers achieve, not product features
- **Quantified Results (10 pts)**: Includes specific numbers, percentages, or dollar amounts
- **Proof Points (5 pts)**: Includes credible evidence (case studies, specific results)

### 3. Action (25 points)
- **Strong Verbs (15 pts)**: Uses strong action verbs (Delivered, Achieved, Increased)
- **No Weak Verbs (5 pts)**: Avoids "helped", "assisted", "was responsible for" (-10 penalty)
- **Multiple Strong Verbs (5 pts)**: Uses 2+ strong action verbs throughout

### 4. Specificity (25 points)
- **Quantified Metrics (10 pts)**: At least 2 specific metrics (%, $, time, quantity)
- **Context (8 pts)**: Clear about company, team, or scope
- **Timeframes (7 pts)**: Includes when (Q1 2026, within 3 months, by March 2026)

### BONUS: Version A/B Format (+5 points)
- **Both Versions Present (+5 pts)**: Includes Version A (concise paragraph) AND Version B (structured sections)
- **Partial (+2 pts)**: Only one version present

## CALIBRATION GUIDANCE
- Be HARSH. Most power statements score 30-50. Only exceptional ones score 80+.
- A score of 70+ means ready for prospect conversations.
- Deduct heavily for vague claims like "helps improve" or "better results".
- Deduct for feature-focused language instead of outcome-focused.
- Deduct for bullet points - sales messaging uses flowing paragraphs.
- Deduct for weak verbs: "helped", "assisted", "was responsible for" (-10 pts).
- Reward specific, quantified proof points with timeframes.
- The best power statements are specific, credible, and conversational.

## POWER STATEMENT TO EVALUATE

\`\`\`
${powerStatementContent}
\`\`\`

## REQUIRED OUTPUT FORMAT

Provide your evaluation in this exact format:

**TOTAL SCORE: [X]/100**

### Clarity: [X]/25
[2-3 sentence justification]

### Impact: [X]/25
[2-3 sentence justification]

### Action: [X]/25
[2-3 sentence justification]

### Specificity: [X]/25
[2-3 sentence justification]

### Top 3 Issues
1. [Most critical issue]
2. [Second issue]
3. [Third issue]

### Top 3 Strengths
1. [Strongest aspect]
2. [Second strength]
3. [Third strength]`;
}

/**
 * Generate critique prompt for detailed feedback
 * @param {string} powerStatementContent - The power statement to critique
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for critique
 */
export function generateCritiquePrompt(powerStatementContent, currentResult) {
  const issuesList = [
    ...(currentResult.clarity?.issues || []),
    ...(currentResult.impact?.issues || []),
    ...(currentResult.action?.issues || []),
    ...(currentResult.specificity?.issues || [])
  ].slice(0, 5).map(i => `- ${i}`).join('\n');

  return `You are an expert sales messaging strategist providing detailed feedback on a Power Statement.

## CURRENT VALIDATION RESULTS
Total Score: ${currentResult.totalScore}/100
- Clarity: ${currentResult.clarity?.score || 0}/25
- Impact: ${currentResult.impact?.score || 0}/25
- Action: ${currentResult.action?.score || 0}/25
- Specificity: ${currentResult.specificity?.score || 0}/25

Key issues detected:
${issuesList || '- None detected by automated scan'}

## POWER STATEMENT TO CRITIQUE

\`\`\`
${powerStatementContent}
\`\`\`

## YOUR TASK

Provide:
1. **Quick Assessment** (2-3 sentences on overall quality)
2. **Detailed Critique** by dimension:
   - What works well
   - What needs improvement
   - Specific suggestions with examples
3. **Rewritten Power Statement** - The improved version

Be specific. Show exact rewrites. Focus on clarity, credibility, and customer outcomes.`;
}

/**
 * Generate rewrite prompt
 * @param {string} powerStatementContent - The power statement to rewrite
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for rewrite
 */
export function generateRewritePrompt(powerStatementContent, currentResult) {
  return `You are an expert sales messaging strategist rewriting a Power Statement to achieve a score of 85+.

## CURRENT SCORE: ${currentResult.totalScore}/100

## ORIGINAL POWER STATEMENT

\`\`\`
${powerStatementContent}
\`\`\`

## REWRITE REQUIREMENTS

Create a powerful, prospect-ready power statement that:
1. Includes Version A (3-5 sentence paragraph) and Version B (structured sections)
2. Names the specific customer type being served
3. States the problem in terms prospects actually recognize
4. Focuses on outcomes and results, not features
5. Includes 2+ specific metrics (%, $, time, quantity)
6. Provides credible proof points
7. Addresses common objections preemptively
8. Uses conversational language, not marketing jargon
9. Is concise - every word counts

Output ONLY the rewritten Power Statement. No commentary.`;
}

/**
 * Clean AI response to extract markdown content
 * @param {string} response - Raw AI response
 * @returns {string} Cleaned markdown content
 */
export function cleanAIResponse(response) {
  // Remove common prefixes
  let cleaned = response.replace(/^(Here's|Here is|I've|I have|Below is)[^:]*:\s*/i, '');

  // Extract content from markdown code blocks if present
  const codeBlockMatch = cleaned.match(/```(?:markdown)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }

  return cleaned.trim();
}
