// import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import Home from './components/Home'
import SignUp from './components/SignUp'
import LogIn from './components/LogIn'
import HomeAdmin from './components/admin/HomeAdmin'
import Challenges from './components/admin/challenges/Challenges'
import CreateChallenge from './components/admin/challenges/CreateChallenges'
import EditChallenge from './components/admin/challenges/EditChallenge'
import ChallengeManager from './components/admin/challenges/ChallengeManager'
//import ChallengeQuestionList from './components/admin/challenges/ChallengeQuestionList'
// import ChallengeQuestionList from './components/admin/challenges/ChallengeQuestionList'
import SelectQuestionsChallenge from './components/admin/challenges/SelectQuestionChallenge'
import { Toaster } from 'react-hot-toast';

//import Journals from './components/admin/Journals'
//import Questions from './components/admin/Questions'

function App() {
  return (
    <>
     <Toaster position="top-center" reverseOrder={false} />
     
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/admin" element={<HomeAdmin />} />
      <Route path="/admin/challenges" element={<Challenges />} />
      <Route path="/admin/create-challenge" element={<CreateChallenge />} />
      <Route path="/admin/edit-challenge/:challengeId" element={<EditChallenge />} />
      <Route path="/admin/challenge-manager/:challengeId" element={<ChallengeManager />} />
      {/* <Route path="/admin/assign-questions/:challengeId" element={<ChallengeQuestionList />} /> */}
      {/* <Route path="/admin/challenges/:challengeId/select-questions" element={<SelectQuestionsChallenge />} /> */}

      {/* <Route path="/admin" element={<Journals />} />
      <Route path="/admin" element={<Questions />} /> */}
    </Routes>
    </>
  )
}

export default App
