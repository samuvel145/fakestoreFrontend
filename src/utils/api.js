const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fakestoreapi.com';

async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`API Error ${response.status}: ${errorData || response.statusText}`);
  }

  return response.json();
}

// AUTH
export const login = async (username, password) => {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

// USERS
export const getUser = async (id) => {
  return apiCall(`/users/${id}`);
};

export const registerUser = async (userData) => {
  return apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// CARTS
export const getUserCart = async (userId) => {
  return apiCall(`/carts/user/${userId}`);
};

export const createCart = async (userId, products) => {
  return apiCall('/carts', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      date: new Date().toISOString().split('T')[0],
      products,
    }),
  });
};

export const updateCart = async (cartId, userId, products) => {
  return apiCall(`/carts/${cartId}`, {
    method: 'PUT',
    body: JSON.stringify({
      userId,
      date: new Date().toISOString().split('T')[0],
      products,
    }),
  });
};

export const deleteCart = async (cartId) => {
  return apiCall(`/carts/${cartId}`, {
    method: 'DELETE',
  });
};
