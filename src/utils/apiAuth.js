import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

export const isAccessTokenExpired = () => {
    const expiryTime = localStorage.getItem('access_token_expiry');
    return !expiryTime || Date.now() > expiryTime;
};

let isRefreshing = false;

export const refreshAccessToken = async (retryCount = 3) => {
    if (isRefreshing) return null; // Avoid overlapping calls
    isRefreshing = true;

    try {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) {
            console.warn('No refresh token found. Logging out...');
            handleSessionExpired();
            return null;
        }

        const accessToken = Cookies.get('access_token');
        const refreshUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/refresh_access`;

        const response = await axios.post(refreshUrl, { refresh: refreshToken }, {
            headers: {
                // Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        const ACCESS_TOKEN_EXPIRY_MINUTES = 5;
        const { access_token, refresh_token } = response.data;

        Cookies.set('access_token', access_token, { expires: ACCESS_TOKEN_EXPIRY_MINUTES / 1440 });
        Cookies.set('refresh_token', refresh_token, { expires: 7 });
        localStorage.setItem('access_token_expiry', Date.now() + ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000);

        // console.log('Token refreshed successfully');
        return access_token;
    } catch (error) {
        console.error('Error refreshing access token:', error);

        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn('Unauthorized or forbidden. Logging out...');
            handleSessionExpired();
        } else if (retryCount > 0) {
            console.log(`Retrying token refresh... Attempts left: ${retryCount - 1}`);
            return refreshAccessToken(retryCount - 1); // Retry logic
        } else {
            toast.error('Network error. Please check your connection.');
        }
        throw error;
    } finally {
        isRefreshing = false;
    }
};

const handleSessionExpired = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('access_token_expiry');

    toast.warn('Session expired. Please log in again.');
    window.location.href = '/login';
};




