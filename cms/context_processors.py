from django.db import OperationalError, ProgrammingError

from .models import Page, SiteSettings

def menu_pages(request):
    pages = Page.objects.filter(is_published=True).order_by("title")
    try:
        site_settings = SiteSettings.load()
    except (OperationalError, ProgrammingError):
        site_settings = SiteSettings()

    return {
        "menu_pages": pages,
        "site_settings": site_settings,
    }
