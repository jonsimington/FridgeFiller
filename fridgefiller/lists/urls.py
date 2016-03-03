# urls for the list application

from django.conf.urls import url
from . import views
from views import *

urlpatterns = [
    url(r'^$', ListsView.as_view(), name="lists"),
    url(r'^(?P<list_id>\d+)', ListView.as_view()),
    url(r'^new/$', NewListView.as_view(), name="new-list"),
    url(r'^edit/(?P<list_id>\d+)', EditListView.as_view()),
    url(r'^new/item/', NewItemView.as_view(), name="new-item"),
    url(r'^remove/item/', RemoveItemFromListView.as_view(), name="remove-item"),
]
