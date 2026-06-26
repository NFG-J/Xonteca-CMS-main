/**
 * ResizerManager - Handles panel resizing functionality
 */
class ResizerManager {
    constructor() {
        this.isResizing = false;
        this.currentResizer = null;
        this.elements = {};
        this.init();
    }

    /**
     * Initialize resizer functionality
     */
    init() {
        this.cacheElements();
        this.bindEvents();
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            resizer1: document.getElementById('resizer1'),
            resizer2: document.getElementById('resizer2'),
            menu: document.querySelector('.menu'),
            canvas: document.querySelector('.canvas'),
            sidePanel: document.querySelector('.side-panel'),
            container: document.querySelector('.container')
        };
    }

    /**
     * Bind resizer events
     */
    bindEvents() {
        const { resizer1, resizer2 } = this.elements;

        if (resizer1) {
            resizer1.addEventListener('mousedown', (e) => this.startResize(e, resizer1));
        }

        if (resizer2) {
            resizer2.addEventListener('mousedown', (e) => this.startResize(e, resizer2));
        }

        document.addEventListener('mousemove', (e) => this.doResize(e));
        document.addEventListener('mouseup', () => this.stopResize());

        // Handle touch events for mobile
        if (resizer1) {
            resizer1.addEventListener('touchstart', (e) => this.startResize(e, resizer1));
        }

        if (resizer2) {
            resizer2.addEventListener('touchstart', (e) => this.startResize(e, resizer2));
        }

        document.addEventListener('touchmove', (e) => this.doResize(e));
        document.addEventListener('touchend', () => this.stopResize());
    }

    /**
     * Start resize operation
     * @param {Event} e - Mouse/touch event
     * @param {HTMLElement} resizer - Resizer element
     */
    startResize(e, resizer) {
        this.isResizing = true;
        this.currentResizer = resizer;
        resizer.classList.add('active');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    }

    /**
     * Perform resize operation
     * @param {Event} e - Mouse/touch event
     */
    doResize(e) {
        if (!this.isResizing || !this.currentResizer) return;

        const { container, menu, sidePanel, resizer1, resizer2 } = this.elements;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const mouseX = clientX - containerRect.left;
        const containerWidth = containerRect.width;

        if (this.currentResizer === resizer1 && menu) {
            this.resizeMenuPanel(mouseX, containerWidth);
        } else if (this.currentResizer === resizer2 && sidePanel) {
            this.resizeSidePanel(mouseX, containerWidth);
        }
    }

    /**
     * Resize menu panel
     * @param {number} mouseX - Mouse X position
     * @param {number} containerWidth - Container width
     */
    resizeMenuPanel(mouseX, containerWidth) {
        const newMenuWidth = (mouseX / containerWidth) * 100;
        const minWidth = 10;
        const maxWidth = 50;

        if (newMenuWidth >= minWidth && newMenuWidth <= maxWidth) {
            this.elements.menu.style.flex = `0 0 ${newMenuWidth}%`;
        }
    }

    /**
     * Resize side panel
     * @param {number} mouseX - Mouse X position
     * @param {number} containerWidth - Container width
     */
    resizeSidePanel(mouseX, containerWidth) {
        const newSidePanelWidth = ((containerWidth - mouseX) / containerWidth) * 100;
        const minWidth = 15;
        const maxWidth = 60;

        if (newSidePanelWidth >= minWidth && newSidePanelWidth <= maxWidth) {
            this.elements.sidePanel.style.flex = `0 0 ${newSidePanelWidth}%`;
        }
    }

    /**
     * Stop resize operation
     */
    stopResize() {
        if (this.isResizing) {
            this.isResizing = false;
            
            if (this.currentResizer) {
                this.currentResizer.classList.remove('active');
            }
            
            this.currentResizer = null;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    }

    /**
     * Reset panels to default sizes
     */
    resetPanels() {
        const { menu, sidePanel } = this.elements;
        
        if (menu) {
            menu.style.flex = '0 0 20%';
        }
        
        if (sidePanel) {
            sidePanel.style.flex = '0 0 30%';
        }
    }
}

export default ResizerManager;