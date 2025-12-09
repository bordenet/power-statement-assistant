/**
 * Prompt Data Flow Validation Tests
 *
 * CRITICAL: These tests prevent silent data loss in prompt generation.
 * They ensure user input actually appears in generated prompts.
 *
 * Origin: https://github.com/bordenet/one-pager - Bug where {context}
 * placeholder was missing from template. 177 tests passed, but user's
 * "Additional Context" input was silently dropped.
 *
 * LESSON: Test that REAL user input flows through to REAL output.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { createProject, generatePrompt, advancePhase, updatePhaseResponse } from '../js/workflow.js';

describe('Prompt Data Flow Validation', () => {
  let project;

  beforeEach(() => {
    project = createProject('Test Project Name', 'Test Project Description');
  });

  /**
   * USER INPUT TESTS
   * These verify that form data appears in generated prompts.
   */
  describe('Phase 1 - User Input in Prompt', () => {
    test('CRITICAL: project name appears in Phase 1 prompt', () => {
      const prompt = generatePrompt(project);
      expect(prompt).toContain('Test Project Name');
    });

    test('CRITICAL: project description appears in Phase 1 prompt', () => {
      const prompt = generatePrompt(project);
      expect(prompt).toContain('Test Project Description');
    });

    test('CRITICAL: unique user input is not silently dropped', () => {
      // Use unique values that would only appear via proper data flow
      const uniqueProject = createProject(
        'UNIQUE_NAME_12345',
        'UNIQUE_DESC_67890'
      );
      const prompt = generatePrompt(uniqueProject);

      expect(prompt).toContain('UNIQUE_NAME_12345');
      expect(prompt).toContain('UNIQUE_DESC_67890');
    });
  });

  /**
   * PHASE OUTPUT TESTS
   * These verify previous phase responses flow into later phases.
   */
  describe('Phase 2 - Previous Phase Output in Prompt', () => {
    beforeEach(() => {
      // Complete Phase 1 with a response
      project.phases[0].response = 'PHASE_1_AI_RESPONSE_CONTENT';
      advancePhase(project);
    });

    test('CRITICAL: Phase 1 response appears in Phase 2 prompt', () => {
      const prompt = generatePrompt(project);
      expect(prompt).toContain('PHASE_1_AI_RESPONSE_CONTENT');
    });

    test('CRITICAL: project name still appears in Phase 2 prompt', () => {
      const prompt = generatePrompt(project);
      expect(prompt).toContain('Test Project Name');
    });

    test('CRITICAL: unique Phase 1 output is not silently dropped', () => {
      project.phases[0].response = 'UNIQUE_PHASE1_OUTPUT_ABC123';
      const prompt = generatePrompt(project);

      expect(prompt).toContain('UNIQUE_PHASE1_OUTPUT_ABC123');
    });
  });

  /**
   * E2E DATA FLOW
   * Full workflow from user input to final prompt generation.
   */
  describe('E2E: Complete Data Flow', () => {
    test('E2E: All user data flows through both phases', () => {
      // Phase 1
      const phase1Prompt = generatePrompt(project);
      expect(phase1Prompt).toContain('Test Project Name');
      expect(phase1Prompt).toContain('Test Project Description');

      // Simulate Phase 1 AI response
      updatePhaseResponse(project, 'AI analyzed the project thoroughly');
      advancePhase(project);

      // Phase 2
      const phase2Prompt = generatePrompt(project);
      expect(phase2Prompt).toContain('Test Project Name');
      expect(phase2Prompt).toContain('AI analyzed the project thoroughly');
    });

    test('E2E: Empty fields result in predictable output (not silent failure)', () => {
      const emptyProject = createProject('', '');
      const prompt = generatePrompt(emptyProject);

      // Should still generate a valid prompt structure
      expect(prompt).toContain('Phase 1');
      expect(prompt).toContain('Project:');
    });
  });
});

/**
 * CUSTOMIZATION NOTES:
 *
 * 1. If you add new form fields, add corresponding tests here
 * 2. If you change how prompts are generated, update these tests
 * 3. Use unique, identifiable values (like UUID_12345) to ensure they came from input
 * 4. Never use mocks for the prompt generation - test real functions
 */

