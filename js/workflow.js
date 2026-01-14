/**
 * Workflow Module
 * Manages the 3-phase workflow for Power Statement Assistant
 * @module workflow
 */

import storage from './storage.js';
import { showToast } from './ui.js';

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
 * Get phase metadata
 * @module workflow
 */
export function getPhaseMetadata(phase) {
  const metadata = {
    1: {
      title: 'Initial Draft',
      ai: 'Claude',
      description: 'Generate the first draft of your power statement using Claude',
      color: 'blue',
      icon: '📝'
    },
    2: {
      title: 'Adversarial Critique',
      ai: 'Gemini',
      description: 'Get a different perspective and improvements from Gemini',
      color: 'purple',
      icon: '🔍'
    },
    3: {
      title: 'Final Synthesis',
      ai: 'Claude',
      description: 'Combine the best elements into a polished final version',
      color: 'green',
      icon: '✨'
    }
  };

  return metadata[phase] || {};
}

/**
 * Generate prompt for a specific phase
 * @module workflow
 */
export async function generatePromptForPhase(project, phase) {
  const template = await storage.getPrompt(phase) || defaultPrompts[phase] || '';

  if (!template) {
    throw new Error(`Phase ${phase} prompt template not found. Please ensure prompts are loaded.`);
  }

  let prompt = template;

  // Replace project-specific variables
  prompt = prompt.replace(/\{project_title\}/g, project.title || '');
  prompt = prompt.replace(/\{product_name\}/g, project.productName || '');
  prompt = prompt.replace(/\{customer_type\}/g, project.customerType || '');
  prompt = prompt.replace(/\{problem\}/g, project.problem || '');
  prompt = prompt.replace(/\{outcome\}/g, project.outcome || '');
  prompt = prompt.replace(/\{proof_points\}/g, project.proofPoints || '');
  prompt = prompt.replace(/\{differentiators\}/g, project.differentiators || '');
  prompt = prompt.replace(/\{objections\}/g, project.objections || '');

  // Replace phase outputs for phases 2 and 3
  if (phase >= 2 && project.phases && project.phases[1]) {
    prompt = prompt.replace(/\{phase1_output\}/g, project.phases[1].response || '');
  }
  if (phase >= 3 && project.phases && project.phases[2]) {
    prompt = prompt.replace(/\{phase2_output\}/g, project.phases[2].response || '');
  }

  return prompt;
}

/**
 * Export final document as markdown
 * @module workflow
 */
export async function exportFinalDocument(project) {
  const finalResponse = project.phases?.[3]?.response || project.phases?.[2]?.response || project.phases?.[1]?.response;
  const attribution = '\n\n---\n\n*Generated with [Power Statement Assistant](https://bordenet.github.io/power-statement-assistant/)*';

  if (!finalResponse) {
    showToast('No power statement content to export', 'warning');
    return;
  }

  const content = finalResponse + attribution;
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

export const WORKFLOW_CONFIG = {
  phaseCount: 3,
  phases: [
    {
      number: 1,
      name: 'Initial Draft',
      aiModel: 'Claude',
      promptFile: 'prompts/phase1.md',
      description: 'Create initial power statement draft'
    },
    {
      number: 2,
      name: 'Adversarial Critique',
      aiModel: 'Gemini',
      promptFile: 'prompts/phase2.md',
      description: 'Provide critical feedback and improvements'
    },
    {
      number: 3,
      name: 'Final Synthesis',
      aiModel: 'Claude',
      promptFile: 'prompts/phase3.md',
      description: 'Synthesize best elements from both versions'
    }
  ]
};

export class Workflow {
  constructor(project) {
    this.project = project;
    this.currentPhase = project.phase || 1;
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
    if (this.currentPhase < WORKFLOW_CONFIG.phaseCount) {
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
    const phaseKey = `phase${phaseNumber}_output`;
    return this.project[phaseKey] || '';
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
