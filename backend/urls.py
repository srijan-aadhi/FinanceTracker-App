from django.urls import path
from . import views  # make sure views.py has the correct functions

urlpatterns = [
    path('transactions/', views.transaction_list, name='transaction_list'),
]
