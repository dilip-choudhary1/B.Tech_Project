import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { useState } from "react";
import { CaptureFinger, VerifyFinger } from "../scanner.js";
import { useGlobalContext } from "../GlobalContext";

function RegisterUser() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [rollnumber, setRollNumber] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [fingerprintImage, setFingerprintImage] = useState(null);
  const [fingerprintURL, setFingerprintURL] = useState(null);
  const [fingerprintKey, setFingerprintKey] = useState("");
  const { globalVariable, setGlobalVariable} = useGlobalContext();

  const s3 = new S3Client({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost/api/users/get-student/${rollnumber}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${globalVariable}` // Ensure globalVariable contains the correct token
        },
      });
      const data1 = await response.json();
      console.log("user id is : ",data1.body.data._id);
      setUserId(response.body.data._id);
      console.log(globalVariable);
      if (response.ok) {
        setMessage("data fetched Successfully");
      } else {
        setMessage(data.message || "Registration failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again later.");
    };
    

    try {
      const response = await fetch(`http://localhost/api/v1/users/add-ansiKey/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${globalVariable}`
        },
        body: JSON.stringify({
          ansiKey : fingerprintKey,
          ansiImageURL : fingerprintURL,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("User registered successfully!");
      } else {
        setMessage(data.message || "Registration failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again later.");
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
    <div className="sign-up-page">
      <h2>Sign Up</h2>
      <form className="sign-up-form" onSubmit={handleSubmit}>
        {/* <div className="form-group">
          <label htmlFor="email">IITJ Email</label>
          <input
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div> */}
        <div className="form-group">
          <label htmlFor="rollNumber">Roll Number</label>
          <input
            type="text"
            id="rollNumber"
            name="rollNumber"
            value={rollnumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
          />
        </div>
        {/* <div class="form-group">
          <label htmlFor="role">Role</label>
          <select name="role" value ={role} id="role" onChange={(e)=>setRole(e.target.value)}>
            <option value=""> Select Role</option>
            <option value="students">Student</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div> */}
        {/* <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div> */}
        <div className="form-group">
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
        </div>
        <button type="submit" className="submit-button">
          Sign Up
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RegisterUser;
