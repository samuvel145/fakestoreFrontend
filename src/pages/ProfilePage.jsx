import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUser, getUserCart } from '../utils/api';
import ErrorMessage from '../components/ErrorMessage';
import { formatPrice } from '../utils/formatPrice';
import './HomePage.css'; 

export default function ProfilePage() {
  const { userId } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [cartHistory, setCartHistory] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        let userRes = null;
        let cartRes = [];

        // Fetch user info
        try {
          userRes = await getUser(userId);
        } catch (e) {
          console.warn("API User fetch failed, proceeding to check local storage.");
        }

        // Fetch remote carts
        try {
          cartRes = await getUserCart(userId);
        } catch (e) {
          console.warn("API Cart fetch failed.");
        }

        // Fallback for locally registered users
        if (!userRes) {
          const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
          const localUser = localUsers.find(u => String(u.id) === String(userId));
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

        // Add local completed orders 
        const localOrders = JSON.parse(localStorage.getItem('localOrders') || '[]');
        const userLocalOrders = localOrders.filter(o => String(o.userId) === String(userId));
        const fullCartHistory = [...userLocalOrders, ...(cartRes || [])];

        // Fetch ALL products securely so we can map product details directly 
        // across both API Carts and LocalOrders universally without 100 API hits.
        try {
          const API = import.meta.env.VITE_API_BASE_URL || 'https://fakestoreapi.com';
          const productsRes = await fetch(`${API}/products`);
          if (productsRes.ok) {
            const allProducts = await productsRes.json();
            const pMap = {};
            allProducts.forEach(p => { pMap[p.id] = p; });
            setProductsMap(pMap);
          }
        } catch (e) {
          console.warn('Failed to load products mapping for cart history ui.');
        }

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
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
            Account info
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><strong style={{ color: '#4b5563' }}>Name:</strong> <br/>{profile.name?.firstname} {profile.name?.lastname}</div>
            <div><strong style={{ color: '#4b5563' }}>Username:</strong> <br/>{profile.username}</div>
            <div><strong style={{ color: '#4b5563' }}>Email:</strong> <br/>{profile.email}</div>
            <div><strong style={{ color: '#4b5563' }}>Phone:</strong> <br/>{profile.phone}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#4b5563' }}>Address:</strong> <br/>{profile.address?.street}, {profile.address?.city}, {profile.address?.zipcode}</div>
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
          {cartHistory.map((cart, idx) => (
            <div key={`${cart.id}-${idx}`} style={{
              backgroundColor: '#fff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>Order #{cart.id}</strong>
                <span style={{ color: '#6b7280' }}>{cart.date?.split('T')[0]}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cart.products?.map((item, index) => {
                  const productDetails = productsMap[item.productId];
                  
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Product Image */}
                      {productDetails ? (
                        <div style={{ width: '60px', height: '60px', flexShrink: 0, backgroundColor: '#f9fafb', borderRadius: '0.5rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img 
                            src={productDetails.image} 
                            alt={productDetails.title} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                          />
                        </div>
                      ) : (
                        <div style={{ width: '60px', height: '60px', flexShrink: 0, backgroundColor: '#e5e7eb', borderRadius: '0.5rem' }}></div>
                      )}
                      
                      {/* Product Text info */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: '#374151', fontSize: '0.95rem' }}>
                          {productDetails ? productDetails.title : `Product ID: ${item.productId}`}
                        </strong>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                          Qty: {item.quantity} {productDetails && ` × ${formatPrice(productDetails.price)}`}
                        </div>
                      </div>

                      {/* Line Item Total */}
                      {productDetails && (
                        <div style={{ fontWeight: '600', color: '#111827' }}>
                          {formatPrice(productDetails.price * item.quantity)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
