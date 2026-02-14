import React, { useEffect, useState } from 'react';
import logo from './assets/logo.svg';

const PRODUCTS = [
  { id: 1, name: "Bohemian Maxi Dress", category: "Clothing", price: 79 },
  { id: 2, name: "Sequin Party Dress", category: "Clothing", price: 99 },
  { id: 3, name: "Silk Wrap Dress", category: "Clothing", price: 119 },
  { id: 4, name: "Denim Overall Dress", category: "Clothing", price: 69 },
  { id: 5, name: "Floral Summer Dress", category: "Clothing", price: 59 },
  { id: 6, name: "Leather Jacket", category: "Accessories", price: 149 },
  { id: 7, name: "Wide-Brim Sun Hat", category: "Accessories", price: 39 },
  { id: 8, name: "Designer Handbag", category: "Accessories", price: 199 },
  { id: 9, name: "Statement Earrings", category: "Accessories", price: 29 },
  { id: 10, name: "Chunky Sneakers", category: "Footwear", price: 89 },
  { id: 11, name: "Ankle Boots", category: "Footwear", price: 99 },
  { id: 12, name: "Colorful Scarf", category: "Accessories", price: 25 },
  { id: 13, name: "Elegant Evening Gown", category: "Clothing", price: 249 },
  { id: 14, name: "Boho Chic Sandals", category: "Footwear", price: 49 },
  { id: 15, name: "Trendy Sunglasses", category: "Accessories", price: 59 }
];

