import React, { useState } from "react";
import { useGlobalContext } from "../GlobalContext.jsx";

const StudentsByRollNumber = () => {
  const [rollNumber, setRollNumber] = useState("");
  const { globalVariable } = useGlobalContext();
  const [studentData, setStudentData] = useState(null);
  const [message, setMessage] = useState("");

  const handleRollNumberChange = (e) => {
    setRollNumber(e.target.value.toUpperCase());
  };

  const handleSearch = async () => {
    if (!rollNumber) {
      setMessage("Please enter a roll number.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/mess/mess-data-byrollnumber/${rollNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${globalVariable}`,
          },
        }
      );
      const data = await response.json();

      if (data.statusCode === 200) {
        setStudentData(data.data);
        setMessage(data.message);
      } else {
        setMessage("Failed to fetch data.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("An error occurred while fetching data.");
    }
  };

  const mealTypes = ["Breakfast", "Lunch", "Snacks", "Dinner"];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Search Section */}
      <div className="flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-2xl font-bold text-center text-gray-700 mb-4">
            Student Data By Roll Number
          </h3>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter Roll Number"
              value={rollNumber}
              onChange={handleRollNumberChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none whitespace-nowrap"
            >
              Search
            </button>
          </div>

          {message && (
            <p className="mt-4 text-gray-600 text-center">{message}</p>
          )}
        </div>
      </div>

      {/* Table Section */}
      {studentData && (
        <div className="px-6 py-4">
          <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mess Name
                  </th>
                  {mealTypes.map((type) => (
                    <th
                      key={type}
                      className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {type}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(studentData).map(([date, details]) => (
                  <tr key={date} className="hover:bg-gray-50">
                    <td className="py-4 px-4 whitespace-nowrap text-black font-medium">
                      {date}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-black font-medium">
                      {details.messName}
                    </td>
                    {mealTypes.map((type) => (
                      <td key={type} className="py-4 px-4 whitespace-nowrap">
                        {details.meals.some((meal) => meal.type === type) ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsByRollNumber;
