/**
 * Project View Phase Content Module
 * Handles rendering individual phase content
 * @module project-view-phase
 */

import { getPhaseMetadata } from './workflow.js';
import { escapeHtml } from './ui.js';
import { validateDocument, getScoreColor, getScoreLabel } from '../../validator/js/validator.js';

/**
 * Render the content for a specific phase
 * @param {Object} project - Project data
 * @param {number} phaseNumber - Phase to render
 * @returns {string} HTML string
 */
export function renderPhaseContent(project, phaseNumber) {
  const meta = getPhaseMetadata(phaseNumber);
  const phaseData = project.phases && project.phases[phaseNumber] ? project.phases[phaseNumber] : { prompt: '', response: '', completed: false };
  // Color mapping for phases (canonical WORKFLOW_CONFIG doesn't include colors)
  const colorMap = { 1: 'blue', 2: 'green', 3: 'purple' };
  const color = colorMap[phaseNumber] || 'blue';

  // Completion banner with inline scoring when Phase 3 is complete
  let completionBanner = '';
  if (phaseNumber === 3 && phaseData.completed) {
    completionBanner = renderCompletionBanner(phaseData.response || '');
  }

  // Determine AI URL based on phase
  const aiUrl = phaseNumber === 2 ? 'https://gemini.google.com' : 'https://claude.ai';
  const aiName = phaseNumber === 2 ? 'Gemini' : 'Claude';

  // Determine if textarea should be enabled (has existing content OR prompt was copied)
  const hasExistingResponse = phaseData.response && phaseData.response.trim().length > 0;
  const textareaDisabled = !hasExistingResponse && !phaseData.prompt;

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
                    ${phaseData.completed && phaseNumber < 3 ? `
                        <button id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Next Phase →
                        </button>
                    ` : phaseNumber < 3 ? `
                        <span class="text-sm text-gray-600 dark:text-gray-400">
                            Paste response to complete this phase
                        </span>
                    ` : '<span></span>'}
                    <button id="save-response-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600" ${!hasExistingResponse && textareaDisabled ? 'disabled' : ''}>
                        Save Response
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render the completion banner with inline quality score
 * @param {string} content - The document content to validate
 * @returns {string} HTML string for completion banner
 */
function renderCompletionBanner(content) {
  const validationResult = validateDocument(content);
  const scoreColor = getScoreColor(validationResult.totalScore);
  const scoreLabel = getScoreLabel(validationResult.totalScore);

  // Collect all issues for display - power-statement specific fields
  const allIssues = [
    ...validationResult.clarity.issues,
    ...validationResult.impact.issues,
    ...validationResult.action.issues,
    ...validationResult.specificity.issues
  ];

  return `
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
            ${renderInlineScore(validationResult, scoreColor, scoreLabel)}
            ${renderIssuesSummary(allIssues, validationResult.totalScore)}
            ${renderHelpSection()}
        </div>
    `;
}

/**
 * Render the inline quality score breakdown
 * @param {Object} validationResult - Validation result from validator
 * @param {string} scoreColor - Color class for the score
 * @param {string} scoreLabel - Label for the score
 * @returns {string} HTML string
 */
function renderInlineScore(validationResult, scoreColor, scoreLabel) {
  return `
            <!-- Inline Quality Score -->
            <div class="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between mb-3">
                    <h5 class="font-semibold text-gray-900 dark:text-white flex items-center">
                        📊 Document Quality Rating
                    </h5>
                    <div class="flex items-center gap-2">
                        <span class="text-3xl font-bold text-${scoreColor}-600 dark:text-${scoreColor}-400">${validationResult.totalScore}</span>
                        <span class="text-gray-500 dark:text-gray-400">/100</span>
                        <span class="px-2 py-1 text-xs font-medium rounded-full bg-${scoreColor}-100 dark:bg-${scoreColor}-900/30 text-${scoreColor}-700 dark:text-${scoreColor}-300">${scoreLabel}</span>
                    </div>
                </div>

                <!-- Score Breakdown - Power Statement fields -->
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
            </div>
    `;
}

/**
 * Render issues summary if score is below threshold
 * @param {string[]} allIssues - Array of issue strings
 * @param {number} totalScore - Total validation score
 * @returns {string} HTML string
 */
function renderIssuesSummary(allIssues, totalScore) {
  if (allIssues.length === 0 || totalScore >= 70) {
    return '';
  }

  return `
                <!-- Improvement Suggestions -->
                <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <details>
                        <summary class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                            💡 ${allIssues.length} suggestion${allIssues.length > 1 ? 's' : ''} to improve your score
                        </summary>
                        <ul class="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                            ${allIssues.slice(0, 5).map(issue => `<li>${issue}</li>`).join('')}
                            ${allIssues.length > 5 ? `<li class="text-gray-400 dark:text-gray-500">...and ${allIssues.length - 5} more</li>` : ''}
                        </ul>
                    </details>
                </div>
    `;
}

/**
 * Render expandable help section
 * @returns {string} HTML string
 */
function renderHelpSection() {
  return `
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
    `;
}

