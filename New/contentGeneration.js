// contentGeneration.js - Content generation and display

import { CONFIG } from './config.js';
import { callAIService } from './apiService.js';
import { applyJsonToFields, applyTextToFields } from './fieldService.js';
import { createButton, createSkeletonLoader, showNotification } from './uiService.js';

/**
 * Generate content using AI
 * @param {Object} options - Generation options
 * @param {string} options.text - The text to generate from
 * @param {Element} options.field - The field element
 * @param {string} options.styleOption - Writing style option
 * @param {string} options.platform - Current platform ('JIRA' or 'CLARITY')
 * @param {Object} options.contentOptions - Additional content options
 */
export function generateContent(options) {
  const { text, field, styleOption = 'standard', platform = 'JIRA', contentOptions = null } = options;
  
  // Create container for the suggestion
  const container = document.createElement('div');
  container.className = 'ai-suggestion';
  container.style.marginTop = '15px';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'ai-suggestion-header';
  
  // Create title with style indicator
  const title = document.createElement('div');
  title.className = 'ai-suggestion-title';
  
  // Add sparkle icon
  const sparkleSpan = document.createElement('span');
  sparkleSpan.className = 'sparkle';
  sparkleSpan.textContent = '✨';
  title.appendChild(sparkleSpan);
  
  // Add title text
  title.appendChild(document.createTextNode('AI Suggestion'));
  
  // Add style tag if not standard
  if (styleOption !== 'standard') {
    const styleTag = document.createElement('span');
    styleTag.className = `writing-style-tag ${styleOption}`;
    styleTag.textContent = styleOption.charAt(0).toUpperCase() + styleOption.slice(1);
    title.appendChild(styleTag);
  }
  
  // Create action buttons
  const actionButtons = document.createElement('div');
  actionButtons.className = 'ai-suggestion-actions';
  actionButtons.style.display = 'none'; // Initially hidden while loading
  
  // Create Edit button
  const editButton = createButton({
    text: 'Edit',
    type: 'secondary',
    className: 'edit-button'
  });
  
  // Create Apply button
  const applyButton = createButton({
    text: 'Apply',
    type: 'primary',
    className: 'apply-button'
  });
  
  // Create Cancel button
  const cancelButton = createButton({
    text: 'Cancel',
    type: 'danger',
    className: 'cancel-button',
    onClick: () => container.remove()
  });
  
  // Add buttons to action container
  actionButtons.appendChild(editButton);
  actionButtons.appendChild(applyButton);
  actionButtons.appendChild(cancelButton);
  
  // Assemble header
  header.appendChild(title);
  header.appendChild(actionButtons);
  
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
  
  // Call the API
  callAIService({
    prompt: text,
    styleOption: styleOption,
    selectedFields: contentOptions
  }, function(content, error, isJson) {
    // Remove skeleton loader
    container.removeChild(loadingContent);
    
    if (error) {
      // Show error
      handleError(container, actionButtons, error);
    } else {
      // Show content
      handleSuccess(container, actionButtons, content, isJson, platform, field, editButton, applyButton);
    }
  });
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
 * Handle successful content generation
 * @param {Element} container - The container element
 * @param {Element} actionButtons - The action buttons element
 * @param {Object|string} content - The generated content
 * @param {boolean} isJson - Whether content is JSON
 * @param {string} platform - Current platform
 * @param {Element} field - The field element
 * @param {Element} editButton - The edit button
 * @param {Element} applyButton - The apply button
 */
function handleSuccess(container, actionButtons, content, isJson, platform, field, editButton, applyButton) {
  // Create content display
  const contentDiv = document.createElement('div');
  contentDiv.className = 'ai-suggestion-content';
  
  // Format content based on type
  let formattedContent = '';
  let rawContent = '';
  
  if (isJson) {
    // It's JSON data
    rawContent = JSON.stringify(content, null, 2);
    formattedContent = formatJsonToHtml(content);
  } else {
    // It's text content
    rawContent = content;
    formattedContent = content.replace(/\n/g, '<br>');
  }
  
  // Set content
  contentDiv.innerHTML = formattedContent;
  container.appendChild(contentDiv);
  
  // Show action buttons
  actionButtons.style.display = 'flex';
  
  // Setup edit button
  editButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Replace with textarea for editing
    const textarea = document.createElement('textarea');
    textarea.className = 'ai-edit-area';
    textarea.value = rawContent;
    
    // Replace content with textarea
    container.removeChild(contentDiv);
    container.appendChild(textarea);
    
    // Focus the textarea
    textarea.focus();
    
    // Change edit button to save
    editButton.textContent = 'Save';
    
    // Remove old click handler and add save handler
    editButton.replaceWith(editButton.cloneNode(true));
    const newEditButton = container.querySelector('.edit-button');
    
    newEditButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const newContent = textarea.value;
      
      // Try to parse as JSON if it looks like JSON
      if (newContent.trim().startsWith('{') && newContent.trim().endsWith('}')) {
        try {
          const jsonData = JSON.parse(newContent);
          
          // Update content variables
          formattedContent = formatJsonToHtml(jsonData);
          rawContent = newContent;
          content = jsonData;
          isJson = true;
        } catch (e) {
          // Not valid JSON, treat as text
          formattedContent = newContent.replace(/\n/g, '<br>');
          rawContent = newContent;
          content = newContent;
          isJson = false;
        }
      } else {
        // Plain text
        formattedContent = newContent.replace(/\n/g, '<br>');
        rawContent = newContent;
        content = newContent;
        isJson = false;
      }
      
      // Update display
      contentDiv.innerHTML = formattedContent;
      container.removeChild(textarea);
      container.appendChild(contentDiv);
      
      // Reset button text
      newEditButton.textContent = 'Edit';
    });
  });
  
  // Setup apply button
  applyButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    let result;
    
    // Apply content to fields based on type
    if (isJson) {
      result = applyJsonToFields(content, platform);
    } else {
      result = applyTextToFields(content, platform);
    }
    
    // Remove container
    container.remove();
    
    // Show success notification
    if (result.success) {
      showNotification(`Content applied to ${result.fields.length} field(s)`, true);
    } else {
      showNotification('No fields were updated', false);
    }
  });
}

