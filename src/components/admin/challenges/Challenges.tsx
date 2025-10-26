import AdminNav from "../AdminNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Trash2,
  PlusCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

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
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));

      if (user.role === "admin") {
        setIsAdmin(true);

        const fetchChallenges = async () => {
          try {
            const response = await fetch(`${API_URL}/api/challenge`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) throw new Error("Error al obtener challenges");

            const data = await response.json();
            const challengesData = data.challenges || [];

            const challengesWithQuestions = await Promise.all(
              challengesData.map(async (challenge: Challenge) => {
                try {
                  const questionsResponse = await fetch(
                    `${API_URL}/api/challenge-questions/${challenge.id}`,
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
                    ChallengeQuestions: questionsData.challenge?.ChallengeQuestions || [],
                  };
                } catch (error) {
                  console.error(`Error fetching questions for challenge ${challenge.id}:`, error);
                  return { ...challenge, ChallengeQuestions: [] };
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
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      navigate("/login");
    }
  }, [navigate]);

  const handleCreateChallenge = () => navigate("/admin/create-challenge");
  const handleAssignQuestions = (id: string) => navigate(`/admin/challenge-manager/${id}`);
  const handleEdit = (id: string) => navigate(`/admin/edit-challenge/${id}`);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este challenge?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/challenge/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Error al eliminar challenge");

      setChallenges((prev) => prev.filter((ch) => ch.id !== id));
    } catch (error) {
      console.error("Error deleting challenge:", error);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedChallengeId(expandedChallengeId === id ? null : id);
  };

  const toggleActive = async (id: string, newState: boolean) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/challenge/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: newState }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Error updating challenge");
      }

      setChallenges((prev) =>
        prev.map((ch) => (ch.id === id ? { ...ch, active: newState } : ch))
      );
    } catch (error) {
      console.error("Error updating active state:", error);
    }
  };

  return isAdmin ? (
    <div className="min-h-screen bg-[#fbf7f1] text-gray-700">
      <header>
        <AdminNav />
      </header>

      <main className="p-4 sm:p-6 max-w-5xl mx-auto mt-20">
        {/* Header */}
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
                {/* IZQUIERDA */}
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

                {/* DERECHA */}
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
  ) : null;
}

export default Challenges;

// import AdminNav from "../AdminNav";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Pencil,
//   Trash2,
//   PlusCircle,
//   CheckCircle,
//   XCircle,
// } from "lucide-react";

// const API_URL = import.meta.env.VITE_API_URL;

// interface Challenge {
//   id: string;
//   title: string;
//   description: string;
//   price: string;
//   days: number;
//   active: boolean;
//   createdAt: string;
//   updatedAt: string;
//   ChallengeQuestions: {
//     week: number;
//     day: number;
//     questionCategory: string;
//     Question: {
//       id: string;
//       text: string;
//       description: string;
//       responseType: string;
//       MultipleChoiceOptions: { id: string; optionText: string }[];
//     };
//   }[];
// }

// function Challenges() {
//   const navigate = useNavigate();
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [challenges, setChallenges] = useState<Challenge[]>([]);
//   const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
//   const [hoveredButtonId, setHoveredButtonId] = useState<string | null>(null);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     try {
//       const user = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));

//       if (user.role === "admin") {
//         setIsAdmin(true);

//         const fetchChallenges = async () => {
//           try {
//             const response = await fetch(`${API_URL}/api/challenge`, {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             });

//             if (!response.ok) throw new Error("Error al obtener challenges");

//             const data = await response.json();
//             const challengesData = data.challenges || [];

//             const challengesWithQuestions = await Promise.all(
//               challengesData.map(async (challenge: Challenge) => {
//                 try {
//                   const questionsResponse = await fetch(
//                     `${API_URL}/api/challenge-questions/${challenge.id}`,
//                     {
//                       headers: {
//                         Authorization: `Bearer ${token}`,
//                         "Content-Type": "application/json",
//                       },
//                     }
//                   );
//                   if (!questionsResponse.ok) throw new Error("Error al obtener preguntas");
//                   const questionsData = await questionsResponse.json();

