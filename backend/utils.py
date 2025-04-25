# backend/utils.py  (new file or anywhere convenient)

from .models import Category

DEFAULT_CATEGORIES = [
    {"name": "Food",           "type": "expense", "color": "#FF7043"},
    {"name": "Transportation", "type": "expense", "color": "#4FC3F7"},
    {"name": "Utilities",      "type": "expense", "color": "#9E9E9E"},
    {"name": "Entertainment",  "type": "expense", "color": "#BA68C8"},
    {"name": "Income",         "type": "income",  "color": "#66BB6A"},
]

def create_default_categories(user):
    """Create the 5 basic categories for a brand-new user."""
    for cat in DEFAULT_CATEGORIES:
        # unique_together = ("user","name") prevents duplicates
        Category.objects.get_or_create(user=user, name=cat["name"], defaults=cat)
