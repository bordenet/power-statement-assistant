/**
 * Prompt generation for LLM-based Power Statement scoring
 */

/**
 * Generate comprehensive LLM scoring prompt
 * @param {string} powerStatementContent - The power statement content to score
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(powerStatementContent) {
  return `You are an expert resume coach and career advisor evaluating a Power Statement.

Power statements are achievement-focused bullet points that follow the format:
"Action verb + accomplishment + measurable result"

Score this Power Statement using the following rubric (0-100 points total):

## SCORING RUBRIC

### 1. Clarity (25 points)
- **No Filler Words (8 pts)**: Clean, direct language without "very", "really", "basically"
- **No Jargon (7 pts)**: Avoids buzzwords like "synergy", "leverage", "paradigm shift"
- **Concise Length (5 pts)**: 15-30 words ideal, not too long or too short
- **Active Voice (5 pts)**: Uses active voice, not passive ("was done by")

### 2. Impact (25 points)
- **Business/Customer Impact (10 pts)**: States clear outcome for business or customers
- **Quantified Results (10 pts)**: Includes specific numbers, percentages, or dollar amounts
- **Scale/Scope (5 pts)**: Indicates the scope (team size, company-wide, etc.)

### 3. Action (25 points)
- **Strong Opening Verb (15 pts)**: Starts with powerful action verb (Led, Achieved, Drove)
- **Strong Verbs Throughout (5 pts)**: Uses multiple strong verbs
- **No Weak Verbs (5 pts)**: Avoids "helped", "assisted", "was responsible for"

### 4. Specificity (25 points)
- **Quantified Metrics (10 pts)**: At least 2 specific metrics (%, $, time, quantity)
- **Context Provided (8 pts)**: Clear setting (company, team size, scope)
- **Timeframe (7 pts)**: Includes when this happened or duration

## CALIBRATION GUIDANCE
- Be HARSH. Most power statements score 30-50. Only exceptional ones score 80+.
- A score of 70+ means resume-ready.
- Deduct heavily for weak opening verbs ("Helped", "Was responsible for").
- Deduct for vague claims without numbers.
- Reward specific, quantified achievements.
- The best power statements tell a complete story in one sentence.

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

  return `You are an expert resume coach providing detailed feedback on a Power Statement.

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

Be specific. Show exact rewrites. Keep it to ONE impactful sentence.`;
}

/**
 * Generate rewrite prompt
 * @param {string} powerStatementContent - The power statement to rewrite
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for rewrite
 */
export function generateRewritePrompt(powerStatementContent, currentResult) {
  return `You are an expert resume coach rewriting a Power Statement to achieve a score of 85+.

## CURRENT SCORE: ${currentResult.totalScore}/100

## ORIGINAL POWER STATEMENT

\`\`\`
${powerStatementContent}
\`\`\`

## REWRITE REQUIREMENTS

Create a powerful, resume-ready statement that:
1. Starts with a strong action verb (Led, Drove, Achieved, Delivered, etc.)
2. Is 15-30 words (concise but complete)
3. Includes 2+ specific metrics (%, $, time, quantity)
4. States clear business or customer impact
5. Provides context (scope, team size, company)
6. Includes timeframe when relevant
7. Uses active voice throughout
8. Avoids filler words, jargon, and weak verbs
9. Tells a complete story in one sentence

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
