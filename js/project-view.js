/**
 * Project Detail View Module
 * @module project-view
 * Handles rendering the project workflow view
 * @module project-view
 *
 * This module provides the main workflow interface for a single project:
 * @module project-view
 * - Phase tabs (Phase 1, 2, 3)
 * - Prompt generation and copying
 * - Response input and saving
 * - Phase navigation
 * - Export functionality
 */

import { getProject, updatePhase, updateProject, deleteProject } from './projects.js';
import { getPhaseMetadata, generatePromptForPhase, getFinalMarkdown, getExportFilename, Workflow, detectPromptPaste } from './workflow.js';
import { escapeHtml, showToast, copyToClipboard, copyToClipboardAsync, showPromptModal, showDocumentPreviewModal, confirm, confirmWithRemember, createActionMenu } from './ui.js';
import { navigateTo } from './router.js';
import { preloadPromptTemplates } from './prompts.js';
import { validatePowerStatement, getScoreColor, getScoreLabel } from './validator-inline.js';
import { computeWordDiff, renderDiffHtml, getDiffStats } from './diff-view.js';

/**
 * Extract title from markdown content (looks for # Title at the beginning)
 * @module project-view
 * @param {string} markdown - The markdown content
 * @returns {string|null} - The extracted title or null if not found
 */
