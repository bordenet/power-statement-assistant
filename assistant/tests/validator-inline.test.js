/**
 * Tests for validator-inline.js
 * Power Statement inline validation
 */
import { validateDocument, getScoreColor, getScoreLabel } from '../../shared/js/validator-inline.js';

describe('Inline Power Statement Validator', () => {
  describe('validateDocument', () => {
    test('should return zero scores for empty content', () => {
      const result = validateDocument('');
      expect(result.totalScore).toBe(0);
      expect(result.clarity.score).toBe(0);
      expect(result.impact.score).toBe(0);
      expect(result.action.score).toBe(0);
      expect(result.specificity.score).toBe(0);
    });

    test('should return low scores for short content', () => {
      const result = validateDocument('Too short');
      // Full validator may return non-zero score for minimal content
      expect(result.totalScore).toBeLessThan(50);
    });

    test('should return zero scores for null', () => {
      const result = validateDocument(null);
      expect(result.totalScore).toBe(0);
    });

    test('should score a strong power statement', () => {
      const goodStatement = `
Led cross-functional team of 8 engineers to deliver platform migration.
Achieved 40% reduction in infrastructure costs, saving $500K annually.
Implemented automated CI/CD pipeline reducing deployment time by 75%.
Drove adoption across 12 teams, improving developer productivity by 30%.
      `.repeat(3);
      const result = validateDocument(goodStatement);
      expect(result.totalScore).toBeGreaterThan(50);
      expect(result.clarity.score).toBeGreaterThan(0);
      expect(result.impact.score).toBeGreaterThan(0);
      expect(result.action.score).toBeGreaterThan(0);
      expect(result.specificity.score).toBeGreaterThan(0);
    });

    test('should return issues for weak content', () => {
      const weakStatement = 'Worked on various projects and helped the team.'.repeat(10);
      const result = validateDocument(weakStatement);
      const totalIssues = [
        ...result.clarity.issues,
        ...result.impact.issues,
        ...result.action.issues,
        ...result.specificity.issues
      ];
      expect(totalIssues.length).toBeGreaterThan(0);
    });

    test('should penalize jargon and filler words', () => {
      const jargonStatement = `
Basically synergized cross-functional stakeholders to leverage best practices.
Actually utilized paradigm shifts to enable transformational change.
Essentially drove innovation across the organization very significantly.
      `.repeat(3);
      const result = validateDocument(jargonStatement);
      expect(result.clarity.score).toBeLessThan(result.clarity.maxScore);
    });
  });

  describe('getScoreColor', () => {
    test('should return green for high scores', () => {
      expect(getScoreColor(85)).toBe('green');
      expect(getScoreColor(70)).toBe('green');
    });

    test('should return yellow for medium scores', () => {
      expect(getScoreColor(55)).toBe('yellow');
      expect(getScoreColor(50)).toBe('yellow');
    });

    test('should return orange for low-medium scores', () => {
      expect(getScoreColor(35)).toBe('orange');
      expect(getScoreColor(30)).toBe('orange');
    });

    test('should return red for low scores', () => {
      expect(getScoreColor(25)).toBe('red');
    });
  });

  describe('getScoreLabel', () => {
    test('should return Excellent for high scores', () => {
      expect(getScoreLabel(85)).toBe('Excellent');
    });

    test('should return Ready for good scores', () => {
      expect(getScoreLabel(75)).toBe('Ready');
    });

    test('should return Needs Work for medium scores', () => {
      expect(getScoreLabel(55)).toBe('Needs Work');
    });

    test('should return Draft for low scores', () => {
      expect(getScoreLabel(35)).toBe('Draft');
    });

    test('should return Incomplete for very low scores', () => {
      expect(getScoreLabel(25)).toBe('Incomplete');
    });
  });
});

