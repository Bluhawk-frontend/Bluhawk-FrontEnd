import React, { useState } from 'react';
import { FaInstagram, FaFacebookF, FaTwitter, FaYoutube } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleSubscribeClick = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };
  const handleNavigation = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.sectionId) {
      const section = document.getElementById(item.sectionId);
      if (section) {
        const yOffset = item.sectionId === 'feedback-testimonial' ? -80 : item.sectionId === 'ceo-words' ? -140 : 0;
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          document.getElementById(item.sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };
  return (
    <footer className="border-t border-gray-700 bg-[#015265] text-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Left Section */}
        <div className="flex flex-col items-start">
           <a href="/" className="flex items-center gap-0">
  <img
    src="/bluhawk-blackbg.png"
    alt="BluHawk Logo"
    className="w-[140px] sm:w-[166px] h-auto m-0"
  />
  <span className="text-white text-xl font-bold ml-[-30px]">BluHawk</span>
</a>



          <p className="text-sm mt-2">
            BluHawk uses AI-driven threat intelligence and automation to neutralize cyber threats in real time, seamlessly integrating with existing security for adaptive defense.
          </p>
          <p className="text-lg font-semibold mt-4">Newsletter</p>
          <button
            className="bg-[#9F4B4E] text-white px-4 py-2 mt-2 rounded"
            onClick={handleSubscribeClick}
          >
            Subscribe
          </button>
        </div>

        {/* Middle Section - Services */}
        <div className="px-0 md:px-20 flex flex-col items-start">
          <h3 className="text-lg font-semibold">Services Links</h3>
          <ul className="grid gap-2 text-sm mt-4">
            <li onClick={() => handleNavigation({ sectionId: 'hero' })} className="cursor-pointer hover:text-vibrantOrange">
              &gt; Home
            </li>
            <li onClick={() => handleNavigation({ sectionId: 'about-us' })} className="cursor-pointer hover:text-vibrantOrange">
              &gt; About
            </li>
            <li onClick={() => handleNavigation({ sectionId: 'services' })} className="cursor-pointer hover:text-vibrantOrange">
              &gt; Services
            </li>
            <li onClick={() => handleNavigation({ sectionId: 'feedback-testimonial' })} className="cursor-pointer hover:text-vibrantOrange">
              &gt; Reviews
            </li>
            <li onClick={() => handleNavigation({ sectionId: 'ceo-words' })} className="cursor-pointer hover:text-vibrantOrange">
              &gt; The CEO's words
            </li>
          </ul>
        </div>

        {/* Right Section - Contact Info */}
        <div className="flex flex-col items-start">
          <h3 className="text-lg font-semibold mb-3">Information</h3>
          <p className="text-sm py-2">
            <span className="font-bold text-[#B54A4A]">Location:</span> N-Heights, 5th Floor, HITEC City, Hyderabad
          </p>
          <p className="text-sm py-2">
            <span className="font-bold text-[#B54A4A]">Tel:</span> +91 846-602-2022
          </p>
          <p className="text-sm py-2">
            <span className="font-bold text-[#B54A4A]">Email:</span> info@bluecloudsoftech.com
          </p>
          {/* Social Media Icons */}
          <div className="flex space-x-4 mt-3">
            <FaTwitter className="text-[#9F4B4E] text-xl cursor-pointer  hover:text-orange-600" />
            <FaFacebookF className="text-[#9F4B4E] text-xl cursor-pointer hover:text-orange-600" />
            <FaYoutube className="text-[#9F4B4E] text-xl cursor-pointer hover:text-orange-600" />
            <FaInstagram className="text-[#9F4B4E] text-xl cursor-pointer hover:text-orange-600" />
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="text-center text-sm py-4 bg-[#0a1122]">
        Copyright © 2025 <span className="text-[#9F4B4E]">BluHawk</span> All Rights Reserved
      </div>

      {/* Subscription Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md sm:max-w-lg flex flex-col justify-center">
            <h2 className="text-lg text-vibrantOrange font-semibold text-center">
              Subscribe to receive the latest cybersecurity insights & threat intelligence once a week
            </h2>
            <div className="flex flex-col mt-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 text-black border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="bg-denimBlue hover:bg-vibrantOrange text-white px-4 py-2 mt-3 rounded transition w-32">
                Subscribe
              </button>
            </div>
            <p className="text-sm mt-4 text-denimBlue text-center">
              You can always unsubscribe from this mailing list by clicking on the link "Unsubscribe" at the bottom of the letter.
            </p>
            <button
              className="absolute top-2 right-2 p-2 text-gray-500 hover:text-red-700"
              onClick={handleClosePopup}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}