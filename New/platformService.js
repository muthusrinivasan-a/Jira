// platformService.js - Platform detection and common functionality

import { CONFIG } from "./config.js";

/**
 * Detect which platform (Jira or Clarity) the user is currently on
 * @returns {string|null} The detected platform ('JIRA', 'CLARITY', or null if unknown)
 */
export function detectPlatform() {
  const currentUrl = window.location.href;

  // Check Jira URL patterns
  if (
    CONFIG.JIRA.URL_PATTERNS.some((pattern) => currentUrl.includes(pattern))
  ) {
    return "JIRA";
  }

  // Check Clarity URL patterns
  if (
    CONFIG.CLARITY.URL_PATTERNS.some((pattern) => currentUrl.includes(pattern))
  ) {
    return "CLARITY";
  }

  // If still not matched, try to detect by DOM elements
  if (detectJiraByDOM()) {
    return "JIRA";
  }

  if (detectClarityByDOM()) {
    return "CLARITY";
  }

  return null;
}

/**
 * Detect Jira by checking for Jira-specific DOM elements
 * @returns {boolean} Whether Jira was detected
 */
function detectJiraByDOM() {
  const jiraElements = [
    document.querySelector('meta[name="application-name"][content="JIRA"]'),
    document.querySelector("#jira"),
    document.querySelector(".jira-issue-content-container"),
    document.querySelector(
      '[data-test-id="issue.views.issue-base.foundation.summary.heading"]'
    ),
    document.querySelector(
      '[data-testid="issue.views.issue-base.foundation.summary.heading.wrapper"]'
    ),
  ];

  return jiraElements.some((el) => el !== null);
}

/**
 * Detect Clarity by checking for Clarity-specific DOM elements
 * @returns {boolean} Whether Clarity was detected
 */
function detectClarityByDOM() {
  const clarityElements = [
    document.querySelector(".clarity-header"),
    document.querySelector("[data-clarity-app]"),
    document.querySelector(".clarity-content"),
    document.querySelector(".clarity-main"),
    document.querySelector(".clarity-form"),
  ];

  return clarityElements.some((el) => el !== null);
}

/**
 * Get platform-specific configuration
 * @param {string} platform - The platform name ('JIRA' or 'CLARITY')
 * @returns {Object} The platform config
 */
export function getPlatformConfig(platform) {
  return CONFIG[platform] || null;
}

/**
 * Find main content container for the current platform
 * @param {string} platform - The platform name ('JIRA' or 'CLARITY')
 * @returns {Element|null} The main content container
 */
export function findMainContentContainer(platform) {
  if (platform === "JIRA") {
    // Try to find Jira main content container
    return (
      document.querySelector("#issue-content") ||
      document.querySelector(".issue-view") ||
      document.querySelector(".issue-container") ||
      document.querySelector("#issue-navigator")
    );
  } else if (platform === "CLARITY") {
    // Try to find Clarity main content container
    return (
      document.querySelector(".clarity-content") ||
      document.querySelector(".clarity-main") ||
      document.querySelector(".clarity-form") ||
      document.querySelector("form") ||
      document.querySelector(".detail-view") ||
      document.querySelector(".edit-view")
    );
  }

  return null;
}

/**
 * Get platform-specific UI styles
 * @param {string} platform - The platform name ('JIRA' or 'CLARITY')
 * @returns {Object} UI style values
 */
export function getPlatformStyles(platform) {
  if (platform === "JIRA") {
    return {
      primaryColor: CONFIG.UI.BUTTON_STYLES.PRIMARY_COLOR,
      primaryHoverColor: CONFIG.UI.BUTTON_STYLES.PRIMARY_HOVER_COLOR,
      borderRadius: "3px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    };
  } else if (platform === "CLARITY") {
    return {
      primaryColor: CONFIG.UI.BUTTON_STYLES.CLARITY_PRIMARY_COLOR,
      primaryHoverColor: CONFIG.UI.BUTTON_STYLES.CLARITY_PRIMARY_HOVER_COLOR,
      borderRadius: "4px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    };
  }

  // Default styles
  return {
    primaryColor: "#0052cc",
    primaryHoverColor: "#0065ff",
    borderRadius: "3px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  };
}

/**
 * Returns platform-specific element selectors
 * @param {string} elementType - Type of element to find selectors for
 * @param {string} platform - Platform name ('JIRA' or 'CLARITY')
 * @returns {Array} Array of selectors to try
 */
export function getPlatformSelectors(elementType, platform) {
  const selectors = {
    JIRA: {
      descriptionField: [
        '[data-test-id="issue.views.field.rich-text.description"]',
        "#description",
        '[role="textbox"][aria-label="Description"]',
      ],
      titleField: [
        '[data-test-id="issue.views.issue-base.foundation.summary.heading"]',
        "#summary",
        'input[name="summary"]',
      ],
      form: ['form[name="jiraform"]', "#issue-create", "#issue-edit"],
    },
    CLARITY: {
      descriptionField: [
        'textarea[name="description"]',
        "#description",
        '[aria-label="Description"]',
        "div.description",
        ".clarity-description",
      ],
      titleField: [
        "h1.clarity-title",
        ".clarity-title",
        'input[name="title"]',
        "#title",
        'input[placeholder*="title" i]',
      ],
      form: ["form", ".clarity-form", ".edit-view"],
    },
  };

  return selectors[platform]?.[elementType] || [];
}

/**
 * Find a specific UI element based on platform
 * @param {string} elementType - Type of element to find
 * @param {string} platform - Platform name ('JIRA' or 'CLARITY')
 * @returns {Element|null} The found element or null
 */
export function findPlatformElement(elementType, platform) {
  const selectors = getPlatformSelectors(elementType, platform);

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }

  return null;
}
