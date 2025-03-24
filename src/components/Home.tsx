import { Routes, Route, useNavigate } from 'react-router-dom'
//import './App.css'
//import SignUp from './SignUp'
//import LogIn from './LogIn'

function Home() {
    // const [count, setCount] = useState(0)
    const navigate = useNavigate() // Hook para redirigir a otra página
  
    return (
      <>
      <nav className="fixed top-0 w-full flex justify-between  p-4 border-b border-gray-300">
    <h1 className="text-2xl font-bold text-gray-700 font-mono">
      Oceanic Harmony
    </h1>
    <div className="flex gap-4">
      <button className=" text-gray-500 hover:underline " onClick={() => navigate('/login')}>
        Log In
      </button>
      <button className=" text-gray-500 hover:underline" onClick={() => navigate('/signup')}>
        Sign Up
      </button>
    </div>
  </nav>
        <div className="card">
        <img src={'/logoWave.png'} className= 'h-40 p-4 mx-auto' alt="Oceanic Harmony logo" />
  
          <p className=' p-5 font-mono'>
          Oceanic Harmony is a space for self-discovery and growth. It helps you tap into your strengths, organize your thoughts, and level up in life. Think of it as a mix of introspective challenges and guidance to bring out your best self and turn your dreams into action.
          </p>
          <section className="text-center mt-8">
    <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
      See Challenges
    </button>
  </section>
        </div>
        
      </>
    )
  }

  export default Home