from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'date', 'description', 'category', 'amount']
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True}
        }

