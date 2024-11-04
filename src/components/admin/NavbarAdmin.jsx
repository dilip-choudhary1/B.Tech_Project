import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const NavbarComponent = () => {
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
    <nav className="bg-gray p-4">
      <div className="container flex justify-between items-center ">
        <Link to="/admin" className="text-white text-lg font-bold">
          Admin Dashboard
        </Link>
        <div className="hidden md:flex space-x-4">
          <>
            <Link
              to="/admin/register"
              className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded"
            >
              Register
            </Link>
            <div className="relative">
              <button
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded focus:outline-none"
                onClick={() => setDropdownOpen(!isDropdownOpen)}
              >
                Manage Students
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <Link
                    to="/admin/manage-students/overall"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                    onClick={handleDropdownItemClick}
                  >
                    Overall
                  </Link>
                  <Link
                    to="/admin/manage-students/by-date"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                    onClick={handleDropdownItemClick}
                  >
                    By Date
                  </Link>
                  <Link
                    to="/admin/manage-students/by-roll-number"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                    onClick={handleDropdownItemClick}
                  >
                    By Roll Number
                  </Link>
                </div>
              )}
            </div>
          </>
        </div>
        <div className="flex items-center space-x-4">
          {/* <input
            type="search"
            placeholder="Search"
            className="px-3 py-2 rounded border border-gray-300"
          />
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
            Search
          </button>
          */}

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

export default NavbarComponent;
