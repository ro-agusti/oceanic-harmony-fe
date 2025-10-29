import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postJSON, tokenService, API } from '../config/api';

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
    
      const signupRes = await postJSON(API.auth.signup, formData, false);

      if (!signupRes.ok) {
        setMessage(`Error: ${signupRes.data?.message || "Signup failed"}`);
        return;
      }

   
      const loginRes = await postJSON(
        API.auth.login,
        {
          email: formData.email,
          password: formData.password,
        },
        false
      );

      if (!loginRes.ok) {
        setMessage(`Signup successful, but login failed: ${loginRes.data?.message}`);
        return;
      }

      tokenService.save(loginRes.data.token);
      const user = tokenService.getUser();

      if (!user) return setMessage("Invalid token");

      navigate(user.role === "admin" ? "/admin" : "/user");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
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
