/**
 * HistoryManager - Handles undo/redo functionality
 */
class HistoryManager {
    constructor(canvasManager, notificationManager) {
        this.canvasManager = canvasManager;
        this.notificationManager = notificationManager;
        this.history = [];
        this.redoStack = [];
        this.maxHistorySize = 50;
        this.init();
    }

    /**
     * Initialize history manager
     */
    init() {
        this.bindEvents();
    }

    /**
     * Bind history-related events
     */
    bindEvents() {
        const undoButton = document.getElementById('undo');
        if (undoButton) {
            undoButton.addEventListener('click', () => this.undo());
        }

        const redoButton = document.getElementById('redo');
        if (redoButton) {
            redoButton.addEventListener('click', () => this.redo());
        }

        // Add keyboard shortcuts for undo (Ctrl+Z) and redo (Ctrl+Y or Ctrl+Shift+Z)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            } else if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.redo();
            }
        });
    }

    /**
     * Save current state to history
     */
    saveState() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;

        const state = {
            canvasContent: canvas.innerHTML,
            tab1Content: this.getTabContent('tab1'),
            tab2Content: this.getTabContent('tab2'),
            tab3Content: this.getTabContent('tab3'),
            tab4Structure: this.getTabStructure('tab4'),
            timestamp: Date.now()
        };

        this.history.push(state);

        // Clear redo stack when a new action is performed
        this.redoStack = [];

        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }

        this.updateButtons();
    }

    /**
     * Get content from a tab
     * @param {string} tabId - Tab ID
     * @returns {string} Tab content
     */
    getTabContent(tabId) {
        const tab = document.getElementById(tabId);
        if (!tab) return '';

        const preElement = tab.querySelector('pre');
        const pElement = tab.querySelector('p');

        if (preElement) {
            return preElement.textContent;
        } else if (pElement) {
            return pElement.textContent;
        }

        return '';
    }

    /**
     * Get the full HTML structure of a tab (for references tab)
     * @param {string} tabId - Tab ID
     * @returns {string} Tab HTML structure
     */
    getTabStructure(tabId) {
        const tab = document.getElementById(tabId);
        if (!tab) return '';

        const divElement = tab.querySelector('div');
        if (divElement) {
            return divElement.innerHTML;
        }

        return '';
    }

    /**
     * Set content to a tab
     * @param {string} tabId - Tab ID
     * @param {string} content - Content to set
     */
    setTabContent(tabId, content) {
        const tab = document.getElementById(tabId);
        if (!tab) return;

        const preElement = tab.querySelector('pre');
        const pElement = tab.querySelector('p');

        if (preElement) {
            preElement.textContent = content;
            // Update visibility after setting content
            this.updatePreElementVisibility(tab);
        } else if (pElement) {
            pElement.textContent = content;
        }
    }

    /**
     * Set the full HTML structure of a tab (for references tab)
     * @param {string} tabId - Tab ID
     * @param {string} structure - HTML structure to set
     */
    setTabStructure(tabId, structure) {
        const tab = document.getElementById(tabId);
        if (!tab) return;

        const divElement = tab.querySelector('div');
        if (divElement) {
            divElement.innerHTML = structure;
        }
    }

    /**
     * Update visibility of pre elements based on content
     * @param {HTMLElement} tab - Tab element to check
     */
    updatePreElementVisibility(tab) {
        const preElement = tab.querySelector('pre');
        if (preElement) {
            const hasContent = preElement.textContent.trim().length > 0;
            preElement.style.display = hasContent ? '' : 'none';
        }
    }

    /**
     * Undo the last action
     */
    undo() {
        if (this.history.length === 0) {
            return;
        }

        const canvas = document.getElementById('canvas');
        if (!canvas) return;

        // Save current state to redo stack before undoing
        const currentState = {
            canvasContent: canvas.innerHTML,
            tab1Content: this.getTabContent('tab1'),
            tab2Content: this.getTabContent('tab2'),
            tab3Content: this.getTabContent('tab3'),
            tab4Structure: this.getTabStructure('tab4'),
            timestamp: Date.now()
        };
        this.redoStack.push(currentState);

        const lastState = this.history.pop();

        if (lastState) {
            // Restore canvas content
            canvas.innerHTML = lastState.canvasContent;

            // Restore tab contents
            this.setTabContent('tab1', lastState.tab1Content);
            this.setTabContent('tab2', lastState.tab2Content);
            this.setTabContent('tab3', lastState.tab3Content);
            
            // Restore references tab structure if available
            if (lastState.tab4Structure !== undefined) {
                this.setTabStructure('tab4', lastState.tab4Structure);
            }
        }

        this.updateButtons();
    }

    /**
     * Redo the last undone action
     */
    redo() {
        if (this.redoStack.length === 0) {
            return;
        }

        const canvas = document.getElementById('canvas');
        if (!canvas) return;

        // Save current state to history before redoing
        const currentState = {
            canvasContent: canvas.innerHTML,
            tab1Content: this.getTabContent('tab1'),
            tab2Content: this.getTabContent('tab2'),
            tab3Content: this.getTabContent('tab3'),
            tab4Structure: this.getTabStructure('tab4'),
            timestamp: Date.now()
        };
        this.history.push(currentState);

        const redoState = this.redoStack.pop();

        if (redoState) {
            // Restore canvas content
            canvas.innerHTML = redoState.canvasContent;

            // Restore tab contents
            this.setTabContent('tab1', redoState.tab1Content);
            this.setTabContent('tab2', redoState.tab2Content);
            this.setTabContent('tab3', redoState.tab3Content);
            
            // Restore references tab structure if available
            if (redoState.tab4Structure !== undefined) {
                this.setTabStructure('tab4', redoState.tab4Structure);
            }
        }

        this.updateButtons();
    }

    /**
     * Update undo and redo button states
     */
    updateButtons() {
        const undoButton = document.getElementById('undo');
        if (undoButton) {
            undoButton.disabled = this.history.length === 0;
            undoButton.title = this.history.length === 0 
                ? 'Nothing to undo' 
                : `Undo (${this.history.length} actions available)`;
        }

        const redoButton = document.getElementById('redo');
        if (redoButton) {
            redoButton.disabled = this.redoStack.length === 0;
            redoButton.title = this.redoStack.length === 0 
                ? 'Nothing to redo' 
                : `Redo (${this.redoStack.length} actions available)`;
        }
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.history = [];
        this.redoStack = [];
        this.updateButtons();
    }

    /**
     * Get history size
     * @returns {number} Number of items in history
     */
    getHistorySize() {
        return this.history.length;
    }

    /**
     * Check if history is empty
     * @returns {boolean} True if history is empty
     */
    isEmpty() {
        return this.history.length === 0;
    }

    /**
     * Get history summary for debugging
     * @returns {Array} History summary
     */
    getHistorySummary() {
        return this.history.map((state, index) => ({
            index,
            timestamp: new Date(state.timestamp).toLocaleTimeString(),
            hasContent: state.canvasContent.length > 20
        }));
    }
}

export default HistoryManager;
