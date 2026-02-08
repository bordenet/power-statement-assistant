/**
 * Tests for Power Statement Validator - Integration tests for assistant
 *
 * Note: Comprehensive validator tests are in validator/tests/validator.test.js
 * These tests verify that the assistant correctly imports from the canonical validator.
 */
import {
  validateDocument,
  getScoreColor,
  getScoreLabel
} from '../../validator/js/validator.js';

describe('Power Statement Validator Integration', () => {
  describe('validateDocument', () => {
    test('should return totalScore for valid content', () => {
      const result = validateDocument(`Led cross-functional team of 8 engineers.
Achieved 40% reduction in infrastructure costs.
Implemented automated CI/CD pipeline.`);
      expect(result.totalScore).toBeDefined();
      expect(typeof result.totalScore).toBe('number');
    });

    test('should return zero for empty content', () => {
      const result = validateDocument('');
      expect(result.totalScore).toBe(0);
    });

    test('should return zero for null content', () => {
      const result = validateDocument(null);
      expect(result.totalScore).toBe(0);
    });
  });

  describe('getScoreColor', () => {
    test('should return green for scores >= 70', () => {
      expect(getScoreColor(70)).toBe('green');
      expect(getScoreColor(85)).toBe('green');
    });

    test('should return yellow for scores 50-69', () => {
      expect(getScoreColor(50)).toBe('yellow');
      expect(getScoreColor(65)).toBe('yellow');
    });

    test('should return orange for scores 30-49', () => {
      expect(getScoreColor(30)).toBe('orange');
      expect(getScoreColor(45)).toBe('orange');
    });

    test('should return red for scores < 30', () => {
      expect(getScoreColor(0)).toBe('red');
      expect(getScoreColor(29)).toBe('red');
    });
  });

  describe('getScoreLabel', () => {
    test('should return Excellent for scores >= 80', () => {
      expect(getScoreLabel(80)).toBe('Excellent');
      expect(getScoreLabel(100)).toBe('Excellent');
    });

    test('should return Ready for scores 70-79', () => {
      expect(getScoreLabel(70)).toBe('Ready');
      expect(getScoreLabel(79)).toBe('Ready');
    });

    test('should return Needs Work for scores 50-69', () => {
      expect(getScoreLabel(50)).toBe('Needs Work');
      expect(getScoreLabel(69)).toBe('Needs Work');
    });

    test('should return Draft for scores 30-49', () => {
      expect(getScoreLabel(30)).toBe('Draft');
      expect(getScoreLabel(49)).toBe('Draft');
    });

    test('should return Incomplete for scores < 30', () => {
      expect(getScoreLabel(0)).toBe('Incomplete');
      expect(getScoreLabel(29)).toBe('Incomplete');
    });
  });
});
