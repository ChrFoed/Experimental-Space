from django.shortcuts import render, redirect
from datetime import date
from django.core import serializers
from django.http import HttpResponse
from common.util import valuesQuerySetToDict
import requests
import json
from decimal import Decimal

from crawler.models import Matchday, Player, Users

now = date.today()

CRAWLERAPI = "crawler/matchday?"

dummyData = {
    'owner': 'Christian',
    'playday': now.strftime("%d-%b-%Y (%H:%M:%S.%f)"),
    'stats': {
        'players': [
                {
                'active': True,
                'rating': 6,
                'change': 2,
                'name': 'Cantona',
                'id': 12345,
                'misc': 'testest'
                }
            ]
        }
}


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, date):
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        return json.JSONEncoder.default(self, obj)



def getMatchdays(request):
    days = Matchday.objects.all().filter().values('season', 'matchday').order_by('matchday')
    data = valuesQuerySetToDict(days)
    return HttpResponse(json.dumps(data), content_type="application/json")


def getUsers(request):
    users = Users.objects.all().filter().values('uid', 'name').order_by('name')
    data = valuesQuerySetToDict(users)
    return HttpResponse(json.dumps(data), content_type="application/json")


def getPlayersByUser(request):
    if "uid" in request.GET.keys():
        userId = request.GET['uid']
    else:
        return HttpResponse(json.dumps({'error': 'User ID Required'}), content_type="application/json")
    if "matchday" in request.GET.keys():
        matchday = request.GET['matchday']
    else:
        return HttpResponse(json.dumps({'error': 'Matchday Required'}), content_type="application/json")
    if "season" in request.GET.keys():
        season = request.GET['season']
    else:
        return HttpResponse(json.dumps({'error': 'Matchday Required'}), content_type="application/json")

    mdid = Matchday.objects.get(season=season, matchday=matchday)
    players = Player.objects.all().filter(mdid=mdid, userId=userId).values('name', 'kader', 'averagePoints', 'actualPoints', 'lastPoints', 'currentPoints', 'currentRating', 'last_update').order_by('currentPoints')
    data = valuesQuerySetToDict(players)
    return HttpResponse(json.dumps(data, cls=DecimalEncoder), content_type="application/json")


def stats(request):
    query = {'user': 'Christian'}
    data = redirect("crawler/matchday")
    # r = requests.get(url = CRAWLERAPI , params = quer)
    return HttpResponse(json.dumps(dummyData), content_type="application/json")
