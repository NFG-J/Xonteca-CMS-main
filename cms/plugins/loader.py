from django.conf import settings
from django.utils.module_loading import import_string

from .base import AgentCMSPlugin
from .registry import InvalidPluginError, registry


_loaded_plugin_paths = set()


def load_plugins(plugin_paths=None):
    if plugin_paths is None:
        plugin_paths = getattr(settings, "AGENTCMS_PLUGINS", [])

    for plugin_path in plugin_paths:
        if plugin_path in _loaded_plugin_paths:
            continue

        plugin_factory = import_string(plugin_path)
        plugin = plugin_factory() if isinstance(plugin_factory, type) else plugin_factory
        if not isinstance(plugin, AgentCMSPlugin):
            raise InvalidPluginError(f"{plugin_path} did not resolve to an AgentCMSPlugin.")

        registry.register(plugin)
        _loaded_plugin_paths.add(plugin_path)

    return registry


def reset_plugin_loader():
    _loaded_plugin_paths.clear()
