// uiService.js - Common UI elements and functions

import { CONFIG } from './config.js';
import { getPlatformStyles } from './platformService.js';

/**
 * Add common styles used by the extension
 * @param {string} platform - The current platform ('JIRA' or 'CLARITY')
 */
export function addCommonStyles(platform) {
  if (document.getElementById('ai-assistant-common-styles')) {
    return;
  }
  
  const platformStyles = getPlatformStyles(platform);
  
  const styleElement = document.createElement('style');
  styleElement.id = 'ai-assistant-common-styles';
  styleElement.textContent = `
    /* Button & animation styles */
    @keyframes sparkleAnimation {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .sparkle {
      display: inline-block;
      color: gold;
      text-shadow: 0 0 5px rgba(255, 215, 0, 0.7);
      animation: sparkleAnimation 1.5s infinite;
    }
    
    .ai-assistant-btn:hover .sparkle {
      animation-duration: 0.8s;
    }
    
    /* Loading animation */
    @keyframes skeletonLoading {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    
    .skeleton-loading {
      position: relative;
      overflow: hidden;
      background: #f0f0f0;
      border-radius: 4px;
    }
    
    .skeleton-loading::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #f0f0f0, #e0e0e0, #f0f0f0);
      background-size: 200px 100%;
      animation: skeletonLoading 1.5s infinite;
    }
    
    /* Shared UI components */
    .ai-assistant-container {
      font-family: ${platformStyles.fontFamily};
      color: #172B4D;
      line-height: 1.5;
    }
    
    .ai-assistant-btn {
      border: none;
      border-radius: ${platformStyles.borderRadius};
      cursor: pointer;
      font-family: ${platformStyles.fontFamily};
      transition: background-color 0.2s ease;
    }
    
    .ai-assistant-btn.primary {
      background-color: ${platformStyles.primaryColor};
      color: white;
    }
    
    .ai-assistant-btn.primary:hover {
      background-color: ${platformStyles.primaryHoverColor};
    }
    
    .ai-assistant-btn.secondary {
      background-color: #f4f5f7;
      border: 1px solid #ddd;
      color: #172B4D;
    }
    
    .ai-assistant-btn.secondary:hover {
      background-color: #e9ecef;
    }
    
    .ai-assistant-btn.danger {
      background-color: #de350b;
      color: white;
    }
    
    .ai-assistant-btn.danger:hover {
      background-color: #bf2600;
    }
    
    /* AI suggestions styling */
    .ai-suggestion {
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: ${platformStyles.borderRadius};
      overflow: hidden;
      font-family: ${platformStyles.fontFamily};
    }
    
    .ai-suggestion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: #f4f5f7;
      border-bottom: 1px solid #ddd;
    }
    
    .ai-suggestion-title {
      font-weight: bold;
      color: ${platformStyles.primaryColor};
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .ai-suggestion-actions {
      display: flex;
      gap: 5px;
    }
    
    .ai-suggestion-content {
      padding: 10px;
      background-color: white;
    }
    
    .ai-edit-area {
      width: 100%;
      min-height: 100px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-family: inherit;
      font-size: inherit;
      resize: vertical;
    }
    
    /* Dropdown styles */
    .ai-dropdown {
      position: relative;
      display: inline-block;
    }
    
    .ai-dropdown-content {
      display: none;
      position: absolute;
      right: 0;
      background-color: white;
      min-width: 220px;
      box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
      z-index: 1001;
      border-radius: ${platformStyles.borderRadius};
      border: 1px solid #ddd;
    }
    
    .ai-dropdown-content.show {
      display: block;
    }
    
    .ai-dropdown-item {
      padding: 8px 12px;
      display: block;
      cursor: pointer;
      color: #172B4D;
      font-size: 14px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .ai-dropdown-item:hover {
      background-color: #f4f5f7;
    }
    
    .ai-dropdown-item:last-child {
      border-bottom: none;
    }
    
    /* Writing style tags */
    .writing-style-tag {
      margin-left: 8px;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: capitalize;
      font-weight: normal;
      color: white;
    }
    
    .writing-style-tag.concise {
      background-color: #00875A;
    }
    
    .writing-style-tag.detailed {
      background-color: #0052CC;
    }
    
    .writing-style-tag.creative {
      background-color: #6554C0;
    }
  `;
  
  document.head.appendChild(styleElement);
}

