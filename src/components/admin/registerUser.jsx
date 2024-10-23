import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { useState, useEffect } from "react";
import { useGlobalContext } from "../GlobalContext.jsx";
import { CaptureFinger, VerifyFinger } from "../scanner.js";

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
  const [oldMessCount, setOldMessCount] = useState([]);
  const [newMessCount, setNewMessCount] = useState([]);
  const [error, setError] = useState(null);


  const s3 = new S3Client({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
  });
  const fetchUserID = async()=>{
    try {
      const response = await fetch(`http://localhost/api/v1/users/get-student/${rollnumber}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${globalVariable}` // Ensure globalVariable contains the correct token
        },
      });
      const data1 = await response.json();
      console.log("user id is : ",data1.data._id);
      setUserId(data1.data._id);
      console.log(userId);
      console.log(globalVariable);
      if (response.ok) {
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userIID = await fetchUserID();
    try {
      const response = await fetch(`http://localhost/api/v1/users/add-ansiKey/${userIID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${globalVariable}`
        },
        body: JSON.stringify({
          ansiKey : fingerprintKey,
          ansiImageUrl : fingerprintURL,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("User registered successfully!");
      } else {
        setMessage(data.message || "Registration failed!");
      }
    } catch (error) {
      console.error("here Error:", error);
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
  useEffect(() => {
    const fetchMessCount= async()=>{
      try{
        const response = await fetch(
          "http://localhost/api/v1/mess/get-mess-data/Old", {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${globalVariable}` // Ensure globalVariable contains the correct token
            },
          }
        );
        const resData = await response.json();
        console.log(" response of old : ",response);
        console.log(" json response of old : ",resData);
        setOldMessCount([resData.data.previousDayCount,resData.data.todayCount,resData.data.nextDayCount]);
        if(response.ok){
          console.log("old mess count fetched successfully");
        }
        else{
          console.log("error during old mess count fetching");
        }

        const response1 = await fetch(
          "http://localhost/api/v1/mess/get-mess-data/New", {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${globalVariable}` // Ensure globalVariable contains the correct token
            },
          }
        );
        const resData1 = await response1.json();
        console.log(" response of new : ",response1);
        console.log(" json response of new : ",resData1);
        setNewMessCount([resData1.data.previousDayCount,resData1.data.todayCount,resData1.data.nextDayCount]);
        if(response.ok){
          console.log("old mess count fetched successfully");
        }
        else{
          console.log("error during old mess count fetching");
        }

      }
      catch(error){
        console.error("Error during mess data fetching:", error);
        setMessage("Fingerprint capture failed!");
      }
    };
    fetchMessCount();
  }, []);

  return (
    <div>
      <div className="sign-up-page w-full h-full mt-10">
        <div>
          <p className="text-w-10 font-bold text-xl mb-5 item-center align-center">Register Students FingerPrint</p>
          <form className="sign-up-form" onSubmit={handleSubmit}>
            
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
      </div>
      <div className="student-count w-full max-w-4xl mx-auto rounded-lg shadow-lg mt-10 p-6 bg-gray-800 text-white">
        <h2 className="text-2xl font-bold text-center mb-4 text-white">Number of Students Registered</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Old Mess Data</h3>
                <p className="mt-2">Previous Day Data: <span className="font-medium">{oldMessCount.length > 0 ? oldMessCount[0] : "No data available"}</span></p>
                <p className="mt-1">Today Day Data: <span className="font-medium">{oldMessCount.length > 0 ? oldMessCount[1] : "No data available"}</span></p>
                <p className="mt-1">Next Day Data: <span className="font-medium">{oldMessCount.length > 0 ? oldMessCount[2] : "No data available"}</span></p>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">New Mess Data</h3>
                <p className="mt-2">Previous Day Data: <span className="font-medium">{newMessCount.length > 0 ? newMessCount[0] : "No data available"}</span></p>
                <p className="mt-1">Today Day Data: <span className="font-medium">{newMessCount.length > 0 ? newMessCount[1] : "No data available"}</span></p>
                <p className="mt-1">Next Day Data: <span className="font-medium">{newMessCount.length > 0 ? newMessCount[2] : "No data available"}</span></p>
            </div>
        </div>
    </div>
    </div>
    
  );
}

export default RegisterUser;
