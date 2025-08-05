import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NewNavbar from '../components/reusable/NewNavbar';
const AllTransactionsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { address, searchInput, walletData, walletChainInfo, transactions: prevTransactions } = location.state || {};
  const [transactions, setTransactions] = useState([]);
  const [cursor, setCursor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextCursor, setNextCursor] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!address) {
        setError('No wallet address provided.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const url = `${import.meta.env.VITE_API_BASE_URL}/crypto/wallet_history/?address=${address}&cursor=${cursor}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.message === 'success') {
          setTransactions((prev) => [...prev, ...(data.data.result || [])]);
          setNextCursor(data.data.cursor || null);
        } else {
          setError('Failed to load transactions.');
        }
      } catch (err) {
        setError('Something went wrong while fetching transactions.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [address, cursor]);

  const handleNextPage = () => {
    if (nextCursor) {
      setCursor(nextCursor);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060B1A] to-[#0F172A] text-white">
      <NewNavbar />
      <button
        onClick={() =>
          navigate('/profile-by-address', {
            state: {
              searchInput,
              walletData,
              walletChainInfo,
              transactions: prevTransactions,
            },
          })
        }
        className="absolute top-[100px] left-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-all"
      >
        ← Back
      </button>
      <div className="w-3/4 mx-auto mt-8 bg-[#0D1224] p-6 rounded-xl shadow-xl space-y-6 mx-auto px-6 py-20">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-gradient">All Transactions</h1>
        {error && (
          <div className="bg-red-800/70 border border-red-500 text-red-200 px-6 py-3 rounded mb-6 shadow-lg">
            {error}
          </div>
        )}
        {loading && !transactions.length ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <div key={index} className="bg-[#1A1F37] p-4 rounded-lg">
                <p className="text-sm text-gray-400 break-all mb-2 font-semibold">
                  Transaction Hash: {tx.hash}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-gray-300 break-all">
                    From: {tx.from_address}
                  </div>
                  <div className="mx-2 text-white">➡️</div>
                  <div className="text-xs sm:text-sm text-gray-300 break-all">
                    To: {tx.to_address}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No transactions found for this address.</p>
          </div>
        )}
        {nextCursor && (
          <div className="flex justify-center mt-10">
            <button
              onClick={handleNextPage}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTransactionsPage;