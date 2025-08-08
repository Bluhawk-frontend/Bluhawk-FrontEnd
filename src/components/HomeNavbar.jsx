import React, { useState, useEffect } from "react";
import { IoMenu, IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import ForgotPassword from "../pages/ForgetPassword";
import Cookies from "js-cookie";
import { IoClose } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import ProfileDropdown from "./ProfileDropdown";
import PopupModal from "./reusable/PopupModel";



export default function HomeNavbar({ securityFeatures, setSelectedFeature, openModalFromParent }) {
  // console.log('HomeNavbar received props:', { securityFeatures, setSelectedFeature });
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navbarBg, setNavbarBg] = useState("blue");
  const [logoSrc, setLogoSrc] = useState("/bluehawk-w.png");

  const token = Cookies.get("access_token");

  const menuData = [
    { label: "Home", sectionId: "hero" },
    { label: "About", sectionId: "about-us" },
    {
      label: "Services",
      sectionId: "services",
      hasDropdown: true,
      subItems: [
        { label: "Network Security", sectionId: "network-security" },
        { label: "Adversary Intelligence", sectionId: "adversary-intelligence" },
        { label: "Vulnerability Intelligence", sectionId: "vulnerability-intelligence" },
        { label: "Real-Time Monitoring", sectionId: "real-time-monitoring" },
        { label: "Asset Analysis", sectionId: "asset-analysis" },
        { label: "Threat Prioritization", sectionId: "threat-prioritization" },
        { label: "Automated Scanning", sectionId: "automated-scanning" },
        { label: "MITRE ATT&CK Mapping", sectionId: "mitre-attack-mapping" },
      ],
    },
    { label: "Contact",sectionId:  "footer" },
  ];

  const openModal = (content) => {
    setIsModalOpen(true);
    setModalContent(content);
    setProfileDropdownOpen(false);
  };

  const handleNavigation = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.sectionId) {
      if (item.sectionId === "services") {
        const section = document.getElementById("security-slide");
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        } else {
          navigate("/");
          setTimeout(() => {
            document.getElementById("security-slide")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      } else if (item.sectionId === "about-us") {  // Updated About navigation
        const section = document.getElementById("about-us");
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        } else {
          navigate("/");
          setTimeout(() => {
            document.getElementById("about-us")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      } else if (item.sectionId.includes("-")) {
        const section = document.getElementById("security-slide");
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
          const featureMap = {
            "network-security": "Network Security",
            "adversary-intelligence": "Adversary Intelligence",
            "vulnerability-intelligence": "Vulnerability Intelligence",
            "real-time-monitoring": "Real-Time Monitoring",
            "asset-analysis": "Asset Analysis",
            "threat-prioritization": "Threat Prioritization",
            "automated-scanning": "Automated Scanning",
            "mitre-attack-mapping": "MITRE ATT&CK Mapping"
          };    


          
          const featureName = featureMap[item.sectionId];
          if (featureName && securityFeatures && setSelectedFeature) {
            const feature = securityFeatures.find(f => f.name === featureName);
            if (feature) {
              setSelectedFeature(feature);
            }
          }
        } else {
          navigate("/");
          setTimeout(() => {
            const section = document.getElementById("security-slide");
            section?.scrollIntoView({ behavior: "smooth" });
            const featureMap = {
              "network-security": "Network Security",
              "adversary-intelligence": "Adversary Intelligence",
              "vulnerability-intelligence": "Vulnerability Intelligence",
              "real-time-monitoring": "Real-Time Monitoring",
              "asset-analysis": "Asset Analysis",
              "threat-prioritization": "Threat Prioritization",
              "automated-scanning": "Automated Scanning",
              "mitre-attack-mapping": "MITRE ATT&CK Mapping"
            };
            
            const featureName = featureMap[item.sectionId];
            if (featureName && securityFeatures && setSelectedFeature) {
              const feature = securityFeatures.find(f => f.name === featureName);
              if (feature) {
                setSelectedFeature(feature);
              }
            }
          }, 100);
        }
      } else {
        const section = document.getElementById(item.sectionId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        } else {
          navigate("/");
          setTimeout(() => {
            document.getElementById(item.sectionId)?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }
    }
    setDropdownOpen(false);
  };

  const handleSearch = () => {
    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    const sectionMap = {
      // Hero Section keywords
      'home': 'hero',
      'welcome': 'hero',
      'cybersecurity': 'hero',
      'quote': 'hero',
      // Features Section keywords
      'features': 'features',
      'threat intelligence': 'features',
      'System Audit': 'features',
      'Malware Removal': 'features',
      // About Us Section keywords
      'about': 'about-us',
      'about us': 'about-us',
      'company': 'about-us',
      'who we are': 'about-us',
      // Services Section keywords
      'services': 'services',
      'offerings': 'services',
      'products': 'services',
      // Security Slide Section keywords
      'security': 'security-slide',
      'protection': 'security-slide',
      'threats': 'security-slide',
      'network': 'security-slide',
      // Feedback/Testimonial Section keywords
      'feedback': 'feedback-testimonial',
      'testimonials': 'feedback-testimonial',
      'reviews': 'feedback-testimonial',
      'customers': 'feedback-testimonial'
    };
    // Check if the search query matches any section
    const matchedSection = Object.keys(sectionMap).find(key => 
      key.startsWith(lowerCaseQuery) || lowerCaseQuery.startsWith(key)
    );

    if (matchedSection) {
      const sectionId = sectionMap[matchedSection];
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
      setSearchQuery("");
    }
  };

  useEffect(() => {
    const sections = document.querySelectorAll("section[data-bg]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionBg = entry.target.getAttribute("data-bg");
            setNavbarBg(sectionBg);
            if (sectionBg === "blue") {
              setLogoSrc("/bluhawk-blackbg.png");
            } else if (sectionBg === "white") {
              setLogoSrc("/bluhawk-blackbg.png");
            }
          }
        });
      },
      { threshold: 0.9 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Pass openModal to HomePage via openModalFromParent
  useEffect(() => {
    if (openModalFromParent) {
      openModalFromParent(openModal);
    }
  }, [openModalFromParent]);

  let openModalFromNavbar;

  // Function to receive openModal from HomeNavbar2
  const handleOpenModalFromNavbar = (openModalFunc) => {
    openModalFromNavbar = openModalFunc; // Store the function reference
  };

  // New function to handle logo click
  const handleLogoClick = () => {
    // console.log("Logo clicked, navigating to /"); // Debug log
    navigate("/"); // Use navigate to go to home page
  };
  return (
   <header
  className={`w-full fixed top-0 py-4 flex items-center justify-center z-50 shadow-md transition-all duration-300 ${
    navbarBg === "blue" ? "bg-[#0a0a1a]" : "bg-white"
  }`}
>
  <div className="w-full max-w-[1350px] flex items-center justify-between px-6">
    {/* Left Section: Logo */}
    <div className="flex items-center">
      <button onClick={handleLogoClick} className="focus:outline-none">
        <img
          src={logoSrc}
          alt="logo"
          className="h-10 w-auto min-w-[40px] md:h-12" // Adjusted height for responsiveness
          onError={(e) => {
            console.error("Failed to load logo:", e.target.src);
            e.target.src = "/fallback-logo.png"; // Ensure fallback exists
          }}
        />
      </button>
    </div>

    {/* Center Section: Navigation (Hidden on small screens) */}
    <div className="hidden md:flex justify-center w-full md:w-auto">
      <nav className="flex items-center gap-6 md:gap-10">
        {menuData.map((item, index) => (
          <div
            key={index}
            className="relative group"
            onMouseEnter={() => setOpenDropdown(index)}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <p
              onClick={() => handleNavigation(item)}
              className={`cursor-pointer text-lg flex items-center gap-2 font-semibold ${
                navbarBg === "blue"
                  ? "text-white hover:text-[#FE5E15]"
                  : "text-gray-800 hover:text-[#FE5E15]"
              }`}
            >
              {item.label}
              {item.hasDropdown && (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </p>
            {item.hasDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-[#161636] text-white rounded-md shadow-lg w-64 py-3 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                {item.subItems.map((subItem, subIndex) => (
                  <p
                    key={subIndex}
                    onClick={() => handleNavigation(subItem)}
                    className="cursor-pointer px-5 py-3 text-base hover:text-[#FE5E15]"
                  >
                    {subItem.label}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>

    {/* Right Section: Search, Profile, Hamburger Menu */}
    <div className="flex items-center gap-4 md:gap-6">
      {/* Search Bar (Hidden on small screens) */}
      <div
        className={`hidden md:flex items-center px-4 py-2 rounded-full w-56 relative ${
          navbarBg === "blue" ? "bg-white" : "bg-gray-100"
        }`}
      >
        <IoSearch
          className={`mr-3 cursor-pointer ${
            navbarBg === "blue" ? "text-gray-400" : "text-gray-600"
          }`}
          size={24}
          onClick={handleSearch}
        />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className={`bg-transparent outline-none w-full text-base ${
            navbarBg === "blue"
              ? "text-blue placeholder-gray-400"
              : "text-gray-800 placeholder-gray-500"
          }`}
        />
        {searchQuery && (
          <IoClose
            className={`cursor-pointer absolute right-4 ${
              navbarBg === "blue" ? "text-gray-200" : "text-gray-600"
            }`}
            size={24}
            onClick={() => setSearchQuery("")}
          />
        )}
      </div>

      {/* Profile Dropdown */}
      <div className="relative">
        <ProfileDropdown
          isWhiteNavbar={navbarBg === "white"}
          openModalFromParent={handleOpenModalFromNavbar}
        />
      </div>

      {/* Hamburger Menu (Visible on small screens) */}
      <div className="md:hidden relative">
        <IoMenu
          size={32}
          className={`cursor-pointer ${
            navbarBg === "blue" ? "text-white" : "text-gray-800"
          }`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        />
        {dropdownOpen && (
          <div className="absolute top-12 right-0 bg-[#161636] text-white rounded-md shadow-lg w-48 py-3 z-50">
            {menuData.map((item, index) => (
              <div key={index}>
                <p
                  onClick={() => handleNavigation(item)}
                  className="cursor-pointer px-5 py-3 text-base hover:bg-[#FE5E15]"
                >
                  {item.label}
                </p>
                {item.hasDropdown && (
                  <div className="pl-5">
                    {item.subItems.map((subItem, subIndex) => (
                      <p
                        key={subIndex}
                        onClick={() => handleNavigation(subItem)}
                        className="cursor-pointer px-5 py-2 text-sm hover:text-[#FE5E15]"
                      >
                        {subItem.label}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Popup Modal */}
  <PopupModal
    isOpen={isModalOpen}
    setIsOpen={setIsModalOpen}
    onClose={() => setIsModalOpen(false)}
    className="w-full max-w-[90%] md:max-w-[400px] p-4"
  >
    {modalContent === "Sign-in" ? (
      <SignIn
        setModalContent={setModalContent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    ) : modalContent === "Sign-up" ? (
      <SignUp
        setModalContent={setModalContent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    ) : modalContent === "forgot-password" ? (
      <ForgotPassword
        setModalContent={setModalContent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    ) : (
      <></>
    )}
  </PopupModal>
</header>
  );
}