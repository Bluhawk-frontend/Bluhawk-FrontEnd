import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Footer from "../components/reusable/Footer";
import Cookies from "js-cookie";
import axios from "axios";
import NewNavbar from "../components/reusable/NewNavbar";
const customOrder = [
  "ip", 
  "cpes", 
  "tags", 
  "ports", 
  "vulns", 
  "hostnames",
  "cve_vulns"
];

const Wildcard = () => {
  const retryTimeoutRef = useRef(null);
  const latestQueryRef = useRef("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const accessToken = Cookies.get("access_token");

  const [searchErr, setSearchErr] = useState("");
  const [countryCodeErr, setCountryCodeErr] = useState("");
  const [countries, setCountries] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [data, setData] = useState([]); // For API response data
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSyntax, setShowSyntax] = useState(false);
  const [sourceTypeList, setSourceTypeList] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [Searchoption, setSearchOption] = useState("");
  const [selectedCode, setSelectedCode] = useState("");

  const option = searchParams.get("option");
  const getQueryParam = (param) => {
    const params = new URLSearchParams(location.search);
    return params.get(param);
  };
  const getPlaceholder = () => {
    switch (Searchoption) {
      case "ip-info":
        return "Enter an IP address";
      case "who-is":
        return "Enter a domain name";
      case "username-search":
        return "Enter a username";
      case "phone-number-info":
        return "Enter a phone number";
      case "domain-wayback":
        return "Enter a domain name";
      case "ssl-info":
        return "Enter a domain for SSL info";
      case "scan-for-cve":
        return "Target IP address";
      case "deep-account-search":
        return "Enter target name";
      default:
        return "Search";
    }
  };
  

  useEffect(() => {
    const optionFromUrl = getQueryParam("option");
    setSearchOption(optionFromUrl);
    setSearchInput(""); // ✅ clear input on option change
    setSearchErr(""); // ✅ clear any error
    setCountryCodeErr("");
    setData(null); // optional: clear old data

    if (optionFromUrl) {
      const matchedOption = options.find((opt) => opt.value === optionFromUrl);
      setSelectedOption(matchedOption || null);
    }
  }, [location.search]);


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
 

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,idd");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
  
        const mappedCountries = data
          .filter((country) => country.idd?.root && country.idd?.suffixes?.length > 0)
          .map((country) => ({
            value: `${country.idd.root}${country.idd.suffixes[0]}`,
            label: `${country.name.common} (${country.idd.root}${country.idd.suffixes[0]})`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
  
        setCountries(mappedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setCountryCodeErr("Failed to load country codes. Using fallback options.");
        // Fallback country codes
        const fallbackCountries = [
          { value: "+1", label: "United States (+1)" },
          { value: "+44", label: "United Kingdom (+44)" },
          { value: "+91", label: "India (+91)" },
          { value: "+86", label: "China (+86)" },
          { value: "+33", label: "France (+33)" },
        ];
        setCountries(fallbackCountries);
      }
    };
  
    fetchCountries();
  }, []);

  const options = [
    { value: "deep-account-search", label: "Deep Account Search" },
    { value: "ip-info", label: "IP Info" },
    { value: "who-is", label: "Who Is" },
    { value: "username-search", label: "UserName" },
    { value: "phone-number-info", label: "Phone Number Info" },
    { value: "domain-wayback", label: "Domain Way Back" },
    { value: "ssl-info", label: "SSL Info" },
    { value: "scan-for-cve", label: "Scan For CVE" },
  ];

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const fetchData = async (query, retryCount = 0) => {
    if (!query) return;
    // Cancel previous retry if new query is fired
    latestQueryRef.current = query;
    setSearchErr("");
    setCountryCodeErr("");
    setLoading(true);
    try {
      let url = "";
      if (Searchoption === "domain-wayback") {
        url = `${API_BASE_URL}/wildcard_intel/get_wayback?query=${query}`;
      } else if (Searchoption === "username-search") {
        url = `${API_BASE_URL}/wildcard_intel/get_username?query=${query}`;
      } else if (Searchoption === "phone-number-info") {
        url = `${API_BASE_URL}/wildcard_intel/get_phone_info?query=%2B${selectedCode?.value?.slice(1)+query}`;
      } else if (Searchoption === "ssl-info") {
        url = `${API_BASE_URL}/wildcard_intel/get_ssl_info?query=${query}`;
      } else if (Searchoption === "who-is") {
        url = `${API_BASE_URL}/wildcard_intel/get_who_is?query=${query}`;
      } else if (Searchoption === "ip-info") {
        url = `${API_BASE_URL}/wildcard_intel/get_ip_info?query=${query}`;
      } else if (Searchoption === "deep-account-search") {
        url = `${API_BASE_URL}/wildcard_intel/get_deep_account?query=${query}`;
      } else if (Searchoption === "scan-for-cve") {
        url = `${API_BASE_URL}/wildcard_intel/get_nrich?query=${query}`;
      } else {
        setSearchErr("Please select a valid option from the dropdown.");
        setLoading(false);
        return;
      }

      console.log("API URL:", url);

      const response = await axios.get(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("status", response.status);

      if (response.status == 202) {
        if (retryCount < 10) {
          console.log("api retry count ", retryCount);
          retryTimeoutRef.current = setTimeout(() => {
            if (latestQueryRef.current === query && searchInput !== "") {
              console.log("search input...", searchInput);
              fetchData(query, retryCount + 1);
            }
          }, 9000);
        } else {
          setSearchErr(
            "Processing is taking too long. Please try again later."
          );
          setData([]);
          setLoading(false);
          setCountryCodeErr("");
        }
        return;
      }

      if (response.status === 200) {
        setData(response.data.data);
        setLoading(false);
      } else {
        throw new Error("Unexpected response");
      }
      console.log("WildCard-intel API Response:", response?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSearchErr("Failed to fetch data. Please try again.");
      setData([]);
      setLoading(false);
      setCountryCodeErr("");
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setSearchErr("Session expired or unauthorized. Please login again.");
        Cookies.remove("refresh_token");
        Cookies.remove("access_token");
        localStorage.clear();
        navigate("/login"); // Redirect to login page
        return;
      }
    }
  };


  const handleInputChange = (e) => {
    setSearchErr("");
    setSearchInput(e.target.value);
    // Clear timeout if user types while retry is scheduled
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  const handleSubmit = async (event) => {
    if (event.type === "keydown" && event.key !== "Enter") return;
    event.preventDefault();

    if (option === "phone-number-info" && !selectedCode) {
      setCountryCodeErr("select country code.");
      return;
    }

    if (!searchInput.trim()) {
      setSearchErr("Please enter a search query");
      return;
    }

    setIsInitialized(true);
    fetchData(searchInput); // Explicit API call here
   
  };
  const handleCodeChange = (selectedOption) => {
    setSelectedCode(selectedOption);
    setCountryCodeErr("");
  };

  const handleSelectChange = (selectedOption) => {
    // Clear any ongoing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Invalidate the previous query so the retry logic does not continue
    latestQueryRef.current = null;
    setSelectedOption(selectedOption);
    setSearchInput(""); // Clear the search input when a new option is selected
    setSearchErr(""); // Clear any error message

    setData(null); // Clear old data
    setIsInitialized(false); // Reset initialization state
    setLoading(false); // Reset loading state
    navigate(`/wildcard-intel?option=${selectedOption.value}`);
  };

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    // Implement the search functionality based on searchInput and selectedOption
    console.log("Searching for:", searchInput, "in category:", selectedOption);
    // Add your search logic here
  };

  return (
    <div className="bg-[#0A1229] min-h-screen min-w-screen flex flex-col">
      <NewNavbar />
      <main className="flex-1 text-black min-h-screen">
      <div className="bg-[#F5F5F5] p-2 shadow-md w-full">
  
    <div className="w-full mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center px-6 py-2 gap-2">
      {/* Title */}
      <div className="text-black text-xl sm:text-2xl font-semibold whitespace-nowrap text-center sm:text-left mb-2 sm:mb-0">
        Wildcard-Intel
      </div>

      {/* Input Group */}
      <div className="w-full flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-2 sm:gap-4 flex-grow">
        {/* Country Code (only for phone-number-info) */}
        {option === "phone-number-info" && (
          <Select
            options={countries}
            value={selectedCode}
            onChange={handleCodeChange}
            placeholder="Country Code"
            isSearchable
            className="dropdown w-full sm:w-[272px] whitespace-nowrap"
          />
        )}

        {/* Search Input */}
        <input
          type="text"
          value={searchInput}
          onChange={handleInputChange}
          onKeyDown={handleSubmit}
          className="text-black p-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          placeholder={getPlaceholder()}
        />

        {/* Category Selector and Search Button */}
        <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
          <Select
            options={options}
            value={selectedOption}
            onChange={handleSelectChange}
            placeholder="Select a category"
            isSearchable
            className="dropdown w-[80%] sm:w-[200px]"
          />
          <div
            onClick={handleSubmit}
            className="flex items-center justify-center gap-1 bg-vibrantOrange text-white px-3 py-2 rounded shadow cursor-pointer hover:bg-orange-600 w-[20%] sm:w-auto transition-colors duration-200"
          >
            <button className="focus:outline-none text-sm">Search</button>
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
          </div>
        </div>
      </div>
    </div>
  

  <div className="ml-4 sm:ml-48 flex flex-col sm:flex-row gap-4 sm:gap-18">
    {countryCodeErr ? (
      <p className="text-center text-sm text-red-500">{countryCodeErr}</p>
    ) : (
      <p className=""></p>
    )}
    {searchErr ? (
      <p className="text-center text-sm text-red-500">{searchErr}</p>
    ) : (
      <p className=""></p>
    )}
  </div>
</div>

        {loading ? (
          <div className="mx-auto mt-16 animate-spin rounded-full h-12 w-12 border-t-4 border-blue-400 text-white"></div>
        ) : isInitialized && data?.length === 0 && searchErr === "" ? ( // Show message only after initialization
          <p className="text-center mt-16 text-white">No data available</p>
        ) : data && Object.entries(data).length > 0 ? (
          <div className=" py-8 px-4 mb-4 w-[100%]">
            {(option === "who-is" || option === "ssl-info") && (
              <div className="space-y-2">
                {data &&
                  Object.entries(data.json_data).map(([key, value]) => {
                    let displayValue = value;

                    // Try to handle datetime array strings
                    if (
                      typeof value === "string" &&
                      value.includes("datetime.datetime")
                    ) {
                      // Extract the first datetime inside the string
                      const match = value.match(
                        /datetime\.datetime\(([^)]+)\)/
                      );
                      if (match && match[1]) {
                        const parts = match[1].split(",").map((p) => p.trim());
                        const year = parseInt(parts[0]);
                        const month = parseInt(parts[1]) - 1; // JS months are 0-based
                        const day = parseInt(parts[2]);
                        const hour = parseInt(parts[3]);
                        const minute = parseInt(parts[4]);
                        const second = parseInt(parts[5]);

                        const dateObj = new Date(
                          Date.UTC(year, month, day, hour, minute, second)
                        );
                        displayValue = dateObj.toLocaleString(); // or `.toLocaleDateString()` if you want date only
                      }
                    }


                    return (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-center border-b py-2 "
                      >
                        <span className="sm:w-[20%] font-medium text-gray-700 capitalize text-white">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="sm:w-[80%] text-gray-900 break-all text-white">
                          {Array.isArray(displayValue)
                            ? displayValue.slice(0, 1).map((v, idx) => (
                                <span key={idx} className="block">
                                  {v.toString()}
                                </span>
                              ))
                            : displayValue?.toString()}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}

            {option === "domain-wayback" && (
              <div className="mx-8 border border-gray-700">
                {data &&
                  Object.entries(data.json_data).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:items-start border-b py-2"
                    >
                      <span className="sm:w-[20%] font-medium text-gray-700 capitalize text-white">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="sm:w-[80%] text-white space-y-1 break-all">
                        {Array.isArray(value) ? (
                          value.map((item, idx) =>
                            typeof item === "object" && item !== null ? (
                              <div
                                key={idx}
                                className="pl-2 border-l border-gray-600 space-y-0.5"
                              >
                                {Object.entries(item).map(
                                  ([innerKey, innerValue]) => (
                                    <div key={innerKey}>
                                      <span className="font-semibold">
                                        {innerKey.replace(/_/g, " ")}:
                                      </span>{" "}
                                      <span className="text-gray-300">
                                        {innerValue?.toString()}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <div key={idx}>{item.toString()}</div>
                            )
                          )
                        ) : (
                          <span className="text-gray-300">
                            {value?.toString()}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {option === "ip-info" && (
              <div className="mx-8 border border-gray-700">
                {data &&
                  Object.entries(data.json_data).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:items-center border-b py-2"
                    >
                      <span className="sm:w-[20%] font-medium text-gray-700 capitalize text-white">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="sm:w-[80%] text-gray-900 break-all text-white">
                        {Array.isArray(value)
                          ? value.map((v, idx) => (
                              <span key={idx} className="block">
                                {v.toString()}
                              </span>
                            ))
                          : value?.toString()}
                      </span>
                    </div>
                  ))}
              </div>
            )}
              {option === "scan-for-cve" && (
                <div>
                  {data && Array.isArray(data.json_data) && (
                    <>
                      <div className="mx-auto max-w-7xl px-6 py-4 border border-gray-700 rounded-lg mb-6">
                        {customOrder.slice(0, 6).map((key) => {
                          const value = data.json_data[0]?.[key];
                          if (value === undefined) return null;

                          const displayNames = {
                            ip: "IP",
                            cpes: "Cpes",
                            tags: "Tags",
                            ports: "Ports",
                            vulns: "Vulnerabilities",
                            hostnames: "Host Names",
                          };

                          return (
                            <div
                              key={key}
                              className="flex flex-col sm:flex-row sm:items-start border-b border-gray-700 py-2 last:border-b-0"
                            >
                              <span className="sm:w-[20%] font-medium capitalize text-white">
                                {displayNames[key] || key.replace(/_/g, " ")}
                              </span>
                              <span className="sm:w-[80%] break-all text-white">
                                {Array.isArray(value) && value.length > 0 ? (
                                  value.map((v, idx) => (
                                    <span key={idx} className="block">
                                      {v.toString()}
                                    </span>
                                  ))
                                ) : Array.isArray(value) && value.length === 0 ? (
                                  <span className="italic text-gray-400">None</span>
                                ) : typeof value === "object" && value !== null ? (
                                  <pre className="whitespace-pre-wrap break-words bg-gray-900 p-2 rounded">
                                    {JSON.stringify(value, null, 2).replace(/^{\n|}$/g, "").trim()}
                                  </pre>
                                ) : (
                                  value?.toString()
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="">
                        {customOrder.slice(6, 7).map((key) => {
                          const value = data.json_data[0]?.[key];
                          if (value === undefined) return null;

                          return (
                            <div
                              key={key}
                              className="flex flex-col sm:flex-row sm:items-start border-b border-gray-700 py-2 last:border-b-0"
                            >
                              <span className="w-full text-white">
                                {Array.isArray(value) && value.length > 0 ? (
                                  value.map((v, idx) => (
                                    <span key={idx} className="block">
                                      {v.toString()}
                                    </span>
                                  ))
                                ) : Array.isArray(value) && value.length === 0 ? (
                                  <span className="italic text-gray-400">None</span>
                                ) : typeof value === "object" && value !== null ? (
                                  <pre>
                                    {typeof value === "object" && value !== null ? (
                                      Object.entries(value).map(([cveKey, cveData]) => {
                                        const metadata = cveData?.cveMetadata;
                                        const description = cveData?.containers?.cna?.descriptions?.[0]?.value || "No description available";
                                        const references =
                                          cveData?.containers?.cna?.references?.map((ref) => ref.url) || [];

                                        return (
                                          <div
                                            key={cveKey}
                                            className="mx-auto max-w-7xl px-6 py-4 border border-gray-700 rounded-lg mb-6"
                                          >
                                            <span className="font-semibold text-vibrantOrange block text-3xl mb-4">
                                              {cveKey}
                                            </span>

                                            <p className="text-white mb-3 whitespace-pre-wrap break-words w-full">{description}</p>

                                            <div className="text-sm text-gray-400 mb-3 space-y-1">
                                              <div>
                                                <span className="font-medium text-gray-400">Date Updated:</span>{" "}
                                                {metadata?.dateUpdated
                                                  ? new Date(metadata.dateUpdated).toLocaleString(undefined, {
                                                      year: "numeric",
                                                      month: "long",
                                                      day: "numeric",
                                                      hour: "numeric",
                                                      minute: "2-digit",
                                                      hour12: false,
                                                    })
                                                  : "N/A"}
                                              </div>
                                              <div className="mb-4">
                                                <span className="font-medium text-gray-400">Date Published:</span>{" "}
                                                {metadata?.datePublished
                                                  ? new Date(metadata.datePublished).toLocaleString(undefined, {
                                                      year: "numeric",
                                                      month: "long",
                                                      day: "numeric",
                                                      hour: "numeric",
                                                      minute: "2-digit",
                                                      hour12: false,
                                                    })
                                                  : "N/A"}
                                              </div>
                                            </div>
                                            <div className="text-sm text-white">
                                              <span className="text-white text-[1.25rem] block mb-3 whitespace-pre-wrap break-words w-full">References:</span>
                                              <ul className="list-disc list-inside space-y-1">
                                                {references.length > 0 ? (
                                                  references.map((url, idx) => (
                                                    <li key={idx}>
                                                      <a
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:underline break-words"
                                                      >
                                                        {url}
                                                      </a>
                                                    </li>
                                                  ))
                                                ) : (
                                                  <li className="italic text-gray-400">No references available</li>
                                                )}
                                              </ul>
                                            </div>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      value?.toString()
                                    )}
                                  </pre>
                                  
                                ) : (
                                  value?.toString()
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            {option === "phone-number-info" && (
              <div className="mx-8 border border-gray-700">
                {data &&
                  Object.entries(data.json_data).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:items-center border-b py-2"
                    >
                      <span className="sm:w-[20%] font-medium text-gray-700 capitalize text-white">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="sm:w-[80%] text-gray-900 break-all text-white">
                        {Array.isArray(value)
                          ? value.map((v, idx) => (
                              <span key={idx} className="block">
                                {v.toString()}
                              </span>
                            ))
                          : value?.toString()}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {option === "username-search" && (
              <div className="h-[800px] overflow-auto w-[100%]">
                {data?.json_data?.found_sites?.map((site, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center border-b py-2"
                  >
                    <span className="sm:w-[20%] font-medium text-gray-700 capitalize text-white">
                      {site.site_name}
                    </span>
                    <span className="sm:w-[80%] text-gray-900 break-all text-white">
                      <a
                        href={site.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className=" text-blue-400 hover:text-blue-600"
                      >
                        {site.profile_url}
                      </a>
                    </span>
                  </div>
                ))}
              </div>
            )}
            {option === "deep-account-search" && (
              <div className="h-[800px] overflow-auto w-[100%] ">
                {data?.json_data?.results?.map((site, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center border-b py-2"
                  >
                    <span className="sm:w-[20%] font-medium text-gray-700 capitalize text-white">
                      {site.status}
                    </span>
                    <span className="sm:w-[20%] font-medium text-gray-700 capitalize text-white">
                      {site.code}
                    </span>
                    <span className="sm:w-[80%] text-gray-900 break-all text-white">
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className=" text-blue-400 hover:text-blue-600"
                      >
                        {site.url}
                      </a>
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        ) : (
          <p> </p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wildcard;