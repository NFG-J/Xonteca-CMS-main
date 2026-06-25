/**
 * Main application initialization and coordination
 */
import TabManager from './modules/tab_manager.js';
import CopyManager from './modules/copy_manager.js';
import NotificationManager from './modules/notification_manager.js';
import ResizerManager from './modules/resizer_manager.js';
import ComponentManager from './modules/component_manager.js?v=20260625a';
import CanvasManager from './modules/canvas_manager.js?v=20260625';
import HistoryManager from './modules/history_manager.js';
import ExportManager from './modules/export_manager.js';
import ErrorHandler from './modules/error_handler.js';

class App {
    constructor() {
        this.managers = {};
        this.isInitialized = false;
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Create manager instances in dependency order
            this.managers.notification = new NotificationManager();
            this.managers.error = new ErrorHandler(this.managers.notification);
            this.managers.copy = new CopyManager(this.managers.notification);
            this.managers.tab = new TabManager();
            this.managers.resizer = new ResizerManager();
            
            // Canvas-related managers
            this.managers.history = new HistoryManager(null, this.managers.notification);
            this.managers.canvas = new CanvasManager(this.managers.history, this.managers.notification);
            this.managers.export = new ExportManager(this.managers.canvas, this.managers.notification);
            
            // Component manager (async initialization)
            await this.initializeComponents();
            
            // Update dependencies
            this.managers.history.canvasManager = this.managers.canvas;

            // Set up cross-manager dependencies
            this.managers.tab.setCopyManager(this.managers.copy);

            // Bind additional functionality
            this.bindClearButton();
            this.bindKeyboardShortcuts();

            // Initialize pre element visibility
            this.initializePreElementVisibility();

            // Mark as initialized
            this.isInitialized = true;
            window.dispatchEvent(new CustomEvent('designit:ready', { detail: { app: this } }));

            console.log('DesignIT Studio initialized successfully');

        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.managers.error?.handleError({
                type: 'Initialization Error',
                message: error.message,
                error: error,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Initialize components asynchronously
     */
    async initializeComponents() {
        try {
            this.managers.component = new ComponentManager(this.managers.notification);
            await this.managers.component.ready;
        } catch (error) {
            console.error('Failed to initialize components:', error);
            throw new Error('Component initialization failed');
        }
    }

    /**
     * Bind clear button functionality
     */
    bindClearButton() {
        const clearButton = document.getElementById('clear');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                try {
                    this.managers.canvas.clear();
                } catch (error) {
                    this.managers.error?.handleError({
                        type: 'Clear Error',
                        message: 'Failed to clear canvas',
                        error: error,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        }
    }

    /**
     * Bind keyboard shortcuts
     */
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            try {
                // Ctrl+S to save/export
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    if (window.AgentCMSBuilder) {
                        document.getElementById('save-to-cms')?.click();
                    } else {
                        this.managers.export?.exportDesign();
                    }
                }

                // Ctrl+Shift+C to clear
                if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                    e.preventDefault();
                    this.managers.canvas?.clear();
                }

                // F1 for help
                if (e.key === 'F1') {
                    e.preventDefault();
                    this.showHelp();
                }

                // Escape to close notifications
                if (e.key === 'Escape') {
                    this.managers.notification?.remove();
                }
            } catch (error) {
                this.managers.error?.handleError({
                    type: 'Keyboard Shortcut Error',
                    message: 'Error handling keyboard shortcut',
                    error: error,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    /**
     * Initialize pre element visibility on app load
     */
    initializePreElementVisibility() {
        const tabs = ['tab1', 'tab2', 'tab3']; // HTML, CSS, and JS/TS tabs have pre elements
        tabs.forEach(tabId => {
            const tab = document.getElementById(tabId);
            if (tab && this.managers.canvas) {
                this.managers.canvas.updatePreElementVisibility(tab);
            }
        });
    }

    /**
     * Show help information
     */
    showHelp() {
        const helpMessage = `
Keyboard Shortcuts:
- Ctrl+Z: Undo
- Ctrl+E: Export
- Ctrl+S: Save/Export
- Ctrl+Shift+C: Clear canvas
- F1: Show this help
- Esc: Close notifications

Drag and drop components from the left panel to the canvas.
Use the tabs on the right to view HTML, CSS, and references.
        `.trim();

        if (this.managers.notification) {
            // Create a custom help notification
            const notification = document.createElement('div');
            notification.className = 'copy-notification info show';
            notification.style.cssText = `
                white-space: pre-line;
                max-width: 400px;
                left: 50%;
                transform: translateX(-50%);
                top: 20px;
                right: auto;
                font-size: 12px;
                line-height: 1.4;
            `;
            notification.textContent = helpMessage;
            
            document.body.appendChild(notification);
            
            // Auto-remove after longer delay
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 8000);
        }
    }

    /**
     * Get a manager instance
     * @param {string} name - Manager name
     * @returns {Object|null} Manager instance
     */
    getManager(name) {
        return this.managers[name] || null;
    }

    /**
     * Get application statistics
     * @returns {Object} Application statistics
     */
    getStats() {
        return {
            initialized: this.isInitialized,
            historySize: this.managers.history?.getHistorySize() || 0,
            componentCount: this.managers.component?.getAllComponents().length || 0,
            exportStats: this.managers.export?.getExportStats() || null,
            errorSummary: this.managers.error?.getErrorSummary() || null
        };
    }

    /**
     * Health check for the application
     * @returns {Object} Health status
     */
    healthCheck() {
        const requiredManagers = [
            'notification', 'error', 'copy', 'tab', 'resizer',
            'history', 'canvas', 'export', 'component'
        ];

        const status = {
            healthy: true,
            managers: {},
            issues: []
        };

        requiredManagers.forEach(name => {
            const manager = this.managers[name];
            status.managers[name] = !!manager;
            
            if (!manager) {
                status.healthy = false;
                status.issues.push(`Missing manager: ${name}`);
            }
        });

        // Check DOM elements
        const requiredElements = ['canvas', 'copyBtn', 'undo', 'clear', 'export'];
        requiredElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                status.healthy = false;
                status.issues.push(`Missing element: ${id}`);
            }
        });

        return status;
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.DesignITApp = new App();
});

export default App;
