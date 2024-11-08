import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGlobalContext } from "../GlobalContext.jsx";

const GenerateNewQR = () => {
  const [canGenerateQR, setCanGenerateQR] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { globalVariable, setGlobalVariable } = useGlobalContext();

  // Mapping response codes to user-friendly messages
  const responseMessages = {
    401: "Invalid token! Please log in again.",
    403: "You are not authorized to generate a QR code.",
    404: "User not found. Please check your credentials.",
    429: "You can generate a new QR code only once a week.",
    500: "Server error. Please try again later.",
    200: "New QR code generated and sent to your email!",
  };

  const generateNewQR = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/generate-qr`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${globalVariable}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      const message =
        responseMessages[data.responseCode] ||
        data.message ||
        "An unexpected error occurred.";

      if (response.ok) {
        toast.success(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        setCanGenerateQR(false);
        setTimeout(() => setCanGenerateQR(true), 1000 * 60 * 60 * 24 * 7); // Disable for 1 week
      } else {
        toast.error(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    } catch (error) {
      toast.error("Error generating new QR code. Please try again later.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-auto">
        <ToastContainer />
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2 text-black justify-center text-center">
            Instructions for Generating a New QR Code
          </h3>
          <ol className="text-black list-decimal pl-6 justify-center items-center">
            <li>
              Only generate a new QR code if you find that someone else is
              inappropriately using your previous QR code.
            </li>
            <li>
              Upon clicking the "Generate New QR" button, a new QR code will be
              sent to your registered email address. Please check your email to
              retrieve the new QR code.
            </li>
            <li>
              After generating a new QR code, the button to generate another one
              will be disabled for a period of 1 week. During this time, you
              will not be able to generate a new QR code.
            </li>
            <li>
              Keep your QR code secure and do not share it with anyone, as it is
              intended for your personal use only.
            </li>
          </ol>
        </div>
        <div className="text-center">
          <button
            disabled={!canGenerateQR || isLoading}
            onClick={generateNewQR}
            className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded ${
              !canGenerateQR || isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Generating..." : "Generate New QR"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateNewQR;
