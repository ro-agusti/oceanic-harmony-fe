import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChallengeSummaryProps {
  challengeId: string;
}

const ChallengeSummary = ({ challengeId }: ChallengeSummaryProps) => {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<any>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3000/api/challenge-questions/${challengeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        setChallenge(json.challenge); // <<-- ahora sí
      } catch (err) {
        console.error("Error fetching challenge summary:", err);
      }
    };

    fetchChallenge();
  }, [challengeId]);

  if (!challenge) return <p>Loading summary...</p>;

  const { title, days, ChallengeQuestions } = challenge;

  const weeks = Math.ceil(days / 7);

  const dailyCount = ChallengeQuestions.filter((q: any) => q.questionCategory === "daily").length;
  const dailyReflectionCount = ChallengeQuestions.filter((q: any) => q.questionCategory === "daily-reflection").length;
  const weeklyReflectionCount = ChallengeQuestions.filter((q: any) => q.questionCategory === "weekly-reflection").length;
  const challengeReflectionCount = ChallengeQuestions.filter((q: any) => q.questionCategory === "challenge-reflection").length;

  const totalSelected = ChallengeQuestions.length;
  const expectedTotal = days + days + weeks + 1; // daily + daily-reflection + weekly-reflection + challenge-reflection

  return (
    <div className="p-4 rounded shadow font-mono text-sm text-gray-700  bg-[#fbf7f1]">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start gap-3">
          <h2 className="text-left text-xl font-semibold mb-2 text-gray-800">CHALLENGE</h2>
        <p className="text-left"> {title}</p>
        </div>
        
        <button
          onClick={() => navigate("/admin/challenges")}
          className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
        </button>
      </div>
<div className="flex items-center justify-between">
  <div className="w-20">
      <p className="text-left"><strong>Days:</strong> {days}</p>
      <p className="text-left"><strong>Weeks:</strong> {weeks}</p>
  </div>
  <div className="mt-4 grid grid-cols-5 gap-3 text-xs">
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
        <div className=" bg-[#fbf7f1] rounded shadow p-2">
          <p className="text-sm font-bold text-gray-600">Total selected: </p>
        <p className="text-sm font-medium text-gray-600">
          {totalSelected} / {expectedTotal}
        </p>
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

// interface ChallengeSummaryProps {
//   challengeId: string;
// }

// const ChallengeSummary = ({ challengeId }: ChallengeSummaryProps) => {
//   const navigate = useNavigate();
//   const [data, setData] = useState<any>(null);

//   useEffect(() => {
//     const fetchChallenge = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await fetch(`http://localhost:3000/api/challenge-questions/${challengeId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const json = await res.json();
//         setData(json);
//       } catch (err) {
//         console.error("Error fetching challenge summary:", err);
//       }
//     };

//     fetchChallenge();
//   }, [challengeId]);

//   if (!data) return <p>Loading summary...</p>;

//   const {
//     title,
//     days,
//     weeks,
//     dailyCount,
//     dailyReflectionCount,
//     weeklyReflectionCount,
//     challengeReflectionCount,
//     totalSelected,
//     expectedTotal,
//   } = data;

//   return (
//     <div className="p-4 rounded shadow font-mono text-sm text-gray-700">
//       <div className="flex items-center justify-between">
//         <h2 className="text-left text-xl font-semibold mb-2 text-gray-800">CHALLENGE</h2>
//         <button
//           onClick={() => navigate("/admin/challenges")}
//           className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 flex items-center gap-2"
//         >
//           <ArrowLeft size={20} />
//         </button>
//       </div>

//       <p className="text-left"><strong>Title:</strong> {title}</p>
//       <p className="text-left"><strong>Days:</strong> {days}</p>
//       <p className="text-left"><strong>Weeks:</strong> {weeks}</p>

//       <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
//         <div className="bg-[#fbf7f1] rounded shadow p-2">
//           <p className="font-medium text-gray-600">Daily </p>
//           <p>{dailyCount} / {days}</p>
//         </div>
//         <div className="bg-[#fbf7f1] rounded shadow p-2">
//           <p className="font-medium text-gray-600">Daily Reflection</p>
//           <p>{dailyReflectionCount} / {days}</p>
//         </div>
//         <div className="bg-[#fbf7f1] rounded shadow p-2">
//           <p className="font-medium text-gray-600">Weekly Reflection</p>
//           <p>{weeklyReflectionCount} / {weeks}</p>
//         </div>
//         <div className="bg-[#fbf7f1] rounded shadow p-2">
//           <p className="font-medium text-gray-600">Challenge Reflection</p>
//           <p>{challengeReflectionCount} / 1</p>
//         </div>
//       </div>

//       <div className="mt-4 bg-[#fbf7f1] rounded shadow p-2">
//         <p className="text-sm font-medium text-gray-600">
//           Total selected: {totalSelected} / {expectedTotal}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default ChallengeSummary;
