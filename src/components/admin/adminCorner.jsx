import { Outlet } from 'react-router-dom';
import Navbar from './NavbarAdmin'; // Assuming you have a Navbar component

function AdminCorner() {
  return (
    <div>
      {/* Render the Navbar here */}
      <Navbar />
      
      <div className="admin-content">
        {/* <h1 className='text-black'>Admin Dashboard</h1> */}
        {/* Other Admin Corner components and layout */}
        
        {/* Render nested routes here */}
        <Outlet />
      </div>
    </div>
  );
}

export default AdminCorner;
