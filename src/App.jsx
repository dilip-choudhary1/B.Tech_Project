import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import AdminCorner from "./components/admin/adminCorner";
import MessCorner from "./components/mess/messCorner";
import RegisterUser from "./components/admin/registerUser";
import ManageStudents from "./components/admin/manageStudents";
import AdminGuidelines from "./components/admin/adminGuidelines";
import Home from "./components/home";
import SignInAdmin from "./components/mess/signin";
import VerifyUser from "./components/mess/verifyfinger";
import MessOverAllStudents from "./components/mess/messOverAllStudents";
import StudentGuidelines from "./components/student/studentGuidelines";
import Navbar from "./components/navbar";
import SignInStudent from "./components/student/signin";
import SignUp from "./components/student/signup";
import StudentCorner from "./components/student/studentCorner";
import StudentDashboard from "./components/student/studentDashboard";
import StudentPreviousData from "./components/student/previousData";
import SelectedMessdata from "./components/student/selectedMess";
import GenerateNewQR from "./components/student/generateNewQR";
import MessGuidelines from "./components/mess/messGuidelines";
// import MessCorner from './components/mess/messCorner';

// Helper Component to Protect Routes
const ProtectedRoute = ({ role, children }) => {
  // const userRole = localStorage.getItem("role");

  // if (!userRole) {
  //   return <Navigate to="/sign-in" replace />;
  // }

  // if (userRole !== role) {
  //   return <Navigate to="/" replace />;
  // }

  return children;
};

function App() {
  return (
    <>
      {/* <Navbar /> */}
      <div className="content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignInStudent />} />
          <Route path="/sign-in-admin" element={<SignInAdmin />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentGuidelines />} /> 
            <Route path="select-mess" element={<StudentCorner />} />
            <Route path="previous-data" element={<StudentPreviousData />} />
            <Route path="selected-mess-data" element={<SelectedMessdata />} />
            <Route path="generate-new-qr" element={<GenerateNewQR />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminCorner />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminGuidelines />} /> 
            <Route path="register" element={<RegisterUser />} />
            <Route path="manage-students/*" element={<ManageStudents />} />
          </Route>

          {/* Mess Routes */}
          <Route
            path="/mess"
            element={
              <ProtectedRoute role="mess">
                <MessCorner />
              </ProtectedRoute>
            }
          >
            <Route index element={<MessGuidelines />} /> 
            <Route path="mess-entry" element={<VerifyUser />} />
            <Route path="mess-overall" element={<MessOverAllStudents />} />
          </Route>

          {/* Redirect unknown routes to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
