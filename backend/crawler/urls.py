import json
from datetime import date

from django.http import HttpResponse
from django.urls import path

from . import views

handler404 = 'backend.subviews.404view'

urlpatterns = [
    path('matchday', views.matchday, name='matchday'),
    path('users', views.fetchUsers, name='users'),
    path('matchdays', views.fetchMatchdays, name='users'),
]
