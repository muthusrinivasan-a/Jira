# Bundling Instructions

This document provides instructions for bundling the Jira & Clarity AI Assistant extension for distribution.

## File Structure

Ensure your project has the following structure before bundling:

```
jira-clarity-ai-assistant/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── js/
│   ├── main.js
│   ├── apiService.js
│   ├── config.js
│   ├── contentGeneration.js
│   ├── fieldService.js
│   ├── jiraIntegration.js
│   ├── jiraUI.js
│   ├── clarityIntegration.js
│   ├── clarityUI.js
│   ├── platformService.js
│   ├── speechService.js
│   └── uiService.js
├── css/
│   └── styles.css
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── microphone.svg
└── LICENSE
```

## Creating manifest.json

Create a `manifest.json` file with the following content (adjust as needed):

```json
{
  "manifest_version": 3,
  "name": "Jira & Clarity AI Assistant",
  "version": "1.0.0",
  "description": "AI-powered assistant for Jira and Clarity that helps generate content and provides speech recognition",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "permissions": [
    "storage"
  ],
  "host_permissions": [
    "*://*.atlassian.net/*",
    "*://your-company-clarity-url.com/*"
  ],
  "content_scripts": [
    {
      "matches": [
        "*://*.atlassian.net/*",
        "*://your-company-clarity-url.com/*"
      ],
      "js": [
        "js/config.js",
        "js/apiService.js",
        "js/fieldService.js",
        "js/platformService.js",
        "js/uiService.js",
        "js/contentGeneration.js",
        "js/jiraUI.js",
        "js/clarityUI.js",
        "js/jiraIntegration.js",
        "js/clarityIntegration.js",
        "js/speechService.js",
        "js/main.js"
      ],
      "css": [
        "css/styles.css"
      ],
      "run_at": "document_idle"
    }
  ]
}
```

## Creating the Popup Interface

Create a simple popup UI for the extension:

1. Create `popup/popup.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Jira & Clarity AI Assistant</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="popup-container">
    <div class="header">
      <h1>AI Assistant</h1>
    </div>
    <div class="content">
      <p>AI Assistant is active on Jira and Clarity.</p>
      <div class="feature-list">
        <div class="feature">
          <span class="icon">✨</span>
          <span class="text">AI Content Generation</span>
        </div>
        <div class="feature">
          <span class="icon">🎤</span>
          <span class="text">Speech Recognition</span>
        </div>
      </div>
      <div class="settings">
        <h2>Settings</h2>
        <div class="setting-item">
          <label for="api-url">API URL:</label>
          <input type="text" id="api-url" placeholder="https://your-ai-api-endpoint.com/generate">
        </div>
        <div class="setting-item">
          <label for="speech-enabled">Speech Recognition:</label>
          <input type="checkbox" id="speech-enabled" checked>
        </div>
        <button id="save-settings">Save Settings</button>
      </div>
    </div>
    <div class="footer">
      <p>Version 1.0.0</p>
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

2. Create `popup/popup.css`:

```css
body {
  width: 350px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  margin: 0;
  padding: 0;
  color: #172B4D;
}

.popup-container {
  padding: 15px;
}

.header {
  border-bottom: 1px solid #ddd;
  margin-bottom: 15px;
}

.header h1 {
  font-size: 18px;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
}

.header h1:before {
  content: '✨';
  margin-right: 8px;
  font-size: 20px;
}

.content p {
  margin-bottom: 15px;
}

.feature-list {
  margin-bottom: 20px;
}

.feature {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.feature .icon {
  margin-right: 10px;
  font-size: 16px;
}

.settings {
  background-color: #f4f5f7;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 15px;
}

.settings h2 {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 10px;
}

.setting-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.setting-item label {
  flex: 0 0 130px;
}

.setting-item input[type="text"] {
  flex: 1;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

#save-settings {
  background-color: #0052cc;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 3px;
  cursor: pointer;
  margin-top: 5px;
}

#save-settings:hover {
  background-color: #0065ff;
}

.footer {
  margin-top: 15px;
  font-size: 12px;
  color: #6B778C;
  text-align: center;
  border-top: 1px solid #ddd;
  padding-top: 10px;
}
```

3. Create `popup/popup.js`:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // Load settings from storage
  chrome.storage.sync.get({
    apiUrl: 'https://your-ai-api-endpoint.com/generate',
    speechEnabled: true
  }, function(items) {
    document.getElementById('api-url').value = items.apiUrl;
    document.getElementById('speech-enabled').checked = items.speechEnabled;
  });
  
  // Save settings
  document.getElementById('save-settings').addEventListener('click', function() {
    const apiUrl = document.getElementById('api-url').value;
    const speechEnabled = document.getElementById('speech-enabled').checked;
    
    chrome.storage.sync.set({
      apiUrl: apiUrl,
      speechEnabled: speechEnabled
    }, function() {
      // Show saved message
      const button = document.getElementById('save-settings');
      const originalText = button.textContent;
      button.textContent = 'Saved!';
      button.style.backgroundColor = '#00875a';
      
      setTimeout(function() {
        button.textContent = originalText;
        button.style.backgroundColor = '#0052cc';
      }, 1500);
    });
  });
});
```

## CSS Styles

Create a `css/styles.css` file for content script CSS:

```css
/* Shared styles for the extension */
/* Most styles are added dynamically in uiService.js */

/* Additional styles for specific components */
.speech-recognition-container .pulse {
  animation: mic-pulse 2s infinite;
}

@keyframes mic-pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(101, 84, 192, 0.5); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(101, 84, 192, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(101, 84, 192, 0); }
}
```

## Bundling Process

### Option 1: Manual Bundling for Chrome

1. Ensure all files are in the correct directory structure
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select your extension directory
5. Test the extension to ensure it works correctly

### Option 2: Bundling for Enterprise Distribution

1. Create a zip file of all the extension files:

```bash
zip -r jira-clarity-ai-assistant.zip * -x "*.git*" -x "node_modules/*"
```

2. Distribute the zip file to users who can install it manually in Chrome using "Developer mode"

### Option 3: Preparing for Chrome Web Store

1. Create a ZIP file as in Option 2
2. Create promotional images:
   - Small tile (96x96)
   - Large tile (1280x800)
   - Marquee (1400x560)
3. Write a detailed description including features and permissions explanation
4. Submit to the Chrome Web Store following their guidelines

## Configuration for Enterprise Use

Before distributing, update the following in config.js:

1. Change API endpoint URLs to point to your organization's AI service
2. Update Jira and Clarity URL patterns to match your organization's instances
3. Adjust field selectors if your Jira or Clarity uses custom fields
4. Configure analytics settings if you want to track usage

## Testing Before Distribution

1. Test on both Jira and Clarity instances
2. Verify field detection works for different project types
3. Test speech recognition in different browsers
4. Verify that the extension works in private browsing mode
5. Check performance impact on page load time