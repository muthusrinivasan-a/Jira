// config.js - Centralized configuration for the entire extension

export const CONFIG = {
  // API Configuration
  API: {
    URL: 'https://your-ai-api-endpoint.com/generate',
    HEADERS: {
      'Content-Type': 'application/json'
      // Add any additional headers here
    },
    RESPONSE_PATH: 'response.answer', // Path to extract response from API result
    EXPECTED_FORMAT: 'json', // Expected format: 'json' or 'text'
    TIMEOUT_MS: 30000 // Maximum allowed time for API calls
  },
  
  // Jira Configuration
  JIRA: {
    URL_PATTERNS: [
      'your-company-jira-url.atlassian.net' // Add multiple patterns if needed
    ],
    FIELDS: {
      ACCEPTANCE_CRITERIA: {
        id: 'acceptance-criteria',
        label: 'Acceptance Criteria',
        selectors: [
          '[data-test-id="issue.views.field.rich-text.acceptance-criteria"]',
          '#acceptance-criteria',
          '#customfield_10000', // Common ID for acceptance criteria
          '[data-field-id="customfield_10000"]',
          '[aria-label="Acceptance Criteria"]'
        ]
      },
      TEST_CASES: {
        id: 'test-cases',
        label: 'Test Cases',
        selectors: [
          '[data-test-id="issue.views.field.rich-text.test-cases"]',
          '#test-cases',
          '#customfield_10001',
          '[data-field-id="customfield_10001"]',
          '[aria-label="Test Cases"]'
        ]
      },
      TECHNICAL_DETAILS: {
        id: 'technical-details',
        label: 'Technical Details',
        selectors: [
          '[data-test-id="issue.views.field.rich-text.technical-details"]',
          '#technical-details',
          '#customfield_10002',
          '[data-field-id="customfield_10002"]',
          '[aria-label="Technical Details"]'
        ]
      },
      DEPENDENCIES: {
        id: 'dependencies',
        label: 'Dependencies',
        selectors: [
          '[data-test-id="issue.views.field.rich-text.dependencies"]',
          '#dependencies',
          '#customfield_10003',
          '[data-field-id="customfield_10003"]',
          '[aria-label="Dependencies"]'
        ]
      },
      SECURITY_RECOMMENDATIONS: {
        id: 'security-recommendations',
        label: 'Security Recommendations',
        selectors: [
          '[data-test-id="issue.views.field.rich-text.security-recommendations"]',
          '#security-recommendations',
          '#customfield_10004',
          '[data-field-id="customfield_10004"]',
          '[aria-label="Security Recommendations"]'
        ]
      },
      ESTIMATION: {
        id: 'estimation',
        label: 'Estimation',
        selectors: [
          '[data-test-id="issue.views.field.rich-text.estimation"]',
          '#estimation',
          '#customfield_10005',
          '[data-field-id="customfield_10005"]',
          '[aria-label="Estimation"]'
        ]
      },
      DESCRIPTION: {
        id: 'description',
        label: 'Description',
        selectors: [
          '[data-test-id="issue.views.field.rich-text.description"]',
          '#description',
          '[role="textbox"][aria-label="Description"]'
        ]
      }
    }
  },
  
  // Clarity Configuration
  CLARITY: {
    URL_PATTERNS: [
      'your-company-clarity-url.com' // Add multiple patterns if needed
    ],
    FIELDS: {
      ACCEPTANCE_CRITERIA: {
        id: 'acceptance-criteria',
        label: 'Acceptance Criteria',
        selectors: [
          '#acceptance-criteria',
          '[data-field-id="acceptance-criteria"]',
          '[name="acceptance-criteria"]',
          '[aria-label="Acceptance Criteria"]',
          '#customfield_acceptance_criteria'
        ]
      },
      EXPECTED_BENEFITS: {
        id: 'expected-benefits',
        label: 'Expected Benefits',
        selectors: [
          '#expected-benefits',
          '[data-field-id="expected-benefits"]',
          '[name="expected-benefits"]',
          '[aria-label="Expected Benefits"]',
          '#customfield_expected_benefits'
        ]
      },
      BUSINESS_OUTCOMES: {
        id: 'business-outcomes',
        label: 'Business Outcomes',
        selectors: [
          '#business-outcomes',
          '[data-field-id="business-outcomes"]',
          '[name="business-outcomes"]',
          '[aria-label="Business Outcomes"]',
          '#customfield_business_outcomes'
        ]
      },
      RISKS_CONSTRAINTS: {
        id: 'risks-constraints',
        label: 'Risks/Constraints',
        selectors: [
          '#risks-constraints',
          '[data-field-id="risks-constraints"]',
          '[name="risks-constraints"]',
          '[aria-label="Risks/Constraints"]',
          '#customfield_risks_constraints'
        ]
      },
      DESCRIPTION: {
        id: 'description',
        label: 'Description',
        selectors: [
          'textarea[name="description"]',
          '#description',
          '[aria-label="Description"]',
          'div.description',
          '.clarity-description'
        ]
      }
    }
  },
  
  // Analytics Configuration
  ANALYTICS: {
    ENABLED: false, // Set to true to enable Google Analytics
    TRACKING_ID: 'G-XXXXXXXXXX', // Your Google Analytics tracking ID
    API_SECRET: 'YOUR_API_SECRET' // Your Google Analytics API secret
  },
  
  // UI Configuration
  UI: {
    BUTTON_STYLES: {
      PRIMARY_COLOR: '#0052cc',
      PRIMARY_HOVER_COLOR: '#0065ff',
      CLARITY_PRIMARY_COLOR: '#0078D4',
      CLARITY_PRIMARY_HOVER_COLOR: '#106EBE'
    },
    ANIMATION: {
      SPARKLE_ENABLED: true,
      LOADING_ENABLED: true
    },
    TOAST_DURATION_MS: 3000 // Duration for notification toasts
  },
  
  // Writing Styles Configuration
  WRITING_STYLES: [
    { id: 'standard', label: 'Standard', description: 'Balanced detail and brevity' },
    { id: 'concise', label: 'Concise', emoji: '⚡', description: 'Brief and to the point' },
    { id: 'detailed', label: 'Detailed', emoji: '📝', description: 'Comprehensive with examples' },
    { id: 'creative', label: 'Creative', emoji: '🎨', description: 'Innovative approach' }
  ],
  
  // Speech Recognition Configuration
  SPEECH_RECOGNITION: {
    ENABLED: true,
    DEFAULT_LANGUAGE: 'en-US', // Language code for speech recognition
    CONTINUOUS: true, // Whether to continuously listen
    INTERIM_RESULTS: true // Whether to show interim results
  }
};
