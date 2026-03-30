import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { cartCount } = useCart();
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">ShopReact</Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {!isAuthenticated ? (
            <Link 
              to="/login"
              style={{
                padding: '0.4rem 1rem',
                border: '1px solid #4f46e5',
                color: '#4f46e5',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              Login
            </Link>
          ) : (
            <>
              <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                Hi, {username}
              </span>
              <Link 
                to="/profile" 
                style={{ fontSize: '0.875rem', color: '#4b5563', textDecoration: 'none' }}
              >
                My Profile
              </Link>
              <button 
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Logout
              </button>
            </>
          )}

          <Link to="/cart" className="navbar-cart">
            <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}
