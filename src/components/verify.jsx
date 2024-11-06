import React, { useState } from "react";
import { CaptureFinger } from "./scanner";

function Verify(){
    const [rollNumber , setRollNumber] = useState("");
    const [isoTemplate, setIsoTemplate] = useState("");
    const [result, setResult]=useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/verify-finger`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                rollNumber,
                fingerprintKey : isoTemplate,
            }),
            });

            const data = await response.json();
            setResult(data);

            if (response.ok) {
            setMessage("User registered successfully!");
            } else {
            setMessage(data.message || "Registration failed!");
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("An error occurred. Please try again later.");
        }
    };

    const VerifyFinger = async()=>{
        try{
            const quality = 50;
            const timeout = 100;
            console.log(
                "Calling CaptureFinger with quality:",
                quality,
                "and timeout:",
                timeout
            );

            const response = await CaptureFinger(quality, timeout);
            console.log("Fingerprint Capture Response:", response);
            if (!response || !response.data) {
                throw new Error("No response data");
            }
            const iso = response.data.AnsiTemplate;
            setIsoTemplate(iso);

        }catch(error){
            console.error(error);
        };
    }
    const handleRollNumberChange = (event) =>{
        setRollNumber(event.target.value);
    }
    const handleVerifyClick = ()=>{
        VerifyFinger();
    }


    return (
        <div className="verify-container">
            <h2>Mess Entry Verification</h2>
            <input type="text" value={rollNumber} onChange={handleRollNumberChange} placeholder="Enter Roll Number"/>
            <button onClick={handleVerifyClick}> Verify </button>
            {result!=null && (
                <p>
                    {result ? "Fingerprint Matched " : " Finger Print not Matched"}
                </p>
            )}
            
        </div>
    );

}

export default Verify;