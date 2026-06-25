from django.core.validators import RegexValidator
from django.db import migrations, models


def create_default_site_settings(apps, schema_editor):
    SiteSettings = apps.get_model("cms", "SiteSettings")
    SiteSettings.objects.get_or_create(pk=1)


class Migration(migrations.Migration):
    dependencies = [
        ("cms", "0003_builder_draft_publish_state"),
    ]

    operations = [
        migrations.CreateModel(
            name="SiteSettings",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("site_name", models.CharField(default="AgentCMS", max_length=120)),
                ("hero_eyebrow", models.CharField(default="Content hub", max_length=120)),
                ("hero_title", models.CharField(default="Welcome to AgentCMS", max_length=180)),
                (
                    "hero_copy",
                    models.TextField(
                        default="Browse published pages, keep your docs tidy, and ship updates fast."
                    ),
                ),
                ("footer_text", models.CharField(default="Local dev", max_length=160)),
                (
                    "background_color",
                    models.CharField(
                        default="#f7f8fc",
                        max_length=7,
                        validators=[
                            RegexValidator(
                                message="Enter a hex colour in the format #RRGGBB.",
                                regex="^#[0-9A-Fa-f]{6}$",
                            )
                        ],
                    ),
                ),
                (
                    "surface_color",
                    models.CharField(
                        default="#ffffff",
                        max_length=7,
                        validators=[
                            RegexValidator(
                                message="Enter a hex colour in the format #RRGGBB.",
                                regex="^#[0-9A-Fa-f]{6}$",
                            )
                        ],
                    ),
                ),
                (
                    "text_color",
                    models.CharField(
                        default="#1e1f3a",
                        max_length=7,
                        validators=[
                            RegexValidator(
                                message="Enter a hex colour in the format #RRGGBB.",
                                regex="^#[0-9A-Fa-f]{6}$",
                            )
                        ],
                    ),
                ),
                (
                    "muted_text_color",
                    models.CharField(
                        default="#5f6481",
                        max_length=7,
                        validators=[
                            RegexValidator(
                                message="Enter a hex colour in the format #RRGGBB.",
                                regex="^#[0-9A-Fa-f]{6}$",
                            )
                        ],
                    ),
                ),
                (
                    "border_color",
                    models.CharField(
                        default="#e3e6f0",
                        max_length=7,
                        validators=[
                            RegexValidator(
                                message="Enter a hex colour in the format #RRGGBB.",
                                regex="^#[0-9A-Fa-f]{6}$",
                            )
                        ],
                    ),
                ),
                (
                    "brand_color",
                    models.CharField(
                        default="#4f46e5",
                        max_length=7,
                        validators=[
                            RegexValidator(
                                message="Enter a hex colour in the format #RRGGBB.",
                                regex="^#[0-9A-Fa-f]{6}$",
                            )
                        ],
                    ),
                ),
                (
                    "brand_dark_color",
                    models.CharField(
                        default="#3a35b8",
                        max_length=7,
                        validators=[
                            RegexValidator(
                                message="Enter a hex colour in the format #RRGGBB.",
                                regex="^#[0-9A-Fa-f]{6}$",
                            )
                        ],
                    ),
                ),
                (
                    "accent_soft_color",
                    models.CharField(
                        default="#eef0ff",
                        max_length=7,
                        validators=[
                            RegexValidator(
                                message="Enter a hex colour in the format #RRGGBB.",
                                regex="^#[0-9A-Fa-f]{6}$",
                            )
                        ],
                    ),
                ),
                (
                    "hero_end_color",
                    models.CharField(
                        default="#f3f4ff",
                        max_length=7,
                        validators=[
                            RegexValidator(
                                message="Enter a hex colour in the format #RRGGBB.",
                                regex="^#[0-9A-Fa-f]{6}$",
                            )
                        ],
                    ),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Site settings",
                "verbose_name_plural": "Site settings",
            },
        ),
        migrations.RunPython(create_default_site_settings, migrations.RunPython.noop),
    ]
