/**
 * Visual Regression Tests
 * Uses Playwright to capture screenshots and detect visual changes
 * 
 * Run with: npm run test:visual
 * Update snapshots: npm run test:visual -- --update-snapshots
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto(BASE_URL);
    
    // Wait for app to be fully loaded
    await page.waitForSelector('#app-container', { state: 'visible' });
  });

  test('homepage - light mode', async ({ page }) => {
    // Ensure light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    
    // Wait for theme to apply
    await page.waitForTimeout(100);
    
    // Take screenshot
    await expect(page).toHaveScreenshot('homepage-light.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('homepage - dark mode', async ({ page }) => {
    // Ensure dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    
    // Wait for theme to apply
    await page.waitForTimeout(100);
    
    // Take screenshot
    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('new project form', async ({ page }) => {
    // Navigate to new project form
    await page.click('button:has-text("New Project")');

    // Wait for form to render - use name attribute selector
    await page.waitForSelector('input[name="title"]', { state: 'visible' });
    
    // Take screenshot
    await expect(page).toHaveScreenshot('new-project-form.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('project list with data', async ({ page }) => {
    // Create a test project via UI - use name attribute selectors
    await page.click('button:has-text("New Project")');
    await page.fill('input[name="title"]', 'Test Project');
    await page.fill('textarea[name="problems"]', 'Test problem statement');
    await page.click('button[type="submit"]:has-text("Create Project")');
    
    // Wait for redirect to home
    await page.waitForURL(/.*#?$/);
    await page.waitForSelector('[data-project-id]', { state: 'visible' });
    
    // Take screenshot
    await expect(page).toHaveScreenshot('project-list-with-data.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('project workflow view', async ({ page }) => {
    // Create a test project - use name attribute selectors
    await page.click('button:has-text("New Project")');
    await page.fill('input[name="title"]', 'Visual Test Project');
    await page.fill('textarea[name="problems"]', 'Test problem');
    await page.click('button[type="submit"]:has-text("Create Project")');
    
    // Wait for redirect and click on project
    await page.waitForURL(/.*#?$/);
    await page.click('[data-project-id]');
    
    // Wait for project view to load
    await page.waitForSelector('.phase-indicator', { state: 'visible' });
    
    // Take screenshot
    await expect(page).toHaveScreenshot('project-workflow-view.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('responsive - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Take screenshot
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('responsive - tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Take screenshot
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('theme toggle button', async ({ page }) => {
    // Focus on header area
    const header = page.locator('header');
    
    // Take screenshot of header with theme toggle
    await expect(header).toHaveScreenshot('header-with-theme-toggle.png', {
      animations: 'disabled'
    });
  });

  test('empty state', async ({ page }) => {
    // Clear all projects via storage
    await page.evaluate(() => {
      return indexedDB.deleteDatabase('{{DB_NAME}}');
    });
    
    // Reload page
    await page.reload();
    await page.waitForSelector('#app-container', { state: 'visible' });
    
    // Take screenshot of empty state
    await expect(page).toHaveScreenshot('empty-state.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});

