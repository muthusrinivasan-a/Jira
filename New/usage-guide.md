# Jira & Clarity AI Assistant - User Guide

This guide explains how to use the AI Assistant extension for Jira and Clarity platforms.

## Getting Started

After installing the extension, navigate to any Jira issue or Clarity project page. The AI Assistant will automatically detect the platform and provide its features in the appropriate context.

## AI Content Generation

### Basic Usage

1. Navigate to a Jira issue or Clarity project
2. Find the "AI Assist" button in the top-right corner of editable fields
3. Click the button to see available writing styles
4. Select a writing style to generate content based on the existing field text

### Writing Styles

The AI Assistant provides several writing styles to match your documentation needs:

| Style | Description | Best for |
|-------|-------------|----------|
| Standard | Balanced detail and brevity | General purpose documentation |
| Concise | Brief and to the point | Quick summaries, bullet points |
| Detailed | Comprehensive with examples | Thorough specifications |
| Creative | Innovative approach | Brainstorming, alternative solutions |

### Editing Generated Content

After content is generated:

1. Review the suggestion displayed below the field
2. Click "Edit" to modify the content if needed
3. Make your changes in the provided editor
4. Click "Save" to apply your edits
5. Click "Apply" to insert the content into the appropriate fields
6. Click "Cancel" to dismiss the suggestion

### Jira-Specific Content

For Jira, the AI Assistant can generate content for:

- Acceptance Criteria
- Test Cases
- Technical Details
- Dependencies
- Security Recommendations
- Estimation

### Clarity-Specific Content

For Clarity, the AI Assistant can generate content for:

- Business Outcomes
- Expected Benefits
- Acceptance Criteria
- Risks/Constraints

### Generate All Sections (Clarity only)

In Clarity, you can generate content for all main sections at once:

1. Click the AI Assist button 
2. Select "Generate All Sections" from the dropdown
3. The extension will create a tabbed interface with content for each section
4. Review each tab and make edits as needed
5. Click "Apply All" to insert content into all fields at once

## Speech Recognition

### Dictating Content

1. Look for the microphone icon next to editable fields
2. Click the microphone to start recording
3. Speak clearly to dictate your content
4. Click the microphone again to stop recording
5. The transcribed text will be added to the current field content

### Speech Status Indicators

- Gray microphone: Inactive
- Red pulsing microphone: Actively recording
- Status text may appear below the microphone showing recognition progress

### Voice Commands

The speech recognition doesn't support specific commands, but you can use natural dictation including punctuation words like:

- "Period"
- "Comma"
- "Question mark"
- "New paragraph"

### Tips for Effective Dictation

- Speak clearly and at a moderate pace
- Use good microphone hardware when possible
- Dictate in a quiet environment
- Use short phrases instead of very long sentences
- Review and edit the transcribed text afterward

## Field Detection

The AI Assistant intelligently detects fields in both Jira and Clarity:

- It identifies standard fields based on their IDs, labels, and positions
- It can find custom fields if they follow naming conventions
- If it can't find a specific field, content is added to the Description

## Settings

You can adjust the extension settings by clicking the extension icon in your browser toolbar:

1. **API URL**: Change the AI service endpoint (for enterprise deployments)
2. **Speech Recognition**: Enable or disable speech recognition features

## Troubleshooting

### AI Content Generation

- **No "AI Assist" button**: The field may not be detected correctly. Try clicking into the field first.
- **Error generating content**: Check your internet connection and try again.
- **Content doesn't apply to fields**: The extension might not detect your custom fields. Contact your administrator.

### Speech Recognition

- **Microphone not working**: Check browser permissions for microphone access.
- **Poor transcription quality**: Try speaking more clearly or using a better microphone.
- **Speech button not appearing**: Make sure speech recognition is enabled in the extension settings.

### Platform Detection

- **Features not appearing in Jira/Clarity**: Your URL may not match the configured patterns. Contact your administrator.

## Advanced Features

### JSON Output

The AI can structure content as JSON for more precise field mapping:

1. Set `EXPECTED_FORMAT: 'json'` in the configuration
2. Generated content will be structured for specific fields
3. Content will be mapped to the correct fields when applied

### Field Mapping

The extension maps generated content to appropriate fields:

- Structured content is matched to corresponding fields
- If a specific field isn't found, content is appended to the Description
- Field mapping is configurable in `config.js`

## Privacy & Security

- All processing happens in your browser or