/**
 * Show a notification toast message
 * @param {string} message - The message to display
 * @param {boolean} isSuccess - Whether this is a success message
 * @param {number} duration - How long to show the message (ms)
 */
export function showNotification(message, isSuccess = true, duration = CONFIG.UI.TOAST_DURATION_MS) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 15px;
    border-radius: 4px;
    color: white;
    background-color: ${isSuccess ? '#00875a' : '#de350b'};
    z-index: 10000;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-10px)';
      notification.style.transition = 'opacity 0.3s, transform 0.3s';
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, duration);
}

/**
 * Create a button with standard styling
 * @param {Object} options - Button options
 * @returns {HTMLButtonElement} The created button
 */
export function createButton(options = {}) {
  const defaults = {
    text: 'Button',
    type: 'primary', // 'primary', 'secondary', 'danger'
    icon: null,
    onClick: null,
    className: '',
    style: {}
  };
  
  const mergedOptions = { ...defaults, ...options };
  
  const button = document.createElement('button');
  button.className = `ai-assistant-btn ${mergedOptions.type} ${mergedOptions.className}`;
  button.type = 'button'; // Prevent form submission
  
  // Add icon if provided
  if (mergedOptions.icon) {
    const iconSpan = document.createElement('span');
    iconSpan.innerHTML = mergedOptions.icon;
    iconSpan.style.marginRight = '5px';
    button.appendChild(iconSpan);
  }
  
  // Add text
  button.appendChild(document.createTextNode(mergedOptions.text));
  
  // Add custom styles
  Object.entries(mergedOptions.style).forEach(([property, value]) => {
    button.style[property] = value;
  });
  
  // Add click handler
  if (typeof mergedOptions.onClick === 'function') {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      mergedOptions.onClick(e);
    });
  }
  
  return button;
}

/**
 * Create a dropdown menu
 * @param {Element} triggerElement - The element that triggers the dropdown
 * @param {Object[]} items - Array of dropdown items
 * @param {Object} options - Dropdown options
 * @returns {Object} Dropdown elements and functions
 */
