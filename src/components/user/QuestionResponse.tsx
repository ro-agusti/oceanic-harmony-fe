import { useState } from "react";
import { motion } from "framer-motion";
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
}

interface QuestionResponseProps {
  response: Response;
  answerValue: string;
  onAnswerSaved: (questionId: string, answer: string) => void;
  challengeId: string;
  direction?: number;
}

export default function QuestionResponse({
  response,
  answerValue,
  onAnswerSaved,
  challengeId,
  direction = 0,
}: QuestionResponseProps) {
  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
  };

  const [localAnswer, setLocalAnswer] = useState(answerValue);

  const handleSubmit = async (selectedOptionId?: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in");
      return;
    }

    const body = {
      questionId: response.questionId,
      challengeId,
      selectedOptionId: selectedOptionId || undefined,
      responseText: !selectedOptionId ? localAnswer : undefined,
    };
    console.log("Posting response", body);
console.log("Token:", token);
    try {
      const res = await fetch(`${API_URL}/api/user-responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Fetch failed:", res.status, text);
        throw new Error("Failed to save response");
      }

      // Actualizamos el padre
      onAnswerSaved(response.questionId, selectedOptionId || localAnswer);

      // Limpiamos local
      setLocalAnswer("");
    } catch (err) {
      console.error("Error saving response:", err);
      alert("Could not save response");
    }
  };

  return (
    <motion.div
      key={response.id}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="border p-4 rounded-lg shadow-sm bg-[#fbf7f1]"
    >
      <p className="font-semibold mb-2">{response.question}</p>

      {response.answer !== null ? (
        <p className="text-gray-700">{response.answer}</p>
      ) : response.questionType === "multiple-choice" ? (
        <div className="flex flex-col gap-2 mt-2">
          {response.options?.map((opt) => (
            <button
              key={opt.id}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => handleSubmit(opt.id)}
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
            value={localAnswer}
            onChange={(e) => setLocalAnswer(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => handleSubmit()}
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
}

// import { useState } from "react";
// import { motion } from "framer-motion";


// const API_URL = import.meta.env.VITE_API_URL;

// interface Option {
//   id: string;
//   text: string;
//   optionText?: string;
// }

// interface Response {
//   id: string;
//   questionId: string;
//   question: string;
//   answer: string | null;
//   questionType?: "text" | "multiple-choice";
//   options?: Option[];
// }

// interface QuestionResponseProps {
//   response: Response;
//   answerValue: string; // valor inicial
//   onAnswerSaved: (questionId: string, answer: string) => void;
//   challengeId: string;
//   direction?: number;
// }

// export default function QuestionResponse({
//   response,
//   answerValue,
//   onAnswerSaved,
//   challengeId,
//   direction = 0,
// }: QuestionResponseProps) {
//   const variants = {
//     enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
//     center: { x: 0, opacity: 1 },
//     exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
//   };

//   const [inputValue, setInputValue] = useState(answerValue || "");

//   const handleSubmit = async (selectedOptionId?: string) => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       alert("You must be logged in");
//       return;
//     }

//     const body = {
//       questionId: response.questionId,
//       challengeId,
//       selectedOptionId: selectedOptionId || undefined,
//       responseText: !selectedOptionId ? inputValue : undefined,
//     };

//     try {
//       const res = await fetch(`${API_URL}/api/user-responses`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(body),
//       });

//       if (!res.ok) throw new Error("Failed to save response");

//       // Avisamos al padre que la respuesta se guardó
//       onAnswerSaved(response.questionId, selectedOptionId || inputValue);

//       // Limpiamos el input interno
//       setInputValue("");
//     } catch (err) {
//       console.error("Error saving response:", err);
//       alert("Could not save response");
//     }
//   };

//   return (
//     <motion.div
//       key={response.id}
//       custom={direction}
//       variants={variants}
//       initial="enter"
//       animate="center"
//       exit="exit"
//       transition={{ duration: 0.3 }}
//       className="border p-4 rounded-lg shadow-sm bg-[#fbf7f1]"
//     >
//       <p className="font-semibold mb-2">{response.question}</p>

//       {response.answer !== null ? (
//         <p className="text-gray-700">{response.answer}</p>
//       ) : response.questionType === "multiple-choice" ? (
//         <div className="flex flex-col gap-2 mt-2">
//           {response.options?.map((opt) => (
//             <button
//               key={opt.id}
//               className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
//               onClick={() => handleSubmit(opt.id)}
//             >
//               {opt.optionText || opt.text}
//             </button>
//           ))}
//         </div>
//       ) : (
//         <div className="mt-2 flex gap-2">
//           <input
//             type="text"
//             placeholder="Write your answer..."
//             className="p-2 border rounded w-full bg-inherit"
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)} // solo actualiza input local
//           />
//           <button
//             className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//             onClick={() => handleSubmit()}
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </motion.div>
//   );
// }

// import { motion } from "framer-motion";

// const API_URL = import.meta.env.VITE_API_URL;

// interface Option {
//   id: string;
//   text: string;
//   optionText?: string;
// }

// interface Response {
//   id: string;
//   questionId: string;
//   question: string;
//   answer: string | null;
//   questionType?: "text" | "multiple-choice";
//   options?: Option[];
// }
// interface QuestionResponseProps {
//   response: Response;
//   answerValue: string;
//   onAnswerSaved: (questionId: string, answer: string) => void;
//   challengeId: string;
//   direction?: number;
// }

// // interface QuestionResponseProps {
// //   response: Response;
// //   answerValue: string;
// //   onInputChange: (questionId: string, value: string) => void;
// //   onSubmit: (questionId: string, selectedOptionId?: string) => void;
// //   direction?: number;
// // }

// export default function QuestionResponse({
//   response,
//   answerValue,
//   onAnswerSaved,
//   challengeId,
//   direction = 0,
// }: QuestionResponseProps) {
//   const variants = {
//     enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
//     center: { x: 0, opacity: 1 },
//     exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
//   };

//   const handleSubmit = async (selectedOptionId?: string) => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       alert("You must be logged in");
//       return;
//     }

//     const responseText = !selectedOptionId ? answerValue : undefined;
//     const body = {
//       questionId: response.questionId,
//       challengeId,
//       selectedOptionId: selectedOptionId || undefined,
//       responseText,
//     };

//     try {
//       const res = await fetch(`${API_URL}/api/user-responses`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(body),
//       });

//       if (!res.ok) throw new Error("Failed to save response");

//       // Avisamos al componente padre que la respuesta se guardó localmente
//       onAnswerSaved(response.questionId, selectedOptionId || answerValue);
//     } catch (err) {
//       console.error("Error saving response:", err);
//       alert("Could not save response");
//     }
//   };

//   return (
//     <motion.div
//       key={response.id}
//       custom={direction}
//       variants={variants}
//       initial="enter"
//       animate="center"
//       exit="exit"
//       transition={{ duration: 0.3 }}
//       className="border p-4 rounded-lg shadow-sm bg-[#fbf7f1]"
//     >
//       <p className="font-semibold mb-2">{response.question}</p>

//       {response.answer !== null ? (
//         <p className="text-gray-700">{response.answer}</p>
//       ) : response.questionType === "multiple-choice" ? (
//         <div className="flex flex-col gap-2 mt-2">
//           {response.options?.map((opt) => (
//             <button
//               key={opt.id}
//               className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
//               onClick={() => handleSubmit(opt.id)}
//             >
//               {opt.optionText || opt.text}
//             </button>
//           ))}
//         </div>
//       ) : (
//         <div className="mt-2 flex gap-2">
//           <input
//             type="text"
//             placeholder="Write your answer..."
//             className="p-2 border rounded w-full bg-inherit"
//             value={answerValue || ""}
//             onChange={(e) => onAnswerSaved(response.questionId, e.target.value)} // temporal para update
//           />
//           <button
//             className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//             onClick={() => handleSubmit()}
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </motion.div>
//   );
// }
