import React, { useState } from "react";
import { useGlobalContext } from "../GlobalContext.jsx";

const StudentPreviousData = () => {
  const [date, setDate] = useState("");
  const { globalVariable } = useGlobalContext();
  const [mealData, setMealData] = useState(null);
  const [message, setMessage] = useState("");

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleSearch = async () => {
    if (!date) {
      setMessage("Please select a date.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:80/api/v1/mess/mess-data-student-bydate/${date}`,
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
        setMealData(data.data);
        setMessage(data.message);
      } else {
        setMessage("Failed to fetch data.");
        setMealData(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("An error occurred while fetching data.");
      setMealData(null);
    }
  };

  const mealTypes = ["Breakfast", "Lunch", "Snacks", "Dinner"];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-2xl font-bold text-center text-gray-700 mb-4">
            Previous Data
          </h3>

          <div className="flex gap-4">
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
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

      {mealData &&
        Object.entries(mealData).map(([date, details]) => (
          <div className="px-6 py-4" key={date}>
            <div className="bg-white rounded-lg shadow-lg overflow-x-auto max-w-2xl mx-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
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
                <tbody className="bg-white">
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-4 whitespace-nowrap text-black font-medium">
                      {details.messName}
                    </td>
                    {mealTypes.map((type) => (
                      <td
                        key={type}
                        className="py-4 px-4 whitespace-nowrap text-center"
                      >
                        {details.mealsTaken.some(
                          (meal) => meal.type === type
                        ) ? (
                          <span className="text-green-600 text-xl">✓</span>
                        ) : (
                          <span className="text-red-600 text-xl">✗</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </div>
  );
};

export default StudentPreviousData;
