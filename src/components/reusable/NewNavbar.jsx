import React, { useState, useEffect, useRef } from "react";
import ProfileDropdown from "../ProfileDropdown";
import NotificationDropdown from "../NotificationDropdown";
import { useNavigate } from "react-router-dom";
import { IoMenu, IoClose } from "react-icons/io5";

export default function NewNavbar() {
  const navigation = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const logoSrc = "";

  const handleNavigation = (path) => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    setTimeout(() => navigation(path), 100);
  };

  const handleLogoClick = () => navigation("/");

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 bg-[#0d0d1a] z-50 text-white py-4 flex justify-center items-center shadow-lg">
      <div
        ref={navRef}
        className="w-full max-w-[1350px] flex items-center justify-between px-4 sm:px-6"
      >
        {/* Logo + Nav */}
        <div className="flex items-center gap-4 sm:gap-8 md:gap-14">
          <button onClick={handleLogoClick}>
            <img
              src={logoSrc}
              alt="logo"
              className="h-10 w-auto min-w-[40px] md:h-12"
              onError={(e) => {
                console.error("Failed to load logo:", logoSrc);
                e.target.src = "/bluhawk-blackbg.png";
              }}
            />
          </button>

          <nav className="hidden md:flex gap-8 text-base font-semibold">
            <a
              href="/dashboard"
              className="hover:text-[#94A3B8] transition-colors"
            >
              Dashboard
              
            </a>
            <a
              href="/attack-credential"
              className="hover:text-[#94A3B8] transition-colors"
            >
              Attack Surface
            </a>

            {/* Vulnerability Intel */}
            <div className="relative">
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "vuln" ? null : "vuln"
                  )
                }
                className="hover:text-[#94A3B8]"
              >
                Vulnerability Intel
              </button>
              {activeDropdown === "vuln" && (
                <div className="absolute top-full mt-2 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] shadow-xl w-56 rounded-xl p-2 backdrop-blur-md border border-gray-700">
                  <button
                    onClick={() => handleNavigation("/my-intel")}
                    className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-[#533483] rounded-lg w-full text-left"
                  >
                    My Intel
                  </button>
                  <button
                    onClick={() => handleNavigation("/cpe")}
                    className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-[#533483] rounded-lg w-full text-left"
                  >
                    Vendors & Products
                  </button>
                </div>
              )}
            </div>

            {/* Threat Intel */}
            <div className="relative">
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "threat" ? null : "threat"
                  )
                }
                className="hover:text-[#94A3B8]"
              >
                Threat Intel
              </button>
              {activeDropdown === "threat" && (
                <div className="absolute top-full mt-2 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] shadow-xl w-60 rounded-xl p-2 backdrop-blur-md border border-gray-700">
                  <button
                    onClick={() => handleNavigation("/find-intel")}
                    className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-[#533483] rounded-lg w-full text-left"
                  >
                    Domain/IP/URL/Hashfile
                  </button>

                  {/* Wildcard Intel */}
                  <div className="relative group">
                    <button className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-[#533483] rounded-lg w-full text-left">
                      Wildcard Intel
                    </button>
                    <div className="absolute left-full top-0 ml-2 hidden group-hover:block bg-gradient-to-r from-[#1a1a2e] to-[#16213e] shadow-xl w-56 rounded-xl p-2 backdrop-blur-md border border-gray-700">
                      {[
                        { path: "deep-account-search", label: "Deep Account Search" },
                        { path: "who-is", label: "Whois" },
                        { path: "ip-info", label: "IP Info" },
                        { path: "phone-number-info", label: "Phone No Info" },
                        { path: "ssl-info", label: "SSL Info" },
                        { path: "username-search", label: "User Name" },
                        { path: "domain-wayback", label: "Domain Wayback" },
                        { path: "scan-for-cve", label: "Scan For CVE" },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={() =>
                            handleNavigation(`/wildcard-intel?option=${item.path}`)
                          }
                          className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-[#533483] rounded-lg w-full text-left"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Web3 */}
                  <div className="relative group">
                    <button className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-[#533483] rounded-lg w-full text-left">
                      Web3
                    </button>
                    <div className="absolute left-full top-0 ml-2 hidden group-hover:block bg-gradient-to-r from-[#1a1a2e] to-[#16213e] shadow-xl w-48 rounded-xl p-2 backdrop-blur-md border border-gray-700">
                      <button
                        onClick={() => handleNavigation("/profile-by-address")}
                        className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-[#533483] rounded-lg w-full text-left"
                      >
                        Profile By Address
                      </button>
                    </div>
                  </div>

                  {/* Business */}
                  <div className="relative group">
                    <button className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-[#533483] rounded-lg w-full text-left">
                      Business
                    </button>
                    <div className="absolute left-full top-0 ml-2 hidden group-hover:block bg-gradient-to-r from-[#1a1a2e] to-[#16213e] shadow-xl w-56 rounded-xl p-2 backdrop-blur-md border border-gray-700">
                      {[
                        { path: "/company", label: "Company Info" },
                        { path: "/company-corp-data", label: "Company Corp Data" },
                        { path: "/digital-footprint", label: "Digital Footprint" },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleNavigation(item.path)}
                          className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-[#533483] rounded-lg w-full text-left"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Malware Analysis */}
            <div className="relative">
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "malware" ? null : "malware"
                  )
                }
                className="hover:text-[#94A3B8]"
              >
                Malware Analysis
              </button>
              {activeDropdown === "malware" && (
                <div className="absolute top-full mt-2 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] shadow-xl w-56 rounded-xl p-2 backdrop-blur-md border border-gray-700">
                  <button
                    onClick={() => handleNavigation("/upload-file")}
                    className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-[#533483] rounded-lg w-full text-left"
                  >
                    Analyze File
                  </button>
                  <button
                    onClick={() => handleNavigation("/odix")}
                    className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-[#533483] rounded-lg w-full text-left"
                  >
                    (ODIX)
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center gap-4">
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? (
                <IoClose size={28} className="text-white" />
              ) : (
                <IoMenu size={28} className="text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#0d0d1a] text-white shadow-xl md:hidden transition-all duration-300 ease-in-out">
            <nav className="flex flex-col gap-2 p-4">
              <a
                href="/dashboard"
                className="hover:text-[#9d4edd] font-medium text-base py-2"
              >
                Dashboard
              </a>
              <button
                onClick={() => handleNavigation("/attack-credential")}
                className="hover:text-[#9d4edd] font-medium text-base py-2 w-full text-left"
              >
                Attack Surface
              </button>
              {/* You can extend mobile menu with similar structure */}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
