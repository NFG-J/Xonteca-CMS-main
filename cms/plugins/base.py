import json
from abc import ABC, abstractmethod


class AgentCMSPlugin(ABC):
    id = ""
    name = ""
    version = "0.1.0"
    description = ""
    plugin_type = "integration"

    def get_tools(self):
        return []

    def get_components(self):
        return []

    def health_check(self):
        return {"status": "ok"}

    def get_manifest(self):
        manifest = {
            "id": self.id,
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "plugin_type": self.plugin_type,
            "tools": self.get_tools(),
            "components": self.get_components(),
            "health": self.health_check(),
        }
        return ensure_json_safe(manifest)

    @abstractmethod
    def execute(self, action, inputs, config=None):
        raise NotImplementedError


def ensure_json_safe(value):
    try:
        return json.loads(json.dumps(value))
    except TypeError as error:
        raise ValueError("Plugin manifest data must be JSON serializable.") from error
