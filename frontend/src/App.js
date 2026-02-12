import React, { useState } from 'react';
import logo from './assets/logo.svg';



function App() {
  const [view, setView] = useState('home');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notice, setNotice] = useState('');

  // Handlers
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setView('detail');
  };

  const handleAddToCart = (product) => {
    setCart([...cart, { ...product, quantity: 1 }]);
    setNotice(`${product.name} added to cart!`);
    setTimeout(() => setNotice(''), 2000);
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Components for different pages
  const Home = () => (
    <div>
      <h2>Featured Products</h2>
      <div className="row">
        {PRODUCTS.slice(0, 3).map((p) => (
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
        {PRODUCTS.map((p) => (
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
      {cart.map((item) => (
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
      <h2>Login / Signup</h2>
      <p>No authentication yet, demo only</p>
      <form className="mb-3">
        <input className="form-control mb-2" placeholder="Username" />
        <input className="form-control mb-2" type="password" placeholder="Password" />
        <button className="btn btn-primary">Login</button>
      </form>
      <form>
        <input className="form-control mb-2" placeholder="Username" />
        <input className="form-control mb-2" type="password" placeholder="Password" />
        <button className="btn btn-secondary">Signup</button>
      </form>
    </div>
  );

  return (
    <div>
      <header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <img src={logo} alt="BubbleBuy Logo" style={{ height: '46px', marginRight: '16px' }} />
          <h1 style={{ fontSize: '1.6rem', margin: 0 }}>BubbleBuy</h1>
        </div>
        <nav>
          {['home', 'products', 'cart', 'checkout', 'auth'].map((v) => (
            <button key={v} className="btn btn-link text-white" onClick={() => setView(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </nav>
      </header>

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
