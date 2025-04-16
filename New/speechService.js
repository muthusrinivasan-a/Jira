// speechService.js - Unified speech recognition service for all platforms

import { CONFIG } from './config.js';
import { getFieldText, updateField } from './fieldService.js';
import { showNotification } from './uiService.js';

/**
 * Check if speech recognition is supported by the browser
 * @returns {boolean} Whether speech recognition is supported
 */
export function isSpeechRecognitionSupported() {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

/**
 * Create a speech recognition instance
 * @returns {SpeechRecognition|null} Speech recognition instance or null if not supported
 */
function createSpeechRecognition() {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  // Configure recognition from config
  recognition.continuous = CONFIG.SPEECH_RECOGNITION.CONTINUOUS;
  recognition.interimResults = CONFIG.SPEECH_RECOGNITION.INTERIM_RESULTS;
  recognition.lang = CONFIG.SPEECH_RECOGNITION.DEFAULT_LANGUAGE;
  
  return recognition;
}

/**
 * Add speech recognition button to a field
 * @param {Element} field - The field to add speech recognition to
 * @param {Object} options - Options for the button
 * @returns {Element} The created button container
 */
export function addSpeechRecognitionButton(field, options = {}) {
  if (!isSpeechRecognitionSupported() || !field) {
    return null;
  }
  
  const defaultOptions = {
    position: 'right', // 'right', 'left', 'top', 'bottom'
    offset: 10,
    size: 36,
    zIndex: 1000,
    showStatus: true,
    buttonStyle: {} // Additional CSS properties for the button
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Create container
  const container = document.createElement('div');
  container.className = 'speech-recognition-container';
  
  // Position container relative to field
  let containerStyle = `
    position: absolute;
    z-index: ${mergedOptions.zIndex};
  `;
  
  switch (mergedOptions.position) {
    case 'right':
      containerStyle += `
        right: ${mergedOptions.offset}px;
        top: 50%;
        transform: translateY(-50%);
      `;
      break;
    case 'left':
      containerStyle += `
        left: ${mergedOptions.offset}px;
        top: 50%;
        transform: translateY(-50%);
      `;
      break;
    case 'top':
      containerStyle += `
        top: ${mergedOptions.offset}px;
        left: 50%;
        transform: translateX(-50%);
      `;
      break;
    case 'bottom':
      containerStyle += `
        bottom: ${mergedOptions.offset}px;
        left: 50%;
        transform: translateX(-50%);
      `;
      break;
    default:
      containerStyle += `
        right: ${mergedOptions.offset}px;
        top: ${mergedOptions.offset}px;
      `;
  }
  
  container.style.cssText = containerStyle;
  
  // Create button
  const button = document.createElement('button');
  button.className = 'speech-recognition-btn';
  button.style.cssText = `
    background-color: #6554C0;
    color: white;
    border: none;
    border-radius: 50%;
    width: ${mergedOptions.size}px;
    height: ${mergedOptions.size}px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    ${Object.entries(mergedOptions.buttonStyle).map(([key, value]) => `${key}: ${value};`).join(' ')}
  `;
  
  // Add icon
  const icon = document.createElement('span');
  icon.innerHTML = '🎤';
  icon.style.fontSize = `${Math.floor(mergedOptions.size * 0.5)}px`;
  
  button.appendChild(icon);
  
  // Add tooltip
  button.title = 'Click to dictate (speech recognition)';
  
  // Add status indicator if enabled
  let statusIndicator = null;
  if (mergedOptions.showStatus) {
    statusIndicator = document.createElement('div');
    statusIndicator.className = 'speech-status';
    statusIndicator.style.cssText = `
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      white-space: nowrap;
      background-color: rgba(0,0,0,0.7);
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      display: none;
    `;
    container.appendChild(statusIndicator);
  }
  
  // Add button to container
  container.appendChild(button);
  
  // Add animation styles
  if (!document.getElementById('speech-recognition-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'speech-recognition-styles';
    styleElement.textContent = `
      @keyframes mic-pulse {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(101, 84, 192, 0.5); }
        70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(101, 84, 192, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(101, 84, 192, 0); }
      }
      
      .speech-recognition-btn.active {
        background-color: #de350b !important;
        animation: mic-pulse 2s infinite;
      }
      
      .speech-recognition-btn:hover {
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Ensure parent has position
  if (getComputedStyle(field.parentElement).position === 'static') {
    field.parentElement.style.position = 'relative';
  }
  
  // Add to parent
  field.parentElement.appendChild(container);
  
  // Initialize recognition
  const recognition = createSpeechRecognition();
  if (!recognition) {
    button.disabled = true;
    button.title = 'Speech recognition not supported in this browser';
    button.style.backgroundColor = '#ccc';
    return container;
  }
  
  // State variables
  let isListening = false;
  let finalTranscript = '';
  let interimTranscript = '';
  
  // Set up event handlers
  recognition.onresult = function(event) {
    interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + ' ';
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    
    // Update status indicator
    if (statusIndicator && interimTranscript) {
      const previewText = interimTranscript.length > 25 
        ? interimTranscript.substring(0, 25) + '...' 
        : interimTranscript;
      
      statusIndicator.textContent = `Listening: "${previewText}"`;
    }
  };
  
  recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
    isListening = false;
    button.classList.remove('active');
    
    if (statusIndicator) {
      statusIndicator.style.display = 'none';
    }
    
    if (event.error === 'not-allowed') {
      showNotification('Microphone access denied', false);
    } else {
      showNotification(`Speech recognition error: ${event.error}`, false);
    }
  };
  
  recognition.onend = function() {
    // Only update if we're not manually stopping
    if (isListening) {
      isListening = false;
      button.classList.remove('active');
      
      if (statusIndicator) {
        statusIndicator.style.display = 'none';
      }
      
      // Get current content
      const currentContent = getFieldText(field);
      
      // Update the field with the final transcript
      if (finalTranscript.trim()) {
        const updatedContent = currentContent 
          ? `${currentContent}\n\n${finalTranscript}`
          : finalTranscript;
        
        updateField(field, updatedContent);
      }
    }
  };
  
  // Button click handler
  button.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (isListening) {
      // Stop listening
      recognition.stop();
      isListening = false;
      button.classList.remove('active');
      
      if (statusIndicator) {
        statusIndicator.style.display = 'none';
      }
      
      // Get current content
      const currentContent = getFieldText(field);
      
      // Update the field with the final transcript
      if (finalTranscript.trim()) {
        const updatedContent = currentContent 
          ? `${currentContent}\n\n${finalTranscript}`
          : finalTranscript;
        
        updateField(field, updatedContent);
      }
      
      // Reset for next use
      finalTranscript = '';
      interimTranscript = '';
    } else {
      // Start listening
      finalTranscript = '';
      interimTranscript = '';
      
      try {
        recognition.start();
        isListening = true;
        button.classList.add('active');
        
        if (statusIndicator) {
          statusIndicator.textContent = 'Listening...';
          statusIndicator.style.display = 'block';
        }
      } catch (e) {
        console.error('Speech recognition error:', e);
        showNotification('Could not start speech recognition', false);
      }
    }
  });
  
  return container;
}

/**
 * Add speech recognition to all suitable fields on the page
 * @param {string} platform - The current platform ('JIRA' or 'CLARITY')
 */
export function addSpeechRecognitionToAllFields(platform) {
  if (!isSpeechRecognitionSupported()) {
    return;
  }
  
  const fieldConfig = CONFIG[platform].FIELDS;
  
  // Add to important fields first
  Object.values(fieldConfig).forEach(fieldInfo => {
    for (const selector of fieldInfo.selectors) {
      const fields = document.querySelectorAll(selector);
      
      fields.forEach(field => {
        // Skip if already has speech button
        if (field.parentElement.querySelector('.speech-recognition-container')) {
          return;
        }
        
        // Skip if too small
        if (field.offsetWidth < 100 || field.offsetHeight < 30) {
          return;
        }
        
        // Add button with smaller size for normal fields
        addSpeechRecognitionButton(field, {
          size: 28,
          offset: 8,
          showStatus: false
        });
      });
    }
  });
  
  // Find other potential editable fields
  const editableFields = document.querySelectorAll('textarea, [contenteditable="true"], [role="textbox"]');
  
  editableFields.forEach(field => {
    // Skip if already has speech button
    if (field.parentElement.querySelector('.speech-recognition-container')) {
      return;
    }
    
    // Skip if too small
    if (field.offsetWidth < 100 || field.offsetHeight < 30) {
      return;
    }
    
    // Add compact button
    addSpeechRecognitionButton(field, {
      size: 24,
      offset: 6,
      showStatus: false,
      buttonStyle: {
        opacity: '0.5'
      }
    });
  });
}
