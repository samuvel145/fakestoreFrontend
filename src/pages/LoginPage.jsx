import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f9fafb',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '2rem',
        width: '100%',
        maxWidth: '28rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#4f46e5', fontSize: '2rem', fontWeight: 'bold', margin: '0' }}>
            ShopReact
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Sign in to your account
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#eff6ff', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: '#1e40af'
        }}>
          <strong>Demo credentials:</strong><br />
          username: johnd<br />
          password: m38rmF$
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              marginTop: '0.5rem'
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {error && (
            <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.875rem', margin: 0 }}>
              {error}
            </p>
          )}
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Don't have an account? {' '}
          <Link to="/register" style={{ color: '#4f46e5', textDecoration: 'none' }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
