import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { deleteCart } from '../utils/api';
import { formatPrice } from '../utils/formatPrice';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, cartId } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const placingOrderRef = useRef(false);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    document.title = 'ShopReact — Checkout';
  }, []);

  useEffect(() => {
    if (cart.length === 0 && !placingOrderRef.current && !isSubmitting) {
      navigate('/cart', { replace: true });
    }
  }, [cart.length, navigate, isSubmitting]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    placingOrderRef.current = true;
    setIsSubmitting(true);
    setErrorMsg('');

    if (isAuthenticated && cartId) {
      try {
        await deleteCart(cartId);
      } catch (err) {
        console.error('Failed to submit order to API', err);
        setErrorMsg('API sync failed, but we processed your order locally.');
      }
    }

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
    
    setIsSubmitting(false);
    clearCart();
    navigate('/order-confirm');
  };

  if (cart.length === 0 && !placingOrderRef.current) return null;

  return (
    <div className="checkout-page">
      <div className="checkout-layout">
        <div className="checkout-form-col">
          <h1 className="checkout-title">Checkout</h1>
          {errorMsg && <p style={{ color: 'red', marginBottom: '1rem' }}>{errorMsg}</p>}
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
                required
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
                required
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
                required
              />
            </div>
            <button 
              type="submit" 
              className="checkout-submit-btn" 
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
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
