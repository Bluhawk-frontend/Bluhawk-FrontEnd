import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
const UsagePage = () => {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = Cookies.get("access_token");
        const response = await axios.get(`${API_BASE_URL}/usage/get_usage`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log("API Response:", response.data);
        setLogs(response.data.logs); // Store logs in state
      } catch (error) {
        console.error("Error fetching usage data:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="p-6 bg-midnightBlue min-h-screen">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="mb-2 text-white hover:bg-gray-700 rounded-full px-3 py-1 flex items-center gap-2"
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
      <h1 className="text-3xl font-bold text-center mb-4 text-white">Usage Data</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-primaryLightGray shadow-lg rounded-lg">
          <thead>
            <tr className="bg-denimBlue text-white">
              <th className="border border-[#4C5879] px-4 py-2 text-left">Endpoint</th>
              <th className="border border-[#4C5879] px-4 py-2 text-left">Count</th>
              <th className="border border-[#4C5879] px-4 py-2 text-left">Last Request</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <tr key={index} className="hover:bg-hoverSlate">
                  <td className="border border-[#D9D9D9] px-4 py-2 text-white">
                    {log.endpoint}
                  </td>
                  <td
                    className={`border border-primaryLightGray px-4 py-2 font-semibold ${
                      log.count > 0 ? "text-white" : "text-white"
                    }`}
                  >
                    {log.count}
                  </td>
                  <td className="border border-primaryLightGray px-4 py-2 text-white">
                    {log.last_request}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="text-center border border-primaryLightGray px-4 py-2 text-primaryRed"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default UsagePage;