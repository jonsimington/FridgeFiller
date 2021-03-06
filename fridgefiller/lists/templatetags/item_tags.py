from django import template
from django.template import Context, Template
from django.db.models import Q

from ..models import *

register = template.Library()


@register.simple_tag()
def get_item_detail(pantry_items, item_name):
    return filter(lambda x: x.name == item_name, pantry_items)[0]

@register.simple_tag()
def get_users_lists(user):
    try:
        return ShoppingList.objects.filter(owners__in=[user])
    except:
        return []

@register.simple_tag()
def get_users_groups(user):
    try:
        return Party.objects.filter(Q(owner__in=[user]) | Q(users__in=[user])).exclude(name=user.name+"'s Personal Party").distinct()
    except:
        return []
