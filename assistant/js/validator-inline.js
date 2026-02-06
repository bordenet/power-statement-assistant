/**
 * Power Statement Validator - Scoring Logic
 *
 * Power statements are impactful achievement statements that follow the format:
 * "Action verb + accomplishment + measurable result"
 *
 * Scoring Dimensions:
 * 1. Clarity (25 pts) - Clear, concise language without jargon or filler
 * 2. Impact (25 pts) - Demonstrates measurable business/customer impact
 * 3. Action (25 pts) - Uses strong action verbs, active voice
 * 4. Specificity (25 pts) - Includes specific details, numbers, and context
 */

import { calculateSlopScore, getSlopPenalty } from './slop-detection.js';

// Re-export for direct access
export { calculateSlopScore };

// ============================================================================
// Constants
// ============================================================================

// Strong action verbs for power statements
const STRONG_ACTION_VERBS = [
  'achieved', 'accelerated', 'accomplished', 'acquired', 'activated', 'adapted',
  'administered', 'advanced', 'advised', 'advocated', 'allocated', 'amplified',
  'analyzed', 'anchored', 'applied', 'appointed', 'appraised', 'approved',
  'architected', 'arranged', 'assembled', 'assessed', 'assigned', 'attained',
  'audited', 'authored', 'automated', 'awarded', 'balanced', 'boosted',
  'bridged', 'budgeted', 'built', 'calculated', 'captured', 'cataloged',
  'centralized', 'chaired', 'championed', 'changed', 'clarified', 'coached',
  'collaborated', 'combined', 'commanded', 'communicated', 'compared', 'compiled',
  'completed', 'composed', 'computed', 'conceived', 'conceptualized', 'condensed',
  'conducted', 'configured', 'conserved', 'consolidated', 'constructed', 'consulted',
  'contracted', 'contributed', 'controlled', 'converted', 'convinced', 'coordinated',
  'corrected', 'counseled', 'created', 'critiqued', 'cultivated', 'customized',
  'cut', 'debugged', 'decentralized', 'decreased', 'defined', 'delegated',
  'delivered', 'demonstrated', 'deployed', 'designed', 'detected', 'determined',
  'developed', 'devised', 'diagnosed', 'directed', 'discovered', 'dispatched',
  'displayed', 'dissected', 'distributed', 'diversified', 'diverted', 'documented',
  'doubled', 'drafted', 'drove', 'earned', 'edited', 'educated', 'effected',
  'elected', 'elevated', 'eliminated', 'enabled', 'encouraged', 'endorsed',
  'enforced', 'engaged', 'engineered', 'enhanced', 'enlarged', 'enlisted',
  'ensured', 'established', 'estimated', 'evaluated', 'examined', 'exceeded',
  'executed', 'expanded', 'expedited', 'experimented', 'explained', 'explored',
  'expressed', 'extended', 'extracted', 'fabricated', 'facilitated', 'fashioned',
  'finalized', 'fixed', 'focused', 'forecasted', 'forged', 'formalized',
  'formed', 'formulated', 'fortified', 'fostered', 'founded', 'fulfilled',
  'gained', 'gathered', 'generated', 'governed', 'grew', 'guided', 'halved',
  'handled', 'headed', 'heightened', 'helped', 'hired', 'hosted', 'identified',
  'illustrated', 'implemented', 'improved', 'improvised', 'inaugurated', 'increased',
  'incubated', 'influenced', 'informed', 'initiated', 'innovated', 'inspected',
  'inspired', 'installed', 'instituted', 'instructed', 'integrated', 'intensified',
  'interpreted', 'interviewed', 'introduced', 'invented', 'invested', 'investigated',
  'launched', 'led', 'leveraged', 'licensed', 'lifted', 'linked', 'lobbied',
  'localized', 'located', 'logged', 'lowered', 'maintained', 'managed', 'mapped',
  'marketed', 'mastered', 'maximized', 'measured', 'mediated', 'mentored', 'merged',
  'minimized', 'mobilized', 'modeled', 'moderated', 'modernized', 'modified',
  'monitored', 'motivated', 'multiplied', 'navigated', 'negotiated', 'netted',
  'nurtured', 'observed', 'obtained', 'opened', 'operated', 'optimized', 'orchestrated',
  'ordered', 'organized', 'originated', 'outlined', 'outpaced', 'outperformed',
  'overcame', 'overhauled', 'oversaw', 'partnered', 'passed', 'performed', 'persuaded',
  'piloted', 'pioneered', 'placed', 'planned', 'positioned', 'predicted', 'prepared',
  'presented', 'preserved', 'presided', 'prevented', 'prioritized', 'processed',
  'procured', 'produced', 'profiled', 'programmed', 'projected', 'promoted',
  'proposed', 'protected', 'proved', 'provided', 'publicized', 'published',
  'purchased', 'pursued', 'qualified', 'quantified', 'questioned', 'raised',
  'ranked', 'rated', 'reached', 'realigned', 'realized', 'rearranged', 'rebuilt',
  'recaptured', 'received', 'recognized', 'recommended', 'reconciled', 'reconstructed',
  'recorded', 'recovered', 'recruited', 'rectified', 'redesigned', 'reduced',
  'reengineered', 'referred', 'refined', 'reformed', 'refurbished', 'regained',
  'registered', 'regulated', 'rehabilitated', 'reinforced', 'reinstated', 'rejuvenated',
  'related', 'released', 'remodeled', 'renegotiated', 'renewed', 'reorganized',
  'repaired', 'replaced', 'replicated', 'reported', 'repositioned', 'represented',
  'reproduced', 'requested', 'researched', 'reshaped', 'resolved', 'responded',
  'restored', 'restructured', 'retained', 'retrieved', 'revamped', 'revealed',
  'reversed', 'reviewed', 'revised', 'revitalized', 'revolutionized', 'rewarded',
  'routed', 'safeguarded', 'salvaged', 'saved', 'scheduled', 'screened', 'secured',
  'segmented', 'selected', 'separated', 'served', 'serviced', 'set', 'settled',
  'shaped', 'shared', 'sharpened', 'shipped', 'shortened', 'showcased', 'simplified',
  'simulated', 'slashed', 'sold', 'solicited', 'solved', 'sorted', 'sourced',
  'sparked', 'spearheaded', 'specialized', 'specified', 'sponsored', 'stabilized',
  'staffed', 'staged', 'standardized', 'started', 'steered', 'stimulated',
  'strategized', 'streamlined', 'strengthened', 'stretched', 'structured', 'studied',
  'submitted', 'succeeded', 'summarized', 'superseded', 'supervised', 'supplied',
  'supported', 'surpassed', 'surveyed', 'sustained', 'synchronized', 'synthesized',
  'systematized', 'tabulated', 'tailored', 'targeted', 'taught', 'terminated',
  'tested', 'tightened', 'traced', 'tracked', 'traded', 'trained', 'transcribed',
  'transferred', 'transformed', 'transitioned', 'translated', 'transmitted',
  'transported', 'traveled', 'treated', 'trimmed', 'tripled', 'troubleshot',
  'turned', 'tutored', 'uncovered', 'undertook', 'unified', 'united', 'updated',
  'upgraded', 'upheld', 'utilized', 'validated', 'valued', 'verified', 'visualized',
  'volunteered', 'widened', 'won', 'worked', 'wrote'
];

