import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import axios from 'axios';

const MindMapGraph = ({ searchInput, searchType, accessToken, searchTrigger }) => {
  const networkRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });
  const [graphData, setGraphData] = useState(null);
  const [graphLoading, setGraphLoading] = useState(true);
  const [graphError, setGraphError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDataHistory, setPageDataHistory] = useState([]);
  const [cursor, setCursor] = useState('');
  const [hasNext, setHasNext] = useState(false);
  const networkInstance = useRef(null);
  const [showAllIpRows, setShowAllIpRows] = useState(false);
  const [showAllDomainRows, setShowAllDomainRows] = useState(false);

  const API_BASE_URL = 'https://api.bluhawkscan.com';

  // Country code to full name mapping
  const countryCodeToName = {
    AF: 'Afghanistan',
    AL: 'Albania',
    DZ: 'Algeria',
    AD: 'Andorra',
    AO: 'Angola',
    AG: 'Antigua and Barbuda',
    AR: 'Argentina',
    AM: 'Armenia',
    AU: 'Australia',
    AT: 'Austria',
    AZ: 'Azerbaijan',
    BS: 'Bahamas',
    BH: 'Bahrain',
    BD: 'Bangladesh',
    BB: 'Barbados',
    BY: 'Belarus',
    BE: 'Belgium',
    BZ: 'Belize',
    BJ: 'Benin',
    BT: 'Bhutan',
    BO: 'Bolivia',
    BA: 'Bosnia and Herzegovina',
    BW: 'Botswana',
    BR: 'Brazil',
    BN: 'Brunei',
    BG: 'Bulgaria',
    BF: 'Burkina Faso',
    BI: 'Burundi',
    CV: 'Cabo Verde',
    KH: 'Cambodia',
    CM: 'Cameroon',
    CA: 'Canada',
    CF: 'Central African Republic',
    TD: 'Chad',
    CL: 'Chile',
    CN: 'China',
    CO: 'Colombia',
    KM: 'Comoros',
    CG: 'Congo',
    CR: 'Costa Rica',
    HR: 'Croatia',
    CU: 'Cuba',
    CY: 'Cyprus',
    CZ: 'Czech Republic',
    CD: 'Democratic Republic of the Congo',
    DK: 'Denmark',
    DJ: 'Djibouti',
    DM: 'Dominica',
    DO: 'Dominican Republic',
    EC: 'Ecuador',
    EG: 'Egypt',
    SV: 'El Salvador',
    GQ: 'Equatorial Guinea',
    ER: 'Eritrea',
    EE: 'Estonia',
    SZ: 'Eswatini',
    ET: 'Ethiopia',
    FJ: 'Fiji',
    FI: 'Finland',
    FR: 'France',
    GA: 'Gabon',
    GM: 'Gambia',
    GE: 'Georgia',
    DE: 'Germany',
    GH: 'Ghana',
    GR: 'Greece',
    GD: 'Grenada',
    GT: 'Guatemala',
    GN: 'Guinea',
    GW: 'Guinea-Bissau',
    GY: 'Guyana',
    HT: 'Haiti',
    HN: 'Honduras',
    HU: 'Hungary',
    IS: 'Iceland',
    IN: 'India',
    ID: 'Indonesia',
    IR: 'Iran',
    IQ: 'Iraq',
    IE: 'Ireland',
    IL: 'Israel',
    IT: 'Italy',
    JM: 'Jamaica',
    JP: 'Japan',
    JO: 'Jordan',
    KZ: 'Kazakhstan',
    KE: 'Kenya',
    KI: 'Kiribati',
    KW: 'Kuwait',
    KG: 'Kyrgyzstan',
    LA: 'Laos',
    LV: 'Latvia',
    LB: 'Lebanon',
    LS: 'Lesotho',
    LR: 'Liberia',
    LY: 'Libya',
    LI: 'Liechtenstein',
    LT: 'Lithuania',
    LU: 'Luxembourg',
    MG: 'Madagascar',
    MW: 'Malawi',
    MY: 'Malaysia',
    MV: 'Maldives',
    ML: 'Mali',
    MT: 'Malta',
    MH: 'Marshall Islands',
    MR: 'Mauritania',
    MU: 'Mauritius',
    MX: 'Mexico',
    FM: 'Micronesia',
    MD: 'Moldova',
    MC: 'Monaco',
    MN: 'Mongolia',
    ME: 'Montenegro',
    MA: 'Morocco',
    MZ: 'Mozambique',
    MM: 'Myanmar',
    NA: 'Namibia',
    NR: 'Nauru',
    NP: 'Nepal',
    NL: 'Netherlands',
    NZ: 'New Zealand',
    NI: 'Nicaragua',
    NE: 'Niger',
    NG: 'Nigeria',
    KP: 'North Korea',
    MK: 'North Macedonia',
    NO: 'Norway',
    OM: 'Oman',
    PK: 'Pakistan',
    PW: 'Palau',
    PA: 'Panama',
    PG: 'Papua New Guinea',
    PY: 'Paraguay',
    PE: 'Peru',
    PH: 'Philippines',
    PL: 'Poland',
    PT: 'Portugal',
    QA: 'Qatar',
    RO: 'Romania',
    RU: 'Russia',
    RW: 'Rwanda',
    KN: 'Saint Kitts and Nevis',
    LC: 'Saint Lucia',
    VC: 'Saint Vincent and the Grenadines',
    WS: 'Samoa',
    SM: 'San Marino',
    ST: 'Sao Tome and Principe',
    SA: 'Saudi Arabia',
    SN: 'Senegal',
    RS: 'Serbia',
    SC: 'Seychelles',
    SL: 'Sierra Leone',
    SG: 'Singapore',
    SK: 'Slovakia',
    SI: 'Slovenia',
    SB: 'Solomon Islands',
    SO: 'Somalia',
    ZA: 'South Africa',
    KR: 'South Korea',
    SS: 'South Sudan',
    ES: 'Spain',
    LK: 'Sri Lanka',
    SD: 'Sudan',
    SR: 'Suriname',
    SE: 'Sweden',
    CH: 'Switzerland',
    SY: 'Syria',
    TJ: 'Tajikistan',
    TZ: 'Tanzania',
    TH: 'Thailand',
    TL: 'Timor-Leste',
    TG: 'Togo',
    TO: 'Tonga',
    TT: 'Trinidad and Tobago',
    TN: 'Tunisia',
    TR: 'Turkey',
    TM: 'Turkmenistan',
    TV: 'Tuvalu',
    UG: 'Uganda',
    UA: 'Ukraine',
    AE: 'United Arab Emirates',
    GB: 'United Kingdom',
    US: 'United States',
    UY: 'Uruguay',
    UZ: 'Uzbekistan',
    VU: 'Vanuatu',
    VE: 'Venezuela',
    VN: 'Vietnam',
    YE: 'Yemen',
    ZM: 'Zambia',
    ZW: 'Zimbabwe'
  };

  useEffect(() => {
    if (!searchInput || !searchType || !accessToken || !['ip', 'domain', 'url'].includes(searchType)) {
      console.error('Invalid props:', { searchInput, searchType, accessToken });
      setGraphError('Invalid search input or type');
      setGraphLoading(false);
      return;
    }

    setNodes([]);
    setEdges([]);
    setGraphData(null);
    setCurrentPage(1);
    setPageDataHistory([]);
    setCursor('');
    setHasNext(false);
    setGraphError('');
    setShowAllIpRows(false);
    setShowAllDomainRows(false);

    fetchGraphData('', 1);
    // eslint-disable-next-line
  }, [searchTrigger, searchType, accessToken]);

  const fetchGraphData = async (cursorVal, pageNumber) => {
    setNodes([]);
    setEdges([]);
    setGraphLoading(true);

    // Process searchInput based on searchType
    let processedQuery = searchInput;
    if (searchType === 'url') {
      try {
        const url = new URL(searchInput);
        processedQuery = url.hostname; // Extracts 'www.outlook.com' from 'https://www.outlook.com'
      } catch (e) {
        console.warn('Invalid URL, using raw input:', searchInput);
        // Fallback to raw input if URL parsing fails
      }
    } else if (searchType === 'domain') {
      // Ensure domain is clean (remove protocol if present)
      processedQuery = searchInput.replace(/^(https?:\/\/)?/i, '').split('/')[0];
    } else if (searchType === 'ip') {
      // Validate IP format (basic check, can be enhanced)
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipPattern.test(searchInput)) {
        console.warn('Invalid IP format, using raw input:', searchInput);
      }
      // Keep as is since IP should be valid
    }

    const filterType = searchType === 'ip' ? 'ip_address' : 'domain';
    const cursorParam = cursorVal ? `&cursor=${encodeURIComponent(cursorVal)}` : '';
    const url = `${API_BASE_URL}/graphs/search/?filter_type=${filterType}&query=${encodeURIComponent(
      processedQuery
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
          setCurrentPage(pageNumber);
          setPageDataHistory((prev) => {
            const exists = prev.find((item) => item.page === pageNumber);
            if (exists) {
              return prev.map((item) =>
                item.page === pageNumber ? { page: pageNumber, data: newData, cursor: cursorVal } : item
              );
            }
            return [...prev, { page: pageNumber, data: newData, cursor: cursorVal }];
          });
          const nextCursor = response.data.meta?.cursor || '';
          setCursor(nextCursor);
          setHasNext(!!nextCursor);
          setGraphLoading(false);
        }
      } catch (error) {
        console.error('API Error:', error.message, error.response?.data);
        setGraphError(`Error fetching graph data: ${error.message}`);
        setGraphLoading(false);
      }
    };

    fetchData();
  };

  useEffect(() => {
    const processGraphData = () => {
      if (!graphData || !Array.isArray(graphData) || graphData.length === 0) {
        setNodes([]);
        setEdges([]);
        setGraphLoading(false);
        return;
      }

      const graph = graphData[0];
      const { nodes: rawNodes = [], links = [] } = graph.attributes || {};

      const visNodes = rawNodes.map((node) => {
        const nodeType = node.type === 'ip' ? 'ip_address' : node.type;
        const label = node.text || `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`;
        let color = { background: '#1890ff', border: '#40a9ff' };
        if (node.type === 'file') color = { background: '#ff4d4f', border: '#ff7875' };
        else if (node.type === 'ip_address') color = { background: '#52c41a', border: '#73d13d' };
        else if (node.type === 'relationship') color = { background: '#faad14', border: '#ffc107' };
        return {
          id: node.entity_id || `node-${Math.random().toString(36).slice(2)}`,
          label,
          shape: 'dot',
          size: 20,
          font: { color: '#ffffff', size: 12, face: 'arial' },
          color,
          x: node.x || undefined,
          y: node.y || undefined,
          data: node,
        };
      });

      const visEdges = links
        .filter(
          (link) =>
            rawNodes.some((node) => node.entity_id === link.source) &&
            rawNodes.some((node) => node.entity_id === link.target)
        )
        .map((link) => ({
          from: link.source,
          to: link.target,
          label: link.connection_type,
          font: { align: 'top', color: '#cccccc', size: 10, face: 'arial' },
          color: { color: '#1890ff', highlight: '#40c4ff' },
          arrows: 'to',
          width: 1,
          hoverWidth: 2,
        }));

      setNodes(visNodes);
      setEdges(visEdges);
      setGraphLoading(false);
    };

    if (graphData) {
      processGraphData();
    }
    // eslint-disable-next-line
  }, [graphData]);

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
        if (nextPageData) {
          setCursor(nextPageData.cursor || '');
          setHasNext(true);
        } else {
          setCursor('');
          setHasNext(false);
        }
      }
    }
  };

  useEffect(() => {
    const container = networkRef.current;
    if (!container || nodes.length === 0) return;

    const options = {
      physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -100,
          centralGravity: 0.01,
          springLength: 150,
          springConstant: 0.08,
        },
        stabilization: {
          iterations: 100,
          updateInterval: 25,
        },
      },
      nodes: {
        shape: 'dot',
        scaling: { min: 10, max: 20 },
        shadow: { enabled: true, size: 10, x: 5, y: 5 },
        chosen: {
          node: (values) => {
            values.size = values.size * 1.2;
          },
        },
      },
      edges: {
        smooth: { type: 'continuous' },
        shadow: { enabled: true, size: 5, x: 2, y: 2 },
      },
      interaction: {
        hover: true,
        zoomView: true,
        dragView: true,
      },
    };

    const network = new Network(container, { nodes, edges }, options);
    networkInstance.current = network;

    let tooltipTimeout = null;

    network.on('hoverNode', (params) => {
      console.log('Hovering node:', params.node);
      const node = nodes.find((n) => n.id === params.node);
      if (node) {
        console.log('Node found:', node);
        const content = node.data
          ? Object.entries(node.data)
              .filter(([key]) => !["x", "y", "fx", "fy"].includes(key))
              .map(([key, value]) => {
                if (key === 'entity_attributes' && value && typeof value === 'object') {
                  return `<strong>${key}:</strong><br>${Object.entries(value)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join('<br>')}`;
                }
                return `<strong>${key}:</strong> ${value ?? 'N/A'}`;
              })
              .join('<br>')
          : 'No data available';
        const boundingBox = network.getBoundingBox(params.node);
        if (boundingBox) {
          const canvasPos = {
            x: boundingBox.right,
            y: (boundingBox.top + boundingBox.bottom) / 2,
          };
          const domPos = network.canvasToDOM(canvasPos);
          const containerRect = networkRef.current.getBoundingClientRect();
          const paddingOffset = 24;
          const tooltipX = containerRect.left + domPos.x + paddingOffset;
          const tooltipY = containerRect.top + domPos.y + paddingOffset;
          console.log('Tooltip position:', { x: tooltipX, y: tooltipY });
          setTooltip({
            visible: true,
            content,
            x: tooltipX,
            y: tooltipY,
          });
          if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
          }
        } else {
          console.warn('Bounding box not found for node:', params.node);
        }
      } else {
        console.warn('Node not found for ID:', params.node);
      }
    });

    network.on('blurNode', () => {
      tooltipTimeout = setTimeout(() => {
        setTooltip({ visible: false, content: '', x: 0, y: 0 });
      }, 5000);
    });

    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const node = nodes.find((n) => n.id === params.nodes[0]);
        console.log('Clicked node:', node);
      }
    });

    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
      network.destroy();
    };
    // eslint-disable-next-line
  }, [nodes, edges]);

  if (graphLoading) {
    return (
      <div className="w-full h-[600px] bg-[#1a1f37] p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (graphError) {
    return <p className="text-red-500 text-center text-xl">{graphError}</p>;
  }

  if (!nodes.length) {
    const noDataMessage =
      searchType === 'ip' ? 'No data found on this IP' :
      searchType === 'url' ? 'No data found on this URL' :
      'No data found on this domain';
    return <p className="text-gray-400 text-center text-xl">{noDataMessage}</p>;
  }

  const ipNodes = nodes.filter((node) => node.data.type === "ip_address");
  const domainNodes = nodes.filter((node) => ['domain', 'url', 'ssl_cert', 'collection'].includes(node.data.type));

  // Log domainNodes for debugging
  console.log('domainNodes:', domainNodes.map(node => ({
    id: node.id,
    type: node.data.type,
    text: node.data.text,
    entity_id: node.data.entity_id,
    entity_attributes: node.data.entity_attributes
  })));

  return (
    <div className="w-full flex flex-col gap-4">
      <div
        ref={networkRef}
        className="relative w-full h-[700px] bg-gradient-to-br from-[#1a1f37] to-[#2a314f] bg-[#2a314f]/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6 overflow-hidden"
      >
        {tooltip.visible && (
          <div
            className="absolute bg-white/95 text-black p-3 rounded-lg shadow-xl text-sm max-w-sm border border-gray-200 break-all"
            style={{ top: tooltip.y, left: tooltip.x, zIndex: 1000, transform: 'translateY(-50%)' }}
            dangerouslySetInnerHTML={{ __html: tooltip.content || 'No data available' }}
          />
        )}
      </div>

      <div className="relative w-full flex justify-center pt-2 md:justify-end md:pr-10">
        <div className="bg-gray-95 rounded-md p-2 text-xs space-y-2 w-full max-w-md md:max-w-none">
          <div className="flex items-center gap-3 flex-wrap">
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
          className={`px-4 py-2 rounded-lg text-white ${
            currentPage === 1 ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Previous
        </button>
        <span className="text-white self-center">Page {currentPage}</span>
        <button
          onClick={handleNext}
          disabled={!hasNext}
          className={`px-4 py-2 rounded-lg text-white ${
            !hasNext ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Next
        </button>
      </div>
      <div className="w-full bg-gradient-to-br from-[#1a1f37] to-[#2a314f] bg-[#2a314f]/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
        <h2 className="text-white text-xl font-bold mb-4">IP Table</h2>
        {ipNodes.length > 0 ? (
          <div className="w-full bg-gray-800 rounded-xl border border-gray-700/50 p-6 overflow-x-auto">
            <table className="w-full text-white text-sm">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-3 text-left">IP Address</th>
                  <th className="p-3 text-left">Origin Country</th>
                </tr>
              </thead>
              <tbody>
                {ipNodes
                  .slice(0, showAllIpRows ? ipNodes.length : 10)
                  .map((node, index) => {
                    const nodeData = node.data || {};
                    const entityAttributes = nodeData.entity_attributes || {};
                    
                    const ip = nodeData.text || nodeData.entity_id || "N/A";
                    const countryCode = entityAttributes.country || "N/A";
                    const country = countryCode !== "N/A" && countryCodeToName[countryCode.toUpperCase()]
                      ? countryCodeToName[countryCode.toUpperCase()]
                      : countryCode;

                    return (
                      <tr key={node.id || index} className="border-b border-gray-600 hover:bg-gray-700">
                        <td className="p-3">{ip}</td>
                        <td className="p-3">{country}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {ipNodes.length > 10 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAllIpRows(!showAllIpRows)}
                  className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                >
                  {showAllIpRows ? 'See Less' : 'See More'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-center text-sm">No IP addresses found</p>
        )}
      </div>
      <div className="w-full bg-gradient-to-br from-[#1a1f37] to-[#2a314f] bg-[#2a314f]/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6">
        <h2 className="text-white text-xl font-bold mb-4">Domain Table</h2>
        {domainNodes.length > 0 ? (
          <div className="w-full bg-gray-800 rounded-xl border border-gray-700/50 p-6 overflow-x-auto">
            <table className="w-full text-white text-sm">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-3 text-left">URL</th>
                  <th className="p-3 text-left">Domain</th>
                </tr>
              </thead>
              <tbody>
                {domainNodes
                  .slice(0, showAllDomainRows ? domainNodes.length : 10)
                  .map((node, index) => {
                    const nodeData = node.data || {};
                    const entityAttributes = nodeData.entity_attributes || {};
                    const textValue = nodeData.text || nodeData.entity_id || "N/A";
                    const isUrl = textValue.startsWith("http://") || textValue.startsWith("https://");
                    const url = entityAttributes.url || (isUrl ? textValue : "N/A");
                    const domain = entityAttributes.domain || (!isUrl ? textValue : "N/A");

                    // Log node data for debugging
                    console.log(`Node ${node.id}:`, {
                      type: nodeData.type,
                      text: nodeData.text,
                      entity_id: nodeData.entity_id,
                      entity_attributes: entityAttributes,
                      url: url,
                      domain: domain
                    });

                    return (
                      <tr key={node.id || index} className="border-b border-gray-600 hover:bg-gray-700">
                        <td className="p-3">{url}</td>
                        <td className="p-3">{domain}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {domainNodes.length > 10 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAllDomainRows(!showAllDomainRows)}
                  className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                >
                  {showAllDomainRows ? 'See Less' : 'See More'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-center text-sm">No URLs or domains found</p>
        )}
      </div>
    </div>
  );
};

export default MindMapGraph;