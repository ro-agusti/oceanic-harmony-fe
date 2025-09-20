import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNav from "./UserNav";

interface Challenge {
  id: string;
  title: string;
  description: string;
  days: number;
  price: string;
  userChallengeId: string; // clave para ver las respuestas
  status: "not-started" | "in-progress" | "completed";
}

export default function MyChallenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserChallenges = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/user-challenges", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user challenges");

        const data = await res.json();

        // Ajustamos para traer los challenges con userChallengeId
        if (Array.isArray(data)) {
          setChallenges(
            data.map((uc: any) => ({
              ...uc.Challenge,
              userChallengeId: uc.id,
              status: uc.status,
            }))
          );
        } else {
          setChallenges(data.challenges || []);
        }
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
      <UserNav />

      <main className="max-w-5xl mx-auto p-6 mt-24">
        <h1 className="text-2xl font-bold text-gray-700 mb-6 font-mono">
          My Challenges
        </h1>

        {challenges.length === 0 ? (
          <p className="text-gray-600">You haven't joined any challenges yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="border p-6 rounded-lg shadow-sm bg-[#fbf7f1] flex flex-col justify-between"
              >
                <div>
                  <h2 className="font-semibold text-lg mb-2">{challenge.title}</h2>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {challenge.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
                  <p>Days: {challenge.days}</p>
                  <p className="font-bold">${challenge.price}</p>
                  <p className="text-blue-500">{challenge.status}</p>
                </div>

                <button
  onClick={() =>
    navigate(`/user/challenge-responses/${challenge.userChallengeId}`, {
      state: { challengeTitle: challenge.title }
    })
  }
  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
>
  View Responses
</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
