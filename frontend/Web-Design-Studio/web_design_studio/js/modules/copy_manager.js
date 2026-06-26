/**
 * CopyManager - Handles copy functionality for tab content
 */
class CopyManager {
    constructor(notificationManager) {
        this.notificationManager = notificationManager;
        this.init();
    }

    /**
     * Initialize copy functionality
     */
    init() {
        this.bindEvents();
    }

    /**
     * Bind copy button events
     */
    bindEvents() {
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyTabContent());
        }
    }

    /**
     * Update copy button text based on active tab
     * @param {string} tabName - Active tab name
     */
    updateCopyButtonText(tabName) {
        const copyBtn = document.getElementById('copyBtn');
        if (!copyBtn) return;

        const buttonConfig = {
            'tab1': { text: '📋', title: 'Copy HTML' },
            'tab2': { text: '📋', title: 'Copy CSS' },
            'tab3': { text: '📋', title: 'Copy content' }
        };

        const config = buttonConfig[tabName] || buttonConfig['tab1'];
        copyBtn.textContent = config.text;
        copyBtn.title = config.title;
    }

    /**
     * Copy the currently active tab content
     */
    async copyTabContent() {
        const activeTab = this.getActiveTabElement();
        const copyBtn = document.getElementById('copyBtn');

        if (!activeTab || !copyBtn) return;

        // Don't allow copying from the reference tab
        if (activeTab.id === 'tab3') {
            this.showTemporaryFeedback(copyBtn, '🚫', 'References cannot be copied');
            return;
        }

        const textToCopy = this.extractTextFromTab(activeTab);

        if (!textToCopy.trim()) {
            return; // No content to copy
        }

        try {
            await this.performCopy(textToCopy);
            this.showCopySuccess(copyBtn, activeTab.id);
        } catch (error) {
            this.showCopyError(copyBtn, activeTab.id);
            console.error('Copy failed:', error);
        }
    }

    /**
     * Get the currently active tab element
     * @returns {HTMLElement|null} Active tab element
     */
    getActiveTabElement() {
        return document.querySelector('.tab-content.active, .tab-content[style*="block"]');
    }

    /**
     * Extract text content from tab element
     * @param {HTMLElement} tabElement - Tab element
     * @returns {string} Extracted text
     */
    extractTextFromTab(tabElement) {
        const preElement = tabElement.querySelector('pre');
        const pElement = tabElement.querySelector('p');

        if (preElement) {
            let content = preElement.textContent || preElement.innerText;
            
            // Remove separator comments from copied content
            content = content.replace(/\/\* ===== .+ ===== \*\/\n*/g, '');
            // Clean up extra newlines
            content = content.replace(/\n{3,}/g, '\n\n');
            
            return content.trim();
        } else if (pElement) {
            return pElement.textContent || pElement.innerText;
        }

        return '';
    }

    /**
     * Perform the copy operation
     * @param {string} text - Text to copy
     */
    async performCopy(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            this.fallbackCopy(text);
        }
    }

    /**
     * Fallback copy method for older browsers
     * @param {string} text - Text to copy
     */
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (!successful) {
                throw new Error('Copy command failed');
            }
        } finally {
            document.body.removeChild(textArea);
        }
    }

    /**
     * Show copy success feedback
     * @param {HTMLElement} button - Copy button element
     * @param {string} tabId - Tab ID
     */
    showCopySuccess(button, tabId) {
        button.textContent = '✅';
        button.classList.add('copied');

        const tabType = tabId === 'tab1' ? 'HTML' : 'CSS';
        button.title = `${tabType} copied!`;

        setTimeout(() => {
            button.classList.remove('copied');
            this.updateCopyButtonText(tabId);
        }, 1500);
    }

    /**
     * Show copy error feedback
     * @param {HTMLElement} button - Copy button element
     * @param {string} tabId - Tab ID
     */
    showCopyError(button, tabId) {
        this.showTemporaryFeedback(button, '❌', 'Copy failed');

        setTimeout(() => {
            this.updateCopyButtonText(tabId);
        }, 1500);
    }

    /**
     * Show temporary feedback on button
     * @param {HTMLElement} button - Button element
     * @param {string} text - Text to show
     * @param {string} title - Title to show
     */
    showTemporaryFeedback(button, text, title) {
        const originalText = button.textContent;
        const originalTitle = button.title;

        button.textContent = text;
        button.title = title;

        setTimeout(() => {
            button.textContent = originalText;
            button.title = originalTitle;
        }, 1500);
    }
}

export default CopyManager;