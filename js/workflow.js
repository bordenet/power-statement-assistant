/**
 * Workflow Module
 * Manages the 3-phase workflow for Power Statement Assistant
 * @module workflow
 */

import storage from './storage.js';
import { showToast } from './ui.js';
import { WORKFLOW_CONFIG, generatePhase1Prompt, generatePhase2Prompt, generatePhase3Prompt } from './prompts.js';

// Re-export WORKFLOW_CONFIG for backward compatibility
export { WORKFLOW_CONFIG };

/**
 * Helper to get phase output, handling both flat and nested formats
 * @param {Object} project - Project object
 * @param {number} phaseNum - 1-based phase number
 * @returns {string} Phase output content
 */
function getPhaseOutputInternal(project, phaseNum) {
  // Flat format (canonical) - check first
  const flatKey = `phase${phaseNum}_output`;
  if (project[flatKey]) {
    return project[flatKey];
  }
  // Nested format (legacy) - fallback
  if (project.phases) {
    if (Array.isArray(project.phases) && project.phases[phaseNum - 1]) {
      return project.phases[phaseNum - 1].response || '';
    }
    if (project.phases[phaseNum] && typeof project.phases[phaseNum] === 'object') {
      return project.phases[phaseNum].response || '';
    }
  }
  return '';
}

// Default prompts (loaded from prompts/*.md files)
let defaultPrompts = {};

/**
 * Load default prompts from markdown files
 * @module workflow
 */
export async function loadDefaultPrompts() {
  try {
    for (let phase = 1; phase <= 3; phase++) {
      const response = await fetch(`prompts/phase${phase}.md`);
      const content = await response.text();
      defaultPrompts[phase] = content;

      // Save to IndexedDB if not already saved
      const existing = await storage.getPrompt(phase);
      if (!existing) {
        await storage.savePrompt(phase, content);
      }
    }
  } catch (error) {
    console.error('Failed to load default prompts:', error);
  }
}

/**
 * Get phase metadata from WORKFLOW_CONFIG
 * @module workflow
 * @param {number} phaseNumber - Phase number (1-3)
 * @returns {Object|undefined} Phase metadata with number, name, description, etc.
 */
export function getPhaseMetadata(phaseNumber) {
  return WORKFLOW_CONFIG.phases.find(p => p.number === phaseNumber);
}

/**
 * Helper to get phase data, handling both object and array formats
 * @param {Object} project - Project object
 * @param {number} phaseNum - 1-based phase number
 * @returns {Object} Phase data object with prompt, response, completed
 */
function getPhaseData(project, phaseNum) {
  const defaultPhase = { prompt: '', response: '', completed: false };
  if (!project.phases) return defaultPhase;

  // Array format first (legacy)
  if (Array.isArray(project.phases) && project.phases[phaseNum - 1]) {
    return project.phases[phaseNum - 1];
  }
  // Object format (canonical)
  if (project.phases[phaseNum] && typeof project.phases[phaseNum] === 'object') {
    return project.phases[phaseNum];
  }
  return defaultPhase;
}

/**
 * Generate prompt for a specific phase
 * Uses prompts.js module for template loading and variable replacement
 * @module workflow
 */
export async function generatePromptForPhase(project, phase) {
  // Build formData from project fields
  const formData = {
    productName: project.productName || project.title || '',
    customerType: project.customerType || '',
    problem: project.problem || '',
    outcome: project.outcome || '',
    proofPoints: project.proofPoints || '',
    differentiators: project.differentiators || '',
    objections: project.objections || ''
  };

  if (phase === 1) {
    return generatePhase1Prompt(formData);
  } else if (phase === 2) {
    const phase1Output = getPhaseData(project, 1).response || '[No Phase 1 output yet]';
    return generatePhase2Prompt(formData, phase1Output);
  } else if (phase === 3) {
    const phase1Output = getPhaseData(project, 1).response || '[No Phase 1 output yet]';
    const phase2Output = getPhaseData(project, 2).response || '[No Phase 2 output yet]';
    return generatePhase3Prompt(formData, phase1Output, phase2Output);
  }

  return '';
}

/**
 * Export final document as markdown (returns the markdown string)
 * @module workflow
 * @param {Object} project - Project object
 * @returns {string} Markdown content
 */
export function exportFinalDocument(project) {
  const workflow = new Workflow(project);
  return workflow.exportAsMarkdown();
}

/**
 * Download project as markdown file (with DOM operations for UI)
 * @module workflow
 * @param {Object} project - Project object
 */
