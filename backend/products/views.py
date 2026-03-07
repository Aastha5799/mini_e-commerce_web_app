from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import CustomerUser, Product, Cart, Order, OrderItem
from .serializers import (
    RegisterSerializer, UserSerializer,
    ProductSerializer, CartSerializer, OrderSerializer
)


# Helper — generate JWT tokens
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# AUTH

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'username': user.username
            }, status=201)
        return Response(serializer.errors, status=400)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            tokens = get_tokens_for_user(user)
            return Response({
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'username': user.username
            })
        return Response({'error': 'Invalid username or password'}, status=400)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass
        return Response({'message': 'Logged out'})


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# PRODUCTS

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


# CART

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = Cart.objects.filter(user=request.user)
        serializer = CartSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += int(quantity)
            cart_item.save()

        serializer = CartSerializer(cart_item)
        return Response(serializer.data, status=201)


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            item = Cart.objects.get(id=pk, user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Item not found'}, status=404)

        quantity = request.data.get('quantity')
        if quantity and int(quantity) > 0:
            item.quantity = int(quantity)
            item.save()
            return Response(CartSerializer(item).data)
        return Response({'error': 'Invalid quantity'}, status=400)

    def delete(self, request, pk):
        try:
            item = Cart.objects.get(id=pk, user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Item not found'}, status=404)

        item.delete()
        return Response({'message': 'Removed from cart'}, status=204)


# ORDERS

class OrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-order_date')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        cart_items = Cart.objects.filter(user=request.user)

        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=400)

        total = sum(item.product.price * item.quantity for item in cart_items)
        order = Order.objects.create(user=request.user, total_amount=total)

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )

        cart_items.delete()
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=201)