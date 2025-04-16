// apiService.js - Centralized API service for all platforms

import { CONFIG } from './config.js';

/**
 * Call the AI service with the provided parameters
 * @param {Object} params - The parameters for the API call
 * @param {string} params.prompt - The prompt to send to the API
 * @param {string} [params.styleOption='standard'] - The writing style to use
 * @param {Object} [params.selectedFields] - Fields to generate content for
 * @param {Function} callback - Callback function for the response
 */
export function callAIService(params, callback) {
  const { prompt, styleOption = 'standard', selectedFields = null } = params;
  
  // Base prompt text
  let promptText = prompt;

  // Add style instruction based on selected style
  switch (styleOption) {
    case 'concise':
      promptText += `\n\nWrite in a concise, efficient style. Be brief and to the point. Use short sentences and minimal examples. Focus on the most essential information.`;
      break;
    case 'detailed':
      promptText += `\n\nWrite in a detailed, thorough style. Include comprehensive examples and context. Explain reasoning where helpful. Don't sacrifice clarity for brevity.`;
      break;
    case 'creative':
      promptText += `\n\nWrite in a creative, innovative style. Think outside the box and suggest unique approaches. Use engaging language and provide fresh perspectives on solving the problem.`;
      break;
    default:
      promptText += `\n\nWrite in a clear, professional style that balances detail and brevity.`;
  }
  
  // Request JSON format
  if (CONFIG.API.EXPECTED_FORMAT === 'json') {
    promptText += `\n\nYour response MUST be in valid JSON format with this specific structure:
{
  "acceptanceCriteria": [
    "Criterion 1...",
    "Criterion 2...",
    "..."
  ],
  "testCases": [
    "Test case 1...",
    "Test case 2...",
    "..."
  ],
  "technicalDetails": "Technical implementation details here...",
  "dependencies": "Dependencies information here...",
  "securityRecommendations": "Security recommendations here...",
  "estimation": "Estimation details here..."
}

Be extremely careful to escape any quotes properly and ensure the JSON is valid. Do not include any markdown formatting or text outside of the JSON structure.`;
  }
  
  // Add a timeout to handle cases where the API doesn't respond
  const timeoutId = setTimeout(() => {
    callback(null, 'API request timed out. Please try again.');
  }, CONFIG.API.TIMEOUT_MS);
  
  // Call the API
  fetch(CONFIG.API.URL, {
    method: 'POST',
    headers: CONFIG.API.HEADERS,
    body: JSON.stringify({ prompt: promptText })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    // Clear the timeout since we got a response
    clearTimeout(timeoutId);
    
    // Process the response
    processApiResponse(data, callback);
  })
  .catch(error => {
    // Clear the timeout since we got an error
    clearTimeout(timeoutId);
    
    console.error('API call failed:', error);
    callback(null, `Error: ${error.message}`);
  });
}

/**
 * Process the API response and extract the content
 * @param {Object} data - The raw API response
 * @param {Function} callback - Callback function
 */
function processApiResponse(data, callback) {
  try {
    // Get the response path from config (e.g., 'response.answer')
    const responsePath = CONFIG.API.RESPONSE_PATH.split('.');
    
    // Extract the content using the response path
    let content = data;
    for (const pathPart of responsePath) {
      if (content && typeof content === 'object' && pathPart in content) {
        content = content[pathPart];
      } else {
        // If path doesn't exist, try to find common response formats
        content = findContentInResponse(data);
        break;
      }
    }
    
    // If we expect JSON, try to parse it or extract it
    if (CONFIG.API.EXPECTED_FORMAT === 'json') {
      const jsonData = extractJsonFromContent(content);
      if (jsonData) {
        callback(jsonData, null, true); // true indicates JSON data
        return;
      }
    }
    
    // If we got here, either we don't want JSON or couldn't extract it
    // Clean up the content and return as text
    const cleanedContent = cleanMarkdownFormatting(content);
    callback(cleanedContent);
  } catch (error) {
    console.error('Error processing API response:', error);
    callback(null, `Error processing response: ${error.message}`);
  }
}

/**
 * Find content in various standard response formats
 * @param {Object} response - The API response object
 * @returns {string} The extracted content
 */
function findContentInResponse(response) {
  if (response.output) return response.output;
  if (response.text) return response.text;
  if (response.content) return response.content;
  if (response.result) return response.result;
  if (response.answer) return response.answer;
  if (response.generated_text) return response.generated_text;
  if (response.choices && response.choices[0]) {
    const choice = response.choices[0];
    if (choice.message && choice.message.content) return choice.message.content;
    if (choice.text) return choice.text;
  }
  
  // If we can't find a known format, return the stringified response
  return JSON.stringify(response);
}

/**
 * Extract JSON from content that might be wrapped in markdown code blocks
 * @param {string} content - The content that might contain JSON
 * @returns {Object|null} The parsed JSON object or null if parsing failed
 */
function extractJsonFromContent(content) {
  if (typeof content !== 'string') {
    // Try to directly use it if it's already an object
    if (typeof content === 'object' && content !== null) {
      return content;
    }
    return null;
  }
  
  try {
    // First, try direct JSON parsing
    return JSON.parse(content);
  } catch (e) {
    try {
      // Check for JSON in code blocks
      const jsonMatch = content.match(/```(?:json)?([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim());
      }
      
      // Look for JSON without code blocks
      const possibleJson = content.match(/(\{[\s\S]*\})/);
      if (possibleJson && possibleJson[1]) {
        return JSON.parse(possibleJson[1].trim());
      }
    } catch (innerError) {
      console.error('Error extracting JSON from content:', innerError);
    }
  }
  
  return null;
}

/**
 * Clean up markdown formatting in text
 * @param {string} text - The text to clean
 * @returns {string} The cleaned text
 */
function cleanMarkdownFormatting(text) {
  if (typeof text !== 'string') {
    return String(text);
  }
  
  // Replace markdown headers
  text = text.replace(/#{2,6}\s+(.+?)(\n|$)/g, (match, title) => `## ${title}\n`);
  
  // Replace markdown horizontal rules
  text = text.replace(/^\s*(---|\*\*\*)\s*$/gm, '\n');
  
  // Replace markdown list items with standard bullet points
  text = text.replace(/^\s*[\-\*]\s+(.+?)$/gm, '• $1');
  
  return text;
}
