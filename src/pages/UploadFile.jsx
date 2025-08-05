import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import NewNavbar from "../components/reusable/NewNavbar";
import Footer from "../components/reusable/Footer";

// Define the API base URL using environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to compute SHA256 hash of a file
const computeFileHash = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
    return hashHex;
  } catch (error) {
    console.error("Error computing file hash:", error);
    throw new Error("Failed to compute file hash.");
  }
};

// Helper function to poll for the report
const pollForReport = async (reportUrl, accessToken, maxRetries = 3, interval = 1000) => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(`Attempt ${retries + 1}/${maxRetries}: Fetching report from ${reportUrl}`);
      const response = await axios.get(reportUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Report API Response:", response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("Report not found yet, retrying...");
        retries++;
        if (retries === maxRetries) {
          throw new Error("Report not found after maximum retries.");
        }
        await new Promise(resolve => setTimeout(resolve, interval));
      } else {
        throw error;
      }
    }
  }
};

const UploadFile = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Detection");
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);
  const [reportHash, setReportHash] = useState(null); // Store the hash for retry
  const [showRetry, setShowRetry] = useState(false); // Show retry button if report isn't ready

  useEffect(() => {
    if (uploadResult) {
      setIsVisible(true);
      setError(null);
      setShowRetry(false);
    }
  }, [uploadResult]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setUploadResult(null);
    setError(null);
    setShowRetry(false);
    setReportHash(null);
  };

  const handleUploadClick = () => {
    document.getElementById("fileInput").click();
  };

  const fetchReport = async (hash, accessToken) => {
    const reportUrl = `${API_BASE_URL}/vtreport/file_report/?hash=${hash}`;
    try {
      const reportData = await pollForReport(reportUrl, accessToken, 3, 1000);
      setUploadResult(reportData);
      setIsLoading(false);
    } catch (error) {
      if (error.message.includes("Report not found after maximum retries")) {
        setError("The report is not ready yet. Please try again in a few moments.");
        setShowRetry(true);
      } else if (error.response?.status === 401) {
        setError("Unauthorized. Please log in again or check your access token.");
      } else if (error.code === "ERR_NETWORK") {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError(`Failed to fetch the report: ${error.message}. Please try again.`);
      }
      setIsLoading(false);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      setError(null);
      setShowRetry(false);

      // Get the access token from cookies
      const accessToken = Cookies.get("access_token");
      if (!accessToken) {
        throw new Error("Access token not found. Please log in again.");
      }

      // Step 1: Compute the SHA256 hash of the selected file
      console.log("Computing file hash...");
      const hash = await computeFileHash(selectedFile);
      console.log("Computed Hash:", hash);
      setReportHash(hash); // Store the hash for retry

      // Step 2: Check if the report already exists
      console.log("Checking if report already exists...");
      const reportUrl = `${API_BASE_URL}/vtreport/file_report/?hash=${hash}`;
      try {
        const existingReport = await axios.get(reportUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log("Existing Report Found:", existingReport.data);
        setUploadResult(existingReport.data);
        setIsLoading(false);
        return; // Skip upload if report already exists
      } catch (error) {
        if (error.response?.status !== 404) throw error; // Proceed with upload only if report doesn't exist
        console.log("No existing report found, proceeding with upload...");
      }

      // Step 3: Upload the file to the API
      const uploadUrl = `${API_BASE_URL}/crypto/upload_file/`;
      console.log("Uploading file to:", uploadUrl);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Upload Response:", uploadResponse.data);

      // Step 4: Check if the upload response contains a hash or status URL
      let finalHash = hash;
      if (uploadResponse.data?.hash) {
        finalHash = uploadResponse.data.hash;
        console.log("Using hash from upload response:", finalHash);
        setReportHash(finalHash);
      }

      // Step 5: Poll for the report
      await fetchReport(finalHash, accessToken);
    } catch (error) {
      console.error("Error during file upload or report fetch:", error);
      setIsLoading(false);
      setUploadResult(null);

      if (error.message === "Failed to compute file hash.") {
        setError("Failed to compute the file hash. Please try again.");
      } else if (error.message === "Access token not found. Please log in again.") {
        setError(error.message);
      } else if (error.response?.status === 401) {
        setError("Unauthorized. Please log in again or check your access token.");
       } else if (error.response?.status === 413) {
        setError("The file size is extended.Please check the file size");
      } else if (error.code === "ERR_NETWORK") {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError(`Failed to process the request: ${error.message}. Please try again.`);
      }
    }
  };

  const handleRetryFetch = async () => {
    if (!reportHash) return;

    try {
      setIsLoading(true);
      setError(null);

      const accessToken = Cookies.get("access_token");
      if (!accessToken) {
        throw new Error("Access token not found. Please log in again.");
      }

      await fetchReport(reportHash, accessToken);
    } catch (error) {
      console.error("Error during retry fetch:", error);
      setIsLoading(false);
      setUploadResult(null);

      if (error.response?.status === 401) {
        setError("Unauthorized. Please log in again or check your access token.");
      } else if (error.code === "ERR_NETWORK") {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError(`Failed to fetch the report: ${error.message}. Please try again.`);
      }
    }
  };

  // const getFileStatus = (stats) => {
  //   if (stats?.malicious > 0) {
  //     return { status: "Harmful ❌", color: "text-red-500" };
  //   } else if (stats?.suspicious > 0) {
  //     return { status: "Suspicious ⚠️", color: "text-yellow-400" };
  //   } else {
  //     return { status: "Safe ✅", color: "text-green-400" };
  //   }
  // };

  const formatFileSize = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  const getLastAnalysisSummary = (results) => {
    const totalEngines = Object.keys(results).length;
    const detectedEngines = Object.values(results).filter(result => result.category === "malicious" || result.category === "suspicious").length;
    const topEngines = Object.entries(results)
      .slice(0, 3)
      .map(([engine, result]) => ({
        engine_name: result.engine_name || engine,
        category: result.category || "N/A",
        result: result.result || "N/A"
      }));

    return { totalEngines, detectedEngines, topEngines };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060B1A] to-[#0F172A] text-white">
      <NewNavbar />

      <div className="flex min-h-screen flex-col items-center mt-5">
        <h1 className="text-4xl font-extrabold text-center mb-2">Upload and Analyze File</h1>

        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <button
            onClick={handleUploadClick}
            className="w-48 h-14 bg-gradient-to-r from-orange-500 to-orange-500 text-white font-bold shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
          >
            Browse File
          </button>

          <button
            onClick={() => (window.location.href = "/upload-history")}
            className="w-48 h-14 bg-gradient-to-r from-orange-500 to-orange-500 text-white font-bold shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
          >
            History
          </button>
        </div>


        <input
          type="file"
          id="fileInput"
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile && (
          <div className="mt-6 w-full max-w-md p-6 bg-[#1E293B] rounded-2xl shadow-md text-center space-y-4 animate-fadeIn">
            <p className="text-lg font-semibold">Selected File:</p>
            <p className="text-sm break-words">{selectedFile.name}</p>

            <button
              onClick={handleUploadFile}
              className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-500 hover:from-green-600 hover:to-green-600 text-white font-semibold py-2 rounded-full transition duration-300 transform hover:scale-105 disabled:bg-green-300 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Uploading & Fetching Report..." : "Upload & Fetch Report"}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 w-full max-w-md p-4 bg-red-600 rounded-2xl shadow-md text-center animate-fadeIn">
            <p className="text-lg font-semibold text-white">{error}</p>
            {showRetry && (
              <button
                onClick={handleRetryFetch}
                className="mt-4 w-full bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-2 rounded-full transition duration-300 transform hover:scale-105 disabled:bg-blue-300 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Fetching Report..." : "Retry Fetching Report"}
              </button>
            )}
          </div>
        )}

        {uploadResult && (
          <div className="py-4 sm:px-16 px-2 w-full">
            <div className="bg-slateGray text-white rounded-md p-4 mt-6 flex flex-row gap-4 w-full max-w-full items-start">
              <div className="flex flex-col md:flex-row items-start justify-between gap-4 animate-fadeIn w-full">
  <div className="flex items-center gap-4">
    <div className="flex flex-col items-center">
      <div className="w-[120px] h-[120px] rounded-full bg-gray-700 border-[24px] border-successGreen flex items-center justify-center shadow-lg">
        <span className="text-2xl font-bold">
          {uploadResult.data?.attributes?.reputation || 0}/
          {getLastAnalysisSummary(uploadResult.data?.attributes?.last_analysis_results || {}).totalEngines || 0}
        </span>
      </div>
      <p className="text-center mt-2 text-sm font-semibold tracking-wide">
        Community Score
      </p>
    </div>
    <div>
      <h2 className="text-2xl font-bold tracking-wide">{uploadResult.data?.attributes?.names?.[0] || selectedFile.name}</h2>
      <p className="text-sm text-gray-400 break-all">SHA256: {uploadResult.data?.attributes?.sha256 || "N/A"}</p>
    </div>
  </div>
  <div className="text-right text-sm self-end md:self-start">
    <p><strong>First Submission Date:</strong> {uploadResult.data?.attributes?.first_submission_date ? new Date(uploadResult.data.attributes.first_submission_date * 1000).toLocaleDateString() : "N/A"}</p>
    <p><strong>Last Analysis Date:</strong> {uploadResult.data?.attributes?.last_analysis_date ? new Date(uploadResult.data.attributes.last_analysis_date * 1000).toLocaleDateString() : "N/A"}</p>
  </div>
</div>
            </div>

            <div className="flex border-b border-blue-500 mt-6">
              <button
                onClick={() => setActiveTab("Detection")}
                className={`px-4 py-2 font-semibold uppercase text-sm tracking-wider transition-all duration-300 ${
                  activeTab === "Detection"
                    ? "border-b-2 border-blue-500 text-white bg-blue-500/20 backdrop-blur-sm"
                    : "text-gray-400 hover:bg-blue-500/10 hover:text-white"
                }`}
              >
                Detection
              </button>
              <button
                onClick={() => setActiveTab("Details")}
                className={`px-4 py-2 font-semibold uppercase text-sm tracking-wider transition-all duration-300 ${
                  activeTab === "Details"
                    ? "border-b-2 border-blue-500 text-white bg-blue-500/20 backdrop-blur-sm"
                    : "text-gray-400 hover:bg-blue-500/10 hover:text-white"
                }`}
              >
                Details
              </button>
             
            </div>

            <div
              className={`p-4 w-full rounded-xl shadow-lg bg-gradient-to-br from-[#0F172A] to-[#1E293B] transition-opacity duration-500 ${
                activeTab === "Details" ? "opacity-100" : "opacity-0"
              } ${activeTab === "Detection" ? "opacity-100" : "opacity-0"}`}
            >
             {activeTab === "Details" && (
  <div className="space-y-6 px-4 sm:px-6"> {/* Added padding for mobile */}
    <h3 className="text-xl sm:text-2xl font-semibold tracking-wide">File Details</h3> {/* Reduced font size for mobile */}
    <div className="p-4 rounded-lg bg-gray-800 border border-blue-500/30 shadow-lg overflow-x-auto"> {/* Added overflow-x-auto for horizontal scroll if needed */}
      <ul className="space-y-2 text-xs sm:text-sm text-gray-300"> {/* Smaller text size for mobile */}
        <li><strong>MD5:</strong> {uploadResult.data.attributes.md5 || "N/A"}</li>
        <li><strong>SHA1:</strong> {uploadResult.data.attributes.sha1 || "N/A"}</li>
        <li><strong>SHA256:</strong> {uploadResult.data.attributes.sha256 || "N/A"}</li>
        <li><strong>File Type:</strong> {uploadResult.data.attributes.type_description || "N/A"}</li>
        <li><strong>File Size:</strong> {uploadResult.data.attributes.size ? `${formatFileSize(uploadResult.data.attributes.size)} MB` : "N/A"}</li>
        <li><strong>Magic:</strong> {uploadResult.data.attributes.magic || "N/A"}</li>
        <li><strong>SSDEEP:</strong> {uploadResult.data.attributes.ssdeep || "N/A"}</li>
        <li><strong>TLSH:</strong> {uploadResult.data.attributes.tlsh || "N/A"}</li>
        <li><strong>Times Submitted:</strong> {uploadResult.data.attributes.times_submitted || "N/A"}</li>
        <li><strong>Unique Sources:</strong> {uploadResult.data.attributes.unique_sources || "N/A"}</li>
        <li><strong>Reputation:</strong> {uploadResult.data.attributes.reputation || "N/A"}</li>
        <li><strong>Tags:</strong> {uploadResult.data.attributes.tags?.join(", ") || "N/A"}</li>
      </ul>
    </div>

    <div className="flex flex-col gap-6"> {/* Removed md:flex-row to stack on all screens */}
      <div className="flex-1 p-4 rounded-lg bg-gray-800 border border-blue-500/30 shadow-lg"> {/* Adjusted border color */}
        <h4 className="text-lg sm:text-xl font-semibold tracking-wide mb-2">Last Analysis Details</h4> {/* Smaller heading for mobile */}
        {(() => {
          const { totalEngines, detectedEngines, topEngines } = getLastAnalysisSummary(uploadResult.data.attributes.last_analysis_results || {});
          return (
            <ul className="space-y-2 text-xs sm:text-sm text-gray-300"> {/* Smaller text */}
              <li><strong>Total Engines Scanned:</strong> {totalEngines || "0"}</li>
              <li><strong>Detected as Harmful:</strong> {detectedEngines || "0"}</li>
              <li><strong>Sample Results:</strong>
                <ul className="ml-4 list-disc text-xs sm:text-sm"> {/* Adjusted nested list */}
                  {topEngines.map((engine, index) => (
                    <li key={index} className="truncate"> {/* Added truncate to prevent text overflow */}
                      {engine.engine_name}: {engine.category} {engine.result ? `(${engine.result})` : ""}
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          );
        })()}
      </div>

      <div className="flex-1 p-4 rounded-lg bg-gray-800 border border-blue-500/30 shadow-lg">
        <h4 className="text-lg sm:text-xl font-semibold tracking-wide mb-2">Detection Summary</h4>
        <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
          <li><strong>Malicious:</strong> {uploadResult.data.attributes.last_analysis_stats?.malicious || "0"}</li>
          <li><strong>Suspicious:</strong> {uploadResult.data.attributes.last_analysis_stats?.suspicious || "0"}</li>
          <li><strong>Undetected:</strong> {uploadResult.data.attributes.last_analysis_stats?.undetected || "0"}</li>
          <li><strong>Harmless:</strong> {uploadResult.data.attributes.last_analysis_stats?.harmless || "0"}</li>
          <li><strong>Timeout:</strong> {uploadResult.data.attributes.last_analysis_stats?.timeout || "0"}</li>
          <li><strong>Confirmed Timeout:</strong> {uploadResult.data.attributes.last_analysis_stats["confirmed-timeout"] || "0"}</li>
          <li><strong>Failure:</strong> {uploadResult.data.attributes.last_analysis_stats?.failure || "0"}</li>
          <li><strong>Type Unsupported:</strong> {uploadResult.data.attributes.last_analysis_stats["type-unsupported"] || "0"}</li>
        </ul>
      </div>
    </div>

    <h3 className="text-xl sm:text-2xl font-semibold tracking-wide">Analysis Details</h3>
    <div className="p-4 rounded-lg bg-gray-800 border border-blue-500/30 shadow-lg overflow-x-auto">
      {(() => {
        const { totalEngines, detectedEngines, topEngines } = getLastAnalysisSummary(uploadResult.data.attributes.last_analysis_results || {});
        return (
          <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
            <li><strong>Total Engines Scanned:</strong> {totalEngines || "0"}</li>
            <li><strong>Detected as Harmful:</strong> {detectedEngines || "0"}</li>
            <li><strong>Sample Results:</strong>
              <ul className="ml-4 list-disc text-xs sm:text-sm">
                {topEngines.map((engine, index) => (
                  <li key={index} className="truncate">
                    {engine.engine_name}: {engine.category} {engine.result ? `(${engine.result})` : ""}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        );
      })()}
    </div>
  </div>
)}

              {activeTab === "Detection" && (
                <div className="space-y-6">
                  <h4 className="text-xl font-semibold tracking-wide">Antivirus Results</h4>
                  <div className="p-4 rounded-lg bg-gray-800 border border-blue-500/30 shadow-lg overflow-x-auto">
                    <table className="w-full text-sm text-gray-300">
                      <thead>
                        <tr className="bg-blue-500/20">
                          <th className="p-2 text-left">Engine Name</th>
                          <th className="p-2 text-left">Category</th>
                          <th className="p-2 text-left">Result</th>
                          <th className="p-2 text-left">Engine Version</th>
                          <th className="p-2 text-left">Update Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(uploadResult.data.attributes.last_analysis_results || {}).map(([engine, result], index) => (
                          <tr key={index} className="border-b border-gray-700">
                            <td className="p-2">{result.engine_name || engine}</td>
                            <td className="p-2">{result.category || "N/A"}</td>
                            <td className="p-2">{result.result || "N/A"}</td>
                            <td className="p-2">{result.engine_version || "N/A"}</td>
                            <td className="p-2">{result.engine_update || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UploadFile;
