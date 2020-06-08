from django.urls import path

from crawler import views as crawler_views

from . import views

urlpatterns = [
    path('stats', views.stats, name='stats'),
    path('matchdays', views.getMatchdays, name='matchdays'),
    path('players', views.getPlayersByUser, name='players'),
    path('users', views.getUsers, name='users')
]
