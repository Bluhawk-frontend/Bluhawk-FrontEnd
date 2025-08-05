import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NewNavbar from "../components/reusable/NewNavbar";
import Footer from "../components/reusable/Footer";
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
} from "../utils/renderUtils.jsx";

const JsonDataViewer = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const key = urlParams.get("key");
  const [data, setData] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState("");
  const [visibleSubdomains, setVisibleSubdomains] = useState(10);
  const [expandedCve, setExpandedCve] = useState(null);

  useEffect(() => {
    let jsonData = {};
    if (key) {
      const result = localStorage.getItem(key);
      if (result) {
        jsonData = JSON.parse(result);
        console.log("Retrieved jsonData from localStorage:", jsonData); // Debug log
        localStorage.removeItem(key); // Clean up after use
      } else {
        setError("No data found ");
        return;
      }
    } else if (state?.jsonData) {
      jsonData = state.jsonData; // Fallback to state if no key (original behavior)
    }

    // Map fields based on UsageDashboard's processedData structure
    const metadata = {
      scan_name: jsonData.api || "N/A", // Matches "api" field from processedData
      user__username: jsonData.user || "N/A", // Matches "user" field from processedData
      role: jsonData.group || "N/A", // Matches "group" field from processedData
      timestamp: jsonData.timestamp || "N/A", // Matches "timestamp" field from processedData
    };

    const dataField = jsonData.result || {}; // Matches "result" field (json_data) from processedData
    if (Object.keys(dataField).length > 0) {
      setData({ ...dataField, ...metadata }); // Combine metadata with result data
      setIsInitialized(true);
    } else {
      setError("No valid data available to display.");
    }
  }, [key, state]);

  const renderAttackSurface = () => {
    if (!isInitialized) return null;
    return (
      <div className="space-y-10">
        <div id="assets-discovered">{renderAssetsDiscovered(data, false, false)}</div>
        <div id="whois-information-section">{renderWhois(data, false, false)}</div>
        <div id="corporate-email-risk-assessment-section">
          <EmailChecklists data={data} isLoading={false} isProcessing={false} />
        </div>
        <div id="subdomains-section">
          {renderSubdomains(data, visibleSubdomains, setVisibleSubdomains, false, false)}
        </div>
        <div id="active-subdomains-section">
          <ActiveSubdomainsTable data={data} isLoading={false} isProcessing={false} />
        </div>
        <div id="dns-records-section">{renderDNSRecords(data, false, false)}</div>
        <div id="ssl-analysis-section" className="mb-10">
          <h2 className="text-2xl font-bold text-white pl-4 mb-6">SSL Analysis</h2>
          {renderSSLCertificate(data, false, false)}
          {renderSSLWarnings(data, false, false)}
          {renderSSLRecommendations(data, false, false)}
          {renderProtocols(data, false, false)}
        </div>
        <div id="technology-vulnerabilities-section">
          {renderShodan(data, expandedCve, setExpandedCve, data.domain || "", false, false)}
        </div>
        <div id="web-application-vulnerability-details-section">
          {renderWapitiReport(data, false, false)}
        </div>
        <div id="open-ports-section">{renderPorts(data, false, false)}</div>
      </div>
    );
  };

  const shouldRenderAttackSurface = () => {
    return isInitialized && /attack surface/i.test(data.scan_name);
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col text-white">
      <NewNavbar />
      <div className="mt-4 mb-10 my-3 mx-auto max-w-[1200px] w-full px-3 sm:px-6">
        <div className="p-6 rounded-xl shadow-lg">
          <div className="relative flex items-center justify-start mb-4 h-12">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-gray-700 rounded-full px-4 py-2 flex items-center gap-2 transition duration-200 text-sm z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back
            </button>
            <div className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-extrabold text-center tracking-wide text-white font-sans">
              {data.scan_name}
            </div>
          </div>
          <div>
            {isInitialized && Object.keys(data).length > 0 && (
              <span className="font-bold text-white text-xl">{data.domain || "N/A"}</span>
            )}
          </div>
          <div className="text-sm text-white justify-start mt-1">
            <b>User: </b>{data.user__username}
          </div>
          <div className="flex justify-between items-center text-sm text-white mt-1 mb-4">
            <div>
              <b>Role: </b>{data.role}
            </div>
            <div>
              <b>Timestamp: </b>{data.timestamp}
            </div>
          </div>
          {shouldRenderAttackSurface() ? (
            renderAttackSurface()
          ) : isInitialized && Object.keys(data).length > 0 ? (
            <div className="text-center text-gray-400 py-10">
              This scan type ({data.scan_name}) is not supported in JsonDataViewer. Only "Attack Surface" scans are currently supported.
            </div>
          ) : null}
          {isInitialized && Object.keys(data).length === 0 && !error && (
            <div className="text-sm text-gray-400 p-4">No data available to display</div>
          )}
          {error && <div className="text-sm text-red-400 p-4">{error}</div>}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JsonDataViewer;