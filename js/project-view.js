/**
 * Project Detail View Module
 * Handles rendering the project workflow view
 *
 * This module provides the main workflow interface for a single project:
 * - Phase tabs (Phase 1, 2, 3)
 * - Prompt generation and copying
 * - Response input and saving
 * - Phase navigation
 * - Export functionality
 */

import { getProject, updatePhase, updateProject } from './projects.js';
import { getPhaseMetadata, generatePromptForPhase, exportFinalDocument } from './workflow.js';
import { escapeHtml, showToast, copyToClipboard, showPromptModal } from './ui.js';
import { navigateTo } from './router.js';

/**
 * Extract title from markdown content (looks for # Title at the beginning)
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
 * @param {string} projectId - Project ID to render
 */
export async function renderProjectView(projectId) {
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
                <button id="export-prd-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Export Power Statement
                </button>
            </div>
        </div>

        <!-- Phase Tabs -->
        <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex space-x-1">
                ${[1, 2, 3].map(phase => {
        const meta = getPhaseMetadata(phase);
        const isActive = project.phase === phase;
        const isCompleted = project.phases[phase].completed;

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
    document.getElementById('export-prd-btn').addEventListener('click', () => exportFinalDocument(project));

    document.querySelectorAll('.phase-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const phase = parseInt(tab.dataset.phase);
            project.phase = phase;
            updatePhaseTabStyles(phase);
            document.getElementById('phase-content').innerHTML = renderPhaseContent(project, phase);
            attachPhaseEventListeners(project, phase);
        });
    });

    attachPhaseEventListeners(project, project.phase);
}

/**
 * Render content for a specific phase
 * @param {Object} project - Project object
 * @param {number} phase - Phase number (1-3)
 * @returns {string} HTML content for the phase
 */
