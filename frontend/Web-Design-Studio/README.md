# DesignIT - Web Design Studio

A drag-and-drop web design studio for creating and exporting HTML components with visual editing capabilities.

![webDesignStudio_HTML (1)](https://github.com/user-attachments/assets/a804e155-193c-4ddf-8249-f419f2aaeac5)

## Features

- **Drag & Drop Interface**: Intuitive component placement on canvas
- **Component Library**: Pre-built HTML, JavaScript, and API components
- **Visual Editing**: Real-time preview and editing
- **Undo/Redo**: Full history management for design changes
- **Export Functionality**: Download complete HTML and CSS files as ZIP
- **Resizable Components**: Adjust component dimensions on the canvas
- **Copy/Paste Support**: Duplicate and reuse components
- **Tab-based Navigation**: Organize components by category (HTML, JS, API)

![webDesignStudio_APIs](https://github.com/user-attachments/assets/df2aca06-0189-4123-944f-738f1e1cec1d)


## Project Structure

```
web_design_studio/
├── index.html              # Main application entry point
├── css/
│   └── studio_style.css    # Application styles
├── data/
│   ├── html_components.json    # HTML component library
│   ├── js_components.json      # JavaScript component library
│   └── api_components.json     # API component library
├── js/
│   ├── app.js              # Main application controller
│   └── modules/            # Modular functionality
│       ├── canvas_manager.js
│       ├── component_manager.js
│       ├── copy_manager.js
│       ├── dropdown_manager.js
│       ├── error_handler.js
│       ├── export_manager.js
│       ├── history_manager.js
│       ├── notification_manager.js
│       ├── resizer_manager.js
│       └── tab_manager.js
└── img/                    # Images and assets
```

## Getting Started

1. Open `index.html` in a modern web browser
2. Browse components in the left sidebar organized by tabs (HTML, JS, API)
3. Drag components onto the canvas to build your design
4. Resize and arrange components as needed
5. Use Undo/Redo buttons to manage changes
6. Export your design as a ZIP file containing HTML and CSS

## Requirements

- Modern web browser with ES6 module support
- No additional dependencies or build tools required

## Keyboard Shortcuts

- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Delete**: Remove selected component

## Development

The application uses vanilla JavaScript with ES6 modules for a modular architecture. Each manager handles a specific aspect of functionality:

- **CanvasManager**: Handles component placement and interaction
- **ComponentManager**: Manages component library and rendering
- **HistoryManager**: Tracks and manages undo/redo state
- **ExportManager**: Generates and packages output files
- **NotificationManager**: User feedback and alerts

---


**DesignIT** - Build web components visually, export instantly.
