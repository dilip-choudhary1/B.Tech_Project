
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


    const [rollnumber, setRollnumber] = useState(
      location.state?.rollnumber || ""
    );
    const [chooseMess, setChooseMess] = useState("");
    const [fingerprintCaptured, setFingerprintCaptured] = useState(false);
    const [ansiTemplate, setAnsiTemplate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { globalVariable, setGlobalVariable} = useGlobalContext();
    const [message, setMessage] = useState("");

    const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
    const ALGORITHM = import.meta.env.VITE_ENCRYPTION_ALGORITHM || "aes-256-cbc";


    useEffect(() => {
      if (selectedOption === "qrCode") {
        inputRef.current.focus();
      }
    }, [selectedOption]);


    const handleOptionChange = (option) => setSelectedOption(option);

    // QR Code submission handler
    // const handleQRSubmit = async () => {
    //   try {
    //     setIsLoading(true);
    //     const response = await fetch(`http://localhost/api/v1/users/get-roll-number-from-hash`, {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({ rollHash: rollnumber }),
    //     });

    //     const data = await response.json();
    //     if (response.ok && data.rollNumber) {
    //       setRollnumber(data.rollNumber);
    //       await entryMess(); // Proceed with attendance marking
    //     } else {
    //       toast.error("Invalid QR code or student not found.");
    //     }
    //   } catch (error) {
    //     console.error("Error verifying QR code:", error);
    //     toast.error("Failed to verify QR code.");
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    const enterWithQrCode = async () => {
      if (!rollHash || !chooseMess) {
        toast.error("Please provide both roll hash and mess selection.");
        return;
      }

      setIsLoading(true);
      
      try {

        let cleanedRollHash = rollHash;
        if(rollHash.startsWith("RollHash:")){
          cleanedRollHash = rollHash.replace(/^RollHash:/, "");
        }

        console.log("cleanedRollHash: ", cleanedRollHash);
        const response = await fetch("http://localhost/api/v1/mess/entry-mess-qr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${globalVariable}`, // Make sure globalVariable contains the valid token
          },
          body: JSON.stringify({
            rollHash: cleanedRollHash,
            mess: chooseMess,
          }),
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          // Handle specific error codes with custom messages
          console.log("response status: ", response.status);
          console.log("response data: ", data.message);
          switch (response.status) {

            case 400:
              toast.error(data.message || "Bad request. Please check the input data.");
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
        return response.httpStatus;
      } catch (error) {
        toast.error("Failed to connect to the device");
        return false;
      }
    };

    const captureFinger = async () => {
      const isConnected = await checkDeviceConnection();
      if (isConnected) {
        const response = await CaptureFinger(60, 10000);
        if (response.httpStatus) {
          const { AnsiTemplate } = response.data;
          setAnsiTemplate(AnsiTemplate);
          setFingerprintCaptured(true);
          toast.success("Fingerprint captured successfully!");
          return true;
        } else {
          console.error("Capture failed:", response.err);
          toast.error("Fingerprint capture failed.");
          return false;
        }
        return false;
      } else {
        toast.error("Cannot capture fingerprint; device not connected.");
        return false;
      }
    };
    

    const fetchUserId=async(rollNumber)=>{
      try {
        const response = await fetch(`http://localhost/api/v1/users/get-student/${rollNumber}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${globalVariable}` // Ensure globalVariable contains the correct token
          },
        });
        const data1 = await response.json();
        console.log("response of get : ",data1);
        if (response.ok) {
          console.log("user id is : ",data1.data._id);
          console.log(globalVariable);
          // setUserId(userId);
          setMessage("data fetched Successfully");
          return data1.data._id;
        } else {
          setMessage(data.message || "Registration failed!");
          return null;
        }
      } catch (error) {
        console.error("Error:", error);
        setMessage("An error occurred. Please try again later.");
        return null;
      };
    };

    // useEffect(() => {
    //   if (userId) {
    //     console.log("user id is :", userId);  // Logs the updated userId when it changes
    //   }
    // }, [userId]);
    const fetchStoredGalleryTemplate = async (userid) => {
      console.log("user id is in get ansikey : ",userid);
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost/api/v1/users/get-ansiKey/${userid}`, {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${globalVariable}` // Ensure globalVariable contains the correct token
            },
          }
        );
        const result = await response.json();

        console.log("The API response is:", result.data.fingerprintKey);

        if (response.status === 200 && result.data.fingerprintKey) {
          const decryptedKey = decrypt(result.data.fingerprintKey);
          console.log("Decrypted key (hex):", decryptedKey);
          setIsLoading(false);
          return decryptedKey;
        } else {
          throw new Error(result.message || "Failed to fetch stored fingerprint");
          setIsLoading(false);
        }
      } catch (error) {
        toast.error("Error fetching fingerprint data: " + error.message);
        setIsLoading(false);
        return null;
      } finally {
        setIsLoading(false);
      }
    };
    const entryMess = async()=>{
      try {
        const response = await fetch("http://localhost/api/v1/mess/entry-mess", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${globalVariable}`
          },
          body: JSON.stringify({ rollNumber: rollnumber, mess :chooseMess}),
        });

        const res = await response.json();
        console.log(globalVariable);
        console.log("api responce : ",res);
        // setGlobalVariable(res.data.authToken);
        console.log("set global responce : ",globalVariable);

        if (response.ok) {
          console.log( " User can enter in the mess");
          
          toast.success("User can enter in the mess");
          // Redirect to StudentCorner
        } 
        else {
          setMessage(res.message || "Login failed!");
          toast.error("User Not allowed in this mess.",res.message );
        }
      } catch (error) {
        console.error("Error:", error);
        setMessage("An error occurred. Please try again later.");
      }
    }

    const verifyFingerprint = async () => {
      if (!fingerprintCaptured || !ansiTemplate || !rollnumber) {
        toast.error("Please capture fingerprint and enter a valid roll number!");
        return;
      }

      try {
        const userid = await fetchUserId(rollnumber);
        console.log(" user id in variable: ", userid);
        const storedGalleryTemplate = await fetchStoredGalleryTemplate(
          userid
        );
        if (storedGalleryTemplate) {
          console.log("Captured Template (ProbFMR):", ansiTemplate);
          console.log("Stored Template (GalleryFMR):", storedGalleryTemplate);

          const matchResponse = await VerifyFinger(
            ansiTemplate,
            storedGalleryTemplate
          );

          if (matchResponse.httpStatus) {
            console.log("Match Response Data:", matchResponse.data);
            if (matchResponse.data.Status) {
              toast.success("Fingerprint matches!");
            } else {
              toast.error("Fingerprint does not match.");
            }
          } else {
            toast.error("Verification failed: " + matchResponse.err);
          }
        } else {
          toast.error("No stored fingerprint found for this roll number.");
        }
      } catch (error) {
        toast.error("Verification process failed: " + error.message);
      }
    };

    const handleFingerprintProcess = async () => {
      setIsLoading(true);
      
      const isCapture = await captureFinger();
      
      if (isCapture) {
        await verifyFingerprint();
      } else {
        console.log("Fingerprint capture failed. Cannot proceed to verification.");
      }
      
      setIsLoading(false); 
    };
  {/* <ToastContainer /> */}
  return (
      <div className="VerifyUser mt-10 flex flex-col items-center bg-white shadow-lg rounded-lg p-6">
        <ToastContainer />
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Verify User Attendance</h2>

        {/* Option Selector */}
        <div className="flex space-x-4 mb-6">
          <button onClick={() => handleOptionChange("qrCode")} className={`px-4 py-2 ${selectedOption === "qrCode" ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} rounded-md`}>
            Use QR Code
          </button>
          <button onClick={() => handleOptionChange("fingerprint")} className={`px-4 py-2 ${selectedOption === "fingerprint" ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} rounded-md`}>
            Use Fingerprint
          </button>
        </div>

        {/* Mess Selector */}
        <div className="form-group mb-4 w-full">
          <label htmlFor="role" className="block text-gray-700 mb-2">Mess</label>
          <select
            name="chooseMess"
            value={chooseMess}
            id="chooseMess"
            onChange={(e) => setChooseMess(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          >
            <option value="">Select Mess</option>
            <option value="Old">Old</option>
            <option value="New">New</option>
          </select>
        </div>

        {/* QR Code Scanner Section */}
        {selectedOption === "qrCode" && (
          <div className="qr-code-scanner w-full">
            <input
              type="text"
              placeholder="Roll Number (Hash)"
              value={rollHash}
              onChange={(e) => setRollHash(e.target.value)}
              ref={inputRef}
              className="border border-gray-300 rounded-md p-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={enterWithQrCode}
              className={`bg-blue-500 text-white rounded-md py-2 px-4 transition duration-300 ease-in-out w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Enter to Mess (QR)"}
            </button>
          </div>
        )}

        {/* Fingerprint Scanner Section */}
        {selectedOption === "fingerprint" && (
          <div className="fingerprint-scanner w-full">
            <input
              type="text"
              placeholder="Roll Number"
              value={rollnumber}
              onChange={(e) => setRollnumber(e.target.value)}
              className="border border-gray-300 rounded-md p-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={captureFinger}
              className={`bg-blue-500 text-white rounded-md py-2 px-4 transition duration-300 ease-in-out w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? "Verifying..." : "Capture Fingerprint"}
            </button>

            {fingerprintCaptured && (
              <button
                onClick={verifyFingerprint}
                disabled={isLoading}
                className={`mt-4 bg-green-500 text-white rounded-md py-2 px-4 transition duration-300 ease-in-out w-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? "Verifying..." : "Verify Fingerprint"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  export default VerifyUser;
