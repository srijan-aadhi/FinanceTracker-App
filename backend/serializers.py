from rest_framework import serializers
from .models import Transaction
from .models import Budget, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class BudgetSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())

    class Meta:
        model = Budget
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'date', 'description', 'category', 'amount']
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'category' : {'required': False}
        }

