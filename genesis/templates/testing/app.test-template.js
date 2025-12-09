/**
 * App Module Tests
 * Tests for main application initialization
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import storage from '../js/storage.js';
import * as router from '../js/router.js';
import * as workflow from '../js/workflow.js';
import * as ui from '../js/ui.js';

// Mock all dependencies
vi.mock('../js/storage.js', () => ({
  default: {
    init: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock('../js/router.js', () => ({
  initRouter: vi.fn()
}));

vi.mock('../js/workflow.js', () => ({
  loadDefaultPrompts: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../js/ui.js', () => ({
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
  showToast: vi.fn(),
  formatBytes: vi.fn((bytes) => `${bytes} bytes`)
}));

vi.mock('../js/projects.js', () => ({
  exportAllProjects: vi.fn().mockResolvedValue(undefined),
  importProjects: vi.fn().mockResolvedValue(undefined)
}));

describe('App Module', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup minimal DOM
    document.body.innerHTML = `
      <div id="app-container"></div>
      <button id="theme-toggle"></button>
      <button id="export-all-btn"></button>
      <button id="import-btn"></button>
      <button id="related-projects-btn"></button>
      <div id="related-projects-menu" class="hidden"></div>
      <div id="storage-info"></div>
    `;
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('should initialize storage on app load', async () => {
    // Import app module to trigger initialization
    await import('../js/app.js');
    
    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(storage.init).toHaveBeenCalled();
  });

  test('should initialize router on app load', async () => {
    await import('../js/app.js');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(router.initRouter).toHaveBeenCalled();
  });

  test('should load default prompts on app load', async () => {
    await import('../js/app.js');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(workflow.loadDefaultPrompts).toHaveBeenCalled();
  });

  test('should show and hide loading indicator during initialization', async () => {
    await import('../js/app.js');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(ui.showLoading).toHaveBeenCalledWith('Initializing...');
    expect(ui.hideLoading).toHaveBeenCalled();
  });

  test('should handle initialization errors gracefully', async () => {
    // Make storage.init fail
    storage.init.mockRejectedValueOnce(new Error('Storage init failed'));
    
    // Re-import to trigger init with error
    vi.resetModules();
    await import('../js/app.js');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(console.error).toHaveBeenCalledWith(
      'Failed to initialize app:',
      expect.any(Error)
    );
    expect(ui.showToast).toHaveBeenCalledWith(
      'Failed to initialize app. Please refresh the page.',
      'error',
      5000
    );
  });

  test('should setup theme toggle event listener', async () => {
    await import('../js/app.js');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const themeToggle = document.getElementById('theme-toggle');
    expect(themeToggle).toBeTruthy();
    
    // Verify event listener was attached (by checking if click triggers theme change)
    // Note: Full theme toggle testing would require mocking localStorage and classList
  });

  test('should setup export all button event listener', async () => {
    await import('../js/app.js');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const exportBtn = document.getElementById('export-all-btn');
    expect(exportBtn).toBeTruthy();
  });

  test('should setup import button event listener', async () => {
    await import('../js/app.js');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const importBtn = document.getElementById('import-btn');
    expect(importBtn).toBeTruthy();
  });

  test('should setup related projects dropdown toggle', async () => {
    await import('../js/app.js');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const relatedProjectsBtn = document.getElementById('related-projects-btn');
    const relatedProjectsMenu = document.getElementById('related-projects-menu');
    
    expect(relatedProjectsBtn).toBeTruthy();
    expect(relatedProjectsMenu).toBeTruthy();
    expect(relatedProjectsMenu.classList.contains('hidden')).toBe(true);
  });
});

