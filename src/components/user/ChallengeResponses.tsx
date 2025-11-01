import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
//import { AnimatePresence } from "framer-motion";
import UserNav from "./UserNav";
import AdminNav from "../admin/AdminNav";
import QuestionResponse from "./QuestionResponse";
import { tokenService, apiFetch, API } from '../../config/api';
import MyChallenges from './MyChallenges';

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
    const user = tokenService.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setRole(user.role === "admin" ? "admin" : "user");
    if (!userChallengeId) return;

    const fetchResponses = async () => {
      try {
        const res = await apiFetch<{ responses: Response[] }>(API.responses.byId(userChallengeId));
        if (!res.ok || !res.data) throw new Error("Failed to fetch responses");

        setResponses(res.data.responses || []);
        setError(null);
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
        
        <div className="flex justify-center gap-2 mb-6 ">
          {responses.map((r, index) => (
            <div
              key={r.id}
              className={`w-6 h-6 rounded-full  cursor-pointer ${
                r.answer ? "bg-[#ccc3b5]" : "bg-white"
              } ${index === currentIndex ? "ring-2 ring-[#ccc3b5]" : ""}`}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      </div>

     
      <div className="max-w-5xl mx-auto px-6">
 <div className="max-w-5xl mx-auto px-6">
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
</div>



</div>
<button type="submit" className="text-m font-mono text-gray-700 mb-4 hover:underline" onClick={() => navigate('/user/my-challenges')}>
  Back to MyChallenges
  </button>
    </div>
  );
}
