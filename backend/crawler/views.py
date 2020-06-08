from django.shortcuts import render
from datetime import date
from django.http import HttpResponse
from bs4 import BeautifulSoup
from django.templatetags.static import static
import dateparser
import requests
import re
import copy
import os
import datetime

from . import models


import json


APIURL = "https://stats.comunio.de/xhr/matchDetails.php"

SOURCEURL = "https://stats.comunio.de/matchday"

COMURL = "https://www.comunio.de/communities/2112353"
COMMUNITY = "https://www.comunio.de/api/communities/"

USERURL = "https://www.comunio.de/api/communities/"

COMMUNITY_ID = 2112353 if 'COMMUNITY_ID' not in os.environ else os.environ['COMMUNITY_ID']
USERID = 12280528 # Christian
# Martin = 12283169

SQUADURL = "https://www.comunio.de/api/users/"


# Create your views here.
def matchday(request):
    matchday = ''
    season = ''

    print(request, flush=True)

    if request.method != 'GET':
        return HttpResponse(json.dumps({'error': 'GET Request required'}), content_type="application/json")

    if "uid" in request.GET.keys():
        USERID = request.GET['uid']
    else:
        return HttpResponse(json.dumps({'error': 'Usier ID Required'}), content_type="application/json")

    if "matchday" in request.GET.keys() and "season" in request.GET.keys():
        matchday = "/%s"%(request.GET['matchday'])
        season = "/%s"%request.GET['season']

    #html = getLocalHtml()
    html = getProdHtml(matchday, season)
    data = parseHtml(html, USERID)

    if "single" in request.GET.keys():
        return HttpResponse(json.dumps({'message': 'Matchday parsed succesfully for USER ID %s'%(USERID)}), content_type="application/json")

    for pday in range(int(data['matchDay']['matchday']), 0, -1):
        html = getProdHtml("/%s"%(pday), "/%s"%(data['matchDay']['season']))
        pdata = parseHtml(html, USERID)
    return HttpResponse(json.dumps({'matchDay': 'All fine parsed'}), content_type="application/json")

def getLocalHtml():
    htmlpath = "static/example.html"
    f=open(htmlpath, "r")
    if f.mode == 'r':
      contents =f.read()
    return contents

def getProdHtml(day = '', season = ''):
    print("%s%s%s"%(SOURCEURL, season, day), flush=True)
    r = requests.get(url = "%s%s%s"%(SOURCEURL, season, day))
    print(r.url, flush=True)
    data = r.text
    r.close()
    return data


def parseHtml(htmlstring, uid):
    data = {}
    try:
        soup = soupGenerator(htmlstring)
        data['matchDay'] = getMatchDay(soup)
        data['games'] = getMatches(soup, data['matchDay'])
        data['players'] = getStats(data, uid)
    except Exception as e:
        print(e, flush=True)
    finally:
        return data

def getDate(soup):
    date = False
    try:
        rawDate = soup.string
        date = dateparser.parse(rawDate, date_formats=['%A, %D.%M  %H:%M'])
    except:
        print("Something went wrong during date parsing")
    finally:
        return date

def getMatchDay(soup):
    day = {}
    day['season'] = soup.find("div",{"id":"season"}).string
    day['matchday'] = soup.find("div",{"id":"matchday"}).string
    if not models.Matchday.objects.filter(season=day['season'], matchday=day['matchday']).exists():
        models.Matchday.objects.create(season=day['season'], matchday=day['matchday']).save()
    return day


def fetchUsers(request):
    #https://www.comunio.de/api/communities/api/communities/2112353?l
    #url = 'https://www.comunio.de/api/communities/api/communities/2112353?lineBreaks2Description=1&include=standings'%(USERURL,COMMUNITY_ID)
    url = 'https://www.comunio.de/api/communities/2112353?lineBreaks2Description=1&include=standings'
    payload = {}
    headers= {}
    response = requests.request("GET", url, headers=headers, data = payload)
    userData = response.json()
    print(userData, flush=True)
    for user in userData['standings']['items']:
        print(user['_embedded']['user'], flush=True)
        if not models.Users.objects.filter(uid=user['_embedded']['user']['id']).exists():
            models.Users.objects.create(
                uid=user['_embedded']['user']['id'],
                name=user['_embedded']['user']['name'],
                lastPoints=int(0 if user['lastPoints'] in [None,'-'] else user['lastPoints']),
                livePoints=(0 if user['livePoints'] in [None,'-'] else user['livePoints']),
                totalPoints=int(0 if user['totalPoints'] in [None,'-'] else user['totalPoints'])
            ).save()
    #print(response.json(), flush=True)
    return HttpResponse(json.dumps({'users': 'All Users in Database'}), content_type="application/json")

def fetchMatchdays(request):
    html = getProdHtml();
    soup = soupGenerator(html)
    data = getMatchDay(soup)
    for pday in range(int(data['matchday']), 0, -1):
        if not models.Matchday.objects.filter(season=data['season'], matchday=pday).exists():
            models.Matchday.objects.create(season=data['season'], matchday=pday).save()
    return HttpResponse(json.dumps({'users': 'All Matchdays in Database'}), content_type="application/json")



