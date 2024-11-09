import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const adminGuidelines = () => {
  return (
    <div>
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-auto">
          <ToastContainer />
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2 text-black justify-center text-center">
              <b>General Guidlines for the Admin </b>
            </h3>
            <ol className="text-black list-decimal pl-6 justify-center items-center">
              <li>
                <b>Fingerprint Registration:</b> Access this to register
                fingerprints for students.
              </li>
              <li>
                <b>Manage Students: </b>
                <ul className="list-disc pl-6 mt-2">
                    <li><b>Overall:</b> View the complete list of students registered for the mess.</li>
                    <li><b>By Date:</b> Filter student data by specific dates to see who attended on particular days.</li>
                    <li><b>By Roll Number:</b> Search for students by roll number to check individual records or details.</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default adminGuidelines;
