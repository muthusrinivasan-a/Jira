(function() {
  // Hardcoded configuration - replace with your actual API endpoint
  const API_URL = 'https://your-ai-api-endpoint.com/generate';
  
  // Google Analytics Tracking ID - replace with your actual tracking ID
  const GA_TRACKING_ID = 'G-XXXXXXXXXX';
  
  // Analytics functions
  function sendAnalyticsEvent(eventCategory, eventAction, eventLabel) {
    // Only send if we have permission to access analytics domains
    try {
      fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA_TRACKING_ID}&api_secret=YOUR_API_SECRET`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: getClientId(),
          events: [{
            name: eventAction,
            params: {
              event_category: eventCategory,
              event_label: eventLabel
            }
          }]
        })
      });
    } catch (e) {
      console.error('Analytics error:', e);
    }
  }
  
  function getClientId() {
    // Generate a persistent client ID
    let clientId = localStorage.getItem('jira_ai_assistant_client_id');
    if (!clientId) {
      clientId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('jira_ai_assistant_client_id', clientId);
    }
    return clientId;
  }
  
  // Run on page load and DOM mutations to detect when we're in a Jira ticket
  function checkForDescriptionField() {
    const descriptionField = document.querySelector('[data-test-id="issue.views.field.rich-text.description"]') || 
                           document.querySelector('#description') ||
                           document.querySelector('[role="textbox"][aria-label="Description"]');
    
    if (descriptionField && !document.getElementById('ai-assistant-btn')) {
      // Initialize styles first
      initStyles();
      
      // Then insert the button
      insertAIButton(descriptionField);
      
      // Track that we found a Jira ticket page
      sendAnalyticsEvent('Page', 'Loaded', 'Jira Ticket Page');
    }
  }
  
  // Create a MutationObserver to watch for the description field to appear
  const observer = new MutationObserver(checkForDescriptionField);
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Initial check
  setTimeout(checkForDescriptionField, 1500);
  
  // Initialize styles for all UI components
  function initStyles() {
    if (!document.getElementById('ai-assistant-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'ai-assistant-styles';
      styleElement.textContent = `
        @keyframes sparkleAnimation {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .sparkle {
          display: inline-block;
          color: gold;
          text-shadow: 0 0 5px rgba(255, 215, 0, 0.7);
          animation: sparkleAnimation 1.5s infinite;
        }
        
        #ai-assistant-btn:hover .sparkle {
          animation-duration: 0.8s;
        }
        
        /* Skeleton loading animation */
        @keyframes skeletonLoading {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        
        .skeleton-loading {
          position: relative;
          overflow: hidden;
          background: #f0f0f0;
          border-radius: 4px;
        }
        
        .skeleton-loading::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #f0f0f0, #e0e0e0, #f0f0f0);
          background-size: 200px 100%;
          animation: skeletonLoading 1.5s infinite;
        }
        
        /* Inline suggestion UI */
        .ai-suggestion {
          margin: 10px 0;
          border: 1px solid #ddd;
          border-radius: 5px;
          overflow: hidden;
        }
        
        .ai-suggestion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background-color: #f4f5f7;
          border-bottom: 1px solid #ddd;
        }
        
        .ai-suggestion-title {
          font-weight: bold;
          color: #0052cc;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .ai-suggestion-actions {
          display: flex;
          gap: 5px;
        }
        
        .ai-suggestion-content {
          padding: 10px;
          background-color: white;
        }
        
        .ai-edit-area {
          width: 100%;
          min-height: 100px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 3px;
          font-family: inherit;
          font-size: inherit;
          resize: vertical;
        }
        
        .ai-btn {
          padding: 5px 10px;
          border-radius: 3px;
          border: none;
          cursor: pointer;
          font-size: 12px;
        }
        
        .ai-btn-primary {
          background-color: #0052cc;
          color: white;
        }
        
        .ai-btn-secondary {
          background-color: #f4f5f7;
          border: 1px solid #ddd;
        }
        
        .ai-btn-danger {
          background-color: #de350b;
          color: white;
        }
      `;
      document.head.appendChild(styleElement);
    }
  }
  
  function insertAIButton(descriptionField) {
    // Create the AI assistant button
    const aiButton = document.createElement('button');
    aiButton.id = 'ai-assistant-btn';
    
    // Create animated sparkle span
    const sparkleSpan = document.createElement('span');
    sparkleSpan.className = 'sparkle';
    sparkleSpan.textContent = '✨';
    
    // Add the sparkle and text to the button
    aiButton.appendChild(sparkleSpan);
    aiButton.appendChild(document.createTextNode(' AI Assist'));
    
    aiButton.style.cssText = `
      position: absolute;
      right: 10px;
      top: 10px;
      background-color: #0052cc;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 6px 12px;
      font-size: 12px;
      cursor: pointer;
      z-index: 1000;
      transition: background-color 0.2s;
    `;
    
    // Add hover effect
    aiButton.addEventListener('mouseover', function() {
      this.style.backgroundColor = '#0065ff';
    });
    
    aiButton.addEventListener('mouseout', function() {
      this.style.backgroundColor = '#0052cc';
    });
    
    // Insert the button near the description field
    descriptionField.parentElement.style.position = 'relative';
    descriptionField.parentElement.appendChild(aiButton);
    
    // Button click event - generate content inline
    aiButton.addEventListener('click', function() {
      const descriptionText = getDescriptionText(descriptionField);
      if (descriptionText) {
        // Track button click
        sendAnalyticsEvent('Button', 'Click', 'Generate AI Content');
        
        // Generate content inline
        generateInlineContent(descriptionText, descriptionField);
      } else {
        showNotification('Please add a description first', false);
      }
    });
  }
  
  function getDescriptionText(descriptionField) {
    // Try to get text content based on different Jira UI versions
    if (descriptionField.textContent) {
      return descriptionField.textContent.trim();
    } else if (descriptionField.value) {
      return descriptionField.value.trim();
    } else if (descriptionField.innerHTML) {
      // For rich text editors
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = descriptionField.innerHTML;
      return tempDiv.textContent.trim();
    }
    return '';
  }
  
  function generateInlineContent(description, descriptionField) {
    // Create the suggestion container
    const suggestionContainer = document.createElement('div');
    suggestionContainer.className = 'ai-suggestion';
    suggestionContainer.style.marginTop = '15px';
    
    // Create the suggestion header
    const suggestionHeader = document.createElement('div');
    suggestionHeader.className = 'ai-suggestion-header';
    
    const suggestionTitle = document.createElement('div');
    suggestionTitle.className = 'ai-suggestion-title';
    
    const sparkleSpan = document.createElement('span');
    sparkleSpan.className = 'sparkle';
    sparkleSpan.textContent = '✨';
    
    suggestionTitle.appendChild(sparkleSpan);
    suggestionTitle.appendChild(document.createTextNode('AI Suggestion'));
    
    const actionButtons = document.createElement('div');
    actionButtons.className = 'ai-suggestion-actions';
    actionButtons.style.display = 'none'; // Initially hidden while loading
    
    const editButton = document.createElement('button');
    editButton.className = 'ai-btn ai-btn-secondary';
    editButton.textContent = 'Edit';
    
    const applyButton = document.createElement('button');
    applyButton.className = 'ai-btn ai-btn-primary';
    applyButton.textContent = 'Apply';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'ai-btn ai-btn-danger';
    cancelButton.textContent = 'Cancel';
    
    actionButtons.appendChild(editButton);
    actionButtons.appendChild(applyButton);
    actionButtons.appendChild(cancelButton);
    
    suggestionHeader.appendChild(suggestionTitle);
    suggestionHeader.appendChild(actionButtons);
    
    // Create skeleton loading content
    const skeletonContent = document.createElement('div');
    skeletonContent.className = 'ai-suggestion-content';
    
    // Create multiple skeleton lines
    for (let i = 0; i < 10; i++) {
      const skeletonLine = document.createElement('div');
      skeletonLine.className = 'skeleton-loading';
      skeletonLine.style.height = '16px';
      skeletonLine.style.marginBottom = '8px';
      skeletonLine.style.width = `${Math.floor(Math.random() * 50) + 50}%`; // Random width between 50-100%
      skeletonContent.appendChild(skeletonLine);
    }
    
    // Assemble the suggestion container
    suggestionContainer.appendChild(suggestionHeader);
    suggestionContainer.appendChild(skeletonContent);
    
    // Insert after the description field
    descriptionField.parentElement.insertBefore(suggestionContainer, descriptionField.nextSibling);
    
    // Call the API to generate content
    generateAIContent(description, '', function(aiContent, error) {
      // Remove the skeleton content
      suggestionContainer.removeChild(skeletonContent);
      
      if (error) {
        // Show error message
        const errorContent = document.createElement('div');
        errorContent.className = 'ai-suggestion-content';
        errorContent.textContent = `Error: ${error}`;
        errorContent.style.color = '#de350b';
        suggestionContainer.appendChild(errorContent);
        
        // Track error
        sendAnalyticsEvent('Error', 'API Error', error);
        
        // Show close button only
        actionButtons.style.display = 'flex';
        actionButtons.innerHTML = '';
        const closeButton = document.createElement('button');
        closeButton.className = 'ai-btn ai-btn-danger';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', function() {
          suggestionContainer.remove();
        });
        actionButtons.appendChild(closeButton);
      } else {
        // Create content display
        const contentDisplay = document.createElement('div');
        contentDisplay.className = 'ai-suggestion-content';
        contentDisplay.innerHTML = aiContent.replace(/\n/g, '<br>');
        
        // Add content to container
        suggestionContainer.appendChild(contentDisplay);
        
        // Show action buttons
        actionButtons.style.display = 'flex';
        
        // Track suggestion generated
        sendAnalyticsEvent('Content', 'Generated', 'AI Suggestion');
        
        // Setup button event handlers
        editButton.addEventListener('click', function() {
          // Replace display with editable textarea
          const editArea = document.createElement('textarea');
          editArea.className = 'ai-edit-area';
          editArea.value = aiContent;
          
          suggestionContainer.removeChild(contentDisplay);
          suggestionContainer.appendChild(editArea);
          
          // Focus the edit area
          editArea.focus();
          
          // Change edit button to save button
          editButton.textContent = 'Save';
          editButton.removeEventListener('click', arguments.callee);
          editButton.addEventListener('click', function() {
            const editedContent = editArea.value;
            
            // Update the display
            contentDisplay.innerHTML = editedContent.replace(/\n/g, '<br>');
            suggestionContainer.removeChild(editArea);
            suggestionContainer.appendChild(contentDisplay);
            
            // Revert button
            editButton.textContent = 'Edit';
            
            // Track edit
            sendAnalyticsEvent('Content', 'Edited', 'AI Suggestion');
          });
        });
        
        applyButton.addEventListener('click', function() {
          // Get current content (from display or textarea if in edit mode)
          let finalContent;
          const editArea = suggestionContainer.querySelector('.ai-edit-area');
          if (editArea) {
            finalContent = editArea.value;
          } else {
            finalContent = aiContent;
          }
          
          // Apply to description field
          applyContentToDescription(finalContent, descriptionField);
          
          // Remove suggestion container
          suggestionContainer.remove();
          
          // Show success notification
          showNotification('Content applied to description', true);
          
          // Track application
          sendAnalyticsEvent('Content', 'Applied', 'AI Suggestion');
        });
        
        cancelButton.addEventListener('click', function() {
          // Remove suggestion container
          suggestionContainer.remove();
          
          // Track cancellation
          sendAnalyticsEvent('Content', 'Cancelled', 'AI Suggestion');
        });
      }
    });
  }
  
  function generateAIContent(description, additionalInstructions, callback) {
    // Create the prompt with the ticket description
    let prompt = `Please generate acceptance criteria, test cases, and additional details for the following Jira ticket description:

${description}

Format your response with the following sections:
## Acceptance Criteria
- List specific, testable criteria that define when this ticket is complete
- Each criterion should be clear, concise, and verifiable
- Use the format "As a [user role], I should be able to [action] so that [benefit]" where appropriate

## Test Cases
- Provide specific test scenarios that validate each acceptance criterion
- Include edge cases and potential failure modes
- Specify expected outcomes for each test

## Technical Details
- Outline implementation considerations
- Note any specific technologies, libraries, or patterns to use
- List performance or security considerations
- Mention potential challenges or technical risks

## Dependencies
- Identify prerequisites or blockers
- List related tickets or tasks that should be completed first
- Note external systems or services this ticket interacts with

## Security Recommendations
- Identify potential security concerns
- Suggest security best practices to implement
- Note any compliance requirements or privacy considerations
- Recommend security testing approaches

## Estimation
- Suggest a complexity level (Low/Medium/High)
- Provide a rough time estimate if possible (in days/hours)`;

    if (additionalInstructions) {
      prompt += '\n\nAdditional instructions: ' + additionalInstructions;
    }
    
    // Call your specific API endpoint - no authentication header
    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        callback(null, `API Error: ${data.error.message}`);
      } else if (data.output) {
        callback(data.output);
      } else {
        callback(null, 'Unexpected API response format');
      }
    })
    .catch(error => {
      callback(null, `Error: ${error.message}`);
    });
  }
  
  function applyContentToDescription(content, descriptionField) {
    // Get current description
    const currentText = getDescriptionText(descriptionField);
    
    // Apply the content based on the field type
    if (typeof descriptionField.value !== 'undefined') {
      // Standard input field
      descriptionField.value = currentText + '\n\n' + content;
      // Trigger input event
      const event = new Event('input', { bubbles: true });
      descriptionField.dispatchEvent(event);
    } else {
      // Rich text editor
      const div = document.createElement('div');
      div.innerHTML = content.replace(/\n/g, '<br>');
      
      if (descriptionField.innerHTML) {
        descriptionField.innerHTML += '<br><br>' + div.innerHTML;
      } else {
        // Try to find the editable element inside
        const editableElement = descriptionField.querySelector('[contenteditable="true"]');
        if (editableElement) {
          editableElement.innerHTML += '<br><br>' + div.innerHTML;
        } else {
          // Last resort, try setting textContent
          descriptionField.textContent = currentText + '\n\n' + content;
        }
      }
      
      // Trigger input event
      const event = new Event('input', { bubbles: true });
      descriptionField.dispatchEvent(event);
    }
  }
  
  function showNotification(message, isSuccess) {
    // Create and display a notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 15px;
      border-radius: 4px;
      color: white;
      background-color: ${isSuccess ? '#00875a' : '#de350b'};
      z-index: 10000;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(function() {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }
})();
