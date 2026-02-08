/**
 * Tests for validator/js/prompts.js
 * Tests prompt generation functions for LLM-based Power Statement scoring
 */

import { describe, test, expect } from '@jest/globals';
import {
  generateLLMScoringPrompt,
  generateCritiquePrompt,
  generateRewritePrompt,
  cleanAIResponse
} from '../js/prompts.js';

describe('prompts.js', () => {
  const samplePowerStatement = 'Led a team of 5 engineers to deliver a new payment system that reduced checkout time by 40% and increased revenue by $2M annually.';

  describe('generateLLMScoringPrompt', () => {
    test('should generate a prompt containing the power statement', () => {
      const prompt = generateLLMScoringPrompt(samplePowerStatement);
      expect(prompt).toContain(samplePowerStatement);
    });

    test('should include scoring rubric sections', () => {
      const prompt = generateLLMScoringPrompt(samplePowerStatement);
      expect(prompt).toContain('Clarity');
      expect(prompt).toContain('Impact');
      expect(prompt).toContain('Action');
      expect(prompt).toContain('Specificity');
    });

    test('should include point values', () => {
      const prompt = generateLLMScoringPrompt(samplePowerStatement);
      expect(prompt).toContain('25 points');
      expect(prompt).toContain('/100');
    });

    test('should include calibration guidance', () => {
      const prompt = generateLLMScoringPrompt(samplePowerStatement);
      expect(prompt).toContain('CALIBRATION GUIDANCE');
      expect(prompt).toContain('Be HARSH');
    });

    test('should include required output format', () => {
      const prompt = generateLLMScoringPrompt(samplePowerStatement);
      expect(prompt).toContain('REQUIRED OUTPUT FORMAT');
      expect(prompt).toContain('TOTAL SCORE');
    });
  });

  describe('generateCritiquePrompt', () => {
    const mockResult = {
      totalScore: 65,
      clarity: { score: 18, issues: ['Contains filler words'] },
      impact: { score: 20, issues: [] },
      action: { score: 15, issues: ['Weak opening verb'] },
      specificity: { score: 12, issues: ['Missing timeframe'] }
    };

    test('should generate a prompt containing the power statement', () => {
      const prompt = generateCritiquePrompt(samplePowerStatement, mockResult);
      expect(prompt).toContain(samplePowerStatement);
    });

    test('should include current validation results', () => {
      const prompt = generateCritiquePrompt(samplePowerStatement, mockResult);
      expect(prompt).toContain('Total Score: 65/100');
      expect(prompt).toContain('Clarity: 18/25');
      expect(prompt).toContain('Impact: 20/25');
    });

    test('should include detected issues', () => {
      const prompt = generateCritiquePrompt(samplePowerStatement, mockResult);
      expect(prompt).toContain('Contains filler words');
      expect(prompt).toContain('Weak opening verb');
    });

    test('should handle missing issues gracefully', () => {
      const minimalResult = { totalScore: 50 };
      const prompt = generateCritiquePrompt(samplePowerStatement, minimalResult);
      expect(prompt).toContain('Total Score: 50/100');
      expect(prompt).toContain('Clarity: 0/25');
    });
  });

  describe('generateRewritePrompt', () => {
    const mockResult = { totalScore: 45 };

    test('should generate a prompt containing the power statement', () => {
      const prompt = generateRewritePrompt(samplePowerStatement, mockResult);
      expect(prompt).toContain(samplePowerStatement);
    });

    test('should include current score', () => {
      const prompt = generateRewritePrompt(samplePowerStatement, mockResult);
      expect(prompt).toContain('CURRENT SCORE: 45/100');
    });

    test('should include rewrite requirements', () => {
      const prompt = generateRewritePrompt(samplePowerStatement, mockResult);
      expect(prompt).toContain('REWRITE REQUIREMENTS');
      expect(prompt).toContain('prospect-ready power statement');
      expect(prompt).toContain('Version A');
    });
  });

  describe('cleanAIResponse', () => {
    test('should remove common prefixes', () => {
      const response = "Here's the evaluation:\nSome content";
      expect(cleanAIResponse(response)).toBe('Some content');
    });

    test('should extract content from markdown code blocks', () => {
      const response = '```markdown\nExtracted content\n```';
      expect(cleanAIResponse(response)).toBe('Extracted content');
    });

    test('should handle code blocks without language specifier', () => {
      const response = '```\nExtracted content\n```';
      expect(cleanAIResponse(response)).toBe('Extracted content');
    });

    test('should trim whitespace', () => {
      const response = '  Some content with spaces  ';
      expect(cleanAIResponse(response)).toBe('Some content with spaces');
    });

    test('should handle responses without prefixes or code blocks', () => {
      const response = 'Plain response text';
      expect(cleanAIResponse(response)).toBe('Plain response text');
    });
  });
});

