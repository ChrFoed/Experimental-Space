# Generated by Django 3.0.2 on 2020-02-20 20:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crawler', '0002_users'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='price',
            field=models.IntegerField(default=0, help_text='Price'),
        ),
    ]