//                   return {
//                     ...challenge,
//                     ChallengeQuestions: questionsData.challenge?.ChallengeQuestions || [],
//                   };
//                 } catch (error) {
//                   console.error(`Error fetching questions for challenge ${challenge.id}:`, error);
//                   return { ...challenge, ChallengeQuestions: [] };
//                 }
//               })
//             );

//             setChallenges(challengesWithQuestions);
//           } catch (error) {
//             console.error("Error fetching challenges:", error);
//           }
//         };

//         fetchChallenges();
//       } else {
//         navigate("/");
//       }
//     } catch (error) {
//       console.error("Error decoding token:", error);
//       navigate("/login");
//     }
//   }, [navigate]);

//   const handleCreateChallenge = () => navigate("/admin/create-challenge");
//   const handleAssignQuestions = (id: string) => navigate(`/admin/challenge-manager/${id}`);
//   const handleEdit = (id: string) => navigate(`/admin/edit-challenge/${id}`);

//   const handleDelete = async (id: string) => {
//     const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este challenge?");
//     if (!confirmDelete) return;

//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`${API_URL}/api/challenge/${id}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) throw new Error("Error al eliminar challenge");

//       setChallenges((prev) => prev.filter((ch) => ch.id !== id));
//     } catch (error) {
//       console.error("Error deleting challenge:", error);
//     }
//   };

//   const toggleExpand = (id: string) => {
//     setExpandedChallengeId(expandedChallengeId === id ? null : id);
//   };

//   const toggleActive = async (id: string, newState: boolean) => {
//     const token = localStorage.getItem("token");
//     try {
//       const response = await fetch(`${API_URL}/api/challenge/${id}`, {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ active: newState }),
//       });

//       if (!response.ok) throw new Error("Error updating challenge");
//       setChallenges((prev) =>
//         prev.map((ch) => (ch.id === id ? { ...ch, active: newState } : ch))
//       );
//     } catch (error) {
//       console.error("Error updating active state:", error);
//     }
//   };

//   return isAdmin ? (
//     <div className="min-h-screen bg-[#fbf7f1] text-gray-700">
//       <header className="sticky top-0 z-10 bg-[#fbf7f1]/95 backdrop-blur-md">
//         <AdminNav />
//       </header>

//       <main className="p-4 sm:p-6 max-w-5xl mx-auto ">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
//           <h1 className="text-xl sm:text-2xl font-bold font-mono">Journals</h1>
//           <button
//             onClick={handleCreateChallenge}
//             className="flex items-center justify-center bg-gray-400 text-gray-200 p-2 rounded-full hover:bg-gray-500 transition w-10 h-10"
//           >
//             <PlusCircle size={22} />
//           </button>
//         </div>

//         {/* Lista */}
//         <ul className="mt-6 space-y-3">
//           {challenges.map((challenge) => (
//             <li
//               key={challenge.id}
//               className={`flex flex-col sm:flex-row justify-between rounded-md shadow-sm transition-all duration-300 cursor-pointer overflow-hidden ${
//                 expandedChallengeId === challenge.id
//                   ? "bg-[#e9e3d9]"
//                   : "bg-[#fbf7f1]"
//               }`}
//             >
//               {/* IZQUIERDA */}
//               <div
//                 className="flex-1 p-3 font-mono hover:bg-[#e9e3d9]"
//                 onClick={() => toggleExpand(challenge.id)}
//               >
//                 <div className="flex items-center justify-between">
//                   <h2 className="text-base sm:text-lg font-bold lowercase">
//                     {challenge.title}
//                   </h2>
//                   {parseFloat(challenge.price) > 0 && (
//                     <p className="text-right font-semibold text-sm sm:text-base">
//                       ${challenge.price}
//                     </p>
//                   )}
//                 </div>

