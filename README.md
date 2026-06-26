Xonteca CMS is forked from https://github.com/vicnorm/AgentCMS-v2. Changes: The page builder is
fixed and the site settings can be edited. See the original's ReadMe for installation tips!

Xonteca CMS / AgentCMS is a lightweight Content Management System built with Python/Django.
It allows administrators to create and manage simple website pages through the Django admin panel.

This version (v2) allow for a plugin structure, where developer can build plugins with different 
features and connectors, that can be added to the CMS.

Copied from original:
AgentCMS/
|-- cms/                                      # Main Django CMS application
|   |-- migrations/                           # Database migrations for Page and builder fields
|   |-- static/cms/                           # CMS styles and Django builder integration script
|   |   |-- builder_integration.js
|   |   `-- style.css
|   |-- templates/cms/                        # Django templates for pages and builder editor
|   |   |-- base.html
|   |   |-- builder_editor.html
|   |   |-- index.html
|   |   `-- page_detail.html
|   |-- admin.py                              # Django admin configuration
|   |-- apps.py                               # CMS app configuration
|   |-- builder_adapter.py                    # Builder payload validation and rendering
|   |-- context_processors.py                 # Navigation menu support
|   |-- models.py                             # Page model and builder content fields
|   |-- tests.py                              # CMS and builder endpoint tests
|   |-- urls.py                               # CMS URL routes
|   `-- views.py                              # Page and builder views
|
|-- config/                                   # Django project configuration
|   |-- asgi.py
|   |-- settings.py                           # Settings, installed apps, static files, TinyMCE
|   |-- urls.py                               # Root URL configuration
|   `-- wsgi.py
|
|-- frontend/
|   `-- Web-Design-Studio/                    # Standalone visual web builder
|       |-- README.md                         # Builder-specific documentation
|       `-- web_design_studio/
|           |-- css/studio_style.css          # Builder UI styles
|           |-- data/                         # HTML, JS, API component libraries and spreadsheets
|           |-- img/design_it_logo.png        # Builder image assets
|           |-- js/app.js                     # Builder entry script
|           |-- js/modules/                   # Builder managers for canvas, export, history, etc.
|           |-- excel_to_json2.py             # Spreadsheet-to-JSON component conversion
|           `-- index.html                    # Standalone builder entry point
|
|-- .gitignore                                # Ignored local/generated files
|-- manage.py                                 # Django management entry point
|-- requirements.txt                          # Python dependencies
`-- README.md                                 # Project documentation


nstallation Guide (Local Setup)
1. Clone the Repository
git clone https://github.com/vicnorm/AgentCMS.git
cd AgentCMS
2. Create a Virtual Environment
macOS / Linux

python3 -m venv .venv
source .venv/bin/activate
Windows (CMD)

python -m venv .venv
.venv\Scripts\activate.bat
Windows (PowerShell)

python -m venv .venv
.\.venv\Scripts\Activate.ps1
3. Install Dependencies
python -m pip install -r requirements.txt
4. Apply Database Migrations
python manage.py migrate
5. Create an Admin User
python manage.py createsuperuser
Follow the prompts to create a login.

6. Start the Development Server
python manage.py runserver
Open in your browser:

Website: http://127.0.0.1:8000/
Admin panel: http://127.0.0.1:8000/admin/
On macOS/Linux, you may need to use:

python3 manage.py runserver
Using the CMS
Log into the admin panel: http://127.0.0.1:8000/admin/
Create a new Page with:
Title
Body text
Slug (URL name)
Mark as published
View the page on the site:
http://127.0.0.1:8000/<slug>/
Example:

http://127.0.0.1:8000/home/
Published pages also appear automatically in the navigation menu.









