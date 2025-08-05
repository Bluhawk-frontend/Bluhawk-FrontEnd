import React from "react";
import HomeNavbar from "./HomeNavbar";

const ThreatMap2 = () => {
  const VITE_kaspersky_ThreatMap_API = import.meta.env.VITE_kaspersky_ThreatMap_API;

  return (
    <div className="w-full min-h-screen h-screen">
        <div className="h-20 w-full bg-gradient-to-r from-[#0a0a1a] to-[#0d0d2b]  flex items-center justify-between ">
        <HomeNavbar/>
        </div>
        <iframe  src={VITE_kaspersky_ThreatMap_API} frameborder="0"
         className="w-full h-full border border-gray-700 bg-gradient-to-r from-[#0a0a1a] to-[#0d0d2b]"
        >
        </iframe>

        
    </div>
  );
};

export default ThreatMap2;
