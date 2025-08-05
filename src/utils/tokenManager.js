
import Cookies from 'js-cookie';
import { refreshAccessToken } from './apiAuth'

let refreshTimeout;

export const scheduleTokenRefresh = () => {
// console.log("scheduleTokenRefresh");
  const accessTokenExpiry = localStorage.getItem('access_token_expiry');

  if (accessTokenExpiry) {
    // console.log("accessTokenExpiry true: ",accessTokenExpiry);
    const expiryTime = parseInt(accessTokenExpiry, 10); // Convert to number
    const timeLeft = expiryTime - Date.now() - 60000;  // 1 minutes before expiry

    const formatTimeLeft = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
      
        return `${hours}h ${minutes}m ${seconds}s`;
      };
      // console.log("accessTokenExpiry : ",formatTimeLeft(expiryTime- Date.now()));
      // console.log("Time left:", formatTimeLeft(timeLeft));
      
    if (timeLeft > 0) {
      refreshTimeout = setTimeout(async () => {
        try {
          await refreshAccessToken();
          scheduleTokenRefresh(); // Schedule the next refresh
        } catch (error) {
          console.error('Token refresh failed:', error);
          handleSessionExpired(); // Handle session expiration
        }
      }, timeLeft);
    } else {
      console.log('Token already expired. Logging out...');
      handleSessionExpired();
    }
  }
};

export const clearTokenRefresh = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    // console.log('Cleared token refresh timeout.');
  }
};

export const handleSessionExpired = () => {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  localStorage.removeItem('access_token_expiry');
  window.location.href = '/login'; // Redirect to login page
};
