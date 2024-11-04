import React, { useState } from 'react';

const StudentPreviousData = () => {
  const [date, setDate] = useState('');

  const handleDateChange = (e) => {
    setDate(e.target.value);
    // Fetch data for the specified date here
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-2xl font-bold text-center text-gray-700 mb-4">Previous Data</h3>
        <input 
          type="date" 
          value={date} 
          onChange={handleDateChange} 
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {/* Display filtered students by date */}
        {date && <p className="mt-4 text-gray-600 text-center">Selected Date: {date}</p>}
      </div>
    </div>
  );
};

export default StudentPreviousData;
