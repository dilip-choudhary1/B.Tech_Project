import { Outlet } from 'react-router-dom';
import Navbar from './navbarMess'; // Assuming you have a Navbar component

function MessCorner() {
  return (
    <div>
      {/* Render the Navbar here */}
      <Navbar />
      
      <div className="mess-content">
        {/* <h1 className='text-black'>Admin Dashboard</h1> */}
        {/* Other Admin Corner components and layout */}
        
        {/* Render nested routes here */}
        <Outlet />
      </div>
    </div>
  );
}

export default MessCorner;
