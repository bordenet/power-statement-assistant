/**
 * Project View Events Module
 * Handles event listeners for phase interactions
 * @module project-view-events
 */

import { getProject, updatePhase, updateProject, deleteProject } from './projects.js';
import { getPhaseMetadata, generatePromptForPhase, getFinalMarkdown, getExportFilename, Workflow, detectPromptPaste } from './workflow.js';
import { showToast, copyToClipboardAsync, showPromptModal, confirm, confirmWithRemember, showDocumentPreviewModal, createActionMenu } from './ui.js';
import { navigateTo } from './router.js';
import { renderPhaseContent } from './project-view-phase.js';
import { showDiffModal } from './project-view-diff.js';

// Injected helpers to avoid circular imports
let extractTitleFromMarkdownFn = null;
let updatePhaseTabStylesFn = null;
let renderProjectViewFn = null;

/**
 * Set helper functions from main module (avoids circular imports)
 */
export function setHelpers(helpers) {
  extractTitleFromMarkdownFn = helpers.extractTitleFromMarkdown;
  updatePhaseTabStylesFn = helpers.updatePhaseTabStyles;
  renderProjectViewFn = helpers.renderProjectView;
}

/**
 * Attach event listeners for phase interactions
 * @param {Object} project - Project data
 * @param {number} phase - Current phase number
 * @returns {void}
 */
export function attachPhaseEventListeners(project, phase) {
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const saveResponseBtn = document.getElementById('save-response-btn');
  const responseTextarea = document.getElementById('response-textarea');
  const nextPhaseBtn = document.getElementById('next-phase-btn');
  const meta = getPhaseMetadata(phase);

  /**
   * Enable workflow progression after prompt is copied
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

  // Save Response handler
  attachSaveResponseHandler(project, phase, saveResponseBtn, responseTextarea);

  // Wire up Phase 3 complete export button (Preview & Copy)
  attachExportHandler(project);

  // Next phase button - re-fetch project to ensure fresh data
  if (nextPhaseBtn && project.phases?.[phase]?.completed) {
    nextPhaseBtn.addEventListener('click', async () => {
      const nextPhase = phase + 1;

      // Re-fetch project from storage to get fresh data
      const freshProject = await getProject(project.id);
      freshProject.phase = nextPhase;

      updatePhaseTabStylesFn(nextPhase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(freshProject, nextPhase);
      attachPhaseEventListeners(freshProject, nextPhase);
    });
  }

  // Setup overflow "More" menu with secondary actions
  attachMoreActionsMenu(project, phase, enableWorkflowProgression, meta);
}

/**
 * Attach save response button handler
 */
function attachSaveResponseHandler(project, phase, saveResponseBtn, responseTextarea) {
  if (!saveResponseBtn) return;

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
        updatePhaseTabStylesFn(phase + 1);
        document.getElementById('phase-content').innerHTML = renderPhaseContent(updatedProject, phase + 1);
        attachPhaseEventListeners(updatedProject, phase + 1);
      } else {
        // Phase 3 complete - set phase to 4 (complete state)
        await updateProject(project.id, { phase: 4 });
        showToast('Phase 3 complete! Your power statement is ready.', 'success');
        // Re-render to show export button
        renderProjectViewFn(project.id);
      }
    } else {
      showToast('Please enter at least 3 characters', 'warning');
    }
  });
}

/**
 * Attach export button handler for Phase 3 completion
 */
function attachExportHandler(project) {
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
}

/**
 * Attach overflow "More" actions menu
 */
function attachMoreActionsMenu(project, phase, enableWorkflowProgression, meta) {
  const moreActionsBtn = document.getElementById('more-actions-btn');
  if (!moreActionsBtn) return;

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

