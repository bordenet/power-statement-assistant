/**
 * Router Module
 * @module router
 * Handles client-side routing for multi-project navigation
 * @module router
 *
 * This module provides hash-based routing to navigate between:
 * @module router
 * - Home view (project list)
 * - New project form
 * - Individual project workflow view
 */

import { renderProjectsList, renderNewProjectForm, renderEditProjectForm } from './views.js';
import { renderProjectView } from './project-view.js';
import storage from './storage.js';
import { formatBytes } from './ui.js';

const routes = {
  'home': renderProjectsList,
  'new-project': renderNewProjectForm,
  'edit-project': renderEditProjectForm,
  'project': renderProjectView
};

let currentRoute = null;
let currentParams = null;

/**
 * Update storage info in footer - called after every route render
 * @module router
 */
export async function updateStorageInfo() {
  const estimate = await storage.getStorageEstimate();
  const storageInfo = document.getElementById('storage-info');

  if (!storageInfo) return;

  if (estimate) {
    const used = formatBytes(estimate.usage || 0);
    const quota = formatBytes(estimate.quota || 0);
    const percent = ((estimate.usage / estimate.quota) * 100).toFixed(1);
    storageInfo.textContent = `Storage: ${used} / ${quota} (${percent}%)`;
  } else {
    storageInfo.textContent = 'Storage: Available';
  }
}

/**
 * Navigate to a route
 * @module router
 * @param {string} route - Route name ('home', 'new-project', 'project')
 * @param {...any} params - Route parameters (e.g., project ID)
 */
export async function navigateTo(route, ...params) {
  currentRoute = route;
  currentParams = params;

  // Update URL hash
  if (route === 'home') {
    window.location.hash = '';
  } else if (route === 'new-project') {
    window.location.hash = '#new';
  } else if (route === 'edit-project' && params[0]) {
    window.location.hash = `#edit/${params[0]}`;
  } else if (route === 'project' && params[0]) {
    window.location.hash = `#project/${params[0]}`;
  }

  // Render the route
  const handler = routes[route];
  if (handler) {
    await handler(...params);
    // Update footer stats after every route render
    await updateStorageInfo();
  } else {
    console.error(`Route not found: ${route}`);
    navigateTo('home');
  }
}

/**
 * Initialize router
 * @module router
 * Sets up hash change listener and handles initial route
 * @module router
 */
export function initRouter() {
  // Handle hash changes
  window.addEventListener('hashchange', handleHashChange);

  // Handle initial load
  handleHashChange();
}

/**
 * Handle hash change events
 * @module router
 * Parses URL hash and navigates to appropriate route
 * @module router
 */
function handleHashChange() {
  const hash = window.location.hash.slice(1); // Remove #

  if (!hash) {
    navigateTo('home');
  } else if (hash === 'new') {
    navigateTo('new-project');
  } else if (hash.startsWith('edit/')) {
    const projectId = hash.split('/')[1];
    navigateTo('edit-project', projectId);
  } else if (hash.startsWith('project/')) {
    const projectId = hash.split('/')[1];
    navigateTo('project', projectId);
  } else {
    navigateTo('home');
  }
}

/**
 * Get current route information
 * @module router
 * @returns {Object} Current route and parameters
 */
export function getCurrentRoute() {
  return { route: currentRoute, params: currentParams };
}
