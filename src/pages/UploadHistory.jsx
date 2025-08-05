import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import NewNavbar from "../components/reusable/NewNavbar";

const UploadHistory = () => {
  const [uploads, setUploads] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchUploads = async () => {
    setIsLoading(true);
    setError(null);
    const accessToken = Cookies.get("access_token");
    const url = `${API_BASE_URL}/crypto/file_upload_history/`;

    try {
      const response = await axios.get(url, {
        params: {
          page: page,
          page_size: pageSize,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUploads(response.data.results);
      setTotalPages(Math.ceil(response.data.count / pageSize));
    } catch (error) {
      console.error("Error fetching upload history:", error);
      setError("Failed to load upload history. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, [page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1F] to-[#1A2342] text-white">
      <NewNavbar />
      <div className="pt-3 px-4 sm:px-6">
        {/* Reduced font size and icon size for mobile */}
        <button
          onClick={() => window.history.back()}
          className="mb-2 text-white hover:bg-gray-700 rounded-full px-3 py-1 flex items-center gap-2 text-sm sm:text-base"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5 sm:w-6 sm:h-6"
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
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-10">History</h1>

        {error && (
          <div className="bg-red-800/70 border border-red-500 text-red-200 px-4 sm:px-6 py-3 rounded mb-6 shadow-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        )}

        <div className="space-y-6 w-full sm:max-w-4xl mx-auto">
          {!isLoading && uploads.length > 0 ? (
            uploads.map((upload) => {
              const fileInfo = upload.json_data?.meta?.file_info || {};
              const analysisData = upload.json_data?.data || {};
              const attributes = analysisData?.attributes || {};
              const stats = attributes.stats || {};
              const showStatus = attributes.status === "completed";

              return (
                <div
                  key={upload.filehash}
                  className="bg-[#1A2342] p-4 sm:p-6 rounded-lg shadow-md"
                >
                  <h3 className="text-base sm:text-lg font-semibold mb-4 truncate">
                    {upload.filename}
                  </h3>
                  <hr className="border-gray-600 mb-4" />
                  <p className="text-xs sm:text-sm text-gray-300 truncate mb-3 mt-3 ml-4 sm:ml-7">
                    <span className="text-gray-400">SHA256: </span>
                    {fileInfo.sha256 || "N/A"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-300 truncate mb-3 mt-3 ml-4 sm:ml-7">
                    <span className="text-gray-400">MD5: </span>
                    {fileInfo.md5 || "N/A"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-300 mb-3 mt-3 ml-4 sm:ml-7">
                    <span className="text-gray-400">File Size: </span>
                    {fileInfo.size ? `${(fileInfo.size / 1024).toFixed(2)} KB` : "N/A"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-300 mb-3 mt-3 ml-4 sm:ml-7">
                    <span className="text-gray-400">Uploaded At: </span>
                    {formatDate(upload.created_at)}
                  </p>
                  {showStatus && (
                    <p className="text-xs sm:text-sm text-gray-300 mb-3 mt-3 ml-4 sm:ml-7">
                      <span className="text-gray-400">Status: </span>
                      <span className="text-green-500 font-semibold">Completed</span>
                    </p>
                  )}
                  <h4 className="text-base sm:text-lg font-semibold mb-2">Detection Results</h4>
                  <hr className="border-gray-600 mb-4" />
                  <div className="flex flex-wrap gap-4 sm:gap-8 ml-4 sm:ml-7">
                    <p className="text-red-500 text-xs sm:text-sm">Malicious: {stats.malicious || 0}</p>
                    <p className="text-yellow-400 text-xs sm:text-sm">Suspicious: {stats.suspicious || 0}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Undetected: {stats.undetected || 0}</p>
                    <p className="text-green-500 text-xs sm:text-sm">Harmless: {stats.harmless || 0}</p>
                  </div>
                </div>
              );
            })
          ) : (
            !isLoading && !error && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-base sm:text-lg">No upload history found</p>
              </div>
            )
          )}
        </div>

        {uploads.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <nav className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4" aria-label="Pagination">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className={`px-3 sm:px-4 py-1 rounded-md text-sm sm:text-base ${
                  page === 1
                    ? "bg-[#1A2342] text-gray-500 cursor-not-allowed"
                    : "bg-[#2A3552] hover:bg-[#3A4562] text-white"
                }`}
              >
                Previous
              </button>

              <span className="text-xs sm:text-sm text-gray-300">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={page === totalPages || totalPages === 1}
                className={`px-3 sm:px-4 py-1 rounded-md text-sm sm:text-base ${
                  page === totalPages || totalPages === 1
                    ? "bg-[#1A2342] text-gray-500 cursor-not-allowed"
                    : "bg-[#2A3552] hover:bg-[#3A4562] text-white"
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadHistory;