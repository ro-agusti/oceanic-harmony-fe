import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, PlusCircle, ArrowLeft  } from "lucide-react";
import AdminNav from "../AdminNav";
//import { Challenge } from '../types/challenge';
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

interface ChallengeQuestion {
  week: number;
  day: number;
  questionCategory: "daily" | "daily-reflection" | "weekly-reflection" | "challenge-reflection";
  Question: Question;
}

interface FullChallenge {
  title: string;
  days: number;
  ChallengeQuestions?: ChallengeQuestion[];
}

function AssignQuestions() {
  const [challenge, setChallenge] = useState<FullChallenge | null>(null);
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<string, SelectedQuestion>>({});
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
//const [allQuestions, setAllQuestions] = useState(null);

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token || !challengeId) return;

  fetch(`http://localhost:3000/api/challenge-questions/${challengeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      const { challenge } = data;

      if (!challenge || !Array.isArray(challenge.ChallengeQuestions)) {
        setChallenge(null);
        setQuestions([]);
        setSelected({});
        return;
      }

      setChallenge(challenge);

      const questionList: Question[] = challenge.ChallengeQuestions
        .filter((cq: ChallengeQuestion) => cq.Question)
        .map((cq: ChallengeQuestion) => cq.Question);

      setQuestions(questionList);

      const preselected: Record<string, SelectedQuestion> = {};
      challenge.ChallengeQuestions.forEach((cq: ChallengeQuestion) => {
        if (cq.Question) {
          preselected[cq.Question.id] = {
            id: cq.Question.id,
            text: cq.Question.text,
            description: cq.Question.description,
            responseType: cq.Question.responseType,
            week: cq.week,
            day: cq.day,
            questionCategory: cq.questionCategory,
          };
        }
      });

      setSelected(preselected);
    })
    .catch(err => {
      console.error("Error fetching challenge questions:", err);
      setChallenge(null);
      setQuestions([]);
      setSelected({});
    });
}, [challengeId]);

useEffect(() => {
  const fetchAllQuestions = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:3000/api/questions", {
      method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text(); // Para depurar mejor
        console.error("Fetch failed:", res.status, text);
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Error:", data);
      if (Array.isArray(data)) {
        setAllQuestions(data);
      } else if (Array.isArray(data.questions)) {
        setAllQuestions(data.questions); // <-- en caso de que venga con propiedad "questions"
      } else {
        console.error("Unexpected data format:", data);
        setAllQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setAllQuestions([]);
    }
  };

  fetchAllQuestions();
}, []);

const weeks = challenge ? Math.ceil(challenge.days / 7) : 0;
const dailyCount = Object.values(selected).filter(q => q.questionCategory === "daily").length;
const dailyReflectionCount = Object.values(selected).filter(q => q.questionCategory === "daily-reflection").length;
const weeklyReflectionCount = Object.values(selected).filter(q => q.questionCategory === "weekly-reflection").length;
const challengeReflectionCount = Object.values(selected).filter(q => q.questionCategory === "challenge-reflection").length;
const totalSelected = Object.keys(selected).length;
const expectedTotal = challenge
  ? challenge.days * 2 + weeks + 1
  : 0;
const maxDaily = challenge ? challenge.days : 0;
const maxDailyReflection = challenge ? challenge.days : 0;
const maxWeeklyReflection = weeks;
const maxChallengeReflection = 1;
  
  
  const handleCheckboxChange = (q: Question, checked: boolean) => {
  const currentCategory: SelectedQuestion["questionCategory"] = "daily"; // valor por defecto

  if (checked) {
    // Definir límites y contadores
    const categoryCounts = {
      daily: dailyCount,
      "daily-reflection": dailyReflectionCount,
      "weekly-reflection": weeklyReflectionCount,
      "challenge-reflection": challengeReflectionCount,
    };

    const categoryMax = {
      daily: challenge ? challenge.days : 0,
      "daily-reflection": challenge ? challenge.days : 0,
      "weekly-reflection": weeks,
      "challenge-reflection": 1,
    };

    // Verificar si ya se alcanzó el límite
    if (categoryCounts[currentCategory] >= categoryMax[currentCategory]) {
      alert(`You have already reached the maximum number of questions allowed for "${currentCategory}": ${categoryMax[currentCategory]}`);
      return;
    }

    // Si no, agregar la pregunta
    setSelected(prev => ({
      ...prev,
      [q.id]: {
        ...q,
        week: 1,
        day: 1,
        questionCategory: currentCategory,
      },
    }));
  } else {
    // Quitar selección
    const newSelection = { ...selected };
    delete newSelection[q.id];
    setSelected(newSelection);
  }
};



  const handleChange = (id: string, field: keyof SelectedQuestion, value: any) => {
  setSelected(prev => {
    const updated = { ...prev };
    const current = updated[id];

    // Validar límites si se cambia la categoría
    if (field === "questionCategory") {
      const newCategory = value as SelectedQuestion["questionCategory"];

      const categoryCounts = {
        daily: dailyCount,
        "daily-reflection": dailyReflectionCount,
        "weekly-reflection": weeklyReflectionCount,
        "challenge-reflection": challengeReflectionCount,
      };

      const categoryMax = {
        daily: maxDaily,
        "daily-reflection": maxDailyReflection,
        "weekly-reflection": maxWeeklyReflection,
        "challenge-reflection": maxChallengeReflection,
      };

      // Solo sumar si la nueva categoría es distinta de la actual
      if (current.questionCategory !== newCategory && categoryCounts[newCategory] >= categoryMax[newCategory]) {
        alert(`You have already reached the maximum allowed for "${newCategory}": ${categoryMax[newCategory]}`);
        return prev; // no actualiza
      }
    }

    // Actualizar normalmente
    updated[id] = {
      ...current,
      [field]: field === "week" || field === "day" ? parseInt(value) : value,
    };

    return updated;
  });
};


  const handleSubmit = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`http://localhost:3000/api/challenge-questions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        challengeId,
        questions: Object.values(selected).map(q => ({
          questionId: q.id,
          week: q.week,
          day: q.day,
          questionCategory: q.questionCategory,
        })),
      }),
    });

    if (!response.ok) throw new Error("Error assigning questions");

    alert("Correctly assigned questions");
    navigate("/admin/challenges");
  } catch (error) {
    console.error("Error submitting questions:", error);
  }
};

