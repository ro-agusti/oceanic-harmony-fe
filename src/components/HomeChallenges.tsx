import { useEffect, useState } from "react";
import HomeNav from "./HomeNav";
import AdminNav from "./admin/AdminNav";
import UserNav from "./user/UserNav";
import { useNavigate } from "react-router-dom";
import { apiFetch, postJSON, tokenService, API } from '../config/api';

interface Challenge {
  id: string;
  title: string;
  description: string;
  price: string;
  days: number;
  active: boolean;
}

export default function HomeChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [navType, setNavType] = useState<"admin" | "user" | "home">("home");
  const navigate = useNavigate();

 
  useEffect(() => {
    const user = tokenService.getUser();
    if (!user) return setNavType("home");
    setNavType(user.role === "admin" ? "admin" : "user");
  }, []);

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      const res = await apiFetch<{ challenges: Challenge[] }>(API.challenges.all, { method: "GET" }, false);
      if (res.ok && res.data?.challenges) {
        const activeChallenges = res.data.challenges.filter(ch => ch.active);
        setChallenges(activeChallenges);
      } else {
        console.error("Error fetching challenges:", res.data);
      }
      setLoading(false);
    };

    fetchChallenges();
  }, []);
  

  useEffect(() => {
    const fetchUserChallenges = async () => {
      const res = await apiFetch<any[]>(API.userChallenges.all, { method: "GET" });
      if (res.ok && Array.isArray(res.data)) {
        setSelectedChallenges(res.data.map((uc: any) => uc.challengeId));
      }
    };
    fetchUserChallenges();
  }, []);
 

  const handleSelect = async (challengeId: string) => {
    const user = tokenService.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const res = await postJSON(API.userChallenges.all, { challengeId });
    if (!res.ok) {
      console.error("Error selecting challenge:", res.data);
      if (res.status === 401) {
        tokenService.clear();
        navigate("/login");
      }
      return;
    }

    
    setSelectedChallenges(prev => [...prev, challengeId]);
    navigate("/user/my-challenges");
  };


  if (loading) return <p className="p-4">Loading challenges...</p>;

 
  const sortedChallenges = [...challenges].sort((a, b) => {
    const aSelected = selectedChallenges.includes(a.id);
    const bSelected = selectedChallenges.includes(b.id);
    return Number(aSelected) - Number(bSelected);
  });


  return (
    <div className="font-mono min-h-screen">
      
      {navType === "admin" && <AdminNav />}
      {navType === "user" && <UserNav />}
      {navType === "home" && <HomeNav />}

      <main className="mt-24">
        <div className="p-6 max-w-xxl mx-auto">
          <h1 className="text-3xl font-semibold text-gray-700 mb-10 text-center">
            All Journals
          </h1>

      
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
