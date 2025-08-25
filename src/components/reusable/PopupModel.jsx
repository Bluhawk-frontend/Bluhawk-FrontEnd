import React from "react";
import { IoClose } from "react-icons/io5";
import { IoIosCloseCircleOutline } from "react-icons/io";

const PopupModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative w-full max-w-[800px] h-auto max-h-[90vh] bg-red-200 flex flex-col sm:flex-row shadow-lg rounded-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-2 right-2  z-50 text-black hover:text-black hover:bg-[#033A72] hover:rounded-full p-2"
        >
          <IoClose size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default PopupModal;



// <button
//           onClick={() => setIsOpen(false)}
//           className="absolute top-1 right-2 z-50 text-gray-800 hover:text-black"
//         >
//           <IoIosCloseCircleOutline size={30} />
//         </button>