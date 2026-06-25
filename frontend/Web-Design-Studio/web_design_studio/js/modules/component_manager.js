/**
 * ComponentManager - Handles loading and management of draggable components
 */
class ComponentManager {
    constructor(notificationManager) {
        this.notificationManager = notificationManager;
        this.components = [];
        this.jsComponents = [];
        this.apiComponents = [];
        this.dropdownManager = null;
        this.pointerDrag = null;
        this.nativeDragActive = false;
        this.ready = this.init();
    }

    /**
     * Initialize component manager
     */
    async init() {
        try {
            // Import and initialize dropdown manager
            const DropdownManager = await import('./dropdown_manager.js');
            this.dropdownManager = new DropdownManager.default();
            
            await this.loadComponents();
            await this.loadJSComponents();
            await this.loadAPIComponents();
            this.renderComponents();
            this.renderJSComponents();
            this.renderAPIComponents();
        } catch (error) {
            console.error('Failed to initialize components:', error);
            throw error;
        }
    }

    /**
     * Load components from JSON file
     */
    async loadComponents() {
        try {
            const response = await fetch(this.resolveAssetUrl('data/html_components.json'));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.components = await response.json();
        } catch (error) {
            console.error('Error loading components:', error);
            throw error;
        }
    }

    /**
     * Load JavaScript components from JSON file
     */
    async loadJSComponents() {
        try {
            const response = await fetch(this.resolveAssetUrl('data/js_components.json'));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.jsComponents = await response.json();
        } catch (error) {
            console.error('Error loading JS components:', error);
            throw error;
        }
    }

    /**
     * Load Web API components from JSON file
     */
    async loadAPIComponents() {
        try {
            const response = await fetch(this.resolveAssetUrl('data/api_components.json'));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.apiComponents = await response.json();
        } catch (error) {
            console.error('Error loading API components:', error);
            throw error;
        }
    }

    /**
     * Resolve builder asset paths for standalone and Django static embeds.
     * @param {string} path - Path relative to the builder root
     * @returns {string} Resolved URL
     */
    resolveAssetUrl(path) {
        const configuredBase = window.AgentCMSBuilder?.assetBaseUrl || './';
        const baseUrl = new URL(configuredBase, window.location.href);
        return new URL(path, baseUrl).toString();
    }

    /**
     * Render components in dropdown structure
     */
    renderComponents() {
        if (!this.dropdownManager) {
            console.error('Dropdown manager not initialized');
            return;
        }

        // Get the HTML elements dropdown content container
        const htmlContainer = this.dropdownManager.getContentContainer('html');
        if (!htmlContainer) {
            console.error('HTML dropdown container not found');
            return;
        }

        // Clear existing content
        htmlContainer.innerHTML = '';

        // Categorize components
        const inputComponents = [];
        const listComponents = [];
        const mediaComponents = [];
        const otherComponents = [];

        this.components.forEach((item, index) => {
            if (item.Title.toLowerCase().startsWith('input type')) {
                inputComponents.push({ item, index });
            } else if (item.Title.toLowerCase().startsWith('list ')) {
                listComponents.push({ item, index });
            } else if (item.Title.toLowerCase().includes('<audio>') || 
                       item.Title.toLowerCase().includes('<video>') || 
                       item.Title.toLowerCase().includes('<picture>')) {
                mediaComponents.push({ item, index });
            } else {
                otherComponents.push({ item, index });
            }
        });

        // Create a combined list for alphabetical ordering
        const allItems = [];

        // Add input subcategory as a special item
        if (inputComponents.length > 0) {
            allItems.push({
                type: 'subcategory',
                title: 'Input <input>',
                sortKey: 'Input <input>',
                subcategory: this.createSubcategoryDropdown('inputs', 'Input <input>', inputComponents)
            });
        }

        // Add list subcategory as a special item
        if (listComponents.length > 0) {
            allItems.push({
                type: 'subcategory',
                title: 'List',
                sortKey: 'List',
                subcategory: this.createSubcategoryDropdown('lists', 'List', listComponents)
            });
        }

        // Add media subcategory as a special item
        if (mediaComponents.length > 0) {
            allItems.push({
                type: 'subcategory',
                title: 'Media',
                sortKey: 'Media',
                subcategory: this.createSubcategoryDropdown('media', 'Media', mediaComponents)
            });
        }

        // Add other components
        otherComponents.forEach(({ item, index }) => {
            allItems.push({
                type: 'component',
                title: item.Title,
                sortKey: item.Title,
                item: item,
                index: index
            });
        });

        // Sort alphabetically
        allItems.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

        // Render in alphabetical order
        allItems.forEach(item => {
            if (item.type === 'subcategory') {
                htmlContainer.appendChild(item.subcategory);
            } else {
                const element = this.createComponentElement(item.item, item.index);
                htmlContainer.appendChild(element);
            }
        });

        // Announce to screen readers
        const statusRegion = document.getElementById('status-region');
        if (statusRegion) {
            statusRegion.textContent = `${this.components.length} HTML components loaded`;
        }
    }

