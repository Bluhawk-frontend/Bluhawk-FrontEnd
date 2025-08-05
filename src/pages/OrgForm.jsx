import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function OrganizationForm() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    logo_url: "",
    country: "",
    state: "",
  });

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [countryError, setCountryError] = useState("");
  const [stateError, setStateError] = useState("");
  const [attemptedCountryFetch, setAttemptedCountryFetch] = useState(false);
  const [attemptedStateFetch, setAttemptedStateFetch] = useState(false);

  // Retry logic for API call
  const fetchWithRetry = async (url, method = "GET", data = null, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = method === "POST"
          ? await axios.post(url, data)
          : await axios.get(url);
        return response;
      } catch (error) {
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  };

  // Fetch countries using CountriesNow.Space API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await fetchWithRetry("https://countriesnow.space/api/v0.1/countries");
        const countryNames = response.data.data
          .map((c) => c.country)
          .sort((a, b) => a.localeCompare(b));
        setCountries(countryNames);
        setCountryError("");
        setAttemptedCountryFetch(true);
      } catch (error) {
        console.error("Error fetching countries:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setCountryError("Unable to load countries. Please try again or check your network.");
        setCountries([]);
        setAttemptedCountryFetch(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch states using CountriesNow.Space API
  const fetchStates = async (selectedCountry) => {
    try {
      setLoading(true);
      setStateError("");
      setAttemptedStateFetch(true);
      const response = await fetchWithRetry(
        "https://countriesnow.space/api/v0.1/countries/states",
        "POST",
        { country: selectedCountry }
      );
      const stateData = response.data?.data?.states || [];
      if (Array.isArray(stateData) && stateData.length > 0) {
        const sortedStates = stateData
          .map((s) => ({ name: typeof s === "string" ? s : s.name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setStates(sortedStates);
        setStateError("");
      } else {
        setStates([]);
        setStateError(`No states available for ${selectedCountry}.`);
      }
    } catch (error) {
      console.error("Error fetching states:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setStates([]);
      setStateError(`Unable to load states for ${selectedCountry}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (url) => {
    const regex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i;
    return regex.test(url);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    if (name === "country") {
      setFormData((prevData) => ({
        ...prevData,
        country: value,
        state: "",
      }));
      if (value) {
        fetchStates(value);
      } else {
        setStates([]);
        setStateError("");
        setAttemptedStateFetch(false);
      }
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Please enter the organisation name";
    if (!formData.country.trim()) newErrors.country = "Please select the country";
    if (!formData.state.trim() && states.length > 0) newErrors.state = "Please select the state";
    if (!formData.address.trim()) newErrors.address = "Please fill the address";

    if (formData.logo_url && !validateUrl(formData.logo_url)) {
      newErrors.logo_url = "* Enter a valid image URL (png, jpg, jpeg, gif, svg)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    navigate("/settings", { state: { activeTab: "Organization" } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrors({});

    if (!validateForm()) return;

    const finalLogoUrl =
      formData.logo_url ||
      `https://via.placeholder.com/150/cccccc/000000?text=${formData.name.charAt(0).toUpperCase()}`;

    const payload = {
      ...formData,
      city: "pune",
      state: formData.state || "Telangana",
      logo_url: finalLogoUrl,
    };

    try {
      setLoading(true);
      const accessToken = Cookies.get("access_token");
      if (!accessToken) {
      throw new Error("No access token found. Please log in.");
    }

    console.log("Sending request with:", { url: `${API_BASE_URL}/auth/create_organization`, payload, token: accessToken.substring(0, 10) + "..." });
      const url = `${API_BASE_URL}/auth/create_organization`;

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
console.log("API response:", response.data);
      setSuccessMessage("Organization created successfully! 🎉");
      setErrors({});
      setOrganizations((prevOrganizations) => [
        ...prevOrganizations,
        response.data.organization,
      ]);
      setFormData({ name: "", address: "", logo_url: "", country: "", state: "" });

      setTimeout(() => {
        navigate("/settings", { state: { activeTab: "Organization" } });
      }, 3000);
    } catch (error) {
      console.error("Error creating organization:", error);
      setSuccessMessage("");
      setErrors({ form: "Error creating organization. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-midnightBlue min-h-screen">
      {/* Back Button */}
      <button
        onClick={handleBack}
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

      <div className="flex flex-col md:flex-row bg-gray-100">
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-deepNavy text-white p-6 md:p-8">
          {formData.logo_url && validateUrl(formData.logo_url) ? (
            <img
              src={formData.logo_url}
              alt="Organization Logo"
              className="w-24 h-24 object-contain mb-4 rounded-full"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/150/cccccc/000000?text=${formData.name.charAt(0).toUpperCase()}`;
              }}
            />
          ) : formData.name ? (
            <div className="w-24 h-24 flex items-center justify-center bg-gray-300 text-primaryDarkBlue text-4xl font-bold rounded-full">
              {formData.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <p className="text-lg mb-4">Upload your organization logo URL</p>
          )}
          {formData.name && <h2 className="text-xl font-semibold mt-2">{formData.name}</h2>}
        </div>

        <div className="w-full md:w-3/4 lg:w-2/3 flex items-center justify-center bg-gray-100 p-6 md:p-10 lg:p-12 flex-grow">
          <form
            className="bg-lightWhite p-6 shadow-lg rounded-lg w-full max-w-2xl h-[90%]"
            onSubmit={handleSubmit}
          >
            <h2 className="text-xl font-semibold text-black mb-4">Create Organization</h2>

            {successMessage && (
              <p className="text-green-600 text-base font-bold mb-4">{successMessage}</p>
            )}
            {errors.form && (
              <p className="text-red-500 text-sm mb-4">{errors.form}</p>
            )}
            {countryError && attemptedCountryFetch && (
              <p className="text-red-500 text-sm mb-4">{countryError}</p>
            )}
            {stateError && attemptedStateFetch && (
              <p className="text-red-500 text-sm mb-4">{stateError}</p>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#5B5B5B]">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-2 p-2 w-full text-white rounded-md bg-denimBlue"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#5B5B5B]">Logo URL</label>
              <input
                type="text"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                className="mt-2 p-2 w-full rounded-md text-white bg-denimBlue"
              />
              {errors.logo_url && <p className="text-red-500 text-sm">{errors.logo_url}</p>}
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#5B5B5B]">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="mt-2 p-2 w-full border rounded-md text-white bg-denimBlue"
                  disabled={loading}
                >
                  <option value="">Select a country</option>
                  {countries.map((country, index) => (
                    <option key={index} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-[#5B5B5B]">
                  State <span className="text-red-500" style={{ visibility: states.length > 0 ? "visible" : "hidden" }}>*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="mt-2 p-2 w-full border rounded-md text-white bg-denimBlue"
                  disabled={loading || !formData.country}
                >
                  <option value="">Select a state</option>
                  {states.map((state, index) => (
                    <option key={index} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#5B5B5B]">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 p-2 w-full text-white rounded-md h-24 resize-none bg-denimBlue"
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>

            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="text-center bg-[#0034D2] text-white p-2 px-10 rounded-md hover:bg-blue-800"
                disabled={loading}
              >
                {loading ? "Loading..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}