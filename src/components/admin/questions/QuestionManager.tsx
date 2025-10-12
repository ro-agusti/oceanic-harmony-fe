import { useState } from "react";
import AdminNav from "../AdminNav";
import AllQuestionsList from "../challenges/AllQuestionList";
import CreateQuestionForm from "../challenges/CreateQuestionForm";
import { PlusCircle, ArrowLeft } from "lucide-react";

function QuestionManager() {
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const triggerRefresh = () => setRefreshSignal((prev) => prev + 1);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 🔹 Navegación */}
      <header>
        <AdminNav />
      </header>

      {/* 🔹 Contenido principal */}
      <main className="flex-1 mt-20 px-4 md:px-8 pb-6 flex flex-col">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800 font-mono">
            ALL QUESTIONS
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gray-400 text-gray-300 p-2 rounded hover:bg-gray-500 flex items-center justify-center w-10 h-10"
          >
            <PlusCircle size={26} />
          </button>
        </div>

        {/* Lista que ocupa todo el alto restante */}
        <div className="bg-[#fbf7f1] rounded-lg shadow border flex-1 overflow-y-auto p-4">
          <AllQuestionsList
            refreshSignal={refreshSignal}
            onSelectQuestion={triggerRefresh}
          />
        </div>
      </main>

      {/* 🔹 Modal para crear pregunta */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 font-mono">
                CREATE NEW QUESTION
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 flex items-center gap-2"
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            <CreateQuestionForm
              onQuestionCreated={() => {
                triggerRefresh();
                setShowCreateModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionManager;
