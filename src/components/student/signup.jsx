import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../GlobalContext";
import { Loader2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SignUp() {
  const { globalVariable, setGlobalVariable } = useGlobalContext();
  const [email, setEmail] = useState("");
  const [rollnumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      toast.error("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    const role = "students";
    const dataToSend = {
      role,
      email,
      rollnumber,
      password,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setGlobalVariable(data.data.authToken);
        setMessage("User registered successfully!");

        // Show success toast and navigate after a short delay
        toast.success("Registration successful! Redirecting...");
        setTimeout(() => {
          navigate("/student");
        }, 2000);
      } else {
        setMessage(data.message || "Registration failed!");
        toast.error(data.message || "Registration failed!");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again later.");
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sign-up-page w-screen h-full mt-10 items-center justify-center">
      <ToastContainer />
      <p className="text-w-10 font-bold text-3xl item-center align-center">
        Sign Up
      </p>
      <form className="sign-up-form w-full h-full mt-5" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">IITJ Email</label>
          <input
            className="h-10"
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="rollNumber">Roll Number</label>
          <input
            className="h-10"
            type="text"
            id="rollNumber"
            name="rollNumber"
            value={rollnumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            className="h-10"
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            className="h-10"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="submit-button mb-5 flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <h2>If Already Registered Sign In </h2>
      <button
        type="button"
        className="submit-button w-full"
        onClick={() => navigate("/sign-in")}
        disabled={isLoading}
      >
        Sign In
      </button>
      <button
        type="button"
        className="submit-button w-full mt-2"
        onClick={() => navigate("/")}
        disabled={isLoading}
      >
        Home
      </button>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}

export default SignUp;