//                 <p className="mt-2 text-sm text-gray-600">{challenge.description}</p>

//                 <div className="flex justify-between items-center text-xs sm:text-sm mt-2">
//                   <h4 className="font-bold lowercase">days {challenge.days}</h4>
//                   <button
//                     className="text-gray-500 hover:text-gray-700 transition"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       toggleExpand(challenge.id);
//                     }}
//                   >
//                     {expandedChallengeId === challenge.id ? "▲" : "▼"}
//                   </button>
//                 </div>

//                 {/* Expandable content */}
//                 {expandedChallengeId === challenge.id && (
//                   <>
//                     {challenge.ChallengeQuestions.length > 0 ? (
//                       <ul className="mt-2 p-2 space-y-1 text-gray-600">
//                         {challenge.ChallengeQuestions.map((q, index) => (
//                           <li key={index} className="text-xs sm:text-sm">
//                             - {q.Question.text}
//                           </li>
//                         ))}
//                       </ul>
//                     ) : (
//                       <p className="text-xs sm:text-sm text-gray-500 mt-2">
//                         No questions available.
//                       </p>
//                     )}

//                     {/* Acciones */}
//                     <div className="flex flex-wrap justify-end mt-2 gap-2">
//                       {!challenge.active ? (
//                         <>
//                           <button
//                             className="text-gray-600 hover:text-gray-400"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleEdit(challenge.id);
//                             }}
//                           >
//                             <Pencil size={16} />
//                           </button>
//                           <button
//                             className="text-gray-600 hover:text-gray-400"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleDelete(challenge.id);
//                             }}
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                           <button
//                             className="text-xs sm:text-sm text-gray-600 hover:underline"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleAssignQuestions(challenge.id);
//                             }}
//                           >
//                             Modify questions
//                           </button>
//                         </>
//                       ) : (
//                         <p className="text-xs text-red-600 font-semibold mt-2">
//                           Journal is active, cannot modify
//                         </p>
//                       )}
//                     </div>
//                   </>
//                 )}
//               </div>

//               {/* DERECHA */}
//               <div className="flex sm:flex-col justify-center items-center px-3 py-2 sm:px-4 bg-[#f8f1e8] border-t sm:border-t-0 sm:border-l">
//                 <button
//                   className={`px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-1 transition-colors duration-200 ${
//                     challenge.active
//                       ? "text-green-900 hover:bg-red-800 hover:text-red-200"
//                       : "text-red-800 hover:bg-green-900 hover:text-green-200"
//                   }`}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     toggleActive(challenge.id, !challenge.active);
//                   }}
//                   onMouseEnter={() => setHoveredButtonId(challenge.id)}
//                   onMouseLeave={() => setHoveredButtonId(null)}
//                 >
//                   {challenge.active
//                     ? hoveredButtonId === challenge.id
//                       ? <XCircle size={28} />
//                       : <CheckCircle size={28} />
//                     : hoveredButtonId === challenge.id
//                       ? <CheckCircle size={28} />
//                       : <XCircle size={28} />}
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </main>
//     </div>
//   ) : null;
// }

// export default Challenges;

// // import AdminNav from "../AdminNav";
// // import { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { Pencil, Trash2, PlusCircle, HelpCircle, ToggleRight, ToggleLeft , CheckCircle, XCircle} from "lucide-react";

// // const API_URL = import.meta.env.VITE_API_URL;

// // interface Challenge {
// //   id: string;
// //   title: string;
// //   description: string;
// //   price: string;
// //   days: number;
// //   active: boolean;
// //   createdAt: string;
// //   updatedAt: string;
// //   ChallengeQuestions: {
// //     week: number;
// //     day: number;
// //     questionCategory: string;
// //     Question: {
// //       id: string;
// //       text: string;
// //       description: string;
// //       responseType: string;
// //       MultipleChoiceOptions: { id: string; optionText: string }[];
// //     };
// //   }[];
// // }

