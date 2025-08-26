import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import loginimg from "../assets/images/Getin.jpg"; // Login image
import { scheduleTokenRefresh } from "../utils/tokenManager";
import LogoSrc from "../assets/images/bluehawk-dark.png";

const SignIn = ({ isOpen, setModalContent }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const googleButtonRef = useRef(null);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  useEffect(() => {
    if (showPassword) {
      const timeout = setTimeout(() => setShowPassword(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showPassword]);

  const onInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
    setMessage("");
  };

  const handleVerificationCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) setVerificationCode(value);
    setMessage("");
  };

  const validateFields = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Please enter your email.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email address.";
    if (!formData.password) newErrors.password = "Please enter your password.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, formData);

      if (response?.status === 200) {
        if (response.data["2fa_enabled"]) {
          setIs2FAEnabled(true);
          setMessage(response.data.message || "Please provide the verification code.");
        } else {
          const { access_token, refresh_token } = response.data.data;
          const accessTokenExpiresAt = Date.now() + 10 * 60 * 1000;
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
          error?.response?.data?.message || error?.message || "Invalid credentials."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) scheduleTokenRefresh();
  }, [isLoggedIn]);

  return (
    <div className={`${
        isOpen ? "" : "h-screen"
      } flex justify-center items-center bg-[#010314]`}
    >
      <div className="relative flex shadow-lg rounded-lg overflow-hidden h-[550px] w-[800px] max-w-full sm:max-w-4xl">
        {/* Left Image */}
        <div className="hidden md:block w-1/2 bg-deepNavy relative">
          <img
            src={loginimg}
            alt="Login"
            className=" inset-0 w-full h-full object-cover"
          />absolute
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 bg-white p-6 flex flex-col justify-center">
          <div className="mb-6 flex flex-col items-center">
            <img
              src={LogoSrc}
              alt="BluHawk Logo"
              className="h-14 w-auto mb-2"
            />
            <h2 className="text-lg font-semibold text-gray-800">
              {is2FAEnabled ? "Two-Factor Authentication" : "Login to your account"}
            </h2>
            {message && (
              <p
                className={`text-sm mt-2 ${
                  message.includes("Error") ? "text-red-500" : "text-green-500"
                }`}
              >
                {message}
              </p>
            )}
          </div>

          {is2FAEnabled ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 6-digit code"
              />
              <button
                type="submit"
                className="w-full bg-denimBlue text-white py-2 rounded-md hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={onInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#033A72]"
                placeholder="Enter your email"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={onInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#033A72]"
                  placeholder="Enter your password"
                />
                <span
                  className="absolute inset-y-0 right-4 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button
                type="submit"
                className="w-full bg-[#033A72] text-white py-2 rounded-md"
                disabled={loading}
              >
                {loading ? "Loading..." : "Log In"}
              </button>
              <div ref={googleButtonRef} className="w-full mt-2"></div>
              <div className="text-sm text-center mt-4">
                <p>
                  Don’t have an account?{" "}
                  <span
                    onClick={() => setModalContent("Sign-up")}
                    className="text-[#033A72] cursor-pointer hover:underline"
                  >
                    Sign Up
                  </span>
                </p>
                <p className="mt-1">
                  <span
                    onClick={() => setModalContent("forgot-password")}
                    className="text-[#033A72] cursor-pointer hover:underline"
                  >
                    Forgot password?
                  </span>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
