from django.db import migrations, models
from django.utils import timezone


def migrate_existing_builder_content(apps, schema_editor):
    Page = apps.get_model("cms", "Page")
    now = timezone.now()

    for page in Page.objects.all():
        has_draft = bool(
            (page.draft_html or "").strip()
            or (page.draft_css or "").strip()
            or (page.draft_js or "").strip()
        )
        if not has_draft:
            continue

        page.published_html = page.draft_html
        page.published_css = page.draft_css
        page.published_js = page.draft_js
        page.builder_updated_at = page.builder_updated_at or now
        page.builder_published_at = page.builder_published_at or now
        page.is_builder_page = True
        page.builder_json = {
            "version": 1,
            "source": "migration",
            "components": [
                {
                    "id": f"migrated-{page.pk}",
                    "title": "Migrated builder content",
                    "type": "migration",
                    "html": page.draft_html,
                    "css": page.draft_css,
                    "js": page.draft_js,
                    "reference": "Imported from pre-draft builder fields.",
                }
            ],
        }
        page.save(
            update_fields=[
                "published_html",
                "published_css",
                "published_js",
                "builder_updated_at",
                "builder_published_at",
                "is_builder_page",
                "builder_json",
            ]
        )


class Migration(migrations.Migration):
    dependencies = [
        ("cms", "0002_page_builder_fields"),
    ]

    operations = [
        migrations.RenameField(
            model_name="page",
            old_name="html_content",
            new_name="draft_html",
        ),
        migrations.RenameField(
            model_name="page",
            old_name="css_content",
            new_name="draft_css",
        ),
        migrations.RenameField(
            model_name="page",
            old_name="js_content",
            new_name="draft_js",
        ),
        migrations.AddField(
            model_name="page",
            name="builder_json",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="page",
            name="builder_published_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="page",
            name="builder_updated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="page",
            name="published_css",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="page",
            name="published_html",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="page",
            name="published_js",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.RunPython(migrate_existing_builder_content, migrations.RunPython.noop),
    ]
