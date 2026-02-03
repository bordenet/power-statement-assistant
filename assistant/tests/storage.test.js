/**
 * Unit Tests for Storage Module
 *
 * Tests IndexedDB operations for project persistence.
 */

import storage from '../js/storage.js';

describe('Storage Module', () => {
    beforeEach(async () => {
    // Initialize database before each test
        await storage.init();
    });

    afterEach(async () => {
    // Clean up database after each test
        const projects = await storage.getAllProjects();
        for (const project of projects) {
            await storage.deleteProject(project.id);
        }
    });

    describe('initDB', () => {
        test('initializes database successfully', async () => {
            const result = await storage.init();
            expect(result).toBe(true);
        });

        test('handles multiple initialization calls', async () => {
            await storage.init();
            const result = await storage.init();
            expect(result).toBe(true);
        });
    });

    describe('saveProject', () => {
        test('saves new project', async () => {
            const project = {
                id: 'test-1',
                name: 'Test Project',
                created: Date.now(),
                modified: Date.now(),
                phases: []
            };

            const result = await storage.saveProject(project);
            expect(result).toBe(true);

            const retrieved = await storage.getProject('test-1');
            expect(retrieved).toEqual(project);
        });

        test('updates existing project', async () => {
            const project = {
                id: 'test-2',
                name: 'Original Name',
                created: Date.now(),
                modified: Date.now(),
                phases: []
            };

            await storage.saveProject(project);

            project.name = 'Updated Name';
            project.modified = Date.now();
            await storage.saveProject(project);

            const retrieved = await storage.getProject('test-2');
            expect(retrieved.name).toBe('Updated Name');
        });

        test('handles invalid project data', async () => {
            await expect(storage.saveProject(null)).rejects.toThrow();
            await expect(storage.saveProject({})).rejects.toThrow();
        });
    });

    describe('getProject', () => {
        test('retrieves existing project', async () => {
            const project = {
                id: 'test-3',
                name: 'Test Project',
                created: Date.now(),
                modified: Date.now(),
                phases: []
            };

            await storage.saveProject(project);
            const retrieved = await storage.getProject('test-3');
            expect(retrieved).toEqual(project);
        });

        test('returns null for non-existent project', async () => {
            const retrieved = await storage.getProject('non-existent');
            expect(retrieved).toBeNull();
        });

        test('handles invalid ID', async () => {
            await expect(storage.getProject(null)).rejects.toThrow();
            await expect(storage.getProject('')).rejects.toThrow();
        });
    });

    describe('getAllProjects', () => {
        test('returns empty array when no projects', async () => {
            const projects = await storage.getAllProjects();
            expect(projects).toEqual([]);
        });

        test('returns all projects', async () => {
            const project1 = {
                id: 'test-4',
                name: 'Project 1',
                created: Date.now(),
                modified: Date.now(),
                phases: []
            };

            const project2 = {
                id: 'test-5',
                name: 'Project 2',
                created: Date.now(),
                modified: Date.now(),
                phases: []
            };

            await storage.saveProject(project1);
            await storage.saveProject(project2);

            const projects = await storage.getAllProjects();
            expect(projects).toHaveLength(2);
            expect(projects.map(p => p.id)).toContain('test-4');
            expect(projects.map(p => p.id)).toContain('test-5');
        });

        test('returns projects sorted by modified date', async () => {
            const project1 = {
                id: 'test-6',
                name: 'Older Project',
                created: Date.now() - 2000,
                modified: Date.now() - 2000,
                phases: []
            };

            const project2 = {
                id: 'test-7',
                name: 'Newer Project',
                created: Date.now(),
                modified: Date.now(),
                phases: []
            };

            await storage.saveProject(project1);
            await storage.saveProject(project2);

            const projects = await storage.getAllProjects();
            expect(projects[0].id).toBe('test-7'); // Newer first
            expect(projects[1].id).toBe('test-6');
        });
    });

    describe('deleteProject', () => {
        test('deletes existing project', async () => {
            const project = {
                id: 'test-8',
                name: 'Test Project',
                created: Date.now(),
                modified: Date.now(),
                phases: []
            };

            await storage.saveProject(project);
            const result = await storage.deleteProject('test-8');
            expect(result).toBe(true);

            const retrieved = await storage.getProject('test-8');
            expect(retrieved).toBeNull();
        });

        test('handles deleting non-existent project', async () => {
            const result = await storage.deleteProject('non-existent');
            expect(result).toBe(false);
        });

        test('handles invalid ID', async () => {
            await expect(storage.deleteProject(null)).rejects.toThrow();
            await expect(storage.deleteProject('')).rejects.toThrow();
        });
    });

    describe('exportProject', () => {
        test('exports project as JSON', async () => {
            const project = {
                id: 'test-9',
                name: 'Export Test',
                created: Date.now(),
                modified: Date.now(),
                phases: [
                    { number: 1, name: 'Phase 1', completed: true }
                ]
            };

            await storage.saveProject(project);
            const exported = await storage.exportProject('test-9');

            expect(typeof exported).toBe('string');
            const parsed = JSON.parse(exported);
            expect(parsed).toEqual(project);
        });

        test('handles non-existent project', async () => {
            await expect(storage.exportProject('non-existent')).rejects.toThrow();
        });
    });

    describe('importProject', () => {
        test('imports project from JSON', async () => {
            const project = {
                id: 'test-10',
                name: 'Import Test',
                created: Date.now(),
                modified: Date.now(),
                phases: []
            };

            const json = JSON.stringify(project);
            const result = await storage.importProject(json);
            expect(result).toBe(true);

            const retrieved = await storage.getProject('test-10');
            expect(retrieved).toMatchObject(project);
            expect(retrieved.updatedAt).toBeDefined();
        });

        test('handles invalid JSON', async () => {
            await expect(storage.importProject('invalid json')).rejects.toThrow();
        });

        test('handles missing required fields', async () => {
            const invalidProject = { name: 'No ID' };
            const json = JSON.stringify(invalidProject);
            await expect(storage.importProject(json)).rejects.toThrow();
        });
    });

    describe('getSetting and saveSetting', () => {
        test('saves and retrieves a setting', async () => {
            await storage.saveSetting('testKey', 'testValue');
            const value = await storage.getSetting('testKey');
            expect(value).toBe('testValue');
        });

        test('returns null for non-existent setting', async () => {
            const value = await storage.getSetting('nonExistentKey');
            expect(value).toBeNull();
        });

        test('overwrites existing setting', async () => {
            await storage.saveSetting('key1', 'value1');
            await storage.saveSetting('key1', 'value2');
            const value = await storage.getSetting('key1');
            expect(value).toBe('value2');
        });

        test('saves complex object as setting', async () => {
            const obj = { foo: 'bar', count: 42 };
            await storage.saveSetting('objKey', obj);
            const value = await storage.getSetting('objKey');
            expect(value).toEqual(obj);
        });
    });

    describe('getStorageInfo and getStorageEstimate', () => {
        let originalNavigator;

        beforeEach(() => {
            originalNavigator = global.navigator;
        });

        afterEach(() => {
            global.navigator = originalNavigator;
        });

        test('returns storage info when storage API available', async () => {
            // Mock navigator.storage.estimate
            const mockEstimate = { usage: 1000, quota: 10000 };
            Object.defineProperty(global, 'navigator', {
                value: {
                    storage: {
                        estimate: jest.fn().mockResolvedValue(mockEstimate)
                    }
                },
                writable: true,
                configurable: true
            });

            const info = await storage.getStorageInfo();
            expect(info).toBeTruthy();
            expect(info.usage).toBe(1000);
            expect(info.quota).toBe(10000);
            expect(info.percentage).toBe('10.00');
        });

        test('getStorageEstimate is alias for getStorageInfo', async () => {
            const mockEstimate = { usage: 500, quota: 5000 };
            Object.defineProperty(global, 'navigator', {
                value: {
                    storage: {
                        estimate: jest.fn().mockResolvedValue(mockEstimate)
                    }
                },
                writable: true,
                configurable: true
            });

            const info = await storage.getStorageEstimate();
            expect(info).toBeTruthy();
            expect(info.usage).toBe(500);
        });

        test('returns null when storage API unavailable', async () => {
            Object.defineProperty(global, 'navigator', {
                value: {},
                writable: true,
                configurable: true
            });
            const info = await storage.getStorageInfo();
            expect(info).toBeNull();
        });
    });

    describe('exportAll and importAll', () => {
        test('exports all projects', async () => {
            const project1 = { id: 'exp-1', name: 'Export 1', created: Date.now(), modified: Date.now(), phases: [] };
            const project2 = { id: 'exp-2', name: 'Export 2', created: Date.now(), modified: Date.now(), phases: [] };

            await storage.saveProject(project1);
            await storage.saveProject(project2);

            const exported = await storage.exportAll();
            expect(exported.projects.length).toBe(2);
            expect(exported.projectCount).toBe(2);
            expect(exported.exportDate).toBeDefined();
            expect(exported.version).toBeDefined();
        });

        test('imports all projects from export data', async () => {
            const project1 = { id: 'imp-1', name: 'Import 1', created: Date.now(), modified: Date.now(), phases: [] };
            const project2 = { id: 'imp-2', name: 'Import 2', created: Date.now(), modified: Date.now(), phases: [] };

            const importData = {
                version: 1,
                exportDate: new Date().toISOString(),
                projectCount: 2,
                projects: [project1, project2]
            };

            const count = await storage.importAll(importData);
            expect(count).toBe(2);

            const retrieved1 = await storage.getProject('imp-1');
            const retrieved2 = await storage.getProject('imp-2');
            expect(retrieved1).toBeTruthy();
            expect(retrieved2).toBeTruthy();
        });

        test('importAll throws on invalid data', async () => {
            await expect(storage.importAll({})).rejects.toThrow('Invalid import data');
            await expect(storage.importAll({ projects: 'not-array' })).rejects.toThrow('Invalid import data');
        });
    });
});
