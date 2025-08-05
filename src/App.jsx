import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { scheduleTokenRefresh, clearTokenRefresh } from "./utils/tokenManager";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Login from "./pages/SignIn";
import Register from "./pages/SignUp";
import ForgotPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
// import Home from "./pages/Home";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import MyIntel from "./components/MyIntel";
import FindIntel from "./components/FindIntel";
import NoMatchesFound from "./pages/NoMatchesFound";
import OrganizationForm from "./pages/OrgForm";
import OrganizationPage from "./pages/OrganizationPage"; // Import the new OrganizationPage
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/SettingsPage";
import PrivateRoute from "./features/authentication/PrivateRoute";
import ThreatMap from "./components/ThreatMap";
import ThreatMap2 from "./components/ThreatMap2";
import UsagePage from "./pages/Usage";
import HomePage2 from "./pages/HomePage";
import Wildcard from "./pages/Wildcard";
import CompanyProfile from "./pages/Company";
import ProfileByAddress from "./pages/ProfileByAddress";
import UploadFile from "./pages/UploadFile";
import UploadHistory from "./pages/UploadHistory";
import AllNftsPage from "./pages/AllNftsPage";
import AllTransactionsPage from "./pages/AllTransactionsPage";
import CpePage from "./pages/Cpe"; 
import CpeDetails from "./pages/CpeDetails";
import UsageDashboard from "./pages/UsageDashboard";
import MindMapGraph from "./pages/MindMap";
import VtGraph from "./pages/VtGraph";
import InviteManagementPage from "./pages/invitepage"
import AttackSurface from "./pages/AttackSurface";
import LogDetailPage from "./pages/LogDetailPage";
import JsonDataViewer from "./pages/JsonDataViewer";
function App() {
  useEffect(() => {
    // console.log("Initializing token refresh...");
    scheduleTokenRefresh();

    return () => {
      clearTokenRefresh();
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/" element={<HomePage2 />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/threatmap" element={<ThreatMap/>} />
        <Route path="/threatmap2" element={<ThreatMap2/>} />
        <Route path="/graph" element={<MindMapGraph />} />
        <Route path="/usage" element={<UsagePage />} />
        <Route path="/invites/:token"element={<InviteManagementPage />} /> 
        <Route path="/json-viewer" element={<JsonDataViewer />} />

        {/* Private Routes */}

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <UsageDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-organization"
          element={
            <PrivateRoute>
              <OrganizationForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/organization/:id/:name/:role/"
          element={
             <PrivateRoute>
              <OrganizationPage />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/my-intel"
          element={
            <PrivateRoute>
              <MyIntel />
            </PrivateRoute>
          }
        />
        <Route
          path="/cpe"
          element={
            <PrivateRoute>
              <CpePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cpe-details"
          element={
            <PrivateRoute>
              <CpeDetails />
            </PrivateRoute>
          }
        />
       <Route
          path="/attack-credential"
          element={
            <PrivateRoute>
              <AttackSurface/>
            </PrivateRoute>
          }
        />

       
        <Route
          path="/find-intel"
          element={
            <PrivateRoute>
              <FindIntel />
            </PrivateRoute>
          }
        />
         <Route
          path="/profile-by-address"
          element={
            <PrivateRoute>
              <ProfileByAddress />
            </PrivateRoute>
          }
        />
          <Route
          // path="/company"
          element={
            <PrivateRoute>
              <CompanyProfile />
            </PrivateRoute>
          }
        />
          <Route
          path="/upload-file"
          element={
            <PrivateRoute>
              <UploadFile />
            </PrivateRoute>
          }
        />
          <Route
          path="/upload-history"
          element={
            <PrivateRoute>
              <UploadHistory />
            </PrivateRoute>
          }
        />
          <Route
          path="/all-nfts"
          element={
            <PrivateRoute>
              <AllNftsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/all-transactions"
          element={
            <PrivateRoute>
              <AllTransactionsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/vt-graph"
          element={
            <PrivateRoute>
              <VtGraph />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/usage-log/:id" // Added new private route for log details
          element={
            <PrivateRoute>
              <LogDetailPage />
            </PrivateRoute>
          }
        />
        <Route
        path="/wildcard-intel"
         element={<Wildcard/>}/>
        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;