/**
 * Form-to-Prompt Integration Tests
 *
 * CRITICAL: These tests ensure that form fields match prompt template requirements.
 * This prevents the embarrassing bug where we collected 3 fields but prompts expected 7.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { createProject } from '../js/projects.js';
import { generatePromptForPhase } from '../js/workflow.js';
import storage from '../js/storage.js';
import fs from 'fs';
import path from 'path';

// Mock fetch for loading prompt templates (prompts.js uses fetch, not storage)
global.fetch = jest.fn(async (url) => {
    // Read from actual template files
    const filePath = path.join(process.cwd(), url);
    const content = fs.readFileSync(filePath, 'utf-8');
    return {
        ok: true,
        text: async () => content
    };
});

describe('Form-to-Prompt Integration Tests', () => {
    beforeEach(async () => {
        await storage.init();

        // Load prompt templates into storage (for legacy tests that use storage)
        for (let phase = 1; phase <= 3; phase++) {
            const promptContent = fs.readFileSync(
                path.join(process.cwd(), `prompts/phase${phase}.md`),
                'utf-8'
            );
            await storage.savePrompt(phase, promptContent);
        }

        // Clean up projects
        const projects = await storage.getAllProjects();
        for (const project of projects) {
            await storage.deleteProject(project.id);
        }
    });

    describe('Project Data Model Validation', () => {
        it('should create project with all 7 required fields', async () => {
            const projectData = {
                title: 'Test Project',
                productName: 'Test Product',
                customerType: 'Test Customers',
                problem: 'Test Problem',
                outcome: 'Test Outcome',
                proofPoints: 'Test Proof Points',
                differentiators: 'Test Differentiators',
                objections: 'Test Objections'
            };

            const project = await createProject(projectData);

            expect(project.title).toBe('Test Project');
            expect(project.productName).toBe('Test Product');
            expect(project.customerType).toBe('Test Customers');
            expect(project.problem).toBe('Test Problem');
            expect(project.outcome).toBe('Test Outcome');
            expect(project.proofPoints).toBe('Test Proof Points');
            expect(project.differentiators).toBe('Test Differentiators');
            expect(project.objections).toBe('Test Objections');
        });

        it('should trim whitespace from all fields', async () => {
            const projectData = {
                title: '  Test Project  ',
                productName: '  Test Product  ',
                customerType: '  Test Customers  ',
                problem: '  Test Problem  ',
                outcome: '  Test Outcome  ',
                proofPoints: '  Test Proof Points  ',
                differentiators: '  Test Differentiators  ',
                objections: '  Test Objections  '
            };

            const project = await createProject(projectData);

            expect(project.title).toBe('Test Project');
            expect(project.productName).toBe('Test Product');
            expect(project.customerType).toBe('Test Customers');
        });
    });

    describe('Prompt Template Variable Matching', () => {
        // Using {{VAR_NAME}} syntax (double braces, SCREAMING_SNAKE_CASE)
        const requiredVariables = [
            'PRODUCT_NAME',
            'CUSTOMER_TYPE',
            'PROBLEM',
            'OUTCOME',
            'PROOF_POINTS',
            'DIFFERENTIATORS',
            'OBJECTIONS'
        ];

        it('should have all required variables in Phase 1 prompt template', () => {
            const phase1Template = fs.readFileSync(
                path.join(process.cwd(), 'prompts/phase1.md'),
                'utf-8'
            );

            requiredVariables.forEach(variable => {
                expect(phase1Template).toContain(`{{${variable}}}`);
            });
        });

        it('should have all required variables in Phase 2 prompt template', () => {
            const phase2Template = fs.readFileSync(
                path.join(process.cwd(), 'prompts/phase2.md'),
                'utf-8'
            );

            requiredVariables.forEach(variable => {
                expect(phase2Template).toContain(`{{${variable}}}`);
            });
        });

        it('should have all required variables in Phase 3 prompt template', () => {
            const phase3Template = fs.readFileSync(
                path.join(process.cwd(), 'prompts/phase3.md'),
                'utf-8'
            );

            requiredVariables.forEach(variable => {
                expect(phase3Template).toContain(`{{${variable}}}`);
            });
        });
    });

    describe('Prompt Generation with Real Data', () => {
        it('should generate Phase 1 prompt with no empty variables', async () => {
            const projectData = {
                title: 'Cari AI Receptionist',
                productName: 'Cari AI Receptionist',
                customerType: 'Small business owners with 5-50 employees',
                problem: 'Missing calls leads to lost revenue',
                outcome: 'Never miss a call, capture every lead',
                proofPoints: '48% appointment setting rate',
                differentiators: 'Works with existing phone system',
                objections: 'AI sounds robotic - ours sounds natural'
            };

            const project = await createProject(projectData);
            const prompt = await generatePromptForPhase(project, 1);

            // Verify no empty placeholders
            expect(prompt).not.toContain('{product_name}');
            expect(prompt).not.toContain('{customer_type}');
            expect(prompt).not.toContain('{problem}');
            expect(prompt).not.toContain('{outcome}');
            expect(prompt).not.toContain('{proof_points}');
            expect(prompt).not.toContain('{differentiators}');
            expect(prompt).not.toContain('{objections}');

            // Verify actual data is present
            expect(prompt).toContain('Cari AI Receptionist');
            expect(prompt).toContain('Small business owners with 5-50 employees');
            expect(prompt).toContain('Missing calls leads to lost revenue');
            expect(prompt).toContain('Never miss a call, capture every lead');
            expect(prompt).toContain('48% appointment setting rate');
            expect(prompt).toContain('Works with existing phone system');
            expect(prompt).toContain('AI sounds robotic - ours sounds natural');
        });

        it('should generate Phase 2 prompt with no empty variables', async () => {
            const projectData = {
                title: 'Test Project',
                productName: 'Test Product',
                customerType: 'Test Customers',
                problem: 'Test Problem',
                outcome: 'Test Outcome',
                proofPoints: 'Test Proof Points',
                differentiators: 'Test Differentiators',
                objections: 'Test Objections'
            };

            const project = await createProject(projectData);
            project.phases[1].response = 'Phase 1 response content';
            await storage.saveProject(project);

            const prompt = await generatePromptForPhase(project, 2);

            // Verify no empty placeholders
            expect(prompt).not.toContain('{product_name}');
            expect(prompt).not.toContain('{customer_type}');
            expect(prompt).not.toContain('{problem}');
            expect(prompt).not.toContain('{outcome}');
            expect(prompt).not.toContain('{proof_points}');
            expect(prompt).not.toContain('{differentiators}');
            expect(prompt).not.toContain('{objections}');
            expect(prompt).not.toContain('{phase1_output}');

            // Verify actual data is present
            expect(prompt).toContain('Test Product');
            expect(prompt).toContain('Phase 1 response content');
        });

        it('should generate Phase 3 prompt with no empty variables', async () => {
            const projectData = {
                title: 'Test Project',
                productName: 'Test Product',
                customerType: 'Test Customers',
                problem: 'Test Problem',
                outcome: 'Test Outcome',
                proofPoints: 'Test Proof Points',
                differentiators: 'Test Differentiators',
                objections: 'Test Objections'
            };

            const project = await createProject(projectData);
            project.phases[1].response = 'Phase 1 response content';
            project.phases[2].response = 'Phase 2 response content';
            await storage.saveProject(project);

            const prompt = await generatePromptForPhase(project, 3);

            // Verify no empty placeholders (using {{VAR}} syntax)
            expect(prompt).not.toContain('{{PRODUCT_NAME}}');
            expect(prompt).not.toContain('{{CUSTOMER_TYPE}}');
            expect(prompt).not.toContain('{{PROBLEM}}');
            expect(prompt).not.toContain('{{OUTCOME}}');
            expect(prompt).not.toContain('{{PROOF_POINTS}}');
            expect(prompt).not.toContain('{{DIFFERENTIATORS}}');
            expect(prompt).not.toContain('{{OBJECTIONS}}');
            expect(prompt).not.toContain('{{PHASE1_OUTPUT}}');
            expect(prompt).not.toContain('{{PHASE2_OUTPUT}}');

            // Verify actual data is present
            expect(prompt).toContain('Test Product');
            expect(prompt).toContain('Phase 1 response content');
            expect(prompt).toContain('Phase 2 response content');
        });
    });

    describe('Markdown Output Validation', () => {
        it('should verify Phase 1 prompt mandates markdown output', () => {
            const phase1Template = fs.readFileSync(
                path.join(process.cwd(), 'prompts/phase1.md'),
                'utf-8'
            );

            expect(phase1Template).toContain('```markdown');
            expect(phase1Template).toContain('# Power Statement for {{PRODUCT_NAME}}');
            expect(phase1Template).toContain('## Version A: Concise');
            expect(phase1Template).toContain('## Version B: Structured');
        });

        it('should verify Phase 2 prompt mandates markdown output', () => {
            const phase2Template = fs.readFileSync(
                path.join(process.cwd(), 'prompts/phase2.md'),
                'utf-8'
            );

            expect(phase2Template).toContain('```markdown');
            expect(phase2Template).toContain('# Phase 2: Critical Analysis & Improved Version');
            expect(phase2Template).toContain('## Critical Feedback');
            expect(phase2Template).toContain('## Improved Power Statement');
        });

        it('should verify Phase 3 prompt mandates markdown output', () => {
            const phase3Template = fs.readFileSync(
                path.join(process.cwd(), 'prompts/phase3.md'),
                'utf-8'
            );

            expect(phase3Template).toContain('```markdown');
            expect(phase3Template).toContain('# Final Power Statement for {{PRODUCT_NAME}}');
            expect(phase3Template).toContain('## Version A: Concise (30-Second Delivery)');
            expect(phase3Template).toContain('## Version B: Structured (Full Version)');
        });
    });

    describe('Edit Project Functionality', () => {
        it('should update project fields via updateProject', async () => {
            // Import updateProject
            const { updateProject, getProject } = await import('../js/projects.js');

            // Create initial project
            const initialData = {
                title: 'Original Title',
                productName: 'Original Product',
                customerType: 'Original Customers',
                problem: 'Original Problem',
                outcome: 'Original Outcome',
                proofPoints: 'Original Proof',
                differentiators: 'Original Diff',
                objections: 'Original Objections'
            };

            const project = await createProject(initialData);

            // Update the project
            const updates = {
                title: 'Updated Title',
                productName: 'Updated Product',
                problem: 'Updated Problem'
            };

            await updateProject(project.id, updates);

            // Verify updates
            const updatedProject = await getProject(project.id);
            expect(updatedProject.title).toBe('Updated Title');
            expect(updatedProject.productName).toBe('Updated Product');
            expect(updatedProject.problem).toBe('Updated Problem');
            // Unchanged fields should remain
            expect(updatedProject.customerType).toBe('Original Customers');
            expect(updatedProject.outcome).toBe('Original Outcome');
        });

        it('should allow clearing Phase 1 prompt after edit', async () => {
            const { updateProject, getProject, updatePhase } = await import('../js/projects.js');

            // Create project
            const project = await createProject({
                title: 'Test',
                productName: 'Test Product',
                customerType: 'Test Customers',
                problem: 'Test Problem',
                outcome: 'Test Outcome',
                proofPoints: 'Test Proof',
                differentiators: 'Test Diff',
                objections: 'Test Objections'
            });

            // Simulate copying prompt (Phase 1 gets a prompt but no response)
            await updatePhase(project.id, 1, 'Generated prompt content', '');

            // Verify Phase 1 has prompt
            let currentProject = await getProject(project.id);
            expect(currentProject.phases[1].prompt).toBe('Generated prompt content');
            expect(currentProject.phases[1].completed).toBe(false);

            // Simulate edit: update project and clear Phase 1
            await updateProject(project.id, {
                productName: 'Updated Product',
                phases: {
                    ...currentProject.phases,
                    1: { prompt: '', response: '', completed: false }
                }
            });

            // Verify Phase 1 was cleared
            currentProject = await getProject(project.id);
            expect(currentProject.phases[1].prompt).toBe('');
            expect(currentProject.phases[1].response).toBe('');
            expect(currentProject.phases[1].completed).toBe(false);
            expect(currentProject.productName).toBe('Updated Product');
        });

        it('should regenerate different prompt after field update', async () => {
            const { getProject, updateProject } = await import('../js/projects.js');

            // Create project
            const project = await createProject({
                title: 'Test',
                productName: 'Original Product',
                customerType: 'Original Customers',
                problem: 'Original Problem',
                outcome: 'Original Outcome',
                proofPoints: 'Original Proof',
                differentiators: 'Original Diff',
                objections: 'Original Objections'
            });

            // Generate initial prompt
            const initialPrompt = await generatePromptForPhase(project, 1);
            expect(initialPrompt).toContain('Original Product');

            // Update project
            await updateProject(project.id, { productName: 'Updated Product' });

            // Generate new prompt
            const updatedProject = await getProject(project.id);
            const newPrompt = await generatePromptForPhase(updatedProject, 1);

            // New prompt should contain updated value
            expect(newPrompt).toContain('Updated Product');
            expect(newPrompt).not.toContain('Original Product');
        });

        it('should preserve Phase 2 and 3 when editing in Phase 1', async () => {
            const { getProject, updateProject, updatePhase } = await import('../js/projects.js');

            // Create project
            const project = await createProject({
                title: 'Test',
                productName: 'Test Product',
                customerType: 'Test Customers',
                problem: 'Test Problem',
                outcome: 'Test Outcome',
                proofPoints: 'Test Proof',
                differentiators: 'Test Diff',
                objections: 'Test Objections'
            });

            // Simulate Phase 1 completion
            await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');

            // Verify Phase 1 is complete
            let currentProject = await getProject(project.id);
            expect(currentProject.phases[1].completed).toBe(true);

            // Update project details only (not phases) - simulating a different edit scenario
            await updateProject(project.id, { productName: 'New Product Name' });

            // Phases should be preserved
            currentProject = await getProject(project.id);
            expect(currentProject.phases[1].prompt).toBe('Phase 1 prompt');
            expect(currentProject.phases[1].response).toBe('Phase 1 response');
            expect(currentProject.phases[1].completed).toBe(true);
        });
    });

    describe('Phase Metadata', () => {
        it('should return correct AI names for each phase', async () => {
            const { getPhaseMetadata } = await import('../js/workflow.js');

            const phase1 = getPhaseMetadata(1);
            expect(phase1.aiModel).toBe('Claude');
            expect(phase1.name).toBe('Initial Draft');

            const phase2 = getPhaseMetadata(2);
            expect(phase2.aiModel).toBe('Gemini');
            expect(phase2.name).toBe('Adversarial Critique');

            const phase3 = getPhaseMetadata(3);
            expect(phase3.aiModel).toBe('Claude');
            expect(phase3.name).toBe('Final Synthesis');
        });

        it('should have icons for all phases', async () => {
            const { getPhaseMetadata } = await import('../js/workflow.js');

            expect(getPhaseMetadata(1).icon).toBe('📝');
            expect(getPhaseMetadata(2).icon).toBe('🔍');
            expect(getPhaseMetadata(3).icon).toBe('✨');
        });
    });

    describe('Phase 3 Completion UX', () => {
        it('should have Phase 3 as the final phase in workflow config', async () => {
            const { getPhaseMetadata, WORKFLOW_CONFIG } = await import('../js/workflow.js');

            // Phase 3 is the final phase
            expect(WORKFLOW_CONFIG.phaseCount).toBe(3);

            const phase3 = getPhaseMetadata(3);
            expect(phase3.name).toBe('Final Synthesis');
            expect(phase3.aiModel).toBe('Claude');
        });

        it('should persist phase=3 when Phase 3 is saved', async () => {
            const { createProject, updatePhase, updateProject, getProject } = await import('../js/projects.js');

            // Create project
            const project = await createProject({
                title: 'Export Test',
                productName: 'Test Product',
                customerType: 'Test customers',
                problem: 'Test problem',
                outcome: 'Test outcome',
                proofPoints: 'Test proof',
                differentiators: 'Test differentiators',
                objections: 'Test objections'
            });

            // Complete all phases
            await updatePhase(project.id, 1, 'Phase 1 prompt', 'Phase 1 response');
            await updateProject(project.id, { phase: 2 });
            await updatePhase(project.id, 2, 'Phase 2 prompt', 'Phase 2 response');
            await updateProject(project.id, { phase: 3 });
            await updatePhase(project.id, 3, 'Phase 3 prompt', '# Final Power Statement\n\nContent here.');
            await updateProject(project.id, { phase: 3 });

            // Verify phase stays at 3 (not reset to 1)
            const finalProject = await getProject(project.id);
            expect(finalProject.phase).toBe(3);
            expect(finalProject.phases[3].completed).toBe(true);
        });

        it('should mark all phases as completed after full workflow', async () => {
            const { createProject, updatePhase, getProject } = await import('../js/projects.js');

            const project = await createProject({
                title: 'Complete Workflow Test',
                productName: 'Test Product',
                customerType: 'Test customers',
                problem: 'Test problem',
                outcome: 'Test outcome',
                proofPoints: 'Test proof',
                differentiators: 'Test differentiators',
                objections: 'Test objections'
            });

            // Complete all phases
            await updatePhase(project.id, 1, 'Prompt 1', 'Response 1');
            await updatePhase(project.id, 2, 'Prompt 2', 'Response 2');
            await updatePhase(project.id, 3, 'Prompt 3', 'Response 3');

            const finalProject = await getProject(project.id);
            expect(finalProject.phases[1].completed).toBe(true);
            expect(finalProject.phases[2].completed).toBe(true);
            expect(finalProject.phases[3].completed).toBe(true);
        });

        it('should not auto-advance past Phase 3', async () => {
            const { createProject, updatePhase, updateProject, getProject } = await import('../js/projects.js');

            const project = await createProject({
                title: 'No Auto-Advance Test',
                productName: 'Test Product',
                customerType: 'Test customers',
                problem: 'Test problem',
                outcome: 'Test outcome',
                proofPoints: 'Test proof',
                differentiators: 'Test differentiators',
                objections: 'Test objections'
            });

            // Set to phase 3 and complete it
            await updateProject(project.id, { phase: 3 });
            await updatePhase(project.id, 3, 'Phase 3 prompt', 'Final response');

            // Phase should stay at 3, not go to 4
            const finalProject = await getProject(project.id);
            expect(finalProject.phase).toBe(3);
            expect(finalProject.phases[3].completed).toBe(true);
        });
    });
});