export async function downloadFinalDocument(project) {
  const content = exportFinalDocument(project);
  const attribution = '\n\n---\n\n*Generated with [Power Statement Assistant](https://bordenet.github.io/power-statement-assistant/)*';

  if (!content) {
    showToast('No power statement content to export', 'warning');
    return;
  }

  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(project.title)}-power-statement.md`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('Power statement exported successfully!', 'success');
}

/**
 * Sanitize filename
 * @module workflow
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .substring(0, 50);
}

/**
 * Generate export filename for a project
 * @module workflow
 * @param {Object} project - Project object
 * @returns {string} Filename with .md extension
 */
export function getExportFilename(project) {
  return `${sanitizeFilename(project.title)}-power-statement.md`;
}

/**
 * Get the final markdown content from a project
 * @module workflow
 * @param {Object} project - Project object
 * @returns {string|null} The markdown content or null if none exists
 */
export function getFinalMarkdown(project) {
  return project.phases?.[3]?.response || project.phases?.[2]?.response || project.phases?.[1]?.response || null;
}

// WORKFLOW_CONFIG is imported from prompts.js and re-exported at the top of this file

export class Workflow {
  constructor(project) {
    this.project = project;
    // Clamp phase to valid range (1 minimum)
    const rawPhase = project.phase || 1;
    this.currentPhase = Math.max(1, rawPhase);
  }

  /**
     * Get current phase configuration
     */
  getCurrentPhase() {
    return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase);
  }

  /**
     * Get next phase configuration
     */
  getNextPhase() {
    if (this.currentPhase >= WORKFLOW_CONFIG.phaseCount) {
      return null;
    }
    return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase + 1);
  }

  /**
     * Check if workflow is complete
     */
  isComplete() {
    return this.currentPhase > WORKFLOW_CONFIG.phaseCount;
  }

  /**
     * Advance to next phase
     */
  advancePhase() {
    // Allow advancing up to phase 4 (complete state)
    if (this.currentPhase <= WORKFLOW_CONFIG.phaseCount) {
      this.currentPhase++;
      this.project.phase = this.currentPhase;
      return true;
    }
    return false;
  }

  /**
     * Go back to previous phase
     */
  previousPhase() {
    if (this.currentPhase > 1) {
      this.currentPhase--;
      this.project.phase = this.currentPhase;
      return true;
    }
    return false;
  }

  /**
     * Generate prompt for current phase
     */
  async generatePrompt() {
    const phase = this.getCurrentPhase();

    // Load prompt template
    const response = await fetch(`../${phase.promptFile}`);
    let template = await response.text();

    // Replace variables in template
    template = this.replaceVariables(template);

    return template;
  }

  /**
     * Replace variables in prompt template
     */
  replaceVariables(template) {
    let result = template;

    // Replace project-specific variables
    result = result.replace(/\{project_title\}/g, this.project.title || '');
    result = result.replace(/\{product_name\}/g, this.project.productName || '');
    result = result.replace(/\{customer_type\}/g, this.project.customerType || '');
    result = result.replace(/\{problem\}/g, this.project.problem || '');
    result = result.replace(/\{outcome\}/g, this.project.outcome || '');
    result = result.replace(/\{proof_points\}/g, this.project.proofPoints || '');
    result = result.replace(/\{differentiators\}/g, this.project.differentiators || '');
    result = result.replace(/\{objections\}/g, this.project.objections || '');

    // Replace phase outputs
    for (let i = 1; i < this.currentPhase; i++) {
      const phaseKey = `phase${i}_output`;
      const phaseOutput = this.project[phaseKey] || '';
      result = result.replace(new RegExp(`\\{${phaseKey}\\}`, 'g'), phaseOutput);
    }

    return result;
  }

  /**
     * Save phase output
     */
  savePhaseOutput(output) {
    const phaseKey = `phase${this.currentPhase}_output`;
    this.project[phaseKey] = output;
    this.project.updatedAt = new Date().toISOString();
  }

  /**
     * Get phase output
     */
  getPhaseOutput(phaseNumber) {
    return getPhaseOutputInternal(this.project, phaseNumber);
  }

  /**
     * Export final output as Markdown
     */
  exportAsMarkdown() {
    let markdown = `# ${this.project.title}\n\n`;
    markdown += `**Created**: ${new Date(this.project.createdAt).toLocaleDateString()}\n`;
    markdown += `**Last Updated**: ${new Date(this.project.updatedAt).toLocaleDateString()}\n\n`;

    if (this.project.description) {
      markdown += `## Description\n\n${this.project.description}\n\n`;
    }

    // Add each phase output
    for (let i = 1; i <= WORKFLOW_CONFIG.phaseCount; i++) {
      const phase = WORKFLOW_CONFIG.phases.find(p => p.number === i);
      const output = this.getPhaseOutput(i);

      if (output) {
        markdown += `## Phase ${i}: ${phase.name}\n\n`;
        markdown += `${output}\n\n`;
        markdown += '---\n\n';
      }
    }

    return markdown;
  }

  /**
     * Get workflow progress percentage
     */
  getProgress() {
    return Math.round((this.currentPhase / WORKFLOW_CONFIG.phaseCount) * 100);
  }
}