    /**
     * Render JavaScript components in dropdown structure
     */
    renderJSComponents() {
        if (!this.dropdownManager) {
            console.error('Dropdown manager not initialized');
            return;
        }

        // Get the JavaScript elements dropdown content container
        const jsContainer = this.dropdownManager.getContentContainer('javascript');
        if (!jsContainer) {
            console.error('JavaScript dropdown container not found');
            return;
        }

        // Clear existing content
        jsContainer.innerHTML = '';

        // Render as flat list
        const sortedComponents = [...this.jsComponents].sort((a, b) => 
            a.Title.localeCompare(b.Title)
        );

        sortedComponents.forEach((item, index) => {
            const element = this.createComponentElement(item, index, 'js');
            jsContainer.appendChild(element);
        });

        const statusRegion = document.getElementById('status-region');
        if (statusRegion) {
            statusRegion.textContent = `${this.jsComponents.length} JavaScript components loaded`;
        }
    }

    /**
     * Render Web API components in dropdown structure
     */
    renderAPIComponents() {
        if (!this.dropdownManager) {
            console.error('Dropdown manager not initialized');
            return;
        }

        // Get the Web APIs dropdown content container
        const apiContainer = this.dropdownManager.getContentContainer('webapis');
        if (!apiContainer) {
            console.error('Web APIs dropdown container not found');
            return;
        }

        // Clear existing content
        apiContainer.innerHTML = '';

        // Render as flat list
        const sortedComponents = [...this.apiComponents].sort((a, b) => 
            a.Title.localeCompare(b.Title)
        );

        sortedComponents.forEach((item, index) => {
            const element = this.createComponentElement(item, index, 'api');
            apiContainer.appendChild(element);
        });

        const statusRegion = document.getElementById('status-region');
        if (statusRegion) {
            statusRegion.textContent = `${this.apiComponents.length} Web API components loaded`;
        }
    }

    /**
     * Create a subcategory dropdown
     * @param {string} id - Subcategory ID
     * @param {string} title - Subcategory title
     * @param {Array} components - Array of components with item, index, and optional type
     * @returns {HTMLElement} Subcategory dropdown element
     */
    createSubcategoryDropdown(id, title, components) {
        const subcategoryDiv = document.createElement('div');
        subcategoryDiv.className = 'subcategory-dropdown';
        subcategoryDiv.setAttribute('data-subcategory', id);

        const header = document.createElement('button');
        header.className = 'subcategory-header';
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('aria-controls', `${id}-content`);

        const icon = document.createElement('span');
        icon.className = 'dropdown-icon';
        icon.textContent = '>';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'dropdown-title';
        titleSpan.textContent = title;

        header.appendChild(icon);
        header.appendChild(titleSpan);

        const content = document.createElement('div');
        content.className = 'subcategory-content';
        content.id = `${id}-content`;
        content.setAttribute('role', 'group');

        // Add components to subcategory
        components.forEach(({ item, index, type }) => {
            const element = this.createComponentElement(item, index, type || 'html');
            content.appendChild(element);
        });

        subcategoryDiv.appendChild(header);
        subcategoryDiv.appendChild(content);

        return subcategoryDiv;
    }

