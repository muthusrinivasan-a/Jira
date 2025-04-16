// clarityUI.js - UI components for Clarity integration

import { CONFIG } from './config.js';
import { createButton, createDropdown, createTabs, showNotification } from './uiService.js';
import { getFieldText } from './fieldService.js';
import { generateContent } from './contentGeneration.js';

/**
 * Add AI assistant button with dropdown to a field in Clarity
 * @param {Element} field - The field to add the button to
 */
export function addClarityAIButton(field) {
  // Create button container
  const container = document.createElement('div');
  container.id = 'ai-assistant-container';
  container.style.position = 'absolute';
  container.style.right = '10px';
  container.style.top = '10px';
  container.style.zIndex = '1000';
  
  // Create the main button
  const aiButton = createButton({
    text: ' AI Assist ',
    type: 'primary',
    id: 'ai-assistant-btn',
    icon: '<span class="sparkle">✨</span>',
    style: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: CONFIG.UI.BUTTON_STYLES.CLARITY_PRIMARY_COLOR
    }
  });
  
  // Add arrow for dropdown
  const arrowSpan = document.createElement('span');
  arrowSpan.textContent = '▼';
  arrowSpan.style.fontSize = '8px';
  arrowSpan.style.marginLeft = '4px';
  aiButton.appendChild(arrowSpan);
  
  // Add button to container
  container.appendChild(aiButton);
  
  // Ensure field's parent is positioned
  if (field.parentElement) {
    field.parentElement.style.position = 'relative';
    field.parentElement.appendChild(container);
  }
  
  // Create dropdown items from writing styles in config
  const dropdownItems = CONFIG.WRITING_STYLES.map(style => {
    // Create item for each writing style
    const item = {
      text: style.label,
      style: {
        display: 'flex',
        alignItems: 'center'
      },
      onClick: () => handleWritingStyleClick(field, style.id)
    };
    
    // For styles with emoji, create HTML content
    if (style.emoji) {
      item.html = `
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 8px;">${style.emoji}</span>
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: bold;">${style.label}</span>
            <span style="font-size: 12px; color: #6B778C;">${style.description}</span>
          </div>
        </div>
      `;
      delete item.text;
    }
    
    return item;
  });
  
  // Add additional item for tabbed generation
  dropdownItems.push({
    html: `
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 8px;">📋</span>
        <div style="display: flex; flex-direction: column;">
          <span style="font-weight: bold;">Generate All Sections</span>
          <span style="font-size: 12px; color: #6B778C;">Create content for all main fields</span>
        </div>
      </div>
    `,
    onClick: () => handleGenerateAllClick(field)
  });
  
  // Create dropdown
  createDropdown(aiButton, dropdownItems, {
    position: 'bottom-right',
    width: 250
  });
}

/**
 * Handle writing style selection
 * @param {Element} field - The field we're working with
 * @param {string} styleId - The selected writing style ID
 */
function handleWritingStyleClick(field, styleId) {
  const descriptionText = getFieldText(field);
  
  if (descriptionText) {
    generateContent({
      text: descriptionText,
      field: field,
      styleOption: styleId,
      platform: 'CLARITY'
    });
  } else {
    showNotification('Please add a description first', false);
  }
}

/**
 * Handle generating content for all sections
 * @param {Element} field - The description field
 */
function handleGenerateAllClick(field) {
  const descriptionText = getFieldText(field);
  
  if (!descriptionText) {
    showNotification('Please add a description first', false);
    return;
  }
  
  // Create container for the tabbed suggestion
  const container = document.createElement('div');
  container.className = 'ai-suggestion';
  container.style.marginTop = '15px';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'ai-suggestion-header';
  
  // Create title
  const title = document.createElement('div');
  title.className = 'ai-suggestion-title';
  
  // Add sparkle icon
  const sparkleSpan = document.createElement('span');
  sparkleSpan.className = 'sparkle';
  sparkleSpan.textContent = '✨';
  title.appendChild(sparkleSpan);
  
  // Add title text
  title.appendChild(document.createTextNode('AI Generated Content'));
  
  // Create action buttons
  const actionButtons = document.createElement('div');
  actionButtons.className = 'ai-suggestion-actions';
  actionButtons.style.display = 'none'; // Initially hidden while loading
  
  // Create Apply All button
  const applyAllButton = createButton({
    text: 'Apply All',
    type: 'primary',
    className: 'apply-all-button'
  });
  
  // Create Cancel button
  const cancelButton = createButton({
    text: 'Cancel',
    type: 'danger',
    className: 'cancel-button',
    onClick: () => container.remove()
  });
  
  // Add buttons to action container
  actionButtons.appendChild(applyAllButton);
  actionButtons.appendChild(cancelButton);
  
  // Assemble header
  header.appendChild(title);
  header.appendChild(actionButtons);
  
  // Create content area (will be filled with tabs)
  const contentArea = document.createElement('div');
  contentArea.className = 'ai-suggestion-tabbed-content';
  
  // Create skeleton loader for content
  const loadingContent = createSkeletonLoader({
    lines: 10,
    height: 16,
    gap: 8
  });
  
  // Assemble container
  container.appendChild(header);
  container.appendChild(loadingContent);
  
  // Insert after field
  field.parentElement.insertBefore(container, field.nextSibling);
  
  // Generate content with specific options for multiple sections
  generateContent({
    text: descriptionText,
    field: field,
    styleOption: 'detailed', // Default to detailed for all sections
    platform: 'CLARITY',
    contentOptions: {
      generateAll: true,
      sections: [
        'BUSINESS_OUTCOMES',
        'EXPECTED_BENEFITS',
        'ACCEPTANCE_CRITERIA',
        'RISKS_CONSTRAINTS'
      ]
    },
    onComplete: function(content, error, isJson) {
      // Remove skeleton loader
      container.removeChild(loadingContent);
      
      if (error) {
        // Show error
        handleError(container, actionButtons, error);
      } else {
        // Create tabs with generated content
        createContentTabs(container, contentArea, content, actionButtons, applyAllButton);
        container.appendChild(contentArea);
      }
    }
  });
}

