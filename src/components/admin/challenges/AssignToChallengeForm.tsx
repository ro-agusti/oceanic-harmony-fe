import { useState } from "react";
import toast from "react-hot-toast";
import { ChallengeData, SelectedQuestion } from "../types/typesChallenges";

interface AssignToChallengeModalProps {
  questionId: string;
  questionText: string;
  questionDescription?: string;
  challengeId: string;
  onClose: () => void;
  onAssigned: () => void;
  challengeData?: ChallengeData;
  selectedQuestions: SelectedQuestion[];
}

export default function AssignToChallengeModal({
  questionId,
  questionText,
  questionDescription,
  challengeId,
  onClose,
  onAssigned,
  challengeData,
  selectedQuestions,
}: AssignToChallengeModalProps) {
  const [day, setDay] = useState<number | "">("");
  const [questionCategory, setQuestionCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!day || !questionCategory)
      return toast.error("Select day and category");

    if (challengeData) {
      const currentCount = selectedQuestions.filter(
        (q) => q.questionCategory === questionCategory
      ).length;

      const limits: Record<string, number> = {
        daily: challengeData.days,
        "daily-reflection": challengeData.days,
        "weekly-reflection": challengeData.weeks,
        "challenge-reflection": 1,
      };

      if (currentCount >= limits[questionCategory]) {
        return toast.error(
          `Cannot assign more than ${limits[questionCategory]} questions for category "${questionCategory}".`
        );
      }

      if (day > challengeData.days) {
        return toast.error(`This challenge only has ${challengeData.days} days.`);
      }

      if (questionCategory === "challenge-reflection" && day !== challengeData.days) {
        return toast.error("The challenge reflection must be assigned to the last day.");
      }

      // 🔹 Nueva validación: evitar duplicados por categoría y día
      const duplicate = selectedQuestions.some(
        (q) =>
          q.questionCategory === questionCategory &&
          q.day === day
      );

      if (duplicate) {
        return toast.error(
          `A "${questionCategory}" question is already assigned to day ${day}.`
        );
      }
    }

    const week = Math.ceil(Number(day) / 7);
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Admin token missing");

    try {
      setLoading(true);

      const payload = {
        challengeId,
        questions: [{ questionId, questionCategory, week, day }],
      };

      const res = await fetch(`http://localhost:3000/api/challenge-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        if (error.message?.toLowerCase().includes("already assigned")) {
          throw new Error(
            `This question is already assigned to day ${day} of this challenge`
          );
        }
        throw new Error(error.message || "Error assigning question");
      }

      toast.success("Question assigned!");
      onAssigned();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to assign question");
    } finally {
      setLoading(false);
    }
  };

  const renderDayOptions = () => {
  if (!challengeData) return null;
  const { days } = challengeData;
  const weeks = Math.ceil(days / 7);

  let options: number[] = [];
  switch (questionCategory) {
    case "daily":
    case "daily-reflection":
      options = Array.from({ length: days }, (_, i) => i + 1);
      break;
    case "weekly-reflection":
      options = Array.from({ length: weeks }, (_, i) => (i + 1) * 7);
      break;
    case "challenge-reflection":
      options = [days];
      break;
    default:
      options = [];
  }

  // 🔹 Filtrar días ya ocupados por la misma categoría
  const availableDays = options.filter(d =>
    !selectedQuestions.some(
      q => q.questionCategory === questionCategory && q.day === d
    )
  );

  return availableDays.map((d) => (
    <option key={d} value={d}>
      Day {d}
    </option>
  ));
};

  // const renderDayOptions = () => {
  //   if (!challengeData) return null;
  //   const { days } = challengeData;
  //   const weeks = Math.ceil(days / 7);

  //   let options: number[] = [];
  //   switch (questionCategory) {
  //     case "daily":
  //     case "daily-reflection":
  //       options = Array.from({ length: days }, (_, i) => i + 1);
  //       break;
  //     case "weekly-reflection":
  //       options = Array.from({ length: weeks }, (_, i) => (i + 1) * 7);
  //       break;
  //     case "challenge-reflection":
  //       options = [days];
  //       break;
  //     default:
  //       options = [];
  //   }

  //   return options.map((d) => (
  //     <option key={d} value={d}>
  //       Day {d}
  //     </option>
  //   ));
  // };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 isolation-isolate">
    <div className="bg-white bg-opacity-100 p-6 rounded-lg shadow-lg w-80">
      <h2 className="text-lg font-bold mb-4">Assign Question</h2>

        <div className="mb-4 p-2 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-700">{questionText}</p>
          {questionDescription && (
            <p className="text-xs text-gray-500">{questionDescription}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {/* 🔹 Primero categoría */}
          <select
            value={questionCategory}
            onChange={(e) => {
              setQuestionCategory(e.target.value);
              setDay("");
            }}
            className="border px-2 py-1 rounded bg-white text-gray-800"
          >
            <option value="">Select Category</option>
            <option value="daily">Daily</option>
            <option value="daily-reflection">Daily Reflection</option>
            <option value="weekly-reflection">Weekly Reflection</option>
            <option value="challenge-reflection">Challenge Reflection</option>
          </select>

          {/* 🔹 Luego día */}
          <select
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="border px-2 py-1 rounded bg-white text-gray-800"
            disabled={!questionCategory || !challengeData}
          >
            <option value="">Select Day</option>
            {renderDayOptions()}
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
