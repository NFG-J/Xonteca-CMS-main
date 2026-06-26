/**
 * DropdownManager - Handles category dropdown functionality
 */
class DropdownManager {
    constructor() {
        this.dropdowns = new Map();
        this.init();
    }

    /**
     * Initialize dropdown functionality
     */
    init() {
        this.bindEvents();
        // Start with HTML dropdown expanded by default
        setTimeout(() => {
            this.expandDropdown('html');
        }, 100);
    }

    /**
     * Bind dropdown events
     */
    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.dropdown-header')) {
                const header = e.target.closest('.dropdown-header');
                const dropdown = header.closest('.category-dropdown');
                const category = dropdown.dataset.category;
                this.toggleDropdown(category);
            }
            // Handle subcategory dropdown clicks
            if (e.target.closest('.subcategory-header')) {
                const header = e.target.closest('.subcategory-header');
                const subcategory = header.closest('.subcategory-dropdown');
                const subcategoryId = subcategory.dataset.subcategory;
                this.toggleSubcategory(subcategoryId);
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.dropdown-header')) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const header = e.target.closest('.dropdown-header');
                    const dropdown = header.closest('.category-dropdown');
                    const category = dropdown.dataset.category;
                    this.toggleDropdown(category);
                }
            }
            // Handle subcategory keyboard support
            if (e.target.closest('.subcategory-header')) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const header = e.target.closest('.subcategory-header');
                    const subcategory = header.closest('.subcategory-dropdown');
                    const subcategoryId = subcategory.dataset.subcategory;
                    this.toggleSubcategory(subcategoryId);
                }
            }
        });
    }

    /**
     * Toggle dropdown state
     * @param {string} category - Category name
     */
    toggleDropdown(category) {
        const dropdown = document.querySelector(`[data-category="${category}"]`);
        if (!dropdown) return;

        const header = dropdown.querySelector('.dropdown-header');
        const content = dropdown.querySelector('.dropdown-content');
        const isExpanded = header.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            this.collapseDropdown(category);
        } else {
            this.expandDropdown(category);
        }
    }

    /**
     * Expand dropdown
     * @param {string} category - Category name
     */
    expandDropdown(category) {
        const dropdown = document.querySelector(`[data-category="${category}"]`);
        if (!dropdown) return;

        const header = dropdown.querySelector('.dropdown-header');
        const content = dropdown.querySelector('.dropdown-content');

        header.setAttribute('aria-expanded', 'true');
        content.classList.add('expanded');
        this.dropdowns.set(category, true);

        // Announce to screen readers
        this.announceDropdownChange(category, true);
    }

    /**
     * Collapse dropdown
     * @param {string} category - Category name
     */
    collapseDropdown(category) {
        const dropdown = document.querySelector(`[data-category="${category}"]`);
        if (!dropdown) return;

        const header = dropdown.querySelector('.dropdown-header');
        const content = dropdown.querySelector('.dropdown-content');

        header.setAttribute('aria-expanded', 'false');
        content.classList.remove('expanded');
        this.dropdowns.set(category, false);

        // Announce to screen readers
        this.announceDropdownChange(category, false);
    }

    /**
     * Check if dropdown is expanded
     * @param {string} category - Category name
     * @returns {boolean} Is expanded
     */
    isExpanded(category) {
        return this.dropdowns.get(category) || false;
    }

    /**
     * Get dropdown content container
     * @param {string} category - Category name
     * @returns {HTMLElement|null} Content container
     */
    getContentContainer(category) {
        const dropdown = document.querySelector(`[data-category="${category}"]`);
        return dropdown ? dropdown.querySelector('.dropdown-content') : null;
    }

    /**
     * Announce dropdown state change to screen readers
     * @param {string} category - Category name
     * @param {boolean} isExpanded - Expansion state
     */
    announceDropdownChange(category, isExpanded) {
        const statusRegion = document.getElementById('status-region');
        if (statusRegion) {
            const action = isExpanded ? 'expanded' : 'collapsed';
            statusRegion.textContent = `${category.toUpperCase()} category ${action}`;
        }
    }

    /**
     * Add a new category dropdown
     * @param {string} category - Category name
     * @param {string} title - Display title
     * @param {boolean} expanded - Initial expanded state
     */
    addCategory(category, title, expanded = false) {
        const container = document.querySelector('.elements-container');
        if (!container) return;

        const dropdownHtml = `
            <div class="category-dropdown" data-category="${category}">
                <button class="dropdown-header" aria-expanded="${expanded}" aria-controls="${category}-elements">
                    <span class="dropdown-icon">&gt;</span>
                    <span class="dropdown-title">${title}</span>
                </button>
                <div class="dropdown-content ${expanded ? 'expanded' : ''}" id="${category}-elements" role="group" aria-labelledby="${category}-dropdown">
                    <!-- ${title} components will be loaded here -->
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', dropdownHtml);
        this.dropdowns.set(category, expanded);
    }

    /**
     * Toggle subcategory dropdown state
     * @param {string} subcategoryId - Subcategory ID
     */
    toggleSubcategory(subcategoryId) {
        const subcategory = document.querySelector(`[data-subcategory="${subcategoryId}"]`);
        if (!subcategory) return;

        const header = subcategory.querySelector('.subcategory-header');
        const content = subcategory.querySelector('.subcategory-content');
        const isExpanded = header.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            this.collapseSubcategory(subcategoryId);
        } else {
            this.expandSubcategory(subcategoryId);
        }
    }

    /**
     * Expand subcategory dropdown
     * @param {string} subcategoryId - Subcategory ID
     */
    expandSubcategory(subcategoryId) {
        const subcategory = document.querySelector(`[data-subcategory="${subcategoryId}"]`);
        if (!subcategory) return;

        const header = subcategory.querySelector('.subcategory-header');
        const content = subcategory.querySelector('.subcategory-content');

        header.setAttribute('aria-expanded', 'true');
        content.classList.add('expanded');

        // Announce to screen readers
        const statusRegion = document.getElementById('status-region');
        if (statusRegion) {
            statusRegion.textContent = `${subcategoryId} subcategory expanded`;
        }
    }

    /**
     * Collapse subcategory dropdown
     * @param {string} subcategoryId - Subcategory ID
     */
    collapseSubcategory(subcategoryId) {
        const subcategory = document.querySelector(`[data-subcategory="${subcategoryId}"]`);
        if (!subcategory) return;

        const header = subcategory.querySelector('.subcategory-header');
        const content = subcategory.querySelector('.subcategory-content');

        header.setAttribute('aria-expanded', 'false');
        content.classList.remove('expanded');

        // Announce to screen readers
        const statusRegion = document.getElementById('status-region');
        if (statusRegion) {
            statusRegion.textContent = `${subcategoryId} subcategory collapsed`;
        }
    }
}

export default DropdownManager;
