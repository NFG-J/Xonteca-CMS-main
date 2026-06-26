import re

from .base import AgentCMSPlugin


PLUGIN_ID_RE = re.compile(r"^[a-z0-9][a-z0-9_.-]{0,99}$")


class PluginRegistryError(Exception):
    pass


class InvalidPluginError(PluginRegistryError):
    pass


class PluginAlreadyRegisteredError(PluginRegistryError):
    pass


class PluginNotFoundError(PluginRegistryError, KeyError):
    pass


class PluginRegistry:
    def __init__(self):
        self._plugins = {}

    def register(self, plugin):
        self._validate_plugin(plugin)
        if plugin.id in self._plugins:
            raise PluginAlreadyRegisteredError(f"Plugin already registered: {plugin.id}")
        self._plugins[plugin.id] = plugin
        return plugin

    def get(self, plugin_id):
        try:
            return self._plugins[plugin_id]
        except KeyError as error:
            raise PluginNotFoundError(f"Plugin not found: {plugin_id}") from error

    def list_plugins(self):
        return list(self._plugins.values())

    def manifests(self):
        return [plugin.get_manifest() for plugin in self.list_plugins()]

    def clear(self):
        self._plugins.clear()

    def _validate_plugin(self, plugin):
        if not isinstance(plugin, AgentCMSPlugin):
            raise InvalidPluginError("Plugin must be an AgentCMSPlugin instance.")

        if not isinstance(plugin.id, str) or not PLUGIN_ID_RE.match(plugin.id):
            raise InvalidPluginError(
                "Plugin id must be 1-100 lowercase letters, numbers, dots, hyphens, or underscores."
            )

        if not isinstance(plugin.name, str) or not plugin.name.strip():
            raise InvalidPluginError("Plugin name is required.")


registry = PluginRegistry()
