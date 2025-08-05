import React, { useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';
import NewNavbar from '../components/reusable/NewNavbar';
import Footer from "../components/reusable/Footer";

const CompanyProfile = () => {
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState(''); // Single input field for company name or domain
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Function to clean JSON string
    const cleanJsonString = (jsonString) => {
        return jsonString
            .replace(/\\n/g, '\n') // Replace escaped newlines with actual newlines
            .replace(/\\t/g, '\t') // Replace escaped tabs
            .replace(/\\"/g, '"')  // Replace escaped quotes
            .replace(/\\\\/g, '')  // Remove double backslashes
            .replace(/\\/g, '')    // Remove any remaining single backslashes
            .replace(/\n{2,}/g, '\n'); // Replace two or more consecutive newlines with a single newline
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const pollApi = async (url, params, headers) => {
        let attempts = 0;
        const maxAttempts = 30; // Limit polling to ~60 seconds (30 * 2s)

        while (attempts < maxAttempts) {
            try {
                const response = await axios.get(url, { params, headers });
                if (response.status === 200) {
                    return response.data;
                } else if (response.status === 202) {
                    attempts++;
                    await delay(5000); // Wait 2 seconds before retrying
                    continue;
                } else {
                    throw new Error(`Unexpected status code: ${response.status}`);
                }
            } catch (error) {
                throw error; // Let the caller handle the error
            }
        }
        throw new Error('Polling timed out after maximum attempts');
    };

    const handleScan = async () => {
        const token = Cookies.get('access_token');
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        if (!token) {
            alert('Access token missing. Please login again.');
            navigate('/login');
            return;
        }

        if (!searchInput) {
            alert('Please enter a Company Name or Domain.');
            return;
        }

        setLoading(true);

        try {
            const url = `${API_BASE_URL}/dashboard/company_profile/`;
            const params = {
                query: searchInput, // Send input as query
                company_name: searchInput, // Send input as company_name
            };
            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const responseData = await pollApi(url, params, headers);
            setData(responseData);
        } catch (error) {
            console.error('Scan failed:', error);
            setData({ error: 'Failed to fetch data. Check CORS or token issues.' });
        }

        setLoading(false);
    };

    // Handle Enter key press
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleScan();
        }
    };

    return (
        <div>
            <NewNavbar />
            <div className="min-h-screen bg-gray-900 text-white relative p-4 sm:p-6 pt-12">
                <div className="flex flex-col items-center justify-start space-y-6 sm:space-y-8">
                    <h1 className="text-2xl sm:text-3xl font-bold mt-4 sm:mt-6">Company Profile</h1>
                    <div className="w-full max-w-sm sm:max-w-md space-y-4 sm:space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                            <label className="w-full sm:w-1/2 font-semibold text-sm sm:text-base">Company Name/Domain:</label>
                            {/* Changed w-1/2 to w-full sm:w-1/2 for input width */}
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full sm:w-1/2 p-2 rounded bg-gray-800 border border-gray-600 text-sm sm:text-base"
                                placeholder="e.g., Blue Cloud Softech or bluecloudsoftech.com"
                            />
                        </div>
                        <div className="flex justify-center">
                            <button
                                onClick={handleScan}
                                className="bg-vibrantOrange w-full sm:w-1/2 px-4 sm:px-6 py-2 rounded text-white font-semibold hover:bg-orange-500 text-sm sm:text-base"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </span>
                                ) : (
                                    'Generate'
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Results */}
                    <div className="w-full max-w-full sm:max-w-7xl mt-6 sm:mt-8 bg-gray-800 p-3 sm:p-4 rounded shadow-lg overflow-x-auto">
                        {data ? (
                            <div className="space-y-4">
                                {/* Display readable string format */}
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-vibrantOrange mb-2">Raw Response:</h2>
                                    <p className="text-xs sm:text-sm text-gray-300 break-words">
                                        {typeof data === 'object' ? 'Data received successfully.' : String(data)}
                                    </p>
                                </div>
                                {/* Display JSON data nicely */}
                                {typeof data === 'object' && data.data && data.data.json_data ? (
                                    <div>
                                        <h2 className="text-base sm:text-lg font-bold text-vibrantOrange mb-2">Formatted JSON:</h2>
                                        <div className="space-y-4">
                                            {data.data.json_data.subpages && (
                                                <div>
                                                    <h3 className="text-sm sm:text-md font-semibold text-vibrantOrange">subpages</h3>
                                                    <pre className="whitespace-pre-wrap text-xs sm:text-sm text-white bg-gray-900 p-2 sm:p-3 rounded border border-gray-700 overflow-x-auto">
                                                        {cleanJsonString(JSON.stringify(data.data.json_data.subpages, null, 2))}
                                                    </pre>
                                                </div>
                                            )}
                                            {data.data.json_data.latest_info && (
                                                <div>
                                                    <h3 className="text-sm sm:text-md font-semibold text-vibrantOrange">latest_info</h3>
                                                    <pre className="whitespace-pre-wrap text-xs sm:text-sm text-white bg-gray-900 p-2 sm:p-3 rounded border border-gray-700 overflow-x-auto">
                                                        {cleanJsonString(JSON.stringify(data.data.json_data.latest_info, null, 2))}
                                                    </pre>
                                                </div>
                                            )}
                                            {data.data.json_data.linkedin_profile && (
                                                <div>
                                                    <h3 className="text-sm sm:text-md font-semibold text-vibrantOrange">linkedin_profile</h3>
                                                    <pre className="whitespace-pre-wrap text-xs sm:text-sm text-white bg-gray-900 p-2 sm:p-3 rounded border border-gray-700 overflow-x-auto">
                                                        {cleanJsonString(JSON.stringify(data.data.json_data.linkedin_profile, null, 2))}
                                                    </pre>
                                                </div>
                                            )}
                                            {data.data.json_data.twitter_profile && (
                                                <div>
                                                    <h3 className="text-sm sm:text-md font-semibold text-vibrantOrange">twitter_profile</h3>
                                                    <pre className="whitespace-pre-wrap text-xs sm:text-sm text-white bg-gray-900 p-2 sm:p-3 rounded border border-gray-700 overflow-x-auto">
                                                        {cleanJsonString(JSON.stringify(data.data.json_data.twitter_profile, null, 2))}
                                                    </pre>
                                                </div>
                                            )}
                                            {data.data.json_data.facebook_profile && (
                                                <div>
                                                    <h3 className="text-sm sm:text-md font-semibold text-vibrantOrange">facebook_profile</h3>
                                                    <pre className="whitespace-pre-wrap text-xs sm:text-sm text-white bg-gray-900 p-2 sm:p-3 rounded border border-gray-700 overflow-x-auto">
                                                        {cleanJsonString(JSON.stringify(data.data.json_data.facebook_profile, null, 2))}
                                                    </pre>
                                                </div>
                                            )}
                                            {data.data.json_data.youtube_profile && (
                                                <div>
                                                    <h3 className="text-sm sm:text-md font-semibold text-vibrantOrange">youtube_profile</h3>
                                                    <pre className="whitespace-pre-wrap text-xs sm:text-sm text-white bg-gray-900 p-2 sm:p-3 rounded border border-gray-700 overflow-x-auto">
                                                        {cleanJsonString(JSON.stringify(data.data.json_data.youtube_profile, null, 2))}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-red-500 text-xs sm:text-sm">No valid JSON data available.</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-xs sm:text-sm">No data yet. Fill the form and hit Generate.</p>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CompanyProfile;