import CryptoJS from "crypto-js";
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CaptureFinger, GetMFS100Info, VerifyFinger } from "../scanner.js";
import { useGlobalContext } from "../GlobalContext.jsx";

const VerifyUser = () => {
  const location = useLocation();

  const [selectedOption, setSelectedOption] = useState("qrCode"); // 'qrCode' or 'fingerprint'
  const [rollHash, setRollHash] = useState("");
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null);

  const [rollnumber, setRollnumber] = useState(
    location.state?.rollnumber || ""
  );

  const [fingerprintCaptured, setFingerprintCaptured] = useState(false);
  const [ansiTemplate, setAnsiTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { globalVariable, setGlobalVariable } = useGlobalContext();
  const [message, setMessage] = useState("");

  const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
  const ALGORITHM = import.meta.env.VITE_ENCRYPTION_ALGORITHM || "aes-256-cbc";

  useEffect(() => {
    if (selectedOption === "qrCode") {
      inputRef.current.focus();
    }
  }, [selectedOption]);

  const handleOptionChange = (option) => setSelectedOption(option);

  const enterWithQrCode = async (completeRollHash) => {
    if (!completeRollHash) {
      toast.error("Please provide roll hash");
      return;
    }

    setIsLoading(true);

    try {
      let cleanedRollHash = completeRollHash.startsWith("RollHash:")
        ? completeRollHash.replace(/^RollHash:/, "")
        : completeRollHash;

      // console.log("cleanedRollHash: ", cleanedRollHash);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/mess/entry-mess-qr`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${globalVariable}`, // Make sure globalVariable contains the valid token
          },
          body: JSON.stringify({
            rollHash: cleanedRollHash,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes with custom messages
        // console.log("response status: ", response.status);
        // console.log("response data: ", data.message);
        switch (response.status) {
          case 400:
            toast.error(
              data.message || "Bad request. Please check the input data."
            );
            break;
          case 401:
            toast.error("Invalid token! Please login again.");
            break;
          case 403:
            toast.error(data.message || "Only mess staff can enter students.");
            break;
          case 404:
            toast.error(data.message || "User or mess details not found.");
            break;
          default:
            toast.error("An unexpected error occurred. Please try again.");
        }
      } else {
        toast.success(data.message || "Successfully entered the mess.");
      }
    } catch (error) {
      // This catches network issues or other unexpected errors
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
      setRollHash("");
      inputRef.current.focus();
    }
  };

  const decrypt = (encryptedText) => {
    try {
      const [ivHex, encrypted] = encryptedText.split(":");
      const iv = CryptoJS.enc.Hex.parse(ivHex); // Parse IV from hex
      const key = CryptoJS.enc.Hex.parse(ENCRYPTION_KEY); // Parse key from hex

      const decrypted = CryptoJS.AES.decrypt(
        {
          ciphertext: CryptoJS.enc.Hex.parse(encrypted),
        },
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error(
        `Failed to decrypt the fingerprint key: ${error.message}`
      );
    }
  };

  const checkDeviceConnection = async () => {
    try {
      const response = await GetMFS100Info();
      if (response.data.ErrorDescription == "MFS100 not Found") {
        return false;
      }
      return true;
    } catch (error) {
      // toast.error("Failed to connect to the device");
      return false;
    }
  };

  const fetchUserId = async (rollNumber) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/get-student/${rollNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${globalVariable}`, // Ensure globalVariable contains the correct token
          },
        }
      );
      const data1 = await response.json();
      // console.log("response of get : ", data1);
      if (response.ok) {
        // console.log("user id is : ", data1.data._id);
        // console.log(globalVariable);
        // setUserId(userId);
        setMessage("data fetched Successfully");
        return data1.data._id;
      } else {
        // setMessage(data.message || "Registration failed!");
        // toast.error(data1.message);
        return null;
      }
    } catch (error) {
      // console.error("Error:", error);
      setMessage("An error occurred. Please try again later.");
      return null;
    }
  };

  const fetchStoredGalleryTemplate = async (userid) => {
    // console.log("user id is in get ansikey : ", userid);
    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/get-ansiKey/${userid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${globalVariable}`, // Ensure globalVariable contains the correct token
          },
        }
      );
      const result = await response.json();

      // console.log("The API response is:", result.data.fingerprintKey);

      if (response.status === 200 && result.data.fingerprintKey) {
        const decryptedKey = decrypt(result.data.fingerprintKey);
        // console.log("Decrypted key (hex):", decryptedKey);
        setIsLoading(false);
        return decryptedKey;
      } else {
        // throw new Error(result.message || "Failed to fetch stored fingerprint");

        setIsLoading(false);
      }
    } catch (error) {
      toast.error(result.data.message);
      setIsLoading(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollHashChange = (e) => {
    const currentValue = e.target.value;
    setRollHash(currentValue);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      enterWithQrCode(currentValue);
    }, 300);
  };

  const handleMessEntry = async (rollnumber, globalVariable, setMessage) => {
    setIsLoading(true);
    try {
      // Step 1: Check device connection and capture fingerprint
      const captureFingerprint = async () => {
        const isConnected = await checkDeviceConnection();
        if (!isConnected) {
          toast.error("Cannot capture fingerprint; device not connected.");
          return false;
        }

        const response = await CaptureFinger(60, 20000);
        if (!response.httpStatus) {
          // console.error("Capture failed:", response.err);
          toast.error("Fingerprint capture failed.");
          return false;
        }

        const { AnsiTemplate } = response.data;
        setAnsiTemplate(AnsiTemplate);
        setFingerprintCaptured(true);
        // toast.success("Fingerprint captured successfully!");
        return AnsiTemplate;
      };

      // Step 2: Verify fingerprint
      const verifyFingerprintMatch = async (ansiTemplate, rollnumber) => {
        if (!ansiTemplate || !rollnumber) {
          toast.error(
            "Please capture fingerprint and enter a valid roll number!"
          );
          return false;
        }

        try {
          const userid = await fetchUserId(rollnumber);
          if (!userid) {
            toast.error("Roll number not found in the system.");
            return false;
          }
          const storedGalleryTemplate = await fetchStoredGalleryTemplate(
            userid
          );

          if (!storedGalleryTemplate) {
            toast.error("No stored fingerprint found for this roll number.");
            return false;
          }

          const matchResponse = await VerifyFinger(
            ansiTemplate,
            storedGalleryTemplate
          );

          if (!matchResponse.httpStatus) {
            toast.error("Verification failed: " + matchResponse.err);
            return false;
          }

          if (!matchResponse.data.Status) {
            toast.error("Fingerprint does not match.");
            return false;
          }

          // toast.success("Fingerprint matches!");
          return true;
        } catch (error) {
          toast.error("Verification process failed: " + error.message);
          return false;
        }
      };

      // Step 3: Process mess entry
      const processMessEntry = async (rollnumber, globalVariable) => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/mess/entry-mess`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${globalVariable}`,
              },
              body: JSON.stringify({ rollNumber: rollnumber }),
            }
          );

          const res = await response.json();

          if (!response.ok) {
            setMessage(res.message || "Login failed!");
            // toast.error("User Not allowed in this mess.", res.message);
            toast.error(res.message);
            setRollnumber("");
            return false;
          }

          toast.success("You can take this meal! Thanks for coming");
          setRollnumber("");
          return true;
        } catch (error) {
          // console.error("Error:", error);
          setMessage("An error occurred. Please try again later.");
          return false;
        }
      };

      // Execute all steps in sequence
      const capturedTemplate = await captureFingerprint();
      if (!capturedTemplate) return false;

      const isVerified = await verifyFingerprintMatch(
        capturedTemplate,
        rollnumber
      );
      if (!isVerified) {
        return false;
      }

      return await processMessEntry(rollnumber, globalVariable);
    } catch (error) {
      console.error("Error in mess entry process:", error);
      // toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const renderFingerprintScanner = () => (
    <div className="fingerprint-scanner w-full">
      <input
        type="text"
        placeholder="Roll Number"
        value={rollnumber}
        onChange={(e) => setRollnumber(e.target.value.toUpperCase())} // Convert to uppercase
        className="border border-gray-300 rounded-md p-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ textTransform: "uppercase" }} // This ensures the text appears uppercase while typing
      />
      <button
        onClick={() => handleMessEntry(rollnumber, globalVariable, setMessage)}
        disabled={isLoading || !rollnumber}
        className={`bg-blue-500 text-white rounded-md py-2 px-4 transition duration-300 ease-in-out w-full
        hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400
        ${isLoading || !rollnumber ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isLoading ? "Processing..." : "Verify and Enter Mess"}
      </button>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="VerifyUser w-1/3 mt-10 flex flex-col items-center bg-white shadow-lg rounded-lg p-6">
        <ToastContainer />
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Verify User Attendance
        </h2>

        {/* Option Selector */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => handleOptionChange("qrCode")}
            className={`px-4 py-2 ${
              selectedOption === "qrCode"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-700"
            } rounded-md`}
          >
            Use QR Code
          </button>
          <button
            onClick={() => handleOptionChange("fingerprint")}
            className={`px-4 py-2 ${
              selectedOption === "fingerprint"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-700"
            } rounded-md`}
          >
            Use Fingerprint
          </button>
        </div>

        {/* QR Code Scanner Section */}
        {selectedOption === "qrCode" && (
          <div className="qr-code-scanner w-full">
            <input
              type="text"
              placeholder="Roll Number (Hash)"
              value={rollHash}
              onChange={handleRollHashChange}
              ref={inputRef}
              className="border border-gray-300 rounded-md p-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={enterWithQrCode}
              className={`bg-blue-500 text-white rounded-md py-2 px-4 transition duration-300 ease-in-out w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Enter to Mess (QR)"}
            </button>
          </div>
        )}

        {/* Fingerprint Scanner Section */}
        {selectedOption === "fingerprint" && renderFingerprintScanner()}
      </div>
    </div>
  );
};

export default VerifyUser;
