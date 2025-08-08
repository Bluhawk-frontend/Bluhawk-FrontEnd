import React, { useState } from 'react';
import ProfileDropdown from '../ProfileDropdown';
import NotificationDropdown from '../NotificationDropdown';
import { useNavigate } from 'react-router-dom';
import { IoMenu, IoClose } from 'react-icons/io5';

export default function NewNavbar() {
  const navigation = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showVulnIntel, setShowVulnIntel] = useState(false);
  const [showWildcardmenu, setShowWildcardmenu] = useState(false);
  const [showWeb3Menu, setShowWeb3Menu] = useState(false);
  const [showMalwareMenu, setShowMalwareMenu] = useState(false);
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);
  const [showAttackDropdown, setShowAttackDropdown] = useState(false);
  const logoSrc = "";

  const handleNavigation = (path) => {
    setShowDropdown(false);
    setShowVulnIntel(false);
    setShowWildcardmenu(false);
    setShowWeb3Menu(false);
    setShowMalwareMenu(false);
    setShowBusinessMenu(false);
    setShowAttackDropdown(false);
    setIsMobileMenuOpen(false);
    setTimeout(() => navigation(path), 100);
  };

  const handleLogoClick = () => navigation("/");

  return (
    <header className="sticky top-0 bg-midnightBlue z-50 text-white py-4 flex justify-center items-center">
      <div className="w-full max-w-[1350px] flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-8 md:gap-14">
          <button onClick={handleLogoClick}>
            <img
              src={logoSrc}
              alt="logo"
              className="h-10 w-auto min-w-[40px] md:h-12"
              onError={(e) => {
                console.error("Failed to load logo:", logoSrc);
                e.target.src = "/fallback-logo.png";
              }}
            />
          </button>
          <nav className="hidden md:flex gap-6 text-base font-medium">
            <a href="/dashboard" className="hover:text-gray-300">Dashboard</a>
            <a href="/attack-credential" className="hover:text-gray-300">Attack Surface</a>
            <div
              className="relative"
              onMouseEnter={() => setShowVulnIntel(true)}
              onMouseLeave={() => setShowVulnIntel(false)}
            >
              <label className="hover:cursor-pointer">Vulnerability Intel</label>
              {showVulnIntel && (
                <div className="absolute top-full bg-black shadow-lg w-48 rounded-lg">
                  <button
                    onClick={() => handleNavigation('/my-intel')}
                    className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                  >
                    My Intel
                  </button>
                  <button
                    onClick={() => handleNavigation('/cpe')}
                    className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                  >
                    Vendors & Products
                  </button>
                </div>
              )}
            </div>
            <div
              className="relative"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <label className="hover:cursor-pointer">Threat Intel</label>
              {showDropdown && (
                <div className="absolute top-full bg-black shadow-lg w-60 rounded-lg">
                  <button
                    onClick={() => handleNavigation('/find-intel')}
                    className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                  >
                    Domain/IP/URL/Hashfile
                  </button>
                  <div
                    className="relative"
                    onMouseEnter={() => setShowWildcardmenu(true)}
                    onMouseLeave={() => setShowWildcardmenu(false)}
                  >
                    <button className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left">
                      Wildcard Intel
                    </button>
                    {showWildcardmenu && (
                      <div className="absolute left-full top-0 bg-black shadow-lg w-48 rounded-lg">
                        <button
                          onClick={() => handleNavigation('/wildcard-intel?option=deep-account-search')}
                          className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Deep Account Search
                        </button>
                        <button
                          onClick={() => handleNavigation('/wildcard-intel?option=who-is')}
                          className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Whois
                        </button>
                        <button
                          onClick={() => handleNavigation('/wildcard-intel?option=ip-info')}
                          className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          IP Info
                        </button>
                        <button
                          onClick={() => handleNavigation('/wildcard-intel?option=phone-number-info')}
                          className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Phone No Info
                        </button>
                        <button
                          onClick={() => handleNavigation('/wildcard-intel?option=ssl-info')}
                          className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          SSL Info
                        </button>
                        <button
                          onClick={() => handleNavigation('/wildcard-intel?option=username-search')}
                          className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          User Name
                        </button>
                        <button
                          onClick={() => handleNavigation('/wildcard-intel?option=domain-wayback')}
                          className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Domain Wayback
                        </button>
                        <button
                          onClick={() => handleNavigation('/wildcard-intel?option=scan-for-cve')}
                          className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Scan For CVE
                        </button>
                      </div>
                    )}
                  </div>
                  <div
                    className="relative"
                    onMouseEnter={() => setShowWeb3Menu(true)}
                    onMouseLeave={() => setShowWeb3Menu(false)}
                  >
                    <button className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left">
                      Web3
                    </button>
                    {showWeb3Menu && (
                      <div className="absolute left-full top-0 bg-black shadow-lg w-48 rounded-lg">
                        <button
                          onClick={() => handleNavigation('/profile-by-address')}
                          className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Profile By Address
                        </button>
                      </div>
                    )}
                  </div>
                  <div
                    className="relative"
                    onMouseEnter={() => setShowBusinessMenu(true)}
                    onMouseLeave={() => setShowBusinessMenu(false)}
                  >
                    <button className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left">
                      Business
                    </button>
                    {showBusinessMenu && (
                      <div className="absolute left-full top-0 bg-black shadow-lg w-48 rounded-lg">
                        <button
                          onClick={() => handleNavigation('/company')}
                          className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Company Info
                        </button>
                        <button
                          onClick={() => handleNavigation('/company-corp-data')}
                          className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Company Corp Data
                        </button>
                        <button
                          onClick={() => handleNavigation('/digital-footprint')}
                          className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Digital Footprint
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div
              className="relative"
              onMouseEnter={() => setShowMalwareMenu(true)}
              onMouseLeave={() => setShowMalwareMenu(false)}
            >
              <label className="hover:cursor-pointer">Malware Analysis</label>
              {showMalwareMenu && (
                <div className="absolute top-full bg-black shadow-lg w-48 rounded-lg">
                  <button
                    onClick={() => handleNavigation('/upload-file')}
                    className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                  >
                    Analyze File
                  </button>
                  <button
                    onClick={() => handleNavigation('/odix')}
                    className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                  >
                    (ODIX)
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center gap-4">
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <IoClose size={28} className="text-white" /> : <IoMenu size={28} className="text-white" />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-midnightBlue text-white shadow-lg md:hidden transition-all duration-300 ease-in-out">
            <nav className="flex flex-col gap-2 p-4">
              <a
                href="/dashboard"
                className="hover:text-gray-300 font-medium text-base py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </a>
              <div>
                <button
                  className="hover:text-gray-300 font-medium text-base py-2 w-full text-left"
                  onClick={() => handleNavigation('/attack-credential')}
                >
                  Attack Surface
                </button>
              </div>
              <div>
                <button
                  className="hover:text-gray-300 font-medium text-base py-2 w-full text-left"
                  onClick={() => setShowVulnIntel(prev => !prev)}
                >
                  Vulnerability Intel
                </button>
                {showVulnIntel && (
                  <div className="pl-4 bg-black rounded-lg">
                    <button
                      onClick={() => handleNavigation('/my-intel')}
                      className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                    >
                      My Intel
                    </button>
                    <button
                      onClick={() => handleNavigation('/cpe')}
                      className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                    >
                      Vendors & Products
                    </button>
                  </div>
                )}
              </div>
              <div>
                <button
                  className="hover:text-gray-300 font-medium text-base py-2 w-full text-left"
                  onClick={() => setShowDropdown(prev => !prev)}
                >
                  Threat Intel
                </button>
                {showDropdown && (
                  <div className="pl-4 bg-black rounded-lg">
                    <button
                      onClick={() => handleNavigation('/find-intel')}
                      className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                    >
                      Domain/IP/URL/Hashfile
                    </button>
                    <div>
                      <button
                        className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        onClick={() => setShowWildcardmenu(prev => !prev)}
                      >
                        Wildcard Intel
                      </button>
                      {showWildcardmenu && (
                        <div className="pl-4 bg-black rounded-lg">
                          <button
                            onClick={() => handleNavigation('/wildcard-intel?option=deep-account-search')}
                            className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Deep Account Search
                          </button>
                          <button
                            onClick={() => handleNavigation('/wildcard-intel?option=who-is')}
                            className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Whois
                          </button>
                          <button
                            onClick={() => handleNavigation('/wildcard-intel?option=ip-info')}
                            className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            IP Info
                          </button>
                          <button
                            onClick={() => handleNavigation('/wildcard-intel?option=phone-number-info')}
                            className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Phone No Info
                          </button>
                          <button
                            onClick={() => handleNavigation('/wildcard-intel?option=ssl-info')}
                            className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            SSL Info
                          </button>
                          <button
                            onClick={() => handleNavigation('/wildcard-intel?option=username-search')}
                            className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            User Name
                          </button>
                          <button
                            onClick={() => handleNavigation('/wildcard-intel?option=domain-wayback')}
                            className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Domain Wayback
                          </button>
                          <button
                            onClick={() => handleNavigation('/wildcard-intel?option=scan-for-cve')}
                            className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Scan For CVE
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <button
                        className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        onClick={() => setShowWeb3Menu(prev => !prev)}
                      >
                        Web3
                      </button>
                      {showWeb3Menu && (
                        <div className="pl-4 bg-black rounded-lg">
                          <button
                            onClick={() => handleNavigation('/profile-by-address')}
                            className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Profile By Address
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <button
                        className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        onClick={() => setShowBusinessMenu(prev => !prev)}
                      >
                        Business
                      </button>
                      {showBusinessMenu && (
                        <div className="pl-4 bg-black rounded-lg">
                          <button
                            onClick={() => handleNavigation('/company')}
                            className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Company Info
                          </button>
                          <button
                            onClick={() => handleNavigation('/company-corp-data')}
                            className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Company Corp Data
                          </button>
                          <button
                            onClick={() => handleNavigation('/digital-footprint')}
                            className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Digital Footprint
                          </button>
                        </div>
                      )}
                    </div>
                    {/* <button
                      onClick={() => handleNavigation('/vt-graph')}
                      className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                    >
                      VT Graph
                    </button> */}
                  </div>
                )}
              </div>
              <div>
                <button
                  className="hover:text-gray-300 font-medium text-base py-2 w-full text-left"
                  onClick={() => setShowMalwareMenu(prev => !prev)}
                >
                  Malware Analysis
                </button>
                {showMalwareMenu && (
                  <div className="pl-4 bg-black rounded-lg">
                    <button
                      onClick={() => handleNavigation('/upload-file')}
                      className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                    >
                      Analyze File
                    </button>
                    <button
                      onClick={() => handleNavigation('/odix')}
                      className="block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                    >
                      (ODIX)
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}