from rest_framework import serializers
from .models import Transaction
from .models import Budget, Category, Profile
from django.contrib.auth import get_user_model


User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['full_name', 'email', 'currency']

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_email(self, obj):
        return obj.user.email

    def update(self, instance, validated_data):
        # Update currency
        instance.currency = validated_data.get('currency', instance.currency)
        instance.save()
        return instance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email',
            'currency',          
            'preferences',       
        ]
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
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = Transaction
        fields = '__all__'
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'category' : {'required': False}
        }

