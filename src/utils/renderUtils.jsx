
import React, { useState } from 'react';
import { getCvssBarColor } from './cvssUtils';
import CVSSGauge from '../components/CVSSGauge';

// Shared utilities
const recordTypeColors = {
  A: "text-blue-400",
  MX: "text-green-400",
  NS: "text-purple-400",
  TXT: "text-yellow-400",
  AAAA: "text-pink-400",
  CNAME: "text-teal-400",
};

const valueColors = {
  Fail: "text-red-400 font-semibold",
  C: "text-red-400 font-semibold",
  B: "text-yellow-400 font-semibold",
  Yes: "text-green-400",
  No: "text-red-400",
  Pass: "text-green-400",
};

const keyMap = {
  ip_address: "IP Address",
  ssl_records: "SSL Records",
  dns_records: "DNS Records",
  cve_and_vulnerabilities: "Cve And Vulnerabilities",
};

const sectionMap = {
  "IP ADDRESSES": "technology-vulnerabilities-section",
  "SSL RECORDS": "ssl-analysis-section",
  "DNS RECORDS": "dns-records-section",
  "PORTS": "open-ports-section",
  "SUBDOMAINS": "subdomains-section",
  "ACTIVE SUBDOMAINS": "active-subdomains-section",
  "CVES": "technology-vulnerabilities-section",
  "EMAIL HYGIENE": "corporate-email-risk-assessment-section",
  "WHOIS": "whois-information-section",
  "VULNERABILITIES": "web-application-vulnerability-details-section",
  "TECHNOLOGIES": "technology-vulnerabilities-section",
};