console.log("allQuestions", allQuestions);
const unselectedQuestions = allQuestions.filter(q => !selected[q.id]);


  return (
     <>
      <AdminNav />
      <div className="flex flex-col md:flex-row mt-20 p-6 gap-6">
  {/* Panel resumen: fijo en pantallas grandes, fluido en móviles */}
  <div className="w-full md:w-1/3 lg:w-1/4 md:sticky md:top-24 h-fit">
    {challenge && (
      <div className="p-4  rounded shadow font-mono text-sm text-gray-700">
        <div className="flex items-center justify-between">
  <h2 className="text-left text-xl font-semibold mb-2 text-gray-800">CHALLENGE</h2>

  <button
    onClick={() => navigate("/admin/challenges")} 
    className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 flex items-center gap-2"
  >
    <ArrowLeft size={20} />
    
  </button>
</div>

        
        <p className="text-left"><strong>Title:</strong> {challenge.title}</p>
        <p className="text-left"><strong>Days:</strong> {challenge.days}</p>
        <p className="text-left"><strong>Weeks:</strong> {weeks}</p>

        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div className="bg-[#fbf7f1] rounded shadow p-2">
            <p className="font-medium text-gray-600">Daily </p>
            <p>{dailyCount} / {challenge.days}</p>
          </div>
          <div className="bg-[#fbf7f1] rounded shadow p-2">
            <p className="font-medium text-gray-600">Daily Reflection</p>
            <p>{dailyReflectionCount} / {challenge.days}</p>
          </div>
          <div className="bg-[#fbf7f1] rounded shadow p-2">
            <p className="font-medium text-gray-600">Weekly Reflection</p>
            <p>{weeklyReflectionCount} / {weeks}</p>
          </div>
          <div className="bg-[#fbf7f1] rounded shadow p-2">
            <p className="font-medium text-gray-600">Challenge Reflection</p>
            <p>{challengeReflectionCount} / 1</p>
          </div>
        </div>

        <div className="mt-4 bg-[#fbf7f1] rounded shadow p-2">
          <p className="text-sm font-medium text-gray-600">
            Total selected: {totalSelected} / {expectedTotal}
          </p>
        </div>
      </div>
    )}
  </div>

  <div className="">
    {questions.length === 0 && (
        <p className="text-gray-500 ">No questions found. Try adding new ones.</p>
      )}
      <ul className=" space-y-4">
        {questions.map(q => {
          const isSelected = selected[q.id] !== undefined;
          const dayNumber = isSelected ? selected[q.id].day : null;

          return (
            <li key={q.id} className="font-mono p-4  ">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 text-gray-700 font-semibold flex items-center justify-center select-none">
              {dayNumber ?? "-"}
            </div>
                <div className="text-left flex flex-col">
                  <p className="font-semibold text-gray-700">{q.text}</p>
                  <p className="text-sm text-gray-500">{q.description}</p>
                  <p className="text-xs text-gray-400">Response Type: {q.responseType}</p>
                </div>
                <div className="ml-4">
  <label className="relative block w-5 h-5">
    <input
      type="checkbox"
      checked={isSelected}
      onChange={(e) => handleCheckboxChange(q, e.target.checked)}
      className="peer appearance-none w-5 h-5 border-2 border-gray-500 rounded-full "
    />
    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100" />
  </label>
</div>
              </div>

              {isSelected && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                  <label className="text-left text-sm font-mono text-gray-600">Week</label>
                  <input
                    type="number"
                    min="1"
                    value={selected[q.id].week}
                    onChange={e => handleChange(q.id, "week", e.target.value)}
                    className="border bg-inherit p-2 font-mono border-gray-300 rounded"
                    placeholder="Week"
                  />
                  <label className="text-left text-sm font-mono text-gray-600">Day</label>
                  <input
                    type="number"
                    min="1"
                    value={selected[q.id].day}
                    onChange={e => handleChange(q.id, "day", e.target.value)}
                    className="border bg-inherit p-2 font-mono border-gray-300 rounded"
                    placeholder="Day"
                  />
                  <label className="text-left text-sm font-mono text-gray-600">Question Category</label>
                  <select
                    value={selected[q.id].questionCategory}
                    onChange={e => handleChange(q.id, "questionCategory", e.target.value)}
                    className="border bg-inherit p-2 font-mono border-gray-300 rounded"
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
      {unselectedQuestions.length > 0 && (
  <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
  <h2 className="text-xl text-left font-bold text-gray-700 font-mono">Select Questions to Challenge</h2>
  <button
    onClick={() => navigate("/admin/questions/new")}
    className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 flex items-center gap-2"
  >
    <PlusCircle size={20} />
    New Question
  </button>
</div>
 
      

    
    <ul className="space-y-4">
      {unselectedQuestions.map(q => (
        <li key={q.id} className="font-mono p-4 bg-white rounded shadow border border-gray-300">
          <div className="flex items-center justify-between">
            <div className="text-left flex flex-col">
              <p className="font-semibold text-gray-700">{q.text}</p>
              <p className="text-sm text-gray-500">{q.description}</p>
              <p className="text-xs text-gray-400">Response Type: {q.responseType}</p>
            </div>
            <button
              onClick={() => handleCheckboxChange(q, true)}
              className="ml-4 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
)}

      <button
        onClick={handleSubmit}
        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mt-8"
      >
        Save selection
      </button>
    </div>
</div>
  
  </>);
  
}

export default AssignQuestions;