export function createDropdown(triggerElement, items, options = {}) {
  const defaults = {
    position: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
    width: 220,
    zIndex: 1001,
    className: '',
    closeOnItemClick: true
  };
  
  const mergedOptions = { ...defaults, ...options };
  
  // Create dropdown container
  const dropdownContainer = document.createElement('div');
  dropdownContainer.className = `ai-dropdown ${mergedOptions.className}`;
  
  // Create dropdown content
  const dropdownContent = document.createElement('div');
  dropdownContent.className = 'ai-dropdown-content';
  dropdownContent.style.minWidth = `${mergedOptions.width}px`;
  dropdownContent.style.zIndex = mergedOptions.zIndex;
  
  // Add position-specific styles
  switch (mergedOptions.position) {
    case 'bottom-left':
      dropdownContent.style.left = '0';
      dropdownContent.style.top = '100%';
      dropdownContent.style.marginTop = '5px';
      break;
    case 'top-right':
      dropdownContent.style.right = '0';
      dropdownContent.style.bottom = '100%';
      dropdownContent.style.marginBottom = '5px';
      break;
    case 'top-left':
      dropdownContent.style.left = '0';
      dropdownContent.style.bottom = '100%';
      dropdownContent.style.marginBottom = '5px';
      break;
    default: // bottom-right
      dropdownContent.style.right = '0';
      dropdownContent.style.top = '100%';
      dropdownContent.style.marginTop = '5px';
      break;
  }
  
  // Add items to dropdown
  items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'ai-dropdown-item';
    
    if (item.html) {
      itemElement.innerHTML = item.html;
    } else {
      itemElement.textContent = item.text || '';
    }
    
    if (item.style) {
      Object.entries(item.style).forEach(([property, value]) => {
        itemElement.style[property] = value;
      });
    }
    
    if (typeof item.onClick === 'function') {
      itemElement.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        item.onClick(e);
        
        if (mergedOptions.closeOnItemClick) {
          hideDropdown();
        }
      });
    }
    
    dropdownContent.appendChild(itemElement);
  });
  
  // Add event handling
  let isOpen = false;
  
  function toggleDropdown(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    isOpen = !isOpen;
    
    if (isOpen) {
      dropdownContent.classList.add('show');
    } else {
      dropdownContent.classList.remove('show');
    }
  }
  
  function showDropdown() {
    isOpen = true;
    dropdownContent.classList.add('show');
  }
  
  function hideDropdown() {
    isOpen = false;
    dropdownContent.classList.remove('show');
  }
  
  // Set up event listeners
  triggerElement.addEventListener('click', toggleDropdown);
  
  // Close when clicking outside
  document.addEventListener('click', function(e) {
    if (isOpen && !dropdownContainer.contains(e.target)) {
      hideDropdown();
    }
  });
  
  // Assemble dropdown
  dropdownContainer.appendChild(dropdownContent);
  
  // Insert after trigger element
  if (triggerElement.parentNode) {
    // If trigger is already in a dropdown container, insert content only
    if (triggerElement.parentNode.classList.contains('ai-dropdown')) {
      triggerElement.parentNode.appendChild(dropdownContent);
      return { 
        container: triggerElement.parentNode, 
        content: dropdownContent,
        toggle: toggleDropdown,
        show: showDropdown,
        hide: hideDropdown,
        isOpen: () => isOpen
      };
    }
    
    triggerElement.parentNode.insertBefore(dropdownContainer, triggerElement.nextSibling);
    // Move trigger inside dropdown container
    dropdownContainer.insertBefore(triggerElement, dropdownContent);
  }
  
  return { 
    container: dropdownContainer, 
    content: dropdownContent,
    toggle: toggleDropdown,
    show: showDropdown,
    hide: hideDropdown,
    isOpen: () => isOpen
  };
}

/**
 * Create a loading skeleton UI
 * @param {Object} options - Skeleton options
 * @returns {HTMLElement} The skeleton container
 */
export function createLoadingSkeleton(options = {}) {
  const defaults = {
    lines: 10,
    container: document.createElement('div'),
    minWidth: 50,
    maxWidth: 100,
    height: 16,
    spacing: 8
  };
  
  const mergedOptions = { ...defaults, ...options };
  const container = mergedOptions.container;
  container.className = 'skeleton-container';
  
  for (let i = 0; i < mergedOptions.lines; i++) {
    const line = document.createElement('div');
    line.className = 'skeleton-loading';
    line.style.height = `${mergedOptions.height}px`;
    line.style.marginBottom = `${mergedOptions.spacing}px`;
    
    // Random width for more natural look
    const width = Math.floor(Math.random() * 
      (mergedOptions.maxWidth - mergedOptions.minWidth + 1)) + mergedOptions.minWidth;
    line.style.width = `${width}%`;
    
    container.appendChild(line);
  }
  
  return container;
}

/**
 * Create a modal dialog
 * @param {Object} options - Modal options
 * @returns {Object} Modal elements and functions
 */