/**
 * Format JSON data as HTML for display
 * @param {Object} jsonData - The JSON data
 * @returns {string} HTML representation
 */
function formatJsonToHtml(jsonData) {
  let html = '';
  
  // Format Acceptance Criteria
  if (jsonData.acceptanceCriteria && jsonData.acceptanceCriteria.length > 0) {
    html += `<div style="margin-bottom: 15px;">
      <h2 style="margin-top: 0; margin-bottom: 10px; font-size: 16px; color: #172B4D;">Acceptance Criteria</h2>
      <ul style="margin-top: 0; padding-left: 20px;">
        ${jsonData.acceptanceCriteria.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>`;
  }

  // Format Test Cases
  if (jsonData.testCases && jsonData.testCases.length > 0) {
    html += `<div style="margin-bottom: 15px;">
      <h2 style="margin-top: 0; margin-bottom: 10px; font-size: 16px; color: #172B4D;">Test Cases</h2>
      <ul style="margin-top: 0; padding-left: 20px;">
        ${jsonData.testCases.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>`;
  }
  
  // Format Technical Details
  if (jsonData.technicalDetails) {
    html += `<div style="margin-bottom: 15px;">
      <h2 style="margin-top: 0; margin-bottom: 10px; font-size: 16px; color: #172B4D;">Technical Details</h2>
      <div>${jsonData.technicalDetails.replace(/\n/g, '<br>')}</div>
    </div>`;
  }
  
  // Format Dependencies
  if (jsonData.dependencies) {
    html += `<div style="margin-bottom: 15px;">
      <h2 style="margin-top: 0; margin-bottom: 10px; font-size: 16px; color: #172B4D;">Dependencies</h2>
      <div>${jsonData.dependencies.replace(/\n/g, '<br>')}</div>
    </div>`;
  }
  
  // Format Security Recommendations
  if (jsonData.securityRecommendations) {
    html += `<div style="margin-bottom: 15px;">
      <h2 style="margin-top: 0; margin-bottom: 10px; font-size: 16px; color: #172B4D;">Security Recommendations</h2>
      <div>${jsonData.securityRecommendations.replace(/\n/g, '<br>')}</div>
    </div>`;
  }
  
  // Format Estimation
  if (jsonData.estimation) {
    html += `<div style="margin-bottom: 15px;">
      <h2 style="margin-top: 0; margin-bottom: 10px; font-size: 16px; color: #172B4D;">Estimation</h2>
      <div>${jsonData.estimation.replace(/\n/g, '<br>')}</div>
    </div>`;
  }
  
  // Format Expected Benefits (for Clarity)
  if (jsonData.expectedBenefits) {
    html += `<div style="margin-bottom: 15px;">
      <h2 style="margin-top: 0; margin-bottom: 10px; font-size: 16px; color: #172B4D;">Expected Benefits</h2>
      <div>${Array.isArray(jsonData.expectedBenefits) 
        ? `<ul style="margin-top: 0; padding-left: 20px;">${jsonData.expectedBenefits.map(item => `<li>${item}</li>`).join('')}</ul>`
        : jsonData.expectedBenefits.replace(/\n/g, '<br>')}
      </div>
    </div>`;
  }
  
  // Format Business Outcomes (for Clarity)
  if (jsonData.businessOutcomes) {
    html += `<div style="margin-bottom: 15px;">
      <h2 style="margin-top: 0; margin-bottom: 10px; font-size: 16px; color: #172B4D;">Business Outcomes</h2>
      <div>${Array.isArray(jsonData.businessOutcomes) 
        ? `<ul style="margin-top: 0; padding-left: 20px;">${jsonData.businessOutcomes.map(item => `<li>${item}</li>`).join('')}</ul>`
        : jsonData.businessOutcomes.replace(/\n/g, '<br>')}
      </div>
    </div>`;
  }
  
  // Format Risks/Constraints (for Clarity)
  if (jsonData.risksConstraints) {
    html += `<div style="margin-bottom: 15px;">
      <h2 style="margin-top: 0; margin-bottom: 10px; font-size: 16px; color: #172B4D;">Risks/Constraints</h2>
      <div>${Array.isArray(jsonData.risksConstraints) 
        ? `<ul style="margin-top: 0; padding-left: 20px;">${jsonData.risksConstraints.map(item => `<li>${item}</li>`).join('')}</ul>`
        : jsonData.risksConstraints.replace(/\n/g, '<br>')}
      </div>
    </div>`;
  }
  
  return html;
}