import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';

const fallbackProducts = [
  {
    id: 1,
    name: 'Tonal Linen Shirt',
    price: 48,
    category: 'Workwear',
  },
  {
    id: 2,
    name: 'Atlas Field Backpack',
    price: 72,
    category: 'Travel',
  },
  {
    id: 3,
    name: 'Amber Ceramic Set',
    price: 38,
    category: 'Home',
  },
  {
    id: 4,
    name: 'Cloudstep Sneaker',
    price: 64,
    category: 'Footwear',
  },
];

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'products', label: 'Products' },
  { id: 'detail', label: 'Detail' },
  { id: 'cart', label: 'Cart' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'auth', label: 'Login / Signup' },
];

function App() {
  const [view, setView] = useState('home');
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState({
    products: false,
    detail: false,
    cart: false,
    action: false,
  });

  useEffect(() => {
    const loadProducts = async () => {
      setLoading((prev) => ({ ...prev, products: true }));
      try {
        const response = await fetch(`${API_BASE}/products/`);
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : fallbackProducts);
      } catch (error) {
        setProducts(fallbackProducts);
        setNotice('Using fallback products. Check Django API connection.');
      } finally {
        setLoading((prev) => ({ ...prev, products: false }));
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const loadDetail = async () => {
      setLoading((prev) => ({ ...prev, detail: true }));
      try {
        const response = await fetch(`${API_BASE}/products/${selectedId}/`);
        if (!response.ok) {
          throw new Error('Failed to load product');
        }
        const data = await response.json();
        setSelectedProduct(data);
      } catch (error) {
        const fallback = products.find((item) => item.id === selectedId);
        setSelectedProduct(fallback || null);
      } finally {
        setLoading((prev) => ({ ...prev, detail: false }));
      }
    };

    loadDetail();
  }, [selectedId, products]);

  const loadCart = async () => {
    setLoading((prev) => ({ ...prev, cart: true }));
    try {
      const response = await fetch(`${API_BASE}/cart/`);
      if (!response.ok) {
        throw new Error('Failed to load cart');
      }
      const data = await response.json();
      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setCartItems([]);
    } finally {
      setLoading((prev) => ({ ...prev, cart: false }));
    }
  };

  useEffect(() => {
    if (view === 'cart' || view === 'checkout') {
      loadCart();
    }
  }, [view]);

  const handleSelectProduct = (id) => {
    setSelectedId(id);
    setView('detail');
  };

  const handleAddToCart = async (id) => {
    setLoading((prev) => ({ ...prev, action: true }));
    setNotice('');
    try {
      const response = await fetch(`${API_BASE}/cart/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: id, quantity: 1 }),
      });
      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }
      setNotice('Added to cart successfully.');
      await loadCart();
    } catch (error) {
      setNotice('Could not add to cart. Check the API.');
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const handleRemoveFromCart = async (item) => {
    const itemId = item.id ?? item.product;
    if (!itemId) {
      return;
    }
    setLoading((prev) => ({ ...prev, action: true }));
    setNotice('');
    try {
      const response = await fetch(`${API_BASE}/cart/${itemId}/`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to remove item');
      }
      setNotice('Item removed from cart.');
      await loadCart();
    } catch (error) {
      setNotice('Could not remove item.');
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const handleAuth = async (event, endpoint) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());
    setLoading((prev) => ({ ...prev, action: true }));
    setNotice('');
    try {
      const response = await fetch(`${API_BASE}/auth/${endpoint}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Auth failed');
      }
      const data = await response.json();
      setNotice(`Auth success: ${JSON.stringify(data)}`);
      event.target.reset();
    } catch (error) {
      setNotice('Auth request failed.');
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const featured = useMemo(() => products.slice(0, 3), [products]);
  const detailProduct = selectedProduct || products.find((item) => item.id === selectedId);

  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">
          LUMA<span>cart</span>
        </div>
        <div className="topbar-actions">
          <span className="status-pill">Live: Kathmandu</span>
          <button className="primary" type="button">
            New drop
          </button>
        </div>
      </header>

      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-button ${view === item.id ? 'active' : ''}`}
                type="button"
                onClick={() => setView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="sidebar-card">
            <p className="eyebrow">Quick status</p>
            <h3>Cart balance</h3>
            <p className="highlight">${cartItems.length * 22}</p>
            <button className="ghost" type="button" onClick={() => setView('cart')}>
              View cart
            </button>
          </div>
          <div className="sidebar-card muted">
            <h4>API base</h4>
            <p>{API_BASE}</p>
          </div>
        </aside>

        <main className="main">
          <section className="hero-card">
            <div>
              <p className="eyebrow">Mini ecommerce</p>
              <h1>
                Build a store that
                <span>moves at your pace.</span>
              </h1>
              <p>
                Connect with Django in real time, launch new products, and track
                cart energy in one place.
              </p>
            </div>
            <div className="hero-metrics">
              <div>
                <strong>{products.length || 0}</strong>
                <span>products</span>
              </div>
              <div>
                <strong>{cartItems.length}</strong>
                <span>cart items</span>
              </div>
              <div>
                <strong>3h</strong>
                <span>dispatch</span>
              </div>
            </div>
          </section>

          {notice && <div className="notice">{notice}</div>}

          {view === 'home' && (
            <section className="panel">
              <div className="panel-head">
                <h2>Featured products</h2>
                <button className="ghost" type="button" onClick={() => setView('products')}>
                  View all
                </button>
              </div>
              <div className="product-grid">
                {featured.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-media" />
                    <div>
                      <h3>{product.name}</h3>
                      <p>${product.price}</p>
                    </div>
                    <div className="product-actions">
                      <button className="ghost" type="button" onClick={() => handleSelectProduct(product.id)}>
                        View detail
                      </button>
                      <button
                        className="primary"
                        type="button"
                        onClick={() => handleAddToCart(product.id)}
                      >
                        Add to cart
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {view === 'products' && (
            <section className="panel">
              <div className="panel-head">
                <h2>All products</h2>
                <span>{loading.products ? 'Loading...' : `${products.length} items`}</span>
              </div>
              <div className="product-grid">
                {products.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-media" />
                    <div>
                      <h3>{product.name}</h3>
                      <p>${product.price}</p>
                      <span className="chip">{product.category || 'New drop'}</span>
                    </div>
                    <div className="product-actions">
                      <button className="ghost" type="button" onClick={() => handleSelectProduct(product.id)}>
                        View detail
                      </button>
                      <button
                        className="primary"
                        type="button"
                        onClick={() => handleAddToCart(product.id)}
                      >
                        Add to cart
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {view === 'detail' && (
            <section className="panel">
              <div className="panel-head">
                <h2>Product detail</h2>
                <button className="ghost" type="button" onClick={() => setView('products')}>
                  Back to list
                </button>
              </div>
              {loading.detail && <p>Loading product...</p>}
              {!loading.detail && detailProduct && (
                <div className="detail">
                  <div className="detail-media" />
                  <div className="detail-content">
                    <h3>{detailProduct.name}</h3>
                    <p className="price">${detailProduct.price}</p>
                    <p>
                      A clean essential with a soft, structured feel. Designed for daily
                      layers and built to last.
                    </p>
                    <div className="detail-actions">
                      <button
                        className="primary"
                        type="button"
                        onClick={() => handleAddToCart(detailProduct.id)}
                      >
                        Add to cart
                      </button>
                      <button className="ghost" type="button" onClick={() => setView('cart')}>
                        Go to cart
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {view === 'cart' && (
            <section className="panel">
              <div className="panel-head">
                <h2>Your cart</h2>
                <span>{loading.cart ? 'Loading...' : `${cartItems.length} items`}</span>
              </div>
              <div className="cart-grid">
                {cartItems.length === 0 && <p>Your cart is empty.</p>}
                {cartItems.map((item) => (
                  <div className="cart-item" key={item.id ?? item.product}>
                    <div>
                      <h4>Product #{item.product}</h4>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                    <button className="ghost" type="button" onClick={() => handleRemoveFromCart(item)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {view === 'checkout' && (
            <section className="panel">
              <div className="panel-head">
                <h2>Checkout</h2>
                <span>Finalize your order</span>
              </div>
              <div className="checkout">
                <div className="checkout-summary">
                  <h3>Order summary</h3>
                  {cartItems.map((item) => (
                    <div className="summary-row" key={item.id ?? item.product}>
                      <span>Product #{item.product}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>${cartItems.length * 22}</span>
                  </div>
                </div>
                <form className="checkout-form">
                  <label>
                    Full name
                    <input type="text" placeholder="Your name" />
                  </label>
                  <label>
                    Address
                    <input type="text" placeholder="Street, city" />
                  </label>
                  <label>
                    Payment method
                    <select>
                      <option>Cash on delivery</option>
                      <option>Card on delivery</option>
                    </select>
                  </label>
                  <button className="primary" type="button">
                    Place order
                  </button>
                </form>
              </div>
            </section>
          )}

          {view === 'auth' && (
            <section className="panel">
              <div className="panel-head">
                <h2>Login / Signup</h2>
                <span>No auth enforced yet</span>
              </div>
              <div className="auth-grid">
                <form className="auth-card" onSubmit={(event) => handleAuth(event, 'login')}>
                  <h3>Login</h3>
                  <label>
                    Username
                    <input name="username" type="text" placeholder="Username" required />
                  </label>
                  <label>
                    Password
                    <input name="password" type="password" placeholder="Password" required />
                  </label>
                  <button className="primary" type="submit" disabled={loading.action}>
                    Sign in
                  </button>
                </form>
                <form className="auth-card" onSubmit={(event) => handleAuth(event, 'signup')}>
                  <h3>Signup</h3>
                  <label>
                    Username
                    <input name="username" type="text" placeholder="Username" required />
                  </label>
                  <label>
                    Password
                    <input name="password" type="password" placeholder="Password" required />
                  </label>
                  <button className="ghost" type="submit" disabled={loading.action}>
                    Create account
                  </button>
                </form>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
