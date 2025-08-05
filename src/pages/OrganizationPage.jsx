import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import NewNavbar from "../components/reusable/NewNavbar.jsx";
import { FaPlus } from "react-icons/fa";
import debounce from "lodash/debounce";
import { v4 as uuidv4 } from "uuid";

const OrganizationPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
  const APP_BASE_URL = import.meta.env.VITE_API_URL;
  const SUPPORT_EMAIL = import.meta.env.VITE_API_EMAIL || "support@yourapp.com";
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/settings", { state: { activeTab: "Organization" } });
  };

  const [orgDetails, setOrgDetails] = useState({
    orgName: "",
    country: "",
    state: "",
    address: "",
    isEditing: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", role: "viewer" });
  const [savingUserId, setSavingUserId] = useState(null);
  const roles = ["admin", "viewer", "analyst"];
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Validate token
  const getToken = () => {
    const token = Cookies.get("access_token");
    if (!token) {
      setErrorMessage("Session expired. Please log in again.");
      navigate("/login");
      return null;
    }
    return token;
  };

  // Get CSRF token from cookies
  const getCsrfToken = () => {
    return Cookies.get("csrftoken") || "";
  };

  // Fetch Countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://countriesnow.space/api/v0.1/countries/positions");
        const countryNames = response.data.data.map((country) => country.name).sort();
        setCountries(countryNames);
      } catch (error) {
        setErrorMessage("Failed to fetch countries. Please try again.");
      }
    };
    fetchCountries();
  }, []);

  // Fetch States
  useEffect(() => {
    const fetchStates = async () => {
      if (!orgDetails.country) {
        setStates([]);
        return;
      }
      try {
        const response = await axios.post("https://countriesnow.space/api/v0.1/countries/states", {
          country: orgDetails.country,
        });
        if (response.data.error) {
          setErrorMessage("Failed to fetch states.");
          setStates([]);
          return;
        }
        const fetchedStates = response.data.data.states.map((state) => state.name) || [];
        setStates(fetchedStates);
        setOrgDetails((prev) => ({
          ...prev,
          state: fetchedStates.includes(prev.state) ? prev.state : fetchedStates[0] || "",
        }));
      } catch (error) {
        setErrorMessage("Failed to fetch states. Please try again.");
        setStates([]);
      }
    };
    fetchStates();
  }, [orgDetails.country]);

  // Fetch Organization Data
  const fetchOrganizationData = useCallback(
    async (organizationId, token) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/organization/${organizationId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.organization;
      } catch (error) {
        throw new Error("Failed to fetch organization data.");
      }
    },
    [API_BASE_URL]
  );

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      const token = getToken();
      if (!token) return;
      try {
        const orgData = await fetchOrganizationData(id, token);
        setOrgDetails({
          orgName: orgData.name || "",
          country: orgData.country || "",
          state: orgData.state || "",
          address: orgData.address || "",
          isEditing: false,
        });
        setUsers([
          ...orgData.members.map((member) => ({
            id: member.user__email,
            email: member.user__email,
            role: member.role.toLowerCase(),
            status: "active",
            isEditing: false,
          })),
          ...orgData.invitations.map((invite) => ({
            id: invite.email,
            email: invite.email,
            role: invite.role.toLowerCase(),
            status: "pending",
            isEditing: false,
            invitation_id: invite.invitation_id,
          })),
        ]);
      } catch (error) {
        setErrorMessage("Failed to load organization data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, fetchOrganizationData]);

  const handleEditOrg = () => {
    setOrgDetails((prev) => ({ ...prev, isEditing: !prev.isEditing }));
  };

  // Validate organization details
  const validateOrgDetails = () => {
    if (!orgDetails.orgName.trim()) {
      setErrorMessage("Organization name is required.");
      return false;
    }
    if (!orgDetails.country) {
      setErrorMessage("Country is required.");
      return false;
    }
    return true;
  };

  // Debounced save organization
  const debouncedSaveOrg = useCallback(
    debounce(async (details, token) => {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/auth/organization/${id}/`,
          {
            mode: "update_organization",
            name: details.orgName,
            country: details.country,
            state: details.state,
            address: details.address,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updatedData = response.data.organization || {};
        setOrgDetails({
          orgName: updatedData.name || details.orgName,
          country: updatedData.country || details.country,
          state: updatedData.state || details.state,
          address: updatedData.address || details.address,
          isEditing: false,
        });
      } catch (error) {
        throw new Error("Failed to save organization details.");
      }
    }, 500),
    [id, API_BASE_URL]
  );

  const handleSaveOrg = async () => {
    if (!validateOrgDetails()) return;
    setSaving(true);
    const token = getToken();
    if (!token) return;
    try {
      await debouncedSaveOrg(orgDetails, token);
    } catch (error) {
      setErrorMessage("Failed to save organization details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = (id, newRole) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === id ? { ...user, role: newRole } : user))
    );
  };

  // Debounced save user
  const debouncedSaveUser = useCallback(
    debounce(async (user, token) => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        const csrfToken = getCsrfToken();
        if (csrfToken) {
          headers["X-CSRFToken"] = csrfToken;
        }
        await axios.put(
          `${API_BASE_URL}/auth/organization/${id}/`,
          {
            mode: "update_members",
            members: [
              {
                action: "update",
                user_email: user.email,
                role: user.role.toLowerCase(),
              },
            ],
          },
          { headers }
        );
      } catch (error) {
        throw new Error(`Failed to update user ${user.email}: ${error.response?.data?.message || error.message}`);
      }
    }, 500),
    [id, API_BASE_URL]
  );

  const handleSaveUser = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const previousUsers = [...users];
    setSavingUserId(userId);
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === userId ? { ...u, isEditing: false } : u))
    );
    const token = getToken();
    if (!token) return;
    try {
      await debouncedSaveUser(user, token);
      setSuccessMessage(`Role for ${user.email} updated successfully.`);
      const orgData = await fetchOrganizationData(id, token);
      setUsers([
        ...orgData.members.map((member) => ({
          id: member.user__email,
          email: member.user__email,
          role: member.role.toLowerCase(),
          status: "active",
          isEditing: false,
        })),
        ...orgData.invitations.map((invite) => ({
          id: invite.email,
          email: invite.email,
          role: invite.role.toLowerCase(),
          status: "pending",
          isEditing: false,
          invitation_id: invite.invitation_id,
        })),
      ]);
    } catch (error) {
      setUsers(previousUsers);
      setErrorMessage(error.message);
    } finally {
      setSavingUserId(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleRemoveOrgMember = async (userId) => {
    const user = users.find((u) => u.id === userId && u.status === "active");
    if (!user) return;

    const previousUsers = [...users];
    setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));

    const token = getToken();
    if (!token) {
      setUsers(previousUsers);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      await axios.put(
        `${API_BASE_URL}/auth/organization/${id}/`,
        {
          mode: "update_members",
          members: [
            {
              action: "remove",
              user_email: user.email,
            },
          ],
        },
        { headers }
      );

      setSuccessMessage(`User ${user.email} removed successfully.`);

      const orgData = await fetchOrganizationData(id, token);
      setUsers([
        ...orgData.members.map((member) => ({
          id: member.user__email,
          email: member.user__email,
          role: member.role.toLowerCase(),
          status: "active",
          isEditing: false,
        })),
        ...orgData.invitations.map((invite) => ({
          id: invite.email,
          email: invite.email,
          role: invite.role.toLowerCase(),
          status: "pending",
          isEditing: false,
          invitation_id: invite.invitation_id,
        })),
      ]);
    } catch (error) {
      setUsers(previousUsers);
      setErrorMessage(`Failed to remove user ${user.email}: ${error.response?.data?.message || error.message}`);
    } finally {
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleClearAllInvitations = async () => {
    const pendingInvitations = users.filter((u) => u.status === "pending");
    if (pendingInvitations.length === 0) {
      setErrorMessage("No pending invitations to clear.");
      return;
    }
    const previousUsers = [...users];
    setUsers((prevUsers) => prevUsers.filter((u) => u.status !== "pending"));
    const token = getToken();
    if (!token) {
      setUsers(previousUsers);
      return;
    }
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }
      await Promise.all(
        pendingInvitations.map((user) =>
          axios.delete(
            `${API_BASE_URL}/auth/invitation_manage/${id}/`,
            {
              headers,
              data: { email: user.email },
            }
          )
        )
      );
      setSuccessMessage("All pending invitations cleared successfully.");
      const orgData = await fetchOrganizationData(id, token);
      setUsers([
        ...orgData.members.map((member) => ({
          id: member.user__email,
          email: member.user__email,
          role: member.role.toLowerCase(),
          status: "active",
          isEditing: false,
        })),
        ...orgData.invitations.map((invite) => ({
          id: invite.email,
          email: invite.email,
          role: invite.role.toLowerCase(),
          status: "pending",
          isEditing: false,
          invitation_id: invite.invitation_id,
        })),
      ]);
    } catch (error) {
      setUsers(previousUsers);
      setErrorMessage(`Failed to clear invitations: ${error.response?.data?.message || error.message}`);
      console.error("Clear invitations error:", error.response?.data || error.message);
    } finally {
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // New function to handle removing individual pending invitations
  const handleRemoveInvitation = async (userId) => {
    const user = users.find((u) => u.id === userId && u.status === "pending");
    if (!user) return;

    const previousUsers = [...users];
    // Optimistically remove the user from the UI
    setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));

    const token = getToken();
    if (!token) {
      setUsers(previousUsers);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      // API call to delete the individual invitation using invitation_id
      await axios.delete(
        `${API_BASE_URL}/auth/invitation_manage/${id}/`,
        {
          headers,
          data: { email: user.email },
        }
      );

      setSuccessMessage(`Invitation for ${user.email} removed successfully.`);

      // Refresh the user list to ensure consistency
      const orgData = await fetchOrganizationData(id, token);
      setUsers([
        ...orgData.members.map((member) => ({
          id: member.user__email,
          email: member.user__email,
          role: member.role.toLowerCase(),
          status: "active",
          isEditing: false,
        })),
        ...orgData.invitations.map((invite) => ({
          id: invite.email,
          email: invite.email,
          role: invite.role.toLowerCase(),
          status: "pending",
          isEditing: false,
          invitation_id: invite.invitation_id,
        })),
      ]);
    } catch (error) {
      setUsers(previousUsers);
      setErrorMessage(`Failed to remove invitation for ${user.email}: ${error.response?.data?.message || error.message}`);
      console.error("Remove invitation error:", error.response?.data || error.message);
    } finally {
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Generate and store invite code
  const generateInviteCode = async () => {
    const token = getToken();
    if (!token) return null;
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }
      const response = await axios.post(
        `${API_BASE_URL}/auth/organizations/${id}/invite/`,
        { organization_id: id },
        { headers }
      );
      return response.data.verification_code;
    } catch (error) {
      setErrorMessage("Failed to generate invite code.");
      return null;
    }
  };

const handleAddUser = async (e) => {
  e.preventDefault();
  if (!newUser.email.trim()) {
    alert("Please enter a valid email address.");
    return;
  }

  // Optimistic UI update
  const tempId = Date.now();
  setUsers((prevUsers) => [
    ...prevUsers,
    {
      id: tempId,
      email: newUser.email,
      role: newUser.role,
      isEditing: false,
    },
  ]);

  setNewUser({ email: "", role: "Admin" });
  setShowAddUserForm(false);

  // API call to add user
  const token = Cookies.get("access_token");
  try {
    const verification_code = Math.floor(100000 + Math.random() * 900000);
    const inviteUrl = `http://127.0.0.1:3000/manage/invitation/${verification_code}`;
    const emailBody = `Hello,\n\nYou have been invited to join ${orgDetails.orgName} as a ${newUser.role}.\nYour Invitation code is: ${verification_code}\nTo accept, please click this link: ${inviteUrl}\n\n...`; // Rest of email body

    const response = await axios.post(
      `${API_BASE_URL}/auth/organizations/${id}/invite/`,
      {
        email: newUser.email,
        organization_id: id,
        role: newUser.role.toLowerCase(),
        invitation_code: verification_code,
        email_body: emailBody,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const newMember = response.data; // Adjust based on actual response structure
    console.log("User added successfully:", newMember);

    // Refresh organization data to include the new user
    const updatedData = await fetchOrganizationData(id, token);
    setUsers([
      ...(updatedData.members || []).map((member) => ({
        id: member.user__email,
        email: member.user__email,
        role: member.role,
        status: "active",
      })),
      ...(updatedData.invitations || []).map((invite) => ({
        id: invite.email,
        email: invite.email,
        role: invite.role,
        status: "pending",
      })),
    ]);
  } catch (error) {
    console.error("Error adding user:", error);
    // Revert optimistic update
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== tempId));
    alert("Failed to add user. Please try again.");
  }
};


  return (
    <div className="min-h-screen flex flex-col bg-midnightBlue text-black">
      <NewNavbar />
      <div className=" p-6 flex flex-col items-center">
        <div className="relative w-full">
           <button
        onClick={()=>navigate(-1)}
        className="mb-2 text-white hover:bg-gray-700 rounded-full px-3 py-1 flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        Back
      </button>
        </div>

        <h1 className="text-3xl sm:text-4xl text-white font-bold mb-4 sm:mb-6">{orgDetails.orgName}</h1>

        {(errorMessage || successMessage) && (
          <div className={`p-4 rounded-md mb-4 w-full max-w-4xl ${errorMessage ? "bg-red-600" : "bg-green-600"} text-white`}>
            {errorMessage || successMessage}
            <button
              className="ml-4 text-white underline"
              onClick={() => {
                setErrorMessage("");
                setSuccessMessage("");
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-deepNavy text-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto mb-4 sm:mb-6 ">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-center">Organization Details</h2>
          {loading ? (
            <div className="w-full h-[100px] bg-deepNavy p-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-[#7B7A7A] bg-denimBlue">
                <tbody>
                  {Object.entries(orgDetails).map(([key, value]) =>
                    key !== "isEditing" ? (
                      <tr key={key} className="border-b border-gray-300">
                        <td className="p-3 w-1/3 sm:w-1/4 font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</td>
                        <td className="p-3 w-2/3 sm:w-3/4">
                          {orgDetails.isEditing ? (
                            key === "country" ? (
                              <select
                                value={orgDetails.country}
                                onChange={(e) => setOrgDetails({ ...orgDetails, country: e.target.value })}
                                className="border border-gray-300 rounded-md p-2 w-full text-sm sm:text-base text-black"
                              >
                                <option value="">Select Country</option>
                                {countries.map((country) => (
                                  <option key={country} value={country}>
                                    {country}
                                  </option>
                                ))}
                              </select>
                            ) : key === "state" ? (
                              <select
                                value={orgDetails.state}
                                onChange={(e) => setOrgDetails({ ...orgDetails, state: e.target.value })}
                                className="border border-gray-300 rounded-md p-2 w-full text-sm sm:text-base text-black"
                              >
                                <option value="">Select State</option>
                                {states.map((state) => (
                                  <option key={state} value={state}>
                                    {state}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => setOrgDetails({ ...orgDetails, [key]: e.target.value })}
                                className="border border-gray-300 rounded-md p-2 w-full text-sm sm:text-base text-black"
                              />
                            )
                          ) : (
                            value || "Not set"
                          )}
                        </td>
                      </tr>
                    ) : null
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end mt-4 space-x-2 sm:space-x-3">
            {orgDetails.isEditing ? (
              saving ? (
                <div className="flex items-center justify-center px-3 sm:px-4 py-1 sm:py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-blue-500"></div>
                </div>
              ) : (
                <button
                  onClick={handleSaveOrg}
                  className="bg-[#20AD25] text-white px-3 sm:px-4 py-1 sm:text-base hover:bg-green-700"
                >
                  Save
                </button>
              )
            ) : (
              <button
                onClick={handleEditOrg}
                className="bg-white text-[#0034D2] px-3 sm:px-4 py-1 sm:text-base"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="bg-deepNavy text-black p-4 sm:p-6 rounded-md shadow-md w-full max-w-lg sm:max-w-xl md:max-w-2xl  lg:max-w-4xl mx-auto sm:mb-6">
          <div className="flex justify-between items-center mb-3 sm">
            <h2 className="text-xl sm:text-2xl font-semibold text-center text-white">User Management</h2>
            <button
              onClick={() => setShowAddUserForm(true) }
              className="bg-[#20AD25] text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center gap-2 py-1 sm:text-base sm:text-base"
              title="Add User"
            >
              <FaPlus size={16} />
              Add User
            </button>
          </div>

          {showAddUserForm && (
            <form onSubmit={handleAddUser} className="mb-4 sm:p-4 bg-denimBlue rounded-md">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter user email"
                  className="border border-gray-300 rounded-md p-2 flex-1 text-sm sm:text-base text-black"
                  required
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="border border-gray-300 rounded-md p-2 w-full sm:w-1/3 text-sm sm:text-base text-black"
                >
                  {roles.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  type="submit"
                  className="bg-[#20AD25] text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm sm:text-sm"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserForm(false);
                    setNewUser({ email: "", role: "viewer" });
                  }}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 text-sm sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

        <div className="first-container">
  <h3 className="text-white">Organization Members</h3>
  <div className="w-full overflow-x-auto">
    <table className="w-full border-collapse min-w-[300px]">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-1 sm:p-3 text-left">Email</th>
          <th className="p-1 sm:p-3 text-left">Role</th>
          <th className="p-1 sm:p-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users
          .filter((user) => user.status === "active")
          .map((user) => (
            <tr key={user.id} className="border-b border-gray-300 bg-denimBlue">
              <td className="p-1 sm:p-3 text-white break-words max-w-[120px] sm:max-w-none">{user.email}</td>
              <td className="p-1 sm:p-3 text-white">
                {user.isEditing ? (
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="border border-gray-300 rounded-md p-1 sm:p-2 w-full text-sm sm:text-base text-black"
                  >
                    {roles.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                )}
              </td>
              <td className="p-2 sm:p-3 flex gap-1 sm:gap-2 flex-col sm:flex-row">
                {user.isEditing ? (
                  savingUserId === user.id ? (
                    <div className="flex items-center justify-center px-1 sm:px-2 py-0.5 sm:py-1">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSaveUser(user.id)}
                      className="bg-[#20AD25] text-white px-1 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-base hover:bg-green-700 w-full sm:w-auto"
                    >
                      Save
                    </button>
                  )
                ) : (
                  <>
                    <button
                      onClick={() =>
                        setUsers((prevUsers) =>
                          prevUsers.map((u) =>
                            u.id === user.id ? { ...u, isEditing: true } : { ...u, isEditing: false }
                          )
                        )
                      }
                      className="bg-white text-[#0034D2] px-1 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-base w-full sm:w-auto"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveOrgMember(user.id)}
                      className="bg-red-600 text-white px-1 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-base hover:bg-red-800 w-full sm:w-auto"
                    >
                      Remove
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
</div>
          <div className="lower-container mt-6 overflow-x-auto">
  <div className="flex justify-between items-center mb-3">
    <h3 className="text-white">Pending Invitations</h3>
    {users.filter((user) => user.status === "pending").length > 0 && (
      <button
        onClick={handleClearAllInvitations}
        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-800 text-sm sm:text-base"
        title="Clear All Invitations"
      >
        Clear All
      </button>
    )}
  </div>
  <div className="w-full overflow-x-auto">
    <table className="w-full border-collapse min-w-[300px]">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-1 sm:p-3 text-left">Email</th>
          <th className="p-1 sm:p-3 text-left">Role</th>
          <th className="p-1 sm:p-3 text-left">Status</th>
          <th className="p-1 sm:p-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users
          .filter((user) => user.status === "pending")
          .map((user) => (
            <tr key={user.id} className="border-b border-gray-300 bg-denimBlue">
              <td className="p-1 sm:p-3 text-white break-words max-w-[120px] sm:max-w-none">{user.email}</td>
              <td className="p-1 sm:p-3 text-white">
                {user.isEditing ? (
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="border border-gray-300 rounded-md p-1 sm:p-2 w-full text-sm sm:text-base text-black"
                  >
                    {roles.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                )}
              </td>
              <td className="p-1 sm:p-3 text-white">
                <span style={{ color: "orange" }}>Invite Pending</span>
              </td>
              <td className="p-1 sm:p-3 flex gap-1 sm:gap-2 flex-col sm:flex-row">
                {user.isEditing ? (
                  savingUserId === user.id ? (
                    <div className="flex items-center justify-center px-1 sm:px-2 py-0.5 sm:py-1">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSaveUser(user.id)}
                      className="bg-[#20AD25] text-white px-1 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-base hover:bg-green-700 w-full sm:w-auto"
                    >
                      Save
                    </button>
                  )
                ) : (
                  <>
                    {/* <button
                      onClick={() =>
                        setUsers((prevUsers) =>
                          prevUsers.map((u) =>
                            u.id === user.id ? { ...u, isEditing: true } : { ...u, isEditing: false }
                          )
                        )
                      }
                      className="bg-white text-[#0034D2] px-1 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-base w-full sm:w-auto"
                    >
                      Edit
                    </button> */}
                    <button
                      onClick={() => handleRemoveInvitation(user.id)}
                      className="bg-red-600 text-white px-1 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-base hover:bg-red-800 w-full sm:w-auto"
                    >
                      Remove
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
</div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationPage;