from django.contrib import admin
from .models import Product
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_URL = '/media/'               # URL to access files
MEDIA_ROOT = BASE_DIR / 'media'
admin.site.register(Product)
