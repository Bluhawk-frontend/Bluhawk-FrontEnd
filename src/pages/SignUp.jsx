import React, { useState, useEffect, useRef } from "react"; // Added useRef
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { Link } from "react-router-dom";
import LogoSrc from "../assets/images/bluehawk-dark.png";
import newSignupImage from "../assets/images/new-signup-image.jpg"; // Updated import (replace with your new image)

const SignUp = ({ isOpen, setModalContent }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; // Added Google Client ID
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    reenter_password: "",
    verification_key: "",
  });
  const [showVerificationField, setShowVerificationField] = useState(false);
  const [errors, setErrors] = useState({});
  const [verificationMsg, setVerificationMsg] = useState("");
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReenterPassword, setShowReenterPassword] = useState(false);

  // Refs for Google Sign-In and Sign Up button
  const googleButtonRef = useRef(null);
  const signUpButtonRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(null);

  // Measure Sign Up button width
  useEffect(() => {
    if (signUpButtonRef.current) {
      const width = signUpButtonRef.current.offsetWidth;
      setButtonWidth(width);
    }
  }, []);

  // Auto-hide password after 3 seconds
  useEffect(() => {
    if (showPassword || showReenterPassword) {
      const timeout = setTimeout(() => {
        setShowPassword(false);
        setShowReenterPassword(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [showPassword, showReenterPassword]);

  // Initialize Google Sign-In
  useEffect(() => {
    if (window.google && GOOGLE_CLIENT_ID && buttonWidth) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
        auto_select: false,
      });

      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline", // Match Sign Up button style
          size: "large",
          text: "signup_with", // Use "Sign up with Google" text
          shape: "rectangular",
          width: buttonWidth, // Match Sign Up button width
        });
      }

      window.google.accounts.id.prompt();
    } else {
      console.error("Google SDK not loaded, Client ID missing, or width not set.");
    }
  }, [GOOGLE_CLIENT_ID, buttonWidth]);

  // Handle Google Sign-In response
  const handleGoogleSignIn = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/google-signin`, {
        token: idToken,
      });
      if (response?.status === 200) {
        const access_token = response.data.access;
        const refresh_token = response.data.refresh;

        const accessTokenExpiresAt = Date.now() + 10 * 60 * 1000;
        localStorage.setItem("access_token_expiry", accessTokenExpiresAt);

        Cookies.set("access_token", access_token, { expires: accessTokenExpiresAt });
        Cookies.set("refresh_token", refresh_token, { expires: 7 });

        setMessage("Google Sign-Up successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      setMessage(
        `Error: ${
          error?.response?.data?.message ||
          error?.message ||
          "Google Sign-Up failed."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let filteredValue = value; 
    if(id === 'verification_key'){
        filteredValue = value.replace(/\D/g, ''); 
    }
    setFormData((prevData) => ({ ...prevData, [id]: filteredValue }));
    setErrors({});
  };

  const validateFields = () => {
    const { email, password, reenter_password } = formData;
    const newErrors = {};
    if (!email) {
      newErrors.email = "Please enter your email.";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Please enter your password.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }
    if (password !== reenter_password) {
      newErrors.reenter_password = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    setLoading(true);
    try {
      const { email, password, reenter_password } = formData;
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email,
        password,
        reenter_password,
      });

      if (response.status === 200) {
        setMessage(''); 
        setShowVerificationField(true);
        setVerificationMsg(
          "Verification code required. Please enter the code sent to your email."
        );
        
        setLoading(false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage('Error: ' + (error?.response?.data?.message || error?.message|| 'An unexpected error occurred. Please try again.'));
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        ...formData,
      });

      if (response.status === 200 || response.status === 201) {
        const { access_token, refresh_token, access_token_expiry } = response.data.data;
        Cookies.set("access_token", access_token, { expires: 1 });
        Cookies.set("refresh_token", refresh_token, { expires: 7 });
        localStorage.setItem("access_token_expiry", Date.now() + access_token_expiry * 1000);

        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setMessage('Error: ' + (error?.response?.data?.message || error?.message|| 'Verification failed. Please try again.'));
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowReenterPassword(!showReenterPassword);
    }
  };
  

   const renderInputField = (id, label, showPasswordState, toggleFunction, type = "text", placeholder = "") => (
  <div className="relative">
    <label htmlFor={id} className="block text-black text-sm mb-1">
      {label}:
    </label>
    <div className="relative">
      <input
        type={type}
        id={id}
        value={formData[id]}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-[#033A72] text-sm text-[#033A72] bg-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-[#033A72] placeholder-gray-300"
        placeholder={placeholder}
      />
      {(id === "password" || id === "reenter_password") && (
        <button
          type="button"
          className="absolute inset-y-0 right-4 flex items-center text-gray-300"
          onClick={() => toggleFunction(id)}
        >
          {showPasswordState ? <FaEye /> : <FaEyeSlash />}
        </button>
      )}
    </div>
    {errors[id] && <p className="text-red-400 text-xs mt-1">{errors[id]}</p>}
  </div>
);



  return (
    <div
      className={`${isOpen ? "" : "h-screen"} flex justify-center items-center`}
      style={{
        backgroundImage: `url(${newSignupImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="h-[600px] w-[800px] text-black relative flex justify-center items-center max-w-4xl sm:max-w-4xl">
        <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div> {/* Overlay for readability */}
         <div className="w-[400px] sm:w-[420px] p-8 bg-[#FDFDFF] border border-white rounded-md shadow-lg relative z-10 text-black">
  <div className="mb-6">
    <img
      src={LogoSrc}
      alt="BluHawk Logo"
      className="h-12 w-auto mx-auto mb-4"
    />
    <h2 className="text-xl font-semibold text-center">Sign Up</h2>
  </div>

  {verificationMsg && (
    <p className="text-green-400 text-sm text-center mb-2">{verificationMsg}</p>
  )}
  {message && (
    <p className={`${message.includes("Error") ? "text-red-400" : "text-green-400"} text-sm text-center mb-2`}>
      {message}
    </p>
  )}

  <form onSubmit={showVerificationField ? handleVerificationSubmit : handleSubmit} className="flex flex-col gap-4">
    {!showVerificationField ? (
      <>
        {renderInputField("email", "Email", false, null, "email", "Enter your email")}
        {renderInputField("password", "Password", showPassword, togglePasswordVisibility, showPassword ? "text" : "password", "Enter your password")}
        {renderInputField("reenter_password", "Confirm Password", showReenterPassword, togglePasswordVisibility, showReenterPassword ? "text" : "password", "Re-enter your password")}
      </>
    ) : (
      renderInputField("verification_key", "Verification Code", false, null, "text", "Enter verification code")
    )}

    <button
      ref={signUpButtonRef}
      type="submit"
      className="w-full bg-[#033A72] text-white py-2 rounded-full  transition text-lg font-semibold"
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <span className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></span>
          <span>Loading...</span>
        </div>
      ) : showVerificationField ? (
        "Verify & Complete Signup"
      ) : (
        "Sign Up"
      )}
    </button>

    {!showVerificationField && (
      <div className="mt-2 w-full flex justify-center">
        <div ref={googleButtonRef} className="w-full"></div>
      </div>
    )}
  </form>

  {!showVerificationField && (
    <p className="mt-4 text-sm text-center">
      Already have an Account?{" "}
      {isOpen ? (
        <span
          onClick={() => setModalContent("Sign-in")}
          className="text-[#033A72] cursor-pointer hover:underline"
        >
          Login
        </span>
      ) : (
        <Link to="/login" className="text-pink-400 hover:underline">Login</Link>
      )}
    </p>
  )}
</div>


      </div>
    </div>
  );
};

export default SignUp;