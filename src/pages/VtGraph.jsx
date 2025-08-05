
import React, { useEffect, useRef, useState } from "react";
import NewNavbar from "../components/reusable/NewNavbar";
import { Network } from "vis-network/standalone/esm/vis-network";
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "https://api.bluhawkscan.com";

const VtGraph = () => {
  const [searchInput, setSearchInput] = useState("");
  const [selectedOption, setSelectedOption] = useState("IP");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [searchType, setSearchType] = useState(null);
  const [searchErr, setSearchErr] = useState("");
  const [graphError, setGraphError] = useState("");
  const networkRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, content: "", x: 0, y: 0 });
  const [graphData, setGraphData] = useState(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDataHistory, setPageDataHistory] = useState([]);
  const [cursor, setCursor] = useState("");
  const [hasNext, setHasNext] = useState(false);

  const getAccessToken = () => Cookies.get("access_token");

  const patterns = {
    ip: /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/,
    domain: /^(?!:\/\/)([a-zA-Z0-9-]{2,}\.)+[a-zA-Z]{2,}$/,
    label: /^[a-zA-Z0-9][a-zA-Z0-9-_]{0,62}[a-zA-Z0-9]$/,
  };

  const validateInput = (input, type) => {
    if (type === "IP" && patterns.ip.test(input)) return { isValid: true, type: "ip" };
    if (type === "Domain" && patterns.domain.test(input)) return { isValid: true, type: "domain" };
    if (type === "Label" && patterns.label.test(input)) return { isValid: true, type: "label" };
    return { isValid: false, type: null };
  };

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
    setSearchErr("");
    setGraphError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const accessToken = getAccessToken();
    if (!accessToken) {
      setSearchErr("Please log in to continue.");
      return;
    }

    const result = validateInput(searchInput, selectedOption);
    if (!result.isValid) {
      setSearchErr(`Enter a valid ${selectedOption.toLowerCase()}.`);
      return;
    }

    setSearchType(result.type);
    setSearchTrigger((prev) => prev + 1);
    setGraphLoading(true);
    setSearchErr("");
    setGraphError("");
    setNodes([]);
    setEdges([]);
    setGraphData(null);
    setCurrentPage(1);
    setPageDataHistory([]);
    setCursor("");
    setHasNext(false);
  };

  const fetchGraphData = async (cursorVal, pageNumber, limit = 1) => {
    setGraphLoading(true);
    setGraphError("");
    setNodes([]);
    setEdges([]);

    const accessToken = getAccessToken();
    if (!accessToken) {
      setSearchErr("Please log in to continue.");
      setGraphLoading(false);
      return;
    }

    const filterType = searchType === "ip" ? "ip_address" : searchType;
    const cursorParam = cursorVal ? `&cursor=${encodeURIComponent(cursorVal)}` : "";
    const url = `${API_BASE_URL}/graphs/search/?filter_type=${filterType}&query=${encodeURIComponent(searchInput)}&limit=${limit}${cursorParam}`;

    let attempts = 0;
    const maxRetries = 10;
    const retryInterval = 3000;

    const fetchData = async () => {
      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
          timeout: 30000,
        });

        if (response.status === 202) {
          if (attempts < maxRetries) {
            attempts++;
            setTimeout(fetchData, retryInterval);
          } else {
            setGraphError("Request timed out after retries. Try again or use a different query.");
            console.warn(`Timeout after ${maxRetries} retries for ${filterType}: ${searchInput}`);
            setGraphLoading(false);
          }
        } else if (response.status === 200) {
          if (!response.data?.data || !Array.isArray(response.data.data)) {
            setGraphError(`No valid data received for ${selectedOption.toLowerCase()}: ${searchInput}.`);
            console.warn("Invalid API response:", response.data);
            setGraphData([]);
            setGraphLoading(false);
            return;
          }
          const newData = response.data.data;
          if (newData.length === 0 || !newData[0]?.attributes?.nodes?.length) {
            console.warn(`No nodes found for ${filterType}: ${searchInput}`);
          }
          setGraphData(newData);
          setCurrentPage(pageNumber);
          setPageDataHistory((prev) => [
            ...prev.filter((item) => item.page !== pageNumber),
            { page: pageNumber, data: newData, cursor: cursorVal },
          ]);
          const nextCursor = response.data.meta?.cursor || "";
          setCursor(nextCursor);
          setHasNext(!!nextCursor);
          setGraphLoading(false);
        } else {
          setGraphError(`Unexpected response: ${response.status}`);
          setGraphData([]);
          setGraphLoading(false);
        }
      } catch (error) {
        let errorMessage = "Unable to fetch data.";
        if (error.response) {
          const { status, data } = error.response;
          if (status === 401) errorMessage = "Session expired. Please log in.";
          else if (status === 400) errorMessage = `Invalid ${selectedOption.toLowerCase()}: ${data.message || "Check your query."}`;
          else if (status === 404) errorMessage = "Service unavailable.";
          else if (status >= 500) errorMessage = "Server issue. Try again later.";
          else errorMessage = `Error ${status}: ${data.message || "Unknown issue"}`;
        } else if (error.code === "ECONNABORTED") {
          if (limit === 1 && attempts === 0) {
            console.warn(`Timeout for ${filterType}: ${searchInput}, retrying with limit=5`);
            fetchGraphData(cursorVal, pageNumber, 5);
            return;
          }
          errorMessage = "";
        } else if (error.code === "ERR_NETWORK") {
          errorMessage = "Network error. Check your connection.";
        }
        console.warn("API Error:", errorMessage, error);
        setGraphError(errorMessage);
        setGraphData([]);
        setGraphLoading(false);
      }
    };

    fetchData();
  };

  useEffect(() => {
    if (!graphData || !Array.isArray(graphData) || graphData.length === 0) {
      setNodes([]);
      setEdges([]);
      setGraphLoading(false);
      return;
    }

    const graph = graphData[0];
    if (!graph?.attributes) {
      setGraphError(`Invalid data format for ${selectedOption.toLowerCase()}: ${searchInput}.`);
      setNodes([]);
      setEdges([]);
      setGraphLoading(false);
      return;
    }

    const rawNodes = Array.isArray(graph.attributes.nodes) ? graph.attributes.nodes : [];
    const links = Array.isArray(graph.attributes.links) ? graph.attributes.links : [];

    if (rawNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      setGraphLoading(false);
      return;
    }

    const visNodes = rawNodes.map((node) => {
      const label = node.text || (node.entity_id ? node.entity_id.slice(0, 8) + "..." : "Unknown");
      let color = { background: "#1890ff", border: "#40a9ff" };
      if (node.type === "file") color = { background: "#ff4d4f", border: "#ff7875" };
      else if (node.type === "ip_address") color = { background: "#52c41a", border: "#73d13d" };
      else if (node.type === "relationship") color = { background: "#faad14", border: "#ffc107" };
      return {
        id: node.entity_id || `node-${Math.random().toString(36).slice(2)}`,
        label,
        shape: "dot",
        size: 20,
        font: { color: "#ffffff", size: 12 },
        color,
        x: node.x ?? undefined,
        y: node.y ?? undefined,
        data: node,
      };
    });

    const visEdges = links
      .filter((link) => link.source && link.target && rawNodes.some((node) => node.entity_id === link.source) && rawNodes.some((node) => node.entity_id === link.target))
      .map((link) => ({
        from: link.source,
        to: link.target,
        label: link.connection_type || "",
        font: { align: "top", color: "#cccccc", size: 10 },
        color: { color: "#1890ff", highlight: "#40c4ff" },
        arrows: "to",
        width: 1,
        hoverWidth: 2,
      }));

    setNodes(visNodes);
    setEdges(visEdges);
    setGraphLoading(false);
  }, [graphData]);

  useEffect(() => {
    if (searchTrigger > 0 && searchType && getAccessToken()) {
      fetchGraphData("", 1);
    }
  }, [searchTrigger, searchType]);

  useEffect(() => {
    const container = networkRef.current;
    if (!container || nodes.length === 0) return;

    const options = {
      physics: {
        enabled: true,
        solver: "barnesHut",
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 95,
          springConstant: 0.04,
        },
        stabilization: { iterations: 50, updateInterval: 10 },
      },
      nodes: { shape: "dot", scaling: { min: 10, max: 20 } },
      edges: { smooth: { type: "continuous" } },
      interaction: { hover: true, zoomView: true, dragView: true },
    };

    let network;
    try {
      network = new Network(container, { nodes, edges }, options);
      network.on("hoverNode", (params) => {
        const node = nodes.find((n) => n.id === params.node);
        if (node) {
          const content = Object.entries(node.data)
            .filter(([key]) => !["x", "y", "fx", "fy"].includes(key))
            .map(([key, value]) => {
              if (key === "entity_attributes" && value && typeof value === "object") {
                return `<strong>${key}:</strong><br>${Object.entries(value)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join("<br>")}`;
              }
              return `<strong>${key}:</strong> ${value ?? "N/A"}`;
            })
            .join("<br>");
          const canvasPos = network.getPosition(params.node);
          const domPos = network.canvasToDOM(canvasPos);
          const containerRect = container.getBoundingClientRect();
          const x = containerRect.left + domPos.x + 10;
          const y = containerRect.top + domPos.y - 10;
          setTooltip({ visible: true, content, x, y });
        }
      });
      network.on("blurNode", () => setTooltip({ visible: false, content: "", x: 0, y: 0 }));
      network.on("click", (params) => {
        if (params.nodes.length > 0) {
          const node = nodes.find((n) => n.id === params.nodes[0]);
          console.log("Clicked node:", node);
        }
      });
    } catch (error) {
      setGraphError("Unable to render graph.");
      console.warn("Graph Render Error:", error);
    }

    return () => {
      if (network) network.destroy();
    };
  }, [nodes, edges]);

  const handleNext = () => {
    if (hasNext && cursor) {
      fetchGraphData(cursor, currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const prevData = pageDataHistory.find((item) => item.page === prevPage);
      if (prevData) {
        setGraphData(prevData.data);
        setCurrentPage(prevPage);
        const nextPageData = pageDataHistory.find((item) => item.page === prevPage + 1);
        setCursor(nextPageData?.cursor || "");
        setHasNext(!!nextPageData);
      }
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <NewNavbar />
      <main className="flex-1 text-white min-h-screen">
        <div className="bg-white p-2 shadow-lg w-full">
          <div className="w-full mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="w-full flex flex-row py-2 items-center gap-2">
              <div className="text-2xl font-semibold w-full sm:w-[22%] lg:w-[14%] text-center sm:text-left text-black">
                VT Graph
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit(e);
                }}
                className="flex-grow text-black p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search for IP/Domain/Label"
              />
            </div>
            <div className="sm:w-[35%] flex flex-wrap sm:flex-nowrap items-center justify-start sm:justify-end gap-2 mt-2 sm:mt-0">
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="text-black p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="IP">IP</option>
                <option value="Domain">Domain</option>
                <option value="Label">Label</option>
              </select>
              <div
                onClick={handleSubmit}
                className="flex items-center gap-1 bg-orange-500 text-white px-3 py-2 rounded-md cursor-pointer hover:bg-orange-600"
              >
                <button className="focus:outline-none">Search</button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17.65 13.65A7.35 7.35 0 1113.65 3.7 7.35 7.35 0 0117.65 13.65z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {(searchErr || graphError) && (
          <p className="text-red-500 mt-4 text-center">{searchErr || graphError}</p>
        )}

        <div className="py-4 px-4 sm:px-16">
          {searchTrigger === 0 ? (
            <p className="text-gray-400 text-center text-xl">Enter a search query above to view the graph.</p>
          ) : graphLoading ? (
            <div className="w-full h-[600px] bg-gray-800 p-4 flex items-center justify-center rounded-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
          ) : !nodes.length ? (
            <p className="text-gray-400 text-center text-xl">
              No data found for {selectedOption.toLowerCase()}: {searchInput}.
            </p>
          ) : (
            <div className="w-full flex flex-col gap-4">
              <div
                ref={networkRef}
                className="relative w-full h-[700px] bg-gray-800 rounded-xl border border-gray-700 p-6 overflow-hidden"
              >
                {tooltip.visible && (
                  <div
                    className="absolute bg-white/95 text-black p-3 rounded-lg shadow-xl text-sm max-w-sm border border-gray-200 overflow-hidden"
                    style={{ 
                      top: tooltip.y, 
                      left: tooltip.x, 
                      zIndex: 1000, 
                      maxHeight: "300px", 
                      overflowY: "auto", 
                      wordBreak: "break-word", 
                      whiteSpace: "normal" 
                    }}
                    dangerouslySetInnerHTML={{ __html: tooltip.content || "No data" }}
                  />
                )}
              </div>
              
              <div className="relative w-full flex justify-end pr-10 pt-2">
                <div className="bg-/95 rounded-md p-2 text-xs space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-white"><b>URL/DOMAIN/SSL_CERT/COLLECTION/WHO IS</b></span>
                    <div className="w-4 h-4 bg-successGreen rounded-full"></div>
                    <span className="text-white"><b>IP ADDRESS</b></span>
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-white"><b>FILE</b></span>
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-white"><b>RELATIONSHIP</b></span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-xl text-white ${currentPage === 1 ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  Previous
                </button>
                <span className="text-white self-center">Page {currentPage}</span>
                <button
                  onClick={handleNext}
                  disabled={!hasNext}
                  className={`px-4 py-2 rounded-xl text-white ${!hasNext ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VtGraph;