// OverallStudents.jsx
import { useState, useEffect } from "react";
import { useGlobalContext } from "../GlobalContext.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dotenv from "dotenv";

function OverallStudents() {
  const { globalVariable } = useGlobalContext();
  const [oldMessCount, setOldMessCount] = useState([]);
  const [newMessCount, setNewMessCount] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMessCount = async () => {
      try {
        
        const oldResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/mess/get-mess-data/Old`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${globalVariable}`,
            },
          }
        );
        const oldData = await oldResponse.json();
        if (oldResponse.ok) {
          setOldMessCount([
            oldData.data.previousDayCount,
            oldData.data.todayCount,
            oldData.data.nextDayCount,
          ]);
        } else {
          throw new Error(oldData.message);
        }

        const newResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/mess/get-mess-data/New`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${globalVariable}`,
            },
          }
        );

        const newData = await newResponse.json();
        if (newResponse.ok) {
          setNewMessCount([
            newData.data.previousDayCount,
            newData.data.todayCount,
            newData.data.nextDayCount,
          ]);
        } else {
          throw new Error(newData.message);
        }
      } catch (error) {
        console.error("Error during mess data fetching:", error);
        // console.log()
        toast.error(error.message || "An error occurred. Please try again.");
      }
    };

    fetchMessCount();
  }, [globalVariable]);

  return (
    <div className="student-count w-full max-w-4xl mx-auto rounded-lg shadow-lg mt-10 p-6 bg-gray-800 text-white">
      <h2 className="text-2xl font-bold text-center mb-4 text-white">
        Number of Students Registered
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Old Mess Data</h3>
          <p>Previous Day: {oldMessCount[0]}</p>
          <p>Today: {oldMessCount[1]}</p>
          <p>Next Day: {oldMessCount[2]}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">New Mess Data</h3>
          <p>Previous Day: {newMessCount[0]}</p>
          <p>Today: {newMessCount[1]}</p>
          <p>Next Day: {newMessCount[2]}</p>
        </div>
      </div>
    </div>
  );
}

export default OverallStudents;
