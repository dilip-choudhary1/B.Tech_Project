
import CryptoJS from "crypto-js";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CaptureFinger, GetMFS100Info, VerifyFinger } from "../scanner.js";

const VerifyUser = () => {
  const location = useLocation();
  const [rollnumber, setRollnumber] = useState(
    location.state?.rollnumber || ""
  );
  const [fingerprintCaptured, setFingerprintCaptured] = useState(false);
  const [ansiTemplate, setAnsiTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
  const ALGORITHM = import.meta.env.VITE_ENCRYPTION_ALGORITHM || "aes-256-cbc";


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
      } else {
        console.error("Capture failed:", response.err);
        toast.error("Fingerprint capture failed.");
      }
    } else {
      toast.error("Cannot capture fingerprint; device not connected.");
    }
  };

  const fetchStoredGalleryTemplate = async (rollNumber) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost/api/v1/users/get-ansiKey/${rollNumber}`
      );
      const result = await response.json();

      console.log("The API response is:", result.data.fingerprintKey);

      if (response.status === 200 && result.data.fingerprintKey) {
        const decryptedKey = decrypt(result.data.fingerprintKey);
        console.log("Decrypted key (hex):", decryptedKey);
        return decryptedKey;
      } else {
        throw new Error(result.message || "Failed to fetch stored fingerprint");
      }
    } catch (error) {
      toast.error("Error fetching fingerprint data: " + error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyFingerprint = async () => {
    if (!fingerprintCaptured || !ansiTemplate || !rollnumber) {
      toast.error("Please capture fingerprint and enter a valid roll number!");
      return;
    }

    try {
      const storedGalleryTemplate = await fetchStoredGalleryTemplate(
        rollnumber
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

  return (
    <div className="VerifyUser">
      <ToastContainer />
      <h2>Verify User Fingerprint</h2>

      <input
        type="text"
        placeholder="Roll Number"
        value={rollnumber}
        onChange={(e) => setRollnumber(e.target.value)}
      />

      <button onClick={captureFinger}>Capture Fingerprint</button>

      {fingerprintCaptured && (
        <button onClick={verifyFingerprint} disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify Fingerprint"}
        </button>
      )}
    </div>
  );
};

export default VerifyUser;
