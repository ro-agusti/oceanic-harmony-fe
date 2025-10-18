import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function LogIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Para redireccionar

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        // setMessage('User registered successfully! Redirecting to login...');
        // setTimeout(() => navigate('/login'), 2000); // Redirige al login después de 2 segundos
        localStorage.setItem("token", data.token); // Guarda el token
        const user = JSON.parse(atob(data.token.split(".")[1])); // Decodifica el token
  
        if (user.role === "admin") {
          navigate("/admin"); // Si es admin, va a HomeAdmin
        } else {
          navigate("/user"); // Si no es admin, va al Home normal
        }
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('Something went wrong.');
    }
  };

  return (
    <div className="p-10 text-center">
        <button onClick={() => navigate('/')}>
      <img src={'/logoWave.png'} className= 'h-40 p-4 mx-auto' alt="Oceanic Harmony logo" />
      </button>
      <div className='p-4'>
      <h2 className="text-xl font-bold font-mono text-gray-700 mb-4">Welcome back!</h2>
      <text className="text-sm font-mono text-gray-700 mb-4">Log in to continue your journey.</text>
    </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="email" name="email" placeholder="email" value={formData.email} onChange={handleChange} className="border bg-inherit p-2 font-mono border-gray-300" required />
        <input type="password" name="password" placeholder="password" value={formData.password} onChange={handleChange} className="border bg-inherit p-2 font-mono border-gray-300" required />
        <button type="submit" className="font-mono bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
          Log In
        </button>
        <button type="submit" className="text-m font-mono text-gray-700 mb-4 hover:underline" onClick={() => navigate('/signup')}>Don’t have an account? Join the community!</button>
      </form>
      {message && <p className="mt-4 text-gray-500">{message}</p>}
    </div>
  );
}

export default LogIn;
