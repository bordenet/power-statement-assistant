import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
    createProject,
    getAllProjects,
    getProject,
    updatePhase,
    updateProject,
    deleteProject,
    exportProject,
    exportAllProjects,
    importProjects
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

    describe('exportProject', () => {
        beforeEach(() => {
            // Mock URL and createElement for download
            URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
            URL.revokeObjectURL = jest.fn();
        });

        test('should export a project as JSON file', async () => {
            const projectData = {
                title: 'Export Test',
                productName: 'Product',
                customerType: 'SMB',
                problem: 'Problem',
                outcome: 'Outcome',
                proofPoints: 'Proof',
                differentiators: 'Diff',
                objections: 'Obj'
            };

            const project = await createProject(projectData);
            await exportProject(project.id);

            expect(URL.createObjectURL).toHaveBeenCalled();
            expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
        });

        test('should throw error for non-existent project', async () => {
            await expect(exportProject('non-existent-id')).rejects.toThrow('Project not found');
        });
    });

    describe('exportAllProjects', () => {
        beforeEach(() => {
            URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
            URL.revokeObjectURL = jest.fn();
        });

        test('should export all projects as backup JSON', async () => {
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

            await exportAllProjects();

            expect(URL.createObjectURL).toHaveBeenCalled();
            expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
        });

        test('should export empty backup when no projects exist', async () => {
            await exportAllProjects();

            expect(URL.createObjectURL).toHaveBeenCalled();
        });
    });

    describe('importProjects', () => {
        test('should import single project from JSON file', async () => {
            const singleProject = {
                id: 'test-import-id',
                title: 'Imported Project',
                productName: 'Product',
                customerType: 'SMB',
                problem: 'Problem',
                outcome: 'Outcome',
                proofPoints: 'Proof',
                differentiators: 'Diff',
                objections: 'Obj',
                phase: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                phases: {
                    1: { prompt: '', response: '', completed: false },
                    2: { prompt: '', response: '', completed: false },
                    3: { prompt: '', response: '', completed: false }
                }
            };

            const file = new Blob([JSON.stringify(singleProject)], { type: 'application/json' });
            const imported = await importProjects(file);

            expect(imported).toBe(1);

            const retrieved = await getProject('test-import-id');
            expect(retrieved.title).toBe('Imported Project');
        });

        test('should import backup file with multiple projects', async () => {
            const backup = {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                projectCount: 2,
                projects: [
                    {
                        id: 'backup-id-1',
                        title: 'Backup Project 1',
                        productName: 'Product',
                        customerType: 'SMB',
                        problem: 'Problem',
                        outcome: 'Outcome',
                        proofPoints: 'Proof',
                        differentiators: 'Diff',
                        objections: 'Obj',
                        phase: 1,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        phases: {
                            1: { prompt: '', response: '', completed: false },
                            2: { prompt: '', response: '', completed: false },
                            3: { prompt: '', response: '', completed: false }
                        }
                    },
                    {
                        id: 'backup-id-2',
                        title: 'Backup Project 2',
                        productName: 'Product',
                        customerType: 'Enterprise',
                        problem: 'Problem',
                        outcome: 'Outcome',
                        proofPoints: 'Proof',
                        differentiators: 'Diff',
                        objections: 'Obj',
                        phase: 2,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        phases: {
                            1: { prompt: 'p', response: 'r', completed: true },
                            2: { prompt: '', response: '', completed: false },
                            3: { prompt: '', response: '', completed: false }
                        }
                    }
                ]
            };

            const file = new Blob([JSON.stringify(backup)], { type: 'application/json' });
            const imported = await importProjects(file);

            expect(imported).toBe(2);

            const project1 = await getProject('backup-id-1');
            const project2 = await getProject('backup-id-2');

            expect(project1.title).toBe('Backup Project 1');
            expect(project2.title).toBe('Backup Project 2');
        });

        test('should reject invalid file format', async () => {
            const invalidContent = { random: 'data' };
            const file = new Blob([JSON.stringify(invalidContent)], { type: 'application/json' });

            await expect(importProjects(file)).rejects.toThrow('Invalid file format');
        });

        test('should reject invalid JSON', async () => {
            const file = new Blob(['not valid json'], { type: 'application/json' });

            await expect(importProjects(file)).rejects.toThrow();
        });
    });
});
