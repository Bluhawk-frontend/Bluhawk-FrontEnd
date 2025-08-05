import React from "react";

const NoMatchesFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <div className="flex flex-col items-center">
        <div className="bg-gray-800 p-6 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M21 21l-4.35-4.35M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mt-4">No matches found</h2>
        <p className="text-gray-400 text-center max-w-lg mt-2">
          Alternatively, do you want to locate your threat based on static, dynamic, content,
          attribution or other advanced IoC context? Our platform allows you to search across
          our entire threat corpus using a myriad of modifiers, <a href="#" className="text-blue-400 underline">learn more</a>.
        </p>
        <div className="mt-6 flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition">
            Try out our offering
          </button>
          <button className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-400 transition">
            Try a new search
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoMatchesFound;
