import { useRef, useEffect } from "react";
import { FaGlobe, FaRobot, FaSearch, FaCog, FaBuilding } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";


const features = [
  {
    icon: <FaGlobe className="text-4xl text-blue-500" />,
    title: "360° Threat Visibility",
    description: "Harness intelligence from 50+ global sources, including dark web monitoring, CISA advisories, MITRE ATT&CK, and real-time vulnerability feeds."
  },
  {
    icon: <FaRobot className="text-4xl text-blue-500" />,
    title: "Actionable Insights, Not Just Alerts",
    description: "Our machine learning engine scores threats using EPSS and CVSS to highlight critical risks."
  },
  {
    icon: <FaSearch className="text-4xl text-blue-500" />,
    title: "Stop Attacks Before They Spread",
    description: "Monitor your network for anomalies like unusual data transfers and phishing campaigns spoofing your brand."
  },
  {
    icon: <FaCog className="text-4xl text-blue-500" />,
    title: "Works With Your Existing Tools",
    description: "BluHawk connects to your SIEM, firewalls, and endpoints via prebuilt APIs."
  },
  {
    icon: <FaBuilding className="text-4xl text-blue-500" />,
    title: "Secure Collaboration at Scale",
    description: "Manage roles across organizations with granular access controls and shared threat libraries."
  }
];

export default function Home() {
  const carouselRef = useRef(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -350 * 3, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 350 * 3, behavior: "smooth" });
    }
  };

  return (
    <>
      <HomeNavbar2 />
      <div className="bg-gray-900 text-white min-h-screen px-6 sm:px-12 py-8">
        <header className="text-center py-10">
          <h1 className="text-3xl sm:text-4xl font-bold mt-6 sm:mt-12">Triage and Mitigate Threats Before They Strike</h1>
          <p className="mt-4 sm:mt-5 text-base sm:text-lg max-w-2xl mx-auto">
            BluHawk aggregates, analyzes, and automates threat detection across your digital ecosystem, empowering teams to neutralize risks in real time.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-6 py-3 text-sm sm:text-base font-semibold text-white border border-cyan-500 rounded-md 
              bg-gradient-to-r from-[#6a11cb] to-[#2575fc] transition duration-300 hover:opacity-90">
              Start Free Trial
            </button>
            <button className="px-6 py-3 text-sm sm:text-base font-semibold text-white border border-cyan-500 rounded-md 
              bg-gradient-to-r from-[#6a11cb] to-[#2575fc] transition duration-300 hover:opacity-90">
              Schedule a Demo
            </button>
          </div>
        </header>

        {/* Feature Carousel */}
        <div className="relative mt-5 max-w-6xl mx-auto overflow-hidden px-4 sm:px-12">
          {/* Left Scroll Button (Hidden on Mobile) */}
          <button 
            className="hidden sm:flex absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg z-10"
            onClick={scrollLeft}
          >
            <FiChevronLeft className="text-black text-2xl" />
          </button>

          {/* Scrollable Feature Cards */}
          <div 
            ref={carouselRef} 
            className="flex space-x-6 p-4 overflow-x-auto w-full scrollbar-hide snap-x snap-mandatory "
          >
            {features.map((feature, index) => (
              <div key={index} className="bg-white text-black p-6 rounded-2xl shadow-lg flex-none w-80 h-64 transform transition-transform hover:scale-105 border border-gray-300 snap-center">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-center text-gray-800">{feature.title}</h3>
                <p className="mt-2 text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Right Scroll Button (Hidden on Mobile) */}
          <button 
            className="hidden sm:flex absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg z-10"
            onClick={scrollRight}
          >
            <FiChevronRight className="text-black text-2xl" />
          </button>
        </div>
      </div>
    </>
  );
}