export const renderTable = (headers, rows, title, isLoading, isProcessing, isHeadingInside = false, { columnWidths } = {}) => {
  const defaultWidths = [headers.length > 0 ? "50%" : "auto"];
  for (let i = 1; i < headers.length; i++) {
    defaultWidths.push(columnWidths?.[i] || `${50 / (headers.length - 1)}%`);
  }
  const finalWidths = columnWidths || defaultWidths;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-10 rounded-2xl shadow-2xl transition-all duration-500 animate-fade-in mb-10">
      {(isLoading || (isProcessing && rows.length === 0)) && (
        <div className="flex flex-col items-center justify-center h-[200px] space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      )}
      {!(isLoading || (isProcessing && rows.length === 0)) && (
        <>
          {!isHeadingInside && (
            <h2 className="text-2xl font-bold mb-4 text-white pl-4">{title}</h2>
          )}
          {isHeadingInside && (
            <h2 className="text-lg font-bold mb-4 text-white">{title}</h2>
          )}
          {rows.length === 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-white">
                <thead>
                  <tr className="bg-blue-800/30 rounded-lg">
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-4 font-semibold text-sm text-cyan-200 uppercase tracking-widest text-left"
                        style={{ minWidth: "150px", width: finalWidths[index] }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-800/20">
                    {headers.map((_, index) => (
                      <td
                        key={index}
                        className="px-6 py-4 text-sm text-gray-100 text-left"
                        style={{ minWidth: "150px", width: finalWidths[index] }}
                      >
                        N/A
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-white">
                <thead>
                  <tr className="bg-blue-800/30 rounded-lg">
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-4 font-semibold text-sm text-cyan-200 uppercase tracking-widest text-left"
                        style={{ minWidth: "150px", width: finalWidths[index] }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`border-b border-blue-700/30 transition-all duration-300 ${
                        rowIndex % 2 === 0 ? "bg-gray-800/20" : "bg-blue-900/20"
                      }`}
                    >
                      {row.map((cell, cellIndex) => {
                        const isDNSRecordType =
                          title.includes("Record") && headers[cellIndex] === "Record Type";
                        const isSpecialValue = valueColors.hasOwnProperty(cell);
                        const displayValue =
                          cell === null || cell === undefined || cell === "" ? "N/A" : cell;
                        const textColor = isDNSRecordType
                          ? recordTypeColors[cell] || "text-gray-100"
                          : isSpecialValue
                          ? valueColors[cell]
                          : "text-gray-100";

                        return (
                          <td
                            key={cellIndex}
                            className={`px-6 py-4 text-sm ${textColor} text-left relative group`}
                            style={{ minWidth: "150px", width: finalWidths[cellIndex] }}
                          >
                            <span>{displayValue}</span>
                            {(cell === "Fail" || cell === "C" || cell === "B") && (
                              <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-md py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                                {cell === "Fail" || cell === "C" ? "Critical" : "Warning"}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const renderAssetsDiscovered = (data, isLoading, isProcessing) => {
  const assetsRows = data?.summary
    ? Object.entries(data.summary || {}).map(([key, value]) => {
        const cleanKey = key.replace(/^NUM_/i, "");
        const displayKey = keyMap[cleanKey] || cleanKey.replace(/_/g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        const displayValue = value === null || value === undefined || value === "" ? "N/A" : value;
        return [displayKey.toUpperCase(), displayValue];
      })
    : [];

  const emailHygieneRows = data?.email_hygiene
    ? Object.values(data.email_hygiene || {}).map(({ Name, Result }) => [
        Name === null || Name === undefined || Name === "" ? "N/A" : Name,
        <button
          className={`px-3 py-1 rounded ${
            Result === "Pass" ? "bg-green-500 text-white" : Result === "Fail" ? "bg-red-500 text-white" : "bg-gray-500 text-white"
          }`}
          disabled
        >
          {Result === null || Result === undefined || Result === "" ? "N/A" : Result}
        </button>,
      ])
    : [];

  return (
    <div className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-extrabold mb-4 text-white pl-4">Assets Discovered</h2>
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-4 md:p-6 rounded-2xl shadow-2xl transition-all duration-500 animate-fade-in h-[240px] w-full border border-blue-800/50 flex flex-col">
            {(isLoading || (isProcessing && !data?.summary)) && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
                <p className="text-white text-lg font-medium">Loading...</p>
              </div>
            )}
            {!(isLoading || (isProcessing && !data?.summary)) && (
              <div className="flex flex-wrap gap-4">
                {assetsRows.map(([key, value], index) => (
                  <div
                    key={index}
                    className="bg-blue-800/30 p-2 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer shadow-md flex-1 min-w-[100px] max-w-[150px] basis-[calc(33.33%-1rem)]"
                    onClick={(event) => {
                      event.stopPropagation();
                      const sectionId =
                        sectionMap[key] || key.toLowerCase().replace(/\s/g, "-") + "-section";
                      const section = document.getElementById(sectionId);
                      if (section) {
                        section.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    <p className="text-xs text-cyan-200 text-left truncate">{key}</p>
                    <p
                      className={`text-sm font-bold text-left truncate ${
                        (key.trim().toUpperCase() === "CVES" ||
                          key.trim().toUpperCase() === "VULNERABILITIES") &&
                        (
                          (key.trim().toUpperCase() === "VULNERABILITIES" &&
                            Object.keys(data?.vulnerability_descriptions || {}).length > 0) ||
                          parseInt(value) > 0
                        )
                          ? "text-red-500"
                          : "text-white"
                      }`}
                    >
                      {key.trim().toUpperCase() === "VULNERABILITIES"
                        ? Object.keys(data?.vulnerability_descriptions || {}).length
                        : value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-2xl font-extrabold mb-4 text-white pl-4">Email Hygiene Overview</h2>
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-4 md:p-6 rounded-2xl shadow-2xl transition-all duration-500 animate-fade-in h-[240px] w-full border border-blue-800/50 flex flex-col justify-between">
            {(isLoading || (isProcessing && !data?.email_hygiene)) && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
                <p className="text-white text-lg font-medium">Loading...</p>
              </div>
            )}
            {!(isLoading || (isProcessing && !data?.email_hygiene)) && (
              <table className="min-w-full text-left text-white table-fixed">
                <thead>
                  <tr className="bg-blue-800/30 rounded-lg">
                    <th
                      className="px-6 py-4 font-semibold text-xs text-cyan-200 uppercase tracking-widest text-left truncate"
                      style={{ width: "50%" }}
                    >
                      Name
                    </th>
                    <th
                      className="px-6 py-4 font-semibold text-xs text-cyan-200 uppercase tracking-widest text-left truncate"
                      style={{ width: "50%" }}
                    >
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {emailHygieneRows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`border-b border-blue-700/30 transition-all duration-300 ${
                        rowIndex % 2 === 0 ? "bg-gray-800/20" : "bg-blue-900/20"
                      }`}
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-2 text-xs text-gray-100 text-left truncate"
                          style={{ width: "50%" }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const EmailChecklists = ({ data, isLoading, isProcessing }) => {
  const [expandedRowKey, setExpandedRowKey] = useState(null);

  const checklists = {};
  if (data?.email_hygiene) {
    Object.entries(data.email_hygiene || {}).forEach(([key, value]) => {
      const name = value.Name || "N/A";
      if (!checklists[name]) checklists[name] = { rows: [] };
      checklists[name].rows.push({
        key,
        description: value.Description || "N/A",
        result: value.Result || "N/A",
        records: value.Records || [],
      });
    });
  }

  const handleRowClick = (key) => {
    setExpandedRowKey((prev) => (prev === key ? null : key));
  };

  return (
    <div id="corporate-email-risk-assessment-section" className="mb-10">
      <h2 className="text-2xl font-bold mb-4 text-white pl-4">
        Corporate Email Risk Assessment
      </h2>
      {(isLoading || (isProcessing && !data?.email_hygiene)) && (
        <div className="flex flex-col items-center justify-center h-[200px] space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      )}
      {!(isLoading || (isProcessing && !data?.email_hygiene)) && (
        <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-10 rounded-2xl shadow-2xl transition-all duration-500 animate-fade-in">
          {Object.entries(checklists).map(([name, { rows }]) => (
            <div key={name} className="mb-10">
              <h3 className="text-lg font-semibold text-white mb-2 pl-1">{name} Checklist</h3>
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-blue-900 text-blue-200 text-left text-sm">
                    <th className="px-4 py-2 w-[70%]">Description</th>
                    <th className="px-4 py-2 w-[30%]">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <React.Fragment key={row.key}>
                      <tr
                        className="hover:bg-blue-800 cursor-pointer text-white transition border-b border-blue-800"
                        onClick={() => handleRowClick(row.key)}
                      >
                        <td className="px-4 py-2">{row.description}</td>
                        <td className="px-4 py-2">
                          <button
                            className={`px-3 py-1 rounded ${
                              row.result === "Pass"
                                ? "bg-green-500"
                                : row.result === "Fail"
                                ? "bg-red-500"
                                : "bg-gray-500"
                            } text-white`}
                            disabled
                          >
                            {row.result}
                          </button>
                        </td>
                      </tr>
                      {expandedRowKey === row.key && row.records.length > 0 && (
                        <tr>
                          <td colSpan={2} className="bg-blue-950 px-4 py-3 text-white rounded-b-xl">
                            <strong className="block mb-2 text-blue-300">Records:</strong>
                            <ul className="list-disc pl-6 space-y-1 text-sm">
                              {row.records.map((rec, i) => (
                                <li key={i} className="break-all">{rec}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ActiveSubdomainsTable = ({ data, isLoading, isProcessing }) => {
  const [showAllSubdomains, setShowAllSubdomains] = React.useState(false);
  const activeSubdomains = data?.active_subdomains || [];

  const handleSeeMore = () => setShowAllSubdomains(true);
  const handleSeeLess = () => setShowAllSubdomains(false);

  const isValidArray = Array.isArray(activeSubdomains);
  const filtered = isValidArray
    ? activeSubdomains.filter((obj) => obj.http_active || obj.https_active)
    : [];
  const displayed = showAllSubdomains ? filtered : filtered.slice(0, 10);

  const rows = displayed.map((obj) => [
    obj.subdomain || "N/A",
    <button
      className={`px-3 py-1 rounded ${
        obj.http_active ? "bg-green-500" : "bg-red-500"
      } text-white`}
      disabled
    >
      {obj.http_active ? "Active" : "Inactive"}
    </button>,
    <button
      className={`px-3 py-1 rounded ${
        obj.https_active ? "bg-green-500" : "bg-red-500"
      } text-white`}
      disabled
    >
      {obj.https_active ? "Active" : "Inactive"}
    </button>,
  ]);

  return (
    <div id="active-subdomains-section" className="bg-gradient-to-br from-gray-900 to-blue-900 p-6 rounded-2xl shadow-2xl mb-10">
      {renderTable(
        ["Active Subdomain", "HTTP", "HTTPS"],
        rows,
        "Active Subdomains",
        isLoading,
        isProcessing && !isValidArray,
        false,
        { columnWidths: ["33.33%", "33.33%", "33.33%"] }
      )}
      {filtered.length > 10 && (
        <div className="flex justify-center mt-4 space-x-4">
          {!showAllSubdomains && (
            <button
              onClick={handleSeeMore}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              See More
            </button>
          )}
          {showAllSubdomains && (
            <button
              onClick={handleSeeLess}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-300"
            >
              See Less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const renderDNSRecords = (data, isLoading, isProcessing) => {
  const groupedRecords = {};
  if (data?.dns_records) {
    Object.entries(data.dns_records || {}).forEach(([subdomain, records]) => {
      Object.entries(records || {}).forEach(([type, values]) => {
        if (!groupedRecords[type]) groupedRecords[type] = [];
        const isEmpty = values === null || values === undefined || values === "" || (Array.isArray(values) && values.length === 0);
        const displayValues = isEmpty
          ? null
          : Array.isArray(values) ? values.join(", ") : values;
        groupedRecords[type].push({
          subdomain,
          value: displayValues,
        });
      });
    });
  }

  return (
    <div id="dns-records-section" className="mb-10">
      <h2 className="text-2xl font-bold text-white pl-4 mb-6">DNS Records Details</h2>
      {Object.entries(groupedRecords).map(([recordType, rows], index) => {
        const filteredRows = rows.filter(row => row.value !== null);
        const finalRows = filteredRows.length > 0
          ? filteredRows.map(row => [row.subdomain, row.value])
          : [[rows[0]?.subdomain || "N/A", "No record found for this domain"]];
        return (
          <div key={index} className="mb-10">
            {renderTable(
              ["Subdomain", "Records"],
              finalRows,
              `${recordType} Records`,
              isLoading,
              isProcessing && !data?.dns_records,
              true,
              { columnWidths: ["50%", "50%"] }
            )}
          </div>
        );
      })}
    </div>
  );
};

export const renderWhois = (data, isLoading, isProcessing) => {
  const whoisRows = data?.whois
    ? Object.entries(data.whois || {}).map(([key, value]) => [
        key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        value === null || value === undefined || value === "" ? "N/A" : value,
      ])
    : [];

  return renderTable(
    ["Field", "Value"],
    whoisRows,
    "WHOIS Information",
    isLoading,
    isProcessing && !data?.whois,
    false,
    { columnWidths: ["50%", "50%"] }
  );
};

export const renderPorts = (data, isLoading, isProcessing) => {
  const portsRows = data?.ports
    ? Object.entries(data.ports).map(([ip, ports]) => [
        ip,
        ports && ports.length > 0 ? ports : "N/A"
      ])
    : [];

  return renderTable(
    ["IP Address", "Ports"],
    portsRows.map(([ip, ports]) => [
      ip,
      ports === "N/A" ? "N/A" : (
        <div className="flex flex-wrap gap-5">
          {ports.map(port => {
            const portStr = port.toString();
            const description =
              data?.port_descriptions?.[ip]?.[portStr]?.data?.description ||
              "No description available";
            return (
              <div key={port} className="relative inline-block">
                <button
                  className="px-3 py-1 rounded bg-blue-600 text-white"
                  onMouseEnter={(e) =>
                    e.currentTarget.nextSibling?.classList.remove("hidden")
                  }
                  onMouseLeave={(e) =>
                    e.currentTarget.nextSibling?.classList.add("hidden")
                  }
                >
                  {port}
                </button>
                <span className="absolute hidden bg-gray-800 text-white text-xs rounded-md py-1 px-2 -top-10 left-1/2 transform -translate-x-1/2 z-50 whitespace-nowrap">
                  {description}
                </span>
              </div>
            );
          })}
        </div>
      )
    ]),
    "Open Ports",
    isLoading,
    isProcessing && !data?.ports,
    false,
    { columnWidths: ["50%", "50%"] }
  );
};

export const renderSubdomains = (data, visibleSubdomains, setVisibleSubdomains, isLoading, isProcessing) => {
  let subdomainsArray = [];
  if (Array.isArray(data?.subdomains)) {
    subdomainsArray = data.subdomains;
  } else if (data?.subdomains?.subdomains && Array.isArray(data.subdomains.subdomains)) {
    subdomainsArray = data.subdomains.subdomains;
  } else if (data?.subdomains?.domains && Array.isArray(data.subdomains.domains)) {
    subdomainsArray = data.subdomains.domains;
  }

  const subdomainsRows = subdomainsArray.slice(0, visibleSubdomains).map(subdomain => [
    subdomain || "N/A"
  ]);

  const handleSeeMore = () => {
    setVisibleSubdomains(prev => Math.min(prev + 10, subdomainsArray.length || 10));
  };

  const handleSeeLess = () => {
    setVisibleSubdomains(prev => Math.max(prev - 10, 10));
  };

  return (
    <div id="subdomains-section" className="bg-gradient-to-br from-gray-900 to-blue-900 p-6 rounded-2xl shadow-2xl border border-blue-800/50 min-h-[240px] mb-10">
      {renderTable(
        ["Subdomain"],
        subdomainsRows,
        "Subdomains",
        isLoading,
        isProcessing && !subdomainsArray.length,
        false,
        { columnWidths: ["100%"] }
      )}
      {(visibleSubdomains < (subdomainsArray.length || 0) || visibleSubdomains > 10) && (
        <div className="text-center mt-4 flex justify-center gap-4">
          {visibleSubdomains < (subdomainsArray.length || 0) && (
            <button
              onClick={handleSeeMore}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              See More
            </button>
          )}
          {visibleSubdomains > 10 && (
            <button
              onClick={handleSeeLess}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              See Less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const renderShodan = (data, expandedCve, setExpandedCve, domain, isLoading, isProcessing) => {
  const shodanEntries = data?.shodan
    ? Object.entries(data.shodan || {}).flatMap(([ip, details]) =>
        (details.technologies || []).map((tech) => ({
          tech,
          domain: domain || "N/A",
          ip,
        }))
      )
    : [];

  const groupedByTechAndDomain = {};
  shodanEntries.forEach(({ tech, domain, ip }) => {
    const key = `${tech}_${domain}`;
    if (!groupedByTechAndDomain[key]) {
      groupedByTechAndDomain[key] = { tech, domain, ips: [] };
    }
    groupedByTechAndDomain[key].ips.push(ip);
  });

  const groupedRows = Object.values(groupedByTechAndDomain).map(({ tech, domain, ips }) => ({
    tech,
    domain,
    ips,
    row: [domain, ips.join(", ")],
  }));

  return (
    <div id="technology-vulnerabilities-section" className="mb-10">
      <h2 className="text-2xl font-bold text-white pl-4 mb-6">Technology & Vulnerabilities</h2>
      {(isLoading || (isProcessing && !data?.shodan)) && (
        <div className="flex flex-col items-center justify-center h-[200px] space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      )}
      {!(isLoading || (isProcessing && !data?.shodan)) && (
        <>
          {groupedRows.length === 0 ? (
            renderTable(["Domain", "IP Address"], [], "Technology & Vulnerabilities", isLoading, isProcessing, true, {
              columnWidths: ["50%", "50%"],
            })
          ) : (
            groupedRows.map(({ tech, domain, ips, row }, index) => {
              const firstIP = ips[0];
              const cveVulns = data.nrich?.[firstIP]?.cve_vulns || {};
              return (
                <div key={index} className="mb-10">
                  <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-8 rounded-2xl shadow-2xl transition-all duration-500 animate-fade-in">
                    <h2 className="text-lg font-bold mb-4 text-white">{`${tech}`}</h2>
                    <p className="text-sm text-gray-100 mb-4">
                      {data.technology_descriptions?.[firstIP]?.[tech]?.data?.description || "No description available"}
                    </p>
                    {renderTable(["Domain", "IP Address"], [row], "", isLoading, isProcessing, true, {
                      columnWidths: ["50%", "50%"],
                    })}
                    {Object.keys(cveVulns).length > 0 ? (
                      <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-10 rounded-2xl shadow-2xl transition-all duration-500 animate-fade-in mb-10 mt-6">
                        <h3 className="text-2xl font-semibold text-white mb-4">CVE Vulnerabilities</h3>
                        {Object.entries(cveVulns).map(([cveId, cveData], cveIndex) => (
                          <div key={cveIndex} className="mt-4 p-4 rounded-lg">
                            <div
                              className="flex justify-between items-center cursor-pointer"
                              onClick={() =>
                                setExpandedCve(expandedCve === `${firstIP}-${cveIndex}` ? null : `${firstIP}-${cveIndex}`)
                              }
                            >
                              <h3 className="text-lg font-semibold text-white">{cveId}</h3>
                              <span className="text-gray-300">
                                {expandedCve === `${firstIP}-${cveIndex}` ? "▲" : "▼"}
                              </span>
                            </div>
                            {expandedCve === `${firstIP}-${cveIndex}` && (
                              <div className="flex-wrap mt-2 space-y-2 text-gray-200">
                                <div className="w-full p-4 rounded-sm border border-[#4C5879] shadow" style={{ backgroundColor: '#101C40' }}>
                                  <h2 className="text-xl font-bold border-b border-[#4C5879] pb-2 mb-2">Key CVE Details</h2>
                                  <div className="space-y-2">
                                    <div className="flex flex-wrap break-all"><span className="font-bold">CVE ID:</span><span className="ml-2 break-all">{cveId || "N/A"}</span></div>
                                    <div className="flex flex-wrap break-all"><span className="font-bold">Assigner:</span><span className="ml-2 break-all">{cveData?.cveMetadata?.assignerShortName || "N/A"}</span></div>
                                    <div className="flex flex-wrap break-all"><span className="font-bold">Date Published:</span><span className="ml-2 break-all">{cveData?.cveMetadata?.datePublished || "N/A"}</span></div>
                                    <div className="flex flex-wrap break-all"><span className="font-bold">Date Updated:</span><span className="ml-2 break-all">{cveData?.cveMetadata?.dateUpdated || "N/A"}</span></div>
                                  </div>
                                </div>
                                <div className="w-full p-4 rounded-sm border border-[#4C5879] shadow" style={{ backgroundColor: '#101C40' }}>
                                  <h2 className="text-xl font-bold border-b border-[#4C5879] pb-2 mb-2">📝 Description</h2>
                                  <p className="leading-relaxed break-words">
                                    {cveData?.containers?.cna?.descriptions?.[0]?.value || "No description available"}
                                  </p>
                                </div>
                                <div className="w-full border border-[#4C5879] rounded-sm p-4" style={{ backgroundColor: '#101C40' }}>
                                  <h2 className="font-bold text-xl text-white border-b border-[#4C5879] pb-2 mb-2">📊 Impact</h2>
                                  {cveData?.containers?.adp?.[0]?.metrics?.[0]?.cvssV3_1 ? (
                                    <>
                                      <span className="font-semibold block mt-2">CVSS V3.1:</span>
                                      <div className="flex flex-col md:flex-row gap-4 mt-2">
                                        <div>
                                          <span className="font-semibold">Vector String:</span>{" "}
                                          <span className="break-words">{cveData.containers.adp[0].metrics[0].cvssV3_1.vectorString || "N/A"}</span>
                                          <ul className="list-disc ml-6 mt-2">
                                            <li>Version: <span className="break-words">{cveData.containers.adp[0].metrics[0].cvssV3_1.version || "N/A"}</span></li>
                                            {cveData.containers.adp[0].metrics[0].cvssV3_1.baseScore && (
                                              <li>
                                                Base Score:
                                                <div className="flex items-center w-1/3 mt-1 mb-1 gap-2">
                                                  <div className={`h-2 rounded ${getCvssBarColor(cveData.containers.adp[0].metrics[0].cvssV3_1.baseScore)}`} style={{ width: `${(cveData.containers.adp[0].metrics[0].cvssV3_1.baseScore / 10) * 100}%` }} />
                                                  <span className="text-sm font-semibold">{cveData.containers.adp[0].metrics[0].cvssV3_1.baseScore}/10</span>
                                                </div>
                                                (<span className="break-words">{cveData.containers.adp[0].metrics[0].cvssV3_1.baseSeverity || "N/A"}</span>)
                                              </li>
                                            )}
                                            <li>Attack Complexity: <span className="break-words">{cveData.containers.adp[0].metrics[0].cvssV3_1.attackComplexity || "N/A"}</span></li>
                                            <li>Confidentiality Impact: <span className="break-words">{cveData.containers.adp[0].metrics[0].cvssV3_1.confidentialityImpact || "N/A"}</span></li>
                                            <li>Integrity Impact: <span className="break-words">{cveData.containers.adp[0].metrics[0].cvssV3_1.integrityImpact || "N/A"}</span></li>
                                            <li>Availability Impact: <span className="break-words">{cveData.containers.adp[0].metrics[0].cvssV3_1.availabilityImpact || "N/A"}</span></li>
                                          </ul>
                                        </div>
                                        <div className="w-full md:w-1/3 p-4 rounded-sm flex flex-col items-center justify-center mb-6" style={{ backgroundColor: '#101C40' }}>
                                          <span className="font-semibold mb-2">Base Score</span>
                                          <CVSSGauge score={cveData.containers.adp[0].metrics[0].cvssV3_1.baseScore} />
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <p className="text-gray-400">No CVSS V3.1 impact data available.</p>
                                  )}
                                  {cveData?.containers?.cna?.metrics?.[0]?.other?.content?.text && (
                                    <div className="mt-4">
                                      <span className="font-semibold block">Severity:</span>
                                      <span className="break-words">{cveData.containers.cna.metrics[0].other.content.text || "N/A"}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="p-4 border border-[#4C5879] rounded-sm" style={{ backgroundColor: '#101C40' }}>
                                  <h2 className="font-bold text-xl text-white border-b border-[#4C5879] pb-2 mb-2">🌐 References</h2>
                                  {cveData?.containers?.cna?.references?.length > 0 ? (
                                    <ul className="list-disc ml-6">
                                      {cveData.containers.cna.references.map((ref, refIndex) => (
                                        <li key={refIndex}>
                                          <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-words">
                                            {ref.url}
                                          </a>{" "}
                                          (<span className="break-words">{ref.tags?.join(", ") || "No tags"}</span>)
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-gray-400">No references available.</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 mt-4">No CVE details available for this IP.</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
};

export const renderWapitiReport = (data, isLoading, isProcessing) => {
  const report = data?.wapiti_report;
  const vulnData = report?.vulnerabilities;
  const vulnerabilitiesRows =
    vulnData && typeof vulnData === "object" && Object.keys(vulnData || {}).length > 0
      ? Object.entries(vulnData).flatMap(([vulnType, vulnList]) => {
          if (!Array.isArray(vulnList)) return [];
          return vulnList.map((vuln) => {
            const fullKey = `${vulnType}_${vuln?.info}`;
            const description = data?.vulnerability_descriptions?.[fullKey]?.data?.description || "No description available";
            return [vulnType || "N/A", vuln?.info || "N/A", description];
          });
        })
      : [];

  return renderTable(
    ["Vulnerability", "Info", "Description"],
    vulnerabilitiesRows,
    "Web Application Vulnerability Details",
    isLoading,
    isProcessing && !data?.wapiti_report,
    false,
    { columnWidths: ["33.33%", "33.33%", "33.33%"] }
  );
};

export const renderSSLCertificate = (data, isLoading, isProcessing) => {
  const sslRows = data?.ssl_comprehensive
    ? Object.entries(data.ssl_comprehensive || {}).map(([domain, ssl]) => [
        domain,
        ssl.grade?.grade === null || ssl.grade?.grade === undefined || ssl.grade?.grade === "" ? "N/A" : ssl.grade?.grade,
        ssl.grade?.score === null || ssl.grade?.score === undefined || ssl.grade?.score === "" ? "N/A" : ssl.grade?.score,
        ssl.certificate?.issuer === null || ssl.certificate?.issuer === undefined || ssl.certificate?.issuer === "" ? "N/A" : ssl.certificate?.issuer,
        ssl.certificate?.common_name === null || ssl.certificate?.common_name === undefined || ssl.certificate?.common_name === "" ? "N/A" : ssl.certificate?.common_name,
        ssl.certificate?.valid_from === null || ssl.certificate?.valid_from === undefined || ssl.certificate?.valid_from === "" ? "N/A" : ssl.certificate?.valid_from,
        ssl.certificate?.valid_to === null || ssl.certificate?.valid_to === undefined || ssl.certificate?.valid_to === "" ? "N/A" : ssl.certificate?.valid_to,
        ssl.certificate?.tls_version === null || ssl.certificate?.tls_version === undefined || ssl.certificate?.tls_version === "" ? "N/A" : ssl.certificate?.tls_version,
        ssl.certificate?.cipher_suite === null || ssl.certificate?.cipher_suite === undefined || ssl.certificate?.cipher_suite === "" ? "N/A" : ssl.certificate?.cipher_suite,
        ssl.certificate?.public_key_type === null || ssl.certificate?.public_key_type === undefined || ssl.certificate?.public_key_type === "" ? "N/A" : ssl.certificate?.public_key_type,
        ssl.certificate?.days_until_expiration === null || ssl.certificate?.days_until_expiration === undefined || ssl.certificate?.days_until_expiration === "" ? "N/A" : ssl.certificate?.days_until_expiration,
        ssl.certificate?.subject_alt_names === null || ssl.certificate?.subject_alt_names === undefined || (Array.isArray(ssl.certificate?.subject_alt_names) && ssl.certificate?.subject_alt_names.length === 0)
          ? "N/A"
          : ssl.certificate?.subject_alt_names?.join(", "),
      ])
    : [];
  const filteredRows = sslRows.filter(row =>
    row.slice(1).some(cell => cell !== "N/A")
  );

  return renderTable(
    ["Domain", "Grade", "Score", "Issuer", "Common Name", "Valid From", "Valid To", "TLS Version", "Cipher Suite", "Key Type", "Days Until Expiration", "Subject Alt Names"],
    filteredRows,
    "SSL Certificate Details",
    isLoading,
    isProcessing && !data?.ssl_comprehensive,
    true,
    { columnWidths: ["50%", "8.33%", "8.33%", "8.33%", "8.33%", "8.33%", "8.33%", "8.33%", "8.33%", "8.33%", "8.33%", "8.33%"] }
  );
};

export const renderSSLWarnings = (data, isLoading, isProcessing) => {
  const warningRows = data?.ssl_comprehensive
    ? Object.entries(data.ssl_comprehensive || {}).map(([domain, ssl]) => [
        domain,
        ssl.grade?.warnings === null || ssl.grade?.warnings === undefined || (Array.isArray(ssl.grade?.warnings) && ssl.grade?.warnings.length === 0)
          ? "N/A"
          : ssl.grade?.warnings?.join(", ") || "N/A",
        ssl.grade?.critical_issues === null || ssl.grade?.critical_issues === undefined || (Array.isArray(ssl.grade?.critical_issues) && ssl.grade?.critical_issues.length === 0)
          ? "N/A"
          : ssl.grade?.critical_issues?.join(", ") || "N/A",
        ssl.warnings === null || ssl.warnings === undefined || (Array.isArray(ssl.warnings) && ssl.warnings.length === 0)
          ? "N/A"
          : ssl.warnings?.join(", ") || "N/A",
      ])
    : [];
  const filteredRows = warningRows.filter(row =>
    row.slice(1).some(cell => cell !== "N/A")
  );

  return renderTable(
    ["Domain", "Grade Warnings", "Critical Issues", "Warnings"],
    filteredRows,
    "SSL Warnings",
    isLoading,
    isProcessing && !data?.ssl_comprehensive,
    true,
    { columnWidths: ["20%", "26.67%", "26.67%", "26.67%"] }
  );
};

export const renderSSLRecommendations = (data, isLoading, isProcessing) => {
  const recommendationRows = data?.ssl_comprehensive
    ? Object.entries(data.ssl_comprehensive || {}).map(([domain, ssl]) => [
        domain,
        ssl.recommendations === null || ssl.recommendations === undefined || (Array.isArray(ssl.recommendations) && ssl.recommendations.length === 0)
          ? "N/A"
          : ssl.recommendations?.join(", ") || "N/A",
      ])
    : [];

  return renderTable(
    ["Domain", "Recommendations"],
    recommendationRows,
    "SSL Recommendations",
    isLoading,
    isProcessing && !data?.ssl_comprehensive,
    true,
    { columnWidths: ["30%", "70%"] }
  );
};

export const renderProtocols = (data, isLoading, isProcessing) => {
  const protocolGroups = {};
  if (data?.ssl_comprehensive) {
    Object.entries(data.ssl_comprehensive).forEach(([domain, ssl]) => {
      const subdomain = domain;
      Object.entries(ssl.protocols || {}).forEach(([protocol, details]) => {
        if (!protocolGroups[protocol]) {
          protocolGroups[protocol] = [];
        }
        protocolGroups[protocol].push([
          subdomain,
          details.supported === null || details.supported === undefined
            ? "N/A"
            : details.supported
            ? "Yes"
            : "No",
          Object.entries(details || {})
            .filter(([key]) => key !== "supported" && details[key])
            .map(([key]) => key)
            .join(", ") || "N/A",
        ]);
      });
    });
  }

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-white pl-4 mb-6">Supported Protocols</h2>
      {Object.entries(protocolGroups).map(([protocol, rows], index) => (
        <div key={index} className="mb-10">
          {renderTable(
            ["Domain", "Supported", "Ciphers"],
            rows,
            protocol,
            isLoading,
            isProcessing && !data?.ssl_comprehensive,
            true,
            { columnWidths: ["33.33%", "33.33%", "33.33%"] }
          )}
        </div>
      ))}
    </div>
  );
};
