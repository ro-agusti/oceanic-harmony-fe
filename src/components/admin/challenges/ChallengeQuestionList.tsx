// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { Pencil, Trash2, PlusCircle, Save, X , Circle, Check } from "lucide-react";
// import AdminNav from "../AdminNav";
// import ChallengeSumary from "./ChallengeSummary"; 

// interface Question {
//   id: string;
//   text: string;
//   description: string;
//   responseType: string;
// }
// interface SelectedQuestion extends Question {
//   week: number;
//   day: number;
//   questionCategory: "daily" | "daily-reflection" | "weekly-reflection" | "challenge-reflection";
// }
// interface ChallengeQuestion {
//   week: number;
//   day: number;
//   questionCategory: "daily" | "daily-reflection" | "weekly-reflection" | "challenge-reflection";
//   Question: Question;
// }
// interface FullChallenge {
//   title: string;
//   days: number;
//   ChallengeQuestions?: ChallengeQuestion[];
// }

// function ChallengeQuestionList() {
//   const [challenge, setChallenge] = useState<FullChallenge | null>(null);
//   const { challengeId } = useParams<{ challengeId: string }>();
//   const navigate = useNavigate();
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [selected, setSelected] = useState<Record<string, SelectedQuestion>>({});
//   const [editingId, setEditingId] = useState<string | null>(null);

//   const [allQuestions, setAllQuestions] = useState<Question[]>([]);
//   const [newSelections, setNewSelections] = useState<Record<string, { week: number; day: number; questionCategory: SelectedQuestion["questionCategory"] }>>({});

//   const [backup, setBackup] = useState<Record<string, SelectedQuestion>>({});

// useEffect(() => {
//   const token = localStorage.getItem("token");
//   if (!token || !challengeId) return;

//   fetch(`http://localhost:3000/api/challenge-questions/${challengeId}`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   })
//     .then(res => res.json())
//     .then(data => {
//       const { challenge } = data;

//       if (!challenge || !Array.isArray(challenge.ChallengeQuestions)) {
//         setChallenge(null);
//         setQuestions([]);
//         setSelected({});
//         return;
//       }

//       setChallenge(challenge);

//       const questionList: Question[] = challenge.ChallengeQuestions
//         .filter((cq: ChallengeQuestion) => cq.Question)
//         .map((cq: ChallengeQuestion) => cq.Question);

//       setQuestions(questionList);

//       const preselected: Record<string, SelectedQuestion> = {};
//       challenge.ChallengeQuestions.forEach((cq: ChallengeQuestion) => {
//         if (cq.Question) {
//           preselected[cq.Question.id] = {
//             id: cq.Question.id,
//             text: cq.Question.text,
//             description: cq.Question.description,
//             responseType: cq.Question.responseType,
//             week: cq.week,
//             day: cq.day,
//             questionCategory: cq.questionCategory,
//           };
//         }
//       });

//       setSelected(preselected);
//     })
//     .catch(err => {
//       console.error("Error fetching challenge questions:", err);
//       setChallenge(null);
//       setQuestions([]);
//       setSelected({});
//     });
// }, [challengeId]);

// useEffect(() => {
//   const fetchAllQuestions = async () => {
//     const token = localStorage.getItem("token");

//     try {
//       const res = await fetch("http://localhost:3000/api/questions", {
//       method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//         },
//       });

//       if (!res.ok) {
//         const text = await res.text(); // Para depurar mejor
//         console.error("Fetch failed:", res.status, text);
//         throw new Error(`Error: ${res.status}`);
//       }

//       const data = await res.json();
//       console.log("Error:", data);
//       if (Array.isArray(data)) {
//         setAllQuestions(data);
//       } else if (Array.isArray(data.questions)) {
//         setAllQuestions(data.questions); // <-- en caso de que venga con propiedad "questions"
//       } else {
//         console.error("Unexpected data format:", data);
//         setAllQuestions([]);
//       }
//     } catch (error) {
//       console.error("Error fetching questions:", error);
//       setAllQuestions([]);
//     }
//   };

//   fetchAllQuestions();
// }, []);

// const weeks = challenge ? Math.ceil(challenge.days / 7) : 0;
// const dailyCount = Object.values(selected).filter(q => q.questionCategory === "daily").length;
// const dailyReflectionCount = Object.values(selected).filter(q => q.questionCategory === "daily-reflection").length;
// const weeklyReflectionCount = Object.values(selected).filter(q => q.questionCategory === "weekly-reflection").length;
// const challengeReflectionCount = Object.values(selected).filter(q => q.questionCategory === "challenge-reflection").length;
// const totalSelected = Object.keys(selected).length;
// const expectedTotal = challenge
//   ? challenge.days * 2 + weeks + 1
//   : 0;
// const maxDaily = challenge ? challenge.days : 0;
// const maxDailyReflection = challenge ? challenge.days : 0;
// const maxWeeklyReflection = weeks;
// const maxChallengeReflection = 1;

