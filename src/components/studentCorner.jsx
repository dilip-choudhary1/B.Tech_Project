import { useState, useEffect } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function StudentCorner() {
  const [selectedMess, setSelectedMess] = useState(null);
  const [messChoice, setMessChoice] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
      window.location.href = '/sign-in'; // Redirect to SignIn if not logged in
      return;
    }

    const fetchMessChoice = async () => {
      try {
        const response = await fetch(`http://localhost/api/v1/users/${user.rollnumber}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          const userId = data.data.user._id;
          const messResponse = await fetch(`http://localhost/api/v1/users/${user.rollnumber}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const messData = await messResponse.json();

          if (messResponse.ok) {
            setMessChoice(messData.messChoice || '');
            setSelectedMess(messData.messChoice ? `You have chosen ${messData.messChoice}` : '');
          } else {
            setError(messData.message || 'Failed to fetch mess choice');
          }
        } else {
          setError(data.message || 'Failed to fetch user details');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('An error occurred while fetching user or mess choice');
      }
    };

    fetchMessChoice();
  }, []);
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
      const userResponse = await fetch(`http://localhost/api/v1/users/${user.rollnumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const userData = await userResponse.json();
      const userId = userData.data.user._id;
      setMessChoice(mess);
      const response = await fetch(`http://localhost/api/v1/mess/choose-mess/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    <div className="student-corner" style={{ alignContent: 'center', justifyContent: 'center', marginLeft: '35rem' }}>
      <h2>Welcome to the Student Corner</h2>
      <h3>Choose your mess</h3>
      <div className="mess-buttons">
        <button onClick={() => setSelectedMess('Old')}>Old</button>
        <button onClick={() => setSelectedMess('New')}>New</button>
      </div>
      <div className="date-picker">
        <label>Start Date:</label>
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
