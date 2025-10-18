import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNav from "./UserNav";
import AdminNav from "../admin/AdminNav";

const API_URL = import.meta.env.VITE_API_URL;

interface Challenge {
  id: string;
  title: string;
  description: string;
  days: number;
  price: string;
  userChallengeId: string;
  status: "not-started" | "in-progress" | "completed";
}

interface Question {
  id: string;
  text: string;
}

export default function MyChallenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
  const [questionsByChallenge, setQuestionsByChallenge] = useState<Record<string, Question[]>>({});
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      setRole(payload.role === "admin" ? "admin" : "user");
    } catch (err) {
      console.error("Error decoding token:", err);
      navigate("/login");
      return;
    }

    const fetchUserChallenges = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user-challenges`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user challenges");

        const data = await res.json();
        if (Array.isArray(data)) {
          setChallenges(
            data.map((uc: any) => ({
              ...uc.Challenge,
              userChallengeId: uc.id,
              status: uc.status,
            }))
          );
        } else {
          setChallenges(data.challenges || []);
        }
      } catch (err) {
        console.error("Error fetching user challenges:", err);
        setError("Could not load challenges.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserChallenges();
  }, [navigate]);

  const toggleExpand = async (challengeId: string) => {
  if (expandedChallengeId === challengeId) {
    setExpandedChallengeId(null);
    return;
  }

  setExpandedChallengeId(challengeId);

  if (!questionsByChallenge[challengeId]) {
    const token = localStorage.getItem("token");
    setLoadingQuestions((prev) => ({ ...prev, [challengeId]: true }));

    try {
      const res = await fetch(`${API_URL}/api/challenge-questions/${challengeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch questions");

      const data = await res.json();

      // Ordenar por week y day
      const sortedQuestions = (data.challenge?.ChallengeQuestions || [])
        .sort((a: any, b: any) => {
          if (a.week !== b.week) return a.week - b.week;
          return a.day - b.day;
        })
        .map((cq: any) => ({
          id: cq.Question.id,
          text: cq.Question.text,
        }));

      setQuestionsByChallenge((prev) => ({
        ...prev,
        [challengeId]: sortedQuestions,
      }));
    } catch (err) {
      console.error(`Error fetching questions for challenge ${challengeId}:`, err);
      setQuestionsByChallenge((prev) => ({ ...prev, [challengeId]: [] }));
    } finally {
      setLoadingQuestions((prev) => ({ ...prev, [challengeId]: false }));
    }
  }
};

  // const toggleExpand = async (challengeId: string) => {
  //   if (expandedChallengeId === challengeId) {
  //     setExpandedChallengeId(null);
  //     return;
  //   }

  //   setExpandedChallengeId(challengeId);

  //   // Si no tenemos preguntas cargadas, hacer fetch
  //   if (!questionsByChallenge[challengeId]) {
  //     const token = localStorage.getItem("token");
  //     setLoadingQuestions((prev) => ({ ...prev, [challengeId]: true }));
  //     try {
  //       const res = await fetch(`http://localhost:3000/api/challenge-questions/${challengeId}`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       if (!res.ok) throw new Error("Failed to fetch questions");

  //       const data = await res.json();

  //       // Extraer Question.text de cada ChallengeQuestions
  //       const questions: Question[] = (data.challenge?.ChallengeQuestions || []).map(
  //         (cq: any) => ({
  //           id: cq.Question.id,
  //           text: cq.Question.text,
  //         })
  //       );

  //       setQuestionsByChallenge((prev) => ({
  //         ...prev,
  //         [challengeId]: questions,
  //       }));
  //     } catch (err) {
  //       console.error(`Error fetching questions for challenge ${challengeId}:`, err);
  //       setQuestionsByChallenge((prev) => ({
  //         ...prev,
  //         [challengeId]: [],
  //       }));
  //     } finally {
  //       setLoadingQuestions((prev) => ({ ...prev, [challengeId]: false }));
  //     }
  //   }
  // };

  if (loading) return <p className="p-6 text-center">Loading your challenges...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <>
      {role === "admin" ? <AdminNav /> : <UserNav />}

      <div className="max-w-5xl w-full mx-auto p-6 mt-24 font-mono">
        <h1 className="text-2xl font-bold text-gray-700 mb-6 text-left">
          My Challenges
        </h1>

        {challenges.length === 0 ? (
          <p className="text-gray-600">You haven't joined any challenges yet.</p>
        ) : (
          <ul className="flex flex-col gap-6">
            {challenges.map((challenge) => (
              <li
                key={challenge.id}
                className={`bg-[#fbf7f1] p-6 rounded shadow-sm transition-all duration-300 cursor-pointer
                  ${expandedChallengeId === challenge.id ? "bg-[#e9e3d9] p-8" : "hover:bg-[#e9e3d9]"}`}
                onClick={() => toggleExpand(challenge.id)}
              >
                <div className="flex items-center justify-between font-mono">
                  <h2 className="text-lg font-bold lowercase text-gray-700">{challenge.title}</h2>
                  
                </div>

                <p className="mt-3 text-sm text-gray-500 text-left">{challenge.description}</p>

                <div className="flex justify-between items-center mt-3 text-sm text-gray-600 font-mono">
                  <p>days {challenge.days}</p>
                  <p className="text-gray-500 font-semibold">{challenge.status}</p>
                </div>

                {expandedChallengeId === challenge.id && (
                  <div className="mt-4">
                    {loadingQuestions[challenge.id] ? (
                      <p className="mb-4 text-sm text-gray-500">Loading questions...</p>
                    ) : questionsByChallenge[challenge.id] &&
                      questionsByChallenge[challenge.id].length > 0 ? (
                      <ul className="mb-4 pl-4 text-sm text-gray-500 list-disc">
                        {questionsByChallenge[challenge.id].map((q) => (
                          <li className=" text-left"
                          key={q.id}>{q.text}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mb-4 text-sm text-gray-500">No questions available.</p>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/challenge-responses/${challenge.userChallengeId}`, {
                          state: { challengeTitle: challenge.title },
                        });
                      }}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                      View Responses
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
