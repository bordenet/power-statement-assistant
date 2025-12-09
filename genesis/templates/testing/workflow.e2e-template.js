/**
 * End-to-End Tests for Workflow
 * 
 * Tests complete user workflows from start to finish.
 */

import { test, expect } from '@playwright/test';

test.describe('{{PROJECT_TITLE}} Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('displays homepage correctly', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/{{PROJECT_TITLE}}/);
    
    // Check header
    await expect(page.locator('h1')).toContainText('{{PROJECT_TITLE}}');
    
    // Check new project button
    await expect(page.locator('button:has-text("New Project")')).toBeVisible();
  });

  test('creates new project', async ({ page }) => {
    // Click new project button
    await page.click('button:has-text("New Project")');

    // Fill project form - field names match views-template.js
    await page.fill('input[name="title"]', 'Test Project');
    await page.fill('textarea[name="problems"]', 'Test problem description');

    // Submit form - use specific selector to avoid matching heading text
    await page.click('button[type="submit"]:has-text("Create Project")');

    // Verify project created
    await expect(page.locator('h2')).toContainText('Test Project');
    await expect(page.locator('.phase-indicator')).toContainText('Phase 1');
  });

  test('completes {{PHASE_COUNT}}-phase workflow', async ({ page }) => {
    // Create project
    await page.click('button:has-text("New Project")');
    await page.fill('input[name="title"]', 'Workflow Test');
    await page.fill('textarea[name="problems"]', 'Workflow test problems');
    await page.click('button[type="submit"]:has-text("Create Project")');
    
    // Phase 1
    await expect(page.locator('.phase-indicator')).toContainText('Phase 1');
    await page.fill('textarea[name="response"]', 'Phase 1 response content');
    await page.click('button:has-text("Next")');
    
    // Phase 2
    await expect(page.locator('.phase-indicator')).toContainText('Phase 2');
    await page.fill('textarea[name="response"]', 'Phase 2 response content');
    await page.click('button:has-text("Next")');
    
    // Phase 3 (if applicable)
    // IF {{PHASE_COUNT}} >= 3
    await expect(page.locator('.phase-indicator')).toContainText('Phase 3');
    await page.fill('textarea[name="response"]', 'Phase 3 response content');
    await page.click('button:has-text("Complete")');
    // END IF
    
    // Verify completion
    await expect(page.locator('.completion-message')).toBeVisible();
    await expect(page.locator('.completion-message')).toContainText('Complete');
  });

  test('saves and loads project', async ({ page }) => {
    // Create project
    await page.click('button:has-text("New Project")');
    await page.fill('input[name="title"]', 'Save Test');
    await page.fill('textarea[name="problems"]', 'Save test problems');
    await page.click('button[type="submit"]:has-text("Create Project")');
    
    // Add content
    await page.fill('textarea[name="response"]', 'Test content');
    
    // Save (auto-save should trigger)
    await page.waitForTimeout(1000);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify project still exists
    await expect(page.locator('text=Save Test')).toBeVisible();
    
    // Open project
    await page.click('text=Save Test');
    
    // Verify content preserved
    await expect(page.locator('textarea[name="response"]')).toHaveValue('Test content');
  });

  test('exports project', async ({ page }) => {
    // Create project
    await page.click('button:has-text("New Project")');
    await page.fill('input[name="title"]', 'Export Test');
    await page.fill('textarea[name="problems"]', 'Export test problems');
    await page.click('button[type="submit"]:has-text("Create Project")');
    
    // Add content
    await page.fill('textarea[name="response"]', 'Export content');
    
    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/export-test.*\.json/i);
  });

  test('imports project', async ({ page }) => {
    // Create mock project file
    const projectData = {
      id: 'import-test',
      name: 'Imported Project',
      created: Date.now(),
      modified: Date.now(),
      phases: [
        { number: 1, name: 'Phase 1', response: 'Imported content', completed: true }
      ]
    };
    
    // Create file
    const buffer = Buffer.from(JSON.stringify(projectData));
    
    // Click import
    await page.click('button:has-text("Import")');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'project.json',
      mimeType: 'application/json',
      buffer: buffer
    });
    
    // Verify import
    await expect(page.locator('text=Imported Project')).toBeVisible();
  });

  test('deletes project', async ({ page }) => {
    // Create project
    await page.click('button:has-text("New Project")');
    await page.fill('input[name="title"]', 'Delete Test');
    await page.fill('textarea[name="problems"]', 'Delete test problems');
    await page.click('button[type="submit"]:has-text("Create Project")');
    
    // Go back to project list
    await page.click('button:has-text("Back")');
    
    // Delete project
    await page.click('button[aria-label="Delete Delete Test"]');
    
    // Confirm deletion
    await page.click('button:has-text("Confirm")');
    
    // Verify deleted
    await expect(page.locator('text=Delete Test')).not.toBeVisible();
  });

  test('handles dark mode toggle', async ({ page }) => {
    // Check initial theme
    const html = page.locator('html');
    
    // Toggle dark mode
    await page.click('button[aria-label="Toggle dark mode"]');
    
    // Verify dark mode applied
    await expect(html).toHaveAttribute('data-theme', 'dark');
    
    // Toggle back
    await page.click('button[aria-label="Toggle dark mode"]');
    
    // Verify light mode
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('handles errors gracefully', async ({ page }) => {
    // Trigger error (e.g., invalid input)
    await page.click('button:has-text("New Project")');
    // Submit without filling required fields
    await page.click('button[type="submit"]:has-text("Create Project")');

    // Verify validation prevents submission (HTML5 required attribute)
    // The form should not submit and the title input should show validation
    await expect(page.locator('input[name="title"]:invalid')).toBeVisible();
  });

  test('is mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("New Project")')).toBeVisible();
    
    // Test mobile navigation
    await page.click('button:has-text("New Project")');
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });
});

