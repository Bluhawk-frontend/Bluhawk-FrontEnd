import React from 'react';

const CVSSGauge = ({ score }) => {
  const percentage = (score / 10) * 100;
  const gradient = `conic-gradient(
    #13a448 0deg,
    #b0e20b 90deg,    
    #facc15 180deg,
    #fb923c 225deg,
    #dc2626 360deg
  )`;

  return (
    <div className="relative w-52 h-52">

      <div
        className="absolute w-full h-full rounded-full"
        style={{
          background: gradient,
          maskImage: `conic-gradient(#000 ${percentage}%, transparent ${percentage}%)`,
          WebkitMaskImage: `conic-gradient(#000 ${percentage}%, transparent ${percentage}%)`,
        }}
      ></div>

      <div className="absolute inset-8 bg-[#101C40] rounded-full"></div>

      <div className="absolute inset-0 bg-color-0A1229 flex items-center justify-center text-xl font-bold text-white">
        {score}/10
      </div>
    </div>
  );
};

export default CVSSGauge;
