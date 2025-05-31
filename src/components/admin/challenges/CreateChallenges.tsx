import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateChallenge() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [days, setDays] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    // console.log("Token:", token);
    // localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMjY1MDAwMi1mYjU4LTRiOTItOWM4Yi0xYTdmMzUyNWQ3OGQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDg2NjU1MjgsImV4cCI6MTc0ODY2OTEyOH0.3F4C2T4VMOGlAT7smmNv2pXXiPjlyk0dtYmXN83e19k");

    try {
      
      const response = await fetch("http://localhost:3000/api/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, price, days }),
      });

      const data = await response.json();
      console.log("Response del backend:", data);

      if (response.ok) {
        navigate(`/assign-questions/${data.challenge.id}`);  // redirige a la ruta creada arriba
      } else {
        console.error(data.error);
      }
     

      navigate(`/admin/challenges/${data.id}/assign-questions`);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto mt-20">
      <h1 className="text-2xl font-bold text-gray-700 font-mono mb-4">Crear Nuevo Challenge</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 border border-gray-300 rounded"
          required
        />
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 border border-gray-300 rounded"
          required
        />
        <input
          //type="number"
          placeholder="Precio"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="p-2 border border-gray-300 rounded"
          required
        />
        <input
          //type="number"
          placeholder="Cantidad de días"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded"
          required
        />
        <button
          type="submit"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Crear y Asignar Preguntas
        </button>
      </form>
    </div>
  );
}

export default CreateChallenge;


// // src/components/admin/challenges/CreateChallenge.tsx
// import React, { useState, ChangeEvent, FormEvent } from "react";
// import { useNavigate } from "react-router-dom";
// import { Challenge, ChallengeQuestion, Question } from "../types/challenge";


// const CreateChallenge: React.FC = () => {
//   const navigate = useNavigate();

//   const [challenge, setChallenge] = useState<Challenge>({
//     title: "",
//     description: "",
//     days: 21,
//   });

