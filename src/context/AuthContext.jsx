import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getUser } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userId, setUserId] = useState(
    localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')) : null
  );
  const [username, setUsername] = useState(localStorage.getItem('username') || null);

  const isAuthenticated = !!token;

  const login = async (inputUsername, password) => {
    try {
      const result = await apiLogin(inputUsername, password);
      
      if (result && result.token) {
        // Fake Store API does not give userId on login, using id=1 for demo since 
        // the provided demo login 'johnd' / 'm38rmF$' is for id 1
        const demoUserId = 1; 

        localStorage.setItem('token', result.token);
        localStorage.setItem('userId', demoUserId);
        localStorage.setItem('username', inputUsername);

        setToken(result.token);
        setUserId(demoUserId);
        setUsername(inputUsername);

        // Optional: fetch user details
        try {
          await getUser(demoUserId);
        } catch (e) {
          console.warn('Could not fetch user profile', e);
        }

        return { success: true };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    
    setToken(null);
    setUserId(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, username, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
