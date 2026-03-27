import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';
import './OrderConfirmPage.css';

export default function OrderConfirmPage() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    document.title = 'ShopReact — Order Confirmed';
    try {
      const data = sessionStorage.getItem('lastOrder');
      if (data) {
        setOrder(JSON.parse(data));
        sessionStorage.removeItem('lastOrder');
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="confirm-page">
      <div className="confirm-card">
        <div className="confirm-icon">✅</div>
        <h1 className="confirm-title">Order Placed Successfully!</h1>
        <p className="confirm-text">Thank you for your purchase. Your order is being processed.</p>

        {order && (
          <div className="confirm-summary">
            <h3 className="confirm-summary-heading">Order Summary</h3>
            {order.items.map((item, i) => (
              <div key={i} className="confirm-summary-row">
                <span>{item.title} × {item.quantity}</span>
                <span>{formatPrice(item.total)}</span>
              </div>
            ))}
            <div className="confirm-summary-total">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        )}

        <Link to="/" className="confirm-btn">Continue Shopping</Link>
      </div>
    </div>
  );
}
