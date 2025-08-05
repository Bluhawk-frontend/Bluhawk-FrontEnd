import React from 'react'
// import Navbar from '../components/HomeNavbar'

export default function Pricing() {
  return (
    <>
    {/* <Navbar/> */}
    <div className="min-h-screen bg-[#010314] flex flex-col items-center justify-center p-6 text-white">
      {/* Header */}
      <h2 className="text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
        Choose Your Plan
      </h2>
      <p className="text-gray-400 text-lg mb-10 text-center max-w-xl">
        Select the best plan that suits your needs. Upgrade anytime!
      </p>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-10">
        
        {/* Basic Plan */}
        <div className="bg-royalBlue bg-opacity-40 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-700 transform hover:scale-105 transition duration-300">
          <h3 className="text-2xl font-semibold text-center">Basic</h3>
          <p className="text-4xl font-bold text-center mt-2">$9<span className="text-lg font-normal">/month</span></p>
          <ul className="mt-6 space-y-3 text-sm text-gray-300">
            <li>✔️ 5GB Storage</li>
            <li>✔️ Email Support</li>
            <li>✔️ Community Access</li>
          </ul>
          <button className="w-full mt-6 py-3 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow-lg hover:shadow-blue-500 transition duration-300">
            Get Started
          </button>
        </div>

        {/* Standard Plan (Highlighted) */}
        <div className="bg-royalBlue bg-opacity-60 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-blue-500 transform hover:scale-105 transition duration-300 relative">
          <div className="absolute top-0 right-0 bg-blue-500 text-xs text-white px-3 py-1 rounded-bl-md">
            Most Popular
          </div>
          <h3 className="text-2xl font-semibold text-center">Standard</h3>
          <p className="text-4xl font-bold text-center mt-2">$19<span className="text-lg font-normal">/month</span></p>
          <ul className="mt-6 space-y-3 text-sm text-gray-300">
            <li>✔️ 50GB Storage</li>
            <li>✔️ Priority Email Support</li>
            <li>✔️ Access to Premium Features</li>
          </ul>
          <button className="w-full mt-6 py-3 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow-lg hover:shadow-blue-500 transition duration-300">
            Get Started
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-royalBlue bg-opacity-40 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-700 transform hover:scale-105 transition duration-300">
          <h3 className="text-2xl font-semibold text-center">Premium</h3>
          <p className="text-4xl font-bold text-center mt-2">$29<span className="text-lg font-normal">/month</span></p>
          <ul className="mt-6 space-y-3 text-sm text-gray-300">
            <li>✔️ 1TB Storage</li>
            <li>✔️ 24/7 Support</li>
            <li>✔️ All Premium Features</li>
          </ul>
          <button className="w-full mt-6 py-3 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow-lg hover:shadow-blue-500 transition duration-300">
            Get Started
          </button>
        </div>

      </div>
    </div>
    </>
  )
}
