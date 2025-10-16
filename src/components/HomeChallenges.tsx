import { useEffect, useState } from "react";
import HomeNav from "./HomeNav";
import AdminNav from "./admin/AdminNav";
import UserNav from "./user/UserNav";
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
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [navType, setNavType] = useState<"admin" | "user" | "home">("home");
  const navigate = useNavigate();

  // 🔹 Determinar el tipo de nav según el token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNavType("home");
      return;
    }

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      if (payload.role === "admin") setNavType("admin");
      else setNavType("user");
    } catch {
      setNavType("home");
    }
  }, []);

  // 🔹 Obtener lista de challenges
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

  // 🔹 Obtener challenges seleccionados del usuario
  useEffect(() => {
    const fetchUserChallenges = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:3000/api/user-challenges", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;
        const data = await res.json();
        setSelectedChallenges(data.map((uc: any) => uc.challengeId));
      } catch (err) {
        console.error("Error fetching user challenges:", err);
      }
    };

    fetchUserChallenges();
  }, []);

  // 🔹 Función para seleccionar challenge
  const handleSelect = async (challengeId: string) => {
    const token = localStorage.getItem("token");

    // Si no hay token → ir al login
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const postRes = await fetch("http://localhost:3000/api/user-challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ challengeId }),
      });

      if (postRes.status === 401 || postRes.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!postRes.ok) {
        console.error("Error selecting challenge:", await postRes.text());
        return;
      }

      // Agregar visualmente como seleccionado
      setSelectedChallenges((prev) => [...prev, challengeId]);
      navigate("/user/my-challenges");
    } catch (err) {
      console.error("Error selecting challenge:", err);
      navigate("/login");
    }
  };

  if (loading) return <p className="p-4">Loading challenges...</p>;

  // 🔹 Ordenar: primero los no seleccionados
  const sortedChallenges = [...challenges].sort((a, b) => {
    const aSelected = selectedChallenges.includes(a.id);
    const bSelected = selectedChallenges.includes(b.id);
    return Number(aSelected) - Number(bSelected);
  });

  return (
    <div className="font-mono min-h-screen">
      {/* 🔹 Navbar dinámica */}
      {navType === "admin" && <AdminNav />}
      {navType === "user" && <UserNav />}
      {navType === "home" && <HomeNav />}

      <main className="mt-24">
        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-semibold text-gray-700 mb-10 text-center">
            All Journals
          </h1>

          {/* 🔹 Grid de Challenges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedChallenges.map((ch) => {
              const isSelected = selectedChallenges.includes(ch.id);
              return (
                <div
                  key={ch.id}
                  className={`bg-white rounded-2xl shadow-md transition-shadow duration-300 p-6 flex flex-col justify-between border border-gray-100 ${
                    isSelected
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:shadow-lg"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm text-gray-500 uppercase tracking-widest mb-2">
                      {ch.days} Days
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                      {ch.title}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {ch.description}
                    </p>
                    {!isSelected && parseFloat(ch.price) > 0 && (
    <p className="mt-2 text-sm text-gray-500">
      Price: <span>${ch.price}</span>
    </p>
  )}
                    {/* {parseFloat(ch.price) > 0 && (
                      <p className="mt-2 text-sm text-gray-500">
                        Price: <span>${ch.price}</span>
                      </p>
                    )} */}
                  </div>

                  <div className="mt-6 flex justify-center">
                    {!isSelected && (
                      <button
                        onClick={() => handleSelect(ch.id)}
                        className="px-5 py-2 rounded-md bg-gray-400 text-white hover:bg-gray-500 text-sm transition"
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
