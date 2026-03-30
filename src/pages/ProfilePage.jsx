import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUser, getUserCart } from '../utils/api';
import ErrorMessage from '../components/ErrorMessage';
import './HomePage.css'; // Reuse basic layout classes if needed

export default function ProfilePage() {
  const { userId } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [cartHistory, setCartHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        let userRes = null;
        let cartRes = [];

        // Try getting the profile from API
        try {
          userRes = await getUser(userId);
        } catch (e) {
          console.warn("API User fetch failed, proceeding to check local storage.");
        }

        // Try getting cart from API
        try {
          cartRes = await getUserCart(userId);
        } catch (e) {
          console.warn("API Cart fetch failed.");
        }

        // Fallback for locally registered users
        if (!userRes) {
          const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
          const localUser = localUsers.find(u => u.id === userId);
          if (localUser) {
            userRes = {
              username: localUser.username,
              email: localUser.email,
              name: { firstname: localUser.username, lastname: '' },
              address: { street: 'Local Street', city: 'Local City', zipcode: '00000' },
              phone: 'N/A'
            };
          }
        }

        // Add any locally confirmed orders to the API history so it actually shows up
        const localOrders = JSON.parse(localStorage.getItem('localOrders') || '[]');
        const userLocalOrders = localOrders.filter(o => String(o.userId) === String(userId));
        
        // Combine them, putting recent local ones on top
        const fullCartHistory = [...userLocalOrders, ...(cartRes || [])];

        setProfile(userRes);
        setCartHistory(fullCartHistory);
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        Loading profile...
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
        My Profile
      </h1>

      {profile && (
        <div style={{
          backgroundColor: '#fff',
          padding: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
            Account info
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <strong style={{ color: '#4b5563' }}>Name:</strong> <br/>
              {profile.name?.firstname} {profile.name?.lastname}
            </div>
            <div>
              <strong style={{ color: '#4b5563' }}>Username:</strong> <br/>
              {profile.username}
            </div>
            <div>
              <strong style={{ color: '#4b5563' }}>Email:</strong> <br/>
              {profile.email}
            </div>
            <div>
              <strong style={{ color: '#4b5563' }}>Phone:</strong> <br/>
              {profile.phone}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <strong style={{ color: '#4b5563' }}>Address:</strong> <br/>
              {profile.address?.street}, {profile.address?.city}, {profile.address?.zipcode}
            </div>
          </div>
        </div>
      )}

      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
        My Cart History
      </h2>
      
      {cartHistory.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No cart history found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cartHistory.map(cart => (
            <div key={cart.id} style={{
              backgroundColor: '#fff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>Cart #{cart.id}</strong>
                <span style={{ color: '#6b7280' }}>{cart.date?.split('T')[0]}</span>
              </div>
              <div style={{ color: '#4b5563' }}>
                Items: {cart.products?.reduce((acc, item) => acc + item.quantity, 0)} (Total products: {cart.products?.length})
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
