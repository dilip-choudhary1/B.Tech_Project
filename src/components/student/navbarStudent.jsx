import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const NavbarStudent = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const userRole = localStorage.getItem("role");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleDropdownItemClick = () => {
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-gray p-4 ">
      <div className="container flex justify-between items-center ">
        <Link to="/mess" className="text-white text-lg font-bold">
          Student Dashboard
        </Link>
        <div className="hidden md:flex space-x-4">
          <>
            <Link
              to="/student/select-mess"
              className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded"
            >
              Select Mess
            </Link>
            <Link
              to="/student/previous-data"
              className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded"
            >
              Previous Data
            </Link>
          </>
        </div>
        <div className="flex items-center space-x-4">
          {/*   <input type="search" placeholder="Search" className="px-3 py-2 rounded border border-gray-300" />
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Search</button>*/}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarStudent;
