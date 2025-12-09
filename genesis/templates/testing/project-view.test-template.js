/**
 * Tests for Project View Module
 * Tests project workflow view rendering and navigation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderProjectView, renderPhaseIndicator, handlePhaseNavigation } from '../js/project-view-template.js';

describe('Project View Module', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '<div id="app-container"></div>';
    
    // Clear mocks
    vi.clearAllMocks();
  });

  describe('renderProjectView', () => {
    it('should render project view with valid project', () => {
      const project = {
        id: '123',
        title: 'Test Project',
        phase: 1,
        createdAt: '2025-01-01T00:00:00.000Z'
      };
      
      const container = document.getElementById('app-container');
      renderProjectView(container, project);
      
      expect(container.innerHTML).toContain('Test Project');
      expect(container.querySelector('[data-project-id="123"]')).toBeTruthy();
    });

    it('should render phase indicator', () => {
      const project = {
        id: '123',
        title: 'Test Project',
        phase: 2,
        createdAt: '2025-01-01T00:00:00.000Z'
      };
      
      const container = document.getElementById('app-container');
      renderProjectView(container, project);
      
      const phaseIndicator = container.querySelector('.phase-indicator');
      expect(phaseIndicator).toBeTruthy();
      expect(phaseIndicator.textContent).toContain('Phase 2');
    });

    it('should render back button', () => {
      const project = {
        id: '123',
        title: 'Test Project',
        phase: 1,
        createdAt: '2025-01-01T00:00:00.000Z'
      };
      
      const container = document.getElementById('app-container');
      renderProjectView(container, project);
      
      const backButton = container.querySelector('[data-action="back"]');
      expect(backButton).toBeTruthy();
    });

    it('should handle missing project gracefully', () => {
      const container = document.getElementById('app-container');
      
      expect(() => renderProjectView(container, null)).not.toThrow();
      expect(container.innerHTML).toContain('Project not found');
    });

    it('should render export button', () => {
      const project = {
        id: '123',
        title: 'Test Project',
        phase: 3,
        createdAt: '2025-01-01T00:00:00.000Z'
      };
      
      const container = document.getElementById('app-container');
      renderProjectView(container, project);
      
      const exportButton = container.querySelector('[data-action="export"]');
      expect(exportButton).toBeTruthy();
    });
  });

  describe('renderPhaseIndicator', () => {
    it('should render all {{PHASE_COUNT}} phases', () => {
      const container = document.createElement('div');
      renderPhaseIndicator(container, 2);
      
      const phases = container.querySelectorAll('.phase');
      expect(phases.length).toBe({{PHASE_COUNT}});
    });

    it('should mark current phase as active', () => {
      const container = document.createElement('div');
      renderPhaseIndicator(container, 2);
      
      const activePhase = container.querySelector('.phase.active');
      expect(activePhase).toBeTruthy();
      expect(activePhase.dataset.phase).toBe('2');
    });

    it('should mark completed phases', () => {
      const container = document.createElement('div');
      renderPhaseIndicator(container, 3);
      
      const completedPhases = container.querySelectorAll('.phase.completed');
      expect(completedPhases.length).toBe(2); // Phases 1 and 2
    });

    it('should handle phase 1 correctly', () => {
      const container = document.createElement('div');
      renderPhaseIndicator(container, 1);
      
      const completedPhases = container.querySelectorAll('.phase.completed');
      expect(completedPhases.length).toBe(0);
    });
  });

  describe('handlePhaseNavigation', () => {
    it('should navigate to clicked phase', () => {
      const mockCallback = vi.fn();
      const container = document.createElement('div');
      
      renderPhaseIndicator(container, 2);
      handlePhaseNavigation(container, mockCallback);
      
      const phase1 = container.querySelector('[data-phase="1"]');
      phase1.click();
      
      expect(mockCallback).toHaveBeenCalledWith(1);
    });

    it('should not navigate to future phases', () => {
      const mockCallback = vi.fn();
      const container = document.createElement('div');
      
      renderPhaseIndicator(container, 1);
      handlePhaseNavigation(container, mockCallback);
      
      const phase2 = container.querySelector('[data-phase="2"]');
      phase2.click();
      
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should allow navigation to completed phases', () => {
      const mockCallback = vi.fn();
      const container = document.createElement('div');
      
      renderPhaseIndicator(container, 3);
      handlePhaseNavigation(container, mockCallback);
      
      const phase1 = container.querySelector('[data-phase="1"]');
      phase1.click();
      
      expect(mockCallback).toHaveBeenCalledWith(1);
    });
  });
});

