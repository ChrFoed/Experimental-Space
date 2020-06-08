from django.urls import path
from datetime import date
from django.http import HttpResponse
import json


from . import views

urlpatterns = [
    path('matchday', views.matchday, name='matchday'),
    path('users', views.fetchUsers, name='users'),
    path('matchdays', views.fetchMatchdays, name='users'),    
]
