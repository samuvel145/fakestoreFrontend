import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getUserCart, createCart, updateCart } from '../utils/api';

const CartContext = createContext();

const getInitialCart = () => {
  try {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export default function CartProvider({ children }) {
  const { isAuthenticated, userId } = useAuth();
  
  const [cart, setCart] = useState(getInitialCart);
  const [cartId, setCartId] = useState(null);
  
  // Track if we are currently fetching/initializing to avoid redundant syncs
  const isInitializingMatch = useRef(false);

  // Initialize Cart on Auth change
  useEffect(() => {
    const fetchApiCart = async () => {
      isInitializingMatch.current = true;
      try {
        const carts = await getUserCart(userId);
        if (carts && carts.length > 0) {
          const apiCart = carts[0];
          setCartId(apiCart.id);
          
          // Fetch product details for each item in the API cart
          const fullCartItems = await Promise.all(
            apiCart.products.map(async (item) => {
              try {
                // We use standard fetch here or we could import a custom API method
                const API = import.meta.env.VITE_API_BASE_URL || 'https://fakestoreapi.com';
                const res = await fetch(`${API}/products/${item.productId}`);
                if (!res.ok) throw new Error('Fetch failed');
                const product = await res.json();
                
                return {
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  image: product.image,
                  quantity: item.quantity
                };
              } catch (e) {
                // If a product fetch fails, gracefully skip or return a fallback
                return null;
              }
            })
          );
          
          setCart(fullCartItems.filter(Boolean));
        } else {
          // No API cart found
          setCartId(null);
          setCart([]);
        }
      } catch (error) {
        console.error("Failed to sync cart from API", error);
        // Fallback to local storage if API fails
        setCart(getInitialCart());
      } finally {
        isInitializingMatch.current = false;
      }
    };

    if (isAuthenticated && userId) {
      fetchApiCart();
    } else {
      setCart(getInitialCart());
      setCartId(null);
    }
  }, [isAuthenticated, userId]);

  // Sync Cart to API when cart state changes
  useEffect(() => {
    if (isInitializingMatch.current) return;

    // Always update local storage as fallback
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch {
      /* localStorage unavailable */
    }

    const syncToAPI = async () => {
      if (!isAuthenticated || !userId) return;

      const products = cart.map((i) => ({ productId: i.id, quantity: i.quantity }));
      
      try {
        if (cartId) {
          await updateCart(cartId, userId, products);
        } else if (products.length > 0) {
          const result = await createCart(userId, products);
          if (result && result.id) {
            setCartId(result.id);
          }
        }
      } catch (error) {
        console.error("Failed to sync cart to API", error);
      }
    };

    // Debounce or sync immediately 
    // For this context, we'll sync immediately on change
    syncToAPI();
  }, [cart, isAuthenticated, userId, cartId]);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, title: product.title, price: product.price, image: product.image, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, cartId }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, cartId]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
