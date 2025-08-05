import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoDotFill } from "react-icons/go";
import SD1 from "../assets/images/SLIDE-1.png";
import SD2 from "../assets/images/SLIDE-2.png";
import leftArrow from "../assets/images/Left Arrow.png";
import rightArrow from "../assets/images/Right Arrow.png";
import Navbar from '../components/reusable/Navbar';
import Footer from '../components/reusable/Footer';
import NewNavbar from '../components/reusable/NewNavbar';


const Dashboard = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'My Intel',
      description:
        'Network compromises result in botnet creation, where attackers control numerous infected devices. These botnets facilitate various malicious activities, including:',
      img: SD1,
    },
    {
      title: 'Find Intel',
      description: 'Find actionable intelligence to protect your network.',
      img: SD2,
    },
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* <Navbar /> */}
      <NewNavbar />
 

      {/* Hero Section */}
      <section
        id="hero"
        data-bg="blue"
        className="relative bg-royalBlue text-white h-[500px] flex items-center justify-center text-center px-6"
        style={{ backgroundImage: "url('/MBBG.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-midnightBlue opacity-90"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">THREAT INTELLIGENCE</h1>
          <div className="flex justify-center gap-5 flex-wrap">
            <Link
              to="/my-intel"
              className="flex items-center gap-1 text-white text-lg hover:text-[#FE5E15]"
            >
              My Intel
            </Link>
            <Link
              to="/find-intel"
              className="flex items-center gap-1 text-white text-lg hover:text-[#FE5E15]"
            >
              <GoDotFill className="text-white" /> Find Intel
            </Link>
            <Link 
              to="/mitre-attck"
              className="flex items-center gap-1 text-white text-lg hover:text-[#FE5E15]"
            >
              <GoDotFill className="text-white" />
              MITRE ATT&CK
            </Link>
            <Link 
              to="/reports"
              className="flex items-center gap-1 text-white text-lg hover:text-[#FE5E15]"
            >
              <GoDotFill className="text-white" />
              Reports
            </Link>
          </div>
        </div>
      </section>

      {/* Slider Section */}
      <section
        id="slider"
        data-bg="light"
        className="relative bg-[#f5f7fa] h-[500px] flex items-center justify-center px-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-10 max-w-6xl w-full transition-all duration-500">
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src={slides[currentSlide].img}
              alt={slides[currentSlide].title}
              className="w-full max-w-[400px] h-[300px] object-cover" // Fixed width and height for all slides
            />
          </div>
          <div className="w-full md:w-1/2 flex items-center justify-center md:justify-start">
            <div className="text-center md:text-left max-w-md">
              <h2 className="text-3xl text-[#ff6f61] font-semibold mb-4">{slides[currentSlide].title}</h2>
              <p className="text-gray-700 text-base">{slides[currentSlide].description}</p>
            </div>
          </div>
        </div>
        <div className="absolute flex justify-between w-full px-5 top-1/2 transform -translate-y-1/2">
        <button 
          onClick={handlePrevSlide} 
          className="focus:outline-none hover:opacity-75"
        >
          <img 
            src={leftArrow} 
            alt="Previous slide" 
            className="w-10 h-10"
          />
        </button>
        <button 
          onClick={handleNextSlide} 
          className="focus:outline-none hover:opacity-75"
        >
          <img 
            src={rightArrow} 
            alt="Next slide" 
            className="w-10 h-10"
          />
        </button>
                </div>
              </section>
              <Footer />
            </div>
          );
};

export default Dashboard;