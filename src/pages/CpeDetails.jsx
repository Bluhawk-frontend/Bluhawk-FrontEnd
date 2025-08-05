import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { FaArrowLeft } from "react-icons/fa";
import NewNavbar from "../components/reusable/NewNavbar";
import CVSSGauge from '../components/CVSSGauge';

const CpeDetails = () => {
  const [cpeDetails, setCpeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCve, setExpandedCve] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = Cookies.get("access_token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  const getCvssBarColor = (score) => {
    if (score >= 9) return "bg-red-500";
    if (score >= 8) return "bg-orange-500";
    if (score >= 7) return "bg-orange-400";
    if (score >= 6) return "bg-yellow-400";
    if (score >= 5) return "bg-yellow-300";
    if (score >= 4) return "bg-yellow-200";
    if (score >= 3) return "bg-lime-300";
    if (score >= 2) return "bg-lime-400";
    if (score >= 1) return "bg-lime-500";
    return "bg-green-500";
  };

  useEffect(() => {
    const handlePopState = () => {
      const searchQuery = location.state?.searchQuery;
      if (searchQuery) {
        navigate(`/cpe?query=${encodeURIComponent(searchQuery)}`, { replace: true });
      } else {
        navigate("/cpe", { replace: true });
      }
      window.removeEventListener("popstate", handlePopState);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location.state, navigate]);

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
      <div className="mt-4 p-4 bg-denimBlue rounded-lg">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleCve(index)}
        >
          <h3 className="text-lg font-semibold text-white">{cve.id}</h3>
          <span className="text-gray-300">
            {expandedCve === index ? "▲" : "▼"}
          </span>
        </div>
        {expandedCve === index && (
          <div className="flex-wrap mt-2 space-y-2 text-gray-200">
 <div className="w-full p-4 rounded-sm border border-[#4C5879] shadow" style={{ backgroundColor: '#101C40' }}>
  <h2 className="text-xl font-bold border-b border-[#4C5879] pb-2 mb-2">Key CVE Details</h2>
  <div className="space-y-2">
    <div className="flex flex-wrap break-all">
      <span className="font-bold">CVE ID:</span>
      <span className="ml-2 break-all">{cve.id || "N/A"}</span>
    </div>
    <div className="flex flex-wrap break-all">
      <span className="font-bold">Assigner:</span>
      <span className="ml-2 break-all">{jsonData.CVE_data_meta?.ASSIGNER || "N/A"}</span>
    </div>
    <div className="flex flex-wrap break-all">
      <span className="font-bold">Date Published:</span>
      <span className="ml-2 break-all">{cve.json_data?.publishedDate || "N/A"}</span>
    </div>
    <div className="flex flex-wrap break-all">
      <span className="font-bold">Date Updated:</span>
      <span className="ml-2 break-all">{cve.json_data?.lastModifiedDate || "N/A"}</span>
    </div>
  </div>
</div>

           <div className="w-full p-4 rounded-sm border border-[#4C5879] shadow" style={{ backgroundColor: '#101C40' }}>
  <h2 className="text-xl font-bold border-b border-[#4C5879] pb-2 mb-2">📝 Description</h2>
  <p className="leading-relaxed break-words">
    {jsonData.description?.description_data?.[0]?.value || "N/A"}
  </p>
</div>
            <div>
             <div className="w-full border border-[#4C5879] rounded-sm p-4" style={{ backgroundColor: '#101C40' }}>
  <h2 className="font-bold text-xl text-white border-b border-[#4C5879] pb-2 mb-2">📊 Impact</h2>
  {cve.json_data?.impact?.baseMetricV3 ? (
    <>
      <span className="font-semibold block mt-2">CVSS V3.1:</span>
      <div className="flex flex-col md:flex-row gap-4 mt-2">
        <div>
          <span className="font-semibold">Vector String:</span>{" "}
          <span className="break-words">{cve.json_data.impact.baseMetricV3.cvssV3.vectorString}</span>
          <ul className="list-disc ml-6 mt-2">
            <li>Version: <span className="break-words">{cve.json_data.impact.baseMetricV3.cvssV3?.version || "N/A"}</span></li>
            {cve.json_data.impact.baseMetricV3.cvssV3?.baseScore && (
              <li>
                Base Score:
                <div className="flex items-center w-1/3 mt-1 mb-1 gap-2">
                  <div
                    className={`h-2 rounded ${getCvssBarColor(cve.json_data.impact.baseMetricV3.cvssV3.baseScore)}`}
                    style={{ width: `${(cve.json_data.impact.baseMetricV3.cvssV3.baseScore / 10) * 100}%` }}
                  />
                  <span className="text-sm font-semibold">{cve.json_data.impact.baseMetricV3.cvssV3.baseScore}/10</span>
                </div>
                (<span className="break-words">{cve.json_data.impact.baseMetricV3.cvssV3?.baseSeverity || "N/A"}</span>)
              </li>
            )}
            <li>Attack Complexity: <span className="break-words">{cve.json_data.impact.baseMetricV3.cvssV3?.attackComplexity || "N/A"}</span></li>
            <li>Confidentiality Impact: <span className="break-words">{cve.json_data.impact.baseMetricV3.cvssV3?.confidentialityImpact || "N/A"}</span></li>
            <li>Integrity Impact: <span className="break-words">{cve.json_data.impact.baseMetricV3.cvssV3?.integrityImpact || "N/A"}</span></li>
            <li>Availability Impact: <span className="break-words">{cve.json_data.impact.baseMetricV3.cvssV3?.availabilityImpact || "N/A"}</span></li>
            {cve.json_data.impact.baseMetricV3?.impactScore && (
              <li>
                Impact Score:
                <div className="flex items-center w-1/3 mt-1 mb-1 gap-2">
                  <div
                    className={`h-2 rounded ${getCvssBarColor(cve.json_data.impact.baseMetricV3.impactScore)}`}
                    style={{ width: `${(cve.json_data.impact.baseMetricV3.impactScore / 10) * 100}%` }}
                  />
                  <span className="text-sm font-semibold">{cve.json_data.impact.baseMetricV3.impactScore}/10</span>
                </div>
              </li>
            )}
          </ul>
        </div>
        {typeof cve.json_data.impact.baseMetricV3.cvssV3.baseScore === "number" && (
          <div className="w-full md:w-1/3 p-4 rounded-sm flex flex-col items-center justify-center mb-6" style={{ backgroundColor: '#101C40' }}>
            <span className="font-semibold mb-2">Base Score</span>
            <CVSSGauge score={cve.json_data.impact.baseMetricV3.cvssV3.baseScore} />
          </div>
        )}
        {typeof cve.json_data.impact.baseMetricV3.impactScore === "number" && (
          <div className="w-full md:w-1/4 p-4 rounded-sm flex flex-col items-center justify-center mb-6" style={{ backgroundColor: '#101C40' }}>
            <span className="font-semibold mb-2">Impact Score</span>
            <CVSSGauge score={cve.json_data.impact.baseMetricV3.impactScore} />
          </div>
        )}
      </div>
    </>
  ) : (
    <p className="text-gray-400">No impact data available.</p>
  )}
  {cve.json_data?.impact?.baseMetricV2 && (
    <div className="flex flex-col md:flex-row gap-4 mt-4">
      <div className="flex-1">
        <span className="font-semibold block">CVSS V2:</span>
        {cve.json_data.impact.baseMetricV2.cvssV2.vectorString && (
          <div className="mt-2">
            <span className="font-semibold">Vector String:</span>{" "}
            <span className="break-words">{cve.json_data.impact.baseMetricV2.cvssV2.vectorString}</span>
          </div>
        )}
        <ul className="list-disc ml-6 mt-2">
          {Object.entries(cve.json_data.impact.baseMetricV2.cvssV2).map(([key, value]) => {
            if (key === "vectorString") return null;
            return (
              <li key={`v2-${key}`}>
                {key === "baseScore" && typeof value === "number" ? (
                  <>
                    <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                    <div className="flex items-center w-1/3 mt-1 mb-1 gap-2">
                      <div
                        className={`h-2 rounded ${getCvssBarColor(value)}`}
                        style={{ width: `${(value / 10) * 100}%` }}
                      />
                      <span className="text-sm font-semibold">{value}/10</span>
                    </div>
                  </>
                ) : key === "impactScore" && typeof value === "number" ? (
                  <>
                    <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                    <div className="flex items-center w-1/3 mt-1 mb-1 gap-2">
                      <div
                        className={`h-2 rounded ${getCvssBarColor(value)}`}
                        style={{ width: `${(value / 10) * 100}%` }}
                      />
                      <span className="text-sm font-semibold">{value}/10</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>{" "}
                    <span className="break-words">{value}</span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {typeof cve.json_data.impact.baseMetricV2.cvssV2.baseScore === "number" && (
        <div className="w-full md:w-1/3 p-4 rounded-sm flex flex-col items-center justify-center mb-6" style={{ backgroundColor: '#101C40' }}>
          <span className="font-semibold mb-2">Base Score</span>
          <CVSSGauge score={cve.json_data.impact.baseMetricV2.cvssV2.baseScore} />
        </div>
      )}
      {typeof cve.json_data.impact.baseMetricV2.impactScore === "number" && (
        <div className="w-full md:w-1/4 p-4 rounded-sm flex flex-col items-center justify-center mb-6" style={{ backgroundColor: '#101C40' }}>
          <span className="font-semibold mb-2">Impact Score</span>
          <CVSSGauge score={cve.json_data.impact.baseMetricV2.impactScore} />
        </div>
      )}
    </div>
  )}
</div>
            </div>
            <div className="p-4 border border-[#4C5879] rounded-sm" style={{ backgroundColor: '#101C40' }}>
  <h2 className="font-bold text-xl text-white border-b border-[#4C5879] pb-2 mb-2">🌐 References</h2>
  {jsonData.references?.reference_data?.length > 0 ? (
    <ul className="list-disc ml-6">
      {jsonData.references.reference_data.map((ref, refIndex) => (
        <li key={refIndex}>
          <a
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline break-words"
          >
            {ref.name || ref.url}
          </a>{" "}
          (<span className="break-words">{ref.tags?.join(", ") || "No tags"}</span>)
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

  const handleBack = () => {
    const searchQuery = location.state?.searchQuery;
    if (searchQuery) {
      navigate(`/cpe?query=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/cpe");
    }
  };

  const cveYears = [
    ...new Set(
      cpeDetails?.cve
        ?.map((cve) => cve.json_data?.publishedDate?.split("-")[0])
        .filter((year) => year)
    ),
  ].sort((a, b) => a - b);

  const filteredCves = selectedYear
    ? cpeDetails?.cve?.filter((cve) => {
        const cveYear = cve.json_data?.publishedDate?.split("-")[0];
        return cveYear === selectedYear;
      }) || []
    : cpeDetails?.cve || [];

  const cpeString = cpeDetails?.product?.id || "";
  const cpeTypeLetter = cpeString.split(":")[2]?.toUpperCase() || "";
  const cpeTypeMap = {
    O: "Operating System",
    H: "Hardware",
    A: "Application",
  };
  const cpeTypeFull = cpeTypeMap[cpeTypeLetter] || "Unknown";

  return (
    <div className="bg-midnightBlue min-h-screen text-white">
      <NewNavbar />
      <div className="flex flex-col items-center pt-8 px-2 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-7xl mb-4">
          <button
            onClick={handleBack}
        className="mb-2 text-white hover:bg-gray-700 rounded-full px-3 py-1  flex items-center gap-2"
            
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
                </svg>
                Back
          </button>
        </div>
        <div
          className="w-full max-w-7xl rounded-xl shadow-lg p-10"
          style={{
            background: "#101C40",
          }}
        >
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
              <div className="pl-2">
                <span className="text-base text-gray-300 font-semibold">Cpe :</span>
                <span className="ml-2 text-base text-gray-100 break-all">{cpeString ? cpeString.split(':').filter(segment => segment && segment !== '*').join(':') : "N/A"}</span>
              </div>
              <div className="pl-2">
                <span className="text-base text-gray-300 font-semibold">Vendor :</span>
                <span className="ml-2 text-base text-gray-100">
                  {cpeDetails.product?.vendor
                    ? cpeDetails.product.vendor.charAt(0).toUpperCase() +
                      cpeDetails.product.vendor.slice(1)
                    : "N/A"}
                </span>
              </div>
              <div className="pl-2">
                <span className="text-base text-gray-300 font-semibold">Product :</span>
                <span className="ml-2 text-base text-gray-100">
                  {cpeDetails.product?.product
                    ? cpeDetails.product.product.charAt(0).toUpperCase() +
                      cpeDetails.product.product.slice(1)
                    : "N/A"}
                </span>
              </div>
              <div className="pl-2">
                <span className="text-base text-gray-300 font-semibold">Type :</span>
                <span className="ml-2 text-base text-gray-100">
                  {cpeTypeLetter ? `${cpeTypeFull}` : "N/A"}
                </span>
              </div>
              <div className="pl-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-200">CVE Details</h3>
                  <div className="flex items-center space-x-4">
                    <label className="text-lg font-semibold text-gray-200">Filter by Year:</label>
                    <div className="relative">
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="appearance-none bg-white-700 text-black border border-gray-600 rounded-lg py-2 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="">All Years</option>
                        {cveYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300 pointer-events-none">
                        ▼
                      </span>
                    </div>
                  </div>
                </div>
                {filteredCves.length > 0 ? (
                  filteredCves.map((cve, index) => (
                    <div key={index}>{renderCveDetails(cve, index)}</div>
                  ))
                ) : (
                  <p className="text-gray-400">
                    {selectedYear
                      ? `No CVE details available for ${selectedYear}.`
                      : "No CVE details available."}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CpeDetails;