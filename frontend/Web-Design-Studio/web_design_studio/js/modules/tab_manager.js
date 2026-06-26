/**
 * TabManager - Handles tab switching functionality
 */
class TabManager {
    constructor() {
        this.activeTab = null;
        this.copyManager = null;
        this.init();
    }

    /**
     * Initialize tab functionality
     */
    init() {
        this.bindEvents();
        // Set default tab
        setTimeout(() => {
            const firstTab = document.querySelector('.tab');
            if (firstTab) {
                this.openTab({ currentTarget: firstTab }, 'tab1');
            }
        }, 0);
    }

    /**
     * Bind tab click events
     */
    bindEvents() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', (event) => {
                const tabName = `tab${index + 1}`;
                this.openTab(event, tabName);
            });

            // Add keyboard support
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const tabName = `tab${index + 1}`;
                    this.openTab(e, tabName);
                }
            });
        });
    }

    /**
     * Get tab name from tab element
     * @param {HTMLElement} tabElement - Tab element
     * @returns {string} Tab name
     */
    getTabName(tabElement) {
        const tabIndex = Array.from(tabElement.parentNode.children).indexOf(tabElement);
        return `tab${tabIndex + 1}`;
    }

    /**
     * Open specific tab
     * @param {Event} evt - Click event
     * @param {string} tabName - Name of tab to open
     */
    openTab(evt, tabName) {
        // Hide all tab content
        const tabContents = document.getElementsByClassName("tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
            tabContents[i].classList.remove("active");
            tabContents[i].setAttribute("aria-hidden", "true");
        }

        // Remove active class from all tabs and update ARIA
        const tabs = document.getElementsByClassName("tab");
        for (let i = 0; i < tabs.length; i++) {
            tabs[i].className = tabs[i].className.replace(" active-tab", "");
            tabs[i].classList.remove("active-tab");
            tabs[i].setAttribute("aria-selected", "false");
        }

        // Show current tab content and mark as active
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.style.display = "block";
            targetTab.classList.add("active");
            targetTab.setAttribute("aria-hidden", "false");
        }

        if (evt && evt.currentTarget) {
            evt.currentTarget.classList.add("active-tab");
            evt.currentTarget.setAttribute("aria-selected", "true");
        }

        this.activeTab = tabName;

        // Update copy button if copy manager is available
        if (this.copyManager) {
            this.copyManager.updateCopyButtonText(tabName);
        }

        // Announce tab change to screen readers
        this.announceTabChange(tabName);
    }

    /**
     * Set copy manager reference
     * @param {CopyManager} copyManager - Copy manager instance
     */
    setCopyManager(copyManager) {
        this.copyManager = copyManager;
    }

    /**
     * Get currently active tab
     * @returns {string|null} Active tab name
     */
    getActiveTab() {
        return this.activeTab;
    }

    /**
     * Announce tab change to screen readers
     * @param {string} tabName - Active tab name
     */
    announceTabChange(tabName) {
        const statusRegion = document.getElementById('status-region');
        if (statusRegion) {
            const tabLabels = {
                'tab1': 'HTML code tab',
                'tab2': 'CSS code tab', 
                'tab3': 'JavaScript code tab',
                'tab4': 'References tab'
            };
            statusRegion.textContent = `${tabLabels[tabName] || 'Tab'} activated`;
        }
    }
}

export default TabManager;
