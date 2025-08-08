import React, { useState } from 'react';
import ProfileDropdown from '../ProfileDropdown';
import { useNavigate } from 'react-router-dom';
import { IoMenu, IoClose } from 'react-icons/io5';

export default function Navbar() {
  const navigation = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [showWildcardmenu, setShowWildcardmenu] = useState(false);
  const [showWeb3Menu, setShowWeb3Menu] = useState(false);
  const logoSrc = "/bluhawk-blackbg.png";

  const handleNavigation = (path) => {
    setShowDropdown(false);
    setShowSubmenu(false);
    setShowWildcardmenu(false);
    setIsMobileMenuOpen(false);
    setTimeout(() => navigation(path), 100);
  };

  const handleLogoClick = () => navigation("/");
  const handleClick = (page) => handleNavigation(page);

  return (
    <header className="sticky top-0 bg-midnightBlue z-50 text-white py-5 flex justify-center items-center">
      <div className="w-full max-w-[1350px] flex items-center justify-between px-6">
        <div className="flex items-center gap-4 md:gap-14">
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
          <nav className="hidden md:flex gap-8 text-lg">
            <a href="/" className="hover:text-gray-300 font-semibold">Home</a>
            <div
              className="relative"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <label className="hover:cursor-pointer font-semibold">Threat Intelligence</label>
              {showDropdown && (
                <div className="absolute bg-black shadow-lg w-48 rounded-lg">
                  <button
                    onClick={() => handleClick('/my-intel')}
                    className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                  >
                    My Intel
                  </button>
                  <div
                    className="relative"
                    onMouseEnter={() => setShowSubmenu(true)}
                    onMouseLeave={() => setShowSubmenu(false)}
                  >
                    <button className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left">
                      Find Intel
                    </button>
                    {showSubmenu && (
                      <div className="absolute left-full top-0 bg-black shadow-lg min-w-48 max-w-[content] rounded-lg">
                        <button
                          onClick={() => handleNavigation('/find-intel')}
                          className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Domain/IP/URL/Hashfile
                        </button>
                        <div
                          className="relative"
                          onMouseEnter={() => setShowWildcardmenu(true)}
                          onMouseLeave={() => setShowWildcardmenu(false)}
                        >
                          <button className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left">
                            Wildcard Intel
                          </button>
                          {showWildcardmenu && (
                            <div className="absolute left-full top-0 bg-black shadow-lg min-w-48 max-w-[content] rounded-lg">
                              <button
                                onClick={() => handleNavigation('/wildcard-intel?option=deep-account-search')}
                                className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                              >
                                Deep Account Search
                              </button>
                              <button
                                onClick={() => handleNavigation('/wildcard-intel?option=who-is')}
                                className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                              >
                                Whois
                              </button>
                              <button
                                onClick={() => handleNavigation('/wildcard-intel?option=ip-info')}
                                className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                              >
                                Ip Info
                              </button>
                              <button
                                onClick={() => handleNavigation('/wildcard-intel?option=phone-number-info')}
                                className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                              >
                                Phone No Info
                              </button>
                              <button
                                onClick={() => handleNavigation('/wildcard-intel?option=ssl-info')}
                                className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                              >
                                SSL Info
                              </button>
                              <button
                                onClick={() => handleNavigation('/wildcard-intel?option=username-search')}
                                className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                              >
                                User Name
                              </button>
                              <button
                                onClick={() => handleNavigation('/wildcard-intel?option=domain-wayback')}
                                className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                              >
                                Domain Wayback
                              </button>
                              <button
                                onClick={() => handleNavigation('/wildcard-intel?option=scan-for-cve')}
                                className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
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
                          <button className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left">
                            Web3
                          </button>
                          {showWeb3Menu && (
                            <div className="absolute left-full top-0 bg-black shadow-lg min-w-48 max-w-[content] rounded-lg">
                              <button
                                onClick={() => handleNavigation('/profile-by-address')}
                                className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                              >
                                Profile By Address
                              </button>
                              <button
                                onClick={() => handleNavigation('/transaction-by-address')}
                                className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                              >
                                Transaction By Address
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleNavigation('/public-profile')}
                          className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Public Profile
                        </button>
                        <button
                          onClick={() => handleNavigation('/company')}
                          className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Company
                        </button>
                        <button
                          onClick={() => handleNavigation('/application-software')}
                          className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Application/Software
                        </button>
                        <button
                          onClick={() => handleNavigation('/ransomware')}
                          className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Ransomware
                        </button>
                        <button
                          onClick={() => handleNavigation('/my-intel')}
                          className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Vulnerability Search
                        </button>
                        <button
                          onClick={() => handleNavigation('/malware-analysis')}
                          className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Malware Analysis
                        </button>
                        <button
                          onClick={() => handleNavigation('/upload-file')}
                          className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                        >
                          Upload File
                        </button>
                      </div>
                    )}
                  </div>
                  <button className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left">
                    MITRE & ATTACK
                  </button>
                  <button className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left">
                    Reports
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative"><ProfileDropdown /></div>
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <IoClose size={32} className="text-white" /> : <IoMenu size={32} className="text-white" />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-midnightBlue text-white shadow-lg md:hidden">
            <nav className="flex flex-col gap-4 p-4">
              <a href="/" className="hover:text-gray-300 font-semibold text-lg" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </a>
              <div className="relative">
                <label
                  className="hover:cursor-pointer font-semibold text-lg"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  Threat Intelligence
                </label>
                {showDropdown && (
                  <div className="bg-black shadow-lg w-full rounded-lg mt-2 pl-4">
                    <button
                      onClick={() => handleClick('/my-intel')}
                      className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                    >
                      My Intel
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowSubmenu(!showSubmenu)}
                        className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                      >
                        Find Intel
                      </button>
                      {showSubmenu && (
                        <div className="bg-black shadow-lg w-full rounded-lg mt-2 pl-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                          <button
                            onClick={() => handleNavigation('/find-intel')}
                            className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Domain/IP/URL/Hashfile
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setShowWildcardmenu(!showWildcardmenu)}
                              className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                            >
                              Wildcard Intel
                            </button>
                            {showWildcardmenu && (
                              <div className="bg-black shadow-lg w-full rounded-lg mt-2 pl-4">
                                <button
                                  onClick={() => handleNavigation('/wildcard-intel?option=deep-account-search')}
                                  className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                                >
                                  Deep Account Search
                                </button>
                                <button
                                  onClick={() => handleNavigation('/wildcard-intel?option=who-is')}
                                  className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                                >
                                  Whois
                                </button>
                                <button
                                  onClick={() => handleNavigation('/wildcard-intel?option=ip-info')}
                                  className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                                >
                                  Ip Info
                                </button>
                                <button
                                  onClick={() => handleNavigation('/wildcard-intel?option=phone-number-info')}
                                  className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                                >
                                  Phone No Info
                                </button>
                                <button
                                  onClick={() => handleNavigation('/wildcard-intel?option=ssl-info')}
                                  className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                                >
                                  SSL Info
                                </button>
                                <button
                                  onClick={() => handleNavigation('/wildcard-intel?option=username-search')}
                                  className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                                >
                                  User Name
                                </button>
                                <button
                                  onClick={() => handleNavigation('/wildcard-intel?option=domain-wayback')}
                                  className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                                >
                                  Domain Wayback
                                </button>
                                <button
                                  onClick={() => handleNavigation('/wildcard-intel?option=scan-for-cve')}
                                  className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                                >
                                  Scan For CVE
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setShowWeb3Menu(!showWeb3Menu)}
                            className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Web3
                          </button>
                          {showWeb3Menu && (
                            <div className="bg-black shadow-lg w-full rounded-lg mt-2 pl-4">
                              <button
                                onClick={() => handleNavigation('/profile-by-address')}
                                className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                              >
                                Profile By Address
                              </button>
                              <button
                                onClick={() => handleNavigation('/transaction-by-address')}
                                className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                              >
                                Transaction By Address
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => handleNavigation('/public-profile')}
                            className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Public Profile
                          </button>
                          <button
                            onClick={() => handleNavigation('/company')}
                            className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Company
                          </button>
                          <button
                            onClick={() => handleNavigation('/application-software')}
                            className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Application/Software
                          </button>
                          <button
                            onClick={() => handleNavigation('/ransomware')}
                            className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Ransomware
                          </button>
                          <button
                            onClick={() => handleNavigation('/my-intel')}
                            className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Vulnerability Search
                          </button>
                          <button
                            onClick={() => handleNavigation('/malware-analysis')}
                            className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left"
                          >
                            Malware Analysis
                          </button>
                        </div>
                      )}
                    </div>
                    <button className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left">
                      MITRE & ATTACK
                    </button>
                    <button className="text-base font-semibold block px-4 py-2 text-white hover:bg-vibrantOrange w-full text-left">
                      Reports
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