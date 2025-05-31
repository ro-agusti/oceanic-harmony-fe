import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Question {
  id: string;
  text: string;
  description: string;
  responseType: string;
}

interface SelectedQuestion extends Question {
  week: number;
  day: number;
  questionCategory: "daily" | "daily-reflection" | "weekly-reflection" | "challenge-reflection";
}

function AssignQuestions() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<string, SelectedQuestion>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:3000/api/questions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || []);
      })
      .catch(err => {
        console.error("Error loading questions:", err);
      });
  }, [navigate]);

  const handleCheckboxChange = (q: Question, checked: boolean) => {
    if (checked) {
      setSelected(prev => ({
        ...prev,
        [q.id]: {
          ...q,
          week: 1,
          day: 1,
          questionCategory: "daily",
        },
      }));
    } else {
      const newSelection = { ...selected };
      delete newSelection[q.id];
      setSelected(newSelection);
    }
  };

  const handleChange = (id: string, field: keyof SelectedQuestion, value: any) => {
    setSelected(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: field === "week" || field === "day" ? parseInt(value) : value,
      },
    }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:3000/api/challenge-questions/${challengeId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: Object.values(selected).map(q => ({
            questionId: q.id,
            week: q.week,
            day: q.day,
            questionCategory: q.questionCategory,
          })),
        }),
      });

      if (!response.ok) throw new Error("Error assigning questions");

      alert("Preguntas asignadas correctamente");
      navigate("/admin/challenges");
    } catch (error) {
      console.error("Error submitting questions:", error);
    }
  };

  return (
    <div className="p-6 mt-20">
      <h2 className="text-xl font-bold text-gray-700 font-mono">Assign Questions to Challenge</h2>
      <ul className="mt-4 space-y-4">
        {questions.map(q => {
          const isSelected = selected[q.id] !== undefined;

          return (
            <li key={q.id} className="p-4 bg-[#fbf7f1] rounded shadow">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="font-semibold text-gray-700">{q.text}</p>
                  <p className="text-sm text-gray-500">{q.description}</p>
                  <p className="text-xs text-gray-400">Response: {q.responseType}</p>
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleCheckboxChange(q, e.target.checked)}
                  className="ml-4"
                />
              </div>

              {isSelected && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                  <input
                    type="number"
                    min="1"
                    value={selected[q.id].week}
                    onChange={e => handleChange(q.id, "week", e.target.value)}
                    className="p-1 border rounded"
                    placeholder="Week"
                  />
                  <input
                    type="number"
                    min="1"
                    value={selected[q.id].day}
                    onChange={e => handleChange(q.id, "day", e.target.value)}
                    className="p-1 border rounded"
                    placeholder="Day"
                  />
                  <select
                    value={selected[q.id].questionCategory}
                    onChange={e => handleChange(q.id, "questionCategory", e.target.value)}
                    className="p-1 border rounded"
                  >
                    <option value="daily">daily</option>
                    <option value="daily-reflection">daily-reflection</option>
                    <option value="weekly-reflection">weekly-reflection</option>
                    <option value="challenge-reflection">challenge-reflection</option>
                  </select>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Guardar asignación
      </button>
    </div>
  );
}

export default AssignQuestions;
