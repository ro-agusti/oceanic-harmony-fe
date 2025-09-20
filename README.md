# Oceanic Harmony - Frontend

## Description
Oceanic Harmony is a web application to manage challenges and questions. It allows creating questions, assigning them to challenges, and enabling users to answer questions within each challenge.

## Technologies
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide Icons

## Installation
```bash
git clone https://github.com/ro-agusti/oceanic-harmony-fe.git
cd oceanic-harmony-fe
npm install
Configuration
Create a .env file in the root (optional):
VITE_API_URL=http://localhost:3000/api
Running the App
npm run dev
Open http://localhost:5173 in your browser.
Main Structure
Folder	Content
src/components	Reusable components
src/pages	Main pages
src/routes	React Router routes
src/services	API service functions
src/assets	Images, icons, and styles
Features
Sidebar navigation
View challenges
Create new questions
Assign questions to challenges
List available and selected questions
User response form
Using the API
Configured with Axios pointing to VITE_API_URL. Example:
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getQuestions = async () => {
  const res = await axios.get(`${API_URL}/questions`);
  return res.data;
}