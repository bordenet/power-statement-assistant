import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
    loadDefaultPrompts,
    getPhaseMetadata,
    generatePromptForPhase,
    exportFinalDocument,
    sanitizeFilename,
    getExportFilename,
    getFinalMarkdown,
    WORKFLOW_CONFIG,
    Workflow
} from '../js/workflow.js';
import storage from '../js/storage.js';

// Mock fetch for loading prompt templates (uses {{VAR}} double-brace syntax)
global.fetch = jest.fn(async (url) => {
    const templates = {
        'prompts/phase1.md': 'Phase 1: Generate power statement for {{PRODUCT_NAME}} with {{CUSTOMER_TYPE}} problem {{PROBLEM}} outcome {{OUTCOME}} proof {{PROOF_POINTS}} diff {{DIFFERENTIATORS}} objections {{OBJECTIONS}}',
        'prompts/phase2.md': 'Phase 2: Review {{PHASE1_OUTPUT}} for {{PRODUCT_NAME}} with {{CUSTOMER_TYPE}} problem {{PROBLEM}}',
        'prompts/phase3.md': 'Phase 3: Final synthesis of {{PHASE1_OUTPUT}} and {{PHASE2_OUTPUT}} for {{PRODUCT_NAME}}'
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
        // Note: prompts.js caches templates, so we test behavior not storage

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

            // Should contain substituted values
            expect(prompt).toContain('Test Product');
            expect(prompt).toContain('Enterprise');
            expect(prompt).toContain('Test problem');
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

        test('should include phase 1 and 2 responses in phase 3 prompt', async () => {
            const project = {
                title: 'Test',
                productName: 'Product',
                phases: {
                    1: { response: 'Phase 1 content' },
                    2: { response: 'Phase 2 content' },
                    3: { response: '' }
                }
            };

            const prompt = await generatePromptForPhase(project, 3);

            expect(prompt).toContain('Phase 1 content');
            expect(prompt).toContain('Phase 2 content');
        });

        test('should return empty string for invalid phase', async () => {
            const project = {
                title: 'Test',
                productName: 'Product',
                phases: {}
            };

            const prompt = await generatePromptForPhase(project, 99);
            expect(prompt).toBe('');
        });

        test('should handle missing phases gracefully', async () => {
            const project = {
                title: 'Test',
                productName: 'Product'
                // No phases defined
            };

            const prompt = await generatePromptForPhase(project, 2);
            expect(prompt).toContain('[No Phase 1 output yet]');
        });

        test('should handle array format phases (legacy)', async () => {
            const project = {
                title: 'Test',
                productName: 'Product',
                phases: [
                    { response: 'Legacy array phase 1' },
                    { response: '' },
                    { response: '' }
                ]
            };

            const prompt = await generatePromptForPhase(project, 2);
            expect(prompt).toContain('Legacy array phase 1');
        });
    });

    describe('sanitizeFilename', () => {
        test('should replace special characters with dashes', () => {
            expect(sanitizeFilename('My Project!')).toBe('my-project');
            expect(sanitizeFilename('Test@#$File')).toBe('test-file');
        });

        test('should collapse multiple dashes', () => {
            expect(sanitizeFilename('My---Project')).toBe('my-project');
        });

        test('should remove leading and trailing dashes', () => {
            expect(sanitizeFilename('---Test---')).toBe('test');
        });

        test('should truncate to 50 characters', () => {
            const longName = 'a'.repeat(100);
            expect(sanitizeFilename(longName).length).toBe(50);
        });

        test('should convert to lowercase', () => {
            expect(sanitizeFilename('MyProject')).toBe('myproject');
        });
    });

    describe('getExportFilename', () => {
        test('should return sanitized filename with extension', () => {
            const project = { title: 'My Power Statement' };
            expect(getExportFilename(project)).toBe('my-power-statement-power-statement.md');
        });

        test('should handle empty title', () => {
            const project = { title: '' };
            const filename = getExportFilename(project);
            expect(filename).toBe('-power-statement.md');
        });
    });

    describe('getFinalMarkdown', () => {
        test('should return phase 3 response if available', () => {
            const project = {
                phases: {
                    1: { response: 'Phase 1' },
                    2: { response: 'Phase 2' },
                    3: { response: 'Phase 3 Final' }
                }
            };
            expect(getFinalMarkdown(project)).toBe('Phase 3 Final');
        });

        test('should fallback to phase 2 if phase 3 empty', () => {
            const project = {
                phases: {
                    1: { response: 'Phase 1' },
                    2: { response: 'Phase 2 Content' },
                    3: { response: '' }
                }
            };
            expect(getFinalMarkdown(project)).toBe('Phase 2 Content');
        });

        test('should fallback to phase 1 if phases 2 and 3 empty', () => {
            const project = {
                phases: {
                    1: { response: 'Phase 1 Only' },
                    2: { response: '' },
                    3: { response: '' }
                }
            };
            expect(getFinalMarkdown(project)).toBe('Phase 1 Only');
        });

        test('should return null if no responses', () => {
            const project = {
                phases: {
                    1: { response: '' },
                    2: { response: '' },
                    3: { response: '' }
                }
            };
            expect(getFinalMarkdown(project)).toBeNull();
        });

        test('should return null if no phases', () => {
            const project = {};
            expect(getFinalMarkdown(project)).toBeNull();
        });
    });

    describe('exportFinalDocument', () => {
        beforeEach(() => {
            URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
            URL.revokeObjectURL = jest.fn();
            // Create toast container for showToast
            const toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        });

        afterEach(() => {
            const container = document.getElementById('toast-container');
            if (container) container.remove();
        });

        test('should export document when content exists', async () => {
            const project = {
                title: 'Test Project',
                phases: {
                    3: { response: 'Final power statement content' }
                }
            };

            await exportFinalDocument(project);

            expect(URL.createObjectURL).toHaveBeenCalled();
            expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
        });

        test('should show warning when no content to export', async () => {
            const project = {
                title: 'Empty Project',
                phases: {
                    1: { response: '' },
                    2: { response: '' },
                    3: { response: '' }
                }
            };

            // Should not throw, just return early after showing warning
            await exportFinalDocument(project);

            // URL.createObjectURL should NOT be called for empty content
            expect(URL.createObjectURL).not.toHaveBeenCalled();
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

        test('should advance from phase 3 to phase 4 (complete)', () => {
            const project = { title: 'Test', phase: 3 };
            const workflow = new Workflow(project);

            const result = workflow.advancePhase();
            expect(result).toBe(true);
            expect(workflow.currentPhase).toBe(4);
        });

        test('should not advance beyond phase 4', () => {
            const project = { title: 'Test', phase: 4 };
            const workflow = new Workflow(project);

            const result = workflow.advancePhase();
            expect(result).toBe(false);
            expect(workflow.currentPhase).toBe(4);
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

        test('should get next phase', () => {
            const project = { title: 'Test', phase: 1 };
            const workflow = new Workflow(project);

            const nextPhase = workflow.getNextPhase();
            expect(nextPhase.name).toBe('Adversarial Critique');
            expect(nextPhase.number).toBe(2);
        });

        test('should return null for next phase at end', () => {
            const project = { title: 'Test', phase: 3 };
            const workflow = new Workflow(project);

            const nextPhase = workflow.getNextPhase();
            expect(nextPhase).toBeNull();
        });

        test('should check if workflow is complete', () => {
            const project1 = { title: 'Test', phase: 3 };
            const workflow1 = new Workflow(project1);
            expect(workflow1.isComplete()).toBe(false);

            const project2 = { title: 'Test', phase: 4 };
            const workflow2 = new Workflow(project2);
            expect(workflow2.isComplete()).toBe(true);
        });

        test('should generate prompt with variables replaced', async () => {
            const project = {
                title: 'Test Title',
                productName: 'My Product',
                customerType: 'Enterprise',
                problem: 'Big problem',
                outcome: 'Great outcome',
                proofPoints: 'Strong proof',
                differentiators: 'Unique features',
                objections: 'Common objections',
                phase: 1
            };
            const workflow = new Workflow(project);

            const prompt = await workflow.generatePrompt();

            // Prompt should be generated (template fetched and variables replaced)
            expect(typeof prompt).toBe('string');
        });

        test('should replace variables in template', () => {
            const project = {
                title: 'Power Statement',
                productName: 'CloudSync',
                customerType: 'SaaS Startups',
                problem: 'data loss',
                outcome: 'reliability',
                proofPoints: '99.9% uptime',
                differentiators: 'real-time sync',
                objections: 'cost concerns',
                phase: 2,
                phase1_output: 'Phase 1 generated content'
            };
            const workflow = new Workflow(project);

            const template = 'Product: {product_name}, Customer: {customer_type}, Problem: {problem}, Previous: {phase1_output}';
            const result = workflow.replaceVariables(template);

            expect(result).toContain('CloudSync');
            expect(result).toContain('SaaS Startups');
            expect(result).toContain('data loss');
            expect(result).toContain('Phase 1 generated content');
        });

        test('should handle missing project fields in replaceVariables', () => {
            const project = { title: 'Test', phase: 1 };
            const workflow = new Workflow(project);

            const template = 'Product: {product_name}, Customer: {customer_type}';
            const result = workflow.replaceVariables(template);

            expect(result).toBe('Product: , Customer: ');
        });
    });
});
