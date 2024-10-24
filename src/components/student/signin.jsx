import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from '../GlobalContext';

function SignIn() {
  const { globalVariable, setGlobalVariable} = useGlobalContext();
  const [rollnumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const role = "students"
      const response = await fetch("http://localhost/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role, password, rollnumber }),
      });

      const res = await response.json();
      console.log(globalVariable);
      console.log("api responce : ",res.data.authToken);
      setGlobalVariable(res.data.authToken);
      console.log("set global responce : ",globalVariable);

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify({ rollnumber })); // Save user details in local storage
        navigate("/student-corner"); // Redirect to StudentCorner
      } else {
        setMessage(res.message || "Login failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again later.");
    }
  };
  useEffect(() => {
    console.log('localStorage globalVariable:', localStorage.getItem('globalVariable'));
  }, [globalVariable]);
  

  return (
    <div className="sign-in-page w-screen h-full mt-10">
      <h2>Sign In Page</h2>
      <form className="sign-in-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="rollNumber">Roll Number</label>
          <input
            type="text"
            id="rollNumber"
            name="rollNumber"
            value={rollnumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
          />
        </div>
        <div className="form-group text-white">
          <label htmlFor="password text-white">Password</label>
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
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SignIn;
