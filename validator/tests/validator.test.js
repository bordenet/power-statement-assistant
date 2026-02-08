/**
 * Power Statement Validator tests - Comprehensive scoring tests
 * Tests all exported functions for scoring power statements
 */

import {
  validatePowerStatement,
  scoreClarity,
  scoreImpact,
  scoreAction,
  scoreSpecificity,
  detectActionVerbs,
  detectSpecificity,
  detectImpact,
  detectClarity
} from '../js/validator.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixtures = JSON.parse(
  readFileSync(join(__dirname, '../testdata/scoring-fixtures.json'), 'utf-8')
);

// ============================================================================
// validatePowerStatement tests
// ============================================================================
describe('validatePowerStatement', () => {
  describe('empty/invalid input', () => {
    test('returns zero score for empty string', () => {
      const result = validatePowerStatement('');
      expect(result.totalScore).toBe(0);
    });

    test('returns zero score for null', () => {
      const result = validatePowerStatement(null);
      expect(result.totalScore).toBe(0);
    });

    test('returns zero score for undefined', () => {
      const result = validatePowerStatement(undefined);
      expect(result.totalScore).toBe(0);
    });

    test('returns all dimensions with issues for empty input', () => {
      const result = validatePowerStatement('');
      expect(result.clarity.issues).toContain('No content to validate');
      expect(result.impact.issues).toContain('No content to validate');
      expect(result.action.issues).toContain('No content to validate');
      expect(result.specificity.issues).toContain('No content to validate');
    });
  });

  describe('fixture-based scoring', () => {
    test('scores weak power statement correctly', () => {
      const result = validatePowerStatement(fixtures.weak.content);
      expect(result.totalScore).toBeGreaterThanOrEqual(fixtures.weak.expectedMinScore);
      expect(result.totalScore).toBeLessThanOrEqual(fixtures.weak.expectedMaxScore);
    });

    test('scores excellent power statement correctly', () => {
      const result = validatePowerStatement(fixtures.excellent.content);
      expect(result.totalScore).toBeGreaterThanOrEqual(fixtures.excellent.expectedMinScore);
      expect(result.totalScore).toBeLessThanOrEqual(fixtures.excellent.expectedMaxScore);
    });

    test('scores needsMetrics power statement correctly', () => {
      const result = validatePowerStatement(fixtures.needsMetrics.content);
      expect(result.totalScore).toBeGreaterThanOrEqual(fixtures.needsMetrics.expectedMinScore);
      expect(result.totalScore).toBeLessThanOrEqual(fixtures.needsMetrics.expectedMaxScore);
    });
  });

  describe('score structure', () => {
    test('returns all required dimensions', () => {
      const result = validatePowerStatement('Led a team to deliver results.');
      expect(result).toHaveProperty('totalScore');
      expect(result).toHaveProperty('clarity');
      expect(result).toHaveProperty('impact');
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('specificity');
    });

    test('each dimension has score, maxScore, issues, strengths', () => {
      const result = validatePowerStatement('Led a team to deliver results.');
      for (const dim of ['clarity', 'impact', 'action', 'specificity']) {
        expect(result[dim]).toHaveProperty('score');
        expect(result[dim]).toHaveProperty('maxScore');
        expect(result[dim]).toHaveProperty('issues');
        expect(result[dim]).toHaveProperty('strengths');
      }
    });

    test('total score equals sum of dimension scores', () => {
      const result = validatePowerStatement(fixtures.excellent.content);
      const sum = result.clarity.score + result.impact.score +
                  result.action.score + result.specificity.score;
      expect(result.totalScore).toBe(sum);
    });
  });
});

