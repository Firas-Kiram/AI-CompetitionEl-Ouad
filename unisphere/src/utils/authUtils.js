/**
 * Authentication Utilities
 * 
 * Helper functions for user authentication, session management,
 * and token handling.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API URL (replace with your actual API URL in production)
const API_URL = 'http://localhost:3000/api';

// Token storage keys
const AUTH_TOKEN_KEY = 'authToken';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const USER_DATA_KEY = 'userData';

// Storage keys
const TOKEN_KEY = 'unisphere_auth_token';
const USER_KEY = 'unisphere_user';

/**
 * Login user and store authentication token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Login result
 */
export const loginUser = async (email, password) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate authentication logic
    // In a real app, this would verify credentials against a backend
    if (email && password) {
      // Simulate a successful login
      const user = {
        id: `user_${Math.floor(Math.random() * 10000)}`,
        email,
        firstName: 'Test',
        lastName: 'User',
        isVerified: true,
        type: 'student'
      };
      
      // Store user data
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Generate and store auth token
      const token = `token_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      
      return {
        success: true,
        user,
        token
      };
    } else {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
};

/**
 * Store authentication data in secure storage
 * @param {Object} authData - Authentication data from server
 */
export const storeAuthData = async (authData) => {
  try {
    // Calculate token expiry date
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + authData.expiresIn);
    
    // Store token, expiry and user data
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, authData.token);
    await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString());
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(authData.user));
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw error;
  }
};

/**
 * Check if user is logged in with a valid token
 * @returns {Promise<boolean>} - Whether user is logged in
 */
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const tokenExpiry = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !tokenExpiry) {
      return false;
    }
    
    // Check if token is expired
    const expiryDate = new Date(tokenExpiry);
    const now = new Date();
    
    if (now >= expiryDate) {
      // Token expired, clean up
      await logout();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

/**
 * Check if user's email is verified
 * @returns {Promise<boolean>} - Whether user's email is verified
 */
export const isEmailVerified = async () => {
  try {
    const userData = await getUser();
    return userData?.isVerified || false;
  } catch (error) {
    console.error('Email verification check error:', error);
    return false;
  }
};

/**
 * Get the current authentication token
 * @returns {Promise<string|null>} - Auth token or null if not found
 */
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Get the current user data
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export const getUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Update user profile data
 * @param {Object} userData - Updated user data
 * @returns {Promise<boolean>} - Whether update was successful
 */
export const updateUserData = async (userData) => {
  try {
    // In a real app, you would make an API request here
    // For now, we'll just update the local storage
    
    // Get existing user data
    const existingData = await getUser();
    if (!existingData) {
      return false;
    }
    
    // Update user data
    const updatedData = { ...existingData, ...userData };
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
    
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
};

/**
 * Resend email verification
 * @param {string} email - User email
 * @returns {Promise<Object>} - Result of operation
 */
export const resendVerificationEmail = async (email) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would trigger an API to resend the verification email
    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Resend verification error:', error);
    return { success: false, message: 'Failed to resend verification email' };
  }
};

/**
 * Refresh the authentication token
 * @returns {Promise<boolean>} - Whether token refresh was successful
 */
export const refreshToken = async () => {
  try {
    // In a real app, you would make an API request with the refresh token
    // For demonstration, we'll extend the current token
    
    const token = await getAuthToken();
    const userData = await getUser();
    
    if (!token || !userData) {
      return false;
    }
    
    // Mock token refresh with extended expiry
    const authData = {
      token: token,
      expiresIn: 86400, // Extend for another 24 hours
      user: userData
    };
    
    await storeAuthData(authData);
    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
};

/**
 * Logout the user and clear auth data
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    // In a real app, you might want to invalidate the token on the server
    // Here we just clear the local storage
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(TOKEN_EXPIRY_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Set up axios interceptors for authentication
 * This configures axios to automatically add the auth token and handle 401 errors
 */
export const setupAuthInterceptors = () => {
  // Request interceptor - add auth token to all requests
  axios.interceptors.request.use(
    async config => {
      const token = await getAuthToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );
  
  // Response interceptor - handle token expiration
  axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      // If error is 401 (Unauthorized) and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Try to refresh the token
        const refreshSuccessful = await refreshToken();
        
        if (refreshSuccessful) {
          // Retry the original request with the new token
          const token = await getAuthToken();
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axios(originalRequest);
        } else {
          // If refresh failed, log out the user
          await logout();
          return Promise.reject(error);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// Authentication utilities for the UniSphere app
const authUtils = {
  // Register a new user
  registerUser: async (userData) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate email verification
      const newUser = {
        ...userData,
        id: `user_${Math.floor(Math.random() * 10000)}`,
        isVerified: false,
        createdAt: new Date().toISOString()
      };
      
      // Store user data (in a real app, this would come from the backend)
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
      
      // Generate a mock token
      const token = `token_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      
      return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        user: newUser,
        token
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An error occurred during registration'
      };
    }
  },
  
  // Verify email
  verifyEmail: async (verificationToken) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would send the token to the backend for verification
      const userString = await AsyncStorage.getItem(USER_KEY);
      if (userString) {
        const user = JSON.parse(userString);
        user.isVerified = true;
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        return { success: true };
      }
      return { success: false, message: 'User not found' };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, message: 'Failed to verify email' };
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      const userString = await AsyncStorage.getItem(USER_KEY);
      if (userString) {
        return JSON.parse(userString);
      }
      return null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
};

export default {
  loginUser,
  isAuthenticated,
  isEmailVerified,
  getAuthToken,
  getUser,
  updateUserData,
  resendVerificationEmail,
  refreshToken,
  logout,
  setupAuthInterceptors,
  ...authUtils
}; 