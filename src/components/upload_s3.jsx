
import React, { useState } from "react";
import { CaptureFinger, GetMFS100Info } from "scanner.js";
import AWS from "aws-sdk";
import { Buffer } from "buffer";
import { registerUser } from "../api";
import "./register.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterUser = () => {
  const [fingerprintCaptured, setFingerprintCaptured] = useState(false);
  const [ansiTemplate, setAnsiTemplate] = useState(null);
  const [bitmapData, setBitmapData] = useState(null); // Store fingerprint image data for later upload
  const [email, setEmail] = useState("");
  const [rollnumber, setRollnumber] = useState("");
  const [password, setPassword] = useState("");

  const s3 = new AWS.S3({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_AWS_REGION,
  });

  const uploadToS3 = async (base64Image) => {
    const params = {
      Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
      Key: `fingerprints/${rollnumber}.png`, // Now we use rollnumber for the key
      Body: Buffer.from(
        base64Image.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      ),
      ContentEncoding: "base64",
      ContentType: "image/png",
    };

    try {
      const data = await s3.upload(params).promise();
      console.log("File uploaded successfully. S3 URL:", data.Location);
      return data.Location;
    } catch (err) {
      console.error("Error uploading file:", err.message);
      return null;
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
        const { AnsiTemplate, BitmapData } = response.data;
        setAnsiTemplate(AnsiTemplate);
        setBitmapData(BitmapData);
        setFingerprintCaptured(true);
        toast.success("Fingerprint captured successfully!");
      } else {
        console.error("Capture failed:", response.err);
        toast.error("Fingerprint capture failed.");
      }
    } else {
      toast.error("Cannot capture fingerprint; device not connected.");
      return;
    }
  };

  const handleRegister = async () => {
    if (email === "" || rollnumber === "" || password === "") {
      toast.error("Please fill out all required fields!");
      return;
    }

    let base64Image;
    if (typeof bitmapData === "string") {
      base64Image = `data:image/png;base64,${bitmapData}`;
    } else {
      const binaryString = String.fromCharCode(...new Uint8Array(bitmapData));
      base64Image = `data:image/png;base64,${btoa(binaryString)}`;
    }

    const s3Url = await uploadToS3(base64Image);

    if (s3Url) {
      const response = await registerUser(
        email,
        rollnumber,
        password,
        ansiTemplate,
        s3Url
      );

      // console.log(response);

      // console.log(response);
      // console.log(response.statusCode);
      if (response.statusCode === 201) {
        toast.success(response.message);
        setAnsiTemplate("");
        setBitmapData("");
        setEmail("");
        setPassword("");
        setFingerprintCaptured("");
        setRollnumber("");
      } else {
        const message = response.message;
        toast.error(message);
      }
    } else {
      toast.error("Failed to upload fingerprint image to S3.");
    }
  };

  return (
    <div className="RegisterUser">
      <ToastContainer />
      <h2>Register User</h2>

      {!fingerprintCaptured ? (
        <div>
          <button onClick={captureFinger}>Capture Fingerprint</button>
        </div>
      ) : (
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Roll Number"
            value={rollnumber}
            onChange={(e) => setRollnumber(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleRegister}>Register</button>
        </div>
      )}
    </div>
  );
};

export default RegisterUser;
