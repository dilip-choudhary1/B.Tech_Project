import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [isStudent, setIsStudent] = useState(true); // State to toggle between Student and Admin

  const toggleView = () => {
    setIsStudent(!isStudent);
  };

  return (
    <div className="home-page bg-gray-200 text-white h-screen w-screen flex flex-col mt-10">
      <h2 className="text-4xl font-bold mb-4">Welcome to the IITJ Mess Portal</h2>
      <h3 className="text-lg mb-8 text-gray-800">You can login or sign up using your credentials</h3>

      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={toggleView}
          className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition duration-300"
        >
          {isStudent ? 'Switch to Admin' : 'Switch to Student'}
        </button>

        <div className="w-screen h-full max-w-md bg-gray-800 rounded-lg shadow-lg px-6 py-16 transition-transform duration-300 transform">
          {isStudent ? (
            <div>
              <h3 className="text-lg font-bold mb-2">For Students</h3>
              <div className='py-4'>
              <Link to="/sign-up" className="block mb-2 px-3 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300">
                Sign Up
              </Link>
              </div>
              <div className='py-4'>
              <Link to="/sign-in" className="block px-3 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300">
                Sign In
              </Link>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold mb-2">For Admin</h3>
              <Link to="/sign-in-admin" className="block px-3 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;