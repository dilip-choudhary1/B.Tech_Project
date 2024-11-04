import { Outlet } from 'react-router-dom';
import Navbar from './navbarStudent'; // Assuming you have a Navbar component

function StudentDashboard() {
  return (
    <div>
      {/* Render the Navbar here */}
      <Navbar />
      
      <div className="student-content">
        {/* <h1 className='text-black'>Admin Dashboard</h1> */}
        {/* Other Admin Corner components and layout */}
        
        {/* Render nested routes here */}
        <Outlet />
      </div>
    </div>
  );
}

export default StudentDashboard;