function renderPhaseContent(project, phase) {
    const meta = getPhaseMetadata(phase);
    const phaseData = project.phases[phase];

    // Determine AI URL based on phase
    const aiUrl = phase === 2 ? 'https://gemini.google.com' : 'https://claude.ai';
    const aiName = phase === 2 ? 'Gemini' : 'Claude';

    // Determine if textarea should be enabled (has existing content OR prompt was copied)
    const hasExistingResponse = phaseData.response && phaseData.response.trim().length > 0;
    const textareaDisabled = !hasExistingResponse && !phaseData.prompt;

    return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    ${meta.icon} ${meta.title}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-2">
                    ${meta.description}
                </p>
                <div class="inline-flex items-center px-3 py-1 bg-${meta.color}-100 dark:bg-${meta.color}-900/20 text-${meta.color}-800 dark:text-${meta.color}-300 rounded-full text-sm">
                    <span class="mr-2">🤖</span>
                    Use with ${meta.ai}
                </div>
            </div>

            <!-- Step A: Generate Prompt -->
            <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step A: Copy Prompt to AI
                </h4>
                <div class="flex gap-3 flex-wrap">
                    <button id="copy-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        📋 Copy Prompt to Clipboard
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
                ${phaseData.prompt ? `
                    <div class="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Prompt:</span>
                            <button class="view-prompt-btn text-blue-600 dark:text-blue-400 hover:underline text-sm">
                                View Full Prompt
                            </button>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                            ${escapeHtml(phaseData.prompt.substring(0, 200))}...
                        </p>
                    </div>
                ` : ''}
            </div>

            <!-- Step B: Paste Response -->
            <div class="mb-6">
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
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                        ${phaseData.completed ? '✓ Phase completed' : 'Paste response to complete this phase'}
                    </span>
                    <button id="save-response-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600" ${!hasExistingResponse && textareaDisabled ? 'disabled' : ''}>
                        Save Response
                    </button>
                </div>
            </div>

            <!-- Navigation -->
            <div class="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button id="prev-phase-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ${phase === 1 ? 'invisible' : ''}">
                    ← Previous Phase
                </button>
                ${phaseData.completed && phase < 3 ? `
                <button id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Next Phase →
                </button>
                ` : '<div></div>'}
            </div>
        </div>
    `;
}

/**
 * Attach event listeners for phase interactions
 * @param {Object} project - Project object
 * @param {number} phase - Phase number (1-3)
 */
function attachPhaseEventListeners(project, phase) {
    const copyPromptBtn = document.getElementById('copy-prompt-btn');
    const saveResponseBtn = document.getElementById('save-response-btn');
    const responseTextarea = document.getElementById('response-textarea');
    const prevPhaseBtn = document.getElementById('prev-phase-btn');
    const nextPhaseBtn = document.getElementById('next-phase-btn');

    copyPromptBtn.addEventListener('click', async () => {
        const prompt = await generatePromptForPhase(project, phase);
        await copyToClipboard(prompt);
        showToast('Prompt copied to clipboard!', 'success');

        // Save prompt but DON'T mark as completed - user is still working on this phase
        await updatePhase(project.id, phase, prompt, project.phases[phase].response || '');

        // Enable the "Open AI" button now that prompt is copied
        const openAiBtn = document.getElementById('open-ai-btn');
        if (openAiBtn) {
            openAiBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
            openAiBtn.classList.add('hover:bg-green-700');
            openAiBtn.removeAttribute('aria-disabled');
        }

        // Enable the response textarea now that prompt is copied
        if (responseTextarea && responseTextarea.disabled) {
            responseTextarea.disabled = false;
            responseTextarea.classList.remove('opacity-50', 'cursor-not-allowed');
            responseTextarea.focus();
        }

        // Enable save button if there's content
        if (saveResponseBtn && responseTextarea.value.trim().length >= 3) {
            saveResponseBtn.disabled = false;
        }
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

    if (saveResponseBtn) {
        saveResponseBtn.addEventListener('click', async () => {
            const response = responseTextarea.value.trim();
            if (response && response.length >= 3) {
                await updatePhase(project.id, phase, project.phases[phase].prompt, response);

                // Auto-advance to next phase if not on final phase
                if (phase < 3) {
                    showToast('Response saved! Moving to next phase...', 'success');
                    // Re-fetch the updated project and advance
                    const updatedProject = await getProject(project.id);
                    updatedProject.phase = phase + 1;
                    updatePhaseTabStyles(phase + 1);
                    document.getElementById('phase-content').innerHTML = renderPhaseContent(updatedProject, phase + 1);
                    attachPhaseEventListeners(updatedProject, phase + 1);
                } else {
                    // Phase 3 complete - extract and update project title if changed
                    const extractedTitle = extractTitleFromMarkdown(response);
                    if (extractedTitle && extractedTitle !== project.title) {
                        await updateProject(project.id, { title: extractedTitle });
                        showToast(`Phase 3 complete! Title updated to "${extractedTitle}"`, 'success');
                    } else {
                        showToast('Phase 3 complete! Your power statement is ready.', 'success');
                    }
                    // Re-render to show updated title and export button
                    renderProjectView(project.id);
                }
            } else {
                showToast('Please enter at least 3 characters', 'warning');
            }
        });
    }

    // Wire up "View Full Prompt" button if it exists
    const viewPromptBtn = document.querySelector('.view-prompt-btn');
    if (viewPromptBtn && project.phases[phase].prompt) {
        viewPromptBtn.addEventListener('click', () => {
            const meta = getPhaseMetadata(phase);
            showPromptModal(project.phases[phase].prompt, `Phase ${phase}: ${meta.title} Prompt`);
        });
    }

    if (prevPhaseBtn) {
        prevPhaseBtn.addEventListener('click', () => {
            project.phase = phase - 1;
            updatePhaseTabStyles(phase - 1);
            document.getElementById('phase-content').innerHTML = renderPhaseContent(project, phase - 1);
            attachPhaseEventListeners(project, phase - 1);
        });
    }

    if (nextPhaseBtn && project.phases[phase].completed) {
        nextPhaseBtn.addEventListener('click', () => {
            project.phase = phase + 1;
            updatePhaseTabStyles(phase + 1);
            document.getElementById('phase-content').innerHTML = renderPhaseContent(project, phase + 1);
            attachPhaseEventListeners(project, phase + 1);
        });
    }
}

