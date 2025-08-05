import React, { useState, useRef, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FaRegCircleCheck } from "react-icons/fa6";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdQuestionMark } from "react-icons/md";
import { FaRegEyeSlash } from "react-icons/fa";
import axios from "axios";
import { CSVLink } from "react-csv";
import Cookies from "js-cookie";
import Footer from "./reusable/Footer";
import Export from "../assets/images/ExportBtn.png";
import Search from "../assets/images/Search.svg";
import NewNavbar from "./reusable/NewNavbar";
import MindMapGraph from "../pages/MindMap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const FindIntel = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const accessToken = Cookies.get("access_token");

  const [searchInput, setSearchInput] = useState("");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [virusTotalTab, setVirusToalTab] = useState("SECURITY POSTURE");
  const [isCertExpanded, setIsCertExpanded] = useState(false);
  const [isDnsExpanded, setIsDnsExpanded] = useState(false);
  const [expandedLibrary, setExpandedLibrary] = useState(null);
  const [searchErr, setSearchErr] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchType, setSearchType] = useState(null);
  const [openPortList, setOpenPortList] = useState(null);
  const [openPortLoading, setOpenPortLoading] = useState(false);
  const [openPortErr, setOpenPortErr] = useState("");
  const [vulnerabilityData, setVulnerabilitydata] = useState(null);
  const [vulnerabilityDataLoading, setVulnerabilityDataLoading] = useState(true);
  const [vulnerabilityDataErr, setVulnerabilityDataErr] = useState("");
  const [subDomainList, setSubDomainList] = useState([]);
  const [subDomainLoading, setSubDomainLoading] = useState(false);
  const [subDomainErr, setSubDomainErr] = useState("");
  const searchIdRef = useRef(0);
  const [graphData, setGraphData] = useState(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState("");
  const [sslReportData, setSslReportData] = useState(null);
  const [sslReportLoading, setSslReportLoading] = useState(false);
  const [sslReportErr, setSslReportErr] = useState("");
  const [expandedEndpoint, setExpandedEndpoint] = useState(null);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [pollingId, setPollingId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const timerRef = useRef(null);

  const patterns = {
    ip: /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/,
    domain: /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,})+$/,
    hash: /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$|^[a-fA-F0-9]{128}$/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  };

  useEffect(() => {
    if (loading) {
      timerRef.current = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 10000);
    } else {
      clearInterval(timerRef.current);
      setLoadingTime(0);
    }

    return () => clearInterval(timerRef.current);
  }, [loading]);

  useEffect(() => {
    return () => {
      if (pollingId) {
        clearTimeout(pollingId);
      }
    };
  }, [pollingId]);

  const isValidDomain = async (domain) => {
    try {
      const response = await axios.get(
        `https://dns.google/resolve?name=${domain}`
      );
      return response.data.Answer !== undefined;
    } catch (error) {
      return false;
    }
  };

  const validateInput = async (input) => {
    for (const [type, regex] of Object.entries(patterns)) {
      if (regex.test(input)) {
        if (type === "domain") {
          const exists = await isValidDomain(input);
          if (!exists) return { isValid: false, type: null };
        }
        return { isValid: true, type };
      }
    }
    return { isValid: false, type: null };
  };

  const fetchGraphDataOnly = async (cursorVal = '', pageNumber = 1) => {
    setGraphLoading(true);
    setGraphError('');
    setGraphData(null);

    const filterType = searchType === 'ip' ? 'ip_address' : searchType === 'url' ? 'domain' : 'domain';
    const cleanQuery = searchInput.replace(/^https?:\/\//, '');
    const cursorParam = cursorVal ? `&cursor=${encodeURIComponent(cursorVal)}` : '';
    const url = `${API_BASE_URL}/graphs/search/?filter_type=${filterType}&query=${encodeURIComponent(
      cleanQuery
    )}&limit=1${cursorParam}`;

    let attempts = 0;
    const maxRetries = 15;
    const retryInterval = 15000;

    const fetchData = async () => {
      try {
        console.log('Fetching graph data:', url);
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
        });

        console.log('API Response:', response.data);
        if (response.status === 202) {
          if (attempts < maxRetries) {
            attempts++;
            console.log(`Retrying (${attempts}/${maxRetries})...`);
            setTimeout(fetchData, retryInterval);
          } else {
            setGraphError('Maximum retry limit reached for graph data');
            setGraphLoading(false);
          }
        } else if (response.status === 200) {
          const newData = response.data.data || [];
          setGraphData(newData);
          setGraphLoading(false);
          setGraphError('');
        }
      } catch (error) {
        console.error('API Error:', error.message, error.response?.data);
        setGraphError(`Error fetching graph data: ${error.message}`);
        setGraphLoading(false);
      }
    };

    fetchData();
  };

  const fetchFullScanData = async (url) => {
    try {
      setLoading(true);
      setVulnerabilityDataLoading(true);
      setSubDomainLoading(true);
      setOpenPortLoading(true);
      setSslReportLoading(true);
      setIsPolling(true);

      const startTime = Date.now();
      const timeoutDuration = 900000;
      const partialTimeout = 600000;

      const checkStatus = async () => {
        const elapsedTime = Date.now() - startTime;
        console.log("Polling attempt, elapsed time:", elapsedTime / 1000, "seconds");

        if (elapsedTime >= timeoutDuration) {
          console.log("Polling timeout reached");
          setSearchErr("Polling timed out after 15 minutes. Please try again.");
          setLoading(false);
          setVulnerabilityDataLoading(false);
          setSubDomainLoading(false);
          setOpenPortLoading(false);
          setSslReportLoading(false);
          setIsPolling(false);
          if (pollingId) {
            clearTimeout(pollingId);
            setPollingId(null);
          }
          return;
        }

        try {
          const response = await axios.get(url, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });
          console.log("API Response Status:", response.status, "Data:", response.data);

          const responseData = response.data.data || response.data || {};

          if (response.status === 206 && elapsedTime >= partialTimeout) {
            console.log("Handling partial content (206) after timeout");
            if (responseData.virus_total?.status === 408) {
              setSearchErr("Server busy for Virus Total data");
              setLoading(false);
            } else if (responseData.virus_total?.result?.data) {
              setData(responseData.virus_total.result.data);
              setLoading(false);
              setSearchErr("");
            } else {
              setLoading(false);
              setSearchErr("No Virus Total data found");
            }

            if (responseData.open_ports?.status === 408) {
              setOpenPortErr("Server busy for open ports");
              setOpenPortLoading(false);
            } else if (responseData.open_ports?.result?.ports) {
              setOpenPortList(responseData.open_ports.result.ports);
              setOpenPortLoading(false);
              setOpenPortErr("");
            } else {
              setOpenPortLoading(false);
              setOpenPortErr("No open ports data found");
            }

            if (responseData.wapiti_report?.status === 408) {
              setVulnerabilityDataErr("Server busy for vulnerabilities");
              setVulnerabilityDataLoading(false);
            } else if (responseData.wapiti_report?.result) {
              setVulnerabilitydata(responseData.wapiti_report.result);
              setVulnerabilityDataLoading(false);
              setVulnerabilityDataErr("");
            } else {
              setVulnerabilityDataLoading(false);
              setVulnerabilityDataErr("No vulnerabilities data found");
            }

            if (responseData.subdomains?.status === 408) {
              setSubDomainErr("Server busy for subdomains");
              setSubDomainLoading(false);
            } else if (responseData.subdomains?.result?.subdomains) {
              setSubDomainList(responseData.subdomains.result.subdomains);
              setSubDomainLoading(false);
              setSubDomainErr("");
            } else {
              setSubDomainLoading(false);
              setSubDomainErr("No subdomains data found");
            }
            setIsPolling(false);
            if (pollingId) {
              clearTimeout(pollingId);
              setPollingId(null);
            }
            console.log("Polling stopped after partial content (206)");
            return;
          }

          if (response.status === 202 || response.status === 206) {
            console.log("Polling in progress, status:", response.status);
            if (responseData.virus_total?.result?.data) {
              setData(responseData.virus_total.result.data);
              setLoading(false);
              setSearchErr("");
            }
            if (responseData.open_ports?.result?.ports) {
              setOpenPortList(responseData.open_ports.result.ports);
              setOpenPortLoading(false);
              setOpenPortErr("");
            }
            if (responseData.wapiti_report?.result) {
              setVulnerabilitydata(responseData.wapiti_report.result);
              setVulnerabilityDataLoading(false);
              setVulnerabilityDataErr("");
            }
            if (responseData.subdomains?.result?.subdomains) {
              setSubDomainList(responseData.subdomains.result.subdomains);
              setSubDomainLoading(false);
              setSubDomainErr("");
            }
            if (responseData.ssl_report) {
              setSslReportData(responseData.ssl_report);
              setSslReportLoading(false);
              setSslReportErr("");
            }

            const id = setTimeout(checkStatus, 5000);
            setPollingId(id);
            console.log("Scheduled next poll with ID:", id);
            return;
          }

          if (response.status === 200) {
            console.log("Final response received (200), updating states...");
            setData(responseData.virus_total?.result?.data || {});
            setOpenPortList(responseData.open_ports?.result?.ports || []);
            setVulnerabilitydata(responseData.wapiti_report?.result || null);
            setSubDomainList(responseData.subdomains?.result?.subdomains || []);
            setSslReportData(responseData.ssl_report || null);

            if (!responseData.virus_total?.result?.data) {
              setSearchErr("No Virus Total data found");
            } else {
              setSearchErr("");
            }
            if (!responseData.open_ports?.result?.ports) {
              setOpenPortErr("No open ports data found");
            } else {
              setOpenPortErr("");
            }
            if (!responseData.wapiti_report?.result) {
              setVulnerabilityDataErr("No vulnerabilities data found");
            } else {
              setVulnerabilityDataErr("");
            }
            if (!responseData.subdomains?.result?.subdomains) {
              setSubDomainErr("No subdomains data found");
            } else {
              setSubDomainErr("");
            }
            if (!responseData.ssl_report) {
              setSslReportErr("No SSL report data found");
            } else {
              setSslReportErr("");
            }

            console.log("Updated States:", {
              data: responseData.virus_total?.result?.data,
              openPortList: responseData.open_ports?.result?.ports,
              vulnerabilityData: responseData.wapiti_report?.result,
              subDomainList: responseData.subdomains?.result?.subdomains,
              sslReportData: responseData.ssl_report,
            });

            setLoading(false);
            setVulnerabilityDataLoading(false);
            setSubDomainLoading(false);
            setOpenPortLoading(false);
            setSslReportLoading(false);
            setIsPolling(false);
            if (pollingId) {
              clearTimeout(pollingId);
              setPollingId(null);
            }
            console.log("Polling stopped after status 200");
            return;
          }
        } catch (error) {
          console.error("Polling error:", error);
          const id = setTimeout(checkStatus, 5000);
          setPollingId(id);
          console.log("Scheduled next poll after error with ID:", id);
        }
      };

      await checkStatus();
    } catch (error) {
      console.error("Error in fetchFullScanData:", error);
      setSearchErr(`Error fetching data: ${error.message}`);
      setOpenPortErr(`Error fetching open ports: ${error.message}`);
      setVulnerabilityDataErr(`Error fetching vulnerabilities: ${error.message}`);
      setSubDomainErr(`Error fetching subdomains: ${error.message}`);
      setSslReportErr(`Error fetching SSL report: ${error.message}`);
      setLoading(false);
      setVulnerabilityDataLoading(false);
      setSubDomainLoading(false);
      setOpenPortLoading(false);
      setSslReportLoading(false);
      setIsPolling(false);
      if (pollingId) {
        clearTimeout(pollingId);
        setPollingId(null);
      }
      console.log("Polling stopped due to error in fetchFullScanData");
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    searchIdRef.current += 1;

    setLoading(true);
    setVulnerabilityDataLoading(true);
    setSubDomainLoading(true);
    setOpenPortLoading(true);
    setSslReportLoading(true);
    setSearchErr("");
    setVulnerabilityDataErr("");
    setSubDomainErr("");
    setOpenPortErr("");
    setSslReportErr("");
    setSslReportData(null);
    setData({});
    setOpenPortList(null);
    setVulnerabilitydata(null);
    setSubDomainList([]);
    setGraphData(null);
    setGraphError("");

    const result = await validateInput(searchInput);

    if (result?.isValid) {
      console.log("search type : ", result.type);

      if (result.type === "domain" || result.type === "url" || result.type === "ip") {
        setVirusToalTab("SECURITY POSTURE");
      } else {
        setVirusToalTab("DETECTION");
      }
      setSearchType(result.type);
      setIsInitialized(true);

      const url = `${API_BASE_URL}/dashboard/FindIntelFullScan/?query=${searchInput}&search_type=${result.type}`;
      await fetchFullScanData(url);
    } else {
      if (result?.type === "domain" && !result.exists) {
        setSearchErr("Domain does not exist. Please enter a valid domain.");
      } else {
        setSearchErr("Invalid input. Please enter a valid IP, domain, or hash.");
      }

      setLoading(false);
      setVulnerabilityDataLoading(false);
      setSubDomainLoading(false);
      setOpenPortLoading(false);
      setSslReportLoading(false);
      setIsInitialized(false);
    }
  };

  const flattenAnalysisResults = (data) => {
    if (!data) return [];

    return Object.entries(data).map(([key, value]) => ({
      "Engine Name": value.engine_name || "N/A",
      "Detection Result": value.result || "N/A",
      Category: value.category || "N/A",
    }));
  };

  const prepareExportData = (analysisResults, virusTotal) => {
    const data = [];
    if (analysisResults && Object.keys(analysisResults).length > 0) {
      Object.entries(analysisResults).forEach(([key, value]) => {
        data.push({ Category: key, Value: JSON.stringify(value) });
      });
    }
    if (virusTotal) {
      if (virusTotal.type !== "file") {
        if (openPortList?.length > 0) {
          data.push({ Category: "Open Ports", Value: openPortList.join(", ") });
        }
        if (virusTotal.attributes?.last_dns_records) {
          virusTotal.attributes.last_dns_records.forEach((record, index) => {
            data.push({
              Category: `DNS Record ${index + 1}`,
              Value: `Type: ${record.type}, TTL: ${record.ttl}, Value: ${record.value}`,
            });
          });
        }
        if (vulnerabilityData?.vulnerabilities) {
          Object.entries(vulnerabilityData.vulnerabilities).forEach(([key, items]) => {
            if (Array.isArray(items) && items.length > 0) {
              items.forEach((item, index) => {
                data.push({
                  Category: `Vulnerability: ${key} ${index + 1}`,
                  Value: JSON.stringify(item),
                });
              });
            }
          });
        }
        if (subDomainList?.length > 0) {
          data.push({ Category: "Subdomains", Value: subDomainList.join(", ") });
        }
        if (sslReportData) {
          data.push({ Category: "SSL Domain", Value: sslReportData.main_domain.domain });
          sslReportData.main_domain.endpoints.forEach((endpoint, index) => {
            data.push({
              Category: `SSL Endpoint ${index + 1}`,
              Value: `IP: ${endpoint.IpAddress}, Grade: ${endpoint.Grade}, Status: ${endpoint.StatusMessage}`,
            });
            data.push({
              Category: `SSL Vulnerabilities ${index + 1}`,
              Value: JSON.stringify(endpoint.Vulnerabilities),
            });
            data.push({
              Category: `SSL Protocols ${index + 1}`,
              Value: endpoint.Protocols.join(", "),
            });
          });
        }
      } else {
        data.push({ Category: "MD5", Value: virusTotal.attributes?.md5 });
        data.push({ Category: "SHA1", Value: virusTotal.attributes?.sha1 });
        data.push({ Category: "SHA-256", Value: virusTotal.attributes?.sha256 });
      }
    }
    return data;
  };

  const exportToCSV = (analysisResults, virusTotal) => {
    const data = prepareExportData(analysisResults, virusTotal);
    const csvData = [
      ["Category", "Value"],
      ...data.map((item) => [item.Category, item.Value]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "analysis_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = (analysisResults, virusTotal) => {
    const data = prepareExportData(analysisResults, virusTotal);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analysis Results");
    XLSX.writeFile(workbook, "analysis_results.xlsx");
  };

  const exportToPDF = (analysisResults, virusTotal) => {
    const data = prepareExportData(analysisResults, virusTotal);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Analysis Results", 10, 10);
    doc.setFontSize(12);
    let yPosition = 20;
    data.forEach((item, index) => {
      doc.text(`${item.Category}: ${item.Value}`, 10, yPosition);
      yPosition += 10;
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 10;
      }
    });
    doc.save("analysis_results.pdf");
  };

  const prepareCSVData = (analysisResults, virusTotal) => {
    if (!analysisResults && !virusTotal) return [];

    let csvData = [];

    csvData.push(["General Details"]);
    csvData.push([
      "ID",
      "Registrar",
      "Creation Date",
      "Country",
      "Size (MB)",
      "Last Analysis Date",
      "Community Score",
    ]);

    csvData.push([
      virusTotal?.id || "N/A",
      virusTotal?.attributes?.registrar || "N/A",
      virusTotal?.attributes?.creation_date
        ? new Date(virusTotal.attributes.creation_date * 1000).toLocaleDateString()
        : "N/A",
      virusTotal?.attributes?.country || "N/A",
      virusTotal?.attributes?.size
        ? (virusTotal.attributes.size / (1024 * 1024)).toFixed(3)
        : "N/A",
      virusTotal?.attributes?.last_analysis_date
        ? new Date(virusTotal.attributes.last_analysis_date * 1000).toLocaleDateString()
        : "N/A",
      virusTotal?.attributes?.reputation || "N/A",
    ]);

    csvData.push([]);

    csvData.push(["Detection Results"]);
    csvData.push(["Engine Name", "Detection Result", "Category"]);
    const flattenedData = flattenAnalysisResults(analysisResults);
    flattenedData.forEach((row) => {
      csvData.push([
        row["Engine Name"],
        row["Detection Result"],
        row["Category"],
      ]);
    });

    csvData.push([]);

    if (virusTotal?.attributes?.categories && Object.keys(virusTotal.attributes.categories).length > 0) {
      csvData.push(["Categories"]);
      csvData.push(["Category", "Description"]);
      Object.entries(virusTotal?.attributes?.categories).forEach(
        ([key, value]) => {
          csvData.push([key, value]);
        }
      );
      csvData.push([]);
    }

    if (virusTotal?.attributes?.popularity_ranks) {
      csvData.push(["Popularity Ranks"]);
      csvData.push(["Engine", "Rank", "Timestamp"]);
      Object.entries(virusTotal?.attributes?.popularity_ranks).forEach(
        ([key, value]) => {
          csvData.push([key, value.rank, value.timestamp]);
        }
      );
      csvData.push([]);
    }

    if (virusTotal?.attributes?.last_dns_records) {
      csvData.push(["Last DNS Records"]);
      csvData.push(["Record Type", "TTL", "Value"]);
      virusTotal?.attributes?.last_dns_records.forEach((record) => {
        csvData.push([record.type, record.ttl, record.value]);
      });
      csvData.push([]);
    }

    if (virusTotal?.attributes?.last_https_certificate) {
      csvData.push(["Last HTTPS Certificate"]);
      csvData.push(["Certificate Data"]);
      csvData.push([
        JSON.stringify(virusTotal?.attributes?.last_https_certificate, null, 2),
      ]);
      csvData.push([]);
    }

    return csvData;
  };

  const virusTotal = data || {};
  const analysisStats = virusTotal?.attributes?.last_analysis_stats;
  const categories = virusTotal?.attributes?.categories;
  const analysisResults = virusTotal?.attributes?.last_analysis_results;
  const jarmData = virusTotal?.attributes?.jarm;
  const whoisData = virusTotal?.attributes?.whois;
  const formattedData = whoisData?.split("\n").map((line) => {
    const [key, ...valueParts] = line.split(":");
    const value = valueParts.join(":").trim();
    return { key: key.trim(), value };
  });
  const names = ["malicious", "suspicious", "undetected", "harmless", "timeout"];

  let filteredAnalysisStats;
  if (analysisStats) {
    filteredAnalysisStats = Object.fromEntries(
      Object.entries(analysisStats).filter(([key]) => names.includes(key))
    );
  }

  const totalStats =
    analysisStats &&
    Object.values(filteredAnalysisStats).reduce((sum, value) => sum + value, 0);

  const chartData = [
    {
      name: "Harmless",
      value: (analysisStats?.harmless ?? 0) + (analysisStats?.undetected ?? 0),
      color: "#3BBA3F",
    },
    {
      name: "Malicious",
      value: (analysisStats?.malicious ?? 0) + (analysisStats?.suspicious ?? 0),
      color: "#FF8042",
    },
    {
      name: "Other",
      value:
        totalStats -
        (analysisStats?.harmless ?? 0) -
        (analysisStats?.undetected ?? 0) -
        (analysisStats?.suspicious ?? 0) -
        (analysisStats?.malicious ?? 0),
      color: "gray",
    },
  ];

  const CustomTooltip = ({ active }) => {
    if (active) {
      const stats = virusTotal?.attributes?.last_analysis_stats;
      const malicious = stats?.malicious ?? 0;
      const total = (stats?.harmless ?? 0) + malicious + (stats?.suspicious ?? 0) + (stats?.undetected ?? 0) + (stats?.timeout ?? 0);
      const maliciousPercent = total > 0 ? (malicious / total) * 100 : 0;
      let riskLevel;
      if (maliciousPercent === 0) {
        riskLevel = "Harmless";
      } else if (maliciousPercent <= 10) {
        riskLevel = "Low risk";
      } else if (maliciousPercent <= 20) {
        riskLevel = "Low-medium risk";
      } else if (maliciousPercent <= 30) {
        riskLevel = "Medium risk";
      } else {
        riskLevel = "High risk";
      }
      return (
        <div className="p-2 bg-white border rounded shadow text-black">
          <p>{riskLevel}</p>
        </div>
      );
    }
    return null;
  };

  const limitedImportList = virusTotal?.attributes?.pe_info?.import_list?.slice(0, 3);
  const allowedTypes = ["Win32 EXE", "executable", "windows", "win32", "pe", "peexe"];
  const aRecord = virusTotal?.attributes?.last_dns_records?.find((item) => item.type === "A");

  const toggleLibrary = (libraryName) => {
    setExpandedLibrary(expandedLibrary === libraryName ? null : libraryName);
  };

  const convertUnixToDate = (unixTimestamp) => {
    if (!unixTimestamp) return "N/A";
    return new Date(unixTimestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="bg-midnightBlue min-h-screen min-w-screen flex flex-col">
      <NewNavbar />
      <main className="flex-1 text-white min-h-screen">
        <div className="bg-[#F5F5F5] p-2 shadow-md w-full">
          <form onSubmit={handleSearch} className="w-full">
            <div className="w-full mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center py-2 gap-2">
              <h1 className="text-black text-xl sm:text-2xl font-semibold whitespace-nowrap text-center sm:text-left mb-2 sm:mb-0">
                Find Intel
              </h1>
               <input
                type="text"
                value={searchInput}
                onChange={(e) => [setSearchInput(e.target.value), setSearchErr("")]}
                placeholder="URL, IP address, domain, or file hash"
                className="w-full sm:w-[200px] sm:flex-grow h-[22px] sm:h-auto text-black px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex flex-row items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <div
                  onClick={handleSearch}
                  className="flex items-center gap-1 bg-vibrantOrange text-white px-3 py-1.5 sm:py-2 rounded shadow cursor-pointer hover:bg-orange-600 w-1/2 sm:w-auto justify-center transition-colors duration-200"
                >
                  <button className="focus:outline-none">Search</button>
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
                {(analysisResults && Object.keys(analysisResults).length > 0) || virusTotal ? (
                  <div className="relative w-1/2 sm:w-auto">
                    <button
                      type="button"
                      className={`flex items-center gap-1 px-3 py-1.5 sm:py-2 rounded shadow cursor-pointer ${
                        (analysisResults && Object.keys(analysisResults).length > 0) || virusTotal
                          ? "bg-vibrantOrange text-white hover:bg-orange-600"
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      } w-full sm:w-auto justify-center transition-colors duration-200`}
                      disabled={!((analysisResults && Object.keys(analysisResults).length > 0) || virusTotal)}
                      onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                    >
                      Export
                      <img src={Export} alt="Export Options" className="h-3 w-3 filter brightness-0 invert" />
                    </button>
                    {isExportDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-700 rounded-lg shadow-lg z-10">
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-orange-500 rounded-t-lg"
                          onClick={() => {
                            exportToCSV(analysisResults, virusTotal);
                            setIsExportDropdownOpen(false);
                          }}
                        >
                          Export as CSV
                        </button>
                        <button
                          type="button"
                          className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-orange-500"
                          onClick={(event) => {
                            event.preventDefault();
                            try {
                              exportToPDF(analysisResults, virusTotal);
                              setIsExportDropdownOpen(false);
                            } catch (error) {
                              console.error("PDF Export Failed:", error);
                            }
                          }}
                        >
                          Export as PDF
                        </button>
                        <button
                          type="button"
                          className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-orange-500 rounded-b-lg"
                          onClick={(event) => {
                            event.preventDefault();
                            exportToExcel(analysisResults, virusTotal);
                            setIsExportDropdownOpen(false);
                          }}
                        >
                          Export as Excel
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </form>
        </div>

        {searchErr && <p className="text-red-500 mt-4 text-center">{searchErr}</p>}

        {isInitialized && (
          <div className="py-4 sm:px-16 px-2">
            <hr className="border-gray-700 my-4" />
            <div className="bg-slateGray text-white rounded-md p-4 flex flex-row gap-4 w-full max-w-full items-start relative min-h-[200px]">
              {loading && (
                <div className="absolute inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-10">
                  <div className="flex flex-col items-center gap-2 text-blue-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-blue-500"></div>
                    <p>Loading...</p>
                  </div>
                </div>
              )}
              {!loading && (
                <>
                  <div className="w-[160px] flex-shrink-0 flex flex-col items-center justify-center relative">
                    {Object.keys(data).length > 0 ? (
                      <>
                        <ResponsiveContainer width={140} height={140}>
                          <PieChart>
                            <Pie
                              data={chartData}
                              dataKey="value"
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={60}
                              startAngle={90}
                              endAngle={450}
                              stroke="none"
                            >
                              {chartData?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-[60px] left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">
                          {analysisStats?.malicious}/{totalStats}
                        </div>
                        <p className="text-center text-xs mt-2 whitespace-nowrap">
                          Community Score {virusTotal?.attributes?.reputation}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 text-center">No data found</p>
                    )}
                  </div>

                  <div className="h-full border-l border-gray-500 mx-2 hidden md:block"></div>

                  <div className="flex-grow flex flex-col text-xs overflow-hidden">
                    <h3 className="text-base font-semibold mb-2 truncate pl-[30px] md:hidden">
                      {virusTotal?.id || "INSTAGRAM.COM"}
                    </h3>

                    <div className="space-y-2 md:hidden mt-4 w-full overflow-x-auto whitespace-nowrap pb-2">
                      {[
                        { label: "IP", value: aRecord?.value },
                        { label: "Registrar", value: virusTotal?.attributes?.registrar },
                        {
                          label: "Creation Date",
                          value: virusTotal?.attributes?.creation_date
                            ? new Date(virusTotal?.attributes?.creation_date * 1000).toLocaleDateString()
                            : "N/A",
                        },
                        {
                          label: "Last Analysis",
                          value: virusTotal?.attributes?.last_analysis_date
                            ? new Date(virusTotal?.attributes?.last_analysis_date * 1000).toLocaleDateString()
                            : "N/A",
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <span className="min-w-[80px]">{item.label}</span>
                          <div className="flex items-center gap-1">
                            <span className="truncate">{item.value || "N/A"}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="hidden md:flex flex-wrap justify-between text-sm pt-4 pb-2">
                      {virusTotal?.type !== "url" ? (
                        <p className="font-semibold sm:text-sm text-xs">{virusTotal?.id}</p>
                      ) : (
                        <p></p>
                      )}

                      {aRecord && (
                        <div className="flex-col border-l px-4 text-xs space-y-2">
                          <label>IP</label>
                          <p>{aRecord ? aRecord.value : "N/A"}</p>
                        </div>
                      )}

                      {virusTotal?.attributes?.registrar && (
                        <div className="flex-col border-l px-4 text-xs space-y-2">
                          <label>Registrar</label>
                          <p>{virusTotal?.attributes?.registrar || "N/A"}</p>
                        </div>
                      )}

                      {virusTotal?.attributes?.creation_date && (
                        <div className="flex-col border-l px-4 text-xs space-y-2">
                          <label>Creation Date</label>
                          <p>
                            {new Date(virusTotal?.attributes?.creation_date * 1000).toLocaleDateString() || "N/A"}
                          </p>
                        </div>
                      )}

                      {virusTotal?.attributes?.country && (
                        <div className="flex-col border-l px-4 text-xs space-y-2">
                          <label>Country</label>
                          <p>{virusTotal?.attributes?.country || "N/A"}</p>
                        </div>
                      )}

                      {virusTotal?.attributes?.size && (
                        <div className="flex-col border-l px-4 text-xs space-y-2">
                          <label>Size</label>
                          <p>
                            {`${(virusTotal?.attributes?.size / (1024 * 1024)).toFixed(3)} MB` || "N/A"}
                          </p>
                        </div>
                      )}

                      {virusTotal?.attributes?.last_analysis_date && (
                        <div className="flex-col border-l px-4 text-xs space-y-2">
                          <label>Last Analysis Date</label>
                          <p>
                            {new Date(virusTotal?.attributes?.last_analysis_date * 1000).toLocaleDateString() ||
                              "N/A"}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 w-full overflow-x-auto whitespace-nowrap pb-2">
                      {categories &&
                        Object.keys(categories).length > 0 &&
                        Object.keys(categories).map((key, ind) => (
                          <span
                            key={ind}
                            className="inline-block text-xs bg-successGreen opacity-90 px-2 py-1 rounded-full text-center mr-2 last:mr-0"
                          >
                            {categories[key]}
                          </span>
                        ))}
                      {virusTotal?.attributes?.tags?.map((item, ind) => (
                        <span
                          key={ind}
                          className="inline-block text-xs bg-successGreen opacity-90 px-2 py-1 rounded-full mr-2 last:mr-0"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6">
              <div className="mb-4 flex border-b border-blue-600 text-white opacity-80 font-semibold text-sm overflow-x-auto">
                {(searchType === "domain" || searchType === "url" || searchType === "ip") && (
                  <div
                    onClick={() => setVirusToalTab("SECURITY POSTURE")}
                    className={`${
                      virusTotalTab === "SECURITY POSTURE" &&
                      "border-b-2 border-blue-400 text-blue-400"
                    } px-6 py-2 hover:text-blue-400 `}
                  >
                    SECURITY POSTURE
                  </div>
                )}

                <div
                  onClick={() => setVirusToalTab("DETECTION")}
                  className={`${
                    virusTotalTab === "DETECTION" &&
                    "border-b-2 border-blue-400 text-blue-400"
                  } px-6 py-2 hover:text-blue-400 `}
                >
                  DETECTION
                </div>
                <div
                  onClick={() => setVirusToalTab("DETAILS")}
                  className={`${
                    virusTotalTab === "DETAILS" &&
                    "border-b-2 border-blue-400 text-blue-400"
                  } px-6 py-2 hover:text-blue-400 `}
                >
                  DETAILS
                </div>
                {(searchType === 'ip' || searchType === 'domain' || searchType === 'url') && (
                  <div
                    onClick={() => {
                      setVirusToalTab('GRAPH');
                      if (searchInput && searchType && accessToken) {
                        fetchGraphDataOnly();
                      }
                    }}
                    className={`${
                      virusTotalTab === 'GRAPH' &&
                      'border-b-2 border-blue-400 text-blue-400'
                    } px-6 py-2 hover:text-blue-400 cursor-pointer`}
                  >
                    GRAPH
                  </div>
                )}
              </div>

              {(searchType === "domain" || searchType === "url" || searchType === "ip") &&
              virusTotalTab === "SECURITY POSTURE" ? (
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-6 text-white font-sans`}
                >
                  <div className="border border-gray-700 p-4 rounded-lg bg-deepNavy w-full min-h-[250px] ">
                    <h2 className="text-lg font-semibold pb-2 mb-2 border-b border-gray-800 ">Open Ports</h2>
                    <div className="relative min-h-[200px] flex items-start">
                      {openPortLoading ? (
                        <div className="absolute inset-0 flex justify-center items-center">
                          <div className="flex flex-col items-center gap-2 text-blue-400">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-blue-500"></div>
                            <p>Loading...</p>
                          </div>
                        </div>
                      ) : openPortErr ? (
                        <p className="text-red-500 text-sm">{openPortErr}</p>
                      ) : openPortList && openPortList?.length > 0 ? (
                        <div className="text-sm p-3 overflow-x-auto flex flex-wrap gap-2">
                          {openPortList?.map((port, index) => (
                            <span
                              key={index}
                              className="text-white bg-successGreen px-4 py-1 rounded-md text-center min-w-[50px] font-mono"
                            >
                              {port}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center">No open ports found</p>
                      )}
                    </div>
                  </div>

                  {searchType !== "ip" && (
                    <div className="border border-gray-700 p-4 rounded-lg bg-deepNavy">
                      <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
                        <h2 className="text-lg font-semibold">DNS Records</h2>
                        <button className="text-sm text-gray-400" onClick={() => setIsDnsExpanded(!isDnsExpanded)}>
                          {isDnsExpanded ? "▼ Collapse" : "▲ Expand"}
                        </button>
                      </div>
                      <div className={`relative min-h-[200px] ${isDnsExpanded ? "max-h-none" : "max-h-48"} overflow-y-auto`}>
                        {loading ? (
                          <div className="absolute inset-0 flex justify-center items-center">
                            <div className="flex flex-col items-center gap-2 text-blue-400">
                              <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-blue-500"></div>
                              <p>Loading...</p>
                            </div>
                          </div>
                        ) : virusTotal?.attributes?.last_dns_records ? (
                          <table className="table-auto w-full text-sm">
                            <thead>
                              <tr className="text-gray-400 border-b border-gray-700">
                                <th className="px-4 py-2 text-left w-1/4">Type</th>
                                <th className="px-4 py-2 text-left w-1/4">TTL</th>
                                <th className="px-4 py-2 text-left w-1/2">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {virusTotal.attributes?.last_dns_records?.map((record, index) => (
                                <tr key={index} className="border-b border-gray-700">
                                  <td className="px-4 py-2">{record.type}</td>
                                  <td className="px-4 py-2">{record.ttl}</td>
                                  <td className="px-4 py-2 break-words">{record.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-sm text-center">No DNS records available</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border border-gray-700 p-4 rounded-lg bg-deepNavy max-h-[600px] overflow-y-auto">
                    <h2 className="text-lg font-semibold border-b border-gray-800 pb-2 mb-2">Vulnerabilities</h2>
                    <div className="relative min-h-[200px]">
                      {vulnerabilityDataLoading ? (
                        <div className="absolute inset-0 flex justify-center items-center">
                          <div className="flex items-center flex-col gap-2 text-blue-400">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-blue-500"></div>
                            <p>Loading...</p>
                          </div>
                        </div>
                      ) : vulnerabilityDataErr ? (
                        <p className="text-red-500 text-sm">{vulnerabilityDataErr}</p>
                      ) : vulnerabilityData?.vulnerabilities ? (
                        <div className="text-sm p-3 rounded-md overflow-x-auto">
                          {Object.entries(vulnerabilityData?.vulnerabilities || {}).map(([key, items]) => (
                            <div key={key} className="mt-4 border-b border-gray-700 pb-2">
                              <h3 className="font-semibold text-md text-yellow-400">{key}</h3>
                              {Array.isArray(items) && items.length > 0 ? (
                                items.map((item, index) => (
                                  <div key={index} className="border-t border-gray-700 py-2 px-2 bg-gray-900 rounded-md">
                                    {Object.entries(item).map(([itemKey, value], i) => (
                                      <p key={i} className="text-sm text-gray-300">
                                        <span className="text-green-400">{itemKey}:</span> {JSON.stringify(value)}
                                      </p>
                                    ))}
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500">None Detected</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-center">No vulnerability data available</p>
                      )}
                    </div>
                  </div>

                  {searchType !== "ip" && (
                    <div className="border border-gray-700 p-4 rounded-lg bg-deepNavy max-h-[600px] overflow-y-auto">
                      <h2 className="text-lg font-semibold border-b border-gray-800 pb-2 mb-2">Subdomains</h2>
                      <div className="relative min-h-[200px]">
                        {subDomainLoading ? (
                          <div className="absolute inset-0 flex justify-center items-center">
                            <div className="flex items-center flex-col gap-2 text-blue-400">
                              <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-blue-500"></div>
                                                        <p>Loading...</p>
                            </div>
                          </div>
                        ) : subDomainErr ? (
                          <p className="text-red-500 text-sm">{subDomainErr}</p>
                        ) : subDomainList && subDomainList.length > 0 ? (
                          <div className="text-sm p-3 rounded-md overflow-x-auto">
                            {subDomainList.map((subdomain, index) => (
                              <p key={index} className="text-yellow-400 py-1">
                                {subdomain}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center">No subdomains found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : virusTotalTab === "DETECTION" ? (
        <>
          <div className="border-t border-b border-gray-700 flex justify-between p-2">
            <p className="text-sm"> Security vendors' analysis</p>
          </div>
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full bg-deepNavy rounded-lg text-left border border-gray-700 ">
              <tbody>
                {analysisResults &&
                  Object.entries(analysisResults).map(
                    ([key, value], index) => (
                      <tr key={index} className="py-4">
                        <td className="px-4 py-2 border-b border-gray-700 ">
                          <span className="text-sm">
                            {value.engine_name}
                          </span>
                        </td>
                        <td className="px-4 py-2 border-b border-gray-700 text-sm">
                          {virusTotal.type != "file" &&
                          value.result === "clean" ? (
                            <div className="flex gap-2 items-center">
                              <FaRegCircleCheck
                                size={16}
                                className="text-green-300"
                              />
                              {value.result}
                            </div>
                          ) : virusTotal.type != "file" &&
                            value.result === "unrated" ? (
                            <div className="flex gap-2 items-center">
                              <MdQuestionMark />
                              <span className="text-gray-300">
                                {value.result}
                              </span>
                            </div>
                          ) : (
                            virusTotal.type != "file" && (
                              <div className="flex gap-2 items-center">
                                <IoMdInformationCircleOutline
                                  size={18}
                                  className="text-yellow-300"
                                />
                                <span className=" text-yellow-300 ">
                                  Suspicious
                                </span>
                              </div>
                            )
                          )}

                          {virusTotal.type === "file" &&
                          value.category === "undetected" ? (
                            <div className="flex gap-2 items-center">
                              <FaRegCircleCheck
                                size={16}
                                className="text-green-300"
                              />
                              {value.category}
                            </div>
                          ) : virusTotal?.type === "file" &&
                            value.category === "malicious" ? (
                            <div className="flex gap-2 items-center text-red-500">
                              <IoMdInformationCircleOutline
                                size={18}
                                className="text-red-500"
                              />
                              {value.result}
                            </div>
                          ) : virusTotal?.type === "file" &&
                            value.category === "type-unsupported" ? (
                            <div className="flex gap-2 items-center">
                              <FaRegEyeSlash />
                              <span className="text-gray-300">
                                Unable to process file type
                              </span>
                            </div>
                          ) : (
                            virusTotal?.type === "file" && (
                              <div className="flex gap-2 items-center">
                                <IoMdInformationCircleOutline
                                  size={18}
                                  className="text-yellow-300"
                                />
                                <span className=" text-yellow-300 ">
                                  Suspicious
                                </span>
                              </div>
                            )
                          )}
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </div>
        </>
      ) : virusTotalTab === "DETAILS" ? (
        <>
          {virusTotal?.type != "file" && (
            <div className="text-white font-sans">
              
              {categories && Object.keys(categories).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-sm border-y border-gray-700 py-2 px-2 mb-2">
                    Categories
                  </h2>
                  <ul className="space-y-2 text-sm px-2">
                    {categories &&
                      Object.entries(categories).map(
                        ([key, value]) => (
                          <li key={key} className="flex">
                            <span className="w-1/6">{key}</span>
                            <span className="flex-grow">{value}</span>
                          </li>
                        )
                      )}
                  </ul>
                </div>
              )}

              {virusTotal?.attributes?.popularity_ranks && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-sm border-y border-gray-700 py-2 px-2 mb-2">
                    Popularity ranks
                  </h2>
                  <div className="bg-deepNavy rounded-md px-2">
                    <div className="flex text-gray-400 font-semibold mb-2">
                      <span className="w-1/6">Position</span>
                      <span className="w-1/6">Rank</span>
                      <span className="w-1/6">Ingestion Time</span>
                    </div>

                    <ul>
                      {Object.entries(
                        virusTotal?.attributes?.popularity_ranks
                      ).map(([key, value]) => (
                        <li key={key} className="flex text-sm">
                          <span className="w-1/6 text-white">
                            {key}
                          </span>
                          <span className="w-1/6 text-gray-300">
                            {value.rank}
                          </span>
                          <span className="w-1/6 text-gray-300">
                            {value.timestamp}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {virusTotal?.attributes?.last_dns_records && (
                <div className="mb-6">
                  <div className="flex justify-between items-center border-y border-gray-700 py-2 px-2">
                    <h2 className="font-semibold text-sm ">
                      Last DNS records
                    </h2>
                    <button
                      className="text-sm text-gray-400 focus:outline-none"
                      onClick={() => setIsDnsExpanded(!isDnsExpanded)}
                    >
                      {isDnsExpanded ? "▼ Collapse" : "▲ Expand"}
                    </button>
                  </div>
                  <div
                    className={`bg-deepNavy rounded-md ${
                      isDnsExpanded
                        ? "max-h-none"
                        : "max-h-64 overflow-y-auto"
                    }`}
                  >
                    <table className="table-auto w-full text-left text-sm">
                      <thead>
                        <tr className="text-gray-400">
                          <th className="px-2 py-2">Record type</th>
                          <th className="px-2 py-2">TTL</th>
                          <th className="px-2 py-2">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {virusTotal?.attributes?.last_dns_records?.map(
                          (record, index) => (
                            <tr key={index}>
                              <td className="px-2 py-2">
                                {record.type}
                              </td>
                              <td className="px-2 py-2">
                                {record.ttl}
                              </td>
                              <td className="px-2 py-2">
                                {record.value}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-sm border-y border-gray-700 py-2 px-2 mb-2">
                  Last HTTP Certificate
                </h2>

                <div className="space-y-4">
                  <div className="mb-6">
                    <h2 className=" font-semibold mb-2 text-sm">
                      Jram Fingerprint
                    </h2>
                    <div className="">
                      <ul className="space-y-2 text-sm">
                        {jarmData &&
                          Object.entries(jarmData).map(
                            ([key, value]) => (
                              <span className="flex-grow" key={key}>
                                {value}
                              </span>
                            )
                          )}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4 border-y border-gray-700 py-2 px-2">
                      <h3 className="font-semibold text-sm">
                        Last HTTPS Certificate
                      </h3>
                      <button
                        className="text-sm text-gray-400 focus:outline-none"
                        onClick={() =>
                          setIsCertExpanded(!isCertExpanded)
                        }
                      >
                        {isCertExpanded ? "▼ Collapse" : "▲ Expand"}
                      </button>
                    </div>
                    <div
                      className={`px-2 ${
                        isCertExpanded
                          ? "max-h-none"
                          : "max-h-64 overflow-y-auto"
                      }`}
                    >
                      <pre className=" whitespace-pre-wrap break-words text-sm">
                        {JSON.stringify(
                          virusTotal?.attributes?.last_https_certificate,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-sm font-semibold my-4 border-y border-gray-700 py-2 px-2 mb-2">
                  Who is Lookup
                </h2>
                <div className=" max-h-64 overflow-y-auto px-2">
                  <table
                    border="1"
                    cellPadding="5"
                    style={{
                      borderCollapse: "collapse",
                      width: "100%",
                    }}
                  >
                    <tbody>
                      {formattedData?.map((item, index) => (
                        <tr key={index}>
                          <td className="text-sm sm:w-1/6">
                            {item.key} :
                          </td>
                          <td className="text-sm ">{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <ul className="space-y-2">
                    {virusTotal?.attributes?.whois
                      ?.split(/\r?\n/)
                      .map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {virusTotal?.type === "file" && (
            <div className="mb-6">
              <div className=" p-4 rounded-md">
                <div className="text-sm font-semibold mb-4 border-y border-gray-700 py-2">
                  Basic Properties
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex ">
                    <span className="w-1/6 font-medium capitalize">
                      md5
                    </span>
                    <span className="flex-grow">
                      {virusTotal?.attributes?.md5}
                    </span>
                  </li>
                  <li className="flex">
                    <span className="w-1/6 font-medium capitalize">
                      SHA1
                    </span>
                    <span className="flex-grow">
                      {virusTotal?.attributes?.sha1}
                    </span>
                  </li>
                  <li className="flex">
                    <span className="w-1/6 font-medium capitalize">
                      SHA-256
                    </span>
                    <span className="flex-grow">
                      {virusTotal?.attributes?.sha256}
                    </span>
                  </li>
                  <li className="flex">
                    <span className="w-1/6 font-medium capitalize">
                      Vhash
                    </span>
                    <span className="flex-grow">
                      {virusTotal?.attributes?.vhash}
                    </span>
                  </li>
                  <li className="flex">
                    <span className="w-1/6 font-medium capitalize">
                      Authentihash
                    </span>
                    <span className="flex-grow">
                      {virusTotal?.attributes?.authentihash}
                    </span>
                  </li>
                  <li className="flex">
                    <span className="w-1/6 font-medium capitalize">
                      Imphash
                    </span>
                    <span className="flex-grow">
                      {virusTotal?.attributes?.pe_info?.imphash}
                    </span>
                  </li>
                  <li className="flex">
                    <span className="w-1/6 font-medium capitalize">
                      SSDEEP
                    </span>
                    <span className="flex-grow">
                      {virusTotal?.attributes?.ssdeep} bytes
                    </span>
                  </li>
                  <li className="flex">
                    <span className="w-1/6 font-medium capitalize">
                      TLSH
                    </span>
                    <span className="flex-grow">
                      {virusTotal?.attributes?.tlsh}
                    </span>
                  </li>
                  <li className="flex">
                    <p className="w-1/6 text-sm font-semibold">
                      File Type
                    </p>
                    <ul className="flex flex-grow flex-wrap space-x-2 text-sm">
                      {virusTotal?.attributes?.trid?.map(
                        (item, idx) => (
                          <li key={idx} className="flex items-center">
                            <span>{item.file_type}</span>
                            {idx !==
                              virusTotal?.attributes?.trid?.length -
                                1 && <span className="px-1">|</span>}
                          </li>
                        )
                      )}
                    </ul>
                  </li>
                  <li className="flex">
                    <span className="w-1/6 font-medium capitalize text-sm">
                      Magic
                    </span>
                    <span className="flex-grow">
                      {virusTotal?.attributes?.magic}{" "}
                    </span>
                  </li>
                  <div className="flex items-center text-sm">
                    <h2 className="w-1/6 text-sm font-semibold ">
                      Trid
                    </h2>
                    <ul className="flex flex-wrap space-x-2 text-sm">
                      {virusTotal?.attributes?.trid?.map(
                        (item, idx, arr) => (
                          <li key={idx} className="flex items-center">
                            <span>
                              {item.file_type} {item.probability}
                            </span>
                            {idx !== arr.length - 1 && (
                              <span className=""> | </span>
                            )}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className="flex items-center">
                    <h2 className="w-1/6 font-semibold text-sm ">
                      DetectItEasy
                    </h2>
                    <ul>
                      <li className="flex space-x-4 text-sm">
                        <span>
                          {
                            virusTotal?.attributes?.detectiteasy
                              ?.filetype
                          }
                        </span>
                        {virusTotal?.attributes?.detectiteasy?.values?.map(
                          (item, idx) => (
                            <span key={idx} className="ml-2">
                              {item.type}: {item.name}{" "}
                              {item.info ? `(${item.info})` : ""}{" "}
                              {item.version
                                ? `\[v${item.version}]`
                                : ""}
                            </span>
                          )
                        )}
                      </li>
                    </ul>
                  </div>
                  <li className="flex">
                    <span className="w-1/6 font-medium capitalize">
                      Magika
                    </span>
                    <span className="flex-grow">
                      {virusTotal?.attributes?.magika}
                    </span>
                  </li>
                  <li className="flex">
                    <span className="w-1/6 font-medium capitalize">
                      file size
                    </span>
                    <span className="flex-grow">
                      {virusTotal?.attributes?.size}
                    </span>
                  </li>
                  <div className="my-4">
                    <div className="text-md mt-8 font-semibold border-y border-gray-700 py-2 mb-1">
                      History
                    </div>
                    <div className=" rounded-md mb-8">
                      <ul className="space-y-2">
                        <li className="flex">
                          <span className="w-1/6 font-medium capitalize">
                            first submission date
                          </span>
                          <span className="flex-grow">
                            {convertUnixToDate(
                              virusTotal?.attributes
                                ?.first_submission_date
                            )}
                          </span>
                        </li>
                        <li className="flex">
                          <span className="w-1/6 font-medium capitalize">
                            Last Submission Date
                          </span>
                          <span className="flex-grow">
                            {convertUnixToDate(
                              virusTotal?.attributes
                                ?.last_submission_date
                            )}
                          </span>
                        </li>
                        <li className="flex">
                          <span className="w-1/6 font-medium capitalize">
                            last_analysis_date
                          </span>
                          <span className="flex-grow">
                            {convertUnixToDate(
                              virusTotal?.attributes
                                ?.last_analysis_date
                            )}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="text-lg font-semibold my-6 border-y border-gray-700 py-2">
                    Portable Executable Info
                  </div>
                  <h2 className="text-lg">Sections</h2>
                  <div className=" rounded-md sm:w-\[90%]">
                    <ul className="flex font-semibold mb-2 ">
                      <li className="w-1/6">Name</li>
                      <li className="w-1/6">Virtual Address</li>
                      <li className="w-1/6">Virtual Size</li>
                      <li className="w-1/6">Raw Size</li>
                      <li className="w-1/6">Entropy</li>
                      <li className="w-2/6">MD5</li>
                      <li className="w-1/6">Chi2</li>
                    </ul>
                    {virusTotal?.attributes?.pe_info?.sections?.map(
                      (section, idx) => (
                        <ul
                          key={idx}
                          className="flex p-1 rounded-md mb-2"
                        >
                          <li className="w-1/6">{section.name}</li>
                          <li className="w-1/6">
                            {section.virtual_address}
                          </li>
                          <li className="w-1/6">
                            {section.virtual_size}
                          </li>
                          <li className="w-1/6">
                            {section.raw_size}
                          </li>
                          <li className="w-1/6">{section.entropy}</li>
                          <li className="w-2/6">{section.md5}</li>
                          <li className="w-1/6">{section.chi2}</li>
                        </ul>
                      )
                    )}
                  </div>
                  <div className="mt-6">
                    <h2 className="text-md font-semibold">Imports</h2>
                    <ul className="space-y-4 py-2">
                      {limitedImportList?.map((library, idx) => (
                        <li key={idx} className="text-sm">
                          <button
                            className="text-xl font-bold text-blue-500"
                            onClick={() =>
                              toggleLibrary(library.library_name)
                            }
                          >
                            {expandedLibrary === library.library_name
                              ? "-"
                              : "+"}
                          </button>
                          <span className="text-sm font-medium px-2">
                            {library.library_name}
                          </span>
                          {expandedLibrary ===
                            library?.library_name && (
                            <ul className="mt-2 ml-4 space-y-1">
                              {library?.imported_functions?.map(
                                (func, funcIdx) => (
                                  <li
                                    key={funcIdx}
                                    className="text-sm"
                                  >
                                    {func}
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mt-4">
                      <h2 className="text-sm font-semibold ">
                        Contained Resources by Type
                      </h2>
                      <ul className="space-y-2 py-2">
                        {virusTotal?.attributes?.pe_info
                            ?.resource_types && Object.entries(
                          virusTotal?.attributes?.pe_info
                            ?.resource_types
                        ).map(([type, count], idx) => (
                          <li key={idx} className="flex">
                            <span className="w-1/3 ">{type}</span>
                            <span className="flex-grow">{count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="my-2">
                      <h2 className="text-sm font-semibold py-2">
                        Contained Resources by Languages
                      </h2>
                      <ul className="space-y-2">
                        {virusTotal?.attributes?.pe_info
                            ?.resource_langs && Object.entries(
                          virusTotal?.attributes?.pe_info
                            ?.resource_langs
                        ).map(([type, count], idx) => (
                          <li key={idx} className="flex">
                            <span className="w-1/3 ">{type}</span>
                            <span className="flex-grow">{count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4">
                      <h2 className="text-sm font-semibold ">
                        Contained Resources
                      </h2>
                      <div className="py-2 rounded-md ">
                        <ul className="flex font-semibold">
                          <li className="w-\[60%]">SHA-256</li>
                          <li className="w-1/6">File Type</li>
                          <li className="w-1/6">Type</li>
                          <li className="w-1/6">Language</li>
                          <li className="w-1/6">Entropy</li>
                          <li className="w-1/6"></li>
                        </ul>
                        {virusTotal?.attributes?.pe_info?.resource_details?.map(
                          (detail, idx) => (
                            <ul
                              key={idx}
                              className="flex p-1 rounded-md mb-2"
                            >
                              <li className="w-\[60%]">
                                {detail.sha256}
                              </li>
                              <li className="w-1/6">
                                {detail.filetype}
                              </li>
                              <li className="w-1/6">{detail.type}</li>
                              <li className="w-1/6">{detail.lang}</li>
                              <li className="w-1/6">
                                {detail.entropy}
                              </li>
                              <li className="w-1/6">{detail.chi2}</li>
                            </ul>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </ul>
              </div>
            </div>
          )}
        </>
      )  : (
                virusTotalTab === "GRAPH" && (searchType === "ip" || searchType === "domain" || searchType === "url") && (
                  <div className="border border-gray-700 p-4 rounded-lg bg-deepNavy min-h-[400px]">
                    
                    <div className="relative min-h-[550px]">
                      {graphLoading ? (
                        <div className="absolute inset-0 flex justify-center items-center">
                          <div className="flex flex-col items-center gap-2 text-blue-400">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                           
                          </div>
                        </div>
                      ) : graphError ? (
                        <p className="text-red-500 text-sm text-center">{graphError}</p>
                      ) : graphData && Array.isArray(graphData) && graphData.length > 0 ? (
                        <>
                          <MindMapGraph
                            searchInput={searchInput}
                            searchType={searchType}
                            accessToken={accessToken}
                            graphData={graphData}
                          />
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 text-center">No graph data found</p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FindIntel;