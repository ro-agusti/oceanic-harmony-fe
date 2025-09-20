import { useEffect, useState } from "react";
import Nav from "./HomeNav";
import { useNavigate } from "react-router-dom";

interface Challenge {
  id: string;
  title: string;
  description: string;
  price: string;
  days: number;
}

export default function HomeChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/challenge");
        const data = await res.json();
        setChallenges(data.challenges);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const handleSelect = async (challengeId: string) => {
  const token = localStorage.getItem("token"); // asegurate de usar la misma key que en login
  if (!token) {
    navigate("/login");
    return;
  }

  try {
    // Validar token
    const res = await fetch("http://localhost:3000/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Invalid token");

    // Hacer POST para asignar challenge
    const postRes = await fetch("http://localhost:3000/api/user-challenges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ challengeId }), // 👈 confirma que tu backend espera este nombre
    });

    if (!postRes.ok) {
      const errorMsg = await postRes.text();
      throw new Error(`Failed to select challenge: ${errorMsg}`);
    }

    console.log("Challenge selected successfully");
    navigate("/user/my-challenges");
  } catch (err) {
    console.error("Error selecting challenge:", err);
    localStorage.removeItem("token");
    navigate("/login");
  }
};

// const handleSelect = async (challengeId: string) => {
//   const token = localStorage.getItem("token");
//   if (!token) {
//     navigate("/login");
//     return;
//   }

//   try {
//     // 1. Validar token llamando al profile
//     const res = await fetch("http://localhost:3000/api/profile", {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     if (!res.ok) throw new Error("Invalid token");

//     // 2. Asignar challenge al usuario
//     const postRes = await fetch("http://localhost:3000/api/user-challenges", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ challengeId }),
//     });

//     if (!postRes.ok) throw new Error("Failed to select challenge");

//     // 3. Redirigir a My Challenges
//     navigate("/user/my-challenges");
//   } catch (err) {
//     console.error("Error selecting challenge:", err);
//     localStorage.removeItem("token");
//     navigate("/login");
//   }
// };

  if (loading) return <p className="p-4">Loading challenges...</p>;

  return (
    <div>
      <Nav />
      <main className="mt-20">
        <div className="p-6 max-w-7xl mx-auto font-mono">
          <h1 className="text-2xl font-bold mb-6">All Challenges</h1>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((ch) => (
              <div
                key={ch.id}
                className="border p-6 rounded-lg shadow-sm bg-[#fbf7f1] flex flex-col justify-between"
              >
                <div>
                  <h2 className="font-semibold text-lg mb-2">{ch.title}</h2>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
                  <p>Days: {ch.days}</p>
                </div>

                <button
                  onClick={() => setSelectedChallenge(ch)}
                  className="mt-4 px-4 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  MORE
                </button>
              </div>
            ))}
          </div>

          {/* Modal con más info */}
          {selectedChallenge && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] relative">
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>

                <h2 className="text-xl font-bold mb-2">
                  {selectedChallenge.title}
                </h2>
                <p className="text-gray-600 mb-4">{selectedChallenge.description}</p>

                <p className="text-sm text-gray-700">Days: {selectedChallenge.days}</p>
                <p className="text-sm text-gray-700">Price: ${selectedChallenge.price}</p>

                {/* Botón Select */}
                <button
                  onClick={() => handleSelect(selectedChallenge.id)}
                  className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Select
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}