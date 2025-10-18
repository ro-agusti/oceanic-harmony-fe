import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
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
  refreshSignal?: number; // se dispara al crear/editar/asignar preguntas
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
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin token not found");

      const res = await fetch(`${API_URL}/api/challenge-questions/${challengeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch challenge");

      const fetchedChallenge: Challenge = json.challenge;
      setChallenge(fetchedChallenge);

      const { days, ChallengeQuestions } = fetchedChallenge;
      const weeks = Math.ceil(days / 7);

      const data: ChallengeData = {
        days,
        weeks,
        dailyCount: ChallengeQuestions.filter((q) => q.questionCategory === "daily").length,
        dailyReflectionCount: ChallengeQuestions.filter((q) => q.questionCategory === "daily-reflection").length,
        weeklyReflectionCount: ChallengeQuestions.filter((q) => q.questionCategory === "weekly-reflection").length,
        challengeReflectionCount: ChallengeQuestions.filter((q) => q.questionCategory === "challenge-reflection").length,
        totalSelected: ChallengeQuestions.length,
      };

      setChallengeData(data);
      onDataLoaded?.(data);
    } catch (err: any) {
      console.error("Error fetching challenge summary:", err.message || err);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800">CHALLENGE</h2>
          <p>{title}</p>
        </div>
        <button
          onClick={() => navigate("/admin/challenges")}
          className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="w-20">
          <p><strong>Days:</strong> {days}</p>
          <p><strong>Weeks:</strong> {weeks}</p>
        </div>

        <div className="grid grid-cols-5 gap-3 text-xs mt-2">
          <div className="bg-[#fbf7f1] rounded shadow p-2">
            <p className="font-medium text-gray-600">Daily</p>
            <p>{dailyCount} / {days}</p>
          </div>
          <div className="bg-[#fbf7f1] rounded shadow p-2">
            <p className="font-medium text-gray-600">Daily Reflection</p>
            <p>{dailyReflectionCount} / {days}</p>
          </div>
          <div className="bg-[#fbf7f1] rounded shadow p-2">
            <p className="font-medium text-gray-600">Weekly Reflection</p>
            <p>{weeklyReflectionCount} / {weeks}</p>
          </div>
          <div className="bg-[#fbf7f1] rounded shadow p-2">
            <p className="font-medium text-gray-600">Challenge Reflection</p>
            <p>{challengeReflectionCount} / 1</p>
          </div>
          <div className="bg-[#fbf7f1] rounded shadow p-2">
            <p className="font-bold text-gray-600">Total selected:</p>
            <p className="text-gray-600">{totalSelected} / {expectedTotal}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeSummary;

// import { useEffect, useState } from "react";
// import { ArrowLeft } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export interface ChallengeData {
//   days: number;
//   weeks: number;
//   dailyCount: number;
//   dailyReflectionCount: number;
//   weeklyReflectionCount: number;
//   challengeReflectionCount: number;
// }

// interface ChallengeSummaryProps {
//   challengeId: string;
//   onDataLoaded?: (data: ChallengeData) => void;
//   refreshSignal?: number; // 🔹 Se dispara al crear/editar/asignar preguntas
// }

// interface ChallengeQuestion {
//   Question: {
//     id: string;
//     text: string;
//     description: string;
//     responseType: string;
//   };
//   day: number;
//   week: number;
//   questionCategory: string;
// }

// interface Challenge {
//   id: string;
//   title: string;
//   days: number;
//   ChallengeQuestions: ChallengeQuestion[];
// }

// const ChallengeSummary = ({ challengeId, onDataLoaded, refreshSignal }: ChallengeSummaryProps) => {
//   const navigate = useNavigate();
//   const [challenge, setChallenge] = useState<Challenge | null>(null);

//   const fetchChallenge = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("Admin token not found");

//       const res = await fetch(`http://localhost:3000/api/challenge-questions/${challengeId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const json = await res.json();
//       if (!res.ok) throw new Error(json.message || "Failed to fetch challenge");

//       const fetchedChallenge: Challenge = json.challenge;
//       setChallenge(fetchedChallenge);

//       // 🔹 Calculamos los contadores
//       const { days, ChallengeQuestions } = fetchedChallenge;
//       const weeks = Math.ceil(days / 7);

//       const challengeData: ChallengeData = {
//         days,
//         weeks,
//         dailyCount: ChallengeQuestions.filter((q) => q.questionCategory === "daily").length,
//         dailyReflectionCount: ChallengeQuestions.filter((q) => q.questionCategory === "daily-reflection").length,
//         weeklyReflectionCount: ChallengeQuestions.filter((q) => q.questionCategory === "weekly-reflection").length,
//         challengeReflectionCount: ChallengeQuestions.filter((q) => q.questionCategory === "challenge-reflection").length,
//       };

//       onDataLoaded?.(challengeData);
//     } catch (err: any) {
//       console.error("Error fetching challenge summary:", err.message || err);
//     }
//   };

//   useEffect(() => {
//     fetchChallenge();
//   }, [challengeId, refreshSignal]);

//   if (!challenge) return <p>Loading summary...</p>;

//   const { title, days, ChallengeQuestions } = challenge;
//   const weeks = Math.ceil(days / 7);

//   const dailyCount = ChallengeQuestions.filter((q) => q.questionCategory === "daily").length;
//   const dailyReflectionCount = ChallengeQuestions.filter((q) => q.questionCategory === "daily-reflection").length;
//   const weeklyReflectionCount = ChallengeQuestions.filter((q) => q.questionCategory === "weekly-reflection").length;
//   const challengeReflectionCount = ChallengeQuestions.filter((q) => q.questionCategory === "challenge-reflection").length;

//   const totalSelected = ChallengeQuestions.length;
//   const expectedTotal = days + days + weeks + 1; // total esperado según categorías

//   return (
//     <div className="p-4 rounded shadow font-mono text-sm text-gray-700 bg-[#fbf7f1]">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center justify-start gap-3">
//           <h2 className="text-left text-xl font-semibold mb-2 text-gray-800">CHALLENGE</h2>
//           <p className="text-left">{title}</p>
//         </div>
//         <button
//           onClick={() => navigate("/admin/challenges")}
//           className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 flex items-center gap-2"
//         >
//           <ArrowLeft size={20} />
//         </button>
//       </div>

//       <div className="flex items-center justify-between mt-4">
//         <div className="w-20">
//           <p className="text-left"><strong>Days:</strong> {days}</p>
//           <p className="text-left"><strong>Weeks:</strong> {weeks}</p>
//         </div>
//         <div className="grid grid-cols-5 gap-3 text-xs mt-2">
//           <div className="bg-[#fbf7f1] rounded shadow p-2">
//             <p className="font-medium text-gray-600">Daily</p>
//             <p>{dailyCount} / {days}</p>
//           </div>
//           <div className="bg-[#fbf7f1] rounded shadow p-2">
//             <p className="font-medium text-gray-600">Daily Reflection</p>
//             <p>{dailyReflectionCount} / {days}</p>
//           </div>
//           <div className="bg-[#fbf7f1] rounded shadow p-2">
//             <p className="font-medium text-gray-600">Weekly Reflection</p>
//             <p>{weeklyReflectionCount} / {weeks}</p>
//           </div>
//           <div className="bg-[#fbf7f1] rounded shadow p-2">
//             <p className="font-medium text-gray-600">Challenge Reflection</p>
//             <p>{challengeReflectionCount} / 1</p>
//           </div>
//           <div className="bg-[#fbf7f1] rounded shadow p-2">
//             <p className="text-sm font-bold text-gray-600">Total selected:</p>
//             <p className="text-sm text-gray-600">{totalSelected} / {expectedTotal}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChallengeSummary;

// // import { useEffect, useState } from "react";
// // import { ArrowLeft } from "lucide-react";
// // import { useNavigate } from "react-router-dom";

// // export interface ChallengeData {
// //   days: number;
// //   weeks: number;
// //   dailyCount: number;
// //   dailyReflectionCount: number;
// //   weeklyReflectionCount: number;
// //   challengeReflectionCount: number;
// // }

// // interface ChallengeSummaryProps {
// //   challengeId: string;
// //   onDataLoaded?: (data: ChallengeData) => void;
// //   refreshSignal?: number; // 🔹 Se dispara al crear/editar/asignar preguntas
// // }

// // const ChallengeSummary = ({ challengeId, onDataLoaded, refreshSignal }: ChallengeSummaryProps) => {
// //   const navigate = useNavigate();
// //   const [challenge, setChallenge] = useState<any>(null);

// //   const fetchChallenge = async () => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       const res = await fetch(
// //         `http://localhost:3000/api/challenge-questions/${challengeId}`,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       const json = await res.json();
// //       setChallenge(json.challenge);

// //       // 🔹 Calculamos los contadores
// //       const { days, ChallengeQuestions } = json.challenge;
// //       const weeks = Math.ceil(days / 7);

// //       const challengeData: ChallengeData = {
// //         days,
// //         weeks,
// //         dailyCount: ChallengeQuestions.filter((q: any) => q.questionCategory === "daily").length,
// //         dailyReflectionCount: ChallengeQuestions.filter((q: any) => q.questionCategory === "daily-reflection").length,
// //         weeklyReflectionCount: ChallengeQuestions.filter((q: any) => q.questionCategory === "weekly-reflection").length,
// //         challengeReflectionCount: ChallengeQuestions.filter((q: any) => q.questionCategory === "challenge-reflection").length,
// //       };

// //       onDataLoaded?.(challengeData);
// //     } catch (err) {
// //       console.error("Error fetching challenge summary:", err);
// //     }
// //   };

// //   // 🔹 Se recarga cada vez que cambia challengeId o refreshSignal
// //   useEffect(() => {
// //     fetchChallenge();
// //   }, [challengeId, refreshSignal]);

// //   if (!challenge) return <p>Loading summary...</p>;

// //   const { title, days, ChallengeQuestions } = challenge;
// //   const weeks = Math.ceil(days / 7);

// //   const dailyCount = ChallengeQuestions.filter((q: any) => q.questionCategory === "daily").length;
// //   const dailyReflectionCount = ChallengeQuestions.filter((q: any) => q.questionCategory === "daily-reflection").length;
// //   const weeklyReflectionCount = ChallengeQuestions.filter((q: any) => q.questionCategory === "weekly-reflection").length;
// //   const challengeReflectionCount = ChallengeQuestions.filter((q: any) => q.questionCategory === "challenge-reflection").length;

// //   const totalSelected = ChallengeQuestions.length;
// //   const expectedTotal = days + days + weeks + 1;

// //   return (
// //     <div className="p-4 rounded shadow font-mono text-sm text-gray-700  bg-[#fbf7f1]">
// //       <div className="flex items-center justify-between">
// //         <div className="flex items-center justify-start gap-3">
// //           <h2 className="text-left text-xl font-semibold mb-2 text-gray-800">CHALLENGE</h2>
// //           <p className="text-left">{title}</p>
// //         </div>
// //         <button
// //           onClick={() => navigate("/admin/challenges")}
// //           className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 flex items-center gap-2"
// //         >
// //           <ArrowLeft size={20} />
// //         </button>
// //       </div>

// //       <div className="flex items-center justify-between">
// //         <div className="w-20">
// //           <p className="text-left"><strong>Days:</strong> {days}</p>
// //           <p className="text-left"><strong>Weeks:</strong> {weeks}</p>
// //         </div>
// //         <div className="mt-4 grid grid-cols-5 gap-3 text-xs">
// //           <div className="bg-[#fbf7f1] rounded shadow p-2">
// //             <p className="font-medium text-gray-600">Daily</p>
// //             <p>{dailyCount} / {days}</p>
// //           </div>
// //           <div className="bg-[#fbf7f1] rounded shadow p-2">
// //             <p className="font-medium text-gray-600">Daily Reflection</p>
// //             <p>{dailyReflectionCount} / {days}</p>
// //           </div>
// //           <div className="bg-[#fbf7f1] rounded shadow p-2">
// //             <p className="font-medium text-gray-600">Weekly Reflection</p>
// //             <p>{weeklyReflectionCount} / {weeks}</p>
// //           </div>
// //           <div className="bg-[#fbf7f1] rounded shadow p-2">
// //             <p className="font-medium text-gray-600">Challenge Reflection</p>
// //             <p>{challengeReflectionCount} / 1</p>
// //           </div>
// //           <div className="bg-[#fbf7f1] rounded shadow p-2">
// //             <p className="text-sm font-bold text-gray-600">Total selected:</p>
// //             <p className="text-sm text-gray-600">{totalSelected} / {expectedTotal}</p>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ChallengeSummary;

// // // import { useEffect, useState } from "react";
// // // import { ArrowLeft } from "lucide-react";
// // // import { useNavigate } from "react-router-dom";

// // // export interface ChallengeData {
// // //   days: number;
// // //   weeks: number;
// // //   dailyCount: number;
// // //   dailyReflectionCount: number;
// // //   weeklyReflectionCount: number;
// // //   challengeReflectionCount: number;
// // // }

// // // interface ChallengeSummaryProps {
// // //   challengeId: string;
// // //   onDataLoaded?: (data: ChallengeData) => void;
// // //   refreshSignal?: number;
// // // }

// // // const ChallengeSummary = ({ challengeId, onDataLoaded, refreshSignal }: ChallengeSummaryProps) => {
// // //   const navigate = useNavigate();
// // //   const [challenge, setChallenge] = useState<any>(null);

// // //   const fetchChallenge = async () => {
// // //     try {
// // //       const token = localStorage.getItem("token");
// // //       const res = await fetch(`http://localhost:3000/api/challenge-questions/${challengeId}`, {
// // //         headers: { Authorization: `Bearer ${token}` },
// // //       });
// // //       const json = await res.json();
// // //       setChallenge(json.challenge);

// // //       // 🔹 Calcular ChallengeData
// // //       const { days, ChallengeQuestions } = json.challenge;
// // //       const weeks = Math.ceil(days / 7);

// // //       const challengeData: ChallengeData = {
// // //         days,
// // //         weeks,
// // //         dailyCount: ChallengeQuestions.filter((q: any) => q.questionCategory === "daily").length,
// // //         dailyReflectionCount: ChallengeQuestions.filter((q: any) => q.questionCategory === "daily-reflection").length,
// // //         weeklyReflectionCount: ChallengeQuestions.filter((q: any) => q.questionCategory === "weekly-reflection").length,
// // //         challengeReflectionCount: ChallengeQuestions.filter((q: any) => q.questionCategory === "challenge-reflection").length,
// // //       };

// // //       onDataLoaded?.(challengeData);
// // //     } catch (err) {
// // //       console.error("Error fetching challenge summary:", err);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     fetchChallenge();
// // //   }, [challengeId, refreshSignal]);

// // //   if (!challenge) return <p>Loading summary...</p>;

// // //   const { title, days, ChallengeQuestions } = challenge;
// // //   const weeks = Math.ceil(days / 7);

// // //   const dailyCount = ChallengeQuestions.filter((q: any) => q.questionCategory === "daily").length;
// // //   const dailyReflectionCount = ChallengeQuestions.filter((q: any) => q.questionCategory === "daily-reflection").length;
// // //   const weeklyReflectionCount = ChallengeQuestions.filter((q: any) => q.questionCategory === "weekly-reflection").length;
// // //   const challengeReflectionCount = ChallengeQuestions.filter((q: any) => q.questionCategory === "challenge-reflection").length;

// // //   const totalSelected = ChallengeQuestions.length;
// // //   const expectedTotal = days + days + weeks + 1;

// // //   return (
// // //     <div className="p-4 rounded shadow font-mono text-sm text-gray-700  bg-[#fbf7f1]">
// // //       <div className="flex items-center justify-between">
// // //         <div className="flex items-center justify-start gap-3">
// // //           <h2 className="text-left text-xl font-semibold mb-2 text-gray-800">CHALLENGE</h2>
// // //           <p className="text-left"> {title}</p>
// // //         </div>
// // //         <button
// // //           onClick={() => navigate("/admin/challenges")}
// // //           className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 flex items-center gap-2"
// // //         >
// // //           <ArrowLeft size={20} />
// // //         </button>
// // //       </div>

// // //       <div className="flex items-center justify-between">
// // //         <div className="w-20">
// // //           <p className="text-left"><strong>Days:</strong> {days}</p>
// // //           <p className="text-left"><strong>Weeks:</strong> {weeks}</p>
// // //         </div>
// // //         <div className="mt-4 grid grid-cols-5 gap-3 text-xs">
// // //           <div className="bg-[#fbf7f1] rounded shadow p-2">
// // //             <p className="font-medium text-gray-600">Daily</p>
// // //             <p>{dailyCount} / {days}</p>
// // //           </div>
// // //           <div className="bg-[#fbf7f1] rounded shadow p-2">
// // //             <p className="font-medium text-gray-600">Daily Reflection</p>
// // //             <p>{dailyReflectionCount} / {days}</p>
// // //           </div>
// // //           <div className="bg-[#fbf7f1] rounded shadow p-2">
// // //             <p className="font-medium text-gray-600">Weekly Reflection</p>
// // //             <p>{weeklyReflectionCount} / {weeks}</p>
// // //           </div>
// // //           <div className="bg-[#fbf7f1] rounded shadow p-2">
// // //             <p className="font-medium text-gray-600">Challenge Reflection</p>
// // //             <p>{challengeReflectionCount} / 1</p>
// // //           </div>
// // //           <div className=" bg-[#fbf7f1] rounded shadow p-2">
// // //             <p className="text-sm font-bold text-gray-600">Total selected: </p>
// // //             <p className="text-sm text-gray-600">{totalSelected} / {expectedTotal}</p>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default ChallengeSummary;
