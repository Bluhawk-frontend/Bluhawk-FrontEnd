import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import LogoSrc from "../assets/images/bluehawk-dark.png";
import loginimg from "../assets/images/Getin.jpg"; // Login image

const ForgotPassword = ({ setModalContent = "Sign-in", isOpen }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorsMsg, setErrorsMsg] = useState(""); // Error state
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // ⬅️ prevent default form behavior

    if (!email) {
      setErrorsMsg("Please enter your email.");
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorsMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/forgotten_password`,
        { email }
      );
      setMessage(response.data.message);
      setLoading(false);
      // navigate('/reset-password');
    } catch (error) {
      console.log("Forget Password error : ", error);
      setMessage(
        "Error: " +
          (error?.response?.data?.message || error?.message || "Error occured.")
      );
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`${
          isOpen ? "" : "h-screen"
        } flex justify-center items-center bg-[#010314]`}
      >
        <div className="h-[500px] w-[800px] bg-lightWhite flex shadow-lg rounded-lg overflow-hidden max-w-4xl sm:max-w-4xl text-black">
          
          {/* Left Section: Illustration (now first) */}
          <div className="w-full bg-deepNavy sm:flex hidden items-center justify-center">
            <img
              src={loginimg}
              alt="Login Image"
              className="inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Right Section: Forget Password Form */}
          <div className="w-full p-8 flex flex-col">
            <div className="flex flex-col items-center text-center">
              <img
                src={LogoSrc}
                alt="BluHawk Logo"
                className="h-14 w-auto mb-4"
                onError={(e) => {
                  console.error("Failed to load logo:", LogoSrc);
                  e.target.src = "/bluhawk-blackbg.png"; // Fallback image
                }}
              />
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                Forgot Password?
              </h2>
              <p className="text-gray-800 text-sm mb-6 max-w-sm">
                Enter your registered email address below, and we'll send you a
                verification link.
              </p>
              {errorsMsg && (
                <p className="text-red-500 text-sm pb-2">{errorsMsg}</p>
              )}
              {message && (
                <p
                  className={`${
                    message.includes("Error")
                      ? "text-red-500"
                      : "text-green-500"
                  } text-sm pb-2`}
                >
                  {message}
                </p>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 justify-between"
            >
              {/* Email Input */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-800 text-sm font-medium mb-2"
                >
                  Email :
                </label>
                <input
                  type="email"
                  id="email"
                  onChange={(e) => [
                    setEmail(e.target.value),
                    setErrorsMsg(""),
                    setMessage(""),
                  ]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#033A72]"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                {/* Verify Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-[#033A72] text-white py-2 rounded-md "
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></span>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    "Verify"
                  )}
                </button>
                {isOpen ? (
                  <p className="mt-2 text-sm text-center text-gray-800">
                    Remember your password?{" "}
                    <span
                      onClick={() => setModalContent("Sign-in")}
                      className="text-[#033A72] cursor-pointer hover:underline"
                    >
                      Login
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-center text-gray-600 mt-2">
                    Remember your password?{" "}
                    <Link
                      to="/login"
                      className="text-[#033A72] hover:underline"
                    >
                      Login
                    </Link>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
