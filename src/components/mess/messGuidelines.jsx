import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const messGuidelines = () => {
  return (
    <div>
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-auto">
          <ToastContainer />
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2 text-black justify-center text-center">
              <b>General Guidelines for the Mess Authorities</b>
            </h3>
            <ol className="text-black list-decimal pl-6 justify-center items-center">
              <li>
                <b>Mess Entry:</b> This allows you to log students' attendance
                daily. Students can verify themselves via fingerprint or QR
                code, select the appropriate method based on the student's
                preference or device compatibility.
              </li>
              <li>
                <b>Mess Overall:</b> View comprehensive statistics, including:
                Number of students registered for today, tomorrow, and
                yesterday, to manage and prepare meals accordingly.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default messGuidelines;
