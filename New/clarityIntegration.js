// clarityIntegration.js - Integration with Clarity platform

import { CONFIG } from './config.js';
import { findPlatformElement } from './platformService.js';
import { findField } from './fieldService.js';
import { addSpeechRecognitionButton } from './speechService.js';
import { addClarityAIButton } from './clarityUI.js';

/**
 * Initialize Clarity integration
 */
export function initClarityIntegration() {
  console.log('Initializing Clarity integration...');
  
  // Set up observer to detect Clarity fields
  const observer = new MutationObserver(checkForClarityFields);
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Initial check for fields
  setTimeout(checkForClarityFields, 1500);
}

/**
 * Check for Clarity fields and add buttons
 */
function checkForClarityFields() {
  // Find description field
  const descriptionField = findField('DESCRIPTION', 'CLARITY');
  
  if (descriptionField) {
    // Add AI button if not already added
    if (!document.getElementById('ai-assistant-btn')) {
      addClarityAIButton(descriptionField);
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
    const titleField = findPlatformElement('titleField', 'CLARITY');
    if (titleField && !titleField.parentElement.querySelector('.speech-recognition-container')) {
      addSpeechRecognitionButton(titleField, {
        size: 28,
        position: 'right',
        showStatus: false
      });
    }
    
    // Add to business outcomes field if present
    const businessOutcomesField = findField('BUSINESS_OUTCOMES', 'CLARITY');
    if (businessOutcomesField && !businessOutcomesField.parentElement.querySelector('.speech-recognition-container')) {
      addSpeechRecognitionButton(businessOutcomesField, {
        size: 28,
        position: 'right',
        showStatus: false
      });
    }
    
    // Add to expected benefits field if present
    const expectedBenefitsField = findField('EXPECTED_BENEFITS', 'CLARITY');
    if (expectedBenefitsField && !expectedBenefitsField.parentElement.querySelector('.speech-recognition-container')) {
      addSpeechRecognitionButton(expectedBenefitsField, {
        size: 28,
        position: 'right',
        showStatus: false
      });
    }
  }
}