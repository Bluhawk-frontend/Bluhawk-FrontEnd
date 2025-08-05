import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { FaArrowLeft } from "react-icons/fa";
import NewNavbar from "../components/reusable/NewNavbar";

const CpeDetails = () => {
  const [cpeDetails, setCpeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCve, setExpandedCve] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = Cookies.get("access_token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) {
        setError("No ID provided.");
        setLoading(false);
        return;
      }

      try {
        const url = `${API_BASE_URL}/dashboard/cpe_search/?id=${encodeURIComponent(id)}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch CPE details: ${res.status}`);
        }

        const data = await res.json();
        if (data && data.product) {
          setCpeDetails(data);
        } else {
          throw new Error("Invalid data format received.");
        }
      } catch (err) {
        console.error("Error fetching CPE detail:", err);
        setError(err.message || "Failed to load CPE details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, accessToken, API_BASE_URL]);

  const toggleCve = (index) => {
    setExpandedCve(expandedCve === index ? null : index);
  };

  const renderCveDetails = (cve, index) => {
    const jsonData = cve.json_data?.cve;
    if (!jsonData) return <p className="text-gray-400">No CVE data available.</p>;

    return (
      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleCve(index)}
        >
          <h3 className="text-lg font-semibold text-white">{cve.id}</h3>
          <span className="text-gray-300">{expandedCve === index ? "▲" : "▼"}</span>
        </div>
        {expandedCve === index && (
          <div className="mt-2 space-y-2 text-gray-200">
            <p>
              <strong>Description:</strong>{" "}
              {jsonData.description?.description_data?.[0]?.value || "N/A"}
            </p>
            <p>
              <strong>Published Date:</strong>{" "}
              {cve.json_data?.publishedDate || "N/A"}
            </p>
            <p>
              <strong>Last Modified:</strong>{" "}
              {cve.json_data?.lastModifiedDate || "N/A"}
            </p>
            <div>
              <strong>Impact:</strong>
              {cve.json_data?.impact?.baseMetricV3 ? (
                <ul className="list-disc pl-5 mt-1">
                  <li>
                    Base Score: {cve.json_data.impact.baseMetricV3.cvssV3?.baseScore || "N/A"} (
                    {cve.json_data.impact.baseMetricV3.cvssV3?.baseSeverity || "N/A"})
                  </li>
                  <li>Version: {cve.json_data.impact.baseMetricV3.cvssV3?.version || "N/A"}</li>
                  <li>Scope: {cve.json_data.impact.baseMetricV3.cvssV3?.scope || "N/A"}</li>
                  <li>Attack Vector: {cve.json_data.impact.baseMetricV3.cvssV3?.attackVector || "N/A"}</li>
                  <li>Attack Complexity: {cve.json_data.impact.baseMetricV3.cvssV3?.attackComplexity || "N/A"}</li>
                  <li>User Interaction: {cve.json_data.impact.baseMetricV3.cvssV3?.userInteraction || "N/A"}</li>
                  <li>Privileges Required: {cve.json_data.impact.baseMetricV3.cvssV3?.privilegesRequired || "N/A"}</li>
                  <li>Confidentiality Impact: {cve.json_data.impact.baseMetricV3.cvssV3?.confidentialityImpact || "N/A"}</li>
                  <li>Integrity Impact: {cve.json_data.impact.baseMetricV3.cvssV3?.integrityImpact || "N/A"}</li>
                  <li>Availability Impact: {cve.json_data.impact.baseMetricV3.cvssV3?.availabilityImpact || "N/A"}</li>
                  <li>Vector String: {cve.json_data.impact.baseMetricV3.cvssV3?.vectorString || "N/A"}</li>
                  <li>Impact Score: {cve.json_data.impact.baseMetricV3?.impactScore || "N/A"}</li>
                  <li>Exploitability Score: {cve.json_data.impact.baseMetricV3?.exploitabilityScore || "N/A"}</li>
                </ul>
              ) : (
                <p className="text-gray-400">No impact data available.</p>
              )}
            </div>
            <div>
              <strong>References:</strong>
              {jsonData.references?.reference_data?.length > 0 ? (
                <ul className="list-disc pl-5 mt-1">
                  {jsonData.references.reference_data.map((ref, refIndex) => (
                    <li key={refIndex}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {ref.name || ref.url}
                      </a>{" "}
                      ({ref.tags?.join(", ") || "No tags"})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No references available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Updated back handler
  const handleBack = () => {
    const searchQuery = location.state?.searchQuery;
    if (searchQuery) {
      navigate(`/cpe?query=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/cpe");
    }
  };

  // Unified browser back button behavior
  useEffect(() => {
    window.onpopstate = () => {
      handleBack();
    };
    return () => {
      window.onpopstate = null;
    };
  }, [location.state]);

  return (
    <div className="bg-midnightBlue min-h-screen text-white">
      <NewNavbar />
      <div className="max-w-7xl w-full pt-4 px-6 ml-4">
        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-center">
              <div className="mt-4 animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto"></div>
              <p>Loading...</p>
            </div>
          </div>
        ) : error ? (
          <p className="text-left text-red-400 mt-4 pl-2">{error}</p>
        ) : !cpeDetails ? (
          <p className="text-left text-red-400 mt-4 pl-2">No data found for this ID.</p>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="flex items-center text-white hover:text-gray-300 mb-4 pl-2"
            >
              <FaArrowLeft className="w-6 h-6 mr-1" />
              Back
            </button>

            <h2 className="text-3xl text-white pl-2">
              {cpeDetails.product?.id || "N/A"}
            </h2>

            <div className="pl-2">
              <h3 className="text-lg font-semibold">Vendor:</h3>
              <p className="text-lg text-gray-200">
                {cpeDetails.product?.vendor
                  ? cpeDetails.product.vendor.charAt(0).toUpperCase() +
                    cpeDetails.product.vendor.slice(1)
                  : "N/A"}
              </p>
            </div>

            <div className="pl-2 pt-2">
              <h3 className="text-lg font-semibold">Product:</h3>
              <p className="text-lg text-gray-200">
                {cpeDetails.product?.product
                  ? cpeDetails.product.product.charAt(0).toUpperCase() +
                    cpeDetails.product.product.slice(1)
                  : "N/A"}
              </p>
            </div>

            <div className="pl-2">
              <h3 className="text-lg font-semibold text-gray-200">Associated CVE IDs</h3>
              {cpeDetails.product?.cve_ids?.length > 0 ? (
                <p className="mt-2 text-gray-200">{cpeDetails.product.cve_ids.join(", ")}</p>
              ) : (
                <p className="mt-2 text-gray-400">No CVE IDs associated.</p>
              )}
            </div>

            <div className="pl-2">
              <h3 className="text-xl font-semibold text-gray-200 mb-4">CVE Details</h3>
              {cpeDetails.cve?.length > 0 ? (
                cpeDetails.cve.map((cve, index) => (
                  <div key={index}>{renderCveDetails(cve, index)}</div>
                ))
              ) : (
                <p className="text-gray-400">No CVE details available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CpeDetails;
