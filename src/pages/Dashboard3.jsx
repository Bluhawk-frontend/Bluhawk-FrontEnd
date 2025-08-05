import React, { useRef, useState, useEffect } from "react";
// import Navbar from "../components/reusable/Navbar";
// import Footer3 from "../components/reusable/Footer3";
import slide1 from "../assets/images/cybersec_web1.png";
import slide2 from "../assets/images/cybersec_web2.png";


import im1 from "../assets/images/TL1.png";
import im2 from "../assets/images/TL-2.png";
import im3 from "../assets/images/TL-3.png";
import im4 from "../assets/images/TL-4.png";


export default function Dashboard3() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      id: 1,
      title: "MY INTEL",
      description:
        " Allow users to search and retrieve threat intelligence data across multiple integrated sources for comprehensive threat analysis.",
      image: slide1,
      layout: "image-left",
    },
    {
      id: 2,
      title: "FIND INTEL",
      description:
        "Provide targeted threat intelligence for IP addresses and URLs using API integrations.",
      image: slide2,
      layout: "image-right",
    },
  ];
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };
  const handlePrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };
  const dropdownData = [
    {
      title: "Threat Intel - Several Sources and security feeds.",
      image: im1,
    },
    {
      title: "Threat Intel - IoCs classified by type.",
      image: im2,
    },
    {
      title: "Threat Intel - IoCs classified by Category.",
      image: im3,
    },
    {
      title: "Threat Intel - Latest Security Events.",
      image: im4,
    },
  ];

  return (
    <div className="bg-primaryBlack min-h-screen flex flex-col">
      {/* <Navbar /> */}
      {/* Main Section */}
      <main className="flex-1 text-white ">
        <div className="py-32 w-full h-full flex flex-col items-center text-center justify-center">
        
            <div className="h-[400px] w-full flex items-center justify-center  text-white ">
              <div className="relative w-full h-full">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute top-0 left-0 w-full h-full flex items-center justify-evenly transition-opacity duration-1000 ${
                      index === currentIndex
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    {slide.layout === "image-left" ? (
                      <>
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="h-4/5 w-auto object-contain ml-10"
                        />
                        <div className="text-right px-10 w-2/5">
                          <h1 className="text-4xl font-bold mb-4">
                            {slide.title}
                          </h1>
                          <p className="text-lg">{slide.description}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-left px-10 w-2/5">
                          <h1 className="text-4xl font-bold mb-4">
                            {slide.title}
                          </h1>
                          <p className="text-lg">{slide.description}</p>
                        </div>
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="h-4/5 w-auto object-contain mr-10"
                        />
                      </>
                    )}
                  </div>
                ))}
                <button
                  onClick={handlePrevious}
                  className="absolute top-1/2 left-5 transform -translate-y-1/2 bg-transparent text-white border border-white p-2 rounded-full hover:bg-white hover:text-black"
                >
                  &lt;
                </button>
                <button
                  onClick={handleNext}
                  className="absolute top-1/2 right-5 transform -translate-y-1/2 bg-transparent text-white border border-white p-2 rounded-full hover:bg-white hover:text-black"
                >
                  &gt;
                </button>
              </div>
            </div>

            <div className=" w-full my-40 bg-primaryBlack text-white flex flex-col items-center justify-center">
              <h1 className="text-3xl font-bold mb-4 text-center">
                Threat Intel
              </h1>
              <p className="text-lg mb-6 text-center">
                Recorded Events classified by Category and Type.
              </p>
              <button className="bg-blue-500 px-6 py-2 text-white font-semibold rounded hover:bg-blue-600 mb-6">
                Contact BluHawk
              </button>
              <div className="w-3/4 space-y-4">
                {dropdownData.map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#212150] rounded shadow overflow-hidden"
                  >
                    <div
                      className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-[#2a2a6e] transition duration-300"
                      onClick={() => toggleDropdown(index)}
                    >
                      <span>{item.title}</span>
                      <span className="text-blue-500">
                        {openDropdown === index ? "▲" : "▼"}
                      </span>
                    </div>
                    <div
                      className={`overflow-hidden transition-[max-height] duration-500 ease-in-out
                      ${openDropdown === index ? "max-h-screen py-4" : "max-h-0"}`}
                    >
                      {openDropdown === index && (
                        <div className="bg-[#1f1f5c] px-4 py-3 text-sm">
                          <p>{`Dropdown Content Placeholder for ${item.title}`}</p>
                          <img
                            src={item.image}
                            alt={`Content for ${item.title}`}
                            className="mt-4 rounded shadow max-w-full"
                            onDoubleClick={() => setOpenDropdown(null)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* <div className="h-20"></div>  */}
            </div>
         
        </div>
      </main>
      {/* <Footer3 /> */}
    </div>
  );
}
