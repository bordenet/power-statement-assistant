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

describe('Form-to-Prompt Integration Tests', () => {
    beforeEach(async () => {
        await storage.init();

        // Load prompt templates into storage
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
        const requiredVariables = [
            'product_name',
            'customer_type',
            'problem',
            'outcome',
            'proof_points',
            'differentiators',
            'objections'
        ];

        it('should have all required variables in Phase 1 prompt template', () => {
            const phase1Template = fs.readFileSync(
                path.join(process.cwd(), 'prompts/phase1.md'),
                'utf-8'
            );

            requiredVariables.forEach(variable => {
                expect(phase1Template).toContain(`{${variable}}`);
            });
        });

        it('should have all required variables in Phase 2 prompt template', () => {
            const phase2Template = fs.readFileSync(
                path.join(process.cwd(), 'prompts/phase2.md'),
                'utf-8'
            );

            requiredVariables.forEach(variable => {
                expect(phase2Template).toContain(`{${variable}}`);
            });
        });

        it('should have all required variables in Phase 3 prompt template', () => {
            const phase3Template = fs.readFileSync(
                path.join(process.cwd(), 'prompts/phase3.md'),
                'utf-8'
            );

            requiredVariables.forEach(variable => {
                expect(phase3Template).toContain(`{${variable}}`);
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

            // Verify no empty placeholders
            expect(prompt).not.toContain('{product_name}');
            expect(prompt).not.toContain('{customer_type}');
            expect(prompt).not.toContain('{problem}');
            expect(prompt).not.toContain('{outcome}');
            expect(prompt).not.toContain('{proof_points}');
            expect(prompt).not.toContain('{differentiators}');
            expect(prompt).not.toContain('{objections}');
            expect(prompt).not.toContain('{phase1_output}');
            expect(prompt).not.toContain('{phase2_output}');

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
            expect(phase1Template).toContain('# Power Statement for {product_name}');
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
            expect(phase3Template).toContain('# Final Power Statement for {product_name}');
            expect(phase3Template).toContain('## Version A: Concise (30-Second Delivery)');
            expect(phase3Template).toContain('## Version B: Structured (Full Version)');
        });
    });
});

