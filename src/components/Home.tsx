import { useState } from "react";
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Menu, X } from "lucide-react"; // Íconos para el menú
import { LogIn, UserPlus } from "lucide-react"; // Importa los íconos
// //import './App.css'
//import SignUp from './SignUp'
//import LogIn from './LogIn'

function Home() {
    // const [count, setCount] = useState(0)
    const navigate = useNavigate() // Hook para redirigir a otra página
    const [menuOpen, setMenuOpen] = useState(false);

    return (
      <>
      <nav className="fixed top-0 w-full max-w-screen-lg mx-auto left-0 right-0 flex justify-between p-4 border-b border-gray-300 bg-transparent ">
    <h1 className="text-2xl font-bold text-gray-700 font-mono">
      Oceanic Harmony
    </h1>

    {/* Botones en desktop */}
    <div className="hidden md:flex gap-4">
          <button className="flex items-center gap-2 text-gray-500 hover:underline" onClick={() => navigate('/login')}>
          <LogIn size={20} className="mr-2" /> Log In
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:underline" onClick={() => navigate('/signup')}>
          <UserPlus size={20} className="mr-2" /> Sign Up
          </button>
        </div>

      {/* Menú hamburguesa en mobile */}
      <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Menú desplegable en mobile */}
        {menuOpen && (
          <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 flex flex-col gap-2">
            <button className="flex items-center gap-2 text-gray-500 hover:underline" onClick={() => { navigate('/login'); setMenuOpen(false); }}>
            <LogIn size={20} className="mr-2" /> Log In
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:underline" onClick={() => { navigate('/signup'); setMenuOpen(false); }}>
            <UserPlus size={20} className="mr-2" /> Sign Up
            </button>
          </div>
        )}
  </nav>
        <div className="card">
        <img src={'/logoWave.png'} className= 'h-40 p-4 mx-auto' alt="Oceanic Harmony logo" />
  
          <p className=' p-5 font-mono'>
          Oceanic Harmony is a space for self-discovery and growth. It helps you tap into your strengths, organize your thoughts, and level up in life. Think of it as a mix of introspective challenges and guidance to bring out your best self and turn your dreams into action.
          </p>
          <section className="text-center mt-8">
    <button
      onClick={() => navigate("/challenges")}
      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
    >
      See Challenges
    </button>
  </section>
        </div>
        
      </>
    )
  }

  export default Home