/**
 * Views Module
 * @module views
 * Handles rendering different views/screens
 * @module views
 *
 * This module provides the main UI views:
 * @module views
 * - Project list view (home)
 * - New project form
 *
 * Each view is rendered into the #app-container element
 * @module views
 */

import { getAllProjects, createProject, deleteProject, getProject, updateProject } from './projects.js';
import { formatDate, escapeHtml, confirm, showToast, showDocumentPreviewModal } from './ui.js';
import { navigateTo } from './router.js';
import { getFinalMarkdown, getExportFilename } from './workflow.js';

/**
 * Render the projects list view
 * @module views
 * Shows all projects with their status and progress
 * @module views
 */
export async function renderProjectsList() {
  const projects = await getAllProjects();

  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="mb-6 flex items-center justify-between">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
                My Power Statements
            </h2>
            <button id="new-project-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                + New Power Statement
            </button>
        </div>

        ${projects.length === 0 ? `
            <div class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <span class="text-6xl mb-4 block">📋</span>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Power Statements yet
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first Power Statement
                </p>
                <button id="new-project-btn-empty" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    + Create Your First Power Statement
                </button>
            </div>
        ` : `
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                ${projects.map(project => {
    // Check if project is fully complete (all phases done)
    const isComplete = project.phases &&
                        project.phases[1]?.completed &&
                        project.phases[2]?.completed &&
                        project.phases[3]?.completed;
    return `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" data-project-id="${project.id}">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-3">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                    ${escapeHtml(project.title)}
                                </h3>
                                <div class="flex items-center space-x-2">
                                    ${isComplete ? `
                                    <button class="preview-project-btn text-gray-400 hover:text-blue-600 transition-colors" data-project-id="${project.id}" title="Preview & Copy">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                    ` : ''}
                                    <button class="delete-project-btn text-gray-400 hover:text-red-600 transition-colors" data-project-id="${project.id}" title="Delete">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="flex items-center space-x-2 mb-2">
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Phase ${Math.min(project.phase, 3)}/3</span>
                                    <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${Math.min((project.phase / 3) * 100, 100)}%"></div>
                                    </div>
                                </div>
                                <div class="flex space-x-1">
                                    ${[1, 2, 3].map(phase => `
                                        <div class="flex-1 h-1 rounded ${project.phases?.[phase]?.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}"></div>
                                    `).join('')}
                                </div>
                            </div>

                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                ${escapeHtml(project.problems)}
                            </p>

                            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Updated ${formatDate(project.updatedAt)}</span>
                                <span>${Object.values(project.phases).filter(p => p.completed).length}/3 complete</span>
                            </div>
                        </div>
                    </div>
                `;}).join('')}
            </div>
        `}
    `;

  // Event listeners
  const newProjectBtns = container.querySelectorAll('#new-project-btn, #new-project-btn-empty');
  newProjectBtns.forEach(btn => {
    btn.addEventListener('click', () => navigateTo('new-project'));
  });

  const projectCards = container.querySelectorAll('[data-project-id]');
  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-project-btn') && !e.target.closest('.preview-project-btn')) {
        navigateTo('project', card.dataset.projectId);
      }
    });
  });

  // Preview buttons (for completed projects)
  const previewBtns = container.querySelectorAll('.preview-project-btn');
  previewBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const markdown = getFinalMarkdown(project);
        if (markdown) {
          showDocumentPreviewModal(markdown, 'Your Power Statement is Ready', getExportFilename(project));
        } else {
          showToast('No content to preview', 'warning');
        }
      }
    });
  });

  const deleteBtns = container.querySelectorAll('.delete-project-btn');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = projects.find(p => p.id === projectId);

      if (await confirm(`Are you sure you want to delete "${project.title}"?`, 'Delete Project')) {
        await deleteProject(projectId);
        showToast('Project deleted', 'success');
        renderProjectsList();
      }
    });
  });
}

/**
 * Render the new project form
 * @module views
 * Collects all 7 required fields for power statement generation
 * @module views
 */
export function renderNewProjectForm() {
  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="max-w-5xl mx-auto">
            <div class="mb-6">
                <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to Power Statements
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Create New Power Statement
                </h2>

                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Fill in the details below to generate a compelling power statement. All fields marked with <span class="text-red-500">*</span> are required.
                </p>

                <form id="new-project-form" class="space-y-6">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Project Title <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Cari AI Receptionist Power Statement"
                        >
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">A descriptive name for this project</p>
                    </div>

                    <div>
                        <label for="productName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Product/Service Name <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="productName"
                            name="productName"
                            required
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Cari AI Receptionist"
                        >
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">The name of your product or service</p>
                    </div>

                    <div>
                        <label for="customerType" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Customer Type <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="customerType"
                            name="customerType"
                            required
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Small business owners with 5-50 employees"
                        >
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Be specific about who you serve</p>
                    </div>

                    <div>
                        <label for="problem" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Problem Being Solved <span class="text-red-500">*</span>
                        </label>
                        <textarea
                            id="problem"
                            name="problem"
                            required
                            rows="3"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Missing calls leads to lost revenue and frustrated customers"
                        ></textarea>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">The pain point your customers recognize and feel</p>
                    </div>

                    <div>
                        <label for="outcome" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Desired Outcome <span class="text-red-500">*</span>
                        </label>
                        <textarea
                            id="outcome"
                            name="outcome"
                            required
                            rows="3"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Never miss a call, capture every lead, and book more appointments"
                        ></textarea>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">The results customers want to achieve</p>
                    </div>

                    <div>
                        <label for="proofPoints" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Proof Points/Results <span class="text-red-500">*</span>
                        </label>
                        <textarea
                            id="proofPoints"
                            name="proofPoints"
                            required
                            rows="3"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 48% appointment setting rate, 95% call answer rate, customers see ROI in first month"
                        ></textarea>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Specific, quantified results and proof points</p>
                    </div>

                    <div>
                        <label for="differentiators" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Key Differentiators <span class="text-red-500">*</span>
                        </label>
                        <textarea
                            id="differentiators"
                            name="differentiators"
                            required
                            rows="3"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Works with existing phone system, no complex training required, sounds completely human"
                        ></textarea>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">What makes your solution unique</p>
                    </div>

                    <div>
                        <label for="objections" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Common Objections to Address <span class="text-red-500">*</span>
                        </label>
                        <textarea
                            id="objections"
                            name="objections"
                            required
                            rows="3"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 'AI sounds robotic' - Our AI is trained on real conversations and sounds completely natural"
                        ></textarea>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Common concerns and how you address them</p>
                    </div>

                    <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Next Phase →
                        </button>
                        <button type="button" id="delete-btn" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                            Delete
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

  // Event listeners
  document.getElementById('back-btn').addEventListener('click', () => navigateTo('home'));

  // Delete button - discard/cancel and go back
  document.getElementById('delete-btn').addEventListener('click', () => navigateTo('home'));

  // Next Phase button - save and continue to workflow
  document.getElementById('new-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const projectData = {
      title: formData.get('title'),
      productName: formData.get('productName'),
      customerType: formData.get('customerType'),
      problem: formData.get('problem'),
      outcome: formData.get('outcome'),
      proofPoints: formData.get('proofPoints'),
      differentiators: formData.get('differentiators'),
      objections: formData.get('objections')
    };

    const project = await createProject(projectData);
    showToast('Power Statement created! Starting Phase 1...', 'success');
    navigateTo('project', project.id);
  });
}

/**
 * Render the edit project form
 * @module views
 * Pre-populates form with existing project data
 * @module views
 * @param {string} projectId - ID of the project to edit
 */
export async function renderEditProjectForm(projectId) {
  const project = await getProject(projectId);

  if (!project) {
    showToast('Power Statement not found', 'error');
    navigateTo('home');
    return;
  }

  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="max-w-5xl mx-auto">
            <div class="mb-6">
                <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to Phase 1
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Edit Power Statement Details
                </h2>

                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Update the details below. Changes will be used when regenerating the Phase 1 prompt.
                </p>

                <form id="edit-project-form" class="space-y-6">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Project Title <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            value="${escapeHtml(project.title)}"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Cari AI Receptionist Power Statement"
                        >
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">A descriptive name for this project</p>
                    </div>

                    <div>
                        <label for="productName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Product/Service Name <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="productName"
                            name="productName"
                            required
                            value="${escapeHtml(project.productName)}"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Cari AI Receptionist"
                        >
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">The name of your product or service</p>
                    </div>

                    <div>
                        <label for="customerType" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Customer Type <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="customerType"
                            name="customerType"
                            required
                            value="${escapeHtml(project.customerType)}"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Small business owners with 5-50 employees"
                        >
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Be specific about who you serve</p>
                    </div>

                    <div>
                        <label for="problem" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Problem Being Solved <span class="text-red-500">*</span>
                        </label>
                        <textarea
                            id="problem"
                            name="problem"
                            required
                            rows="3"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Missing calls leads to lost revenue and frustrated customers"
                        >${escapeHtml(project.problem)}</textarea>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">The pain point your customers recognize and feel</p>
                    </div>

                    <div>
                        <label for="outcome" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Desired Outcome <span class="text-red-500">*</span>
                        </label>
                        <textarea
                            id="outcome"
                            name="outcome"
                            required
                            rows="3"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Never miss a call, capture every lead, and book more appointments"
                        >${escapeHtml(project.outcome)}</textarea>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">The results customers want to achieve</p>
                    </div>

                    <div>
                        <label for="proofPoints" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Proof Points/Results <span class="text-red-500">*</span>
                        </label>
                        <textarea
                            id="proofPoints"
                            name="proofPoints"
                            required
                            rows="3"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 48% appointment setting rate, 95% call answer rate, customers see ROI in first month"
                        >${escapeHtml(project.proofPoints)}</textarea>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Specific, quantified results and proof points</p>
                    </div>

                    <div>
                        <label for="differentiators" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Key Differentiators <span class="text-red-500">*</span>
                        </label>
                        <textarea
                            id="differentiators"
                            name="differentiators"
                            required
                            rows="3"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Works with existing phone system, no complex training required, sounds completely human"
                        >${escapeHtml(project.differentiators)}</textarea>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">What makes your solution unique</p>
                    </div>

                    <div>
                        <label for="objections" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Common Objections to Address <span class="text-red-500">*</span>
                        </label>
                        <textarea
                            id="objections"
                            name="objections"
                            required
                            rows="3"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 'AI sounds robotic' - Our AI is trained on real conversations and sounds completely natural"
                        >${escapeHtml(project.objections)}</textarea>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Common concerns and how you address them</p>
                    </div>

                    <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div class="flex space-x-3">
                            <button type="submit" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                                Save & Return to Phase 1
                            </button>
                        </div>
                        <button type="button" id="cancel-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

  // Event listeners
  document.getElementById('back-btn').addEventListener('click', () => navigateTo('project', projectId));
  document.getElementById('cancel-btn').addEventListener('click', () => navigateTo('project', projectId));

  // Form submit - save and return to Phase 1
  document.getElementById('edit-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const updates = {
      title: formData.get('title').trim(),
      productName: formData.get('productName').trim(),
      customerType: formData.get('customerType').trim(),
      problem: formData.get('problem').trim(),
      outcome: formData.get('outcome').trim(),
      proofPoints: formData.get('proofPoints').trim(),
      differentiators: formData.get('differentiators').trim(),
      objections: formData.get('objections').trim()
    };

    // Clear Phase 1 prompt so it will be regenerated with new data
    updates.phases = {
      ...project.phases,
      1: { prompt: '', response: '', completed: false }
    };

    await updateProject(projectId, updates);
    showToast('Details updated! Phase 1 prompt will be regenerated.', 'success');
    navigateTo('project', projectId);
  });
}
