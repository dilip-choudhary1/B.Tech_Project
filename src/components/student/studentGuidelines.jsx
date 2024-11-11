import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const studentGuidelines = () => {
  return (
    <div>
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-auto">
          <ToastContainer />
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2 text-black justify-center text-center">
              <b>General Guidlines for the Students</b>
            </h3>
            <ol className="text-black list-decimal pl-6 justify-center items-center">
              <li>
                <b>Select Mess: </b> Choose your preferred mess for meal
                services. Make sure to finalize your choice in advance to avoid
                last-minute issues.
              </li>
              <li>
                <b>Previous Date: </b> Review past meal records and check your
                previous mess entries. In case of any discrepancies report to
                Mess or Admin Authority.
              </li>
              <li>
                <b>Selected Mess: </b> View details of your current mess
                selection, including meal schedules or menu information if
                available.
              </li>
              <li>
                <b>Generate QR: </b> In case your registration QR shared please
                generate your new QR code for mess entry, keep this ready for
                quick verification at the mess.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default studentGuidelines;
