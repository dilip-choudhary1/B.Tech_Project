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
  const { globalVariable, setGlobalVariable } = useGlobalContext();
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
  const fetchUserID = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/get-student/${rollnumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${globalVariable}`,
          },
        }
      );
      const data1 = await response.json();
      // console.log("user id is : ", data1.data._id);
      setUserId(data1.data._id);
      // console.log(userId);
      // console.log(globalVariable);
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userIID = await fetchUserID();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/add-ansiKey/${userIID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${globalVariable}`,
          },
          body: JSON.stringify({
            ansiKey: fingerprintKey,
            ansiImageUrl: fingerprintURL,
          }),
        }
      );

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

    // try {
    //   const response = await fetch(
    //     `${import.meta.env.VITE_BACKEND_URL}/users/add-ansiKey/${userId}`,
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${globalVariable}`,
    //       },
    //       body: JSON.stringify({
    //         ansiKey: fingerprintKey,
    //         ansiImageURL: fingerprintURL,
    //       }),
    //     }
    //   );

    //   const data = await response.json();

    //   if (response.ok) {
    //     setMessage("User registered successfully!");
    //   } else {
    //     setMessage(data.message || "Registration failed!");
    //   }
    // } catch (error) {
    //   console.error("Error:", error);
    //   setMessage("An error occurred. Please try again later.");
    // }
  };

  const handleFingerprintCapture = async () => {
    if (rollnumber === "") {
      setMessage("Roll number is missing.");
      return;
    }
    try {
      const quality = 50;
      const timeout = 100;
      // console.log(
      //   "Calling CaptureFinger with quality:",
      //   quality,
      //   "and timeout:",
      //   timeout
      // );

      const response = await CaptureFinger(quality, timeout);
      // console.log("Fingerprint Capture Response:", response);

      if (!response || !response.data) {
        throw new Error("No response data");
      }

      const fingerprintImage = response.data.BitmapData;
      const fingerprintKey = response.data.AnsiTemplate;
      const iso = response.data.IsoTemplate;

      const binaryString = window.atob(fingerprintImage);
      const binaryLength = binaryString.length;
      const binaryArray = new Uint8Array(binaryLength);
      const response1 = await VerifyFinger(iso, iso);
      // console.log("Verify Response:", response1);

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

      // console.log(
      //   "Fingerprint image uploaded successfully. Image URL:",
      //   imageUrl
      // );
    } catch (error) {
      console.error("Error during fingerprint capture:", error);
      setMessage("Fingerprint capture failed!");
    }
  };
  useEffect(() => {
    const fetchMessCount = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/mess/get-mess-data/Old`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${globalVariable}`, // Ensure globalVariable contains the correct token
            },
          }
        );
        const resData = await response.json();
        // console.log(" response of old : ", response);
        // console.log(" json response of old : ", resData);
        setOldMessCount([
          resData.data.previousDayCount,
          resData.data.todayCount,
          resData.data.nextDayCount,
        ]);
        if (response.ok) {
          console.log("old mess count fetched successfully");
        } else {
          console.log("error during old mess count fetching");
        }

        const response1 = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/mess/get-mess-data/New`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${globalVariable}`, // Ensure globalVariable contains the correct token
            },
          }
        );
        const resData1 = await response1.json();
        // console.log(" response of new : ", response1);
        // console.log(" json response of new : ", resData1);
        setNewMessCount([
          resData1.data.previousDayCount,
          resData1.data.todayCount,
          resData1.data.nextDayCount,
        ]);
        if (response.ok) {
          console.log("old mess count fetched successfully");
        } else {
          console.log("error during old mess count fetching");
        }
      } catch (error) {
        console.error("Error during mess data fetching:", error);
        setMessage("Fingerprint capture failed!");
      }
    };
    fetchMessCount();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <p className="text-2xl font-bold text-center text-gray-800 mb-6">
          Register Students FingerPrint
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="rollNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Roll Number
            </label>
            <input
              type="text"
              id="rollNumber"
              name="rollNumber"
              value={rollnumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Fingerprint Registration
            </label>
            <button
              type="button"
              onClick={handleFingerprintCapture}
              className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Capture Fingerprint
            </button>

            {fingerprintImage && (
              <div className="mt-4 flex justify-center">
                <img
                  src={`data:image/jpeg;base64,${fingerprintImage}`}
                  alt="Fingerprint Image"
                  className="max-w-[200px] border rounded-md shadow-sm"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full p-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Add Fingerprint
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}

export default RegisterUser;
