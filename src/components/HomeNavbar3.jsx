import React, { useState, useEffect } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { useNavigate, useLocation, Link } from "react-router-dom";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import PopupModal from "./reusable/PopupModel"; // Note: Should this be PopupModal?
import ForgotPassword from "../pages/ForgetPassword";
import Cookies from 'js-cookie'; 
import ProfileDropdown from "./ProfileDropdown";

export default function HomeNavbar3({ openModalFromParent }) { // Added prop
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Changed to false for consistency
  const [modalContent, setModalContent] = useState('');

  const token = Cookies.get('access_token');
  const menuData = [
    { label: "Home", path: "/" },
    { label: "Features", path: "/features" },
    { label: "Pricing", path: "/pricing" },
  ];

  const getActiveTab = () => {
    const activeItem = menuData.find((item) => item.path === location.pathname);
    return activeItem ? activeItem.label : "Home";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const handleMenuClick = (label, path) => {
    setActiveTab(label);
    navigate(path);
    setMenuOpen(false);
  };

  const openModal = (content) => {
    setIsModalOpen(true);
    setModalContent(content);
  };

  // Use the callback from parent if provided
  useEffect(() => {
    if (openModalFromParent) {
      openModalFromParent(openModal); // Pass the openModal function to the parent
    }
  }, [openModalFromParent]);

  return (
    <header className="w-full fixed top-0 bg-gradient-to-r from-[#0a0a1a] to-[#0d0d2b] px-6 py-4 flex items-center justify-between text-white z-50 shadow-md">
      <div className="flex items-center gap-3">
        <img src="/bluehawk-w.png" alt="logo" className="h-12 w-auto" />
      </div>

      <div className="hidden md:flex items-center bg-[#161636] px-4 py-2 rounded-full">
        {menuData.map((item, index) => (
          <p
            key={index}
            onClick={() => handleMenuClick(item.label, item.path)}
            className={`mr-2 cursor-pointer px-4 py-1 rounded-full transition-all duration-300 relative
                            ${
                              activeTab === item.label
                                ? "text-white bg-gradient-to-r from-[#6a11cb] to-[#2575fc]"
                                : "text-gray-300 hover:text-white hover:bg-gradient-to-r from-[#6a11cb] to-[#2575fc]"
                            }
                        `}
          >
            {item.label}
          </p>
        ))}
      </div>
      {!token ? (
        <div className="hidden md:flex gap-3 items-center">
          <p
            onClick={() => openModal("Sign-up")}
            className="text-white text-sm px-4 py-1 rounded-full cursor-pointer transition-all duration-300 hover:bg-gradient-to-r from-[#6a11cb] to-[#2575fc]"
          >
            Sign-up
          </p>
          <p
            onClick={() => openModal("Sign-in")}
            className="text-white text-sm px-4 py-1 rounded-full cursor-pointer transition-all duration-300 bg-gradient-to-r from-[#6a11cb] to-[#2575fc]"
          >
            Sign-in
          </p>
        </div>
      ) : (
        <div className="flex justify-between items-center gap-4">
          <ProfileDropdown />
        </div>
      )}

      <div
        className="md:hidden cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
      </div>

      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#0a0a1a] flex flex-col items-center py-4 shadow-lg md:hidden">
          {menuData.map((item, index) => (
            <p
              key={index}
              onClick={() => handleMenuClick(item.label, item.path)}
              className={`cursor-pointer py-2 w-full text-center text-lg transition-all duration-300
                                ${
                                  activeTab === item.label
                                    ? "text-white bg-gradient-to-r from-[#6a11cb] to-[#2575fc]"
                                    : "text-gray-300 hover:text-white hover:bg-gradient-to-r from-[#6a11cb] to-[#2575fc]"
                                }
                            `}
            >
              {item.label}
            </p>
          ))}
          <p
            onClick={() => openModal("Sign-up")}
            className="text-white text-lg px-6 py-2 rounded-full cursor-pointer mt-2 transition-all duration-300 hover:bg-gradient-to-r from-[#6a11cb] to-[#2575fc]"
          >
            Sign-up
          </p>
          <p
            onClick={() => openModal("Sign-in")}
            className="text-white text-lg px-6 py-2 rounded-full cursor-pointer mt-2 transition-all duration-300 hover:bg-gradient-to-r from-[#6a11cb] to-[#2575fc]"
          >
            Sign-in
          </p>
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
    </header>
  );
}