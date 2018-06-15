from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'write/', views.write, name='write'),
    url(r'read/', views.read, name='read')
]