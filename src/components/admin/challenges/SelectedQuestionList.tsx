import { useEffect, useState } from "react";
import { Trash2, Edit, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch, API } from '../../../config/api';

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

type Category = "daily" | "daily-reflection" | "weekly-reflection" | "challenge-reflection";

export default function SelectedQuestionsList({
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
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ challenge?: { ChallengeQuestions?: any[] } }>(
        API.challengeQuestions.byChallenge(challengeId)
      );
      if (!res.ok) {
  const errorMsg =
    (res.data && (res.data as any).message) || `Failed to fetch selected questions`;
  throw new Error(errorMsg);
}
      // if (!res.ok) throw new Error(res.data?.message || "Failed to fetch selected questions");

      const formatted: SelectedQuestion[] = (res.data?.challenge?.ChallengeQuestions || [])
        .map((item: any) => ({
          question: {
            id: item.Question.id,
            text: item.Question.text,
            description: item.Question.description,
            responseType: item.Question.responseType,
          },
          day: item.day,
          week: item.week,
          questionCategory: item.questionCategory,
        }))
        .sort((a, b) => (a.week === b.week ? a.day - b.day : a.week - b.week));

      setSelectedQuestions(formatted);
      onSelectedQuestionsLoaded?.(formatted);
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

    try {
      const res = await apiFetch(
        API.challengeQuestions.byChallengeAndQuestion(challengeId, questionId),
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(res.data?.message || "Failed to delete question");

      toast.success("Question removed from challenge");
      fetchSelectedQuestions();
    } catch (err: any) {
      toast.error(err.message || "Error deleting question");
    }
  };

  const handleEditSave = async (questionId: string) => {
    if (!challengeData || !editData.questionCategory || editData.day === 0)
      return toast.error("Category and day must be selected");

    const category = editData.questionCategory as Category;
    const { day } = editData;

    if (day < 1 || day > challengeData.days)
      return toast.error(`Day must be between 1 and ${challengeData.days}.`);
    if (category === "weekly-reflection" && day % 7 !== 0)
      return toast.error("Weekly reflection must be on days 7, 14, 21, etc.");
    if (category === "challenge-reflection" && day !== challengeData.days)
      return toast.error("Challenge reflection must be on the last day.");

    const duplicate = selectedQuestions.some(
      (q) => q.questionCategory === category && q.day === day && q.question.id !== questionId
    );
    if (duplicate) return toast.error(`A "${category}" question already exists for day ${day}.`);

    try {
      const res = await apiFetch(
        API.challengeQuestions.byChallengeAndQuestion(challengeId, questionId),
        {
          method: "PUT",
          body: JSON.stringify({
            day,
            questionCategory: category,
            week: Math.ceil(day / 7),
          }),
        }
      );
      if (!res.ok) throw new Error(res.data?.message || "Failed to update question");

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
    <div className="w-full font-mono text-sm text-gray-700 bg-[#fbf7f1] p-4 rounded shadow">
      <ul className="space-y-3">
        {selectedQuestions.map((item, index) => {
          let availableDays: number[] = [];
          if (editingId === item.question.id && editData.questionCategory && challengeData) {
            const category = editData.questionCategory as Category;
            if (category === "weekly-reflection")
              availableDays = Array.from({ length: challengeData.weeks }, (_, i) => (i + 1) * 7);
            else if (category === "challenge-reflection")
              availableDays = [challengeData.days];
            else availableDays = Array.from({ length: challengeData.days }, (_, i) => i + 1);

            availableDays = availableDays.filter(
              (d) =>
                !selectedQuestions.some(
                  (q) => q.questionCategory === category && q.day === d && q.question.id !== item.question.id
                )
            );
          }

          return (
            <li
              key={item.question.id}
              className="border rounded p-3 text-left  shadow-sm grid grid-cols-1 sm:grid-cols-9 gap-3 items-start sm:items-center bg-white"
            >
             
              <div className="font-semibold text-gray-500 sm:col-span-1">{index + 1}</div>

              
              <div className="sm:col-span-5">
                <p className="text-sm font-semibold text-gray-700">{item.question.text}</p>
                <p className="text-xs text-gray-600">{item.question.description}</p>
                <p className="text-xs text-gray-500">Type: {item.question.responseType}</p>
              </div>

              
              <div className="sm:col-span-1 text-sm">
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
                ) : (
                  <span className="capitalize">{item.questionCategory.replace("-", " ")}</span>
                )}
              </div>

              <div className="sm:col-span-1 text-sm">
                {editingId === item.question.id ? (
                  editData.questionCategory ? (
                    <select
                      value={editData.day}
                      onChange={(e) => setEditData({ ...editData, day: Number(e.target.value) })}
                      className="border px-2 py-1 rounded w-full bg-transparent"
                    >
                      {availableDays.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-400">Select category first</span>
                  )
                ) : (
                  `Day ${item.day}`
                )}
              </div>

              <div className="flex gap-2 sm:justify-end sm:col-span-1">
                {editingId === item.question.id ? (
                  <>
                    <button
                      onClick={() => handleEditSave(item.question.id)}
                      className="px-2 py-1 bg-gray-400 text-white rounded"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 bg-gray-400 text-white rounded"
                    >
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
                    <button
                      onClick={() => handleDelete(item.question.id)}
                      className="px-2 py-1 bg-gray-400 text-white rounded"
                    >
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