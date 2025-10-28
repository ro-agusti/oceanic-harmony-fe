import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import UserNav from "./UserNav";
import AdminNav from "../admin/AdminNav";
import QuestionResponse from "./QuestionResponse";
import { API_URL } from '../../config/api';

interface Option {
  id: string;
  text: string;
  optionText?: string;
}

interface Response {
  id: string;
  questionId: string;
  question: string;
  answer: string | null;
  questionType?: "text" | "multiple-choice";
  options?: Option[];
  week?: number;
  day?: number;
  questionCategory?: string;
}

export default function ChallengeResponses() {
  const { userChallengeId } = useParams<{ userChallengeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { challengeTitle: initialTitle } = location.state || {};
  const [role, setRole] = useState<"admin" | "user" | null>(null);

  const [challengeTitle, setChallengeTitle] = useState(initialTitle || "Challenge Responses");
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 = next, -1 = prev

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      setRole(payload.role === "admin" ? "admin" : "user");
    } catch (err) {
      console.error("Error decoding token:", err);
      navigate("/login");
      return;
    }
    if (!userChallengeId) return;

    const fetchResponses = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/user-responses/${userChallengeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch responses");

        const data = await res.json();
        setResponses(data.responses || []);
      } catch (err) {
        console.error(err);
        setError("Could not load responses.");
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [navigate, userChallengeId]);

 

  if (loading) return <p className="p-6 text-center">Loading responses...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;
  if (responses.length === 0) return <p className="p-6 text-center">No responses yet.</p>;

  const currentResponse = responses[currentIndex];

 

  return (
    <div className="min-h-screen">
       {role === "admin" ? <AdminNav /> : <UserNav />}

      {/* Título y progreso */}
      <div className="max-w-5xl w-full mx-auto px-6 mt-24">
        <h1 className="text-2xl font-bold text-gray-700 mb-4 font-mono">{challengeTitle}</h1>

        <div className="flex gap-2 mb-6">
          {responses.map((r, index) => (
            <div
              key={r.id}
              className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                r.answer ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"
              } ${index === currentIndex ? "ring-2 ring-blue-400" : ""}`}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      </div>

     
      <div className="max-w-5xl mx-auto px-6">
 <AnimatePresence custom={direction} initial={false}>
  <QuestionResponse
    key={currentIndex} 
    response={currentResponse}
    answerValue={answers[currentResponse.questionId] || ""}
    challengeId={userChallengeId!}
    direction={direction}
    onAnswerSaved={(questionId, answer) => {
      setResponses(prev =>
        prev.map(r =>
          r.questionId === questionId ? { ...r, answer } : r
        )
      );
      setAnswers(prev => ({ ...prev, [questionId]: "" }));

      if (currentIndex < responses.length - 1) {
        setDirection(1);
        setCurrentIndex(currentIndex + 1);
      }
    }}
  />
</AnimatePresence>


</div>

    </div>
  );
}
