// OverallStudents.jsx
import { useState, useEffect } from "react";
import { useGlobalContext } from "../GlobalContext.jsx";

function messOverAllStudents() {
  const { globalVariable } = useGlobalContext();
  const [oldMessCount, setOldMessCount] = useState([]);
  const [newMessCount, setNewMessCount] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMessCount = async () => {
      try {
        const oldResponse = await fetch("http://localhost/api/v1/mess/get-mess-data/Old", {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${globalVariable}`
          },
        });
        const oldData = await oldResponse.json();
        setOldMessCount([oldData.data.previousDayCount, oldData.data.todayCount, oldData.data.nextDayCount]);

        const newResponse = await fetch("http://localhost/api/v1/mess/get-mess-data/New", {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${globalVariable}`
          },
        });
        const newData = await newResponse.json();
        setNewMessCount([newData.data.previousDayCount, newData.data.todayCount, newData.data.nextDayCount]);
        
        setMessage("Data fetched successfully");
      } catch (error) {
        console.error("Error during mess data fetching:", error);
        setMessage("An error occurred. Please try again.");
      }
    };

    fetchMessCount();
  }, [globalVariable]);

  return (
    <div className="student-count w-full max-w-4xl mx-auto rounded-lg shadow-lg mt-10 p-6 bg-gray-800 text-white">
      <h2 className="text-2xl font-bold text-center mb-4 text-white">Number of Students Registered</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Old Mess Data</h3>
          <p>Previous Day: {oldMessCount[0] || "No data"}</p>
          <p>Today: {oldMessCount[1] || "No data"}</p>
          <p>Next Day: {oldMessCount[2] || "No data"}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">New Mess Data</h3>
          <p>Previous Day: {newMessCount[0] || "No data"}</p>
          <p>Today: {newMessCount[1] || "No data"}</p>
          <p>Next Day: {newMessCount[2] || "No data"}</p>
        </div>
      </div>
      {message && <p className="text-center mt-4">{message}</p>}
    </div>
  );
}

export default messOverAllStudents;
