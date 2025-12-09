/**
 * Tests for AI Mock UI Module
 * Tests mock mode toggle UI and state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initMockModeUI, toggleMockMode, updateMockModeUI } from '../js/ai-mock-ui-template.js';

describe('AI Mock UI Module', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '<div id="app-container"></div>';
    
    // Clear localStorage
    localStorage.clear();
    
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('initMockModeUI', () => {
    it('should create mock mode toggle in container', () => {
      const container = document.getElementById('app-container');
      initMockModeUI(container);
      
      const toggle = container.querySelector('[data-mock-toggle]');
      expect(toggle).toBeTruthy();
    });

    it('should initialize with mock mode enabled by default', () => {
      const container = document.getElementById('app-container');
      initMockModeUI(container);
      
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox.checked).toBe(true);
    });

    it('should respect localStorage mock mode setting', () => {
      localStorage.setItem('mockMode', 'false');
      
      const container = document.getElementById('app-container');
      initMockModeUI(container);
      
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox.checked).toBe(false);
    });

    it('should attach click handler to toggle', () => {
      const container = document.getElementById('app-container');
      initMockModeUI(container);
      
      const toggle = container.querySelector('[data-mock-toggle]');
      const checkbox = toggle.querySelector('input[type="checkbox"]');
      
      // Initial state
      expect(checkbox.checked).toBe(true);
      
      // Click toggle
      checkbox.click();
      
      // Should update localStorage
      expect(localStorage.getItem('mockMode')).toBe('false');
    });
  });

  describe('toggleMockMode', () => {
    it('should toggle mock mode from true to false', () => {
      localStorage.setItem('mockMode', 'true');
      
      const result = toggleMockMode();
      
      expect(result).toBe(false);
      expect(localStorage.getItem('mockMode')).toBe('false');
    });

    it('should toggle mock mode from false to true', () => {
      localStorage.setItem('mockMode', 'false');
      
      const result = toggleMockMode();
      
      expect(result).toBe(true);
      expect(localStorage.getItem('mockMode')).toBe('true');
    });

    it('should default to true when no localStorage value', () => {
      const result = toggleMockMode();
      
      expect(result).toBe(false); // Toggles from default true to false
      expect(localStorage.getItem('mockMode')).toBe('false');
    });
  });

  describe('updateMockModeUI', () => {
    it('should update checkbox state to match mock mode', () => {
      const container = document.getElementById('app-container');
      initMockModeUI(container);
      
      const checkbox = container.querySelector('input[type="checkbox"]');
      
      // Update to false
      updateMockModeUI(false);
      expect(checkbox.checked).toBe(false);
      
      // Update to true
      updateMockModeUI(true);
      expect(checkbox.checked).toBe(true);
    });

    it('should update label text to reflect mode', () => {
      const container = document.getElementById('app-container');
      initMockModeUI(container);
      
      const label = container.querySelector('[data-mock-label]');
      
      updateMockModeUI(true);
      expect(label.textContent).toContain('Mock');
      
      updateMockModeUI(false);
      expect(label.textContent).toContain('Live');
    });

    it('should handle missing UI elements gracefully', () => {
      // No UI initialized
      expect(() => updateMockModeUI(true)).not.toThrow();
    });
  });

  describe('Production Environment Detection', () => {
    it('should hide mock UI in production', () => {
      // Simulate production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const container = document.getElementById('app-container');
      initMockModeUI(container);
      
      const toggle = container.querySelector('[data-mock-toggle]');
      expect(toggle).toBeFalsy(); // Should not create UI in production
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });
  });
});