//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [challengeQuestions, setChallengeQuestions] = useState<ChallengeQuestion[]>([]);

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setChallenge((prev) => ({
//       ...prev,
//       [name]: name === "duration" ? parseInt(value) : value,
//     }));
//   };

//   const handleAddQuestion = () => {
//     const newQuestion: Question = {
//       id: crypto.randomUUID(),
//       text: "",
//       description: "",
//       responseType: "text",
//       allowCustomText: false,
//     };
//     setQuestions((prev) => [...prev, newQuestion]);
//   };

//   const handleQuestionChange = (
//     id: string,
//     field: keyof Question,
//     value: string | boolean
//   ) => {
//     setQuestions((prev) =>
//       prev.map((q) =>
//         q.id === id ? { ...q, [field]: value } : q
//       )
//     );
//   };

//   const handleAddChallengeQuestion = () => {
//     const newCQ: ChallengeQuestion = {
//       questionId: "",
//       week: 1,
//       day: 1,
//       questionCategory: "daily",
//     };
//     setChallengeQuestions((prev) => [...prev, newCQ]);
//   };

//   const handleChallengeQuestionChange = (
//     index: number,
//     field: keyof ChallengeQuestion,
//     value: string | number
//   ) => {
//     setChallengeQuestions((prev) =>
//       prev.map((cq, i) =>
//         i === index ? { ...cq, [field]: value } : cq
//       )
//     );
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();

//     const dataToSubmit = {
//       challenge,
//       questions,
//       challengeQuestions,
//     };

//     try {
//       const response = await fetch("/api/challenges", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(dataToSubmit),
//       });

//       if (!response.ok) {
//         throw new Error("Error al crear el challenge");
//       }

//       const createdChallenge = await response.json();

//       // Luego de crear el challenge, navegamos a la lista de challenges
//       navigate("/admin/challenges");
//     } catch (error) {
//       console.error(error);
//       alert("Ocurrió un error al crear el challenge");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6 p-4 max-w-3xl mx-auto">
//       <h1 className="text-2xl font-bold">Crear nuevo Challenge</h1>

//       <input
//         name="title"
//         placeholder="Título"
//         value={challenge.title}
//         onChange={handleChange}
//         className="w-full p-2 border rounded"
//         required
//       />
//       <textarea
//         name="description"
//         placeholder="Descripción"
//         value={challenge.description}
//         onChange={handleChange}
//         className="w-full p-2 border rounded"
//       />
//       <input
//         name="duration"
//         type="number"
//         placeholder="Duración (días)"
//         value={challenge.duration}
//         onChange={handleChange}
//         className="w-full p-2 border rounded"
//         min={1}
//         required
//       />

//       <h2 className="text-xl font-semibold mt-6">Preguntas</h2>
//       {questions.map((q) => (
//         <div key={q.id} className="p-2 border mb-2 rounded space-y-2">
//           <input
//             placeholder="Texto"
//             value={q.text}
//             onChange={(e) => handleQuestionChange(q.id, "text", e.target.value)}
//             className="w-full p-1 border rounded"
//             required
//           />
//           <textarea
//             placeholder="Descripción"
//             value={q.description}
//             onChange={(e) => handleQuestionChange(q.id, "description", e.target.value)}
//             className="w-full p-1 border rounded"
//           />
//           <select
//             value={q.responseType}
//             onChange={(e) => handleQuestionChange(q.id, "responseType", e.target.value as Question["responseType"])}
//             className="w-full p-1 border rounded"
//           >
//             <option value="text">Texto</option>
//             <option value="multiple-choice">Opción múltiple</option>
//             <option value="multiple-text">Múltiples textos</option>
//           </select>
//           {q.responseType === "multiple-choice" && (
//             <label className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 checked={q.allowCustomText}
//                 onChange={(e) => handleQuestionChange(q.id, "allowCustomText", e.target.checked)}
//               />
//               <span>Permitir respuesta personalizada</span>
//             </label>
//           )}
//         </div>
//       ))}
//       <button type="button" onClick={handleAddQuestion} className="bg-blue-500 text-white px-4 py-2 rounded">
//         + Agregar Pregunta
//       </button>

//       <h2 className="text-xl font-semibold mt-6">Asignar preguntas al challenge</h2>
//       {challengeQuestions.map((cq, index) => (
//         <div key={index} className="p-2 border mb-2 rounded space-y-2">
//           <select
//             value={cq.questionId}
//             onChange={(e) => handleChallengeQuestionChange(index, "questionId", e.target.value)}
//             className="w-full p-1 border rounded"
//             required
//           >
//             <option value="">-- Seleccionar pregunta --</option>
//             {questions.map((q) => (
//               <option key={q.id} value={q.id}>
//                 {q.text}
//               </option>
//             ))}
//           </select>
//           <input
//             type="number"
//             value={cq.day}
//             onChange={(e) => handleChallengeQuestionChange(index, "day", parseInt(e.target.value))}
//             className="w-full p-1 border rounded"
//             placeholder="Día"
//             min={1}
//             required
//           />
//           <select
//             value={cq.questionCategory}
//             onChange={(e) => handleChallengeQuestionChange(index, "questionCategory", e.target.value as QuestionCategory)}
//             className="w-full p-1 border rounded"
//             required
//           >
//             <option value="daily">Diaria</option>
//             <option value="daily-reflection">Reflexión diaria</option>
//             <option value="weekly-reflection">Reflexión semanal</option>
//             <option value="challenge-reflection">Reflexión del challenge</option>
//           </select>
//         </div>
//       ))}
//       <button type="button" onClick={handleAddChallengeQuestion} className="bg-green-500 text-white px-4 py-2 rounded">
//         + Asignar pregunta
//       </button>

//       <div className="pt-4">
//         <button type="submit" className="bg-black text-white px-6 py-2 rounded">
//           Crear Challenge
//         </button>
//       </div>
//     </form>
//   );
// };

// export default CreateChallenge;

// // src/components/admin/CreateChallenge.tsx
// // import { useState } from "react";
// // import { Challenge } from "../types/challenge";

// // const CreateChallenge = ({ onCreated }: { onCreated: (challenge: Challenge) => void }) => {
// //   const [title, setTitle] = useState("");
// //   const [description, setDescription] = useState("");
// //   const [durationInDays, setDurationInDays] = useState(21);

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     const response = await fetch("/api/challenges", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ title, description, durationInDays }),
// //     });
// //     const data = await response.json();
// //     onCreated(data);
// //   };

// //   return (
// //     <form onSubmit={handleSubmit} className="space-y-4">
// //       <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="border p-2 w-full" />
// //       <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="border p-2 w-full" />
// //       <input type="number" placeholder="Duration in days" value={durationInDays} onChange={e => setDurationInDays(parseInt(e.target.value))} className="border p-2 w-full" />
// //       <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Challenge</button>
// //     </form>
// //   );
// // };

// // export default CreateChallenge;


// // import React, { useState, ChangeEvent, FormEvent } from "react";

// // // 🔷 TIPOS DEFINIDOS EN ESTE MISMO ARCHIVO
// // type QuestionCategory = "daily" | "daily-reflection" | "weekly-reflection" | "challenge-reflection";

// // type Question = {
// //   id: string;
// //   text: string;
// //   description?: string;
// //   responseType: "multiple-choice" | "text" | "multiple-text";
// //   allowCustomText: boolean;
// // };

// // type Challenge = {
// //   title: string;
// //   description: string;
// //   duration: number; // in days
// // };

// // type ChallengeQuestion = {
// //   questionId: string;
// //   week: number;
// //   day: number;
// //   questionCategory: QuestionCategory;
// // };

// // // 🔧 COMPONENTE
// // const CreateChallenge: React.FC = () => {
// //   const [challenge, setChallenge] = useState<Challenge>({
// //     title: "",
// //     description: "",
// //     duration: 21,
// //   });

// //   const [questions, setQuestions] = useState<Question[]>([]);
// //   const [challengeQuestions, setChallengeQuestions] = useState<ChallengeQuestion[]>([]);

// //   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
// //     const { name, value } = e.target;
// //     setChallenge((prev) => ({
// //       ...prev,
// //       [name]: name === "duration" ? parseInt(value) : value,
// //     }));
// //   };

// //   const handleAddQuestion = () => {
// //     const newQuestion: Question = {
// //       id: crypto.randomUUID(),
// //       text: "",
// //       description: "",
// //       responseType: "text",
// //       allowCustomText: false,
// //     };
// //     setQuestions((prev) => [...prev, newQuestion]);
// //   };

// //   const handleQuestionChange = (
// //     id: string,
// //     field: keyof Question,
// //     value: string | boolean
// //   ) => {
// //     setQuestions((prev) =>
// //       prev.map((q) =>
// //         q.id === id ? { ...q, [field]: value } : q
// //       )
// //     );
// //   };

// //   const handleAddChallengeQuestion = () => {
// //     const newCQ: ChallengeQuestion = {
// //       questionId: "",
// //       week: 1,
// //       day: 1,
// //       questionCategory: "daily",
// //     };
// //     setChallengeQuestions((prev) => [...prev, newCQ]);
// //   };

// //   const handleChallengeQuestionChange = (
// //     index: number,
// //     field: keyof ChallengeQuestion,
// //     value: string | number
// //   ) => {
// //     setChallengeQuestions((prev) =>
// //       prev.map((cq, i) =>
// //         i === index ? { ...cq, [field]: value } : cq
// //       )
// //     );
// //   };

// //   const handleSubmit = (e: FormEvent) => {
// //     e.preventDefault();

// //     const dataToSubmit = {
// //       challenge,
// //       questions,
// //       challengeQuestions,
// //     };

// //     console.log("📤 Enviando challenge:", dataToSubmit);
// //     // Podés hacer un fetch POST aquí al back con el challenge completo
// //   };

// //   return (
// //     <form onSubmit={handleSubmit} className="space-y-6 p-4 max-w-3xl mx-auto">
// //       <h1 className="text-2xl font-bold">Crear nuevo Challenge</h1>

// //       <input
// //         name="title"
// //         placeholder="Título"
// //         value={challenge.title}
// //         onChange={handleChange}
// //         className="w-full p-2 border rounded"
// //       />
// //       <textarea
// //         name="description"
// //         placeholder="Descripción"
// //         value={challenge.description}
// //         onChange={handleChange}
// //         className="w-full p-2 border rounded"
// //       />
// //       <input
// //         name="duration"
// //         type="number"
// //         placeholder="Duración (días)"
// //         value={challenge.duration}
// //         onChange={handleChange}
// //         className="w-full p-2 border rounded"
// //       />

// //       <h2 className="text-xl font-semibold mt-6">Preguntas</h2>
// //       {questions.map((q) => (
// //         <div key={q.id} className="p-2 border mb-2 rounded space-y-2">
// //           <input
// //             placeholder="Texto"
// //             value={q.text}
// //             onChange={(e) => handleQuestionChange(q.id, "text", e.target.value)}
// //             className="w-full p-1 border rounded"
// //           />
// //           <textarea
// //             placeholder="Descripción"
// //             value={q.description}
// //             onChange={(e) => handleQuestionChange(q.id, "description", e.target.value)}
// //             className="w-full p-1 border rounded"
// //           />
// //           <select
// //             value={q.responseType}
// //             onChange={(e) => handleQuestionChange(q.id, "responseType", e.target.value as Question["responseType"])}
// //             className="w-full p-1 border rounded"
// //           >
// //             <option value="text">Texto</option>
// //             <option value="multiple-choice">Opción múltiple</option>
// //             <option value="multiple-text">Múltiples textos</option>
// //           </select>
// //           {q.responseType === "multiple-choice" && (
// //             <label className="flex items-center space-x-2">
// //               <input
// //                 type="checkbox"
// //                 checked={q.allowCustomText}
// //                 onChange={(e) => handleQuestionChange(q.id, "allowCustomText", e.target.checked)}
// //               />
// //               <span>Permitir respuesta personalizada</span>
// //             </label>
// //           )}
// //         </div>
// //       ))}
// //       <button type="button" onClick={handleAddQuestion} className="bg-blue-500 text-white px-4 py-2 rounded">
// //         + Agregar Pregunta
// //       </button>

// //       <h2 className="text-xl font-semibold mt-6">Asignar preguntas al challenge</h2>
// //       {challengeQuestions.map((cq, index) => (
// //         <div key={index} className="p-2 border mb-2 rounded space-y-2">
// //           <select
// //             value={cq.questionId}
// //             onChange={(e) => handleChallengeQuestionChange(index, "questionId", e.target.value)}
// //             className="w-full p-1 border rounded"
// //           >
// //             <option value="">-- Seleccionar pregunta --</option>
// //             {questions.map((q) => (
// //               <option key={q.id} value={q.id}>
// //                 {q.text}
// //               </option>
// //             ))}
// //           </select>
// //           <input
// //             type="number"
// //             value={cq.day}
// //             onChange={(e) => handleChallengeQuestionChange(index, "day", parseInt(e.target.value))}
// //             className="w-full p-1 border rounded"
// //             placeholder="Día"
// //             min={1}
// //           />
// //           <select
// //             value={cq.questionCategory}
// //             onChange={(e) => handleChallengeQuestionChange(index, "questionCategory", e.target.value as QuestionCategory)}
// //             className="w-full p-1 border rounded"
// //           >
// //             <option value="daily">Diaria</option>
// //             <option value="daily-reflection">Reflexión diaria</option>
// //             <option value="weekly-reflection">Reflexión semanal</option>
// //             <option value="challenge-reflection">Reflexión del challenge</option>
// //           </select>
// //         </div>
// //       ))}
// //       <button type="button" onClick={handleAddChallengeQuestion} className="bg-green-500 text-white px-4 py-2 rounded">
// //         + Asignar pregunta
// //       </button>

// //       <div className="pt-4">
// //         <button type="submit" className="bg-black text-white px-6 py-2 rounded">
// //           Crear Challenge
// //         </button>
// //       </div>
// //     </form>
// //   );
// // };

// // export default CreateChallenge;
