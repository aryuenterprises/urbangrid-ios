// src/services/api.js
import axios from 'axios';
import { navigationRef } from '../navigation/RootNavigation';
import NetInfo from '@react-native-community/netinfo';
import { API_BASE_URL } from '@env'
import Storage from '../utils/storage';
import { getAuthToken, removeAuthToken } from './auth';
// import { API_BASE_URL } from 'react-native-config'

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000
});

// Request interceptor: Attach token
api.interceptors.request.use(
    async (config) => {
        // config.headers['Content-Type'] = 'application/json';
        const token = getAuthToken();
        console.log("token", token)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            removeAuthToken();
            navigationRef.navigate('AuthStack', { screen: 'Login' });
        }
        return Promise.reject(error);
    }
);

const logout = async () => {
    removeAuthToken();
    navigationRef.navigate('AuthStack', { screen: 'Login' });
};

export default api;