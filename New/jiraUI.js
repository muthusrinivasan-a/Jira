// jiraUI.js - Enhanced UI components for Jira integration with field selection

import { CONFIG } from './config.js';
import { createButton, createDropdown, createModal, showNotification } from './uiService.js';
import { getFieldText, findField } from './fieldService.js';
import { generateContent } from './contentGeneration.js';

/**
 * Add AI assistant button with dropdown to a field
 * @param {Element} field - The field to add the button to
 */
export function addAIButton(field) {
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
      alignItems: 'center'
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
  
  // Add divider
  dropdownItems.push({
    html: '<div style="border-top: 1px solid #ddd; margin: 5px 0;"></div>',
    onClick: () => {}
  });
  
  // Add "Custom Fields" option
  dropdownItems.push({
    html: `
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 8px;">🔧</span>
        <div style="display: flex; flex-direction: column;">
          <span style="font-weight: bold;">Custom Fields</span>
          <span style="font-size: 12px; color: #6B778C;">Select specific fields to generate</span>
        </div>
      </div>
    `,
    onClick: () => showFieldSelectionModal(field)
  });
  
  // Add "Generate All" option
  dropdownItems.push({
    html: `
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 8px;">📋</span>
        <div style="display: flex; flex-direction: column;">
          <span style="font-weight: bold;">Generate All</span>
          <span style="font-size: 12px; color: #6B778C;">Create content for all fields</span>
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
      platform: 'JIRA'
    });
  } else {
    showNotification('Please add a description first', false);
  }
}

/**
 * Show modal for selecting which fields to generate
 * @param {Element} field - The source field element
 */
function showFieldSelectionModal(field) {
  const descriptionText = getFieldText(field);
  
  if (!descriptionText) {
    showNotification('Please add a description first', false);
    return;
  }
  
  // Create the modal body content with checkboxes
  const modalContent = document.createElement('div');
  
  // Add explanation text
  const explainText = document.createElement('p');
  explainText.textContent = 'Select the fields you want to generate content for:';
  modalContent.appendChild(explainText);
  
  // Create checkbox container
  const checkboxContainer = document.createElement('div');
  checkboxContainer.style.display = 'flex';
  checkboxContainer.style.flexDirection = 'column';
  checkboxContainer.style.gap = '10px';
  checkboxContainer.style.marginTop = '10px';
  
  // Get available fields from config
  const fieldOptions = [
    { id: 'acceptanceCriteria', label: 'Acceptance Criteria', checked: true },
    { id: 'testCases', label: 'Test Cases', checked: true },
    { id: 'technicalDetails', label: 'Technical Details', checked: false },
    { id: 'dependencies', label: 'Dependencies', checked: false },
    { id: 'securityRecommendations', label: 'Security Recommendations', checked: false },
    { id: 'estimation', label: 'Estimation', checked: false }
  ];
  
  // Create checkbox for each field
  const checkboxes = fieldOptions.map(field => {
    const fieldContainer = document.createElement('div');
    fieldContainer.style.display = 'flex';
    fieldContainer.style.alignItems = 'center';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `field-${field.id}`;
    checkbox.checked = field.checked;
    checkbox.style.marginRight = '8px';
    
    const label = document.createElement('label');
    label.htmlFor = `field-${field.id}`;
    label.textContent = field.label;
    
    fieldContainer.appendChild(checkbox);
    fieldContainer.appendChild(label);
    checkboxContainer.appendChild(fieldContainer);
    
    return checkbox;
  });
  
  // Add style selection
  const styleContainer = document.createElement('div');
  styleContainer.style.marginTop = '15px';
  styleContainer.style.borderTop = '1px solid #ddd';
  styleContainer.style.paddingTop = '15px';
  
  const styleLabel = document.createElement('label');
  styleLabel.textContent = 'Writing style:';
  styleLabel.style.display = 'block';
  styleLabel.style.marginBottom = '10px';
  
  const styleSelect = document.createElement('select');
  styleSelect.style.width = '100%';
  styleSelect.style.padding = '8px';
  styleSelect.style.borderRadius = '3px';
  styleSelect.style.border = '1px solid #ddd';
  
  // Add style options
  CONFIG.WRITING_STYLES.forEach(style => {
    const option = document.createElement('option');
    option.value = style.id;
    option.textContent = style.label + (style.description ? ` - ${style.description}` : '');
    if (style.id === 'standard') {
      option.selected = true;
    }
    styleSelect.appendChild(option);
  });
  
  styleContainer.appendChild(styleLabel);
  styleContainer.appendChild(styleSelect);
  
  // Add all elements to modal content
  modalContent.appendChild(checkboxContainer);
  modalContent.appendChild(styleContainer);
  
  // Create and show the modal
  const modal = createModal({
    title: 'Generate Content for Fields',
    content: modalContent,
    buttons: [
      { 
        text: 'Cancel', 
        type: 'secondary', 
        onClick: () => modal.close() 
      },
      { 
        text: 'Generate', 
        type: 'primary', 
        onClick: () => {
          // Get selected fields
          const selectedFields = {};
          fieldOptions.forEach((field, index) => {
            if (checkboxes[index].checked) {
              selectedFields[field.id] = true;
            }
          });
          
          // Get selected style
          const selectedStyle = styleSelect.value;
          
          // Close modal
          modal.close();
          
          // Generate content with selected fields
          generateContent({
            text: descriptionText,
            field: field,
            styleOption: selectedStyle,
            platform: 'JIRA',
            contentOptions: {
              selectedFields: selectedFields
            }
          });
        } 
      }
    ],
    width: '400px'
  });
  
  modal.open();
}

/**
 * Handle generating content for all fields
 * @param {Element} field - The description field
 */
function handleGenerateAllClick(field) {
  const descriptionText = getFieldText(field);
  
  if (!descriptionText) {
    showNotification('Please add a description first', false);
    return;
  }
  
  // Create a simple "processing" modal
  const processingContent = document.createElement('div');
  processingContent.style.textAlign = 'center';
  processingContent.style.padding = '20px';
  
  const loadingIcon = document.createElement('div');
  loadingIcon.innerHTML = '✨';
  loadingIcon.style.fontSize = '36px';
  loadingIcon.style.margin = '10px 0';
  loadingIcon.className = 'sparkle';
  
  const loadingText = document.createElement('p');
  loadingText.textContent = 'Generating content for all fields...';
  loadingText.style.marginTop = '15px';
  
  processingContent.appendChild(loadingIcon);
  processingContent.appendChild(loadingText);
  
  const processingModal = createModal({
    title: 'Generating Content',
    content: processingContent,
    buttons: [],
    closeOnEscape: false,
    closeOnClickOutside: false,
    showCloseButton: false,
    width: '350px'
  });
  
  processingModal.open();
  
  // Define all fields to generate
  const allFields = {
    acceptanceCriteria: true,
    testCases: true,
    technicalDetails: true,
    dependencies: true,
    securityRecommendations: true,
    estimation: true
  };
  
  // Generate content
  generateContent({
    text: descriptionText,
    field: field,
    styleOption: 'detailed', // Default to detailed for comprehensive content
    platform: 'JIRA',
    contentOptions: {
      selectedFields: allFields,
      generateAll: true
    },
    onComplete: function(content, error, isJson) {
      // Close processing modal
      processingModal.close();
      
      if (error) {
        showNotification(`Error generating content: ${error}`, false);
      } else {
        // Show results modal with tabs for each section
        showResultsModal(content, field);
      }
    }
  });
}

/**
 * Show modal with generated results
 * @param {Object} content - The generated content
 * @param {Element} field - The source field
 */
function showResultsModal(content, field) {
  if (!content || typeof content !== 'object') {
    showNotification('No valid content was generated', false);
    return;
  }
  
  // Create the modal body
  const modalContent = document.createElement('div');
  modalContent.style.maxHeight = '60vh';
  modalContent.style.overflowY = 'auto';
  
  // Function to create a content section
  function createSection(title, content) {
    if (!content) return '';
    
    const section = document.createElement('div');
    section.style.marginBottom = '20px';
    
    const heading = document.createElement('h3');
    heading.textContent = title;
    heading.style.fontSize = '16px';
    heading.style.margin = '0 0 10px 0';
    heading.style.padding = '0 0 5px 0';
    heading.style.borderBottom = '1px solid #ddd';
    
    const contentDiv = document.createElement('div');
    
    if (Array.isArray(content)) {
      const list = document.createElement('ul');
      list.style.paddingLeft = '20px';
      list.style.margin = '0';
      
      content.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.style.marginBottom = '5px';
        list.appendChild(li);
      });
      
      contentDiv.appendChild(list);
    } else {
      contentDiv.innerHTML = content.replace(/\n/g, '<br>');
    }
    
    section.appendChild(heading);
    section.appendChild(contentDiv);
    
    return section;
  }
  
  // Add each content section
  if (content.acceptanceCriteria) {
    modalContent.appendChild(createSection('Acceptance Criteria', content.acceptanceCriteria));
  }
  
  if (content.testCases) {
    modalContent.appendChild(createSection('Test Cases', content.testCases));
  }
  
  if (content.technicalDetails) {
    modalContent.appendChild(createSection('Technical Details', content.technicalDetails));
  }
  
  if (content.dependencies) {
    modalContent.appendChild(createSection('Dependencies', content.dependencies));
  }
  
  if (content.securityRecommendations) {
    modalContent.appendChild(createSection('Security Recommendations', content.securityRecommendations));
  }
  
  if (content.estimation) {
    modalContent.appendChild(createSection('Estimation', content.estimation));
  }
  
  // Create checkboxes for field selection
  const selectionDiv = document.createElement('div');
  selectionDiv.style.borderTop = '1px solid #ddd';
  selectionDiv.style.paddingTop = '15px';
  selectionDiv.style.marginTop = '10px';
  
  const selectLabel = document.createElement('div');
  selectLabel.textContent = 'Select fields to apply content to:';
  selectLabel.style.marginBottom = '10px';
  selectLabel.style.fontWeight = 'bold';
  
  selectionDiv.appendChild(selectLabel);
  
  const checkboxes = {};
  
  // Create checkbox for each content section
  Object.keys(content).forEach(key => {
    if (!content[key]) return;
    
    const fieldContainer = document.createElement('div');
    fieldContainer.style.display = 'flex';
    fieldContainer.style.alignItems = 'center';
    fieldContainer.style.marginBottom = '8px';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `apply-${key}`;
    checkbox.checked = true;
    checkbox.style.marginRight = '8px';
    
    const label = document.createElement('label');
    label.htmlFor = `apply-${key}`;
    
    // Get nice label from key
    let fieldLabel = key.replace(/([A-Z])/g, ' $1');
    fieldLabel = fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1);
    label.textContent = fieldLabel;
    
    fieldContainer.appendChild(checkbox);
    fieldContainer.appendChild(label);
    selectionDiv.appendChild(fieldContainer);
    
    checkboxes[key] = checkbox;
  });
  
  // Add "Select All" checkbox
  const selectAllContainer = document.createElement('div');
  selectAllContainer.style.display = 'flex';
  selectAllContainer.style.alignItems = 'center';
  selectAllContainer.style.marginBottom = '15px';
  
  const selectAllCheckbox = document.createElement('input');
  selectAllCheckbox.type = 'checkbox';
  selectAllCheckbox.id = 'select-all-fields';
  selectAllCheckbox.checked = true;
  selectAllCheckbox.style.marginRight = '8px';
  
  selectAllCheckbox.addEventListener('change', () => {
    // Update all checkboxes
    Object.values(checkboxes).forEach(checkbox => {
      checkbox.checked = selectAllCheckbox.checked;
    });
  });
  
  const selectAllLabel = document.createElement('label');
  selectAllLabel.htmlFor = 'select-all-fields';
  selectAllLabel.textContent = 'Select All';
  selectAllLabel.style.fontWeight = 'bold';
  
  selectAllContainer.appendChild(selectAllCheckbox);
  selectAllContainer.appendChild(selectAllLabel);
  
  // Insert Select All at the top
  selectionDiv.insertBefore(selectAllContainer, selectionDiv.firstChild.nextSibling);
  
  // Add selection div to modal content
  modalContent.appendChild(selectionDiv);
  
  // Create the modal
  const modal = createModal({
    title: 'Generated Content',
    content: modalContent,
    buttons: [
      { 
        text: 'Cancel', 
        type: 'secondary', 
        onClick: () => modal.close() 
      },
      { 
        text: 'Apply Selected', 
        type: 'primary', 
        onClick: () => {
          // Filter content to only selected fields
          const filteredContent = {};
          
          Object.keys(checkboxes).forEach(key => {
            if (checkboxes[key].checked) {
              filteredContent[key] = content[key];
            }
          });
          
          // Apply the content
          const result = applyJsonToFields(filteredContent, 'JIRA');
          
          // Close modal
          modal.close();
          
          // Show notification
          if (result.success) {
            showNotification(`Content applied to ${result.fields.length} field(s)`, true);
          } else {
            showNotification('No fields were updated', false);
          }
        }
      }
    ],
    width: '600px',
    maxWidth: '80%'
  });
  
  modal.open();
}

/**
 * Apply JSON content to appropriate fields (wrapper for fieldService)
 * @param {Object} jsonData - The content to apply
 * @param {string} platform - The platform
 * @returns {Object} Result information
 */
function applyJsonToFields(jsonData, platform) {
  // Import the necessary functions from fieldService
  // This is done to avoid circular dependencies
  const fieldService = require('./fieldService.js');
  return fieldService.applyJsonToFields(jsonData, platform);
}