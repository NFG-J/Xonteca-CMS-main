/**
 * NotificationManager - Handles notification display
 */
class NotificationManager {
    constructor() {
        this.activeNotification = null;
        this.notificationsEnabled = true; // Enable notifications
    }

    /**
     * Show a notification
     * @param {string} message - Message to display
     * @param {string} type - Notification type ('success', 'error', 'info')
     */
    show(message, type = 'success') {
        // Early return if notifications are disabled
        if (!this.notificationsEnabled) {
            return;
        }

        // Remove any existing notification
        this.remove();

        // Create new notification
        const notification = this.createElement(message, type);
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-remove after delay
        setTimeout(() => {
            this.remove();
        }, 3000);

        this.activeNotification = notification;
    }

    /**
     * Create notification element
     * @param {string} message - Message text
     * @param {string} type - Notification type
     * @returns {HTMLElement} Notification element
     */
    createElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `copy-notification ${type}`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        return notification;
    }

    /**
     * Remove the current notification
     */
    remove() {
        if (this.activeNotification && this.activeNotification.parentNode) {
            this.activeNotification.classList.remove('show');
            
            setTimeout(() => {
                if (this.activeNotification && this.activeNotification.parentNode) {
                    this.activeNotification.remove();
                }
                this.activeNotification = null;
            }, 300);
        }
    }

    /**
     * Show error notification
     * @param {string} message - Error message
     */
    showError(message) {
        this.show(message, 'error');
    }

    /**
     * Show success notification
     * @param {string} message - Success message
     */
    showSuccess(message) {
        this.show(message, 'success');
    }

    /**
     * Show info notification
     * @param {string} message - Info message
     */
    showInfo(message) {
        this.show(message, 'info');
    }

    /**
     * Enable notifications
     */
    enableNotifications() {
        this.notificationsEnabled = true;
        console.log('Notifications enabled');
    }

    /**
     * Disable notifications
     */
    disableNotifications() {
        this.notificationsEnabled = false;
        this.remove(); // Remove any current notification
        console.log('Notifications disabled');
    }

    /**
     * Toggle notifications on/off
     * @returns {boolean} New notification state
     */
    toggleNotifications() {
        this.notificationsEnabled = !this.notificationsEnabled;
        if (!this.notificationsEnabled) {
            this.remove();
        }
        console.log(`Notifications ${this.notificationsEnabled ? 'enabled' : 'disabled'}`);
        return this.notificationsEnabled;
    }

    /**
     * Check if notifications are enabled
     * @returns {boolean} True if enabled
     */
    areNotificationsEnabled() {
        return this.notificationsEnabled;
    }
}

export default NotificationManager;