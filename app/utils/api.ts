import axios from 'axios';

const API_BASE_URL = 'https://example.com';


export const signUp = async (payload:any) => {
  try {
    //const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
    //return response.data;  
    return true;
  } catch (error) {
    console.error("Error signing up", error);
    throw error;  
  }
};

export const login = async (email: string, password: string) => {
  try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
          return data; // Return token and user data
      } else {
          throw new Error(data.message || 'Authentication failed');
      }
  } catch (error) {
      console.error('Login failed:', error);
      throw error;
  }
};


export const sendOtp = async (payload:any) => {
  try {
    //const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
    //return response.data;  
    return true;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;  
  }
};

export const resetPassword = async (payload:any) => {
  try {
    //const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
    //return response.data; 
    return true; 
  } catch (error) {
    console.error("Error reseting password", error);
    throw error;  
  }
};

