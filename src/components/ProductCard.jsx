import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import './ProductCard.css';

const ProductCard = memo(function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-card-img-wrap">
          <img
            src={product.image}
            alt={product.title}
            className="product-card-img"
            loading="lazy"
          />
        </div>
        <div className="product-card-body">
          <h3 className="product-card-title">{product.title}</h3>
          <p className="product-card-price">{formatPrice(product.price)}</p>
        </div>
      </Link>
      <button
        className={`product-card-btn ${added ? 'product-card-btn--added' : ''}`}
        onClick={handleAdd}
      >
        {added ? '✓ Added!' : 'Add to Cart'}
      </button>
    </div>
  );
});

export default ProductCard;

export function SkeletonCard() {
  return (
    <div className="product-card skeleton-card">
      <div className="skeleton-img"></div>
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-line--long"></div>
        <div className="skeleton-line skeleton-line--medium"></div>
        <div className="skeleton-line skeleton-line--short"></div>
        <div className="skeleton-btn"></div>
      </div>
    </div>
  );
}
