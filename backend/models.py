from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    currency = models.CharField(max_length=10, default='USD')

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    color = models.CharField(max_length=7, default='#000000')
    type = models.CharField(max_length=10, choices=[('expense', 'Expense'), ('income', 'Income')], default='expense')

    def __str__(self):
        return self.name

class Transaction(models.Model):
    description = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    category = models.CharField(max_length=100, default="N/A")  # ← Must be here
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.title} - ${self.amount}"
from django.db import models

class Budget(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.DateField()  # just use the first day of the month for reference
    
    def __str__(self):
        return f"{self.category} - {self.month.strftime('%B %Y')}"