export function createModal(options = {}) {
  const defaults = {
    title: 'Modal Title',
    content: '',
    width: '80%',
    maxWidth: '600px',
    buttons: [
      { text: 'Cancel', type: 'secondary', onClick: () => modal.close() },
      { text: 'OK', type: 'primary', onClick: () => modal.close() }
    ],
    onClose: null,
    closeOnEscape: true,
    closeOnClickOutside: true,
    showCloseButton: true
  };
  
  const mergedOptions = { ...defaults, ...options };
  
  // Create modal backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'ai-modal-backdrop';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;
  
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'ai-modal-container';
  modalContainer.style.cssText = `
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
    width: ${mergedOptions.width};
    max-width: ${mergedOptions.maxWidth};
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;
  
  // Create header
  const header = document.createElement('div');
  header.className = 'ai-modal-header';
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #e9ecef;
  `;
  
  const title = document.createElement('h3');
  title.className = 'ai-modal-title';
  title.textContent = mergedOptions.title;
  title.style.cssText = `
    margin: 0;
    font-size: 18px;
    font-weight: 500;
  `;
  
  header.appendChild(title);
  
  // Add close button if enabled
  if (mergedOptions.showCloseButton) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ai-modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
      border: none;
      background: transparent;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    `;
    closeBtn.addEventListener('click', () => modal.close());
    header.appendChild(closeBtn);
  }
  
  // Create body
  const body = document.createElement('div');
  body.className = 'ai-modal-body';
  body.style.cssText = `
    padding: 15px;
    overflow-y: auto;
    max-height: calc(90vh - 120px);
  `;
  
  // Add content
  if (typeof mergedOptions.content === 'string') {
    body.innerHTML = mergedOptions.content;
  } else if (mergedOptions.content instanceof Element) {
    body.appendChild(mergedOptions.content);
  }
  
  // Create footer
  const footer = document.createElement('div');
  footer.className = 'ai-modal-footer';
  footer.style.cssText = `
    padding: 10px 15px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  `;
  
  // Add buttons
  mergedOptions.buttons.forEach(buttonOptions => {
    const button = createButton(buttonOptions);
    footer.appendChild(button);
  });
  
  // Assemble modal
  modalContainer.appendChild(header);
  modalContainer.appendChild(body);
  modalContainer.appendChild(footer);
  backdrop.appendChild(modalContainer);
  
  // Click outside to close
  if (mergedOptions.closeOnClickOutside) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        modal.close();
      }
    });
  }
  
  // ESC key to close
  let keyHandler;
  if (mergedOptions.closeOnEscape) {
    keyHandler = (e) => {
      if (e.key === 'Escape') {
        modal.close();
      }
    };
    document.addEventListener('keydown', keyHandler);
  }
  
  // Modal object
  const modal = {
    backdrop,
    container: modalContainer,
    header,
    body,
    footer,
    
    open: () => {
      document.body.appendChild(backdrop);
      // Prevent scrolling of the body
      document.body.style.overflow = 'hidden';
      return modal;
    },
    
    close: () => {
      if (document.body.contains(backdrop)) {
        document.body.removeChild(backdrop);
        // Restore scrolling
        document.body.style.overflow = '';
        
        // Call onClose callback if provided
        if (typeof mergedOptions.onClose === 'function') {
          mergedOptions.onClose();
        }
        
        // Remove ESC key handler
        if (keyHandler) {
          document.removeEventListener('keydown', keyHandler);
        }
      }
      return modal;
    },
    
    setTitle: (newTitle) => {
      title.textContent = newTitle;
      return modal;
    },
    
    setContent: (newContent) => {
      body.innerHTML = '';
      if (typeof newContent === 'string') {
        body.innerHTML = newContent;
      } else if (newContent instanceof Element) {
        body.appendChild(newContent);
      }
      return modal;
    },
    
    addButton: (buttonOptions) => {
      const button = createButton(buttonOptions);
      footer.appendChild(button);
      return modal;
    }
  };
  
  return modal;
}

/**
 * Create a tab interface
 * @param {Object} options - Tab options
 * @returns {Object} Tab elements and functions
 */
export function createTabs(options = {}) {
  const defaults = {
    container: document.createElement('div'),
    tabs: [], // Array of { id, label, content, active }
    onTabChange: null
  };
  
  const mergedOptions = { ...defaults, ...options };
  const container = mergedOptions.container;
  container.className = 'ai-tabs-container';
  
  // Create tabs header
  const tabsHeader = document.createElement('div');
  tabsHeader.className = 'ai-tabs-header';
  tabsHeader.style.cssText = `
    display: flex;
    border-bottom: 1px solid #ddd;
  `;
  
  // Create tabs content
  const tabsContent = document.createElement('div');
  tabsContent.className = 'ai-tabs-content';
  
  // Tab elements by id for easy access
  const tabElements = {};
  const contentElements = {};
  
  // Create all tabs and content
  mergedOptions.tabs.forEach(tab => {
    // Create tab
    const tabEl = document.createElement('div');
    tabEl.className = 'ai-tab';
    tabEl.dataset.tabId = tab.id;
    tabEl.textContent = tab.label;
    tabEl.style.cssText = `
      padding: 10px 15px;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
    `;
    
    // Create content panel
    const contentEl = document.createElement('div');
    contentEl.className = 'ai-tab-content';
    contentEl.dataset.tabId = tab.id;
    contentEl.style.cssText = `
      display: none;
      padding: 15px;
    `;
    
    // Set content
    if (typeof tab.content === 'string') {
      contentEl.innerHTML = tab.content;
    } else if (tab.content instanceof Element) {
      contentEl.appendChild(tab.content);
    }
    
    // Add to containers
    tabsHeader.appendChild(tabEl);
    tabsContent.appendChild(contentEl);
    
    // Store references
    tabElements[tab.id] = tabEl;
    contentElements[tab.id] = contentEl;
    
    // Set active if specified
    if (tab.active) {
      activateTab(tab.id);
    }
    
    // Click handler
    tabEl.addEventListener('click', () => {
      activateTab(tab.id);
    });
  });
  
  // Assemble tabs
  container.appendChild(tabsHeader);
  container.appendChild(tabsContent);
  
  // Function to activate a tab
  function activateTab(tabId) {
    // Deactivate all tabs
    Object.values(tabElements).forEach(tab => {
      tab.style.borderBottomColor = 'transparent';
      tab.style.color = '#6B778C';
    });
    
    Object.values(contentElements).forEach(content => {
      content.style.display = 'none';
    });
    
    // Activate the selected tab
    if (tabElements[tabId]) {
      tabElements[tabId].style.borderBottomColor = '#0052CC';
      tabElements[tabId].style.color = '#0052CC';
    }
    
    if (contentElements[tabId]) {
      contentElements[tabId].style.display = 'block';
    }
    
    // Call onTabChange callback if provided
    if (typeof mergedOptions.onTabChange === 'function') {
      mergedOptions.onTabChange(tabId);
    }
  }
  
  // Public interface
  return {
    container,
    header: tabsHeader,
    content: tabsContent,
    activateTab,
    getTabElement: (tabId) => tabElements[tabId],
    getContentElement: (tabId) => contentElements[tabId],
    
    addTab: (tab) => {
      // Create tab
      const tabEl = document.createElement('div');
      tabEl.className = 'ai-tab';
      tabEl.dataset.tabId = tab.id;
      tabEl.textContent = tab.label;
      tabEl.style.cssText = `
        padding: 10px 15px;
        cursor: pointer;
        border-bottom: 3px solid transparent;
        transition: all 0.2s;
      `;
      
      // Create content panel
      const contentEl = document.createElement('div');
      contentEl.className = 'ai-tab-content';
      contentEl.dataset.tabId = tab.id;
      contentEl.style.cssText = `
        display: none;
        padding: 15px;
      `;
      
      // Set content
      if (typeof tab.content === 'string') {
        contentEl.innerHTML = tab.content;
      } else if (tab.content instanceof Element) {
        contentEl.appendChild(tab.content);
      }
      
      // Add to containers
      tabsHeader.appendChild(tabEl);
      tabsContent.appendChild(contentEl);
      
      // Store references
      tabElements[tab.id] = tabEl;
      contentElements[tab.id] = contentEl;
      
      // Click handler
      tabEl.addEventListener('click', () => {
        activateTab(tab.id);
      });
      
      // Activate if specified
      if (tab.active) {
        activateTab(tab.id);
      }
      
      return { tab: tabEl, content: contentEl };
    },
    
    removeTab: (tabId) => {
      if (tabElements[tabId]) {
        tabsHeader.removeChild(tabElements[tabId]);
        delete tabElements[tabId];
      }
      
      if (contentElements[tabId]) {
        tabsContent.removeChild(contentElements[tabId]);
        delete contentElements[tabId];
      }
    }
  };
}