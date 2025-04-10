# Jira AI Assistant Chrome Extension

A Chrome extension that adds AI-generated content to Jira tickets, including acceptance criteria, test cases, technical details, dependencies, security recommendations, and estimations.

## Features

- 🪄 Automatically appears next to Jira ticket description fields
- ✨ Animated golden sparkle icon for easy identification
- ⚡ Inline content generation with loading indicators
- 🔄 Edit, apply, or reject AI suggestions
- 📊 Google Analytics integration for usage tracking
- 🛡️ Security recommendations section
- 🧩 Works with multiple Jira UI versions

## Installation

### For Team Members

1. Download the `.crx` file from your team's distribution point
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Drag and drop the `.crx` file onto the extensions page

### For Developers (From Source)

1. Clone or download this repository
2. Update the configuration in `manifest.json` and `content.js` (see below)
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top-right corner
5. Click "Load unpacked" and select the extension folder

## Configuration

Before distribution, make sure to update:

1. In `manifest.json`:
   - Replace `"*://your-company-jira-url.atlassian.net/*"` with your Jira URL pattern

2. In `content.js`:
   - Replace `https://your-ai-api-endpoint.com/generate` with your actual AI service endpoint
   - Replace `G-XXXXXXXXXX` with your Google Analytics tracking ID (if using analytics)
   - Replace `YOUR_API_SECRET` with your Google Analytics API secret (if using analytics)

## How It Works

1. The extension automatically activates when you navigate to your Jira instance
2. A sparkle button (✨) appears next to the description field when creating/editing tickets
3. Click the button to generate AI-powered content based on your description
4. A loading skeleton appears while content is being generated
5. When ready, the suggestion appears with buttons to edit, apply, or cancel
6. If you apply, the content is added to your description field

## Analytics

This extension includes Google Analytics tracking to help understand usage patterns:

- **Page Loads**: Tracks when Jira ticket pages are loaded
- **Button Clicks**: Tracks when the AI Assist button is clicked
- **Content Generation**: Tracks when content is successfully generated
- **User Actions**: Tracks when users edit, apply, or cancel suggestions
- **Errors**: Tracks API errors for troubleshooting

## Development

### Project Structure

- `manifest.json` - Extension configuration
- `content.js` - Main extension logic
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons

### Build Process

To build the extension for distribution:

1. Make your changes to the source files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Pack extension"
5. Select your extension directory
6. Chrome will generate a `.crx` file and a `.pem` key file (keep this key safe!)

## Troubleshooting

- **Button doesn't appear**: Make sure your Jira URL pattern in `manifest.json` matches your actual Jira URL
- **API errors**: Check that your API endpoint is correctly configured and accessible
- **Content not applying**: Different Jira UI versions handle content differently; the extension tries multiple approaches

## License

[MIT License](LICENSE)
