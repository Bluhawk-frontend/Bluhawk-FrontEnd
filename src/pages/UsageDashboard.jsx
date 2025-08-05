
import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import NewNavbar from "../components/reusable/NewNavbar";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Footer from "../components/reusable/Footer";

const UsageDashboard = () => {
  const navigate = useNavigate();
  const [gridData, setGridData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieLoading, setPieLoading] = useState(false);
  const [pieError, setPieError] = useState("");
  const [timeFrame, setTimeFrame] = useState("today");
  const [logsTimeFrame, setLogsTimeFrame] = useState("today");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isBarGraph, setIsBarGraph] = useState(true);
  const [exportStartDate, setExportStartDate] = useState(null);
  const [exportEndDate, setExportEndDate] = useState(null);
  const [exportError, setExportError] = useState("");
  const [chartStartDate, setChartStartDate] = useState(null);
  const [chartEndDate, setChartEndDate] = useState(null);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [showCustomLogsDatePicker, setShowCustomLogsDatePicker] = useState(false);
  const [roleType, setRoleType] = useState(""); // State for role dropdown (Admin, Viewer, Analyst, Email)
  const [roleUserFilter, setRoleUserFilter] = useState(""); // New state for role_user filter


  // Cache for totalRowCount per logsTimeFrame
  const totalRowCountCache = useRef({});

  // Define refs for dropdowns
  const exportOptionsRef = useRef(null);
  const customDatePickerRef = useRef(null);
  const customLogsDatePickerRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const accessToken = Cookies.get("access_token");
  const COLORS = ["#8DC8FA", "#5292F1", "#0069FF", "#0D3875"];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportOptionsRef.current && !exportOptionsRef.current.contains(event.target)) {
        setShowExportOptions(false);
      }
      if (customDatePickerRef.current && !customDatePickerRef.current.contains(event.target)) {
        setShowCustomDatePicker(false);
      }
      if (customLogsDatePickerRef.current && !customLogsDatePickerRef.current.contains(event.target)) {
        setShowCustomLogsDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch Chart Data
  const fetchChartData = async () => {
    let url;
    if (timeFrame === "today") {
      url = `${API_BASE_URL}/usage/get_usage_stats?time_frame=today`;
    } else if (timeFrame === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedDate = yesterday.toISOString().split("T")[0];
      url = `${API_BASE_URL}/usage/get_usage_stats?time_frame=custom&from=${formattedDate}&to=${formattedDate}`;
    } else if (timeFrame === "this_week") {
      url = `${API_BASE_URL}/usage/get_usage_stats?time_frame=this_week`;
    } else if (timeFrame === "this_month") {
      url = `${API_BASE_URL}/usage/get_usage_stats?time_frame=this_month`;
    } else if (timeFrame === "this_year") {
      url = `${API_BASE_URL}/usage/get_usage_stats?time_frame=this_year`;
    } else if (timeFrame === "custom" && chartStartDate && chartEndDate) {
      const formattedStart = chartStartDate.toISOString().split("T")[0];
      const formattedEnd = chartEndDate.toISOString().split("T")[0];
      url = `${API_BASE_URL}/usage/get_usage_stats?time_frame=custom&from=${formattedStart}&to=${formattedEnd}`;
    } else {
      setPieError("Please select a valid date range for custom filter.");
      setPieLoading(false);
      return;
    }
    setPieLoading(true);
    setPieError("");
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch chart data: ${response.status}`);
      const data = await response.json();
      setPieData(
        data.pie_chart_data
          ? Object.entries(data.pie_chart_data).map(([name, value]) => ({ name, value }))
          : []
      );
      let barChartData = data.bar_chart_data
        ? data.bar_chart_data.map(item => ({
            period: item.period,
            count: item.count,
          }))
        : [];
      if (timeFrame === "today") {
        const today = new Date();
        const dayAbbr = today.toLocaleDateString("en-US", { weekday: "short" });
        const todayDate = today.toISOString().split("T")[0];
        const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        barChartData = dayOrder.map(day => ({
          day,
          value: day === dayAbbr ? (barChartData.find(item => item.period === todayDate)?.count || 0) : 0,
        }));
        setBarData(barChartData);
      } else if (timeFrame === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dayAbbr = yesterday.toLocaleDateString("en-US", { weekday: "short" });
        const yesterdayDate = yesterday.toISOString().split("T")[0];
        const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        barChartData = dayOrder.map(day => ({
          day,
          value: day === dayAbbr ? (barChartData.find(item => item.period === yesterdayDate)?.count || 0) : 0,
        }));
        setBarData(barChartData);
      } else if (timeFrame === "this_week") {
        const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        barChartData = dayOrder.map(day => {
          const found = barChartData.find(item => item.period.slice(0, 3) === day);
          return found ? { day: day, value: found.count } : { day, value: 0 };
        });
        setBarData(barChartData);
      } else if (timeFrame === "this_month" || timeFrame === "custom") {
        const weeklyData = aggregateDataByWeek(barChartData);
        setBarData(weeklyData);
      } else if (timeFrame === "this_year") {
        barChartData = barChartData.map(item => ({
          day: new Date(item.period + "-01").toLocaleDateString("en-US", { month: "short" }),
          value: item.count,
        }));
        setBarData(barChartData);
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setPieError("Failed to load chart data.");
      setPieData([]);
      setBarData([]);
    } finally {
      setPieLoading(false);
    }
    
  };


  // Aggregate Data by Week
  const aggregateDataByWeek = (data) => {
    if (!data || data.length === 0) return [];

    // Determine start and end dates based on timeFrame
    const today = new Date();
    let monthStart, monthEnd;
    if (timeFrame === "this_month") {
      monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (timeFrame === "custom" && chartStartDate && chartEndDate) {
      monthStart = new Date(chartStartDate);
      monthEnd = new Date(chartEndDate);
    } else {
      return [];
    }

    // Sort data by period
    const sortedData = [...data].sort((a, b) => new Date(a.period) - new Date(b.period));

    const weeks = [];
    let weekNumber = 1;
    let currentWeekStart = new Date(monthStart);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // Start at Sunday

    // Calculate weeks until the end of the period or up to 5 weeks
    while (currentWeekStart <= monthEnd && weeks.length < 5) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Filter data for the current week
      const weekData = sortedData.filter(item => {
        const itemDate = new Date(item.period);
        return itemDate >= currentWeekStart && itemDate <= weekEnd;
      });

      // Sum counts for the week
      const weekValue = weekData.reduce((sum, item) => sum + (item.count || 0), 0);

      weeks.push({
        week: `Week ${weekNumber}`,
        value: weekValue,
        weekStart: currentWeekStart.toISOString().split('T')[0],
        entries: weekData,
      });

      // Move to next week
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;
    }

    return weeks.map(({ week, value, weekStart }) => ({ week, value, weekStart }));
  };



   // Count Filtered Logs (updated for new endpoint)
 const countFilteredLogs = async (params) => {
  const cacheKey = `${logsTimeFrame}_${params.time_filter || ''}_${params.start_date || ''}_${params.end_date || ''}_${params.role_user || ''}`;

  if (totalRowCountCache.current[cacheKey] !== undefined) {
    console.log(`Cache hit for ${cacheKey}: ${totalRowCountCache.current[cacheKey]}`);
    return totalRowCountCache.current[cacheKey];
  }

  try {
    let url = `${API_BASE_URL}/usage/get_paginated_Scan_logs?page=1&page_size=${pageSize}`;
    if (params.time_filter) url += `&time_filter=${params.time_filter}`;
    if (params.start_date && params.end_date) url += `&start_date=${params.start_date}&end_date=${params.end_date}`;
    if (params.role_user) url += `&role_user=${encodeURIComponent(params.role_user)}`;

    console.log(`Counting logs: ${url}`);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) throw new Error(`Failed to fetch logs: ${response.status}`);
    const data = await response.json();

    const totalFilteredLogs = data.total_logs || 0;
    console.log(`Caching total logs for ${cacheKey}: ${totalFilteredLogs}`);
    totalRowCountCache.current[cacheKey] = totalFilteredLogs;
    return totalFilteredLogs;
  } catch (err) {
    console.error("Error counting filtered logs:", err);
    return 0;
  }
};


// Update fetchRequestLogs to accept a role parameter
const fetchRequestLogs = async (overrideRole = null) => {
  setLoading(true);
  setError("");
  try {
    let url = `${API_BASE_URL}/usage/get_paginated_Scan_logs?page=${page}&page_size=${pageSize}`;
    let countParams = {};

    const normalizeDate = (dateStr) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    };

    if (logsTimeFrame === "today") {
      url += `&time_filter=today`;
      countParams.time_filter = "today";
    } else if (logsTimeFrame === "yesterday") {
      url += `&time_filter=yesterday`;
      countParams.time_filter = "yesterday";
    } else if (logsTimeFrame === "this_week") {
      url += `&time_filter=this_week`;
      countParams.time_filter = "this_week";
    } else if (logsTimeFrame === "this_month") {
      url += `&time_filter=this_month`;
      countParams.time_filter = "this_month";
    } else if (logsTimeFrame === "this_year") {
      url += `&time_filter=this_year`;
      countParams.time_filter = "this_year";
    } else if (logsTimeFrame === "custom") {
      if (!exportStartDate || !exportEndDate) {
        setError("Please select start and end dates for custom logs.");
        setLoading(false);
        setGridData([]);
        setTotalRowCount(0);
        return;
      }
      const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
      const startDate = new Date(exportStartDate);
      const endDate = new Date(exportEndDate);
      if (isNaN(startDate) || isNaN(endDate)) {
        setError("Please select valid start and end dates for custom logs.");
        setLoading(false);
        setGridData([]);
        setTotalRowCount(0);
        return;
      }
      const fromDate = normalizeDate(startDate.toISOString().split("T")[0]);
      const toDate = normalizeDate(endDate.toISOString().split("T")[0]);
      if (endDate - startDate > oneYearInMs) {
        setError("Custom date range cannot exceed one year.");
        setLoading(false);
        setGridData([]);
        setTotalRowCount(0);
        return;
      }
      url += `&start_date=${fromDate}&end_date=${toDate}`;
      countParams.start_date = fromDate;
      countParams.end_date = toDate;
      totalRowCountCache.current = {};
    }

    // Use overrideRole if provided, else fall back to roleType or roleUserFilter
    if (overrideRole && overrideRole !== "Email" && overrideRole !== "") {
      url += `&role_user=${encodeURIComponent(overrideRole.toLowerCase())}`;
      countParams.role_user = overrideRole.toLowerCase();
    } else if (roleType === "Email" && roleUserFilter) {
      url += `&role_user=${encodeURIComponent(roleUserFilter)}`;
      countParams.role_user = roleUserFilter;
    }

    console.log("Fetching logs with URL:", url);

    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) throw new Error(`Failed to fetch scan logs: ${response.status}`);
    const data = await response.json();
    console.log("API response:", {
      logs: data.logs?.length || 0,
      total_logs: data.total_logs,
      sampleLog: data.logs?.[0],
    });

    const processedData = (data.logs || []).map((item, index) => ({
      id: item.id || `log-${index}`,
      sno: (page - 1) * pageSize + index + 1,
      timestamp: item.timestamp
        ? new Date(item.timestamp).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          })
        : "N/A",
      api: item.scan_name || "N/A",
      group: item.role || "N/A",
      user: item.user__username || "N/A",
      result: item.json_data || "N/A",
      lastRequest: item.json_data?.status || item.json_data?.error || "N/A",
    }));

    console.log("Processed data:", {
      length: processedData.length,
      sample: processedData[0],
      page,
      pageSize,
    });

    setGridData(processedData);

    const totalFilteredLogs = data.total_logs || await countFilteredLogs(countParams);
    console.log("Total filtered logs:", totalFilteredLogs);

    if (processedData.length === 0 && totalFilteredLogs > 0 && page > 1) {
      console.log("No logs on page > 1, resetting to page 1", { page, totalFilteredLogs });
      setPage(1);
      return;
    }

    if (processedData.length === 0 && totalFilteredLogs === 0) {
      console.log("No logs found for the selected filters");
      setError("No logs found for the selected filters.");
      setGridData([]);
      setTotalRowCount(0);
    } else {
      setTotalRowCount(totalFilteredLogs);
    }
  } catch (err) {
    console.error("Error fetching scan logs:", { error: err.message, stack: err.stack });
    setError(`Failed to load scan logs: ${err.message}`);
    setGridData([]);
    setTotalRowCount(0);
  } finally {
    setLoading(false);
  }
};

// Export Data (updated to use new endpoint for logs)
const exportData = async (format) => {
  if (!exportStartDate || !exportEndDate) {
    setExportError("Please select start and end dates.");
    return;
  }
  const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
  if (exportEndDate - exportStartDate > oneYearInMs) {
    setExportError("Date range cannot exceed one year.");
    return;
  }
  setExportError("");
  const formattedStart = exportStartDate.toISOString().split("T")[0];
  const formattedEnd = exportEndDate.toISOString().split("T")[0];
  try {
    const chartUrl = `${API_BASE_URL}/usage/get_usage_stats?time_frame=custom&from=${formattedStart}&to=${formattedEnd}`;
    let logsUrl = `${API_BASE_URL}/usage/get_paginated_Scan_logs?start_date=${formattedStart}&end_date=${formattedEnd}`;
    if (roleType && roleType !== "Email" && roleType !== "") {
      logsUrl += `&role_user=${encodeURIComponent(roleType.toLowerCase())}`;
    } else if (roleType === "Email" && roleUserFilter) {
      logsUrl += `&role_user=${encodeURIComponent(roleUserFilter)}`;
    }
    const [chartResponse, logsResponse] = await Promise.all([
      fetch(chartUrl, { headers: { Authorization: `Bearer ${accessToken}` } }),
      fetch(logsUrl, { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }),
    ]);
    if (!chartResponse.ok) throw new Error(`Failed to fetch chart data: ${chartResponse.status}`);
    if (!logsResponse.ok) throw new Error(`Failed to fetch logs: ${logsResponse.status}`);
    const chartData = await chartResponse.json();
    const logsData = await logsResponse.json();
    const exportPieData = chartData.pie_chart_data
      ? Object.entries(chartData.pie_chart_data).map(([name, value]) => ({ name, value }))
      : [];
    const exportBarData = chartData.bar_chart_data
      ? chartData.bar_chart_data.map(item => ({
          day: item.period,
          value: item.count,
        }))
      : [];
    const exportLogsData = logsData.logs || [];
    if (format === "csv") {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Usage Distribution\nName,Value\n";
      exportPieData.forEach(item => {
        csvContent += `${item.name},${item.value}\n`;
      });
      csvContent += "\nBar Graph Data\nDay,Requests\n";
      exportBarData.forEach(item => {
        csvContent += `${item.day},${item.value}\n`;
      });
      csvContent += "\nRequest Logs\nS.NO,Scan Name,User,Role,Timestamp,Result\n";
      exportLogsData.forEach((item, index) => {
        const timestamp = item.timestamp
          ? new Date(item.timestamp).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "N/A";
        const result = item.json_data ? JSON.stringify(item.json_data).replace(/"/g, '""') : "N/A";
        csvContent += `${index + 1},${item.scan_name || "N/A"},${item.user__username || "N/A"},${item.role || "N/A"},${timestamp},"${result}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `usage_dashboard_${formattedStart}_to_${formattedEnd}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "pdf") {
      const doc = new jsPDF();
      let yOffset = 10;
      doc.setFontSize(16);
      doc.text(`Usage Dashboard (${formattedStart} to ${formattedEnd})`, 10, yOffset);
      yOffset += 10;
      doc.setFontSize(12);
      doc.text("Usage Distribution", 10, yOffset);
      yOffset += 10;
      autoTable(doc, {
        startY: yOffset,
        head: [["Name", "Value"]],
        body: exportPieData.map(item => [item.name, item.value]),
      });
      yOffset = doc.lastAutoTable.finalY + 10;
      doc.text("Bar Graph Data", 10, yOffset);
      yOffset += 10;
      autoTable(doc, {
        startY: yOffset,
        head: [["Day", "Requests"]],
        body: exportBarData.map(item => [item.day, item.value]),
      });
      yOffset = doc.lastAutoTable.finalY + 10;
      doc.text("Request Logs", 10, yOffset);
      yOffset += 10;
      autoTable(doc, {
        startY: yOffset,
        head: [["S.NO", "Scan Name", "User", "Role", "Timestamp", "Result"]],
        body: exportLogsData.map((item, index) => {
          const timestamp = item.timestamp
            ? new Date(item.timestamp).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "N/A";
          const result = item.json_data ? JSON.stringify(item.json_data, null, 2).substring(0, 100) + "..." : "N/A";
          return [index + 1, item.scan_name || "N/A", item.user__username || "N/A", item.role || "N/A", timestamp, result];
        }),
      });
      doc.save(`usage_dashboard_${formattedStart}_to_${formattedEnd}.pdf`);
    }
  } catch (err) {
    console.error("Error exporting data:", err);
    setExportError(`Failed to export data: ${err.message}`);
  }
};
  useEffect(() => {
    setPage(1);
    fetchRequestLogs();
  }, [logsTimeFrame, pageSize, roleUserFilter]);

  useEffect(() => {
    fetchRequestLogs();
  }, [page]);

  useEffect(() => {
    fetchChartData();
  }, [timeFrame, chartStartDate, chartEndDate]);

  const handlePreviousPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalRowCount / pageSize);
    if (page < totalPages) setPage(prev => prev + 1);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalRowCount / pageSize);
    if (totalPages === 0 || totalRowCount === 0) return null; // No buttons if no logs

    const maxPagesToShow = 10;
    const startPage = Math.floor((page - 1) / maxPagesToShow) * maxPagesToShow + 1;
    const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);
    const buttons = [];
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`px-3 py-1 rounded mx-1 ${
            page === i ? "bg-blue-500 text-white" : "bg-gray-700 text-white hover:bg-blue-500"
          }`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

 const handleResultClick = (params) => {
  // Store data in localStorage with a unique key
  const key = `result_${Date.now()}`;
  const fullItem = params.row;
  localStorage.setItem(key, JSON.stringify(fullItem));
  // Open new window with the key
  window.open(`/json-viewer?key=${key}`, "_blank");
};

