import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Question {
  id: string;
  text: string;
  description?: string;
  responseType: string;
  allowCustomText: boolean;
  createdAt?: string;
}

interface AllQuestionsListProps {
  onSelectQuestion: (questionId: string) => void;
  refreshSignal?: number;
}

function AllQuestionsList({ onSelectQuestion, refreshSignal }: AllQuestionsListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null); // guarda el ID de la pregunta que se está agregando

const fetchQuestions = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("token"); // o desde context
    if (!token) throw new Error("No admin token found");

    const res = await fetch("http://localhost:3000/api/questions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("Fetched questions:", data);

    // Asegurate que sea un array, si no, loguealo
    if (!Array.isArray(data)) {
      console.error("Unexpected data format", data);
      setQuestions([]);
      return;
    }

    setQuestions(data);
  } catch (err) {
    console.error("Error fetching questions", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchQuestions();
  }, [refreshSignal]);

  if (loading) return <p>Loading questions...</p>;
  if (questions.length === 0) return <p>No questions created yet.</p>;

  return (
    <div className=" p-4 w-full h-[300px] overflow-y-auto">
      <ul className="space-y-2 overflow-y-auto text-left font-mono">
        {questions.map((q) => (
          <li key={q.id} className="relative">
            <div className=" flex items-center justify-between gap-2">
              <div className="border shadow p-3 rounded w-full">
              <p className="text-sm font-bold text-gray-600">{q.text}</p>
              <p className="text-sm text-gray-600">{q.description}</p>
              <p className="text-xs text-gray-500">
                Type: {q.responseType} | Allow Custom: {q.allowCustomText ? "Yes" : "No"}
              </p>
            </div>
            <button
              onClick={() => {
                setAdding(q.id);
                onSelectQuestion(q.id);
                setTimeout(() => setAdding(null), 800); // solo para simular delay
              }}
              disabled={adding === q.id}
              className=" bg-gray-400 text-white px-3 py-1 font-bold text-sm rounded hover:bg-gray-500 disabled:opacity-50"
            >
              {adding === q.id ? "Adding..." : "+"}
            </button>
            </div>
            
            
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AllQuestionsList;
