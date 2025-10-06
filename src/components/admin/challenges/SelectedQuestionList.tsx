import { useEffect, useState } from "react";
import { Trash2, Edit, Save, X } from "lucide-react";
import toast from "react-hot-toast";

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

interface ChallengeData {
  days: number;
  weeks: number;
  dailyCount: number;
  dailyReflectionCount: number;
  weeklyReflectionCount: number;
  challengeReflectionCount: number;
}

interface Props {
  challengeId: string;
  refreshSignal?: number;
  challengeData?: ChallengeData;
  onSelectedQuestionsLoaded?: (questions: SelectedQuestion[]) => void;
}

function SelectedQuestionsList({
  challengeId,
  refreshSignal,
  challengeData,
  onSelectedQuestionsLoaded,
}: Props) {
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ day: number; questionCategory: string }>({
    day: 0,
    questionCategory: "",
  });
  

  const fetchSelectedQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin token not found");

      const res = await fetch(`http://localhost:3000/api/challenge-questions/${challengeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch selected questions");

      let formatted: SelectedQuestion[] = [];
      if (data.challenge && Array.isArray(data.challenge.ChallengeQuestions)) {
        formatted = data.challenge.ChallengeQuestions.map((item: any) => ({
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
        formatted.sort((a, b) => (a.week === b.week ? a.day - b.day : a.week - b.week));
      }

      setSelectedQuestions(formatted);
      if (onSelectedQuestionsLoaded) onSelectedQuestionsLoaded(formatted);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setSelectedQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectedQuestions();
  }, [challengeId, refreshSignal, challengeData]);

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to remove this question from the challenge?")) return;
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Admin token not found");

    try {
      const res = await fetch(`http://localhost:3000/api/challenge-questions/${challengeId}/${questionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete question");
      }
      toast.success("Question removed from challenge");
      fetchSelectedQuestions();
    } catch (err: any) {
      toast.error(err.message || "Error deleting question");
    }
  };

  type Category = "daily" | "daily-reflection" | "weekly-reflection" | "challenge-reflection";

  const handleEditSave = async (questionId: string) => {
    if (!challengeData || !editData || !editData.questionCategory || editData.day === 0)
      return toast.error("Category and day must be selected");

    const category = editData.questionCategory as Category;
    const { day } = editData;

    // Validaciones
    if (day < 1 || day > challengeData.days) {
      return toast.error(`Day must be between 1 and ${challengeData.days}.`);
    }
    if (category === "weekly-reflection" && day % 7 !== 0) {
      return toast.error("Weekly reflection must be on days 7, 14, 21, etc.");
    }
    if (category === "challenge-reflection" && day !== challengeData.days) {
      return toast.error("Challenge reflection must be on the last day of the challenge.");
    }
    const duplicate = selectedQuestions.some(
      (q) => q.questionCategory === category && q.day === day && q.question.id !== questionId
    );
    if (duplicate) return toast.error(`A "${category}" question is already assigned to day ${day}.`);

    // Limites por categoría
    const limits: Record<Category, number> = {
      daily: challengeData.days,
      "daily-reflection": challengeData.days,
      "weekly-reflection": challengeData.weeks,
      "challenge-reflection": 1,
    };
    const currentCount = selectedQuestions.filter(
      (q) => q.questionCategory === category && q.question.id !== questionId
    ).length;
    if (currentCount >= limits[category]) {
      return toast.error(`Cannot have more than ${limits[category]} questions for category "${category}".`);
    }

    // Guardar
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Admin token not found");

    try {
      const res = await fetch(
        `http://localhost:3000/api/challenge-questions/${challengeId}/${questionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            day,
            questionCategory: category,
            week: Math.ceil(day / 7),
          }),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update question");
      }
      toast.success("Question updated");
      setEditingId(null);
      fetchSelectedQuestions();
    } catch (err: any) {
      toast.error(err.message || "Error updating question");
    }
  };

  if (loading) return <p>Loading selected questions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (selectedQuestions.length === 0) return <p>No questions assigned yet.</p>;

  return (
    <div className="w-full">
      <ul className="space-y-2">
        {selectedQuestions.map((item, index) => {
          // 🔹 Días disponibles según categoría seleccionada en edición
          let availableDays: number[] = [];
          if (editingId === item.question.id && editData.questionCategory && challengeData) {
            const category = editData.questionCategory as Category;
            if (category === "weekly-reflection") availableDays = Array.from({ length: challengeData.weeks }, (_, i) => (i + 1) * 7);
            else if (category === "challenge-reflection") availableDays = [challengeData.days];
            else availableDays = Array.from({ length: challengeData.days }, (_, i) => i + 1);

            // Filtrar días ya ocupados
            availableDays = availableDays.filter(d =>
              !selectedQuestions.some(
                q => q.questionCategory === category && q.day === d && q.question.id !== item.question.id
              )
            );
          }

          return (
            <li key={item.question.id} className="grid grid-cols-9 gap-1 items-center border font-mono p-3 rounded shadow-sm">
              <div className="font-mono col-span-1">{index + 1}</div>
              <div className="text-left col-span-5">
                <p className="text-sm font-semibold text-gray-600">{item.question.text}</p>
                <p className="text-xs text-gray-600">{item.question.description}</p>
                <p className="text-xs text-gray-500">Type: {item.question.responseType}</p>
              </div>

              {/* Columna categoría */}
              <div className="col-span-1 text-sm">
                {editingId === item.question.id ? (
                  <select
                    value={editData.questionCategory}
                    onChange={(e) => setEditData({ ...editData, questionCategory: e.target.value, day: 0 })}
                    className="border px-2 py-1 rounded w-full bg-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="daily">Daily</option>
                    <option value="daily-reflection">Daily Reflection</option>
                    <option value="weekly-reflection">Weekly Reflection</option>
                    <option value="challenge-reflection">Challenge Reflection</option>
                  </select>
                ) : item.questionCategory}
              </div>

              {/* Columna día */}
              <div className="col-span-1 text-sm">
                {editingId === item.question.id ? (
                  editData.questionCategory ? (
                    <select
                      value={editData.day}
                      onChange={(e) => setEditData({ ...editData, day: Number(e.target.value) })}
                      className="border px-2 py-1 rounded w-full bg-transparent"
                    >
                      {availableDays.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-400">Select category first</span>
                  )
                ) : `Day ${item.day}`}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-2 col-span-1">
                {editingId === item.question.id ? (
                  <>
                    <button onClick={() => handleEditSave(item.question.id)} className="px-2 py-1 bg-gray-400 text-white rounded">
                      <Save size={16} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="px-2 py-1 bg-gray-400 text-white rounded">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(item.question.id);
                        setEditData({ day: item.day, questionCategory: item.questionCategory });
                      }}
                      className="px-2 py-1 bg-gray-400 text-white rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.question.id)} className="px-2 py-1 bg-gray-400 text-white rounded">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SelectedQuestionsList;
