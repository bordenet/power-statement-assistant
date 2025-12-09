/**
 * Template-Code Sync Validation Tests
 *
 * CRITICAL: These tests prevent a class of bugs where:
 * - Code populates template variables
 * - But templates don't have the corresponding placeholders
 * - Result: User input silently disappears (data loss)
 *
 * LESSON LEARNED: Mock-only testing can diverge from reality.
 * These tests read REAL template files to ensure templates contain
 * all required placeholders that the code expects to substitute.
 *
 * Origin: https://github.com/bordenet/one-pager - Bug where {context}
 * placeholder was missing from phase1.md template. 177 tests passed,
 * but user's "Additional Context" input was silently dropped.
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Read a real template file from the prompts directory
 */
function readRealTemplate(templateName) {
  const templatePath = path.join(__dirname, '..', 'prompts', templateName);
  return fs.readFileSync(templatePath, 'utf8');
}

describe('Template-Code Sync Validation', () => {
  /**
   * USER INPUT PLACEHOLDERS
   * These are the form fields users fill out. If ANY of these are missing
   * from the template, user input will be silently lost.
   */
  describe('Phase 1 Template - User Input Placeholders', () => {
    test('CRITICAL: phase1.md MUST contain {title} or {projectName} placeholder', () => {
      const template = readRealTemplate('phase1.md');
      const hasTitle = template.includes('{title}') || template.includes('{projectName}');
      expect(hasTitle).toBe(true);
    });

    test('CRITICAL: phase1.md MUST contain {problems} or {problemStatement} placeholder', () => {
      const template = readRealTemplate('phase1.md');
      const hasProblems = template.includes('{problems}') || template.includes('{problemStatement}');
      expect(hasProblems).toBe(true);
    });

    test('CRITICAL: phase1.md MUST contain {context} placeholder', () => {
      // This test would have caught the one-pager bug immediately
      const template = readRealTemplate('phase1.md');
      expect(template).toContain('{context}');
    });
  });

  /**
   * PHASE OUTPUT PLACEHOLDERS
   * Phase 2 and 3 templates need to reference previous phase outputs.
   */
  describe('Phase 2 Template - Cross-Phase References', () => {
    test('CRITICAL: phase2.md MUST contain {phase1_output} placeholder', () => {
      const template = readRealTemplate('phase2.md');
      const hasPhase1 = template.includes('{phase1_output}');
      expect(hasPhase1).toBe(true);
    });
  });

  describe('Phase 3 Template - Cross-Phase References', () => {
    test('CRITICAL: phase3.md MUST contain phase 1 output placeholder', () => {
      const template = readRealTemplate('phase3.md');
      const hasPhase1 = template.includes('{phase1_output}');
      expect(hasPhase1).toBe(true);
    });

    test('CRITICAL: phase3.md MUST contain phase 2 output placeholder', () => {
      const template = readRealTemplate('phase3.md');
      const hasPhase2 = template.includes('{phase2_output}');
      expect(hasPhase2).toBe(true);
    });
  });

  /**
   * INTEGRATION: E2E Data Flow
   * Tests that user input actually appears in generated prompts
   * using REAL templates, not mocks.
   */
  describe('E2E: Real Template Data Flow', () => {
    let originalFetch;

    beforeEach(() => {
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('E2E: User input flows through REAL phase1 template', async () => {
      // Import dynamically to avoid circular dependencies
      const { generatePhase1Prompt, generatePromptForPhase } = await import('../js/workflow.js');
      const { createProject } = await import('../js/projects.js');

      // Use real template
      const realTemplate = readRealTemplate('phase1.md');
      global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        text: () => Promise.resolve(realTemplate)
      }));

      const project = await createProject(
        'E2E Sync Test Title',
        'E2E Sync Test Problems',
        'E2E Sync Test Context'
      );

      // Use whichever function exists
      const generateFn = generatePromptForPhase || generatePhase1Prompt;
      const prompt = await generateFn(project, 1);

      // ALL user inputs MUST appear in the generated prompt
      expect(prompt).toContain('E2E Sync Test Title');
      expect(prompt).toContain('E2E Sync Test Problems');
      expect(prompt).toContain('E2E Sync Test Context');
    });
  });
});

/**
 * CUSTOMIZATION NOTES:
 *
 * 1. If you rename placeholders (e.g., {title} -> {documentName}), update tests
 * 2. If you add new user input fields, add corresponding placeholder tests
 * 3. Never use mocks for template content in these tests - they MUST read real files
 * 4. The test names start with "CRITICAL:" to signal these are regression guards
 */
