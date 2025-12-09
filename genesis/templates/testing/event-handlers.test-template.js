/**
 * Event Handler Validation Tests
 *
 * CRITICAL: These tests prevent "stillborn apps" - UI that looks complete
 * but has buttons that do nothing because event handlers were never wired.
 *
 * This is a critical class of bug that has occurred multiple times in
 * Genesis-derived projects. Every clickable element MUST have a handler.
 *
 * LESSON: After creating a button, immediately verify the handler exists.
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// Configure these paths for your project
const JS_SOURCE_DIR = './js';
const HTML_SOURCE_FILE = './index.html';

describe('Event Handler Validation - Stillborn App Prevention', () => {
  let jsFiles = [];
  let htmlContent = '';

  beforeEach(() => {
    // Read all JS files
    if (fs.existsSync(JS_SOURCE_DIR)) {
      jsFiles = fs.readdirSync(JS_SOURCE_DIR)
        .filter(f => f.endsWith('.js'))
        .map(f => ({
          name: f,
          content: fs.readFileSync(path.join(JS_SOURCE_DIR, f), 'utf8')
        }));
    }

    // Read HTML file
    if (fs.existsSync(HTML_SOURCE_FILE)) {
      htmlContent = fs.readFileSync(HTML_SOURCE_FILE, 'utf8');
    }
  });

  /**
   * Extract button IDs from HTML and JS template strings
   */
  function extractButtonIds(content) {
    const patterns = [
      /id=["']([^"']*-btn)["']/g,        // id="some-btn"
      /id=["']([^"']*Button)["']/g,      // id="submitButton"
      /class=["'][^"']*\b([a-z-]+-btn)\b[^"']*["']/g  // class="view-prompt-btn"
    ];

    const ids = new Set();
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        ids.add(match[1]);
      }
    }
    return Array.from(ids);
  }

  /**
   * Check if a button ID has an event handler
   */
  function hasEventHandler(buttonId, allContent) {
    // Check for addEventListener
    if (allContent.includes(`'${buttonId}'`) || allContent.includes(`"${buttonId}"`)) {
      if (allContent.includes('addEventListener') || allContent.includes('onclick')) {
        return true;
      }
    }

    // Check for class-based selection with querySelector
    if (allContent.includes(`.${buttonId}`) && allContent.includes('addEventListener')) {
      return true;
    }

    // Check for getElementById pattern
    const getByIdPattern = new RegExp(`getElementById\\(['"]${buttonId}['"]\\)[^;]*addEventListener`);
    if (getByIdPattern.test(allContent)) {
      return true;
    }

    return false;
  }

  test('CRITICAL: All buttons in HTML have event handlers', () => {
    if (!htmlContent) {
      console.warn('No HTML file found - skipping HTML button check');
      return;
    }

    const buttonIds = extractButtonIds(htmlContent);
    const allJsContent = jsFiles.map(f => f.content).join('\n');
    const allContent = htmlContent + '\n' + allJsContent;

    const missingHandlers = [];
    for (const buttonId of buttonIds) {
      if (!hasEventHandler(buttonId, allContent)) {
        missingHandlers.push(buttonId);
      }
    }

    if (missingHandlers.length > 0) {
      throw new Error(
        `STILLBORN APP DETECTED!\n` +
        `These buttons have NO event handlers:\n` +
        missingHandlers.map(id => `  - ${id}`).join('\n') + '\n\n' +
        `Fix: Add addEventListener() for each button.`
      );
    }
  });

  test('CRITICAL: All buttons in JS template strings have event handlers', () => {
    const allJsContent = jsFiles.map(f => f.content).join('\n');
    const buttonIds = extractButtonIds(allJsContent);

    const missingHandlers = [];
    for (const buttonId of buttonIds) {
      if (!hasEventHandler(buttonId, allJsContent)) {
        missingHandlers.push(buttonId);
      }
    }

    if (missingHandlers.length > 0) {
      throw new Error(
        `STILLBORN APP DETECTED!\n` +
        `These buttons in JS templates have NO event handlers:\n` +
        missingHandlers.map(id => `  - ${id}`).join('\n') + '\n\n' +
        `Fix: Add addEventListener() after rendering the template.`
      );
    }
  });

  /**
   * Verify specific critical buttons exist and have handlers
   * Customize this list for your app
   */
  test('CRITICAL: Core workflow buttons have handlers', () => {
    const criticalButtons = [
      'copy-prompt-btn',
      'save-response-btn',
      'view-prompt-btn',
      'next-phase-btn',
      'prev-phase-btn'
    ];

    const allContent = jsFiles.map(f => f.content).join('\n') + '\n' + htmlContent;

    for (const buttonId of criticalButtons) {
      // Skip if button doesn't exist in codebase
      if (!allContent.includes(buttonId)) continue;

      expect(hasEventHandler(buttonId, allContent)).toBe(true);
    }
  });
});

