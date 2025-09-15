import { useEffect, useState } from "react";
import { Trash2, Edit } from "lucide-react";

interface SelectedQuestion {
  question: {
    id: string;
    text: string;
    description: string;
    responseType: string;
  };
  day: number;
  week: number;
  questionCategory: string;
}

interface Props {
  challengeId: string;
}

function SelectedQuestionsList({ challengeId }: Props) {
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // nuevo

  useEffect(() => {
    const fetchSelectedQuestions = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:3000/api/challenge-questions/${challengeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("Fetched selected questions:", data);

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch selected questions");
        }

        // Validamos que sea array
        if (
  data.challenge &&
  Array.isArray(data.challenge.ChallengeQuestions)
) {
  const formattedQuestions: SelectedQuestion[] =
    data.challenge.ChallengeQuestions.map((item: any) => ({
      question: {
        id: item.Question.id,
        text: item.Question.text,
        description: item.Question.description,
        responseType: item.Question.responseType,
      },
      day: item.day,
      week: item.week,
      questionCategory: item.questionCategory,
    }));

  setSelectedQuestions(formattedQuestions);
} else {
  console.error("API did not return expected structure:", data);
  setError("Unexpected response format from API.");
  setSelectedQuestions([]);
}
        // if (Array.isArray(data)) {
        //   setSelectedQuestions(data);
        // } else {
        //   console.error("API did not return an array:", data);
        //   setError("Unexpected response format from API.");
        //   setSelectedQuestions([]);
        // }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "An unknown error occurred.");
        setSelectedQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedQuestions();
  }, [challengeId]);

  if (loading) return <p>Loading selected questions...</p>;

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (selectedQuestions.length === 0) {
    return <p className="text-gray-600">No questions assigned yet.</p>;
  }

  return (
  <div className="w-full">

    {/* Lista */}
    <ul className="space-y-2">
      {selectedQuestions.map((item, index) => (
        <li
          key={item.question.id}
          className="grid grid-cols-9 gap-1 items-center border font-mono p-3 rounded shadow-sm"
        >
          {/* Col 1: Número */}
          <div className="font-mono col-span-1">{index + 1}</div>

          {/* Col 2: Pregunta */}
          <div className="text-left col-span-5">
            <p className="text-sm font-semibold text-gray-600">{item.question.text}</p>
            <p className="text-xs text-gray-600">{item.question.description}</p>
            <p className="text-xs text-gray-500">
              Type: {item.question.responseType}
            </p>
          </div>

          {/* Col 3: Day */}
          <div className="text-sm col-span-1">Day {item.day}</div>

          {/* Col 4: Categoría */}
          <div className="text-sm col-span-1">{item.questionCategory}</div>

          {/* Col 5: Acciones */}
          <div className="flex justify-end gap-2 col-span-1">
            <button className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500">
              <Edit size={16} />
            </button>
            <button className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500">
              <Trash2 size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
);
}

export default SelectedQuestionsList;