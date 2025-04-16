// jiraIntegration.js - Integration with Jira platform

import { CONFIG } from './config.js';
import { findPlatformElement } from './platformService.js';
import { findField } from './fieldService.js';
import { addSpeechRecognitionButton } from './speechService.js';
import { addAIButton } from './jiraUI.js';

/**
 * Initialize Jira integration
 */
export function initJiraIntegration() {
  console.log('Initializing Jira integration...');
  
  // Set up observer to detect Jira fields
  const observer = new MutationObserver(checkForJiraFields);
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Initial check for fields
  setTimeout(checkForJiraFields, 1500);
}

/**
 * Check for Jira fields and add buttons
 */
function checkForJiraFields() {
  // Find description field
  const descriptionField = findField('DESCRIPTION', 'JIRA');
  
  if (descriptionField) {
    // Add AI button if not already added
    if (!document.getElementById('ai-assistant-btn')) {
      addAIButton(descriptionField);
    }
    
    // Add speech recognition button if not already added and enabled in config
    if (CONFIG.SPEECH_RECOGNITION.ENABLED && 
        !descriptionField.parentElement.querySelector('.speech-recognition-container')) {
      addSpeechRecognitionButton(descriptionField, {
        position: 'right',
        offset: document.getElementById('ai-assistant-btn') ? 60 : 10
      });
    }
  }
  
  // Find other important fields for speech recognition
  if (CONFIG.SPEECH_RECOGNITION.ENABLED) {
    // Add to title field
    const titleField = findPlatformElement('titleField', 'JIRA');
    if (titleField && !titleField.parentElement.querySelector('.speech-recognition-container')) {
      addSpeechRecognitionButton(titleField, {
        size: 28,
        position: 'right',
        showStatus: false
      });
    }
    
    // Add to acceptance criteria field if present
    const acField = findField('ACCEPTANCE_CRITERIA', 'JIRA');
    if (acField && !acField.parentElement.querySelector('.speech-recognition-container')) {
      addSpeechRecognitionButton(acField, {
        size: 28,
        position: 'right',
        showStatus: false
      });
    }
  }
}
