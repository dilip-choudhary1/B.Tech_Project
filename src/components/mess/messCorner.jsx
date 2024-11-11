import { Outlet } from "react-router-dom";
import Navbar from "./navbarMess"; // Assuming you have a Navbar component

function MessCorner() {
  return (
    <div>
      {/* Render the Navbar here */}
      <Navbar />

      <div className="mess-content">

        <Outlet />
      </div>
    </div>
  );
}

export default MessCorner;