/**
 * Create skeleton loader
 * @param {Object} options - Options for the loader
 * @returns {HTMLElement} The skeleton loader element
 */
function createSkeletonLoader(options) {
  const container = document.createElement('div');
  container.className = 'skeleton-container';
  container.style.padding = '15px';
  
  const { lines = 5, height = 16, gap = 8 } = options;
  
  for (let i = 0; i < lines; i++) {
    const line = document.createElement('div');
    line.className = 'skeleton-loading';
    line.style.height = `${height}px`;
    line.style.marginBottom = `${gap}px`;
    
    // Random width for more natural look
    const width = Math.floor(Math.random() * (95 - 70 + 1)) + 70;
    line.style.width = `${width}%`;
    
    container.appendChild(line);
  }
  
  return container;
}

/**
 * Handle error in content generation
 * @param {Element} container - The container element
 * @param {Element} actionButtons - The action buttons element
 * @param {string} error - The error message
 */
function handleError(container, actionButtons, error) {
  // Create error message element
  const errorDiv = document.createElement('div');
  errorDiv.className = 'ai-suggestion-content';
  errorDiv.textContent = `Error: ${error}`;
  errorDiv.style.color = '#de350b';
  container.appendChild(errorDiv);
  
  // Show close button only
  actionButtons.style.display = 'flex';
  actionButtons.innerHTML = '';
  
  // Create and add close button
  const closeButton = createButton({
    text: 'Close',
    type: 'danger',
    onClick: () => container.remove()
  });
  
  actionButtons.appendChild(closeButton);
}

/**
 * Create tabbed interface for generated content
 * @param {Element} container - The main container
 * @param {Element} contentArea - The content area to add tabs to
 * @param {Object} content - The generated content
 * @param {Element} actionButtons - Action buttons container
 * @param {Element} applyAllButton - Apply all button
 */
function createContentTabs(container, contentArea, content, actionButtons, applyAllButton) {
  // Show action buttons
  actionButtons.style.display = 'flex';
  
  // Create tabs configuration
  const tabsConfig = [
    {
      id: 'business-outcomes',
      label: 'Business Outcomes',
      content: formatTabContent(content.businessOutcomes || '')
    },
    {
      id: 'expected-benefits',
      label: 'Expected Benefits',
      content: formatTabContent(content.expectedBenefits || '')
    },
    {
      id: 'acceptance-criteria',
      label: 'Acceptance Criteria',
      content: formatTabContent(content.acceptanceCriteria || '')
    },
    {
      id: 'risks-constraints',
      label: 'Risks/Constraints',
      content: formatTabContent(content.risksConstraints || '')
    }
  ];
  
  // Create tabs interface
  const tabs = createTabs({
    container: contentArea,
    tabs: tabsConfig,
    onTabChange: (tabId) => {
      // Optional callback
    }
  });
  
  // Activate first tab by default
  tabs.activateTab('business-outcomes');
  
  // Setup Apply All button
  applyAllButton.addEventListener('click', () => {
    const applyResult = applyJsonToFields({
      businessOutcomes: content.businessOutcomes,
      expectedBenefits: content.expectedBenefits,
      acceptanceCriteria: content.acceptanceCriteria,
      risksConstraints: content.risksConstraints
    }, 'CLARITY');
    
    // Remove container
    container.remove();
    
    // Show success notification
    if (applyResult.success) {
      showNotification(`Content applied to ${applyResult.fields.length} field(s)`, true);
    } else {
      showNotification('No fields were updated', false);
    }
  });
}

/**
 * Format content for tab display
 * @param {string|Array} content - Content to format
 * @returns {string} Formatted HTML
 */
function formatTabContent(content) {
  if (!content) {
    return '<p>No content generated for this section.</p>';
  }
  
  if (Array.isArray(content)) {
    return `
      <ul style="padding-left: 20px; margin-top: 0;">
        ${content.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
      </ul>
    `;
  }
  
  return `<div>${content.replace(/\n/g, '<br>')}</div>`;
}

/**
 * Apply JSON content to appropriate fields (wrapper for fieldService)
 * @param {Object} jsonData - The content to apply
 * @param {string} platform - The platform
 * @returns {Object} Result information
 */
function applyJsonToFields(jsonData, platform) {
  // This is a wrapper for the fieldService function
  // Importing directly from fieldService would create a circular dependency
  // So we're re-implementing the essential functionality here
  
  const updated = {
    fields: [],
    success: false
  };
  
  // Map JSON keys to field names
  const fieldMapping = {
    acceptanceCriteria: 'ACCEPTANCE_CRITERIA',
    expectedBenefits: 'EXPECTED_BENEFITS',
    businessOutcomes: 'BUSINESS_OUTCOMES',
    risksConstraints: 'RISKS_CONSTRAINTS'
  };
  
  // Import the necessary functions from fieldService
  import('./fieldService.js').then(module => {
    const findField = module.findField;
    const updateField = module.updateField;
    
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
      }
    }
    
    updated.success = updated.fields.length > 0;
  });
  
  return updated;
}