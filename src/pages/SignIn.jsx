import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie"; // For cookie management
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import loginimg from "../assets/images/Getin.png"; // Login image
import { scheduleTokenRefresh, clearTokenRefresh } from "../utils/tokenManager";
import { Link } from "react-router-dom";
import LogoSrc from "../assets/images/bluehawk-dark.png";

const SignIn = ({ isOpen, setModalContent }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; // Added Google Client ID
  const navigate = useNavigate();

  // State management
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // New state to track login success
  const [is2FAEnabled, setIs2FAEnabled] = useState(false); // New state for 2FA
  const [verificationCode, setVerificationCode] = useState(""); // State for 2FA code

  // Google Sign-In button ref
  const googleButtonRef = useRef(null);

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // Auto-hide password after 3 seconds
  useEffect(() => {
    if (showPassword) {
      const timeout = setTimeout(() => setShowPassword(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showPassword]);

  // Input change handler
  const onInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
    setMessage("");
  };

  // Handle verification code input change
  const handleVerificationCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Allow only digits
    if (value.length <= 6) {
      setVerificationCode(value);
      setMessage("");
    }
  };

  // Validate form inputs
  const validateFields = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Please enter your email.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.password) {
      newErrors.password = "Please enter your password.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Google Sign-In response
  const handleGoogleSignIn = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    setLoading(true);
    console.log(credentialResponse);
    console.log(idToken);
    try {
      // Send ID token to backend
      const response = await axios.post(`${API_BASE_URL}/auth/google-signin`, {
        token: idToken,
      });
      console.log(response);
      if (response?.status === 200) {
        const access_token = response.data.access;
        const refresh_token = response.data.refresh;
        const accessTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minute expiry
        localStorage.setItem("access_token_expiry", accessTokenExpiresAt);
        Cookies.set("access_token", access_token, { expires: accessTokenExpiresAt });
        Cookies.set("refresh_token", refresh_token, { expires: 7 });
        setMessage("Google Sign-In successful!");
        setIsLoggedIn(true);
        navigate("/dashboard");
      }
    } catch (error) {
      setMessage(
        `Error: ${
          error?.response?.data?.message ||
          error?.message ||
          "Google Sign-In failed."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Sign-In
  useEffect(() => {
    if (window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
        auto_select: false, // Optional: Auto-select account if recently used
      });
      // Render Google Sign-In button
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = ""; // Clear previous render if it exists
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: googleButtonRef.current.offsetWidth,
        });
      }
      // Optional: Prompt for account selection
      window.google.accounts.id.prompt(); // Shows One Tap prompt if applicable
    } else {
      console.error("Google SDK not loaded or Client ID missing.");
    }
  }, [GOOGLE_CLIENT_ID]);

  // Submit handler for login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    setLoading(true);
    try {
      console.log("API URL from env: ", `${API_BASE_URL}/auth/signin`);
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, formData);

      if (response?.status === 200) {
        if (response.data["2fa_enabled"]) {
          setIs2FAEnabled(true);
          setMessage(response.data.message || "Please provide the verification code.");
        } else {
          const { access_token, refresh_token } = response.data.data;
          const accessTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minute expiry
          localStorage.setItem("access_token_expiry", accessTokenExpiresAt);
          Cookies.set("access_token", access_token, { expires: accessTokenExpiresAt });
          Cookies.set("refresh_token", refresh_token, { expires: 7 });
          setMessage("Login successful!");
          setIsLoggedIn(true);
          navigate("/dashboard");
        }
      }
    } catch (error) {
      setMessage(
        `Error: ${
          error?.response?.data?.message ||
          error?.message ||
          "Invalid credentials."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA verification submission
  const handle2FASubmit = async (e) => {
    e.preventDefault();

    if (!verificationCode || !formData.email || verificationCode.length !== 6) {
      setMessage("Email and verification code are required!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/2fa_verification/`,
        {
          verification_code: verificationCode,
          email: formData.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Ensure cookies like CSRF token are sent
        }
      );

      console.log("2FA response:", response.data);

      if (response?.status === 200) {
        const { access_token, refresh_token } = response.data.data;
        if (!access_token || !refresh_token) {
          throw new Error("Missing tokens in 2FA response.");
        }

        const accessTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        Cookies.set("access_token", access_token, { expires: accessTokenExpiresAt });
        Cookies.set("refresh_token", refresh_token, { expires: 7 });

        setMessage("2FA verification successful!");
        setIsLoggedIn(true);
        navigate("/dashboard");
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      console.log("2FA error:", error.response?.data);
      setMessage(
        `Error: ${
          error?.response?.data?.message ||
          error?.message ||
          "Invalid verification code."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Trigger token refresh logic when logged in
  useEffect(() => {
    if (isLoggedIn) {
      scheduleTokenRefresh(); // Trigger token refresh logic
      return () => {
        // clearTokenRefresh(); // Clean up token refresh logic on component unmount
      };
    }
  }, [isLoggedIn]); // Only run this effect when `isLoggedIn` state changes

  return (
    <div
      className={`${
        isOpen ? "" : "h-screen"
      } flex justify-center items-center bg-[#010314]`}
    >
      <div className="relative h-[550px] w-[800px] bg-lightWhite text-black flex shadow-lg rounded-lg overflow-hidden max-w-full sm:max-w-4xl">
        {/* Form Section */}
        <div className="w-full md:w-1/2 p-4 flex flex-col justify-between">
          <div>
            <img
              src={LogoSrc}
              alt="BluHawk Logo"
              className="h-14 w-auto"
              onError={(e) => {
                console.error("Failed to load logo:", LogoSrc);
                e.target.src = "/bluhawk-blackbg.png";
              }}
            />
            <h2 className="text-small font-semibold mb-2 text-gray-800 py-2">
              {is2FAEnabled ? "Two-Factor Authentication" : "Login to your account"}
            </h2>
            {message && (
              <p
                className={`text-sm pb-2 ${
                  message.includes("Error") ? "text-red-500" : "text-green-500"
                }`}
              >
                {message}
              </p>
            )}
          </div>
          {is2FAEnabled ? (
            <form onSubmit={handle2FASubmit} className="flex flex-col h-[78%] justify-between">
              <div>
                <div className="mb-4 mt-2">
                  <label
                    htmlFor="verificationCode"
                    className="block text-gray-700 text-sm font-medium mb-2"
                  >
                    Verification Code:
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={handleVerificationCodeChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <button
                  type="submit"
                  className="w-full px-6 bg-denimBlue text-white py-2 rounded-md hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></span>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col h-[78%] justify-between"
            >
              {/* Email Field */}
              <div>
                <div className="mb-4 mt-2">
                  <label
                    htmlFor="email"
                    className="block text-gray-700 text-sm font-medium mb-2"
                  >
                    Email:
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={onInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>
                {/* Password Field */}
                <div className="mb-6">
                  <label
                    htmlFor="password"
                    className="block text-gray-700 text-sm font-medium mb-2"
                  >
                    Password:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={formData.password}
                      onChange={onInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your password"
                      autoComplete="new-password"
                    />
                    <span
                      className="absolute inset-y-0 right-4 flex items-center cursor-pointer"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </span>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>
              </div>
              {/* Buttons */}
              <div className="flex flex-col items-center">
                <button
                  type="submit"
                  className="w-full px-6 bg-denimBlue text-white py-2 rounded-md hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></span>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    "Log In"
                  )}
                </button>
                {/* Google Sign-In Button */}
                <div className="mt-4 w-full">
                  <div className="w-full" ref={googleButtonRef}></div>
                </div>
                {/* Links */}
                <div className="text-sm text-center text-gray-600 mt-2">
                  {isOpen ? (
                    <>
                      <p className="mt-2 text-sm text-center text-gray-800">
                        Don’t have an account?
                        <span
                          onClick={() => setModalContent("Sign-up")}
                          className="text-[#FE5E15] cursor-pointer hover:underline"
                        >
                          Sign Up
                        </span>
                      </p>
                      <p className="mt-2 text-sm text-center text-blue-800">
                        <span
                          onClick={() => setModalContent("forgot-password")}
                          className="text-[#FE5E15] cursor-pointer hover:underline"
                        >
                          Forgot password?
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-sm text-center text-gray-800">
                        Don’t have an account?{" "}
                        <Link to="/signup" className="text-[#FE5E15] hover:underline">
                          Sign Up
                        </Link>
                      </p>
                      <p className="mt-2 text-sm text-center">
                        <Link
                          to="/forgot-password"
                          className="text-[#FE5E15] hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
        {/* Image Section */}
        <div className="hidden md:block sm:flex w-1/2 bg-deepNavy items-center justify-center">
          <img
            src={loginimg}
            alt="LogIn"
            className="h-auto max-h-full w-auto max-w-full object-contain py-20"
          />
        </div>
      </div>
    </div>
  );
};

export default SignIn;