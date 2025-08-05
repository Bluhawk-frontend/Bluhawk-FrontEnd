import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Search from '../assets/images/Search.svg';
import Eth from '../assets/images/Eth.png';
import TransactionGraph from '../pages/TransactionGraph';
import NewNavbar from '../components/reusable/NewNavbar';
import Footer from "../components/reusable/Footer";

const ProfileByAddress = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchErr, setSearchErr] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletChainInfo, setWalletChainInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Restore state when navigating back
  useEffect(() => {
    if (location.state) {
      const {
        searchInput: prevSearchInput,
        walletData: prevWalletData,
        walletChainInfo: prevWalletChainInfo,
        transactions: prevTransactions,
      } = location.state;
      if (prevSearchInput) {
        setSearchInput(prevSearchInput);
        setShowResult(true);
        setWalletData(prevWalletData);
        setWalletChainInfo(prevWalletChainInfo);
        setTransactions(prevTransactions);
      }
    }
  }, [location.state]);

  // Validate Ethereum wallet address
  const isValidWalletAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchInput.trim() === '') {
      setSearchErr('Please enter a Wallet ID');
      return;
    }

    if (!isValidWalletAddress(searchInput)) {
      setSearchErr('Invalid wallet address. Please enter a valid Ethereum address (e.g., 0x...)');
      return;
    }

    setLoading(true);
    setSearchErr('');
    setShowResult(false);
    setWalletChainInfo(null);
    setTransactions([]);

    try {
      const url1 = `${import.meta.env.VITE_API_BASE_URL}/crypto/wallet/?address=${searchInput}`;
      const url2 = `${import.meta.env.VITE_API_BASE_URL}/crypto/wallet_chain_info/?address=${searchInput}`;
      const url3 = `${import.meta.env.VITE_API_BASE_URL}/crypto/wallet_history/?address=${searchInput}&page_size=20`;

      const [response1, response2, response3] = await Promise.all([
        fetch(url1),
        fetch(url2),
        fetch(url3),
      ]);

      const data1 = await response1.json();
      const data2 = await response2.json();
      const data3 = await response3.json();

      if (response1.status === 200 && data1?.message === 'successful') {
        setWalletData(data1);
        setShowResult(true);
      } else {
        setSearchErr('No wallet data found for this address.');
      }

      if (response2.status === 200 && data2?.message === 'success') {
        setWalletChainInfo(data2);
      } else {
        setSearchErr('No chain info found for this address.');
      }

      if (response3.status === 200 && data3?.message === 'success') {
        setTransactions(data3.data.result || []);
      } else {
        setSearchErr('No transaction history found for this address.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setSearchErr('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const truncateDescription = (description) => {
    if (!description) return 'No description available.';
    if (description.length <= 100) return description;
    return description.slice(0, 100) + '...';
  };

  // Extract transaction addresses for the graph
  const transactionAddresses = transactions.flatMap((tx) => [
    tx.from_address,
    tx.to_address,
  ]).filter((addr) => addr && addr !== searchInput);

  return (
    <div className="bg-gray-900 min-h-screen min-w-screen flex flex-col text-white">
      
        <NewNavbar />
        <main className="flex-1 text-white min-h-screen relative">
        {/* Search Section */}
        <div className="bg-[#F5F5F5] p-2 shadow-md w-full">
          <form onSubmit={handleSearch} className="w-full">
            <div className="w-full mx-auto max-w-7xl flex flex-col  sm:flex-row sm:items-center px-6 py-2 gap-2 ">
              <div className="text-xl sm:text-2xl font-semibold whitespace-nowrap text-center text-black sm:text-left mb-2 sm:mb-0">
                Find Wallet ID
              </div>
              <div className="flex flex-row items-center gap-2 w-full sm:flex-grow relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => [setSearchInput(e.target.value), setSearchErr('')]}
                  placeholder="Enter wallet address"
                  className="w-full sm:w-[200px] lg:w-[600px] sm:flex-grow h-[22px] sm:h-auto text-black px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base border rounded shadow-sm items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div
                  onClick={handleSearch}
                  className="flex items-center gap-1 bg-vibrantOrange text-white px-3 py-1.5 sm:py-2 rounded shadow cursor-pointer hover:bg-orange-600 w-auto justify-center transition-colors duration-200"
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
            {searchErr && <div className="text-red-500 mt-2 text-center text-sm">{searchErr}</div>}
          </form>
        </div>
        {loading ? (
          <div className="mx-auto mt-16 animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        ) : showResult === false && searchErr === '' && walletData === null ? (
          <p className="text-center mt-8 text-white"></p>
        ) : null}

        {/* Wallet Info Card */}
        {showResult && walletData && walletData.data && (
          <div className="w-full sm:w-3/4 mx-auto mt-8 bg-[#0D1224] p-4 sm:p-6 rounded-xl shadow-xl space-y-6">
            <h2 className="text-xl sm:text-3xl font-semibold truncate">
              <span className="text-white">{walletData.data.active_chains?.address || 'N/A'}</span>
            </h2>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">ENS Domain</p>
              <p className="italic text-gray-500 text-xs sm:text-sm">{walletData.data.ens_domain?.name || 'None'}</p>
              <p className="text-xs sm:text-sm text-gray-400">Unstoppable Domain</p>
              <p className="italic text-gray-500 text-xs sm:text-sm">None</p>
            </div>
            <div className="p-4 sm:p-6 rounded-xl flex flex-wrap justify-around items-center gap-4">
              <div className="flex flex-col text-xs space-y-2 min-w-[80px]">
                <p className="text-xs sm:text-sm text-gray-400">NFTs</p>
                <p className="text-lg sm:text-2xl font-semibold">{walletChainInfo?.data?.wallet_stats?.nfts || 0}</p>
              </div>
              <div className="flex flex-col border-l px-4 text-xs space-y-2 min-w-[80px]">
                <p className="text-xs sm:text-sm text-gray-400">Collections</p>
                <p className="text-lg sm:text-2xl font-semibold">{walletChainInfo?.data?.wallet_stats?.collections || 0}</p>
              </div>
              <div className="flex flex-col border-l px-4 text-xs space-y-2 min-w-[80px]">
                <p className="text-xs sm:text-sm text-gray-400">Total TX</p>
                <p className="text-lg sm:text-2xl font-semibold">{walletChainInfo?.data?.wallet_stats?.transactions?.total || 0}</p>
              </div>
              <div className="flex flex-col border-l px-4 text-xs space-y-2 min-w-[80px]">
                <p className="text-xs sm:text-sm text-gray-400">Token Value</p>
                <p className="text-lg sm:text-2xl font-semibold">---</p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Graph */}
        {showResult && searchInput && (
          <div className="w-full sm:w-3/4 mx-auto mt-8">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Transactional Network</h3>
            <div className="overflow-x-auto">
              <TransactionGraph
                targetAddress={searchInput}
                transactionAddresses={transactionAddresses}
              />
            </div>
          </div>
        )}

        {/* Total Net Worth and Summary */}
        {showResult && walletData && walletData.data && walletChainInfo && walletChainInfo.data && (
          <div className="w-full sm:w-3/4 mx-auto mt-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
              <div className="bg-[#0D1224] p-4 sm:p-6 rounded-xl shadow-xl w-full sm:w-1/2">
                <h3 className="text-lg sm:text-xl font-semibold pb-2">Total Net Worth</h3>
                <p className="text-xl sm:text-2xl text-[#00FF00] pb-2">
                  ${walletData.data.net_worth?.total_networth_usd || 0} USD
                </p>
                <p className="text-xs sm:text-sm text-gray-400">Across all active chains</p>
              </div>
              <div className="bg-[#0D1224] p-4 sm:p-6 rounded-xl shadow-xl w-full sm:w-1/2">
                <h3 className="text-lg sm:text-xl font-semibold">Profitable Summary</h3>
                <div className="space-y-2 mt-2">
                  <p className="text-xs sm:text-sm text-gray-400">
                    Total Trades: {walletChainInfo.data.profitability_summary?.total_count_of_trades || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Trade Volume: ${walletChainInfo.data.profitability_summary?.total_trade_volume || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Realized Profit USD: ${walletChainInfo.data.profitability_summary?.total_realized_profit_usd || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Realized Profit %: {walletChainInfo.data.profitability_summary?.total_realized_profit_percentage || 0}%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Sold Volume USD: ${walletChainInfo.data.profitability_summary?.total_sold_volume_usd || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Bought Volume USD: ${walletChainInfo.data.profitability_summary?.total_bought_volume_usd || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="bg-[#0D1224] p-4 sm:p-6 rounded-xl shadow-xl w-full sm:w-1/2">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">Active Chains</h3>
                <div className="flex justify-between pb-2">
                  <span>Name</span>
                  <span>Value</span>
                </div>
                <div className="space-y-4">
                  {walletData.data.active_chains?.active_chains?.map((chain, index) => (
                    <div key={index} className="flex justify-between items-center pb-2">
                      <div className="flex items-center space-x-3">
                        <img src={Eth} alt={chain.chain} className="h-6 w-6 sm:h-8 sm:w-8 object-contain" />
                        <p className="font-semibold capitalize text-sm sm:text-base">{chain.chain}</p>
                      </div>
                      <div className="text-right font-medium text-sm sm:text-base">
                        +{parseFloat(walletData.data.net_worth?.chains?.[index]?.native_balance_formatted || 0).toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#0D1224] p-4 sm:p-6 rounded-xl shadow-xl w-full sm:w-1/2">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">All Chains</h3>
                <div className="flex justify-between pb-2">
                  <span>Name</span>
                  <span>Value</span>
                </div>
                <div className="space-y-4">
                  {walletData.data.net_worth?.chains?.map((chain, index) => (
                    <div key={index} className="flex justify-between items-center pb-2">
                      <div className="flex items-center space-x-3">
                        <img src={Eth} alt={chain.chain} className="h-6 w-6 sm:h-8 sm:w-8 object-contain" />
                        <p className="font-semibold capitalize text-sm sm:text-base">{chain.chain}</p>
                      </div>
                      <div className="text-right font-medium text-sm sm:text-base">
                        +{parseFloat(chain.native_balance_formatted || 0).toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {showResult && walletChainInfo && walletChainInfo.data && (
          <div className="w-full sm:w-3/4 mx-auto mt-8 bg-[#0D1224] p-4 sm:p-6 rounded-xl shadow-xl space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Recent Transactions</h2>
            {Array.isArray(walletChainInfo.data.wallet_history?.result) && walletChainInfo.data.wallet_history.result.length > 0 ? (
              <div className="space-y-4 overflow-x-auto">
                {walletChainInfo.data.wallet_history.result.slice(0, 5).map((tx, index) => (
                  <div key={index} className="bg-[#1A1F37] p-4 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-400 truncate mb-2 font-semibold">
                      Transaction Hash: {tx.hash || 'N/A'}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="text-xs sm:text-sm text-gray-300 truncate">
                        From: {tx.from_address || 'N/A'}
                      </div>
                      <div className="mx-2 text-white">➡️</div>
                      <div className="text-xs sm:text-sm text-gray-300 truncate">
                        To: {tx.to_address || 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center">
                  {walletChainInfo.data.wallet_history.result.length > 5 && (
                    <button
                      onClick={() =>
                        navigate('/all-transactions', {
                          state: {
                            address: searchInput,
                            searchInput,
                            walletData,
                            walletChainInfo,
                            transactions,
                          },
                        })
                      }
                      className="mt-4 text-blue-400 hover:underline text-sm"
                    >
                      See More
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-400 text-center">No transactions available</p>
            )}
          </div>
        )}

        {/* NFT Card Section */}
        {showResult && walletChainInfo && walletChainInfo.data && Array.isArray(walletChainInfo.data.nfts?.result) && (
          <div
            className={`
              w-full sm:w-3/4
              mx-auto
              mt-8
              bg-[#0D1224]
              p-4 sm:p-6
              rounded-xl
              shadow-xl
              space-y-6
            `} // Split className for clarity, removed potential hidden characters
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-white">NFTs</h2>
            <div className="space-y-4">
              {walletChainInfo.data.nfts.result.map((nft, index) => (
                <div
                  key={index}
                  className="bg-[#1A1F37] p-4 sm:p-4 rounded-lg flex flex-col sm:flex-row sm:items-start sm:space-x-4"
                >
                  <img
                    src={nft.collection_logo || 'https://via.placeholder.com/64'}
                    alt="Collection Logo"
                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover mb-4 sm:mb-0 mt-4 self-center sm:self-start"
                  />
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-400 font-semibold mb-1">
                      Token Address: <span className="text-gray-300 truncate">{nft.token_address || 'N/A'}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 font-semibold mb-1">
                      Name: <span className="text-gray-300">{nft.name || 'Unknown'}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 font-semibold mb-1">
                      Symbol: <span className="text-gray-300">{nft.symbol || 'N/A'}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 font-semibold mb-1">
                      Description: <span className="text-gray-300">{truncateDescription(nft.normalized_metadata?.description)}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 font-semibold mb-1">
                      Collection Category: <span className="text-gray-300 capitalize">{nft.collection_category || 'N/A'}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 font-semibold">
                      Project URL:{' '}
                      {nft.project_url ? (
                        <a
                          href={nft.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline truncate"
                        >
                          {nft.project_url}
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/all-nfts', { state: { address: searchInput } })}
                className="mt-4 mx-auto block text-blue-400 hover:underline text-sm"
              >
                See More
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProfileByAddress;