import React, { useState } from 'react';
import axios from 'axios';
import {useParams, useNavigate } from 'react-router-dom';
import loginimg from '../assets/images/login-img.png';

const ResetPassword = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { token } = useParams(); // Extract the token from the URL
  console.log(token);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateFields = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = 'Please enter your new password.';
    } else if (password.length < 6) {
      newErrors.password = 'Password should be at least 6 characters long.';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }; 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const apiUrl = `${API_BASE_URL}/auth/reset_password/${token}`;

    // Send the password and confirmPassword in the request body
    const response = await axios.post(apiUrl, {
      new_password: password,
      confirm_password: confirmPassword,
    });
       if(response && response.status === 200 ){
        setMessage(response.data.message);
        }
      
      setTimeout(() => navigate('/login'), 2000); // Redirect after showing success message

    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message|| 'An unexpected error occurred.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-customGray">
      <div className="bg-white flex shadow-lg rounded-lg overflow-hidden w-11/12 max-w-4xl">
        <div className="w-1/2 p-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">BluHawk</h1>
          <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
          <p className="text-gray-600 text-sm mb-6">
            Create a new password for your account.
          </p>
          {message && (
            <p
              className={`${
                message.includes('Error') ? 'text-red-500' : 'text-green-500'
              } text-sm mb-4`}
            >
              {message}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="new-password" className="block text-gray-700 text-sm font-medium mb-2">
                New Password:
              </label>
              <input
                type="password"
                id="new-password"
                value={password}
                onChange={(e) => [setPassword(e.target.value), setErrors((prev) => ({ ...prev, password: '',confirmPassword:'' }))]}
                className={`w-full px-4 py-2 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your new password"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div className="mb-6">
              <label htmlFor="confirm-password" className="block text-gray-700 text-sm font-medium mb-2">
                Confirm Password:
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) =>
                  [setConfirmPassword(e.target.value), setErrors((prev) => ({ ...prev, confirmPassword: '' }))]
                }
                className={`w-full px-4 py-2 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></span>
                  <span>Loading...</span>
                </div>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        </div>
        <div className="w-1/2 bg-customBlue flex items-center justify-center">
          <img src={loginimg} alt="Login Illustration" className="w-3/4" />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
