# Generated by Django 5.2 on 2025-04-25 13:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0013_category_user_alter_category_unique_together'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='name',
            field=models.CharField(max_length=100),
        ),
    ]
