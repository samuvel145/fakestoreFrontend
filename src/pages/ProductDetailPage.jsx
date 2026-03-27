import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './ProductDetailPage.css';

const API = import.meta.env.VITE_API_BASE_URL;

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: product, isLoading, error } = useFetch(`${API}/products/${id}`);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      document.title = `ShopReact — ${product.title}`;
    }
  }, [product]);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  const renderStars = (rate) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(rate) ? 'star star--filled' : 'star'}>
          {i <= Math.round(rate) ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (!product) return <ErrorMessage message="Product not found." />;

  return (
    <div className="pdp">
      <div className="pdp-image-col">
        <img src={product.image} alt={product.title} className="pdp-image" />
      </div>
      <div className="pdp-info-col">
        <span className="pdp-category">{product.category}</span>
        <h1 className="pdp-title">{product.title}</h1>
        {product.rating && (
          <div className="pdp-rating">
            <span className="pdp-stars">{renderStars(product.rating.rate)}</span>
            <span className="pdp-rating-count">({product.rating.count} reviews)</span>
          </div>
        )}
        <p className="pdp-price">{formatPrice(product.price)}</p>
        <hr className="pdp-divider" />
        <p className="pdp-description">{product.description}</p>
        <button
          className={`pdp-add-btn ${added ? 'pdp-add-btn--added' : ''}`}
          onClick={handleAdd}
        >
          {added ? '✓ Added to Cart!' : 'Add to Cart'}
        </button>
        <Link to="/" className="pdp-back">← Back to Products</Link>
      </div>
    </div>
  );
}
