/**
 * Tests for Views Module
 * Tests project list and form rendering
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderProjectsList, renderNewProjectForm, renderEmptyState } from '../js/views-template.js';

describe('Views Module', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '<div id="app-container"></div>';
    
    // Clear mocks
    vi.clearAllMocks();
  });

  describe('renderProjectsList', () => {
    it('should render empty state when no projects', () => {
      const container = document.getElementById('app-container');
      renderProjectsList(container, []);
      
      expect(container.innerHTML).toContain('No projects yet');
      expect(container.querySelector('[data-action="create-first"]')).toBeTruthy();
    });

    it('should render project cards for multiple projects', () => {
      const projects = [
        { id: '1', title: 'Project 1', updatedAt: '2025-01-01T00:00:00.000Z' },
        { id: '2', title: 'Project 2', updatedAt: '2025-01-02T00:00:00.000Z' },
        { id: '3', title: 'Project 3', updatedAt: '2025-01-03T00:00:00.000Z' }
      ];
      
      const container = document.getElementById('app-container');
      renderProjectsList(container, projects);
      
      const projectCards = container.querySelectorAll('[data-project-id]');
      expect(projectCards.length).toBe(3);
    });

    it('should display project titles', () => {
      const projects = [
        { id: '1', title: 'My Test Project', updatedAt: '2025-01-01T00:00:00.000Z' }
      ];
      
      const container = document.getElementById('app-container');
      renderProjectsList(container, projects);
      
      expect(container.innerHTML).toContain('My Test Project');
    });

    it('should display formatted update dates', () => {
      const projects = [
        { id: '1', title: 'Project 1', updatedAt: '2025-01-15T12:30:00.000Z' }
      ];
      
      const container = document.getElementById('app-container');
      renderProjectsList(container, projects);
      
      // Should contain formatted date
      expect(container.innerHTML).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should make project cards clickable', () => {
      const projects = [
        { id: '123', title: 'Project 1', updatedAt: '2025-01-01T00:00:00.000Z' }
      ];
      
      const container = document.getElementById('app-container');
      renderProjectsList(container, projects);
      
      const projectCard = container.querySelector('[data-project-id="123"]');
      expect(projectCard).toBeTruthy();
      expect(projectCard.classList.contains('cursor-pointer')).toBe(true);
    });

    it('should render new project button when projects exist', () => {
      const projects = [
        { id: '1', title: 'Project 1', updatedAt: '2025-01-01T00:00:00.000Z' }
      ];
      
      const container = document.getElementById('app-container');
      renderProjectsList(container, projects);
      
      const newButton = container.querySelector('[data-action="new-project"]');
      expect(newButton).toBeTruthy();
    });
  });

  describe('renderNewProjectForm', () => {
    it('should render form with title input', () => {
      const container = document.getElementById('app-container');
      renderNewProjectForm(container);
      
      const titleInput = container.querySelector('input[name="title"]');
      expect(titleInput).toBeTruthy();
      expect(titleInput.placeholder).toContain('{{PROJECT_TITLE_EXAMPLE}}');
    });

    it('should render form with description textarea', () => {
      const container = document.getElementById('app-container');
      renderNewProjectForm(container);
      
      const descTextarea = container.querySelector('textarea[name="description"]');
      expect(descTextarea).toBeTruthy();
    });

    it('should render create button', () => {
      const container = document.getElementById('app-container');
      renderNewProjectForm(container);
      
      const createButton = container.querySelector('[data-action="create"]');
      expect(createButton).toBeTruthy();
      expect(createButton.textContent).toContain('Create');
    });

    it('should render cancel button', () => {
      const container = document.getElementById('app-container');
      renderNewProjectForm(container);
      
      const cancelButton = container.querySelector('[data-action="cancel"]');
      expect(cancelButton).toBeTruthy();
    });

    it('should pre-fill form with existing project data', () => {
      const project = {
        id: '123',
        title: 'Existing Project',
        description: 'Existing description'
      };
      
      const container = document.getElementById('app-container');
      renderNewProjectForm(container, project);
      
      const titleInput = container.querySelector('input[name="title"]');
      const descTextarea = container.querySelector('textarea[name="description"]');
      
      expect(titleInput.value).toBe('Existing Project');
      expect(descTextarea.value).toBe('Existing description');
    });
  });

  describe('renderEmptyState', () => {
    it('should render empty state message', () => {
      const container = document.getElementById('app-container');
      renderEmptyState(container);
      
      expect(container.innerHTML).toContain('No projects yet');
    });

    it('should render emoji icon', () => {
      const container = document.getElementById('app-container');
      renderEmptyState(container);
      
      expect(container.innerHTML).toContain('{{HEADER_EMOJI}}');
    });

    it('should render create first project button', () => {
      const container = document.getElementById('app-container');
      renderEmptyState(container);
      
      const button = container.querySelector('[data-action="create-first"]');
      expect(button).toBeTruthy();
      expect(button.textContent).toContain('Create');
    });
  });
});