// Weak verbs to avoid
const WEAK_VERBS = [
  'was', 'were', 'been', 'being', 'am', 'is', 'are',
  'had', 'has', 'have', 'having',
  'did', 'does', 'do', 'doing',
  'helped', 'assisted', 'supported', 'worked on', 'was responsible for',
  'participated in', 'was involved in', 'contributed to'
];

// Filler words and phrases to avoid
const FILLER_PATTERNS = [
  /\b(very|really|quite|somewhat|rather|fairly|pretty much)\b/gi,
  /\b(basically|essentially|actually|literally|virtually)\b/gi,
  /\b(in order to|due to the fact that|for the purpose of)\b/gi,
  /\b(a lot of|lots of|tons of|bunch of)\b/gi,
  /\b(thing|stuff|something|somehow)\b/gi
];

// Jargon and buzzwords to flag
const JARGON_PATTERNS = [
  /\b(synergy|synergize|synergistic)\b/gi,
  /\b(leverage|leveraging|leveraged)\b/gi,
  /\b(paradigm|paradigm shift)\b/gi,
  /\b(best.in.class|world.class|cutting.edge|state.of.the.art)\b/gi,
  /\b(move the needle|low.hanging fruit|boil the ocean)\b/gi,
  /\b(circle back|touch base|take offline)\b/gi,
  /\b(bandwidth|bandwidth to)\b/gi,
  /\b(deep dive|drill down)\b/gi
];

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect strong action verbs in text
 * @param {string} text - Text to analyze
 * @returns {Object} Action verb detection results
 */