// // function Challenges() {
// //   const navigate = useNavigate();
// //   const [isAdmin, setIsAdmin] = useState(false);
// //   const [challenges, setChallenges] = useState<Challenge[]>([]);
// //   const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
// //   const [hoveredButtonId, setHoveredButtonId] = useState<string | null>(null);

// //   useEffect(() => {
// //     const token = localStorage.getItem("token");

// //     if (!token) {
// //       navigate("/login");
// //       return;
// //     }

// //     try {
// //       const user = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));

// //       if (user.role === "admin") {
// //         setIsAdmin(true);

// //         const fetchChallenges = async () => {
// //           try {
// //             const response = await fetch(`${API_URL}/api/challenge`, {
// //               headers: {
// //                 Authorization: `Bearer ${token}`,
// //                 "Content-Type": "application/json",
// //               },
// //             });

// //             if (!response.ok) throw new Error("Error al obtener challenges");

// //             const data = await response.json();
// //             const challengesData = data.challenges || [];

// //             const challengesWithQuestions = await Promise.all(
// //               challengesData.map(async (challenge: Challenge) => {
// //                 try {
// //                   const questionsResponse = await fetch(
// //                     `${API_URL}/api/challenge-questions/${challenge.id}`,
// //                     {
// //                       headers: {
// //                         Authorization: `Bearer ${token}`,
// //                         "Content-Type": "application/json",
// //                       },
// //                     }
// //                   );

// //                   if (!questionsResponse.ok) throw new Error("Error al obtener preguntas");

// //                   const questionsData = await questionsResponse.json();

// //                   return {
// //                     ...challenge,
// //                     ChallengeQuestions: questionsData.challenge?.ChallengeQuestions || [],
// //                   };
// //                 } catch (error) {
// //                   console.error(`Error fetching questions for challenge ${challenge.id}:`, error);
// //                   return { ...challenge, ChallengeQuestions: [] };
// //                 }
// //               })
// //             );

// //             setChallenges(challengesWithQuestions);
// //           } catch (error) {
// //             console.error("Error fetching challenges:", error);
// //           }
// //         };

// //         fetchChallenges();
// //       } else {
// //         navigate("/");
// //       }
// //     } catch (error) {
// //       console.error("Error decoding token:", error);
// //       navigate("/login");
// //     }
// //   }, [navigate]);

// //   const handleCreateChallenge = () => navigate("/admin/create-challenge");
// //   const handleAssignQuestions = (id: string) => navigate(`/admin/challenge-manager/${id}`);
// //   const handleEdit = (id: string) => navigate(`/admin/edit-challenge/${id}`);

// //   const handleDelete = async (id: string) => {
// //     const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este challenge?");
// //     if (!confirmDelete) return;

// //     try {
// //       const token = localStorage.getItem("token");
// //       const response = await fetch(`${API_URL}/api/challenge/${id}`, {
// //         method: "DELETE",
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //           "Content-Type": "application/json",
// //         },
// //       });

// //       if (!response.ok) throw new Error("Error al eliminar challenge");

// //       setChallenges((prev) => prev.filter((ch) => ch.id !== id));
// //     } catch (error) {
// //       console.error("Error deleting challenge:", error);
// //     }
// //   };

// //   const toggleExpand = (id: string) => {
// //     setExpandedChallengeId(expandedChallengeId === id ? null : id);
// //   };

// //   const toggleActive = async (id: string, newState: boolean) => {
// //   const token = localStorage.getItem("token");
// //   try {
// //     const response = await fetch(`${API_URL}/api/challenge/${id}`, {
// //       method: "PUT", // ahora usamos PUT
// //       headers: {
// //         Authorization: `Bearer ${token}`,
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify({ active: newState }), // solo enviamos el campo que queremos cambiar
// //     });

