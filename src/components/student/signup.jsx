import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { useState } from "react";
import { CaptureFinger, VerifyFinger } from "../scanner.js";
import { useNavigate } from "react-router-dom";
import SignIn from "./signin.jsx";
import { useGlobalContext } from '../GlobalContext';

function SignUp() {
  const { globalVariable, setGlobalVariable} = useGlobalContext();
  const [email, setEmail] = useState("");
  // const [role, setRole] = useState("");
  const [rollnumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [fingerprintImage, setFingerprintImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fingerprintURL, setFingerprintURL] = useState(null);
  const [fingerprintKey, setFingerprintKey] = useState("");
  const navigate = useNavigate();

  const s3 = new S3Client({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
  });

  const handleSubmit = async (e) => {
    setIsLoading(true)
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    const role ="students";
    const dataToSend = {
      role,
      email,
      rollnumber,
      password,
      // fingerprintKey,
      // fingerprintImageUrl: fingerprintURL,
    };
    console.log(dataToSend);
    try {
      const response = await fetch("http://localhost/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
        // console.log(body);
      });

      const data = await response.json();
      console.log(response);

      if (response.ok) {

        setGlobalVariable(data.data.authToken);

        setIsLoading(false);
        setMessage("User registered successfully!");
        // navigate("/sign-in");
        navigate("/student");
      } else {
        setMessage(data.message || "Registration failed!");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleFingerprintCapture = async () => {
    try {
      const quality = 50;
      const timeout = 100;
      console.log(
        "Calling CaptureFinger with quality:",
        quality,
        "and timeout:",
        timeout
      );

      const response = await CaptureFinger(quality, timeout);
      console.log("Fingerprint Capture Response:", response);

      if (!response || !response.data) {
        throw new Error("No response data");
      }
      
      const fingerprintImage = response.data.BitmapData;
      const fingerprintKey = response.data.AnsiTemplate;
      const iso = response.data.IsoTemplate

      const binaryString = window.atob(fingerprintImage);
      const binaryLength = binaryString.length;
      const binaryArray = new Uint8Array(binaryLength);
      const response1 = await VerifyFinger(iso, iso);
      console.log("Verify Response:", response1);

      for (let i = 0; i < binaryLength; i++) {
        binaryArray[i] = binaryString.charCodeAt(i);
      }
      const params = {
        Bucket: import.meta.env.VITE_BUCKET_NAME,
        Key: `fingerprints/${rollnumber}.png`,
        Body: binaryArray,
        ContentType: "image/png",
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);

      const imageUrl = `https://${params.Bucket}.s3.${
        import.meta.env.VITE_AWS_REGION
      }.amazonaws.com/fingerprints/${params.Key}`;

      setFingerprintURL(imageUrl);
      setFingerprintImage(fingerprintImage);
      setFingerprintKey(fingerprintKey);

      console.log(
        "Fingerprint image uploaded successfully. Image URL:",
        imageUrl
      );
      
    } catch (error) {
      console.error("Error during fingerprint capture:", error);
      setMessage("Fingerprint capture failed!");
    }
  };

  return (
    <div className="sign-up-page w-screen h-full mt-10 items-center justify-center">
      <p className="text-w-10 font-bold text-3xl item-center align-center">Sign Up</p>
      <form className="sign-up-form w-full h-full mt-5" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">IITJ Email</label>
          <input
            className="h-10"
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="rollNumber">Roll Number</label>
          <input
            className="h-10"
            type="text"
            id="rollNumber"
            name="rollNumber"
            value={rollnumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            className="h-10"
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            className="h-10"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {/* <div className="form-group">
          <label>Fingerprint Registration</label>
          <button type="button" onClick={handleFingerprintCapture}>
            Capture Fingerprint
          </button>
          {fingerprintImage && (
            <img
              src={`data:image/jpeg;base64,${fingerprintImage}`}
              alt="Fingerprint Image"
            />
          )}
        </div> */}
        <button type="submit" className="submit-button mb-5">
        {isLoading ?" Loading... ":" Sign Up "}
        </button>
        
      </form>
      <h2>If Already Registered Sign In </h2>
      <button type="signin" className="submit-button w-full" onClick={() => navigate("/sign-in")}>
      {" Sign In "}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SignUp;
