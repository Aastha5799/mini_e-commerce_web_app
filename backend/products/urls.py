from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, ProfileView,
    ProductListCreateView, ProductDetailView,
    CartView, CartItemView,
    OrderView,
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/',    LoginView.as_view(),    name='login'),
    path('auth/logout/',   LogoutView.as_view(),   name='logout'),
    path('auth/profile/',  ProfileView.as_view(),  name='profile'),

    # Products
    path('products/',      ProductListCreateView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),

    # Cart
    path('cart/',          CartView.as_view(),     name='cart'),
    path('cart/<int:pk>/', CartItemView.as_view(), name='cart-item'),

    # Orders
    path('orders/',        OrderView.as_view(),    name='orders'),
]