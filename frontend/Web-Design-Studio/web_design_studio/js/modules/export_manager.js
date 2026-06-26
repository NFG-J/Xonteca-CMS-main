/**
 * ExportManager - Handles export functionality
 */
class ExportManager {
    constructor(canvasManager, notificationManager) {
        this.canvasManager = canvasManager;
        this.notificationManager = notificationManager;
        this.init();
    }

    /**
     * Initialize export manager
     */
    init() {
        this.bindEvents();
    }

    /**
     * Bind export-related events
     */
    bindEvents() {
        const exportButton = document.getElementById('export');
        if (exportButton) {
            exportButton.addEventListener('click', () => this.exportDesign());
        }

        // Add keyboard shortcut for export (Ctrl+E)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                this.exportDesign();
            }
        });
    }

    /**
     * Export the current design as ZIP file
     */
    async exportDesign() {
        try {
            // Check if canvas has any components
            const canvas = document.getElementById('canvas');
            const components = canvas.querySelectorAll('.component-wrapper');
            
            if (components.length === 0) {
                this.notificationManager.showInfo('Nothing to export. Add components to the canvas first.');
                return;
            }

            const exportData = this.generateExportData();
            
            if (!exportData.content.trim()) {
                this.notificationManager.showInfo('Nothing to export. Add components to the canvas first.');
                return;
            }

            await this.downloadAsZip(exportData);
            this.notificationManager.showSuccess('Design exported successfully!');

        } catch (error) {
            console.error('Export failed:', error);
            this.notificationManager.showError('Export failed. Please try again.');
        }
    }

    /**
     * Generate export data from canvas and tabs
     * @returns {Object} Export data
     */
    generateExportData() {
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            throw new Error('Canvas not found');
        }

        const rendered = this.canvasManager?.generateRenderedOutput
            ? this.canvasManager.generateRenderedOutput()
            : { html: '', css: this.extractCSSFromCanvas(canvas), js: '' };

        return {
            content: rendered.html,
            css: rendered.css,
            js: rendered.js,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Extract CSS from canvas style elements
     * @param {HTMLElement} canvas - Canvas element
     * @returns {string} Combined CSS content
     */
    extractCSSFromCanvas(canvas) {
        const styles = canvas.querySelectorAll('style[data-component-style="true"]');
        return Array.from(styles).map(style => style.innerHTML).join('\n');
    }

    /**
     * Generate full HTML document
     * @param {Object} exportData - Export data
     * @returns {string} Complete HTML document
     */
    generateFullHTML(exportData) {
        const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Design - ${this.formatDate(exportData.timestamp)}</title>
    <style>
        /* Reset styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Verdana, Geneva, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
        }
        
        /* Component styles */
        ${exportData.css}
        
        /* Export metadata */
        .export-info {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            z-index: 1000;
        }
        
        @media print {
            .export-info {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="export-info">
        Exported from DesignIT Studio<br>
        ${this.formatDate(exportData.timestamp)}
    </div>
    
    <div class="exported-content">
        ${exportData.content}
    </div>
    ${exportData.js && exportData.js.trim() ? `
    <script>
        ${exportData.js}
    </script>` : ''}
</body>
</html>`;

        return template;
    }

    /**
     * Open HTML in new tab
     * @param {string} htmlContent - HTML content to open
     */
    openInNewTab(htmlContent) {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const newWindow = window.open(url, '_blank');
        
        if (!newWindow) {
            // Fallback for popup blockers
            this.downloadAsFile(htmlContent);
        } else {
            // Clean up URL after a delay
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);
        }
    }

    /**
     * Download as ZIP file containing HTML and CSS
     * @param {Object} exportData - Export data with content and CSS
     */
    async downloadAsZip(exportData) {
        // Use JSZip if available, otherwise fall back to manual ZIP creation
        if (typeof JSZip !== 'undefined') {
            const zip = new JSZip();
            
            // Add HTML file
            const htmlContent = this.generateFullHTML(exportData);
            zip.file('index.html', htmlContent);
            
            // Add CSS file if there's any CSS content
            if (exportData.css && exportData.css.trim()) {
                zip.file('styles.css', exportData.css);
            }
            
            // Add JavaScript file if there's any JS content
            if (exportData.js && exportData.js.trim()) {
                zip.file('script.js', exportData.js);
            }
            
            // Generate ZIP file
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            // Download the ZIP file
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `design-export-${this.formatDateForFilename(new Date())}.zip`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
        } else {
            // Fallback: download HTML file only
            const htmlContent = this.generateFullHTML(exportData);
            this.downloadAsFile(htmlContent);
        }
    }

    /**
     * Download as file (fallback for popup blockers or when JSZip is not available)
     * @param {string} htmlContent - HTML content to download
     */
    downloadAsFile(htmlContent) {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `design-export-${this.formatDateForFilename(new Date())}.html`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Format date for display
     * @param {string} isoString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString();
    }

    /**
     * Format date for filename
     * @param {Date} date - Date object
     * @returns {string} Filename-safe date string
     */
    formatDateForFilename(date) {
        return date.toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .substring(0, 19);
    }

    /**
     * Export as JSON (for backup/import functionality)
     * @returns {string} JSON export data
     */
    exportAsJSON() {
        const exportData = this.generateExportData();
        
        const jsonData = {
            ...exportData,
            version: '1.0',
            source: 'DesignIT Studio'
        };

        return JSON.stringify(jsonData, null, 2);
    }

    /**
     * Get export statistics
     * @returns {Object} Export statistics
     */
    getExportStats() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return null;

        const components = canvas.querySelectorAll('.component-wrapper');
        const styles = canvas.querySelectorAll('style[data-component-style="true"]');

        return {
            componentCount: components.length,
            styleCount: styles.length,
            contentLength: canvas.innerHTML.length,
            lastModified: new Date().toISOString()
        };
    }
}

export default ExportManager;
