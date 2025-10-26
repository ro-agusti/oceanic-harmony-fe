import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import UserNav from "./UserNav";
import AdminNav from "../admin/AdminNav";
import QuestionResponse from "./QuestionResponse";

const API_URL = import.meta.env.VITE_API_URL;

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

  // const handleInputChange = (questionId: string, value: string) => {
  //   setAnswers((prev) => ({ ...prev, [questionId]: value }));
  // };

  // const handleSubmit = async (questionId: string, selectedOptionId?: string) => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     navigate("/login");
  //     return;
  //   }

  //   const responseValue = selectedOptionId || answers[questionId];
  //   if (!responseValue) return;

  //   try {
  //     const res = await fetch(`${API_URL}/api/user-responses/${userChallengeId}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         questionId,
  //         responseText: !selectedOptionId ? responseValue : undefined,
  //         selectedOptionId: selectedOptionId || undefined,
  //       }),
  //     });

  //     if (!res.ok) throw new Error("Failed to submit response");

  //     setResponses((prev) =>
  //       prev.map((r) =>
  //         r.questionId === questionId ? { ...r, answer: responseValue } : r
  //       )
  //     );

  //     if (!selectedOptionId) setAnswers((prev) => ({ ...prev, [questionId]: "" }));

  //     // Avanzar al siguiente
  //     if (currentIndex < responses.length - 1) {
  //       setDirection(1);
  //       setCurrentIndex((prev) => prev + 1);
  //     }
  //   } catch (err) {
  //     console.error("Error submitting response:", err);
  //   }
  // };

  if (loading) return <p className="p-6 text-center">Loading responses...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;
  if (responses.length === 0) return <p className="p-6 text-center">No responses yet.</p>;

  const currentResponse = responses[currentIndex];

  // const variants = {
  //   enter: (direction: number) => ({
  //     x: direction > 0 ? 300 : -300,
  //     opacity: 0,
  //   }),
  //   center: { x: 0, opacity: 1 },
  //   exit: (direction: number) => ({
  //     x: direction > 0 ? -300 : 300,
  //     opacity: 0,
  //   }),
  // };

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

      {/* Pregunta actual animada */}
      <div className="max-w-5xl mx-auto px-6">
 <AnimatePresence custom={direction} initial={false}>
  <QuestionResponse
    key={currentIndex} // importante: usar índice para que AnimatePresence funcione sin perder foco
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

      {/* <div className="max-w-5xl mx-auto px-6">
        <AnimatePresence custom={direction}>
          <motion.div
            key={currentResponse.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="border p-4 rounded-lg shadow-sm bg-[#fbf7f1]"
          >
            <p className="font-semibold mb-2">{currentResponse.question}</p>

            {currentResponse.answer !== null ? (
              <p className="text-gray-700">{currentResponse.answer}</p>
            ) : currentResponse.questionType === "multiple-choice" ? (
              <div className="flex flex-col gap-2 mt-2">
                {currentResponse.options?.map((opt) => (
                  <button
                    key={opt.id}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => handleSubmit(currentResponse.questionId, opt.id)}
                  >
                    {opt.optionText || opt.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Write your answer..."
                  className="p-2 border rounded w-full bg-inherit"
                  value={answers[currentResponse.questionId] || ""}
                  onChange={(e) =>
                    handleInputChange(currentResponse.questionId, e.target.value)
                  }
                />
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  onClick={() => handleSubmit(currentResponse.questionId)}
                >
                  Next
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div> */}
    </div>
  );
}
