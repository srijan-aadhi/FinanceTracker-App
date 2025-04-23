from django.db import models

class Transaction(models.Model):
    description = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    category = models.CharField(max_length=100, default="N/A")  # ← Must be here

    def __str__(self):
        return f"{self.title} - ${self.amount}"