export function detectActionVerbs(text) {
  const words = text.toLowerCase().split(/\s+/);
  const firstWord = words[0] || '';

  // Check if starts with strong action verb
  const startsWithStrongVerb = STRONG_ACTION_VERBS.some(verb =>
    firstWord === verb || firstWord === verb + 'd' || firstWord === verb + 'ed'
  );

  // Find all strong verbs in text
  const strongVerbsFound = STRONG_ACTION_VERBS.filter(verb => {
    const regex = new RegExp(`\\b${verb}(d|ed)?\\b`, 'i');
    return regex.test(text);
  });

  // Check for weak verbs
  const weakVerbsFound = WEAK_VERBS.filter(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    return regex.test(text);
  });

  // Check if statement starts with weak verb pattern
  const startsWithWeakPattern = /^(was|were|had|have|helped|assisted|worked|participated|contributed)/i.test(text);

  return {
    startsWithStrongVerb,
    strongVerbCount: strongVerbsFound.length,
    strongVerbsFound: strongVerbsFound.slice(0, 5),
    hasWeakVerbs: weakVerbsFound.length > 0,
    weakVerbCount: weakVerbsFound.length,
    weakVerbsFound,
    startsWithWeakPattern,
    indicators: [
      startsWithStrongVerb && 'Starts with strong action verb',
      strongVerbsFound.length > 0 && `${strongVerbsFound.length} strong action verbs`,
      weakVerbsFound.length > 0 && `${weakVerbsFound.length} weak verbs detected`,
      startsWithWeakPattern && 'Starts with weak verb pattern'
    ].filter(Boolean)
  };
}

/**
 * Detect quantified metrics and specificity in text
 * @param {string} text - Text to analyze
 * @returns {Object} Specificity detection results
 */
export function detectSpecificity(text) {
  // Numbers and percentages
  const numberMatches = text.match(/\d+(\.\d+)?/g) || [];
  const percentageMatches = text.match(/\d+(\.\d+)?%/g) || [];
  const dollarMatches = text.match(/\$[\d,]+(\.\d+)?[KMB]?|\d+(\.\d+)?\s*(million|billion|thousand)/gi) || [];

  // Time-based metrics
  const timeMatches = text.match(/\d+\s*(hour|day|week|month|year|minute|second)s?/gi) || [];

  // Quantity metrics
  const quantityMatches = text.match(/\d+\s*(user|customer|client|team|member|employee|project|product|feature|system|application)s?/gi) || [];

  // Comparison words (indicates relative improvement)
  const comparisonMatches = text.match(/\b(increased|decreased|reduced|improved|grew|doubled|tripled|halved|cut)\s+by\s+\d+/gi) || [];

  // Context indicators (role, company, team size)
  // Match "At Acme Corp", "for TechCorp", "within the organization", etc.
  const hasContext = /\b(at|for|with|across|within)\s+[A-Z][a-zA-Z]*/i.test(text);
  const hasTeamContext = /\b(team|department|organization|company|division|corp|inc|llc)\b/gi.test(text);

  return {
    hasNumbers: numberMatches.length > 0,
    numberCount: numberMatches.length,
    hasPercentages: percentageMatches.length > 0,
    percentageCount: percentageMatches.length,
    hasDollarAmounts: dollarMatches.length > 0,
    dollarCount: dollarMatches.length,
    hasTimeMetrics: timeMatches.length > 0,
    timeCount: timeMatches.length,
    hasQuantityMetrics: quantityMatches.length > 0,
    quantityCount: quantityMatches.length,
    hasComparisons: comparisonMatches.length > 0,
    comparisonCount: comparisonMatches.length,
    hasContext,
    hasTeamContext,
    indicators: [
      numberMatches.length > 0 && `${numberMatches.length} numeric values`,
      percentageMatches.length > 0 && `${percentageMatches.length} percentages`,
      dollarMatches.length > 0 && 'Dollar amounts present',
      timeMatches.length > 0 && 'Time-based metrics',
      comparisonMatches.length > 0 && 'Quantified comparisons',
      hasContext && 'Contextual details present',
      hasTeamContext && 'Team/org context provided'
    ].filter(Boolean)
  };
}

