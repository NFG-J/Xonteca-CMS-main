from django.urls import path
from .views import builder_editor, builder_publish, builder_save, builder_state, index, page_detail

urlpatterns = [
    path('', index, name='index'),
    path('home/', index, name='home'),
    path("cms/pages/<int:page_id>/builder/", builder_editor, name="builder_editor"),
    path("cms/api/pages/<int:page_id>/builder-state", builder_state, name="builder_state"),
    path("cms/api/pages/<int:page_id>/builder-save", builder_save, name="builder_save"),
    path("cms/api/pages/<int:page_id>/builder-publish", builder_publish, name="builder_publish"),
    path('<slug:slug>/', page_detail, name='page_detail'),
]
