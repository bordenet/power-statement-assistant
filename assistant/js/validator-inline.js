/**
 * Inline Power Statement Validator for Assistant UI
 * @module validator-inline
 *
 * Lightweight validation for inline scoring after Phase 3 completion.
 * Scoring Dimensions:
 * 1. Clarity (25 pts) - Clear, concise language without jargon or filler
 * 2. Impact (25 pts) - Demonstrates measurable business/customer impact
 * 3. Action (25 pts) - Uses strong action verbs, active voice
 * 4. Specificity (25 pts) - Includes specific details, numbers, and context
 */

// Strong action verbs (subset for inline validation)
const STRONG_VERBS = [
  'achieved', 'accelerated', 'built', 'created', 'delivered', 'developed',
  'drove', 'established', 'exceeded', 'executed', 'expanded', 'generated',
  'implemented', 'improved', 'increased', 'launched', 'led', 'managed',
  'optimized', 'pioneered', 'reduced', 'saved', 'scaled', 'spearheaded',
  'streamlined', 'transformed'
];

// Patterns
const FILLER_PATTERNS = [
  /\b(very|really|quite|somewhat|basically|actually|literally)\b/gi,
  /\b(thing|stuff|something|somehow)\b/gi
];

const JARGON_PATTERNS = [
  /\b(synergy|leverage|paradigm|best.in.class|move the needle)\b/gi,
  /\b(circle back|touch base|deep dive)\b/gi
];

function scoreClarity(text) {
  let score = 0;
  const issues = [];
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  // Filler words check (8 pts)
  let fillerCount = 0;
  for (const pattern of FILLER_PATTERNS) {
    fillerCount += (text.match(pattern) || []).length;
  }
  if (fillerCount === 0) score += 8;
  else { score += Math.max(0, 8 - fillerCount * 2); issues.push('Remove filler words'); }

  // Jargon check (7 pts)
  let jargonCount = 0;
  for (const pattern of JARGON_PATTERNS) {
    jargonCount += (text.match(pattern) || []).length;
  }
  if (jargonCount === 0) score += 7;
  else { score += Math.max(0, 7 - jargonCount * 2); issues.push('Remove jargon'); }

  // Length check (5 pts)
  if (wordCount >= 8 && wordCount <= 25) score += 5;
  else if (wordCount > 35) issues.push('Too long - aim for 15-25 words');
  else if (wordCount < 8) { score += 2; issues.push('Too short - add more detail'); }
  else score += 3;

  // Active voice (5 pts)
  const hasPassive = /\b(was|were|been|being)\s+\w+ed\b/gi.test(text);
  if (!hasPassive) score += 5;
  else { score += 2; issues.push('Use active voice'); }

  return { score: Math.min(25, score), maxScore: 25, issues };
}

function scoreImpact(text) {
  let score = 0;
  const issues = [];

  // Business/customer impact (10 pts)
  const hasImpact = /\b(revenue|profit|cost|savings|efficiency|productivity|growth|ROI|customer|user|satisfaction)\b/gi.test(text);
  if (hasImpact) score += 10;
  else issues.push('Add business or customer impact');

  // Quantified impact (10 pts)
  const hasComparison = /\b(increased|decreased|reduced|improved|grew|doubled)\s+by\s+\d+/gi.test(text);
  const hasPercent = /\d+(\.\d+)?%/.test(text);
  const hasDollar = /\$[\d,]+/.test(text);
  if (hasComparison) score += 10;
  else if (hasPercent || hasDollar) score += 8;
  else if (/\d+/.test(text)) { score += 5; issues.push('Quantify the impact'); }
  else issues.push('Add quantified impact');

  // Scale (5 pts)
  const hasScale = /\b(company|organization|team|department|global|enterprise)\b/gi.test(text);
  if (hasScale) score += 5;
  else issues.push('Add context about scale');

  return { score: Math.min(25, score), maxScore: 25, issues };
}

function scoreAction(text) {
  let score = 0;
  const issues = [];
  const firstWord = text.toLowerCase().split(/\s+/)[0] || '';

  // Starts with strong verb (15 pts)
  const startsStrong = STRONG_VERBS.some(v => firstWord === v || firstWord === v + 'd' || firstWord === v + 'ed');
  if (startsStrong) score += 15;
  else if (/^(was|were|had|helped|assisted|worked|participated)/i.test(text)) {
    issues.push('Replace weak opening with strong action verb');
  } else {
    const hasStrong = STRONG_VERBS.some(v => new RegExp(`\\b${v}(d|ed)?\\b`, 'i').test(text));
    if (hasStrong) { score += 8; issues.push('Move action verb to the beginning'); }
    else issues.push('Start with a strong action verb');
  }

  // Strong verbs count (5 pts)
  const verbCount = STRONG_VERBS.filter(v => new RegExp(`\\b${v}(d|ed)?\\b`, 'i').test(text)).length;
  if (verbCount >= 2) score += 5;
  else if (verbCount === 1) score += 3;

  // Weak verbs (5 pts)
  const hasWeak = /\b(was|were|been|had|helped|assisted|worked on)\b/gi.test(text);
  if (!hasWeak) score += 5;
  else { score += Math.max(0, 3); issues.push('Replace weak verbs'); }

  return { score: Math.min(25, score), maxScore: 25, issues };
}

function scoreSpecificity(text) {
  let score = 0;
  const issues = [];

  // Quantified metrics (10 pts)
  const percentCount = (text.match(/\d+(\.\d+)?%/g) || []).length;
  const dollarCount = (text.match(/\$[\d,]+/g) || []).length;
  const timeCount = (text.match(/\d+\s*(hour|day|week|month|year)s?/gi) || []).length;
  const metricCount = percentCount + dollarCount + timeCount;

  if (metricCount >= 2) score += 10;
  else if (metricCount === 1) { score += 6; issues.push('Add more metrics'); }
  else if (/\d+/.test(text)) { score += 3; issues.push('Convert numbers to meaningful metrics'); }
  else issues.push('Add specific numbers and metrics');

  // Context (8 pts)
  const hasContext = /\b(at|for|with|across)\s+[A-Z]/i.test(text);
  const hasTeam = /\b(team|department|company|organization)\b/gi.test(text);
  if (hasContext && hasTeam) score += 8;
  else if (hasContext || hasTeam) { score += 5; issues.push('Add more context'); }
  else issues.push('Add context about scope');

  // Timeframe (7 pts)
  if (timeCount > 0 || /\b(quarter|q[1-4]|annually|monthly)\b/gi.test(text)) score += 7;
  else issues.push('Add timeframe');

  return { score: Math.min(25, score), maxScore: 25, issues };
}

/**
 * Validate a power statement
 * @param {string} text - Power statement content
 * @returns {Object} Validation results
 */
export function validatePowerStatement(text) {
  if (!text || typeof text !== 'string' || text.trim().length < 10) {
    return {
      totalScore: 0,
      clarity: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      impact: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      action: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      specificity: { score: 0, maxScore: 25, issues: ['No content to validate'] }
    };
  }

  const clarity = scoreClarity(text);
  const impact = scoreImpact(text);
  const action = scoreAction(text);
  const specificity = scoreSpecificity(text);

  return {
    totalScore: clarity.score + impact.score + action.score + specificity.score,
    clarity, impact, action, specificity
  };
}

export function getScoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}

