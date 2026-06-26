from django.apps import AppConfig


class CmsConfig(AppConfig):
    name = 'cms'

    def ready(self):
        from .plugins.loader import load_plugins

        load_plugins()
