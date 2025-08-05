import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";

const LogDetailPage = () => {
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const accessToken = Cookies.get("access_token");

  useEffect(() => {
    const fetchLogDetail = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/usage/get-log/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error("Failed to fetch log details");
        const data = await response.json();
        setLog(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogDetail();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!log) return <p>No log found</p>;

  return (
    <div className="bg-midnightBlue min-h-screen text-white p-4">
      <h2 className="text-2xl font-semibold mb-4">Log Details</h2>
      <p><strong>ID:</strong> {log.id}</p>
      <p><strong>Timestamp:</strong> {new Date(log.created_at).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}</p>
      <p><strong>API:</strong> {log.api_name || "N/A"}</p>
      <p><strong>Page:</strong> {log.group || "N/A"}</p>
      <p><strong>Status:</strong> {log.status_code || "N/A"}</p>
    </div>
  );
};

export default LogDetailPage;