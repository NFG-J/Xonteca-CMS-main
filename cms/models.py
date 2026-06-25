from django.core.validators import RegexValidator
from django.db import models
from django.utils.text import slugify
import bleach


ALLOWED_TAGS = [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
]

ALLOWED_ATTRIBUTES = {
    "a": ["href", "title", "rel", "target"],
}

hex_color_validator = RegexValidator(
    regex=r"^#[0-9A-Fa-f]{6}$",
    message="Enter a hex colour in the format #RRGGBB.",
)


class Page(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    body = models.TextField(blank=True)
    builder_json = models.JSONField(blank=True, default=dict)
    draft_html = models.TextField(blank=True, default="")
    draft_css = models.TextField(blank=True, default="")
    draft_js = models.TextField(blank=True, default="")
    published_html = models.TextField(blank=True, default="")
    published_css = models.TextField(blank=True, default="")
    published_js = models.TextField(blank=True, default="")
    is_builder_page = models.BooleanField(default=False)
    builder_updated_at = models.DateTimeField(blank=True, null=True)
    builder_published_at = models.DateTimeField(blank=True, null=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def sanitized_body(self):
        return bleach.clean(
            self.body,
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRIBUTES,
            strip=True,
        )

    def __str__(self):
        return self.title

    @property
    def has_builder_content(self):
        return self.has_published_builder_content

    @property
    def has_published_builder_content(self):
        return bool(
            self.is_builder_page
            and (
                self.builder_published_at
                or self.published_html.strip()
                or self.published_css.strip()
                or self.published_js.strip()
            )
        )


class SiteSettings(models.Model):
    site_name = models.CharField(max_length=120, default="AgentCMS")
    hero_eyebrow = models.CharField(max_length=120, default="Content hub")
    hero_title = models.CharField(max_length=180, default="Welcome to AgentCMS")
    hero_copy = models.TextField(
        default="Browse published pages, keep your docs tidy, and ship updates fast."
    )
    footer_text = models.CharField(max_length=160, default="Local dev")
    background_color = models.CharField(
        max_length=7,
        default="#f7f8fc",
        validators=[hex_color_validator],
    )
    surface_color = models.CharField(
        max_length=7,
        default="#ffffff",
        validators=[hex_color_validator],
    )
    text_color = models.CharField(
        max_length=7,
        default="#1e1f3a",
        validators=[hex_color_validator],
    )
    muted_text_color = models.CharField(
        max_length=7,
        default="#5f6481",
        validators=[hex_color_validator],
    )
    border_color = models.CharField(
        max_length=7,
        default="#e3e6f0",
        validators=[hex_color_validator],
    )
    brand_color = models.CharField(
        max_length=7,
        default="#4f46e5",
        validators=[hex_color_validator],
    )
    brand_dark_color = models.CharField(
        max_length=7,
        default="#3a35b8",
        validators=[hex_color_validator],
    )
    accent_soft_color = models.CharField(
        max_length=7,
        default="#eef0ff",
        validators=[hex_color_validator],
    )
    hero_end_color = models.CharField(
        max_length=7,
        default="#f3f4ff",
        validators=[hex_color_validator],
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site settings"
        verbose_name_plural = "Site settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        return None

    def __str__(self):
        return self.site_name

    @classmethod
    def load(cls):
        settings, _ = cls.objects.get_or_create(pk=1)
        return settings
