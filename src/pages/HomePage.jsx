import React, { useState,useRef, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
// import HomeNavbar from "../components/HomeNavBar";
import man from "../assets/images/Man.png";
import Link0 from "../assets/images/Link.png";
import Link1 from "../assets/images/Link1.png";
import Link2 from "../assets/images/Link2.png";
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
import leftArrow from "../assets/images/Left Arrow.png";
import rightArrow from "../assets/images/Right Arrow.png";
import Cookies from "js-cookie"; // Added for token
import { useNavigate } from "react-router-dom"; // Added for navigation

import Footer from "../components/reusable/Footer";
import HomeNavbar from "../components/HomeNavbar";

const HomePage = () => {
  // const [currentIndex, setCurrentIndex] = useState(0);
  // const [selectedFeature, setSelectedFeature] = useState(securityFeatures[0]);
  const navigate = useNavigate(); // Added for navigation
  const token = Cookies.get('access_token'); // Added for token check
  const openModalFromNavbarRef = useRef(null); // Use ref to persist function

  // Reference to store the openModal function from HomeNavbar2
  let openModalFromNavbar;

  // Function to receive openModal from HomeNavbar2
  const handleOpenModalFromNavbar = (openModalFunc) => {
    openModalFromNavbar = openModalFunc; // Store the function reference
  };


  const handleGotoDashboardClick = () => {
    if(token){
      navigate('/dashboard');
    }
    else{
      if (openModalFromNavbar) {
        openModalFromNavbar("Sign-in"); // Trigger the sign-in popup
      } else {
        // Fallback in case the modal function isn’t available (optional)
        navigate('/dashboard');
      }
    }
    
  }
  
  
  const features = [
    { name: "Threat Intelligence", 
      img: Link0,  
      description: "Stay ahead of evolving cyber threats with real-time intelligence." 
    },
    { name: "System Audit", 
      img: Link1, 
      description: "Detect and eliminate malicious software to restore system integrity and performance." 
    },
    { name: "Malware Removal", 
      img: Link2, 
      description: "Analyze configurations and vulnerabilities to ensure optimal security posture."
    },
  ];
  const services = [
    { name: "Network Security", img: Group3 },
    { name: "Adversary Intelligence", img: Group1 },
      { name: "Vulnerability Intelligence", img: Group2 },
  ];
  const secondRowServices = [
    { name: "Real-Time Monitoring", img: Group4 },
    { name: "Asset Analysis", img: Group5 },
  ];
  const thirdRowServices = [
    { name: "Threat Prioritization", img: Group6 },
    { name: "Automated Scanning", img: Group7 },
    { name: "MITRE ATT&CK Mapping", img: Group8 },
  ];
  const feedbackData = [
    {
      id: 1,
      name: "Edaa",
      role: "General customer",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      rating: 5,
      feedback:
        "When replacing a multi-lined selection of text, the generated dummy text maintains the amount of lines.",
    },
    {
      id: 2,
      name: "Alex",
      role: "Verified user",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      rating: 4,
      feedback:
        "The service was amazing! Highly recommended for secure transactions and fast processing.",
    },
    {
      id: 3,
      name: "Sophia",
      role: "Customer",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      rating: 5,
      feedback:
        "Exceptional experience! The support team was very helpful and resolved my issues quickly.",
    },
    {
      id: 4,
      name: "Daniel",
      role: "Premium user",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      rating: 4,
      feedback: "Really smooth and secure platform. I trust this with all my data needs!",
    },
    {
      id: 5,
      name: "Dee",
      role: "General customer",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      rating: 5,
      feedback:
        "When replacing a multi-lined selection of text, the generated dummy text maintains the amount of lines.",
    },
  ];
  const testimonialData = [
    {
      id: 1,
      quote:
        "An cyber security multi-national firm is a security money of one or more experts. Provides more profit, We help your satéle to future life and then create the road. Grow money speedily without any risk.",
      name: "Jose Philip",
      role: "CEO",
      image: man,
    },
  ];
  const cardsPerView = () => {
    if (window.innerWidth >= 1024) return 3; // Large screens
    if (window.innerWidth >= 768) return 2;  // Medium screens
    return 1; // Small screens
  };
  const cardRefs = useRef([]);
  
  const [visibleCards, setVisibleCards] = useState(cardsPerView());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update visible cards on window resize
  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(cardsPerView());
      setCurrentIndex(0); // Reset to start on resize to avoid overflow
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.ceil(feedbackData.length / visibleCards);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
    );
  };
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
      description:
        "BluHawk's Adversary Intelligence provides the critical insights you need to stay ahead of cybercriminals and protect your organization from evolving threats. Explore the depth of adversary intel and fortify your defenses today.",
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
      description:
        "In today's fast-paced digital landscape, vulnerabilities are constantly being discovered and exploited. BluHawk's Vulnerability Intelligence provides real-time insights into actively exploited weaknesses, enabling you to proactively identify and mitigate risks before they can be exploited.",
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
      description:
        "In today's dynamic threat landscape, waiting for scheduled scans or reports is no longer sufficient. BluHawk's Real-Time Monitoring provides continuous surveillance of your digital assets, enabling you to detect and respond to threats as they emerge.",
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
      description:
        "Gain unparalleled visibility into your digital assets with BluHawk's comprehensive Asset Analysis. Understand your network's exposure, identify hidden vulnerabilities, and ensure the integrity of your online presence.",
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
      description:
        "In the face of overwhelming security data, knowing where to focus is crucial. BluHawk's Threat Prioritization empowers you to identify and address the most critical threats, optimizing your security resources and minimizing your risk.",
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
      description:
        "Eliminate manual security checks and ensure constant vigilance with BluHawk's Automated Scanning. Our platform continuously scans your web applications, servers, and digital infrastructure, identifying vulnerabilities and potential threats before they can be exploited.",
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
      description:
        "Gain a strategic advantage in cybersecurity with BluHawk's MITRE ATT&CK Mapping. We translate complex threat intelligence into actionable insights by aligning adversary behaviors with the globally recognized MITRE ATT&CK framework. This allows you to understand attacker tactics, techniques, and procedures (TTPs) and build robust defenses.",
      details: [
        "Proactively identify and mitigate potential threats by understanding attacker TTPs.",
        "Improve your security posture by aligning your defenses with known adversary behaviors.",
        "Enhance incident response and threat hunting capabilities.",
        "Gain a deeper understanding of the cyber threat landscape.",
      ],
    },
  ];

  const [selectedFeature, setSelectedFeature] = useState({
    name: "Network Security",
    img: Group3,
    contentImg: F1,
    description:
      "Network compromises result in botnet creation, where attackers control numerous infected devices. These botnets facilitate various malicious activities, including:",
    details: [
      "DDoS Attacks: Overwhelming target networks, disrupting services.",
      "Data Theft: Exfiltrating sensitive information.",
      "Phishing/Spam: Distributing malware and phishing attempts.",
      "Financial Fraud: Automating unauthorized transactions.",
      "Cryptojacking: Hijacking computing power for cryptocurrency mining.",
      "Persistent Threat Evolution: Using encryption and P2P communication to evade detection.",
    ],
  });
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const pauseUntilRef = useRef(0);
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
      
      {/* <HomeNavbar3  openModalFromParent={handleOpenModalFromNavbar} /> */}

      {/* Hero Section */}
      <section
        id="hero"
        data-bg="blue"
        className="relative bg-royalBlue text-white h-screen flex items-center justify-center text-center px-6"
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 max-w-3xl">
          <h3 className="text-sm uppercase tracking-wide text-gray-300 mb-2">
            Software Solution Master Mind
          </h3>
          {/* <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Cybersecurity Is Critical To Your{" "}
            <span className="text-[#FE5E15]">Digital Safety</span>
          </h1>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-[#FE5E15]">Stay Protected</span> From Evolving
            Threats
          </h1> */}

          <h1 className="text-4xl md:text-5xl font-bold leading-tight md:leading-snug">
            Cybersecurity Is Critical To Your{" "}
            <span className="text-[#FE5E15]">Digital Safety</span>
          </h1>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight md:leading-snug">
            <span className="text-[#FE5E15]">Stay Protected</span> From Evolving Threats
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Ensure the safety of your digital assets with BluHawk’s advanced
            threat intelligence, providing proactive protection against the
            latest cyber threats.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button
             className="bg-transparent border border-[#FE5E15] text-[#FE5E15] font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-vibrantOrange hover:text-white transition"
              // onClick={() => window.location.href = "http://localhost:8080/index.html"}
              onClick={() => navigate('/threatmap2')} // Add state to show component
              >
              Threat Map
            </button>
            <button
              className="bg-transparent border border-[#FE5E15] text-[#FE5E15] font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-vibrantOrange hover:text-white transition"
              onClick={handleGotoDashboardClick} // Go To Dashboard button
            >
              Go To Dashboard
            </button>
          </div> 
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        data-bg="white"
        className="h-screen flex items-center justify-center bg-white px-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg text-center"
            >
              <div className="mb-4 flex justify-center">
                <img
                  src={feature.img}
                  alt={feature.name}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
              <p className="text-gray-600">
             {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section
        id="about-us"
        data-bg="white"
        className="h-screen flex flex-col md:flex-row items-center justify-center px-10 md:px-20 bg-[#F5F5F5]"
      >
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-[#FE5E15] font-bold uppercase mb-2">About Us</h2>
          <h1 className="text-4xl font-bold mb-4">
            We provide cutting-edge cybersecurity solutions.
          </h1>
          <p className="text-gray-600 mb-4">
            We provide cutting-edge cybersecurity solutions to protect your
            business from evolving digital threats.
          </p>
          <ul className="pl-5 text-gray-600 space-y-2">
            <li className="relative pl-4 before:absolute before:-left-5 before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:bg-vibrantOrange before:rounded-full">
              Customized Security Solutions
            </li>
            <li className="relative pl-4 before:absolute before:-left-5 before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:bg-vibrantOrange before:rounded-full">
              Vulnerability Assessment
            </li>
            <li className="relative pl-4 before:absolute before:-left-5 before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:bg-vibrantOrange before:rounded-full">
              24/7 Incident Response
            </li>
            <li className="relative pl-4 before:absolute before:-left-5 before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:bg-vibrantOrange before:rounded-full">
              User Training Programs
            </li>
          </ul>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img
            src="/ab2.jpg.png"
            alt="Cybersecurity"
            className="w-full max-w-md rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        data-bg="blue"
        className="h-screen flex flex-col items-center justify-center text-white px-6 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-midnightBlue bg-opacity-90"></div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-bold mb-6">Our Services</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            BluHawk offers advanced solutions to detect, analyze, and prevent
            cyber threats.
          </p>

          {/* Service Blocks */}
          <div className="grid gap-6">
            {/* First Row (3 Items) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="bg-white text-black p-4 rounded-lg shadow-lg flex items-center space-x-4"
                >
                  <img
                    src={service.img}
                    alt={service.name}
                    className="w-10 h-10 object-contain"
                  />
                  <span className="font-semibold">{service.name}</span>
                </div>
              ))}
            </div>

            {/* Second Row (2 Items - Centered) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center w-full md:w-2/3 mx-auto">
              {secondRowServices.map((service, index) => (
                <div
                  key={index}
                  className="bg-white text-black p-4 rounded-lg shadow-lg flex items-center space-x-4"
                >
                  <img
                    src={service.img}
                    alt={service.name}
                    className="w-10 h-10 object-contain"
                  />
                  <span className="font-semibold">{service.name}</span>
                </div>
              ))}
            </div>

            {/* Third Row (3 Items) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {thirdRowServices.map((service, index) => (
                <div
                  key={index}
                  className="bg-white text-black p-4 rounded-lg shadow-lg flex items-center space-x-4"
                >
                  <img
                    src={service.img}
                    alt={service.name}
                    className="w-10 h-10 object-contain"
                  />
                  <span className="font-semibold">{service.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Slide Section */}
      <section
        id="security-slide"
        data-bg="white"
        className="h-screen w-full overflow-y-auto bg-white"
      >
        {/* Security Features Section */}
        <div className="flex flex-col md:flex-row overflow-x-auto snap-x snap-mandatory justify-center w-full mt-12 px-12 py-8 pt-12">
          <div className="flex overflow-x max-w-[80%] space-x-4 pb-4 px-4 mx mx-auto scrollbar-hide ">
          <div className="shrink-0 w-[calc(50%-50px)] md:hidden" />
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                onClick={() => {
                  setSelectedFeature(feature);
                  setCurrentFeatureIndex(index);
                  pauseUntilRef.current = Date.now() + 10000; // Pause for 10 seconds
                  if (window.innerWidth < 768) {
                  cardRefs.current[index]?.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                  });
                }
                }}                
                className={`flex flex-col justify-center items-center border border-[#FE5E15] rounded-lg p-3 min-w-[120px] w-[140px] h-[150px] shadow-md cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110 hover:shadow-xl ${
                  selectedFeature.name === feature.name
                    ? "scale-110 shadow-xl bg-vibrantOrange text-white" 
                    : "bg-white text-black"
                }`}
              >
                <img
                  src={
                    selectedFeature.name === feature.name
                      ? feature.pic // White version when selected
                      : feature.img // Orange version when not selected
                  }
                  alt={feature.name}
                  className="w-10 h-10"
                />
                {feature.name === "Asset Analysis" ? (
                  <span className="mt-2 text-center text-sm">
                    Asset<br />Analysis
                  </span>
                ) : (
                  <span className="mt-2 text-center text-sm">{feature.name}</span>
                )}
              </div>
            ))}
            <div className="shrink-0 w-[calc(60%-10px)] md:hidden" />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex justify-center items-center px-4 mt-4">
          <div className="flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto">
            <img
              src={selectedFeature.contentImg}
              alt={selectedFeature.name}
              className="w-60 h-auto"
            />
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold">{selectedFeature.name}</h2>
              <p className="text-gray-600 mt-2">{selectedFeature.description}</p>
              <ul className="mt-4 text-gray-700 space-y-2">
                {selectedFeature.details.map((detail, ind) => (
                  <li
                  key={ind+1}
                  className="flex items-start gap-2">
                    <span className="w-2 h-2 mt-2 rounded-full bg-[#FE5E15] shrink-0"></span>
                    <span className="pl-1">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section
      id="feedback-testimonial"
      data-bg="blue"
      className="py-16 bg-[#F5F5F5] flex flex-col items-center justify-center px-6"
    >
      {/* Customer Feedback Section */}
      <div className="w-full max-w-7xl mb-16 px-4">
        <div className="flex flex-col md:flex-row items-start justify-between">
          <div className="md:w-1/2 w-full mb-6 md:mb-0">
            <div className="max-w-max mx-auto md:mx-0">
              <h2 className="text-4xl font-bold text-center md:text-left text-[#172B64] mb-4 whitespace-nowrap">
                Customer Feedback
              </h2>
              <p className="text-gray-600 break-words w-full md:w-[350px]">
                The phrase sequence of the Lorem Ipsum text is now so widespread
                and commonplace that many DTP programmes can generate dummy.
              </p>
            </div>
            <button className="mt-4 bg-vibrantOrange text-white px-6 py-2 rounded-full hover:bg-vibrantOrange/90 transition">
              MORE REVIEWS
            </button>
          </div>

          <div className="md:w-1/2 w-full flex flex-col items-center">
            <div className="w-full flex items-center justify-between relative">
              {/* Left Arrow */}
              <button
                onClick={prevSlide}
                className="absolute top-1/2 left-[-20px] md:left-[-40px] transform -translate-y-1/2 transition z-10"
              >
                <img src={leftArrow} alt="Previous slide" className="w-9 h-9" />
              </button>

              {/* Cards Container */}
              <div className="w-full overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${
                      currentIndex * (100 / totalSlides)
                    }%)`,
                    width: `${totalSlides * 100}%`,
                  }}
                >
                  {[...Array(totalSlides)].map((_, slideIndex) => {
                    const startIdx = slideIndex * visibleCards;
                    const slideItems = feedbackData.slice(
                      startIdx,
                      startIdx + visibleCards
                    );

                    return (
                      <div
                        key={slideIndex}
                        className="flex gap-4 w-full flex-shrink-0"
                        style={{ width: `${100 / totalSlides}%` }}
                      >
                        {slideItems.map((feedback) => (
                          <div
                            key={feedback.id}
                            className="bg-[#020E29] text-white p-4 rounded-lg shadow-lg h-64 flex flex-col justify-between w-full"
                            style={{
                              flex: `0 0 ${100 / visibleCards}%`,
                            }}
                          >
                            <div className="flex items-center mb-2">
                              <img
                                src={feedback.image}
                                alt={feedback.name}
                                className="w-10 h-10 rounded-full mr-3"
                              />
                              <div>
                                <h3 className="text-base font-semibold">
                                  {feedback.name}
                                </h3>
                                <p className="text-xs text-gray-300">
                                  {feedback.role}
                                </p>
                              </div>
                            </div>
                            <div className="flex mb-2">
                              {[...Array(feedback.rating)].map((_, i) => (
                                <svg
                                  key={i}
                                  className="w-4 h-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <p className="text-gray-200 text-sm">
                              {feedback.feedback}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Arrow */}
              <button
                onClick={nextSlide}
                className="absolute top-1/2 right-[-20px] md:right-[-40px] transform -translate-y-1/2 transition z-10"
              >
                <img src={rightArrow} alt="Next slide" className="w-9 h-9" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div
        id="ceo-words" 
        className="w-full max-w-7xl relative"
        style={{
          backgroundImage: `url(${bgCEO})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-[#3E4E65F2] z-0"></div>

        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          {testimonialData.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex flex-col md:flex-row items-center gap-6 w-full bg-[#020E29] text-white p-6 rounded-lg shadow-lg"
            >
              <div className="w-full md:w-1/3">
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
    </section>


    <div id="footer">
    <Footer />
    </div>
   
    </div>
  );
};
export default HomePage;