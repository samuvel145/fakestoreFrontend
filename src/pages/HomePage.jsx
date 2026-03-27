import { useState, useEffect } from 'react';
import useFetch from '../hooks/useFetch';
import ProductCard, { SkeletonCard } from '../components/ProductCard';
import ErrorMessage from '../components/ErrorMessage';
import './HomePage.css';

const API = import.meta.env.VITE_API_BASE_URL;

export default function HomePage() {
  const { data: allProducts, isLoading, error } = useFetch(`${API}/products`);
  const { data: categories } = useFetch(`${API}/products/categories`);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);

  useEffect(() => {
    document.title = 'ShopReact — Home';
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(null);
      return;
    }

    const fetchCategory = async () => {
      setFilterLoading(true);
      try {
        const res = await fetch(`${API}/products/category/${selectedCategory}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setFilteredProducts(data);
      } catch {
        setFilteredProducts([]);
      } finally {
        setFilterLoading(false);
      }
    };

    fetchCategory();
  }, [selectedCategory]);

  const products = filteredProducts ?? allProducts;
  const loading = isLoading || filterLoading;

  return (
    <div className="home-page">
      <h1 className="home-title">Our Products</h1>

      {categories && (
        <div className="category-filters">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'category-btn--active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'category-btn--active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={() => window.location.reload()} />}

      {loading && (
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && !error && products && products.length === 0 && (
        <p className="home-empty">No products found.</p>
      )}

      {!loading && !error && products && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
