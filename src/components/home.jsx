import React from 'react';
import SignUp from './student/signup';
import SignIn from './student/signin';
import SignIn1 from './mess/signin';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page" style={{ }}>
      <h2>Welcome to the IITJ Mess Portal</h2>
      <h3 className="info-text" style={{color:'#303030'}}>You can login or sign up using your credentials</h3>
      <div className='buttons space-y-4'>
        <h3 className="info-text text-lg font-bold mb-2">For Students</h3>
        <li>
          <Link to="/sign-up" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
            Sign Up
          </Link>
        </li>
        <div className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300'>
          <li>
            <Link to="/sign-in" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
              Sign In
            </Link>
          </li>
        </div>

        <h3 className="info-text text-lg font-bold mt-6 mb-2">For Admin</h3>
        <li>
          <Link to="/sign-in-admin" className="px-4 py-2 bg-red text-white rounded hover:bg-red-600 transition duration-300">
            Sign In
          </Link>
        </li>
      </div>

    </div>
  );
}

export default Home;
