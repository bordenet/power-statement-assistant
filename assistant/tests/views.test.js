import { renderProjectsList, renderNewProjectForm, renderEditProjectForm } from '../../shared/js/views.js';
import { createProject, deleteProject, getAllProjects, getProject } from '../../shared/js/projects.js';
import storage from '../../shared/js/storage.js';

describe('Views Module', () => {
  beforeEach(async () => {
    // Initialize database
    await storage.init();

    // Clear all projects
    const allProjects = await getAllProjects();
    for (const project of allProjects) {
      await deleteProject(project.id);
    }

    // Set up DOM
    document.body.innerHTML = '<div id="app-container"></div><span id="storage-info"></span><div id="toast-container"></div>';
  });

  // Helper to create a valid project with all required fields
  const createTestProject = async (overrides = {}) => {
    return await createProject({
      title: 'Test Power Statement',
      productName: 'Test Product',
      customerType: 'Developers',
      problem: 'Test Problem',
      outcome: 'Test Outcome',
      proofPoints: 'Test Proof Points',
      differentiators: 'Test Differentiators',
      objections: 'Test Objections',
      ...overrides
    });
  };

  describe('renderProjectsList', () => {
    test('should render empty state when no projects exist', async () => {
      await renderProjectsList();

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('No Power Statements yet');
      expect(container.innerHTML).toContain('Create your first Power Statement');
    });

    test('should render projects list when projects exist', async () => {
      await createTestProject({ title: 'My Test Statement' });

      await renderProjectsList();

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('My Test Statement');
      expect(container.innerHTML).toContain('My Power Statements');
    });

    test('should render new project button', async () => {
      await renderProjectsList();

      const container = document.getElementById('app-container');
      const newProjectBtn = container.querySelector('#new-project-btn');
      expect(newProjectBtn).toBeTruthy();
      expect(newProjectBtn.textContent).toContain('New Power Statement');
    });

    test('should render project cards with phase information', async () => {
      await createTestProject();

      await renderProjectsList();

      const container = document.getElementById('app-container');
      // UX shows compact "X/3" with segments instead of "Phase X/3"
      expect(container.innerHTML).toContain('/3');
    });

    test('should render delete buttons for each project', async () => {
      await createTestProject();

      await renderProjectsList();

      const container = document.getElementById('app-container');
      const deleteBtn = container.querySelector('.delete-project-btn');
      expect(deleteBtn).toBeTruthy();
    });
  });

  describe('renderNewProjectForm', () => {
    test('should render new project form', () => {
      renderNewProjectForm();

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Create New Power Statement');
      expect(container.innerHTML).toContain('Product/Service Name');
    });

    test('should render all required form fields', () => {
      renderNewProjectForm();

      const container = document.getElementById('app-container');
      expect(container.querySelector('#title')).toBeTruthy();
      expect(container.querySelector('#productName')).toBeTruthy();
      expect(container.querySelector('#customerType')).toBeTruthy();
      expect(container.querySelector('#problem')).toBeTruthy();
      expect(container.querySelector('#outcome')).toBeTruthy();
      expect(container.querySelector('#proofPoints')).toBeTruthy();
      expect(container.querySelector('#differentiators')).toBeTruthy();
      expect(container.querySelector('#objections')).toBeTruthy();
    });

    test('should render back button', () => {
      renderNewProjectForm();

      const container = document.getElementById('app-container');
      const backBtn = container.querySelector('#back-btn');
      expect(backBtn).toBeTruthy();
      expect(backBtn.textContent).toContain('Back');
    });
  });

  describe('renderEditProjectForm', () => {
    test('should render edit form with project data', async () => {
      const project = await createTestProject({ title: 'Edit Test Statement' });

      await renderEditProjectForm(project.id);

      const container = document.getElementById('app-container');
      expect(container.innerHTML).toContain('Edit Power Statement');
      expect(container.querySelector('#title').value).toBe('Edit Test Statement');
    });

    // Note: This test is skipped because the renderEditProjectForm function
    // calls navigateTo('home') when the project is not found, which triggers
    // DOM operations that conflict with Jest's ESM module loading.
    test.skip('should handle non-existent project gracefully', async () => {
      await renderEditProjectForm('non-existent-id');
      // Should navigate away or show error, not crash
      expect(true).toBe(true);
    });
  });
});
