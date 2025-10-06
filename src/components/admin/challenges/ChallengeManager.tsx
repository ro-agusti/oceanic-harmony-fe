import { useParams } from "react-router-dom";
import { useState } from "react";
import AdminNav from "../AdminNav";
import ChallengeSummary from "./ChallengeSummary";
import CreateQuestionForm from "./CreateQuestionForm";
import AllQuestionsList from "./AllQuestionList";
import SelectedQuestionsList from "./SelectedQuestionList";
import { SelectedQuestion, ChallengeData } from "../types/typesChallenges";

function ChallengeManager() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);

  const handleQuestionCreated = () => setRefreshKey(prev => prev + 1);
  const handleAssigned = () => setRefreshKey(prev => prev + 1);
  
  if (!challengeId) {
    return <p className="text-red-500 font-semibold">Challenge ID not found in URL.</p>;
  }

  return (
    <div className="min-h-screen">
      <header>
        <AdminNav />
      </header>

      <section className="mt-20 w-full">
        <ChallengeSummary 
          challengeId={challengeId} 
          onDataLoaded={setChallengeData} 
        />
      </section>

      <main className="w-full mt-4 mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Crear pregunta */}
        <div className="bg-[#fbf7f1] p-3 rounded-lg shadow border md:col-span-1">
          <h2 className="text-left text-xl font-semibold mb-2 text-gray-800 font-mono">
            CREATE NEW QUESTION
          </h2>
          <CreateQuestionForm
            challengeId={challengeId}
            onQuestionCreated={handleQuestionCreated}
          />
        </div>

        {/* Todas las preguntas */}
        <div className="bg-[#fbf7f1] p-3 rounded-lg shadow border md:col-span-2 flex flex-col">
          <h2 className="text-xl text-left font-semibold mb-4">
            SELECT QUESTION
          </h2>
          <AllQuestionsList
            challengeId={challengeId}
            refreshSignal={refreshKey}
            onSelectQuestion={handleAssigned}
            challengeData={challengeData ?? undefined}
            selectedQuestions={selectedQuestions} // ✅ Pasamos selectedQuestions
          />
        </div>
      </main>

      {/* Preguntas seleccionadas */}
      <section className="w-full bg-[#fbf7f1] mt-3 border shadow rounded-lg p-3">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl text-left font-semibold mb-4">
            SELECTED QUESTION
          </h2>
          <SelectedQuestionsList
            challengeId={challengeId}
            refreshSignal={refreshKey}
            challengeData={challengeData ?? undefined}
            onSelectedQuestionsLoaded={setSelectedQuestions} // ✅ Guardamos selectedQuestions
          />
        </div>
      </section>
    </div>
  );
}

export default ChallengeManager;
