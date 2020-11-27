import json
from datetime import date
from decimal import Decimal

import requests
from common.util import valuesQuerySetToDict
from crawler.models import Matchday, Player, Users
from django.core import serializers
from django.http import HttpResponse
from django.shortcuts import redirect, render

now = date.today()

CRAWLERAPI = "crawler/matchday?"


class DecimalEncoder(json.JSONEncoder):
    """Helper class for proper string encoding"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, date):
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        return json.JSONEncoder.default(self, obj)


def getMatchdays(request):
    """Returns matchdays to build up overview

    Parameters
    ----------
    request : HttpRequest
        contains information about users and season

    Returns
    -------
    HttpResponse
        Returns python dictionary of matchdays
    """
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


def getPlayersByUsers(request):
    if "matchday" in request.GET.keys():
        matchday = request.GET['matchday']
    else:
        return HttpResponse(json.dumps({'error': 'Matchday Required'}), content_type="application/json")
    if "season" in request.GET.keys():
        season = request.GET['season']
    else:
        return HttpResponse(json.dumps({'error': 'Matchday Required'}), content_type="application/json")

    mdid = Matchday.objects.get(season=season, matchday=matchday)
    players = Player.objects.select_related()#.values('name', 'kader', 'averagePoints', 'actualPoints', 'lastPoints', 'currentPoints', 'currentRating', 'last_update').order_by('currentPoints')
    #data = valuesQuerySetToDict(players)
    #return HttpResponse(json.dumps(data, cls=DecimalEncoder), content_type="application/json")
    print(str(players.query), flush=True)
    tplayers = Player.objects.all().filter(mdid=mdid).select_related('userId')[:1]
    print(tplayers.query, flush=True)
    return HttpResponse(json.dumps(players, cls=DecimalEncoder), content_type="application/json")


def stats(request):
    query = {'user': 'Christian'}
    data = redirect("crawler/matchday")
    # r = requests.get(url = CRAWLERAPI , params = quer)
    return HttpResponse(json.dumps(dummyData), content_type="application/json")
