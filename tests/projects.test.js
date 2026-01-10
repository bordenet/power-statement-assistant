import { describe, test, expect, beforeEach } from '@jest/globals';
import {
    createProject,
    getAllProjects,
    getProject,
    updatePhase,
    updateProject,
    deleteProject
} from '../js/projects.js';
import storage from '../js/storage.js';

describe('Projects Module', () => {
    beforeEach(async () => {
    // Initialize storage
        await storage.init();
        // Clear all projects
        const allProjects = await getAllProjects();
        for (const project of allProjects) {
            await deleteProject(project.id);
        }
    });

    describe('createProject', () => {
        test('should create a new project with all required fields', async () => {
            const projectData = {
                title: 'Test Project',
                productName: 'Test Product',
                customerType: 'Enterprise',
                problem: 'Test problem',
                outcome: 'Test outcome',
                proofPoints: 'Test proof',
                differentiators: 'Test diff',
                objections: 'Test objections'
            };

            const project = await createProject(projectData);

            expect(project.id).toBeTruthy();
            expect(project.title).toBe('Test Project');
            expect(project.productName).toBe('Test Product');
            expect(project.customerType).toBe('Enterprise');
            expect(project.problem).toBe('Test problem');
            expect(project.phase).toBe(1);
            expect(project.createdAt).toBeTruthy();
            expect(project.updatedAt).toBeTruthy();
        });

        test('should initialize phases correctly', async () => {
            const projectData = {
                title: 'Test',
                productName: 'Product',
                customerType: 'SMB',
                problem: 'Problem',
                outcome: 'Outcome',
                proofPoints: 'Proof',
                differentiators: 'Diff',
                objections: 'Obj'
            };

            const project = await createProject(projectData);

            expect(project.phases).toBeTruthy();
            expect(project.phases[1]).toEqual({ prompt: '', response: '', completed: false });
            expect(project.phases[2]).toEqual({ prompt: '', response: '', completed: false });
            expect(project.phases[3]).toEqual({ prompt: '', response: '', completed: false });
        });

        test('should trim whitespace from inputs', async () => {
            const projectData = {
                title: '  Test  ',
                productName: '  Product  ',
                customerType: '  SMB  ',
                problem: '  Problem  ',
                outcome: '  Outcome  ',
                proofPoints: '  Proof  ',
                differentiators: '  Diff  ',
                objections: '  Obj  '
            };

            const project = await createProject(projectData);

            expect(project.title).toBe('Test');
            expect(project.productName).toBe('Product');
        });

        test('should save project to storage', async () => {
            const projectData = {
                title: 'Test',
                productName: 'Product',
                customerType: 'SMB',
                problem: 'Problem',
                outcome: 'Outcome',
                proofPoints: 'Proof',
                differentiators: 'Diff',
                objections: 'Obj'
            };

            const project = await createProject(projectData);
            const retrieved = await storage.getProject(project.id);

            expect(retrieved).toBeTruthy();
            expect(retrieved.id).toBe(project.id);
        });
    });

    describe('getAllProjects', () => {
        test('should return empty array when no projects exist', async () => {
            const projects = await getAllProjects();
            expect(projects).toEqual([]);
        });

        test('should return all created projects', async () => {
            const projectData = {
                title: 'Test',
                productName: 'Product',
                customerType: 'SMB',
                problem: 'Problem',
                outcome: 'Outcome',
                proofPoints: 'Proof',
                differentiators: 'Diff',
                objections: 'Obj'
            };

            await createProject({ ...projectData, title: 'Project 1' });
            await createProject({ ...projectData, title: 'Project 2' });

            const projects = await getAllProjects();
            expect(projects.length).toBe(2);
        });
    });

    describe('getProject', () => {
        test('should return project by id', async () => {
            const projectData = {
                title: 'Test',
                productName: 'Product',
                customerType: 'SMB',
                problem: 'Problem',
                outcome: 'Outcome',
                proofPoints: 'Proof',
                differentiators: 'Diff',
                objections: 'Obj'
            };

            const created = await createProject(projectData);
            const retrieved = await getProject(created.id);

            expect(retrieved.id).toBe(created.id);
            expect(retrieved.title).toBe('Test');
        });

        test('should return null for non-existent project', async () => {
            const result = await getProject('non-existent-id');
            expect(result).toBeNull();
        });
    });

    describe('updatePhase', () => {
        test('should update phase prompt and response', async () => {
            const projectData = {
                title: 'Test',
                productName: 'Product',
                customerType: 'SMB',
                problem: 'Problem',
                outcome: 'Outcome',
                proofPoints: 'Proof',
                differentiators: 'Diff',
                objections: 'Obj'
            };

            const project = await createProject(projectData);
            const updated = await updatePhase(project.id, 1, 'Test prompt', 'Test response');

            expect(updated.phases[1].prompt).toBe('Test prompt');
            expect(updated.phases[1].response).toBe('Test response');
            expect(updated.phases[1].completed).toBe(true);
        });

        test('should not auto-advance phase (handled in UI)', async () => {
            const projectData = {
                title: 'Test',
                productName: 'Product',
                customerType: 'SMB',
                problem: 'Problem',
                outcome: 'Outcome',
                proofPoints: 'Proof',
                differentiators: 'Diff',
                objections: 'Obj'
            };

            const project = await createProject(projectData);
            const updated = await updatePhase(project.id, 1, 'Prompt', 'Response');

            // Phase advancement is handled in project-view.js, not here
            expect(updated.phase).toBe(1);
        });
    });

    describe('updateProject', () => {
        test('should update project fields', async () => {
            const projectData = {
                title: 'Original Title',
                productName: 'Product',
                customerType: 'SMB',
                problem: 'Problem',
                outcome: 'Outcome',
                proofPoints: 'Proof',
                differentiators: 'Diff',
                objections: 'Obj'
            };

            const project = await createProject(projectData);
            const updated = await updateProject(project.id, { title: 'New Title' });

            expect(updated.title).toBe('New Title');
        });
    });

    describe('deleteProject', () => {
        test('should remove project from storage', async () => {
            const projectData = {
                title: 'To Delete',
                productName: 'Product',
                customerType: 'SMB',
                problem: 'Problem',
                outcome: 'Outcome',
                proofPoints: 'Proof',
                differentiators: 'Diff',
                objections: 'Obj'
            };

            const project = await createProject(projectData);
            await deleteProject(project.id);

            const result = await getProject(project.id);
            expect(result).toBeNull();
        });
    });
});

