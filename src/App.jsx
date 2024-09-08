import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import SignUp from './components/signup';
import SignIn from './components/signin';
import StudentCorner from './components/studentCorner';
import Home from './components/home';
import Navbar from './components/navbar'; // Import Navbar here

function App() {
  return (
    <>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student-corner" element={<StudentCorner />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
