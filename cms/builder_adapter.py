import json
import re
from html import escape

from django.core.exceptions import ValidationError


BUILDER_STATE_VERSION = 1
MAX_COMPONENTS = 200
MAX_COMPONENT_FIELD_LENGTH = 500_000
MAX_RENDERED_FIELD_LENGTH = 750_000
MAX_BUILDER_JSON_LENGTH = 1_500_000
MAX_BUILDER_PAYLOAD_LENGTH = 3_000_000

COMPONENT_ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,80}$")
SCRIPT_TAG_RE = re.compile(r"<\s*/?\s*script\b", re.IGNORECASE)
JAVASCRIPT_URL_RE = re.compile(r"javascript\s*:", re.IGNORECASE)


def starter_builder_state_from_legacy(page):
    html = (page.sanitized_body or "").strip()
    components = []

    if html:
        components.append(
            {
                "id": f"legacy-{page.pk}",
                "title": "Legacy content",
                "type": "legacy",
                "html": html,
                "css": "",
                "js": "",
                "reference": "Imported from the legacy page body.",
            }
        )

    return {
        "version": BUILDER_STATE_VERSION,
        "source": "legacy",
        "components": components,
    }


def builder_state_for_page(page):
    if page.builder_json:
        state = normalize_builder_state(page.builder_json)
        source = "builder"
    else:
        state = starter_builder_state_from_legacy(page)
        source = "legacy"

    rendered = render_builder_state(state)

    has_saved_draft = bool(
        page.draft_html.strip() or page.draft_css.strip() or page.draft_js.strip()
    )
    draft_html = page.draft_html if has_saved_draft else rendered["html"]
    draft_css = page.draft_css if has_saved_draft else rendered["css"]
    draft_js = page.draft_js if has_saved_draft else rendered["js"]

    return {
        "builder_json": state,
        "source": source,
        "draft_html": draft_html,
        "draft_css": draft_css,
        "draft_js": draft_js,
        "published_html": page.published_html,
        "published_css": page.published_css,
        "published_js": page.published_js,
        "is_builder_page": page.is_builder_page,
        "builder_updated_at": page.builder_updated_at.isoformat() if page.builder_updated_at else None,
        "builder_published_at": page.builder_published_at.isoformat()
        if page.builder_published_at
        else None,
    }


def validate_builder_payload(payload):
    if not isinstance(payload, dict):
        raise ValidationError("Payload must be a JSON object.")

    if "builder_json" not in payload:
        raise ValidationError("builder_json is required.")

    builder_json = normalize_builder_state(payload["builder_json"])
    encoded_state = json.dumps(builder_json, separators=(",", ":"))
    if len(encoded_state) > MAX_BUILDER_JSON_LENGTH:
        raise ValidationError("builder_json exceeds max size.")

    rendered_payload = payload.get("rendered", {})
    if rendered_payload and not isinstance(rendered_payload, dict):
        raise ValidationError("rendered must be an object.")

    for field in ("html", "css", "js"):
        value = rendered_payload.get(field, "")
        if not isinstance(value, str):
            raise ValidationError(f"rendered.{field} must be a string.")
        if len(value) > MAX_RENDERED_FIELD_LENGTH:
            raise ValidationError(f"rendered.{field} exceeds max size.")

    rendered = render_builder_state(builder_json)
    validate_rendered_fields(rendered["html"], rendered["css"], rendered["js"])

    return builder_json, rendered


def normalize_builder_state(value):
    if not isinstance(value, dict):
        raise ValidationError("builder_json must be an object.")

    raw_components = value.get("components", [])
    if not isinstance(raw_components, list):
        raise ValidationError("builder_json.components must be a list.")
    if len(raw_components) > MAX_COMPONENTS:
        raise ValidationError("builder_json.components exceeds max count.")

    components = []
    for index, raw_component in enumerate(raw_components):
        if not isinstance(raw_component, dict):
            raise ValidationError("Each component must be an object.")
        components.append(normalize_component(raw_component, index))

    return {
        "version": BUILDER_STATE_VERSION,
        "source": string_value(value.get("source", "builder"), "source", max_length=40),
        "components": components,
    }


def normalize_component(raw_component, index):
    component_id = string_value(raw_component.get("id", ""), "component.id", max_length=80).strip()
    if not component_id:
        component_id = f"component-{index + 1}"
    if not COMPONENT_ID_RE.match(component_id):
        component_id = f"component-{index + 1}"

    component = {
        "id": component_id,
        "title": string_value(raw_component.get("title", "Component"), "component.title", max_length=200),
        "type": string_value(raw_component.get("type", "html"), "component.type", max_length=40),
        "html": string_value(raw_component.get("html", ""), "component.html"),
        "css": string_value(raw_component.get("css", ""), "component.css"),
        "js": string_value(raw_component.get("js", ""), "component.js"),
        "reference": string_value(raw_component.get("reference", ""), "component.reference"),
    }

    validate_component_html(component["html"])
    validate_component_css(component["css"])
    validate_component_js(component["js"])

    return component


def string_value(value, field_name, max_length=MAX_COMPONENT_FIELD_LENGTH):
    if value is None:
        value = ""
    if not isinstance(value, str):
        raise ValidationError(f"{field_name} must be a string.")
    if len(value) > max_length:
        raise ValidationError(f"{field_name} exceeds max size.")
    return value


def render_builder_state(state):
    normalized_state = normalize_builder_state(state)
    html_parts = []
    css_parts = []
    js_parts = []

    for component in normalized_state["components"]:
        component_id = component["id"]
        html_parts.append(
            '<div class="agentcms-builder-component" data-builder-component-id="{}">{}</div>'.format(
                escape(component_id, quote=True),
                component["html"],
            )
        )

        if component["css"].strip():
            css_parts.append(component["css"])

        if component["js"].strip():
            selector = f'[data-builder-component-id="{component_id}"]'
            js_parts.append(
                "(function() {\n"
                f"  const componentRoot = document.querySelector({json.dumps(selector)});\n"
                "  if (!componentRoot) {\n"
                "    return;\n"
                "  }\n"
                f"{component['js']}\n"
                "}());"
            )

    return {
        "html": "\n".join(html_parts),
        "css": "\n\n".join(css_parts),
        "js": "\n\n".join(js_parts),
    }


def validate_rendered_fields(html, css, js):
    validate_component_html(html)
    validate_component_css(css)
    validate_component_js(js)


def validate_component_html(html):
    if SCRIPT_TAG_RE.search(html):
        raise ValidationError("Builder HTML cannot contain script tags; use the JS field instead.")
    if JAVASCRIPT_URL_RE.search(html):
        raise ValidationError("Builder HTML cannot contain javascript: URLs.")


def validate_component_css(css):
    if "</style" in css.lower():
        raise ValidationError("Builder CSS cannot contain closing style tags.")


def validate_component_js(js):
    if "</script" in js.lower():
        raise ValidationError("Builder JS cannot contain closing script tags.")
