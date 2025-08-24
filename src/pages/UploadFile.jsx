import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import NewNavbar from "../components/reusable/NewNavbar";
import Footer from "../components/reusable/Footer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const computeFileHash = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

const pollForReport = async (url, token, maxRetries = 3, interval = 1000) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        retries++;
        await new Promise((res) => setTimeout(res, interval));
      } else throw err;
    }
  }
  throw new Error("Report not ready after multiple retries.");
};

const UploadFile = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Detection");
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadResult(null);
    setError(null);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;
    try {
      setIsLoading(true);
      const token = Cookies.get("access_token");
      if (!token) throw new Error("Please log in again.");

      const hash = await computeFileHash(selectedFile);
      const reportUrl = `${API_BASE_URL}/vtreport/file_report/?hash=${hash}`;
      try {
        const existing = await axios.get(reportUrl, { headers: { Authorization: `Bearer ${token}` } });
        setUploadResult(existing.data);
        setIsLoading(false);
        return;
      } catch (err) {
        if (err.response?.status !== 404) throw err;
      }

      const uploadUrl = `${API_BASE_URL}/crypto/upload_file/`;
      const formData = new FormData();
      formData.append("file", selectedFile);

      await axios.post(uploadUrl, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      const report = await pollForReport(reportUrl, token);
      setUploadResult(report);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050914] to-[#0F172A] text-white">
      <NewNavbar />
      <div className="container mx-auto pt-24 pb-16 px-4">
        <h1 className="text-4xl font-extrabold text-center mb-8 tracking-wide">
          Malware Analysis
        </h1>

        {/* Upload Card */}
        <div className="max-w-xl mx-auto bg-white/5 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/10 text-center">
          {!selectedFile ? (
            <>
              <p className="mb-4 text-gray-300">Upload a file to scan for malware</p>
              <button
                onClick={() => document.getElementById("fileInput").click()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105 transition transform font-semibold"
              >
                Choose File
              </button>
              <input
                id="fileInput"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          ) : (
            <>
              <p className="mb-2 text-lg font-semibold">{selectedFile.name}</p>
              <button
                onClick={handleUploadFile}
                disabled={isLoading}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:scale-105"
                }`}
              >
                {isLoading ? "Analyzing..." : "Upload & Scan"}
              </button>
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-xl mx-auto mt-6 p-4 rounded-xl bg-red-500/20 text-red-300 text-center">
            {error}
          </div>
        )}

        {/* Results Section */}
        {uploadResult && (
          <div className="mt-10 bg-white/5 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/10">
            <div className="flex justify-between items-center border-b border-white/20 pb-4 mb-4">
              <h2 className="text-2xl font-semibold">Analysis Report</h2>
              <span className="text-gray-400 text-sm">
                {new Date().toLocaleString()}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-4">
              {["Detection", "Details"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === tab
                      ? "bg-blue-500 text-white"
                      : "text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Detection Table */}
            {activeTab === "Detection" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/10">
                      <th className="p-2 text-left">Engine</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      uploadResult.data?.attributes?.last_analysis_results || {}
                    ).map(([engine, result], idx) => (
                      <tr
                        key={idx}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="p-2">{result.engine_name || engine}</td>
                        <td className="p-2 capitalize">{result.category || "N/A"}</td>
                        <td className="p-2">{result.result || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Details */}
            {activeTab === "Details" && (
              <div className="text-gray-300 space-y-2">
                <p><strong>SHA256:</strong> {uploadResult.data?.attributes?.sha256}</p>
                <p><strong>Size:</strong> {uploadResult.data?.attributes?.size} bytes</p>
                <p><strong>Type:</strong> {uploadResult.data?.attributes?.type_description}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UploadFile;
