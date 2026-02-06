/**
 * Document-Specific Templates for Power Statement
 * Pre-filled content for common power statement use cases
 * @module document-specific-templates
 */

/**
 * @typedef {Object} PowerStatementTemplate
 * @property {string} id - Unique template identifier
 * @property {string} name - Display name
 * @property {string} icon - Emoji icon
 * @property {string} description - Short description
 * @property {string} productName - Pre-filled product name
 * @property {string} customerType - Pre-filled customer type
 * @property {string} problem - Pre-filled problem
 * @property {string} outcome - Pre-filled outcome
 * @property {string} proofPoints - Pre-filled proof points
 * @property {string} differentiators - Pre-filled differentiators
 * @property {string} objections - Pre-filled objections
 */

/** @type {Record<string, PowerStatementTemplate>} */
export const DOCUMENT_TEMPLATES = {
  blank: {
    id: 'blank',
    name: 'Blank',
    icon: '📄',
    description: 'Start from scratch',
    productName: '',
    customerType: '',
    problem: '',
    outcome: '',
    proofPoints: '',
    differentiators: '',
    objections: ''
  },
  saasProduct: {
    id: 'saasProduct',
    name: 'SaaS Product',
    icon: '💻',
    description: 'Software value proposition',
    productName: '[Product Name]',
    customerType: '[Role] at [company type/size] in [industry]',
    problem: '[Specific pain point] causes [negative outcome], wasting [time/money] and [frustration]',
    outcome: '[Achieve goal] [X]x faster while [eliminating pain point], so they can [higher-level benefit]',
    proofPoints: '- [X]% improvement in [metric]\n- [Y] hours saved per [period]\n- [Z]% of customers achieve ROI in [timeframe]',
    differentiators: '- [Unique capability 1] that competitors lack\n- [Approach] that makes us different\n- [Feature] designed specifically for [audience]',
    objections: '"[Common objection 1]" → [Counter with evidence]\n"[Common objection 2]" → [Counter with social proof]'
  },
  b2bService: {
    id: 'b2bService',
    name: 'B2B Service',
    icon: '🏢',
    description: 'Consulting/service pitch',
    productName: '[Service Name]',
    customerType: '[C-level title] at [industry] companies with [X] employees',
    problem: '[Capability gap or challenge] limits their ability to [strategic objective], costing [estimate]',
    outcome: '[Gain capability] and [achieve outcome] without [typical pain of alternatives]',
    proofPoints: '- Clients achieve [outcome] in [timeframe]\n- [X] successful engagements\n- Team backgrounds: [credibility builders]',
    differentiators: '- [Methodology/approach] developed from [experience]\n- [Specialization] that generalists can\'t match\n- [Delivery model] that reduces risk',
    objections: '"Too expensive" → ROI typically [X]x within [period]\n"Can\'t we do this in-house?" → [Comparison of time/quality/cost]'
  },
  consumerProduct: {
    id: 'consumerProduct',
    name: 'Consumer Product',
    icon: '📱',
    description: 'B2C product hook',
    productName: '[Product Name]',
    customerType: '[Demographic] who [lifestyle/situation]',
    problem: '[Daily frustration] makes [routine activity] harder than it should be',
    outcome: '[Effortlessly achieve] [desired result] every time, without [typical hassle]',
    proofPoints: '- [X] happy customers\n- [Y]-star average rating\n- "[Testimonial snippet]"',
    differentiators: '- [Design/UX difference]\n- [Technology/feature] others don\'t have\n- [Value/price positioning]',
    objections: '"I\'ve tried [alternative]" → [Key difference that makes this work]\n"Seems too good to be true" → [Proof point or guarantee]'
  },
  internalTool: {
    id: 'internalTool',
    name: 'Internal Tool',
    icon: '⚙️',
    description: 'Justify internal adoption',
    productName: '[Tool Name]',
    customerType: '[Team/role] dealing with [workflow/process]',
    problem: '[Current process] wastes [X] hours per [period] and causes [errors/frustration/delays]',
    outcome: '[Automate/streamline] [process] so team can focus on [higher-value work]',
    proofPoints: '- Reduces [task] time by [X]%\n- Eliminates [manual step/error type]\n- Pilot results: [specific outcomes]',
    differentiators: '- Integrates with [existing systems]\n- [No/minimal] training required\n- Built for [specific context others don\'t address]',
    objections: '"We don\'t have time to adopt new tools" → [Adoption timeline and support plan]\n"What about [existing solution]?" → [Gap analysis showing why this is better]'
  }
};

/**
 * Get a template by ID
 * @param {string} templateId - The template ID
 * @returns {PowerStatementTemplate|null} The template or null if not found
 */
export function getTemplate(templateId) {
  return DOCUMENT_TEMPLATES[templateId] || null;
}

/**
 * Get all templates as an array
 * @returns {PowerStatementTemplate[]} Array of all templates
 */
export function getAllTemplates() {
  return Object.values(DOCUMENT_TEMPLATES);
}

