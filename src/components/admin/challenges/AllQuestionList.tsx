import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, PlusCircle, Save } from "lucide-react";
import AssignToChallengeModal from "./AssignToChallengeForm";
import { SelectedQuestion, ChallengeData } from "../types/typesChallenges";

interface MultipleChoiceOption {
  id?: string;
  optionText: string;
}

interface Question {
  id: string;
  text: string;
  description?: string;
  responseType: string;
  allowCustomText: boolean;
  createdAt?: string;
  options?: MultipleChoiceOption[];
}

interface AllQuestionsListProps {
  challengeId: string;
  onSelectQuestion: (questionId: string) => void;
  refreshSignal?: number;
  challengeData?: ChallengeData;
  selectedQuestions: SelectedQuestion[];
}

export default function AllQuestionsList({
  challengeId,
  onSelectQuestion,
  refreshSignal,
  challengeData,
  selectedQuestions,
}: AllQuestionsListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Question>>({});
  const [modalQuestionId, setModalQuestionId] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No admin token found");

      const res = await fetch("http://localhost:3000/api/questions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!Array.isArray(data)) return setQuestions([]);

      setQuestions(
        data.map((q: any) => ({
          ...q,
          options: q.MultipleChoiceOptions?.map((opt: any) => ({
            id: opt.id,
            optionText: opt.optionText,
          })),
        }))
      );
    } catch (err) {
      console.error("Error fetching questions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [refreshSignal]);

  const startEditing = (q: Question) => {
    setEditingId(q.id);
    setEditData({
      id: q.id,
      text: q.text,
      description: q.description,
      responseType: q.responseType,
      allowCustomText: q.allowCustomText,
      options: q.responseType === "multiple-choice" ? q.options || [] : [],
    });
  };

  const handleSave = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("🔐 Admin token not found");

    try {
      const payload = {
        ...editData,
        MultipleChoiceOptions:
          editData.responseType === "multiple-choice"
            ? (editData.options || []).map((o) => ({ id: o.id, optionText: o.optionText }))
            : undefined,
      };

      const res = await fetch(`http://localhost:3000/api/questions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update question");
      }

      toast.success("✅ Question updated");
      setEditingId(null);
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.message || "Error updating question");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    const token = localStorage.getItem("token");
    if (!token) return toast.error("🔐 Admin token not found");

    try {
      setDeleting(id);
      const res = await fetch(`http://localhost:3000/api/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete question");
      }
      toast.success("🗑️ Question deleted");
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.message || "Error deleting question");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <p>Loading questions...</p>;
  if (questions.length === 0) return <p>No questions created yet.</p>;

  return (
    <div className="p-4 w-full h-[350px] overflow-y-auto">
      <ul className="space-y-2 text-left font-mono">
        {questions.map((q) => (
          <li key={q.id} className="relative">
            <div className="flex items-center justify-between gap-2 border shadow p-3 rounded w-full">
              <div className="flex-1">
                {editingId === q.id ? (
                  <>
                    <input
                      type="text"
                      value={editData.text || ""}
                      onChange={(e) => setEditData({ ...editData, text: e.target.value })}
                      className="border bg-transparent px-2 py-1 rounded w-full text-sm mb-1"
                      placeholder="Question text"
                    />
                    <input
                      type="text"
                      value={editData.description || ""}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="border bg-transparent px-2 py-1 rounded w-full text-sm mb-1"
                      placeholder="Description"
                    />

                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <label className="flex items-center gap-1">
                        Type:
                        <select
                          value={editData.responseType || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, responseType: e.target.value, options: [] })
                          }
                          className="border bg-transparent px-2 py-1 rounded text-xs"
                        >
                          <option value="">-- Select type --</option>
                          <option value="text">Text</option>
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="multiple-text">Multiple Text</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={editData.allowCustomText || false}
                          onChange={(e) =>
                            setEditData({ ...editData, allowCustomText: e.target.checked })
                          }
                        />
                        Allow Custom
                      </label>
                    </div>

                    {/* Multiple choice options */}
                    {editData.responseType === "multiple-choice" && (
                      <div className="mt-2">
                        {(editData.options || []).map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2 mb-1">
                            <input
                              type="text"
                              value={opt.optionText}
                              onChange={(e) => {
                                const newOptions = [...(editData.options || [])];
                                newOptions[idx].optionText = e.target.value;
                                setEditData({ ...editData, options: newOptions });
                              }}
                              className="border bg-transparent px-2 py-1 rounded text-xs flex-1"
                              placeholder={`Option ${idx + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions = (editData.options || []).filter((_, i) => i !== idx);
                                setEditData({ ...editData, options: newOptions });
                              }}
                              className="text-gray-500 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setEditData({
                              ...editData,
                              options: [...(editData.options || []), { optionText: "" }],
                            })
                          }
                          className="text-gray-500 text-xs underline"
                        >
                          ➕ Add Option
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-gray-600">{q.text}</p>
                    <p className="text-sm text-gray-600">{q.description}</p>
                    <p className="text-xs text-gray-500">
                      Type: {q.responseType} | Allow Custom: {q.allowCustomText ? "Yes" : "No"}
                    </p>
                    {q.responseType === "multiple-choice" && q.options && (
                      <ul className="text-xs text-gray-500 mt-1 list-disc ml-4">
                        {q.options.map((opt) => (
                          <li key={opt.id}>{opt.optionText}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col gap-1 ml-2">
                {editingId === q.id ? (
                  <button
                    onClick={() => handleSave(q.id)}
                    className="text-gray-500 px-2 py-1 font-bold text-xs"
                  >
                    <Save size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => startEditing(q)}
                    className="text-gray-500 px-2 py-1 font-bold text-xs"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(q.id)}
                  disabled={deleting === q.id}
                  className="text-gray-500 px-2 py-1 font-bold text-xs"
                >
                  <Trash2 size={16} />
                </button>
                
              </div>
              <button
                  onClick={() => setModalQuestionId(q.id)}
                  className="bg-gray-400 text-white px-2 py-1 font-bold text-xs rounded hover:bg-gray-500"
                >
                  <PlusCircle size={16} />
                </button>
            </div>

            {modalQuestionId === q.id && (
              <AssignToChallengeModal
                questionId={modalQuestionId}
                questionText={q.text}
                questionDescription={q.description}
                challengeId={challengeId}
                challengeData={challengeData}
                selectedQuestions={selectedQuestions}
                onClose={() => setModalQuestionId(null)}
                onAssigned={() => {
                  onSelectQuestion(q.id);
                  setModalQuestionId(null);
                }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
