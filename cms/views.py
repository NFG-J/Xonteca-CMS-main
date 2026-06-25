import json

from django.contrib.admin.views.decorators import staff_member_required
from django.core.exceptions import ValidationError
from django.db import transaction
from django.http import HttpResponseBadRequest, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST

from .builder_adapter import (
    MAX_BUILDER_PAYLOAD_LENGTH,
    builder_state_for_page,
    validate_builder_payload,
)
from .models import Page


BUILDER_DRAFT_FIELDS = [
    "builder_json",
    "draft_html",
    "draft_css",
    "draft_js",
    "is_builder_page",
    "builder_updated_at",
]

BUILDER_PUBLISH_FIELDS = [
    "published_html",
    "published_css",
    "published_js",
    "is_builder_page",
    "is_published",
    "builder_published_at",
]


def parse_json_payload(request):
    if len(request.body) > MAX_BUILDER_PAYLOAD_LENGTH:
        return None, HttpResponseBadRequest("Payload exceeds max size.")

    if not request.body.strip():
        return {}, None

    try:
        return json.loads(request.body.decode("utf-8")), None
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None, HttpResponseBadRequest("Invalid JSON payload.")


def apply_builder_draft(page, builder_json, rendered, timestamp):
    page.builder_json = builder_json
    page.draft_html = rendered["html"]
    page.draft_css = rendered["css"]
    page.draft_js = rendered["js"]
    page.is_builder_page = True
    page.builder_updated_at = timestamp


def apply_builder_publish(page, timestamp):
    page.published_html = page.draft_html
    page.published_css = page.draft_css
    page.published_js = page.draft_js
    page.is_builder_page = True
    page.is_published = True
    page.builder_published_at = timestamp


def index(request):
    pages = Page.objects.filter(is_published=True).order_by("title")
    return render(request, "cms/index.html", {"pages": pages})


def page_detail(request, slug):
    page = get_object_or_404(Page, slug=slug, is_published=True)
    return render(request, "cms/page_detail.html", {"page": page})


@staff_member_required
def builder_editor(request, page_id):
    page = get_object_or_404(Page, pk=page_id)
    return render(request, "cms/builder_editor.html", {"page": page})


@staff_member_required
@require_GET
def builder_state(request, page_id):
    page = get_object_or_404(Page, pk=page_id)
    return JsonResponse(builder_state_for_page(page))


@staff_member_required
@require_POST
def builder_save(request, page_id):
    page = get_object_or_404(Page, pk=page_id)

    payload, error_response = parse_json_payload(request)
    if error_response:
        return error_response

    try:
        builder_json, rendered = validate_builder_payload(payload)
    except ValidationError as error:
        return HttpResponseBadRequest("; ".join(error.messages))

    apply_builder_draft(page, builder_json, rendered, timezone.now())
    page.save(update_fields=[*BUILDER_DRAFT_FIELDS, "updated_at"])

    return JsonResponse(
        {
            "status": "ok",
            "page_id": page.id,
            "builder_updated_at": page.builder_updated_at.isoformat(),
        }
    )


@staff_member_required
@require_POST
def builder_publish(request, page_id):
    payload, error_response = parse_json_payload(request)
    if error_response:
        return error_response

    with transaction.atomic():
        page = get_object_or_404(Page.objects.select_for_update(), pk=page_id)
        update_fields = [*BUILDER_PUBLISH_FIELDS, "updated_at"]

        if payload:
            try:
                builder_json, rendered = validate_builder_payload(payload)
            except ValidationError as error:
                return HttpResponseBadRequest("; ".join(error.messages))

            apply_builder_draft(page, builder_json, rendered, timezone.now())
            update_fields = [*BUILDER_DRAFT_FIELDS, *BUILDER_PUBLISH_FIELDS, "updated_at"]

        if not page.builder_json:
            return HttpResponseBadRequest("Save a builder draft before publishing.")

        apply_builder_publish(page, timezone.now())
        page.save(update_fields=update_fields)

    return JsonResponse(
        {
            "status": "ok",
            "page_id": page.id,
            "builder_updated_at": page.builder_updated_at.isoformat() if page.builder_updated_at else None,
            "builder_published_at": page.builder_published_at.isoformat(),
        }
    )
