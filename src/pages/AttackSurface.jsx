
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import NewNavbar from '../components/reusable/NewNavbar';
import Footer from '../components/reusable/Footer';
import {
  renderAssetsDiscovered,
  EmailChecklists,
  ActiveSubdomainsTable,
  renderDNSRecords,
  renderWhois,
  renderPorts,
  renderSubdomains,
  renderShodan,
  renderWapitiReport,
  renderSSLCertificate,
  renderSSLWarnings,
  renderSSLRecommendations,
  renderProtocols,
} from '../utils/renderUtils.jsx';

const AttackSurface = () => {
  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState({});
  const [searchErr, setSearchErr] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [visibleSubdomains, setVisibleSubdomains] = useState(10);
  const [expandedCve, setExpandedCve] = useState(null);
  const navigate = useNavigate();

  const domainPattern = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,})+$/;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  const validateInput = (input) => {
    if (domainPattern.test(input)) {
      return { isValid: true, type: 'domain' };
    }
    return { isValid: false, type: null };
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = Cookies.get('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available. Please log in again.');
      }
      const response = await axios.post(
        `${API_BASE_URL}/api/refresh-token/`,
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const newAccessToken = response.data.access_token;
      Cookies.set('access_token', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Token Refresh Error:', error);
      throw new Error('Unable to refresh token. Please log in again.');
    }
  };

  const fetchData = async (domain) => {
    try {
      let accessToken = Cookies.get('access_token');
      if (!accessToken) {
        throw new Error('You are not authenticated. Please log in to continue.');
      }
      const response = await axios.get(
        `${API_BASE_URL}/api/attack-surface/scan/?domain=${domain}&scan_type=complete`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          validateStatus: (status) => status === 200 || status === 202,
        }
      );
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      if (error.response?.status === 401) {
        try {
          const newAccessToken = await refreshAccessToken();
          const retryResponse = await axios.get(
            `${API_BASE_URL}/api/attack-surface/scan/?domain=${domain}&scan_type=complete`,
            {
              headers: { Authorization: `Bearer ${newAccessToken}` },
              validateStatus: (status) => status === 200 || status === 202,
            }
          );
          console.log('Retry API Response:', retryResponse.data);
          return retryResponse;
        } catch (refreshError) {
          console.error('Refresh Error:', refreshError);
          throw new Error('Session expired. Please log in again.');
        }
      }
      throw new Error('Unable to load data. Please check and try again.');
    }
  };

  const conceptKeyMap = {
    email_hygiene: 'email_hygiene',
    whois: 'whois',
    wapiti: 'wapiti_report',
    subdomain_discovery: 'subdomains',
    subdomain_activity: 'active_subdomains',
    dns_records: 'dns_records',
    ports_scan: 'ports',
    ip_discovery: 'ip_addresses',
    shodan_scan: 'shodan',
    ssl_scan: 'ssl_comprehensive',
  };

  const processPartialData = (progress) => {
    const partialData = progress.reduce((acc, task) => {
      if (task.status === 'completed' && task.jsondata && Object.keys(task.jsondata).length > 0) {
        const conceptKey = conceptKeyMap[task.task_name] || task.task_name;
        console.log(`Processing task ${task.task_name}:`, task.jsondata);
        acc[conceptKey] = task.jsondata;
      }
      return acc;
    }, {});
    return partialData;
  };
const handleSearch = async (event) => {
  event.preventDefault();
  setSearchErr('');
  setIsLoading(true);
  setIsProcessing(false);
  setData({});
  setIsInitialized(false);
  setProcessingMessage('');
  setVisibleSubdomains(10);

  const result = validateInput(searchInput);
  if (!result.isValid) {
    setSearchErr('Invalid input. Please enter a valid domain.');
    setIsLoading(false);
    return;
  }

  try {
    const response = await fetchData(searchInput);
    if (response.status === 200) {
      // Revert to original behavior: set data directly without navigation
      setData(response.data); // Match original data structure
      setIsInitialized(true);
      setIsProcessing(false);
      setIsLoading(false);
      setProcessingMessage('');
    } else if (response.status === 202) {
      setIsProcessing(true);
      setIsLoading(false);
      setProcessingMessage(response.data.progress?.[response.data.progress.length - 1]?.message || 'Processing your request...');
      const partialData = processPartialData(response.data.progress || []);
      if (Object.keys(partialData).length > 0) {
        setData((prev) => ({ ...prev, ...partialData }));
        setIsInitialized(true);
      }
    }
  } catch (error) {
    setSearchErr(error.message);
    setData({});
    setIsInitialized(false);
    setIsLoading(false);
    setIsProcessing(false);
    setProcessingMessage('');
  }
};

