import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { IoPersonSharp } from "react-icons/io5";
import PopupModal from "./reusable/PopupModel";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import ForgotPassword from "../pages/ForgetPassword";
import { LogIn, UserPlus } from 'lucide-react';
import { FiBarChart2, FiSettings, FiLogOut } from "react-icons/fi";

const ProfileDropdown = ({ isWhiteNavbar, openModalFromParent }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const profileRef = useRef(null);

  const isLoggedIn = !!Cookies.get("access_token");

 

  const handleClickOutside = (event) => {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    Cookies.remove("refresh_token");
    Cookies.remove("access_token");
    localStorage.clear();
    navigate("/login");
    setShowDropdown(false);
  };

  const openModal = (content) => {
    setIsModalOpen(true);
    setModalContent(content);
  };

  useEffect(() => {
    if (openModalFromParent) {
      openModalFromParent(openModal);
    }
  }, [openModalFromParent]);

  const handleSignIn = () => {
    openModal("Sign-in");
    setShowDropdown(false);
  };

  const handleSignUp = () => {
    openModal("Sign-up");
    setShowDropdown(false);
  };

  const handleSettings = () => {
    navigate("/settings");
    setShowDropdown(false);
  };

  return (
    <div ref={profileRef} className="relative">
      <button
        className={`flex items-center justify-center ${
          isWhiteNavbar ? "text-gray-900" : "text-white"
        }`}
        onClick={() => {
          console.log("Profile button clicked, toggling dropdown");
          setShowDropdown((prev) => !prev);
        }}
      >
        <IoPersonSharp size={26} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg py-1 px-2 w-48 z-50">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  navigate("/usage");
                  setShowDropdown(false);
                }}
                className="text-sm font-semibold flex items-center gap-2 px-4 py-2 text-gray-700  hover:bg-blue-100 w-full text-left"
              >
                <FiBarChart2 className="text-base" />
                Usage
              </button>
              <button
                onClick={handleSettings}
                className="text-sm font-semibold flex items-center gap-2 px-4 py-2 text-gray-700  hover:bg-blue-100  w-full text-left"
              >
                <FiSettings className="text-base" />
                Settings
              </button>
              
              <hr className="my-1 border-gray-200 " />
              <button
                onClick={handleSignOut}
                className="text-sm font-semibold flex items-center gap-2 px-4 py-2 text-gray-700 0 hover:bg-blue-100  w-full text-left"
              >
                <FiLogOut className="text-base" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSignIn}
                className="text-sm font-semibold flex items-center gap-2 px-4 py-2 text-gray-700  hover:bg-blue-100 w-full text-left"
              >
                <LogIn size={16} />
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="text-sm font-semibold flex items-center gap-2 px-4 py-2 text-gray-700  hover:bg-blue-100  w-full text-left"
              >
                <UserPlus size={16} />
                Sign Up
              </button>
              
            </>
          )}
        </div>
      )}

      <PopupModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="w-full max-w-[90%] md:max-w-[400px] p-4"
      >
        {modalContent === "Sign-in" ? (
          <SignIn setModalContent={setModalContent} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        ) : modalContent === "Sign-up" ? (
          <SignUp setModalContent={setModalContent} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        ) : modalContent === "forgot-password" ? (
          <ForgotPassword setModalContent={setModalContent} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        ) : (
          <></>
        )}
      </PopupModal>
    </div>
  );
};

export default ProfileDropdown;