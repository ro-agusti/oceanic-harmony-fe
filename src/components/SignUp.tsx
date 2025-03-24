import React, { useEffect, useState } from 'react';

function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('User registered successfully!');
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('Something went wrong.');
    }
  };

  return (
    
    <div className="p-10 text-center">
      <img src={'/logoWave.png'} className= 'h-40 p-4 mx-auto' alt="Oceanic Harmony logo" />
    <div className='p-4'>
      <h2 className="text-l font-bold font-mono text-gray-700 mb-4">Join the Oceanic Harmony community!</h2>
      <text className="text-m font-mono text-gray-700 mb-4">Join the Oceanic Harmony community! Create your account and start your journaling journey to connect with yourself and transform your daily life.</text>
    </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="name"
          value={formData.name}
          onChange={handleChange}
          className="border bg-inherit p-2 font-mono border-gray-300"
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="last name"
          value={formData.last_name}
          onChange={handleChange}
          className="border bg-inherit p-2 font-mono border-gray-300"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="email"
          value={formData.email}
          onChange={handleChange}
          className="border bg-inherit p-2 font-mono border-gray-300"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="border bg-inherit p-2 font-mono border-gray-300"
          required
        />
        <button type="submit" className="font-mono bg-gray-600 text-white px-6 py-2 rounded hover:bg-blue-600">
          Sign Up
        </button>
      </form>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}

export default SignUp;
