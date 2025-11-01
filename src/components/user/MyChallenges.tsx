import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNav from "./UserNav";
import AdminNav from "../admin/AdminNav";
import { tokenService, apiFetch, API } from '../../config/api';

interface Challenge {
  id: string;
  title: string;
  description: string;
  days: number;
  price: string;
  userChallengeId: string;
  status: "not-started" | "in-progress" | "completed";
}

export default function MyChallenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);

  useEffect(() => {
    const user = tokenService.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    setRole(user.role === "admin" ? "admin" : "user");

    const fetchUserChallenges = async () => {
      try {
        const res = await apiFetch<{ id: string; status: string; Challenge: any }[]>(API.userChallenges.all);
        if (!res.ok) throw new Error("Failed to fetch user challenges");

        const mappedChallenges = res.data.map((uc) => ({
          ...uc.Challenge,
          userChallengeId: uc.id,
          status: uc.status,
        }));

        setChallenges(mappedChallenges);
        setError(null);
      } catch (err) {
        console.error("Error fetching user challenges:", err);
        setError("Could not load challenges.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserChallenges();
  }, [navigate]);

  if (loading) return <p className="p-6 text-center">Loading your challenges...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <>
      {role === "admin" ? <AdminNav /> : <UserNav />}
      <div className="max-w-5xl w-full mx-auto p-6 mt-24 font-mono">
        <h1 className="text-2xl font-bold text-gray-700 mb-6 text-left">
          My Challenges
        </h1>

        {challenges.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              You haven’t started any journals yet. Take the first step to transform your daily life!
            </p>
            <button
              onClick={() => navigate("/challenges")}
              className="w-full py-4 text-xl font-semibold text-white bg-gray-400 rounded-lg shadow-lg hover:bg-gray-500 transition"
            >
              Explore Available Challenges
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-6">
            {challenges.map((challenge) => {
              let buttonText = "";
              let statusMessage = "";

              switch (challenge.status) {
                case "not-started":
                  buttonText = "Let's go!";
                  statusMessage = "Time to start your journal and make a change!";
                  break;
                case "in-progress":
                  buttonText = "Continue";
                  statusMessage = "Keep going, you're making progress with your journal!";
                  break;
                case "completed":
                  buttonText = "View Responses";
                  statusMessage = "Reflect on your thoughts and see how you've grown!";
                  break;
                default:
                  buttonText = "Let's go!";
                  statusMessage = "";
              }

              return (
                <li
                  key={challenge.id}
                  className="bg-[#fbf7f1] p-6 rounded shadow-sm transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex-1 text-left">
                      <h2 className="text-lg font-bold lowercase text-gray-700">
                        {challenge.title}
                      </h2>
                      <p className="mt-3 text-sm text-gray-500">
                        {challenge.description}
                      </p>
                    </div>
                    <div className="flex flex-col sm:items-end text-sm text-gray-600 font-mono">
                      <p className="mb-1">Days: {challenge.days}</p>
                      <button
                        onClick={() =>
                          navigate(`/user/challenge-responses/${challenge.userChallengeId}`, {
                            state: { challengeTitle: challenge.title },
                          })
                        }
                        className="mt-3 sm:mt-2 px-6 py-3 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 transition font-semibold text-center"
                      >
                        {buttonText}
                      </button>
                      <p className="text-gray-500 font-semibold mt-2 capitalize">
                        {statusMessage}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

// export default function MyChallenges() {
//   const navigate = useNavigate();
//   const [challenges, setChallenges] = useState<Challenge[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [role, setRole] = useState<"admin" | "user" | null>(null);

//   useEffect(() => {
//     const user = tokenService.getUser();
//     if (!user) {
//       navigate("/login");
//       return;
//     }

//     setRole(user.role === "admin" ? "admin" : "user");

//     const fetchUserChallenges = async () => {
//       try {
//         const res = await apiFetch<{ id: string; status: string; Challenge: any }[]>(API.userChallenges.all);
//         if (!res.ok) throw new Error("Failed to fetch user challenges");

//         // Mapear para un formato consistente
//         const mappedChallenges = res.data.map((uc) => ({
//           ...uc.Challenge,
//           userChallengeId: uc.id,
//           status: uc.status,
//         }));

//         setChallenges(mappedChallenges);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching user challenges:", err);
//         setError("Could not load challenges.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserChallenges();
//   }, [navigate]);

//   if (loading) return <p className="p-6 text-center">Loading your challenges...</p>;
//   if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  

  
//   return (
//     <>
//       {role === "admin" ? <AdminNav /> : <UserNav />}

//       <div className="max-w-5xl w-full mx-auto p-6 mt-24 font-mono">
//         <h1 className="text-2xl font-bold text-gray-700 mb-6 text-left">
//           My Challenges
//         </h1>

//         {error ? (
//           <p className="p-6 text-center text-red-500">{error}</p>
//         ) : challenges.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-gray-600 text-lg mb-4">
//               You haven’t started any journals yet. Take the first step to transform your daily life!
//             </p>
//             <button
//               onClick={() => navigate("/challenges")}
//               className="w-full py-4 text-xl font-semibold text-white bg-gray-400 rounded-lg shadow-lg hover:bg-gray-500 transition"
//             >
//               Explore Available Challenges
//             </button>
//           </div>
//         ) : (
//           <ul className="flex flex-col gap-6">
//             {challenges.map((challenge) => (
//               <li
//                 key={challenge.id}
//                 className="bg-[#fbf7f1] p-6 rounded shadow-sm transition-all duration-300"
//               >
//                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  
//                   <div className="flex-1 text-left">
//                     <h2 className="text-lg font-bold lowercase text-gray-700">
//                       {challenge.title}
//                     </h2>
//                     <p className="mt-3 text-sm text-gray-500">
//                       {challenge.description}
//                     </p>
//                   </div>

                 
//                   <div className="flex flex-col sm:items-end text-sm text-gray-600 font-mono">
//                     <p className="mb-1">Days: {challenge.days}</p>

//                     <button
//             onClick={() =>
//               navigate(`/user/challenge-responses/${challenge.userChallengeId}`, {
//                 state: { challengeTitle: challenge.title },
//               })
//             }
//             className="mt-3 sm:mt-2 px-6 py-3 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 transition font-semibold text-center"
//           >
//             {buttonText}
//           </button>
//           <p className="text-gray-500 font-semibold mt-2 capitalize">
//             {statusMessage}
//           </p>
//                     {/* <button
//                       onClick={() =>
//                         navigate(`/user/challenge-responses/${challenge.userChallengeId}`, {
//                           state: { challengeTitle: challenge.title },
//                         })
//                       }
//                       className="mt-3 sm:mt-2 px-6 py-3 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 transition font-semibold text-center"
//                     >
//                       Let’s go
//                     </button>
//                     <p className="text-gray-500 font-semibold mt-2 capitalize">
//                       {challenge.status.replace("-", " ")}
//                     </p> */}
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </>
//   );
// }