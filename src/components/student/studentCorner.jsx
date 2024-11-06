import { useEffect, useState } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useGlobalContext } from "../GlobalContext";
import {jwtDecode} from "jwt-decode";
import './studentcorner.css';

function StudentCorner() {
  const { globalVariable, setGlobalVariable} = useGlobalContext();
  const [selectedMess, setSelectedMess] = useState(null);
  const [messChoice, setMessChoice] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem('user'));
  //   if (!user) {
  //     window.location.href = '/sign-in'; // Redirect to SignIn if not logged in
  //     return;
  //   }
  // }, []);

  useEffect(() => {
    if (!globalVariable) {
      window.location.href = '/sign-in'; // Redirect to SignIn if not logged in
      return;
    }

    // Decode token to check expiration
    const decodedToken = jwtDecode(globalVariable);
    const currentTime = Date.now() / 1000; // Current time in seconds

    if (decodedToken.exp < currentTime) {
      // Token is expired
      localStorage.removeItem('globalVariable');
      setGlobalVariable(''); 
      window.location.href = '/sign-in';
    }
  }, [globalVariable, setGlobalVariable]);

  const formatDate = (date) => {
    // Format date as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleMessSelection = async (mess) => {
    setSelectedMess(`You have chosen ${mess}`);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setMessChoice(mess);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/mess/choose-mess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${globalVariable}`
        },
        body: JSON.stringify({ 
          startDate: formatDate(startDate), 
          endDate: formatDate(endDate),
          mess: selectedMess
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('User registered successfully!');
      } else {
        setMessage(data.message || 'Registration failed!');
      }
      
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while saving mess choice');
    }
  };

  return (
    <div className="student-corner w-screen h-full mt-25 " style={{ }}>
      <h2>Welcome to the Student Corner</h2>
      <h3>Choose your mess</h3>
      <div className="mess-buttons">
        <button onClick={() => setSelectedMess('Old')}>Old</button>
        <button onClick={() => setSelectedMess('New')}>New</button>
      </div>
      <div className="date-picker text-white">
        <label className="text-white">Start Date:</label>
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
        <label>End Date:</label>
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
      </div>
      <button onClick={handleMessSelection} className="submit-button">Submit</button>
      {selectedMess && <p className="mess-selection">{selectedMess}</p>}
      {error && <p className="error-message">{error}</p>}
      {message && <p>{message}</p>}

    </div>
  );
}

export default StudentCorner;
