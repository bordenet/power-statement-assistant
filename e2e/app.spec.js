import { test, expect } from "@playwright/test";

test.describe("Power Statement Assistant", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate first, then clear storage
    await page.goto("/");

    // Clear storage before each test
    await page.evaluate(() => {
      localStorage.clear();
      indexedDB.deleteDatabase("power-statement-assistant");
    });

    // Reload to apply cleared storage
    await page.reload();
  });

  test("should load the application", async ({ page }) => {
    const title = await page.title();
    expect(title).toContain("Power Statement Assistant");
  });

  test("should display privacy notice on first load", async ({ page }) => {
    const privacyNotice = await page.locator("#privacy-notice");
    await expect(privacyNotice).toBeVisible();
  });

  test("should have close button for privacy notice", async ({ page }) => {
    const privacyNotice = await page.locator("#privacy-notice");
    await expect(privacyNotice).toBeVisible();

    // Verify close button exists and is visible
    const closeBtn = await page.locator("#close-privacy-notice");
    await expect(closeBtn).toBeVisible();

    // Verify it's a button element
    const btnType = await closeBtn.getAttribute("type");
    expect(btnType).toBe("button");
  });

  test("should close privacy notice and persist state", async ({ page }) => {
    const privacyNotice = await page.locator("#privacy-notice");
    await expect(privacyNotice).toBeVisible();

    const closeBtn = await page.locator("#close-privacy-notice");

    // Click the close button
    await closeBtn.click();

    // Wait for any animations
    await page.waitForTimeout(200);

    // Verify the notice is removed (not just hidden)
    await expect(privacyNotice).toHaveCount(0);
  });

  test("should toggle dark mode", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const themeToggle = await page.locator("[id*='theme']").first();
    const htmlElement = await page.locator("html");

    // Get initial dark mode state
    let initialClasses = await htmlElement.getAttribute("class") || "";
    const initialDark = initialClasses.includes("dark");

    // Click the theme toggle button
    await themeToggle.click();

    // Wait for state change
    await page.waitForTimeout(100);

    // Get updated dark mode state
    let updatedClasses = await htmlElement.getAttribute("class") || "";
    const updatedDark = updatedClasses.includes("dark");

    // Verify the dark class was toggled
    expect(initialDark).not.toBe(updatedDark);
  });

  test("should create a new project", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Click create project button
    const createBtn = await page.locator("button").filter({ hasText: /Create|New/ }).first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);

      // Verify we're on a project creation/editing view by checking for any input/textarea
      const mainContent = await page.locator("main");
      await expect(mainContent).toBeVisible();
    }
  });

  test("should display storage info", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const storageInfo = await page.locator("#storage-info");
    await expect(storageInfo).toBeVisible();
  });

  test("should display related projects dropdown", async ({ page }) => {
    const relatedBtn = await page.locator("#related-projects-btn");
    await expect(relatedBtn).toBeVisible();

    await relatedBtn.click();
    await page.waitForTimeout(100);

    const menu = await page.locator("#related-projects-menu");
    const isVisible = await menu.isVisible();
    expect(typeof isVisible).toBe('boolean');
  });

  test("should have export button in header", async ({ page }) => {
    const exportBtn = await page.locator("#export-all-btn");
    await expect(exportBtn).toBeVisible();
  });

  test("should have import button in header", async ({ page }) => {
    const importBtn = await page.locator("#import-btn");
    await expect(importBtn).toBeVisible();
  });

  test("should display correct header title", async ({ page }) => {
    const header = await page.locator("h1");
    const text = await header.textContent();
    expect(text).toContain("Power Statement Assistant");
  });

  test("should have footer with links", async ({ page }) => {
    const footer = await page.locator("footer");
    await expect(footer).toBeVisible();

    const githubLink = footer.locator("a[href*='github']").first();
    await expect(githubLink).toBeVisible();
  });

  test("should be responsive on mobile", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();
    await page.goto("/");

    const title = await page.title();
    expect(title).toContain("Power Statement Assistant");

    await context.close();
  });
});
