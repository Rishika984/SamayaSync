import API from './api';

// Register user
export const register = async (userData) => {
  try {
    const response = await API.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Google login - redirect to backend OAuth flow
export const loginWithGoogle = () => {
  window.location.href = 'http://localhost:5000/api/auth/google';
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await API.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await API.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (token, password) => {
  try {
    const response = await API.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    const response = await API.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error;
  }
};