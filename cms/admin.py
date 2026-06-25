from django.contrib import admin
from django import forms
from django.urls import reverse
from django.utils.html import format_html
from tinymce.widgets import TinyMCE


from .models import Page, SiteSettings


class PageAdminForm(forms.ModelForm):
    class Meta:
        model = Page
        fields = "__all__"
        widgets = {
            "body": TinyMCE(
                attrs={"cols": 80, "rows": 24},
                mce_attrs={
                    "menubar": False,
                    "plugins": "lists link",
                    "toolbar": "undo redo | formatselect | bold italic | bullist numlist | link",
                },
            )
        }


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    form = PageAdminForm
    list_display = (
        "title",
        "slug",
        "is_published",
        "is_builder_page",
        "builder_updated_at",
        "builder_published_at",
        "updated_at",
    )
    list_filter = ("is_published", "is_builder_page")
    search_fields = ("title", "body", "published_html", "draft_html")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = (
        "builder_editor_link",
        "builder_json",
        "draft_html",
        "draft_css",
        "draft_js",
        "published_html",
        "published_css",
        "published_js",
        "builder_updated_at",
        "builder_published_at",
    )
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "title",
                    "slug",
                    "is_published",
                    "is_builder_page",
                    "builder_editor_link",
                )
            },
        ),
        ("Legacy content", {"fields": ("body",)}),
        (
            "Builder draft",
            {
                "classes": ("collapse",),
                "fields": (
                    "builder_json",
                    "draft_html",
                    "draft_css",
                    "draft_js",
                    "builder_updated_at",
                ),
            },
        ),
        (
            "Published builder output",
            {
                "classes": ("collapse",),
                "fields": (
                    "published_html",
                    "published_css",
                    "published_js",
                    "builder_published_at",
                ),
            },
        ),
    )

    def builder_editor_link(self, obj):
        if not obj or not obj.pk:
            return "Save this page first to open the builder editor."
        url = reverse("builder_editor", kwargs={"page_id": obj.pk})
        return format_html('<a class="button" href="{}">Open Builder</a>', url)

    builder_editor_link.short_description = "Builder"


class SiteSettingsAdminForm(forms.ModelForm):
    class Meta:
        model = SiteSettings
        fields = "__all__"
        widgets = {
            "background_color": forms.TextInput(attrs={"type": "color"}),
            "surface_color": forms.TextInput(attrs={"type": "color"}),
            "text_color": forms.TextInput(attrs={"type": "color"}),
            "muted_text_color": forms.TextInput(attrs={"type": "color"}),
            "border_color": forms.TextInput(attrs={"type": "color"}),
            "brand_color": forms.TextInput(attrs={"type": "color"}),
            "brand_dark_color": forms.TextInput(attrs={"type": "color"}),
            "accent_soft_color": forms.TextInput(attrs={"type": "color"}),
            "hero_end_color": forms.TextInput(attrs={"type": "color"}),
        }


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    form = SiteSettingsAdminForm
    list_display = ("site_name", "brand_color", "background_color", "updated_at")
    readonly_fields = ("updated_at",)
    fieldsets = (
        (
            "Branding",
            {
                "fields": (
                    "site_name",
                    "hero_eyebrow",
                    "hero_title",
                    "hero_copy",
                    "footer_text",
                )
            },
        ),
        (
            "Colours",
            {
                "fields": (
                    "background_color",
                    "surface_color",
                    "text_color",
                    "muted_text_color",
                    "border_color",
                    "brand_color",
                    "brand_dark_color",
                    "accent_soft_color",
                    "hero_end_color",
                )
            },
        ),
        ("Metadata", {"fields": ("updated_at",)}),
    )

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
