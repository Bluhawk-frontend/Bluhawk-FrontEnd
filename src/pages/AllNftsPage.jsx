import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NewNavbar from '../components/reusable/NewNavbar';
const AllNftsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { address } = location.state || {}; // Get address from navigation state
  const [nfts, setNfts] = useState([]);
  const [cursor, setCursor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextCursor, setNextCursor] = useState(null);
  useEffect(() => {
    const fetchNfts = async () => {
      if (!address) {
        setError('No wallet address provided.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const url = `${import.meta.env.VITE_API_BASE_URL}/crypto/nftswallet_history/?address=${address}&cursor=${cursor}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.message === 'success') {
          setNfts((prevNfts) => [...prevNfts, ...(data.data.result || [])]); // Append new NFTs for pagination
          setNextCursor(data.data.cursor || null);
        } else {
          setError('Failed to load NFTs.');
        }
      } catch (err) {
        setError('Something went wrong while fetching NFTs.');
      } finally {
        setLoading(false);
      }
    };
    fetchNfts();
  }, [address, cursor]);
  const handleNextPage = () => {
    if (nextCursor) {
      setCursor(nextCursor);
    }
  };
  // Helper function to truncate description (same as in original component)
  const truncateDescription = (description) => {
    if (!description) return 'N/A';
    return description.length > 100 ? `${description.substring(0, 100)}...` : description;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060B1A] to-[#0F172A] text-white">
      <NewNavbar />
      <button
        onClick={() => navigate(-1)}
        className="absolute top-[100px] left-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-all"
      >
        ← Back
      </button>
      <div className="w-3/4 mx-auto mt-8 bg-[#0D1224] p-6 rounded-xl shadow-xl space-y-6 mx-auto px-6 py-20">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-gradient">All NFTs</h1>
        {error && (
          <div className="bg-red-800/70 border border-red-500 text-red-200 px-6 py-3 rounded mb-6 shadow-lg">
            {error}
          </div>
        )}
        {loading && !nfts.length ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : nfts.length > 0 ? (
          <div className="space-y-4">
            {nfts.map((nft, index) => (
              <div
                key={index}
                className="bg-[#1A1F37] p-4 rounded-lg flex flex-col sm:flex-row sm:items-start sm:space-x-4"
              >
                {/* Collection Logo */}
                <img
                  src={nft.collection_logo || 'https://via.placeholder.com/64'}
                  alt="Collection Logo"
                  className="h-16 w-16 rounded-full object-cover mb-4 sm:mb-0 mt-4 self-center sm:self-center"
                />
                {/* NFT Details */}
                <div className="flex-1">
                  <p className="text-sm text-gray-400 font-semibold mb-1">
                    Token Address: <span className="text-gray-300 break-all">{nft.token_address}</span>
                  </p>
                  <p className="text-sm text-gray-400 font-semibold mb-1">
                    Name: <span className="text-gray-300">{nft.name || 'Unknown'}</span>
                  </p>
                  <p className="text-sm text-gray-400 font-semibold mb-1">
                    Symbol: <span className="text-gray-300">{nft.symbol || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-gray-400 font-semibold mb-1">
                    Description:{' '}
                    <span className="text-gray-300">
                      {truncateDescription(nft.normalized_metadata?.description)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400 font-semibold mb-1">
                    Collection Category:{' '}
                    <span className="text-gray-300 capitalize">{nft.collection_category || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-gray-400 font-semibold">
                    Project URL:{' '}
                    {nft.project_url ? (
                      <a
                        href={nft.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline break-all"
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
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No NFTs found for this address.</p>
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
export default AllNftsPage;