// main.js - Main entry point for the extension
import { CONFIG } from './config.js';
import { detectPlatform, findMainContentContainer } from './platformService.js';
import { addCommonStyles, showNotification } from './uiService.js';
import { initJiraIntegration } from './jiraIntegration.js';
import { initClarityIntegration } from './clarityIntegration.js';
import { addSpeechRecognitionToAllFields } from './speechService.js';

/**
 * Main initialization function for the extension
 */
function initExtension() {
  console.log('Initializing Jira & Clarity AI Assistant Extension...');
  
  // Detect which platform we're on
  const platform = detectPlatform();
  
  if (!platform) {
    console.log('No supported platform detected.');
    return;
  }
  
  console.log(`Detected platform: ${platform}`);
  
  // Add common styles
  addCommonStyles(platform);
  
  // Initialize the appropriate platform integration
  switch (platform) {
    case 'JIRA':
      initJiraIntegration();
      break;
    case 'CLARITY':
      initClarityIntegration();
      break;
    default:
      console.log('Unknown platform detected.');
      return;
  }
  
  // Initialize speech recognition for all fields if enabled
  if (CONFIG.SPEECH_RECOGNITION.ENABLED) {
    // Initial check
    addSpeechRecognitionToAllFields(platform);
    
    // Watch for DOM changes to add speech recognition to new fields
    const observer = new MutationObserver(function() {
      addSpeechRecognitionToAllFields(platform);
    });
    
    // Start observing
    const container = findMainContentContainer(platform) || document.body;
    observer.observe(container, { childList: true, subtree: true });
  }
}

// Start the extension when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}

// Expose config globally for debugging (can be removed in production)
window.aiAssistantConfig = CONFIG;
