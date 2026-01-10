import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  loadDefaultPrompts,
  getPhaseMetadata,
  generatePromptForPhase,
  WORKFLOW_CONFIG,
  Workflow
} from '../js/workflow.js';
import storage from '../js/storage.js';

// Mock fetch for loading prompt templates
global.fetch = jest.fn(async (url) => {
  const templates = {
    'prompts/phase1.md': 'Phase 1: Generate power statement for {project_title} about {product_name}',
    'prompts/phase2.md': 'Phase 2: Review {phase1_response}',
    'prompts/phase3.md': 'Phase 3: Final synthesis of {phase1_response} and {phase2_response}'
  };

  return {
    ok: true,
    text: async () => templates[url] || 'Default template'
  };
});

describe('Workflow Module', () => {
  beforeEach(async () => {
    await storage.init();
    jest.clearAllMocks();
  });

  describe('getPhaseMetadata', () => {
    test('should return correct metadata for phase 1', () => {
      const metadata = getPhaseMetadata(1);
      
      expect(metadata.title).toBe('Initial Draft');
      expect(metadata.ai).toBe('Claude');
      expect(metadata.color).toBe('blue');
      expect(metadata.icon).toBe('📝');
    });

    test('should return correct metadata for phase 2', () => {
      const metadata = getPhaseMetadata(2);
      
      expect(metadata.title).toBe('Adversarial Critique');
      expect(metadata.ai).toBe('Gemini');
      expect(metadata.color).toBe('purple');
      expect(metadata.icon).toBe('🔍');
    });

    test('should return correct metadata for phase 3', () => {
      const metadata = getPhaseMetadata(3);
      
      expect(metadata.title).toBe('Final Synthesis');
      expect(metadata.ai).toBe('Claude');
      expect(metadata.color).toBe('green');
      expect(metadata.icon).toBe('✨');
    });

    test('should return empty object for invalid phase', () => {
      const metadata = getPhaseMetadata(99);
      expect(metadata).toEqual({});
    });
  });

  describe('loadDefaultPrompts', () => {
    test('should fetch prompts starting with phase1', async () => {
      await loadDefaultPrompts();

      // At minimum, phase1 prompt should be fetched
      expect(global.fetch).toHaveBeenCalledWith('prompts/phase1.md');
    });

    test('should handle fetch errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await expect(loadDefaultPrompts()).resolves.not.toThrow();
    });
  });

  describe('generatePromptForPhase', () => {
    beforeEach(async () => {
      // Save prompts to storage for testing
      await storage.savePrompt(1, 'Phase 1: {project_title} - {product_name}');
      await storage.savePrompt(2, 'Phase 2: Review {phase1_output}');
      await storage.savePrompt(3, 'Phase 3: {phase1_output} + {phase2_output}');
    });

    test('should generate prompt with project data substituted', async () => {
      const project = {
        title: 'Test Project',
        productName: 'Test Product',
        customerType: 'Enterprise',
        problem: 'Test problem',
        phases: {
          1: { response: '' },
          2: { response: '' },
          3: { response: '' }
        }
      };

      const prompt = await generatePromptForPhase(project, 1);

      expect(prompt).toContain('Test Project');
      expect(prompt).toContain('Test Product');
    });

    test('should include phase 1 response in phase 2 prompt', async () => {
      const project = {
        title: 'Test',
        productName: 'Product',
        phases: {
          1: { response: 'Phase 1 output here' },
          2: { response: '' },
          3: { response: '' }
        }
      };

      const prompt = await generatePromptForPhase(project, 2);

      expect(prompt).toContain('Phase 1 output here');
    });
  });

  describe('WORKFLOW_CONFIG', () => {
    test('should have 3 phases configured', () => {
      expect(WORKFLOW_CONFIG.phaseCount).toBe(3);
    });

    test('should have phases array with 3 entries', () => {
      expect(WORKFLOW_CONFIG.phases).toHaveLength(3);
    });

    test('should have correct phase names', () => {
      expect(WORKFLOW_CONFIG.phases[0].name).toBe('Initial Draft');
      expect(WORKFLOW_CONFIG.phases[1].name).toBe('Adversarial Critique');
      expect(WORKFLOW_CONFIG.phases[2].name).toBe('Final Synthesis');
    });
  });

  describe('Workflow class', () => {
    test('should initialize with project', () => {
      const project = { title: 'Test', phase: 1 };
      const workflow = new Workflow(project);

      expect(workflow.project).toBe(project);
      expect(workflow.currentPhase).toBe(1);
    });

    test('should get current phase config', () => {
      const project = { title: 'Test', phase: 1 };
      const workflow = new Workflow(project);

      const phase = workflow.getCurrentPhase();
      expect(phase.name).toBe('Initial Draft');
      expect(phase.aiModel).toBe('Claude');
    });

    test('should advance to next phase', () => {
      const project = { title: 'Test', phase: 1 };
      const workflow = new Workflow(project);

      const result = workflow.advancePhase();
      expect(result).toBe(true);
      expect(workflow.currentPhase).toBe(2);
    });

    test('should not advance beyond phase 3', () => {
      const project = { title: 'Test', phase: 3 };
      const workflow = new Workflow(project);

      const result = workflow.advancePhase();
      expect(result).toBe(false);
      expect(workflow.currentPhase).toBe(3);
    });

    test('should go back to previous phase', () => {
      const project = { title: 'Test', phase: 2 };
      const workflow = new Workflow(project);

      const result = workflow.previousPhase();
      expect(result).toBe(true);
      expect(workflow.currentPhase).toBe(1);
    });

    test('should not go back before phase 1', () => {
      const project = { title: 'Test', phase: 1 };
      const workflow = new Workflow(project);

      const result = workflow.previousPhase();
      expect(result).toBe(false);
      expect(workflow.currentPhase).toBe(1);
    });

    test('should save phase output', () => {
      const project = { title: 'Test', phase: 1 };
      const workflow = new Workflow(project);

      workflow.savePhaseOutput('Test output');
      expect(project.phase1_output).toBe('Test output');
    });

    test('should get phase output', () => {
      const project = { title: 'Test', phase: 1, phase1_output: 'Existing output' };
      const workflow = new Workflow(project);

      expect(workflow.getPhaseOutput(1)).toBe('Existing output');
    });

    test('should calculate progress percentage', () => {
      const project = { title: 'Test', phase: 2 };
      const workflow = new Workflow(project);

      expect(workflow.getProgress()).toBe(67);
    });

    test('should export as markdown', () => {
      const project = {
        title: 'Test Project',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
        phase: 3,
        phase1_output: 'Phase 1 content',
        phase3_output: 'Phase 3 content'
      };
      const workflow = new Workflow(project);

      const markdown = workflow.exportAsMarkdown();
      expect(markdown).toContain('# Test Project');
      expect(markdown).toContain('Phase 1 content');
      expect(markdown).toContain('Phase 3 content');
    });
  });
});