    /**
     * Create a draggable component element
     * @param {Object} item - Component data
     * @param {number} index - Component index
     * @param {string} type - Component type ('html' or 'js')
     * @returns {HTMLElement} Component element
     */
    createComponentElement(item, index, type = 'html') {
        const element = document.createElement('div');
        element.className = 'element';
        element.draggable = true;
        element.setAttribute('data-html', item.HTML);
        element.setAttribute('data-css', item.CSS);
        element.setAttribute('data-reference', item.Reference);
        element.setAttribute('data-index', index);
        element.setAttribute('data-type', type);
        element.setAttribute('data-title', item.Title);
        
        // Add JS attribute if it's a JS component
        if (item.JS) {
            element.setAttribute('data-js', item.JS);
        }
        
        element.textContent = item.Title;

        // Add drag event listeners
        this.addDragListeners(element, item, type);

        return element;
    }

    /**
     * Build the drag payload shared by mouse, keyboard, and fallback drops.
     * @param {Object} item - Component data
     * @param {string} type - Component type ('html', 'js', or 'api')
     * @returns {Object} Serializable component data
     */
    createComponentData(item, type = 'html') {
        const data = {
            html: item.HTML,
            css: item.CSS,
            reference: item.Reference,
            title: item.Title,
            type: type
        };

        if (item.JS) {
            data.js = item.JS;
        }

        return data;
    }