// ============================================================================
// scoreClarity tests
// ============================================================================
describe('scoreClarity', () => {
  test('maxScore is 25', () => {
    const result = scoreClarity('');
    expect(result.maxScore).toBe(25);
  });

  test('penalizes filler words', () => {
    const clean = scoreClarity('Led team to deliver platform.');
    const withFillers = scoreClarity('Basically, I very essentially led a team to deliver a platform.');
    expect(clean.score).toBeGreaterThan(withFillers.score);
  });

  test('penalizes jargon', () => {
    const clean = scoreClarity('Led team to improve processes.');
    const withJargon = scoreClarity('Leveraged synergies to create best-in-class paradigm shift.');
    expect(clean.score).toBeGreaterThan(withJargon.score);
  });

  test('penalizes passive voice', () => {
    // Use statements of similar length to isolate passive voice effect
    const active = scoreClarity('Led a cross-functional team to deliver key results.');
    const passive = scoreClarity('Key results were delivered by a team that was led.');
    expect(active.score).toBeGreaterThan(passive.score);
  });
});

// ============================================================================
// scoreImpact tests
// ============================================================================
describe('scoreImpact', () => {
  test('maxScore is 25', () => {
    const result = scoreImpact('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for business impact', () => {
    const withImpact = scoreImpact('Increased revenue by 40% through new sales strategy.');
    const withoutImpact = scoreImpact('Worked on some projects.');
    expect(withImpact.score).toBeGreaterThan(withoutImpact.score);
  });

  test('awards points for customer impact', () => {
    const withCustomer = scoreImpact('Improved customer satisfaction scores by 25%.');
    const withoutCustomer = scoreImpact('Made some changes to the system.');
    expect(withCustomer.score).toBeGreaterThan(withoutCustomer.score);
  });
});

// ============================================================================
// scoreAction tests
// ============================================================================
describe('scoreAction', () => {
  test('maxScore is 25', () => {
    const result = scoreAction('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for starting with strong action verb', () => {
    const strongStart = scoreAction('Led cross-functional team to deliver platform.');
    const weakStart = scoreAction('Was responsible for leading a team.');
    expect(strongStart.score).toBeGreaterThan(weakStart.score);
  });

  test('penalizes weak verbs', () => {
    const strong = scoreAction('Delivered scalable architecture for enterprise clients.');
    const weak = scoreAction('Helped with various projects and assisted the team.');
    expect(strong.score).toBeGreaterThan(weak.score);
  });
});

// ============================================================================
// scoreSpecificity tests
// ============================================================================
describe('scoreSpecificity', () => {
  test('maxScore is 25', () => {
    const result = scoreSpecificity('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for quantified metrics', () => {
    const withMetrics = scoreSpecificity('Reduced latency by 50% and increased throughput by 200%.');
    const withoutMetrics = scoreSpecificity('Improved system performance significantly.');
    expect(withMetrics.score).toBeGreaterThan(withoutMetrics.score);
  });

  test('awards points for context', () => {
    const withContext = scoreSpecificity('At TechCorp, led a team of 15 engineers to deliver platform.');
    const withoutContext = scoreSpecificity('Led team to deliver platform.');
    expect(withContext.score).toBeGreaterThan(withoutContext.score);
  });

  test('awards points for timeframe', () => {
    const withTime = scoreSpecificity('Completed project in 6 months, ahead of 9-month deadline.');
    const withoutTime = scoreSpecificity('Completed project ahead of deadline.');
    expect(withTime.score).toBeGreaterThan(withoutTime.score);
  });
});

// ============================================================================
// Detection function tests
// ============================================================================
describe('detectActionVerbs', () => {
  test('detects strong action verb at start', () => {
    const result = detectActionVerbs('Led team to deliver results.');
    expect(result.startsWithStrongVerb).toBe(true);
  });

  test('detects weak verb patterns', () => {
    const result = detectActionVerbs('Was responsible for managing the team.');
    expect(result.startsWithWeakPattern).toBe(true);
  });

  test('counts strong verbs', () => {
    const result = detectActionVerbs('Led team to develop and deliver innovative solutions.');
    expect(result.strongVerbCount).toBeGreaterThan(0);
  });

  test('finds weak verbs', () => {
    const result = detectActionVerbs('Helped and assisted with various projects.');
    expect(result.hasWeakVerbs).toBe(true);
  });
});

describe('detectSpecificity', () => {
  test('detects numbers', () => {
    const result = detectSpecificity('Managed team of 15 engineers.');
    expect(result.hasNumbers).toBe(true);
  });

  test('detects percentages', () => {
    const result = detectSpecificity('Improved performance by 40%.');
    expect(result.hasPercentages).toBe(true);
  });

  test('detects dollar amounts', () => {
    const result = detectSpecificity('Generated $2 million in revenue.');
    expect(result.hasDollarAmounts).toBe(true);
  });

  test('detects time metrics', () => {
    const result = detectSpecificity('Reduced processing time by 3 hours per day.');
    expect(result.hasTimeMetrics).toBe(true);
  });

  test('detects context', () => {
    const result = detectSpecificity('At Acme Corp, led the engineering team.');
    expect(result.hasContext).toBe(true);
  });
});

describe('detectImpact', () => {
  test('detects business impact', () => {
    const result = detectImpact('Increased revenue and reduced costs significantly.');
    expect(result.hasBusinessImpact).toBe(true);
  });

  test('detects customer impact', () => {
    const result = detectImpact('Improved customer satisfaction and user experience.');
    expect(result.hasCustomerImpact).toBe(true);
  });

  test('detects scale', () => {
    const result = detectImpact('Company-wide initiative affecting global operations.');
    expect(result.hasScale).toBe(true);
  });

  test('detects improvement language', () => {
    const result = detectImpact('Improved, increased, and optimized key processes.');
    expect(result.hasImprovementLanguage).toBe(true);
  });
});

describe('detectClarity', () => {
  test('detects filler words', () => {
    const result = detectClarity('Basically, I very essentially worked on stuff.');
    expect(result.hasFillers).toBe(true);
    expect(result.fillerCount).toBeGreaterThan(0);
  });

  test('detects jargon', () => {
    const result = detectClarity('Leveraged synergies to create paradigm shift.');
    expect(result.hasJargon).toBe(true);
    expect(result.jargonCount).toBeGreaterThan(0);
  });

  test('identifies concise statements (sales domain: 50-150 words)', () => {
    // SALES DOMAIN: Power statements are 3-5 sentence paragraphs (50-150 words)
    // NOT resume bullets (15-25 words)
    const salesParagraph = `We help automotive dealerships increase their call conversion rates by 30% within the first quarter. Our AI-powered routing system analyzes incoming calls in real-time and connects prospects with the right specialist based on their specific needs. Dealerships using our platform have seen an average increase of $2.3M in annual revenue. The system integrates seamlessly with existing CRM platforms and requires no additional training for your team. We've helped over 200 dealerships across the country transform their sales process.`;
    const result = detectClarity(salesParagraph);
    expect(result.isConcise).toBe(true);
    expect(result.wordCount).toBeGreaterThanOrEqual(50);
    expect(result.wordCount).toBeLessThanOrEqual(150);
  });

  test('identifies too-long statements (sales domain: >200 words)', () => {
    // SALES DOMAIN: Too long is >200 words (verbose for sales messaging)
    const verboseStatement = `We help automotive dealerships increase their call conversion rates by implementing our comprehensive AI-powered routing system that analyzes incoming calls in real-time and connects prospects with the right specialist based on their specific needs and requirements. Our platform has been developed over many years of research and development, incorporating the latest advances in machine learning and natural language processing technology. Dealerships using our platform have seen an average increase of $2.3M in annual revenue, with some achieving even higher results depending on their market conditions and implementation approach. The system integrates seamlessly with existing CRM platforms including Salesforce, HubSpot, and many others, and requires no additional training for your team members. We've helped over 200 dealerships across the country transform their sales process and achieve remarkable results. Our customer success team provides ongoing support and optimization recommendations to ensure you get the maximum value from your investment. We also offer quarterly business reviews and performance analytics dashboards. Additionally, our platform includes advanced reporting features that allow you to track key performance indicators in real-time, including call volume, conversion rates, average handle time, and customer satisfaction scores. Our dedicated implementation team will work closely with your staff to ensure a smooth transition and provide comprehensive training materials.`;
    const result = detectClarity(verboseStatement);
    expect(result.isTooLong).toBe(true);
    expect(result.wordCount).toBeGreaterThan(200);
  });

  test('detects passive voice', () => {
    const result = detectClarity('The project was completed by the team.');
    expect(result.hasPassiveVoice).toBe(true);
  });
});
