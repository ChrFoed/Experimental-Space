from django.db import models
from decimal import Decimal
import uuid

# TO DO:
# SET INDEXES
# BETTER SYNC BETWEEN Match and Players
# User based

#Create your models here.
class Matchday(models.Model):
    # Must be unique
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    season = models.IntegerField(help_text='Season')
    matchday = models.IntegerField(help_text='matchday')
    #user = models.IntegerField(help_text='matchday')

    class Meta:
        unique_together =['season', 'matchday'],
        app_label = "crawler"

    def __str__(self):
        """String for representing the Model object."""
        return "%s/%s"%(self.season,self.matchday)

class Player(models.Model):

    mdid = models.ForeignKey('crawler.Matchday' ,on_delete=models.SET_NULL, null=True)
    userId = models.ForeignKey('crawler.Users',on_delete=models.SET_NULL, null=True)
    name = models.TextField(max_length=200, help_text='Players Sur Name')
    pid = models.IntegerField(help_text='Players Id')
    kader = models.BooleanField(help_text='Is in Kader')
    averagePoints = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('0.00'), help_text='Average Points Season per Game')
    actualPoints = models.IntegerField(help_text='Actual Points Season', default=0)
    lastPoints = models.IntegerField(help_text='Points last game', default=0)
    price = models.IntegerField(help_text='Price', default=0)
    currentPoints = models.IntegerField(help_text='Current Game Points', default=0)
    currentRating =  models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('0.00'), help_text='Current Game Rating')
    last_update = models.DateField(auto_now=True)
    #
    class Meta:
        unique_together = ['mdid', 'pid', 'userId'],
        app_label = "crawler"

    def __str__(self):
        """String for representing the Model object."""
        return self.name


class Match(models.Model):

    mdid = models.ForeignKey('crawler.Matchday', on_delete=models.SET_NULL, null=True)
    mid = models.IntegerField(help_text='Match Id')
    begin = models.DateTimeField(auto_now=False)
    home = models.TextField(max_length=8, help_text='Home Club Id')
    away = models.TextField(max_length=8, help_text='Away Club Id')
    currentResult = models.TextField(max_length=10, help_text='Result')

    class Meta:
        unique_together = ['mid', 'mdid'],
        app_label = "crawler"

    def __str__(self):
        """String for representing the Model object."""
        return self.mid

class Users(models.Model):
    name = models.TextField(max_length=200, help_text='Human Name')
    uid = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    totalPoints = models.IntegerField(help_text='User Points season', default=0)
    lastPoints = models.IntegerField(help_text='User Points last game', default=0)
    livePoints = models.IntegerField(help_text='User Live Points', default=0)

    class Meta:
        unique_together = ['uid']

    def __str__(self):
        """String for representing the,on_delete=models.SET_NULL Model object."""
        return self.name

class Club(models.Model):
    name = models.TextField(max_length=200, help_text='Club Name')
    cid = models.TextField(max_length=8, help_text='Club Id')

    #
    class Meta:
        unique_together = ['cid']

    def __str__(self):
        """String for representing the Model object."""
        return self.name
