// import { useState } from 'react';

// function SignUp() {
//   const [email, setEmail] = useState('');
//   const [rollnumber, setRollNumber] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (password !== confirmPassword) {
//       setMessage('Passwords do not match!');
//       return;
//     }

//     try {
//       const response = await fetch('http://localhost/api/v1/users', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, rollnumber, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setMessage('User registered successfully!');
//       } else {
//         setMessage(data.message || 'Registration failed!');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setMessage('An error occurred. Please try again later.');
//     }
//   };

//   return (
//     <div className="sign-up-page" style={{alignContent:'center', justifyContent:'center', marginLeft:'33rem'}}>
//       <h2>Sign Up</h2>
//       <form className="sign-up-form" onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="email">IITJ Email</label>
//           <input
//             type="text"
//             id="email"
//             name="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label htmlFor="rollNumber">Roll Number</label>
//           <input
//             type="text"
//             id="rollNumber"
//             name="rollNumber"
//             value={rollnumber}
//             onChange={(e) => setRollNumber(e.target.value)}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label htmlFor="password">Password</label>
//           <input
//             type="password"
//             id="password"
//             name="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <label htmlFor="confirmPassword">Confirm Password</label>
//           <input
//             type="password"
//             id="confirmPassword"
//             name="confirmPassword"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//           />
//         </div>
//         <button type="submit" className="submit-button">Sign Up</button>
//       </form>
//       {message && <p>{message}</p>}
//     </div>
//   );
// }

// export default SignUp;




import { useState } from 'react';
import { S3 } from '@aws-sdk/client-s3'; // Import S3 client
import { CaptureFinger } from './scanner.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromEnv } from '@aws-sdk/credential-provider-env';
// import './signup.css';

// Configure AWS with your credentials and region


function SignUp() {
  const [email, setEmail] = useState('');
  const [rollnumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [fingerprintImage, setFingerprintImage] = useState(null);
  const [fingerprintURL, setFingerprintURL] = useState(null);
  const [fingerprintKey, setFingerprintKey] = useState('');

  const s3 = new S3Client({
    region: 'ap-south-1',
    credentials: {
      accessKeyId: 'AKIA6HVQPYLL4TWGJ3FN',
      secretAccessKey: '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',
    },
  });
  
  // Create S3 instance
  // const s3 = new AWS.S3();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch('http://localhost/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, rollnumber, password, fingerprintKey, fingerprintImageUrl: fingerprintURL }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('User registered successfully!');
      } else {
        setMessage(data.message || 'Registration failed!');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again later.');
    }
  };

  const handleFingerprintCapture = async () => {
    try {
      const quality = 50;
      const timeout = 100;
      console.log('Calling CaptureFinger with quality:', quality, 'and timeout:', timeout);
      
      const response = await CaptureFinger(quality, timeout);
      console.log('Fingerprint Capture Response:', response);
      
      if (!response || !response.data) {
        throw new Error('No response data');
      }
      
      const fingerprintImage = response.data.BitmapData;
      const fingerprintKey = response.data.AnsiTemplate;
      // Convert Base64 image to binary data (Uint8Array) in the browser
      const binaryString = window.atob(fingerprintImage); // Decode base64 to binary string
      const binaryLength = binaryString.length;
      const binaryArray = new Uint8Array(binaryLength);

      for (let i = 0; i < binaryLength; i++) {
        binaryArray[i] = binaryString.charCodeAt(i);
      }
      const params = {
        Bucket: 'btech-project-bucket',
        Key: `fingerprints/${rollnumber}.png`,
        Body: binaryArray,
        ContentType: 'image/jpeg',
      };
    
      const command = new PutObjectCommand(params);
      await s3.send(command);

      const imageUrl = `https://${params.Bucket}.s3.${'ap-south-1'}.amazonaws.com/fingerprints/${params.Key}`;

      setFingerprintURL(imageUrl);
      setFingerprintImage(fingerprintImage);
      setFingerprintKey(fingerprintKey);

      console.log('Fingerprint image uploaded successfully. Image URL:', imageUrl);
    } catch (error) {
      console.error('Error during fingerprint capture:', error);
      setMessage('Fingerprint capture failed!');
    }
  };
  

  return (
    <div className="sign-up-page">
      <h2>Sign Up</h2>
      <form className="sign-up-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">IITJ Email</label>
          <input
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Fingerprint Registration</label>
          <button type="button" onClick={handleFingerprintCapture}>Capture Fingerprint</button>
          {fingerprintImage && (
            <img src={`data:image/jpeg;base64,${fingerprintImage}`} alt="Fingerprint Image" />
          )}
        </div>
        <button type="submit" className="submit-button">Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SignUp;