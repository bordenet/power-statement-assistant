/**
 * Router Module Tests
 * Tests for client-side routing functionality
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { navigateTo, initRouter, getCurrentRoute } from '../js/router.js';
import * as views from '../js/views.js';
import * as projectView from '../js/project-view.js';

// Mock the view modules
vi.mock('../js/views.js', () => ({
  renderProjectsList: vi.fn(),
  renderNewProjectForm: vi.fn()
}));

vi.mock('../js/project-view.js', () => ({
  renderProjectView: vi.fn()
}));

describe('Router Module', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Reset window.location.hash
    window.location.hash = '';
    
    // Mock console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('navigateTo', () => {
    test('should navigate to home route', () => {
      navigateTo('home');
      
      expect(window.location.hash).toBe('');
      expect(views.renderProjectsList).toHaveBeenCalledTimes(1);
      expect(getCurrentRoute()).toEqual({ route: 'home', params: [] });
    });

    test('should navigate to new-project route', () => {
      navigateTo('new-project');
      
      expect(window.location.hash).toBe('#new');
      expect(views.renderNewProjectForm).toHaveBeenCalledTimes(1);
      expect(getCurrentRoute()).toEqual({ route: 'new-project', params: [] });
    });

    test('should navigate to project route with ID', () => {
      const projectId = 'test-project-123';
      navigateTo('project', projectId);
      
      expect(window.location.hash).toBe(`#project/${projectId}`);
      expect(projectView.renderProjectView).toHaveBeenCalledWith(projectId);
      expect(getCurrentRoute()).toEqual({ route: 'project', params: [projectId] });
    });

    test('should handle invalid route by navigating to home', () => {
      navigateTo('invalid-route');
      
      expect(console.error).toHaveBeenCalledWith('Route not found: invalid-route');
      // Should recursively call navigateTo('home')
      expect(views.renderProjectsList).toHaveBeenCalled();
    });

    test('should pass multiple parameters to route handler', () => {
      navigateTo('project', 'id-123', 'extra-param');
      
      expect(projectView.renderProjectView).toHaveBeenCalledWith('id-123', 'extra-param');
      expect(getCurrentRoute()).toEqual({ route: 'project', params: ['id-123', 'extra-param'] });
    });
  });

  describe('initRouter', () => {
    test('should set up hashchange listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      initRouter();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
    });

    test('should handle initial route on load', () => {
      window.location.hash = '#new';
      
      initRouter();
      
      expect(views.renderNewProjectForm).toHaveBeenCalled();
    });
  });

  describe('handleHashChange (via hash changes)', () => {
    beforeEach(() => {
      initRouter();
      vi.clearAllMocks(); // Clear the initial load call
    });

    test('should navigate to home when hash is empty', () => {
      window.location.hash = '';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      
      expect(views.renderProjectsList).toHaveBeenCalled();
    });

    test('should navigate to new-project when hash is #new', () => {
      window.location.hash = '#new';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      
      expect(views.renderNewProjectForm).toHaveBeenCalled();
    });

    test('should navigate to project view when hash is #project/ID', () => {
      const projectId = 'abc-123';
      window.location.hash = `#project/${projectId}`;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      
      expect(projectView.renderProjectView).toHaveBeenCalledWith(projectId);
    });

    test('should navigate to home for unrecognized hash', () => {
      window.location.hash = '#unknown';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      
      expect(views.renderProjectsList).toHaveBeenCalled();
    });
  });

  describe('getCurrentRoute', () => {
    test('should return current route and params', () => {
      navigateTo('project', 'test-id');
      
      const current = getCurrentRoute();
      
      expect(current.route).toBe('project');
      expect(current.params).toEqual(['test-id']);
    });

    test('should return null values before any navigation', () => {
      const current = getCurrentRoute();
      
      expect(current.route).toBeNull();
      expect(current.params).toBeNull();
    });
  });
});

