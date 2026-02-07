/**
 * Tests for validator-inline.js - Power Statement Assistant
 *
 * Comprehensive tests for all scoring functions:
 * - Clarity (25 pts)
 * - Impact (25 pts)
 * - Action (25 pts)
 * - Specificity (25 pts)
 */

import {
  validateDocument,
  getScoreColor,
  getScoreLabel,
  scoreClarity,
  scoreImpact,
  scoreAction,
  scoreSpecificity,
  detectActionVerbs,
  detectSpecificity,
  detectImpact,
  detectClarity
} from '../../shared/js/validator-inline.js';

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

// ============================================================================
// Scoring Function Tests
// ============================================================================

describe('scoreClarity', () => {
  test('should detect clear structure', () => {
    const content = `
Led cross-functional team of 8 engineers to deliver platform migration.
Achieved measurable results with clear outcomes.
`.repeat(2);
    const result = scoreClarity(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should penalize jargon and filler words', () => {
    const content = `
Basically synergized cross-functional stakeholders.
Actually leveraged paradigm shifts essentially.
`.repeat(2);
    const result = scoreClarity(content);
    expect(result.score).toBeLessThan(result.maxScore);
  });

  test('should return issues for unclear content', () => {
    const content = 'Worked on stuff and things.';
    const result = scoreClarity(content);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

describe('scoreImpact', () => {
  test('should detect business impact', () => {
    const content = `
Achieved 40% reduction in infrastructure costs.
Saved $500K annually through process improvements.
`.repeat(2);
    const result = scoreImpact(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should detect quantified results', () => {
    const content = `
Reduced deployment time by 75%.
Increased team productivity by 30%.
Improved customer satisfaction from 3.5 to 4.8 stars.
`.repeat(2);
    const result = scoreImpact(content);
    expect(result.score).toBeGreaterThan(5);
  });

  test('should return issues for missing impact', () => {
    const content = 'Helped the team with various tasks.';
    const result = scoreImpact(content);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

describe('scoreAction', () => {
  test('should detect action verbs', () => {
    const content = `
Led the team through a major transformation.
Implemented new CI/CD pipeline.
Drove adoption across 12 teams.
`.repeat(2);
    const result = scoreAction(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should reward strong action verbs', () => {
    const content = `
Architected scalable microservices platform.
Spearheaded company-wide initiative.
Delivered results ahead of schedule.
`.repeat(2);
    const result = scoreAction(content);
    expect(result.score).toBeGreaterThan(5);
  });

  test('should penalize weak verbs', () => {
    const content = `
Helped with projects.
Assisted the team.
Participated in meetings.
`.repeat(2);
    const result = scoreAction(content);
    expect(result.score).toBeLessThan(result.maxScore);
  });
});

describe('scoreSpecificity', () => {
  test('should detect specific metrics', () => {
    const content = `
Team of 8 engineers over 6 months.
Budget of $2M with 99.9% uptime target.
`.repeat(2);
    const result = scoreSpecificity(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should detect concrete details', () => {
    const content = `
Migrated 15 microservices to Kubernetes.
Reduced latency from 500ms to 50ms.
Processed 1M transactions daily.
`.repeat(2);
    const result = scoreSpecificity(content);
    expect(result.score).toBeGreaterThan(0);
  });

  test('should return issues for vague content', () => {
    const content = 'Worked on various projects for some time.';
    const result = scoreSpecificity(content);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Detection Function Tests
// ============================================================================

describe('Detection Functions', () => {
  describe('detectActionVerbs', () => {
    test('should detect strong action verbs', () => {
      const content = 'Led the team and implemented new systems.';
      const result = detectActionVerbs(content);
      expect(result.strongVerbCount).toBeGreaterThan(0);
    });

    test('should count action verbs', () => {
      const content = 'Led, implemented, delivered, architected solutions.';
      const result = detectActionVerbs(content);
      expect(result.strongVerbCount).toBeGreaterThan(2);
    });

    test('should detect weak verbs', () => {
      const content = 'Helped the team and assisted with projects.';
      const result = detectActionVerbs(content);
      expect(result.hasWeakVerbs).toBe(true);
    });
  });

  describe('detectSpecificity', () => {
    test('should detect numbers', () => {
      const content = 'Team of 8 engineers achieved 40% improvement.';
      const result = detectSpecificity(content);
      expect(result.hasNumbers).toBe(true);
    });

    test('should detect percentages', () => {
      const content = 'Saved $100K annually with 99.9% uptime.';
      const result = detectSpecificity(content);
      expect(result.hasPercentages).toBe(true);
    });

    test('should detect dollar amounts', () => {
      const content = 'Saved $500,000 in annual costs.';
      const result = detectSpecificity(content);
      expect(result.hasDollarAmounts).toBe(true);
    });
  });

  describe('detectImpact', () => {
    test('should detect business impact', () => {
      const content = 'Increased revenue and improved customer satisfaction.';
      const result = detectImpact(content);
      expect(result.hasBusinessImpact).toBe(true);
    });

    test('should detect improvement language', () => {
      const content = 'Reduced costs by 40%, improved efficiency by 75%.';
      const result = detectImpact(content);
      expect(result.hasImprovementLanguage).toBe(true);
    });
  });

  describe('detectClarity', () => {
    test('should detect filler words', () => {
      const content = 'Basically, I just helped the team actually deliver.';
      const result = detectClarity(content);
      expect(result.hasFillers).toBe(true);
    });

    test('should detect jargon', () => {
      const content = 'Synergized stakeholders to leverage paradigm shifts.';
      const result = detectClarity(content);
      expect(result.hasJargon).toBe(true);
    });
  });
});
