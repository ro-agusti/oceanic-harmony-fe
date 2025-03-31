// import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import Home from './components/Home'
import SignUp from './components/SignUp'
import LogIn from './components/LogIn'
import HomeAdmin from './components/admin/HomeAdmin'
import Challenges from './components/admin/Challenges'
//import Journals from './components/admin/Journals'
//import Questions from './components/admin/Questions'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/admin" element={<HomeAdmin />} />
      <Route path="/admin/challenges" element={<Challenges />} />
      {/* <Route path="/admin" element={<Journals />} />
      <Route path="/admin" element={<Questions />} /> */}
    </Routes>
  )
}

export default App
