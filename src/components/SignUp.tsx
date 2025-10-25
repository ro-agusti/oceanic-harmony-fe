import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1️⃣ Signup
      const signupResponse = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        setMessage(`Error: ${signupData.message}`);
        return;
      }

      // 2️⃣ Login automático después del signup
      const loginResponse = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        setMessage(`Signup successful, but login failed: ${loginData.message}`);
        return;
      }

      // 3️⃣ Guardar token y redirigir según rol
      localStorage.setItem("token", loginData.token);
      const user = JSON.parse(atob(loginData.token.split(".")[1]));

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }

    } catch (error) {
      console.error(error);
      setMessage('Something went wrong.');
    }
  };

  return (
    <div className="p-10 text-center">
      <button onClick={() => navigate('/')}>
        <img src={'/logoWave.png'} className='h-40 p-4 mx-auto' alt="Oceanic Harmony logo" />
      </button>
      <div className='p-4'>
        <h2 className="text-xl font-bold font-mono text-gray-700 mb-4">Join the Oceanic Harmony community!</h2>
        <text className="text-sm font-mono text-gray-700 mb-4">
          Create your account and start your journaling journey to connect with yourself and transform your daily life.
        </text>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" name="name" placeholder="name" value={formData.name} onChange={handleChange} className="border bg-inherit p-2 font-mono border-gray-300" required />
        <input type="text" name="last_name" placeholder="last name" value={formData.last_name} onChange={handleChange} className="border bg-inherit p-2 font-mono border-gray-300" required />
        <input type="email" name="email" placeholder="email" value={formData.email} onChange={handleChange} className="border bg-inherit p-2 font-mono border-gray-300" required />
        <input type="password" name="password" placeholder="password" value={formData.password} onChange={handleChange} className="border bg-inherit p-2 font-mono border-gray-300" required />
        <button type="submit" className="font-mono bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
          Sign Up
        </button>
        <button type="button" className="text-m font-mono text-gray-700 mb-4 hover:underline" onClick={() => navigate('/login')}>
          Already have an account? Log in here!
        </button>
      </form>
      {message && <p className="mt-4 text-gray-500">{message}</p>}
    </div>
  );
}

export default SignUp;

// import React, { useEffect, useState } from 'react';
// import { Routes, Route, useNavigate } from 'react-router-dom'

// const API_URL = import.meta.env.VITE_API_URL;

// function SignUp() {
//   const [formData, setFormData] = useState({
//     name: '',
//     last_name: '',
//     email: '',
//     password: '',
//   });

//   const [message, setMessage] = useState('');
//   const navigate = useNavigate(); // Para redirigir

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   try {
//     // 1️⃣ Signup
//     const signupResponse = await fetch(`${API_URL}/api/signup`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(formData),
//     });

//     const signupData = await signupResponse.json();

//     if (!signupResponse.ok) {
//       setMessage(`Error: ${signupData.message}`);
//       return;
//     }

//     // 2️⃣ Login automático después del signup
//     const loginResponse = await fetch(`${API_URL}/api/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         email: formData.email,
//         password: formData.password,
//       }),
//     });

//     const loginData = await loginResponse.json();

//     if (!loginResponse.ok) {
//       setMessage(`Signup successful, but login failed: ${loginData.message}`);
//       return;
//     }

//     // 3️⃣ Guardar token en localStorage o context
//     localStorage.setItem('token', loginData.token); // depende de cómo tu backend maneje JWT/session

//     setMessage('User registered and logged in successfully!');

//     // 4️⃣ Redirigir a home o dashboard
//     navigate('/dashboard');

//   } catch (error) {
//     console.error(error);
//     setMessage('Something went wrong.');
//   }
// };

//   // const handleSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault();

//   //   try {
//   //     const response = await fetch(`${API_URL}/api/signup`, {
//   //       method: 'POST',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: JSON.stringify(formData),
//   //     });

//   //     const data = await response.json();
//   //     if (response.ok) {
//   //       setMessage('User registered successfully!');
//   //     } else {
//   //       setMessage(`Error: ${data.message}`);
//   //     }
//   //   } catch (error) {
//   //     setMessage('Something went wrong.');
//   //   }
//   // };

//   return (
    
//     <div className="p-10 text-center">
//       <button onClick={() => navigate('/')}>
//       <img src={'/logoWave.png'} className= 'h-40 p-4 mx-auto' alt="Oceanic Harmony logo" />
//       </button>
//     <div className='p-4'>
//       <h2 className="text-xl font-bold font-mono text-gray-700 mb-4">Join the Oceanic Harmony community!</h2>
//       <text className="text-sm font-mono text-gray-700 mb-4">Join the Oceanic Harmony community! Create your account and start your journaling journey to connect with yourself and transform your daily life.</text>
//     </div>
//       <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//         <input
//           type="text"
//           name="name"
//           placeholder="name"
//           value={formData.name}
//           onChange={handleChange}
//           className="border bg-inherit p-2 font-mono border-gray-300"
//           required
//         />
//         <input
//           type="text"
//           name="last_name"
//           placeholder="last name"
//           value={formData.last_name}
//           onChange={handleChange}
//           className="border bg-inherit p-2 font-mono border-gray-300"
//           required
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="email"
//           value={formData.email}
//           onChange={handleChange}
//           className="border bg-inherit p-2 font-mono border-gray-300"
//           required
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="password"
//           value={formData.password}
//           onChange={handleChange}
//           className="border bg-inherit p-2 font-mono border-gray-300"
//           required
//         />
//         <button type="submit" className="font-mono bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
//           Sign Up
//         </button>
//         <button type="submit" className="text-m font-mono text-gray-700 mb-4 hover:underline" onClick={() => navigate('/login')}>Already have an account? Log in here!</button>
//       </form>
//       {message && <p className="mt-4 text-gray-500">{message}</p>}
//     </div>
//   );
// }

// export default SignUp;