function App() {
  const [view, setView] = useState('auth'); // always start with auth
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notice, setNotice] = useState('');
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [authMessage, setAuthMessage] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Load users and current session from localStorage
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const savedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setUsers(savedUsers);
    if (savedUser) {
      setUser(savedUser);
      setView('home'); // auto-login if session exists
    }
  }, []);

  // Save current user session
  useEffect(() => {
    if (user) localStorage.setItem('currentUser', JSON.stringify(user));
    else localStorage.removeItem('currentUser');
  }, [user]);

  // Save users list
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Handlers
  const handleAddToCart = (product) => {
    setCart([...cart, { ...product, quantity: 1 }]);
    setNotice(`${product.name} added to cart!`);
    setTimeout(() => setNotice(''), 2000);
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value;

    if (!username || !password) {
      setAuthMessage('Please enter both username and password.');
      return;
    }

    const match = users.find(u => u.username === username && u.password === password);
    if (!match) {
      setAuthMessage('Account not found. Please register first.');
      return;
    }

    setUser({ username });
    setAuthMessage('');
    setView('home');
    form.reset();
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value;
    const confirm = form.confirm.value;

    if (!username || !password || !confirm) {
      setAuthMessage('Please fill out all fields.');
      return;
    }

    if (password !== confirm) {
      setAuthMessage('Passwords do not match.');
      return;
    }

    if (users.some(u => u.username === username)) {
      setAuthMessage('Username already exists. Please login.');
      setAuthMode('login');
      return;
    }

    const newUser = { username, password };
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    setUser({ username });
    setAuthMessage('');
    setView('home');
    form.reset();
  };

  const handleLogout = () => {
    setUser(null);
    setView('auth');
    setAuthMode('login');
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setView('detail');
  };

  // Components
  const Home = () => (
    <div>
      <h2>Featured Products</h2>
      <div className="row">
        {PRODUCTS.slice(0, 3).map(p => (
          <div className="col-md-4" key={p.id}>
            <div className="card p-3">
              <h5>{p.name}</h5>
              <p>Category: {p.category}</p>
              <p>Price: ${p.price}</p>
              <button className="btn btn-primary me-2" onClick={() => handleViewProduct(p)}>View</button>
              <button className="btn btn-success" onClick={() => handleAddToCart(p)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Products = () => (
    <div>
      <h2>All Products</h2>
      <div className="row">
        {PRODUCTS.map(p => (
          <div className="col-md-3" key={p.id}>
            <div className="card p-3">
              <h5>{p.name}</h5>
              <p>Category: {p.category}</p>
              <p>Price: ${p.price}</p>
              <button className="btn btn-primary me-2" onClick={() => handleViewProduct(p)}>View</button>
              <button className="btn btn-success" onClick={() => handleAddToCart(p)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Detail = () => (
    <div>
      <h2>{selectedProduct.name}</h2>
      <p>Category: {selectedProduct.category}</p>
      <p>Price: ${selectedProduct.price}</p>
      <button className="btn btn-success me-2" onClick={() => handleAddToCart(selectedProduct)}>Add to Cart</button>
      <button className="btn btn-secondary" onClick={() => setView('products')}>Back to Products</button>
    </div>
  );

  const Cart = () => (
    <div>
      <h2>Your Cart</h2>
      {cart.length === 0 && <p>Cart is empty</p>}
      {cart.map(item => (
        <div className="card p-3" key={item.id}>
          <h5>{item.name}</h5>
          <p>Price: ${item.price}</p>
          <p>Quantity: {item.quantity}</p>
          <button className="btn btn-danger" onClick={() => handleRemoveFromCart(item.id)}>Remove</button>
        </div>
      ))}
      {cart.length > 0 && <h4>Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}</h4>}
    </div>
  );

  const Checkout = () => (
    <div>
      <h2>Checkout</h2>
      <form>
        <div className="mb-3">
          <label>Full Name</label>
          <input className="form-control" placeholder="Your name" />
        </div>
        <div className="mb-3">
          <label>Address</label>
          <input className="form-control" placeholder="Street, city" />
        </div>
        <div className="mb-3">
          <label>Payment Method</label>
          <select className="form-select">
            <option>Cash on delivery</option>
            <option>Card on delivery</option>
          </select>
        </div>
        <button className="btn btn-success">Place Order</button>
      </form>
    </div>
  );

  const Auth = () => (
    <div>
      <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
      {authMessage && <div className="notice">{authMessage}</div>}

      {authMode === 'login' ? (
        <form onSubmit={handleLoginSubmit}>
          <input className="form-control mb-2" placeholder="Username" name="username" />
          <input className="form-control mb-2" type="password" placeholder="Password" name="password" />
          <button className="btn btn-primary">Login</button>
          <p className="mt-2">
            Don't have an account?{' '}
            <button type="button" className="btn btn-link p-0" onClick={() => { setAuthMode('register'); setAuthMessage(''); }}>
              Register
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit}>
          <input className="form-control mb-2" placeholder="Username" name="username" />
          <input className="form-control mb-2" type="password" placeholder="Password" name="password" />
          <input className="form-control mb-2" type="password" placeholder="Confirm Password" name="confirm" />
          <button className="btn btn-secondary">Register</button>
          <p className="mt-2">
            Already have an account?{' '}
            <button type="button" className="btn btn-link p-0" onClick={() => { setAuthMode('login'); setAuthMessage(''); }}>
              Login
            </button>
          </p>
        </form>
      )}
    </div>
  );

  return (
    <div>
      {user && (
        <header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img src={logo} alt="Tiny Trolley Logo" style={{ height: '70px', marginRight: '16px' }} />
            <h1 style={{ fontSize: '2.6rem', margin: 0 }}>Tiny Trolley</h1>
          </div>
          <nav>
            {['home', 'products', 'cart', 'checkout'].map(v => (
              <button key={v} className="btn btn-link text-white" onClick={() => setView(v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
            <button className="btn btn-link text-white" onClick={handleLogout}>
              Logout ({user.username})
            </button>
          </nav>
        </header>
      )}

      <div className="container">
        {notice && <div className="notice">{notice}</div>}
        {view === 'home' && <Home />}
        {view === 'products' && <Products />}
        {view === 'detail' && <Detail />}
        {view === 'cart' && <Cart />}
        {view === 'checkout' && <Checkout />}
        {view === 'auth' && <Auth />}
      </div>
    </div>
  );
}

export default App;
