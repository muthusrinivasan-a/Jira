// fieldService.js - Centralized field detection and manipulation for both platforms

import { CONFIG } from './config.js';

/**
 * Find a field by name in the specified platform
 * @param {string} fieldName - The field name/id to find
 * @param {string} platform - The platform to search in ('JIRA' or 'CLARITY')
 * @returns {Element|null} The found field element or null
 */
export function findField(fieldName, platform = 'JIRA') {
  // Get field configuration
  const fieldsConfig = CONFIG[platform].FIELDS;
  
  // Get the field info if it exists directly
  const fieldInfo = fieldsConfig[fieldName.toUpperCase()] || 
                   Object.values(fieldsConfig).find(f => f.id === fieldName);
  
  // If we have specific field info, use its selectors
  if (fieldInfo) {
    for (const selector of fieldInfo.selectors) {
      const field = document.querySelector(selector);
      if (field) return field;
    }
  }
  
  // Try generic approaches by field name
  const genericSelectors = [
    `#${fieldName}`,
    `[name="${fieldName}"]`,
    `[data-test-id="issue.views.field.rich-text.${fieldName}"]`,
    `[data-field-id="${fieldName}"]`,
    `[aria-label="${fieldInfo ? fieldInfo.label : fieldName}"]`
  ];
  
  for (const selector of genericSelectors) {
    const field = document.querySelector(selector);
    if (field) return field;
  }
  
  // Try to find by label text
  const labels = document.querySelectorAll('label, .field-label, .label');
  const searchLabel = fieldInfo ? fieldInfo.label.toLowerCase() : fieldName.toLowerCase();
  
  for (const label of labels) {
    if (label.textContent.toLowerCase().includes(searchLabel)) {
      // Try to find the associated field
      const id = label.getAttribute('for');
      if (id) {
        const field = document.getElementById(id);
        if (field) return field;
      }
      
      // Look for nearby input elements
      let element = label.nextElementSibling;
      while (element) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || 
            element.getAttribute('role') === 'textbox' || element.contentEditable === 'true') {
          return element;
        }
        element = element.nextElementSibling;
      }
      
      // Try parent container
      const parent = label.closest('.field-container, .form-group');
      if (parent) {
        const input = parent.querySelector('input, textarea, [role="textbox"], [contenteditable="true"]');
        if (input) return input;
      }
    }
  }
  
  return null;
}

/**
 * Get text content from a field
 * @param {Element} field - The field element
 * @returns {string} The text content
 */
export function getFieldText(field) {
  if (!field) return '';
  
  if (typeof field.value !== 'undefined') {
    return field.value.trim();
  } else if (field.textContent) {
    return field.textContent.trim();
  } else if (field.innerHTML) {
    // For rich text editors, extract text from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = field.innerHTML;
    return tempDiv.textContent.trim();
  }
  
  return '';
}

/**
 * Update a field with new content
 * @param {Element} field - The field to update
 * @param {string} content - The content to set
 * @returns {boolean} Whether the update was successful
 */