// //     if (!response.ok) {
// //       const errorData = await response.json();
// //       throw new Error(errorData?.error || "Error updating challenge");
// //     }

// //     // Actualizamos el estado local
// //     setChallenges((prev) =>
// //       prev.map((ch) => (ch.id === id ? { ...ch, active: newState } : ch))
// //     );
// //   } catch (error) {
// //     console.error("Error updating active state:", error);
// //   }
// // };

// //   // const toggleActive = async (id: string, newState: boolean) => {
// //   //   const token = localStorage.getItem("token");
// //   //   try {
// //   //     const response = await fetch(`${API_URL}/api/challenge/${id}`, {
// //   //       method: "PATCH",
// //   //       headers: {
// //   //         Authorization: `Bearer ${token}`,
// //   //         "Content-Type": "application/json",
// //   //       },
// //   //       body: JSON.stringify({ active: newState }),
// //   //     });

// //   //     if (!response.ok) throw new Error("Error al actualizar estado");

// //   //     setChallenges((prev) =>
// //   //       prev.map((ch) =>
// //   //         ch.id === id ? { ...ch, active: newState } : ch
// //   //       )
// //   //     );
// //   //   } catch (error) {
// //   //     console.error("Error updating active state:", error);
// //   //   }
// //   // };

// //   return isAdmin ? (
// //     <div>
// //       <header>
// //         <AdminNav />
// //       </header>
// //     <div className="flex items-center justify-between">
// //           <h1 className="text-2xl font-bold text-gray-700 font-mono">Journals</h1>
// //           <button
// //             onClick={handleCreateChallenge}
// //             className="bg-gray-400 text-gray-300 p-2 rounded hover:bg-gray-500 flex items-center justify-center w-10 h-10"
// //           >
// //             <PlusCircle size={26} />
// //           </button>
// //         </div>
// //       <main className="p-6 max-w-5xl mx-auto">
        

// //         <div className="mt-6 w-full">
// //           <ul>
// //             {challenges.map((challenge) => (
// //               <li
// //   key={challenge.id}
// //   className={`flex justify-between items-stretch m-2 rounded-md shadow-sm transition-all duration-300 cursor-pointer overflow-hidden
// //     ${expandedChallengeId === challenge.id ? "bg-[#e9e3d9]" : "bg-[#fbf7f1]"}`}
// // >
// //   {/* IZQUIERDA - contenido expandible */}
// //   <div
// //     className="flex-1 p-3 font-mono hover:bg-[#e9e3d9]"
// //     onClick={() => toggleExpand(challenge.id)}
// //   >
// //     <div className="flex items-center justify-between">
// //       <h2 className="text-l text-left font-bold lowercase text-gray-700">
// //         {challenge.title}
// //       </h2>
// //       {parseFloat(challenge.price) > 0 && (
// //         <p className="text-right font-semibold">${challenge.price}</p>
// //       )}
// //     </div>

// //     <p className="p-3 text-sm text-left text-gray-500">{challenge.description}</p>

// //     <div className="flex justify-between items-center w-full text-sm text-gray-600">
// //       <h4 className="p-1 text-xs font-bold lowercase">days {challenge.days}</h4>
// //       <button
// //         className="text-xs text-gray-500 hover:text-gray-700 transition"
// //         onClick={(e) => {
// //           e.stopPropagation();
// //           toggleExpand(challenge.id);
// //         }}
// //       >
// //         {expandedChallengeId === challenge.id ? "▲" : "▼"}
// //       </button>
// //     </div>

// //     {expandedChallengeId === challenge.id && (
// //       challenge.ChallengeQuestions.length > 0 ? (
// //         <ul className="mt-2 p-2 text-left">
// //           {challenge.ChallengeQuestions.map((q, index) => (
// //             <li key={index} className="text-xs text-gray-500 p-1">
// //               - {q.Question.text}
// //             </li>
// //           ))}
// //         </ul>
// //       ) : (
// //         <p className="text-xs text-gray-500 mt-2">No questions available.</p>
// //       )
// //     )}

