/**
 * Tests for prompts.js module
 *
 * Tests workflow configuration and prompt generation.
 */

import {
  WORKFLOW_CONFIG,
  getPhaseMetadata,
  generatePhase1Prompt,
  generatePhase2Prompt,
  generatePhase3Prompt,
  preloadPromptTemplates,
  replaceTemplateVars
} from '../../shared/js/prompts.js';

describe('WORKFLOW_CONFIG', () => {
  test('should have 3 phases', () => {
    expect(WORKFLOW_CONFIG.phaseCount).toBe(3);
  });

  test('should have correct phase structure', () => {
    expect(WORKFLOW_CONFIG.phases).toHaveLength(3);
    WORKFLOW_CONFIG.phases.forEach((phase, index) => {
      expect(phase.number).toBe(index + 1);
      expect(phase.name).toBeDefined();
      expect(phase.icon).toBeDefined();
      expect(phase.aiModel).toBeDefined();
      expect(phase.description).toBeDefined();
    });
  });

  test('phase 1 should use Claude', () => {
    expect(WORKFLOW_CONFIG.phases[0].aiModel).toBe('Claude');
  });

  test('phase 2 should use Gemini', () => {
    expect(WORKFLOW_CONFIG.phases[1].aiModel).toBe('Gemini');
  });

  test('phase 3 should use Claude', () => {
    expect(WORKFLOW_CONFIG.phases[2].aiModel).toBe('Claude');
  });
});

describe('getPhaseMetadata', () => {
  test('should return metadata for valid phase', () => {
    const phase1 = getPhaseMetadata(1);
    expect(phase1).toBeDefined();
    expect(phase1.number).toBe(1);
    expect(phase1.name).toBe('Initial Draft');
  });

  test('should return undefined for invalid phase', () => {
    expect(getPhaseMetadata(0)).toBeUndefined();
    expect(getPhaseMetadata(4)).toBeUndefined();
    expect(getPhaseMetadata(-1)).toBeUndefined();
  });

  test('should return correct AI model for each phase', () => {
    expect(getPhaseMetadata(1).aiModel).toBe('Claude');
    expect(getPhaseMetadata(2).aiModel).toBe('Gemini');
    expect(getPhaseMetadata(3).aiModel).toBe('Claude');
  });
});

describe('prompt generation', () => {
  // These tests verify the functions handle errors gracefully
  // when prompt templates cannot be loaded (no fetch in jsdom)

  test('generatePhase1Prompt should be a function', () => {
    expect(typeof generatePhase1Prompt).toBe('function');
  });

  test('generatePhase2Prompt should be a function', () => {
    expect(typeof generatePhase2Prompt).toBe('function');
  });

  test('generatePhase3Prompt should be a function', () => {
    expect(typeof generatePhase3Prompt).toBe('function');
  });

  test('preloadPromptTemplates should be a function', () => {
    expect(typeof preloadPromptTemplates).toBe('function');
  });

  test('generatePhase1Prompt should reject when fetch unavailable', async () => {
    const formData = { productName: 'Test', customerType: 'Enterprise' };
    await expect(generatePhase1Prompt(formData)).rejects.toThrow();
  });

  test('generatePhase2Prompt should reject when fetch unavailable', async () => {
    const formData = { productName: 'Test' };
    await expect(generatePhase2Prompt(formData, 'phase 1 output')).rejects.toThrow();
  });

  test('generatePhase3Prompt should reject when fetch unavailable', async () => {
    const formData = { productName: 'Test' };
    await expect(generatePhase3Prompt(formData, 'phase 1', 'phase 2')).rejects.toThrow();
  });
});

describe('replaceTemplateVars - Placeholder Safety Check', () => {
  test('should replace known variables', () => {
    const template = 'Hello {{NAME}}, welcome to {{PROJECT}}';
    const vars = { NAME: 'World', PROJECT: 'Power Statement' };

    const result = replaceTemplateVars(template, vars);

    expect(result).toBe('Hello World, welcome to Power Statement');
  });

  test('should remove unsubstituted UPPER_CASE placeholders', () => {
    const template = 'Hello {{NAME}}, your {{UNKNOWN_FIELD}} is ready';
    const vars = { NAME: 'World' };

    const result = replaceTemplateVars(template, vars);

    expect(result).toBe('Hello World, your  is ready');
    expect(result).not.toContain('{{UNKNOWN_FIELD}}');
  });

  test('should handle phase output placeholders when not provided', () => {
    const template = '{{PHASE1_OUTPUT}} and {{PHASE2_OUTPUT}}';
    const vars = { PHASE1_OUTPUT: 'Draft content here' };

    const result = replaceTemplateVars(template, vars);

    expect(result).toContain('Draft content here');
    expect(result).not.toContain('{{PHASE2_OUTPUT}}');
  });
});
