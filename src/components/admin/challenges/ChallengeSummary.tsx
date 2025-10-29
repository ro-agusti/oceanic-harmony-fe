import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch, tokenService, API } from '../../../config/api';
export interface ChallengeData {
  days: number;
  weeks: number;
  dailyCount: number;
  dailyReflectionCount: number;
  weeklyReflectionCount: number;
  challengeReflectionCount: number;
  totalSelected: number;
}

interface ChallengeSummaryProps {
  challengeId: string;
  onDataLoaded?: (data: ChallengeData) => void;
  refreshSignal?: number; 
}

interface ChallengeQuestion {
  Question: {
    id: string;
    text: string;
    description: string;
    responseType: string;
  };
  day: number;
  week: number;
  questionCategory: string;
}

interface Challenge {
  id: string;
  title: string;
  days: number;
  ChallengeQuestions: ChallengeQuestion[];
}

const ChallengeSummary = ({ challengeId, onDataLoaded, refreshSignal }: ChallengeSummaryProps) => {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);

  const fetchChallenge = async () => {
    try {
      const token = tokenService.get();
      if (!token) throw new Error("🔐 Admin token not found");

      const res = await apiFetch<{ challenge: Challenge }>(
        API.challengeQuestions.byChallenge(challengeId),
        { method: "GET" }
      );

      if (!res.ok || !res.data) {
        throw new Error((res.data as any)?.message || "❌ Failed to fetch challenge summary");
      }

      const fetchedChallenge = res.data.challenge;
      setChallenge(fetchedChallenge);

      const { days, ChallengeQuestions } = fetchedChallenge;
      const weeks = Math.ceil(days / 7);

      const data: ChallengeData = {
        days,
        weeks,
        dailyCount: ChallengeQuestions.filter(q => q.questionCategory === "daily").length,
        dailyReflectionCount: ChallengeQuestions.filter(q => q.questionCategory === "daily-reflection").length,
        weeklyReflectionCount: ChallengeQuestions.filter(q => q.questionCategory === "weekly-reflection").length,
        challengeReflectionCount: ChallengeQuestions.filter(q => q.questionCategory === "challenge-reflection").length,
        totalSelected: ChallengeQuestions.length,
      };

      setChallengeData(data);
      onDataLoaded?.(data);

    } catch (err: any) {
      console.error("Error fetching challenge summary:", err.message || err);
      alert(err.message || "❌ Error fetching challenge summary");
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [challengeId, refreshSignal]);

 
  if (!challenge || !challengeData) return <p>Loading summary...</p>;

  const { title, days, weeks, dailyCount, dailyReflectionCount, weeklyReflectionCount, challengeReflectionCount, totalSelected } = {
    title: challenge.title,
    ...challengeData,
  };

  const expectedTotal = days * 2 + weeks + 1;

   return (
    <div className="p-4 rounded shadow font-mono text-sm text-gray-700 bg-[#fbf7f1]">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800">CHALLENGE</h2>
          <p className="text-base text-gray-700">{title}</p>
        </div>
        <button
          onClick={() => navigate("/admin/challenges")}
          className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

     
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4">
        
        <div className="flex flex-row sm:flex-col sm:w-24 gap-4 sm:gap-2 justify-between sm:justify-start">
          <p>
            <strong>Days:</strong> {days}
          </p>
          <p>
            <strong>Weeks:</strong> {weeks}
          </p>
        </div>

     
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs w-full">
          <div className="bg-[#fbf7f1] rounded shadow p-2 text-center">
            <p className="font-medium text-gray-600">Daily</p>
            <p>
              {dailyCount} / {days}
            </p>
          </div>
          <div className="bg-[#fbf7f1] rounded shadow p-2 text-center">
            <p className="font-medium text-gray-600">Daily Reflection</p>
            <p>
              {dailyReflectionCount} / {days}
            </p>
          </div>
          <div className="bg-[#fbf7f1] rounded shadow p-2 text-center">
            <p className="font-medium text-gray-600">Weekly Reflection</p>
            <p>
              {weeklyReflectionCount} / {weeks}
            </p>
          </div>
          <div className="bg-[#fbf7f1] rounded shadow p-2 text-center">
            <p className="font-medium text-gray-600">Challenge Reflection</p>
            <p>
              {challengeReflectionCount} / 1
            </p>
          </div>
          <div className="bg-[#fbf7f1] rounded shadow p-2 text-center">
            <p className="font-bold text-gray-600">Total selected:</p>
            <p className="text-gray-600">
              {totalSelected} / {expectedTotal}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeSummary;
