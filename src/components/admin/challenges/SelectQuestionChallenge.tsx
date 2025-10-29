import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Circle, Check, Save, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch, postJSON, API } from '../../../config/api';
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

  const [selectedData, setSelectedData] = useState<Record<string, SelectedQuestion>>({});
  const [alreadySelectedIds, setAlreadySelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await apiFetch<Question[]>(API.questions.all);
        if (!res.ok) throw new Error("Failed to fetch questions");
        setAllQuestions(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to load questions");
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!challengeId) return;
    const fetchSelected = async () => {
      try {
        const res = await apiFetch<{ challenge?: { ChallengeQuestions?: any[] } }>(
          API.challengeQuestions.byChallenge(challengeId)
        );
        if (!res.ok) throw new Error("Failed to fetch selected questions");

        const ids = new Set<string>(
          (res.data?.challenge?.ChallengeQuestions || [])
            .map(cq => cq.Question?.id)
            .filter((id): id is string => typeof id === "string")
        );
        setAlreadySelectedIds(ids);
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to load selected questions");
      }
    };
    fetchSelected();
  }, [challengeId]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });

    setSelectedData(prev => {
      const updated = { ...prev };
      if (updated[id]) delete updated[id];
      else updated[id] = { day: 1, week: 1, questionCategory: "daily" };
      return updated;
    });
  };

  const handleChange = (id: string, field: keyof SelectedQuestion, value: any) => {
    setSelectedData(prev => {
      const updated = { ...prev };
      updated[id] = {
        ...updated[id],
        [field]: field === "day" ? parseInt(value) : value,
        week: field === "day" ? Math.ceil(parseInt(value) / 7) || 1 : updated[id].week,
      };
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!challengeId) return;

    const payload = Array.from(selectedIds).map(id => ({
      challengeId,
      questionId: id,
      ...selectedData[id],
    }));

    if (payload.length === 0) {
      toast.error("⚠ No questions selected");
      return;
    }

    try {
      for (const item of payload) {
        const res = await postJSON(API.challengeQuestions.all, item);
        if (!res.ok) throw new Error(`Failed to add question ${item.questionId}`);
      }
      toast.success("✅ All questions added!");
      navigate(`/admin/challenges/${challengeId}/assign`);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to add one or more questions");
    }
  };

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