/**
 * Detect impact indicators in text
 * @param {string} text - Text to analyze
 * @returns {Object} Impact detection results
 */
export function detectImpact(text) {
  // Business impact words
  const businessImpactMatches = text.match(/\b(revenue|profit|cost|savings|efficiency|productivity|growth|ROI|return)\b/gi) || [];

  // Customer impact words
  const customerImpactMatches = text.match(/\b(customer|user|client|satisfaction|experience|retention|acquisition|engagement|NPS)\b/gi) || [];

  // Scale/scope indicators
  const scaleMatches = text.match(/\b(company.wide|organization.wide|enterprise|global|national|regional|cross.functional)\b/gi) || [];

  // Result indicators
  const resultMatches = text.match(/\b(resulting in|leading to|which|enabling|driving|achieving|delivering)\b/gi) || [];

  // Improvement indicators
  const improvementMatches = text.match(/\b(improved|increased|reduced|decreased|enhanced|accelerated|streamlined|optimized)\b/gi) || [];

  return {
    hasBusinessImpact: businessImpactMatches.length > 0,
    businessImpactCount: businessImpactMatches.length,
    hasCustomerImpact: customerImpactMatches.length > 0,
    customerImpactCount: customerImpactMatches.length,
    hasScale: scaleMatches.length > 0,
    scaleCount: scaleMatches.length,
    hasResultLanguage: resultMatches.length > 0,
    resultCount: resultMatches.length,
    hasImprovementLanguage: improvementMatches.length > 0,
    improvementCount: improvementMatches.length,
    indicators: [
      businessImpactMatches.length > 0 && 'Business impact mentioned',
      customerImpactMatches.length > 0 && 'Customer impact mentioned',
      scaleMatches.length > 0 && 'Scale/scope indicated',
      resultMatches.length > 0 && 'Result language present',
      improvementMatches.length > 0 && 'Improvement language present'
    ].filter(Boolean)
  };
}

/**
 * Detect clarity issues in text
 * @param {string} text - Text to analyze
 * @returns {Object} Clarity detection results
 */