//   const handleChange = (id: string, field: keyof SelectedQuestion, value: any) => {
//   setSelected(prev => {
//     const updated = { ...prev };
//     const current = updated[id];

//     // Validar límites si se cambia la categoría
//     if (field === "questionCategory") {
//       const newCategory = value as SelectedQuestion["questionCategory"];

//       const categoryCounts = {
//         daily: dailyCount,
//         "daily-reflection": dailyReflectionCount,
//         "weekly-reflection": weeklyReflectionCount,
//         "challenge-reflection": challengeReflectionCount,
//       };

//       const categoryMax = {
//         daily: maxDaily,
//         "daily-reflection": maxDailyReflection,
//         "weekly-reflection": maxWeeklyReflection,
//         "challenge-reflection": maxChallengeReflection,
//       };

//       // Solo sumar si la nueva categoría es distinta de la actual
//       if (current.questionCategory !== newCategory && categoryCounts[newCategory] >= categoryMax[newCategory]) {
//         alert(`You have already reached the maximum allowed for "${newCategory}": ${categoryMax[newCategory]}`);
//         return prev; // no actualiza
//       }
//     }

//     // Actualizar normalmente
//     if (field === "day") {
//   const intValue = parseInt(value);
//   const newDay = isNaN(intValue) ? current.day : intValue;
//   const newWeek = Math.ceil(newDay / 7);

//   updated[id] = {
//     ...current,
//     day: newDay,
//     week: newWeek,
//   };
// }
//     // updated[id] = {
//     //   ...current,
//     //   [field]: field === "week" || field === "day" ? parseInt(value) : value,
//     // };

//     return updated;
//   });
// };

// const handleSubmit = async () => {
//   const token = localStorage.getItem("token");

//   const newQuestions = Object.entries(newSelections).map(([questionId, val]) => ({
//     questionId,
//     week: val.week,
//     day: val.day,
//     questionCategory: val.questionCategory,
//   }));

//   if (newQuestions.length === 0) {
//     toast.error("⚠ No new questions selected to save.");
//     return;
//   }

//   try {
//     const response = await fetch("http://localhost:3000/api/challenge-questions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         challengeId,
//         questions: newQuestions,
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("POST failed:", errorText);
//       toast.error("❌ Error saving new questions");
//       return;
//     }

//     // Actualizar la UI: agregar las nuevas preguntas a selected y questions
//     setSelected(prev => {
//       const updated = { ...prev };
//       newQuestions.forEach(nq => {
//         const originalQuestion = allQuestions.find(q => q.id === nq.questionId);
//         if (originalQuestion) {
//           updated[nq.questionId] = {
//             ...originalQuestion,
//             week: nq.week,
//             day: nq.day,
//             questionCategory: nq.questionCategory,
//           };
//         }
//       });
//       return updated;
//     });

//     setQuestions(prev => {
//       const updated = [...prev];
//       newQuestions.forEach(nq => {
//         if (!prev.some(q => q.id === nq.questionId)) {
//           const originalQuestion = allQuestions.find(q => q.id === nq.questionId);
//           if (originalQuestion) updated.push(originalQuestion);
//         }
//       });
//       return updated;
//     });

//     setNewSelections({}); // limpiar selección temporal
//     toast.success("✅ Questions saved successfully!");

//   } catch (error) {
//     console.error("Save error:", error);
//     toast.error("❌ Failed to save challenge questions");
//   }
// };

// const handleUpdate = async (id: string) => {
//   const token = localStorage.getItem("token");
//   const q = selected[id];
//   const calculateWeek = (day: number) => Math.ceil(day / 7);

//   console.log("Updating question with data:", {
//   week: calculateWeek,
//   day: q.day,
//   questionCategory: q.questionCategory,
// });

//   try {
    
//     const res = await fetch(`http://localhost:3000/api/challenge-questions/${challengeId}/${id}`, {
//       method: "PUT",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         week: calculateWeek,
//         day: q.day,
//         questionCategory: q.questionCategory,
//       }),
//     });

//         const resText = await res.text();
//     console.log("PUT response:", res.status, resText);

//     if (!res.ok) throw new Error("Error updating question");
//     alert("Question updated!");
//     setEditingId(null);
//   } catch (err) {
//     console.error("Update error:", err);
//     alert("Failed to update question");
//   }
// };

// const handleDelete = async (id: string) => {
//   const token = localStorage.getItem("token");

//   try {
//     const res = await fetch(`http://localhost:3000/api/challenge-questions/${challengeId}/${id}`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const resText = await res.text();
//     console.log("Delete response:", res.status, resText);

//     if (!res.ok) throw new Error(resText);

//     const newSelection = { ...selected };
//     delete newSelection[id];
//     setSelected(newSelection);

//     alert("Question removed from challenge");
//   } catch (err) {
//     console.error("Delete error:", err);
//     alert("Failed to remove question");
//   }
// };

// const handleCancel = (id: string) => {
//   const previous = backup[id];
//   if (previous) {
//     setSelected(prev => ({
//       ...prev,
//       [id]: previous,
//     }));

