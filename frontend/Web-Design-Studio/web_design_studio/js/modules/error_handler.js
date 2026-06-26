/**
 * ErrorHandler - Centralized error handling and user feedback
 */
class ErrorHandler {
    constructor(notificationManager) {
        this.notificationManager = notificationManager;
        this.errorLog = [];
        this.maxLogSize = 100;
        this.init();
    }

    /**
     * Initialize error handler
     */
    init() {
        this.setupGlobalErrorHandlers();
        this.setupErrorBoundary();
    }

    /**
     * Setup global error handlers
     */
    setupGlobalErrorHandlers() {
        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'JavaScript Error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                timestamp: new Date().toISOString()
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'Unhandled Promise Rejection',
                message: event.reason?.message || 'Promise rejected',
                error: event.reason,
                timestamp: new Date().toISOString()
            });
        });

        // Handle module loading errors
        window.addEventListener('error', (event) => {
            if (event.target && event.target.tagName === 'SCRIPT') {
                this.handleError({
                    type: 'Script Loading Error',
                    message: `Failed to load script: ${event.target.src}`,
                    timestamp: new Date().toISOString()
                });
            }
        }, true);
    }

    /**
     * Setup error boundary in the DOM
     */
    setupErrorBoundary() {
        const errorBoundary = document.getElementById('error-boundary');
        if (errorBoundary) {
            errorBoundary.style.display = 'none';
        }
    }

    /**
     * Handle an error
     * @param {Object} errorInfo - Error information
     */
    handleError(errorInfo) {
        // Log the error
        this.logError(errorInfo);

        // Show user-friendly message
        this.showUserError(errorInfo);

        // Send to console for debugging
        console.error('Application Error:', errorInfo);

        // Show in error boundary if critical
        if (this.isCriticalError(errorInfo)) {
            this.showCriticalError(errorInfo);
        }
    }

    /**
     * Log error to internal log
     * @param {Object} errorInfo - Error information
     */
    logError(errorInfo) {
        this.errorLog.push(errorInfo);

        // Limit log size
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // Store in localStorage for debugging
        try {
            localStorage.setItem('designit_error_log', JSON.stringify(this.errorLog.slice(-10)));
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    /**
     * Show user-friendly error message
     * @param {Object} errorInfo - Error information
     */
    showUserError(errorInfo) {
        // Remove notification call - just log to console
        console.warn('Error:', this.getUserFriendlyMessage(errorInfo));
    }

    /**
     * Get user-friendly error message
     * @param {Object} errorInfo - Error information
     * @returns {string} User-friendly message
     */
    getUserFriendlyMessage(errorInfo) {
        const messageMap = {
            'JavaScript Error': 'Something went wrong. Please try refreshing the page.',
            'Unhandled Promise Rejection': 'A network or data error occurred. Please try again.',
            'Script Loading Error': 'Failed to load application resources. Please check your connection.',
            'Component Load Error': 'Failed to load components. Please refresh and try again.',
            'Export Error': 'Failed to export design. Please try again.',
            'Import Error': 'Failed to import data. Please check the file format.',
            'Network Error': 'Network connection error. Please check your internet connection.'
        };

        return messageMap[errorInfo.type] || 'An unexpected error occurred. Please try again.';
    }

    /**
     * Check if error is critical
     * @param {Object} errorInfo - Error information
     * @returns {boolean} True if critical
     */
    isCriticalError(errorInfo) {
        const criticalTypes = [
            'Script Loading Error',
            'Module Loading Error'
        ];

        return criticalTypes.includes(errorInfo.type) ||
               (errorInfo.message && errorInfo.message.includes('Module not found'));
    }

    /**
     * Show critical error in error boundary
     * @param {Object} errorInfo - Error information
     */
    showCriticalError(errorInfo) {
        const errorBoundary = document.getElementById('error-boundary');
        if (errorBoundary) {
            errorBoundary.innerHTML = `
                <div style="padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; margin: 20px;">
                    <h3 style="color: #721c24; margin: 0 0 10px 0;">Application Error</h3>
                    <p style="color: #721c24; margin: 0 0 15px 0;">
                        ${this.getUserFriendlyMessage(errorInfo)}
                    </p>
                    <button onclick="location.reload()" 
                            style="background: #721c24; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        Reload Application
                    </button>
                </div>
            `;
            errorBoundary.style.display = 'block';
            errorBoundary.classList.remove('hidden');
        }
    }

    /**
     * Handle validation errors
     * @param {string} field - Field name
     * @param {string} message - Validation message
     */
    handleValidationError(field, message) {
        const errorInfo = {
            type: 'Validation Error',
            field: field,
            message: message,
            timestamp: new Date().toISOString()
        };

        this.logError(errorInfo);
        console.warn(`Validation Error - ${field}: ${message}`);
    }

    /**
     * Validate required fields
     * @param {Object} data - Data to validate
     * @param {Array} requiredFields - Required field names
     * @returns {boolean} True if valid
     */
    validateRequired(data, requiredFields) {
        for (const field of requiredFields) {
            if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
                this.handleValidationError(field, 'This field is required');
                return false;
            }
        }
        return true;
    }

    /**
     * Validate JSON data
     * @param {string} jsonString - JSON string to validate
     * @returns {Object|null} Parsed JSON or null if invalid
     */
    validateJSON(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            this.handleValidationError('JSON', 'Invalid JSON format');
            return null;
        }
    }

    /**
     * Validate component data
     * @param {Object} component - Component data
     * @returns {boolean} True if valid
     */
    validateComponent(component) {
        const requiredFields = ['Title', 'HTML', 'CSS', 'Reference'];
        
        if (!this.validateRequired(component, requiredFields)) {
            return false;
        }

        // Additional validation
        if (component.HTML && !component.HTML.trim().startsWith('<')) {
            this.handleValidationError('HTML', 'HTML must start with a valid tag');
            return false;
        }

        return true;
    }

    /**
     * Get error summary for debugging
     * @returns {Object} Error summary
     */
    getErrorSummary() {
        const errorCounts = {};
        this.errorLog.forEach(error => {
            errorCounts[error.type] = (errorCounts[error.type] || 0) + 1;
        });

        return {
            totalErrors: this.errorLog.length,
            errorTypes: errorCounts,
            recentErrors: this.errorLog.slice(-5),
            lastError: this.errorLog[this.errorLog.length - 1] || null
        };
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        try {
            localStorage.removeItem('designit_error_log');
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    /**
     * Test error handling (for debugging)
     */
    testErrorHandling() {
        // Test different error types
        setTimeout(() => {
            this.handleError({
                type: 'Test Error',
                message: 'This is a test error for debugging',
                timestamp: new Date().toISOString()
            });
        }, 100);
    }
}

export default ErrorHandler;