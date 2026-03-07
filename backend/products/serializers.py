from rest_framework import serializers
from .models import CustomerUser, Product, Cart, Order, OrderItem


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomerUser
        fields = ['username', 'password', 'email', 'city', 'phone', 'address']

    def create(self, validated_data):
        # Use create_user so password gets hashed properly
        user = CustomerUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            city=validated_data.get('city', ''),
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', ''),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerUser
        fields = ['id', 'username', 'email', 'city', 'phone', 'address']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image', 'category']  


class CartSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)       # full product info when reading
    product_id = serializers.IntegerField(write_only=True)  # just id when writing

    class Meta:
        model = Cart
        fields = ['id', 'product', 'product_id', 'quantity']


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'total_amount', 'order_date', 'status', 'items']