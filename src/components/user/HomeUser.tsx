import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokenService, apiFetch, API } from '../../config/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = tokenService.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await apiFetch<UserProfile>(API.auth.profile);
        if (!res.ok || !res.data) throw new Error("Failed to fetch profile");

        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        tokenService.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <p className="p-6 text-center">Loading profile...</p>;
  if (!profile) return null;
 
  return (
    <div className="min-h-screen flex flex-col">
    
      
      <main className="flex flex-col items-center min-h-screen">
       
        <img
          src={"/logoWave.png"}
          className="h-40 p-4 mx-auto"
          alt="Oceanic Harmony logo"
        />

        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-600 mb-2 p-5 font-mono">
            Welcome, {profile.name || "User"} 👋
          </h1>
          <p className="text-lg font-mono text-gray-600">
            Manage your challenges and keep track of your progress.
          </p>
        </div>

       
        <div className="grid gap-6 w-full max-w-md">
          <button
            onClick={() => navigate("/user/my-challenges")}
            className="w-full py-4 text-xl font-semibold text-white bg-gray-400 rounded-lg shadow-lg hover:bg-gray-500 transition"
          >
            My Journals
          </button>
          <button
            onClick={() => navigate("/challenges")}
            className="w-full py-4 text-xl font-semibold text-white bg-gray-400 rounded-lg shadow-lg hover:bg-gray-500 transition"
          >
            Select Journal
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            className="w-full py-4 text-xl font-semibold text-white bg-gray-400 rounded-lg shadow-lg hover:bg-gray-500 transition"
          >
            Log out
          </button>
        </div>
      </main>
    </div>
  );
}