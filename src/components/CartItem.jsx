import { formatPrice } from '../utils/formatPrice';
import './CartItem.css';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="cart-item">
      <img src={item.image} alt={item.title} className="cart-item-img" />
      <div className="cart-item-info">
        <h4 className="cart-item-title">{item.title}</h4>
        <p className="cart-item-price">{formatPrice(item.price)}</p>
      </div>
      <div className="cart-item-controls">
        <div className="qty-stepper">
          <button
            className="qty-btn"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="qty-value">{item.quantity}</span>
          <button
            className="qty-btn"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <p className="cart-item-line-total">{formatPrice(item.price * item.quantity)}</p>
        <button
          className="cart-item-remove"
          onClick={() => onRemove(item.id)}
          aria-label="Remove item"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
