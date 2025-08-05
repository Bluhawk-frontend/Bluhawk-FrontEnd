import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import Footer from "../components/reusable/Footer";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { CSVLink } from "react-csv";
import NewNavbar from "./reusable/NewNavbar";
import CVSSGauge from './CVSSGauge';

export default function MyIntel() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [gridData, setGridData] = useState([]);
  const [page, setPage] = useState(1); // 1-indexed for backend
  const [pageSize, setPageSize] = useState(50); // Default pageSize set to 50
  const [loading, setLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); // Track API's current_page
  const [searchTerm, setSearchTerm] = useState("");
  const accessToken = Cookies.get("access_token");
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState("Mitre");
  const [data, setData] = useState([]);
  const [singleData, setSingleData] = useState([]);
  const [searchErr, setSearchErr] = useState("");
  const [subscribeErr, setSubscribeErr] = useState("");
  const [subscribeMsg, setSubscribeMsg] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchClick, setSearchClick] = useState(false);
  const [showMyIntelInfo, setShowMyIntelInfo] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [sourceTypeList, setSourceTypeList] = useState([]);
  const [selectedSourceType, setselectedSourceType] = useState(sourceTypeList[0]);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const searchTypesFilter = new Set([
    "course-of-action",
    "malware",
    "tool",
    "attack-pattern",
    "intrusion-set",
    "campaign",
    "x-mitre-tactic",
    "cisa_vul",
    "android threat",
    "botnet",
    "attck4fraud",
    "banker",
    "malpedia",
    "tools",
  ]);

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

  const columns = [
    { field: "index", headerName: "ID" },
    { field: "name", headerName: "Name" },
    { field: "type", headerName: "Type" },
    { field: "source_type", headerName: "Source Type" },
    { field: "created_on", headerName: "Created On" },
  ];

  const filteredColumns = selectedOption === "CVE"
    ? columns.filter((col) => col.field !== "type")
    : columns;

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const parseDescription = (text = "") => {
    const regex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    const parts = [];
    let lastIndex = 0;

    text.replace(regex, (match, linkText, url, index) => {
      parts.push(text.slice(lastIndex, index));
      if (
        text[index + match.length] === undefined ||
        text[index + match.length] !== "("
      ) {
        parts.push(
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {linkText}
          </a>
        );
      } else {
        parts.push(`[${linkText}](${url})`);
      }
      lastIndex = index + match.length;
    });

    parts.push(text.slice(lastIndex));
    return parts;
  };

  function groupBySourceType(data) {
    const groupedData = {};
    data.forEach((item) => {
      const { name, source_type, id, ...rest } = item;
      if (!groupedData[name]) {
        groupedData[name] = { ...rest, id, name, sources: [] };
      }
      groupedData[name].sources.push({ name, source_type, id });
    });
    return Object.values(groupedData);
  }

  useEffect(() => {
    if (!isInitialized || !inputValue) return;
    setSearchErr("");
    setLoading(true);

    const fetchData = async () => {
      try {
        const url = `${API_BASE_URL}/dashboard/my_intel_search?query=${inputValue}&type_filter=${typeFilter}&source=${selectedOption}&page=${page}&page_size=${pageSize}`;
        const response = await axios.get(url, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const res = response.data.data;
        const current_page = response.data.current_page;
        const total_pages = response.data.total_pages;
        setData(res);
        setTotalRowCount(response.data.total_count || 0);
        setTotalPages(total_pages || 0);
        setCurrentPage(current_page); // Use API's current_page directly (1-based)

        if (Array.isArray(res)) {
          const mappedData = res.map((item, index) => ({
            index: index + 1 + (page - 1) * pageSize || item.id,
            id: item.id || index,
            name: item.name && item.name !== "No Title" ? item.name : item.id,
            type: item.type || "N/A",
            source_type:
              selectedOption === "CVE"
                ? item.json_data?.cve?.CVE_data_meta?.ASSIGNER || "N/A"
                : item.source_type || "N/A",
            created_on:
              selectedOption === "CVE"
                ? item.json_data?.publishedDate
                  ? formatDate(item.json_data.publishedDate)
                  : "N/A"
                : item.created
                ? formatDate(item.created)
                : "N/A",
          }));

          setGridData(mappedData);
          mappedData.forEach((item) => {
            setSourceTypeList((previtem) =>
              previtem.includes(item.source_type)
                ? previtem
                : [...previtem, item.source_type]
            );
          });
        } else if (res.data && typeof res.data === "object") {
          const mappedData = [
            {
              index: 1 + (page - 1) * pageSize,
              id: res.data.id || "N/A",
              name:
                res.data.name && res.data.name !== "No Title"
                  ? res.data.name
                  : res.data.id,
              type: res.data.type || "N/A",
              source_type:
                selectedOption === "CVE"
                  ? "cve"
                  : res.data.source_type || "N/A",
              created_on: res.data.created ? formatDate(res.data.created) : "N/A",
            },
          ];

          setGridData(mappedData);
          setSourceTypeList((previtem) =>
            previtem.includes(res.data.source_type)
              ? previtem
              : [...previtem, res.data.source_type]
          );
        } else {
          console.error("Response is not an array", response);
        }
      } catch (error) {
        setData([]);
        setGridData([]);
        console.error("Error fetching data:", error);
        setSearchErr("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [typeFilter, inputValue, isInitialized, searchTrigger, page, pageSize]);

  const handleSubmit = async (event) => {
    if (event.type === "keydown" && event.key !== "Enter") return;
    event.preventDefault();

    const domainRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    const hashRegex = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;
    const urlRegex = /^(https?:\/\/)?(www\.)?[\w-]+\.[\w]{2,}([\/\w .-]*)*\/?$/;

    if (!searchInput.trim()) {
      setSearchErr("Please enter a search query");
      setData([]);
      setGridData([]);
      return;
    }

    if (urlRegex.test(searchInput.trim())) {
      setSearchErr("URLs are not allowed in this search.");
      setData([]);
      setGridData([]);
      return;
    }

    if (domainRegex.test(searchInput.trim())) {
      setSearchErr("Domain names are not allowed in this search.");
      setData([]);
      setGridData([]);
      return;
    }

    if (hashRegex.test(searchInput.trim())) {
      setSearchErr("Hash values are not allowed in this search.");
      setData([]);
      setGridData([]);
      return;
    }

    if (searchInput.includes(":")) {
      const [type, input] = searchInput.split(":");
      if (searchTypesFilter.has(type)) {
        setTypeFilter(type);
        setInputValue(input.trim());
        setIsInitialized(true);
        setPage(1); // Start at page 1
        setSearchTrigger((prev) => prev + 1);
      } else {
        setTypeFilter("");
        setInputValue(searchInput);
        setLoading(false);
        setIsInitialized(false);
        return;
      }
    } else {
      setTypeFilter("");
      setInputValue(searchInput);
      setIsInitialized(true);
      setPage(1); // Start at page 1
      setSearchTrigger((prev) => prev + 1);
    }
  };

  const handleSubscribe = async () => {
    setSubscribeErr("");
    setSubscribeMsg("");
    setSubscribeLoading(true);
    if (!singleData[0]?.id) {
      console.error("Error: standard_id is undefined or null");
      setSubscribeErr("Invalid request. Standard ID is missing.");
      return;
    }
    try {
      const accessToken = Cookies.get("access_token");
      if (!accessToken) {
        navigate("/login");
        return;
      }
      const url = `${API_BASE_URL}/dashboard/subscribe`;
      const res = await axios.post(
        url,
        {
          entity_source: "mitre",
          entity_id: singleData[0]?.id,
          Authorization: `Bearer ${accessToken}`,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (res.status === 200) {
        setSubscribeMsg(res.data.message);
      } else {
        console.error("Unexpected response:", res);
        setSubscribeErr("Unexpected server response.");
      }
    } catch (error) {
      console.error("Error for Subscription:", error);
      setSubscribeErr("Failed to subscription. Please try again.");
    } finally {
      setSubscribeLoading(false);
    }
  };

  const handleRowClick = (params) => {
    setSubscribeErr("");
    setSubscribeMsg("");
    async function getSingleData() {
      try {
        const url = `${API_BASE_URL}/dashboard/my_intel_search?query=${inputValue}&type_filter=${typeFilter}&source=${selectedOption}&id=${params.id}&page=${page}&page_size=${pageSize}`;
        const response = await axios.get(url, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log("singleData response:", response.data.data);
        console.log("References in response:", response.data?.data?.json_data?.cve?.references?.reference_data);
        if (response.data && typeof response.data.data === "object") {
          setSingleData([response.data.data]);
          setShowMyIntelInfo(true);
          setselectedSourceType(response.data.data?.source_type || "N/A");
          console.log("API Response Single Data : ", response.data.data);
          // Push to history to allow browser back navigation
          window.history.pushState({ showMyIntelInfo: true }, "");
        } else {
          setSingleData([]);
          setShowMyIntelInfo(false);
          setSearchErr("No data found for the selected item.");
          console.warn("Empty response data.");
        }
      } catch (error) {
        setSingleData([]);
        console.error("Error fetching data:", error);
        setSearchErr("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    getSingleData();
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopstate = (event) => {
      if (!event.state || !event.state.showMyIntelInfo) {
        setShowMyIntelInfo(false);
      }
    };

    window.addEventListener("popstate", handlePopstate);
    // Initial history state
    window.history.replaceState({ showMyIntelInfo: showMyIntelInfo }, "");

    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [showMyIntelInfo]);

  const handleBackClick = () => {
    setShowMyIntelInfo(false);
    window.history.pushState({ showMyIntelInfo: false }, "");
  };

  const formatLabel = (key) => {
    if (key === "mitre_object_id") return "ID";
    const parts = key.split("_mitre_");
    const label = parts.length > 1 ? parts[1] : key;
    return label
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatValue = (value) => {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "True" : "False";
    return value;
  };

  const requiredFields = [
    "mitre_object_id",
    "source_type",
    "type",
    "x_mitre_platforms",
    "x_mitre_deprecated",
    "x_mitre_domains",
    "x_mitre_contributors",
    "created",
    "modified",
    "dateAdded",
  ];

  const handleInputChange = (e) => {
    setSearchErr("");
    setSearchInput(e.target.value);
  };

  const handleDropDownChange = (event) => {
    setselectedSourceType(event.target.value);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePageClick = (pageNum) => {
    setPage(pageNum);
  };

  const renderPaginationButtons = () => {
    const maxButtons = 10; // Limit to 10 buttons
    const buttons = [];
    let startPage, endPage;

    if (totalPages <= maxButtons) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const halfButtons = Math.floor(maxButtons / 2);
      startPage = Math.max(1, page - halfButtons);
      endPage = Math.min(totalPages, startPage + maxButtons - 1);

      if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`px-2 py-1 text-sm rounded sm:px-3 sm:text-base ${
            page === i
              ? "bg-vibrantOrange text-white"
              : "bg-gray-600 text-white hover:bg-gray-500"
          }`} // Reduced padding and text size for mobile
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="bg-midnightBlue min-h-screen min-w-screen flex flex-col">
      <NewNavbar />
      <main className="flex-1 text-black min-h-screen">
        {!showMyIntelInfo ? (
          <>
            <div className="bg-[#F5F5F5] p-2 shadow-md w-full">
              
                <div className="w-full mx-auto max-w-7xl flex flex-col  sm:flex-row sm:items-center px-6 py-2 gap-2">
                  <div className="text-black text-xl sm:text-2xl font-semibold whitespace-nowrap text-center sm:text-left mb-2 sm:mb-0">
                    My Intel
                  </div>
                  
                  <input
                    type="text"
                    value={searchInput}
                    onChange={handleInputChange}
                    onKeyDown={handleSubmit}
                    className="w-full sm:w-[200px] lg:w-[600px] sm:flex-grow h-[22px] sm:h-auto text-black px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base border rounded shadow-sm items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Threat Search"
                  />
                
                 <div className="flex flex-row items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                  <select
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="text-black p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-[80%] sm:w-auto"
                  >
                    <option value="Mitre">MITRE</option>
                    <option value="MISP">MISP</option>
                    <option value="CVE">CVE</option>
                  </select>
                  <div
                    onClick={handleSubmit}
                    className="flex items-center gap-1 bg-vibrantOrange text-white px-3 py-2 rounded shadow cursor-pointer transition-colors duration-200 hover:bg-orange-600 w-[20%] sm:w-auto justify-center"
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
              
            </div>
            {searchErr && (
              <p className="text-red-500 mt-4 text-center">{searchErr}</p>
            )}

            {loading ? (
              <div className="mx-auto mt-16 animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            ) : isInitialized && gridData.length === 0 && searchErr === "" ? (
              <p className="text-center mt-auto text-white">No data available</p>
            ) : gridData.length > 0 ? (
              <div className="mt-8 my-4 mx-auto max-w-7xl w-[100%] min-h-[300px] text-white">
                <DataGrid
                  rows={gridData}
                  columns={filteredColumns.map((col) => ({
                    ...col,
                    width: col.width ? col.width : undefined,
                    flex: col.width ? undefined : 1,
                  }))}
                  pageSize={pageSize}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  rowCount={totalRowCount}
                  pagination
                  paginationMode="server"
                  onPageSizeChange={(newPageSize) => {
                    setPageSize(newPageSize);
                    setPage(1); // Reset to page 1
                  }}
                  loading={loading}
                  onRowClick={handleRowClick}
                  sx={{
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "white",
                      color: "black",
                      fontWeight: "bold",
                    },
                    "& .MuiDataGrid-row": {
                      color: "white",
                    },
                    "& .MuiDataGrid-cell": {
                      color: "white",
                    },
                    "& .MuiCheckbox-root": {
                      color: "white !important",
                    },
                    "& .MuiDataGrid-Footer3Container": {
                      backgroundColor: "transparent",
                      color: "white",
                    },
                    "& .MuiTablePagination-root": {
                      color: "white",
                    },
                    "& .MuiDataGrid-toolbarContainer": {
                      color: "white",
                    },
                    "& .MuiDataGrid-row:hover": {
                      backgroundColor: "#FE5E15",
                    },
                  }}x
                />
                <div className="flex justify-center items-center gap-2 mt-4 overflow-x-auto whitespace-nowrap px-2"> {/* Added overflow-x-auto and whitespace-nowrap */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className={`px-2 py-1 text-sm rounded sm:px-3 sm:text-base ${
                      page === 1
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-vibrantOrange text-white hover:bg-orange-600"
                    }`} // Reduced padding and text size for mobile
                  >
                    Previous
                  </button>
                  {renderPaginationButtons()}
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className={`px-2 py-1 text-sm rounded sm:px-3 sm:text-base ${
                      page === totalPages
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-vibrantOrange text-white hover:bg-orange-600"
                    }`} // Reduced padding and text size for mobile
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div>
            <button
              onClick={handleBackClick}
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
            {subscribeErr && (
              <p className="mt-2 mb-2 text-center text-sm text-red-400">
                {subscribeErr}
              </p>
            )}
            {subscribeMsg && (
              <p className="mt-2 text-center text-sm text-green-400 mb-2">
                {subscribeMsg}
              </p>
            )}
            {singleData && singleData.length === 0 ? (
              <div className="p-4 text-center text-red-500 font-semibold">
                No data found for the selected item. {singleData.length}
              </div>
            ) : singleData && singleData.length > 0 ? (
              selectedOption === "CVE" ? (
                <div className="text-white mt-4 mx-auto max-w-7xl p-4 border-gray-900 mb-16 justify-center space-y-4">
                  <div className="flex flex-col gap-6">
                    <div className="w-full p-4 rounded-sm border border-[#4C5879] shadow" style={{ backgroundColor: '#101C40' }}>
                      <h2 className="text-xl font-bold border-b border-[#4C5879] pb-2 mb-2"> Key CVE Details</h2>
                      <div className="space-y-2">
                        <div>
                          <span className="font-bold">CVE ID:</span>
                          <span className="ml-2">{singleData[0]?.id || singleData[0]?.json_data?.cve?.CVE_data_meta?.ID || "N/A"}</span>
                        </div>
                        <div>
                          <span className="font-bold">Assigner:</span>
                          <span className="ml-2">{singleData[0]?.json_data?.cve?.CVE_data_meta?.ASSIGNER || "N/A"}</span>
                        </div>
                        <div>
                          <span className="font-bold">Date Published:</span>
                          <span className="ml-2">{formatDate(singleData[0]?.json_data?.publishedDate) || "N/A"}</span>
                        </div>
                        <div>
                          <span className="font-bold">Date Updated:</span>
                          <span className="ml-2">{formatDate(singleData[0]?.json_data?.lastModifiedDate) || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full p-4 rounded-sm border border-[#4C5879] shadow" style={{ backgroundColor: '#101C40' }}>
                      <h2 className="text-xl font-bold border-b border-[#4C5879] pb-2 mb-2">📝 Description</h2>
                      <p className="leading-relaxed">
                        {singleData[0]?.json_data?.cve?.description?.description_data?.[0]?.value || "N/A"}
                      </p>
                    </div>
                  </div>
                  {singleData[0]?.json_data?.impact && (
                    <>
                      <div className="flex flex-col gap-4">
                        <div className="w-full border border-[#4C5879] rounded-sm p-4" style={{ backgroundColor: '#101C40' }}>
                          <h2 className="font-bold text-xl text-white border-b border-[#4C5879] pb-2 mb-2">📊 Impact</h2>
                          {singleData[0].json_data.impact.baseMetricV3?.cvssV3 && (
                            <>
                              <span className="font-semibold block mt-2">CVSS V3.1:</span>
                              <div className="flex flex-col md:flex-row gap-4 mt-2">
                                <div className="flex-1 p-4 rounded-sm" style={{ backgroundColor: '#101C40' }}>
                                  {singleData[0].json_data.impact.baseMetricV3.cvssV3.vectorString && (
                                    <div>
                                      <span className="font-semibold">Vector String:</span>{" "}
                                      {singleData[0].json_data.impact.baseMetricV3.cvssV3.vectorString}
                                    </div>
                                  )}
                                  <ul className="list-disc ml-6 mt-2">
                                    {Object.entries(singleData[0].json_data.impact.baseMetricV3.cvssV3).map(([key, value]) => {
                                      if (key === "vectorString") return null;
                                      return (
                                        <li key={`v3-${key}`}>
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
                                          ) : (
                                            <>
                                              <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>{" "}
                                              {value}
                                            </>
                                          )}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>

                                {typeof singleData[0].json_data.impact.baseMetricV3.cvssV3.baseScore === "number" && (
                                  <div className="w-full md:w-1/3 p-4 rounded-sm flex flex-col items-center justify-center" style={{ backgroundColor: '#101C40' }}>
                                    <span className="font-semibold mb-2">Base Score</span>
                                    <CVSSGauge score={singleData[0].json_data.impact.baseMetricV3.cvssV3.baseScore} />
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                          {singleData[0].json_data.impact.baseMetricV2?.cvssV2 && (
                            <div className="flex flex-col md:flex-row gap-4 mt-4">
                              <div className="flex-1 p-4 rounded-sm" style={{ backgroundColor: '#101C40' }}>
                                <span className="font-semibold block">CVSS V2:</span>
                                {singleData[0].json_data.impact.baseMetricV2.cvssV2.vectorString && (
                                  <div className="mt-2">
                                    <span className="font-semibold">Vector String:</span>{" "}
                                    {singleData[0].json_data.impact.baseMetricV2.cvssV2.vectorString}
                                  </div>
                                )}
                                <ul className="list-disc ml-6 mt-2">
                                  {Object.entries(singleData[0].json_data.impact.baseMetricV2.cvssV2).map(([key, value]) => {
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
                                        ) : (
                                          <>
                                            <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>{" "}
                                            {value}
                                          </>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>

                              {typeof singleData[0].json_data.impact.baseMetricV2.cvssV2.baseScore === "number" && (
                                <div className="w-full md:w-1/3 p-4 rounded-sm flex flex-col items-center justify-center" style={{ backgroundColor: '#101C40' }}>
                                  <span className="font-semibold mb-2">Base Score</span>
                                  <CVSSGauge score={singleData[0].json_data.impact.baseMetricV2.cvssV2.baseScore} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {singleData[0]?.cpe_entries && (
                          <div className="w-full border border-[#4C5879] rounded-sm p-4" style={{ backgroundColor: '#101C40' }}>
                            <h2 className="font-bold text-xl text-white border-b border-[#4C5879] pb-2 mb-2">🔧 Affected</h2>
                            <div className="ml-4 mt-2 space-y-1">
                              {(() => {
                                const cpe = singleData[0].cpe_entries;
                                const parts = cpe.split(':');
                                const typeMap = { a: "Application", o: "Operating System", h: "Hardware" };
                                const typeReadable = typeMap[parts[2]] || parts[2];

                                return (
                                  <ul className="list-disc">
                                    <li>{cpe}</li>
                                    <li>{typeReadable} ({parts[2]})</li>
                                    <li>{parts[3]}</li>
                                    <li>{parts[4]}</li>
                                  </ul>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {singleData[0]?.json_data?.cve?.references?.reference_data?.length > 0 && (
                    <div className="p-4 border border-[#4C5879] rounded-sm" style={{ backgroundColor: '#101C40' }}>
                      <h2 className="font-bold text-xl text-white border-b border-[#4C5879] pb-2 mb-2">🌐 References</h2>
                      <ul className="list-disc ml-6">
                        {[...new Map(
                          singleData[0].json_data.cve.references.reference_data.map((ref) => [ref.url, ref])
                        ).values()].map((ref, index) => (
                          <li key={index}>
                            <a
                              href={ref.url}
                              className="text-blue-400 underline hover:text-blue-300"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {ref.name || ref.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 mx-auto max-w-7xl p-2 flex flex-col justify-center border rounded-sm">
                  <div className="flex justify-end items-center mb-2">
                    {/* {singleData && singleData[0]?.source_type === "mitre" && (
                      <button
                        onClick={handleSubscribe}
                        className="flex justify-center items-center mr-5 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                      >
                        Subscribe
                        {subscribeLoading && (
                          <div className="ml-2 animate-spin rounded-full h-2 w-2 border-t-2 border-white"></div>
                        )}
                      </button>
                    )} */}
                  </div>
                  <div>
                    <div className="flex justify-between">
                      {singleData &&
                        singleData?.map((mal, ind) => (
                          <div key={ind} className="p-4 text-white">
                            <h2 className="text-md font-semibold pb-2">
                              {mal?.name}
                            </h2>
                            <p className="text-white text-sm">
                              {parseDescription(
                                mal?.json_data?.description ||
                                  mal?.json_data?.shortDescription
                              )}
                            </p>
                          </div>
                        ))}
                    </div>
                    {singleData && singleData[0]?.relation?.length > 0 && (
                      <div className="mt-8 text-white">
                        <h2 className="text-xl font-semibold">Relations</h2>
                        <table className="w-full mt-4 border border-white">
                          <thead>
                            <tr className="bg-[#2292A4]">
                              <th className="border border-white p-2">ID</th>
                              <th className="border border-white p-2">
                                Usage Type
                              </th>
                              <th className="border border-white p-2">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {singleData?.map((malwareItem) =>
                              malwareItem.relation.map((relation, index) => {
                                const mitreId =
                                  relation.target_mitre_id || "N/A";
                                const mitreUrl =
                                  mitreId !== "N/A"
                                    ? `https://attack.mitre.org/techniques/${mitreId}`
                                    : "#";
                                return (
                                  <tr key={index}>
                                    <td className="border border-white p-2">
                                      {mitreId !== "N/A" ? (
                                        <a
                                          href={mitreUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-400 hover:underline"
                                        >
                                          {mitreId}
                                        </a>
                                      ) : (
                                        "N/A"
                                      )}
                                    </td>
                                    <td className="border border-white p-2">
                                      {relation.relationship_type || "N/A"}
                                    </td>
                                    <td className="border border-white p-4">
                                      {parseDescription(
                                        relation.json_data.description
                                      ) || "N/A"}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {singleData &&
                      singleData[0]?.json_data?.external_references?.length >
                        0 && (
                        <div className="mt-8 text-white">
                          <h2 className="text-2xl font-semibold">
                            External Resources
                          </h2>
                          <ul className="mt-4 space-y-2">
                            {singleData.flatMap((mal) =>
                              mal.json_data.external_references
                                .filter((ref) => ref.description || ref.url)
                                .map((ref) => (
                                  <li
                                    key={`${ref.description || "resource"}-${
                                      ref.url
                                    }`}
                                    className="text-white"
                                  >
                                    <a
                                      href={ref?.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:underline"
                                    >
                                      {ref.source_name}
                                    </a>
                                  </li>
                                ))
                            )}
                          </ul>
                        </div>
                      )}
                    {singleData &&
                      singleData[0]?.json_data?.meta?.refs?.length > 0 && (
                        <div className="mt-8 text-white">
                          <h2 className="text-2xl font-semibold">
                            External Resources
                          </h2>
                          <ul className="mt-2 space-y-2">
                            {singleData[0]?.json_data?.meta?.refs.map(
                              (item, ind) => (
                                <li key={ind}>
                                  <a
                                    href={item}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-300 hover:underline"
                                  >
                                    {`MISP references ${ind + 1}`}
                                  </a>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              )
            ) : null}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}