// //     {/* Botones adicionales o mensaje si está activo */}
// //     {expandedChallengeId === challenge.id && (
// //       <div className="flex justify-end mt-2 gap-2">
// //         {!challenge.active ? (
// //           <>
// //             <button
// //               className="px-3 py-1 text-gray-600 hover:text-gray-400"
// //               onClick={(e) => {
// //                 e.stopPropagation();
// //                 handleEdit(challenge.id);
// //               }}
// //             >
// //               <Pencil size={16} />
// //             </button>
// //             <button
// //               className="px-3 py-1 text-gray-600 hover:text-gray-400"
// //               onClick={(e) => {
// //                 e.stopPropagation();
// //                 handleDelete(challenge.id);
// //               }}
// //             >
// //               <Trash2 size={16} />
// //             </button>
// //             <button
// //               className="px-3 py-1 text-gray-600 hover:text-gray-400 hover:underline"
// //               onClick={(e) => {
// //                 e.stopPropagation();
// //                 handleAssignQuestions(challenge.id);
// //               }}
// //             >
// //               Modify questions
// //             </button>
// //           </>
// //         ) : (
// //           <p className="text-xs text-red-600 font-semibold mt-2">
// //             Journal is active, cannot modify
// //           </p>
// //         )}
// //       </div>
// //     )}
// //   </div>

// //   {/* DERECHA - status + botón activo */}
// //   <div className="flex flex-col justify-center items-center px-4 bg-[#f8f1e8] border-l ">
// //     <button
// //   className={`px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-1 transition-colors duration-200 ${
// //     challenge.active
// //       ? "text-green-900 hover:bg-red-800 hover:text-red-200"
// //       : "text-red-800 hover:bg-green-900 hover:text-green-200"
// //   }`}
// //   onClick={(e) => {
// //     e.stopPropagation();
// //     toggleActive(challenge.id, !challenge.active);
// //   }}
// //   onMouseEnter={() => setHoveredButtonId(challenge.id)}
// //   onMouseLeave={() => setHoveredButtonId(null)}
// // >
// //   {challenge.active
// //     ? hoveredButtonId === challenge.id
// //       ? <XCircle size={40} />
// //       : <CheckCircle size={40} />
// //     : hoveredButtonId === challenge.id
// //       ? <CheckCircle size={40} />
// //       : <XCircle size={40} />}
// // </button>
// //     {/* <button
// //       className={`px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-1 ${
// //         challenge.active
// //           ? " text-green-900 hover:bg-red-800 hover:text-red-200"
// //           : " text-red-800 hover:bg-green-900 hover:text-green-200"
// //       }`}
// //       onClick={(e) => {
// //         e.stopPropagation();
// //         toggleActive(challenge.id, !challenge.active);
// //       }}
// //     >
// //       {challenge.active ? <CheckCircle size={40} /> : <XCircle size={40} />}
// //     </button> */}
// //   </div>
// // </li>

// // //               <li
// // //   key={challenge.id}
// // //   className={`flex justify-between items-stretch m-2 rounded-md shadow-sm transition-all duration-300 cursor-pointer overflow-hidden
// // //     ${expandedChallengeId === challenge.id ? "bg-[#e9e3d9]" : "bg-[#fbf7f1] "}`}
// // // >
// // //   {/* IZQUIERDA - contenido expandible */}
// // //   <div
// // //     className="flex-1 p-3 font-mono hover:bg-[#e9e3d9]"
// // //     onClick={() => toggleExpand(challenge.id)}
// // //   >
// // //     <div className="flex items-center justify-between">
// // //       <h2 className="text-l text-left font-bold lowercase text-gray-700">
// // //         {challenge.title}
// // //       </h2>
      