const columns = [
  { field: "sno", headerName: "S.NO", width: 80 },
  { field: "api", headerName: "Scan Name", flex: 1 },
  { field: "user", headerName: "User", flex: 1 },
  { field: "group", headerName: "Role", flex: 1 },
  { field: "timestamp", headerName: "Time Stamp", flex: 1 },
  {
    field: "result",
    headerName: "Result",
    flex: 1,
    renderCell: (params) => (
      <span
        className="text-blue-400 cursor-pointer hover:underline"
        onClick={() => handleResultClick(params)}
      >
        Scan Results
      </span>
    ),
  },
];
  const totalPages = Math.ceil(totalRowCount / pageSize);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const weekStart = payload[0].payload.weekStart;
      return (
        <div className="bg-gray-800 text-white p-2 border border-gray-500 rounded">
          <p>{weekStart ? `Week of ${weekStart}: ${payload[0].value}` : `${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white p-2 border border-gray-500 rounded">
          <p>{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const RoundedBar = (props) => {
    const { fill, x, y, width, height } = props;
    const radius = 10;
    return (
      <svg>
        <rect x={x} y={y} width={width} height={height} rx={radius} ry={radius} fill={fill} />
      </svg>
    );
  };

  return (
    <div className="bg-midnightBlue min-h-screen flex flex-col text-white">
      <NewNavbar />
      <div className="mt-6 mb-10 my-3 mx-auto max-w-7xl w-full min-h-[150px] px-3 sm:min-h-[200px] sm:px-4">
  <div className="mb-4 flex justify-between items-center">
    <div className="relative">
      <button
        onClick={() => {
          setShowExportOptions(!showExportOptions);
          setShowCustomDatePicker(false);
          setShowCustomLogsDatePicker(false);
        }}
        className="bg-[#F7F7F7] text-[#0D3875] text-sm px-3 py-1 rounded-sm transition-colors sm:text-lg sm:px-6 sm:py-2"
        style={{ fontWeight: 600 }}
      >
        Generate report
      </button>
            {showExportOptions && (
              <div
                ref={exportOptionsRef}
                className="absolute left-0 mt-2 text-black rounded-sm shadow-xl z-10 p-4 w-96"
                style={{ backgroundColor: '#F7F7F7' }}
              >
                <div className="mb-2">
                  <label className="block text-sm mb-1 ml-1">Start Date:</label>
                  <DatePicker
                    selected={exportStartDate}
                    onChange={(date) => setExportStartDate(date)}
                    selectsStart
                    startDate={exportStartDate}
                    endDate={exportEndDate}
                    className="p-2 ml-1 rounded bg-[#DBDBDB] text-black w-80 border border-[#CBCBCB]"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                  />
                </div>
                <div className="mb-2">
                  <label className="flex text-sm mb-2 ml-1">End Date:</label>
                  <DatePicker
                    selected={exportEndDate}
                    onChange={(date) => setExportEndDate(date)}
                    selectsEnd
                    startDate={exportStartDate}
                    endDate={exportEndDate}
                    minDate={exportStartDate}
                    className="p-2 ml-1 rounded bg-[#DBDBDB] text-black w-80 border border-[#CBCBCB]"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select end date"
                  />
                </div>
                {exportError && <p className="text-red-500 text-sm ml-1 mb-2">{exportError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => exportData("csv")}
                    className="bg-[#DBDBDB] text-[#767676] px-4 py-2 ml-1 rounded-sm border border-[#CBCBCB] hover:bg-[#0069FF] hover:text-white w-full"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => exportData("pdf")}
                    className="bg-[#DBDBDB] text-[#767676] px-4 py-2 rounded-sm border border-[#CBCBCB] hover:bg-[#0069FF] hover:text-white w-full"
                  >
                    PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        <div className="flex items-center gap-4 relative">
  <label htmlFor="timeFrame" className="text-sm font-medium">Sort by:</label>
  <select
    id="timeFrame"
    value={timeFrame}
    onChange={(e) => {
      setTimeFrame(e.target.value);
      if (e.target.value === "custom") {
        setShowCustomDatePicker(true);
      } else {
        setShowCustomDatePicker(false);
        setChartStartDate(null);
        setChartEndDate(null);
        setPieError("");
      }
    }}
    onClick={() => {
      if (timeFrame === "custom") {
        setShowCustomDatePicker(true);
      }
    }}
    className="p-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0069FF] w-full sm:w-auto "
  >
    <option value="today">Today</option>
    <option value="yesterday">Yesterday</option>
    <option value="this_week">This Week</option>
    <option value="this_month">This Month</option>
    <option value="this_year">This Year</option>
    <option value="custom">Custom</option>
  </select>
  {showCustomDatePicker && (
    <div ref={customDatePickerRef} className=" absolute right-0 top-12 sm:top-10 text-black rounded-sm shadow-xl z-50 p-4 w-[18rem] sm:w-96 overflow-auto max-h-[calc(100vh-200px)]" style={{ backgroundColor: '#F7F7F7' }}>
      <div className="mb-2">
        <label className="flex text-sm mb-2 ml-1">Start Date:</label>
        <DatePicker
          selected={chartStartDate}
          onChange={(date) => setChartStartDate(date)}
          selectsStart
          startDate={chartStartDate}
          endDate={chartEndDate}
          className="p-2 ml-1 rounded bg-[#DBDBDB] text-black w-full border border-[#CBCBCB]"
          dateFormat="yyyy-MM-dd"
          placeholderText="Select start date"
        />
      </div>
      <div className="mb-2">
        <label className="flex text-sm mb-2 ml-1">End Date:</label>
        <DatePicker
          selected={chartEndDate}
          onChange={(date) => setChartEndDate(date)}
          selectsEnd
          startDate={chartStartDate}
          endDate={chartEndDate}
          minDate={chartStartDate}
          className="p-2 ml-1 rounded bg-[#DBDBDB] text-black w-full border border-[#CBCBCB]"
          dateFormat="yyyy-MM-dd"
          placeholderText="Select end date"
        />
      </div>
      {pieError && <p className="text-red-500 text-sm ml-1 mb-2">{pieError}</p>}
      <button
        onClick={() => {
          if (!chartStartDate || !chartEndDate) {
            setPieError("Please select start and end dates.");
            return;
          }
          const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
          if (chartEndDate - chartStartDate > oneYearInMs) {
            setPieError("Date range cannot exceed one year.");
            return;
          }
          setPieError("");
          setShowCustomDatePicker(false);
          fetchChartData();
          fetchRequestLogs();
        }}
        className="bg-[#DBDBDB] text-[#767676] px-4 py-2 mt-2 ml-1 rounded-sm border border-[#CBCBCB] hover:bg-[#0069FF] hover:text-white w-full"
      >
        Apply
      </button>
    </div>
  )}
</div>
        </div>

       <div className="flex flex-col md:flex-row justify-between mb-8 gap-4 sm:gap-6">
  <div
    className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg"
    style={{ backgroundColor: '#101C40' }}
  >
    <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">Usage Distribution</h3>
    {pieLoading ? (
      <div className="mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    ) : pieError ? (
      <p className="text-center text-red-400 h-64 flex items-center justify-center">{pieError}</p>
    ) : pieData.length === 0 ? (
      <p className="text-center h-64 flex items-center justify-center">No usage stats available.</p>
    ) : (
      <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 250 : window.innerWidth < 1024 ? 280 : 300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={window.innerWidth < 640 ? 80 : window.innerWidth < 1024 ? 100 : 120}
            fill="#8884d8"
            dataKey="value"
            style={{ pointerEvents: 'none' }}
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} cursor={false} />
          <Legend
  layout="horizontal"
  verticalAlign="bottom"
  align="center"
  wrapperStyle={{
    paddingTop: window.innerWidth < 1024 ? '10px' : '15px',
    fontSize: window.innerWidth < 1024 ? '12px' : '14px',
    color: 'white',
    '@media (min-width: 1024px)': {
      layout: 'vertical',
      verticalAlign: 'middle',
      align: 'right',
      paddingLeft: '10px',
      paddingTop: '0',
    }
  }}
  formatter={(value, entry) => (
    <span style={{ color: 'white' }}>
      {value}: {entry.payload.value}
    </span>
  )}
/>
        </PieChart>
      </ResponsiveContainer>
    )}
  </div>
           <div
    className="w-full bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg"
    style={{ backgroundColor: '#101C40' }}
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg sm:text-xl font-semibold">Number of scans</h3>
      <button
        onClick={() => setIsBarGraph(!isBarGraph)}
        className="bg-[#2A3D76] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#0069FF] text-sm sm:text-base"
      >
        {isBarGraph ? 'Show Line Graph' : 'Show Bar Graph'}
      </button>
    </div>
    {barData.length === 0 ? (
      <p className="text-center h-64 flex items-center justify-center">No activity data available.</p>
    ) : (
      <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 250 : window.innerWidth < 1024 ? 280 : 300}>
        {isBarGraph ? (
          <BarChart data={barData} barCategoryGap={window.innerWidth < 640 ? 10 : 20} barGap={4}>
            <XAxis
              dataKey={timeFrame === 'this_month' || timeFrame === 'custom' ? 'week' : 'day'}
              stroke="#fff"
              axisLine={false}
              tickLine={false}
              fontSize={window.innerWidth < 640 ? 12 : 14}
            />
            <YAxis
              stroke="#fff"
              axisLine={false}
              tickLine={false}
              fontSize={window.innerWidth < 640 ? 12 : 14}
            />
            <Tooltip content={<CustomBarTooltip />} cursor={false} />
            <Bar
              dataKey="value"
              fill="#5292F1"
              barSize={window.innerWidth < 640 ? 30 : window.innerWidth < 1024 ? 40 : 50}
              shape={<RoundedBar />}
            />
          </BarChart>
        ) : (
          <LineChart data={barData}>
            <XAxis
              dataKey={timeFrame === 'this_month' || timeFrame === 'custom' ? 'week' : 'day'}
              stroke="#fff"
              axisLine={false}
              tickLine={false}
              fontSize={window.innerWidth < 640 ? 12 : 14}
            />
            <YAxis
              stroke="#fff"
              axisLine={false}
              tickLine={false}
              fontSize={window.innerWidth < 640 ? 12 : 14}
            />
            <Tooltip content={<CustomBarTooltip />} cursor={false} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#5292F1"
              strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
              dot={{ r: window.innerWidth < 640 ? 3 : 4 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    )}
  </div>
        </div>

       <div className="bg-gray-800 p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#101C40' }}>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 sm:gap-0">
          <h2 className="text-2xl font-semibold text-left">Scan History</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto relative">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="roleType" className="text-sm font-medium">Role:</label>
            
              <select
                id="roleType"
                value={roleType}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setRoleType(newRole);
                  setRoleUserFilter(""); // Clear email input when role changes
                  if (newRole !== "Email") {
                    setPage(1);
                    fetchRequestLogs(newRole); // Pass the new role directly
                  }
                }}
                className="p-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0069FF] w-full sm:w-32"
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Viewer">Viewer</option>
                <option value="Analyst">Analyst</option>
                <option value="Email">Email</option>
              </select>
            </div>
            {roleType === "Email" && (
              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <input
                  type="text"
                  value={roleUserFilter}
                  onChange={(e) => setRoleUserFilter(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && roleUserFilter) {
                      setPage(1);
                      fetchRequestLogs();
                    }
                  }}
                  placeholder="Enter email"
                  className="p-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0069FF] w-full sm:w-48"
                />
              </div>
            )}
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <label htmlFor="logs" className="text-sm font-medium">Date:</label>
              <select
                id="logs"
                value={logsTimeFrame}
                
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  setLogsTimeFrame(selectedValue);
                  setRoleType(""); // Reset role dropdown to default
                  setRoleUserFilter(""); // Clear email input
                  totalRowCountCache.current = {}; // Clear cache for new filter
                  setShowExportOptions(false);
                  if (selectedValue === "custom") {
                    setShowCustomLogsDatePicker(true);
                  } else {
                    setShowCustomLogsDatePicker(false);
                    setExportStartDate(null);
                    setExportEndDate(null);
                    setError("");
                  }
                }}
                onClick={() => {
                  if (logsTimeFrame === "custom") {
                    setShowCustomLogsDatePicker(true);
                  }
                }}
                className="p-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0069FF] w-full sm:w-auto"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="this_year">This Year</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {showCustomLogsDatePicker && (
              <div ref={customLogsDatePickerRef} className="absolute right-0 top-12 sm:top-10 text-black rounded-sm shadow-xl z-50 p-4 w-full sm:w-96 max-w-xs sm:max-w-none overflow-auto max-h-[calc(100vh-200px)]" style={{ backgroundColor: '#F7F7F7' }}>
                <div className="mb-2">
                  <label className="flex text-sm mb-2 ml-1">Start Date:</label>
                  <DatePicker
                    selected={exportStartDate}
                    onChange={(date) => setExportStartDate(date)}
                    selectsStart
                    startDate={exportStartDate}
                    endDate={exportEndDate}
                    className="p-2 ml-1 rounded bg-[#DBDBDB] text-black w-full border border-[#CBCBCB]"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                  />
                </div>
                <div className="mb-2">
                  <label className="flex text-sm mb-2 ml-1">End Date:</label>
                  <DatePicker
                    selected={exportEndDate}
                    onChange={(date) => setExportEndDate(date)}
                    selectsEnd
                    startDate={exportStartDate}
                    endDate={exportEndDate}
                    minDate={exportStartDate}
                    className="p-2 ml-1 rounded bg-[#DBDBDB] text-black w-full border border-[#CBCBCB]"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select end date"
                  />
                </div>
                {error && <p className="text-red-500 text-sm ml-1 mb-2">{error}</p>}
                <button
                  onClick={() => {
                    console.log("Custom logs date picker applied:", { start: exportStartDate, end: exportEndDate });
                    if (!exportStartDate || !exportEndDate) {
                      setError("Please select start and end dates.");
                      setGridData([]);
                      setTotalRowCount(0);
                      return;
                    }
                    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
                    if (exportEndDate - exportStartDate > oneYearInMs) {
                      setError("Custom date range cannot exceed one year.");
                      setGridData([]);
                      setTotalRowCount(0);
                      return;
                    }
                    setError("");
                    setShowCustomLogsDatePicker(false);
                    fetchRequestLogs();
                  }}
                  className="bg-[#DBDBDB] text-[#767676] px-4 py-2 mt-2 ml-1 rounded-sm border border-[#CBCBCB] hover:bg-[#0069FF] hover:text-white w-full"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

          {loading ? (
  <div className="mx-auto mt-16 flex justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
  </div>
) : error ? (
  <p className="text-center text-red-400 py-6">{error}</p>
) : gridData.length === 0 ? (
  <p className="text-center py-6">No usage logs available</p>
) : (
  <>
    <div className="w-full overflow-x-auto touch-pan-x"> {/* CHANGE 1: Added overflow-x-auto and touch-pan-x */}
      <DataGrid
        rows={gridData}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[20]}
        rowCount={totalRowCount}
        pagination
        paginationMode="server"
        page={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(1);
        }}
        loading={loading}
        disableColumnMenu
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#0A1229",
            color: "black",
            fontWeight: "bold",
            fontSize: 14,
            borderBottom: "none",
          },
          "& .MuiDataGrid-row": {
            backgroundColor: "#101C40",
            color: "white",
            "&:hover": {
              backgroundColor: "#0b162e",
            },
          },
          "& .MuiDataGrid-cell": {
            color: "white",
            border: "1px solid #4c5879",
          },
          "& .MuiCheckbox-root": {
            color: "white !important",
          },
          "& .MuiDataGrid-footerContainer": {
            display: "none",
          },
          "& .MuiDataGrid-tablePagination": {
            display: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: "#101C40",
            overflow: "auto !important", // CHANGE 2: Changed from hidden to auto
            touchAction: "pan-x", // CHANGE 3: Enable touch scrolling
          },
          "& .MuiDataGrid-main": {
            border: "1px solid #4c5879",
            borderRadius: "8px",
            overflow: "visible !important", // CHANGE 4: Changed from hidden to visible
          },
        }}
      />
    </div>
    {totalRowCount > 0 && (
      <div className="flex justify-center items-center gap-2 sm:gap-2 mt-4 w-full flex-wrap">
        <button
          onClick={handlePreviousPage}
          disabled={page === 1}
          className={`px-4 py-2 rounded-lg text-sm ${
            page === 1
              ? "bg-[#2A3D76] cursor-not-allowed"
              : "bg-[#2A3D76] text-white hover:bg-[#0069FF]"
          }`}
        >
          Previous
        </button>
        {renderPagination()}
        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className={`px-4 py-2 rounded-lg text-sm ${
            page === totalPages
              ? "bg-[#2A3D76] cursor-not-allowed"
              : "bg-[#2A3D76] text-white hover:bg-[#0069FF]"
          }`}
        >
          Next
        </button>
      </div>
    )}
  </>
)}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UsageDashboard;