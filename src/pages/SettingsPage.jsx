import { useState, useEffect, useRef } from "react";
import { FaUser, FaBuilding, FaCog, FaCogs, FaEdit, FaCheck, FaTrash } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Navbar from "../components/reusable/Navbar";
import Footer from "../components/reusable/Footer";
import NewNavbar from "../components/reusable/NewNavbar";

const SettingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Profile");
  const [name, setName] = useState("username");
  const nameInputRef = useRef(null);
  const [originalName, setOriginalName] = useState("username");
  const [email, setEmail] = useState("email@gmail.com");
  const [phone, setPhone] = useState("");
  const [secondaryEmail, setSecondaryEmail] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [phoneNotifications, setPhoneNotifications] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [error, setError] = useState(null);
  const [isOrgLoading, setIsOrgLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const accessToken = Cookies.get("access_token");
        const response = await axios.get(`${API_BASE_URL}/profile/user_settings/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const { name, email, phone, secondary_email, dark_mode, email_notifications_enabled, phone_notifications_enabled, two_factor_auth_enabled } = response.data;
        setName(name || "John Doe");
        setOriginalName(name || "John Doe");
        setEmail(email || "anyone@gmail.com");
        setPhone(phone || "");
        setSecondaryEmail(secondary_email || "");
        setDarkMode(dark_mode !== undefined ? dark_mode : true);
        setEmailNotifications(email_notifications_enabled !== undefined ? email_notifications_enabled : true);
        setPhoneNotifications(phone_notifications_enabled !== undefined ? phone_notifications_enabled : false);
        setTwoFactorAuth(two_factor_auth_enabled !== undefined ? two_factor_auth_enabled : false);
      } catch (error) {
        console.error("Error fetching user settings:", error);
        setError("Failed to fetch user settings. Please try again.");
      }
    };

    fetchUserSettings();

    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.activeTab === "Organization") {
      handleOrg();
    }
  }, [location.state]);

  const handleEditNameClick = () => {
    setIsEditingName(true);
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 0);
  };

  const handleSaveChanges = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const accessToken = Cookies.get("access_token");
      await axios.post(`${API_BASE_URL}/profile/user_settings/`, {
        name,
        email,
        phone,
        secondary_email: secondaryEmail,
        dark_mode: darkMode,
        email_notifications_enabled: emailNotifications,
        phone_notifications_enabled: phoneNotifications,
        two_factor_auth_enabled: twoFactorAuth,
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setIsEditingName(false);
      setOriginalName(name);
      setError(null);
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings. Please try again.");
    }
  };

  const handleOrg = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const accessToken = Cookies.get("access_token");
      setActiveTab("Organization");
      setError(null);
      setIsOrgLoading(true);
      const response = await axios.get(`${API_BASE_URL}/auth/get_organizations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setOrganizations(response.data.organization || []);
      setIsOrgLoading(false);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setError("Failed to fetch organizations. Please try again.");
      setOrganizations([]);
      setIsOrgLoading(false);
    }
  };

  const handleDeleteOrg = async (orgId) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) return;
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const accessToken = Cookies.get("access_token");
      setIsOrgLoading(true);
      await axios.delete(`${API_BASE_URL}/auth/organizations/${orgId}/delete/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      await handleOrg();
      setError(null);
    } catch (error) {
      console.error("Error deleting organization:", error);
      setError(
        error.response?.status === 403
          ? "You do not have permission to delete this organization."
          : "Failed to delete organization. Please try again."
      );
      setIsOrgLoading(false);
    }
  };

  const validateUrl = (url) => {
    const regex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i;
    return regex.test(url);
  };

  const handleToggle = async (setting, value, setValue) => {
    setValue(value); // Update state immediately for better UX
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const accessToken = Cookies.get("access_token");
      await axios.post(`${API_BASE_URL}/profile/user_settings/`, {
        name,
        email,
        phone,
        secondary_email: secondaryEmail,
        dark_mode: setting === "dark_mode" ? value : darkMode,
        email_notifications_enabled: setting === "email_notifications_enabled" ? value : emailNotifications,
        phone_notifications_enabled: setting === "phone_notifications_enabled" ? value : phoneNotifications,
        two_factor_auth_enabled: setting === "two_factor_auth_enabled" ? value : twoFactorAuth,
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setError(null);
    } catch (error) {
      console.error(`Error updating ${setting}:`, error);
      setError(`Failed to update ${setting}. Please try again.`);
      setValue(!value); // Revert state on error
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <style>
        {`
          .toggleSwitch {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 50px;
            height: 30px;
            background-color: rgb(82, 82, 82);
            border-radius: 20px;
            cursor: pointer;
            transition-duration: 0.2s;
          }
          .toggleSwitch::after {
            content: "";
            position: absolute;
            height: 10px;
            width: 10px;
            left: 5px;
            background-color: transparent;
            border-radius: 50%;
            transition-duration: 0.2s;
            box-shadow: 5px 2px 7px rgba(8, 8, 8, 0.26);
            border: 5px solid white;
          }
          .toggleSwitch.active::after {
            transform: translateX(100%);
            transition-duration: 0.2s;
            background-color: white;
          }
          .toggleSwitch.active {
            background-color: rgb(148, 118, 255);
            transition-duration: 0.2s;
          }
        `}
      </style>
      <div className="h-[11vh] w-full fixed top-0 bg-white z-10 border-b border-gray-300">
        <NewNavbar />
      </div>
      <button
        type="button"
        className="absolute top-4 left-4 text-white p-2 px-6"
        onClick={() => navigate(-1)}
      >
        Back
      </button>

      <div className="flex flex-col md:flex-row mt-[11vh]">
        <div className="p-4 md:w-[20%] bg-deepNavy flex justify-center text-white overflow-y-auto min-h-screen border-r border-gray-300">
          <ul className="space-y-4 w-full">
            <li className={`flex items-center gap-2 p-2 rounded cursor-pointer ${activeTab === "Profile" ? "bg-[#552ACA] text-white" : "hover:bg-[#552ACA]"}`} onClick={() => setActiveTab("Profile")}>
              <FaUser /> Profile
            </li>
            <li className={`flex items-center gap-2 p-2 rounded cursor-pointer ${activeTab === "Organization" ? "bg-[#552ACA] text-white" : "hover:bg-[#552ACA]"}`} onClick={handleOrg}>
              <FaBuilding /> Organization
            </li>
            <li className={`flex items-center gap-2 p-2 rounded cursor-pointer ${activeTab === "Account" ? "bg-[#552ACA] text-white" : "hover:bg-[#552ACA]"}`} onClick={() => setActiveTab("Account")}>
              <FaCog /> Account
            </li>
          </ul>
        </div>

        <div className="w-full md:w-[80%] p-4 bg-deepNavy flex justify-center overflow-y-auto min-h-screen">
          {activeTab === "Profile" && (
            <div className="w-full max-w-lg text-center flex flex-col items-center bg-deepNavy p-6 rounded-lg shadow-md border border-gray-300">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
                <FaUser className="text-gray-500 text-5xl" />
              </div>
              <div className="space-y-4 mt-4 w-full">
                <div className="flex items-center justify-between">
                  <label className="text-white text-left">Name:</label>
                  {isEditingName && name !== originalName ? (
                    <FaCheck className="cursor-pointer text-green-500 hover:text-green-700" onClick={() => { setIsEditingName(false); setOriginalName(name); }} />
                  ) : (
                    <FaEdit className="cursor-pointer text-gray-500 hover:text-blue-500" onClick={handleEditNameClick} />
                  )}
                </div>
                <input
                  type="text"
                  ref={nameInputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-2 border rounded ${isEditingName ? "bg-white text-black" : "bg-denimBlue text-white"}`}
                  disabled={!isEditingName}
                />
                <div>
                  <label className="block text-white text-left">Email:</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full p-2 border rounded bg-denimBlue text-white"
                  />
                </div>
                {/* <div>
                  <label className="block text-white text-left">Phone Number:</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 border rounded bg-white text-black"
                  />
                </div> */}
                <div>
                  <label className="block text-white text-left">Secondary Email:</label>
                  <input
                    type="email"
                    value={secondaryEmail}
                    onChange={(e) => setSecondaryEmail(e.target.value)}
                    className="w-full p-2 border rounded bg-white text-black"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-white">Dark Mode:</label>
                    <div>
                      <input
                        type="checkbox"
                        id="darkModeToggle"
                        className="hidden"
                        checked={darkMode}
                        onChange={() => handleToggle("dark_mode", !darkMode, setDarkMode)}
                      />
                      <label
                        htmlFor="darkModeToggle"
                        className={`toggleSwitch ${darkMode ? "active" : ""}`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-white">Email Notifications:</label>
                    <div>
                      <input
                        type="checkbox"
                        id="emailNotificationsToggle"
                        className="hidden"
                        checked={emailNotifications}
                        onChange={() => handleToggle("email_notifications_enabled", !emailNotifications, setEmailNotifications)}
                      />
                      <label
                        htmlFor="emailNotificationsToggle"
                        className={`toggleSwitch ${emailNotifications ? "active" : ""}`}
                      />
                    </div>
                  </div>
                  {/* <div className="flex items-center justify-between">
                    <label className="text-white">Phone Notifications:</label>
                    <div>
                      <input
                        type="checkbox"
                        id="phoneNotificationsToggle"
                        className="hidden"
                        checked={phoneNotifications}
                        onChange={() => handleToggle("phone_notifications_enabled", !phoneNotifications, setPhoneNotifications)}
                      />
                      <label
                        htmlFor="phoneNotificationsToggle"
                        className={`toggleSwitch ${phoneNotifications ? "active" : ""}`}
                      />
                    </div>
                  </div> */}
                  <div className="flex items-center justify-between">
                    <label className="text-white">Two-Factor Authentication:</label>
                    <div>
                      <input
                        type="checkbox"
                        id="twoFactorAuthToggle"
                        className="hidden"
                        checked={twoFactorAuth}
                        onChange={() => handleToggle("two_factor_auth_enabled", !twoFactorAuth, setTwoFactorAuth)}
                      />
                      <label
                        htmlFor="twoFactorAuthToggle"
                        className={`toggleSwitch ${twoFactorAuth ? "active" : ""}`}
                      />
                    </div>
                  </div>
                </div>
                <button
                  className="bg-[#0034D2] text-white px-4 py-2 mt-4 rounded hover:bg-blue-700 w-full"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </div>
            </div>
          )}

          {activeTab === "Organization" && (
            <div className="flex justify-center w-full">
              <div className="w-full max-w-2xl bg-deepNavy p-6 rounded-lg shadow-md overflow-y-auto border border-[#4C5879]">
                <h2 className="text-2xl font-semibold mb-6 text-white">Organization</h2>
                {isOrgLoading ? (
                  <div className="flex justify-center items-center min-h-[200px]">
                    <div className="flex flex-col items-center gap-2 text-blue-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-blue-800"></div>
                      <p>Loading...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {organizations.length > 0 ? (
                      <div className="space-y-4">
                        {organizations.map((org, index) => (
                          <div
                            key={index}
                            className={`flex items-center p-4 bg-denimBlue rounded-lg shadow gap-4 ${
                              org.role === "admin" ? "cursor-pointer" : ""
                            }`}
                            onClick={() =>
                              org.role === "admin" &&
                              navigate(`/organization/${org.id}/${org.name}/${org.role}`)
                            }
                          >
                            {org?.logo_url && validateUrl(org.logo_url) ? (
                              <img
                                src={org.logo_url}
                                alt="logo"
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#91AAF5] flex items-center justify-center text-md font-bold text-[#101C40] mr-4">
                                {org?.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-semibold text-white">{org.name}</h3>
                              <p className="text-[#EBEBEB]">{org.role}</p>
                            </div>
                            {org.role === "admin" && (
                              <div className="flex items-center ml-auto space-x-2">
                                <FaCogs className="text-white hover:text-blue-500 cursor-pointer" />
                                <FaTrash
                                  className="text-white hover:text-red-500 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOrg(org.id);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No organizations found.</p>
                    )}
                    <button
                      className="bg-[#0034D2] text-white px-4 py-2 mt-4 rounded hover:bg-blue-700 w-full"
                      onClick={() => navigate("/create-organization")}
                    >
                      Create Organization
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default SettingsPage;