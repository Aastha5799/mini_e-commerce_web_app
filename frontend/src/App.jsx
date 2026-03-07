import { useEffect, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000/api";

// Helper — adds token to every request automatically
const authFetch = (url, options = {}) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...options.headers,
    },
  });
};

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [notice, setNotice] = useState("");
  const [view, setView] = useState("auth");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orders, setOrders] = useState([]);

  // ── On load: check if already logged in ──
  useEffect(() => {
    const savedUser = localStorage.getItem("username");
    if (savedUser) {
      setUser(savedUser);
      setView("home");
    }
  }, []);

  // ── Fetch products ──
  useEffect(() => {
    fetch(`${API}/products/`)
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ── Fetch cart from Django (only when logged in) ──
  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const fetchCart = () => {
    authFetch(`${API}/cart/`)
      .then((r) => r.json())
      .then(setCart)
      .catch(() => {});
  };

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2500);
  };

  // ── Add to cart ──
  const addToCart = (product) => {
    authFetch(`${API}/cart/`, {
      method: "POST",
      body: JSON.stringify({ product_id: product.id, quantity: 1 }),
    })
      .then((r) => r.json())
      .then(() => { fetchCart(); showNotice(`${product.name} added to cart! 🛒`); });
  };

  // ── Update quantity ──
  const updateQty = (itemId, quantity) => {
    if (quantity < 1) return;
    authFetch(`${API}/cart/${itemId}/`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }).then(() => fetchCart());
  };

  // ── Remove from cart ──
  const removeFromCart = (itemId) => {
    authFetch(`${API}/cart/${itemId}/`, { method: "DELETE" })
      .then(() => fetchCart());
  };

  // ── Place order ──
  const placeOrder = () => {
    authFetch(`${API}/orders/`, { method: "POST" })
      .then((r) => r.json())
      .then(() => {
        fetchCart();
        showNotice("Order placed successfully! 🎉");
        setView("orders");
        fetchOrders();
      });
  };

  // ── Fetch orders ──
  const fetchOrders = () => {
    authFetch(`${API}/orders/`)
      .then((r) => r.json())
      .then(setOrders);
  };

  // ── Login ──
  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = e.target;
    fetch(`${API}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.value, password: password.value }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.username);
          setUser(data.username);
          setView("home");
          setAuthMessage("");
        } else {
          setAuthMessage(data.error || "Login failed");
        }
      });
  };

  // ── Register ──
  const handleRegister = (e) => {
    e.preventDefault();
    const { username, password, confirm } = e.target;
    if (password.value !== confirm.value) { setAuthMessage("Passwords do not match"); return; }
    fetch(`${API}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.value, password: password.value }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.username);
          setUser(data.username);
          setView("home");
          setAuthMessage("");
        } else {
          setAuthMessage(Object.values(data).flat().join(" "));
        }
      });
  };

  // ── Logout ──
  const handleLogout = () => {
    authFetch(`${API}/auth/logout/`, { method: "POST" }).finally(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      setUser(null);
      setCart([]);
      setView("auth");
    });
  };

  // ── Reusable product card ──
  const ProductCard = ({ p }) => (
    <div className="card">
      <img src={p.image} alt={p.name} />
      <div className="card-body">
        <h3>{p.name}</h3>
        {p.description && <p className="desc">{p.description}</p>}
        <p className="price">Rs {p.price}</p>
        <div className="card-buttons">
          <button className="btn-outline" onClick={() => { setSelectedProduct(p); setView("detail"); }}>View</button>
          <button className="btn-primary" onClick={() => addToCart(p)}>Add to Cart</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app">

      {/* HEADER */}
      {user && (
        <header>
          <div className="logo">🛍️ <span>Tiny Trolley</span></div>
          <nav>
            <button onClick={() => setView("home")}>Home</button>
            <button onClick={() => setView("products")}>Products</button>
            <button onClick={() => { setView("cart"); fetchCart(); }}>
              Cart {cart.length > 0 && <span className="badge">{cart.length}</span>}
            </button>
            <button onClick={() => { setView("orders"); fetchOrders(); }}>Orders</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </nav>
        </header>
      )}

      {notice && <div className="notice">{notice}</div>}

      <main>

        {/* HOME */}
        {view === "home" && (
          <div>
            <h2>Featured Products</h2>
            {loading ? <p className="loading">Loading...</p> : (
              <div className="grid">
                {products.slice(0, 3).map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
        )}

        {/* ALL PRODUCTS */}
        {view === "products" && (
          <div>
            <h2>All Products</h2>
            {loading ? <p className="loading">Loading...</p> : (
              <div className="grid">
                {products.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
        )}

        {/* PRODUCT DETAIL */}
        {view === "detail" && selectedProduct && (
          <div className="detail">
            <button className="btn-outline back-btn" onClick={() => setView("products")}>← Back</button>
            <div className="detail-content">
              <img src={selectedProduct.image} alt={selectedProduct.name} />
              <div className="detail-info">
                <h2>{selectedProduct.name}</h2>
                <p className="desc">{selectedProduct.description}</p>
                <p className="price">Rs {selectedProduct.price}</p>
                <button className="btn-primary" onClick={() => addToCart(selectedProduct)}>Add to Cart</button>
              </div>
            </div>
          </div>
        )}

        {/* CART */}
        {view === "cart" && (
          <div>
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
              <p className="empty">Your cart is empty 🛒</p>
            ) : (
              <div className="cart-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={item.product.image} alt={item.product.name} className="cart-img" />
                    <span className="cart-name">{item.product.name}</span>
                    <div className="qty-control">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <span className="price">Rs {(item.product.price * item.quantity).toFixed(2)}</span>
                    <button className="btn-remove" onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                ))}
                <div className="cart-total">
                  Total: Rs {cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0).toFixed(2)}
                </div>
                <button className="btn-primary checkout-btn" onClick={placeOrder}>
                  Place Order 🎉
                </button>
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {view === "orders" && (
          <div>
            <h2>My Orders</h2>
            {orders.length === 0 ? (
              <p className="empty">No orders yet</p>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <span>Order #{order.id}</span>
                      <span className={`status status-${order.status}`}>{order.status}</span>
                      <span>{new Date(order.order_date).toLocaleDateString()}</span>
                      <span className="price">Rs {order.total_amount}</span>
                    </div>
                    <div className="order-items">
                      {order.items.map((item) => (
                        <span key={item.id} className="order-item-pill">
                          {item.product.name} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUTH */}
        {view === "auth" && (
          <div className="auth-page">
            <div className="auth-box">
              <div className="auth-logo">🛍️ Tiny Trolley</div>
              <h2>{authMode === "login" ? "Welcome back!" : "Create account"}</h2>
              {authMessage && <p className="auth-error">{authMessage}</p>}

              {authMode === "login" ? (
                <form onSubmit={handleLogin}>
                  <input name="username" placeholder="Username" required />
                  <input name="password" type="password" placeholder="Password" required />
                  <button type="submit" className="btn-primary">Login</button>
                  <p className="switch-link" onClick={() => { setAuthMode("register"); setAuthMessage(""); }}>
                    Don't have an account? <span>Register</span>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister}>
                  <input name="username" placeholder="Username" required />
                  <input name="password" type="password" placeholder="Password" required />
                  <input name="confirm" type="password" placeholder="Confirm Password" required />
                  <button type="submit" className="btn-primary">Register</button>
                  <p className="switch-link" onClick={() => { setAuthMode("login"); setAuthMessage(""); }}>
                    Already have an account? <span>Login</span>
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;