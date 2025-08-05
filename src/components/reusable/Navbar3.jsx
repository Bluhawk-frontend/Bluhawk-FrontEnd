import React,{useState} from 'react'
import ProfileDropdown from '../ProfileDropdown'
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigation = useNavigate();
      const [showDropdown, setShowDropdown] = useState(false);
      
    const handleClick = (page) =>{
     
        setShowDropdown(false);
        setTimeout(() => {
          navigation(page);  // Navigate after dropdown closes
        }, 100); // Delay navigation slightly to prevent state interference
        // setShowInfo(false);
        // setShowMyIntel(true);
        // setmyIntelKey(myIntelKey+ 1 );
        // console.log("myIntelKey",myIntelKey);
      }

      

  return (
    <header className="sticky top-0 bg-primaryDarkBlue  z-50  text-white sm:px-2  py-5 flex justify-between items-center">
        <div className="flex justify-center items-center gap-6">
          <a href='/'> <img src="/bluehawk-w.png" alt="logo" className='max-h-[100px] max-w-[100px]'/>
          </a>
         
          <nav className="flex gap-6">
            {/* <a href="/" className="hover:text-gray-300">
              Home
            </a> */}
           
            <div
              className="relative z-50"
              onMouseEnter={() => setShowDropdown(true)} // Show dropdown on hover
             onMouseLeave={() => setShowDropdown(false)} // Hide dropdown when mouse leaves
            >
              <label className="hover:cursor-pointer">
              Threat Intelligence
              </label>
              {showDropdown && (
                <div className="absolute z-50 right-0 top-6 bg-black shadow-lg">
                  <button
                    onClick={() => handleClick('/my-intel')}
                    className="text-sm font-semibold block px-4 py-2 text-white text-opacity-70 hover:text-opacity-95 hover:bg-blue-400 w-full text-left"
                  >
                    My Intel
                  </button>
                  <button
                    onClick={() => handleClick('/find-intel')}
                    className="text-sm font-semibold block px-4 py-2 text-white text-opacity-70 hover:text-opacity-95 hover:bg-blue-400 w-full text-left hover:cursor-pointer"
                  >
                    Find Intel
                  </button>
                  <button
                    // onClick={() => handleClick('/find-intel')}
                    className="text-sm font-semibold block px-4 py-2 text-white text-opacity-70 hover:text-opacity-95 hover:bg-blue-400 w-full text-left"
                  >
                    MITRE & ATTACK
                  </button>
                  <button
                    // onClick={handleClick}
                    className="text-sm font-semibold block px-4 py-2 text-white text-opacity-70 hover:text-opacity-95 hover:bg-blue-400 w-full text-left"
                  >
                    Reports
                  </button>
                </div>
              )}
            </div>
            {/* <a href="#" className="hover:text-gray-300">Log Collection</a>
              <a href="#" className="hover:text-gray-300">EPDR</a>
              <a href="#" className="hover:text-gray-300">Threat Intelligence</a>
              <a href="#" className="hover:text-gray-300">SOAR</a>
              <a href="#" className="hover:text-gray-300">MDR</a> */}
          </nav>
        </div>
        <div className="flex gap-2">
          {/* <button className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded">Contact</button> */}
         
          <ProfileDropdown/>
        </div>
      </header>
  )

}
