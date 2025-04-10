# Jira AI Assistant Installation Guide

This guide provides step-by-step instructions for installing and distributing the Jira AI Assistant Chrome extension to your team.

## For Administrators

### Option 1: Packaging the Extension for Direct Installation

1. **Prepare the extension**:
   - Update the `content.js` file with your actual AI API endpoint:
     ```javascript
     const API_URL = 'https://your-actual-api-endpoint.com/generate';
     ```
   - Update the `manifest.json` file with your actual Jira URL pattern:
     ```json
     "matches": ["*://your-actual-jira-url.example.com/*"]
     ```
   - If using analytics, update the tracking ID and API secret in `content.js`:
     ```javascript
     const GA_TRACKING_ID = 'G-YOUR-ACTUAL-ID';
     ```

2. **Create extension icons**:
   - Create three icon files: `icon16.png` (16x16), `icon48.png` (48x48), and `icon128.png` (128x128)
   - Place them in the extension directory

3. **Pack the extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Pack extension"
   - Browse to your extension folder in "Extension root directory"
   - Leave "Private key file" empty for first-time packaging
   - Click "Pack Extension"
   - Chrome will create a `.crx` file and a `.pem` file in the parent directory
   - **IMPORTANT**: Save the `.pem` file securely for future updates

4. **Distribute to your team**:
   - Share the `.crx` file via internal file sharing
   - Provide the installation instructions (see below)

### Option 2: Enterprise Deployment via Group Policy (for IT Administrators)

1. **Create an update manifest XML file** named `update.xml`:
   ```xml
   <?xml version='1.0' encoding='UTF-8'?>
   <gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
     <app appid='[EXTENSION_ID]'>
       <updatecheck codebase='https://your-internal-server.com/jira-ai-assistant.crx' version='1.0' />
     </app>
   </gupdate>
   ```
   Replace `[EXTENSION_ID]` with your extension ID (found in `chrome://extensions/` after packing)

2. **Create a policy JSON file**:
   ```json
   {
     "ExtensionInstallForcelist": [
       "[EXTENSION_ID];https://your-internal-server.com/update.xml"
     ]
   }
   ```

3. **Host the files on your internal server**:
   - Host the `.crx` file and `update.xml` file on your company server
   - Ensure they're accessible to all team members

4. **Deploy using Group Policy**:
   - Use your organization's policy management system to distribute the policy JSON
   - For details on Chrome Enterprise deployment, see Google's documentation

## For Team Members

### Installation Instructions

1. **Download the extension**:
   - Download the `.crx` file from the shared location

2. **Install in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Drag and drop the `.crx` file onto the extensions page
   - Click "Add extension" when prompted

3. **Verify installation**:
   - Go to a Jira ticket page
   - Look for the ✨ button next to the description field
   - If you don't see it, refresh the page

### Usage Instructions

1. **Navigate to Jira** and create or edit a ticket
2. **Add a basic description** to your ticket
3. **Click the ✨ button** next to the description field
4. **Wait for the AI content** to be generated (you'll see a loading animation)
5. **Review the suggested content**:
   - Click "Edit" to modify the content
   - Click "Apply" to add it to your description
   - Click "Cancel" to discard the suggestion

## Troubleshooting

### Common Issues

- **Extension not appearing**: Make sure you're on a Jira ticket creation or edit page
- **Button not appearing**: Refresh the page; different Jira UI versions may need a refresh
- **API errors**: Contact your administrator to check the API endpoint configuration
- **Content not applying correctly**: Try editing the content first, then applying

### Support

If you encounter any issues with the Jira AI Assistant, please contact:
- Name: [Your Name]
- Email: [Your Email]
- Internal Chat: [Your Chat Handle]
