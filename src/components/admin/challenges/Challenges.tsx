import AdminNav from "../AdminNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, PlusCircle, CheckCircle, XCircle } from "lucide-react";
import { apiFetch, tokenService, API } from '../../../config/api';

interface Challenge {
  id: string;
  title: string;
  description: string;
  price: string;
  days: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  ChallengeQuestions: {
    week: number;
    day: number;
    questionCategory: string;
    Question: {
      id: string;
      text: string;
      description: string;
      responseType: string;
      MultipleChoiceOptions: { id: string; optionText: string }[];
    };
  }[];
}

function Challenges() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
  const [hoveredButtonId, setHoveredButtonId] = useState<string | null>(null);

  useEffect(() => {
    const user = tokenService.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    setIsAdmin(true);

    const fetchChallenges = async () => {
      try {
        const res = await apiFetch<{ challenges: Challenge[] }>(API.challenges.all);

        if (!res.ok || !res.data) {
          throw new Error((res.data as any)?.message || "Failed to fetch challenges");
        }

        const challengesData = res.data.challenges || [];

        
        const challengesWithQuestions = await Promise.all(
          challengesData.map(async (ch) => {
            try {
              const questionsRes = await apiFetch<{ challenge: { ChallengeQuestions: any[] } }>(
                API.challengeQuestions.byChallenge(ch.id)
              );
              return {
                ...ch,
                ChallengeQuestions: questionsRes.data?.challenge?.ChallengeQuestions || [],
              };
            } catch (err) {
              console.error(`Error fetching questions for challenge ${ch.id}:`, err);
              return { ...ch, ChallengeQuestions: [] };
            }
          })
        );

        setChallenges(challengesWithQuestions);
      } catch (err) {
        console.error("Error fetching challenges:", err);
      }
    };

    fetchChallenges();
  }, [navigate]);

  const handleCreateChallenge = () => navigate("/admin/create-challenge");
  const handleAssignQuestions = (id: string) => navigate(`/admin/challenge-manager/${id}`);
  const handleEdit = (id: string) => navigate(`/admin/edit-challenge/${id}`);

  const handleDelete = async (id: string) => {
  if (!window.confirm("Are you sure you want to delete this challenge?")) return;

  try {
    const res = await apiFetch(API.challenges.byId(id), { method: "DELETE" });

    if (!res.ok) throw new Error((res.data as any)?.message || "Failed to delete challenge");

    setChallenges((prev) => prev.filter((ch) => ch.id !== id));
  } catch (err: any) {
    console.error("Error deleting challenge:", err);
    alert(err.message || "Error deleting challenge");
  }
};

  const toggleExpand = (id: string) => {
    setExpandedChallengeId(expandedChallengeId === id ? null : id);
  };

const toggleActive = async (id: string, newState: boolean) => {
  try {
    const res = await apiFetch(API.challenges.byId(id), {
      method: "PUT",
      body: JSON.stringify({ active: newState }),
    });

    if (!res.ok) throw new Error((res.data as any)?.message || "Failed to update active state");

    setChallenges((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, active: newState } : ch))
    );
  } catch (err: any) {
    console.error("Error updating active state:", err);
    alert(err.message || "Error updating active state");
  }
};


  if (!isAdmin) return null;
 
  return  (
    <div className="min-h-screen bg-[#fbf7f1] text-gray-700">
      <header>
        <AdminNav />
      </header>

      <main className="p-4 sm:p-6 max-w-5xl mx-auto mt-20">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <h1 className="text-2xl font-bold text-gray-700 font-mono">Journals</h1>
          <button
            onClick={handleCreateChallenge}
            className="bg-gray-400 text-gray-300 p-2 rounded hover:bg-gray-500 flex items-center justify-center w-10 h-10"
          >
            <PlusCircle size={26} />
          </button>
        </div>

        <div className="mt-6 w-full">
          <ul>
            {challenges.map((challenge) => (
              <li
                key={challenge.id}
                className={`flex flex-col sm:flex-row justify-between items-stretch m-2 rounded-md shadow-sm transition-all duration-300 cursor-pointer overflow-hidden ${
                  expandedChallengeId === challenge.id
                    ? "bg-[#e9e3d9]"
                    : "bg-[#fbf7f1]"
                }`}
              >
                
                <div
                  className="flex-1 p-3 font-mono hover:bg-[#e9e3d9]"
                  onClick={() => toggleExpand(challenge.id)}
                >
                  <div className="flex items-center justify-between flex-wrap">
                    <h2 className="text-l text-left font-bold lowercase text-gray-700">
                      {challenge.title}
                    </h2>
                    {parseFloat(challenge.price) > 0 && (
                      <p className="text-right font-semibold">${challenge.price}</p>
                    )}
                  </div>

                  <p className="p-3 text-sm text-left text-gray-500">{challenge.description}</p>

                  <div className="flex justify-between items-center w-full text-sm text-gray-600">
                    <h4 className="p-1 text-xs font-bold lowercase">days {challenge.days}</h4>
                    <button
                      className="text-xs text-gray-500 hover:text-gray-700 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(challenge.id);
                      }}
                    >
                      {expandedChallengeId === challenge.id ? "▲" : "▼"}
                    </button>
                  </div>

                  {expandedChallengeId === challenge.id && (
                    challenge.ChallengeQuestions.length > 0 ? (
                      <ul className="mt-2 p-2 text-left">
                        {challenge.ChallengeQuestions.map((q, index) => (
                          <li key={index} className="text-xs text-gray-500 p-1">
                            - {q.Question.text}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500 mt-2">No questions available.</p>
                    )
                  )}

                  {expandedChallengeId === challenge.id && (
                    <div className="flex flex-wrap justify-end mt-2 gap-2">
                      {!challenge.active ? (
                        <>
                          <button
                            className="px-3 py-1 text-gray-600 hover:text-gray-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(challenge.id);
                            }}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="px-3 py-1 text-gray-600 hover:text-gray-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(challenge.id);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            className="px-3 py-1 text-gray-600 hover:text-gray-400 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignQuestions(challenge.id);
                            }}
                          >
                            Modify questions
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-red-600 font-semibold mt-2">
                          Journal is active, cannot modify
                        </p>
                      )}
                    </div>
                  )}
                </div>

                
                <div className="flex sm:flex-col justify-center items-center px-4 py-2 sm:py-0 bg-[#f8f1e8] border-t sm:border-t-0 sm:border-l">
                  <button
                    className={`px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-1 transition-colors duration-200 ${
                      challenge.active
                        ? "text-green-900 hover:bg-red-800 hover:text-red-200"
                        : "text-red-800 hover:bg-green-900 hover:text-green-200"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActive(challenge.id, !challenge.active);
                    }}
                    onMouseEnter={() => setHoveredButtonId(challenge.id)}
                    onMouseLeave={() => setHoveredButtonId(null)}
                  >
                    {challenge.active
                      ? hoveredButtonId === challenge.id
                        ? <XCircle size={40} />
                        : <CheckCircle size={40} />
                      : hoveredButtonId === challenge.id
                        ? <CheckCircle size={40} />
                        : <XCircle size={40} />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

export default Challenges;
