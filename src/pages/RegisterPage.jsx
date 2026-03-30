import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../utils/api';

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Fake Store API expects an object format. It will return id of created user.
      const userData = {
        email: email,
        username: username,
        password: password,
        name: { firstname: username, lastname: '' },
        address: { city: '', street: '', number: 0, zipcode: '', geolocation: { lat: '0', long: '0' } },
        phone: ''
      };
      
      const result = await registerUser(userData);
      
      if (result && result.id) {
        setSuccess('Account created successfully! You can now log in.');
        setUsername('');
        setEmail('');
        setPassword('');
        
        // Optional: Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
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
            Create a new account
          </p>
        </div>

        {success && (
          <div style={{ 
            backgroundColor: '#dcfce7', 
            color: '#166534', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.875rem'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <input
              type="text"
              placeholder="Username"
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
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="Password"
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
            {isLoading ? 'Creating account...' : 'Register'}
          </button>

          {error && (
            <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.875rem', margin: 0 }}>
              {error}
            </p>
          )}
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Already have an account? {' '}
          <Link to="/login" style={{ color: '#4f46e5', textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
