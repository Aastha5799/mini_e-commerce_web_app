from django.contrib import admin
from .models import Product, CustomerUser, Cart, Order, OrderItem

admin.site.register(Product)
admin.site.register(CustomerUser)
admin.site.register(Cart)
admin.site.register(Order)
admin.site.register(OrderItem)