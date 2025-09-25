import { useParams } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

import AdminNav from "../AdminNav";
import ChallengeSummary from "./ChallengeSummary";
import CreateQuestionForm from "./CreateQuestionForm";
import AllQuestionsList from "./AllQuestionList"
import SelectedQuestionsList from "./SelectedQuestionList";

function ChallengeManager() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleQuestionCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleSelectQuestion = async (questionId: string) => {
    if (!challengeId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Admin token missing");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/challenges/${challengeId}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ questionId }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error assigning question");
      }

      toast.success("Question added to challenge!");
      setRefreshKey((prev) => prev + 1); // Para refrescar lists
    } catch (err) {
      console.error(err);
      toast.error("Failed to add question to challenge");
    }
  };

  if (!challengeId) {
    return <p className="text-red-500 font-semibold">Challenge ID not found in URL.</p>;
  }

  return (
    <div className="min-h-screen">
      <header className="">
        <AdminNav />
      </header>

      <section className="mt-20 w-full">
        <ChallengeSummary challengeId={challengeId} />
      </section>

      <main className="w-full mt-4 mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
  <div className="bg-[#fbf7f1] p-3 rounded-lg shadow border md:col-span-1 ">
  <h2 className="text-left text-xl font-semibold mb-2 text-gray-800 font-mono">
    CREATE NEW QUESTION
  </h2>
  <CreateQuestionForm
    challengeId={challengeId}
    onQuestionCreated={handleQuestionCreated}
  />
</div>

  {/* Columna derecha */}
  <div className="bg-[#fbf7f1] p-3 rounded-lg shadow border md:col-span-2 flex flex-col">
    <h2 className="text-xl text-left font-semibold mb-4">SELECT QUESTION</h2>
    <AllQuestionsList
      refreshSignal={refreshKey}
      onSelectQuestion={handleSelectQuestion}
    />
  </div>
</main>


      <section className="w-full bg-[#fbf7f1] mt-3 border shadow rounded-lg p-3">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl text-left font-semibold mb-4">SELECTED QUESTION</h2>
          <SelectedQuestionsList challengeId={challengeId} />
        </div>
      </section>
    </div>
  );
}

export default ChallengeManager;