export function extractTitleFromMarkdown(markdown) {
  if (!markdown) return null;

  // Look for first H1 heading (# Title)
  const match = markdown.match(/^#\s+(.+?)$/m);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

/**
 * Update phase tab styles to reflect the active phase
 * @module project-view
 * @param {number} activePhase - The currently active phase number
 */
function updatePhaseTabStyles(activePhase) {
  document.querySelectorAll('.phase-tab').forEach(tab => {
    const tabPhase = parseInt(tab.dataset.phase);
    if (tabPhase === activePhase) {
      tab.classList.remove('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-200');
      tab.classList.add('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
    } else {
      tab.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
      tab.classList.add('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-200');
    }
  });
}

/**
 * Render the project detail view
 * @module project-view
 * @param {string} projectId - Project ID to render
 */
export async function renderProjectView(projectId) {
  // Preload prompt templates to avoid network delay on first clipboard operation
  // Fire-and-forget: don't await, let it run in parallel with project load
  preloadPromptTemplates().catch(() => {});

  const project = await getProject(projectId);

  if (!project) {
    showToast('Project not found', 'error');
    navigateTo('home');
    return;
  }

  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="mb-6">
            <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center mb-4">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Power Statements
            </button>

            <div class="flex items-start justify-between">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        ${escapeHtml(project.title)}
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400">
                        ${escapeHtml(project.problems)}
                    </p>
                </div>
                ${project.phases && project.phases[3] && project.phases[3].completed ? `
                <button id="export-prd-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    📄 Export as Markdown
                </button>
                ` : ''}
            </div>
        </div>

        <!-- Phase Tabs -->
        <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex space-x-1">
                ${[1, 2, 3].map(phase => {
    const meta = getPhaseMetadata(phase);
    const isActive = project.phase === phase;
    const isCompleted = project.phases?.[phase]?.completed;

    return `
                        <button
                            class="phase-tab px-6 py-3 font-medium transition-colors ${
  isActive
    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
}"
                            data-phase="${phase}"
                        >
                            <span class="mr-2">${meta.icon}</span>
                            Phase ${phase}
                            ${isCompleted ? '<span class="ml-2 text-green-500">✓</span>' : ''}
                        </button>
                    `;
  }).join('')}
            </div>
        </div>

        <!-- Phase Content -->
        <div id="phase-content">
            ${renderPhaseContent(project, project.phase)}
        </div>
    `;

  // Event listeners
  document.getElementById('back-btn').addEventListener('click', () => navigateTo('home'));

  const exportBtn = document.getElementById('export-prd-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const markdown = getFinalMarkdown(project);
      if (markdown) {
        showDocumentPreviewModal(markdown, 'Your Power Statement is Ready', getExportFilename(project));
      } else {
        showToast('No power statement content to export', 'warning');
      }
    });
  }

  // Phase tabs - re-fetch project to ensure fresh data
  document.querySelectorAll('.phase-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      const targetPhase = parseInt(tab.dataset.phase);

      // Re-fetch project from storage to get fresh data
      const freshProject = await getProject(project.id);

      // Guard: Can only navigate to a phase if all prior phases are complete
      // Phase 1 is always accessible
      if (targetPhase > 1) {
        const priorPhase = targetPhase - 1;
        const priorPhaseComplete = freshProject.phases?.[priorPhase]?.completed;
        if (!priorPhaseComplete) {
          showToast(`Complete Phase ${priorPhase} before proceeding to Phase ${targetPhase}`, 'warning');
          return;
        }
      }

      freshProject.phase = targetPhase;
      updatePhaseTabStyles(targetPhase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(freshProject, targetPhase);
      attachPhaseEventListeners(freshProject, targetPhase);
    });
  });

  attachPhaseEventListeners(project, project.phase);
}

/**
 * Render content for a specific phase
 * @module project-view
 * @param {Object} project - Project object
 * @param {number} phase - Phase number (1-3)
 * @returns {string} HTML content for the phase
 */
function renderPhaseContent(project, phase) {
  const meta = getPhaseMetadata(phase);
  const phaseData = project.phases?.[phase] || { prompt: '', response: '', completed: false };

  // Determine AI URL based on phase
  const aiUrl = phase === 2 ? 'https://gemini.google.com' : 'https://claude.ai';
  const aiName = phase === 2 ? 'Gemini' : 'Claude';
  // Color mapping for phases (canonical WORKFLOW_CONFIG doesn't include colors)
  const colorMap = { 1: 'blue', 2: 'green', 3: 'purple' };
  const color = colorMap[phase] || 'blue';

  // Determine if textarea should be enabled (has existing content OR prompt was copied)
  const hasExistingResponse = phaseData.response && phaseData.response.trim().length > 0;
  const textareaDisabled = !hasExistingResponse && !phaseData.prompt;

  // Completion banner shown above Phase 3 content when phase is complete
  let completionBanner = '';
  if (phase === 3 && phaseData.completed) {
    const statementContent = phaseData.response || '';
    const validationResult = validatePowerStatement(statementContent);
    const scoreColor = getScoreColor(validationResult.totalScore);
    const scoreLabel = getScoreLabel(validationResult.totalScore);

    // Collect all issues for display
    const allIssues = [
      ...validationResult.clarity.issues,
      ...validationResult.impact.issues,
      ...validationResult.action.issues,
      ...validationResult.specificity.issues
    ];

    completionBanner = `
        <div class="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h4 class="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center">
                        <span class="mr-2">🎉</span> Your Power Statement is Complete!
                    </h4>
                    <p class="text-green-700 dark:text-green-400 mt-1">
                        <strong>Next steps:</strong> Preview & copy, then validate your document.
                    </p>
                </div>
                <div class="flex gap-3 flex-wrap items-center">
                    <button id="export-complete-btn" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg">
                        📄 Preview & Copy
                    </button>
                    <a href="./validator/" target="_blank" rel="noopener noreferrer" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg">
                        📋 Full Validation ↗
                    </a>
                </div>
            </div>

            <!-- Inline Quality Score -->
            <div class="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between mb-3">
                    <h5 class="font-semibold text-gray-900 dark:text-white flex items-center">
                        📊 Power Statement Quality Score
                    </h5>
                    <div class="flex items-center gap-2">
                        <span class="text-3xl font-bold text-${scoreColor}-600 dark:text-${scoreColor}-400">${validationResult.totalScore}</span>
                        <span class="text-gray-500 dark:text-gray-400">/100</span>
                        <span class="px-2 py-1 text-xs font-medium rounded-full bg-${scoreColor}-100 dark:bg-${scoreColor}-900/30 text-${scoreColor}-700 dark:text-${scoreColor}-300">${scoreLabel}</span>
                    </div>
                </div>

                <!-- Score Breakdown -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div class="p-2 rounded bg-gray-50 dark:bg-gray-700/50">
                        <div class="text-gray-500 dark:text-gray-400 text-xs">Clarity</div>
                        <div class="font-semibold text-gray-900 dark:text-white">${validationResult.clarity.score}/${validationResult.clarity.maxScore}</div>
                    </div>
                    <div class="p-2 rounded bg-gray-50 dark:bg-gray-700/50">
                        <div class="text-gray-500 dark:text-gray-400 text-xs">Impact</div>
                        <div class="font-semibold text-gray-900 dark:text-white">${validationResult.impact.score}/${validationResult.impact.maxScore}</div>
                    </div>
                    <div class="p-2 rounded bg-gray-50 dark:bg-gray-700/50">
                        <div class="text-gray-500 dark:text-gray-400 text-xs">Action</div>
                        <div class="font-semibold text-gray-900 dark:text-white">${validationResult.action.score}/${validationResult.action.maxScore}</div>
                    </div>
                    <div class="p-2 rounded bg-gray-50 dark:bg-gray-700/50">
                        <div class="text-gray-500 dark:text-gray-400 text-xs">Specificity</div>
                        <div class="font-semibold text-gray-900 dark:text-white">${validationResult.specificity.score}/${validationResult.specificity.maxScore}</div>
                    </div>
                </div>

                ${allIssues.length > 0 && validationResult.totalScore < 70 ? `
                <!-- Improvement Suggestions -->
                <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <details>
                        <summary class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                            💡 ${allIssues.length} suggestion${allIssues.length > 1 ? 's' : ''} to improve your score
                        </summary>
                        <ul class="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                            ${allIssues.slice(0, 5).map(issue => `<li>${escapeHtml(issue)}</li>`).join('')}
                            ${allIssues.length > 5 ? `<li class="text-gray-400 dark:text-gray-500">...and ${allIssues.length - 5} more</li>` : ''}
                        </ul>
                    </details>
                </div>
                ` : ''}
            </div>

            <!-- Expandable Help Section -->
            <details class="mt-4">
                <summary class="text-sm text-green-700 dark:text-green-400 cursor-pointer hover:text-green-800 dark:hover:text-green-300">
                    Need help using your document?
                </summary>
                <div class="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    <ol class="list-decimal list-inside space-y-2">
                        <li>Click <strong>"Preview & Copy"</strong> to see your formatted document</li>
                        <li>Click <strong>"Copy Formatted Text"</strong> in the preview</li>
                        <li>Open <strong>Microsoft Word</strong> or <strong>Google Docs</strong> and paste</li>
                        <li>Use <strong><a href="./validator/" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">Power Statement Validator</a></strong> to score and improve your document</li>
                    </ol>
                    <p class="mt-3 text-gray-500 dark:text-gray-400 text-xs">
                        💡 The validator provides instant feedback and AI-powered suggestions for improvement.
                    </p>
                </div>
            </details>
        </div>
    `;
  }

  return `
        ${completionBanner}

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="mb-6 flex justify-between items-start">
                <div>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        ${meta.icon} ${meta.name}
                    </h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-2">
                        ${meta.description}
                    </p>
                    <div class="inline-flex items-center px-3 py-1 bg-${color}-100 dark:bg-${color}-900/20 text-${color}-800 dark:text-${color}-300 rounded-full text-sm">
                        <span class="mr-2">🤖</span>
                        Use with ${meta.aiModel}
                    </div>
                </div>
                <!-- Overflow Menu (top-right) -->
                <button id="more-actions-btn" class="action-menu-trigger text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                    </svg>
                </button>
            </div>

            <!-- Step A: Generate Prompt -->
            <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step A: Copy Prompt to AI
                </h4>
                <div class="flex gap-3 flex-wrap">
                    <button id="copy-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        📋 ${phaseData.prompt ? 'Copy Prompt Again' : 'Generate & Copy Prompt'}
                    </button>
                    <a
                        id="open-ai-btn"
                        href="${aiUrl}"
                        target="ai-assistant-tab"
                        rel="noopener noreferrer"
                        class="px-6 py-3 bg-green-600 text-white rounded-lg transition-colors font-medium ${!phaseData.prompt ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-green-700'}"
                        ${!phaseData.prompt ? 'aria-disabled="true"' : ''}
                    >
                        🔗 Open ${aiName}
                    </a>
                </div>
            </div>

            <!-- Step B: Paste Response -->
            <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step B: Paste ${aiName}'s Response
                </h4>
                <textarea
                    id="response-textarea"
                    rows="12"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm ${textareaDisabled ? 'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800' : ''}"
                    placeholder="Paste ${aiName}'s response here..."
                    ${textareaDisabled ? 'disabled' : ''}
                >${escapeHtml(phaseData.response || '')}</textarea>

                <div class="mt-3 flex justify-between items-center">
                    ${phaseData.completed && phase < 3 ? `
                        <button id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Next Phase →
                        </button>
                    ` : `
                        <span class="text-sm text-gray-600 dark:text-gray-400">
                            Paste response to complete this phase
                        </span>
                    `}
                    <button id="save-response-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600" ${!hasExistingResponse && textareaDisabled ? 'disabled' : ''}>
                        Save Response
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Attach event listeners for phase interactions
 * @module project-view
 * @param {Object} project - Project object
 * @param {number} phase - Phase number (1-3)
 */
function attachPhaseEventListeners(project, phase) {
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const saveResponseBtn = document.getElementById('save-response-btn');
  const responseTextarea = document.getElementById('response-textarea');
  const nextPhaseBtn = document.getElementById('next-phase-btn');
  const meta = getPhaseMetadata(phase);

  /**
   * Enable workflow progression after prompt is copied
   * Called from both main copy button and modal copy button
   */
  const enableWorkflowProgression = () => {
    // Enable the "Open AI" button now that prompt is copied
    const openAiBtn = document.getElementById('open-ai-btn');
    if (openAiBtn) {
      openAiBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
      openAiBtn.classList.add('hover:bg-green-700');
      openAiBtn.removeAttribute('aria-disabled');
    }

    // Enable the response textarea now that prompt is copied
    if (responseTextarea) {
      responseTextarea.disabled = false;
      responseTextarea.classList.remove('opacity-50', 'cursor-not-allowed');
      responseTextarea.focus();
    }

    // Enable save button if there's content
    if (saveResponseBtn && responseTextarea.value.trim().length >= 3) {
      saveResponseBtn.disabled = false;
    }
  };

  // CRITICAL: Safari transient activation fix - call copyToClipboardAsync synchronously
  copyPromptBtn.addEventListener('click', async () => {
    // Check if warning was previously acknowledged
    const warningAcknowledged = localStorage.getItem('external-ai-warning-acknowledged');

    if (!warningAcknowledged) {
      const result = await confirmWithRemember(
        'You are about to copy a prompt that may contain proprietary data.\n\n' +
                '• This prompt will be pasted into an external AI service (Claude/Gemini)\n' +
                '• Data sent to these services is processed on third-party servers\n' +
                '• For sensitive documents, use an internal tool like LibreGPT instead\n\n' +
                'Do you want to continue?',
        'External AI Warning',
        { confirmText: 'Copy Prompt', cancelText: 'Cancel' }
      );

      if (!result.confirmed) {
        showToast('Copy cancelled', 'info');
        return;
      }

      // Remember the choice permanently if checkbox was checked
      if (result.remember) {
        localStorage.setItem('external-ai-warning-acknowledged', 'true');
      }
    }

    let generatedPrompt = null;
    const promptPromise = (async () => {
      const prompt = await generatePromptForPhase(project, phase);
      generatedPrompt = prompt;
      return prompt;
    })();

    copyToClipboardAsync(promptPromise)
      .then(async () => {
        showToast('Prompt copied to clipboard!', 'success');

        // Save prompt but DON'T advance - user is still working on this phase (skipAutoAdvance: true)
        await updatePhase(project.id, phase, generatedPrompt, project.phases[phase]?.response || '', { skipAutoAdvance: true });

        enableWorkflowProgression();
      })
      .catch((error) => {
        console.error('Failed to copy prompt:', error);
        showToast('Failed to copy to clipboard. Please check browser permissions.', 'error');
      });
  });

  // Update button state as user types
  if (responseTextarea) {
    responseTextarea.addEventListener('input', () => {
      const hasEnoughContent = responseTextarea.value.trim().length >= 3;
      if (saveResponseBtn) {
        saveResponseBtn.disabled = !hasEnoughContent;
      }
    });
  }

  // Save Response - canonical pattern matching one-pager
  if (saveResponseBtn) {
    saveResponseBtn.addEventListener('click', async () => {
      const response = responseTextarea.value.trim();
      if (response && response.length >= 3) {
        // Check if user accidentally pasted the prompt instead of the AI response
        const promptCheck = detectPromptPaste(response);
        if (promptCheck.isPrompt) {
          showToast(promptCheck.reason, 'error');
          return;
        }

        // Re-fetch project to get fresh prompt data (not stale closure)
        const freshProject = await getProject(project.id);
        const currentPrompt = freshProject.phases?.[phase]?.prompt || '';

        // Use canonical updatePhase - handles both saving AND auto-advance
        await updatePhase(project.id, phase, currentPrompt, response);

        // Auto-advance to next phase if not on final phase
        if (phase < 3) {
          showToast('Response saved! Moving to next phase...', 'success');
          // Re-fetch the updated project (updatePhase already advanced the phase)
          const updatedProject = await getProject(project.id);
          updatePhaseTabStyles(phase + 1);
          document.getElementById('phase-content').innerHTML = renderPhaseContent(updatedProject, phase + 1);
          attachPhaseEventListeners(updatedProject, phase + 1);
        } else {
          // Phase 3 complete - set phase to 4 (complete state)
          await updateProject(project.id, { phase: 4 });
          showToast('Phase 3 complete! Your power statement is ready.', 'success');
          // Re-render to show export button
          renderProjectView(project.id);
        }
      } else {
        showToast('Please enter at least 3 characters', 'warning');
      }
    });
  }

  // Wire up Phase 3 complete export button (Preview & Copy)
  const phase3ExportBtn = document.getElementById('export-complete-btn');
  if (phase3ExportBtn) {
    phase3ExportBtn.addEventListener('click', () => {
      const markdown = getFinalMarkdown(project);
      if (markdown) {
        showDocumentPreviewModal(markdown, 'Your Power Statement is Ready', getExportFilename(project));
      } else {
        showToast('No power statement content to export', 'warning');
      }
    });
  }

  // Next phase button - re-fetch project to ensure fresh data
  if (nextPhaseBtn && project.phases?.[phase]?.completed) {
    nextPhaseBtn.addEventListener('click', async () => {
      const nextPhase = phase + 1;

      // Re-fetch project from storage to get fresh data
      const freshProject = await getProject(project.id);
      freshProject.phase = nextPhase;

      updatePhaseTabStyles(nextPhase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(freshProject, nextPhase);
      attachPhaseEventListeners(freshProject, nextPhase);
    });
  }

  // Setup overflow "More" menu with secondary actions
  const moreActionsBtn = document.getElementById('more-actions-btn');
  if (moreActionsBtn) {
    const phaseData = project.phases?.[phase] || {};
    const hasPrompt = !!phaseData.prompt;

    // Build menu items based on current state
    const menuItems = [];

    // View Prompt (only if prompt exists)
    if (hasPrompt) {
      menuItems.push({
        label: 'View Prompt',
        icon: '👁️',
        onClick: async () => {
          const prompt = await generatePromptForPhase(project, phase);
          showPromptModal(prompt, `Phase ${phase}: ${meta.name} Prompt`, enableWorkflowProgression);
        }
      });
    }

    // Edit Details (always available)
    menuItems.push({
      label: 'Edit Details',
      icon: '✏️',
      onClick: () => navigateTo('edit-project', project.id)
    });

    // Compare Phases (only if 2+ phases completed)
    const workflow = new Workflow(project);
    const completedCount = [1, 2, 3].filter(p => workflow.getPhaseOutput(p)).length;
    if (completedCount >= 2) {
      menuItems.push({
        label: 'Compare Phases',
        icon: '🔄',
        onClick: () => {
          const phases = {
            1: workflow.getPhaseOutput(1),
            2: workflow.getPhaseOutput(2),
            3: workflow.getPhaseOutput(3)
          };
          const completedPhases = Object.entries(phases).filter(([, v]) => v).map(([k]) => parseInt(k));
          showDiffModal(phases, completedPhases);
        }
      });
    }

    // Separator before destructive action
    menuItems.push({ separator: true });

    // Delete (destructive)
    menuItems.push({
      label: 'Delete...',
      icon: '🗑️',
      destructive: true,
      onClick: async () => {
        if (await confirm(`Are you sure you want to delete "${project.title}"?`, 'Delete Project')) {
          await deleteProject(project.id);
          showToast('Project deleted', 'success');
          navigateTo('home');
        }
      }
    });

    createActionMenu({
      triggerElement: moreActionsBtn,
      items: menuItems,
      position: 'bottom-end'
    });
  }
}

/**
 * Show diff modal with phase selectors
 * @param {Object} phases - Object with phase outputs {1: string, 2: string, 3: string}
 * @param {number[]} completedPhases - Array of completed phase numbers
 */
function showDiffModal(phases, completedPhases) {
  // Build phase names dynamically from WORKFLOW_CONFIG
  const phaseNames = {};
  completedPhases.forEach(p => {
    const meta = getPhaseMetadata(p);
    phaseNames[p] = `Phase ${p}: ${meta.name} (${meta.aiModel})`;
  });

  // Default to comparing first two completed phases
  let leftPhase = completedPhases[0];
  let rightPhase = completedPhases[1];

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

  function renderDiff() {
    const leftOutput = phases[leftPhase] || '';
    const rightOutput = phases[rightPhase] || '';
    const diff = computeWordDiff(leftOutput, rightOutput);
    const stats = getDiffStats(diff);
    const diffHtml = renderDiffHtml(diff);

    const optionsHtml = completedPhases.map(p =>
      `<option value="${p}">${phaseNames[p]}</option>`
    ).join('');

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">
              🔄 Phase Comparison
            </h3>
            <div class="flex items-center gap-2 flex-wrap">
              <select id="diff-left-phase" class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                ${optionsHtml}
              </select>
              <span class="text-gray-500 dark:text-gray-400 font-medium">→</span>
              <select id="diff-right-phase" class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                ${optionsHtml}
              </select>
              <div class="flex gap-2 ml-4 text-sm">
                <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                  +${stats.additions} added
                </span>
                <span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                  -${stats.deletions} removed
                </span>
                <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  ${stats.unchanged} unchanged
                </span>
              </div>
            </div>
          </div>
          <button id="close-diff-modal-btn" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ml-4">
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        <div class="p-4 overflow-y-auto flex-1">
          <div id="diff-content" class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
            ${diffHtml}
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <span class="bg-green-200 dark:bg-green-900/50 px-1">Green text</span> = added in right phase &nbsp;|&nbsp;
            <span class="bg-red-200 dark:bg-red-900/50 px-1 line-through">Red strikethrough</span> = removed from left phase
          </p>
        </div>
      </div>
    `;

    // Set selected values
    modal.querySelector('#diff-left-phase').value = leftPhase;
    modal.querySelector('#diff-right-phase').value = rightPhase;

    // Add change handlers
    modal.querySelector('#diff-left-phase').addEventListener('change', (e) => {
      leftPhase = parseInt(e.target.value);
      renderDiff();
    });
    modal.querySelector('#diff-right-phase').addEventListener('change', (e) => {
      rightPhase = parseInt(e.target.value);
      renderDiff();
    });

    // Close handlers
    modal.querySelector('#close-diff-modal-btn').addEventListener('click', closeModal);
  }

  const closeModal = () => modal.remove();

  document.body.appendChild(modal);
  renderDiff();

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}
