import AdminNav from "../AdminNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, PlusCircle, HelpCircle } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  price: string;
  days: number;
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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Decodificar JWT con mayor compatibilidad
      const user = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));

      if (user.role === "admin") {
        setIsAdmin(true);

        const fetchChallenges = async () => {
          try {
            const response = await fetch("http://localhost:3000/api/challenge", {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) throw new Error("Error al obtener challenges");

            const data = await response.json();
            console.log("Respuesta completa:", data);

            const challengesData = data.challenges || [];

            // Obtener preguntas para cada challenge
            const challengesWithQuestions = await Promise.all(
              challengesData.map(async (challenge: Challenge) => {
                try {
                  const questionsResponse = await fetch(
                    `http://localhost:3000/api/challenge-questions/${challenge.id}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
            
                  if (!questionsResponse.ok) throw new Error("Error al obtener preguntas");
            
                  const questionsData = await questionsResponse.json();
            
                  return { 
                    ...challenge, 
                    ChallengeQuestions: questionsData.challenge?.ChallengeQuestions || []  // Asegurar que sea un array
                  };
                } catch (error) {
                  console.error(`Error fetching questions for challenge ${challenge.id}:`, error);
                  return { ...challenge, ChallengeQuestions: [] }; // Si hay error, devolver un array vacío
                }
              })
            );

            setChallenges(challengesWithQuestions);
          } catch (error) {
            console.error("Error fetching challenges:", error);
          }
        };

        fetchChallenges();
      } else {
        navigate("/");
        return;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      navigate("/login");
      return;
    }
  }, [navigate]);

  const handleCreateChallenge = () => {
    navigate("/admin/create-challenge"); // Ajusta la ruta según tu configuración
  };

  const handleAssignQuestions = (id: string) => {
  navigate(`/admin/challenge-manager/${id}`);
};

  const handleEdit = (id: string) => {
    navigate(`/admin/edit-challenge/${id}`);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este challenge?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:3000/api/challenge/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Error al eliminar challenge");

      setChallenges((prevChallenges) => prevChallenges.filter((challenge) => challenge.id !== id));
    } catch (error) {
      console.error("Error deleting challenge:", error);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedChallengeId(expandedChallengeId === id ? null : id);
  };

  return isAdmin ? (
    <>
      <AdminNav />
      <div className="p-6">
      <div className="flex items-center justify-between mt-20">
  <h1 className="text-2xl font-bold text-gray-700 font-mono">Challenges</h1>
  <button
    onClick={handleCreateChallenge}
    className="bg-gray-400 text-gray-300 p-2 rounded hover:bg-gray-500 flex items-center justify-center w-10 h-10"
  >
    <PlusCircle size={26} />
  </button>
</div>
        {/* <div className="flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-700 font-mono mt-20">Challenges</h1>
        </div> */}

        {/* Listado de Challenges */}
        <div className="mt-6">
          <ul>
            {challenges.map((challenge) => (
              <li
              key={challenge.id}
              className={`bg-[#fbf7f1]  p-2 flex flex-col m-2 shadow-sm transition-all duration-300 cursor-pointer 
                ${expandedChallengeId === challenge.id ? "bg-[#e9e3d9] p-4" : "hover:bg-[#e9e3d9]"}`}
              onClick={() => toggleExpand(challenge.id)}
            >
               <div className="w-full font-mono ">
  <div className="flex items-center justify-between">
    <h2 className="text-l text-left font-bold lowercase text-gray-700">{challenge.title}</h2>
    <button
      className="px-3 py-1 text-right text-gray-600 hover:text-gray-400 flex "
      onClick={() => handleAssignQuestions(challenge.id)}
    >
      <HelpCircle size={16} className="mr-1" /> Modify questions
      
    </button>
  </div>

  <p className="p-3 text-sm text-left text-gray-500">{challenge.description}</p>

  <div className="flex justify-between items-center w-full font-mono text-sm lowercase text-gray-600 ">
    <h4 className="p-1 text-xs font-bold lowercase text-gray-600 text-left">
      days {challenge.days}
    </h4>
    <p className="text-right font-semibold">${challenge.price}</p>
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

  <div className="flex justify-end mt-1">
    <button
      className="px-3 py-1 text-gray-600 mr-2 hover:text-gray-400"
      onClick={() => handleEdit(challenge.id)}
    >
      <Pencil size={16} className="mr-1" />
    </button>
    <button
      className="px-3 py-1 text-gray-600 hover:text-gray-400"
      onClick={() => handleDelete(challenge.id)}
    >
      <Trash2 size={16} className="mr-1" />
    </button>
  </div>
</div>

              </li>
            ))}
          </ul>
        </div>

        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </>
  ) : null;
}

export default Challenges;