    /**
     * Add drag event listeners to element
     * @param {HTMLElement} element - Element to add listeners to
     * @param {Object} item - Component data
     * @param {string} type - Component type ('html' or 'js')
     */
    addDragListeners(element, item, type = 'html') {
        let dragStartedAt = 0;

        element.addEventListener('dragstart', (e) => {
            this.nativeDragActive = true;
            this.cancelPointerDrag();
            dragStartedAt = Date.now();
            const data = this.createComponentData(item, type);
            
            const serializedData = JSON.stringify(data);
            e.dataTransfer.setData('application/json', serializedData);
            e.dataTransfer.setData('text/plain', serializedData);
            e.dataTransfer.effectAllowed = 'copy';
            
            // Add visual feedback
            element.classList.add('dragging');
        });

        element.addEventListener('dragend', (e) => {
            element.classList.remove('dragging');
            this.addComponentFromDragEnd(e, item, type, dragStartedAt);
            this.nativeDragActive = false;
            dragStartedAt = 0;
        });

        element.addEventListener('pointerdown', (e) => {
            this.startPointerDrag(e, element, item, type);
        });

        // Add keyboard support
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.simulateDragDrop(item, type);
            }
        });

        // Make focusable for accessibility
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'button');
        element.setAttribute('aria-label', `Drag ${item.Title} component to canvas`);
    }

    /**
     * Simulate drag and drop for keyboard users
     * @param {Object} item - Component data
     * @param {string} type - Component type ('html' or 'js')
     */
    simulateDragDrop(item, type = 'html') {
        const canvas = document.getElementById('canvas');
        const canvasManager = window.DesignITApp?.getManager('canvas');
        
        if (canvas && canvasManager) {
            const data = this.createComponentData(item, type);
            canvasManager.addComponent(data);
        }
    }

    /**
     * Start a pointer-driven drag fallback for browsers that do not fire native
     * HTML5 drag events from sidebar components.
     * @param {PointerEvent} e - Pointer down event
     * @param {HTMLElement} element - Source component element
     * @param {Object} item - Component data
     * @param {string} type - Component type
     */
    startPointerDrag(e, element, item, type = 'html') {
        if (e.button !== 0 || this.nativeDragActive) {
            return;
        }

        this.cancelPointerDrag();

        const drag = {
            active: false,
            data: this.createComponentData(item, type),
            element,
            startX: e.clientX,
            startY: e.clientY,
            moveHandler: (event) => this.movePointerDrag(event),
            upHandler: (event) => this.finishPointerDrag(event),
            cancelHandler: () => this.cancelPointerDrag()
        };

        this.pointerDrag = drag;
        document.addEventListener('pointermove', drag.moveHandler);
        document.addEventListener('pointerup', drag.upHandler, { once: true });
        document.addEventListener('pointercancel', drag.cancelHandler, { once: true });
    }

    /**
     * Move the pointer fallback drag and update the canvas insertion indicator.
     * @param {PointerEvent} e - Pointer move event
     */
    movePointerDrag(e) {
        const drag = this.pointerDrag;
        if (!drag || this.nativeDragActive) {
            return;
        }

        const distance = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
        if (!drag.active && distance < 6) {
            return;
        }

        drag.active = true;
        drag.element.classList.add('dragging');
        e.preventDefault();

        const canvas = document.getElementById('canvas');
        const canvasManager = window.DesignITApp?.getManager?.('canvas');
        const target = document.elementFromPoint(e.clientX, e.clientY);

        if (canvas && target && canvas.contains(target)) {
            canvas.classList.add('drag-over');
            canvasManager?.rememberDragPoint?.(e);
            canvasManager?.showInsertionIndicator?.(e.clientY);
        } else {
            canvas?.classList.remove('drag-over');
            canvasManager?.removeInsertionIndicator?.();
        }
    }

    /**
     * Complete the pointer fallback drop when the pointer ends over the canvas.
     * @param {PointerEvent} e - Pointer up event
     */
    finishPointerDrag(e) {
        const drag = this.pointerDrag;
        if (!drag) {
            return;
        }

        const canvas = document.getElementById('canvas');
        const canvasManager = window.DesignITApp?.getManager?.('canvas');
        const target = document.elementFromPoint(e.clientX, e.clientY);

        if (drag.active && canvas && canvasManager && target && canvas.contains(target)) {
            const beforeElement = canvasManager.getDragAfterElement?.(e.clientY) || null;
            canvasManager.addComponent(drag.data, beforeElement);
            window.DesignITLastDropHandledAt = Date.now();
        }

        this.cancelPointerDrag();
    }

    /**
     * Clear pointer fallback drag listeners and visual state.
     */
    cancelPointerDrag() {
        const drag = this.pointerDrag;
        if (!drag) {
            return;
        }

        document.removeEventListener('pointermove', drag.moveHandler);
        document.removeEventListener('pointerup', drag.upHandler);
        document.removeEventListener('pointercancel', drag.cancelHandler);
        drag.element.classList.remove('dragging');

        const canvas = document.getElementById('canvas');
        const canvasManager = window.DesignITApp?.getManager?.('canvas');
        canvas?.classList.remove('drag-over');
        canvasManager?.removeInsertionIndicator?.();
        this.pointerDrag = null;
    }

    /**
     * Some embedded browsers fail to fire the canvas drop event even after a
     * valid dragstart. If no native drop handled the component, use the dragend
     * coordinates to complete the drop when the pointer ends over the canvas.
     * @param {DragEvent} e - Drag end event
     * @param {Object} item - Component data
     * @param {string} type - Component type
     * @param {number} dragStartedAt - Timestamp for the current drag
     */
    addComponentFromDragEnd(e, item, type, dragStartedAt) {
        if (!dragStartedAt || (window.DesignITLastDropHandledAt || 0) >= dragStartedAt) {
            return;
        }

        const point = this.getDragEndPoint(e);
        if (!point) {
            return;
        }

        const canvas = document.getElementById('canvas');
        const target = document.elementFromPoint(point.x, point.y);
        if (!canvas || !target || !canvas.contains(target)) {
            return;
        }

        const canvasManager = window.DesignITApp?.getManager?.('canvas');
        if (!canvasManager) {
            return;
        }

        const beforeElement = canvasManager.getDragAfterElement?.(point.y) || null;
        canvasManager.addComponent(this.createComponentData(item, type), beforeElement);
        window.DesignITLastDropHandledAt = Date.now();
    }

    /**
     * Resolve a useful drop point from dragend or the last canvas dragover.
     * @param {DragEvent} e - Drag end event
     * @returns {{x: number, y: number}|null} Drop point
     */
    getDragEndPoint(e) {
        if (Number.isFinite(e.clientX) && Number.isFinite(e.clientY) && (e.clientX || e.clientY)) {
            return { x: e.clientX, y: e.clientY };
        }

        const lastPoint = window.DesignITLastDragPoint;
        if (lastPoint && Date.now() - lastPoint.at < 1000) {
            return { x: lastPoint.x, y: lastPoint.y };
        }

        return null;
    }

    /**
     * Get component by index
     * @param {number} index - Component index
     * @returns {Object|null} Component data
     */
    getComponent(index) {
        return this.components[index] || null;
    }

    /**
     * Get all components
     * @returns {Array} All components
     */
    getAllComponents() {
        return [...this.components];
    }

    /**
     * Search components by title
     * @param {string} query - Search query
     * @returns {Array} Matching components
     */
    searchComponents(query) {
        const searchTerm = query.toLowerCase();
        return this.components.filter(component => 
            component.Title.toLowerCase().includes(searchTerm)
        );
    }
}

export default ComponentManager;
