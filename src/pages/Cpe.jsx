import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import NewNavbar from "../components/reusable/NewNavbar";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../components/reusable/Footer";


const CpePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const [selectedOption, setSelectedOption] = useState("ALL");
  const [gridData, setGridData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchErr, setSearchErr] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const accessToken = Cookies.get("access_token");

  // Restore search query from URL on mount and fetch data if query exists
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("query");
    if (query) {
      setSearchInput(decodeURIComponent(query));
      setPage(1); // Reset to first page
      fetchCPEData(decodeURIComponent(query)); // Fetch data for the restored query
    }
  }, [location.search]);

  // Fetch data when page or pageSize changes
  useEffect(() => {
    if (isInitialized && searchInput.trim()) {
      fetchCPEData();
    }
  }, [page, pageSize]);

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleRowClick = (params) => {
    const fullId = params?.row?.id; // this is the full ID
    navigate(`/cpe-details?id=${encodeURIComponent(fullId)}`, {
      state: { searchQuery: searchInput },
    });
  };

  const fetchCPEData = async (query = searchInput) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // const typeFilter = selectedOption === "ALL" ? "" : selectedOption.toLowerCase();
      const url = `${API_BASE_URL}/dashboard/cpe_search/?query=${encodeURIComponent(
        query
      )}&page=${page}&page_size=${pageSize}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      // const processedData = (data.data || []).map((item, index) => ({
      //   id: item.id, // keep full ID here!
      //   sno: (page - 1) * pageSize + index + 1,
      //   shortId: item.id?.length > 20 ? item.id.slice(0, 20) + "..." : item.id,
      //   vendor: item.vendor,
      //   product: item.product,
      // }));

      const capitalize = (str) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
      };
        // Process the data to extract the required fields


      const processedData = (data.data || []).map((item, index) => {
      const typeChar = item.id?.split(":")[2]; // a, o, h
      let type = "";
      if (typeChar === "a") type = "Application";
      else if (typeChar === "o") type = "Operating System";
      else if (typeChar === "h") type = "Hardware";
      else type = "Unknown";

      return {
        id: item.id,
        sno: (page - 1) * pageSize + index + 1,
        vendor: capitalize(item.vendor),
        product: capitalize(item.product),
        type,
      };
    });



      setGridData(processedData);
      // setTotalRowCount(data.total || processedData.length);
      setTotalRowCount(data.total_pages * pageSize);
      setSearchErr("");
    } catch (error) {
      console.error("Error fetching CPE data:", error);
      setGridData([]);
      setSearchErr("Failed to load data.");
    } finally {
      setIsInitialized(true);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e.type === "keydown" && e.key !== "Enter") return;
    setPage(1); // Reset to first page on new search
    fetchCPEData();
  };

  const columns = [
    { field: "sno", headerName: "S.No", width: 80 },
    // { field: "shortId", headerName: "ID", flex: 1 },
    { field: "vendor", headerName: "Vendor", flex: 1 },
    { field: "product", headerName: "Product", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },

  ];

const renderPaginationButtons = () => {
  const totalPages = Math.ceil(totalRowCount / pageSize);
  const visiblePages = 10;
  const currentBlock = Math.floor((page - 1) / visiblePages);
  const startPage = currentBlock * visiblePages + 1;
  const endPage = Math.min(startPage + visiblePages - 1, totalPages);

  const buttons = [];

  for (let i = startPage; i <= endPage; i++) {
    buttons.push(
      <button
        key={i}
        className={`px-3 py-1 rounded ${
          page === i ? "bg-vibrantOrange text-white" : "bg-white text-black"
        }`}
        onClick={() => setPage(i)}
      >
        {i}
      </button>
    );
  }

  return buttons;
};

  const handlePreviousPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalRowCount / pageSize);
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  return (
    <div className="bg-midnightBlue min-h-screen flex flex-col">
      <NewNavbar />
      <div className="bg-[#F5F5F5] p-2 shadow-md w-full">
        <div className="w-full mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="w-full flex flex-col sm:flex-row items-center py-2 gap-2">
            <div className="text-xl sm:text-2xl font-semibold whitespace-nowrap text-center sm:text-left mb-2 sm:mb-0">
              Vendor & Product
            </div>
            <div className="flex flex-row items-center gap-2 w-full sm:flex-grow relative">
              <input
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                onKeyDown={handleSubmit}
                className="w-full sm:w-[200px] lg:w-[600px] sm:flex-grow h-[22px] sm:h-auto text-black px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base border rounded shadow-sm items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search Vendor or Product"
              />
              <div
                onClick={handleSubmit}
                className="flex items-center gap-1 bg-vibrantOrange text-white px-3 py-2 rounded shadow cursor-pointer hover:bg-orange-600 w-[20%] sm:w-auto justify-center transition-colors duration-200"
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
      </div>

      <div className="mt-8 my-4 mx-auto max-w-7xl w-full text-white min-h-screen">
        {loading ? (
          <div className="mx-auto mt-16 animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        ) : isInitialized && searchInput.trim() !== "" ? (
          gridData.length === 0 ? (
            <p className="text-center mt-auto text-white">No data available</p>
          ) : (
            <>
              <DataGrid
                rows={gridData}
                columns={columns}
                pageSize={pageSize}
                rowsPerPageOptions={[10, 25, 50, 100]}
                rowCount={totalRowCount}
                pagination
                paginationMode="server"
                onPageSizeChange={(newPageSize) => {
                  setPageSize(newPageSize);
                  setPage(1);
                }}
                onRowClick={handleRowClick}
                loading={loading}
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
                  "& .MuiDataGrid-footerContainer": {
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
                    backgroundColor: "grey",
                  },
                }}
              />
              <div className="flex justify-center items-center gap-2 sm:gap-2 mt-4 w-full flex-wrap">
  <button
    onClick={handlePreviousPage}
    disabled={page === 1}
    className={`px-2 py-1 sm:px-3 sm:py-1 rounded text-sm sm:text-base ${
      page === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-vibrantOrange text-white hover:bg-orange-600"
    }`}
  >
    Previous
  </button>
  {renderPaginationButtons()}
  <button
    onClick={handleNextPage}
    disabled={page === Math.ceil(totalRowCount / pageSize)}
    className={`px-2 py-1 sm:px-3 sm:py-1 rounded text-sm sm:text-base ${
      page === Math.ceil(totalRowCount / pageSize)
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-vibrantOrange text-white hover:bg-orange-600"
    }`}
  >
    Next
  </button>
</div>
            </>
          )
        ) : null}
      </div>
      <Footer />
    </div>
  );
};

export default CpePage;