import React, { useState, useRef, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Cookies from "js-cookie"; // Added for token
import { useNavigate } from "react-router-dom"; // Added for navigation
import Footer from "../components/reusable/Footer";
import HomeNavbar from "../components/HomeNavbar";
import gridbackground from "../assets/images/grid-background.jpg";
import lockImage from "../assets/images/lock.png"; // Add this line (adjust path as needed)
import useTypingAnimation from "../hooks/useTypingAnimation";
import FeedbackCard from "../components/FeedbackCard";
import lockVideo from "../assets/videos/lock.webm";

// Placeholder imports for images
import man from "../assets/images/Man.png";
import Link0 from "../assets/images/Link.jpg";
import Link1 from "../assets/images/Link1.jpg";
import Link2 from "../assets/images/Link2.jpg";
import Group1 from "../assets/images/Group1.png";
import Group2 from "../assets/images/Group2.png";
import Group3 from "../assets/images/Group3.png";
import Group4 from "../assets/images/Group4.png";
import Group5 from "../assets/images/Group5.png";
import Group6 from "../assets/images/Group6.png";
import Group7 from "../assets/images/Group7.png";
import Group8 from "../assets/images/Group8.png";
import white1 from "../assets/images/white-1.png";
import white2 from "../assets/images/white-2.png";
import white3 from "../assets/images/white-3.png";
import white4 from "../assets/images/white-4.png";
import white5 from "../assets/images/white-5.png";
import white6 from "../assets/images/white-6.png";
import white7 from "../assets/images/white-7.png";
import white8 from "../assets/images/white-8.png";
import F1 from "../assets/images/F1.png";
import F2 from "../assets/images/F2.png";
import F3 from "../assets/images/F3.png";
import F4 from "../assets/images/F4.png";
import F5 from "../assets/images/F5.png";
import F6 from "../assets/images/F6.png";
import F7 from "../assets/images/F7.png";
import F8 from "../assets/images/F8.png";
import bgCEO from "../assets/images/BG-CEO.png";

// FeedbackCarousel Component
const FeedbackCarousel = ({ feedbacks }) => {
  const [index, setIndex] = useState(0);
  const carouselRef = useRef(null);

  const cardsPerView = () => {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const [visibleCards, setVisibleCards] = useState(cardsPerView());

  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(cardsPerView());
      setIndex(0); // Reset on resize
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.ceil(feedbacks.length / visibleCards);

  const updateTransform = (newIndex) => {
    if (carouselRef.current) {
      carouselRef.current.style.transition = "transform 0.5s ease-in-out";
      const cardWidthPercent = 100 / visibleCards;
      carouselRef.current.style.transform = `translateX(-${newIndex * cardWidthPercent}%)`;
    }
  };

  const prevSlide = () => {
    const newIndex = index === 0 ? totalSlides - 1 : index - 1;
    setIndex(newIndex);
    updateTransform(newIndex);
  };

  const nextSlide = () => {
    const newIndex = index === totalSlides - 1 ? 0 : index + 1;
    setIndex(newIndex);
    updateTransform(newIndex);
  };

  useEffect(() => {
    if (carouselRef.current) {
      const resetTransform = () => {
        carouselRef.current.style.transition = "none";
        const cardWidthPercent = 100 / visibleCards;
        carouselRef.current.style.transform = `translateX(-${index * cardWidthPercent}%)`;
      };
      const currentRef = carouselRef.current;
      currentRef.addEventListener("transitionend", resetTransform);
      return () => currentRef.removeEventListener("transitionend", resetTransform);
    }
  }, [index, visibleCards]);

  return (
    <section className="bg-gray-300 py-16 px-10 flex flex-col items-center space-y-8 justify-items-start w-full relative">
      <div className="w-full">
        <h2 className="text-3xl font-bold text-red-900 mb-2 text-center">Customer Feedback</h2>
        <p className="text-gray-800 mb-10 text-center max-w-2xl mx-auto">
          Our customers' thoughts are important to us, and their feedback helps us improve. Many now share their opinions easily using simple tools.
        </p>
        {/* Left Arrow */}
        <button
          className="absolute left-4 z-10 bg-teal-900 p-2 rounded-full shadow-md"
          onClick={prevSlide}
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          <FaArrowLeft className="w-6 h-6 text-white" />
        </button>

        {/* Card Track */}
        <div className="relative w-full flex items-center justify-center overflow-hidden">
          <div className="flex w-full justify-start">
            <div
              ref={carouselRef}
              className="flex w-full overflow-hidden gap-2"  // 👈 small gap (8px)
              style={{
                width: `${feedbacks.length * (100 / visibleCards)}%`,
              }}
            >
              {feedbacks.map((item, i) => (
                <div
                  key={i}
                  className="flex-shrink-0"
                  style={{ 
                    width: `calc(${100 / visibleCards}% - 8px)`,  // 👈 minus gap correction
                    boxSizing: "border-box",
                    margin: 0,
                    padding: 0
                  }}
                >
                  <FeedbackCard
                    name={item.name}
                    feedback={item.feedback}
                    className="w-full h-full m-0 p-0"
                    style={{ 
                      width: '100%',
                      height: '100%',
                      margin: 0,
                      padding: 0,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Arrow */}
        <button
          className="absolute right-4 z-10 bg-teal-900 p-2 rounded-full shadow-md"
          onClick={nextSlide}
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          <FaArrowRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </section>
  );
};

// HomePage Component
const HomePage = () => {
  const navigate = useNavigate(); // Added for navigation
  const token = Cookies.get('access_token'); // Added for token check
  const openModalFromNavbarRef = useRef(null); // Use ref to persist function
  const securityLockText = useTypingAnimation("SECURITY LOCK", 150, 2000, true);

  // Reference to store the openModal function from HomeNavbar
  let openModalFromNavbar;

  // Function to receive openModal from HomeNavbar
  const handleOpenModalFromNavbar = (openModalFunc) => {
    openModalFromNavbar = openModalFunc; // Store the function reference
  };

  const handleGotoDashboardClick = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      if (openModalFromNavbar) {
        openModalFromNavbar("Sign-in"); // Trigger the sign-in popup
      } else {
        // Fallback in case the modal function isn’t available (optional)
        navigate('/dashboard');
      }
    }
  };

  const features = [
    { name: "Threat Intelligence", img: Link0, description: "Stay ahead of evolving cyber threats with real-time intelligence." },
    { name: "System Audit", img: Link1, description: "Detect and eliminate malicious software to restore system integrity and performance." },
    { name: "Malware Removal", img: Link2, description: "Analyze configurations and vulnerabilities to ensure optimal security posture." },
  ];

  const services = [
    { name: "Network Security", img: Group3 },
    { name: "Asset Analysis", img: Group5 },
  ];

  const secondRowServices = [
    { name: "Adversary Intelligence", img: Group1 },
    { name: "Treat Prioritization", img: Group5 },
  ];

  const thirdRowServices = [
     { name: "Vulnerability Intelligence", img: Group3 },
    { name: "Automated Scanning", img: Group5 },
  ];

  const feedbacks = [
    { name: "Revathi", feedback: "Great tool for replacing text! The dummy text keeps the layout perfect." },
    { name: "Ramu", feedback: "The support team was friendly and fixed my problem fast." },
    { name: "Pavitra", feedback: "Amazing service! Easy to use and very reliable." },
    { name: "Indhu", feedback: "Clean interface, loved it!" },
    { name: "Suresh", feedback: "Super fast and accurate results. Highly recommend!" },
    { name: "Raj", feedback: "Simple and smooth experience overall." },
  ];

  const testimonialData = [
    {
      id: 1,
      quote: "An cyber security multi-national firm is a security money of one or more experts. Provides more profit, We help your satéle to future life and then create the road. Grow money speedily without any risk.",
      name: "Jose Philip",
      role: "CEO",
      image: man,
    },
  ];

  const securityFeatures = [
    {
      name: "Network Security",
      img: Group3,
      pic: white1,
      contentImg: F1,
      description: "Network compromises result in botnet creation, where attackers control numerous infected devices. These botnets facilitate various malicious activities, including",
      details: [
        "DDoS Attacks: Overwhelming target networks, disrupting services.",
        "Data Theft: Exfiltrating sensitive information.",
        "Phishing/Spam: Distributing malware and phishing attempts.",
        "Financial Fraud: Automating unauthorized transactions.",
        "Cryptojacking: Hijacking computing power for cryptocurrency mining.",
        "Persistent Threat Evolution: Using encryption and P2P communication to evade detection.",
      ],
    },
    {
      name: "Adversary Intelligence",
      img: Group1,
      pic: white2,
      contentImg: F2,
      description: "BluHawk's Adversary Intelligence provides the critical insights you need to stay ahead of cybercriminals and protect your organization from evolving threats. Explore the depth of adversary intel and fortify your defenses today.",
      details: [
        "Strengthen security posture with in-depth adversary knowledge.",
        "Proactively defend against emerging threats.",
        "Improve incident response and threat hunting capabilities.",
        "Gain a competitive edge in cybersecurity defense.",
      ],
    },
    {
      name: "Vulnerability Intelligence",
      img: Group2,
      pic: white3,
      contentImg: F3,
      description: "In today's fast-paced digital landscape, vulnerabilities are constantly being discovered and exploited. BluHawk's Vulnerability Intelligence provides real-time insights into actively exploited weaknesses, enabling you to proactively identify and mitigate risks before they can be exploited.",
      details: [
        "Reduce your attack surface by addressing vulnerabilities.",
        "Minimize the risk of data breaches.",
        "Improve security posture with timely remediation.",
        "Enhance defense strategies with up-to-the-minute threat data.",
      ],
    },
    {
      name: "Real-Time Monitoring",
      img: Group4,
      pic: white4,
      contentImg: F4,
      description: "In today's dynamic threat landscape, waiting for scheduled scans or reports is no longer sufficient. BluHawk's Real-Time Monitoring provides continuous surveillance of your digital assets, enabling you to detect and respond to threats as they emerge.",
      details: [
        "Continuous Threat Detection: Immediate analysis of activity.",
        "Instant Alerting: Rapid notifications of security events.",
        "Dynamic Threat Updates: Real-time vulnerability and attack info.",
        "Anomaly Detection: Identifies unusual patterns.",
        "Log Correlation: Unified analysis of security logs.",
        "Custom Dashboards: Personalized real-time data views.",
      ],
    },
    {
      name: "Asset Analysis",
      img: Group5,
      pic: white5,
      contentImg: F5,
      description: "Gain unparalleled visibility into your digital assets with BluHawk's comprehensive Asset Analysis. Understand your network's exposure, identify hidden vulnerabilities, and ensure the integrity of your online presence.",
      details: [
        "IP/Domain Lookup: Detailed asset information.",
        "DNS/Hosting Data: Configuration and environment insights.",
        "Reputation Checks: Malicious activity detection.",
        "Network Exposure: Open ports, misconfigurations found.",
        "Subdomain Discovery: Uncover hidden entry points.",
        "Certificate Analysis: Verify certificate security.",
      ],
    },
    {
      name: "Threat Prioritization",
      img: Group6,
      pic: white6,
      contentImg: F6,
      description: "In the face of overwhelming security data, knowing where to focus is crucial. BluHawk's Threat Prioritization empowers you to identify and address the most critical threats, optimizing your security resources and minimizing your risk.",
      details: [
        "Risk-Based Scoring: Evaluate severity for clear assessment.",
        "Contextual Threat Intelligence: Prioritize based on real-world attack data.",
        "Customizable Rules: Tailor assessments to your organization's risk profile.",
        "Detailed Vulnerability Severity Analysis: In-depth analysis using industry standards, exploitability metrics.",
      ],
    },
    {
      name: "Automated Scanning",
      img: Group7,
      pic: white7,
      contentImg: F7,
      description: "Eliminate manual security checks and ensure constant vigilance with BluHawk's Automated Scanning. Our platform continuously scans your web applications, servers, and digital infrastructure, identifying vulnerabilities and potential threats before they can be exploited.",
      details: [
        "Reduce manual effort and improve security efficiency.",
        "Proactively identify vulnerabilities before exploitation.",
        "Ensure continuous monitoring of digital assets.",
        "Improve your security posture and reduce the risk of cyberattacks.",
        "Gain comprehensive visibility into your organization's security vulnerabilities.",
      ],
    },
    {
      name: "MITRE ATT&CK Mapping",
      img: Group8,
      pic: white8,
      contentImg: F8,
      description: "Gain a strategic advantage in cybersecurity with BluHawk's MITRE ATT&CK Mapping. We translate complex threat intelligence into actionable insights by aligning adversary behaviors with the globally recognized MITRE ATT&CK framework. This allows you to understand attacker tactics, techniques, and procedures (TTPs) and build robust defenses.",
      details: [
        "Proactively identify and mitigate potential threats by understanding attacker TTPs.",
        "Improve your security posture by aligning your defenses with known adversary behaviors.",
        "Enhance incident response and threat hunting capabilities.",
        "Gain a deeper understanding of the cyber threat landscape.",
      ],
    },
  ];

  const [selectedFeature, setSelectedFeature] = useState(securityFeatures[0]);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const pauseUntilRef = useRef(0);
  const cardRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now < pauseUntilRef.current) {
        return;
      }
      setCurrentFeatureIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % securityFeatures.length;
        setSelectedFeature(securityFeatures[nextIndex]);
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const selectedCard = cardRefs.current[currentFeatureIndex];
    if (
      window.innerWidth < 768 &&
      selectedCard &&
      typeof selectedCard.scrollIntoView === "function"
    ) {
      const scrollContainer = selectedCard.parentElement?.parentElement; // Assuming two wrapper divs
      if (scrollContainer) {
        scrollContainer.scrollTo({
          left: selectedCard.offsetLeft - scrollContainer.offsetWidth / 2 + selectedCard.offsetWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [currentFeatureIndex]);

  return (
    <div className="w-full">
      <HomeNavbar
        securityFeatures={securityFeatures}
        setSelectedFeature={setSelectedFeature}
        openModalFromParent={handleOpenModalFromNavbar} // Added to receive openModal
      />

      {/* Hero Section */}
      <section
        id="hero"
        data-bg="blue"
        className="relative bg-royalBlue text-white h-screen flex items-center text-left px-6"
        style={{ backgroundImage: `url(${gridbackground})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center w-full">
          {/* Left Text Content */}
          <div className="max-w-2xl md:pr-4 flex flex-col justify-center">
            <h1 className="text-3xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
              GLOBAL <span className="text-[#A22323]">{securityLockText}</span>
            </h1>

            <p className="text-white text-lg mb-8">
              Protect your online world with strong{" "}
              <span className="text-[#A22323] font-bold">CYBER SECURITY</span>, keeping data safe from threats. 
              Easy training, regular updates, and constant monitoring ensure quick, reliable recovery.
            </p>

            <div className="flex justify-between w-full max-w-sm">
              <button
                className="bg-[#e5e5e5] border border-black text-black font-semibold py-2 px-6 relative"
                style={{
                  clipPath: 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%)'
                }}
                onClick={() => navigate('/threatmap2')}
              >
                Threat Map
              </button>

              <button
                className="bg-[#e5e5e5] border border-black text-black font-semibold py-2 px-6 relative"
                style={{
                  clipPath: 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%)'
                }}
                onClick={handleGotoDashboardClick}
              >
                Go to Dashboard
              </button>
            </div>
          </div>

          {/* Right Lock Image */}
          <div className="flex-shrink-0 mt-8 md:mt-0 md:ml-8">
            <video
              src={lockVideo} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-[800px] h-auto"
              style={{ mixBlendMode: "screen" }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        data-bg="white"
        className="h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white px-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Overlay */}
              <div className="absolute top-0 left-0 w-16 h-16 opacity-10 rounded-br-full transform translate-y-1/4 -translate-x-1/4 z-0"></div>
              <div className="relative z-10">
                <div className="mb-6 flex justify-center">
                  <img
                    src={feature.img}
                    alt={feature.name}
                    className="w-[280px] h-[280px] object-contain rounded-xl transition-transform duration-300 hover:rotate-3"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 bg-gradient-to-r from-[#015265] to-teal-600 bg-clip-text text-transparent">
                  {feature.name}
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section
        className="relative w-full h-screen flex overflow-hidden bg-[#D9D9D9]"
        id="features"
      >
        {/* Left Content */}
        <div className="w-full md:w-1/2 px-8 md:px-6 flex flex-col justify-center z-10">
          <h2 className="text-[#B1382B] font-bold uppercase mb-8 text-4xl">ABOUT US</h2>

          {/* Heading — allow wrap, no scroll */}
          <h1 className="text-[1.9rem] md:text-4xl font-bold mb-4 text-black">
            We provide cutting-edge cybersecurity solutions.
          </h1>

          <p className="text-gray-700 mb-6">
            We deliver advanced cybersecurity solutions to protect your business from evolving digital threats.
          </p>
          <ul className="pl-5 text-gray-800 space-y-3">
            {[
              "Customized Security Solutions",
              "Vulnerability Assessment",
              "24/7 Incident Response",
              "User Training Programs",
            ].map((item, index) => (
              <li
                key={index}
                className="relative pl-5 before:absolute before:-left-3 before:top-2 before:w-2 before:h-2 before:bg-[#B1382B] before:rounded-full"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side with BOTTOM-RIGHT Quarter Circle */}
        <div className="hidden md:block w-1/2 h-full relative bg-transparent">
          {/* Quarter Circle */}
          <div className="absolute bottom-0 right-0 w-[550px] h-[650px] bg-[#015265] rounded-tl-full z-0"></div>

          {/* Centered Image and Text */}
          <div className="absolute bottom-[180px] right-[180px] flex flex-col items-center z-10">
            <img
              src="/ab2.jpg.png"
              alt="Bluhawk Eagle"
              className="w-[1000px] drop-shadow-xl block align-bottom p-3 m-0"
              style={{ display: 'block', marginBottom: '0', paddingBottom: 0 }}
              draggable="false"
            />
            <h1
              className="text-white text-2xl md:text-2xl font-bold mt-[-20px] mb-0 leading-none p-0"
              style={{ lineHeight: 1 }}
            >
              BLUHAWK
            </h1>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        data-bg="blue"
        className="h-screen flex flex-col items-center justify-center text-black px-6 bg-cover bg-center relative"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-white bg-opacity-90"></div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-bold mb-6">Our Services</h2>
          <p className="text-black-400 mb-8 max-w-2xl mx-auto">
            BluHawk offers advanced solutions to detect, analyze, and prevent
            cyber threats.
          </p>

          {/* Service Blocks */}
          <div className="grid gap-6">
            {/* First Row (2 Items) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 justify-center w-full md:w-2/3 mx-auto">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="bg-white text-black p-6 rounded-lg shadow-lg flex items-center space-x-6 w-full"
                  style={{ minWidth: "200px" }} // Increased minimum width
                >
                  <img
                    src={service.img}
                    alt={service.name}
                    className="w-12 h-12 object-contain" // Increased image size
                  />
                  <span className="font-semibold text-lg">{service.name}</span> {/* Increased text size */}
                </div>
              ))}
            </div>

            {/* Second Row (2 Items - Centered) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 justify-center w-full md:w-2/3 mx-auto">
              {secondRowServices.map((service, index) => (
                <div
                  key={index}
                  className="bg-white text-black p-6 rounded-lg shadow-lg flex items-center space-x-6 w-full"
                  style={{ minWidth: "200px" }} // Increased minimum width
                >
                  <img
                    src={service.img}
                    alt={service.name}
                    className="w-12 h-12 object-contain" // Increased image size
                  />
                  <span className="font-semibold text-lg">{service.name}</span> {/* Increased text size */}
                </div>
              ))}
            </div>

            {/* Third Row (4 Items) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 justify-center w-full md:w-2/3 mx-auto">
              {thirdRowServices.map((service, index) => (
                <div
                  key={index}
                  className="bg-white text-black p-6 rounded-lg shadow-lg flex items-center space-x-6 w-full"
                  style={{ minWidth: "200px" }} // Increased minimum width
                >
                  <img
                    src={service.img}
                    alt={service.name}
                    className="w-12 h-12 object-contain" // Increased image size
                  />
                  <span className="font-semibold text-lg">{service.name}</span> {/* Increased text size */}
                </div>
              ))}
            </div>

            {/* Fourth Row (2 Items) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 justify-center w-full md:w-2/3 mx-auto">
              <div className="bg-white text-black p-6 rounded-lg shadow-lg flex items-center space-x-6 w-full"
                   style={{ minWidth: "200px" }} // Increased minimum width
              >
                <img
                  src={Group4}
                  alt="Real Time monitoring"
                  className="w-12 h-12 object-contain" // Increased image size
                />
                <span className="font-semibold text-lg">Real Time monitoring</span> {/* Increased text size */}
              </div>
              <div className="bg-white text-black p-6 rounded-lg shadow-lg flex items-center space-x-6 w-full"
                   style={{ minWidth: "200px" }} // Increased minimum width
              >
                <img
                  src={Group8}
                  alt="Mitre ATT&CK Moging"
                  className="w-12 h-12 object-contain" // Increased image size
                />
                <span className="font-semibold text-lg">Mitre ATT&CK Moging</span> {/* Increased text size */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Slide Section */}
     {/* Security Slide Section */}
<section
  id="security-slide"
  data-bg="white"
  className="h-screen w-full flex flex-col items-center justify-center bg-white"
>
  <div className="relative flex items-center justify-center w-full max-w-4xl px-4">
    {/* Left Arrow */}
    <button
      onClick={() => {
        const newIndex =
          (currentFeatureIndex - 1 + securityFeatures.length) %
          securityFeatures.length;
        setCurrentFeatureIndex(newIndex);
        setSelectedFeature(securityFeatures[newIndex]);
        pauseUntilRef.current = Date.now() + 10000;
      }}
      className="absolute left-0 bg-teal-600 text-white p-2 rounded-full shadow-md z-10"
    >
      <FaArrowLeft />
    </button>

    {/* Cards */}
    <div className="flex items-center justify-center space-x-4 w-full overflow-hidden">
      {securityFeatures.map((feature, index) => {
        const isSelected = index === currentFeatureIndex;

        return (
          <div
            key={index}
            className={`flex flex-col items-center justify-center transition-all duration-500 ease-in-out cursor-pointer 
              ${
                isSelected
                  ? "bg-white shadow-xl scale-110 z-20 border border-gray-300"
                  : "bg-gray-200 scale-90 opacity-70 z-10"
              } 
              rounded-lg p-6 w-[200px] h-[180px]`}
            onClick={() => {
              setSelectedFeature(feature);
              setCurrentFeatureIndex(index);
              pauseUntilRef.current = Date.now() + 10000;
            }}
          >
            <img
              src={isSelected ? feature.pic : feature.img}
              alt={feature.name}
              className="w-10 h-10 mb-2"
            />
            <span className="text-center text-sm font-medium">
              {feature.name === "Asset Analysis" ? (
                <>
                  Asset <br /> Analysis
                </>
              ) : (
                feature.name
              )}
            </span>
          </div>
        );
      })}
    </div>

    {/* Right Arrow */}
    <button
      onClick={() => {
        const newIndex = (currentFeatureIndex + 1) % securityFeatures.length;
        setCurrentFeatureIndex(newIndex);
        setSelectedFeature(securityFeatures[newIndex]);
        pauseUntilRef.current = Date.now() + 10000;
      }}
      className="absolute right-0 bg-teal-600 text-white p-2 rounded-full shadow-md z-10"
    >
      <FaArrowRight />
    </button>
  </div>

  {/* Info Section - only for selected card */}
  {selectedFeature && (
    <div className="mt-8 max-w-2xl text-center px-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {selectedFeature.name}
      </h3>
      <p className="text-gray-700">{selectedFeature.description}</p>
    </div>
  )}
</section>


      {/* Feedback and Testimonials Section */}
      <FeedbackCarousel feedbacks={feedbacks} />

      {/* CEO's Words Section with Gap */}
      <section
        className="bg-[#015265] py-16 px-0 flex flex-col items-center w-full relative my-16"
      >
        <div className="w-full">
          <div
            id="ceo-words"
            className="w-full relative"
            style={{
              backgroundImage: `url(${bgCEO})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 bg-[#015265] z-0"></div>
            <div className="flex flex-col md:flex-row gap-4 relative z-10">
              {testimonialData.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex flex-col md:flex-row-reverse items-center gap-6 w-full bg-[#015265] text-white p-7 rounded-lg shadow-lg mx-auto max-w-7xl"
                >
                  <div className="w-full md:w-[300px]">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="rounded-lg w-full"
                    />
                  </div>
                  <div className="w-full md:w-2/3">
                    <p className="text-lg">{testimonial.quote}</p>
                    <p className="mt-4 font-semibold">
                      {testimonial.name}, {testimonial.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div id="footer">
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;