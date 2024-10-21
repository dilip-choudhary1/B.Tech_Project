import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/home';
import RegisterUser from './components/mess/registerUser';
import VerifyUser from './components/mess/verifyfinger';
import Navbar from './components/navbar';
import SignIn from './components/student/signin';
import SignUp from './components/student/signup';
import StudentCorner from './components/student/studentCorner';
import SignIn1 from './components/mess/signin';
import AdminCorner from './components/admin/admin';


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
          <Route path="/sign-in-admin" element={<SignIn1 />} />
          <Route path="/verify" element={<VerifyUser />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/admin-portal" element={<AdminCorner />} />
          
        </Routes>
      </div>
    </>
  );
}

export default App;