def getMatches(soup, matchDay):
    gamesData = []

    gameData = {}
    #games = soup.find_all(["td",{"class":"clubname"},"a",{"class":"rowAction"}])
    playDays = soup.find("table",{"class":"stretch98 rowLinks"}).find_all("tr")
    for day in playDays:
        # Check if a date row in table, if so parse Date
        if "r1" in day['class']:
            date = getDate(day.td)
            if not date:
                continue;
            gameData['begin'] = date
        # Check if its a game and parse the clubs
        elif "r2" in day['class']:
            id = "".join(re.findall('[0-9]',day["id"]))
            gameData['mid'] = id
            clubs = day.find_all("td",{"class":"clubname"})
            gameData['home'] = {}
            gameData['away'] = {}
            for club in clubs:
                if "leftClub" in club['class']:
                    gameData['home']['name'] = str(club.span.string)
                    gameData['home']['id'] = club.span['id']
                if "rightClub" in club['class']:
                    gameData['away']['name'] = str(club.span.string)
                    gameData['away']['id'] = club.span['id']
                    currentResult = club.find_previous_sibling("td").string
                    gameData['currentResult'] = club.find_previous_sibling("td").string

                if gameData['home'] and gameData['away']:
                    # Save Clubs if not existing
                    if not models.Club.objects.filter(name=gameData['home']['name'], cid=gameData['home']['id']).exists():
                        models.Club.objects.create(name=gameData['home']['name'], cid=gameData['home']['id']).save()
                    if not models.Club.objects.filter(name=gameData['away']['name'], cid=gameData['away']['id']).exists():
                        models.Club.objects.create(name=gameData['away']['name'], cid=gameData['away']['id']).save()

                    mdid = models.Matchday.objects.get(season=matchDay['season'], matchday=matchDay['matchday'])
                    if not models.Match.objects.filter(mid=gameData['mid'], mdid=mdid).exists():
                        models.Match.objects.create(mdid=mdid, mid=gameData['mid'], begin=gameData['begin'], home=gameData['home']['id'],away=gameData['away']['id'],currentResult=gameData['currentResult']).save()
                    else:
                        models.Match.objects.filter(mid=gameData['mid']).update(currentResult=gameData['currentResult'])

                    gData = copy.copy(gameData)
                    gData['begin'] = gData['begin'].strftime("%Y-%m-%d %H:%M:%S")
                    gamesData.append(gData)
    return gamesData


def getStats(data, uid):

    uPlayers = getUserPlayers(uid)
    for game in data['games']:
         uPlayers = getStat(game['mid'],uPlayers, data['matchDay'], uid)
    return uPlayers


def getStat(id, uPlayers, matchday, uid):
    query = {'mid': str(id)}
    r = requests.get(url = APIURL , params = query)
    gamestats = r.json()
    if not gamestats:
        return uPlayers
    homePlayers = gamestats['homePlayers']
    awayPlayers = gamestats['awayPlayers']
    mdid = models.Matchday.objects.get(**matchday)
    #{'playerId': 32807, 'name': 'Lienhart', 'pos': 'a', 'goals': 0, 'pens': 0, 'pensSaved': 0, 'assists': 0, 'yellow': 0, 'yellowRed': 0, 'red': 0, 'points': None, 'rating': None, 'subIn': 90, 'subOut': None, 'motm': None, 'active': 1, 'ratingLevel': None}

    for uPlayer in uPlayers:
        pData = [d for d in homePlayers if d['playerId'] in [uPlayer['pid']]]
        if pData:
            uPlayer['currentPoints'] = int(0 if pData[0]['points'] is None else pData[0]['points'])
            uPlayer['currentRating'] = float(0 if pData[0]['rating'] is None else pData[0]['rating'])
        else:
            uPlayer['currentPoints'] = 0
            uPlayer['currentRating'] = 0

    for uPlayer in uPlayers:
        pData = [d for d in awayPlayers if d['playerId'] in [uPlayer['pid']]]
        if pData:
            uPlayer['currentPoints'] = int(0 if pData[0]['points'] is None else pData[0]['points'])
            uPlayer['currentRating'] = float(0 if pData[0]['rating'] is None else pData[0]['rating'])
        else:
            uPlayer['currentPoints'] = 0
            uPlayer['currentRating'] = 0

    for uPlayer in uPlayers:
        uPlayer['mdid'] = mdid
        if not models.Player.objects.filter(mdid=mdid, pid=uPlayer['pid'], userId=uPlayer['userId']):
            models.Player.objects.create(**uPlayer)
        else:
            models.Player.objects.filter(mdid=mdid, pid=uPlayer['pid'], userId=uid).update(currentPoints= uPlayer['currentPoints'], currentRating= uPlayer['currentRating'])

    return uPlayers


def getUserPlayers(playerId = USERID):
    r = requests.get(url = "%s%s/%s"%(SQUADURL, playerId, "squad"))
    userdata = r.json()
    filteredPlayers = []
    uPlayers = userdata.get("items")
    for uPlayer in uPlayers:
        if uPlayer['lastPoints'] == '-' or uPlayer['lastPoints'] == None:
            uPlayer['lastPoints'] = 0
        playerObject = {}
        print('Handling player %s from user id %s'%(uPlayer['name'], uPlayers[0]['owner']['name']), flush=True)
        playerObject['userId'] = uPlayers[0]['owner']['id']
        playerObject['name'] = uPlayer['name']
        playerObject['pid'] = uPlayer['id']
        playerObject['price'] = uPlayer['quotedprice']
        playerObject['kader'] = bool(uPlayer['linedup'])
        playerObject['averagePoints'] =  0 if uPlayer['averagePoints'] is None else float(uPlayer['averagePoints'])
        playerObject['actualPoints'] = int(uPlayer['points']) if uPlayer['points'] is not None else 0
        playerObject['lastPoints'] = int(uPlayer['lastPoints']) if uPlayer['lastPoints'] is not None else 0
        filteredPlayers.append(playerObject)

    return filteredPlayers



def soupGenerator(html):
    return BeautifulSoup(html, 'html.parser')
