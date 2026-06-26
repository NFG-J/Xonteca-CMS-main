from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("cms", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="page",
            name="css_content",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="page",
            name="html_content",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="page",
            name="is_builder_page",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="page",
            name="js_content",
            field=models.TextField(blank=True, default=""),
        ),
    ]