// // //       {parseFloat(challenge.price) > 0 && (
// // //         <p className="text-right font-semibold">${challenge.price}</p>
// // //       )}
// // //     </div>

// // //     <p className="p-3 text-sm text-left text-gray-500">{challenge.description}</p>

// // //     <div className="flex justify-between items-center w-full text-sm text-gray-600">
// // //       <h4 className="p-1 text-xs font-bold lowercase">days {challenge.days}</h4>
// // //       <button
// // //         className="text-xs text-gray-500 hover:text-gray-700 transition"
// // //         onClick={(e) => {
// // //           e.stopPropagation();
// // //           toggleExpand(challenge.id);
// // //         }}
// // //       >
// // //         {expandedChallengeId === challenge.id ? "▲" : "▼"}
// // //       </button>
// // //     </div>

// // //     {expandedChallengeId === challenge.id && (
// // //       challenge.ChallengeQuestions.length > 0 ? (
// // //         <ul className="mt-2 p-2 text-left">
// // //           {challenge.ChallengeQuestions.map((q, index) => (
// // //             <li key={index} className="text-xs text-gray-500 p-1">
// // //               - {q.Question.text}
// // //             </li>
// // //           ))}
// // //         </ul>
// // //       ) : (
// // //         <p className="text-xs text-gray-500 mt-2">No questions available.</p>
// // //       )
// // //     )}

// // //     {/* Botones adicionales solo si está expandido */}
// // //     {expandedChallengeId === challenge.id && (
// // //       <div className="flex justify-end mt-2 gap-2 ">
// // //         {!challenge.active && (
// // //           <>
// // //             <button
// // //               className="px-3 py-1 text-gray-600 hover:text-gray-400"
// // //               onClick={(e) => {
// // //                 e.stopPropagation();
// // //                 handleEdit(challenge.id);
// // //               }}
// // //             >
// // //               <Pencil size={16} />
// // //             </button>
// // //             <button
// // //               className="px-3 py-1 text-gray-600 hover:text-gray-400"
// // //               onClick={(e) => {
// // //                 e.stopPropagation();
// // //                 handleDelete(challenge.id);
// // //               }}
// // //             >
// // //               <Trash2 size={16} />
// // //             </button>
// // //             <button
// // //               className="px-3 py-1 text-gray-600 hover:text-gray-400 hover:underline"
// // //               onClick={(e) => {
// // //                 e.stopPropagation();
// // //                 handleAssignQuestions(challenge.id);
// // //               }}
// // //             >
// // //               Modify questions
// // //             </button>
// // //           </>
// // //         )}
// // //       </div>
// // //     )}
// // //   </div>

// // //   {/* DERECHA - status + botón activo */}
// // //   <div className="flex flex-col justify-center items-center px-4 bg-[#f8f1e8] border-l ">
// // //     {/* <span
// // //       className={`text-xs font-semibold mb-2 ${
// // //         challenge.active ? "text-green-700" : "text-red-700"
// // //       }`}
// // //     >
// // //       {challenge.active ? "Active" : "Inactive"}
// // //     </span> */}
// // //     <button
// // //       className={`px-3 py-1 rounded-md text-sm font-semibold ${
// // //         challenge.active
// // //           ? "bg-gray-400 text-gray-200 hover:bg-red-800"
// // //           : "bg-gray-400 text-gray-200 hover:bg-green-900"
// // //       }`}
// // //       onClick={(e) => {
// // //         e.stopPropagation();
// // //         toggleActive(challenge.id, !challenge.active);
// // //       }}
// // //     >
// // //       {challenge.active ? <CheckCircle size={20} /> : <XCircle size={20} />}
      
// // //     </button>
// // //   </div>
// // // </li>

             
// //             ))}
// //           </ul>
// //         </div>
// //       </main>
// //     </div>
// //   ) : null;
// // }

// // export default Challenges;