useEffect(() => {
  let intervalId = null;
  if (isProcessing && !searchErr) {
    intervalId = setInterval(async () => {
      try {
        const response = await fetchData(searchInput);
        if (response.status === 200) {
          setData(response.data); // Match original data structure
          setIsInitialized(true);
          setIsLoading(false);
          setIsProcessing(false);
          setProcessingMessage('');
          clearInterval(intervalId);
        } else if (response.status === 202) {
          setProcessingMessage(response.data.progress?.[response.data.progress.length - 1]?.message || 'Processing your request...');
          const partialData = processPartialData(response.data.progress || []);
          if (Object.keys(partialData).length > 0) {
            setData((prev) => ({ ...prev, ...partialData }));
            setIsInitialized(true);
          }
        }
      } catch (error) {
        console.error('Polling Error:', error);
        setSearchErr(error.message || 'An error occurred while fetching data. Please try again.');
        setIsLoading(false);
        setIsProcessing(false);
        setProcessingMessage('');
        clearInterval(intervalId);
      }
    }, 15000);
  }
  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [isProcessing, searchErr, searchInput]);

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <NewNavbar />
      <main className="flex-1 text-white min-h-screen relative">
        <div className="bg-[#F5F5F5] p-2 shadow-md w-full">
          <form onSubmit={handleSearch} className="w-full">
            <div className="w-full mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center px-6 py-2 gap-2">
              <div className="text-xl sm:text-2xl font-semibold whitespace-nowrap text-center text-black sm:text-left mb-2 sm:mb-0">
                Enter Target
              </div>
              <div className="flex flex-row items-center gap-2 w-full sm:flex-grow relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => [setSearchInput(e.target.value), setSearchErr('')]}
                  placeholder="Enter the domain"
                  className="w-full sm:w-[200px] lg:w-[600px] sm:flex-grow h-[22px] sm:h-auto text-black px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base border rounded shadow-sm items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div
                  onClick={handleSearch}
                  className="flex items-center gap-1 bg-vibrantOrange text-white px-3 py-2 rounded shadow cursor-pointer hover:bg-orange-600 w-[20%] sm:w-auto justify-center transition-colors duration-200"
                >
                  <button className="focus:outline-none text-sm">Search</button>
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-4 h-4 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35M17.65 13.65A7.35 7.35 0 1113.65 3.7 7.35 7.35 0 0117.65 13.65z"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>
        {searchErr && <p className="text-red-500 text-center mt-4">{searchErr}</p>}
        {(isInitialized || isLoading || isProcessing) && (
          <div className="py-3 px-2 sm:px-12 max-w-7xl mx-auto">
            <div className="space-y-10">
              <div id="assets-discovered">{renderAssetsDiscovered(data, isLoading, isProcessing)}</div>
              <div id="whois-information-section">{renderWhois(data, isLoading, isProcessing)}</div>
              <div id="corporate-email-risk-assessment-section">
                <EmailChecklists data={data} isLoading={isLoading} isProcessing={isProcessing} />
              </div>
              <div id="subdomains-section">
                {renderSubdomains(data, visibleSubdomains, setVisibleSubdomains, isLoading, isProcessing)}
              </div>
              <div id="active-subdomains-section">
                <ActiveSubdomainsTable data={data} isLoading={isLoading} isProcessing={isProcessing} />
              </div>
              <div id="dns-records-section">{renderDNSRecords(data, isLoading, isProcessing)}</div>
              <div id="ssl-analysis-section" className="mb-10">
                <h2 className="text-2xl font-bold text-white pl-4 mb-6">SSL Analysis</h2>
                {renderSSLCertificate(data, isLoading, isProcessing)}
                {renderSSLWarnings(data, isLoading, isProcessing)}
                {renderSSLRecommendations(data, isLoading, isProcessing)}
                {renderProtocols(data, isLoading, isProcessing)}
              </div>
              <div id="technology-vulnerabilities-section">
                {renderShodan(data, expandedCve, setExpandedCve, searchInput, isLoading, isProcessing)}
              </div>
              <div id="web-application-vulnerability-details-section">
                {renderWapitiReport(data, isLoading, isProcessing)}
              </div>
              <div id="open-ports-section">{renderPorts(data, isLoading, isProcessing)}</div>
            </div>
          </div>
        )}
        {isInitialized && Object.keys(data).length === 0 && !searchErr && (
          <p className="text-center text-white mt-4">No data available</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AttackSurface;
