import React, {useState} from "react";

// import Footer3 from "../components/reusable/Footer3";
import { Link, useNavigate } from "react-router-dom";
import { FaShieldAlt, FaEye, FaSync, FaRedo } from "react-icons/fa";
import pic from "../assets/images/home.png";
import ab1 from "../assets/images/AB1.png";
import ab2 from "../assets/images/AB2.png";
import ab from "../assets/images/12.png";
import Cookies from "js-cookie";
import HomeNavbar2 from "../components/HomeNavbar2";
function FeatureCard({ icon, title, description }) {
 
  return (
    <div className="relative bg-[#161636] p-6 rounded-lg border border-gray-600 hover:border-white transition-all hover:shadow-xl hover:-translate-y-2">
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[   ] p-4 rounded-full ring-2 ring-[#6a11cb]">
        <span className="text-white text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-center mt-8">{title}</h3>
      <p className="text-gray-400 text-sm text-center mt-2">{description}</p>
    </div>
  );
}

const testimonials = [
  {
    name: "Miss Sammy Feeney",
    role: "Investor Metrics Executive",
    review:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum congue metus quis accumsan euismod.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    name: "Rosemary Mante",
    role: "Human Integration Agent",
    review:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum congue metus quis accumsan euismod.",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    name: "Regina Weissnat",
    role: "Regional Branding Consultant",
    review:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum congue metus quis accumsan euismod.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    name: "Marianne Bode",
    role: "Product Intranet Agent",
    review:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum congue metus quis accumsan euismod.",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
  },
];


export default function Home({openModal}) { 
  const navigate = useNavigate();
   const token = Cookies.get('access_token');

   // Reference to store the openModal function from HomeNavbar
  let openModalFromNavbar;

  // Function to receive openModal from HomeNavbar
  const handleOpenModalFromNavbar = (openModalFunc) => {
    openModalFromNavbar = openModalFunc; // Store the function reference
  };

  // Updated handler to open the sign-in modal instead of navigating
  const handleGotoDashboardClick = () => {
    if(token){
      navigate('/dashboard3');
    }
    else{
      if (openModalFromNavbar) {
        openModalFromNavbar("Sign-in"); // Trigger the sign-in popup
      } else {
        // Fallback in case the modal function isn’t available (optional)
        navigate('/dashboard3');
      }
    }
    
  }
  return (
    <div className="bg-[#010314] min-h-screen flex flex-col overflow-y-auto">
      <HomeNavbar2 openModalFromParent={handleOpenModalFromNavbar} />

      {/* HERO SECTION */}
      <section className="h-screen w-full flex flex-col justify-center items-center px-8">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center ">
          {/* Text Section */}         
          <div className="text-white space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Empower Your Cybersecurity <br />
              <span className="text-white">with BluHawk</span>.
            </h1>
            <p className="text-md text-gray-300">
              Monitor, Protect, and Secure Your Digital Assets with Real-Time Intelligence.
            </p>
            <button
             className="mt-6 px-6 py-3 mr-4 text-sm font-semibold text-white border border-cyan-500 rounded-md 
              bg-gradient-to-r from-[#6a11cb] to-[#2575fc] transition duration-300 hover:opacity-90"
              // onClick={() => window.location.href = "http://localhost:8080/index.html"}
              onClick={() => navigate('/threatmap')} // Add state to show component
              >
              Threat Map
            </button>
            <button
             className="mt-6 px-6 py-3 mr-4 text-sm font-semibold text-white border border-cyan-500 rounded-md 
              bg-gradient-to-r from-[#6a11cb] to-[#2575fc] transition duration-300 hover:opacity-90"
              // onClick={() => window.location.href = "http://localhost:8080/index.html"}
              onClick={() => navigate('/threatmap2')} // Add state to show component
              >
              Threat Map2
            </button>
            
            {token && ( <button className="mt-6 px-6 py-3 text-sm font-semibold text-white border border-cyan-500 rounded-md 
              bg-gradient-to-r from-[#6a11cb] to-[#2575fc] transition duration-300 hover:opacity-90"
              onClick={() => navigate('/dashboard')}
              >
              Go To Dashboard
            </button>)}
            <button
          className="mt-6 px-6 py-3 text-sm font-semibold text-white border border-cyan-500 rounded-md 
                     bg-gradient-to-r from-[#6a11cb] to-[#2575fc] transition duration-300 hover:opacity-90"
          onClick={handleGotoDashboardClick} // Use the updated handler
        >
          Go To Dashboard
        </button>
          </div>
          
          {/* Image Section */}
          <div className="flex justify-center">
            <img src={pic} alt="Cybersecurity Shield" className="w-full max-w-md" />
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}

      <section className="h-screen w-full bg-[#010314] text-white flex flex-col justify-center items-center px-8">
        <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-10 justify-evenly">
          {/* Image Section */}
          <div className="relative w-full md:w-1/2 flex justify-center">
            <div className="w-[320px] h-[320px] bg-[#1b1b3a] rounded-lg overflow-hidden">
              <img src={ab1} alt="Cyber Matrix" className="w-full h-full object-cover opacity-90" />
            </div>
            <div className="absolute bottom-[-30px] right-[60px] w-[250px] h-[250px] bg-[#22224a] rounded-lg overflow-hidden border-2 border-cyan-500">
              <img src={ab2} alt="Hacker Hands" className="w-full h-full object-cover opacity-90" />
            </div>
          </div>

          {/* Text Content Section */}
          <div className="w-full md:w-1/2">
            <h4 className="text-sm text-[#6a11cb] tracking-widest uppercase">About Us</h4>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mt-2">
              Empowering Organizations With Real-Time Threat Intelligence And Proactive Cyber Defense.
            </h2>
            <p className="text-gray-400 text-sm mt-4 leading-relaxed">
              BluHawk is a next-gen Cyber Threat Intelligence platform designed to analyze threats,
              uncover adversary intent, and safeguard digital assets. With cutting-edge technology
              and real-time insights, we help businesses stay ahead of cyber risks.
            </p>

            {/* Call to Action */}
            <button className="mt-6 px-6 py-3 text-sm font-semibold text-white border border-cyan-500 rounded-md 
              bg-gradient-to-r from-[#6a11cb] to-[#2575fc] transition duration-300 hover:opacity-90">
              Read More
            </button>
          </div>
        </div>
      </section>

      {/* Defence Section  */}

      <section className="h-screen w-full bg-[#010314] text-white flex flex-col justify-center items-center px-8">
        <div className="bg-[#010314] text-white py-16 px-8 flex flex-col items-center">
          <h4 className="text-sm text-[#6a11cb] tracking-widest uppercase">Our Service</h4>
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mt-2 text-center">
            Comprehensive Cyber Defense
          </h2>
          <p className="text-gray-400 text-sm mt-4 text-center max-w-2xl">
            BluHawk offers advanced solutions to detect, analyze, and prevent cyber threats.
          </p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
            {/* Threat Intelligence Reports */}
            <div className="relative bg-[#161636] p-6 rounded-lg border border-gray-600 hover:border-white transition-all hover:shadow-xl hover:-translate-y-2">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#6a11cb] p-4 rounded-full ring-2 ring-[#6a11cb]">
              <FaShieldAlt className="text-white text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-center mt-8">Threat Intelligence Reports</h3>
            <p className="text-gray-400 text-sm text-center mt-2">
              Gain insights into evolving cyber threats.
            </p>
          </div>
        {/* Attack Surface Monitoring */}
        <div className="relative bg-[#161636] p-6 rounded-lg border border-gray-600 hover:border-white transition-all hover:shadow-xl hover:-translate-y-2">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#6a11cb] p-4 rounded-full ring-2 ring-[#6a11cb]">
            <FaEye className="text-white text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-center mt-8">Attack Surface Monitoring</h3>
          <p className="text-gray-400 text-sm text-center mt-2">
            Identify vulnerabilities before they are exploited.
          </p>
        </div>
        {/* Incident Response Support */}
        <div className="relative bg-[#161636] p-6 rounded-lg border border-gray-600 hover:border-white transition-all hover:shadow-xl hover:-translate-y-2 ">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#6a11cb] p-4 rounded-full ring-2 ring-[#6a11cb]">
            <FaRedo className="text-white text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-center mt-8">Incident Response Support</h3>
          <p className="text-gray-400 text-sm text-center mt-2">
            Quickly mitigate and recover from cyber incidents.
          </p>
        </div>
        </div>
       </div> 
      </section>


      {/* Future Point */}

      <div className="bg-[#010314] text-white min-h-screen flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <img
            src={ab}
            alt="Cyber Security"
            className="rounded-lg shadow-lg w-[450px] h-[615px] object-cover"
          />
        </div>
        <div>
          <h4 className="text-indigo-400 text-sm font-semibold uppercase">Feature Point</h4>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">Empower Your Security With Cutting-Edge Cyber Defense</h2>
          <p className="text-gray-400 mt-4">
            Comprehensive security solutions, real-time threat detection, and expert-driven defense strategies to safeguard your digital assets.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FeatureCard
              icon="💻"
              title="Customized Security Solutions"
              description="Tailored threat intelligence and defense strategies to meet unique business needs."
            />
            <FeatureCard
              icon="🔍"
              title="Vulnerability Assessment"
              description="Identify, analyze, and remediate security gaps before they can be exploited."
            />
            <FeatureCard
              icon="⏳"
              title="24/7 Incident Response"
              description="Round-the-clock monitoring and rapid response to mitigate cyber threats in real time."
            />
            <FeatureCard
              icon="📚"
              title="User Training Programs"
              description="Empower teams with hands-on cybersecurity training to strengthen organizational defense."
            />
          </div>
        </div>
      </div>
    </div>

    {/* Reiviews */}

    <div className="bg-[#010314] text-white py-16 px-6">
      {/* Header */}
      <div className="text-center max-w-4xl mx-auto">
        <h4 className="text-indigo-400 text-sm font-semibold uppercase">
          Testimonial
        </h4>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">
          See What Others Are Saying
        </h2>
        <p className="text-gray-400 mt-4 text-sm md:text-base">
          Trusted by businesses and security professionals worldwide.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto mt-10">
        {testimonials.map((person, index) => (
          <div
            key={index}
            className="bg-[#13132b] p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 duration-300"
          >
            <p className="text-gray-400 mb-4 text-sm md:text-base">{person.review}</p>
            <div className="flex items-center gap-4 mt-4">
              <img
                src={person.image}
                alt={person.name}
                className="w-12 h-12 rounded-full border-2 border-indigo-400"
              />
              <div>
                <h3 className="text-lg font-semibold">{person.name}</h3>
                <p className="text-indigo-400 text-sm">{person.role}</p>
                {/* Star Ratings */}
                <div className="text-yellow-400 mt-1">⭐⭐⭐⭐⭐</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* <Footer3 /> */}

    </div>
  );
}