export function detectClarity(text) {
  // Check for filler words
  let fillerCount = 0;
  const fillersFound = [];
  for (const pattern of FILLER_PATTERNS) {
    const matches = text.match(pattern) || [];
    fillerCount += matches.length;
    fillersFound.push(...matches);
  }

  // Check for jargon
  let jargonCount = 0;
  const jargonFound = [];
  for (const pattern of JARGON_PATTERNS) {
    const matches = text.match(pattern) || [];
    jargonCount += matches.length;
    jargonFound.push(...matches);
  }

  // Check sentence length (power statements should be concise)
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const isConcise = wordCount <= 25;
  const isTooShort = wordCount < 8;
  const isTooLong = wordCount > 35;

  // Check for passive voice indicators
  const passiveMatches = text.match(/\b(was|were|been|being)\s+\w+ed\b/gi) || [];
  const hasPassiveVoice = passiveMatches.length > 0;

  return {
    hasFillers: fillerCount > 0,
    fillerCount,
    fillersFound: [...new Set(fillersFound)],
    hasJargon: jargonCount > 0,
    jargonCount,
    jargonFound: [...new Set(jargonFound)],
    wordCount,
    isConcise,
    isTooShort,
    isTooLong,
    hasPassiveVoice,
    passiveCount: passiveMatches.length,
    indicators: [
      fillerCount === 0 && 'No filler words',
      jargonCount === 0 && 'No jargon/buzzwords',
      isConcise && 'Concise length',
      !hasPassiveVoice && 'Active voice',
      fillerCount > 0 && `${fillerCount} filler words detected`,
      jargonCount > 0 && `${jargonCount} jargon terms detected`,
      isTooLong && 'Statement too long',
      isTooShort && 'Statement too short',
      hasPassiveVoice && 'Passive voice detected'
    ].filter(Boolean)
  };
}

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Score clarity (25 pts max)
 * @param {string} text - Power statement content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreClarity(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const clarityDetection = detectClarity(text);

  // No filler words (0-8 pts)
  if (!clarityDetection.hasFillers) {
    score += 8;
    strengths.push('No filler words - clean, direct language');
  } else {
    score += Math.max(0, 8 - clarityDetection.fillerCount * 2);
    issues.push(`Remove filler words: ${clarityDetection.fillersFound.slice(0, 3).join(', ')}`);
  }

  // No jargon/buzzwords (0-7 pts)
  if (!clarityDetection.hasJargon) {
    score += 7;
    strengths.push('No jargon or buzzwords');
  } else {
    score += Math.max(0, 7 - clarityDetection.jargonCount * 2);
    issues.push(`Remove jargon: ${clarityDetection.jargonFound.slice(0, 3).join(', ')}`);
  }

  // Concise length (0-5 pts)
  if (clarityDetection.isConcise && !clarityDetection.isTooShort) {
    score += 5;
    strengths.push(`Concise (${clarityDetection.wordCount} words)`);
  } else if (clarityDetection.isTooLong) {
    issues.push(`Too long (${clarityDetection.wordCount} words) - aim for 15-25 words`);
  } else if (clarityDetection.isTooShort) {
    score += 2;
    issues.push(`Too short (${clarityDetection.wordCount} words) - add more detail`);
  } else {
    score += 3;
  }

  // Active voice (0-5 pts)
  if (!clarityDetection.hasPassiveVoice) {
    score += 5;
    strengths.push('Uses active voice');
  } else {
    score += 2;
    issues.push('Rewrite in active voice - avoid "was/were + verb"');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score impact (25 pts max)
 * @param {string} text - Power statement content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreImpact(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const impactDetection = detectImpact(text);
  const specificityDetection = detectSpecificity(text);

  // Business or customer impact mentioned (0-10 pts)
  if (impactDetection.hasBusinessImpact || impactDetection.hasCustomerImpact) {
    score += 10;
    if (impactDetection.hasBusinessImpact) {
      strengths.push('Business impact clearly stated');
    }
    if (impactDetection.hasCustomerImpact) {
      strengths.push('Customer impact mentioned');
    }
  } else {
    issues.push('Add business or customer impact - what was the result?');
  }

  // Quantified impact (0-10 pts)
  if (specificityDetection.hasComparisons) {
    score += 10;
    strengths.push('Impact is quantified with comparisons');
  } else if (specificityDetection.hasPercentages || specificityDetection.hasDollarAmounts) {
    score += 8;
    strengths.push('Impact includes metrics');
  } else if (specificityDetection.hasNumbers) {
    score += 5;
    issues.push('Quantify the impact - add percentages or dollar amounts');
  } else {
    issues.push('Add quantified impact - how much did you improve/save/grow?');
  }

  // Scale/scope indicated (0-5 pts)
  if (impactDetection.hasScale || specificityDetection.hasTeamContext) {
    score += 5;
    strengths.push('Scale/scope of impact is clear');
  } else {
    issues.push('Add context about scale - team size, company scope, etc.');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score action (25 pts max)
 * @param {string} text - Power statement content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreAction(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const actionDetection = detectActionVerbs(text);

  // Starts with strong action verb (0-15 pts)
  if (actionDetection.startsWithStrongVerb) {
    score += 15;
    strengths.push('Starts with strong action verb');
  } else if (actionDetection.startsWithWeakPattern) {
    issues.push('Replace weak opening ("was responsible for", "helped") with strong action verb');
  } else if (actionDetection.strongVerbCount > 0) {
    score += 8;
    issues.push('Move action verb to the beginning of the statement');
  } else {
    issues.push('Start with a strong action verb (Led, Developed, Achieved, etc.)');
  }

  // Uses strong verbs throughout (0-5 pts)
  if (actionDetection.strongVerbCount >= 2) {
    score += 5;
    strengths.push(`Uses ${actionDetection.strongVerbCount} strong action verbs`);
  } else if (actionDetection.strongVerbCount === 1) {
    score += 3;
  }

  // Avoids weak verbs (0-5 pts)
  if (!actionDetection.hasWeakVerbs) {
    score += 5;
    strengths.push('No weak verbs');
  } else {
    score += Math.max(0, 5 - actionDetection.weakVerbCount);
    issues.push(`Replace weak verbs: ${actionDetection.weakVerbsFound.slice(0, 3).join(', ')}`);
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score specificity (25 pts max)
 * @param {string} text - Power statement content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreSpecificity(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const specificityDetection = detectSpecificity(text);

  // Has quantified metrics (0-10 pts)
  const metricCount = specificityDetection.percentageCount +
                      specificityDetection.dollarCount +
                      specificityDetection.timeCount +
                      specificityDetection.quantityCount;

  if (metricCount >= 2) {
    score += 10;
    strengths.push(`${metricCount} specific metrics included`);
  } else if (metricCount === 1) {
    score += 6;
    issues.push('Add more specific metrics - aim for 2+ quantified results');
  } else if (specificityDetection.hasNumbers) {
    score += 3;
    issues.push('Convert numbers to meaningful metrics (%, $, time saved, etc.)');
  } else {
    issues.push('Add specific numbers and metrics');
  }

  // Has context (0-8 pts)
  if (specificityDetection.hasContext && specificityDetection.hasTeamContext) {
    score += 8;
    strengths.push('Clear context provided');
  } else if (specificityDetection.hasContext || specificityDetection.hasTeamContext) {
    score += 5;
    issues.push('Add more context - company, team size, or scope');
  } else {
    issues.push('Add context - where did this happen? What was the scope?');
  }

  // Has time-based specificity (0-7 pts)
  if (specificityDetection.hasTimeMetrics) {
    score += 7;
    strengths.push('Includes timeframe or time-based metrics');
  } else {
    issues.push('Add timeframe - when did this happen? How long did it take?');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate a power statement and return comprehensive scoring results
 * @param {string} text - Power statement content
 * @returns {Object} Complete validation results
 */
export function validatePowerStatement(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      clarity: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      impact: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      action: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      specificity: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] }
    };
  }

  const clarity = scoreClarity(text);
  const impact = scoreImpact(text);
  const action = scoreAction(text);
  const specificity = scoreSpecificity(text);

  // AI slop detection - power statements must be crisp and specific
  const slopPenalty = getSlopPenalty(text);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    // Apply penalty to total score (aligned with inline validator)
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  const totalScore = Math.max(0,
    clarity.score + impact.score + action.score + specificity.score - slopDeduction
  );

  return {
    totalScore,
    clarity,
    impact,
    action,
    specificity,
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    }
  };
}

// Alias for backward compatibility with assistant UI
export function validateDocument(text) {
  return validatePowerStatement(text);
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
