/**
 * Tests for document-specific-templates.js module
 *
 * Tests the Power Statement template definitions and retrieval functions.
 */

import { DOCUMENT_TEMPLATES, getTemplate, getAllTemplates } from '../js/document-specific-templates.js';

describe('DOCUMENT_TEMPLATES', () => {
  test('should have 5 templates defined', () => {
    expect(Object.keys(DOCUMENT_TEMPLATES)).toHaveLength(5);
  });

  test('should have blank template', () => {
    expect(DOCUMENT_TEMPLATES.blank).toBeDefined();
    expect(DOCUMENT_TEMPLATES.blank.id).toBe('blank');
    expect(DOCUMENT_TEMPLATES.blank.name).toBe('Blank');
    expect(DOCUMENT_TEMPLATES.blank.productName).toBe('');
    expect(DOCUMENT_TEMPLATES.blank.customerType).toBe('');
  });

  test('should have saasProduct template', () => {
    expect(DOCUMENT_TEMPLATES.saasProduct).toBeDefined();
    expect(DOCUMENT_TEMPLATES.saasProduct.id).toBe('saasProduct');
    expect(DOCUMENT_TEMPLATES.saasProduct.name).toBe('SaaS Product');
    expect(DOCUMENT_TEMPLATES.saasProduct.icon).toBe('💻');
  });

  test('should have b2bService template', () => {
    expect(DOCUMENT_TEMPLATES.b2bService).toBeDefined();
    expect(DOCUMENT_TEMPLATES.b2bService.id).toBe('b2bService');
    expect(DOCUMENT_TEMPLATES.b2bService.name).toBe('B2B Service');
    expect(DOCUMENT_TEMPLATES.b2bService.icon).toBe('🏢');
  });

  test('should have consumerProduct template', () => {
    expect(DOCUMENT_TEMPLATES.consumerProduct).toBeDefined();
    expect(DOCUMENT_TEMPLATES.consumerProduct.id).toBe('consumerProduct');
    expect(DOCUMENT_TEMPLATES.consumerProduct.name).toBe('Consumer Product');
    expect(DOCUMENT_TEMPLATES.consumerProduct.icon).toBe('📱');
  });

  test('should have internalTool template', () => {
    expect(DOCUMENT_TEMPLATES.internalTool).toBeDefined();
    expect(DOCUMENT_TEMPLATES.internalTool.id).toBe('internalTool');
    expect(DOCUMENT_TEMPLATES.internalTool.name).toBe('Internal Tool');
    expect(DOCUMENT_TEMPLATES.internalTool.icon).toBe('⚙️');
  });

  test('all templates should have required fields', () => {
    const requiredFields = ['id', 'name', 'icon', 'description', 'productName', 'customerType', 'problem', 'outcome', 'proofPoints', 'differentiators', 'objections'];

    Object.values(DOCUMENT_TEMPLATES).forEach(template => {
      requiredFields.forEach(field => {
        expect(template[field]).toBeDefined();
        expect(typeof template[field]).toBe('string');
      });
    });
  });
});

describe('getTemplate', () => {
  test('should return template by ID', () => {
    const template = getTemplate('blank');
    expect(template).toBe(DOCUMENT_TEMPLATES.blank);
  });

  test('should return saasProduct template', () => {
    const template = getTemplate('saasProduct');
    expect(template.name).toBe('SaaS Product');
  });

  test('should return b2bService template', () => {
    const template = getTemplate('b2bService');
    expect(template.name).toBe('B2B Service');
  });

  test('should return null for invalid ID', () => {
    expect(getTemplate('nonexistent')).toBeNull();
    expect(getTemplate('')).toBeNull();
    expect(getTemplate(null)).toBeNull();
  });

  test('should return null for undefined', () => {
    expect(getTemplate(undefined)).toBeNull();
  });
});

describe('getAllTemplates', () => {
  test('should return array of all templates', () => {
    const templates = getAllTemplates();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates).toHaveLength(5);
  });

  test('should include all template objects', () => {
    const templates = getAllTemplates();
    const ids = templates.map(t => t.id);
    expect(ids).toContain('blank');
    expect(ids).toContain('saasProduct');
    expect(ids).toContain('b2bService');
    expect(ids).toContain('consumerProduct');
    expect(ids).toContain('internalTool');
  });

  test('each template should have name and icon', () => {
    const templates = getAllTemplates();
    templates.forEach(template => {
      expect(template.name).toBeDefined();
      expect(template.icon).toBeDefined();
    });
  });
});