//     setBackup(prev => {
//       const copy = { ...prev };
//       delete copy[id];
//       return copy;
//     });
//   }
//   setEditingId(null);
// };

// const unselectedQuestions = allQuestions.filter(q => !selected[q.id]);

//   return (
//      <>
//       <AdminNav />
//       <div className="flex flex-col md:flex-row mt-20 p-6 gap-6">
//   {challenge && (
//   <ChallengeSumary
//     title={challenge.title}
//     days={challenge.days}
//     weeks={weeks}
//     dailyCount={dailyCount}
//     dailyReflectionCount={dailyReflectionCount}
//     weeklyReflectionCount={weeklyReflectionCount}
//     challengeReflectionCount={challengeReflectionCount}
//     totalSelected={totalSelected}
//     expectedTotal={expectedTotal}
//   />
// )}

//   <div className="">
//     {questions.length === 0 && (
//         <p className="text-gray-500 ">No questions found. Try adding new ones.</p>
//       )}
//       <div className="">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl text-left font-bold text-gray-700 font-mono mb-5">Challenge Questions</h2>
//         <div className="flex">
//        <div className="relative group">
//   <button
//     onClick={() => navigate(`/admin/questions/${challengeId}/select-questions`)}
//     className="text-gray-500 hover:text-gray-400"
//   >
//     <PlusCircle size={25} />
//   </button>
//   <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-xs px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
//     Add question
//   </div>
// </div>

//         <div className="relative group flex items-center">
//   {/* <button
//     onClick={handleSubmit}
//     className="text-gray-500 hover:text-gray-400"
//   >
//     <Save size={25} />
//   </button> */}

//   <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-xs px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
//     Save selection
//   </div>
//         </div>
//       </div>
//   </div>
//    </div>
  

//       <ul className="space-y-4">
//   {questions
//     .filter(q => selected[q.id]) // Solo seleccionadas
//     .sort((a, b) => (selected[a.id].day || 0) - (selected[b.id].day || 0)) // Ordenar por día
//     .map((q, index) => {
//       const isSelected = selected[q.id] !== undefined;
//       const data = selected[q.id];

//       return (
//         <li key={q.id} className="border-b font-mono p-1">
//           <div className="flex items-center gap-5">
//             {/* 🔘 Círculo con número de orden */}
//             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 text-gray-700 font-semibold flex items-center justify-center select-none">
//               {index + 1}
//             </div>

//             <div className="text-left flex flex-col">
//               <p className="font-semibold text-gray-700">{q.text}</p>
//               <p className="text-sm text-gray-500">{q.description}</p>
//               <p className="text-xs text-gray-400">Response Type: {q.responseType}</p>
//             </div>
//           </div>

//           {isSelected && (
//             <>
//               {editingId === q.id ? (
//                 <div className="p-2 mt-2 flex flex-col items-center text-sm">
//                   <div className="flex flex-col gap-3 w-full max-w-xs">
//                     <div className="flex flex-col">
//                       <label className="text-left text-sm font-mono text-gray-600">Day</label>
//                       <input
//                         type="number"
//                         min="1"
//                         value={data.day}
//                         onChange={e => handleChange(q.id, "day", e.target.value)}
//                         className="border bg-inherit p-2 font-mono border-gray-300 rounded"
//                       />
//                     </div>
//                     <div className="flex flex-col">
//                       <label className="text-left text-sm font-mono text-gray-600">Question Category</label>
//                       <select
//                         value={data.questionCategory}
//                         onChange={e => handleChange(q.id, "questionCategory", e.target.value)}
//                         className="border bg-inherit p-2 font-mono border-gray-300 rounded"
//                       >
//                         <option value="daily">daily</option>
//                         <option value="daily-reflection">daily-reflection</option>
//                         <option value="weekly-reflection">weekly-reflection</option>
//                         <option value="challenge-reflection">challenge-reflection</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="flex gap-2 mt-4">
//                     <button
//                       onClick={() => handleUpdate(q.id)}
//                       className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 flex items-center gap-2"
//                     >
//                       <Save size={16} /> Save
//                     </button>
//                     <button
//                       onClick={() => handleCancel(q.id)}
//                       className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 flex items-center gap-2"
//                     >
//                       <X size={16} /> Cancel
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
//                   <p className="text-left">
//                     <span className="font-semibold">Week:</span> {data.week} |{" "}
//                     <span className="font-semibold">Day:</span> {data.day} |{" "}
//                     <span className="font-semibold">Category:</span> {data.questionCategory}
//                   </p>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => {
//                         setBackup(prev => ({ ...prev, [q.id]: { ...data } }));
//                         setEditingId(q.id);
//                       }}
//                       className="p-1 text-gray-600 hover:text-gray-800"
//                     >
//                       <Pencil size={18} />
//                     </button>
//                     <button
//                       onClick={() => handleDelete(q.id)}
//                       className="p-1 text-gray-600 hover:text-gray-800"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </li>
//       );
//     })}
// </ul>

      

      
//     </div>
// </div>
  
//   </>);
  
// }

// export default ChallengeQuestionList;
