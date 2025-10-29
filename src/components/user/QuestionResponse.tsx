import { useState } from "react";
import { motion } from "framer-motion";
import { tokenService,  postJSON, API } from '../../config/api';

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
    const user = tokenService.getUser();
    if (!user) {
      alert("You must be logged in");
      return;
    }

    const body = {
      questionId: response.questionId,
      challengeId,
      selectedOptionId: selectedOptionId || undefined,
      responseText: !selectedOptionId ? localAnswer : undefined,
    };

    try {
      const res = await postJSON(API.responses.all, body);

      if (!res.ok) {
        console.error("Error saving response:", res.data);
        if (res.status === 401) tokenService.clear();
        alert("Could not save response");
        return;
      }

   
      onAnswerSaved(response.questionId, selectedOptionId || localAnswer);

      setLocalAnswer(""); 

    } catch (err) {
      console.error("Unexpected error:", err);
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