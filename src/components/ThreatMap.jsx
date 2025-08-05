import React from "react";

import HomeNavbar from "./HomeNavbar";
const ThreatMap = () => {
  const VITE_Raven_ThreatMap_Production = import.meta.env.VITE_Raven_ThreatMap_Production;
  return (
    <div className="w-full min-h-screen h-screen">
        <div className="h-20 w-full bg-gradient-to-r from-[#0a0a1a] to-[#0d0d2b]  flex items-center justify-between ">
        <HomeNavbar/>
        </div>
      <iframe
        src={VITE_Raven_ThreatMap_Production}
        className="w-full h-full border border-gray-700 bg-gradient-to-r from-[#0a0a1a] to-[#0d0d2b]"
        title="Threat Map"
      ></iframe>
    </div>
  );
};

export default ThreatMap;
