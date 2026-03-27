import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const placingOrderRef = useRef(false);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    document.title = 'ShopReact — Checkout';
  }, []);

  useEffect(() => {
    if (cart.length === 0 && !placingOrderRef.current) {
      navigate('/cart', { replace: true });
    }
  }, [cart.length, navigate]);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    placingOrderRef.current = true;
    const orderSummary = {
      items: cart.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        total: item.price * item.quantity,
      })),
      total: cartTotal,
      name,
      address,
      email,
      date: new Date().toISOString(),
    };
    sessionStorage.setItem('lastOrder', JSON.stringify(orderSummary));
    clearCart();
    navigate('/order-confirm');
  };

  if (cart.length === 0 && !placingOrderRef.current) return null;

  return (
    <div className="checkout-page">
      <div className="checkout-layout">
        <div className="checkout-form-col">
          <h1 className="checkout-title">Checkout</h1>
          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                className="form-input"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="address">Delivery Address</label>
              <input
                id="address"
                className="form-input"
                type="text"
                placeholder="123 Main St, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="form-input"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="checkout-submit-btn">Place Order</button>
            <Link to="/cart" className="checkout-back">← Back to Cart</Link>
          </form>
        </div>
        <div className="checkout-summary-col">
          <h2 className="checkout-summary-title">Order Summary</h2>
          <div className="checkout-summary-items">
            {cart.map((item) => (
              <div key={item.id} className="checkout-summary-item">
                <span className="checkout-item-name">{item.title} × {item.quantity}</span>
                <span className="checkout-item-price">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-summary-total">
            <span>Total</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
