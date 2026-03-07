
# 🛍️ TinyTrolley — Mini E-Commerce Web App

A full-stack mini e-commerce web application built with **Django REST Framework** (backend) and **React** (frontend).

---

## 📌 Features

- User Registration & Login (Token Authentication)
- Browse all products & view product details
- Add products to cart
- Update cart item quantities (+/−)
- Remove items from cart
- Place orders (saved to database)
- View order history with status
- Admin panel for managing products (CRUD)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite) |
| Backend | Django + Django REST Framework |
| Database | SQLite |
| Authentication | Token Authentication |
| Styling | CSS (Poppins font) |
| API Communication | REST API + CORS |

---

## 📁 Project Structure

```
mini_e-commerce_web_app/
│
├── backend/                        # Django backend
│   ├── api/                        # Project config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── products/                   # Main app
│   │   ├── models.py               # CustomerUser, Product, Cart, Order, OrderItem
│   │   ├── serializers.py          # DRF serializers
│   │   ├── views.py                # API views
│   │   ├── urls.py                 # API routes
│   │   └── migrations/
│   ├── media/                      # Product images
│   ├── products_backup.json        # Product fixture data
│   └── manage.py
│
└── frontend/                       # React frontend
    ├── src/
    │   ├── App.jsx                 # Main component
    │   ├── App.css                 # Styling
    │   └── assets/
    └── package.json
```

---

### 🔧 Backend Setup

```bash
# 1. Navigate to backend
cd mini_e-commerce_web_app/backend

# 2. Create and activate virtual environment
python -m venv myvenv
myvenv\Scripts\activate        # Windows
source myvenv/bin/activate     # Mac/Linux

# 3. Install dependencies
pip install django djangorestframework djangorestframework-authtoken django-cors-headers pillow

# 4. Run migrations
python manage.py makemigrations
python manage.py migrate

# 5. Load product data
add the products manually in django administration
or 
python manage.py loaddata products_backup.json

# 6. Create admin account
python manage.py createsuperuser

# 7. Start server
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

---

### 🎨 Frontend Setup

```bash
# 1. Navigate to frontend
cd mini_e-commerce_web_app/frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login and get token |
| POST | `/api/auth/logout/` | Logout and delete token |
| GET | `/api/auth/profile/` | Get user profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/` | Get all products |
| GET | `/api/products/<id>/` | Get single product |
| POST | `/api/products/` | Create product (admin) |
| PUT | `/api/products/<id>/` | Update product (admin) |
| DELETE | `/api/products/<id>/` | Delete product (admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart/` | Get user's cart |
| POST | `/api/cart/` | Add item to cart |
| PUT | `/api/cart/<id>/` | Update item quantity |
| DELETE | `/api/cart/<id>/` | Remove item from cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/` | Get user's orders |
| POST | `/api/orders/` | Place order from cart |

---

## 🗄️ Database Models

- **CustomerUser** — Extended Django user with city, phone, address
- **Product** — name, description, price, image, stock, category
- **Cart** — user, product, quantity
- **Order** — user, total_amount, order_date, status
- **OrderItem** — order, product, quantity, price

---

## 🔐 Authentication Flow

1. User registers or logs in → Django returns a **token**
2. React saves token in `localStorage`
3. Every API request includes the token in the header:
   ```
   Authorization: Token <token>
   ```
4. Django verifies the token and identifies the user
5. On logout → token is deleted from database

---

## 🖥️ Screenshots

| Page | Description |
|------|-------------|
| Login / Register | Auth page with form validation |
| Home | Featured products (first 3) |
| Products | All products in a grid |
| Product Detail | Single product with description |
| Cart | Items with quantity controls and total |
| Orders | Order history with status badges |

---

## 📦 Admin Panel

Access at: `http://127.0.0.1:8000/admin`

Admins can:
- Add / Edit / Delete products
- View all users, carts and orders
- Update order status

---

## 📝 Notes

- Make sure both backend and frontend servers are running at the same time
- Product images are stored in `backend/media/products/`
- SQLite database file: `backend/db.sqlite3`
- To backup products: `python manage.py dumpdata products.Product --indent 2 > products_backup.json`