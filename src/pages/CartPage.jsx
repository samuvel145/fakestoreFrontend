import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import CartItem from '../components/CartItem';
import './CartPage.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  useEffect(() => {
    document.title = `ShopReact — Cart (${cartCount} items)`;
  }, [cartCount]);

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <span className="cart-empty-icon">🛍️</span>
        <h2 className="cart-empty-title">Your cart is empty</h2>
        <p className="cart-empty-text">Looks like you haven't added anything yet.</p>
        <Link to="/" className="cart-empty-btn">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page-title">Shopping Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>
        <div className="cart-summary">
          <h2 className="cart-summary-title">Order Summary</h2>
          <div className="cart-summary-row">
            <span>Items</span>
            <span>{cartCount}</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Subtotal</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <Link to="/checkout" className="cart-checkout-btn">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
