import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const validateUrl = (url) => {
  const regex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i;
  return regex.test(url);
};

function Invites({ logoUrl: orgFormLogoUrl }) {
  const navigate = useNavigate();
  const { token } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false); // State for error dialog visibility
  const [showSuccessDialog, setShowSuccessDialog] = useState(false); // State for success dialog
  const [successMessage, setSuccessMessage] = useState(''); // State for success message

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    console.log('Token:', token);
    console.log('API Base URL:', API_BASE_URL);
    const fetchInvitation = async () => {
      try {
        const url = `${API_BASE_URL}/auth/invitation/details/${token}`;
        console.log('GET URL:', url);
        const response = await axios.get(url);
        console.log('GET response:', response.data);
        setInvitation(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError('Invalid or expired invitation.');
        setLoading(false);
      }
    };
    fetchInvitation();
  }, [token, API_BASE_URL]);

  const handleAction = async (action) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/organization/verify-invitation`, { token, action }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSuccessMessage(`Invitation ${action}ed successfully!`);
      setShowSuccessDialog(true); // Show success dialog
    } catch (err) {
      console.error('Action error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Failed to process the invitation.';
      setError(errorMessage);
      if (errorMessage === 'User does not exist. Please register first.') {
        setShowDialog(true);
      }
    }
  };

  const closeSuccessDialog = () => {
    setShowSuccessDialog(false);
    navigate('/'); // Navigate after closing the dialog
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p>Loading...</p>
      </div>
    );
  }

  if (error && !showDialog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-500 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white p-6 rounded-lg max-w-md w-full text-center border-4 border-orange-500">
        {orgFormLogoUrl && validateUrl(orgFormLogoUrl) ? (
          <img
            src={orgFormLogoUrl}
            alt="Organization Logo"
            className="w-24 h-24 object-contain mb-4 rounded-full"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/150/cccccc/000000?text=${invitation?.organization_name?.charAt(0).toUpperCase() || '?'}`;
            }}
          />
        ) : invitation?.organization_logo && validateUrl(invitation.organization_logo) ? (
          <img
            src={invitation.organization_logo}
            alt="Organization Logo"
            className="w-24 h-24 object-contain mb-4 rounded-full"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/150/cccccc/000000?text=${invitation?.organization_name?.charAt(0).toUpperCase() || '?'}`;
            }}
          />
        ) : (
          <div className="w-24 h-24 rounded-full mb-4 mx-auto">
            {orgFormLogoUrl && validateUrl(orgFormLogoUrl) ? (
              <img
                src={orgFormLogoUrl}
                alt="Organization Logo"
                className="w-24 h-24 object-contain rounded-full"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/150/cccccc/000000?text=${invitation?.organization_name?.charAt(0).toUpperCase() || '?'}`;
                }}
              />
            ) : invitation?.organization_logo && validateUrl(invitation.organization_logo) ? (
              <img
                src={invitation.organization_logo}
                alt="Organization Logo"
                className="w-24 h-24 object-contain rounded-full"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/150/cccccc/00000044?text=${invitation?.organization_name?.charAt(0).toUpperCase() || '?'}`;
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#91AAF5] flex items-center justify-center text-2xl font-bold text-[#101C40]">
                {invitation?.organization_name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
        )}
        <h2 className="text-xl font-semibold mb-6">Organization Invitation</h2>
        <p className="text-left mb-2">
          <strong>Organization Name :</strong> {invitation?.organization_name}
        </p>
        <p className="text-left mb-2">
          <strong>Role :</strong> {invitation?.role}
        </p>
        <p className="text-left mb-2">
          <strong>E-mail :</strong> {invitation?.email}
        </p>
        <p className="text-left mb-6">
          <strong>Admin E-mail :</strong> {invitation?.admin_email}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
            onClick={() => handleAction('reject')}
          >
            REJECT
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
            onClick={() => handleAction('accept')}
          >
            ACCEPT
          </button>
        </div>
        {/* Single-line error message at the bottom of the container */}
        {showDialog && (
          <p className="mt-2 text-red-500 text-sm">{error}</p>
        )}
        {/* Sign Up button at the bottom of the container */}
        {showDialog && (
          <div className="mt-2">
            <button
              onClick={() => navigate('/signup')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
    <div className="bg-white p-8 rounded-xl max-w-sm w-full text-center shadow-2xl transform transition-all duration-300 scale-95 hover:scale-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Success</h3>
      <p className="text-gray-600 mb-6">{successMessage}</p>
      <button
        onClick={closeSuccessDialog}
        className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors duration-200 font-semibold"
      >
        OK
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default Invites;