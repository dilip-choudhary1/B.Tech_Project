import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../GlobalContext";
// import './signup.css';
// import './../../App.css';
import dotenv from "dotenv";

function SignIn1() {
  const { globalVariable, setGlobalVariable } = useGlobalContext();
  const [rollnumber, setRollNumber] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role, password, email }),
        }
      );

      // console.log("Printing the login", response);

      const res = await response.json();
      // console.log(globalVariable);
      // console.log("api responce : ", res.data.authToken);
      setGlobalVariable(res.data.authToken);
      // console.log("set global responce : ", globalVariable);

      if (response.ok && role == "admin") {
        localStorage.setItem("user", JSON.stringify({ rollnumber })); // Save user details in local storage
        navigate("/admin/register"); // Redirect to StudentCorner
      } else if (response.ok && role == "mess") {
        localStorage.setItem("user", JSON.stringify({ rollnumber })); // Save user details in local storage
        navigate("/mess/mess-entry"); // Redirect to StudentCorner
      } 
      else {
        setMessage(res.message || "Login failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again later.");
    }
  };
  useEffect(() => {
    // console.log(
    //   "localStorage globalVariable:",
    //   localStorage.getItem("globalVariable")
    // );
  }, [globalVariable]);

  return (
    <div className="sign-in-page w-screen h-full mt-10">
      <h2>Sign In Page</h2>
      <form className="sign-in-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div class="form-group">
          <label htmlFor="role">Role</label>
          <select
            name="role"
            value={role}
            id="role"
            onChange={(e) => setRole(e.target.value)}
          >
            <option value=""> Select Role</option>
            <option value="admin">Admin</option>
            <option value="mess">Mess</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Sign In
        </button>
        <button type="submit" className="submit-button mt-3" onClick={() => navigate("/")}>
          {"Home"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SignIn1;
