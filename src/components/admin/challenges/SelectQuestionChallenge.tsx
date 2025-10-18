import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Circle, Check, Save, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
interface Question {
  id: string;
  text: string;
  description: string;
  responseType: string;
}

interface SelectedQuestion {
  week: number;
  day: number;
  questionCategory: "daily" | "daily-reflection" | "weekly-reflection" | "challenge-reflection";
}

function SelectQuestionsChallenge() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set<string>());
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedData, setSelectedData] = useState<Record<string, SelectedQuestion>>({});
  const [alreadySelectedIds, setAlreadySelectedIds] = useState<Set<string>>(new Set());

  // Obtener todas las preguntas
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchQuestions = async () => {
      const res = await fetch(`${API_URL}/api/questions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const questions = Array.isArray(data) ? data : data.questions || [];
      setAllQuestions(questions);
    };

    fetchQuestions();
  }, []);

  // Obtener preguntas ya asignadas
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!challengeId) return;

    const fetchSelected = async () => {
      const res = await fetch(`${API_URL}/api/challenge-questions/${challengeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const selectedIds = new Set<string>(
  (data?.challenge?.ChallengeQuestions || [])
    .map((cq: any) => cq.Question?.id)
    .filter((id: any): id is string => typeof id === "string")

);
      setAlreadySelectedIds(selectedIds);
    };

    fetchSelected();
  }, [challengeId]);

  const handleToggleSelect = (id: string) => {
  setSelectedIds(prev => {
    const copy: Set<string> = new Set(prev); // ✅ especificar tipo Set<string>
    if (copy.has(id)) {
      copy.delete(id);
    } else {
      copy.add(id);
    }
    return copy;
  });

  setSelectedData(prev => {
    const updated = { ...prev };
    if (updated[id]) {
      delete updated[id];
    } else {
      updated[id] = {
        day: 1,
        week: 1,
        questionCategory: "daily",
      };
    }
    return updated;
  });
};

//   const handleToggleSelect = (id: string) => {
//     setSelectedIds(prev => {
//       const copy: Set<string> = new Set(prev);
//       if (copy.has(id)) {
//         copy.delete(id);
//       } else {
//         copy.add(id);
//       }
//       return copy;
//     });

//     setSelectedData(prev => {
//       const updated = { ...prev };
//       if (updated[id]) {
//         delete updated[id];
//       } else {
//         updated[id] = {
//           day: 1,
//           week: 1,
//           questionCategory: "daily",
//         };
//       }
//       return updated;
//     });
//   };

  const handleChange = (id: string, field: keyof SelectedQuestion, value: any) => {
    setSelectedData(prev => {
      const updated = { ...prev };
      updated[id] = {
        ...updated[id],
        [field]: field === "day"
          ? parseInt(value)
          : value,
        week: field === "day"
          ? Math.ceil(parseInt(value) / 7) || 1
          : updated[id].week,
      };
      return updated;
    });
  };

  const handleSubmit = async () => {
  const token = localStorage.getItem("token");

  const payload = Array.from(selectedIds).map(id => ({
    questionId: id,
    ...selectedData[id],
  }));

  if (payload.length === 0) {
    toast.error("⚠ No questions selected");
    return;
  }

  try {
    for (const item of payload) {
      const res = await fetch(`${API_URL}/api/challenge-questions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId,
          questionId: item.questionId,
          week: item.week,
          day: item.day,
          questionCategory: item.questionCategory,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error for question ${item.questionId}: ${text}`);
      }
    }

    toast.success("✅ All questions added!");
    navigate(`/admin/challenges/${challengeId}/assign`);
  } catch (err) {
    console.error(err);
    toast.error("❌ Failed to add one or more questions");
  }
};

//   const handleSubmit = async () => {
//     const token = localStorage.getItem("token");

//     const payload = Array.from(selectedIds).map(id => ({
//       questionId: id,
//       ...selectedData[id],
//     }));

//     if (payload.length === 0) {
//       toast.error("⚠ No questions selected");
//       return;
//     }

//     try {
//       const res = await fetch("http://localhost:3000/api/challenge-questions", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           challengeId,
//           questions: payload,
//         }),
//       });

//       if (!res.ok) throw new Error("Failed to save");

//       toast.success("✅ Questions added!");
//       navigate(`/admin/challenges/${challengeId}/assign`);
//     } catch (err) {
//       console.error(err);
//       toast.error("❌ Error saving questions");
//     }
//   };

  const unselectedQuestions = allQuestions.filter(q => !alreadySelectedIds.has(q.id));

  return (
    <div className="p-6 max-w-4xl mx-auto mt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-mono">Select Questions to Add</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/admin/questions/new")}
            className="text-gray-500 hover:text-gray-700"
          >
            <PlusCircle size={24} />
          </button>
          <button
            onClick={handleSubmit}
            className="text-gray-500 hover:text-gray-700"
          >
            <Save size={24} />
          </button>
        </div>
      </div>

      {unselectedQuestions.length === 0 ? (
        <p className="text-gray-500">All questions are already selected for this challenge.</p>
      ) : (
        <ul className="space-y-4">
          {unselectedQuestions.map(q => (
            <li
              key={q.id}
              className="p-4 border border-gray-300 rounded shadow flex justify-between items-start"
            >
              <div className="flex-1">
                <p className="font-semibold">{q.text}</p>
                <p className="text-sm text-gray-500">{q.description}</p>
                <p className="text-xs text-gray-400">Type: {q.responseType}</p>

                {selectedIds.has(q.id) && (
                  <div className="mt-3 flex flex-col sm:flex-row gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Day:</label>
                      <input
                        type="number"
                        min="1"
                        className="ml-2 border px-2 py-1 rounded w-24"
                        value={selectedData[q.id].day}
                        onChange={e => handleChange(q.id, "day", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Category:</label>
                      <select
                        className="ml-2 border px-2 py-1 rounded"
                        value={selectedData[q.id].questionCategory}
                        onChange={e => handleChange(q.id, "questionCategory", e.target.value)}
                      >
                        <option value="daily">daily</option>
                        <option value="daily-reflection">daily-reflection</option>
                        <option value="weekly-reflection">weekly-reflection</option>
                        <option value="challenge-reflection">challenge-reflection</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleToggleSelect(q.id)}
                className="ml-4 mt-2"
              >
                {selectedIds.has(q.id) ? (
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-600">
                    <Check className="text-white" size={16} />
                  </div>
                ) : (
                  <Circle className="text-gray-400" size={20} />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SelectQuestionsChallenge;