export function updateField(field, content) {
  if (!field) return false;
  
  try {
    // Handle different field types
    if (typeof field.value !== 'undefined') {
      // Standard input/textarea field
      field.value = content;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    } 
    else if (field.getAttribute('role') === 'textbox' || field.contentEditable === 'true') {
      // Rich text editor
      field.innerHTML = content.replace(/\n/g, '<br>');
      field.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    } 
    else if (field.innerHTML !== undefined) {
      // Some other element with innerHTML
      field.innerHTML = content.replace(/\n/g, '<br>');
      return true;
    }
    
    // Try to find editable elements inside
    const editableElement = field.querySelector('[contenteditable="true"], [role="textbox"]');
    if (editableElement) {
      editableElement.innerHTML = content.replace(/\n/g, '<br>');
      editableElement.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    
    // Last resort: try to find the closest field
    const closestField = field.querySelector('input, textarea');
    if (closestField) {
      closestField.value = content;
      closestField.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
  } catch (e) {
    console.error('Error updating field:', e);
  }
  
  return false;
}

/**
 * Apply structured JSON content to appropriate fields
 * @param {Object} jsonData - The JSON data with sections
 * @param {string} platform - The platform ('JIRA' or 'CLARITY')
 * @returns {Object} Information about which fields were updated
 */
export function applyJsonToFields(jsonData, platform = 'JIRA') {
  const updated = {
    fields: [],
    success: false
  };
  
  // Map JSON keys to field names
  const fieldMapping = {
    // Common across platforms
    acceptanceCriteria: 'ACCEPTANCE_CRITERIA',
    
    // Jira-specific
    testCases: 'TEST_CASES',
    technicalDetails: 'TECHNICAL_DETAILS',
    dependencies: 'DEPENDENCIES',
    securityRecommendations: 'SECURITY_RECOMMENDATIONS',
    estimation: 'ESTIMATION',
    
    // Clarity-specific
    expectedBenefits: 'EXPECTED_BENEFITS',
    businessOutcomes: 'BUSINESS_OUTCOMES',
    risksConstraints: 'RISKS_CONSTRAINTS'
  };
  
  // Track fields that couldn't be updated for fallback to description
  const unhandledContent = [];
  
  // Try to update each mapped field
  for (const [jsonKey, value] of Object.entries(jsonData)) {
    if (!value) continue;
    
    const fieldKey = fieldMapping[jsonKey];
    if (!fieldKey) continue;
    
    // Format content based on if it's an array or string
    let formattedContent;
    if (Array.isArray(value)) {
      formattedContent = value.map(item => `• ${item}`).join('\n\n');
    } else {
      formattedContent = value;
    }
    
    // Try to find and update the field
    const field = findField(fieldKey, platform);
    if (field && updateField(field, formattedContent)) {
      updated.fields.push(fieldKey);
    } else {
      // If field update failed, add to unhandled content for description fallback
      unhandledContent.push({
        heading: fieldKey.replace(/_/g, ' ').toLowerCase(),
        content: formattedContent
      });
    }
  }
  
  // If there's unhandled content, append to description as fallback
  if (unhandledContent.length > 0) {
    const descField = findField('DESCRIPTION', platform);
    if (descField) {
      const currentDesc = getFieldText(descField);
      let newContent = currentDesc;
      
      // Add each unhandled section
      unhandledContent.forEach(section => {
        newContent += `\n\n## ${section.heading}\n${section.content}`;
      });
      
      if (updateField(descField, newContent)) {
        updated.fields.push('DESCRIPTION');
      }
    }
  }
  
  updated.success = updated.fields.length > 0;
  return updated;
}

/**
 * Apply text content with section markers to fields
 * @param {string} content - The text content with ## section headers
 * @param {string} platform - The platform ('JIRA' or 'CLARITY')
 * @returns {Object} Information about which fields were updated
 */
export function applyTextToFields(content, platform = 'JIRA') {
  // Extract sections from the content
  const sections = extractSections(content);
  
  // Convert to structure similar to JSON data
  const structuredData = {};
  
  // Map section titles to JSON keys
  const sectionMapping = {
    'acceptance criteria': 'acceptanceCriteria',
    'test cases': 'testCases',
    'technical details': 'technicalDetails',
    'dependencies': 'dependencies',
    'security recommendations': 'securityRecommendations',
    'estimation': 'estimation',
    'expected benefits': 'expectedBenefits',
    'business outcomes': 'businessOutcomes',
    'risks/constraints': 'risksConstraints'
  };
  
  // Build structured data object
  for (const [title, content] of Object.entries(sections)) {
    const normalizedTitle = title.toLowerCase();
    const jsonKey = sectionMapping[normalizedTitle];
    
    if (jsonKey) {
      structuredData[jsonKey] = content;
    }
  }
  
  // Apply using the JSON function since we've structured the data
  return applyJsonToFields(structuredData, platform);
}

/**
 * Extract sections from text content based on ## headers
 * @param {string} content - The content to parse
 * @returns {Object} Map of section titles to content
 */
function extractSections(content) {
  const sections = {};
  
  // Match section headers (##) and their content
  const sectionRegex = /##\s+([^#\n]+)([^#]*?)(?=##\s+|$)/g;
  let match;
  
  while ((match = sectionRegex.exec(content)) !== null) {
    const title = match[1].trim();
    const sectionContent = match[2].trim();
    
    if (title && sectionContent) {
      sections[title] = sectionContent;
    }
  }
  
  // If no sections found, treat entire content as one section
  if (Object.keys(sections).length === 0 && content.trim()) {
    sections['Content'] = content.trim();
  }
  
  return sections;
}
